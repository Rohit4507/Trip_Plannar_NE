import Link from "next/link";
import { SiteFooter, SiteNav } from "@/components/site-chrome";

export default function NotFound() {
  return (
    <>
      <SiteNav />
      <main className="grid min-h-[80svh] place-items-center px-4 pt-28">
        <div className="max-w-lg text-center">
          <p className="font-display text-7xl font-semibold text-rust-500">404</p>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">This route doesn&apos;t exist</h1>
          <p className="mt-4 text-[14.5px] leading-relaxed text-mist-300">
            Like a road after monsoon in Arunachal. Let&apos;s get you back on track — build a fresh itinerary or browse
            the atlas.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/#planner" className="rounded-full bg-mist-50 px-6 py-3.5 text-[14px] font-bold text-ink-950 transition hover:bg-white">
              Build an itinerary
            </Link>
            <Link href="/destinations" className="rounded-full border border-white/15 px-6 py-3.5 text-[14px] font-semibold text-mist-100 transition hover:bg-white/5">
              Browse destinations
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
