import * as store from "@/lib/server-store";

export const dynamic = "force-dynamic";

const fail = (e: unknown) => {
  const status = e instanceof store.StoreError ? e.status : 500;
  if (!(e instanceof store.StoreError)) console.error("[store]", e);
  return Response.json({ ok: false, error: e instanceof Error ? e.message : "error" }, { status });
};

/** Public settings the website needs: announcement, wheel prizes, prices. */
export async function GET() {
  if (!store.sharedEnabled()) return Response.json({ shared: false });
  try {
    const [config, occupancy] = await Promise.all([store.getConfig(), store.getOccupancy()]);
    return Response.json({ shared: true, ...config, occupancy });
  } catch (e) {
    return fail(e);
  }
}

/** Submissions from visitors: bookings, inquiries, wheel leads, chats, newsletter. */
export async function POST(req: Request) {
  if (!store.sharedEnabled()) return Response.json({ ok: false, error: "shared store not configured" }, { status: 503 });
  const body = (await req.json().catch(() => null)) as { op?: string; data?: Record<string, unknown> } | null;
  if (!body?.op || typeof body.data !== "object" || !body.data) return Response.json({ ok: false, error: "bad request" }, { status: 400 });
  try {
    switch (body.op) {
      case "createBooking": await store.createBooking(body.data); break;
      case "createInquiry": await store.createInquiry(body.data); break;
      case "createLead": await store.createLead(body.data); break;
      case "saveConversation": await store.saveConversation(body.data); break;
      case "subscribe": await store.subscribe(body.data); break;
      case "createStay": await store.createStay(body.data); break;
      default: return Response.json({ ok: false, error: "unknown operation" }, { status: 400 });
    }
    return Response.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
