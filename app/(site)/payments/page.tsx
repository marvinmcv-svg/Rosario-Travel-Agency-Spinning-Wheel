import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import PaymentMethods from "@/components/PaymentMethods";
import { FadeUp } from "@/components/motion";
import { waLink, WHATSAPP_DISPLAY } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Pay by QR",
  description: "Pay your Rosario journey or adventure with QR Simple, Tigo Money, Yape/Plin or Binance Pay, then send your receipt on WhatsApp.",
};

const faqs = [
  { q: "When do I pay?", a: "A 30% deposit secures your dates once a designer confirms availability. The balance is due 30 days before departure (or on booking for day adventures)." },
  { q: "Which currency?", a: "Prices are quoted in US dollars. Bolivian QR and Tigo Money are charged in bolivianos, Yape/Plin in soles, at the day's official rate." },
  { q: "How fast is confirmation?", a: "Usually within minutes during studio hours. Send your receipt on WhatsApp and we reply with your confirmed booking reference." },
  { q: "Prefer a card or bank wire?", a: `Ask us on WhatsApp (${WHATSAPP_DISPLAY}) and we'll send a secure card link or international wire details.` },
];

export default function PaymentsPage() {
  return (
    <>
      <PageHero image="/images/uyuni-sunset.webp" eyebrow="Scan · Pay · Go" title="Pay by QR" height="h-[70svh]" />
      <section className="mx-auto max-w-[1600px] px-5 py-28 md:px-10">
        <PaymentMethods />
      </section>
      <section className="border-t border-line px-5 py-24 md:px-10">
        <div className="mx-auto grid max-w-[1600px] gap-12 lg:grid-cols-[1fr_2fr]">
          <p className="font-impact text-5xl uppercase leading-[0.9]">Payment questions</p>
          <FadeUp stagger={0.08} className="divide-y divide-line border-y border-line">
            {faqs.map((f) => (
              <div key={f.q} className="grid gap-2 py-6 md:grid-cols-[1fr_2fr]">
                <p className="font-display text-2xl">{f.q}</p>
                <p className="text-salt/65">{f.a}</p>
              </div>
            ))}
          </FadeUp>
        </div>
        <div className="mx-auto mt-14 max-w-[1600px]">
          <a href={waLink("Hi Rosario! I have a question about payments 💳")} target="_blank" rel="noopener noreferrer" className="link-line text-copper-2">
            Still unsure? Ask on WhatsApp →
          </a>
        </div>
      </section>
    </>
  );
}
