import type { ReactNode } from "react";

/* Quiet, readable long-form layout for policy pages. No hero photo:
   these pages are about clarity, not mood. */
export default function LegalPage({ eyebrow, title, updated, children }: { eyebrow: string; title: string; updated: string; children: ReactNode }) {
  return (
    <article className="mx-auto max-w-[1600px] px-5 pb-28 pt-40 md:px-10">
      <header className="max-w-4xl border-b border-line pb-12">
        <p className="eyebrow text-copper">{eyebrow}</p>
        <h1 className="mt-5 font-display text-[clamp(3rem,7vw,6.5rem)] leading-[0.92] tracking-[-0.03em]">{title}</h1>
        <p className="mt-6 text-sm text-salt/45">Last updated {updated}</p>
      </header>
      <div className="mt-14 max-w-3xl space-y-12 leading-relaxed text-salt/75 [&_h2]:mb-4 [&_h2]:font-display [&_h2]:text-3xl [&_h2]:text-salt [&_li]:pl-1 [&_p+p]:mt-4 [&_strong]:font-medium [&_strong]:text-salt [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_a]:text-salt [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-copper">
        {children}
      </div>
    </article>
  );
}
