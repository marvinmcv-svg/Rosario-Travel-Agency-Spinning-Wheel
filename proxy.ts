import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, hasLocale, LOCALE_COOKIE, negotiate } from "@/lib/i18n/config";

/* Language routing.
   • /es/…, /pt/… → served as is.
   • /en/…       → redirected to the unprefixed English URL (one canonical URL).
   • anything else → English, unless the visitor chose a language before
     (cookie) or their browser prefers one we speak, in which case they are
     redirected to that language's URL. */
export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const seg = pathname.split("/")[1];

  if (seg === defaultLocale) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }
  if (hasLocale(seg)) return NextResponse.next();

  const cookie = req.cookies.get(LOCALE_COOKIE)?.value;
  const preferred = hasLocale(cookie) ? cookie : negotiate(req.headers.get("accept-language"));
  if (preferred !== defaultLocale) {
    const url = req.nextUrl.clone();
    url.pathname = `/${preferred}${pathname === "/" ? "" : pathname}`;
    url.search = search;
    return NextResponse.redirect(url, 307);
  }

  const url = req.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Everything except the API, the team portal, Next internals and files with an extension.
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
