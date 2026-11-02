import { cookies } from "next/headers";
import { COOKIE, checkPasscode, tokenFor } from "@/lib/admin-auth";

export async function POST(req: Request) {
  const { passcode } = (await req.json().catch(() => ({}))) as { passcode?: string };
  if (!passcode || !checkPasscode(passcode)) {
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    return Response.json({ ok: false }, { status: 401 });
  }
  (await cookies()).set(COOKIE, tokenFor(passcode), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 12 });
  return Response.json({ ok: true });
}
