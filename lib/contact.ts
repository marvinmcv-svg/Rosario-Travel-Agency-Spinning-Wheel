/* One place for the business line. Every WhatsApp call to action on the
   site (planner, floating button, adventures, payments) builds its link here. */
export const WHATSAPP_NUMBER = "59177165787"; // +591 77165787 · Bolivia
export const WHATSAPP_DISPLAY = "+591 771 65787";

export const waLink = (text?: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
