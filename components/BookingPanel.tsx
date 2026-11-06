"use client";

import Link from "next/link";
import { waLink } from "@/lib/contact";

import { useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { formatPrice } from "@/lib/data";
import { actions, useDB, useJourneys, type Booking } from "@/lib/store";
import AskRosario from "./AskRosario";

/* Monthly departures for the next 14 months. */
const months = Array.from({ length: 14 }, (_, i) => {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + i + 1);
  return { value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: d.toLocaleDateString("en-US", { month: "long", year: "numeric" }) };
});

/* Turn a wheel prize into a price adjustment. */
function discountFor(label: string, subtotal: number): number {
  const pct = label.match(/(\d+)%/);
  if (pct) return Math.round((subtotal * parseInt(pct[1], 10)) / 100);
  const flat = label.match(/\$(\d+)/);
  if (flat) return parseInt(flat[1], 10);
  return 0;
}

export default function BookingPanel({ slug }: { slug: string }) {
  const journey = useJourneys().find((j) => j.slug === slug)!;
  const leads = useDB((db) => db.leads);
  const [travellers, setTravellers] = useState(2);
  const [month, setMonth] = useState(months[2].value);
  const [promo, setPromo] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [step, setStep] = useState<"quote" | "details" | "done">("quote");
  const [booking, setBooking] = useState<Booking | null>(null);

  const subtotal = journey.priceFrom * travellers;
  const lead = useMemo(() => leads.find((l) => l.code.toUpperCase() === promo.trim().toUpperCase() && !l.redeemed), [leads, promo]);
  const discount = lead ? discountFor(lead.prizeLabel, subtotal) : 0;
  const total = subtotal - discount;

  if (step === "done" && booking) {
    return (
      <div className="rounded-[24px] border border-gold/30 bg-ink-2 p-8">
        <p className="eyebrow text-gold">Request received</p>
        <p className="mt-3 font-display text-4xl">Thank you, {booking.name.split(" ")[0]}.</p>
        <p className="mt-4 leading-relaxed text-salt/70">
          Your reference is <span className="font-mono text-salt">{booking.id}</span>. A journey designer will write within 24 hours to shape {journey.title} around you. Nothing is charged until you confirm.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={waLink(`Hi Rosario! I just requested ${journey.title} (ref ${booking.id}) for ${booking.travellers} travellers. Can we confirm on WhatsApp?`)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[#25d366] px-5 py-3 text-sm font-medium text-[#07280f]"
          >
            Confirm on WhatsApp
          </a>
          <Link href={`/payments?ref=${booking.id}&amount=${Math.round(booking.total * 0.3)}`} className="rounded-full border border-salt/25 px-5 py-3 text-sm transition hover:border-copper">
            Pay 30% deposit by QR
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border border-line bg-ink-2 p-7">
      <p className="eyebrow text-salt/50">Reserve this journey</p>
      <p className="mt-3 text-sm text-salt/60">
        from <span className="font-display text-4xl text-salt">{formatPrice(journey.priceFrom)}</span> per traveller
      </p>
      {typeof journey.spotsLeft === "number" && journey.spotsLeft > 0 && (
        <p className="mt-2 text-xs text-gold">Only {journey.spotsLeft} places left on next departure</p>
      )}

      {step === "quote" && (
        <div className="mt-7 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-salt/70">Travellers</span>
            <div className="flex items-center gap-4">
              <button onClick={() => setTravellers((t) => Math.max(1, t - 1))} className="flex h-9 w-9 items-center justify-center rounded-full border border-salt/20 hover:border-salt" aria-label="Fewer travellers">
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-6 text-center font-display text-2xl tabular-nums">{travellers}</span>
              <button onClick={() => setTravellers((t) => Math.min(journey.maxGroup, t + 1))} className="flex h-9 w-9 items-center justify-center rounded-full border border-salt/20 hover:border-salt" aria-label="More travellers">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <label className="block">
            <span className="text-sm text-salt/70">Departure month</span>
            <select value={month} onChange={(e) => setMonth(e.target.value)} className="field">
              {months.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-salt/70">Spin the Andes code</span>
            <input value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="ANDES-XXXX" className="field font-mono uppercase" />
            {promo && (
              <span className={`mt-2 block text-xs ${lead ? "text-gold" : "text-salt/40"}`}>
                {lead ? `Applied: ${lead.prizeLabel}` : "Code not recognised (or already used)"}
              </span>
            )}
          </label>
          <div className="space-y-2 border-t border-line pt-5 text-sm">
            <div className="flex justify-between text-salt/60">
              <span>{travellers} × {formatPrice(journey.priceFrom)}</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-gold">
                <span>{lead?.prizeLabel}</span>
                <span>−{formatPrice(discount)}</span>
              </div>
            )}
            {lead && discount === 0 && <div className="text-gold">{lead.prizeLabel} added to your journey</div>}
            <div className="flex items-baseline justify-between pt-2">
              <span>Estimated total</span>
              <span className="font-display text-3xl">{formatPrice(total)}</span>
            </div>
          </div>
          <button onClick={() => setStep("details")} className="w-full rounded-full bg-copper py-4 text-sm font-medium text-ink transition hover:bg-copper-2">
            Continue
          </button>
          <div className="flex justify-center">
            <AskRosario prompt={`I'm interested in ${journey.title}. Can you tell me more?`} label="Questions? Ask Rosario AI" />
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
              date: month,
              total,
              source: lead ? "wheel" : "website",
              promo: lead?.code,
            });
            if (lead) actions.toggleLeadRedeemed(lead.id);
            setBooking(b);
            setStep("done");
          }}
        >
          <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="field" aria-label="Full name" />
          <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="field" aria-label="Email" />
          <input placeholder="Phone / WhatsApp (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="field" aria-label="Phone" />
          <textarea placeholder="Anything we should know? Celebrations, dietary needs, pace…" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="field resize-none" aria-label="Notes" />
          <div className="flex items-baseline justify-between border-t border-line pt-5 text-sm">
            <span className="text-salt/60">{travellers} {travellers === 1 ? "traveller" : "travellers"} · {months.find((m) => m.value === month)?.label}</span>
            <span className="font-display text-2xl">{formatPrice(total)}</span>
          </div>
          <button className="w-full rounded-full bg-copper py-4 text-sm font-medium text-ink transition hover:bg-copper-2">Request this journey</button>
          <button type="button" onClick={() => setStep("quote")} className="w-full text-xs text-salt/50 hover:text-salt">
            ← Back
          </button>
          <p className="text-center text-[0.7rem] leading-relaxed text-salt/40">
            No payment now. A designer confirms availability and sends a tailored proposal. By sending this request you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-2 hover:text-salt">booking conditions</Link> and{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-salt">privacy policy</Link>.
          </p>
        </form>
      )}
    </div>
  );
}
