"""Polish voice recordings without changing the voice: crop to speech → declip → ElevenLabs Voice Isolator → master chain.
   .venv/bin/python -I projects/polish_audio.py   (ELEVENLABS_API_KEY from env)"""
import json, os, subprocess, urllib.request, uuid
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'Audios'); W = os.path.join(ROOT, 'work/polish'); OUT = os.path.join(ROOT, 'polished audios')
JOBS = [  # (source, out name, start, end)  — speech regions from Whisper, ~0.3 s padding
    ("I turn this outaded landing page scene .mp4", '01 - I turn this outdated landing page', 1.9, 7.4),
    ("Here's How.mp4", "02 - Here's how", 4.4, 6.7),
    ('problem.mp4', '03 - Problem', 8.8, 26.9),
    ('solution.mp4', '04 - Solution', 0.0, 22.3),
    ("Here's is the final transformation.mp4", '05 - Final transformation', 2.0, 11.9),
]
K = os.environ['ELEVENLABS_API_KEY']
def isolate(inp, out):
    b = uuid.uuid4().hex
    data = open(inp, 'rb').read()
    body = (f'--{b}\r\nContent-Disposition: form-data; name="audio"; filename="in.wav"\r\nContent-Type: audio/wav\r\n\r\n').encode() + data + f'\r\n--{b}--\r\n'.encode()
    req = urllib.request.Request('https://api.elevenlabs.io/v1/audio-isolation', data=body, headers={'xi-api-key': K, 'Content-Type': f'multipart/form-data; boundary={b}'})
    with urllib.request.urlopen(req, timeout=300) as r: open(out, 'wb').write(r.read())
MASTER = ','.join([
    'highpass=f=75', 'lowpass=f=16000',
    'equalizer=f=200:t=q:w=1:g=1.5',      # warmth
    'equalizer=f=350:t=q:w=1.2:g=-1.5',    # less boxiness
    'equalizer=f=3200:t=q:w=1.4:g=2',      # presence / clarity
    'equalizer=f=7000:t=q:w=2:g=-1.5',     # tame sibilance
    'acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=2',
    'loudnorm=I=-16:TP=-1.5:LRA=7',
    'aresample=48000',
])
for src, name, a, b in JOBS:
    cut = os.path.join(W, name + '-cut.wav'); iso = os.path.join(W, name + '-iso.mp3')
    # the isolator needs ≥ 4.6 s: short clips are padded with silence for processing, then trimmed back
    pad = ',apad=whole_dur=5' if b - a < 4.8 else ''
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(a), '-to', str(b), '-i', os.path.join(SRC, src), '-ac', '1', '-ar', '48000', '-af', 'adeclip' + pad, cut], check=True)
    if not (os.path.exists(iso) and os.path.getmtime(iso) > os.path.getmtime(__file__)):
        isolate(cut, iso)
    trim = ['-t', f'{b - a:.3f}']
    for ext, codec in (('wav', ['-c:a', 'pcm_s24le']), ('m4a', ['-c:a', 'aac', '-b:a', '256k'])):
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', iso, *trim, '-af', MASTER + ',afade=t=in:d=0.04,areverse,afade=t=in:d=0.08,areverse', '-ac', '1', *codec, os.path.join(OUT, f'{name}.{ext}')], check=True)
    print('✔', name)
