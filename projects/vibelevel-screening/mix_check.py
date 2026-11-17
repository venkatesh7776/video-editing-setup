"""Voice-vs-music check on a rendered video: compares speech loudness with the music
level in the short pauses between sentences (where the music is still ducked).

  .venv/bin/python -I projects/vibelevel-screening/mix_check.py output/x.mp4
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
video = sys.argv[1]
sr = 16000
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True, check=True).stdout
a = np.frombuffer(raw, np.float32)
timing = json.loads((ROOT / "projects/vibelevel-screening/timing.json").read_text())
words = json.loads((ROOT / "work/vibelevel-screening/vo/words.json").read_text())
db = lambda x: 10 * np.log10(np.mean(x ** 2) + 1e-12)
speech, pauses = [], []
for s in timing["scenes"]:
    ws = words[s["id"]]
    for w in ws:
        speech.append(a[int((s["voStart"] + w["s"]) * sr):int((s["voStart"] + w["e"]) * sr)])
    for w0, w1 in zip(ws, ws[1:]):
        if w1["s"] - w0["e"] > 0.3:  # sentence pause: music only (ducked)
            pauses.append(a[int((s["voStart"] + w0["e"] + 0.08) * sr):int((s["voStart"] + w1["s"] - 0.08) * sr)])
sp, pa = db(np.concatenate(speech)), db(np.concatenate(pauses))
gap = a[int(timing["scenes"][0]["end"] * sr) - sr // 4:int(timing["scenes"][1]["voStart"] * sr)]
print(f"speech {sp:.1f} dB | ducked music {pa:.1f} dB | voice-over-music margin {sp - pa:.1f} dB | music between scenes {db(gap):.1f} dB")
