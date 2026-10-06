import Link from "next/link";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { PlannerWizard } from "@/components/planner-wizard";
import { RouteMap } from "@/components/route-map";
import { STATES, FESTIVALS, MONTHS } from "@/lib/data/knowledge";
import { PLACES } from "@/lib/data/places";

const HERO_STATS = [
  { value: "8", label: "states covered" },
  { value: "70", label: "destinations mapped" },
  { value: "143", label: "measured road legs" },
  { value: "0", label: "generic templates" },
];

const FEATURES = [
  {
    emoji: "🧭",
    title: "Road-aware routing",
    body: "The engine knows that Guwahati→Tawang is 14 hours and must be split, that Dawki is only glass-clear in winter, and that Sela closes in snow. Nearest-neighbour plus 2-opt optimisation keeps you under a sane daily drive limit.",
  },
  {
    emoji: "📄",
    title: "Permits, handled properly",
    body: "ILP for Indians, PAP for foreigners, which portal, what fee, how long it takes, and the traps — like Bum La needing a separate Army permit, or Arunachal refusing solo foreign travellers.",
  },
  {
    emoji: "💎",
    title: "A real hidden-gem index",
    body: "Every destination carries a crowd score. Ask for offbeat and the engine will send you to Mawphanlur, Mechuka and Longwa instead of the Instagram defaults.",
  },
  {
    emoji: "💸",
    title: "Honest 2025–26 costs",
    body: "Per-night rates by tier and state, shared Sumo seats vs private cab splits, park fees, permits and a 7% contingency. Enter a budget and it tells you exactly which lever to pull.",
  },
  {
    emoji: "🌦️",
    title: "Season intelligence",
    body: "Month-level best/avoid windows per place. Kaziranga shuts June–October; Dzukou blooms with a lily found nowhere else; Hornbill is 1–10 December and sells out Kohima.",
  },
  {
    emoji: "🌱",
    title: "Community-first",
    body: "Homestays over hotel chains, village kitchens over buffets, and a local-benefit score that tells you how much of your money stays in the valley.",
  },
];

const TRANSPORT = [
  { mode: "Shared Sumo", cost: "₹150–500 / seat", note: "10-seater jeeps on fixed routes. They leave when full — usually 6–9 am. The backbone of Northeast travel." },
  { mode: "Private cab", cost: "₹2,200 + ₹13/km", note: "Sedan with driver. Worth it on the Tawang and North Sikkim legs where viewpoints and photo stops matter." },
  { mode: "State bus", cost: "₹100–600", note: "Slow, cheap, surprisingly comfortable on the Assam trunk routes. Meghalaya Transport runs Guwahati–Shillong." },
  { mode: "Helicopter", cost: "₹3,500", note: "Guwahati–Shillong and Tawang shuttle services. Weather-dependent, book through the state aviation office." },
  { mode: "Ferry", cost: "₹20–40", note: "Nimati ghat to Majuli across the Brahmaputra — a 90-minute crossing that is a highlight in itself." },
  { mode: "Flights", cost: "₹4,500–9,000 return", note: "Guwahati (GAU) reaches everywhere. Bagdogra (IXB) for Sikkim, Dimapur (DMU) for Nagaland, Imphal (IMF) for Manipur." },
];

export default function Home() {
  const mapPoints = PLACES.map((p) => ({
    id: p.id,
    name: p.n,
    lat: p.lat,
    lng: p.lng,
    state: p.st,
    gem: p.gem,
  }));

  const featured = ["nongriat", "tawang", "ziro", "loktak", "mechuka", "kaziranga"]
    .map((id) => PLACES.find((p) => p.id === id))
    .filter((p): p is (typeof PLACES)[number] => Boolean(p));

  return (
    <>
      <SiteNav />

      {/* ───────── HERO ───────── */}
      <section className="relative min-h-[100svh] overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/hero.jpg" alt="Dawn over the Eastern Himalaya, Arunachal Pradesh" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-950/70 via-ink-900/80 to-ink-900" />
          <div className="absolute inset-0 mesh opacity-40" />
          <div className="absolute inset-0 animate-drift bg-[radial-gradient(50%_40%_at_20%_30%,rgba(31,169,122,0.16),transparent_70%)]" />
        </div>

        <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-center px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/30 px-3.5 py-2 backdrop-blur-md">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rust-400 opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rust-500" />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mist-200">
                Route engine · refreshed for 2025–26
              </span>
            </div>

            <h1 className="mt-6 font-display text-[2.75rem] font-semibold leading-[0.98] tracking-tight text-balance-tight sm:text-7xl lg:text-[5.25rem]">
              Northeast India,
              <br />
              <span className="bg-gradient-to-r from-jade-300 via-mist-50 to-gold-300 bg-clip-text text-transparent">
                planned properly.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-[15.5px] leading-relaxed text-mist-200 sm:text-lg">
              The Seven Sisters don&apos;t work like the rest of India. Permits, 14-hour mountain passes, parks that
              close for four months, and homestays with no wifi. Our engine plans for all of it — then shows you the
              places Google doesn&apos;t.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#planner"
                className="group flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rust-500 to-gold-500 px-7 py-4 text-[15px] font-bold text-ink-950 shadow-xl shadow-rust-700/25 transition hover:brightness-110 active:scale-[0.98]"
              >
                Build my itinerary
                <span className="transition group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="/destinations"
                className="flex items-center justify-center gap-2 rounded-full border border-white/15 bg-black/25 px-7 py-4 text-[15px] font-semibold text-mist-100 backdrop-blur transition hover:bg-black/40 active:scale-[0.98]"
              >
                Explore 70+ destinations
              </Link>
            </div>

            <dl className="mt-12 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
              {HERO_STATS.map((s) => (
                <div key={s.label} className="border-l border-white/12 pl-4">
                  <dt className="font-display text-3xl font-semibold text-mist-50">{s.value}</dt>
                  <dd className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.12em] text-mist-400">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-mist-500">Scroll</span>
          <span className="h-10 w-px bg-gradient-to-b from-mist-400/60 to-transparent" />
        </div>
      </section>

      {/* ───────── WIZARD ───────── */}
      <section className="relative -mt-6 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-rust-400">The planner</p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Answer six questions. Get a real route.
              </h2>
            </div>
            <p className="max-w-sm text-[13.5px] leading-relaxed text-mist-400">
              No sign-up, no email gate. The plan is generated server-side from our dataset and saved to a shareable link.
            </p>
          </div>
          <PlannerWizard />
        </div>
      </section>

      {/* ───────── MAP ───────── */}
      <section className="px-4 pt-24 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-jade-400">The region</p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Everything we&apos;ve mapped, so far
              </h2>
            </div>
            <Link href="/destinations" className="text-sm font-semibold text-jade-300 transition hover:text-jade-200">
              Open the full atlas →
            </Link>
          </div>
          <RouteMap points={mapPoints} variant="compact" caption="70+ destinations · 8 states" />
        </div>
      </section>

      {/* ───────── FEATURES ───────── */}
      <section className="px-4 pt-24 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-rust-400">Why this is different</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Built for how the Northeast actually works
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-mist-300">
              Most trip planners are city-hopping engines with a hill station bolted on. This one was written against
              ground reality: checkgates, ferry timetables, seasonal park closures and the fact that a 90 km stretch can
              take five hours.
            </p>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group relative overflow-hidden rounded-3xl card-edge bg-ink-850/60 p-6 transition hover:bg-ink-800/80"
              >
                <span className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-rust-500/10 blur-2xl transition group-hover:bg-rust-500/20" />
                <span className="text-2xl">{f.emoji}</span>
                <h3 className="mt-4 font-display text-xl font-semibold tracking-tight text-mist-50">{f.title}</h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-mist-300">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── STATES ───────── */}
      <section className="px-4 pt-24 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold-400">The eight</p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Seven sisters, one brother, zero repeats
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-mist-300">
                Each state is a different country — different tribes, different food, different paperwork. Tap any one to
                see its destinations and start a plan pinned to it.
              </p>
            </div>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STATES.map((s) => {
              const count = PLACES.filter((p) => p.st === s.code).length;
              return (
                <Link
                  key={s.code}
                  href={`/destinations?state=${s.code}`}
                  className="group relative overflow-hidden rounded-3xl card-edge bg-ink-850/60 p-5 transition hover:-translate-y-1 hover:bg-ink-800"
                >
                  <span
                    className="absolute inset-x-0 top-0 h-[3px] transition-all duration-500 group-hover:h-1.5"
                    style={{ background: `linear-gradient(90deg, ${s.color}, transparent)` }}
                  />
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-display text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: s.color }}>
                      {s.code}
                    </span>
                    <span className="rounded-full bg-white/6 px-2 py-0.5 text-[10px] font-bold text-mist-300">
                      {count} places
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-xl font-semibold leading-tight tracking-tight text-mist-50">{s.name}</h3>
                  <p className="mt-1 text-[12px] italic text-mist-400">{s.nickname}</p>
                  <p className="mt-3 text-[12.5px] leading-relaxed text-mist-300">{s.tagline}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <span className="rounded-md bg-white/5 px-2 py-1 text-[10.5px] font-semibold text-mist-300">{s.bestWindow}</span>
                    <span
                      className="rounded-md px-2 py-1 text-[10.5px] font-semibold"
                      style={{ background: `${s.color}1c`, color: s.color }}
                    >
                      {s.permit === "none" ? "No permit" : s.permit === "ILP" ? "ILP" : "ILP / PAP"}
                    </span>
                  </div>
                  <p className="mt-4 border-t border-white/5 pt-3 text-[11.5px] leading-relaxed text-mist-500">{s.fact}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────── FEATURED ───────── */}
      <section className="px-4 pt-24 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-rust-400">Signature places</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Six that justify the flight</h2>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p, i) => (
              <Link
                key={p.id}
                href={`/destinations?focus=${p.id}`}
                className={`group relative overflow-hidden rounded-3xl card-edge ${i === 0 ? "sm:col-span-2" : ""}`}
              >
                <div className={`relative ${i === 0 ? "h-72 sm:h-80" : "h-64"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.photo} alt={p.n} className="h-full w-full object-cover transition duration-[900ms] group-hover:scale-[1.06]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/35 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-mist-200 backdrop-blur">
                      {p.region}
                    </span>
                    {p.gem && (
                      <span className="rounded-full bg-gold-500/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-950">
                        Hidden gem
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2.5 font-display text-2xl font-semibold leading-tight tracking-tight text-white">{p.n}</h3>
                  <p className="mt-2 line-clamp-2 max-w-md text-[13px] leading-relaxed text-mist-200">{p.blurb}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── TRANSPORT ───────── */}
      <section id="transport" className="scroll-mt-24 px-4 pt-24 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-loom-300">Getting around</p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Distances lie here. Hours don&apos;t.
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-mist-300">
                100 km on NH6 from Guwahati to Shillong takes three hours. 100 km from Dirang up to Sela can take five.
                Every leg in our engine carries a measured drive time based on road class, gradient and altitude — not a
                straight-line guess.
              </p>
              <div className="mt-6 rounded-2xl card-edge bg-ink-850/70 p-5">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.16em] text-mist-500">The golden rules</h4>
                <ul className="mt-3 space-y-2.5 text-[13.5px] leading-relaxed text-mist-200">
                  <li className="flex gap-2.5"><span className="text-rust-400">01</span>Never book a flight for the same day as a long mountain drive.</li>
                  <li className="flex gap-2.5"><span className="text-rust-400">02</span>Leave at dawn. Cloud builds after 10 am and kills the views.</li>
                  <li className="flex gap-2.5"><span className="text-rust-400">03</span>Anything over 5.5 hours becomes its own transfer day.</li>
                  <li className="flex gap-2.5"><span className="text-rust-400">04</span>Hire the driver, not just the car. Local drivers read the passes.</li>
                </ul>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {TRANSPORT.map((t) => (
                <div key={t.mode} className="rounded-2xl card-edge bg-ink-850/60 p-5 transition hover:bg-ink-800/80">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-display text-lg font-semibold text-mist-50">{t.mode}</h3>
                    <span className="shrink-0 text-[12px] font-bold text-jade-300">{t.cost}</span>
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-mist-300">{t.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────── BUDGET ───────── */}
      <section id="budget" className="scroll-mt-24 px-4 pt-24 sm:px-6">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl card-edge bg-ink-850/60">
          <div className="grid lg:grid-cols-3">
            {[
              { tier: "Backpacker", range: "₹1,500–2,800 / day", total: "7 days ≈ ₹15,000–22,000", points: ["Dorms and village homestays (₹600–1,000)", "Shared Sumos and state buses", "Market food, jadoh and momos", "Free viewpoints, minimal paid activities"] },
              { tier: "Mid-range", range: "₹4,000–7,000 / day", total: "7 days ≈ ₹30,000–45,000", points: ["Boutique guesthouses and tea bungalows", "Private cab split across 3–4 people", "One safari or guided experience daily", "Cafe dinners in Shillong and Gangtok"], highlight: true },
              { tier: "Comfort", range: "₹9,000–18,000 / day", total: "7 days ≈ ₹70,000+", points: ["Heritage bungalows, Wildlife Resorts, luxury camps", "Private SUV with a dedicated driver", "Private guides and boat charters", "Internal flights instead of long drives"] },
            ].map((b) => (
              <div
                key={b.tier}
                className={`relative p-7 ${b.highlight ? "bg-gradient-to-b from-rust-500/12 to-transparent lg:border-x lg:border-white/8" : ""}`}
              >
                {b.highlight && (
                  <span className="absolute right-5 top-5 rounded-full bg-rust-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-950">
                    Most chosen
                  </span>
                )}
                <h3 className="font-display text-2xl font-semibold tracking-tight text-mist-50">{b.tier}</h3>
                <p className="mt-1.5 text-[13px] font-semibold text-jade-300">{b.range}</p>
                <p className="mt-4 font-display text-lg text-mist-100">{b.total}</p>
                <ul className="mt-5 space-y-2">
                  {b.points.map((p) => (
                    <li key={p} className="flex gap-2.5 text-[13px] leading-relaxed text-mist-300">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── FESTIVALS ───────── */}
      <section className="px-4 pt-24 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold-400">Plan around a festival</p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                The dates that should decide your month
              </h2>
            </div>
            <Link href="/seasons" className="text-sm font-semibold text-gold-300 transition hover:text-gold-200">
              Full season guide →
            </Link>
          </div>
        </div>
        <div className="mt-10 overflow-hidden">
          <div className="flex w-max animate-marquee gap-3">
            {[...FESTIVALS, ...FESTIVALS].map((f, i) => {
              const st = STATES.find((s) => s.code === f.state)!;
              return (
                <div key={f.name + i} className="w-[290px] shrink-0 rounded-2xl card-edge bg-ink-850/60 p-5">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ background: `${st.color}1f`, color: st.color }}>
                      {MONTHS[f.month - 1]}
                    </span>
                    <span className="text-[11px] font-semibold text-mist-400">{f.days}</span>
                  </div>
                  <h3 className="mt-3 font-display text-lg font-semibold leading-tight text-mist-50">{f.name}</h3>
                  <p className="mt-1 text-[12px] font-medium text-mist-400">{f.where}, {st.name}</p>
                  <p className="mt-2.5 text-[12.5px] leading-relaxed text-mist-300">{f.what}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────── CTA ───────── */}
      <section className="px-4 pt-24 sm:px-6">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] card-edge">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/root-bridge.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/90 to-ink-950/50" />
          <div className="relative max-w-2xl p-8 sm:p-14">
            <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-balance-tight sm:text-5xl">
              The Northeast rewards the people who plan it properly.
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-mist-200">
              Six minutes of questions. A route with real drive times, permits, costs and three places you&apos;ve never
              heard of. Then go — before everyone else does.
            </p>
            <Link
              href="#planner"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-mist-50 px-7 py-4 text-[15px] font-bold text-ink-950 transition hover:bg-white active:scale-[0.98]"
            >
              Start planning →
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
