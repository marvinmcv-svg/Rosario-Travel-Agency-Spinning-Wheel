import Link from "next/link";
import { Plus } from "lucide-react";
import PageHero from "@/components/PageHero";
import AskRosario from "@/components/AskRosario";
import { FadeUp } from "@/components/motion";
import { waLink } from "@/lib/contact";
import { localePath } from "@/lib/i18n/config";
import { pageI18n, pageMeta } from "@/lib/i18n/server";

export const generateMetadata = ({ params }: PageProps<"/[lang]/essentials">) =>
  pageMeta(params, "/essentials", (t) => ({ title: t.essentials.metaTitle, description: t.essentials.metaDescription }));

export default async function EssentialsPage({ params }: PageProps<"/[lang]/essentials">) {
  const { t, content, lang } = await pageI18n(params);
  const E = t.essentials;
  const essentials = content.essentials;
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: lang,
    mainEntity: essentials.flatMap((tp) =>
      tp.items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
    ),
  };
  const [beforeTerms, afterTerms] = E.fullDetails.split("{terms}");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <PageHero image="/images/laguna-colorada.webp" eyebrow={E.eyebrow} title={E.title} height="h-[72svh]">
        <p className="max-w-xl font-display text-[clamp(1.25rem,2vw,1.75rem)] italic text-salt/85">{E.intro}</p>
      </PageHero>

      {/* Mobile topic chips */}
      <nav aria-label={E.topics} className="sticky top-0 z-30 -mb-px overflow-x-auto border-b border-line bg-ink/85 backdrop-blur-xl lg:hidden">
        <ul className="flex gap-2 px-5 py-3">
          {essentials.map((tp) => (
            <li key={tp.id}>
              <a href={`#${tp.id}`} className="block whitespace-nowrap rounded-full border border-line px-4 py-2 text-xs tracking-wide text-salt/75">
                {tp.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section className="mx-auto grid max-w-[1600px] gap-16 px-5 py-24 md:px-10 lg:grid-cols-12">
        <aside className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-28">
            <p className="eyebrow mb-6 text-salt/45">{E.topics}</p>
            <ul className="space-y-3">
              {essentials.map((tp, i) => (
                <li key={tp.id}>
                  <a href={`#${tp.id}`} className="group flex items-baseline gap-4 text-salt/70 transition hover:text-salt">
                    <span className="font-display text-sm text-copper">{String(i + 1).padStart(2, "0")}</span>
                    <span className="link-line font-display text-2xl">{tp.title}</span>
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-12 rounded-[20px] border border-line bg-ink-2 p-6">
              <p className="text-sm text-salt/70">{E.cantFind}</p>
              <div className="mt-4 flex flex-col gap-3">
                <AskRosario prompt={E.askPrompt} label={t.common.askRosarioAI} variant="solid" />
                <a href={waLink(E.waText)} target="_blank" rel="noopener noreferrer" className="text-sm text-[#25d366] hover:text-salt">
                  {E.waLink}
                </a>
              </div>
            </div>
          </div>
        </aside>

        <div className="space-y-24 lg:col-span-8 lg:col-start-5">
          {essentials.map((tp, i) => (
            <section key={tp.id} id={tp.id} className="scroll-mt-28">
              <FadeUp>
                <p className="eyebrow text-copper">{String(i + 1).padStart(2, "0")} · {tp.title}</p>
                <h2 className="mt-4 font-display text-[clamp(2.2rem,4vw,3.6rem)] leading-[1] tracking-[-0.02em]">{tp.title}</h2>
                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-salt/70">{tp.intro}</p>
              </FadeUp>
              <div className="mt-10 divide-y divide-line border-y border-line">
                {tp.items.map((item) => (
                  <details key={item.q} className="group py-2 [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 font-display text-[1.45rem] leading-snug transition hover:text-copper-2">
                      {item.q}
                      <Plus className="h-5 w-5 shrink-0 text-copper transition-transform duration-300 group-open:rotate-45" />
                    </summary>
                    <p className="max-w-3xl pb-6 leading-relaxed text-salt/70">{item.a}</p>
                  </details>
                ))}
              </div>
              {tp.id === "booking" && (
                <p className="mt-6 text-sm text-salt/55">
                  {beforeTerms}
                  <Link href={localePath(lang, "/terms")} className="link-line text-salt hover:text-copper">{E.termsLink}</Link>
                  {afterTerms}
                </p>
              )}
            </section>
          ))}

          <FadeUp className="rounded-[24px] border border-line bg-ink-2 p-8 lg:hidden">
            <p className="font-display text-3xl">{E.still}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <AskRosario prompt={E.askPrompt} label={t.common.askRosarioAI} variant="solid" />
              <a href={waLink(E.waText)} target="_blank" rel="noopener noreferrer" className="rounded-full border border-[#25d366]/50 px-5 py-3 text-sm text-[#25d366]">
                {E.waShort}
              </a>
            </div>
          </FadeUp>
        </div>
      </section>
    </>
  );
}
