"use client";

import { Plus, Trash2 } from "lucide-react";
import { defaultWheelPrizes } from "@/lib/data";
import { actions, useDB } from "@/lib/store";
import { AdminHeader } from "@/components/admin/AdminShell";
import { Card, btn, fmtDate } from "@/components/admin/ui";

export default function WheelAdmin() {
  const prizes = useDB((db) => db.wheelPrizes);
  const leads = useDB((db) => db.leads);
  const enabled = useDB((db) => db.settings.wheelEnabled);
  const total = prizes.reduce((a, p) => a + Math.max(0, p.weight), 0) || 1;
  const update = (id: string, patch: Partial<(typeof prizes)[number]>) => actions.setWheelPrizes(prizes.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  return (
    <>
      <AdminHeader
        title="Spin the Andes"
        subtitle="Prizes, odds and the leads the wheel has captured"
        actions={
          <>
            <button className={btn} onClick={() => actions.setSettings({ wheelEnabled: !enabled })}>{enabled ? "Hide wheel on site" : "Show wheel on site"}</button>
            <button className={btn} onClick={() => confirm("Restore the default prizes?") && actions.setWheelPrizes(defaultWheelPrizes)}>Reset prizes</button>
          </>
        }
      />
      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card>
          <p className="mb-4 font-medium">Prizes & odds</p>
          <div className="space-y-3">
            {prizes.map((p) => (
              <div key={p.id} className="grid grid-cols-[28px_1fr_1.6fr_80px_60px_28px] items-center gap-3 text-sm">
                <input type="color" value={p.color} onChange={(e) => update(p.id, { color: e.target.value })} className="h-7 w-7 cursor-pointer rounded-full border-0 bg-transparent" aria-label="Segment colour" />
                <input value={p.label} onChange={(e) => update(p.id, { label: e.target.value.slice(0, 18) })} className="field py-1.5" aria-label="Label" />
                <input value={p.detail} onChange={(e) => update(p.id, { detail: e.target.value })} className="field py-1.5 text-salt/70" aria-label="Detail" />
                <input type="number" min={0} value={p.weight} onChange={(e) => update(p.id, { weight: Math.max(0, Number(e.target.value)) })} className="field py-1.5 text-right" aria-label="Weight" />
                <span className="text-right text-xs tabular-nums text-salt/50">{Math.round((Math.max(0, p.weight) / total) * 100)}%</span>
                <button onClick={() => prizes.length > 3 && actions.setWheelPrizes(prizes.filter((x) => x.id !== p.id))} disabled={prizes.length <= 3} className="text-salt/40 hover:text-red-300 disabled:opacity-20" aria-label="Remove prize">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => prizes.length < 12 && actions.setWheelPrizes([...prizes, { id: `p${Date.now()}`, label: "New prize", detail: "Describe the perk", color: "#3a3f44", weight: 1 }])}
            className={`${btn} mt-5 inline-flex items-center gap-2`}
          >
            <Plus className="h-4 w-4" /> Add prize
          </button>
          <p className="mt-4 text-xs text-salt/40">Weights are relative odds; every segment keeps an equal slice on the wheel. 3–12 prizes.</p>
        </Card>
        <Card>
          <p className="mb-4 font-medium">Leads captured <span className="text-salt/45">· {leads.length}</span></p>
          <div className="divide-y divide-line text-sm">
            {leads.map((l) => (
              <div key={l.id} className="flex items-center gap-3 py-3">
                <div className="flex-1">
                  <p>{l.email}</p>
                  <p className="text-xs text-salt/45">{l.prizeLabel} · {fmtDate(l.createdAt)}</p>
                </div>
                <span className="font-mono text-xs text-gold">{l.code}</span>
                <button onClick={() => actions.toggleLeadRedeemed(l.id)} className={`rounded-full border px-2.5 py-1 text-[0.65rem] ${l.redeemed ? "border-emerald-300/30 text-emerald-200" : "border-line text-salt/50"}`}>
                  {l.redeemed ? "✓ Redeemed" : "Unused"}
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
