#!/usr/bin/env bash
# Convert source photographs (assets/source/*.jpg) into web-ready WebP
# at 2560 px wide in public/images/. Run after adding or replacing a photo.
set -euo pipefail
SRC="${1:-assets/source}"
mkdir -p public/images
for f in "$SRC"/*.jpg "$SRC"/*.jpeg "$SRC"/*.png; do
  [ -e "$f" ] || continue
  name=$(basename "${f%.*}")
  ffmpeg -loglevel error -y -i "$f" -vf "scale='min(2560,iw)':-2:flags=lanczos" -c:v libwebp -quality 80 "public/images/$name.webp"
  echo "✓ $name.webp"
done
