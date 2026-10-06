import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { PERMITS, STATES } from "@/lib/data/knowledge";

export const metadata: Metadata = {
  title: "ILP & PAP permits — the complete 2026 guide",
  description:
    "Which Northeast India states need an Inner Line Permit or Protected Area Permit, what they cost, how long they take, which portal to use, and the mistakes that ruin trips.",
};

const TIMELINE = [
  { when: "4–3 weeks out", what: "Foreign nationals: book a registered Arunachal operator and file the PAP. Group of 2 minimum." },
  { when: "2 weeks out", what: "Indian nationals: apply for the Arunachal eILP on arunachalilp.com. List every district you might enter." },
  { when: "1 week out", what: "Nagaland ILP (₹140) and Mizoram ILP (₹120). Print two copies of each." },
  { when: "3 days out", what: "Check your Arunachal districts again. Bum La needs a separate Army permit arranged in Tawang." },
  { when: "Day of travel", what: "Carry physical copies + original ID. Checkgates often have no network." },
];

export default function PermitsPage() {
  return (
    <>
      <SiteNav />
      <main className="px-4 pb-6 pt-28 sm:px-6 sm:pt-36">
        <div className="mx-auto max-w-5xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-rust-400">Paperwork</p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Permits, without the panic
          </h1>
          <p className="mt-5 max-w-2xl text-[15.5px] leading-relaxed text-mist-300">
            Four of the eight states require a permit. None of them are hard — but the details (which document, which
            portal, which district, how many copies) are exactly what goes wrong. Here is the whole picture.
          </p>

          {/* quick table */}
          <div className="mt-10 overflow-hidden rounded-3xl card-edge bg-ink-850/60">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-[13.5px]">
                <thead>
                  <tr className="border-b border-white/8 text-[10.5px] uppercase tracking-[0.12em] text-mist-500">
                    <th className="px-5 py-4 font-bold">State</th>
                    <th className="px-5 py-4 font-bold">Indian nationals</th>
                    <th className="px-5 py-4 font-bold">Foreign nationals</th>
                    <th className="px-5 py-4 font-bold">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {STATES.map((s) => (
                    <tr key={s.code} className="border-b border-white/5 last:border-0">
                      <td className="px-5 py-4">
                        <span className="font-semibold text-mist-50">{s.name}</span>
                        <span className="mt-0.5 block text-[11.5px] text-mist-500">{s.nickname}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className="rounded-md px-2 py-1 text-[11px] font-bold"
                          style={{
                            background: s.permit === "none" ? "#1FA97A22" : `${s.color}22`,
                            color: s.permit === "none" ? "#7ee7bd" : s.color,
                          }}
                        >
                          {s.permit === "none" ? "Nothing" : s.permit === "ILP" ? "ILP" : "ILP / PAP"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-mist-300">{PERMITS[s.code].foreign.split("—")[0]}</td>
                      <td className="px-5 py-4 font-medium text-mist-200">{PERMITS[s.code].feeIndian}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* timeline */}
          <div className="mt-14">
            <h2 className="font-display text-3xl font-semibold tracking-tight">Your application timeline</h2>
            <div className="mt-6 space-y-3">
              {TIMELINE.map((t, i) => (
                <div key={t.when} className="flex gap-4 rounded-2xl card-edge bg-ink-850/50 p-5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-rust-500/15 font-display text-sm font-bold text-rust-300">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold-400">{t.when}</p>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-mist-200">{t.what}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* per state detail */}
          <div className="mt-14 space-y-4">
            <h2 className="font-display text-3xl font-semibold tracking-tight">State by state</h2>
            {STATES.filter((s) => s.permit !== "none" || s.code === "SK").map((s) => {
              const info = PERMITS[s.code];
              return (
                <div key={s.code} className="rounded-3xl card-edge bg-ink-850/60 p-6" style={{ boxShadow: `inset 0 0 0 1px ${s.color}22` }}>
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h3 className="font-display text-2xl font-semibold tracking-tight text-mist-50">{info.stateName}</h3>
                    <span className="rounded-full px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wider" style={{ background: `${s.color}1f`, color: s.color }}>
                      {s.permit === "none" ? "Area permits only" : s.permit === "ILP" ? "Inner Line Permit" : "ILP / PAP"}
                    </span>
                  </div>
                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <div>
                      <h4 className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-mist-500">If you&apos;re Indian</h4>
                      <p className="mt-2 text-[13.5px] leading-relaxed text-mist-200">{info.indian}</p>
                    </div>
                    <div>
                      <h4 className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-mist-500">If you&apos;re foreign</h4>
                      <p className="mt-2 text-[13.5px] leading-relaxed text-mist-200">{info.foreign}</p>
                    </div>
                  </div>
                  <dl className="mt-5 grid gap-3 border-t border-white/5 pt-5 sm:grid-cols-4">
                    <Cell k="Portal" v={info.portal} />
                    <Cell k="Fee (Indian)" v={info.feeIndian} />
                    <Cell k="Processing" v={info.processing} />
                    <Cell k="Validity" v={info.validity} />
                  </dl>
                  <div className="mt-5">
                    <h4 className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-mist-500">Documents</h4>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {info.documents.map((d) => (
                        <li key={d} className="rounded-lg bg-white/5 px-3 py-1.5 text-[12.5px] text-mist-200">
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {info.tips.length > 0 && (
                    <div className="mt-5 rounded-2xl border border-gold-500/20 bg-gold-500/[0.06] p-4">
                      <h4 className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-gold-400">
                        What actually goes wrong
                      </h4>
                      <ul className="mt-2.5 space-y-2">
                        {info.tips.map((t) => (
                          <li key={t} className="flex gap-2.5 text-[13px] leading-relaxed text-mist-200">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" />
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-14 rounded-3xl card-edge bg-gradient-to-br from-jade-500/12 to-transparent p-8">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Want this handled for your exact route?
            </h2>
            <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-mist-200">
              Build an itinerary and the permit section will list only the states you&apos;re actually entering, with the
              fee, portal, processing time and the two things most likely to trip you up.
            </p>
            <Link
              href="/#planner"
              className="mt-6 inline-flex rounded-full bg-mist-50 px-6 py-3.5 text-[14px] font-bold text-ink-950 transition hover:bg-white"
            >
              Build my itinerary →
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function Cell({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-mist-500">{k}</dt>
      <dd className="mt-1 text-[13px] font-medium leading-snug text-mist-100">{v}</dd>
    </div>
  );
}
