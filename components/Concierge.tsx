"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp, Sparkles, X } from "lucide-react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { actions, useDB, type ChatMessage, type Conversation } from "@/lib/store";
import { CONCIERGE_EVENT } from "./concierge-bus";
import { useLenis } from "./SmoothScroll";
import { useI18n } from "./i18n";

/* Render the assistant's plain text with paragraphs, bullets and links to our pages. */
function Rich({ text }: { text: string }) {
  const { lp, t } = useI18n();
  return (
    <>
      {text.split(/\n{2,}/).map((para, i) => (
        <p key={i} className="mb-3 whitespace-pre-line last:mb-0">
          {para.split(/(\/(?:destinations|journeys)\/[a-z-]+|\/#spin)/g).map((part, j) =>
            /^\/(destinations|journeys|#spin)/.test(part) ? (
              <a key={j} href={lp(part)} className="text-copper-2 underline underline-offset-2">
                {part.replace("/destinations/", "").replace("/journeys/", "").replace("/#spin", t.concierge.spinLink).replace(/-/g, " ")}
              </a>
            ) : (
              part
            ),
          )}
        </p>
      ))}
    </>
  );
}

export default function Concierge() {
  const settings = useDB((db) => db.settings);
  const { t, lang } = useI18n();
  const C = t.concierge;
  const suggestions = C.suggestions;
  // English uses the greeting the team edits in the portal; other languages use the translation.
  const greeting = lang === "en" ? settings.aiGreeting : C.greeting;
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [conv, setConv] = useState<Conversation | null>(null);
  const [handoff, setHandoff] = useState<"idle" | "form" | "sent">("idle");
  const [email, setEmail] = useState("");
  const [revealed, setRevealed] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lenis = useLenis();

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || busy) return;
      setInput("");
      setBusy(true);
      const now = () => new Date().toISOString();
      const base: Conversation = conv ?? { id: `CV-${Date.now()}`, startedAt: now(), messages: [], mode: "offline" };
      const history: ChatMessage[] = [...base.messages, { role: "user", content, at: now() }];
      let working: Conversation = { ...base, messages: [...history, { role: "assistant", content: "", at: now() }] };
      setConv(working);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lang, messages: history.map(({ role, content }) => ({ role, content })) }),
        });
        const mode = (res.headers.get("X-Rosario-Mode") as Conversation["mode"]) || "offline";
        if (!res.body) throw new Error("no body");
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let acc = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          acc += dec.decode(value, { stream: true });
          working = { ...working, mode, messages: [...history, { role: "assistant", content: acc, at: now() }] };
          setConv(working);
        }
      } catch {
        working = {
          ...working,
          messages: [...history, { role: "assistant", content: C.lost, at: now() }],
        };
        setConv(working);
      } finally {
        actions.saveConversation(working);
        setBusy(false);
      }
    },
    [busy, conv, lang, C.lost],
  );

  // Open from anywhere on the site, optionally with a question.
  useEffect(() => {
    const onOpen = (e: Event) => {
      setOpen(true);
      const prompt = (e as CustomEvent<{ prompt?: string }>).detail?.prompt;
      if (prompt) setTimeout(() => send(prompt), 450);
    };
    window.addEventListener(CONCIERGE_EVENT, onOpen);
    return () => window.removeEventListener(CONCIERGE_EVENT, onOpen);
  }, [send]);

  // Panel rises from the launcher; page scroll pauses while it's open.
  useEffect(() => {
    const p = panel.current;
    if (!p) return;
    if (open) {
      lenis?.stop();
      gsap.set(p, { display: "flex" });
      if (!prefersReducedMotion())
        gsap.fromTo(p, { autoAlpha: 0, y: 40, scale: 0.96, transformOrigin: "100% 100%" }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7 });
      else gsap.set(p, { autoAlpha: 1 });
      setTimeout(() => inputRef.current?.focus(), 300);
    } else {
      lenis?.start();
      gsap.to(p, { autoAlpha: 0, y: 30, scale: 0.97, duration: 0.4, ease: "power2.in", onComplete: () => void gsap.set(p, { display: "none" }) });
    }
  }, [open, lenis]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [conv]);

  // The launcher waits until the visitor starts exploring — every hero has its own "Ask Rosario AI" button.
  useEffect(() => {
    const check = () => window.scrollY > 320 && setRevealed(true);
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  if (!settings.aiEnabled) return null;

  const messages = conv?.messages ?? [];

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        data-float className={`fixed bottom-5 right-5 z-[60] flex items-center gap-3 rounded-full border border-salt/15 bg-ink/80 py-2 pl-2 pr-5 shadow-2xl backdrop-blur-xl transition hover:border-copper md:bottom-8 md:right-8 transition-[opacity,transform] duration-700 ${open || !revealed ? "pointer-events-none translate-y-4 opacity-0" : "opacity-100"}`}
        aria-label={C.launcher}
      >
        <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-copper text-ink">
          <Sparkles className="h-4 w-4" />
          <span className="absolute inset-0 animate-ping rounded-full bg-copper/40" />
        </span>
        <span className="text-left">
          <span className="block text-[0.82rem] font-medium leading-tight">Rosario AI</span>
          <span className="block text-[0.68rem] leading-tight text-salt/55">{C.plan}</span>
        </span>
      </button>

      <div
        ref={panel}
        role="dialog"
        aria-label={C.dialog}
        data-lenis-prevent
        style={{ display: "none" }}
        className="fixed inset-x-3 bottom-3 top-20 z-[70] flex-col overflow-hidden rounded-[26px] border border-salt/12 bg-ink-2/95 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)] backdrop-blur-2xl sm:inset-auto sm:bottom-8 sm:right-8 sm:h-[640px] sm:max-h-[calc(100svh-6rem)] sm:w-[420px]"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-copper text-ink">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-medium">Rosario AI</p>
              <p className="flex items-center gap-1.5 text-[0.7rem] text-salt/50">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {C.status}
              </p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="rounded-full p-2 text-salt/60 transition hover:bg-salt/10 hover:text-salt" aria-label={t.common.close}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div ref={scroller} className="flex-1 space-y-4 overflow-y-auto px-5 py-5 text-[0.92rem] leading-relaxed">
          <div className="max-w-[88%] rounded-2xl rounded-tl-md bg-salt/[0.06] px-4 py-3 text-salt/90">{greeting}</div>
          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-copper px-4 py-3 text-ink">
                {m.content}
              </div>
            ) : (
              <div key={i} className="max-w-[92%] rounded-2xl rounded-tl-md bg-salt/[0.06] px-4 py-3 text-salt/90">
                {m.content ? (
                  <Rich text={m.content} />
                ) : (
                  <span className="flex gap-1 py-1" aria-label={C.typing}>
                    {[0, 1, 2].map((d) => (
                      <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-salt/50" style={{ animationDelay: `${d * 120}ms` }} />
                    ))}
                  </span>
                )}
              </div>
            ),
          )}

          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {suggestions.map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-full border border-salt/15 px-3.5 py-2 text-xs text-salt/75 transition hover:border-copper hover:text-salt">
                  {s}
                </button>
              ))}
            </div>
          )}

          {messages.length >= 2 && !busy && (
            <div className="rounded-2xl border border-gold/25 bg-gold/[0.04] p-4 text-xs">
              {handoff === "idle" && (
                <button onClick={() => setHandoff("form")} className="w-full text-left text-gold">
                  {C.handoff}
                </button>
              )}
              {handoff === "form" && (
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!email.includes("@")) return;
                    actions.createInquiry({
                      name: "Rosario AI visitor",
                      email: email.trim(),
                      interest: "Rosario AI hand-off",
                      message: messages.filter((m) => m.role === "user").map((m) => m.content).join(" · "),
                    });
                    setHandoff("sent");
                  }}
                >
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={C.yourEmail} className="field flex-1 py-2 text-sm" />
                  <button className="rounded-full bg-gold px-4 text-xs font-medium text-ink">{t.common.send}</button>
                </form>
              )}
              {handoff === "sent" && <p className="text-gold">{C.handoffSent}</p>}
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="border-t border-line p-3"
        >
          <div className="flex items-end gap-2 rounded-2xl bg-salt/[0.05] p-2 focus-within:bg-salt/[0.08]">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              placeholder={C.placeholder}
              className="max-h-32 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-salt/35"
              aria-label={C.message}
            />
            <button
              disabled={busy || !input.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-copper text-ink transition hover:bg-copper-2 disabled:opacity-40"
              aria-label={t.common.send}
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 px-2 text-[0.65rem] text-salt/35">{C.disclaimer}</p>
        </form>
      </div>
    </>
  );
}
