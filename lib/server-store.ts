/* ──────────────────────────────────────────────────────────────
   Server side of the shared store (Supabase).

   Only runs on the server: it uses the Supabase secret key, which
   bypasses row-level security. The tables have RLS on with no
   policies, so nothing in the browser can read or write them.

   Enabled when SUPABASE_URL and SUPABASE_SECRET_KEY (or the legacy
   SUPABASE_SERVICE_ROLE_KEY) are set. Without them the site keeps
   using the browser-only demo store in lib/store.ts.
   ────────────────────────────────────────────────────────────── */

import { defaultWheelPrizes, journeys, type WheelPrize } from "./data";
import type { Booking, Conversation, Inquiry, JourneyOverride, Settings, WheelLead } from "./store";

const url = () => process.env.SUPABASE_URL?.replace(/\/$/, "");
const key = () => process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

export const sharedEnabled = () => Boolean(url() && key());

export const defaultSettings: Settings = {
  aiGreeting:
    "Allillanchu — welcome. I'm Rosario, your Andean travel concierge. Tell me what kind of journey you dream of, and I'll help you shape it.",
  aiEnabled: true,
  wheelEnabled: true,
  announcement: "Mirror season on the Salar de Uyuni: January – April 2027 departures now open.",
};

export class StoreError extends Error {
  constructor(message: string, readonly status = 500) {
    super(message);
  }
}

async function rest<T = unknown>(path: string, init: RequestInit & { prefer?: string } = {}): Promise<T> {
  const k = key()!;
  const headers: Record<string, string> = { apikey: k, "Content-Type": "application/json" };
  // Legacy service-role keys are JWTs and go in Authorization too; new sb_secret_ keys only need apikey.
  if (k.startsWith("eyJ")) headers.Authorization = `Bearer ${k}`;
  if (init.prefer) headers.Prefer = init.prefer;
  const res = await fetch(`${url()}/rest/v1/${path}`, { ...init, headers, cache: "no-store" });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[store] ${init.method ?? "GET"} ${path} → ${res.status} ${body}`);
    throw new StoreError(res.status === 409 ? "conflict" : "database error", res.status === 409 ? 409 : 502);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

/* ── row mapping ───────────────────────────────────────────────── */
type BookingRow = {
  id: string; created_at: string; journey_slug: string; name: string; email: string; phone: string | null;
  travellers: number; departure_month: string; notes: string | null; total: number | string;
  status: Booking["status"]; source: Booking["source"]; promo: string | null;
};
const toBooking = (r: BookingRow): Booking => ({
  id: r.id, createdAt: r.created_at, journeySlug: r.journey_slug, name: r.name, email: r.email,
  phone: r.phone ?? undefined, travellers: r.travellers, date: r.departure_month, notes: r.notes ?? undefined,
  total: Number(r.total), status: r.status, source: r.source, promo: r.promo ?? undefined,
});
type InquiryRow = { id: string; created_at: string; name: string; email: string; interest: string; message: string; status: Inquiry["status"] };
const toInquiry = (r: InquiryRow): Inquiry => ({ id: r.id, createdAt: r.created_at, name: r.name, email: r.email, interest: r.interest, message: r.message, status: r.status });
type LeadRow = { id: string; created_at: string; email: string; prize_id: string; prize_label: string; code: string; redeemed: boolean };
const toLead = (r: LeadRow): WheelLead => ({ id: r.id, createdAt: r.created_at, email: r.email, prizeId: r.prize_id, prizeLabel: r.prize_label, code: r.code, redeemed: r.redeemed });
type ConvRow = { id: string; started_at: string; mode: Conversation["mode"]; messages: Conversation["messages"] };
const toConv = (r: ConvRow): Conversation => ({ id: r.id, startedAt: r.started_at, mode: r.mode, messages: r.messages });

/* ── validation helpers ────────────────────────────────────────── */
const str = (v: unknown, max: number, required = true): string | undefined => {
  if (typeof v !== "string" || !v.trim()) {
    if (required) throw new StoreError("missing field", 400);
    return undefined;
  }
  return v.trim().slice(0, max);
};
const email = (v: unknown) => {
  const e = str(v, 320)!.toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) throw new StoreError("invalid email", 400);
  return e;
};
const idOf = (v: unknown, prefix: string) => {
  if (typeof v === "string" && new RegExp(`^${prefix}-[A-Z0-9-]{3,40}$`).test(v)) return v;
  throw new StoreError("invalid id", 400);
};

/* ── config (settings, prizes, journey overrides) ──────────────── */
export type PublicConfig = { settings: Settings; wheelPrizes: WheelPrize[]; journeyOverrides: Record<string, JourneyOverride> };

export async function getConfig(): Promise<PublicConfig> {
  const rows = await rest<{ key: string; value: unknown }[]>("site_config?select=key,value");
  const get = <T>(k: string) => rows.find((r) => r.key === k)?.value as T | undefined;
  return {
    settings: { ...defaultSettings, ...get<Partial<Settings>>("settings") },
    wheelPrizes: get<WheelPrize[]>("wheel_prizes") ?? defaultWheelPrizes,
    journeyOverrides: get<Record<string, JourneyOverride>>("journey_overrides") ?? {},
  };
}

const setConfig = (k: string, value: unknown) =>
  rest("site_config?on_conflict=key", {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=minimal",
    body: JSON.stringify({ key: k, value, updated_at: new Date().toISOString() }),
  });

/* ── public writes (anyone on the website) ─────────────────────── */
export async function createBooking(input: Partial<Booking>) {
  const journey = journeys.find((j) => j.slug === input.journeySlug);
  if (!journey) throw new StoreError("unknown journey", 400);
  const travellers = Math.round(Number(input.travellers));
  if (!(travellers >= 1 && travellers <= 30)) throw new StoreError("invalid travellers", 400);
  const date = str(input.date, 10)!;
  if (!/^\d{4}-\d{2}(-\d{2})?$/.test(date)) throw new StoreError("invalid date", 400);

  const { journeyOverrides } = await getConfig();
  const subtotal = (journeyOverrides[journey.slug]?.priceFrom ?? journey.priceFrom) * travellers;
  let total = Number(input.total);
  if (!Number.isFinite(total) || total < 0 || total > subtotal) total = subtotal;

  // A wheel code is only honoured once, and only if it exists. Otherwise the
  // booking is still saved, with the code flagged for the team.
  let promo = str(input.promo, 40, false)?.toUpperCase();
  let source: Booking["source"] = input.source === "rosario-ai" ? "rosario-ai" : "website";
  if (promo) {
    const [lead] = await rest<LeadRow[]>(`wheel_leads?code=eq.${encodeURIComponent(promo)}&redeemed=is.false&select=id`);
    if (lead) {
      await rest(`wheel_leads?id=eq.${encodeURIComponent(lead.id)}`, { method: "PATCH", prefer: "return=minimal", body: JSON.stringify({ redeemed: true }) });
      source = "wheel";
    } else {
      promo = `${promo} (not valid: charged at full price, please check)`;
      total = subtotal;
    }
  }

  await rest("bookings", {
    method: "POST",
    prefer: "resolution=ignore-duplicates,return=minimal",
    body: JSON.stringify({
      id: idOf(input.id, "RB"),
      journey_slug: journey.slug,
      name: str(input.name, 200),
      email: email(input.email),
      phone: str(input.phone, 60, false) ?? null,
      travellers,
      departure_month: date,
      notes: str(input.notes, 4000, false) ?? null,
      total,
      status: "new",
      source,
      promo: promo ?? null,
    }),
  });
}

export async function createInquiry(input: Partial<Inquiry>) {
  await rest("inquiries", {
    method: "POST",
    prefer: "resolution=ignore-duplicates,return=minimal",
    body: JSON.stringify({
      id: idOf(input.id, "IQ"),
      name: str(input.name, 200),
      email: email(input.email),
      interest: str(input.interest, 200, false) ?? "",
      message: str(input.message, 8000),
      status: "open",
    }),
  });
}

export async function createLead(input: Partial<WheelLead>) {
  const code = str(input.code, 20)!.toUpperCase();
  if (!/^ANDES-[A-Z0-9]{4}$/.test(code)) throw new StoreError("invalid code", 400);
  const { wheelPrizes } = await getConfig();
  const prize = wheelPrizes.find((p) => p.id === input.prizeId);
  if (!prize) throw new StoreError("unknown prize", 400);
  // One prize per email address: a second claim is ignored.
  await rest("wheel_leads", {
    method: "POST",
    prefer: "resolution=ignore-duplicates,return=minimal",
    body: JSON.stringify({ id: idOf(input.id, "WL"), email: email(input.email), prize_id: prize.id, prize_label: prize.label, code, redeemed: false }),
  });
}

export async function saveConversation(input: Partial<Conversation>) {
  const messages = (Array.isArray(input.messages) ? input.messages : []).slice(-200).map((m) => ({
    role: m?.role === "assistant" ? "assistant" : "user",
    content: String(m?.content ?? "").slice(0, 8000),
    at: String(m?.at ?? new Date().toISOString()).slice(0, 40),
  }));
  await rest("conversations?on_conflict=id", {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=minimal",
    body: JSON.stringify({
      id: idOf(input.id, "CV"),
      started_at: typeof input.startedAt === "string" ? input.startedAt : new Date().toISOString(),
      updated_at: new Date().toISOString(),
      mode: input.mode === "claude" ? "claude" : "offline",
      messages,
    }),
  });
}

export async function subscribe(input: { email?: unknown }) {
  await rest("subscribers", {
    method: "POST",
    prefer: "resolution=ignore-duplicates,return=minimal",
    body: JSON.stringify({ email: email(input.email) }),
  });
}

/* ── team portal (passcode-gated in the route) ─────────────────── */
export async function loadAll() {
  const [bookings, inquiries, leads, conversations, subscribers, config] = await Promise.all([
    rest<BookingRow[]>("bookings?select=*&order=created_at.desc&limit=2000"),
    rest<InquiryRow[]>("inquiries?select=*&order=created_at.desc&limit=2000"),
    rest<LeadRow[]>("wheel_leads?select=*&order=created_at.desc&limit=5000"),
    rest<ConvRow[]>("conversations?select=id,started_at,mode,messages&order=started_at.desc&limit=300"),
    rest<{ email: string; created_at: string }[]>("subscribers?select=*&order=created_at.desc&limit=10000"),
    getConfig(),
  ]);
  return {
    bookings: bookings.map(toBooking),
    inquiries: inquiries.map(toInquiry),
    leads: leads.map(toLead),
    conversations: conversations.map(toConv),
    subscribers: subscribers.map((s) => ({ email: s.email, createdAt: s.created_at })),
    ...config,
  };
}

const BOOKING_STATUSES = ["new", "confirmed", "deposit", "cancelled"];
const INQUIRY_STATUSES = ["open", "replied", "closed"];
const enc = encodeURIComponent;

export async function adminOp(op: string, a: Record<string, unknown>) {
  switch (op) {
    case "setBookingStatus":
      if (!BOOKING_STATUSES.includes(String(a.status))) throw new StoreError("invalid status", 400);
      return rest(`bookings?id=eq.${enc(String(a.id))}`, { method: "PATCH", prefer: "return=minimal", body: JSON.stringify({ status: a.status }) });
    case "deleteBooking":
      return rest(`bookings?id=eq.${enc(String(a.id))}`, { method: "DELETE", prefer: "return=minimal" });
    case "setInquiryStatus":
      if (!INQUIRY_STATUSES.includes(String(a.status))) throw new StoreError("invalid status", 400);
      return rest(`inquiries?id=eq.${enc(String(a.id))}`, { method: "PATCH", prefer: "return=minimal", body: JSON.stringify({ status: a.status }) });
    case "setLeadRedeemed":
      return rest(`wheel_leads?id=eq.${enc(String(a.id))}`, { method: "PATCH", prefer: "return=minimal", body: JSON.stringify({ redeemed: Boolean(a.redeemed) }) });
    case "setJourneyOverrides":
      return setConfig("journey_overrides", a.value ?? {});
    case "setWheelPrizes":
      if (!Array.isArray(a.value) || a.value.length < 3 || a.value.length > 12) throw new StoreError("invalid prizes", 400);
      return setConfig("wheel_prizes", a.value);
    case "setSettings":
      return setConfig("settings", { ...defaultSettings, ...(a.value as object) });
    default:
      throw new StoreError("unknown operation", 400);
  }
}
