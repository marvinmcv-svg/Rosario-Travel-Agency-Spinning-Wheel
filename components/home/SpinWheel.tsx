"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { actions, useDB } from "@/lib/store";
import type { WheelPrize } from "@/lib/data";
import { FadeUp, SplitReveal } from "../motion";

const SPUN_KEY = "rosario.wheel.spun";
const R = 200; // wheel radius in SVG units

/* Weighted pick: odds come from the admin portal, segment size stays equal. */
function pick(prizes: WheelPrize[]) {
  const total = prizes.reduce((s, p) => s + Math.max(0, p.weight), 0);
  let r = Math.random() * total;
  for (let i = 0; i < prizes.length; i++) {
    r -= Math.max(0, prizes[i].weight);
    if (r <= 0) return i;
  }
  return 0;
}

const polar = (deg: number, r: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [R + r * Math.cos(a), R + r * Math.sin(a)];
};

/* The Chakana — the stepped Andean cross — at the hub of the wheel. */
function Chakana() {
  const s = 7;
  const pts = [
    [-1, -3], [1, -3], [1, -2], [2, -2], [2, -1], [3, -1], [3, 1], [2, 1], [2, 2], [1, 2], [1, 3], [-1, 3],
    [-1, 2], [-2, 2], [-2, 1], [-3, 1], [-3, -1], [-2, -1], [-2, -2], [-1, -2],
  ].map(([x, y]) => `${R + x * s},${R + y * s}`).join(" ");
  return (
    <g>
      <circle cx={R} cy={R} r={36} fill="#0a0b0c" stroke="#cfa968" strokeWidth="1.5" />
      <polygon points={pts} fill="none" stroke="#cfa968" strokeWidth="1.6" />
      <circle cx={R} cy={R} r={5} fill="#cfa968" />
    </g>
  );
}

export default function SpinWheel() {
  const prizes = useDB((db) => db.wheelPrizes);
  const enabled = useDB((db) => db.settings.wheelEnabled);
  const wheel = useRef<SVGGElement>(null);
  const pointer = useRef<SVGSVGElement>(null);
  const rotation = useRef(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<WheelPrize | null>(null);
  const [alreadySpun, setAlreadySpun] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      setAlreadySpun(Boolean(localStorage.getItem(SPUN_KEY)));
    } catch {}
  }, []);

  const seg = 360 / prizes.length;

  const spin = () => {
    if (spinning || alreadySpun || !wheel.current) return;
    const i = pick(prizes);
    // Land the centre of segment i under the top pointer, with a little human jitter.
    const jitter = (Math.random() - 0.5) * seg * 0.6;
    const targetMod = 360 - (i * seg + seg / 2) + jitter;
    const current = rotation.current % 360;
    const turns = prefersReducedMotion() ? 1 : 7;
    const delta = turns * 360 + ((targetMod - current + 360) % 360);
    const end = rotation.current + delta;
    setSpinning(true);
    setResult(null);

    let lastSeg = Math.floor(rotation.current / seg);
    const state = { r: rotation.current };
    gsap.to(state, {
      r: end,
      duration: prefersReducedMotion() ? 0.8 : 6,
      ease: "power4.out",
      onUpdate: () => {
        wheel.current?.setAttribute("transform", `rotate(${state.r} ${R} ${R})`);
        // Pointer flicks each time a segment edge passes it.
        const s = Math.floor(state.r / seg);
        if (s !== lastSeg && pointer.current) {
          lastSeg = s;
          gsap.fromTo(pointer.current, { rotate: -14 }, { rotate: 0, duration: 0.25, ease: "power2.out", transformOrigin: "50% 20%" });
        }
      },
      onComplete: () => {
        rotation.current = end;
        setSpinning(false);
        setResult(prizes[i]);
        try {
          localStorage.setItem(SPUN_KEY, prizes[i].id);
        } catch {}
      },
    });
  };

  const claim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!result || !email.includes("@")) return;
    const lead = actions.createLead(email.trim(), result);
    setCode(lead.code);
  };

  useEffect(() => {
    if (!result) return;
    gsap.fromTo("[data-prize-card]", { autoAlpha: 0, y: 30, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.9 });
  }, [result]);

  if (!enabled) return null;

  return (
    <section id="spin" className="relative overflow-hidden bg-ink-2 px-5 py-32 md:px-10 md:py-40">
      <div className="pointer-events-none absolute -right-40 top-1/2 h-[700px] w-[700px] -translate-y-1/2 rounded-full bg-copper/10 blur-[140px]" />
      <div className="relative mx-auto grid max-w-[1600px] items-center gap-16 lg:grid-cols-2">
        <div>
          <p className="eyebrow mb-5 text-copper">Spin the Andes</p>
          <SplitReveal className="font-display text-[clamp(2.6rem,5.5vw,5.5rem)] leading-[0.95] tracking-[-0.03em]">
            Let the mountains <em className="text-gold">choose a gift.</em>
          </SplitReveal>
          <FadeUp className="mt-8 max-w-lg text-lg leading-relaxed text-salt/70">
            One spin per traveller. Every segment is a real privilege on your next journey — from a night in a salt hotel to first-entry permits at Machu Picchu.
          </FadeUp>

          <div className="mt-10 min-h-[220px]">
            {!result && (
              <FadeUp>
                <button
                  onClick={spin}
                  disabled={spinning || alreadySpun}
                  className="rounded-full bg-copper px-9 py-4 text-sm font-medium text-ink transition hover:bg-copper-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {spinning ? "The wheel is turning…" : alreadySpun ? "You've already spun — check your inbox" : "Spin the wheel"}
                </button>
                <p className="mt-4 text-xs text-salt/40">Codes are valid for 12 months on journeys departing in 2027.</p>
              </FadeUp>
            )}
            {result && (
              <div data-prize-card className="max-w-md rounded-2xl border border-line bg-ink p-7">
                <p className="eyebrow text-gold">You won</p>
                <p className="mt-2 font-display text-4xl">{result.label}</p>
                <p className="mt-2 text-sm text-salt/65">{result.detail}</p>
                {!code ? (
                  <form onSubmit={claim} className="mt-6 flex gap-3">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email to claim it"
                      className="field flex-1"
                      aria-label="Email address"
                    />
                    <button className="shrink-0 rounded-full bg-salt px-5 text-sm font-medium text-ink transition hover:bg-copper">Claim</button>
                  </form>
                ) : (
                  <div className="mt-6 flex items-center justify-between rounded-xl border border-gold/40 bg-gold/5 px-5 py-4">
                    <span className="font-mono text-lg tracking-widest text-gold">{code}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(code);
                        setCopied(true);
                      }}
                      className="flex items-center gap-2 text-xs text-salt/70 hover:text-salt"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[560px]">
          <svg ref={pointer} viewBox="0 0 40 50" className="absolute left-1/2 top-[-14px] z-10 h-12 w-10 -translate-x-1/2 drop-shadow-lg">
            <path d="M20 48 L4 10 A16 16 0 1 1 36 10 Z" fill="#f3efe7" />
            <circle cx="20" cy="14" r="5" fill="#c4703f" />
          </svg>
          <svg viewBox={`0 0 ${R * 2} ${R * 2}`} className="h-full w-full">
            <circle cx={R} cy={R} r={R} fill="#0a0b0c" />
            <g ref={wheel}>
              {prizes.map((p, i) => {
                const a0 = i * seg;
                const a1 = a0 + seg;
                const [x0, y0] = polar(a0, R - 8);
                const [x1, y1] = polar(a1, R - 8);
                const mid = a0 + seg / 2;
                const [tx, ty] = polar(mid, R * 0.62);
                return (
                  <g key={p.id}>
                    <path d={`M ${R} ${R} L ${x0} ${y0} A ${R - 8} ${R - 8} 0 0 1 ${x1} ${y1} Z`} fill={p.color} stroke="#0a0b0c" strokeWidth="2" />
                    <text
                      x={tx}
                      y={ty}
                      fill="#f3efe7"
                      fontSize="13"
                      fontFamily="var(--font-inter)"
                      fontWeight="500"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${mid > 180 ? mid + 90 : mid - 90} ${tx} ${ty})`}
                    >
                      {p.label}
                    </text>
                  </g>
                );
              })}
              {prizes.map((_, i) => {
                const [x, y] = polar(i * seg, R - 4);
                return <circle key={i} cx={x} cy={y} r={3} fill="#cfa968" />;
              })}
            </g>
            <circle cx={R} cy={R} r={R - 2} fill="none" stroke="#cfa968" strokeOpacity="0.5" strokeWidth="2" />
            <Chakana />
          </svg>
        </div>
      </div>
    </section>
  );
}
