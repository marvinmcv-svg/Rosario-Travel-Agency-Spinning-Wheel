"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/data";
import { actions, useDB } from "@/lib/store";
import { extrasFor, hotels, roomCount, roomRate } from "@/lib/hotels";
import { waDigits } from "@/lib/stay-message";
import { AdminHeader } from "@/components/admin/AdminShell";
import { Card, btnSolid } from "@/components/admin/ui";
import { T, roomName } from "@/components/admin/stays-ui";

export default function HotelsAdmin() {
  const overrides = useDB((db) => db.hotelOverrides);
  const number = useDB((db) => db.settings.staysWhatsApp);
  const [wa, setWa] = useState(number);
  const [saved, setSaved] = useState(false);
  useEffect(() => setWa(number), [number]);

  return (
    <>
      <AdminHeader title="Hotels & rates" subtitle="Room rates (USD per room per night, breakfast included), inventory and online booking, per hotel. Changes apply to the website at once." />

      <Card className="mb-4">
        <p className="font-medium">WhatsApp for hotel bookings</p>
        <p className="mt-1 text-sm text-salt/55">Booking requests from the website open a WhatsApp chat with this number. Use the full international number.</p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="text-xs text-salt/50">
            Number
            <input value={wa} onChange={(e) => setWa(e.target.value)} placeholder="+591 7…" className="field w-64 py-2 text-base text-salt" data-testid="stays-wa" />
          </label>
          <button
            className={btnSolid}
            onClick={() => {
              const digits = waDigits(wa);
              if (digits.length < 8) return alert("That doesn't look like a full phone number.");
              actions.setSettings({ staysWhatsApp: digits });
              setSaved(true);
              setTimeout(() => setSaved(false), 2000);
            }}
          >
            Save
          </button>
          {saved && <span className="text-sm text-emerald-200">Saved ✓</span>}
          <a href={`https://wa.me/${waDigits(number)}`} target="_blank" rel="noopener noreferrer" className="text-sm text-[#25d366] underline underline-offset-2">Test the link</a>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {hotels.map((h) => {
          const closed = !!overrides[h.slug]?.closed;
          return (
            <Card key={h.slug}>
              <div className="flex gap-4">
                <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl">
                  <Image src={h.image} alt="" fill sizes="112px" className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-display text-2xl leading-tight">{h.name}</p>
                  <p className="text-xs text-salt/50">{h.town} · {h.stars}★ · {h.phone}</p>
                  <label className="mt-3 flex items-center gap-2 text-xs text-salt/70">
                    <input type="checkbox" checked={!closed} onChange={(e) => actions.setHotelOverride(h.slug, { closed: !e.target.checked })} className="accent-[#c77922]" />
                    Taking online bookings
                  </label>
                </div>
              </div>
              <table className="mt-5 w-full text-sm">
                <thead className="text-xs text-salt/45">
                  <tr><th className="pb-2 text-left font-normal">Room type</th><th className="pb-2 font-normal">Sleeps</th><th className="pb-2 font-normal">Rate (USD)</th><th className="pb-2 font-normal">Rooms</th></tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {h.rooms.map((r) => (
                    <tr key={r.id}>
                      <td className="py-2 pr-3 text-salt/80">{roomName(r.id)}</td>
                      <td className="py-2 text-center text-salt/55">{r.guests}</td>
                      <td className="py-2 text-center">
                        <input
                          type="number"
                          min={0}
                          step={5}
                          key={`${r.id}-rate-${roomRate(h.slug, r.id, overrides)}`}
                          defaultValue={roomRate(h.slug, r.id, overrides)}
                          onBlur={(e) => actions.setHotelOverride(h.slug, { rooms: { [r.id]: { rate: Math.max(0, +e.target.value || 0) } } })}
                          className="w-20 rounded-lg border border-line bg-ink px-2 py-1 text-center tabular-nums"
                          aria-label={`${roomName(r.id)} rate`}
                          data-testid={`rate-${r.id}`}
                        />
                      </td>
                      <td className="py-2 text-center">
                        <input
                          type="number"
                          min={0}
                          key={`${r.id}-count-${roomCount(h.slug, r.id, overrides)}`}
                          defaultValue={roomCount(h.slug, r.id, overrides)}
                          onBlur={(e) => actions.setHotelOverride(h.slug, { rooms: { [r.id]: { count: Math.max(0, Math.round(+e.target.value || 0)) } } })}
                          className="w-16 rounded-lg border border-line bg-ink px-2 py-1 text-center tabular-nums"
                          aria-label={`${roomName(r.id)} rooms`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-4 text-xs text-salt/45">
                Extras guests can order: {extrasFor(h.slug).map((e) => `${T.extras[e.id]} (${formatPrice(e.price)} ${T.per[e.per]})`).join(" · ")}
              </p>
            </Card>
          );
        })}
      </div>
    </>
  );
}
