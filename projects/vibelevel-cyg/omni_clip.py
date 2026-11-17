"""One Omni (gemini-omni-1.2-flash) image-to-video clip. Usage: omni_clip.py <image> <out.mp4> <seconds> <resolution> "<prompt>" """
import base64, json, os, subprocess, sys, time, urllib.request
P = 'plasma-ivy-458810-u9'
GC = os.path.expanduser('~/google-cloud-sdk/bin/gcloud')
img, out, secs, res, prompt = sys.argv[1:6]
tok = lambda: subprocess.run([GC, 'auth', 'application-default', 'print-access-token'], capture_output=True, text=True).stdout.strip()
def call(url, body=None):
    req = urllib.request.Request(url, data=json.dumps(body).encode() if body else None, headers={'Authorization': f'Bearer {tok()}', 'Content-Type': 'application/json; charset=utf-8'})
    try:
        with urllib.request.urlopen(req, timeout=600) as r: return json.load(r)
    except urllib.error.HTTPError as e: return {'error': e.read().decode()[:500]}
body = {'model': 'gemini-omni-1.2-flash', 'store': True, 'background': True,
        'input': [{'type': 'text', 'text': prompt}, {'type': 'image', 'data': base64.b64encode(open(img, 'rb').read()).decode(), 'mime_type': 'image/png'}],
        'response_format': [{'type': 'video', 'aspect_ratio': '16:9', 'resolution': res, 'duration': f'{secs}s'}],
        'generation_config': {'video_config': {'task': 'image_to_video'}}}
s = call(f'https://aiplatform.googleapis.com/v1beta1/projects/{P}/locations/global/interactions', body)
if 'id' not in s: print('SUBMIT FAIL', s); sys.exit(1)
for _ in range(120):
    time.sleep(10)
    d = call(f"https://aiplatform.googleapis.com/v1beta1/projects/{P}/locations/global/interactions/{s['id']}")
    if d.get('status') != 'in_progress': break
for st in d.get('steps', []):
    for c in st.get('content', []) or []:
        if c.get('type') == 'video' and c.get('data'):
            open(out, 'wb').write(base64.b64decode(c['data'])); print('ok', out); sys.exit(0)
print('FAIL', d.get('status'), json.dumps(d)[:500]); sys.exit(1)
