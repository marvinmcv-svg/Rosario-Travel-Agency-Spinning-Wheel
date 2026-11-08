"use client";

/* ──────────────────────────────────────────────────────────────
   Rosario data store.

   One small, typed persistence layer shared by the public site and
   the admin portal. Every component talks to this module only.

   Two modes:
   • Shared (production): when Supabase is configured on the server
     (SUPABASE_URL + SUPABASE_SECRET_KEY), visitors' bookings, inquiries,
     wheel leads, chats and sign-ups are sent to /api/store and saved in
     the database; the team portal loads and edits them via
     /api/admin/store. Submissions that fail (offline, server error) wait
     in an outbox in the browser and are retried.
   • Demo: without Supabase everything lives in this browser's
     localStorage, seeded with sample data so the portal has content.
   ────────────────────────────────────────────────────────────── */

import { useSyncExternalStore } from "react";
import { defaultWheelPrizes, journeys, type WheelPrize } from "./data";
import { useI18n } from "@/components/i18n";

export type BookingStatus = "new" | "confirmed" | "deposit" | "cancelled";
export type Booking = {
  id: string;
  createdAt: string;
  journeySlug: string;
  name: string;
  email: string;
  phone?: string;
  travellers: number;
  date: string; // departure start date (YYYY-MM-DD); older demo bookings hold a month (YYYY-MM)
  notes?: string;
  total: number;
  status: BookingStatus;
  source: "website" | "rosario-ai" | "wheel";
  promo?: string;
};

export type Inquiry = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  interest: string;
  message: string;
  status: "open" | "replied" | "closed";
};

export type WheelLead = {
  id: string;
  createdAt: string;
  email: string;
  prizeId: string;
  prizeLabel: string;
  code: string;
  redeemed: boolean;
};

export type ChatMessage = { role: "user" | "assistant"; content: string; at: string };
export type Conversation = { id: string; startedAt: string; messages: ChatMessage[]; mode: "claude" | "offline" };

export type JourneyOverride = { priceFrom?: number; featured?: boolean; published?: boolean; spotsLeft?: number };

export type Settings = {
  aiGreeting: string;
  aiEnabled: boolean;
  wheelEnabled: boolean;
  announcement: string;
};

type DB = {
  bookings: Booking[];
  inquiries: Inquiry[];
  leads: WheelLead[];
  conversations: Conversation[];
  subscribers: { email: string; createdAt: string }[];
  journeyOverrides: Record<string, JourneyOverride>;
  wheelPrizes: WheelPrize[];
  settings: Settings;
  seeded: boolean;
};

/** Set at build time by next.config.ts when Supabase is configured. */
export const SHARED = process.env.NEXT_PUBLIC_SHARED_STORE === "1";

// In shared mode the browser keeps only the visitor's own records (e.g. their wheel code).
const KEY = SHARED ? "rosario.visitor.v1" : "rosario.db.v1";
const OUTBOX = "rosario.outbox.v1";
let role: "visitor" | "admin" = "visitor";

const defaultSettings: Settings = {
  aiGreeting:
    "Allillanchu — welcome. I'm Rosario, your Andean travel concierge. Tell me what kind of journey you dream of, and I'll help you shape it.",
  aiEnabled: true,
  wheelEnabled: true,
  announcement: "Mirror season on the Salar de Uyuni: January – April 2027 departures now open.",
};

const empty = (): DB => ({
  bookings: [],
  inquiries: [],
  leads: [],
  conversations: [],
  subscribers: [],
  journeyOverrides: {},
  wheelPrizes: defaultWheelPrizes,
  settings: defaultSettings,
  seeded: false,
});

/* Deterministic demo data so the admin portal is meaningful on first open. */
function seed(db: DB): DB {
  const names = [
    ["Claire Dubois", "claire.dubois@example.com"],
    ["Tomás Rivera", "tomas.rivera@example.com"],
    ["Aiko Tanaka", "aiko.t@example.com"],
    ["Daniel Okafor", "d.okafor@example.com"],
    ["Marta Lindqvist", "marta.l@example.com"],
    ["James Whitfield", "jwhitfield@example.com"],
    ["Sofía Herrera", "sofia.h@example.com"],
    ["Lukas Brandt", "lukas.brandt@example.com"],
    ["Priya Nair", "priya.nair@example.com"],
    ["Hannah Cole", "hannah.cole@example.com"],
    ["Mateo Rossi", "mateo.rossi@example.com"],
    ["Emma Laurent", "emma.laurent@example.com"],
  ];
  const statuses: BookingStatus[] = ["confirmed", "deposit", "new", "confirmed", "deposit", "cancelled", "confirmed", "new"];
  const sources: Booking["source"][] = ["website", "rosario-ai", "website", "wheel", "website", "rosario-ai"];
  const now = Date.now();
  const bookings: Booking[] = names.map(([name, email], i) => {
    const j = journeys[i % journeys.length];
    const travellers = (i % 3) + 2;
    const created = new Date(now - (i * 4 + 1) * 86400000 - i * 3600000);
    const dep = new Date(now + (30 + i * 17) * 86400000);
    return {
      id: `RB-${(1042 + i).toString()}`,
      createdAt: created.toISOString(),
      journeySlug: j.slug,
      name,
      email,
      travellers,
      date: `${dep.getFullYear()}-${String(dep.getMonth() + 1).padStart(2, "0")}`,
      total: j.priceFrom * travellers,
      status: statuses[i % statuses.length],
      source: sources[i % sources.length],
      notes: i % 4 === 0 ? "Celebrating an anniversary — would love a private dinner." : undefined,
    };
  });
  const inquiries: Inquiry[] = [
    { id: "IQ-311", createdAt: new Date(now - 2 * 3600000).toISOString(), name: "Robert Hayes", email: "r.hayes@example.com", interest: "Salar de Uyuni", message: "Is February a good time to see the mirror effect? We are a family of four with two teenagers.", status: "open" },
    { id: "IQ-310", createdAt: new Date(now - 26 * 3600000).toISOString(), name: "Ines Moreau", email: "ines.m@example.com", interest: "Honeymoon", message: "We want something unforgettable for our honeymoon in May. Patagonia or Peru?", status: "open" },
    { id: "IQ-309", createdAt: new Date(now - 3 * 86400000).toISOString(), name: "Kenji Watanabe", email: "kenji.w@example.com", interest: "Machu Picchu", message: "Can you arrange Huayna Picchu permits for October?", status: "replied" },
    { id: "IQ-308", createdAt: new Date(now - 6 * 86400000).toISOString(), name: "Olivia Grant", email: "olivia.g@example.com", interest: "Altitude", message: "I have mild asthma — how do you handle altitude on the Andean Odyssey?", status: "closed" },
  ];
  const leads: WheelLead[] = [
    { id: "WL-1", createdAt: new Date(now - 5 * 3600000).toISOString(), email: "sam.p@example.com", prizeId: "p1", prizeLabel: "$250 off", code: "ANDES-7K2Q", redeemed: false },
    { id: "WL-2", createdAt: new Date(now - 30 * 3600000).toISOString(), email: "lena.k@example.com", prizeId: "p2", prizeLabel: "Salt hotel night", code: "ANDES-M4XP", redeemed: true },
    { id: "WL-3", createdAt: new Date(now - 50 * 3600000).toISOString(), email: "arjun.m@example.com", prizeId: "p3", prizeLabel: "5% off", code: "ANDES-Q9RT", redeemed: false },
  ];
  const conversations: Conversation[] = [
    {
      id: "CV-1",
      startedAt: new Date(now - 4 * 3600000).toISOString(),
      mode: "offline",
      messages: [
        { role: "user", content: "When is the best time to see the Uyuni mirror?", at: new Date(now - 4 * 3600000).toISOString() },
        { role: "assistant", content: "The mirror appears in the rainy season, roughly January to April, when a thin layer of water covers the salt. February and March are the most reliable. Our Mirror of the Sky journey is timed for exactly that window.", at: new Date(now - 4 * 3600000 + 4000).toISOString() },
      ],
    },
  ];
  return { ...db, bookings, inquiries, leads, conversations, seeded: true };
}

/* ── low-level persistence ─────────────────────────────────────── */
let cache: DB | null = null;
const listeners = new Set<() => void>();

function read(): DB {
  if (cache) return cache;
  if (typeof window === "undefined") return empty();
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? ({ ...empty(), ...JSON.parse(raw) } as DB) : empty();
    if (SHARED) {
      cache = { ...parsed, seeded: true };
    } else {
      cache = parsed.seeded ? parsed : seed(parsed);
      if (!parsed.seeded) write(cache);
    }
  } catch {
    cache = SHARED ? { ...empty(), seeded: true } : seed(empty());
  }
  return cache;
}

function write(next: DB) {
  cache = next;
  // The portal's copy of the shared database is never written to this browser.
  if (role !== "admin") try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage may be unavailable (private mode) — keep working in memory */
  }
  listeners.forEach((l) => l());
}

function update(fn: (db: DB) => DB) {
  write(fn(read()));
}

if (typeof window !== "undefined") {
  // Keep tabs in sync: a booking made on the site updates an open admin tab.
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      cache = null;
      listeners.forEach((l) => l());
    }
  });
}

/* ── sync with the server (shared mode) ────────────────────────── */
type Job = { op: string; data: unknown };
const loadOutbox = (): Job[] => {
  try {
    return JSON.parse(localStorage.getItem(OUTBOX) || "[]");
  } catch {
    return [];
  }
};
const saveOutbox = (jobs: Job[]) => {
  try {
    if (jobs.length) localStorage.setItem(OUTBOX, JSON.stringify(jobs));
    else localStorage.removeItem(OUTBOX);
  } catch {}
};
let flushing = false;
async function flush() {
  if (flushing || typeof window === "undefined") return;
  flushing = true;
  try {
    let jobs = loadOutbox();
    while (jobs.length) {
      let res: Response;
      try {
        res = await fetch("/api/store", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(jobs[0]), keepalive: true });
      } catch {
        break; // offline: try again later
      }
      // 5xx / 429 are worth retrying; other 4xx would fail forever, so drop them.
      if (!res.ok && (res.status >= 500 || res.status === 429 || res.status === 408)) break;
      if (!res.ok) console.warn("[store] dropped", jobs[0].op, res.status);
      jobs = jobs.slice(1);
      saveOutbox(jobs);
    }
  } finally {
    flushing = false;
  }
}
/** Queue a visitor submission for the server (conversations replace earlier saves of themselves). */
function send(op: string, data: { id?: string; email?: string }) {
  if (!SHARED) return;
  const jobs = loadOutbox().filter((j) => !(op === "saveConversation" && j.op === op && (j.data as { id?: string }).id === data.id));
  saveOutbox([...jobs, { op, data }]);
  void flush();
}

async function adminSend(op: string, args: Record<string, unknown>) {
  if (!SHARED || role !== "admin") return;
  try {
    const r = await fetch("/api/admin/store", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ op, args }) });
    if (!r.ok) throw new Error(String(r.status));
  } catch {
    alert("That change couldn't be saved. Check your connection; the portal will reload the latest data.");
    void refreshAdmin();
  }
}

async function refreshAdmin() {
  const r = await fetch("/api/admin/store", { cache: "no-store" });
  if (!r.ok) throw new Error(String(r.status));
  const d = await r.json();
  if (!d.shared) return;
  const { shared: _shared, ...rest } = d;
  void _shared;
  cache = { ...empty(), ...rest, seeded: true };
  listeners.forEach((l) => l());
}

/** Called by the team portal once signed in: loads the shared database and keeps it fresh. */
export function connectAdmin(onReady: () => void) {
  if (!SHARED) {
    onReady();
    return () => {};
  }
  role = "admin";
  cache = null;
  let stopped = false;
  const load = () => refreshAdmin().catch(() => {}).finally(() => !stopped && onReady());
  void load();
  const timer = window.setInterval(() => void refreshAdmin().catch(() => {}), 60_000);
  const onFocus = () => void refreshAdmin().catch(() => {});
  window.addEventListener("focus", onFocus);
  return () => {
    stopped = true;
    window.clearInterval(timer);
    window.removeEventListener("focus", onFocus);
  };
}

if (typeof window !== "undefined" && SHARED && !window.location.pathname.startsWith("/admin")) {
  // Visitors: pick up the team's settings, prizes and prices, and retry anything unsent.
  fetch("/api/store", { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => {
      if (!d?.shared || role === "admin") return;
      update((db) => ({ ...db, settings: d.settings, wheelPrizes: d.wheelPrizes, journeyOverrides: d.journeyOverrides }));
    })
    .catch(() => {});
  void flush();
  window.addEventListener("online", () => void flush());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

const serverSnapshot = empty();

/** React hook: select a slice of the DB and re-render when it changes. */
export function useDB<T>(select: (db: DB) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => select(read()),
    () => select(serverSnapshot),
  );
}

/* ── ids & codes ───────────────────────────────────────────────── */
const rand = (n: number) =>
  Array.from({ length: n }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join("");

/* ── actions ───────────────────────────────────────────────────── */
export const actions = {
  createBooking(b: Omit<Booking, "id" | "createdAt" | "status">) {
    const booking: Booking = {
      ...b,
      id: `RB-${rand(6)}`,
      createdAt: new Date().toISOString(),
      status: "new",
    };
    update((db) => ({ ...db, bookings: [booking, ...db.bookings] }));
    send("createBooking", booking);
    return booking;
  },
  setBookingStatus(id: string, status: BookingStatus) {
    update((db) => ({ ...db, bookings: db.bookings.map((b) => (b.id === id ? { ...b, status } : b)) }));
    void adminSend("setBookingStatus", { id, status });
  },
  deleteBooking(id: string) {
    update((db) => ({ ...db, bookings: db.bookings.filter((b) => b.id !== id) }));
    void adminSend("deleteBooking", { id });
  },

  createInquiry(i: Omit<Inquiry, "id" | "createdAt" | "status">) {
    const inquiry: Inquiry = { ...i, id: `IQ-${rand(6)}`, createdAt: new Date().toISOString(), status: "open" };
    update((db) => ({ ...db, inquiries: [inquiry, ...db.inquiries] }));
    send("createInquiry", inquiry);
    return inquiry;
  },
  setInquiryStatus(id: string, status: Inquiry["status"]) {
    update((db) => ({ ...db, inquiries: db.inquiries.map((q) => (q.id === id ? { ...q, status } : q)) }));
    void adminSend("setInquiryStatus", { id, status });
  },

  createLead(email: string, prize: WheelPrize) {
    const lead: WheelLead = {
      id: `WL-${Date.now()}`,
      createdAt: new Date().toISOString(),
      email,
      prizeId: prize.id,
      prizeLabel: prize.label,
      code: `ANDES-${rand(4)}`,
      redeemed: false,
    };
    update((db) => ({ ...db, leads: [lead, ...db.leads] }));
    send("createLead", lead);
    return lead;
  },
  /** Portal: flips a code's redeemed flag. On the website it only marks the visitor's own copy;
      the server redeems the code itself when the booking arrives. */
  toggleLeadRedeemed(id: string) {
    const redeemed = !read().leads.find((l) => l.id === id)?.redeemed;
    update((db) => ({ ...db, leads: db.leads.map((l) => (l.id === id ? { ...l, redeemed } : l)) }));
    void adminSend("setLeadRedeemed", { id, redeemed });
  },

  saveConversation(c: Conversation) {
    update((db) => {
      const exists = db.conversations.some((x) => x.id === c.id);
      return {
        ...db,
        conversations: exists ? db.conversations.map((x) => (x.id === c.id ? c : x)) : [c, ...db.conversations],
      };
    });
    send("saveConversation", c);
  },

  subscribe(email: string) {
    update((db) =>
      db.subscribers.some((s) => s.email === email)
        ? db
        : { ...db, subscribers: [{ email, createdAt: new Date().toISOString() }, ...db.subscribers] },
    );
    send("subscribe", { email });
  },

  setJourneyOverride(slug: string, patch: JourneyOverride) {
    update((db) => ({
      ...db,
      journeyOverrides: { ...db.journeyOverrides, [slug]: { ...db.journeyOverrides[slug], ...patch } },
    }));
    void adminSend("setJourneyOverrides", { value: read().journeyOverrides });
  },

  setWheelPrizes(prizes: WheelPrize[]) {
    update((db) => ({ ...db, wheelPrizes: prizes }));
    void adminSend("setWheelPrizes", { value: prizes });
  },

  setSettings(patch: Partial<Settings>) {
    update((db) => ({ ...db, settings: { ...db.settings, ...patch } }));
    void adminSend("setSettings", { value: read().settings });
  },

  /** Demo mode only: the shared database is never wiped from the portal. */
  resetDemo() {
    if (SHARED) return;
    write(seed(empty()));
  },
};

/** Journeys with admin overrides applied (price, featured, published). */
export function useJourneys() {
  const overrides = useDB((db) => db.journeyOverrides);
  const { content } = useI18n(); // localised titles & itineraries (English in the portal)
  return content.journeys
    .map((j) => ({ ...j, ...overrides[j.slug], published: overrides[j.slug]?.published ?? true }))
    .filter(Boolean);
}
