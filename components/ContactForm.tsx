"use client";

import { useState } from "react";
import { fmt } from "@/lib/i18n/fmt";
import { useI18n } from "./i18n";
import { actions } from "@/lib/store";

export default function ContactForm() {
  const { t, content } = useI18n();
  const C = t.contact;
  const destinations = content.destinations;
  const [f, setF] = useState({ name: "", email: "", interest: destinations[0].name, message: "" });
  const [sent, setSent] = useState(false);
  if (sent)
    return (
      <div className="mt-12 rounded-[24px] border border-gold/30 p-8">
        <p className="eyebrow text-gold">{C.received}</p>
        <p className="mt-3 font-display text-3xl">{fmt(C.thanks, { name: f.name.split(" ")[0] })}</p>
      </div>
    );
  return (
    <form
      className="mt-12 grid gap-6 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        actions.createInquiry({ name: f.name.trim(), email: f.email.trim(), interest: f.interest, message: f.message.trim() });
        setSent(true);
      }}
    >
      <input required placeholder={t.common.yourName} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="field" aria-label={t.common.yourName} />
      <input required type="email" placeholder={t.common.email} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className="field" aria-label={t.common.email} />
      <label className="sm:col-span-2">
        <span className="text-sm text-salt/55">{C.dreaming}</span>
        <select value={f.interest} onChange={(e) => setF({ ...f, interest: e.target.value })} className="field">
          {destinations.map((d) => (
            <option key={d.slug}>{d.name}</option>
          ))}
          <option>{C.notSure}</option>
        </select>
      </label>
      <textarea required rows={5} placeholder={C.messagePlaceholder} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} className="field resize-none sm:col-span-2" aria-label={C.messagePlaceholder} />
      <button className="w-fit rounded-full bg-copper px-9 py-4 text-sm font-medium text-ink transition hover:bg-copper-2">{C.sendBtn}</button>
    </form>
  );
}
