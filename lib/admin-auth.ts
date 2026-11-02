import { createHash, timingSafeEqual } from "node:crypto";

/* Minimal server-checked gate for the team portal. The passcode lives in
   ADMIN_PASSCODE (never shipped to the browser); the cookie stores a hash. */
export const COOKIE = "rosario_admin";
const passcode = () => process.env.ADMIN_PASSCODE || "rosario";
export const tokenFor = (code: string) => createHash("sha256").update(`rosario:${code}`).digest("hex");

export function checkPasscode(input: string) {
  const a = Buffer.from(tokenFor(input));
  const b = Buffer.from(tokenFor(passcode()));
  return a.length === b.length && timingSafeEqual(a, b);
}

export const isValidToken = (token?: string) => !!token && token === tokenFor(passcode());
