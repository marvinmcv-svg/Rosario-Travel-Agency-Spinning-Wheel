"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDB } from "@/lib/store";
import { addDaysIso, bookedOn, hotels, roomCount, todayBolivia } from "@/lib/hotels";
import { AdminHeader } from "@/components/admin/AdminShell";
import { Card, Stat, btn } from "@/components/admin/ui";
import { StayStatusPill, fmtDay, hotelName, inHouseOn, roomName } from "@/components/admin/stays-ui";

const DAYS = 21;

export default function Occupancy() {
  const stays = useDB((db) => db.stays);
  const overrides = useDB((db) => db.hotelOverrides);
  const today = todayBolivia();
  const [hotel, setHotel] = useState(hotels[0].slug);
  const [start, setStart] = useState(today);
  const [picked, setPicked] = useState<{ room: string; night: string } | null>(null);
  const h = hotels.find((x) => x.slug === hotel)!;
  const days = useMemo(() => Array.from({ length: DAYS }, (_, i) => addDaysIso(start, i)), [start]);

  const capacity = h.rooms.reduce((n, r) => n + roomCount(hotel, r.id, overrides), 0);
  const tonight = h.rooms.reduce((n, r) => n + bookedOn(stays, hotel, r.id, today), 0);
  const arrivals = stays.filter((s) => s.hotel === hotel && s.checkIn === today && s.status !== "cancelled" && s.status !== "no-show");
  const departures = stays.filter((s) => s.hotel === hotel && s.checkOut === today && s.status !== "cancelled" && s.status !== "no-show");
  const inHouse = stays.filter((s) => s.hotel === hotel && inHouseOn(s, today));
  const guestsTonight = inHouse.reduce((n, s) => n + s.guests, 0);
  const pickedStays = picked ? stays.filter((s) => s.hotel === hotel && s.room === picked.room && inHouseOn(s, picked.night)) : [];

  return (
    <>
      <AdminHeader title="Occupancy" subtitle="Rooms booked per night across Hoteles Rosario. Click a night to see who is staying." />

      <div className="mb-5 flex flex-wrap gap-1.5">
        {hotels.map((x) => (
          <button key={x.slug} onClick={() => { setHotel(x.slug); setPicked(null); }} className={`rounded-full px-4 py-2 text-sm transition ${hotel === x.slug ? "bg-salt text-ink" : "border border-line text-salt/60 hover:text-salt"}`}>
            {hotelName(x.slug)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Occupancy tonight" value={`${capacity ? Math.round((tonight / capacity) * 100) : 0}%`} hint={`${tonight} of ${capacity} rooms`} />
        <Stat label="Guests in house" value={guestsTonight} hint={`${inHouse.length} reservations`} />
        <Stat label="Arrivals today" value={arrivals.length} hint={arrivals.map((s) => s.name.split(" ")[0]).join(", ") || "None"} />
        <Stat label="Departures today" value={departures.length} hint={departures.map((s) => s.name.split(" ")[0]).join(", ") || "None"} />
      </div>

      <Card className="mt-4 overflow-x-auto">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="font-medium">{h.name}</p>
          <div className="flex items-center gap-2">
            <button className={btn} onClick={() => setStart(addDaysIso(start, -7))} aria-label="Previous week"><ChevronLeft className="h-4 w-4" /></button>
            <button className={btn} onClick={() => setStart(today)}>Today</button>
            <button className={btn} onClick={() => setStart(addDaysIso(start, 7))} aria-label="Next week"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
        <table className="w-full min-w-[980px] border-separate border-spacing-1 text-xs" data-testid="occupancy-grid">
          <thead>
            <tr>
              <th className="w-52 text-left font-normal text-salt/45">Room type</th>
              {days.map((d) => (
                <th key={d} className={`font-normal ${d === today ? "text-copper-2" : "text-salt/45"}`}>
                  {fmtDay(d).split(",")[0]}<br /><span className="text-salt/70">{+d.slice(8)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {h.rooms.map((r) => {
              const total = roomCount(hotel, r.id, overrides);
              return (
                <tr key={r.id}>
                  <td className="pr-2 text-salt/75">{roomName(r.id)}<br /><span className="text-salt/40">{total} rooms</span></td>
                  {days.map((d) => {
                    const n = bookedOn(stays, hotel, r.id, d);
                    const pct = total ? n / total : 1;
                    const on = picked?.room === r.id && picked.night === d;
                    return (
                      <td key={d} className="p-0">
                        <button
                          onClick={() => setPicked({ room: r.id, night: d })}
                          title={`${n}/${total} booked`}
                          className={`h-11 w-full rounded-lg tabular-nums transition ${on ? "ring-2 ring-salt" : ""} ${n > total ? "bg-red-400/70 text-ink" : ""}`}
                          style={n > total ? undefined : { background: n ? `rgb(199 121 34 / ${0.18 + pct * 0.72})` : "rgb(243 239 231 / 0.04)", color: pct > 0.6 ? "#0a0b0c" : undefined }}
                        >
                          {n ? `${n}/${total}` : ""}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-salt/40">Darker = fuller. Red means more rooms booked than the inventory (overbooked).</p>
      </Card>

      {picked && (
        <Card className="mt-4">
          <p className="font-medium">{roomName(picked.room)} · night of {fmtDay(picked.night)}</p>
          <div className="mt-3 divide-y divide-line">
            {pickedStays.length === 0 && <p className="py-3 text-sm text-salt/50">Nobody booked.</p>}
            {pickedStays.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 text-sm">
                <span className="w-24 font-mono text-xs text-salt/50">{s.id}</span>
                <span className="flex-1">{s.name}</span>
                <span className="text-salt/55">{s.rooms} room{s.rooms > 1 ? "s" : ""} · {s.guests} guests</span>
                <span className="text-salt/55">{fmtDay(s.checkIn)} → {fmtDay(s.checkOut)}</span>
                <StayStatusPill status={s.status} />
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}
