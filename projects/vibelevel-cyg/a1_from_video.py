"""The candidate's answer comes from the Veo interview clip itself (lip-synced): extract its audio → work/cyg/vo-int/a1.mp3 + Whisper words."""
import json, os, subprocess, numpy as np
from faster_whisper import WhisperModel
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
src = os.path.join(ROOT, 'work/cyg/omni3/k6.mp4'); out = os.path.join(ROOT, 'work/cyg/vo-int/a1')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-vn', '-af', 'highpass=f=80', '-c:a', 'libmp3lame', '-q:a', '2', out + '.mp3'], check=True)
a = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', out + '.mp3', '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True).stdout, np.float32)
m = WhisperModel('small.en', compute_type='int8', download_root=os.path.join(ROOT, '.cache/whisper-models'))
ws = [{'w': w.word.strip(), 's': round(w.start, 3), 'e': round(w.end, 3)} for s in m.transcribe(a, language='en', word_timestamps=True)[0] for w in s.words]
json.dump({'duration': round(len(a) / 16000, 3), 'words': ws}, open(out + '.json', 'w'))
print(len(a) / 16000, ' '.join(w['w'] for w in ws))
