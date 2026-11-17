"""Generates a soft, royalty-free ambient music bed (pads + gentle arpeggio).

  .venv/bin/python scripts/audio/ambient_music.py --seconds 130 --out assets/music/ambient.wav
"""

import argparse

import numpy as np
import soundfile as sf

SR = 44100
BPM = 84
BEAT = 60 / BPM

# Cmaj9 → Am9 → Fmaj9 → G6/9 (MIDI notes), one chord per 2 bars.
PROGRESSION = [
    [48, 55, 59, 62, 64],
    [45, 52, 55, 59, 60],
    [41, 48, 52, 55, 57],
    [43, 50, 55, 57, 59],
]


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def envelope(n, attack, release):
    env = np.ones(n)
    a, r = int(attack * SR), int(release * SR)
    env[:a] = np.linspace(0, 1, a) ** 2
    env[-r:] *= np.linspace(1, 0, r) ** 2
    return env


def pad_note(freq, seconds, detune_cents):
    t = np.arange(int(seconds * SR)) / SR
    f = freq * 2 ** (detune_cents / 1200)
    # Soft tone: fundamental plus a little of the 2nd/3rd harmonic, slow vibrato.
    vib = 1 + 0.002 * np.sin(2 * np.pi * 0.25 * t)
    phase = 2 * np.pi * f * np.cumsum(vib) / SR
    return np.sin(phase) + 0.18 * np.sin(2 * phase) + 0.05 * np.sin(3 * phase)


def pluck(freq, seconds=1.6):
    t = np.arange(int(seconds * SR)) / SR
    return (np.sin(2 * np.pi * freq * t) + 0.25 * np.sin(4 * np.pi * freq * t)) * np.exp(-t * 3.2) * np.minimum(1, t * 200)


def reverb(x, seconds=3.0, mix=0.35, seed=1):
    rng = np.random.default_rng(seed)
    n = int(seconds * SR)
    ir = rng.standard_normal(n) * np.exp(-np.linspace(0, 7, n))
    ir /= np.sqrt(np.sum(ir**2))
    size = 1 << int(np.ceil(np.log2(len(x) + n)))
    wet = np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(ir, size), size)[: len(x)]
    return (1 - mix) * x + mix * wet


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--seconds", type=float, default=130)
    p.add_argument("--out", required=True)
    args = p.parse_args()

    total = int(args.seconds * SR)
    left, right = np.zeros(total), np.zeros(total)
    chord_len = 8 * BEAT  # two bars of 4/4
    overlap = 1.5

    i, start = 0, 0.0
    while start < args.seconds:
        chord = PROGRESSION[i % len(PROGRESSION)]
        dur = chord_len + overlap
        s = int(start * SR)
        n = min(int(dur * SR), total - s)
        env = envelope(int(dur * SR), 1.6, 2.2)[:n]
        for note in chord:
            gain = 0.06 if note >= 52 else 0.08
            left[s : s + n] += gain * env * pad_note(hz(note), dur, -6)[:n]
            right[s : s + n] += gain * env * pad_note(hz(note), dur, +6)[:n]
        # Sub bass on the root.
        left[s : s + n] += 0.07 * env * pad_note(hz(chord[0] - 12), dur, 0)[:n]
        right[s : s + n] += 0.07 * env * pad_note(hz(chord[0] - 12), dur, 0)[:n]
        # Gentle arpeggio in eighth notes (enters after the first chord).
        if start >= chord_len:
            arp = [chord[1] + 12, chord[2] + 12, chord[3] + 12, chord[4] + 12, chord[3] + 12, chord[2] + 12]
            for k in range(16):
                t0 = start + k * BEAT / 2
                ps = int(t0 * SR)
                note = pluck(hz(arp[k % len(arp)]))
                m = min(len(note), total - ps)
                if m <= 0:
                    continue
                pan = 0.5 + 0.3 * np.sin(k)
                left[ps : ps + m] += 0.035 * (1 - pan) * note[:m]
                right[ps : ps + m] += 0.035 * pan * note[:m]
        start += chord_len
        i += 1

    left, right = reverb(left, seed=1), reverb(right, seed=2)
    fade = envelope(total, 2.5, 5.0)
    stereo = np.stack([left * fade, right * fade], axis=1)
    stereo *= 0.5 / np.max(np.abs(stereo))
    sf.write(args.out, stereo.astype(np.float32), SR)
    print(f"[music] {args.seconds:.0f}s ambient bed → {args.out}")


if __name__ == "__main__":
    main()
