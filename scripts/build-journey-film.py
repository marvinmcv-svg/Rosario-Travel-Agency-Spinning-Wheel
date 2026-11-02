#!/usr/bin/env python3
"""
Build the Andean journey film (assets/hero.mp4) from still photographs.

This is a stand-in until you have real footage (a drone fly-through is
ideal). It renders a continuous camera move across the route —
Uyuni mirror → Uyuni Land Cruiser → Lake Titicaca → Machu Picchu — with
sub-pixel pans/zooms (no ffmpeg zoompan jitter) and soft cross-dissolves,
then encodes it with ffmpeg.

    python3 scripts/build-journey-film.py            # uses public/images/*.webp
    bash scripts/extract-frames.sh                   # → public/frames/

Requires: Python 3 + Pillow, ffmpeg.
"""
import os
import shutil
import subprocess
import sys
import tempfile

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMAGES = os.path.join(ROOT, "public", "images")
OUT = os.path.join(ROOT, "assets", "hero.mp4")
W, H, FPS = 1920, 1080, 30

# Each shot: image, duration (s), camera start → end as (centre_x, centre_y, zoom)
# centre in 0..1 of the image, zoom 1 = the image just covers the frame.
SHOTS = [
    ("uyuni-mirror.webp", 3.4, (0.30, 0.50, 1.00), (0.62, 0.50, 1.08)),   # drift across the mirror
    ("uyuni-cruiser.webp", 3.0, (0.50, 0.50, 1.02), (0.47, 0.50, 1.22)),  # push toward the Land Cruiser
    ("titicaca-sunset.webp", 3.4, (0.42, 0.52, 1.18), (0.58, 0.50, 1.04)),  # glide over the lake
    ("machu-picchu.webp", 3.8, (0.50, 0.46, 1.30), (0.50, 0.50, 1.00)),   # pull back to reveal the citadel
]
FALLBACKS = {"titicaca-sunset.webp": "titicaca-uros.webp"}
XFADE = 0.9  # seconds of cross-dissolve between shots


def ease(t: float) -> float:
    """Ease-in-out (cubic) so every move starts and settles like a real camera."""
    return 4 * t * t * t if t < 0.5 else 1 - pow(-2 * t + 2, 3) / 2


def load(name: str) -> Image.Image:
    path = os.path.join(IMAGES, name)
    if not os.path.exists(path) and name in FALLBACKS:
        path = os.path.join(IMAGES, FALLBACKS[name])
    # Keep the full source resolution: the float crop box in render() samples
    # sub-pixel accurately, so slow pans stay smooth without upscaling.
    return Image.open(path).convert("RGB")


def render(img: Image.Image, cx: float, cy: float, zoom: float) -> Image.Image:
    cover = max(W / img.width, H / img.height)  # scale at which the image just covers the frame
    s = cover * zoom
    cw, ch = W / s, H / s  # crop size in source pixels
    x0 = min(max(cx * img.width - cw / 2, 0), img.width - cw)
    y0 = min(max(cy * img.height - ch / 2, 0), img.height - ch)
    # Pillow's resize with a float box samples sub-pixel accurately — smooth motion.
    return img.resize((W, H), Image.BICUBIC, box=(x0, y0, x0 + cw, y0 + ch))


def main() -> None:
    if not shutil.which("ffmpeg"):
        sys.exit("ffmpeg is required (macOS: brew install ffmpeg · Ubuntu: sudo apt install ffmpeg · Windows: winget install ffmpeg)")
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    tmp = tempfile.mkdtemp(prefix="rosario-film-")
    shots = [(load(n), d, a, b) for n, d, a, b in SHOTS]

    # Timeline: shots overlap by XFADE seconds.
    starts, t = [], 0.0
    for _, d, _, _ in shots:
        starts.append(t)
        t += d - XFADE
    total = t + XFADE
    n_frames = round(total * FPS)

    def frame_of(i: int, tt: float) -> Image.Image:
        img, d, a, b = shots[i]
        p = ease(min(max((tt - starts[i]) / d, 0), 1))
        return render(img, *(a[k] + (b[k] - a[k]) * p for k in range(3)))

    for f in range(n_frames):
        tt = f / FPS
        active = [i for i in range(len(shots)) if starts[i] <= tt < starts[i] + shots[i][1]]
        frame = frame_of(active[0], tt)
        if len(active) > 1:  # inside a dissolve
            i = active[1]
            alpha = ease(min((tt - starts[i]) / XFADE, 1))
            frame = Image.blend(frame, frame_of(i, tt), alpha)
        frame.save(os.path.join(tmp, f"f_{f:05d}.jpg"), quality=95)
        if f % 30 == 0:
            print(f"  rendered {f}/{n_frames}", flush=True)

    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", os.path.join(tmp, "f_%05d.jpg"),
         "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p", "-movflags", "+faststart", OUT],
        check=True,
    )
    shutil.rmtree(tmp)
    print(f"✓ {OUT}  ({total:.1f}s, {n_frames} frames @ {FPS}fps)")


if __name__ == "__main__":
    main()
