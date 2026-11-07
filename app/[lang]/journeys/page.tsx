import PageHero from "@/components/PageHero";
import JourneyList from "@/components/JourneyList";
import { fmt } from "@/lib/i18n/fmt";
import { pageI18n, pageMeta } from "@/lib/i18n/server";

export const generateMetadata = ({ params }: PageProps<"/[lang]/journeys">) =>
  pageMeta(params, "/journeys", (t) => ({ title: t.journeys.metaTitle, description: t.journeys.metaDescription }));

export default async function JourneysPage({ params }: PageProps<"/[lang]/journeys">) {
  const { t, content } = await pageI18n(params);
  return (
    <>
      <PageHero image="/images/machu-picchu-golden.webp" eyebrow={fmt(t.journeys.eyebrow, { n: content.journeys.length })} title={t.journeys.title} height="h-[78svh]">
        <p className="max-w-xl text-lg text-salt/80">{t.journeys.intro}</p>
      </PageHero>
      <JourneyList />
    </>
  );
}
