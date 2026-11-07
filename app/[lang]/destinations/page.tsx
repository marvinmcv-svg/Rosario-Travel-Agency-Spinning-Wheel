import PageHero from "@/components/PageHero";
import DestinationGrid from "@/components/DestinationGrid";
import { countWord, fmt } from "@/lib/i18n/fmt";
import { pageI18n, pageMeta } from "@/lib/i18n/server";

export const generateMetadata = ({ params }: PageProps<"/[lang]/destinations">) =>
  pageMeta(params, "/destinations", (t) => ({ title: t.destinations.metaTitle, description: t.destinations.metaDescription }));

export default async function DestinationsPage({ params }: PageProps<"/[lang]/destinations">) {
  const { t, content } = await pageI18n(params);
  const countries = new Set(content.destinations.flatMap((d) => d.countryEn.split(" · "))).size;
  const eyebrow = `${fmt(t.common.places, { n: countWord(t.numberWords, content.destinations.length) })} · ${fmt(t.common.countries, { n: countWord(t.numberWords, countries, false) })}`;
  return (
    <>
      <PageHero image="/images/uyuni-island.webp" eyebrow={eyebrow} title={t.destinations.title} height="h-[78svh]">
        <p className="max-w-xl text-lg text-salt/80">{t.destinations.intro}</p>
      </PageHero>
      <DestinationGrid />
    </>
  );
}
