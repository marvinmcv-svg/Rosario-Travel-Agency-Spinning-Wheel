"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/data";
import { fmtMonth } from "./ui";

/* Single-series bar chart: confirmed + deposit revenue by departure month.
   One hue (copper), no legend (the title names the series), 4px rounded
   data-ends on the baseline, 2px gaps, recessive grid, hover tooltip. */
export default function RevenueChart({ data }: { data: { month: string; value: number; count: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 720;
  const H = 240;
  const pad = { l: 56, r: 8, t: 12, b: 28 };
  const max = Math.max(1, ...data.map((d) => d.value));
  const nice = Math.ceil(max / 10000) * 10000 || 10000;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * nice);
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const band = iw / Math.max(1, data.length);
  const bw = Math.min(44, band - 2);
  const y = (v: number) => pad.t + ih - (v / nice) * ih;

  if (!data.length) return <p className="py-16 text-center text-sm text-salt/45">No confirmed revenue yet.</p>;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Revenue by departure month">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="rgb(243 239 231 / 0.08)" />
            <text x={pad.l - 10} y={y(t)} textAnchor="end" dominantBaseline="middle" fontSize="11" fill="rgb(243 239 231 / 0.45)">
              {t >= 1000 ? `$${t / 1000}k` : `$${t}`}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = pad.l + i * band + (band - bw) / 2;
          const h = Math.max(0, pad.t + ih - y(d.value));
          const r = Math.min(4, h);
          const top = pad.t + ih - h;
          return (
            <g key={d.month} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              {/* generous hit target */}
              <rect x={pad.l + i * band} y={pad.t} width={band} height={ih} fill="transparent" />
              <path
                d={`M ${x} ${pad.t + ih} V ${top + r} Q ${x} ${top} ${x + r} ${top} H ${x + bw - r} Q ${x + bw} ${top} ${x + bw} ${top + r} V ${pad.t + ih} Z`}
                fill="#c4703f"
                opacity={hover === null || hover === i ? 1 : 0.45}
                style={{ transition: "opacity .2s" }}
              />
              <text x={x + bw / 2} y={H - 8} textAnchor="middle" fontSize="11" fill="rgb(243 239 231 / 0.45)">
                {fmtMonth(d.month)}
              </text>
            </g>
          );
        })}
        <line x1={pad.l} x2={W - pad.r} y1={pad.t + ih} y2={pad.t + ih} stroke="rgb(243 239 231 / 0.2)" />
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg border border-line bg-ink px-3 py-2 text-xs shadow-xl"
          style={{ left: `${((pad.l + hover * band + band / 2) / W) * 100}%`, top: `${(y(data[hover].value) / H) * 100}%` }}
        >
          <p className="text-salt/55">{fmtMonth(data[hover].month)} departures</p>
          <p className="mt-0.5 font-medium text-salt">{formatPrice(data[hover].value)}</p>
          <p className="text-salt/55">{data[hover].count} booking{data[hover].count === 1 ? "" : "s"}</p>
        </div>
      )}
    </div>
  );
}
