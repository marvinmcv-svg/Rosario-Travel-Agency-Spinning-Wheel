"use client";

/* ──────────────────────────────────────────────────────────────
   Book a room at Hoteles Rosario.
   Hotel → dates & guests → room (live availability and price) →
   extras → details. "Book on WhatsApp" saves the request and opens
   WhatsApp with every detail pre-filled (plus a #RS-… code line the
   team portal can import), so it reaches the hotel even without a
   database. Prices are charged in USD at the hotel.
   ────────────────────────────────────────────────────────────── */

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { BedDouble, Check, MessageCircle, Minus, Plus, Users } from "lucide-react";
import { useI18n, Price } from "./i18n";
import { useLenis } from "./SmoothScroll";
import { actions, useDB, useOccupancy, type StayBooking } from "@/lib/store";
import { addDaysIso, availability, extrasFor, getHotel, hotels, quoteStay, roomRate, todayBolivia, type StayLine } from "@/lib/hotels";
import { staysText } from "@/lib/hotels";
import { fmt } from "@/lib/i18n/fmt";
import { EMAIL } from "@/lib/contact";
import { fmtStayDate, nightsText, stayRequestText, waTo } from "@/lib/stay-message";

const WA_GREEN = "#25d366";

function Stepper({ value, set, min, max, label }: { value: number; set: (n: number) => void; min: number; max: number; label: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-line px-3 py-2">
      <span className="text-sm text-salt/65">{label}</span>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => set(Math.max(min, value - 1))} disabled={value <= min} aria-label={`${label} −`} className="flex h-8 w-8 items-center justify-center rounded-full border border-salt/20 disabled:opacity-30 hover:border-salt">
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-5 text-center font-display text-xl tabular-nums" data-testid={`stepper-${label}`}>{value}</span>
        <button type="button" onClick={() => set(Math.min(max, value + 1))} disabled={value >= max} aria-label={`${label} +`} className="flex h-8 w-8 items-center justify-center rounded-full border border-salt/20 disabled:opacity-30 hover:border-salt">
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function StayBooker({ initialHotel }: { initialHotel?: string }) {
  const { lang, lp, t } = useI18n();
  const S = staysText(lang);
  const B = S.book;
  const lenis = useLenis();
  const root = useRef<HTMLElement>(null);
  const overrides = useDB((db) => db.hotelOverrides);
  const waNumber = useDB((db) => db.settings.staysWhatsApp) || "59177165787";
  const occupancy = useOccupancy();

  const today = todayBolivia();
  const [hotel, setHotel] = useState(initialHotel && getHotel(initialHotel) ? initialHotel : hotels[0].slug);
  const [checkIn, setCheckIn] = useState(() => addDaysIso(today, 14));
  const [checkOut, setCheckOut] = useState(() => addDaysIso(today, 16));
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [room, setRoom] = useState<string | null>(null);
  const [extras, setExtras] = useState<StayLine[]>([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ stay: StayBooking; text: string } | null>(null);

  const h = getHotel(hotel)!;
  const closed = !!overrides[hotel]?.closed;

  // "Book this hotel" links elsewhere on the page point to #book-<hotel>.
  useEffect(() => {
    const pick = () => {
      const m = window.location.hash.match(/^#book(?:-([a-z-]+))?$/);
      if (!m) return;
      if (m[1] && getHotel(m[1])) {
        setHotel(m[1]);
        setDone(null);
      }
      const el = root.current;
      if (el) requestAnimationFrame(() => (lenis ? lenis.scrollTo(el, { offset: -90 }) : el.scrollIntoView({ behavior: "smooth" })));
    };
    pick();
    window.addEventListener("hashchange", pick);
    return () => window.removeEventListener("hashchange", pick);
  }, [lenis]);

  const dateError = checkIn < today ? B.pastDate : checkOut <= checkIn ? B.badDates : null;
  const free = useMemo(() => (dateError ? {} : availability(occupancy, hotel, checkIn, checkOut, overrides)), [occupancy, hotel, checkIn, checkOut, overrides, dateError]);
  const fits = (id: string) => (h.rooms.find((r) => r.id === id)?.guests ?? 0) * rooms >= guests;
  const usable = (id: string) => (free[id] ?? 0) >= rooms && fits(id);

  // Keep a sensible room selected as the hotel, dates or party change.
  useEffect(() => {
    if (room && h.rooms.some((r) => r.id === room) && usable(room)) return;
    setRoom(h.rooms.find((r) => usable(r.id))?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotel, free, guests, rooms]);
  useEffect(() => setExtras((x) => x.filter((e) => extrasFor(hotel).some((y) => y.id === e.id))), [hotel]);

  const quote = room ? quoteStay({ hotel, room, rooms, guests, checkIn, checkOut, extras }, overrides) : null;
  const nights = quote?.nights ?? 0;
  const noneLeft = !dateError && !closed && h.rooms.every((r) => (free[r.id] ?? 0) < rooms);

  const setIn = (v: string) => {
    setCheckIn(v);
    if (v && checkOut <= v) setCheckOut(addDaysIso(v, 1));
  };
  const toggleExtra = (id: string) => setExtras((x) => (x.some((e) => e.id === id) ? x.filter((e) => e.id !== id) : [...x, { id, qty: 1 }]));

  function submit(channel: "whatsapp" | "email") {
    setError(null);
    if (dateError) return setError(dateError);
    if (closed) return setError(B.closed);
    if (!room || !quote) return setError(noneLeft ? B.noneLeft : fmt(B.tooSmall, { n: guests }));
    if (!form.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return setError(B.missing);
    const stay = actions.createStay({
      hotel,
      room,
      rooms,
      guests,
      checkIn,
      checkOut,
      extras,
      total: quote.total,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      notes: form.notes.trim() || undefined,
      source: channel === "whatsapp" ? "whatsapp" : "website",
    });
    const text = stayRequestText(stay, lang, quote.nights);
    setDone({ stay, text });
    if (channel === "whatsapp") window.open(waTo(waNumber, text), "_blank", "noopener");
    else window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(`${h.name} · ${stay.id}`)}&body=${encodeURIComponent(text)}`;
    requestAnimationFrame(() => root.current && (lenis ? lenis.scrollTo(root.current, { offset: -90 }) : root.current.scrollIntoView()));
  }

  if (done) {
    return (
      <section ref={root} id="book" className="scroll-mt-24 rounded-[28px] border border-line bg-ink-2 p-6 md:p-10" data-testid="stay-done">
        <p className="eyebrow flex items-center gap-2 text-rb-ochre"><Check className="h-4 w-4" /> {B.eyebrow}</p>
        <h2 className="mt-4 font-display text-[clamp(2.2rem,4vw,3.6rem)] leading-none">{B.sentTitle}</h2>
        <p className="mt-5 max-w-2xl text-salt/70">{fmt(B.sentText, { ref: done.stay.id })}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href={waTo(waNumber, done.text)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium text-ink" style={{ background: WA_GREEN }} data-testid="stay-wa">
            <MessageCircle className="h-4 w-4" /> {B.openWhatsApp}
          </a>
          <a href={`mailto:${EMAIL}?subject=${encodeURIComponent(`${h.name} · ${done.stay.id}`)}&body=${encodeURIComponent(done.text)}`} className="inline-flex items-center rounded-full border border-salt/25 px-6 py-3.5 text-sm hover:border-salt">
            {B.sendEmail}
          </a>
          <button onClick={() => setDone(null)} className="inline-flex items-center rounded-full px-4 py-3.5 text-sm text-salt/60 hover:text-salt">{B.another}</button>
        </div>
        <pre className="mt-6 max-h-72 overflow-auto whitespace-pre-wrap rounded-2xl bg-ink p-5 font-sans text-sm leading-relaxed text-salt/75" data-testid="stay-message">{done.text}</pre>
      </section>
    );
  }

  const label = "mb-2 block text-xs text-salt/55";
  return (
    <section ref={root} id="book" className="scroll-mt-24" data-testid="stay-booker">
      <div className="mb-10 grid gap-6 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="eyebrow mb-4 text-rb-ochre">{B.eyebrow}</p>
          <h2 className="font-display text-[clamp(2.4rem,4.6vw,4.4rem)] leading-[0.98] tracking-[-0.03em]">{B.title}</h2>
          <p className="mt-5 max-w-2xl text-salt/65">{B.intro}</p>
        </div>
        <div className="rounded-[22px] border border-line p-5 lg:col-span-4 lg:col-start-9">
          <p className="font-display text-2xl">{B.quickTitle}</p>
          <p className="mt-2 text-sm text-salt/60">{B.quickText}</p>
          <a href={waTo(waNumber, fmt(B.quickMsg, { hotel: h.name }))} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-ink" style={{ background: WA_GREEN }} data-testid="stay-quick-wa">
            <MessageCircle className="h-4 w-4" /> {B.quickCta}
          </a>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="space-y-10 lg:col-span-8">
          {/* 1 · Hotel */}
          <fieldset>
            <legend className={label}>{B.hotel}</legend>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4" role="radiogroup">
              {hotels.map((x) => (
                <button
                  key={x.slug}
                  type="button"
                  role="radio"
                  aria-checked={hotel === x.slug}
                  onClick={() => setHotel(x.slug)}
                  data-testid={`pick-${x.slug}`}
                  className={`group overflow-hidden rounded-2xl border text-left transition ${hotel === x.slug ? "border-rb-ochre bg-rb-ochre/10" : "border-line hover:border-salt/40"}`}
                >
                  <div className="relative aspect-[16/10]">
                    <Image src={x.image} alt="" fill sizes="(min-width:768px) 16vw, 45vw" className="object-cover" />
                  </div>
                  <div className="p-3">
                    <p className="text-sm leading-tight">{x.name.replace("Hotel Boutique ", "").replace("Hotel ", "")}</p>
                    <p className="mt-1 text-xs text-salt/50">{x.town}</p>
                  </div>
                </button>
              ))}
            </div>
          </fieldset>

          {/* 2 · Dates & party */}
          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              <span className={label}>{B.checkIn}</span>
              <input type="date" value={checkIn} min={today} onChange={(e) => setIn(e.target.value)} className="field [color-scheme:dark]" data-testid="check-in" />
            </label>
            <label>
              <span className={label}>{B.checkOut}</span>
              <input type="date" value={checkOut} min={addDaysIso(checkIn || today, 1)} onChange={(e) => setCheckOut(e.target.value)} className="field [color-scheme:dark]" data-testid="check-out" />
            </label>
            <Stepper value={guests} set={setGuests} min={1} max={16} label={B.guests} />
            <Stepper value={rooms} set={setRooms} min={1} max={6} label={B.rooms} />
          </div>
          {dateError && <p className="-mt-6 text-sm text-red-300">{dateError}</p>}

          {/* 3 · Room */}
          <fieldset>
            <legend className={label}>{B.chooseRoom} · {h.name}</legend>
            {closed ? (
              <p className="rounded-2xl border border-line p-5 text-sm text-salt/70">{B.closed}</p>
            ) : (
              <div className="space-y-3" role="radiogroup">
                {h.rooms.map((r) => {
                  const left = free[r.id] ?? 0;
                  const ok = usable(r.id);
                  const on = room === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      disabled={!ok}
                      onClick={() => setRoom(r.id)}
                      data-testid={`room-${r.id}`}
                      className={`flex w-full items-center gap-4 rounded-2xl border p-3 text-left transition ${on ? "border-rb-ochre bg-rb-ochre/10" : ok ? "border-line hover:border-salt/40" : "cursor-not-allowed border-line/60 opacity-45"}`}
                    >
                      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl sm:h-20 sm:w-28">
                        {r.image && <Image src={r.image} alt="" fill sizes="112px" className="object-cover" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="leading-tight">{S.rooms[r.id]}</p>
                        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-salt/55">
                          <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {fmt(B.upTo, { n: r.guests })}</span>
                          {r.size && <span>{r.size} m²</span>}
                          <span className={left === 0 ? "text-red-300" : left <= 2 ? "text-gold" : "text-emerald-300/80"}>
                            {left === 0 ? B.soldOut : left === 1 ? B.lastOne : fmt(B.left, { n: left })}
                          </span>
                        </p>
                        {!fits(r.id) && left > 0 && <p className="mt-1 text-xs text-salt/45">{fmt(B.tooSmall, { n: guests })}</p>}
                      </div>
                      <div className="shrink-0 text-right">
                        <Price usd={roomRate(hotel, r.id, overrides)} className="font-display text-xl" />
                        <p className="text-xs text-salt/45">{B.perNight}</p>
                      </div>
                    </button>
                  );
                })}
                {noneLeft && <p className="text-sm text-gold">{B.noneLeft}</p>}
              </div>
            )}
          </fieldset>

          {/* 4 · Extras (order with the stay) */}
          <fieldset>
            <legend className={label}>{B.extrasTitle} · <span className="text-salt/40">{B.extrasIntro}</span></legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {extrasFor(hotel).map((e) => {
                const on = extras.some((x) => x.id === e.id);
                return (
                  <label key={e.id} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 text-sm transition ${on ? "border-rb-ochre bg-rb-ochre/10" : "border-line hover:border-salt/40"}`}>
                    <input type="checkbox" checked={on} onChange={() => toggleExtra(e.id)} className="mt-0.5 accent-[#c77922]" data-testid={`extra-${e.id}`} />
                    <span className="flex-1">{S.extras[e.id]}</span>
                    <span className="shrink-0 text-right text-xs text-salt/60">
                      <Price usd={e.price} className="text-sm text-salt" /><br />{S.per[e.per]}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* 5 · Details */}
          <fieldset>
            <legend className={label}>{B.detailsTitle}</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <input placeholder={B.name} aria-label={B.name} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="field" autoComplete="name" />
              <input type="email" placeholder={B.email} aria-label={B.email} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="field" autoComplete="email" />
              <input type="tel" placeholder={B.phone} aria-label={B.phone} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="field" autoComplete="tel" />
              <input placeholder={B.notes} aria-label={B.notes} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="field" />
            </div>
          </fieldset>
        </div>

        {/* Summary */}
        <aside className="lg:col-span-4">
          <div className="sticky top-28 rounded-[24px] border border-line bg-ink-2 p-6" data-testid="stay-summary">
            <p className="eyebrow text-salt/45">{B.summary}</p>
            <p className="mt-3 font-display text-2xl leading-tight">{h.name}</p>
            <p className="mt-2 text-sm text-salt/60">
              {checkIn && checkOut && !dateError ? `${fmtStayDate(checkIn, lang)} → ${fmtStayDate(checkOut, lang)}` : "—"}
            </p>
            <div className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
              {room && quote ? (
                <>
                  <div className="flex justify-between gap-4">
                    <span className="flex items-start gap-2 text-salt/70"><BedDouble className="mt-0.5 h-4 w-4 shrink-0" /> {fmt(B.roomLine, { rooms, room: S.rooms[room], nights: nightsText(lang, nights) })}</span>
                    <Price usd={quote.roomTotal} className="shrink-0 tabular-nums" />
                  </div>
                  {quote.extrasTotal > 0 && (
                    <div className="flex justify-between gap-4">
                      <span className="text-salt/70">{B.extrasLine}</span>
                      <Price usd={quote.extrasTotal} className="shrink-0 tabular-nums" />
                    </div>
                  )}
                  <div className="flex items-baseline justify-between gap-4 border-t border-line pt-3">
                    <span>{B.total}</span>
                    <Price usd={quote.total} className="font-display text-3xl" />
                  </div>
                  <p className="text-xs text-salt/45">{B.taxes}</p>
                </>
              ) : (
                <p className="text-salt/55">{closed ? B.closed : noneLeft ? B.noneLeft : dateError ?? fmt(B.tooSmall, { n: guests })}</p>
              )}
            </div>
            {error && <p className="mt-4 text-sm text-red-300" role="alert">{error}</p>}
            <button
              type="button"
              onClick={() => submit("whatsapp")}
              disabled={!room || !!dateError || closed}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full py-4 text-sm font-medium text-ink transition disabled:opacity-40"
              style={{ background: WA_GREEN }}
              data-testid="stay-book-wa"
            >
              <MessageCircle className="h-4 w-4" /> {B.bookWhatsApp}
            </button>
            <button type="button" onClick={() => submit("email")} disabled={!room || !!dateError || closed} className="mt-2 w-full py-2 text-xs text-salt/55 hover:text-salt disabled:opacity-40" data-testid="stay-book-email">
              {B.bookEmail}
            </button>
            <p className="mt-3 text-center text-[0.7rem] leading-relaxed text-salt/40">
              <a href={lp("/terms")} className="underline underline-offset-2 hover:text-salt">{t.footer.terms}</a> · <a href={lp("/privacy")} className="underline underline-offset-2 hover:text-salt">{t.footer.privacy}</a>
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
