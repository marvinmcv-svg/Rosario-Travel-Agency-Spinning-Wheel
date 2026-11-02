"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { CalendarCheck, Disc3, Inbox, LayoutDashboard, LogOut, Map, Menu, MessagesSquare, Settings, Users, X } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { useDB } from "@/lib/store";

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck, badge: "bookings" as const },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox, badge: "inquiries" as const },
  { href: "/admin/journeys", label: "Journeys", icon: Map },
  { href: "/admin/wheel", label: "Spin the Andes", icon: Disc3 },
  { href: "/admin/conversations", label: "Rosario AI", icon: MessagesSquare },
  { href: "/admin/audience", label: "Audience", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function Login({ onDone }: { onDone: () => void }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-ink px-5">
      <div className="pointer-events-none absolute inset-0 bg-[url('/images/uyuni-mirror.webp')] bg-cover bg-center opacity-25" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/40" />
      <form
        className="relative w-full max-w-sm rounded-[26px] border border-line bg-ink-2/80 p-8 backdrop-blur-2xl"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setErr(false);
          const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ passcode: code }) });
          setBusy(false);
          if (r.ok) onDone();
          else setErr(true);
        }}
      >
        <p className="font-display text-4xl">Rosario</p>
        <p className="eyebrow mt-2 text-salt/50">Team portal</p>
        <label className="mt-10 block">
          <span className="text-sm text-salt/60">Passcode</span>
          <input type="password" autoFocus value={code} onChange={(e) => setCode(e.target.value)} className="field" aria-invalid={err} />
        </label>
        {err && <p className="mt-3 text-sm text-red-300">That passcode didn't match.</p>}
        <button disabled={busy || !code} className="mt-8 w-full rounded-full bg-copper py-3.5 text-sm font-medium text-ink transition hover:bg-copper-2 disabled:opacity-50">
          {busy ? "Checking…" : "Enter"}
        </button>
        <p className="mt-5 text-center text-xs text-salt/40">Demo passcode: <span className="font-mono text-salt/60">rosario</span></p>
      </form>
    </div>
  );
}

export default function AdminShell({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [drawer, setDrawer] = useState(false);
  const pathname = usePathname();
  const content = useRef<HTMLDivElement>(null);
  const newBookings = useDB((db) => db.bookings).filter((b) => b.status === "new").length;
  const openInquiries = useDB((db) => db.inquiries).filter((q) => q.status === "open").length;
  const badges = { bookings: newBookings, inquiries: openInquiries };

  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((d) => setAuthed(Boolean(d.authed)))
      .catch(() => setAuthed(false));
  }, []);

  // Each section eases in so moving around the portal feels continuous.
  useEffect(() => {
    setDrawer(false);
    if (content.current) gsap.fromTo(content.current, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6 });
  }, [pathname, authed]);

  if (authed === null) return <div className="min-h-svh bg-ink" />;
  if (!authed) return <Login onDone={() => setAuthed(true)} />;

  const Side = (
    <aside className="flex h-full flex-col gap-1 p-4">
      <Link href="/admin" className="mb-6 px-3 pt-2">
        <span className="font-display text-3xl">Rosario</span>
        <span className="eyebrow ml-2 text-[0.55rem] text-salt/40">Team</span>
      </Link>
      {nav.map((n) => {
        const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
        const count = n.badge ? badges[n.badge] : 0;
        return (
          <Link
            key={n.href}
            href={n.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${active ? "bg-salt/[0.08] text-salt" : "text-salt/55 hover:bg-salt/[0.04] hover:text-salt"}`}
          >
            <n.icon className="h-4 w-4" />
            <span className="flex-1">{n.label}</span>
            {count > 0 && <span className="rounded-full bg-copper px-2 py-0.5 text-[0.65rem] font-medium text-ink">{count}</span>}
          </Link>
        );
      })}
      <div className="mt-auto space-y-1 border-t border-line pt-4">
        <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-salt/55 hover:text-salt">
          ← View website
        </Link>
        <button
          onClick={async () => {
            await fetch("/api/admin/logout", { method: "POST" });
            setAuthed(false);
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-salt/55 hover:text-salt"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-svh bg-ink text-salt">
      <div className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-ink lg:block">{Side}</div>
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-ink/80 px-4 py-3 backdrop-blur lg:hidden">
        <span className="font-display text-2xl">Rosario</span>
        <button onClick={() => setDrawer(true)} aria-label="Open navigation" className="rounded-lg p-2 hover:bg-salt/10">
          <Menu className="h-5 w-5" />
        </button>
      </div>
      {drawer && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink/70" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 left-0 w-72 border-r border-line bg-ink">
            <button onClick={() => setDrawer(false)} className="absolute right-3 top-3 rounded-lg p-2 hover:bg-salt/10" aria-label="Close navigation">
              <X className="h-5 w-5" />
            </button>
            {Side}
          </div>
        </div>
      )}
      <div className="lg:pl-64">
        <div ref={content} className="mx-auto max-w-[1400px] px-4 py-8 md:px-8 md:py-10">
          {children}
        </div>
      </div>
    </div>
  );
}

/* Shared header used by every admin page */
export function AdminHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-5xl">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-salt/55">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
