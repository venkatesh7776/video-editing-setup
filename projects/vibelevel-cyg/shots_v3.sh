#!/bin/zsh
# v3 candidate plates: keyframes (gemini-3-pro-image, conditioned on omni3/hero.png) → Veo 3.1 i2v 1080p with native audio.
cd "/Users/venkatesh/Desktop/Video Editing setup"
O=work/cyg/omni3
REALISM="Candid documentary photo, Sony A7 IV 50mm f/1.8, natural window light, real unretouched skin with pores and freckles, slight film grain, true-to-life colour. Same man, same clothes (heather-grey t-shirt, open olive-green overshirt) and same Brooklyn home office (white brick, wooden shelf, plant, window) as the reference. Silver MacBook Pro. Not CGI, not airbrushed. No text."
key() { # id prompt
  .venv/bin/python -I - "$1" "$2 $REALISM" <<'PY'
import base64,json,subprocess,sys,urllib.request,os
sid,prompt=sys.argv[1],sys.argv[2]
tok=subprocess.run([os.path.expanduser('~/google-cloud-sdk/bin/gcloud'),'auth','application-default','print-access-token'],capture_output=True,text=True).stdout.strip()
ref=base64.b64encode(open('work/cyg/omni3/hero.png','rb').read()).decode()
body={'contents':[{'role':'user','parts':[{'inlineData':{'mimeType':'image/png','data':ref}},{'text':'Reference: this exact person and room. New frame: '+prompt}]}],'generationConfig':{'responseModalities':['IMAGE'],'imageConfig':{'aspectRatio':'16:9','imageSize':'2K'}}}
req=urllib.request.Request('https://aiplatform.googleapis.com/v1/projects/plasma-ivy-458810-u9/locations/global/publishers/google/models/gemini-3-pro-image:generateContent',data=json.dumps(body).encode(),headers={'Authorization':'Bearer '+tok,'Content-Type':'application/json'})
for i in range(4):
    try:
        d=json.load(urllib.request.urlopen(req,timeout=300)); break
    except urllib.error.HTTPError as e:
        import time; time.sleep(20)
for c in d.get('candidates',[]):
    for p in c['content']['parts']:
        if 'inlineData' in p: open(f'work/cyg/omni3/{sid}.png','wb').write(base64.b64decode(p['inlineData']['data'])); print(sid,'key ok')
PY
}
veo() { .venv/bin/python -I projects/vibelevel-cyg/veo_gen.py $1 "$2" $3 $O/$4 $O/$1.mp4; }
veo k2 "Locked-off documentary footage with only a very slight slow push-in, real person. He reads his laptop screen, then a slow knowing half-smile; natural blinks, tiny head movements, breathing. Soft room tone, faint keyboard taps. No music, no speech." 6 hero.png
key k3 "Tight close-up of his hands on the silver MacBook keyboard from a front three-quarter angle, fingers resting on the command and shift keys."
veo k3 "Real footage. His fingers quickly press command, shift and 4 together, a sneaky screenshot shortcut, then lift. Tiny natural hand movement, subtle camera drift. Crisp key clicks. No music, no speech." 4 k3.png
key k4 "Front close-up across the desk at eye level: his face lit by the laptop screen, the lid edge in the foreground, about to look surprised."
veo k4 "Real footage. He reacts with surprise: eyebrows rise, he leans back slightly, a caught-out blink and a short exhale through the nose. Steady, slow push-in. Natural room tone. No music, no speech." 4 k4.png
key k5 "Front medium shot across the desk: he leans back in his chair with arms crossed, relaxed and satisfied, the open MacBook in front of him."
veo k5 "Real footage. He leans back a little more, a small confident smile and a slow nod while the laptop works. Very slow lateral camera slide. Calm room tone. No music, no speech." 5 k5.png
key k6 "Laptop-webcam point of view: he faces the camera directly, centred, head and shoulders, slightly below eye level, the home office softly out of focus behind him, as in a video interview."
veo k6 "Real webcam footage, locked-off framing, natural webcam look. He answers an interviewer hesitantly with a nervous half-smile, glancing to the side and rubbing the back of his neck. He says, in a natural young American accent: \"Uh... so it basically checks the password, and... yeah, it shows a color, depending on how strong it is.\" Clear close-mic voice, quiet room tone, no music." 8 k6.png
echo DONE
