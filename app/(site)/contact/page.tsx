import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import ContactForm from "@/components/ContactForm";
import AskRosario from "@/components/AskRosario";
import { FadeUp } from "@/components/motion";
import WhatsAppPlanner from "@/components/WhatsAppPlanner";

export const metadata: Metadata = { title: "Contact", description: "Talk to a Rosario journey designer in La Paz, Cusco or Santiago." };

const studios = [
  { city: "La Paz", country: "Bolivia", addr: "Calle Sagárnaga 213, Casco Viejo", hours: "Mon–Sat · 9:00–19:00 BOT" },
  { city: "Cusco", country: "Peru", addr: "Cuesta San Blas 540, San Blas", hours: "Mon–Sat · 9:00–19:00 PET" },
  { city: "Santiago", country: "Chile", addr: "Av. Italia 1180, Providencia", hours: "Mon–Fri · 9:00–18:00 CLT" },
];

export default function ContactPage() {
  return (
    <>
      <PageHero image="/images/machu-picchu-terraces.webp" eyebrow="We reply within 24 hours" title="Begin here" height="h-[70svh]" />
      <section className="mx-auto grid max-w-[1600px] gap-16 px-5 py-28 md:px-10 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <p className="font-display text-4xl leading-tight">Tell us what you hope to feel. We'll find the place.</p>
          <ContactForm />
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <FadeUp className="rounded-[24px] border border-line bg-ink-2 p-8">
            <p className="eyebrow text-copper">Prefer to chat now?</p>
            <p className="mt-3 text-salt/70">Rosario AI can answer questions about seasons, altitude and routes instantly, day or night.</p>
            <div className="mt-6">
              <AskRosario prompt="I'd like help planning a journey." label="Open Rosario AI" variant="solid" />
            </div>
          </FadeUp>
          <FadeUp stagger={0.08} className="mt-12 divide-y divide-line border-y border-line">
            {studios.map((s) => (
              <div key={s.city} className="py-6">
                <p className="font-display text-3xl">{s.city} <span className="text-base text-salt/45">· {s.country}</span></p>
                <p className="mt-2 text-sm text-salt/65">{s.addr}</p>
                <p className="mt-1 text-sm text-salt/45">{s.hours}</p>
              </div>
            ))}
          </FadeUp>
        </div>
      </section>
      <section id="whatsapp" className="border-t border-line px-5 py-28 md:px-10">
        <div className="mx-auto max-w-[1600px]">
          <p className="eyebrow mb-4 text-[#25d366]">Fastest reply · WhatsApp</p>
          <p className="font-impact mb-14 text-[clamp(2.6rem,6vw,5.5rem)] uppercase leading-[0.9]">Message us in four taps</p>
          <WhatsAppPlanner />
        </div>
      </section>
    </>
  );
}
