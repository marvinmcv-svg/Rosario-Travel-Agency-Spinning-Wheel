import { createHash, timingSafeEqual } from "node:crypto";

/* Minimal server-checked gate for the team portal. The passcode lives in
   ADMIN_PASSCODE (never shipped to the browser); the cookie stores a hash. */
export const COOKIE = "rosario_admin";
/* With real customer data (Supabase configured) there is no default passcode:
   until ADMIN_PASSCODE is set, nobody can sign in. */
const realData = () => Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY));
const passcode = () => process.env.ADMIN_PASSCODE || (realData() ? "" : "rosario");
export const tokenFor = (code: string) => createHash("sha256").update(`rosario:${code}`).digest("hex");

export function checkPasscode(input: string) {
  if (!passcode()) return false;
  const a = Buffer.from(tokenFor(input));
  const b = Buffer.from(tokenFor(passcode()));
  return a.length === b.length && timingSafeEqual(a, b);
}

export const isValidToken = (token?: string) => !!passcode() && !!token && token === tokenFor(passcode());
