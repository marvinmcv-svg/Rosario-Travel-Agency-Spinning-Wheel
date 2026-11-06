import type { Metadata, Viewport } from "next";
import { Anton, Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";

const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-serif" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Rosario Travels — Journeys through the Andes & South America",
    template: "%s · Rosario Travels",
  },
  description:
    "Private, slow and deeply local journeys to the Salar de Uyuni, Lake Titicaca, Machu Picchu, Patagonia and beyond — designed by Rosario.",
  openGraph: {
    title: "Rosario Travels — Journeys through the Andes",
    siteName: "Rosario Travels",
    description: "Uyuni · Titicaca · Machu Picchu · Patagonia. Private journeys designed by people who were born there.",
    images: ["/images/uyuni-mirror.webp"],
  },
};

export const viewport: Viewport = { themeColor: "#0a0b0c" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${inter.variable} ${anton.variable}`}>
      <body>{children}</body>
    </html>
  );
}
