"""Cuts the groom / bride illustrations out of their flat maroon backgrounds (colour key + GrabCut, feathered edge).
   .venv-ai/bin/python -I projects/temple-reel/cutout.py   → work/public/temple/{groom,bride}-cut.png"""
import os, sys
import cv2, numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.expanduser('~/Desktop/Murali wedding /Hindu_wedding_website/artwork-originals/couple')
for name, f in [('groom', 'Ornate Indian Groom Portrait.png'), ('bride', 'Jasmine-Adorned Woman in Ivory Saree.png')]:
    im = cv2.imread(os.path.join(SRC, f))
    h, w = im.shape[:2]
    lab = cv2.cvtColor(im, cv2.COLOR_BGR2LAB).astype(np.float32)
    border = np.concatenate([lab[:12].reshape(-1, 3), lab[:, :12].reshape(-1, 3), lab[:, -12:].reshape(-1, 3)])
    bg = np.median(border, 0)
    d = np.linalg.norm(lab - bg, axis=2)
    near = (d < 16).astype(np.uint8)
    # background = near-bg pixels connected to the top/left/right border
    n, lab_cc = cv2.connectedComponents(near)
    ids = set(np.unique(np.concatenate([lab_cc[0], lab_cc[:, 0], lab_cc[:, -1]]))) - {0}
    bgm = np.isin(lab_cc, list(ids))
    mask = np.full((h, w), cv2.GC_PR_FGD, np.uint8)
    mask[bgm] = cv2.GC_BGD
    mask[(d < 26) & ~bgm] = cv2.GC_PR_BGD
    mask[d > 55] = cv2.GC_FGD
    mask[bgm] = cv2.GC_BGD
    bgd, fgd = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
    cv2.grabCut(im, mask, None, bgd, fgd, 6, cv2.GC_INIT_WITH_MASK)
    fg = np.isin(mask, [cv2.GC_FGD, cv2.GC_PR_FGD]).astype(np.uint8)
    # keep the largest component, fill holes
    n, cc, st, _ = cv2.connectedComponentsWithStats(fg)
    fg = (cc == 1 + np.argmax(st[1:, cv2.CC_STAT_AREA])).astype(np.uint8)
    cs, _ = cv2.findContours(fg, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    fg = cv2.drawContours(np.zeros_like(fg), cs, -1, 1, -1)
    fg = cv2.erode(fg, np.ones((3, 3), np.uint8))
    a = cv2.GaussianBlur(fg.astype(np.float32), (0, 0), 1.2)
    # decontaminate edge colour (pull maroon spill toward the inner colour)
    inner = cv2.inpaint(im, (1 - cv2.erode(fg, np.ones((7, 7), np.uint8))).astype(np.uint8), 3, cv2.INPAINT_TELEA)
    edge = ((a > 0.02) & (a < 0.98))[..., None]
    out = np.where(edge, inner, im)
    rgba = np.dstack([out, (a * 255).astype(np.uint8)])
    ys, xs = np.where(a > 0.02)
    rgba = rgba[ys.min():, max(0, xs.min() - 4):xs.max() + 5]
    p = os.path.join(ROOT, 'work/public/temple', f'{name}-cut.png')
    cv2.imwrite(p, rgba)
    print(name, rgba.shape, 'bg', bg.round(1), file=sys.stderr)
