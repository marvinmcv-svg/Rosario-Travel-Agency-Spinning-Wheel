"use client";

import { Sparkles } from "lucide-react";
import { openConcierge } from "./concierge-bus";

export default function AskRosario({ prompt, label, variant = "outline" }: { prompt: string; label: string; variant?: "outline" | "solid" }) {
  return (
    <button
      onClick={() => openConcierge(prompt)}
      className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm transition ${
        variant === "solid" ? "bg-copper text-ink hover:bg-copper-2" : "border border-salt/25 hover:border-copper hover:text-copper-2"
      }`}
    >
      <Sparkles className="h-4 w-4" />
      {label}
    </button>
  );
}
