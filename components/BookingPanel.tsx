"use client";

import Link from "next/link";
import { EMAIL, waLink } from "@/lib/contact";

import { useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { fmt } from "@/lib/i18n/fmt";
import { BOOKING_TERMS } from "@/lib/essentials";
import { departuresFor, formatRange } from "@/lib/departures";
import { useI18n } from "./i18n";
import { actions, useDB, useJourneys, type Booking } from "@/lib/store";
import AskRosario from "./AskRosario";

/* Turn a wheel prize into a price adjustment. */
function discountFor(label: string, subtotal: number): number {
  const pct = label.match(/(\d+)%/);
  if (pct) return Math.round((subtotal * parseInt(pct[1], 10)) / 100);
  const flat = label.match(/\$(\d+)/);
  if (flat) return parseInt(flat[1], 10);
  return 0;
}

const addDays = (isoDate: string, n: number) => {
  const d = new Date(`${isoDate}T12:00:00`);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};
const today = () => new Date().toISOString().slice(0, 10);

export default function BookingPanel({ slug }: { slug: string }) {
  const { t, lp, intl, price } = useI18n();
  const B = t.booking;
  const journey = useJourneys().find((j) => j.slug === slug)!;
  const leads = useDB((db) => db.leads);
  const [travellers, setTravellers] = useState(2);
  // Scheduled small-group departures, or a private journey on any date.
  const departures = useMemo(() => departuresFor(journey), [journey]);
  const privateOnly = journey.style === "Private" || departures.length === 0;
  const [mode, setMode] = useState<"group" | "private">(privateOnly ? "private" : "group");
  const [picked, setPicked] = useState<string | null>(null);
  const [privateStart, setPrivateStart] = useState(() => addDays(today(), 45));
  const [allDates, setAllDates] = useState(false);
  const firstOpen = departures.find((d) => d.seatsLeft >= travellers);
  const departure = departures.find((d) => d.start === picked && d.seatsLeft >= travellers) ?? firstOpen;
  const start = mode === "private" ? privateStart : departure?.start ?? privateStart;
  const dateLabel =
    formatRange(start, addDays(start, journey.days - 1), intl) + (mode === "private" ? ` · ${B.privateTab}` : "");
  const [promo, setPromo] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [step, setStep] = useState<"quote" | "details" | "done">("quote");
  const [booking, setBooking] = useState<Booking | null>(null);

  const subtotal = journey.priceFrom * travellers;
  const lead = useMemo(() => leads.find((l) => l.code.toUpperCase() === promo.trim().toUpperCase() && !l.redeemed), [leads, promo]);
  const discount = lead ? discountFor(lead.prizeLabel, subtotal) : 0;
  const total = subtotal - discount;

  if (step === "done" && booking) {
    // The full request goes to the team on WhatsApp (or email), so nothing depends on a database.
    const extra = [
      booking.promo && `\n• 🎁 ${booking.promo}`,
      booking.phone && `\n• ☎ ${booking.phone}`,
      booking.notes && `\n• “${booking.notes}”`,
    ]
      .filter(Boolean)
      .join("");
    const message = fmt(B.confirmWaText, {
      title: journey.title,
      ref: booking.id,
      n: booking.travellers,
      month: dateLabel,
      total: `US$${booking.total.toLocaleString("en-US")}`,
      extra,
      name: booking.name,
      email: booking.email,
    });
    return (
      <div className="rounded-[24px] border border-gold/30 bg-ink-2 p-8">
        <p className="eyebrow text-gold">{B.received}</p>
        <p className="mt-3 font-display text-4xl">{fmt(B.thanks, { name: booking.name.split(" ")[0] })}</p>
        <p className="mt-4 leading-relaxed text-salt/70">
          {fmt(B.reference, { ref: booking.id, title: journey.title })}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={waLink(message)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[#25d366] px-5 py-3 text-sm font-medium text-[#07280f]"
          >
            {B.confirmWa}
          </a>
          <Link href={lp(`/payments?ref=${booking.id}&amount=${Math.round((booking.total * BOOKING_TERMS.depositPct) / 100)}`)} className="rounded-full border border-salt/25 px-5 py-3 text-sm transition hover:border-copper">
            {B.payDeposit}
          </Link>
        </div>
        <a
          href={`mailto:${EMAIL}?subject=${encodeURIComponent(fmt(B.emailSubject, { ref: booking.id, title: journey.title }))}&body=${encodeURIComponent(message)}`}
          className="link-line mt-5 inline-block text-sm text-salt/60 hover:text-salt"
        >
          {B.orEmail}
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border border-line bg-ink-2 p-7">
      <p className="eyebrow text-salt/50">{B.reserve}</p>
      <p className="mt-3 text-sm text-salt/60">
        {t.common.from} <span className="font-display text-4xl text-salt">{price(journey.priceFrom)}</span> {t.common.perTraveller}
      </p>
      {typeof journey.spotsLeft === "number" && journey.spotsLeft > 0 && (
        <p className="mt-2 text-xs text-gold">{fmt(B.spotsLeft, { n: journey.spotsLeft })}</p>
      )}

      {step === "quote" && (
        <div className="mt-7 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-salt/70">{B.travellers}</span>
            <div className="flex items-center gap-4">
              <button onClick={() => setTravellers((t) => Math.max(1, t - 1))} className="flex h-9 w-9 items-center justify-center rounded-full border border-salt/20 hover:border-salt" aria-label={B.fewer}>
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-6 text-center font-display text-2xl tabular-nums">{travellers}</span>
              <button onClick={() => setTravellers((t) => Math.min(journey.maxGroup, t + 1))} className="flex h-9 w-9 items-center justify-center rounded-full border border-salt/20 hover:border-salt" aria-label={B.more}>
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div>
            {!privateOnly && (
              <div className="mb-4 grid grid-cols-2 gap-1 rounded-full border border-line p-1 text-sm" role="tablist">
                {(["group", "private"] as const).map((m) => (
                  <button
                    key={m}
                    role="tab"
                    aria-selected={mode === m}
                    onClick={() => setMode(m)}
                    className={`rounded-full py-2 transition ${mode === m ? "bg-salt text-ink" : "text-salt/60 hover:text-salt"}`}
                  >
                    {m === "group" ? B.groupTab : B.privateTab}
                  </button>
                ))}
              </div>
            )}
            {mode === "group" ? (
              <fieldset>
                <legend className="mb-2 text-sm text-salt/70">{B.chooseDate}</legend>
                <div className="space-y-1.5">
                  {departures.slice(0, allDates ? 16 : 5).map((d) => {
                    const ok = d.seatsLeft >= travellers;
                    const on = ok && departure?.start === d.start;
                    return (
                      <button
                        key={d.start}
                        type="button"
                        disabled={!ok}
                        aria-pressed={on}
                        onClick={() => setPicked(d.start)}
                        className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm transition ${
                          on ? "border-copper bg-copper/10" : ok ? "border-line hover:border-salt/40" : "cursor-not-allowed border-line/60 opacity-40"
                        }`}
                      >
                        <span>{formatRange(d.start, d.end, intl)}</span>
                        <span className={`shrink-0 text-xs ${d.seatsLeft === 0 ? "text-salt/50" : d.seatsLeft <= 3 ? "text-gold" : d.guaranteed ? "text-emerald-300/80" : "text-salt/50"}`}>
                          {d.seatsLeft === 0 ? B.full : d.seatsLeft <= 3 ? fmt(B.placesLeft, { n: d.seatsLeft }) : d.guaranteed ? B.guaranteed : fmt(B.placesLeft, { n: d.seatsLeft })}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {departures.length > 5 && (
                  <button type="button" onClick={() => setAllDates((v) => !v)} className="mt-2 text-xs text-salt/55 underline underline-offset-2 hover:text-salt">
                    {allDates ? B.fewerDates : B.moreDates}
                  </button>
                )}
              </fieldset>
            ) : (
              <label className="block">
                <span className="text-sm text-salt/70">{B.startDate}</span>
                <input
                  type="date"
                  value={privateStart}
                  min={addDays(today(), 21)}
                  onChange={(e) => e.target.value && setPrivateStart(e.target.value)}
                  className="field [color-scheme:dark]"
                />
                <span className="mt-2 block text-xs leading-relaxed text-salt/50">{B.privateNote}</span>
              </label>
            )}
          </div>
          <label className="block">
            <span className="text-sm text-salt/70">{B.promo}</span>
            <input value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="ANDES-XXXX" className="field font-mono uppercase" />
            {promo && (
              <span className={`mt-2 block text-xs ${lead ? "text-gold" : "text-salt/40"}`}>
                {lead ? fmt(B.applied, { prize: lead.prizeLabel }) : B.notRecognised}
              </span>
            )}
          </label>
          <div className="space-y-2 border-t border-line pt-5 text-sm">
            <div className="flex justify-between text-salt/60">
              <span>{travellers} × {price(journey.priceFrom)}</span>
              <span>{price(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-gold">
                <span>{lead?.prizeLabel}</span>
                <span>−{price(discount)}</span>
              </div>
            )}
            {lead && discount === 0 && <div className="text-gold">{fmt(B.added, { prize: lead.prizeLabel })}</div>}
            <div className="flex items-baseline justify-between pt-2">
              <span>{B.estimated}</span>
              <span className="font-display text-3xl">{price(total)}</span>
            </div>
          </div>
          <button onClick={() => setStep("details")} disabled={mode === "group" && !departure} className="w-full disabled:opacity-40 rounded-full bg-copper py-4 text-sm font-medium text-ink transition hover:bg-copper-2">
            {B.continue}
          </button>
          <div className="flex justify-center">
            <AskRosario prompt={fmt(B.questionsPrompt, { title: journey.title })} label={B.questions} />
          </div>
        </div>
      )}

      {step === "details" && (
        <form
          className="mt-7 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            const b = actions.createBooking({
              journeySlug: journey.slug,
              name: form.name.trim(),
              email: form.email.trim(),
              phone: form.phone.trim() || undefined,
              notes: form.notes.trim() || undefined,
              travellers,
              date: start,
              total,
              source: lead ? "wheel" : "website",
              promo: lead?.code,
            });
            if (lead) actions.toggleLeadRedeemed(lead.id);
            setBooking(b);
            setStep("done");
          }}
        >
          <input required placeholder={t.common.fullName} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="field" aria-label={t.common.fullName} />
          <input required type="email" placeholder={t.common.email} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="field" aria-label={t.common.email} />
          <input placeholder={B.phone} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="field" aria-label={B.phone} />
          <textarea placeholder={B.notes} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="field resize-none" aria-label={B.notes} />
          <div className="flex items-baseline justify-between border-t border-line pt-5 text-sm">
            <span className="text-salt/60">{travellers} {travellers === 1 ? t.common.traveller : t.common.travellers} · {dateLabel}</span>
            <span className="font-display text-2xl">{price(total)}</span>
          </div>
          <button className="w-full rounded-full bg-copper py-4 text-sm font-medium text-ink transition hover:bg-copper-2">{B.request}</button>
          <button type="button" onClick={() => setStep("quote")} className="w-full text-xs text-salt/50 hover:text-salt">
            ← {t.common.back}
          </button>
          <p className="text-center text-[0.7rem] leading-relaxed text-salt/40">
            {B.legal.split(/(\{terms\}|\{privacy\})/).map((part, i) =>
              part === "{terms}" ? (
                <Link key={i} href={lp("/terms")} className="underline underline-offset-2 hover:text-salt">{B.terms}</Link>
              ) : part === "{privacy}" ? (
                <Link key={i} href={lp("/privacy")} className="underline underline-offset-2 hover:text-salt">{B.privacy}</Link>
              ) : (
                part
              ),
            )}
          </p>
        </form>
      )}
    </div>
  );
}
