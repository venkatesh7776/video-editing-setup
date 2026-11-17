"""Local text-to-speech with Kokoro (open-source, Apache-2.0) for voiceovers.

Reads a narration file ({voice, speed, pronunciations, scenes:[{id, text}]}),
speaks each scene sentence by sentence, and writes:
  <out>/<scene>.wav     one voiceover clip per scene (24 kHz mono)
  <out>/timeline.json   per-scene durations + subtitle chunks with timings

Subtitles show the written text; `pronunciations` only changes what is spoken
(e.g. "VibeLevel" -> "Vibe Level").

  .venv/bin/python scripts/tts/kokoro_tts.py projects/x/narration.json --out work/x/vo
"""

import argparse
import json
import re
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parents[2]
MODELS = ROOT / ".cache/kokoro"
SR = 24000
SENTENCE_PAUSE = 0.38
MAX_CHUNK_WORDS = 9


def speakable(text, pronunciations):
    # Longest keys first so "AI-native" wins over "AI".
    for written in sorted(pronunciations, key=len, reverse=True):
        text = re.sub(rf"(?<![\w-]){re.escape(written)}(?![\w-])", pronunciations[written], text)
    return text


def split_sentences(text):
    return [s.strip() for s in re.split(r"(?<=[.?!:])\s+", text) if s.strip()]


def chunk_sentence(sentence):
    """Splits a sentence into subtitle-sized chunks, preferring comma breaks."""
    words = sentence.split()
    if len(words) <= MAX_CHUNK_WORDS:
        return [sentence]
    chunks, current = [], []
    for i, w in enumerate(words):
        current.append(w)
        remaining = len(words) - i - 1
        at_comma = w.endswith((",", ";"))
        if (at_comma and len(current) >= 3 and remaining >= 3) or len(current) >= MAX_CHUNK_WORDS:
            chunks.append(" ".join(current))
            current = []
    if current:
        if chunks and len(current) <= 2:
            chunks[-1] += " " + " ".join(current)
        else:
            chunks.append(" ".join(current))
    return chunks


def trim_silence(audio, threshold=0.004):
    idx = np.where(np.abs(audio) > threshold)[0]
    if not len(idx):
        return audio
    start = max(0, idx[0] - int(0.08 * SR))  # soft onsets ("Wr…") need lead-in
    end = min(len(audio), idx[-1] + int(0.06 * SR))
    return audio[start:end]


def main():
    p = argparse.ArgumentParser()
    p.add_argument("narration")
    p.add_argument("--out", required=True)
    p.add_argument("--voice")
    p.add_argument("--only", help="comma-separated scene ids to regenerate")
    args = p.parse_args()

    spec = json.loads(Path(args.narration).read_text())
    voice = args.voice or spec.get("voice", "af_heart")
    speed = spec.get("speed", 1.0)
    pron = spec.get("pronunciations", {})
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    timeline_path = out / "timeline.json"
    timeline = json.loads(timeline_path.read_text()) if timeline_path.exists() else {}
    only = set(args.only.split(",")) if args.only else None

    kokoro = Kokoro(str(MODELS / "kokoro-v1.0.onnx"), str(MODELS / "voices-v1.0.bin"))

    scenes_out = []
    for scene in spec["scenes"]:
        sid = scene["id"]
        if only and sid not in only and sid in timeline.get("scenes", {}):
            scenes_out.append(timeline["scenes"][sid])
            continue
        pieces, chunks, t = [], [], 0.0
        for sentence in split_sentences(scene["text"]):
            audio, sr = kokoro.create(speakable(sentence, pron), voice=voice, speed=speed, lang="en-us")
            assert sr == SR
            audio = trim_silence(audio)
            dur = len(audio) / SR
            # Time subtitle chunks within the sentence by their spoken length.
            parts = chunk_sentence(sentence)
            weights = [len(speakable(c, pron)) for c in parts]
            acc = 0.0
            for c, w in zip(parts, weights):
                share = dur * w / sum(weights)
                chunks.append({"text": c, "start": round(t + acc, 3), "end": round(t + acc + share, 3)})
                acc += share
            pieces += [audio, np.zeros(int(SENTENCE_PAUSE * SR), dtype=np.float32)]
            t += dur + SENTENCE_PAUSE
        audio = np.concatenate(pieces[:-1])  # no pause after the last sentence
        sf.write(out / f"{sid}.wav", audio, SR)
        entry = {"id": sid, "file": f"{sid}.wav", "duration": round(len(audio) / SR, 3), "chunks": chunks}
        scenes_out.append(entry)
        print(f"  {sid:12} {entry['duration']:5.1f}s  {scene['text'][:60]}…", flush=True)

    total = sum(s["duration"] for s in scenes_out)
    timeline_path.write_text(json.dumps({"voice": voice, "scenes": {s["id"]: s for s in scenes_out}, "order": [s["id"] for s in scenes_out]}, indent=1))
    print(f"[tts] {len(scenes_out)} scenes, {total:.1f}s of speech, voice {voice} → {out}")


if __name__ == "__main__":
    main()
