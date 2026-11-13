"use client";

/* Shared pieces for the hotel sections of the team portal. */
import { useMemo, useState } from "react";
import { BedDouble, CircleCheck, CircleDashed, CircleSlash, DoorClosed, DoorOpen, X, XCircle } from "lucide-react";
import { actions, useDB, type StayBooking, type StaySource, type StayStatus } from "@/lib/store";
import { availability, extrasFor, getHotel, hotels, nightsBetween, parseStayMessage, quoteStay, todayBolivia, addDaysIso, type StayLine } from "@/lib/hotels";
import { staysText } from "@/lib/i18n/stays";
import { formatPrice } from "@/lib/data";
import { btn, btnSolid } from "./ui";

export const T = staysText("en");
export const roomName = (id: string) => T.rooms[id] ?? id;
export const hotelName = (slug: string) => getHotel(slug)?.name.replace("Hotel Boutique ", "").replace("Hotel ", "") ?? slug;

const meta: Record<StayStatus, { label: string; cls: string; Icon: typeof CircleCheck }> = {
  new: { label: "New request", cls: "border-sky-300/30 bg-sky-300/10 text-sky-200", Icon: CircleDashed },
  confirmed: { label: "Confirmed", cls: "border-emerald-300/30 bg-emerald-300/10 text-emerald-200", Icon: CircleCheck },
  "checked-in": { label: "Checked in", cls: "border-amber-300/30 bg-amber-300/10 text-amber-200", Icon: DoorOpen },
  "checked-out": { label: "Checked out", cls: "border-salt/20 bg-salt/[0.06] text-salt/70", Icon: DoorClosed },
  cancelled: { label: "Cancelled", cls: "border-red-300/30 bg-red-300/10 text-red-200", Icon: XCircle },
  "no-show": { label: "No-show", cls: "border-red-300/30 bg-red-300/10 text-red-200", Icon: CircleSlash },
};
export const STAY_STATUSES = Object.keys(meta) as StayStatus[];
export const stayStatusLabel = (s: StayStatus) => meta[s].label;
export const SOURCES: Record<StaySource, string> = { website: "Website", whatsapp: "WhatsApp", phone: "Phone", "walk-in": "Walk-in", journey: "Journey" };

export function StayStatusPill({ status }: { status: StayStatus }) {
  const m = meta[status];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs ${m.cls}`}>
      <m.Icon className="h-3.5 w-3.5" /> {m.label}
    </span>
  );
}

export const fmtDay = (iso: string) =>
  new Date(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10))).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });

/** Holds a room tonight? (arrived or arriving, not yet gone) */
export const inHouseOn = (s: StayBooking, night: string) => s.status !== "cancelled" && s.status !== "no-show" && s.checkIn <= night && night < s.checkOut;

type Draft = Omit<StayBooking, "createdAt"> & { createdAt?: string };

const blank = (): Draft => {
  const today = todayBolivia();
  return {
    id: "",
    hotel: hotels[0].slug,
    room: hotels[0].rooms[0].id,
    rooms: 1,
    guests: 2,
    checkIn: today,
    checkOut: addDaysIso(today, 1),
    name: "",
    email: "",
    phone: "",
    notes: "",
    extras: [],
    total: 0,
    status: "confirmed",
    source: "phone",
  };
};

/**
 * New / edit / import a reservation. Prices default to the live rate card;
 * the team can override the total (packages, discounts).
 */
export function StayForm({ initial, mode, onClose }: { initial?: Partial<Draft>; mode: "new" | "edit" | "import"; onClose: () => void }) {
  const overrides = useDB((db) => db.hotelOverrides);
  const stays = useDB((db) => db.stays);
  const [d, setD] = useState<Draft>(() => ({ ...blank(), ...initial }));
  const [manualTotal, setManualTotal] = useState(mode !== "new");
  const [err, setErr] = useState<string | null>(null);
  const h = getHotel(d.hotel)!;
  const nights = nightsBetween(d.checkIn, d.checkOut);
  const quote = quoteStay(d, overrides);
  const total = manualTotal ? d.total : quote.total;
  const others = useMemo(() => stays.filter((s) => s.id !== d.id), [stays, d.id]);
  const free = nights > 0 ? availability(others, d.hotel, d.checkIn, d.checkOut, overrides)[d.room] ?? 0 : 0;
  const set = (p: Partial<Draft>) => setD((x) => ({ ...x, ...p }));
  const field = "field py-2 text-sm text-salt";
  const lab = "block text-xs text-salt/50";

  const save = () => {
    if (!d.name.trim()) return setErr("Add the guest's name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) return setErr("Add a valid email (use the hotel's address if the guest has none).");
    if (!(nights >= 1)) return setErr("Check-out must be after check-in.");
    if (d.guests > (h.rooms.find((r) => r.id === d.room)?.guests ?? 0) * d.rooms) return setErr("Too many guests for those rooms.");
    if (free < d.rooms && !confirm(`Only ${free} of these rooms are free for those nights. Save anyway (overbooking)?`)) return;
    const clean = { ...d, name: d.name.trim(), email: d.email.trim(), phone: d.phone?.trim() || undefined, notes: d.notes?.trim() || undefined, total };
    if (mode === "edit") actions.updateStay(d.id, clean);
    else {
      if (mode === "import" && stays.some((s) => s.id === d.id) && !confirm(`${d.id} is already in the portal. Replace it with this message?`)) return;
      const { id, createdAt: _c, ...rest } = clean;
      void _c;
      actions.createStay({ ...rest, id: id || undefined });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 w-full max-w-xl overflow-y-auto border-l border-line bg-ink-2 p-6 md:p-8" role="dialog" aria-label="Reservation">
        <div className="flex items-start justify-between">
          <div>
            <p className="eyebrow text-salt/45">{mode === "edit" ? d.id : mode === "import" ? `Imported from WhatsApp · ${d.id}` : "New reservation"}</p>
            <p className="mt-1 font-display text-4xl">{mode === "edit" ? "Edit stay" : "Reservation"}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-salt/10" aria-label="Close"><X className="h-4 w-4" /></button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className={`${lab} sm:col-span-2`}>Hotel
            <select value={d.hotel} onChange={(e) => { const nh = getHotel(e.target.value)!; set({ hotel: nh.slug, room: nh.rooms[0].id, extras: [] }); }} className={field}>
              {hotels.map((x) => <option key={x.slug} value={x.slug} className="bg-ink">{x.name}</option>)}
            </select>
          </label>
          <label className={`${lab} sm:col-span-2`}>Room type
            <select value={d.room} onChange={(e) => set({ room: e.target.value })} className={field}>
              {h.rooms.map((r) => <option key={r.id} value={r.id} className="bg-ink">{roomName(r.id)} (up to {r.guests})</option>)}
            </select>
          </label>
          <label className={lab}>Check-in<input type="date" value={d.checkIn} onChange={(e) => set({ checkIn: e.target.value, checkOut: e.target.value >= d.checkOut ? addDaysIso(e.target.value, 1) : d.checkOut })} className={`${field} [color-scheme:dark]`} /></label>
          <label className={lab}>Check-out<input type="date" value={d.checkOut} min={addDaysIso(d.checkIn, 1)} onChange={(e) => set({ checkOut: e.target.value })} className={`${field} [color-scheme:dark]`} /></label>
          <label className={lab}>Rooms<input type="number" min={1} max={10} value={d.rooms} onChange={(e) => set({ rooms: Math.max(1, Math.min(10, +e.target.value || 1)) })} className={field} /></label>
          <label className={lab}>Guests<input type="number" min={1} max={60} value={d.guests} onChange={(e) => set({ guests: Math.max(1, Math.min(60, +e.target.value || 1)) })} className={field} /></label>
        </div>
        <p className={`mt-3 text-xs ${free >= d.rooms ? "text-emerald-200/80" : "text-amber-200"}`}>
          {nights > 0 ? `${nights} night${nights > 1 ? "s" : ""} · ${free} of this room type free for every night` : "Pick valid dates"}
        </p>

        <p className={`${lab} mt-6`}>Extras</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {extrasFor(d.hotel).map((e) => {
            const on = d.extras.find((x) => x.id === e.id);
            return (
              <label key={e.id} className="flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-xs">
                <input type="checkbox" checked={!!on} onChange={() => set({ extras: on ? d.extras.filter((x) => x.id !== e.id) : [...d.extras, { id: e.id, qty: 1 } as StayLine] })} className="accent-[#c77922]" />
                <span className="flex-1">{T.extras[e.id]}</span>
                <span className="text-salt/50">{formatPrice(e.price)} {T.per[e.per]}</span>
              </label>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className={lab}>Guest name<input value={d.name} onChange={(e) => set({ name: e.target.value })} className={field} /></label>
          <label className={lab}>Email<input type="email" value={d.email} onChange={(e) => set({ email: e.target.value })} className={field} /></label>
          <label className={lab}>Phone / WhatsApp<input value={d.phone ?? ""} onChange={(e) => set({ phone: e.target.value })} className={field} /></label>
          <label className={lab}>Source
            <select value={d.source} onChange={(e) => set({ source: e.target.value as StaySource })} className={field}>
              {(Object.keys(SOURCES) as StaySource[]).map((s) => <option key={s} value={s} className="bg-ink">{SOURCES[s]}</option>)}
            </select>
          </label>
          <label className={`${lab} sm:col-span-2`}>Notes<textarea rows={2} value={d.notes ?? ""} onChange={(e) => set({ notes: e.target.value })} className={`${field} resize-none`} /></label>
          <label className={lab}>Status
            <select value={d.status} onChange={(e) => set({ status: e.target.value as StayStatus })} className={field}>
              {STAY_STATUSES.map((s) => <option key={s} value={s} className="bg-ink">{stayStatusLabel(s)}</option>)}
            </select>
          </label>
          <label className={lab}>Total (USD)
            <input type="number" min={0} value={total} onChange={(e) => { setManualTotal(true); set({ total: Math.max(0, +e.target.value || 0) }); }} className={field} />
            <span className="mt-1 block text-[0.7rem] text-salt/40">
              Rate card: {formatPrice(quote.total)}{" "}
              {manualTotal && total !== quote.total && <button type="button" onClick={() => setManualTotal(false)} className="text-copper-2 underline">use rate card</button>}
            </span>
          </label>
        </div>

        {err && <p className="mt-5 text-sm text-red-300" role="alert">{err}</p>}
        <div className="mt-7 flex gap-2">
          <button onClick={save} className={btnSolid} data-testid="stay-save">Save reservation</button>
          <button onClick={onClose} className={btn}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

/** Paste a WhatsApp booking message; the #RS-… code line fills in the reservation. */
export function ImportWhatsApp({ onParsed, onClose }: { onParsed: (d: Partial<Draft>) => void; onClose: () => void }) {
  const [text, setText] = useState("");
  const [err, setErr] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-[24px] border border-line bg-ink-2 p-6" role="dialog" aria-label="Import from WhatsApp">
        <p className="flex items-center gap-2 font-display text-3xl"><BedDouble className="h-6 w-6 text-[#25d366]" /> Import from WhatsApp</p>
        <p className="mt-2 text-sm text-salt/60">
          Copy the guest&apos;s booking message in WhatsApp (it ends with a line starting <span className="font-mono">#RS-</span>) and paste it here. Room, dates, extras, name, email and phone are filled in for you to check.
        </p>
        <textarea autoFocus rows={9} value={text} onChange={(e) => { setText(e.target.value); setErr(false); }} placeholder="Paste the WhatsApp message…" className="field mt-4 resize-none font-mono text-xs text-salt" data-testid="import-text" />
        {err && <p className="mt-3 text-sm text-red-300">No booking code found. Make sure the message includes the last line that starts with #RS-.</p>}
        <div className="mt-5 flex gap-2">
          <button
            className={btnSolid}
            data-testid="import-read"
            onClick={() => {
              const p = parseStayMessage(text);
              if (!p) return setErr(true);
              onParsed({ ...p, status: "new", source: "whatsapp" });
            }}
          >
            Read message
          </button>
          <button onClick={onClose} className={btn}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
