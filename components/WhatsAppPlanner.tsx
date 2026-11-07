"use client";

/* ──────────────────────────────────────────────────────────────
   WhatsApp trip planner — the main call to action.
   Four quick steps build a ready-to-send message; a phone on the
   right previews the conversation live, then "Send" opens WhatsApp
   to +591 77165787 with everything filled in.
   ────────────────────────────────────────────────────────────── */

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCheck, ChevronLeft, Minus, MoreVertical, Plus, SendHorizontal } from "lucide-react";
import { WHATSAPP_DISPLAY, waLink } from "@/lib/contact";
import { fmt } from "@/lib/i18n/fmt";
import { useI18n } from "./i18n";
import { Tilt3D } from "./adventure-ui";

type Goal = "adrenaline" | "journey" | "group" | "question";

const budgets = ["< $500", "$500 – 1,500", "$1,500 – 3,000", "$3,000+"];

const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function WhatsAppPlanner({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const { t, content } = useI18n();
  const P = t.planner;
  const goals = P.goals as { id: Goal; title: string; text: string; label: string; reply: string }[];
  const months = [P.anyTime, ...P.months];
  const topics = P.topics;
  const steps = P.steps;
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [picks, setPicks] = useState<string[]>([]);
  const [month, setMonth] = useState(P.anyTime);
  const [people, setPeople] = useState(2);
  const [budget, setBudget] = useState("");
  const [name, setName] = useState("");
  const [from, setFrom] = useState("");
  const [note, setNote] = useState("");
  const [typing, setTyping] = useState(false);
  const chat = useRef<HTMLDivElement>(null);
  const [time, setTime] = useState("");
  useEffect(() => setTime(now()), []);

  const g = goals.find((x) => x.id === goal);
  const options =
    goal === "adrenaline"
      ? content.adventures.map((a) => a.name)
      : goal === "question"
        ? topics
        : content.destinations.map((d) => d.name);

  const message = useMemo(() => {
    const lines = [`${P.msgHi}${name ? fmt(P.msgName, { name }) : ""}${from ? fmt(P.msgFrom, { from }) : ""}.`];
    if (g) lines.push(fmt(P.msgLooking, { label: g.label }));
    if (picks.length) lines.push(`${goal === "question" ? P.msgAbout : P.msgInterested}: ${picks.join(", ")}.`);
    if (goal && goal !== "question") lines.push(`${fmt(P.msgWhen, { month, n: people })}${budget ? fmt(P.msgBudget, { budget }) : ""}.`);
    if (note.trim()) lines.push(note.trim());
    return lines.join("\n");
  }, [name, from, g, goal, picks, month, people, budget, note, P]);

  // Simulated "Rosario is typing…" after each answer.
  useEffect(() => {
    if (step === 0) return;
    setTyping(true);
    const t = setTimeout(() => setTyping(false), 900);
    return () => clearTimeout(t);
  }, [step, goal]);

  useEffect(() => {
    chat.current?.scrollTo({ top: chat.current.scrollHeight, behavior: "smooth" });
  }, [message, typing, step]);

  const canNext = step === 0 ? !!goal : step === 2 ? name.trim().length > 1 : true;
  const toggle = (o: string) => setPicks((p) => (p.includes(o) ? p.filter((x) => x !== o) : [...p, o]));

  const light = tone === "light";
  const card = light ? "border-ink/15 hover:border-ink" : "border-line hover:border-copper/70";
  const cardOn = light ? "border-ink bg-white" : "border-copper bg-copper/10";
  const chip = (on: boolean) =>
    `rounded-full border px-4 py-2 text-sm transition ${on ? "border-copper bg-copper text-ink" : light ? "border-ink/20 hover:border-ink" : "border-salt/20 hover:border-salt/60"}`;

  return (
    <div className="grid gap-12 lg:grid-cols-[1.35fr_1fr] lg:items-center">
      <div>
        {/* step rail */}
        <ol className="grid grid-cols-4 gap-3">
          {steps.map((s, i) => (
            <li key={s}>
              <button
                onClick={() => i <= step && setStep(i)}
                disabled={i > step}
                className={`w-full border-t-2 pt-3 text-left transition ${i <= step ? "border-copper" : light ? "border-ink/15" : "border-salt/15"}`}
              >
                <span className={`eyebrow text-[0.62rem] ${i === step ? "" : "opacity-50"}`}>
                  0{i + 1} · {s}
                </span>
              </button>
            </li>
          ))}
        </ol>

        <div className="mt-10 min-h-[380px]">
          {step === 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {goals.map((x, i) => (
                <button
                  key={x.id}
                  onClick={() => {
                    setGoal(x.id);
                    setPicks([]);
                    setStep(1);
                  }}
                  className={`group border p-7 text-left transition duration-500 hover:-translate-y-1 ${goal === x.id ? cardOn : card}`}
                >
                  <span className="font-display text-lg text-copper">0{i + 1}</span>
                  <span className="font-impact mt-3 block text-[1.7rem] uppercase leading-none tracking-wide xl:text-[2rem]">{x.title}</span>
                  <span className={`mt-3 block text-sm ${light ? "text-ink/60" : "text-salt/60"}`}>{x.text}</span>
                </button>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-9">
              <div>
                <p className="eyebrow mb-4 opacity-60">{goal === "adrenaline" ? P.pickRush : goal === "question" ? P.about : P.whereTo} · {P.chooseAny}</p>
                <div className="flex flex-wrap gap-2">
                  {options.map((o) => (
                    <button key={o} onClick={() => toggle(o)} className={chip(picks.includes(o))}>
                      {o}
                    </button>
                  ))}
                </div>
              </div>
              {goal !== "question" && (
                <>
                  <div className="grid gap-8 sm:grid-cols-2">
                    <label className="block">
                      <span className="eyebrow opacity-60">{P.when}</span>
                      <select value={month} onChange={(e) => setMonth(e.target.value)} className="field mt-2">
                        {months.map((m) => (
                          <option key={m}>{m}</option>
                        ))}
                      </select>
                    </label>
                    <div>
                      <span className="eyebrow opacity-60">{P.travellers}</span>
                      <div className="mt-3 flex items-center gap-5">
                        <button aria-label={t.booking.fewer} onClick={() => setPeople((n) => Math.max(1, n - 1))} className={chip(false)}>
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="font-impact w-10 text-center text-4xl tabular-nums">{people}</span>
                        <button aria-label={t.booking.more} onClick={() => setPeople((n) => Math.min(60, n + 1))} className={chip(false)}>
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="eyebrow mb-4 opacity-60">{P.budget}</p>
                    <div className="flex flex-wrap gap-2">
                      {budgets.map((b) => (
                        <button key={b} onClick={() => setBudget(budget === b ? "" : b)} className={chip(budget === b)}>
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.common.yourName} className="field text-lg" aria-label={t.common.yourName} autoFocus />
              <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder={P.from} className="field text-lg" aria-label={P.from} />
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder={goal === "question" ? P.question : P.anythingElse}
                className="field resize-none text-lg"
                aria-label={P.messageField}
              />
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="font-impact text-[clamp(2.4rem,5vw,4.5rem)] uppercase leading-[0.9]">
                {fmt(P.ready, { name: name ? `, ${name.split(" ")[0]}` : "" })}
              </p>
              <p className={`mt-4 max-w-md ${light ? "text-ink/65" : "text-salt/65"}`}>
                {fmt(P.readyText, { phone: WHATSAPP_DISPLAY })}
              </p>
              <a
                href={waLink(message)}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-9 inline-flex items-center gap-4 rounded-full bg-[#25d366] py-4 pl-8 pr-4 text-base font-medium text-[#07280f] shadow-[0_20px_60px_-15px_rgba(37,211,102,0.6)] transition hover:scale-[1.03]"
              >
                {P.send}
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#07280f] text-[#25d366] transition group-hover:translate-x-1">
                  <SendHorizontal className="h-4 w-4" />
                </span>
              </a>
            </div>
          )}
        </div>

        {/* nav */}
        <div className={`mt-8 flex items-center justify-between border-t pt-6 ${light ? "border-ink/15" : "border-line"}`}>
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="flex items-center gap-2 text-sm opacity-60 transition hover:opacity-100 disabled:invisible">
            <ArrowLeft className="h-4 w-4" /> {t.common.back}
          </button>
          {step < 3 && (
            <button
              onClick={() => canNext && setStep((s) => s + 1)}
              disabled={!canNext}
              className="flex items-center gap-3 bg-copper px-8 py-4 text-sm font-medium uppercase tracking-[0.2em] text-ink transition hover:bg-copper-2 disabled:opacity-30"
            >
              {t.common.next} <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* live phone preview */}
      <Tilt3D className="mx-auto w-full max-w-[360px] rounded-[48px]" max={10}>
        <div className="rounded-[48px] border border-salt/15 bg-[#111] p-3 shadow-[0_50px_120px_-30px_rgba(0,0,0,0.9),0_0_80px_-20px_rgba(196,112,63,0.35)]">
          <div className="relative flex h-[600px] flex-col overflow-hidden rounded-[38px] bg-[#0b141a] text-[#e9edef]">
            <div className="absolute left-1/2 top-3 z-10 h-7 w-28 -translate-x-1/2 rounded-full bg-black" />
            <div className="flex items-center gap-3 bg-[#1f2c34] px-4 pb-3 pt-12">
              <ChevronLeft className="h-5 w-5 opacity-70" />
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-copper font-display text-lg text-ink">R</span>
              <div className="flex-1">
                <p className="text-[0.95rem] font-medium">Rosario Travels</p>
                <p className="text-xs opacity-60">{typing ? P.typing : P.online}</p>
              </div>
              <MoreVertical className="h-5 w-5 opacity-70" />
            </div>
            <div ref={chat} className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-4 text-[0.88rem] leading-snug [background:radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)_0_0/18px_18px]" data-lenis-prevent>
              <span className="mx-auto mb-2 rounded-md bg-[#1f2c34] px-3 py-1 text-[0.7rem] uppercase tracking-wide opacity-70">{P.today}</span>
              <Bubble time={time}>{P.greeting}</Bubble>
              {g && <Bubble me time={time}>{fmt(P.lookingFor, { label: g.label })}</Bubble>}
              {g && step >= 1 && !typing && <Bubble time={time}>{g.reply}</Bubble>}
              {step >= 2 && picks.length > 0 && <Bubble me time={time}>{picks.join(" · ")}</Bubble>}
              {step >= 2 && goal !== "question" && (
                <Bubble me time={time}>
                  {month} · {people} {people === 1 ? t.common.traveller : t.common.travellers}
                  {budget ? ` · ${budget}` : ""}
                </Bubble>
              )}
              {step >= 3 && (
                <Bubble me time={time}>
                  <span className="whitespace-pre-line">{message}</span>
                </Bubble>
              )}
              {typing && (
                <div className="flex w-16 gap-1 rounded-lg rounded-tl-none bg-[#1f2c34] px-3 py-3">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-white/50" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 p-3">
              <div className="flex-1 truncate rounded-full bg-[#1f2c34] px-4 py-3 text-sm opacity-60">{step === 3 ? P.readyToSend : P.messageField}</div>
              <a
                href={step === 3 ? waLink(message) : undefined}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={P.send}
                onClick={(e) => step < 3 && (e.preventDefault(), canNext && setStep((s) => s + 1))}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25d366] text-[#07280f]"
              >
                <SendHorizontal className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </Tilt3D>
    </div>
  );
}

function Bubble({ me, time, children }: { me?: boolean; time: string; children: React.ReactNode }) {
  return (
    <div
      className={`max-w-[85%] animate-[toast_0.5s_var(--ease-expo)] rounded-lg px-3 pb-1.5 pt-2 shadow ${
        me ? "self-end rounded-tr-none bg-[#005c4b]" : "self-start rounded-tl-none bg-[#1f2c34]"
      }`}
    >
      {children}
      <span className="ml-3 inline-flex translate-y-1 items-center gap-1 float-right text-[0.65rem] opacity-60">
        {time}
        {me && <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb]" />}
      </span>
    </div>
  );
}
