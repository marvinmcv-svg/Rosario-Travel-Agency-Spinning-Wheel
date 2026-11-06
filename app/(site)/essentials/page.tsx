import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import PageHero from "@/components/PageHero";
import AskRosario from "@/components/AskRosario";
import { FadeUp } from "@/components/motion";
import { essentials } from "@/lib/essentials";
import { waLink } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Travel essentials",
  description: "Altitude, seasons, visas, health, packing, money and how booking works: everything to know before travelling the Andes with Rosario Travels.",
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: essentials.flatMap((t) =>
    t.items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  ),
};

export default function EssentialsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <PageHero image="/images/laguna-colorada.webp" eyebrow="Before you fly" title="Travel essentials" height="h-[72svh]">
        <p className="max-w-xl font-display text-[clamp(1.25rem,2vw,1.75rem)] italic text-salt/85">
          Altitude, seasons, visas and the small things that make a big journey easy.
        </p>
      </PageHero>

      {/* Mobile topic chips */}
      <nav aria-label="Topics" className="sticky top-0 z-30 -mb-px overflow-x-auto border-b border-line bg-ink/85 backdrop-blur-xl lg:hidden">
        <ul className="flex gap-2 px-5 py-3">
          {essentials.map((t) => (
            <li key={t.id}>
              <a href={`#${t.id}`} className="block whitespace-nowrap rounded-full border border-line px-4 py-2 text-xs tracking-wide text-salt/75">
                {t.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section className="mx-auto grid max-w-[1600px] gap-16 px-5 py-24 md:px-10 lg:grid-cols-12">
        <aside className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-28">
            <p className="eyebrow mb-6 text-salt/45">Topics</p>
            <ul className="space-y-3">
              {essentials.map((t, i) => (
                <li key={t.id}>
                  <a href={`#${t.id}`} className="group flex items-baseline gap-4 text-salt/70 transition hover:text-salt">
                    <span className="font-display text-sm text-copper">{String(i + 1).padStart(2, "0")}</span>
                    <span className="link-line font-display text-2xl">{t.title}</span>
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-12 rounded-[20px] border border-line bg-ink-2 p-6">
              <p className="text-sm text-salt/70">Can&rsquo;t find your answer?</p>
              <div className="mt-4 flex flex-col gap-3">
                <AskRosario prompt="I have a question before booking." label="Ask Rosario AI" variant="solid" />
                <a href={waLink("Hi Rosario! I have a question before booking.")} target="_blank" rel="noopener noreferrer" className="text-sm text-[#25d366] hover:text-salt">
                  Or message us on WhatsApp →
                </a>
              </div>
            </div>
          </div>
        </aside>

        <div className="space-y-24 lg:col-span-8 lg:col-start-5">
          {essentials.map((t, i) => (
            <section key={t.id} id={t.id} className="scroll-mt-28">
              <FadeUp>
                <p className="eyebrow text-copper">{String(i + 1).padStart(2, "0")} · {t.title}</p>
                <h2 className="mt-4 font-display text-[clamp(2.2rem,4vw,3.6rem)] leading-[1] tracking-[-0.02em]">{t.title}</h2>
                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-salt/70">{t.intro}</p>
              </FadeUp>
              <div className="mt-10 divide-y divide-line border-y border-line">
                {t.items.map((item) => (
                  <details key={item.q} className="group py-2 [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 font-display text-[1.45rem] leading-snug transition hover:text-copper-2">
                      {item.q}
                      <Plus className="h-5 w-5 shrink-0 text-copper transition-transform duration-300 group-open:rotate-45" />
                    </summary>
                    <p className="max-w-3xl pb-6 leading-relaxed text-salt/70">{item.a}</p>
                  </details>
                ))}
              </div>
              {t.id === "booking" && (
                <p className="mt-6 text-sm text-salt/55">
                  Full details in our{" "}
                  <Link href="/terms" className="link-line text-salt hover:text-copper">booking conditions</Link>.
                </p>
              )}
            </section>
          ))}

          <FadeUp className="rounded-[24px] border border-line bg-ink-2 p-8 lg:hidden">
            <p className="font-display text-3xl">Still wondering about something?</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <AskRosario prompt="I have a question before booking." label="Ask Rosario AI" variant="solid" />
              <a href={waLink("Hi Rosario! I have a question before booking.")} target="_blank" rel="noopener noreferrer" className="rounded-full border border-[#25d366]/50 px-5 py-3 text-sm text-[#25d366]">
                WhatsApp us
              </a>
            </div>
          </FadeUp>
        </div>
      </section>
    </>
  );
}
