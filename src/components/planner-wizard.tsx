"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { INTEREST_META, MONTHS, STATES } from "@/lib/data/knowledge";
import { PLACES } from "@/lib/data/places";
import type { Interest, Pace, StateCode, Tier, Traveller } from "@/lib/types";

interface Form {
  months: number[];
  days: number;
  interests: Interest[];
  pace: Pace;
  tier: Tier;
  traveller: Traveller;
  people: number;
  nationality: "indian" | "foreign";
  states: StateCode[];
  budget: string;
  start: string;
  avoidPermits: boolean;
}

const STEP_LABELS = ["When", "What", "Where", "How"];

const PRESETS: { label: string; emoji: string; patch: Partial<Form> }[] = [
  { label: "First-timer, 7 days", emoji: "🌤️", patch: { months: [11], days: 7, interests: ["nature", "culture", "photography"], pace: "balanced", states: ["ML", "AS"] } },
  { label: "Hornbill + Dzukou", emoji: "🪶", patch: { months: [12], days: 9, interests: ["festivals", "culture", "adventure"], pace: "packed", states: ["NL", "AS"] } },
  { label: "Root bridges & rivers", emoji: "🌿", patch: { months: [3], days: 6, interests: ["nature", "adventure", "offbeat"], pace: "balanced", states: ["ML"] } },
  { label: "Tawang high route", emoji: "🏔️", patch: { months: [4], days: 10, interests: ["spiritual", "nature", "photography"], pace: "balanced", states: ["AR", "AS"] } },
  { label: "Zero tourists", emoji: "💎", patch: { months: [2], days: 12, interests: ["offbeat", "culture", "nature"], pace: "relaxed", states: [] } },
  { label: "Full Guwahati loop", emoji: "🛣️", patch: { months: [10], days: 14, interests: ["nature", "culture", "wildlife"], pace: "packed", states: ["AS", "ML", "NL"] } },
];

const TIER_COPY: Record<Tier, { label: string; sub: string; range: string }> = {
  budget: { label: "Backpacker", sub: "Dorms, homestays, shared Sumos", range: "₹1,500–2,800/day" },
  mid: { label: "Mid-range", sub: "Boutique guesthouses, private cab split", range: "₹4,000–7,000/day" },
  comfort: { label: "Comfort", sub: "Heritage bungalows, private SUV", range: "₹9,000–18,000/day" },
};

const PACE_COPY: Record<Pace, { label: string; sub: string }> = {
  relaxed: { label: "Slow", sub: "2–3 bases, long lunches, no alarms" },
  balanced: { label: "Balanced", sub: "A move every 2 days, real sightseeing" },
  packed: { label: "Full-on", sub: "See everything, sleep in the car" },
};

const TRAVELLER_COPY: Record<Traveller, string> = {
  solo: "Solo",
  couple: "Couple",
  friends: "Friends",
  family: "Family",
};

const GATEWAY_OPTIONS = [
  { id: "", label: "Let the engine choose" },
  { id: "guwahati", label: "Guwahati (GAU)" },
  { id: "dimapur", label: "Dimapur (DMU)" },
  { id: "jorhat", label: "Jorhat (JRH)" },
  { id: "dibru", label: "Dibrugarh (DIB)" },
  { id: "itanagar", label: "Naharlagun (HNL)" },
  { id: "imphal", label: "Imphal (IMF)" },
  { id: "aizawl", label: "Aizawl (AJL)" },
  { id: "agartala", label: "Agartala (IXA)" },
  { id: "gangtok", label: "Bagdogra (IXB)" },
];

const DEFAULT_FORM: Form = {
  months: [11],
  days: 8,
  interests: ["nature", "culture", "offbeat"],
  pace: "balanced",
  tier: "mid",
  traveller: "friends",
  people: 2,
  nationality: "indian",
  states: [],
  budget: "",
  start: "",
  avoidPermits: false,
};

function parseDeepLink(search: string): Partial<Form> {
  const sp = new URLSearchParams(search);
  const stateCode = sp.get("state");
  const placeId = sp.get("place");
  const dayCount = Number(sp.get("days"));
  const patch: Partial<Form> = {};

  const place = placeId ? PLACES.find((x) => x.id === placeId) : undefined;
  if (place) {
    patch.states = [place.st];
    patch.interests = Array.from(new Set(place.tags)).slice(0, 4);
  } else if (stateCode && STATES.some((s) => s.code === stateCode)) {
    patch.states = [stateCode as StateCode];
  }
  if (Number.isFinite(dayCount) && dayCount >= 3 && dayCount <= 21) patch.days = Math.round(dayCount);

  return patch;
}

export function PlannerWizard() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [f, setF] = useState<Form>(DEFAULT_FORM);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setF((p) => ({ ...p, [key]: value }));

  // Deep-link prefill: /?place=nongriat&state=ML&days=6#planner
  // Every deep link in the app is a plain <a href>, i.e. a full document load,
  // so the query string only has to be read once at mount. It is applied in an
  // effect (never during render) so the server and client HTML stay identical.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from window.location, an external store
    setF((prev) => ({ ...prev, ...parseDeepLink(window.location.search) }));
  }, []);

  const matches = useMemo(() => {
    const interests = f.interests.length ? f.interests : (["nature", "culture"] as Interest[]);
    return PLACES.filter((p) => {
      if (f.states.length && !f.states.includes(p.st)) return false;
      if (f.nationality === "foreign" && p.st === "AR" && f.people < 2) return false;
      if (f.avoidPermits && !["AS", "ML", "TR", "SK"].includes(p.st)) return false;
      const clash = f.months.some((m) => p.avoid.includes(m));
      const hit = f.months.some((m) => p.best.includes(m));
      if (clash && !hit) return false;
      return p.tags.some((t) => interests.includes(t)) || p.gem;
    });
  }, [f.months, f.interests, f.states, f.nationality, f.people, f.avoidPermits]);

  const gemCount = matches.filter((p) => p.gem).length;
  const stateCodes = Array.from(new Set(matches.map((p) => p.st)));

  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const canNext = step === 0 ? f.months.length > 0 : step === 1 ? true : true;

  async function generate() {
    setError(null);
    const payload = {
      months: f.months,
      days: f.days,
      interests: f.interests,
      pace: f.pace,
      tier: f.tier,
      traveller: f.traveller,
      people: f.people,
      nationality: f.nationality,
      states: f.states,
      budget: f.budget ? Number(f.budget) : undefined,
      start: f.start || undefined,
      avoidPermits: f.avoidPermits,
      seed: Math.random().toString(36).slice(2, 8),
    };
    startTransition(() => undefined);
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { slug?: string; error?: string };
      if (!res.ok || !json.slug) throw new Error(json.error ?? "Something went wrong");
      router.push(`/plan/${json.slug}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not build that itinerary");
    }
  }

  const busy = pending;

  return (
    <div id="planner" className="relative scroll-mt-24">
      <div className="relative overflow-hidden rounded-[28px] card-edge bg-ink-850/80 p-1 shadow-2xl shadow-black/50 backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-jade-400/50 to-transparent" />

        {/* progress rail */}
        <div className="flex items-stretch gap-1 p-2 sm:p-3">
          {STEP_LABELS.map((label, i) => (
            <button
              key={label}
              onClick={() => setStep(i)}
              className={`group relative flex-1 rounded-2xl px-2 py-2.5 text-left transition ${
                step === i ? "bg-white/[0.07]" : "hover:bg-white/[0.035]"
              }`}
            >
              <span
                className={`block text-[10px] font-bold uppercase tracking-[0.16em] transition ${
                  step === i ? "text-rust-400" : i < step ? "text-jade-400" : "text-mist-500"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className={`mt-0.5 block text-[13px] font-semibold sm:text-sm ${step === i ? "text-mist-50" : "text-mist-300"}`}>
                {label}
              </span>
              <span
                className={`absolute bottom-1.5 left-2 h-[2px] rounded-full transition-all duration-500 ${
                  i <= step ? "w-8 bg-gradient-to-r from-rust-500 to-gold-400" : "w-3 bg-white/10"
                }`}
              />
            </button>
          ))}
        </div>

        <div className="rounded-[22px] bg-ink-900/70 p-5 sm:p-7">
          {/* live engine readout */}
          <div className="mb-6 flex flex-wrap items-center gap-2 text-[11px]">
            <span className="flex items-center gap-1.5 rounded-full border border-jade-500/25 bg-jade-500/10 px-3 py-1.5 font-semibold text-jade-300">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-jade-400 opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-jade-400" />
              </span>
              {matches.length} destinations match
            </span>
            <span className="rounded-full border border-gold-500/25 bg-gold-500/10 px-3 py-1.5 font-semibold text-gold-300">
              {gemCount} hidden gems
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-mist-300">
              {stateCodes.length} states open in {f.months.map((m) => MONTHS[m - 1]).join("/")}
            </span>
          </div>

          {/* ─── STEP 0: WHEN ─── */}
          {step === 0 && (
            <div className="space-y-7 animate-[fade-up_0.5s_ease-out]">
              <Field label="Travel month" hint="The Northeast changes completely with the season — this drives everything.">
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {MONTHS.map((m, i) => {
                    const on = f.months.includes(i + 1);
                    return (
                      <button
                        key={m}
                        onClick={() => set("months", toggle(f.months, i + 1))}
                        className={`rounded-xl border px-2 py-2.5 text-[13px] font-semibold transition active:scale-95 ${
                          on
                            ? "border-rust-500/60 bg-rust-500/15 text-rust-300"
                            : "border-white/8 bg-white/[0.02] text-mist-300 hover:border-white/15 hover:text-mist-100"
                        }`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2.5 text-xs leading-relaxed text-mist-400">
                  Tip: late Oct–mid Nov is the sweet spot — post-monsoon green, Kaziranga just reopened, Hornbill hasn&apos;t
                  started. Pick 2 months if you&apos;re flexible and the engine will pick the better window per stop.
                </p>
              </Field>

              <Field label={`Trip length — ${f.days} days`} hint="3 is a single circuit, 14 lets you cross 3 states properly.">
                <input
                  type="range"
                  min={3}
                  max={21}
                  value={f.days}
                  onChange={(e) => set("days", Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-rust-500"
                  style={{
                    background: `linear-gradient(90deg, #E4572E 0%, #F6C35C ${((f.days - 3) / 18) * 100}%, rgba(255,255,255,0.09) ${((f.days - 3) / 18) * 100}%)`,
                  }}
                />
                <div className="mt-2 flex justify-between text-[11px] text-mist-500">
                  <span>3 days</span>
                  <span>10</span>
                  <span>21 days</span>
                </div>
              </Field>

              <Field label="Pace" hint="How much movement can you actually enjoy?">
                <div className="grid gap-2 sm:grid-cols-3">
                  {(Object.keys(PACE_COPY) as Pace[]).map((p) => (
                    <Choice
                      key={p}
                      on={f.pace === p}
                      onClick={() => set("pace", p)}
                      title={PACE_COPY[p].label}
                      sub={PACE_COPY[p].sub}
                    />
                  ))}
                </div>
              </Field>

              <div>
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-mist-500">Or start from a classic</p>
                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 no-scrollbar">
                  {PRESETS.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => setF((prev) => ({ ...prev, ...p.patch }))}
                      className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2 text-[13px] font-medium text-mist-200 transition hover:border-rust-500/40 hover:bg-rust-500/10 hover:text-rust-300 active:scale-95"
                    >
                      <span className="mr-1.5">{p.emoji}</span>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 1: WHAT ─── */}
          {step === 1 && (
            <div className="space-y-7 animate-[fade-up_0.5s_ease-out]">
              <Field label="What pulls you here?" hint="Pick up to 5. This is the strongest signal in the ranking model.">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                  {INTEREST_META.map((it) => {
                    const on = f.interests.includes(it.id);
                    return (
                      <button
                        key={it.id}
                        onClick={() => set("interests", toggle(f.interests, it.id))}
                        className={`group relative overflow-hidden rounded-2xl border p-3 text-left transition active:scale-[0.97] ${
                          on
                            ? "border-jade-500/50 bg-jade-500/12"
                            : "border-white/8 bg-white/[0.02] hover:border-white/16"
                        }`}
                      >
                        <span className="block text-xl leading-none">{it.emoji}</span>
                        <span className={`mt-2 block text-[13px] font-semibold leading-tight ${on ? "text-jade-300" : "text-mist-100"}`}>
                          {it.label}
                        </span>
                        <span className="mt-1 block text-[11px] leading-snug text-mist-400">{it.hint}</span>
                        {on && (
                          <span className="absolute right-2 top-2 grid h-4 w-4 place-items-center rounded-full bg-jade-500 text-[9px] font-black text-ink-900">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label="Who's travelling?" hint="Affects altitude limits, drive lengths and stay style.">
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(TRAVELLER_COPY) as Traveller[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => set("traveller", t)}
                      className={`rounded-xl border py-3 text-[13px] font-semibold transition active:scale-95 ${
                        f.traveller === t
                          ? "border-rust-500/60 bg-rust-500/15 text-rust-300"
                          : "border-white/8 bg-white/[0.02] text-mist-300 hover:text-mist-100"
                      }`}
                    >
                      {TRAVELLER_COPY[t]}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-sm text-mist-300">Group size</span>
                  <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-2 py-1">
                    <button
                      onClick={() => set("people", Math.max(1, f.people - 1))}
                      className="grid h-7 w-7 place-items-center rounded-full bg-white/8 text-mist-100 active:scale-90"
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-sm font-semibold">{f.people}</span>
                    <button
                      onClick={() => set("people", Math.min(12, f.people + 1))}
                      className="grid h-7 w-7 place-items-center rounded-full bg-white/8 text-mist-100 active:scale-90"
                    >
                      +
                    </button>
                  </div>
                  {f.nationality === "foreign" && f.people < 2 && (
                    <span className="text-[11px] font-medium text-rust-300">Solo foreign nationals can&apos;t get an Arunachal PAP</span>
                  )}
                </div>
              </Field>

              <Field label="Nationality" hint="Determines ILP vs PAP — the most commonly botched part of Northeast planning.">
                <div className="grid gap-2 sm:grid-cols-2">
                  <Choice
                    on={f.nationality === "indian"}
                    onClick={() => set("nationality", "indian")}
                    title="Indian national"
                    sub="eILP where required — ₹120–500, issued online in 24–48 hrs"
                  />
                  <Choice
                    on={f.nationality === "foreign"}
                    onClick={() => set("nationality", "foreign")}
                    title="Foreign national"
                    sub="PAP for Arunachal — registered operator, group of 2+, 2–4 weeks"
                  />
                </div>
              </Field>
            </div>
          )}

          {/* ─── STEP 2: WHERE ─── */}
          {step === 2 && (
            <div className="space-y-7 animate-[fade-up_0.5s_ease-out]">
              <Field label="Which states?" hint="Leave empty and the engine picks the best fit for your season and interests.">
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {STATES.map((s) => {
                    const on = f.states.includes(s.code);
                    const count = matches.filter((p) => p.st === s.code).length;
                    return (
                      <button
                        key={s.code}
                        onClick={() => set("states", toggle(f.states, s.code))}
                        className={`relative overflow-hidden rounded-2xl border p-3.5 text-left transition active:scale-[0.97] ${
                          on ? "border-white/25 bg-white/[0.08]" : "border-white/8 bg-white/[0.02] hover:border-white/16"
                        }`}
                        style={on ? { boxShadow: `inset 0 0 0 1px ${s.color}55` } : undefined}
                      >
                        <span className="block text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: s.color }}>
                          {s.permit === "none" ? "No permit" : s.permit === "ILP" ? "ILP needed" : "ILP / PAP"}
                        </span>
                        <span className="mt-1 block text-[14px] font-semibold leading-tight text-mist-50">{s.name}</span>
                        <span className="mt-1 block text-[11px] leading-snug text-mist-400">{s.tagline.slice(0, 46)}…</span>
                        <span className="mt-2 flex items-center justify-between text-[11px] text-mist-500">
                          <span>{count} open</span>
                          <span className="font-semibold" style={{ color: s.color }}>
                            {s.bestWindow}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label="Starting point" hint="Guwahati is the default for good reason — it reaches everywhere.">
                <div className="grid gap-2 sm:grid-cols-3">
                  {GATEWAY_OPTIONS.map((g) => (
                    <button
                      key={g.id || "auto"}
                      onClick={() => set("start", g.id)}
                      className={`rounded-xl border px-3.5 py-2.5 text-left text-[13px] font-medium transition active:scale-95 ${
                        f.start === g.id
                          ? "border-rust-500/60 bg-rust-500/15 text-rust-300"
                          : "border-white/8 bg-white/[0.02] text-mist-300 hover:text-mist-100"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </Field>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                <input
                  type="checkbox"
                  checked={f.avoidPermits}
                  onChange={(e) => set("avoidPermits", e.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-rust-500"
                />
                <span>
                  <span className="block text-sm font-semibold text-mist-100">Skip permit states entirely</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-mist-400">
                    Restrict the route to Assam, Meghalaya, Tripura and Sikkim — the four states with zero paperwork.
                  </span>
                </span>
              </label>
            </div>
          )}

          {/* ─── STEP 3: HOW ─── */}
          {step === 3 && (
            <div className="space-y-7 animate-[fade-up_0.5s_ease-out]">
              <Field label="Comfort level" hint="Changes stays, vehicles and which hidden gems are realistic.">
                <div className="grid gap-2 sm:grid-cols-3">
                  {(Object.keys(TIER_COPY) as Tier[]).map((t) => (
                    <Choice
                      key={t}
                      on={f.tier === t}
                      onClick={() => set("tier", t)}
                      title={TIER_COPY[t].label}
                      sub={TIER_COPY[t].sub}
                      badge={TIER_COPY[t].range}
                    />
                  ))}
                </div>
              </Field>

              <Field label="Total budget per person (optional)" hint="Leave blank to see the honest cost. Enter a number and we'll optimise to it.">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative flex-1 min-w-[180px]">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mist-400">₹</span>
                    <input
                      inputMode="numeric"
                      value={f.budget}
                      onChange={(e) => set("budget", e.target.value.replace(/[^0-9]/g, "").slice(0, 7))}
                      placeholder="40000"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3.5 pl-9 pr-4 text-base font-semibold text-mist-50 outline-none transition placeholder:text-mist-500 focus:border-rust-500/60 focus:bg-white/[0.05]"
                    />
                  </div>
                  {[
                    { l: "₹20k", v: "20000" },
                    { l: "₹40k", v: "40000" },
                    { l: "₹75k", v: "75000" },
                    { l: "₹1.5L", v: "150000" },
                  ].map((q) => (
                    <button
                      key={q.v}
                      onClick={() => set("budget", q.v)}
                      className={`rounded-full border px-3.5 py-2 text-[13px] font-semibold transition active:scale-95 ${
                        f.budget === q.v ? "border-gold-500/50 bg-gold-500/15 text-gold-300" : "border-white/10 text-mist-300"
                      }`}
                    >
                      {q.l}
                    </button>
                  ))}
                </div>
                <p className="mt-2.5 text-xs text-mist-400">
                  Ground costs only — flights to Guwahati/Bagdogra add ₹4,500–9,000 return depending on how early you book.
                </p>
              </Field>

              <div className="rounded-2xl border border-jade-500/20 bg-jade-500/[0.06] p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-jade-300">Ready to build</p>
                <p className="mt-2 text-sm leading-relaxed text-mist-200">
                  {f.days} days · {f.pace === "relaxed" ? "slow" : f.pace === "packed" ? "fast" : "balanced"} pace ·{" "}
                  {f.months.map((m) => MONTHS[m - 1]).join("/")} · {f.interests.length || 2} interest
                  {(f.interests.length || 2) > 1 ? "s" : ""} · {TIER_COPY[f.tier].label.toLowerCase()} ·{" "}
                  {f.nationality === "foreign" ? "foreign national" : "Indian national"}
                  {f.states.length ? ` · ${f.states.length} state${f.states.length > 1 ? "s" : ""} pinned` : " · states chosen by engine"}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-mist-400">
                  The engine will rank all {PLACES.length} destinations, optimise the driving order, cap your daily hours
                  behind the wheel, and generate permits, costs and alternatives.
                </p>
              </div>
            </div>
          )}

          {error && (
            <p className="mt-5 rounded-xl border border-rust-500/40 bg-rust-500/10 px-4 py-3 text-sm text-rust-300">{error}</p>
          )}

          {/* nav */}
          <div className="mt-7 flex items-center gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="rounded-full border border-white/12 px-5 py-3 text-sm font-semibold text-mist-200 transition hover:bg-white/5 active:scale-95"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={() => canNext && setStep((s) => s + 1)}
                disabled={!canNext}
                className="group flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rust-500 to-gold-500 px-6 py-3.5 text-sm font-bold text-ink-950 shadow-lg shadow-rust-600/25 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-40 sm:flex-none sm:px-9"
              >
                Continue
                <span className="transition group-hover:translate-x-0.5">→</span>
              </button>
            ) : (
              <button
                onClick={generate}
                disabled={busy}
                className="group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-jade-500 to-jade-400 px-6 py-3.5 text-sm font-bold text-ink-950 shadow-lg shadow-jade-600/25 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60 sm:flex-none sm:px-10"
              >
                {busy ? "Routing your trip…" : "Generate my itinerary"}
                {busy ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-900/30 border-t-ink-900" />
                ) : (
                  <span className="transition group-hover:translate-x-0.5">✦</span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3">
        <h3 className="font-display text-lg font-semibold tracking-tight text-mist-50 sm:text-xl">{label}</h3>
        {hint && <p className="mt-1 text-[13px] leading-relaxed text-mist-400">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function Choice({
  on,
  onClick,
  title,
  sub,
  badge,
}: {
  on: boolean;
  onClick: () => void;
  title: string;
  sub: string;
  badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition active:scale-[0.97] ${
        on ? "border-rust-500/60 bg-rust-500/12" : "border-white/8 bg-white/[0.02] hover:border-white/16"
      }`}
    >
      <span className={`block text-[14px] font-semibold ${on ? "text-rust-300" : "text-mist-100"}`}>{title}</span>
      <span className="mt-1 block text-[12px] leading-snug text-mist-400">{sub}</span>
      {badge && (
        <span className="mt-2.5 inline-block rounded-full bg-white/8 px-2.5 py-1 text-[11px] font-semibold text-mist-200">
          {badge}
        </span>
      )}
    </button>
  );
}
