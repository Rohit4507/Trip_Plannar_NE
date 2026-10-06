"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { RouteMap } from "@/components/route-map";
import { STATE_META } from "@/lib/data/knowledge";
import { inr } from "@/lib/planner";
import type { Itinerary } from "@/lib/types";

const SECTIONS = [
  { id: "route", label: "Route" },
  { id: "days", label: "Day by day" },
  { id: "map", label: "Map" },
  { id: "budget", label: "Budget" },
  { id: "permits", label: "Permits" },
  { id: "gems", label: "Hidden gems" },
  { id: "know", label: "Before you go" },
] as const;

const KIND_STYLE: Record<string, { dot: string; label: string }> = {
  travel: { dot: "bg-loom-400", label: "Drive" },
  sight: { dot: "bg-jade-400", label: "See" },
  meal: { dot: "bg-gold-400", label: "Eat" },
  experience: { dot: "bg-rust-400", label: "Do" },
  buffer: { dot: "bg-mist-400", label: "Note" },
};

export function ItineraryView({ plan }: { plan: Itinerary }) {
  const [tab, setTab] = useState<string>("days");
  const [openDay, setOpenDay] = useState<number | null>(1);
  const [activeId, setActiveId] = useState<string | undefined>(plan.places[0]?.id);
  const [copied, setCopied] = useState(false);

  const mapPoints = useMemo(() => {
    const order = new Map(plan.places.map((p, i) => [p.id, i + 1]));
    return [
      {
        id: plan.gateway.id,
        name: `${plan.gateway.name} (start)`,
        lat: plan.places[0]?.lat ?? 26.14,
        lng: plan.places[0]?.lng ?? 91.73,
        state: plan.places[0]?.st ?? "AS",
      },
      ...plan.places.map((p) => ({
        id: p.id,
        name: p.n,
        lat: p.lat,
        lng: p.lng,
        state: p.st,
        order: order.get(p.id),
        gem: p.gem,
      })),
    ];
  }, [plan]);

  const route = plan.legs.map((l) => ({ fromId: l.fromId, toId: l.toId }));
  const cover = plan.places[0]?.photo ?? "/images/hero.jpg";

  return (
    <div className="pb-10">
      {/* ───── hero ───── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/85 to-ink-900/55" />
          <div className="absolute inset-0 weave opacity-[0.06]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-28 sm:px-6 sm:pt-36">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/15 bg-black/30 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-mist-200 backdrop-blur">
              Generated itinerary
            </span>
            <span className="rounded-full border border-jade-500/30 bg-jade-500/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-jade-300 backdrop-blur">
              {plan.metrics.states} states · {plan.days.length} days
            </span>
            {plan.budget.userBudget && (
              <span
                className={`rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] backdrop-blur ${
                  plan.budget.fitsBudget
                    ? "border-jade-500/30 bg-jade-500/15 text-jade-300"
                    : "border-rust-500/30 bg-rust-500/15 text-rust-300"
                }`}
              >
                {plan.budget.fitsBudget ? "Fits your budget" : "Over budget"}
              </span>
            )}
          </div>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-tight text-balance-tight sm:text-6xl">
            {plan.title}
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-mist-200 sm:text-base">{plan.summary}</p>

          <div className="mt-7 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            <Metric label="Total cost / person" value={inr(plan.budget.perPerson)} accent />
            <Metric label="Per day" value={inr(plan.budget.dailyAvg)} />
            <Metric label="Road distance" value={`${plan.metrics.km} km`} />
            <Metric label="Drive time" value={`${plan.metrics.driveHrs} hrs`} />
            <Metric label="Hidden gems" value={String(plan.metrics.gems)} />
            <Metric label="Local-benefit score" value={`${plan.metrics.greenScore}/100`} />
          </div>

          <div className="mt-7 flex flex-wrap gap-2.5">
            <button
              onClick={() => window.print()}
              className="rounded-full bg-mist-50 px-5 py-2.5 text-sm font-semibold text-ink-900 transition hover:bg-white active:scale-95"
            >
              Print / save as PDF
            </button>
            <Link
              href={`/?state=${plan.places[0]?.st ?? ""}&days=${plan.input.days}#planner`}
              className="rounded-full border border-white/15 bg-black/25 px-5 py-2.5 text-sm font-semibold text-mist-100 backdrop-blur transition hover:bg-black/40 active:scale-95"
            >
              Tweak and regenerate
            </Link>
            <button
              onClick={() => {
                const url = typeof window !== "undefined" ? window.location.href : "";
                void navigator.clipboard?.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2200);
              }}
              className="rounded-full border border-white/15 bg-black/25 px-5 py-2.5 text-sm font-semibold text-mist-100 backdrop-blur transition hover:bg-black/40 active:scale-95"
            >
              {copied ? "Link copied ✓" : "Copy share link"}
            </button>
            <Link
              href="/destinations"
              className="rounded-full border border-white/15 bg-black/25 px-5 py-2.5 text-sm font-semibold text-mist-100 backdrop-blur transition hover:bg-black/40 active:scale-95"
            >
              Browse all destinations
            </Link>
          </div>
        </div>
      </section>

      {/* ───── sticky tabs ───── */}
      <div className="sticky top-[60px] z-40 border-b border-white/5 bg-ink-900/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2.5 no-scrollbar sm:px-6">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setTab(s.id);
                document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition ${
                tab === s.id ? "bg-white/10 text-mist-50" : "text-mist-400 hover:text-mist-100"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-16 px-4 pt-12 sm:px-6">
        {/* ───── route summary ───── */}
        <section id="route" className="scroll-mt-28">
          <SectionHead
            kicker="Route logic"
            title="How this trip was built"
            sub="Not a template. Every decision below comes from your inputs, real road distances and the season you picked."
          />
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-3">
              {plan.reasoning.map((r) => (
                <div key={r.label} className="rounded-2xl card-edge bg-ink-850/70 p-5">
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.16em] text-rust-400">{r.label}</h4>
                  <p className="mt-2 text-[14px] leading-relaxed text-mist-200">{r.text}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl card-edge bg-ink-850/70 p-5">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.16em] text-mist-500">Driving legs</h4>
              <ol className="mt-4 space-y-3">
                {plan.legs.map((l, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/8 text-[11px] font-bold text-mist-200">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1 border-b border-white/5 pb-3">
                      <p className="text-[13.5px] font-semibold text-mist-100">
                        {l.from} → {l.to}
                      </p>
                      <p className="mt-1 text-[12px] text-mist-400">
                        {Math.round(l.km)} km · {l.hrs} hrs · {l.mode}
                        {l.note ? ` · ${l.note}` : ""}
                      </p>
                      <p className="mt-0.5 text-[12px] font-semibold text-gold-300">{inr(l.cost)} pp</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ───── day by day ───── */}
        <section id="days" className="scroll-mt-28">
          <SectionHead
            kicker="Your plan"
            title="Day by day"
            sub="Tap any day to expand it. Times are realistic for road conditions, daylight and altitude — not wishful."
          />
          <div className="space-y-3">
            {plan.days.map((d) => {
              const open = openDay === d.index;
              const st = STATE_META[d.state];
              return (
                <div
                  key={d.index}
                  className={`overflow-hidden rounded-2xl card-edge transition-colors ${
                    open ? "bg-ink-850" : "bg-ink-850/40 hover:bg-ink-850/70"
                  }`}
                >
                  <button
                    onClick={() => {
                      setOpenDay(open ? null : d.index);
                      setActiveId(d.baseId);
                    }}
                    className="flex w-full items-start gap-4 p-4 text-left sm:p-5"
                  >
                    <div className="flex shrink-0 flex-col items-center">
                      <span className="grid h-11 w-11 place-items-center rounded-xl font-display text-lg font-bold" style={{ background: `${st.color}22`, color: st.color }}>
                        {d.index}
                      </span>
                      {d.date && <span className="mt-1.5 text-[10px] font-semibold text-mist-500">{d.date}</span>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-lg font-semibold tracking-tight text-mist-50">{d.title}</h3>
                        <span
                          className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                          style={{ background: `${st.color}1f`, color: st.color }}
                        >
                          {st.name}
                        </span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-mist-400">
                        <span>Base · {d.base}</span>
                        {d.driveKm > 0 && (
                          <span className="text-loom-300">
                            {d.driveKm} km · {d.driveHrs} hrs driving
                          </span>
                        )}
                        <span>{d.blocks.filter((b) => b.kind === "sight" || b.kind === "experience").length} things to do</span>
                      </div>
                      {d.note && (
                        <p className="mt-2 rounded-lg border border-gold-500/20 bg-gold-500/[0.07] px-3 py-2 text-[12px] leading-relaxed text-gold-300">
                          ⚠ {d.note}
                        </p>
                      )}
                    </div>
                    <span className={`mt-1 text-mist-400 transition ${open ? "rotate-180" : ""}`}>⌄</span>
                  </button>
                  {open && (
                    <div className="border-t border-white/5 px-4 pb-5 pt-4 sm:px-5">
                      <ol className="relative space-y-0">
                        <span className="absolute bottom-4 left-[43px] top-3 w-px bg-gradient-to-b from-white/15 via-white/8 to-transparent sm:left-[51px]" />
                        {d.blocks.map((b, i) => {
                          const ks = KIND_STYLE[b.kind] ?? KIND_STYLE.sight;
                          return (
                            <li key={i} className="relative flex gap-4 py-2.5">
                              <span className="w-9 shrink-0 pt-0.5 text-right font-mono text-[11px] font-semibold text-mist-400 sm:w-11">
                                {b.time}
                              </span>
                              <span className={`relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-ink-850 ${ks.dot}`} />
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-baseline gap-x-2">
                                  <h4 className="text-[14.5px] font-semibold text-mist-50">{b.title}</h4>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-mist-500">{ks.label}</span>
                                  {b.cost ? <span className="text-[12px] font-semibold text-gold-300">+{inr(b.cost)}</span> : null}
                                </div>
                                {b.detail && <p className="mt-1 text-[13px] leading-relaxed text-mist-300">{b.detail}</p>}
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ───── map ───── */}
        <section id="map" className="scroll-mt-28">
          <SectionHead
            kicker="Interactive map"
            title="Your route across the Northeast"
            sub="Real coordinates for every stop, with the driving order the optimiser chose. Tap a marker to trace it back to its day."
          />
          <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
            <RouteMap points={mapPoints} route={route} activeId={activeId} onSelect={setActiveId} caption={`${plan.places.length} stops`} />
            <div className="rounded-2xl card-edge bg-ink-850/70 p-5">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.16em] text-mist-500">Stop order</h4>
              <ol className="mt-4 space-y-2.5">
                {plan.places.map((p, i) => (
                  <li key={p.id}>
                    <button
                      onClick={() => setActiveId(p.id)}
                      onMouseEnter={() => setActiveId(p.id)}
                      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                        activeId === p.id ? "border-white/20 bg-white/[0.07]" : "border-transparent hover:bg-white/[0.03]"
                      }`}
                    >
                      <span
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[11px] font-bold"
                        style={{ background: `${STATE_META[p.st].color}22`, color: STATE_META[p.st].color }}
                      >
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-semibold text-mist-100">{p.n}</span>
                        <span className="block truncate text-[11px] text-mist-400">
                          {p.region} · {p.alt > 0 ? `${p.alt} m` : STATE_META[p.st].name}
                        </span>
                      </span>
                      {p.gem && <span className="text-[13px]" title="Hidden gem">💎</span>}
                    </button>
                  </li>
                ))}
              </ol>
              <p className="mt-4 border-t border-white/5 pt-4 text-[12px] leading-relaxed text-mist-400">
                Total: <span className="font-semibold text-mist-100">{plan.metrics.km} km</span> over{" "}
                <span className="font-semibold text-mist-100">{plan.metrics.driveHrs} hours</span> of driving — about{" "}
                {Math.round(plan.metrics.driveHrs / Math.max(1, plan.days.length) * 10) / 10} hrs per day on average.
              </p>
            </div>
          </div>
        </section>

        {/* ───── budget ───── */}
        <section id="budget" className="scroll-mt-28">
          <SectionHead
            kicker="Money"
            title="Where your budget goes"
            sub="2025–26 ground rates for your comfort tier. Per person, land-only, excluding flights to the region."
          />
          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-2xl card-edge bg-ink-850/70 p-6">
              <DonutChart lines={plan.budget.lines} total={plan.budget.perPerson} />
              <div className="mt-6 space-y-3 border-t border-white/5 pt-5">
                <Row label="Per person" value={inr(plan.budget.perPerson)} strong />
                <Row label={`Whole group (${plan.input.people})`} value={inr(plan.budget.total)} />
                <Row label="Average per day" value={inr(plan.budget.dailyAvg)} />
                {plan.budget.userBudget && (
                  <Row
                    label={plan.budget.fitsBudget ? "Under your budget by" : "Over your budget by"}
                    value={inr(Math.abs(plan.budget.perPerson - plan.budget.userBudget))}
                    strong
                    tone={plan.budget.fitsBudget ? "good" : "bad"}
                  />
                )}
              </div>
            </div>
            <div className="space-y-2.5">
              {plan.budget.lines.map((l) => (
                <div key={l.key} className="rounded-2xl card-edge bg-ink-850/50 p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <h4 className="text-[14px] font-semibold text-mist-100">{l.label}</h4>
                    <span className="text-[15px] font-bold" style={{ color: l.color }}>
                      {inr(l.amount)}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/6">
                    <span
                      className="block h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(l.amount / plan.budget.perPerson) * 100}%`,
                        background: l.color,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-[12px] text-mist-400">{l.detail}</p>
                </div>
              ))}
              <div className="rounded-2xl border border-jade-500/20 bg-jade-500/[0.06] p-4">
                <p className="text-[12px] leading-relaxed text-mist-200">
                  <span className="font-bold text-jade-300">Cash reality check.</span> Only{" "}
                  {Math.max(0, plan.days.length - 3)} of your {plan.days.length} nights are in towns with reliable ATMs.
                  Withdraw in {plan.gateway.name} before you set out and carry roughly {inr(Math.round(plan.budget.perPerson * 0.5))} in cash.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ───── permits ───── */}
        <section id="permits" className="scroll-mt-28">
          <SectionHead
            kicker="Paperwork"
            title="Permits you actually need"
            sub={
              plan.permits.needed.length
                ? `${plan.permits.needed.length} state${plan.permits.needed.length > 1 ? "s" : ""} on this route require a permit. Start this now, not the week before.`
                : "Good news — nothing. This route is entirely permit-free."
            }
          />
          <div className="grid gap-4 md:grid-cols-2">
            {plan.permits.needed.map((st) => {
              const meta = STATE_META[st];
              const info = plan.input.nationality === "foreign" ? plan.permits.foreign.find((p) => p.state === meta.name) : plan.permits.indian.find((p) => p.state === meta.name);
              return (
                <div key={st} className="rounded-2xl card-edge bg-ink-850/70 p-5" style={{ boxShadow: `inset 0 0 0 1px ${meta.color}22` }}>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-lg font-semibold text-mist-50">{meta.name}</h3>
                    <span className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ background: `${meta.color}22`, color: meta.color }}>
                      {plan.input.nationality === "foreign" ? (st === "AR" ? "PAP" : "Registration") : "ILP"}
                    </span>
                  </div>
                  <dl className="mt-4 space-y-2 text-[13px]">
                    <Div dt="Fee" dd={info?.fee ?? "Free"} />
                    <Div dt={plan.input.nationality === "foreign" ? "Process" : "Portal"} dd={info?.portal ?? "—"} />
                    <Div dt="Processing" dd={info?.processing ?? "—"} />
                  </dl>
                </div>
              );
            })}
            {!plan.permits.needed.length && (
              <div className="rounded-2xl border border-jade-500/25 bg-jade-500/[0.07] p-5 md:col-span-2">
                <p className="text-[14px] leading-relaxed text-mist-200">
                  Assam, Meghalaya, Tripura and Sikkim&apos;s main circuits require no Inner Line Permit. Carry a government
                  photo ID — border and army checkpoints still ask.
                </p>
              </div>
            )}
          </div>
          {plan.permits.steps.length > 0 && (
            <div className="mt-4 rounded-2xl card-edge bg-ink-850/70 p-5">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.16em] text-rust-400">Action list</h4>
              <ul className="mt-4 space-y-3">
                {plan.permits.steps.map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md bg-white/8 text-[10px] font-bold text-mist-300">
                      {i + 1}
                    </span>
                    <span className="text-[13.5px] leading-relaxed text-mist-200">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* ───── gems ───── */}
        <section id="gems" className="scroll-mt-28">
          <SectionHead
            kicker="Off the map"
            title="Hidden gems on your route"
            sub="Low-crowd places with community-run stays. These are the days you'll talk about in five years."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plan.hiddenGems.map((g) => (
              <article key={g.place.id} className="group relative overflow-hidden rounded-2xl card-edge bg-ink-850">
                <div className="relative h-40 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={g.place.photo}
                    alt={g.place.n}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-850 via-ink-850/20 to-transparent" />
                  <span
                    className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur"
                    style={{ background: `${STATE_META[g.place.st].color}dd`, color: "#08110d" }}
                  >
                    {STATE_META[g.place.st].name}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-display text-lg font-semibold leading-tight text-mist-50">{g.place.n}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-mist-300">{g.why}</p>
                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-gold-300">{g.when}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ───── before you go ───── */}
        <section id="know" className="scroll-mt-28">
          <SectionHead kicker="Smart alternatives" title="What we'd change" sub="Every itinerary has weaknesses. Here are yours, honestly." />
          <div className="grid gap-4 lg:grid-cols-2">
            {plan.alternatives.map((a) => (
              <div key={a.title} className="rounded-2xl card-edge bg-ink-850/70 p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-lg font-semibold leading-tight text-mist-50">{a.title}</h3>
                  {a.save && (
                    <span className="shrink-0 rounded-full border border-jade-500/30 bg-jade-500/12 px-2.5 py-1 text-[11px] font-bold text-jade-300">
                      save {a.save}
                    </span>
                  )}
                </div>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-mist-300">{a.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl card-edge bg-ink-850/70 p-5">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.16em] text-mist-500">Packing for this trip</h4>
              <ul className="mt-4 grid gap-2">
                {plan.packing.map((p) => (
                  <li key={p} className="flex gap-2.5 text-[13.5px] leading-relaxed text-mist-200">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-jade-400" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl card-edge bg-ink-850/70 p-5">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.16em] text-mist-500">Ground rules</h4>
              <ul className="mt-4 grid gap-2">
                {plan.tips.map((t) => (
                  <li key={t} className="flex gap-2.5 text-[13.5px] leading-relaxed text-mist-200">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-3.5 backdrop-blur transition hover:bg-white/[0.06] ${
        accent ? "border-rust-500/30 bg-rust-500/10" : "border-white/10 bg-black/25"
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-mist-400">{label}</p>
      <p className={`mt-1 font-display text-xl font-semibold tracking-tight sm:text-2xl ${accent ? "text-rust-300" : "text-mist-50"}`}>
        {value}
      </p>
    </div>
  );
}

function SectionHead({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div className="mb-6 max-w-2xl">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-rust-400">{kicker}</p>
      <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-mist-50 sm:text-4xl">{title}</h2>
      {sub && <p className="mt-3 text-[14.5px] leading-relaxed text-mist-300">{sub}</p>}
    </div>
  );
}

function Row({ label, value, strong, tone }: { label: string; value: string; strong?: boolean; tone?: "good" | "bad" }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[13px] text-mist-400">{label}</span>
      <span
        className={`font-display text-lg font-semibold ${tone === "good" ? "text-jade-300" : tone === "bad" ? "text-rust-300" : strong ? "text-mist-50" : "text-mist-200"}`}
      >
        {value}
      </span>
    </div>
  );
}

function Div({ dt, dd }: { dt: string; dd: string }) {
  return (
    <div className="flex gap-3 border-b border-white/5 pb-2 last:border-0">
      <dt className="w-24 shrink-0 text-mist-500">{dt}</dt>
      <dd className="min-w-0 flex-1 break-words font-medium text-mist-100">{dd}</dd>
    </div>
  );
}

function DonutChart({ lines, total }: { lines: Itinerary["budget"]["lines"]; total: number }) {
  const size = 200;
  const r = 78;
  const c = 2 * Math.PI * r;
  const lens = lines.map((l) => (total ? (l.amount / total) * c : 0));
  const starts: number[] = [];
  let acc = 0;
  for (const len of lens) {
    starts.push(acc);
    acc += len;
  }
  const arcs = lines.map((l, i) => ({ key: l.key, color: l.color, len: lens[i], offset: starts[i] }));
  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[220px]">
        <g transform={`translate(${size / 2} ${size / 2}) rotate(-90)`}>
          <circle r={r} fill="none" stroke="#15291f" strokeWidth="20" />
          {arcs.map((a) => (
            <circle
              key={a.key}
              r={r}
              fill="none"
              stroke={a.color}
              strokeWidth="20"
              strokeDasharray={`${a.len} ${c - a.len}`}
              strokeDashoffset={-a.offset}
              strokeLinecap="butt"
            />
          ))}
        </g>
        <text x={size / 2} y={size / 2 - 6} textAnchor="middle" className="fill-mist-400" style={{ fontSize: 11, letterSpacing: "0.1em" }}>
          PER PERSON
        </text>
        <text x={size / 2} y={size / 2 + 16} textAnchor="middle" className="fill-mist-50" style={{ fontSize: 22, fontWeight: 700 }}>
          {inr(total)}
        </text>
      </svg>
      <ul className="mt-4 grid w-full grid-cols-2 gap-x-4 gap-y-1.5">
        {lines.map((l) => (
          <li key={l.key} className="flex items-center gap-2 text-[11.5px] text-mist-300">
            <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: l.color }} />
            <span className="truncate">{l.label.split(" ")[0]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
