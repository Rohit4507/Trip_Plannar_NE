"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { RouteMap } from "@/components/route-map";
import { INTEREST_META, MONTHS, STATES } from "@/lib/data/knowledge";
import type { Interest, StateCode } from "@/lib/types";

export interface DestLite {
  id: string;
  n: string;
  st: StateCode;
  region: string;
  lat: number;
  lng: number;
  alt: number;
  tags: Interest[];
  hrs: number;
  nights: number;
  gem: boolean;
  crowd: number;
  best: number[];
  avoid: number[];
  costMid: number;
  blurb: string;
  photo: string;
  highlights: string[];
}

type SortKey = "match" | "crowd" | "cost" | "alt";

export function DestinationsExplorer({
  places,
  initialState,
  focus,
}: {
  places: DestLite[];
  initialState?: string;
  focus?: string;
}) {
  const [state, setState] = useState<StateCode | "ALL">((initialState as StateCode) || "ALL");
  const [tag, setTag] = useState<Interest | "ALL">("ALL");
  const [month, setMonth] = useState<number | 0>(0);
  const [gemsOnly, setGemsOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("match");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string | undefined>(focus);

  const filtered = useMemo(() => {
    const list = places.filter((p) => {
      if (state !== "ALL" && p.st !== state) return false;
      if (tag !== "ALL" && !p.tags.includes(tag)) return false;
      if (gemsOnly && !p.gem) return false;
      if (month && !p.best.includes(month)) return false;
      if (query && !`${p.n} ${p.region} ${p.blurb}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
    const score = (p: DestLite) => (tag !== "ALL" && p.tags.includes(tag) ? 1 : 0) + (p.gem ? 0.4 : 0) - p.crowd * 0.05;
    return list.sort((a, b) => {
      if (sort === "crowd") return a.crowd - b.crowd;
      if (sort === "cost") return a.costMid - b.costMid;
      if (sort === "alt") return b.alt - a.alt;
      return score(b) - score(a);
    });
  }, [places, state, tag, month, gemsOnly, query, sort]);

  const mapPoints = useMemo(
    () =>
      filtered.map((p) => ({
        id: p.id,
        name: p.n,
        lat: p.lat,
        lng: p.lng,
        state: p.st,
        gem: p.gem,
      })),
    [filtered],
  );

  const detail = places.find((p) => p.id === active) ?? filtered[0];

  return (
    <div className="space-y-6">
      {/* filter bar */}
      <div className="rounded-3xl card-edge bg-ink-850/70 p-4 sm:p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mist-500">⌕</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search destinations, regions, experiences…"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-10 pr-4 text-[14px] text-mist-50 outline-none transition placeholder:text-mist-500 focus:border-jade-500/50"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-xl border border-white/10 bg-ink-800 px-4 py-3 text-[14px] font-medium text-mist-100 outline-none focus:border-jade-500/50"
            >
              <option value="match">Sort: best match</option>
              <option value="crowd">Sort: fewest tourists</option>
              <option value="cost">Sort: cheapest first</option>
              <option value="alt">Sort: highest altitude</option>
            </select>
          </div>

          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 no-scrollbar">
            <Chip on={state === "ALL"} onClick={() => setState("ALL")} label="All states" />
            {STATES.map((s) => (
              <Chip
                key={s.code}
                on={state === s.code}
                onClick={() => setState(s.code)}
                label={s.name}
                color={s.color}
                count={places.filter((p) => p.st === s.code).length}
              />
            ))}
          </div>

          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 no-scrollbar">
            <Chip on={tag === "ALL"} onClick={() => setTag("ALL")} label="Any interest" />
            {INTEREST_META.map((i) => (
              <Chip
                key={i.id}
                on={tag === i.id}
                onClick={() => setTag(i.id)}
                label={`${i.emoji} ${i.label.split(" ")[0]}`}
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[11px] font-bold uppercase tracking-[0.14em] text-mist-500">Best in</span>
            <Chip on={month === 0} onClick={() => setMonth(0)} label="Any month" />
            {MONTHS.map((m, i) => (
              <Chip key={m} on={month === i + 1} onClick={() => setMonth(i + 1)} label={m} />
            ))}
            <button
              onClick={() => setGemsOnly((v) => !v)}
              className={`ml-auto rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition active:scale-95 ${
                gemsOnly ? "border-gold-500/50 bg-gold-500/15 text-gold-300" : "border-white/10 text-mist-300"
              }`}
            >
              💎 Hidden gems only
            </button>
          </div>

          <p className="text-[12.5px] text-mist-400">
            <span className="font-bold text-mist-100">{filtered.length}</span> destination
            {filtered.length === 1 ? "" : "s"} match
            {month ? ` and are at their best in ${MONTHS[month - 1]}` : ""}
            {tag !== "ALL" ? ` for ${INTEREST_META.find((i) => i.id === tag)?.label.toLowerCase()}` : ""}.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.05fr]">
        {/* list */}
        <div className="space-y-3">
          {filtered.map((p) => {
            const st = STATES.find((s) => s.code === p.st)!;
            return (
              <button
                key={p.id}
                onClick={() => setActive(p.id)}
                onMouseEnter={() => setActive(p.id)}
                className={`group flex w-full gap-4 rounded-2xl card-edge p-3 text-left transition ${
                  active === p.id ? "bg-ink-800" : "bg-ink-850/50 hover:bg-ink-850"
                }`}
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl sm:h-24 sm:w-24">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.photo} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" loading="lazy" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="truncate font-display text-[17px] font-semibold leading-tight text-mist-50">{p.n}</h3>
                    {p.gem && <span title="Hidden gem" className="shrink-0 text-sm">💎</span>}
                  </div>
                  <p className="mt-0.5 text-[11.5px] font-medium" style={{ color: st.color }}>
                    {p.region} · {st.name}
                  </p>
                  <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-mist-300">{p.blurb}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-mist-500">
                    <span>Best {p.best.slice(0, 3).map((m) => MONTHS[m - 1]).join(", ")}</span>
                    <span className="flex items-center gap-1">
                      {"●".repeat(p.crowd)}
                      <span className="opacity-25">{"●".repeat(5 - p.crowd)}</span>
                    </span>
                    {p.alt > 0 && <span>{p.alt} m</span>}
                  </div>
                </div>
              </button>
            );
          })}
          {!filtered.length && (
            <div className="rounded-2xl card-edge bg-ink-850/60 p-10 text-center">
              <p className="font-display text-xl text-mist-100">Nothing matches that combination</p>
              <p className="mt-2 text-[13.5px] text-mist-400">
                Try clearing the month filter — some places are simply unreachable in peak monsoon.
              </p>
              <button
                onClick={() => {
                  setMonth(0);
                  setTag("ALL");
                  setState("ALL");
                  setGemsOnly(false);
                  setQuery("");
                }}
                className="mt-5 rounded-full bg-mist-50 px-5 py-2.5 text-sm font-semibold text-ink-900"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>

        {/* map + detail */}
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <RouteMap points={mapPoints} variant="compact" activeId={active} onSelect={setActive} caption={`${filtered.length} shown`} />
          {detail && <DetailCard p={detail} />}
        </div>
      </div>
    </div>
  );
}

function DetailCard({ p }: { p: DestLite }) {
  const st = STATES.find((s) => s.code === p.st)!;
  return (
    <div className="overflow-hidden rounded-3xl card-edge bg-ink-850">
      <div className="relative h-52">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.photo} alt={p.n} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-850 via-ink-850/25 to-transparent" />
        <span
          className="absolute left-4 top-4 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur"
          style={{ background: `${st.color}e6`, color: "#08110d" }}
        >
          {st.name}
        </span>
        {p.gem && (
          <span className="absolute right-4 top-4 rounded-full bg-gold-500/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-ink-950 backdrop-blur">
            Hidden gem
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-display text-2xl font-semibold tracking-tight text-mist-50">{p.n}</h3>
        <p className="mt-2 text-[13.5px] leading-relaxed text-mist-300">{p.blurb}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-[12.5px]">
          <Stat k="Ideal nights" v={`${p.nights || 1}`} />
          <Stat k="Sightseeing" v={`${p.hrs} hrs`} />
          <Stat k="Altitude" v={p.alt > 0 ? `${p.alt} m` : "Plains"} />
          <Stat k="Mid-range / night" v={`₹${p.costMid.toLocaleString("en-IN")}`} />
        </dl>
        <div className="mt-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-mist-500">Don&apos;t miss</p>
          <ul className="mt-2 space-y-1.5">
            {p.highlights.slice(0, 4).map((h) => (
              <li key={h} className="flex gap-2 text-[13px] leading-relaxed text-mist-200">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-jade-400" />
                {h}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {p.tags.map((t) => (
            <span key={t} className="rounded-md bg-white/6 px-2 py-1 text-[10.5px] font-semibold capitalize text-mist-300">
              {INTEREST_META.find((i) => i.id === t)?.label ?? t}
            </span>
          ))}
        </div>
        <Link
          href={`/?place=${p.id}&days=${Math.max(3, (p.nights || 1) + 2)}#planner`}
          className="mt-5 block rounded-full bg-gradient-to-r from-rust-500 to-gold-500 py-3 text-center text-[14px] font-bold text-ink-950 transition hover:brightness-110"
        >
          Build a trip around {p.n}
        </Link>
      </div>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl bg-white/[0.04] px-3 py-2.5">
      <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-mist-500">{k}</dt>
      <dd className="mt-0.5 font-display text-[15px] font-semibold text-mist-100">{v}</dd>
    </div>
  );
}

function Chip({
  on,
  onClick,
  label,
  color,
  count,
}: {
  on: boolean;
  onClick: () => void;
  label: string;
  color?: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition active:scale-95 ${
        on ? "border-white/25 bg-white/10 text-mist-50" : "border-white/8 text-mist-400 hover:border-white/16 hover:text-mist-100"
      }`}
      style={on && color ? { borderColor: `${color}66`, background: `${color}1f`, color } : undefined}
    >
      {label}
      {count !== undefined && <span className="ml-1.5 opacity-50">{count}</span>}
    </button>
  );
}
