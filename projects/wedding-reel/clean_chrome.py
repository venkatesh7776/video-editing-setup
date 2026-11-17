"""Rebuilds the iPhone Chrome screen recordings with steady browser bars: every frame gets the
real status bar + address bar (top) and toolbar (bottom) from the recording, with the page in between.

Per frame it finds where the browser chrome ends at the top (row ~245 with the address bar
expanded, ~176 collapsed) and whether the bottom toolbar is showing (from row ~1745). It
scales the page region (Lanczos) to fill rows STATUS..1920 at the full 886 px width,
centre-cropping any overflow, and fills the status-bar zone with the page's own top colour.
The status-bar text and Dynamic Island are drawn by the Remotion mockup on top.

  .venv-ai/bin/python -I projects/wedding-reel/clean_chrome.py IN.mp4 OUT.mp4
"""
import subprocess
import sys

import cv2
import numpy as np

W, H = 886, 1920
STATUS = 0  # page fills the whole screen; the mockup floats the status bar + island over it
CHROME = np.array([53, 54, 59], np.int16)  # Safari's dark chrome colour in these recordings


def is_chrome(px):
    return np.abs(px.astype(np.int16) - CHROME).sum() < 18


TOP, BOT = 245, 1745  # Chrome's address-bar (expanded) bottom edge and toolbar top edge
PAGE_H = BOT - TOP


def chrome_strips(src):
    """Real Chrome bars from an expanded-state frame (0.5 s): status bar + address bar, and the toolbar.
    The recording's wide Dynamic Island (with its red recording dot) is painted out; the mockup draws a clean one."""
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", "0.5", "-i", src, "-frames:v", "1", "-pix_fmt", "rgb24", "-f", "rawvideo", "-"], capture_output=True, check=True).stdout
    f = np.frombuffer(raw, np.uint8).reshape(H, W, 3).copy()
    top = f[:TOP].copy()
    top[18:116, 230:645] = CHROME.astype(np.uint8)
    return top, f[BOT:].copy()


def main(src, dst):
    probe = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=r_frame_rate", "-of", "csv=p=0", src], capture_output=True, text=True).stdout.strip()
    dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", src, "-pix_fmt", "rgb24", "-f", "rawvideo", "-"], stdout=subprocess.PIPE)
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", probe, "-i", "-", "-c:v", "libx264", "-crf", "12", "-preset", "slow", "-g", "30", "-keyint_min", "30", "-pix_fmt", "yuv420p", dst], stdin=subprocess.PIPE)
    top_strip, bot_strip = chrome_strips(src)
    n = 0
    stats = {}
    while True:
        buf = dec.stdout.read(W * H * 3)
        if len(buf) < W * H * 3:
            break
        f = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
        edge = f[:, 3:15].mean(1)  # left edge column band: free of text
        top = 10
        while top < 420 and is_chrome(edge[top]):
            top += 1
        bot = H
        low = [y for y in range(1700, 1915, 5) if is_chrome(edge[y])]
        if len(low) >= 8:  # bottom toolbar visible (or sliding in/out): cut from its top edge
            bot = low[0]
            while bot > 1500 and is_chrome(edge[bot - 1]):
                bot -= 1
        page = f[top:bot]
        if page.shape[0] >= PAGE_H:  # collapsed bars: show the page from its top, as with bars expanded
            page = page[:PAGE_H]
        else:
            page = cv2.resize(page, (W, PAGE_H), interpolation=cv2.INTER_LANCZOS4)
        out = np.empty((H, W, 3), np.uint8)
        out[:TOP] = top_strip
        out[TOP:BOT] = page
        out[BOT:] = bot_strip
        enc.stdin.write(out.tobytes())
        key = (top // 10 * 10, bot)
        stats[key] = stats.get(key, 0) + 1
        n += 1
    enc.stdin.close()
    enc.wait()
    dec.wait()
    print(f"{src}: {n} frames; (top chrome end, page bottom) counts: {dict(sorted(stats.items(), key=lambda kv: -kv[1])[:6])}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
