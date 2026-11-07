import { cookies } from "next/headers";
import { COOKIE, isValidToken } from "@/lib/admin-auth";
import * as store from "@/lib/server-store";

export const dynamic = "force-dynamic";

async function authed() {
  return isValidToken((await cookies()).get(COOKIE)?.value);
}

const fail = (e: unknown) => {
  const status = e instanceof store.StoreError ? e.status : 500;
  if (!(e instanceof store.StoreError)) console.error("[admin-store]", e);
  return Response.json({ ok: false, error: e instanceof Error ? e.message : "error" }, { status });
};

/** Everything the team portal shows. */
export async function GET() {
  if (!(await authed())) return Response.json({ ok: false }, { status: 401 });
  if (!store.sharedEnabled()) return Response.json({ shared: false });
  try {
    return Response.json({ shared: true, ...(await store.loadAll()) });
  } catch (e) {
    return fail(e);
  }
}

/** Portal edits: statuses, prices, prizes, settings. */
export async function POST(req: Request) {
  if (!(await authed())) return Response.json({ ok: false }, { status: 401 });
  if (!store.sharedEnabled()) return Response.json({ ok: false, error: "shared store not configured" }, { status: 503 });
  const body = (await req.json().catch(() => null)) as { op?: string; args?: Record<string, unknown> } | null;
  if (!body?.op) return Response.json({ ok: false, error: "bad request" }, { status: 400 });
  try {
    await store.adminOp(body.op, body.args ?? {});
    return Response.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
