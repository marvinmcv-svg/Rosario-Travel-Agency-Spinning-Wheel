import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import AskRosario from "@/components/AskRosario";
import { Price } from "@/components/i18n";
import { FadeUp } from "@/components/motion";
import { fmt } from "@/lib/i18n/fmt";
import { alternatesFor, hasLocale, localeMeta, localePath, siteUrl } from "@/lib/i18n/config";
import { pageI18n } from "@/lib/i18n/server";
import { stories, storyBySlug, storyText } from "@/lib/stories";

export function generateStaticParams() {
  return stories.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/stories/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const s = storyBySlug(slug);
  if (!hasLocale(lang) || !s) return {};
  const tx = storyText(s, lang);
  return {
    title: tx.title,
    description: tx.dek,
    openGraph: { type: "article", images: [s.image], publishedTime: s.published },
    alternates: alternatesFor(lang, `/stories/${slug}`),
  };
}

export default async function StoryPage({ params }: PageProps<"/[lang]/stories/[slug]">) {
  const { t, content, lang } = await pageI18n(params);
  const { slug } = await params;
  const s = storyBySlug(slug);
  if (!s) notFound();
  const S = t.stories;
  const tx = storyText(s, lang);
  const intl = localeMeta[lang].intl;
  const related = content.journeys.filter((j) => s.journeys.includes(j.slug));
  const more = stories.filter((x) => x.slug !== s.slug).slice(0, 2);
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: s.title,
    description: s.dek,
    image: siteUrl() + s.image,
    datePublished: s.published,
    inLanguage: "en",
    author: { "@type": "Organization", name: "Rosario Travels" },
    publisher: { "@type": "Organization", name: "Rosario Travels" },
    mainEntityOfPage: siteUrl() + localePath(lang, `/stories/${s.slug}`),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <PageHero image={s.image} eyebrow={`${S.eyebrow} · ${fmt(S.minRead, { n: s.minutes })}`} title={tx.title} height="h-[78svh]">
        <p className="max-w-2xl font-display text-[clamp(1.2rem,1.8vw,1.6rem)] italic text-salt/85">{tx.dek}</p>
      </PageHero>

      <article className="mx-auto max-w-3xl px-5 py-20 md:px-10" lang="en">
        <p className="eyebrow text-salt/45">
          {new Date(`${s.published}T12:00:00`).toLocaleDateString(intl, { day: "numeric", month: "long", year: "numeric" })}
        </p>
        {S.englishOnly && <p className="mt-6 rounded-xl border border-line bg-salt/[0.03] p-4 text-sm text-salt/60" lang={lang}>{S.englishOnly}</p>}
        <div className="mt-10 space-y-6 text-lg leading-relaxed text-salt/75">
          {s.body.map((b, i) =>
            "h" in b ? (
              <h2 key={i} className="pt-6 font-display text-3xl leading-tight text-salt">{b.h}</h2>
            ) : "tip" in b ? (
              <p key={i} className="rounded-2xl border border-gold/25 bg-gold/[0.05] p-6 text-base text-salt/85">{b.tip}</p>
            ) : (
              <p key={i}>{b.p}</p>
            ),
          )}
        </div>
        <div className="mt-12">
          <AskRosario prompt={fmt(S.planPrompt, { title: tx.title })} label={S.plan} variant="solid" />
        </div>
      </article>

      {related.length > 0 && (
        <section className="mx-auto max-w-[1600px] px-5 pb-24 md:px-10">
          <p className="eyebrow mb-8 text-copper">{S.related}</p>
          <FadeUp stagger={0.1} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {related.map((j) => (
              <Link key={j.slug} href={localePath(lang, `/journeys/${j.slug}`)} className="group overflow-hidden rounded-[22px] border border-line bg-ink-2">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image src={j.image} alt={j.title} fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover transition duration-[1.4s] group-hover:scale-105" />
                </div>
                <div className="p-6">
                  <p className="font-display text-3xl">{j.title}</p>
                  <p className="mt-2 text-sm text-salt/55">{j.subtitle}</p>
                  <p className="mt-5 text-sm text-salt/70">
                    {fmt(t.common.days, { n: j.days })} · {t.common.from} <Price usd={j.priceFrom} className="text-salt" />
                  </p>
                </div>
              </Link>
            ))}
          </FadeUp>
        </section>
      )}

      <section className="border-t border-line">
        <div className="mx-auto grid max-w-[1600px] gap-8 px-5 py-20 md:grid-cols-3 md:px-10">
          <Link href={localePath(lang, "/stories")} className="link-line w-fit self-start font-display text-3xl">← {S.back}</Link>
          {more.map((m) => (
            <Link key={m.slug} href={localePath(lang, `/stories/${m.slug}`)} className="group flex gap-5">
              <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl">
                <Image src={m.image} alt="" fill sizes="128px" className="object-cover transition duration-700 group-hover:scale-105" />
              </div>
              <p className="font-display text-xl leading-snug transition group-hover:text-copper">{storyText(m, lang).title}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
