"""Applies intentional, rounded frosted blurs to confidential text in the v4 captures (boxes from capture-v4.mjs):
candidate name/email (all shots), assessment/session IDs and decimal score values (report shots), the score next to
the name in the Review Session header. Interface labels stay sharp.
  .venv-ai/bin/python -I projects/vibelevel-screening/blur_v4.py"""
import json, re
import cv2
import numpy as np

SRC, DST = 'work/vl4/cap', 'work/public/vl4/img'
boxes = json.load(open(f'{SRC}/blur-boxes.json'))
dec = re.compile(r'^\s*\d{1,2}\.\d(\s*/\s*10)?\s*$|\d\.\d/10')
for name, bs in boxes.items():
    im = cv2.imread(f'{SRC}/{name}.png')
    report = name.startswith('p')
    keep = []
    for b in bs:
        if b['kind'] in ('pii',) or (report and b['kind'] == 'id') or (b['kind'] == 'score' and dec.search(b['text'])):
            keep.append(b)
    blurred = cv2.GaussianBlur(im, (0, 0), 14)
    mask = np.zeros(im.shape[:2], np.uint8)
    for b in keep:
        if not report and b['kind'] == 'score':
            b = {**b, 'w': b['w'] + 52}  # header: "6.0/10" — cover the "/10" too
        x0, y0 = int(b['x'] - 10), int(b['y'] - 6)
        x1, y1 = int(b['x'] + b['w'] + 10), int(b['y'] + b['h'] + 6)
        r = min(14, (y1 - y0) // 2)
        cv2.rectangle(mask, (x0 + r, y0), (x1 - r, y1), 255, -1)
        cv2.rectangle(mask, (x0, y0 + r), (x1, y1 - r), 255, -1)
        for cx, cy in ((x0 + r, y0 + r), (x1 - r, y0 + r), (x0 + r, y1 - r), (x1 - r, y1 - r)):
            cv2.circle(mask, (cx, cy), r, 255, -1)
    soft = cv2.GaussianBlur(mask, (0, 0), 2).astype(np.float32)[..., None] / 255
    tint = np.full_like(im, (236, 238, 240))  # a light frosted tint so the blur reads as deliberate
    frosted = (blurred * 0.82 + tint * 0.18).astype(np.uint8)
    out = (im * (1 - soft) + frosted * soft).astype(np.uint8)
    cv2.imwrite(f'{DST}/{name}.png', out)
    print(name, 'blurred', len(keep), [k['text'] for k in keep][:8])
