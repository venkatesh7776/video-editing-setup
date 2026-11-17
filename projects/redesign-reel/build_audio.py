"""Final VO: ElevenLabs voice changer (Venkatesh Yarramsetti) takes → tighten pauses → clean, soft master.
Writes work/public/rd/vo0X.wav, 'polished audios v3 - Venkatesh Yarramsetti/', and projects/redesign-reel/vo3.json
(words on the new timeline + chunks [{n0, o0, len}] mapping new → original take time, used for lip-sync)."""
import json, os, re, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
S = os.path.join(ROOT, 'work/redesign/sts')
SRC = {'01': '01 - I turn this outdated landing page iso multili.mp3', '02': '02-tts-0.7.mp3', '03': '03 - Problem s75.mp3', '04': '04 - Solution s75.mp3', '05': '05 - Final transformation s75.mp3'}
NAMES = {'01': '01 - I turn this outdated landing page', '02': "02 - Here's how", '03': '03 - Problem', '04': '04 - Solution', '05': '05 - Final transformation'}
MAX_GAP, KEEP_GAP, LEAD, TAIL = 0.32, 0.16, 0.03, 0.14
MASTER = ','.join(['highpass=f=85', 'lowpass=f=12500', 'afftdn=nr=8:nf=-50', 'equalizer=f=180:t=q:w=1.0:g=1.0', 'equalizer=f=3000:t=q:w=1.3:g=-2', 'deesser=i=0.5:m=0.55:f=0.55:s=o',
                   'highshelf=f=8500:g=-2', 'acompressor=threshold=-24dB:ratio=2:attack=15:release=200:makeup=1', 'loudnorm=I=-19:TP=-3:LRA=8', 'aresample=48000'])
vo = {p['id']: p for p in json.load(open(os.path.join(ROOT, 'projects/redesign-reel/vo.json')))}
out = []
for k in ['01', '02', '03', '04', '05']:
    p = vo[k]; words = p['words']
    if k == '02':  # TTS line: own timing (Whisper on the TTS): Here's 0.00–0.32, how 0.32–0.46
        words = [{'w': "Here's", 's': 0.0, 'e': 0.32}, {'w': 'how.', 's': 0.32, 'e': 0.6}]
    src = os.path.join(S, SRC[k])
    total = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', src], capture_output=True, text=True).stdout)
    end = min(total, words[-1]['e'] + TAIL)
    # cuts: (1) word gaps > MAX_GAP shrink to KEEP_GAP (VibeLevel Screening|section joined); (2) silences measured in the
    # audio itself (word timings can be stretched, e.g. "To" 0–1.36 s) — leading silence removed, inner ones shrunk
    cuts = []
    for i in range(len(words) - 1):
        a, b = words[i], words[i + 1]
        join = k == '04' and a['w'].startswith('Screening')
        lim = 0.02 if join else KEEP_GAP
        if b['s'] - a['e'] > (0.05 if join else MAX_GAP): cuts.append((a['e'] + lim / 2, b['s'] - lim / 2))
    det = subprocess.run(['ffmpeg', '-hide_banner', '-i', src, '-af', 'silencedetect=n=-42dB:d=0.25', '-f', 'null', '-'], capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r'silence_start: ([-0-9.]+)', det)]
    en = [float(x) for x in re.findall(r'silence_end: ([0-9.]+)', det)] + [total]
    for a, b in zip(st, en):
        # user: only the leading silence of 01 (video start) and 04 ("To solve…"); inner pauses stay as in v5
        if a <= 0.3 and k in ('01', '04'): cuts.append((0, max(0, b - LEAD - 0.03)))
    cuts.sort(); merged = []
    for a, b in cuts:
        if b <= a: continue
        if merged and a <= merged[-1][1]: merged[-1] = (merged[-1][0], max(merged[-1][1], b))
        else: merged.append((a, b))
    keep, s0 = [], 0.0
    for a, b in merged:
        if a > s0: keep.append((s0, min(a, end)))
        s0 = max(s0, b)
        if s0 >= end: break
    if s0 < end: keep.append((s0, end))
    keep = [(a, b) for a, b in keep if b - a > 0.03]
    chunks, n = [], 0.0
    for a, b in keep:
        chunks.append({'n0': round(n, 3), 'o0': round(a, 3), 'len': round(b - a, 3)}); n += b - a
    def remap(t):  # take time → new time (inside a cut → snaps to the next kept audio)
        for c in chunks:
            if t <= c['o0'] + c['len']: return round(c['n0'] + max(0.0, t - c['o0']), 3)
        return round(n, 3)
    # cut + crossfade the islands
    tmp = os.path.join(S, f'v3-{k}.wav')
    flt = ';'.join(f"[0:a]atrim={a:.3f}:{b:.3f},asetpts=N/SR/TB,afade=t=in:d=0.012,afade=t=out:st={b - a - 0.015:.3f}:d=0.015[c{i}]" for i, (a, b) in enumerate(keep))
    flt += ';' + ''.join(f'[c{i}]' for i in range(len(keep))) + f'concat=n={len(keep)}:v=0:a=1,{MASTER}[o]'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-filter_complex', flt, '-map', '[o]', '-ac', '1', '-c:a', 'pcm_s24le', tmp], check=True)
    for dst in (os.path.join(ROOT, 'work/public/rd', f'vo{k}.wav'), os.path.join(ROOT, 'polished audios v3 - Venkatesh Yarramsetti', NAMES[k] + '.wav')):
        subprocess.run(['cp', tmp, dst], check=True)
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', tmp], capture_output=True, text=True).stdout)
    out.append({**p, 'duration': round(dur, 3), 'chunks': chunks, 'words': [{'w': w['w'], 's': remap(w['s']), 'e': remap(w['e'])} for w in words]})
    print(k, f"{p['duration']:.2f}s → {dur:.2f}s", f'{len(chunks)} chunks')
json.dump(out, open(os.path.join(ROOT, 'projects/redesign-reel/vo3.json'), 'w'), indent=1)
