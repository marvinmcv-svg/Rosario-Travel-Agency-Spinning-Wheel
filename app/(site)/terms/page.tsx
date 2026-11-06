import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { BOOKING_TERMS } from "@/lib/essentials";
import { WHATSAPP_DISPLAY } from "@/lib/contact";

export const metadata: Metadata = { title: "Booking conditions", description: "Deposits, payments, changes, cancellations and what is included when you travel with Rosario Travels." };

export default function TermsPage() {
  const { depositPct, balanceDays, cancellation } = BOOKING_TERMS;
  return (
    <LegalPage eyebrow="The fine print, in plain words" title="Booking conditions" updated="November 2026">
      <section>
        <h2>1. Your booking</h2>
        <p>
          A request made on our website, by WhatsApp or by email is not yet a booking. A journey designer first confirms availability and sends you a
          written itinerary and price. Your booking is confirmed when you accept that proposal and we receive your deposit. These conditions then form
          the agreement between you and Rosario Travels.
        </p>
      </section>
      <section>
        <h2>2. Prices</h2>
        <p>
          Prices are in US dollars, per traveller, based on two people sharing, and shown as &ldquo;from&rdquo; because every journey is tailored. The
          price in your written proposal is the price you pay. It is guaranteed once your deposit is received, except for changes in government
          taxes, park or permit fees, which we will pass on at cost and tell you about promptly.
        </p>
      </section>
      <section>
        <h2>3. Deposit and balance</h2>
        <ul>
          <li>A deposit of <strong>{depositPct}%</strong> of the journey price confirms your booking.</li>
          <li>The balance is due <strong>{balanceDays} days before departure</strong>. Booking later than that? The full amount is due at confirmation.</li>
          <li>
            We accept QR payments, Binance Pay, card links and international bank transfer. See <Link href="/payments">Pay by QR</Link>. Always quote your
            booking reference.
          </li>
          <li>Some permits (for example Machu Picchu entry or the Inca Trail) must be bought as soon as you book and are non-refundable once issued.</li>
        </ul>
      </section>
      <section>
        <h2>4. If you cancel</h2>
        <p>Please tell us in writing. Charges depend on how close to departure we hear from you:</p>
        <div className="mt-6 overflow-hidden rounded-2xl border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-2 text-salt">
              <tr>
                <th className="px-5 py-4 font-medium">Notice before departure</th>
                <th className="px-5 py-4 font-medium">Cancellation charge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {cancellation.map((c) => (
                <tr key={c.when}>
                  <td className="px-5 py-4">{c.when.replace(" before departure", "")}</td>
                  <td className="px-5 py-4">{c.fee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>Non-refundable permits and flights already issued are charged in addition. Travel insurance with cancellation cover is strongly recommended.</p>
      </section>
      <section>
        <h2>5. Changing your journey</h2>
        <p>
          We will always try to help. Changing dates or routes more than {balanceDays} days before departure is free apart from any supplier costs. Later
          changes are treated case by case and may count as a cancellation of the parts affected.
        </p>
      </section>
      <section>
        <h2>6. If we have to change or cancel</h2>
        <p>
          Weather, flooding on the Salar, strikes, road blockades and park closures are part of travelling the Andes. If something outside our control
          forces a change, your guide will adapt the day to keep the spirit of the journey. If we must make a major change before you travel, you may
          accept it, choose another journey, or cancel for a full refund of what you have paid us.
        </p>
      </section>
      <section>
        <h2>7. Your responsibilities</h2>
        <ul>
          <li>Hold a valid passport and any visas required for your nationality (we will advise, but the responsibility is yours).</li>
          <li>Carry travel insurance covering medical treatment, evacuation and activities at the altitudes on your itinerary.</li>
          <li>Tell us before booking about any medical condition, mobility need or dietary requirement that may affect your journey.</li>
          <li>Follow your guide&rsquo;s safety instructions, especially on adventure activities and at high altitude.</li>
        </ul>
      </section>
      <section>
        <h2>8. Adventure activities</h2>
        <p>
          Activities such as the Death Road ride, Huayna Potosí, sandboarding and high-altitude treks carry inherent risk. They are run by certified
          operators with safety equipment, and you may be asked to sign the operator&rsquo;s waiver. Your guide may stop or change an activity if
          weather or your health makes it unsafe.
        </p>
      </section>
      <section>
        <h2>9. Spin the Andes prizes</h2>
        <p>
          Prize codes from the Spin the Andes wheel are limited to one per visitor and one per booking. They have no cash value, cannot be combined with
          other offers and must be quoted when you book.
        </p>
      </section>
      <section>
        <h2>10. Questions and complaints</h2>
        <p>
          If something isn&rsquo;t right during your journey, tell your guide or call us on WhatsApp ({WHATSAPP_DISPLAY}) straight away so we can fix it
          on the spot. Anything else, write to <a href="mailto:journeys@rosario.travel">journeys@rosario.travel</a> and we will reply within five working days.
        </p>
        <p>These conditions are governed by the laws of the Plurinational State of Bolivia.</p>
      </section>
    </LegalPage>
  );
}
