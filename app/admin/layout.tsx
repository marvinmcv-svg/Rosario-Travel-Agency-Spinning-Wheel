import type { Metadata, Viewport } from "next";
import "../globals.css";
import { fontVars } from "@/lib/fonts";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: "Team portal · Rosario Travels", robots: { index: false, follow: false } };
export const viewport: Viewport = { themeColor: "#0a0b0c" };

/* The team portal is its own root layout (English only, not indexed). */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVars}>
      <body>
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
