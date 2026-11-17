"""Chroma-key the green-background graphics → trimmed transparent PNGs (work/public/tel/g/)."""
import glob, os, cv2, numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'work/public/tel/g'); os.makedirs(OUT, exist_ok=True)
for f in sorted(glob.glob(os.path.join(ROOT, 'work/telugu-reel/gen/g-*.png'))):
    im = cv2.imread(f).astype(np.float32)
    b, g, r = im[..., 0], im[..., 1], im[..., 2]
    green = g - np.maximum(r, b)  # how much greener than the other channels
    # background colour sampled from the corners (some images come back on a darker green than #00FF00)
    h, w = g.shape
    cs = np.concatenate([im[:20, :20].reshape(-1, 3), im[:20, -20:].reshape(-1, 3), im[-20:, :20].reshape(-1, 3), im[-20:, -20:].reshape(-1, 3)])
    bg = np.median(cs, axis=0)
    dist = np.sqrt(((im - bg) ** 2).sum(-1))
    a = np.clip((dist - 40) / 60, 0, 1)
    a = np.minimum(a, 1 - np.clip((green - 25) / 70, 0, 1) * (bg[1] > bg[2] + 30))
    a = cv2.GaussianBlur(a, (3, 3), 0)
    # despill: clamp green to max(r, b) where the pixel leans green
    im[..., 1] = np.where((green > 0) & (a < 0.98), np.maximum(r, b) + np.minimum(green, 8), g)
    rgba = np.dstack([im, a * 255]).clip(0, 255).astype(np.uint8)
    ys, xs = np.where(a > 0.05)
    pad = 12
    y0, y1, x0, x1 = max(0, ys.min() - pad), min(a.shape[0], ys.max() + pad), max(0, xs.min() - pad), min(a.shape[1], xs.max() + pad)
    out = os.path.join(OUT, os.path.basename(f)); cv2.imwrite(out, rgba[y0:y1, x0:x1])
    print(os.path.basename(f), rgba[y0:y1, x0:x1].shape)
