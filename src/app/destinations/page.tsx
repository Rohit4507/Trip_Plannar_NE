import type { Metadata } from "next";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { DestinationsExplorer, type DestLite } from "@/components/destinations-explorer";
import { PLACES } from "@/lib/data/places";
import { STATES } from "@/lib/data/knowledge";

export const metadata: Metadata = {
  title: "The Northeast atlas — 70+ destinations",
  description:
    "Every destination we've mapped across the Seven Sisters and Sikkim: crowd levels, best months, altitude, costs and what not to miss. Filter by interest, month and hidden-gem status.",
};

export default async function DestinationsPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string; focus?: string }>;
}) {
  const { state, focus } = await searchParams;
  const places: DestLite[] = PLACES.map((p) => ({
    id: p.id,
    n: p.n,
    st: p.st,
    region: p.region,
    lat: p.lat,
    lng: p.lng,
    alt: p.alt,
    tags: p.tags,
    hrs: p.hrs,
    nights: p.nights,
    gem: p.gem,
    crowd: p.crowd,
    best: p.best,
    avoid: p.avoid,
    costMid: p.cost.mid,
    blurb: p.blurb,
    photo: p.photo,
    highlights: p.highlights,
  }));

  return (
    <>
      <SiteNav />
      <main className="px-4 pb-6 pt-28 sm:px-6 sm:pt-36">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-rust-400">The atlas</p>
            <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              {PLACES.length} places across eight states
            </h1>
            <p className="mt-5 text-[15.5px] leading-relaxed text-mist-300">
              Crowd scores are our own — a 5 is Cherrapunji viewpoint on a Sunday, a 1 means you may not see another
              traveller all day. Filter by month to hide everything that&apos;s unreachable or disappointing in your
              travel window.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-8">
            {STATES.map((s) => (
              <a
                key={s.code}
                href={`?state=${s.code}`}
                className="group rounded-2xl card-edge bg-ink-850/60 p-3.5 transition hover:bg-ink-800"
              >
                <span className="font-display text-[11px] font-bold tracking-[0.12em]" style={{ color: s.color }}>
                  {s.code}
                </span>
                <p className="mt-1 text-[13px] font-semibold leading-tight text-mist-50">{s.name}</p>
                <p className="mt-1 text-[11px] text-mist-500">{PLACES.filter((p) => p.st === s.code).length} places</p>
              </a>
            ))}
          </div>

          <div className="mt-8">
            <DestinationsExplorer places={places} initialState={state} focus={focus} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
