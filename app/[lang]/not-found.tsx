"use client";

import Link from "next/link";
import { Wordmark } from "@/components/brand";
import { useI18n } from "@/components/i18n";

/* A lost traveller lands here: same dusk sky as the entrance flyover. */
export default function NotFound() {
  const { t, lp } = useI18n();
  const N = t.notFound;
  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#07080b_0%,#141218_45%,#3b1c18_75%,#8a3f1e_100%)] px-6 text-center">
      <title>{`${N.metaTitle} · Rosario Travels`}</title>
      <p className="eyebrow text-salt/60">{N.eyebrow}</p>
      <h1 className="mt-6 font-display text-[clamp(3rem,9vw,8rem)] leading-[0.9] tracking-[-0.03em]">
        {N.title} <em className="text-copper-2">{N.titleEm}</em>
      </h1>
      <p className="mt-6 max-w-md text-salt/70">{N.text}</p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href={lp("/")} className="rounded-full bg-salt px-6 py-3.5 text-sm font-medium text-ink transition hover:bg-copper">
          {N.home}
        </Link>
        <Link href={lp("/destinations")} className="rounded-full border border-salt/30 px-6 py-3.5 text-sm transition hover:border-salt hover:bg-salt/10">
          {N.browse}
        </Link>
      </div>
      <span className="sr-only"><Wordmark /></span>
    </section>
  );
}
