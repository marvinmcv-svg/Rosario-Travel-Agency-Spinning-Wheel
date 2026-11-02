/* Tiny event bus so any button on the site can open Rosario AI,
   optionally with a prefilled question (e.g. from a journey page). */
export const CONCIERGE_EVENT = "rosario:concierge";

export function openConcierge(prompt?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CONCIERGE_EVENT, { detail: { prompt } }));
}
