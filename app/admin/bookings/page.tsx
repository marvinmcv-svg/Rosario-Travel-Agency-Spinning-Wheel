"use client";

import { useMemo, useState } from "react";
import { Mail, Search, Trash2, X } from "lucide-react";
import { formatPrice, journeys } from "@/lib/data";
import { actions, useDB, type Booking, type BookingStatus } from "@/lib/store";
import { AdminHeader } from "@/components/admin/AdminShell";
import { Card, StatusPill, btn, downloadCSV, fmtDate, fmtMonth, statusLabel } from "@/components/admin/ui";

const statuses: (BookingStatus | "all")[] = ["all", "new", "deposit", "confirmed", "cancelled"];
const jt = (slug: string) => journeys.find((j) => j.slug === slug)?.title ?? slug;

export default function BookingsPage() {
  const bookings = useDB((db) => db.bookings);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<(typeof statuses)[number]>("all");
  const [open, setOpen] = useState<Booking | null>(null);

  const list = useMemo(
    () =>
      bookings.filter(
        (b) =>
          (status === "all" || b.status === status) &&
          `${b.id} ${b.name} ${b.email} ${jt(b.journeySlug)}`.toLowerCase().includes(q.toLowerCase()),
      ),
    [bookings, q, status],
  );
  const current = open ? bookings.find((b) => b.id === open.id) ?? null : null;

  return (
    <>
      <AdminHeader
        title="Bookings"
        subtitle={`${bookings.length} total · ${formatPrice(list.reduce((a, b) => a + b.total, 0))} in view`}
        actions={
          <button
            className={btn}
            onClick={() =>
              downloadCSV(
                "rosario-bookings.csv",
                list.map((b) => ({ id: b.id, created: b.createdAt, name: b.name, email: b.email, journey: jt(b.journeySlug), departure: b.date, travellers: b.travellers, total: b.total, status: b.status, source: b.source, promo: b.promo ?? "" })),
              )
            }
          >
            Export CSV
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="flex min-w-64 flex-1 items-center gap-2 rounded-full border border-line bg-ink-2 px-4">
          <Search className="h-4 w-4 text-salt/40" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, reference, journey" className="w-full bg-transparent py-2.5 text-sm outline-none" />
        </label>
        <div className="flex flex-wrap gap-1.5">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-full px-3.5 py-2 text-xs transition ${status === s ? "bg-salt text-ink" : "border border-line text-salt/60 hover:text-salt"}`}
            >
              {s === "all" ? "All" : statusLabel(s)} <span className="opacity-60">{s === "all" ? bookings.length : bookings.filter((b) => b.status === s).length}</span>
            </button>
          ))}
        </div>
      </div>

      <Card className="overflow-x-auto p-0 md:p-0">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="text-xs text-salt/45">
            <tr className="border-b border-line">
              {["Reference", "Traveller", "Journey", "Departure", "Pax", "Total", "Source", "Status"].map((h) => (
                <th key={h} className="px-5 py-3 font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.map((b) => (
              <tr key={b.id} onClick={() => setOpen(b)} className="cursor-pointer transition hover:bg-salt/[0.03]">
                <td className="px-5 py-3.5 font-mono text-xs text-salt/55">{b.id}<br /><span className="font-sans text-salt/35">{fmtDate(b.createdAt)}</span></td>
                <td className="px-5 py-3.5">{b.name}<br /><span className="text-xs text-salt/45">{b.email}</span></td>
                <td className="px-5 py-3.5 text-salt/75">{jt(b.journeySlug)}</td>
                <td className="px-5 py-3.5 text-salt/75">{fmtMonth(b.date)}</td>
                <td className="px-5 py-3.5 tabular-nums">{b.travellers}</td>
                <td className="px-5 py-3.5 tabular-nums">{formatPrice(b.total)}</td>
                <td className="px-5 py-3.5 text-xs text-salt/55">{b.source}</td>
                <td className="px-5 py-3.5"><StatusPill status={b.status} /></td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan={8} className="px-5 py-16 text-center text-salt/45">No bookings match.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      {current && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm" onClick={() => setOpen(null)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-md overflow-y-auto border-l border-line bg-ink-2 p-7 animate-[slidein_.5s_var(--ease-expo)]">
            <style>{`@keyframes slidein{from{transform:translateX(40px);opacity:0}to{transform:none;opacity:1}}`}</style>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-xs text-salt/50">{current.id}</p>
                <p className="mt-1 font-display text-4xl">{current.name}</p>
              </div>
              <button onClick={() => setOpen(null)} className="rounded-full p-2 hover:bg-salt/10" aria-label="Close"><X className="h-4 w-4" /></button>
            </div>
            <dl className="mt-8 divide-y divide-line border-y border-line text-sm">
              {[
                ["Journey", jt(current.journeySlug)],
                ["Departure", fmtMonth(current.date)],
                ["Travellers", current.travellers],
                ["Total", formatPrice(current.total)],
                ["Email", current.email],
                ["Phone", current.phone ?? "—"],
                ["Source", current.source],
                ["Promo", current.promo ?? "—"],
                ["Received", new Date(current.createdAt).toLocaleString()],
              ].map(([k, v]) => (
                <div key={k as string} className="flex justify-between gap-6 py-3">
                  <dt className="text-salt/50">{k}</dt>
                  <dd className="text-right">{v}</dd>
                </div>
              ))}
            </dl>
            {current.notes && <p className="mt-6 rounded-xl bg-salt/[0.04] p-4 text-sm text-salt/75">“{current.notes}”</p>}
            <p className="mt-8 text-xs text-salt/50">Status</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(["new", "deposit", "confirmed", "cancelled"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => actions.setBookingStatus(current.id, s)}
                  className={`rounded-xl border px-3 py-2.5 text-sm transition ${current.status === s ? "border-copper bg-copper/10 text-salt" : "border-line text-salt/60 hover:text-salt"}`}
                >
                  {statusLabel(s)}
                </button>
              ))}
            </div>
            <div className="mt-8 flex gap-2">
              <a href={`mailto:${current.email}?subject=Your ${jt(current.journeySlug)} journey (${current.id})`} className={`${btn} inline-flex items-center gap-2`}>
                <Mail className="h-4 w-4" /> Email traveller
              </a>
              <button
                onClick={() => {
                  if (confirm(`Delete booking ${current.id}? This cannot be undone.`)) {
                    actions.deleteBooking(current.id);
                    setOpen(null);
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
    </>
  );
}
