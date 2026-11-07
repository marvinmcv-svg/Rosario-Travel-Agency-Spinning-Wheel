import PageHero from "@/components/PageHero";
import PaymentMethods from "@/components/PaymentMethods";
import { FadeUp } from "@/components/motion";
import { waLink, WHATSAPP_DISPLAY } from "@/lib/contact";
import { BOOKING_TERMS } from "@/lib/essentials";
import { fmt } from "@/lib/i18n/fmt";
import { pageI18n, pageMeta } from "@/lib/i18n/server";

export const generateMetadata = ({ params }: PageProps<"/[lang]/payments">) =>
  pageMeta(params, "/payments", (t) => ({ title: t.payments.metaTitle, description: t.payments.metaDescription }));

export default async function PaymentsPage({ params }: PageProps<"/[lang]/payments">) {
  const { t } = await pageI18n(params);
  const P = t.payments;
  // Deposit and balance terms come from one place (lib/essentials.ts) so this page matches /terms.
  const faqs = P.faqs.map((f) => ({ q: f.q, a: fmt(f.a, { pct: BOOKING_TERMS.depositPct, days: BOOKING_TERMS.balanceDays, phone: WHATSAPP_DISPLAY }) }));
  return (
    <>
      <PageHero image="/images/uyuni-sunset.webp" eyebrow={P.eyebrow} title={P.title} height="h-[70svh]" />
      <section className="mx-auto max-w-[1600px] px-5 py-28 md:px-10">
        <PaymentMethods />
      </section>
      <section className="border-t border-line px-5 py-24 md:px-10">
        <div className="mx-auto grid max-w-[1600px] gap-12 lg:grid-cols-[1fr_2fr]">
          <p className="font-impact text-5xl uppercase leading-[0.9]">{P.questions}</p>
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
          <a href={waLink(P.unsureText)} target="_blank" rel="noopener noreferrer" className="link-line text-copper-2">
            {P.unsure}
          </a>
        </div>
      </section>
    </>
  );
}
