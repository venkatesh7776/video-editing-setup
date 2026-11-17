"""Builds timing.json (absolute video times) from the voiceover clips and word timings.
Scene length = lead-in + voiceover + hold. Beats are keyed to the first word of a phrase.

  python3 -I projects/vibelevel-screening/build_timing.py
"""
import json
import os
import re
from pathlib import Path

HERE = Path(__file__).parent
VO = HERE.parents[1] / "work/vibelevel-screening/vo"
LEAD_HOLD = {  # seconds before VO starts / after it ends, per scene
    "s1-problem": (0.35, 1.4), "s3-intro": (0.3, 0.8),  # scenes 1–3: locked
    "n4-candidate": (0.4, 0.5), "n5-skills": (0.3, 0.4), "n6-ownership": (0.3, 0.5), "n7-create": (0.4, 0.5),
    "n8-report": (0.3, 0.8), "n9-outcome": (0.5, 0.6),
    "s9-close": (0.4, 0.7), "s10-cta": (0.3, 2.6),  # scene 10: unchanged content
}
BEATS = {  # (label, first words of the phrase as spoken); matched in order within the scene
    "s1-problem": [("Resumes", "resumes"), ("what they've done", "what candidates"), ("Interviews", "interviews"), ("how they present", "how well"), ("But neither", "but"), ("how they perform", "how they perform"), ("when the work gets real", "when the work")],
    "s3-intro": [("VibeLevel Screening (logo)", "vibe"), ("realistic, role-specific tasks", "realistic"), ("four dimensions", "four"), ("Core Skills", "core"), ("Working with AI", "working"), ("Ownership", "ownership"), ("Human Contribution", "human")],
    "n4-candidate": [("realistic, role-specific tasks", "tackle"), ("dedicated workspace", "dedicated"), ("AI coding tools", "ai coding"), ("Claude Code built in", "claude code"), ("Codex", "codex"), ("GitHub Copilot", "github"), ("and more", "and more"), ("work with AI to solve problems", "as they work"), ("looks beyond the final result", "looks")],
    "n5-skills": [("Core Skills", "core"), ("role-specific competencies", "apply"), ("Working with AI", "working"), ("guide AI", "guide"), ("evaluate its suggestions", "evaluate"), ("verify its output", "verify")],
    "n6-ownership": [("part of the picture", "but technical"), ("Ownership", "ownership"), ("responsibility", "responsibility"), ("Human Contribution", "human"), ("value beyond AI output", "the judgment")],
    "n7-create": [("creating an assessment", "to evaluate"), ("ready-made template", "ready"), ("role requirements", "customize"), ("use AI to build one", "use ai"), ("describing what you need", "describing"), ("Lever or Ashby", "and these"), ("existing hiring workflow", "existing")],
    "n8-report": [("assessment report brings together", "once"), ("skill scores", "skill"), ("AI collaboration insights", "ai collaboration"), ("Code Review", "code review"), ("Video Q&A", "video"), ("Interview Guide", "the interview"), ("follow-up questions", "follow"), ("explore strengths and gaps", "helping")],
    "n9-outcome": [("clearer view", "with a"), ("think, work, and use AI", "think"), ("Identify strengths", "identify"), ("uncover gaps", "uncover"), ("Build a shortlist backed by evidence", "and build")],
    "s9-close": [("When AI can do the work", "when ai"), ("know what makes a candidate stand out", "know"), ("developer and non-developer roles", "across")],
    "s10-cta": [("VibeLevel Screening", "vibe"), ("Book a demo", "book")],
}
# Ending: "cta" (default: animated logo + "Book a demo", as in v6) or "exhibit" (HR Tech booth card,
# silent). Select with ENDING=exhibit.
ENDING = os.environ.get("ENDING", "cta")


def norm(w):
    return re.sub(r"[^a-z0-9]", "", w.lower())


def find(ws, phrase, frm):
    """Index of the word where `phrase` starts, comparing letters only, so it matches
    whether Whisper splits or joins words ("Claude Code" vs "ClaudeCode")."""
    key = norm(phrase)
    for i in range(frm, len(ws)):
        joined = ""
        for k in range(i, min(i + 6, len(ws))):
            joined += norm(ws[k]["w"])
            if joined == key or (joined.startswith(key) and k == i):
                return i
            if not key.startswith(joined):
                break
    raise SystemExit(f"phrase not found: {phrase!r}")
tl = json.loads((VO / "timeline.json").read_text())
words = json.loads((VO / "words.json").read_text())
t, scenes = 0.0, []
for sid in tl["order"]:
    if ENDING == "exhibit" and sid == "s10-cta":
        continue
    lead, hold = LEAD_HOLD[sid]
    vo = tl["scenes"][sid]["duration"]
    start = round(t, 2)
    beats, pos = [], 0
    for lab, phrase, *off in BEATS[sid]:
        i = find(words[sid], phrase, pos)
        if not off:
            pos = i  # offset beats are visual-only and don't advance the search
        beats.append({"label": lab, "t": round(start + lead + words[sid][i]["s"] + (off[0] if off else 0), 2), "word": words[sid][i]["w"]})
    scenes.append({"id": sid, "start": start, "end": round(start + lead + vo + hold, 2), "voStart": round(start + lead, 2), "voDuration": vo, "beats": beats})
    t = start + lead + vo + hold
# Scenes without narration, appended after the voiced ones: (id, seconds, [(beat label, offset)]).
SILENT = [("s10-exhibit", 6.5, [("We're exhibiting", 0.25), ("Booth SU80", 0.9), ("HR Tech", 1.7)])] if ENDING == "exhibit" else []
for sid, dur, bts in SILENT:
    start = round(t, 2)
    scenes.append({"id": sid, "start": start, "end": round(start + dur, 2), "voStart": start, "voDuration": 0, "beats": [{"label": lab, "t": round(start + off, 2), "word": ""} for lab, off in bts]})
    t = start + dur
(HERE / "timing.json").write_text(json.dumps({"fps": 30, "duration": round(t, 2), "voice": tl["voice"], "scenes": scenes}, indent=1))
for s in scenes:
    print(f"{s['id']:13} {s['start']:6.2f}–{s['end']:6.2f}  VO@{s['voStart']:6.2f}  " + " | ".join(f"{b['label']}@{b['t']}" for b in s["beats"]))
print("TOTAL", round(t, 2))
