"""v4 VO: ElevenLabs TTS of the exact script in the "Venkatesh Yarramsetti" voice → tighten pauses → light master.
Writes work/public/rd/vo0X.wav, 'polished audios v4 - Venkatesh Yarramsetti TTS/', projects/redesign-reel/vo4.json:
words on the final timeline + chunks [{n0, o0, rate}] mapping TTS phrase → camera time of the same phrase (lip-sync),
derived from vo3.json + sync.json (where each word sits in the camera takes).
  .venv/bin/python projects/redesign-reel/build_tts.py [--gen]     (--gen calls the API; otherwise reuses work/redesign/tts)"""
import base64, json, os, re, subprocess, sys, urllib.request
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
T = os.path.join(ROOT, 'work/redesign/tts'); os.makedirs(T, exist_ok=True)
VOICE = 'a6JWJ2mIjdrEytb1UvwK'  # Venkatesh Yarramsetti
SCRIPT = {
    '01': "I turned this outdated SaaS landing page into a modern, conversion-focused experience.",
    '02': "Here's how.",
    '03': "The first problem? The hero section was overloaded with information, making the product's core value proposition difficult to understand. The second problem? Lengthy problem sections made the content difficult to scan and understand. And finally, the features section didn't have proper structure or visual separation.",
    '04': "To solve these problems, here's what I changed. First, I simplified the hero with clearer messaging and a product demo video. Next, I transformed lengthy explanations into three simple, visually engaging problem cards. Finally, I introduced a dedicated VibeLevel Screening section with clearly structured product features.",
    '05': "And here's the final transformation. This is the before, and this is the after. That's how I turn SaaS websites into conversion-focused experiences.",
}
SAY = lambda s: s.replace('SaaS', 'sass')  # pronunciation only; captions keep the script spelling
NAMES = {'01': '01 - I turned this outdated landing page', '02': "02 - Here's how", '03': '03 - Problem', '04': '04 - Solution', '05': '05 - Final transformation'}
IDS = list(SCRIPT)
MAX_GAP, KEEP_GAP, LEAD, TAIL = 0.26, 0.14, 0.02, 0.12
MASTER = ','.join(['highpass=f=75', 'lowpass=f=14000', 'equalizer=f=3200:t=q:w=1.2:g=-1.5', 'deesser=i=0.4:m=0.5:f=0.55:s=o',
                   'acompressor=threshold=-22dB:ratio=1.8:attack=20:release=250:makeup=1', 'loudnorm=I=-19:TP=-3:LRA=8', 'aresample=48000'])

def key():
    d = json.load(open(os.path.expanduser('~/.claude.json')))
    return d['mcpServers']['elevenlabs']['env']['ELEVENLABS_API_KEY']

def gen(k):
    i = IDS.index(k)
    body = {'text': SAY(SCRIPT[k]), 'model_id': 'eleven_multilingual_v2',
            'voice_settings': {'stability': 0.6, 'similarity_boost': 0.85, 'style': 0.15, 'use_speaker_boost': True, 'speed': 1.04},
            'previous_text': SAY(SCRIPT[IDS[i - 1]]) if i and k != '03' else None, 'next_text': SAY(SCRIPT[IDS[i + 1]]) if i + 1 < len(IDS) else None}
    req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE}/with-timestamps?output_format=mp3_44100_128',
                                 data=json.dumps(body).encode(), headers={'xi-api-key': key(), 'Content-Type': 'application/json'})
    r = json.load(urllib.request.urlopen(req, timeout=180))
    open(os.path.join(T, f'{k}.mp3'), 'wb').write(base64.b64decode(r['audio_base64']))
    json.dump(r['alignment'], open(os.path.join(T, f'{k}.align.json'), 'w'))
    print('generated', k)

def words_from_align(k):
    a = json.load(open(os.path.join(T, f'{k}.align.json')))
    ch, s, e = a['characters'], a['character_start_times_seconds'], a['character_end_times_seconds']
    out, cur = [], None
    for c, cs, ce in zip(ch, s, e):
        if c.isspace():
            if cur: out.append(cur); cur = None
            continue
        if cur is None: cur = {'s': cs, 'e': ce, 'w': ''}
        cur['w'] += c; cur['e'] = ce
    if cur: out.append(cur)
    script = SCRIPT[k].split()
    assert len(script) == len(out), (k, len(script), len(out))
    return [{'w': w, 's': o['s'], 'e': o['e']} for w, o in zip(script, out)]

# camera time of every script word (from the v3 voice-changer edit: new → take → camera)
vo3 = {p['id']: p for p in json.load(open(os.path.join(ROOT, 'projects/redesign-reel/vo3.json')))}
sync = json.load(open(os.path.join(ROOT, 'projects/redesign-reel/sync.json')))
def cam_words(k):
    p = vo3[k]
    if k not in sync and k != '02': return [], []
    if k == '02': return [w['s'] + 7.88 for w in p['words']], [w['e'] + 7.88 for w in p['words']]
    segs = [x for x in sync[k]['segs'] if x.get('n', 2) >= 2]
    def off(o):
        if not segs: return sync[k]['offset']
        r = segs[0]['offset']
        for x in segs:
            if x['from'] <= o + 0.05: r = x['offset']
        return r
    def cam(t):
        c = [c for c in p['chunks'] if c['n0'] <= t + 1e-6][-1] if p['chunks'] else {'n0': 0, 'o0': 0}
        o = c['o0'] + t - c['n0']
        return o + off(o)
    return [cam(w['s']) for w in p['words']], [cam(w['e']) for w in p['words']]

if '--gen' in sys.argv:
    for k in (sys.argv[sys.argv.index('--gen') + 1].split(',') if len(sys.argv) > sys.argv.index('--gen') + 1 else IDS): gen(k)
out = []
for k in IDS:
    words = words_from_align(k)
    keep, s0 = [], max(0, words[0]['s'] - LEAD)
    for i in range(len(words) - 1):
        a, b = words[i], words[i + 1]
        if b['s'] - a['e'] > MAX_GAP:
            keep.append((s0, a['e'] + KEEP_GAP / 2)); s0 = b['s'] - KEEP_GAP / 2
    keep.append((s0, words[-1]['e'] + TAIL))
    segs, n = [], 0.0
    for a, b in keep: segs.append((n, a, b)); n += b - a
    def remap(t):
        for n0, a, b in segs:
            if a - 0.3 <= t <= b + 0.3: return round(n0 + min(max(t - a, 0), b - a), 3)
        return round(t, 3)
    tmp = os.path.join(T, f'{k}.wav')
    flt = ';'.join(f"[0:a]atrim={a:.3f}:{b:.3f},asetpts=N/SR/TB,afade=t=in:d=0.01,afade=t=out:st={b - a - 0.012:.3f}:d=0.012[c{i}]" for i, (_, a, b) in enumerate(segs))
    flt += ';' + ''.join(f'[c{i}]' for i in range(len(segs))) + f'concat=n={len(segs)}:v=0:a=1,{MASTER}[o]'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(T, f'{k}.mp3'), '-filter_complex', flt, '-map', '[o]', '-ac', '1', '-c:a', 'pcm_s24le', tmp], check=True)
    dst = os.path.join(ROOT, 'polished audios v4 - Venkatesh Yarramsetti TTS'); os.makedirs(dst, exist_ok=True)
    for d in (os.path.join(ROOT, 'work/public/rd', f'vo{k}.wav'), os.path.join(dst, NAMES[k] + '.wav')):
        subprocess.run(['cp', tmp, d], check=True)
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', tmp], capture_output=True, text=True).stdout)
    nw = [{'w': w['w'], 's': remap(w['s']), 'e': remap(w['e'])} for w in words]
    # lip-sync chunks: one per phrase (split at , . ?), camera phrase stretched onto the TTS phrase
    cs, ce = cam_words(k)
    m = len(cs) == len(nw)
    chunks, i0 = [], 0
    for i, w in enumerate(nw):
        if re.search(r'[,.?]$', w['w']) or i == len(nw) - 1:
            if m:
                ts, te = nw[i0]['s'], nw[i]['e']
                rate = max(0.7, min(1.4, (ce[i] - cs[i0]) / max(0.1, te - ts)))
                chunks.append({'n0': round(ts, 3), 'o0': round(cs[i0], 3), 'rate': round(rate, 3)})
            i0 = i + 1
    if not m: print('  ! word count differs from camera take; using one chunk', k)
    if chunks: chunks[0]['o0'] = round(chunks[0]['o0'] - chunks[0]['n0'] * chunks[0]['rate'], 3); chunks[0]['n0'] = 0
    out.append({'id': k, 'text': SCRIPT[k], 'duration': round(dur, 3), 'chunks': chunks, 'words': nw})
    print(k, f'{dur:.2f}s', f'{len(segs)} pieces', f'{len(chunks)} sync chunks', [c['rate'] for c in chunks])
json.dump(out, open(os.path.join(ROOT, 'projects/redesign-reel/vo4.json'), 'w'), indent=1)
