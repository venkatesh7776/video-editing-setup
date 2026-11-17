"""Low-key 'creator' grade for the talking-head clips (reference: dark room, one soft key, warm skin, cool charcoal shadows).
Per frame: track the face (YuNet), build a soft key-light mask around it; outside the mask: deep crush + cool tint;
inside: warm, lifted skin. Output 1080-wide (crop happens in Remotion), source fps, HEVC rotation applied.
   .venv-ai/bin/python -I projects/redesign-reel/grade.py 1 2 3 4"""
import os, subprocess, sys
import cv2, numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.environ.get('GRADE_SRC', os.path.join(ROOT, 'Raw footage for 1st reel')); OUT = os.environ.get('GRADE_OUT', os.path.join(ROOT, 'work/redesign/graded'))
det = None
def lut_curve(pts):
    xs, ys = zip(*pts); return np.clip(np.interp(np.arange(256) / 255, xs, ys) * 255, 0, 255).astype(np.uint8)
DARK = lut_curve([(0, 0), (0.25, 0.035), (0.5, 0.17), (0.8, 0.42), (1, 0.62)])   # the room
LIT = lut_curve([(0, 0), (0.18, 0.08), (0.45, 0.36), (0.75, 0.70), (1, 0.93)])  # the face / key light
for name in sys.argv[1:]:
    src = os.path.join(SRC, f'{name}.MOV'); out = os.path.join(OUT, f'{name}.mp4')
    probe = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate:stream_side_data=rotation', '-of', 'default=nw=1', src], capture_output=True, text=True).stdout
    # decode with rotation applied, scaled so the short side is 1080
    dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', src, '-vf', "scale='if(gt(iw,ih),-2,1080)':'if(gt(iw,ih),1080,-2)'", '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-'], stdout=subprocess.PIPE)
    info = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', '-vf', 'null', src], capture_output=True, text=True).stdout
    # find output size by decoding one frame
    tmp = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-frames:v', '1', '-vf', "scale='if(gt(iw,ih),-2,1080)':'if(gt(iw,ih),1080,-2)'", '-f', 'image2pipe', '-vcodec', 'png', '-'], capture_output=True).stdout
    w, h = cv2.imdecode(np.frombuffer(tmp, np.uint8), 1).shape[1::-1]
    det = cv2.FaceDetectorYN.create(os.path.join(ROOT, '.cache/models/yunet.onnx'), '', (w // 2, h // 2), 0.6)
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{w}x{h}', '-r', '30', '-i', '-', '-i', src, '-map', '0:v', '-map', '1:a?', '-c:v', 'libx264', '-crf', '14', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', out], stdin=subprocess.PIPE)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    face = None
    n = 0
    while True:
        buf = dec.stdout.read(w * h * 3)
        if len(buf) < w * h * 3: break
        f = np.frombuffer(buf, np.uint8).reshape(h, w, 3)
        if n % 3 == 0:
            _, fs = det.detect(cv2.resize(f, (w // 2, h // 2)))
            if fs is not None and len(fs):
                x, y, fw, fh = (fs[0][:4] * 2).tolist()
                c = np.array([x + fw / 2, y + fh * 0.55, fw, fh])
                face = c if face is None else face * 0.7 + c * 0.3   # smooth the tracking
        if face is None: face = np.array([w / 2, h * 0.4, w * 0.25, h * 0.3])
        cx, cy, fw, fh = face
        # key light: an ellipse around the face/neck, offset slightly toward camera-left (light side), soft falloff
        rx, ry = fw * 1.25, fh * 1.45
        d = ((xx - (cx - fw * 0.12)) / rx) ** 2 + ((yy - (cy + fh * 0.25)) / ry) ** 2
        m = np.clip(1.25 - d, 0, 1) ** 1.6
        m = cv2.GaussianBlur(m, (0, 0), fw * 0.18)[..., None]
        dark = cv2.LUT(f, DARK).astype(np.float32)
        dark = dark * np.array([1.06, 0.98, 0.92]) + np.array([4, 0, -2])     # BGR: cool, slightly purple charcoal
        lit = cv2.LUT(f, LIT).astype(np.float32)
        lit = lit * np.array([0.90, 0.98, 1.08])                               # BGR: warm skin
        o = dark * (1 - m) + lit * m
        gray = o.mean(2, keepdims=True); o = gray + (o - gray) * 0.82        # tame saturation
        vg = np.clip(1.15 - (((xx - w / 2) / (w * 0.62)) ** 2 + ((yy - h * 0.45) / (h * 0.7)) ** 2), 0.35, 1)[..., None]
        o = np.clip(o * vg, 0, 255).astype(np.uint8)
        enc.stdin.write(o.tobytes()); n += 1
    enc.stdin.close(); enc.wait(); dec.wait()
    print('✔', name, n, 'frames', f'{w}x{h}')
