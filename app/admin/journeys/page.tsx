"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/data";
import { actions, useJourneys } from "@/lib/store";
import { AdminHeader } from "@/components/admin/AdminShell";
import { Card } from "@/components/admin/ui";

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={on} onClick={() => onChange(!on)} className="flex items-center gap-2 text-xs text-salt/65">
      <span className={`relative h-5 w-9 rounded-full transition ${on ? "bg-copper" : "bg-salt/15"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-salt transition-all ${on ? "left-[18px]" : "left-0.5"}`} />
      </span>
      {label}
    </button>
  );
}

export default function JourneysAdmin() {
  const list = useJourneys();
  return (
    <>
      <AdminHeader title="Journeys" subtitle="Prices, availability and visibility update on the website instantly" />
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((j) => (
          <Card key={j.slug} className="flex gap-5">
            <div className="relative hidden h-auto w-36 shrink-0 overflow-hidden rounded-xl sm:block">
              <Image src={j.image} alt="" fill sizes="144px" className="object-cover" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link href={`/journeys/${j.slug}`} target="_blank" className="font-display text-3xl hover:text-copper-2">{j.title}</Link>
                  <p className="text-xs text-salt/50">{j.days} days · {j.style}</p>
                </div>
                {!j.published && <span className="rounded-full border border-line px-2.5 py-1 text-[0.65rem] text-salt/50">Hidden</span>}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4">
                <label className="text-xs text-salt/50">
                  Price from (USD)
                  <input type="number" min={0} step={10} defaultValue={j.priceFrom} onBlur={(e) => actions.setJourneyOverride(j.slug, { priceFrom: Math.max(0, Number(e.target.value) || 0) })} className="field py-2 text-base text-salt" />
                </label>
                <label className="text-xs text-salt/50">
                  Spots left (next departure)
                  <input type="number" min={0} defaultValue={j.spotsLeft ?? ""} placeholder="—" onBlur={(e) => actions.setJourneyOverride(j.slug, { spotsLeft: e.target.value === "" ? undefined : Math.max(0, Number(e.target.value)) })} className="field py-2 text-base text-salt" />
                </label>
              </div>
              <div className="mt-5 flex flex-wrap gap-5">
                <Toggle on={!!j.featured} onChange={(v) => actions.setJourneyOverride(j.slug, { featured: v })} label="Featured on home" />
                <Toggle on={j.published} onChange={(v) => actions.setJourneyOverride(j.slug, { published: v })} label="Published" />
              </div>
              <p className="mt-4 text-xs text-salt/40">Live price: {formatPrice(j.priceFrom)}</p>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
