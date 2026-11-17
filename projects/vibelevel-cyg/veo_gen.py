"""Veo 3.1 image-to-video (Vertex AI, us-central1) — used for the most realistic candidate plates + lip-synced speech.
   .venv/bin/python -I projects/vibelevel-cyg/veo_gen.py <id> "<prompt>" <seconds> <image.png> <out.mp4>"""
import base64, json, subprocess, sys, time, urllib.request, os
P = 'plasma-ivy-458810-u9'
GC = os.path.expanduser('~/google-cloud-sdk/bin/gcloud')
M = f'https://us-central1-aiplatform.googleapis.com/v1/projects/{P}/locations/us-central1/publishers/google/models/veo-3.1-generate-001'
def tok(): return subprocess.run([GC, 'auth', 'application-default', 'print-access-token'], capture_output=True, text=True).stdout.strip()
def post(url, body):
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={'Authorization': f'Bearer {tok()}', 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=300) as r: return json.load(r)
    except urllib.error.HTTPError as e: return {'error': e.read().decode()[:600]}
sid, prompt, secs, img, out = sys.argv[1], sys.argv[2], int(sys.argv[3]), sys.argv[4], sys.argv[5]
body = {'instances': [{'prompt': prompt, 'image': {'bytesBase64Encoded': base64.b64encode(open(img, 'rb').read()).decode(), 'mimeType': 'image/png'}}],
        'parameters': {'aspectRatio': '16:9', 'durationSeconds': secs, 'resolution': os.environ.get('VEO_RES', '1080p'), 'generateAudio': True, 'sampleCount': 1, 'personGeneration': 'allow_adult'}}
op = post(M + ':predictLongRunning', body)
if 'name' not in op: print(sid, 'SUBMIT FAIL', op); sys.exit(1)
for _ in range(80):
    time.sleep(10)
    d = post(M + ':fetchPredictOperation', {'operationName': op['name']})
    if d.get('done'): break
r = d.get('response', {})
vids = r.get('videos') or []
if not vids: print(sid, 'FAIL', json.dumps(d)[:600]); sys.exit(1)
open(out, 'wb').write(base64.b64decode(vids[0]['bytesBase64Encoded']))
with open(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'projects/vibelevel-cyg/ASSETS.md'), 'a') as f:
    f.write(f'| {sid} | veo-3.1-generate-001 i2v ({os.path.basename(img)}) | {prompt} | 16:9 1080p | {secs}s | ok | {out} |\n')
print(sid, 'ok', out)
