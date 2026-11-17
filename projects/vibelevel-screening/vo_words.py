"""Word-level timings for each voiceover clip (faster-whisper, local). No vocabulary prompt,
so mispronunciations show up in the transcript.

  .venv/bin/python -I projects/vibelevel-screening/vo_words.py work/vibelevel-screening/vo
"""
import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from faster_whisper import WhisperModel


def load16k(path):
    # Kokoro writes 24 kHz mono; Whisper wants 16 kHz float32.
    a, sr = sf.read(path, dtype="float32")
    n = int(len(a) * 16000 / sr)
    return np.interp(np.linspace(0, len(a) - 1, n), np.arange(len(a)), a).astype(np.float32)

ROOT = Path(__file__).resolve().parents[2]
vo = Path(sys.argv[1])
timeline = json.loads((vo / "timeline.json").read_text())
model = WhisperModel("small.en", device="cpu", compute_type="int8", download_root=str(ROOT / ".cache/whisper-models"))
out = {}
for sid in timeline["order"]:
    segs, _ = model.transcribe(load16k(vo / timeline["scenes"][sid]["file"]), word_timestamps=True, language="en")
    words = [{"w": w.word.strip(), "s": round(w.start, 2), "e": round(w.end, 2)} for s in segs for w in s.words]
    out[sid] = words
    print(f"{sid}: {' '.join(x['w'] for x in words)}")
(vo / "words.json").write_text(json.dumps(out, indent=1))
