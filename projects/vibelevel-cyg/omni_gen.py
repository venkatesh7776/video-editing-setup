"""Omni production assets for 'Can You Get Away With It?'.
1) keyframes: gemini-3-pro-image, conditioned on the approved character still (CHAR-01) for consistency
2) clips: gemini-omni-1.2-flash image_to_video (Interactions API, global), 1080p 16:9
Auth: gcloud ADC (no keys in files). Logs every asset to projects/vibelevel-cyg/ASSETS.md.
   .venv/bin/python -I projects/vibelevel-cyg/omni_gen.py [ids…]"""
import base64, json, os, subprocess, sys, time, urllib.request
from concurrent.futures import ThreadPoolExecutor
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, os.environ.get('OMNI_OUT', 'work/cyg/omni'))
P = 'plasma-ivy-458810-u9'
GC = os.path.expanduser('~/google-cloud-sdk/bin/gcloud')
CHAR = os.environ.get('OMNI_REF') or os.path.join(OUT, 'char-01-1.png')
STYLE = ('Ultra-realistic documentary photograph, 16:9, same person and room as the reference: young Indian software engineer mid-20s, short black hair, '
         'light stubble, light-grey crew-neck t-shirt, unbuttoned dark-navy linen overshirt, silver watch, silver Apple MacBook Pro; bright modern home office, '
         'white walls, light oak shelves with books, soft overcast window light. Full-frame cinema camera, natural skin texture, true-to-life colour, gentle filmic contrast, '
         'faint mint tint in shadows. Not CGI, not illustration. No text, no readable screen content, no logos except the plain Apple logo on the lid.')
SHOTS = {
 'k2': ('(the reference frame itself)',
        'Documentary realism. He reads the screen, then a slow knowing half-smile; natural micro-movements, a blink, slight head tilt. Very slow push-in from across the desk, steady. Quiet room tone, faint keyboard taps.', 6),
 'k3': ('Tight close-up, front three-quarter angle, of his hands on the silver MacBook keyboard, silver watch on his wrist, fingers on the command and shift keys, soft daylight, shallow focus.',
        'His fingers press command, shift and 4 together quickly, a sneaky screenshot shortcut; tiny natural hand movement; subtle slow camera drift. Crisp key clicks.', 4),
 'k4': ('Front close-up from across the desk at eye level: his face lit by the MacBook screen, the laptop lid edge in the foreground, starting to look surprised.',
        'He reacts with surprise — eyebrows rise, he leans back slightly, a caught-out blink and a small exhale. Steady slow push-in. Natural room tone.', 4),
 'k5': ('Front medium shot from across the desk: he leans back in his chair with arms crossed, relaxed and satisfied, the silver MacBook open in front of him.',
        'He leans back a little more, gives a small confident smile and a slow nod while the laptop works. Slow lateral camera slide. Calm room tone.', 5),
 'k6': ('Laptop-webcam point of view: he faces the camera directly, centred, head and shoulders, slightly below eye level, home office softly out of focus behind him, as in a video interview.',
        'He answers hesitantly, small nervous smile, glances to the side, rubs the back of his neck, natural speech mouth movement. Locked-off webcam framing, realistic webcam look. Room tone only.', 6),
}
def tok(): return subprocess.run([GC, 'auth', 'application-default', 'print-access-token'], capture_output=True, text=True).stdout.strip()
def post(url, body):
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={'Authorization': f'Bearer {tok()}', 'Content-Type': 'application/json; charset=utf-8'})
    try:
        with urllib.request.urlopen(req, timeout=600) as r: return json.load(r)
    except urllib.error.HTTPError as e: return {'error': {'message': e.read().decode()[:500]}}
def get(url):
    req = urllib.request.Request(url, headers={'Authorization': f'Bearer {tok()}'})
    with urllib.request.urlopen(req, timeout=120) as r: return json.load(r)
def log(line):
    with open(os.path.join(ROOT, 'projects/vibelevel-cyg/ASSETS.md'), 'a') as f: f.write(line + '\n')

def keyframe(k):
    still, _, _ = SHOTS[k]
    ref = base64.b64encode(open(CHAR, 'rb').read()).decode()
    body = {'contents': [{'role': 'user', 'parts': [{'inlineData': {'mimeType': 'image/png', 'data': ref}}, {'text': f'Reference image: the character. Create a new frame. {still} {STYLE}'}]}],
            'generationConfig': {'responseModalities': ['IMAGE'], 'imageConfig': {'aspectRatio': '16:9'}}}
    d = post(f'https://aiplatform.googleapis.com/v1/projects/{P}/locations/global/publishers/google/models/gemini-3-pro-image:generateContent', body)
    for c in d.get('candidates', []):
        for p in c['content']['parts']:
            if 'inlineData' in p:
                f = os.path.join(OUT, f'{k}.png'); open(f, 'wb').write(base64.b64decode(p['inlineData']['data']))
                log(f'| {k} still | gemini-3-pro-image (ref CHAR-01) | {still} | 16:9 | — | ok | work/cyg/omni/{k}.png |'); return f
    raise RuntimeError(f'{k} keyframe failed: {json.dumps(d)[:300]}')

def clip(k, img):
    _, motion, dur = SHOTS[k]
    data = base64.b64encode(open(img, 'rb').read()).decode()
    body = {'model': 'gemini-omni-1.2-flash', 'store': True, 'background': True,
            'input': [{'type': 'text', 'text': f'{motion} Keep the man, wardrobe, room and lighting exactly as in the image. Photorealistic live-action footage, natural motion, no morphing, no text.'},
                      {'type': 'image', 'data': data, 'mime_type': 'image/png'}],
            'response_format': [{'type': 'video', 'aspect_ratio': '16:9', 'resolution': '1080p', 'duration': f'{dur}s'}],
            'generation_config': {'video_config': {'task': 'image_to_video'}}}
    s = post(f'https://aiplatform.googleapis.com/v1beta1/projects/{P}/locations/global/interactions', body)
    if 'id' not in s: raise RuntimeError(f'{k} clip submit failed: {json.dumps(s)[:400]}')
    for _ in range(90):
        time.sleep(10)
        d = get(f"https://aiplatform.googleapis.com/v1beta1/projects/{P}/locations/global/interactions/{s['id']}")
        if d.get('status') != 'in_progress': break
    for st in d.get('steps', []):
        for c in st.get('content', []) or []:
            if c.get('type') == 'video' and c.get('data'):
                f = os.path.join(OUT, f'{k}.mp4'); open(f, 'wb').write(base64.b64decode(c['data']))
                log(f'| {k} clip | gemini-omni-1.2-flash i2v from {k}.png | {motion} | 16:9 1080p | {dur}s | ok | work/cyg/omni/{k}.mp4 |'); return f
    raise RuntimeError(f'{k} clip failed: status {d.get("status")} {json.dumps(d)[:300]}')

def job(k):
    try:
        img = os.path.join(OUT, f'{k}.png')
        if not os.path.exists(img): img = keyframe(k)
        return k, clip(k, img)
    except Exception as e: return k, f'FAIL {e}'

ids = sys.argv[1:] or list(SHOTS)
with ThreadPoolExecutor(int(os.environ.get('OMNI_WORKERS', '3'))) as ex:
    for k, r in ex.map(job, ids): print(k, r, flush=True)
