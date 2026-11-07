import { pageI18n, pageMeta } from "@/lib/i18n/server";
import PageHero from "@/components/PageHero";
import ContactForm from "@/components/ContactForm";
import AskRosario from "@/components/AskRosario";
import { FadeUp } from "@/components/motion";
import WhatsAppPlanner from "@/components/WhatsAppPlanner";

export const generateMetadata = ({ params }: PageProps<"/[lang]/contact">) =>
  pageMeta(params, "/contact", (t) => ({ title: t.contact.metaTitle, description: t.contact.metaDescription }));

const studios = [
  { city: "La Paz", addr: "Calle Sagárnaga 213, Casco Viejo" },
  { city: "Cusco", addr: "Cuesta San Blas 540, San Blas" },
  { city: "Santiago", addr: "Av. Italia 1180, Providencia" },
];

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { t } = await pageI18n(params);
  const C = t.contact;
  return (
    <>
      <PageHero image="/images/machu-picchu-terraces.webp" eyebrow={C.eyebrow} title={C.title} height="h-[70svh]" />
      <section className="mx-auto grid max-w-[1600px] gap-16 px-5 py-28 md:px-10 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <p className="font-display text-4xl leading-tight">{C.lead}</p>
          <ContactForm />
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <FadeUp className="rounded-[24px] border border-line bg-ink-2 p-8">
            <p className="eyebrow text-copper">{C.chatTitle}</p>
            <p className="mt-3 text-salt/70">{C.chatText}</p>
            <div className="mt-6">
              <AskRosario prompt={C.chatPrompt} label={C.openAI} variant="solid" />
            </div>
          </FadeUp>
          <FadeUp stagger={0.08} className="mt-12 divide-y divide-line border-y border-line">
            {studios.map((s, i) => (
              <div key={s.city} className="py-6">
                <p className="font-display text-3xl">{s.city} <span className="text-base text-salt/45">· {C.countries[i]}</span></p>
                <p className="mt-2 text-sm text-salt/65">{s.addr}</p>
                <p className="mt-1 text-sm text-salt/45">{C.hours[i]}</p>
              </div>
            ))}
          </FadeUp>
        </div>
      </section>
      <section id="whatsapp" className="border-t border-line px-5 py-28 md:px-10">
        <div className="mx-auto max-w-[1600px]">
          <p className="eyebrow mb-4 text-[#25d366]">{C.waEyebrow}</p>
          <p className="font-impact mb-14 text-[clamp(2.6rem,6vw,5.5rem)] uppercase leading-[0.9]">{C.waTitle}</p>
          <WhatsAppPlanner />
        </div>
      </section>
    </>
  );
}
