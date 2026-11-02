"use client";

import { useDB } from "@/lib/store";
import { AdminHeader } from "@/components/admin/AdminShell";
import { Card, btn, downloadCSV, fmtDate } from "@/components/admin/ui";

export default function AudienceAdmin() {
  const subs = useDB((db) => db.subscribers);
  const leads = useDB((db) => db.leads);
  const bookings = useDB((db) => db.bookings);
  const people = new Map<string, { email: string; sources: Set<string>; first: string }>();
  const add = (email: string, src: string, at: string) => {
    const p = people.get(email) ?? { email, sources: new Set<string>(), first: at };
    p.sources.add(src);
    if (at < p.first) p.first = at;
    people.set(email, p);
  };
  subs.forEach((s) => add(s.email, "Newsletter", s.createdAt));
  leads.forEach((l) => add(l.email, "Wheel", l.createdAt));
  bookings.forEach((b) => add(b.email, "Booking", b.createdAt));
  const rows = [...people.values()].sort((a, b) => b.first.localeCompare(a.first));

  return (
    <>
      <AdminHeader
        title="Audience"
        subtitle={`${rows.length} people · ${subs.length} newsletter subscribers`}
        actions={<button className={btn} onClick={() => downloadCSV("rosario-audience.csv", rows.map((r) => ({ email: r.email, sources: [...r.sources].join(" + "), first_seen: r.first })))}>Export CSV</button>}
      />
      <Card className="p-0 md:p-0">
        <div className="divide-y divide-line text-sm">
          {rows.map((r) => (
            <div key={r.email} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
              <span className="min-w-56 flex-1">{r.email}</span>
              <span className="flex gap-1.5">
                {[...r.sources].map((s) => (
                  <span key={s} className="rounded-full border border-line px-2.5 py-0.5 text-xs text-salt/60">{s}</span>
                ))}
              </span>
              <span className="w-20 text-right text-xs text-salt/45">{fmtDate(r.first)}</span>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
