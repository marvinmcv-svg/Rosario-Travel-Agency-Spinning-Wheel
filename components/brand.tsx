/* ──────────────────────────────────────────────────────────────
   Rosario brand.
   The mark is the Grupo Rosario key: four interlocking Andean meanders
   in lake blue, altiplano sage and ochre — the same mark Hoteles
   Rosario uses on its hotels (gruporosario.com). It is drawn here as
   plain rectangles so it stays razor-sharp at any size and each stroke
   can be animated on its own (see Preloader).
   ────────────────────────────────────────────────────────────── */

export const BRAND = {
  blue: "#6a86a3",
  sage: "#989f7e",
  ochre: "#c77922",
  ink: "#222220",
} as const;

type R = [x: number, y: number, w: number, h: number];
type Piece = { color: string; rects: R[] };

/** The mark's four quadrants, each a blue frame plus a coloured meander.
 *  Order inside each list follows the line as if drawn with one thread. */
export const MARK_QUADRANTS: { id: "tl" | "tr" | "bl" | "br"; pieces: Piece[] }[] = [
  {
    id: "tl",
    pieces: [
      { color: BRAND.blue, rects: [[0, 0, 13, 66], [0, 0, 56, 10], [43, 0, 13, 48]] },
      { color: BRAND.ochre, rects: [[66, 0, 12, 66], [22, 56, 56, 10], [22, 18, 12, 48]] },
    ],
  },
  {
    id: "tr",
    pieces: [
      { color: BRAND.sage, rects: [[85, 0, 13, 66], [85, 56, 56, 10], [129, 18, 12, 48]] },
      { color: BRAND.blue, rects: [[107, 0, 13, 48], [107, 0, 56, 10], [150, 0, 13, 66]] },
    ],
  },
  {
    id: "bl",
    pieces: [
      { color: BRAND.blue, rects: [[0, 74, 13, 66], [0, 130, 56, 10], [43, 92, 13, 48]] },
      { color: BRAND.sage, rects: [[66, 74, 12, 66], [22, 74, 56, 10], [22, 74, 12, 48]] },
    ],
  },
  {
    id: "br",
    pieces: [
      { color: BRAND.ochre, rects: [[85, 74, 13, 66], [85, 74, 56, 10], [129, 74, 12, 48]] },
      { color: BRAND.blue, rects: [[107, 92, 13, 48], [107, 130, 56, 10], [150, 74, 13, 66]] },
    ],
  },
];

export const MARK_W = 163;
export const MARK_H = 140;

/** The Grupo Rosario mark. `animated` adds data attributes the preloader drives. */
export function RosarioMark({ className = "", title, animated = false }: { className?: string; title?: string; animated?: boolean }) {
  return (
    <svg
      viewBox={`0 0 ${MARK_W} ${MARK_H}`}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      shapeRendering="crispEdges"
    >
      {MARK_QUADRANTS.map((q) => (
        <g key={q.id} data-mark-q={animated ? q.id : undefined}>
          {q.pieces.map((p, pi) =>
            p.rects.map(([x, y, w, h], ri) => (
              <rect
                key={`${pi}-${ri}`}
                x={x}
                y={y}
                width={w}
                height={h}
                fill={p.color}
                data-mark-r={animated ? (w >= h ? "h" : "v") : undefined}
              />
            )),
          )}
        </g>
      ))}
    </svg>
  );
}

/**
 * The Rosario Travels lockup, built like the Hoteles Rosario signature:
 * the mark, a small letter-spaced line above a large "ROSARIO" and a
 * lake-blue rule. Size it with a font-size class.
 */
export function Wordmark({ className = "", sub = "Travels", tone = "light" }: { className?: string; sub?: string; tone?: "light" | "dark" }) {
  return (
    <span className={`inline-flex items-center gap-[0.32em] whitespace-nowrap leading-none ${className}`}>
      <RosarioMark className="h-[1.18em] w-auto shrink-0" />
      <span className={`flex flex-col font-brand ${tone === "dark" ? "text-[#222220]" : ""}`}>
        <span className="pl-[0.04em] text-[0.36em] font-normal uppercase tracking-[0.2em] opacity-90">{sub}</span>
        <span className="-mt-[0.02em] text-[0.82em] font-light uppercase tracking-[0.04em]">Rosario</span>
        <span className="mt-[0.06em] h-[0.06em] w-full rounded-full" style={{ background: BRAND.blue }} />
      </span>
    </span>
  );
}
