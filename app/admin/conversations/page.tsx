"use client";

import { useState } from "react";
import { useDB } from "@/lib/store";
import { AdminHeader } from "@/components/admin/AdminShell";
import { Card, fmtDate } from "@/components/admin/ui";

export default function ConversationsAdmin() {
  const convs = useDB((db) => db.conversations);
  const [sel, setSel] = useState<string | null>(null);
  const cur = convs.find((c) => c.id === sel) ?? convs[0];
  return (
    <>
      <AdminHeader title="Rosario AI" subtitle="What travellers ask the concierge — a live feed of demand" />
      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <Card className="max-h-[72vh] overflow-y-auto p-2 md:p-2">
          {convs.length === 0 && <p className="p-8 text-center text-sm text-salt/45">No conversations yet.</p>}
          {convs.map((c) => (
            <button key={c.id} onClick={() => setSel(c.id)} className={`block w-full rounded-xl p-4 text-left transition ${cur?.id === c.id ? "bg-salt/[0.07]" : "hover:bg-salt/[0.03]"}`}>
              <div className="flex justify-between text-xs text-salt/45">
                <span>{fmtDate(c.startedAt)} · {c.messages.length} messages</span>
                <span className={c.mode === "claude" ? "text-copper-2" : ""}>{c.mode === "claude" ? "Claude" : "Offline"}</span>
              </div>
              <p className="mt-1.5 line-clamp-2 text-sm">{c.messages.find((m) => m.role === "user")?.content}</p>
            </button>
          ))}
        </Card>
        <Card className="max-h-[72vh] overflow-y-auto">
          {cur ? (
            <div className="space-y-4 text-sm">
              {cur.messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "ml-auto max-w-[80%] rounded-2xl rounded-tr-md bg-copper px-4 py-3 text-ink" : "max-w-[88%] whitespace-pre-line rounded-2xl rounded-tl-md bg-salt/[0.06] px-4 py-3 text-salt/85"}>
                  {m.content}
                </div>
              ))}
            </div>
          ) : (
            <p className="py-16 text-center text-sm text-salt/45">Select a conversation.</p>
          )}
        </Card>
      </div>
    </>
  );
}
