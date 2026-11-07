import { pageI18n, pageMeta } from "@/lib/i18n/server";
import credits from "@/lib/credits.json";

export const generateMetadata = ({ params }: PageProps<"/[lang]/credits">) => pageMeta(params, "/credits", (t) => ({ title: t.credits.metaTitle }));

type Credit = { name: string; title: string; author: string; license: string; source: string };

export default async function CreditsPage({ params }: PageProps<"/[lang]/credits">) {
  const { t } = await pageI18n(params);
  const C = t.credits;
  return (
    <section className="mx-auto max-w-5xl px-5 pb-28 pt-40 md:px-10">
      <p className="eyebrow mb-5 text-copper">{C.eyebrow}</p>
      <h1 className="font-display text-7xl">{C.title}</h1>
      <p className="mt-6 max-w-2xl text-salt/65">
        {C.text}
      </p>
      <ul className="mt-14 divide-y divide-line border-y border-line">
        {(credits as Credit[]).map((c) => (
          <li key={c.name} className="grid gap-2 py-5 text-sm md:grid-cols-[1fr_1fr_auto] md:gap-8">
            <a href={c.source} target="_blank" rel="noreferrer" className="link-line w-fit text-salt/90">{c.title}</a>
            <span className="text-salt/60">{c.author || C.unknown}</span>
            <span className="text-salt/45">{c.license}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
