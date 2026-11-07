"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Check, QrCode, ShieldCheck } from "lucide-react";
import { paymentMethods } from "@/lib/payments";
import { waLink } from "@/lib/contact";
import { fmt } from "@/lib/i18n/fmt";
import { useI18n } from "./i18n";
import { Tilt3D } from "./adventure-ui";

export default function PaymentMethods({ initialRef = "", initialAmount = "" }: { initialRef?: string; initialAmount?: string }) {
  const [id, setId] = useState(paymentMethods[0].id);
  const [amount, setAmount] = useState(initialAmount);
  const [ref, setRef] = useState(initialRef);
  const [qr, setQr] = useState("");
  const m = paymentMethods.find((x) => x.id === id)!;
  const { t } = useI18n();
  const P = t.payments;
  const local = (pm: (typeof paymentMethods)[number]) => P.methods[pm.id] ?? { kind: pm.kind, steps: pm.steps };

  // Pre-fill from ?ref=&amount= (booking confirmation links here).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("ref")) setRef(q.get("ref")!);
    if (q.get("amount")) setAmount(q.get("amount")!);
  }, []);

  const forRef = ref ? fmt(P.forBooking, { ref }) : "";
  const intent = fmt(P.intent, { amount: amount ? ` US$${amount}` : "", method: m.name, ref: forRef });
  const receipt = fmt(P.receipt, { method: m.name, amount: amount ? ` (US$${amount})` : "", ref: forRef });

  useEffect(() => {
    if (m.qrImage) return;
    QRCode.toDataURL(waLink(intent), { margin: 1, width: 560, errorCorrectionLevel: "M", color: { dark: "#0a0b0c", light: "#f3efe7" } })
      .then(setQr)
      .catch(() => setQr(""));
  }, [intent, m.qrImage]);

  return (
    <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-center">
      <div>
        <div className="grid gap-3 sm:grid-cols-2">
          {paymentMethods.map((p) => (
            <button
              key={p.id}
              onClick={() => setId(p.id)}
              className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition duration-500 hover:-translate-y-0.5 ${
                p.id === id ? "border-transparent bg-ink-3" : "border-line hover:border-salt/40"
              }`}
              style={p.id === id ? { boxShadow: `inset 0 0 0 1px ${p.accent}, 0 20px 60px -25px ${p.accent}` } : undefined}
            >
              <span className="flex items-center justify-between">
                <span className="font-impact text-2xl uppercase tracking-wide">{p.name}</span>
                <QrCode className="h-5 w-5 opacity-60" style={{ color: p.accent }} />
              </span>
              <span className="mt-1 block text-xs text-salt/55">{local(p).kind}</span>
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <label>
            <span className="eyebrow text-salt/50">{P.amount}</span>
            <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ""))} placeholder={P.amountPh} className="field mt-1 text-lg" />
          </label>
          <label>
            <span className="eyebrow text-salt/50">{P.ref}</span>
            <input value={ref} onChange={(e) => setRef(e.target.value.toUpperCase())} placeholder="RO-XXXX" className="field mt-1 text-lg" />
          </label>
        </div>

        <ol className="mt-10 space-y-4">
          {local(m).steps.map((s, i) => (
            <li key={s} className="flex gap-4 text-salt/75">
              <span className="font-impact text-2xl leading-none" style={{ color: m.accent }}>
                0{i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>

        <a
          href={waLink(receipt)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex items-center gap-3 rounded-full bg-[#25d366] px-7 py-4 text-sm font-medium text-[#07280f] transition hover:scale-[1.03]"
        >
          <Check className="h-4 w-4" /> {P.paid}
        </a>
        <p className="mt-5 flex items-center gap-2 text-xs text-salt/45">
          <ShieldCheck className="h-4 w-4 shrink-0" /> {P.safety}
        </p>
      </div>

      <Tilt3D className="mx-auto w-full max-w-[440px] rounded-[32px]">
        <div className="relative overflow-hidden rounded-[32px] border border-salt/15 bg-ink-2 p-8 shadow-[0_60px_120px_-40px_rgba(0,0,0,0.9)]">
          <div className="pointer-events-none absolute -inset-20 opacity-40 blur-3xl" style={{ background: `radial-gradient(circle at 30% 20%, ${m.accent}, transparent 55%)` }} />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="eyebrow text-salt/50">{P.scan}</p>
              <p className="font-impact mt-1 text-3xl uppercase">{m.name}</p>
            </div>
            <span className="rounded-full border border-salt/20 px-3 py-1 text-xs">{m.currency}</span>
          </div>
          <div className="relative mt-7 aspect-square overflow-hidden rounded-2xl bg-salt p-4 [transform:translateZ(40px)]">
            {m.qrImage ? (
              <Image src={m.qrImage} alt={`${m.name} QR code`} fill className="object-contain p-4" />
            ) : qr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qr} alt={fmt(P.qrAlt, { method: m.name })} className="h-full w-full" />
            ) : null}
            <span className="pointer-events-none absolute inset-x-0 top-0 h-1/3 animate-[scan_2.6s_ease-in-out_infinite] bg-gradient-to-b from-transparent to-[rgba(37,211,102,0.35)]" />
          </div>
          <dl className="relative mt-7 space-y-2 text-sm">
            {m.details.map((d) => (
              <div key={d.label} className="flex justify-between gap-4 border-b border-line pb-2">
                <dt className="text-salt/50">{P.detailLabels[d.label] ?? d.label}</dt>
                <dd className="text-right">{P.detailValues[d.value] ?? d.value}</dd>
              </div>
            ))}
          </dl>
          {!m.qrImage && (
            <p className="relative mt-5 text-[0.7rem] leading-relaxed text-salt/40">
              {fmt(P.qrNote, { method: m.name })}
            </p>
          )}
        </div>
      </Tilt3D>
    </div>
  );
}
