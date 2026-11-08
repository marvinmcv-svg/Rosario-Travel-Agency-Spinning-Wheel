import Image from "next/image";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import { FadeUp } from "@/components/motion";
import { fmt } from "@/lib/i18n/fmt";
import { localeMeta, localePath } from "@/lib/i18n/config";
import { pageI18n, pageMeta } from "@/lib/i18n/server";
import { stories, storyText } from "@/lib/stories";

export const generateMetadata = ({ params }: PageProps<"/[lang]/stories">) =>
  pageMeta(params, "/stories", (t) => ({ title: t.stories.metaTitle, description: t.stories.metaDescription }));

export default async function StoriesPage({ params }: PageProps<"/[lang]/stories">) {
  const { t, lang } = await pageI18n(params);
  const S = t.stories;
  const intl = localeMeta[lang].intl;
  const list = [...stories].sort((a, b) => b.published.localeCompare(a.published));
  return (
    <>
      <PageHero image="/images/vinicunca-ridge.webp" eyebrow={S.eyebrow} title={S.title} height="h-[64svh]">
        <p className="max-w-xl font-display text-[clamp(1.25rem,2vw,1.75rem)] italic text-salt/85">{S.intro}</p>
      </PageHero>
      <section className="mx-auto max-w-[1600px] px-5 py-24 md:px-10">
        {S.englishOnly && <p className="mb-10 max-w-2xl text-sm text-salt/55">{S.englishOnly}</p>}
        <FadeUp stagger={0.1} className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => (
            <Link key={s.slug} href={localePath(lang, `/stories/${s.slug}`)} className="group block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[22px]">
                <Image src={s.image} alt="" fill sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw" className="object-cover transition duration-[1.4s] group-hover:scale-105" />
              </div>
              <p className="eyebrow mt-6 text-salt/45">
                {new Date(`${s.published}T12:00:00`).toLocaleDateString(intl, { day: "numeric", month: "long", year: "numeric" })} · {fmt(S.minRead, { n: s.minutes })}
              </p>
              <h2 className="mt-3 font-display text-3xl leading-tight transition group-hover:text-copper">{storyText(s, lang).title}</h2>
              <p className="mt-3 leading-relaxed text-salt/65">{storyText(s, lang).dek}</p>
              <p className="link-line mt-4 inline-block text-sm text-salt/80">{S.readStory} →</p>
            </Link>
          ))}
        </FadeUp>
      </section>
    </>
  );
}
