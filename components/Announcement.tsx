"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useDB } from "@/lib/store";

/* A quiet toast for the admin-editable announcement. Appears once, after the
   visitor scrolls past the hero; hides itself after 12 s; remembers dismissal. */
export default function Announcement() {
  const text = useDB((db) => db.settings.announcement);
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!text) return;
    let dismissed = "";
    try {
      dismissed = localStorage.getItem("rosario.announcement") ?? "";
    } catch {}
    if (dismissed === text) return;
    // Wait until the visitor has left the hero and settled in, show once, then step aside.
    let hide: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      if (window.scrollY < window.innerHeight * 1.2) return;
      window.removeEventListener("scroll", onScroll);
      setShow(true);
      hide = setTimeout(() => setShow(false), 12000);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(hide);
    };
  }, [text]);
  if (!show || !text) return null;
  return (
    <div className="fixed bottom-24 left-5 right-5 z-[55] max-w-sm sm:right-auto animate-[toast_0.8s_var(--ease-expo)] rounded-2xl border border-line bg-ink-2/90 p-5 pr-12 text-sm text-salt/85 shadow-2xl backdrop-blur-xl md:bottom-28 md:left-8">
      <p className="eyebrow mb-2 text-gold">News from the Altiplano</p>
      {text}
      <button
        onClick={() => {
          setShow(false);
          try {
            localStorage.setItem("rosario.announcement", text);
          } catch {}
        }}
        className="absolute right-3 top-3 rounded-full p-1.5 text-salt/50 hover:bg-salt/10 hover:text-salt"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
      <style>{`@keyframes toast{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
