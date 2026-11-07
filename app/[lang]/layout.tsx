import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { fontVars } from "@/lib/fonts";
import { alternatesFor, hasLocale, localeMeta, locales, siteUrl } from "@/lib/i18n/config";
import { getI18n } from "@/lib/i18n/server";
import { I18nProvider } from "@/components/i18n";
import SmoothScroll from "@/components/SmoothScroll";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Concierge from "@/components/Concierge";
import Announcement from "@/components/Announcement";
import WhatsAppFloat from "@/components/WhatsAppFloat";

export const dynamicParams = false;
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { t } = await getI18n(lang);
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: t.meta.title, template: "%s · Rosario Travels" },
    description: t.meta.description,
    alternates: alternatesFor(lang, "/"),
    openGraph: {
      title: t.meta.ogTitle,
      description: t.meta.ogDescription,
      siteName: "Rosario Travels",
      locale: localeMeta[lang].og,
      alternateLocale: locales.filter((l) => l !== lang).map((l) => localeMeta[l].og),
      images: ["/images/uyuni-mirror.webp"],
    },
  };
}

export const viewport: Viewport = { themeColor: "#0a0b0c" };

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const { t, content } = await getI18n(lang);
  return (
    <html lang={localeMeta[lang].intl} className={fontVars}>
      <body>
        <I18nProvider lang={lang} t={t} content={content}>
          <SmoothScroll>
            <Nav />
            <main>{children}</main>
            <Footer />
            <Concierge />
            <Announcement />
            <WhatsAppFloat />
          </SmoothScroll>
        </I18nProvider>
      </body>
    </html>
  );
}
