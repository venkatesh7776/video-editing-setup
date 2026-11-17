"""Generates every VO part (vo-parts.json) with the ElevenLabs voice, passing neighbouring text for continuity,
then Whisper word timings. Key from ELEVENLABS_API_KEY.  .venv/bin/python -I projects/velora-film/tts.py [ids…]"""
import json, os, subprocess, sys, time, urllib.request
from concurrent.futures import ThreadPoolExecutor
import numpy as np
from faster_whisper import WhisperModel

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
VOICE = os.environ.get('VO_VOICE', 'FYPbXgM2j6oAvIrQjsQz')  # default: Vikram S (ElevenLabs Voice Library), chosen by the user
# VO_PARTS / VO_OUT let other projects reuse this (e.g. projects/rent-ads); a part may set its own "stability".
OUT = os.path.join(ROOT, os.environ.get('VO_OUT', 'work/velora-full/vo'))
parts = json.load(open(os.path.join(ROOT, os.environ.get('VO_PARTS', 'projects/velora-film/vo-parts.json'))))
only = set(sys.argv[1:])

def tts(i):
    p = parts[i]
    body = {'text': p['text'], 'model_id': p.get('model', 'eleven_v4'), 'voice_settings': {'stability': p.get('stability', 0.5), 'similarity_boost': p.get('similarity', 0.85), **({'speed': p['speed']} if 'speed' in p else {})},
            'previous_text': parts[i - 1]['text'] if i and (parts[i - 1]['id'][:2] == p['id'][:2] or os.environ.get('VO_CHAIN')) else None,
            'next_text': parts[i + 1]['text'] if i + 1 < len(parts) and (parts[i + 1]['id'][:2] == p['id'][:2] or os.environ.get('VO_CHAIN')) else None}
    for attempt in range(5):
        req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_192', data=json.dumps(body).encode(),
                                     headers={'xi-api-key': os.environ['ELEVENLABS_API_KEY'], 'content-type': 'application/json'})
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                open(os.path.join(OUT, p['id'] + '.mp3'), 'wb').write(r.read())
                return p['id'], 'ok'
        except urllib.error.HTTPError as e:
            msg = e.read()[:200]
            if e.code == 429 or e.code >= 500:
                time.sleep(4 * (attempt + 1)); continue
            if b'previous_text' in msg or b'next_text' in msg:
                body.pop('previous_text', None); body.pop('next_text', None); continue
            return p['id'], f'HTTP {e.code} {msg}'
    return p['id'], 'gave up'

todo = [i for i, p in enumerate(parts) if not only or p['id'] in only]
with ThreadPoolExecutor(3) as ex:
    for pid, st in ex.map(tts, todo): print(pid, st, flush=True)

model = WhisperModel('small.en', compute_type='int8', download_root=os.path.join(ROOT, '.cache/whisper-models'))
norm = lambda s: ''.join(c for c in s.lower() if c.isalnum() or c == ' ').split()
for i in todo:
    p = parts[i]
    f = os.path.join(OUT, p['id'] + '.mp3')
    a = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True).stdout, np.float32)
    ws = [{'w': w.word.strip(), 's': round(w.start, 3), 'e': round(w.end, 3)} for s in model.transcribe(a, language='en', word_timestamps=True)[0] for w in s.words]
    json.dump({'duration': round(len(a) / 16000, 3), 'words': ws}, open(os.path.join(OUT, p['id'] + '.json'), 'w'))
    heard, want = norm(' '.join(w['w'] for w in ws)), norm(p['text'].replace('-', ' '))
    diff = [w for w in want if w not in heard][:6]
    print(f"{p['id']:9} {len(a)/16000:6.1f}s words {len(heard)}/{len(want)} {'OK' if not diff else 'CHECK ' + str(diff)}")
