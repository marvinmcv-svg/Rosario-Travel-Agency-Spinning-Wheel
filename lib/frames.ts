"use client";

/* ──────────────────────────────────────────────────────────────
   Frame-sequence loader for the scroll-scrubbed film.
   • Reads /frames/manifest.json (written by scripts/extract-frames.sh)
   • Picks the desktop (1920w, 24fps) or mobile (1080w, 12fps) set
   • Decodes every frame up-front and reports progress, so the
     Preloader can show a real percentage.
   ────────────────────────────────────────────────────────────── */

export type FrameSet = { count: number; width: number; height: number; fps: number; pattern: string };
export type FrameManifest = { desktop: FrameSet; mobile: FrameSet; poster: string };

type State = {
  manifest: FrameManifest | null;
  set: FrameSet | null;
  images: (HTMLImageElement | null)[];
  loaded: number;
  done: boolean;
};

const state: State = { manifest: null, set: null, images: [], loaded: 0, done: false };
const listeners = new Set<(p: number) => void>();
let started: Promise<void> | null = null;

const frameUrl = (set: FrameSet, i: number) => set.pattern.replace("%04d", String(i + 1).padStart(4, "0"));

export function frameProgress() {
  return state.set ? state.loaded / state.set.count : 0;
}

export function onFrameProgress(fn: (p: number) => void) {
  listeners.add(fn);
  fn(frameProgress());
  return () => listeners.delete(fn);
}

export function getFrames() {
  return state;
}

/** Nearest already-decoded frame — lets scrubbing work even mid-load. */
export function nearestFrame(i: number): HTMLImageElement | null {
  const imgs = state.images;
  if (imgs[i]) return imgs[i];
  for (let d = 1; d < imgs.length; d++) {
    if (imgs[i - d]) return imgs[i - d];
    if (imgs[i + d]) return imgs[i + d];
  }
  return null;
}

export function loadFrames(): Promise<void> {
  if (started) return started;
  started = (async () => {
    try {
      const res = await fetch("/frames/manifest.json", { cache: "force-cache" });
      const manifest = (await res.json()) as FrameManifest;
      const mobile = window.matchMedia("(max-width: 768px)").matches;
      const set = mobile ? manifest.mobile : manifest.desktop;
      state.manifest = manifest;
      state.set = set;
      state.images = new Array(set.count).fill(null);

      // Load in an interleaved order (every 8th frame first, then fill gaps)
      // so a coarse version of the whole film is scrubbable early.
      const order: number[] = [];
      for (const step of [8, 4, 2, 1]) for (let i = 0; i < set.count; i += step) if (!order.includes(i)) order.push(i);

      let cursor = 0;
      const worker = async () => {
        while (cursor < order.length) {
          const i = order[cursor++];
          const img = new Image();
          img.decoding = "async";
          img.src = frameUrl(set, i);
          try {
            await img.decode();
            state.images[i] = img;
          } catch {
            /* skip a broken frame; nearestFrame() covers the gap */
          }
          state.loaded++;
          const p = state.loaded / set.count;
          listeners.forEach((l) => l(p));
        }
      };
      await Promise.all(Array.from({ length: 6 }, worker));
    } catch {
      // No manifest (e.g. frames not generated yet) — report complete so the site still opens.
      listeners.forEach((l) => l(1));
    } finally {
      state.done = true;
    }
  })();
  return started;
}
