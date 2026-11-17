#!/usr/bin/env bash
# Cuts scene-ready crops from the @2x report captures and pixelates personal identifiers
# (candidate name, assessment/session IDs, Video Q&A webcam). Coordinates are @2x pixels.
# SRC/OUT env vars pick the capture folder and output folder (defaults: report → report-scenes).
set -euo pipefail
cd "$(dirname "$0")/../../assets/images/vibelevel-screening/research/${SRC:-report}"
OUT=../${OUT:-report-scenes}; mkdir -p "$OUT"
# Header identifiers (identical on every tab): name under the title, and the ID row.
NAME="896:392:150:52"; IDS="1030:196:1280:46"
# crop <src> <out> <y> <h> [blur w:h:x:y in source coords]...
crop() {
  local src=$1 out=$2 y=$3 h=$4; shift 4
  local f="[0]null[base]" last=base i=0
  for r in "$@"; do
    IFS=: read -r bx by bw bh <<<"$r"
    f+=";[0]crop=$bw:$bh:$bx:$by,scale=max(2\,iw/20):max(2\,ih/20),gblur=sigma=1,scale=$bw:$bh:flags=bilinear[b$i];[$last][b$i]overlay=$bx:$by[o$i]"; last=o$i; i=$((i+1))
  done
  f+=";[$last]crop=2240:$h:800:$y"
  ffmpeg -v error -y -i "$src" -filter_complex "$f" -frames:v 1 "$OUT/$out"
  echo "$out"
}
crop report-summary-full.png            scene-07-report-overview.png          120 1800 "$NAME" "$IDS"
crop report-summary-full.png            scene-07-skill-scores.png             830  730
crop report-core-skills-full.png        scene-06-core-skills.png              830 1410
crop report-working-with-ai-full.png    scene-06-working-with-ai.png          830 1150
crop report-human-contribution-full.png scene-07-human-contribution.png       830  570
crop report-video-qa-full.png           scene-07-video-qa.png                 830 1090 "866:1354:440:332"
crop report-code-review-full.png        scene-07-code-review.png              830 1570
crop report-interview-guide-full.png    scene-07-interview-guide.png          830 1410
crop report-interview-guide-full.png    scene-07-interview-guide-probes.png  3600  720
crop report-appendix-full.png           scene-07-four-aspects-definition.png  830 1050
