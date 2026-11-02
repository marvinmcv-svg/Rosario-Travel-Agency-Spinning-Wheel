import { cookies } from "next/headers";
import { COOKIE, isValidToken } from "@/lib/admin-auth";

export async function GET() {
  const token = (await cookies()).get(COOKIE)?.value;
  return Response.json({ authed: isValidToken(token) });
}
