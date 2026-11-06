import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Privacy policy", description: "What Rosario Travels collects, why, and how to ask us to change or delete it." };

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Your information" title="Privacy policy" updated="November 2026">
      <section>
        <h2>What we collect</h2>
        <ul>
          <li><strong>Booking and enquiry details</strong>: your name, email, phone or WhatsApp number, travel dates, group size and anything you tell us in your notes.</li>
          <li><strong>Traveller details</strong> once you book: passport details, dietary and medical information you choose to share, and emergency contacts.</li>
          <li><strong>Conversations</strong> with Rosario AI, our journey designers and on WhatsApp.</li>
          <li><strong>Newsletter and Spin the Andes</strong>: your email and any prize code you win.</li>
        </ul>
      </section>
      <section>
        <h2>Why we use it</h2>
        <ul>
          <li>To design, book and run your journey, including sharing the necessary details with hotels, guides, airlines, rail operators and national parks.</li>
          <li>To answer your questions and keep in touch about your trip.</li>
          <li>To send our seasonal letters, only if you subscribed. Every letter has an unsubscribe link.</li>
          <li>To improve our journeys and website.</li>
        </ul>
        <p>We never sell your information.</p>
      </section>
      <section>
        <h2>Rosario AI</h2>
        <p>
          Our concierge chat is powered by an AI model. Messages you send are processed to generate replies and kept so our team can follow up and
          improve the service. Please don&rsquo;t share passport numbers or payment details in the chat; a journey designer will collect those securely.
        </p>
      </section>
      <section>
        <h2>How long we keep it</h2>
        <p>
          Enquiries are kept for two years. Booking records are kept for as long as tax and travel regulations require, usually up to seven years. Medical
          and dietary notes are deleted after your journey ends.
        </p>
      </section>
      <section>
        <h2>Your choices</h2>
        <p>
          You can ask to see, correct or delete your information, or to stop marketing at any time. Write to{" "}
          <a href="mailto:journeys@rosario.travel">journeys@rosario.travel</a> and we will respond within 30 days.
        </p>
      </section>
      <section>
        <h2>Cookies and local storage</h2>
        <p>
          This site stores a small amount of information in your browser, such as whether you have already spun the wheel, dismissed an announcement or
          seen the intro. It is not used to track you across other websites.
        </p>
      </section>
    </LegalPage>
  );
}
