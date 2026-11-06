/* ──────────────────────────────────────────────────────────────
   QR payment methods.

   HOW TO GO LIVE: each method can show your real, bank-issued QR.
   Drop the image in /public/qr/ (e.g. /public/qr/bnb.png) and set
   `qrImage` below. Until then the page generates a QR that opens a
   WhatsApp chat with the payment details pre-filled, so a traveller
   who scans it always reaches a person who can take the payment.
   ────────────────────────────────────────────────────────────── */
export type PaymentMethod = {
  id: string;
  name: string;
  kind: string;
  currency: string;
  /** Path to the real QR image in /public/qr — leave undefined to auto-generate. */
  qrImage?: string;
  /** Lines shown under the QR (account holder, bank, alias…). */
  details: { label: string; value: string }[];
  steps: string[];
  accent: string;
};

export const paymentMethods: PaymentMethod[] = [
  {
    id: "qr-simple",
    name: "QR Simple Bolivia",
    kind: "Interbank QR · any Bolivian bank app",
    currency: "BOB",
    accent: "#2fb67c",
    details: [
      { label: "Beneficiary", value: "Rosario Travel" },
      { label: "Works with", value: "BNB · BCP · Mercantil · BancoSol · Unión" },
    ],
    steps: ["Open your bank app and choose “Pay with QR”.", "Scan the code and enter the amount in bolivianos.", "Send us the receipt on WhatsApp — we confirm in minutes."],
  },
  {
    id: "tigo-money",
    name: "Tigo Money",
    kind: "Mobile wallet",
    currency: "BOB",
    accent: "#3d7bff",
    details: [
      { label: "Wallet", value: "Confirmed on WhatsApp" },
      { label: "Name", value: "Rosario Travel" },
    ],
    steps: ["Open Tigo Money → Pay with QR.", "Scan and confirm the amount.", "Forward the confirmation SMS or screenshot to us on WhatsApp."],
  },
  {
    id: "yape",
    name: "Yape / Plin",
    kind: "Peru · instant transfer",
    currency: "PEN",
    accent: "#a23ad6",
    details: [
      { label: "For", value: "Cusco & Machu Picchu journeys" },
      { label: "Name", value: "Rosario Travel" },
    ],
    steps: ["Open Yape or Plin and tap Scan.", "Enter the amount in soles.", "Share the receipt with us on WhatsApp."],
  },
  {
    id: "usdt",
    name: "USDT · Binance Pay",
    kind: "Crypto · international travellers",
    currency: "USDT",
    accent: "#f0b90b",
    details: [
      { label: "Network", value: "Binance Pay / TRC-20" },
      { label: "Ask for", value: "Wallet address on WhatsApp" },
    ],
    steps: ["Open Binance and choose Pay → Scan.", "Send the amount in USDT.", "Share the transaction ID on WhatsApp."],
  },
];
