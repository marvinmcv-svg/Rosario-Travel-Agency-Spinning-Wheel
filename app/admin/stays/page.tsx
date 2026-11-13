"use client";

import { useMemo, useState } from "react";
import { Mail, MessageCircle, Pencil, Search, Trash2, X } from "lucide-react";
import { formatPrice } from "@/lib/data";
import { actions, useDB, type StayBooking, type StayStatus } from "@/lib/store";
import { hotels, nightsBetween, todayBolivia } from "@/lib/hotels";
import { guestMessage, waTo } from "@/lib/stay-message";
import { AdminHeader } from "@/components/admin/AdminShell";
import { Card, btn, btnSolid, downloadCSV, fmtDate } from "@/components/admin/ui";
import { ImportWhatsApp, SOURCES, STAY_STATUSES, StayForm, StayStatusPill, T, fmtDay, hotelName, roomName, stayStatusLabel } from "@/components/admin/stays-ui";

type When = "upcoming" | "inhouse" | "past" | "all";
type Editing = { mode: "new" | "edit" | "import"; initial?: Partial<StayBooking> } | null;

export default function StaysAdmin() {
  const stays = useDB((db) => db.stays);
  const [q, setQ] = useState("");
  const [hotel, setHotel] = useState("all");
  const [status, setStatus] = useState<StayStatus | "all">("all");
  const [when, setWhen] = useState<When>("upcoming");
  const [openId, setOpenId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Editing>(null);
  const [importing, setImporting] = useState(false);
  const [msgLang, setMsgLang] = useState<"es" | "en">("es");
  const today = todayBolivia();

  const list = useMemo(
    () =>
      stays
        .filter((s) => hotel === "all" || s.hotel === hotel)
        .filter((s) => status === "all" || s.status === status)
        .filter((s) =>
          when === "all" ? true : when === "upcoming" ? s.checkIn >= today : when === "inhouse" ? s.checkIn <= today && today < s.checkOut : s.checkOut <= today,
        )
        .filter((s) => `${s.id} ${s.name} ${s.email} ${s.phone ?? ""} ${hotelName(s.hotel)} ${roomName(s.room)}`.toLowerCase().includes(q.toLowerCase()))
        .sort((a, b) => (when === "past" ? b.checkIn.localeCompare(a.checkIn) : a.checkIn.localeCompare(b.checkIn))),
    [stays, hotel, status, when, q, today],
  );
  const current = openId ? stays.find((s) => s.id === openId) ?? null : null;
  const live = list.filter((s) => s.status !== "cancelled" && s.status !== "no-show");

  return (
    <>
      <AdminHeader
        title="Hotel stays"
        subtitle={`${stays.length} reservations · ${formatPrice(live.reduce((a, s) => a + s.total, 0))} in view · ${stays.filter((s) => s.status === "new").length} waiting for confirmation`}
        actions={
          <>
            <button className={`${btn} inline-flex items-center gap-2`} onClick={() => setImporting(true)} data-testid="open-import">
              <MessageCircle className="h-4 w-4 text-[#25d366]" /> Import from WhatsApp
            </button>
            <button className={btnSolid} onClick={() => setEditing({ mode: "new" })} data-testid="new-stay">New reservation</button>
            <button
              className={btn}
              onClick={() =>
                downloadCSV(
                  "rosario-hotel-stays.csv",
                  list.map((s) => ({
                    ref: s.id, created: s.createdAt, hotel: hotelName(s.hotel), room: roomName(s.room), rooms: s.rooms, guests: s.guests,
                    check_in: s.checkIn, check_out: s.checkOut, nights: nightsBetween(s.checkIn, s.checkOut), name: s.name, email: s.email,
                    phone: s.phone ?? "", extras: s.extras.map((e) => `${T.extras[e.id] ?? e.id} x${e.qty}`).join("; "), total: s.total,
                    status: s.status, source: s.source, notes: s.notes ?? "",
                  })),
                )
              }
            >
              Export CSV
            </button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="flex min-w-64 flex-1 items-center gap-2 rounded-full border border-line bg-ink-2 px-4">
          <Search className="h-4 w-4 text-salt/40" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search guest, email, phone, reference" className="w-full bg-transparent py-2.5 text-sm outline-none" />
        </label>
        <select value={hotel} onChange={(e) => setHotel(e.target.value)} className="rounded-full border border-line bg-ink-2 px-4 py-2.5 text-sm" aria-label="Hotel">
          <option value="all">All hotels</option>
          {hotels.map((h) => <option key={h.slug} value={h.slug}>{hotelName(h.slug)}</option>)}
        </select>
        <div className="flex gap-1 rounded-full border border-line p-1">
          {(["upcoming", "inhouse", "past", "all"] as When[]).map((w) => (
            <button key={w} onClick={() => setWhen(w)} className={`rounded-full px-3.5 py-1.5 text-xs transition ${when === w ? "bg-salt text-ink" : "text-salt/60 hover:text-salt"}`}>
              {{ upcoming: "Upcoming", inhouse: "In house", past: "Past", all: "All dates" }[w]}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {(["all", ...STAY_STATUSES] as const).map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`rounded-full px-3.5 py-2 text-xs transition ${status === s ? "bg-salt text-ink" : "border border-line text-salt/60 hover:text-salt"}`}>
            {s === "all" ? "All" : stayStatusLabel(s)} <span className="opacity-60">{s === "all" ? stays.length : stays.filter((x) => x.status === s).length}</span>
          </button>
        ))}
      </div>

      <Card className="overflow-x-auto p-0 md:p-0">
        <table className="w-full min-w-[900px] text-left text-sm" data-testid="stays-table">
          <thead className="text-xs text-salt/45">
            <tr className="border-b border-line">
              {["Reference", "Guest", "Hotel · room", "Stay", "Guests", "Total", "Source", "Status"].map((h) => <th key={h} className="px-5 py-3 font-normal">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.map((s) => {
              const n = nightsBetween(s.checkIn, s.checkOut);
              return (
                <tr key={s.id} onClick={() => setOpenId(s.id)} className="cursor-pointer transition hover:bg-salt/[0.03]">
                  <td className="px-5 py-3.5 font-mono text-xs text-salt/55">{s.id}<br /><span className="font-sans text-salt/35">{fmtDate(s.createdAt)}</span></td>
                  <td className="px-5 py-3.5">{s.name}<br /><span className="text-xs text-salt/45">{s.phone ?? s.email}</span></td>
                  <td className="px-5 py-3.5 text-salt/75">{hotelName(s.hotel)}<br /><span className="text-xs text-salt/45">{s.rooms} × {roomName(s.room)}</span></td>
                  <td className="px-5 py-3.5 text-salt/75">{fmtDay(s.checkIn)} → {fmtDay(s.checkOut)}<br /><span className="text-xs text-salt/45">{n} night{n > 1 ? "s" : ""}{s.checkIn === today ? " · arriving today" : ""}</span></td>
                  <td className="px-5 py-3.5 tabular-nums">{s.guests}</td>
                  <td className="px-5 py-3.5 tabular-nums">{formatPrice(s.total)}</td>
                  <td className="px-5 py-3.5 text-xs text-salt/55">{SOURCES[s.source]}</td>
                  <td className="px-5 py-3.5"><StayStatusPill status={s.status} /></td>
                </tr>
              );
            })}
            {list.length === 0 && <tr><td colSpan={8} className="px-5 py-16 text-center text-salt/45">No reservations match.</td></tr>}
          </tbody>
        </table>
      </Card>

      {current && !editing && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm" onClick={() => setOpenId(null)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-md overflow-y-auto border-l border-line bg-ink-2 p-7" data-testid="stay-drawer">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-xs text-salt/50">{current.id}</p>
                <p className="mt-1 font-display text-4xl">{current.name}</p>
              </div>
              <button onClick={() => setOpenId(null)} className="rounded-full p-2 hover:bg-salt/10" aria-label="Close"><X className="h-4 w-4" /></button>
            </div>
            <dl className="mt-6 divide-y divide-line border-y border-line text-sm">
              {[
                ["Hotel", hotelName(current.hotel)],
                ["Room", `${current.rooms} × ${roomName(current.room)}`],
                ["Check-in", fmtDay(current.checkIn)],
                ["Check-out", fmtDay(current.checkOut)],
                ["Guests", current.guests],
                ["Extras", current.extras.length ? current.extras.map((e) => `${T.extras[e.id] ?? e.id}${e.qty > 1 ? ` ×${e.qty}` : ""}`).join(", ") : "—"],
                ["Total", formatPrice(current.total)],
                ["Email", current.email],
                ["Phone", current.phone ?? "—"],
                ["Source", SOURCES[current.source]],
                ["Received", new Date(current.createdAt).toLocaleString()],
              ].map(([k, v]) => (
                <div key={k as string} className="flex justify-between gap-6 py-3">
                  <dt className="text-salt/50">{k}</dt>
                  <dd className="text-right">{v}</dd>
                </div>
              ))}
            </dl>
            {current.notes && <p className="mt-5 whitespace-pre-line rounded-xl bg-salt/[0.04] p-4 text-sm text-salt/75">“{current.notes}”</p>}

            <p className="mt-7 text-xs text-salt/50">Status</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {STAY_STATUSES.map((s) => (
                <button key={s} onClick={() => actions.setStayStatus(current.id, s)} className={`rounded-xl border px-3 py-2.5 text-sm transition ${current.status === s ? "border-copper bg-copper/10 text-salt" : "border-line text-salt/60 hover:text-salt"}`}>
                  {stayStatusLabel(s)}
                </button>
              ))}
            </div>

            <div className="mt-7 flex items-center justify-between">
              <p className="text-xs text-salt/50">Message the guest on WhatsApp</p>
              <div className="flex gap-1 rounded-full border border-line p-0.5 text-xs">
                {(["es", "en"] as const).map((l) => (
                  <button key={l} onClick={() => setMsgLang(l)} className={`rounded-full px-2.5 py-1 ${msgLang === l ? "bg-salt text-ink" : "text-salt/60"}`}>{l.toUpperCase()}</button>
                ))}
              </div>
            </div>
            {current.phone ? (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(["confirm", "reminder", "cancel"] as const).map((k) => (
                  <a
                    key={k}
                    href={waTo(current.phone!, guestMessage(k, current, msgLang))}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid={`wa-${k}`}
                    onClick={() => {
                      if (k === "confirm" && current.status === "new") actions.setStayStatus(current.id, "confirmed");
                      if (k === "cancel") actions.setStayStatus(current.id, "cancelled");
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-[#25d366]/40 px-2 py-2.5 text-xs text-[#25d366] transition hover:bg-[#25d366]/10"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> {{ confirm: "Confirm", reminder: "Reminder", cancel: "Cancel" }[k]}
                  </a>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-salt/45">No phone number on this reservation. Add one with Edit.</p>
            )}
            <p className="mt-2 text-[0.7rem] text-salt/40">“Confirm” also marks the stay confirmed; “Cancel” marks it cancelled.</p>

            <div className="mt-7 flex flex-wrap gap-2">
              <button onClick={() => setEditing({ mode: "edit", initial: current })} className={`${btn} inline-flex items-center gap-2`}><Pencil className="h-4 w-4" /> Edit</button>
              <a href={`mailto:${current.email}?subject=${encodeURIComponent(`${hotelName(current.hotel)} · ${current.id}`)}&body=${encodeURIComponent(guestMessage("confirm", current, msgLang))}`} className={`${btn} inline-flex items-center gap-2`}>
                <Mail className="h-4 w-4" /> Email
              </a>
              <button
                onClick={() => {
                  if (confirm(`Delete reservation ${current.id}? This cannot be undone.`)) {
                    actions.deleteStay(current.id);
                    setOpenId(null);
                  }
                }}
                className="inline-flex items-center gap-2 rounded-full border border-red-300/30 px-4 py-2 text-sm text-red-200 hover:bg-red-300/10"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {importing && (
        <ImportWhatsApp
          onClose={() => setImporting(false)}
          onParsed={(d) => {
            setImporting(false);
            setEditing({ mode: "import", initial: d });
          }}
        />
      )}
      {editing && <StayForm mode={editing.mode} initial={editing.initial} onClose={() => setEditing(null)} />}
    </>
  );
}
