import SmoothScroll from "@/components/SmoothScroll";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Concierge from "@/components/Concierge";
import Announcement from "@/components/Announcement";
import WhatsAppFloat from "@/components/WhatsAppFloat";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScroll>
      <Nav />
      <main>{children}</main>
      <Footer />
      <Concierge />
      <Announcement />
      <WhatsAppFloat />
    </SmoothScroll>
  );
}
