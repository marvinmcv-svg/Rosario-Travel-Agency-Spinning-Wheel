import Link from "next/link";
import { Wordmark } from "@/components/Preloader";

export const metadata = { title: "Off the map" };

/* A lost traveller lands here: same dusk sky as the entrance flyover. */
export default function NotFound() {
  return (
    <main className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#07080b_0%,#141218_45%,#3b1c18_75%,#8a3f1e_100%)] px-6 text-center">
      <Link href="/" className="absolute left-6 top-8 md:left-12 md:top-10" aria-label="Rosario Travels home">
        <Wordmark className="text-2xl text-salt" />
      </Link>
      <p className="eyebrow text-salt/60">Error 404 · Off the map</p>
      <h1 className="mt-6 font-display text-[clamp(3rem,9vw,8rem)] leading-[0.9] tracking-[-0.03em]">
        This trail <em className="text-copper-2">doesn&rsquo;t exist</em>
      </h1>
      <p className="mt-6 max-w-md text-salt/70">
        Even our guides couldn&rsquo;t find this page. Let&rsquo;s get you back to somewhere worth going.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-full bg-salt px-6 py-3.5 text-sm font-medium text-ink transition hover:bg-copper">
          Back to base camp
        </Link>
        <Link href="/destinations" className="rounded-full border border-salt/30 px-6 py-3.5 text-sm transition hover:border-salt hover:bg-salt/10">
          Browse destinations
        </Link>
      </div>
    </main>
  );
}
