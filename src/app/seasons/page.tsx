import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { FESTIVALS, MONTHS, SEASON_NOTES, STATES } from "@/lib/data/knowledge";
import { PLACES } from "@/lib/data/places";

export const metadata: Metadata = {
  title: "When to go to Northeast India — month by month",
  description:
    "A month-by-month season guide for the Seven Sisters and Sikkim: weather, park closures, festival dates, crowd levels and the best-value windows.",
};

const MONTH_NOTES: Record<number, { title: string; body: string; tone: "peak" | "good" | "risk" }> = {
  1: { title: "Cold, clear, empty", body: "Frost in the hills, superb visibility, lowest prices of the peak half-year. Magh Bihu feasting in Assam.", tone: "good" },
  2: { title: "Losar and rhododendrons begin", body: "Monpa New Year masked dances at Tawang. Best month for Kanchenjunga clarity from Pelling.", tone: "peak" },
  3: { title: "Spring blooms", body: "Rhododendrons in Sikkim and Arunachal, Shirui lilies begin in Ukhrul. Dzukou still closed by winter grass burn.", tone: "good" },
  4: { title: "Warm days, zero crowds", body: "Ziro at its best for Apatani paddy preparation. Rongali Bihu across Assam. Plains get hot by May.", tone: "good" },
  5: { title: "Pre-monsoon heat", body: "Shirui Lily Festival and Moatsü in Nagaland. Humidity builds; Kaziranga still open until mid-June.", tone: "risk" },
  6: { title: "Monsoon arrives", body: "Kaziranga closes mid-month. Cherrapunji and Mawsynram hit full force — extraordinary, but trails shut.", tone: "risk" },
  7: { title: "Heaviest rain", body: "Only for monsoon photographers. Roads to Tawang and North Sikkim landslide-prone. Everything is green and cheap.", tone: "risk" },
  8: { title: "Still wet", body: "Dzukou is at its most beautiful (lilies bloom June–September) but the trek is only safe with a guide.", tone: "risk" },
  9: { title: "The best compromise", body: "Rain easing, waterfalls still roaring, prices low, and the Ziro Music Festival in late September.", tone: "good" },
  10: { title: "The sweet spot", body: "Monsoon gone, Kaziranga reopens, landscapes impossibly green, Hornbill rush hasn't started. Our #1 pick.", tone: "peak" },
  11: { title: "Peak without the peak", body: "Clear across all eight states. Sangai Festival in Imphal, Wangala in the Garo Hills, Durga Puja in Tripura.", tone: "peak" },
  12: { title: "Hornbill season", body: "1–10 December at Kisama. Kohima sells out — book two months ahead. Sela Pass snowbound but stunning.", tone: "peak" },
};

const TONE_COLOR: Record<string, string> = {
  peak: "#1FA97A",
  good: "#F6C35C",
  risk: "#E4572E",
};

export default function SeasonsPage() {
  return (
    <>
      <SiteNav />
      <main className="px-4 pb-6 pt-28 sm:px-6 sm:pt-36">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-rust-400">Timing</p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            When to go, honestly
          </h1>
          <p className="mt-5 max-w-2xl text-[15.5px] leading-relaxed text-mist-300">
            The Northeast has one dominant variable: rain. Everything else — park openings, road conditions, festival
            dates, prices — follows from it. If you only read one thing: <strong className="text-mist-100">late October to
            mid-November</strong> is the single best window.
          </p>

          {/* season blocks */}
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {SEASON_NOTES.map((s) => (
              <div key={s.label} className="rounded-3xl card-edge bg-ink-850/60 p-6">
                <div className="flex items-center justify-between">
                  <span className="rounded-full px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wider" style={{ background: `${TONE_COLOR[s.tone]}22`, color: TONE_COLOR[s.tone] }}>
                    {s.label}
                  </span>
                </div>
                <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight text-mist-50">{s.title}</h2>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-mist-300">{s.body}</p>
              </div>
            ))}
          </div>

          {/* month grid */}
          <h2 className="mt-16 font-display text-3xl font-semibold tracking-tight">Month by month</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {MONTHS.map((m, i) => {
              const note = MONTH_NOTES[i + 1];
              const open = PLACES.filter((p) => p.best.includes(i + 1)).length;
              return (
                <div key={m} className="rounded-2xl card-edge bg-ink-850/50 p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-xl font-semibold text-mist-50">{m}</h3>
                    <span className="rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ background: `${TONE_COLOR[note.tone]}22`, color: TONE_COLOR[note.tone] }}>
                      {note.tone === "peak" ? "Peak" : note.tone === "good" ? "Good" : "Risky"}
                    </span>
                  </div>
                  <p className="mt-2 text-[13.5px] font-semibold text-mist-100">{note.title}</p>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-mist-400">{note.body}</p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/6">
                    <span className="block h-full rounded-full" style={{ width: `${(open / PLACES.length) * 100}%`, background: TONE_COLOR[note.tone] }} />
                  </div>
                  <p className="mt-1.5 text-[11px] text-mist-500">
                    {open} of {PLACES.length} destinations at their best
                  </p>
                </div>
              );
            })}
          </div>

          {/* state matrix */}
          <h2 className="mt-16 font-display text-3xl font-semibold tracking-tight">Best window by state</h2>
          <div className="mt-6 space-y-2.5">
            {STATES.map((s) => {
              const inState = PLACES.filter((p) => p.st === s.code);
              return (
                <div key={s.code} className="rounded-2xl card-edge bg-ink-850/50 p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-display text-lg font-semibold text-mist-50">{s.name}</h3>
                    <span className="text-[12px] font-semibold" style={{ color: s.color }}>
                      {s.bestWindow}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-12 gap-1">
                    {MONTHS.map((m, i) => {
                      const good = inState.filter((p) => p.best.includes(i + 1)).length;
                      const bad = inState.filter((p) => p.avoid.includes(i + 1)).length;
                      const ratio = inState.length ? good / inState.length : 0;
                      const bg = bad > inState.length / 2 ? "#E4572E26" : ratio > 0.5 ? `${s.color}` : ratio > 0 ? `${s.color}66` : "rgba(255,255,255,0.06)";
                      return (
                        <div key={m} className="text-center">
                          <div className="h-8 rounded-md" style={{ background: bg }} title={`${m}: ${good}/${inState.length} places at their best`} />
                          <span className="mt-1 block text-[9px] font-medium text-mist-500">{m[0]}</span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-[12.5px] leading-relaxed text-mist-400">
                    <span className="font-semibold text-mist-200">Monsoon:</span> {s.monsoon} · <span className="font-semibold text-mist-200">Gateway:</span> {s.gateway}
                  </p>
                </div>
              );
            })}
          </div>

          {/* festivals */}
          <h2 className="mt-16 font-display text-3xl font-semibold tracking-tight">Festival calendar</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...FESTIVALS].sort((a, b) => a.month - b.month).map((f) => {
              const st = STATES.find((s) => s.code === f.state)!;
              return (
                <div key={f.name} className="rounded-2xl card-edge bg-ink-850/60 p-5" style={{ boxShadow: `inset 0 0 0 1px ${st.color}1f` }}>
                  <div className="flex items-center justify-between">
                    <span className="rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ background: `${st.color}22`, color: st.color }}>
                      {MONTHS[f.month - 1]}
                    </span>
                    <span className="text-[11px] font-semibold text-mist-400">{f.days}</span>
                  </div>
                  <h3 className="mt-3 font-display text-lg font-semibold leading-tight text-mist-50">{f.name}</h3>
                  <p className="mt-1 text-[11.5px] font-medium text-mist-400">{f.where}, {st.name}</p>
                  <p className="mt-2.5 text-[12.5px] leading-relaxed text-mist-300">{f.what}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-14 rounded-3xl card-edge bg-gradient-to-br from-rust-500/12 to-transparent p-8">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Lock your dates in</h2>
            <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-mist-200">
              Tell the planner your month and it will filter out everything that&apos;s closed, fog-bound or underwater —
              then build a route that works in exactly those conditions.
            </p>
            <Link href="/#planner" className="mt-6 inline-flex rounded-full bg-mist-50 px-6 py-3.5 text-[14px] font-bold text-ink-950 transition hover:bg-white">
              Build my itinerary →
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
