"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { actions, useDB, type Inquiry } from "@/lib/store";
import { AdminHeader } from "@/components/admin/AdminShell";
import { Card, btn, fmtDate } from "@/components/admin/ui";

const tabs: Inquiry["status"][] = ["open", "replied", "closed"];

export default function InquiriesPage() {
  const inquiries = useDB((db) => db.inquiries);
  const [tab, setTab] = useState<Inquiry["status"]>("open");
  const [sel, setSel] = useState<string | null>(null);
  const list = inquiries.filter((q) => q.status === tab);
  const cur = inquiries.find((q) => q.id === sel) ?? list[0];

  return (
    <>
      <AdminHeader title="Inquiries" subtitle="Messages from the contact form and Rosario AI hand-offs" />
      <div className="mb-4 flex gap-1.5">
        {tabs.map((t) => (
          <button key={t} onClick={() => { setTab(t); setSel(null); }} className={`rounded-full px-4 py-2 text-xs capitalize transition ${tab === t ? "bg-salt text-ink" : "border border-line text-salt/60 hover:text-salt"}`}>
            {t} <span className="opacity-60">{inquiries.filter((q) => q.status === t).length}</span>
          </button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card className="max-h-[70vh] overflow-y-auto p-2 md:p-2">
          {list.length === 0 && <p className="p-8 text-center text-sm text-salt/45">Nothing here — inbox zero.</p>}
          {list.map((q) => (
            <button key={q.id} onClick={() => setSel(q.id)} className={`block w-full rounded-xl p-4 text-left transition ${cur?.id === q.id ? "bg-salt/[0.07]" : "hover:bg-salt/[0.03]"}`}>
              <div className="flex justify-between text-sm">
                <span className="font-medium">{q.name}</span>
                <span className="text-xs text-salt/40">{fmtDate(q.createdAt)}</span>
              </div>
              <p className="mt-1 text-xs text-copper-2">{q.interest}</p>
              <p className="mt-1.5 line-clamp-2 text-sm text-salt/55">{q.message}</p>
            </button>
          ))}
        </Card>
        {cur && cur.status === tab ? (
          <Card>
            <p className="font-mono text-xs text-salt/45">{cur.id}</p>
            <p className="mt-1 font-display text-4xl">{cur.name}</p>
            <p className="text-sm text-salt/55">{cur.email} · {cur.interest} · {new Date(cur.createdAt).toLocaleString()}</p>
            <p className="mt-8 whitespace-pre-line text-lg leading-relaxed text-salt/85">{cur.message}</p>
            <div className="mt-10 flex flex-wrap gap-2">
              <a
                href={`mailto:${cur.email}?subject=Your journey with Rosario&body=Dear ${cur.name.split(" ")[0]},%0D%0A%0D%0AThank you for writing to us about ${cur.interest}.`}
                onClick={() => actions.setInquiryStatus(cur.id, "replied")}
                className="inline-flex items-center gap-2 rounded-full bg-copper px-4 py-2 text-sm font-medium text-ink hover:bg-copper-2"
              >
                <Mail className="h-4 w-4" /> Reply by email
              </a>
              {tabs.filter((t) => t !== cur.status).map((t) => (
                <button key={t} onClick={() => actions.setInquiryStatus(cur.id, t)} className={`${btn} capitalize`}>Mark {t}</button>
              ))}
            </div>
          </Card>
        ) : (
          <Card><p className="py-16 text-center text-sm text-salt/45">Select a message.</p></Card>
        )}
      </div>
    </>
  );
}
