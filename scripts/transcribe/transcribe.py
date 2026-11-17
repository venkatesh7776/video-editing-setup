"""Local speech-to-text with faster-whisper (open-source Whisper, runs on CPU).

Writes a word-level JSON transcript, a plain-text transcript, and SRT/VTT
subtitles. Usually called via `npm run transcribe`, which extracts audio first.

  .venv/bin/python scripts/transcribe/transcribe.py AUDIO.wav --name raw-video
"""

import argparse
import json
import sys
import time
import wave
from pathlib import Path

import numpy as np
from faster_whisper import WhisperModel

ROOT = Path(__file__).resolve().parents[2]

MAX_CUE_CHARS = 42 * 2  # two subtitle lines
MAX_CUE_SECONDS = 6.0


def ts(seconds: float, sep: str) -> str:
    ms = int(round(seconds * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02}{sep}{ms:03}"


def load_wav(path: str) -> np.ndarray:
    """Reads the 16 kHz mono PCM WAV that FFmpeg extracted (avoids PyAV decoding quirks)."""
    with wave.open(path, "rb") as w:
        if w.getframerate() != 16000 or w.getnchannels() != 1 or w.getsampwidth() != 2:
            sys.exit(f"{path}: expected 16 kHz mono 16-bit WAV (extract with ffmpeg -ac 1 -ar 16000)")
        pcm = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16)
    return pcm.astype(np.float32) / 32768.0


def build_cues(words):
    """Split words into readable subtitle cues (≤2 lines, ≤6 s, break on sentences)."""
    cues, current = [], []
    for w in words:
        if current:
            text = " ".join(x["text"] for x in current + [w])
            too_long = len(text) > MAX_CUE_CHARS or w["end"] - current[0]["start"] > MAX_CUE_SECONDS
            gap = w["start"] - current[-1]["end"] > 1.0
            sentence_end = current[-1]["text"].endswith((".", "?", "!"))
            if too_long or gap or (sentence_end and len(text) > 30):
                cues.append(current)
                current = []
        current.append(w)
    if current:
        cues.append(current)
    return [
        {"start": c[0]["start"], "end": c[-1]["end"], "text": " ".join(x["text"] for x in c)}
        for c in cues
    ]


def main():
    p = argparse.ArgumentParser()
    p.add_argument("audio")
    p.add_argument("--name", required=True, help="base name for output files")
    p.add_argument("--model", default="small.en")
    p.add_argument("--language", default="en")
    p.add_argument("--keep-fillers", action="store_true", help="bias Whisper to write um/uh instead of dropping them")
    p.add_argument("--transcripts-dir", default=str(ROOT / "captions/transcripts"))
    p.add_argument("--subtitles-dir", default=str(ROOT / "captions/subtitles"))
    args = p.parse_args()

    models_dir = ROOT / ".cache/whisper-models"
    print(f"[whisper] loading model '{args.model}' (first run downloads it to {models_dir})", flush=True)
    model = WhisperModel(args.model, device="cpu", compute_type="int8", download_root=str(models_dir))

    started = time.time()
    segments, info = model.transcribe(
        load_wav(args.audio),
        language=args.language or None,
        word_timestamps=True,
        vad_filter=True,
        vad_parameters={"min_silence_duration_ms": 500},
        beam_size=5,
        condition_on_previous_text=False,  # reduces hallucinated repeats
        # Whisper normally omits fillers; a disfluent prompt makes it transcribe them.
        initial_prompt="Umm, let me think, uh... like, hmm. Okay, so, um, here's what I mean." if args.keep_fillers else None,
    )

    out_segments, words = [], []
    for seg in segments:
        seg_words = [
            {"text": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3), "probability": round(w.probability, 3)}
            for w in (seg.words or [])
            if w.word.strip()
        ]
        words.extend(seg_words)
        out_segments.append({"start": round(seg.start, 3), "end": round(seg.end, 3), "text": seg.text.strip(), "words": seg_words})
        print(f"  [{ts(seg.start, '.')} → {ts(seg.end, '.')}] {seg.text.strip()}", flush=True)

    transcripts = Path(args.transcripts_dir)
    subtitles = Path(args.subtitles_dir)
    transcripts.mkdir(parents=True, exist_ok=True)
    subtitles.mkdir(parents=True, exist_ok=True)

    data = {
        "model": args.model,
        "language": info.language,
        "duration": round(info.duration, 3),
        "segments": out_segments,
        "words": words,
    }
    (transcripts / f"{args.name}.json").write_text(json.dumps(data, indent=1))
    (transcripts / f"{args.name}.txt").write_text("\n".join(s["text"] for s in out_segments) + "\n")

    cues = build_cues(words)
    srt = "\n".join(f"{i}\n{ts(c['start'], ',')} --> {ts(c['end'], ',')}\n{c['text']}\n" for i, c in enumerate(cues, 1))
    vtt = "WEBVTT\n\n" + "\n".join(f"{ts(c['start'], '.')} --> {ts(c['end'], '.')}\n{c['text']}\n" for c in cues)
    (subtitles / f"{args.name}.srt").write_text(srt)
    (subtitles / f"{args.name}.vtt").write_text(vtt)

    print(
        f"[whisper] {len(words)} words, {len(cues)} subtitle cues in {time.time() - started:.1f}s → "
        f"{transcripts / args.name}.json/.txt, {subtitles / args.name}.srt/.vtt"
    )


if __name__ == "__main__":
    sys.exit(main())
