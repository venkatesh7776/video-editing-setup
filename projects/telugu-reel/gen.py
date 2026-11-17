"""Telugu wedding-website reel — AI assets (Google Cloud, ADC auth; no keys in files).
  image:  .venv/bin/python -I projects/telugu-reel/gen.py img <id> "<prompt>" [ref1.png ref2.png …]   → work/telugu-reel/gen/<id>.png (9:16)
  veo:    .venv/bin/python -I projects/telugu-reel/gen.py veo <id> "<prompt>" <seconds> <image.png>    → work/telugu-reel/gen/<id>.mp4 (9:16, with speech)
Every asset is logged to projects/telugu-reel/ASSETS.md."""
import base64, json, os, subprocess, sys, time, urllib.request
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'work/telugu-reel/gen'); os.makedirs(OUT, exist_ok=True)
P = 'plasma-ivy-458810-u9'
GC = os.path.expanduser('~/google-cloud-sdk/bin/gcloud')
def tok(): return subprocess.run([GC, 'auth', 'application-default', 'print-access-token'], capture_output=True, text=True).stdout.strip()
def post(url, body, timeout=600):
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={'Authorization': f'Bearer {tok()}', 'Content-Type': 'application/json; charset=utf-8'})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r: return json.load(r)
    except urllib.error.HTTPError as e: return {'error': e.read().decode()[:600]}
def log(line):
    with open(os.path.join(ROOT, 'projects/telugu-reel/ASSETS.md'), 'a') as f: f.write(line + '\n')

def img(i, prompt, refs):
    parts = [{'inlineData': {'mimeType': 'image/png', 'data': base64.b64encode(open(r, 'rb').read()).decode()}} for r in refs] + [{'text': prompt}]
    body = {'contents': [{'role': 'user', 'parts': parts}], 'generationConfig': {'responseModalities': ['IMAGE'], 'imageConfig': {'aspectRatio': '9:16'}}}
    d = post(f'https://aiplatform.googleapis.com/v1/projects/{P}/locations/global/publishers/google/models/gemini-3-pro-image:generateContent', body)
    for c in d.get('candidates', []):
        for p in c['content']['parts']:
            if 'inlineData' in p:
                f = os.path.join(OUT, f'{i}.png'); open(f, 'wb').write(base64.b64decode(p['inlineData']['data']))
                log(f'| {i} | gemini-3-pro-image 9:16 | refs: {", ".join(os.path.basename(r) for r in refs) or "—"} | ok | {os.path.relpath(f, ROOT)} |'); print(i, 'ok', f); return
    print(i, 'FAIL', json.dumps(d)[:400]); sys.exit(1)

def veo(i, prompt, secs, image):
    M = f'https://us-central1-aiplatform.googleapis.com/v1/projects/{P}/locations/us-central1/publishers/google/models/veo-3.1-generate-001'
    body = {'instances': [{'prompt': prompt, 'image': {'bytesBase64Encoded': base64.b64encode(open(image, 'rb').read()).decode(), 'mimeType': 'image/png'}}],
            'parameters': {'aspectRatio': '9:16', 'durationSeconds': secs, 'resolution': os.environ.get('VEO_RES', '1080p'), 'generateAudio': True, 'sampleCount': 1, 'personGeneration': 'allow_adult'}}
    op = post(M + ':predictLongRunning', body, 300)
    if 'name' not in op: print(i, 'SUBMIT FAIL', op); sys.exit(1)
    d = {}
    for _ in range(90):
        time.sleep(10)
        d = post(M + ':fetchPredictOperation', {'operationName': op['name']}, 300)
        if d.get('done'): break
    vids = d.get('response', {}).get('videos') or []
    if not vids: print(i, 'FAIL', json.dumps(d)[:600]); sys.exit(1)
    f = os.path.join(OUT, f'{i}.mp4'); open(f, 'wb').write(base64.b64decode(vids[0]['bytesBase64Encoded']))
    log(f'| {i} | veo-3.1 i2v 9:16 {secs}s ({os.path.basename(image)}) | ok | {os.path.relpath(f, ROOT)} |'); print(i, 'ok', f)

if __name__ == '__main__':
    kind, i, prompt = sys.argv[1], sys.argv[2], sys.argv[3]
    if kind == 'img': img(i, prompt, sys.argv[4:])
    else: veo(i, prompt, int(sys.argv[4]), sys.argv[5])
