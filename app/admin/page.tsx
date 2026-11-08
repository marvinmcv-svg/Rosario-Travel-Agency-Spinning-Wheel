"use client";

import Link from "next/link";
import { useMemo } from "react";
import { formatPrice, journeys } from "@/lib/data";
import { useDB } from "@/lib/store";
import { AdminHeader } from "@/components/admin/AdminShell";
import RevenueChart from "@/components/admin/RevenueChart";
import { Card, Stat, StatusPill, fmtDate } from "@/components/admin/ui";

const sourceLabel = { website: "Website", "rosario-ai": "Rosario AI", wheel: "Spin the Andes" } as const;

export default function Overview() {
  const bookings = useDB((db) => db.bookings);
  const inquiries = useDB((db) => db.inquiries);
  const leads = useDB((db) => db.leads);
  const conversations = useDB((db) => db.conversations);

  const s = useMemo(() => {
    const live = bookings.filter((b) => b.status === "confirmed" || b.status === "deposit");
    const pipeline = live.reduce((a, b) => a + b.total, 0);
    const weekAgo = Date.now() - 7 * 86400000;
    const recent = bookings.filter((b) => new Date(b.createdAt).getTime() > weekAgo).length;
    const byMonth = new Map<string, { value: number; count: number }>();
    live.forEach((b) => {
      const key = b.date.slice(0, 7); // departures are full dates; chart by month
      const m = byMonth.get(key) ?? { value: 0, count: 0 };
      byMonth.set(key, { value: m.value + b.total, count: m.count + 1 });
    });
    const months = [...byMonth.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([month, v]) => ({ month, ...v }));
    const sources = (Object.keys(sourceLabel) as (keyof typeof sourceLabel)[]).map((k) => ({ k, n: bookings.filter((b) => b.source === k).length }));
    const travellers = live.reduce((a, b) => a + b.travellers, 0);
    return { pipeline, recent, months, sources, travellers, liveCount: live.length };
  }, [bookings]);

  const maxSource = Math.max(1, ...s.sources.map((x) => x.n));

  return (
    <>
      <AdminHeader title="Good day" subtitle={new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Confirmed revenue" value={formatPrice(s.pipeline)} hint={`${s.liveCount} bookings · ${s.travellers} travellers`} />
        <Stat label="New bookings (7 days)" value={s.recent} hint={`${bookings.filter((b) => b.status === "new").length} awaiting a designer`} />
        <Stat label="Open inquiries" value={inquiries.filter((q) => q.status === "open").length} hint="Reply within 24 h" />
        <Stat label="Rosario AI conversations" value={conversations.length} hint={`${leads.length} wheel leads captured`} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="mb-4 flex items-baseline justify-between">
            <p className="font-medium">Revenue by departure month</p>
            <p className="text-xs text-salt/45">Confirmed + deposit</p>
          </div>
          <RevenueChart data={s.months} />
        </Card>
        <Card>
          <p className="mb-5 font-medium">Where bookings come from</p>
          <div className="space-y-5">
            {s.sources.map((x) => (
              <div key={x.k}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-salt/75">{sourceLabel[x.k]}</span>
                  <span className="tabular-nums text-salt">{x.n}</span>
                </div>
                <div className="h-2 rounded-full bg-salt/[0.06]">
                  <div className="h-2 rounded-full bg-copper transition-all duration-700" style={{ width: `${(x.n / maxSource) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 border-t border-line pt-5">
            {(["new", "deposit", "confirmed", "cancelled"] as const).map((st) => (
              <div key={st} className="flex items-center justify-between gap-2">
                <StatusPill status={st} />
                <span className="tabular-nums text-sm">{bookings.filter((b) => b.status === st).length}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-medium">Latest bookings</p>
            <Link href="/admin/bookings" className="text-xs text-copper-2 hover:underline">All bookings →</Link>
          </div>
          <div className="divide-y divide-line">
            {bookings.slice(0, 6).map((b) => (
              <div key={b.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 text-sm">
                <span className="w-20 font-mono text-xs text-salt/50">{b.id}</span>
                <span className="min-w-36 flex-1">{b.name}</span>
                <span className="hidden flex-1 text-salt/55 md:block">{journeys.find((j) => j.slug === b.journeySlug)?.title}</span>
                <span className="w-24 text-right tabular-nums">{formatPrice(b.total)}</span>
                <StatusPill status={b.status} />
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <p className="font-medium">Inbox</p>
            <Link href="/admin/inquiries" className="text-xs text-copper-2 hover:underline">Open inbox →</Link>
          </div>
          <div className="space-y-4">
            {inquiries.slice(0, 4).map((q) => (
              <div key={q.id} className="text-sm">
                <div className="flex justify-between">
                  <span>{q.name}</span>
                  <span className="text-xs text-salt/40">{fmtDate(q.createdAt)}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-salt/55">{q.message}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
