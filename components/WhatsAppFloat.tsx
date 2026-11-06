"use client";

import { usePathname } from "next/navigation";
import { waLink } from "@/lib/contact";

/* Always-there WhatsApp button (bottom-left; Rosario AI lives bottom-right). */
export default function WhatsAppFloat() {
  const path = usePathname();
  const text =
    path === "/payments"
      ? "Hi Rosario! I have a question about paying by QR 💳"
      : path.startsWith("/adventures")
        ? "Hi Rosario! 🔥 I want to book an adventure."
        : path.startsWith("/journeys/") || path.startsWith("/destinations/")
          ? `Hi Rosario! I'm looking at rosario.travel${path} and want to know more.`
          : "Hi Rosario! 👋 I want to plan a trip.";
  return (
    <a
      href={waLink(text)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Rosario on WhatsApp"
      data-float className="group fixed bottom-5 left-5 z-[58] flex h-14 items-center gap-3 rounded-full bg-[#25d366] pl-4 pr-4 text-[#07280f] shadow-[0_15px_50px_-10px_rgba(37,211,102,0.7)] transition-all duration-500 hover:pr-6 md:bottom-8 md:left-8"
    >
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25d366] opacity-30" />
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden>
        <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.16-3.48-8.41" />
      </svg>
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-500 group-hover:max-w-[200px]">Book on WhatsApp</span>
    </a>
  );
}
