#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# Extract the scroll-scrub frame sequences from assets/hero.mp4.
#
#   desktop: 18 fps (cap 24), 1920 px wide  → public/frames/desktop/frame_0001.webp …
#   mobile:  10 fps (cap 12), 1080 px wide, square centre crop → public/frames/mobile/frame_0001.webp …
#   poster:  first frame (used for reduced-motion & before load)
#   manifest.json tells the site how many frames each set has.
#
# Usage:  bash scripts/extract-frames.sh [path/to/video.mp4]
# Tune weight with QUALITY (default 50), DESKTOP_FPS (18) and MOBILE_FPS (10).
# ──────────────────────────────────────────────────────────────
set -euo pipefail

SRC="${1:-assets/hero.mp4}"
OUT="public/frames"
QUALITY="${QUALITY:-50}"
DESKTOP_FPS="${DESKTOP_FPS:-18}"   # ≤ 24; GSAP scrub smoothing hides the gaps
MOBILE_FPS="${MOBILE_FPS:-10}"     # ≤ 12

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg is not installed."
  echo "  macOS:   brew install ffmpeg"
  echo "  Ubuntu:  sudo apt install ffmpeg"
  echo "  Windows: winget install ffmpeg"
  exit 1
fi
[ -f "$SRC" ] || { echo "Video not found: $SRC"; exit 1; }

rm -rf "$OUT/desktop" "$OUT/mobile"
mkdir -p "$OUT/desktop" "$OUT/mobile"

echo "→ desktop frames ($DESKTOP_FPS fps, 1920w)"
ffmpeg -loglevel error -y -i "$SRC" -vf "fps=$DESKTOP_FPS,scale=1920:-2:flags=lanczos" \
  -c:v libwebp -quality "$QUALITY" -compression_level 6 "$OUT/desktop/frame_%04d.webp"

echo "→ mobile frames ($MOBILE_FPS fps, 1080×1080 centre crop — fills portrait screens without upscaling)"
ffmpeg -loglevel error -y -i "$SRC" -vf "fps=$MOBILE_FPS,crop='min(iw,ih)':'min(iw,ih)',scale=1080:1080:flags=lanczos" \
  -c:v libwebp -quality "$QUALITY" -compression_level 6 "$OUT/mobile/frame_%04d.webp"

echo "→ poster"
cp "$OUT/desktop/frame_0001.webp" "$OUT/poster.webp"

dcount=$(ls "$OUT/desktop" | wc -l | tr -d ' ')
mcount=$(ls "$OUT/mobile" | wc -l | tr -d ' ')
dsize=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "$OUT/desktop/frame_0001.webp")
msize=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "$OUT/mobile/frame_0001.webp")

cat > "$OUT/manifest.json" <<JSON
{
  "desktop": { "count": $dcount, "width": ${dsize%x*}, "height": ${dsize#*x}, "fps": $DESKTOP_FPS, "pattern": "/frames/desktop/frame_%04d.webp" },
  "mobile":  { "count": $mcount, "width": ${msize%x*}, "height": ${msize#*x}, "fps": $MOBILE_FPS, "pattern": "/frames/mobile/frame_%04d.webp" },
  "poster": "/frames/poster.webp"
}
JSON

echo "✓ $dcount desktop + $mcount mobile frames ($(du -sh "$OUT/desktop" | cut -f1) / $(du -sh "$OUT/mobile" | cut -f1))"
