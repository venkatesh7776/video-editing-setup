"""Sarvam AI (Bulbul) text-to-speech for the reel voiceover.

The API key is read from the SARVAM_API_KEY environment variable only (never stored).

  SARVAM_API_KEY=... .venv/bin/python -I projects/wedding-reel/sarvam_tts.py test --speakers a,b --text "..."
  SARVAM_API_KEY=... .venv/bin/python -I projects/wedding-reel/sarvam_tts.py build projects/wedding-reel/narration.json --out work/wedding-reel/vo
"""
import argparse
import base64
import io
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

import numpy as np
import soundfile as sf

URL = "https://api.sarvam.ai/text-to-speech"


def tts(text, speaker, model, pace, temperature=None):
    body = {"text": text, "target_language_code": "en-IN", "speaker": speaker, "model": model, "pace": pace, "speech_sample_rate": 24000}
    if temperature is not None:
        body["temperature"] = temperature
    req = urllib.request.Request(URL, data=json.dumps(body).encode(), headers={"api-subscription-key": os.environ["SARVAM_API_KEY"], "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            data = json.loads(r.read())
    except urllib.error.HTTPError as e:
        raise SystemExit(f"Sarvam API {e.code}: {e.read().decode()[:400]}")
    audio, sr = sf.read(io.BytesIO(base64.b64decode(data["audios"][0])), dtype="float32")
    if audio.ndim > 1:
        audio = audio.mean(1)
    return audio, sr


def trim(a, sr, thr=0.003):
    idx = np.where(np.abs(a) > thr)[0]
    if not len(idx):
        return a
    return a[max(0, idx[0] - int(0.06 * sr)): min(len(a), idx[-1] + int(0.12 * sr))]


def main():
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="cmd", required=True)
    t = sub.add_parser("test")
    t.add_argument("--speakers", required=True)
    t.add_argument("--text", required=True)
    t.add_argument("--model", default="bulbul:v3")
    t.add_argument("--pace", type=float, default=1.0)
    t.add_argument("--out", default="work/wedding-reel/voice-test")
    b = sub.add_parser("build")
    b.add_argument("narration")
    b.add_argument("--out", required=True)
    b.add_argument("--only")
    a = p.parse_args()
    if "SARVAM_API_KEY" not in os.environ:
        sys.exit("Set SARVAM_API_KEY")

    if a.cmd == "test":
        Path(a.out).mkdir(parents=True, exist_ok=True)
        for spk in a.speakers.split(","):
            audio, sr = tts(a.text, spk, a.model, a.pace)
            f = Path(a.out) / f"sarvam-{a.model.replace(':', '-')}-{spk}.wav"
            sf.write(f, trim(audio, sr), sr)
            print(f"{spk}: {len(audio) / sr:.1f}s → {f}")
        return

    spec = json.loads(Path(a.narration).read_text())
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    tl_path = out / "timeline.json"
    old = json.loads(tl_path.read_text()) if tl_path.exists() else {"scenes": {}}
    only = set(a.only.split(",")) if a.only else None
    scenes = {}
    for sc in spec["scenes"]:
        sid = sc["id"]
        if only and sid not in only and sid in old["scenes"]:
            scenes[sid] = old["scenes"][sid]
            continue
        text = sc.get("spoken", sc["text"])
        audio, sr = tts(text, spec["speaker"], spec.get("model", "bulbul:v3"), sc.get("pace", spec.get("pace", 1.0)))
        audio = trim(audio, sr)
        sf.write(out / f"{sid}.wav", audio, sr)
        scenes[sid] = {"id": sid, "file": f"{sid}.wav", "duration": round(len(audio) / sr, 3), "chunks": []}
        print(f"  {sid:14} {scenes[sid]['duration']:5.2f}s  {text}")
    tl_path.write_text(json.dumps({"voice": f"sarvam {spec['speaker']}", "scenes": scenes, "order": [s["id"] for s in spec["scenes"]]}, indent=1))


if __name__ == "__main__":
    main()
