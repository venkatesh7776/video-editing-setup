#!/bin/bash
# Parallel, resumable download of one large file: parallel_download.sh URL OUT [CONNECTIONS]
set -euo pipefail
export URL="$1" OUT="$2" CHUNK=$((64*1024*1024))
N="${3:-16}"
export SIZE=$(curl -sIL "$URL" | grep -i '^content-length' | tail -1 | tr -dc '0-9')
export PARTS="$OUT.parts"; mkdir -p "$PARTS"
COUNT=$(( (SIZE + CHUNK - 1) / CHUNK ))
echo "size $SIZE bytes, $COUNT chunks, $N connections"

fetch_chunk() {
	local i=$1 s e f want
	s=$((i * CHUNK)); e=$((s + CHUNK - 1)); [ $e -ge $SIZE ] && e=$((SIZE - 1))
	f="$PARTS/$(printf %05d $i)"; want=$((e - s + 1))
	for try in 1 2 3 4 5; do
		[ -f "$f" ] && [ "$(stat -f%z "$f")" -eq $want ] && return 0
		curl -sL --max-time 900 -r $s-$e -o "$f" "$URL" || true
	done
	[ "$(stat -f%z "$f")" -eq $want ] || { echo "chunk $i failed"; return 1; }
}
export -f fetch_chunk
seq 0 $((COUNT - 1)) | xargs -P "$N" -n 1 bash -c 'fetch_chunk "$0"'
cat "$PARTS"/* > "$OUT"
[ "$(stat -f%z "$OUT")" -eq $SIZE ] && rm -rf "$PARTS" && echo "done $OUT"
