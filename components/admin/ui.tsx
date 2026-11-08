"use client";

import type { ReactNode } from "react";
import { CheckCircle2, CircleDashed, CircleDollarSign, XCircle } from "lucide-react";
import type { BookingStatus } from "@/lib/store";

/* Status always ships with an icon + label, never colour alone. */
const statusMeta: Record<BookingStatus, { label: string; cls: string; Icon: typeof CheckCircle2 }> = {
  new: { label: "New", cls: "border-sky-300/30 bg-sky-300/10 text-sky-200", Icon: CircleDashed },
  deposit: { label: "Deposit paid", cls: "border-amber-300/30 bg-amber-300/10 text-amber-200", Icon: CircleDollarSign },
  confirmed: { label: "Confirmed", cls: "border-emerald-300/30 bg-emerald-300/10 text-emerald-200", Icon: CheckCircle2 },
  cancelled: { label: "Cancelled", cls: "border-red-300/30 bg-red-300/10 text-red-200", Icon: XCircle },
};

export function StatusPill({ status }: { status: BookingStatus }) {
  const m = statusMeta[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${m.cls}`}>
      <m.Icon className="h-3.5 w-3.5" /> {m.label}
    </span>
  );
}
export const statusLabel = (s: BookingStatus) => statusMeta[s].label;

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`admin-card p-5 md:p-6 ${className}`}>{children}</div>;
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <Card>
      <p className="text-xs text-salt/50">{label}</p>
      <p className="mt-3 font-display text-4xl tabular-nums">{value}</p>
      {hint && <p className="mt-2 text-xs text-salt/45">{hint}</p>}
    </Card>
  );
}

export const btn = "rounded-full border border-salt/20 px-4 py-2 text-sm transition hover:border-salt/60";
export const btnSolid = "rounded-full bg-copper px-4 py-2 text-sm font-medium text-ink transition hover:bg-copper-2";

export const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
/** "2027-02" → "Feb 27"; a full departure date "2027-02-06" → "Feb 6, 27". */
export const fmtMonth = (ym: string) => {
  const [y, m, d] = ym.split("-").map(Number);
  return new Date(y, m - 1, d || 1).toLocaleDateString("en-US", d ? { month: "short", day: "numeric", year: "2-digit" } : { month: "short", year: "2-digit" });
};

export function downloadCSV(name: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [keys.join(","), ...rows.map((r) => keys.map((k) => esc(r[k])).join(","))].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}
