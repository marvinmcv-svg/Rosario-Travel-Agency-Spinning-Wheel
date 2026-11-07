"use client";

import { useEffect, useState } from "react";
import { actions, SHARED, useDB } from "@/lib/store";
import { AdminHeader } from "@/components/admin/AdminShell";
import { Card, btn, btnSolid } from "@/components/admin/ui";

export default function SettingsAdmin() {
  const settings = useDB((db) => db.settings);
  const [draft, setDraft] = useState(settings);
  const [saved, setSaved] = useState(false);
  useEffect(() => setDraft(settings), [settings]);

  return (
    <>
      <AdminHeader title="Settings" subtitle="Rosario AI, the wheel and the site announcement" />
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <p className="font-medium">Rosario AI</p>
          <label className="mt-5 flex items-center gap-3 text-sm">
            <input type="checkbox" checked={draft.aiEnabled} onChange={(e) => setDraft({ ...draft, aiEnabled: e.target.checked })} className="accent-[#c4703f]" />
            Show the concierge on the website
          </label>
          <label className="mt-6 block text-xs text-salt/50">
            Greeting
            <textarea rows={4} value={draft.aiGreeting} onChange={(e) => setDraft({ ...draft, aiGreeting: e.target.value })} className="field resize-none text-sm text-salt" />
          </label>
          <p className="mt-4 text-xs leading-relaxed text-salt/45">
            Live answers use Claude when <span className="font-mono">ANTHROPIC_API_KEY</span> is set on the server; otherwise Rosario answers from the built-in offline knowledge of your destinations and journeys.
          </p>
        </Card>
        <Card>
          <p className="font-medium">Website</p>
          <label className="mt-5 block text-xs text-salt/50">
            Announcement toast (leave empty to hide)
            <textarea rows={3} value={draft.announcement} onChange={(e) => setDraft({ ...draft, announcement: e.target.value })} className="field resize-none text-sm text-salt" />
          </label>
          <label className="mt-6 flex items-center gap-3 text-sm">
            <input type="checkbox" checked={draft.wheelEnabled} onChange={(e) => setDraft({ ...draft, wheelEnabled: e.target.checked })} className="accent-[#c4703f]" />
            Show “Spin the Andes” on the home page
          </label>
        </Card>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          className={btnSolid}
          onClick={() => {
            actions.setSettings(draft);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
          }}
        >
          Save changes
        </button>
        {saved && <span className="text-sm text-emerald-200">Saved ✓</span>}
        {!SHARED && (
          <button className={`${btn} ml-auto`} onClick={() => confirm("Reset all portal data to the demo dataset?") && actions.resetDemo()}>
            Reset demo data
          </button>
        )}
      </div>
    </>
  );
}
