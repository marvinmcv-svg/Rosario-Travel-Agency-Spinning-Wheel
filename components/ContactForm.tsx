"use client";

import { useState } from "react";
import { destinations } from "@/lib/data";
import { actions } from "@/lib/store";

export default function ContactForm() {
  const [f, setF] = useState({ name: "", email: "", interest: destinations[0].name, message: "" });
  const [sent, setSent] = useState(false);
  if (sent)
    return (
      <div className="mt-12 rounded-[24px] border border-gold/30 p-8">
        <p className="eyebrow text-gold">Message received</p>
        <p className="mt-3 font-display text-3xl">Thank you, {f.name.split(" ")[0]}. A designer will write within 24 hours.</p>
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
      <input required placeholder="Your name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="field" aria-label="Your name" />
      <input required type="email" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className="field" aria-label="Email" />
      <label className="sm:col-span-2">
        <span className="text-sm text-salt/55">I'm dreaming of</span>
        <select value={f.interest} onChange={(e) => setF({ ...f, interest: e.target.value })} className="field">
          {destinations.map((d) => (
            <option key={d.slug}>{d.name}</option>
          ))}
          <option>Not sure yet — inspire me</option>
        </select>
      </label>
      <textarea required rows={5} placeholder="When, who with, and what you hope to feel…" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} className="field resize-none sm:col-span-2" aria-label="Message" />
      <button className="w-fit rounded-full bg-copper px-9 py-4 text-sm font-medium text-ink transition hover:bg-copper-2">Send to a designer</button>
    </form>
  );
}
