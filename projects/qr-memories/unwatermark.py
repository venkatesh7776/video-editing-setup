"""Removes the Gemini sparkle watermark (semi-transparent white, bottom-right) from the two AI hook clips by
reverse alpha blending: alpha is estimated from all frames against an inpainted background, then
orig = (p - a*255) / (1 - a). Residual edges are inpainted. Reads/writes work/public/qr/a{1,2}.mp4 ← QR assets originals.
  .venv-ai/bin/python -I projects/qr-memories/unwatermark.py"""
import os, subprocess, sys
import cv2, numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = {'a1': 'QR assets/Guest_scanning_wedding_QR_code_81bb80f4_1080p.mp4', 'a2': 'QR assets/Guests_sharing_wedding_photos_2061fd40_1080p.mp4'}
X0, Y0, X1, Y1 = 840, 1680, 960, 1800  # region around the sparkle

def frames(path):
    cap = cv2.VideoCapture(path)
    while True:
        ok, f = cap.read()
        if not ok: break
        yield f

for key, rel in SRC.items():
    src = os.path.join(ROOT, rel)
    fs = list(frames(src))
    R = np.stack([f[Y0:Y1, X0:X1].astype(np.float32) for f in fs])  # n,h,w,3
    # rough mask: pixels persistently brighter than their surroundings
    lum = R.mean(3)
    blur = np.stack([cv2.GaussianBlur(l, (0, 0), 9) for l in lum])
    excess = np.median(lum - blur, 0)
    mask = (excess > 6).astype(np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    n, lab, stats, _ = cv2.connectedComponentsWithStats(mask)
    big = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
    mask = (lab == big).astype(np.uint8)
    cs, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    mask = cv2.drawContours(np.zeros_like(mask), cs, -1, 1, -1)  # fill the sparkle's (flat, bright) centre
    dil = cv2.dilate(mask, np.ones((9, 9), np.uint8))
    # alpha from p vs inpainted background, median over frames
    al = []
    for r in R[:: max(1, len(R) // 60)]:
        bg = cv2.inpaint(r.astype(np.uint8), dil, 6, cv2.INPAINT_TELEA).astype(np.float32)
        al.append(np.clip((r - bg) / np.maximum(255 - bg, 8), 0, 0.9).mean(2))
    alpha = np.median(np.stack(al), 0) * cv2.GaussianBlur(dil.astype(np.float32), (0, 0), 1.2)
    alpha = cv2.GaussianBlur(alpha, (0, 0), 0.6)
    edge = cv2.dilate(mask, np.ones((3, 3), np.uint8)) - cv2.erode(mask, np.ones((3, 3), np.uint8))
    print(key, 'mask px', int(mask.sum()), 'alpha max', round(float(alpha.max()), 3), file=sys.stderr)
    h, w = fs[0].shape[:2]
    out = os.path.join(ROOT, 'work/public/qr', f'{key}.mp4')
    ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{w}x{h}', '-r', '24', '-i', '-', '-vf', 'fps=30', '-c:v', 'libx264', '-crf', '16', '-preset', 'fast', '-pix_fmt', 'yuv420p', out], stdin=subprocess.PIPE)
    a3 = alpha[..., None]
    for f in fs:
        r = f[Y0:Y1, X0:X1].astype(np.float32)
        fixed = np.clip((r - a3 * 255) / np.maximum(1 - a3, 0.1), 0, 255).astype(np.uint8)
        fixed = cv2.inpaint(fixed, edge, 3, cv2.INPAINT_TELEA)
        g = f.copy(); g[Y0:Y1, X0:X1] = fixed
        ff.stdin.write(g.tobytes())
    ff.stdin.close(); ff.wait()
    print('wrote', out, file=sys.stderr)
