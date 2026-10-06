import { EDGES, PLACE_BY_ID, PLACES } from "@/lib/data/places";
import { GATEWAYS, PACKING, PERMITS, PRACTICAL_TIPS, SEASON_NOTES, STATE_META } from "@/lib/data/knowledge";
import type {
  BudgetLine,
  Itinerary,
  Leg,
  PlanBlock,
  PlanDay,
  Place,
  PlannerInput,
  StateCode,
} from "@/lib/types";

/* ────────────────────────── graph ────────────────────────── */

interface Graph {
  [id: string]: { to: string; km: number; hrs: number; road: string; note?: string }[];
}
const GRAPH: Graph = {};
for (const e of EDGES) {
  if (!PLACE_BY_ID[e.a] || !PLACE_BY_ID[e.b]) continue;
  if (e.hrs <= 0 || e.km <= 0) continue;
  (GRAPH[e.a] ||= []).push({ to: e.b, km: e.km, hrs: e.hrs, road: e.road, note: e.note });
  (GRAPH[e.b] ||= []).push({ to: e.a, km: e.km, hrs: e.hrs, road: e.road, note: e.note });
}

interface PathInfo {
  km: number;
  hrs: number;
  via: string[];
  road: string;
  note?: string;
}

const pathCache = new Map<string, PathInfo | null>();

export function shortestPath(from: string, to: string): PathInfo | null {
  if (from === to) return { km: 0, hrs: 0, via: [], road: "highway" };
  const key = `${from}|${to}`;
  const cached = pathCache.get(key);
  if (cached !== undefined) return cached;
  const dist = new Map<string, number>();
  const prev = new Map<string, string>();
  const done = new Set<string>();
  dist.set(from, 0);
  const open = new Set<string>([from]);
  while (open.size) {
    let cur = "";
    let best = Infinity;
    for (const q of open) {
      const d = dist.get(q) ?? Infinity;
      if (d < best) { best = d; cur = q; }
    }
    open.delete(cur);
    if (cur === to) break;
    done.add(cur);
    for (const edge of GRAPH[cur] ?? []) {
      if (done.has(edge.to)) continue;
      const nd = best + edge.hrs;
      if (nd < (dist.get(edge.to) ?? Infinity)) {
        dist.set(edge.to, nd);
        prev.set(edge.to, cur);
        open.add(edge.to);
      }
    }
  }
  if (!dist.has(to)) {
    pathCache.set(key, null);
    return null;
  }
  const via: string[] = [];
  let node = to;
  while (node !== from) {
    via.unshift(node);
    const p = prev.get(node);
    if (!p) break;
    node = p;
  }
  const order = [from, ...via];
  let km = 0;
  let hrs = 0;
  let roughest = "highway";
  let note: string | undefined;
  const rank = ["highway", "good", "winding", "rough", "trek"];
  for (let i = 0; i < order.length - 1; i++) {
    const e = (GRAPH[order[i]] ?? []).find((x) => x.to === order[i + 1]);
    if (!e) continue;
    km += e.km;
    hrs += e.hrs;
    if (rank.indexOf(e.road) > rank.indexOf(roughest)) roughest = e.road;
    if (e.note) note = e.note;
  }
  const result: PathInfo = { km, hrs, via, road: roughest, note };
  pathCache.set(key, result);
  return result;
}

export function haversine(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/* ────────────────────────── helpers ────────────────────────── */

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function inr(n: number) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function pick<T>(arr: T[], seed: number) {
  return arr[Math.abs(Math.round(seed)) % arr.length];
}

function titleCase(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** A leg longer than 9 hrs needs an overnight halt; over 5.5 hrs eats the day. */
function travelDaysFor(hrs: number) {
  if (hrs >= 9) return 2;
  if (hrs >= 5.5) return 1;
  return 0;
}

function transportCost(km: number, tier: PlannerInput["tier"], people: number) {
  const sumoSeat = Math.round(clamp(km * 3.6, 180, 1600));
  const sedan = Math.round(2200 + km * 13);
  const suv = Math.round(3200 + km * 19);
  if (tier === "budget") return { mode: "Shared Sumo / local bus", perPerson: sumoSeat };
  if (tier === "mid") return { mode: "Private sedan (split)", perPerson: Math.round(sedan / Math.max(2, people)) };
  return { mode: "Private SUV (split)", perPerson: Math.round(suv / Math.max(2, people)) };
}

/* ────────────────────────── scoring ────────────────────────── */

interface Scored {
  place: Place;
  score: number;
  reasons: string[];
}

function scorePool(input: PlannerInput, gatewayId: string): Scored[] {
  const interests = input.interests.length ? input.interests : (["nature", "culture"] as const);
  const stateFilter = input.states.length ? input.states : null;
  const out: Scored[] = [];

  for (const p of PLACES) {
    if (p.id === gatewayId) continue;
    if (stateFilter && !stateFilter.includes(p.st)) continue;
    if (input.nationality === "foreign" && p.st === "AR" && input.people < 2) continue;
    if (input.nationality === "foreign" && (p.id === "tsomgo" || p.id === "lachung")) continue;
    if (input.avoidPermits && STATE_META[p.st].permit !== "none") continue;
    if (!shortestPath(gatewayId, p.id)) continue;

    const clashes = input.months.filter((m) => p.avoid.includes(m));
    const hits = input.months.filter((m) => p.best.includes(m));
    if (clashes.length > 0 && hits.length === 0) continue;

    let score = 0;
    const reasons: string[] = [];
    const matched = p.tags.filter((t) => (interests as string[]).includes(t));
    score += (matched.length / Math.max(2, interests.length)) * 36;
    if (matched.length) reasons.push(`matches ${matched.map(titleCase).join(", ")}`);

    score += hits.length * 3.4 - clashes.length * 6;
    if (hits.length >= input.months.length) reasons.push("in its prime season for your dates");

    if ((interests as string[]).includes("offbeat") && p.gem) { score += 12; reasons.push("genuine hidden gem"); }
    else if (p.gem) score += 4;
    if ((interests as string[]).includes("photography") && p.tags.includes("photography")) score += 4;

    if (input.pace === "relaxed") score += (6 - p.crowd) * 2.6;
    if (input.pace === "packed") score += Math.min(p.crowd, 4) * 1.3;
    if (input.pace === "balanced") score += (4 - Math.abs(3 - p.crowd)) * 1.7;

    if (input.tier === "comfort" && p.crowd <= 2 && !p.hub) score -= 4;
    if (input.tier === "budget" && p.cost.budget <= 1300) score += 3.5;
    if (input.tier === "comfort" && p.cost.comfort >= 7000) score += 2.5;

    if (input.traveller === "family" && p.alt > 3600) score -= 12;
    if (input.traveller === "family" && p.tags.includes("adventure") && p.hrs >= 9) score -= 5;
    if (input.traveller === "family" && (p.tags.includes("wildlife") || p.tags.includes("nature"))) score += 4.5;
    if (input.traveller === "couple" && (p.tags.includes("relax") || p.tags.includes("photography"))) score += 3;
    if (input.traveller === "solo" && p.gem) score += 3;
    if (input.traveller === "friends" && (p.tags.includes("adventure") || p.tags.includes("festivals"))) score += 3.5;

    // hub proximity bonus — a reachable, well-connected stop is worth more on short trips
    const fromGate = shortestPath(gatewayId, p.id)!;
    const reachPenalty = Math.max(0, fromGate.hrs - 6) * (input.days <= 7 ? 1.9 : 0.7);
    score -= reachPenalty;
    score += 2.4 * Math.log1p(p.hrs);

    out.push({ place: p, score, reasons });
  }
  return out.sort((a, b) => b.score - a.score);
}

/* ────────────────────────── ordering ────────────────────────── */

function orderPlaces(startId: string, places: Place[], endId: string): Place[] {
  if (places.length <= 1) return [...places];
  const remaining = [...places];
  const ordered: Place[] = [];
  let cur = startId;
  while (remaining.length) {
    let bestIdx = 0;
    let bestCost = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const p = shortestPath(cur, remaining[i].id);
      const cost = p ? p.hrs : haversine(PLACE_BY_ID[cur], remaining[i]) / 20;
      const bonus = remaining[i].hub ? 0.5 : 0;
      if (cost - bonus < bestCost) { bestCost = cost - bonus; bestIdx = i; }
    }
    const next = remaining.splice(bestIdx, 1)[0];
    ordered.push(next);
    cur = next.id;
  }
  let improved = true;
  let guard = 0;
  const total = (seq: Place[]) => {
    let t = 0;
    let c = startId;
    for (const p of seq) {
      const leg = shortestPath(c, p.id);
      t += leg ? leg.hrs : 999;
      c = p.id;
    }
    const out = shortestPath(c, endId);
    t += out ? out.hrs : 999;
    return t;
  };
  while (improved && guard++ < 40) {
    improved = false;
    for (let i = 0; i < ordered.length - 1; i++) {
      for (let j = i + 1; j < ordered.length; j++) {
        const cand = [...ordered.slice(0, i), ...ordered.slice(i, j + 1).reverse(), ...ordered.slice(j + 1)];
        if (total(cand) < total(ordered) - 0.05) {
          ordered.splice(0, ordered.length, ...cand);
          improved = true;
        }
      }
    }
  }
  return ordered;
}

/* ────────────────────────── day skeleton ────────────────────────── */

interface Skel {
  placeId: string;
  kind: "travel" | "half" | "arrive" | "full";
  km: number;
  hrs: number;
  note?: string;
  travelTitle?: string;
}

function nightsFor(p: Place, pace: PlannerInput["pace"]) {
  let n = p.nights || 1;
  if (pace === "relaxed") n = Math.ceil(n * 1.3);
  if (pace === "packed") n = Math.max(1, Math.floor(n * 0.7));
  return clamp(n, 1, 4);
}


/* ────────────────────────── main ────────────────────────── */

let slugCounter = 0;

export function buildItinerary(input: PlannerInput): Itinerary {
  const seed = (input.seed ? input.seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0) : Date.now()) + slugCounter++;
  const days = clamp(input.days, 3, 21);
  const months = input.months.length ? input.months : [11];
  const work: PlannerInput = { ...input, days, months };
  const interestSet = new Set<string>(work.interests.length ? work.interests : ["nature", "culture"]);

  const gatewayId = work.start && PLACE_BY_ID[work.start] ? work.start : "guwahati";
  const startPlace = PLACE_BY_ID[gatewayId];

  let pool = scorePool(work, gatewayId);
  const maxLegHrs = work.pace === "packed" ? 16 : work.pace === "balanced" ? 14 : 12;
  const pinned = work.states.length === 1;
  const maxPerState = pinned ? 9 : days <= 5 ? 2 : days <= 9 ? 3 : days <= 14 ? 4 : 5;
  const targetStart = clamp(
    Math.round(days * (work.pace === "packed" ? 0.7 : work.pace === "relaxed" ? 0.36 : 0.48)),
    2,
    11,
  );
  const excluded = new Set<string>();

  const pickTop = (t: number): Place[] => {
    const perState = new Map<StateCode, number>();
    const out: Place[] = [];
    for (const s of pool) {
      if (excluded.has(s.place.id)) continue;
      const c = perState.get(s.place.st) ?? 0;
      if (c >= maxPerState) continue;
      perState.set(s.place.st, c + 1);
      out.push(s.place);
      if (out.length >= t) break;
    }
    return out;
  };

  const chooseExit = (cand: Place[]): string => {
    if (days < 5) return gatewayId;
    const visitedStates = new Set(cand.map((p) => p.st));
    const last = cand[cand.length - 1];
    let bestId = gatewayId;
    let bestSave = 4;
    for (const g of GATEWAYS) {
      const gp = PLACE_BY_ID[g.id];
      if (!gp || g.id === gatewayId) continue;
      if (gp.st !== "AS" && !visitedStates.has(gp.st)) continue;
      const out = shortestPath(last.id, g.id);
      const back = shortestPath(last.id, gatewayId);
      if (!out || !back || out.hrs > 9) continue;
      if (back.hrs - out.hrs > bestSave) {
        bestSave = back.hrs - out.hrs;
        bestId = g.id;
      }
    }
    return bestId;
  };

  const coreSkeleton = (seq: Place[]): Skel[] => {
    const skel: Skel[] = [];
    let cur = gatewayId;
    for (const p of seq) {
      const leg = shortestPath(cur, p.id);
      if (!leg) continue;
      const td = travelDaysFor(leg.hrs);
      const n = nightsFor(p, work.pace);
      if (td === 2) {
        skel.push({ placeId: p.id, kind: "half", km: leg.km / 2, hrs: leg.hrs / 2, travelTitle: `Halt en route to ${p.n}`, note: leg.note });
        skel.push({ placeId: p.id, kind: "travel", km: leg.km / 2, hrs: leg.hrs / 2, travelTitle: `Continue to ${p.n}` });
      } else if (td === 1) {
        skel.push({ placeId: p.id, kind: "travel", km: leg.km, hrs: leg.hrs, travelTitle: `Transfer to ${p.n}`, note: leg.note });
      } else {
        skel.push({ placeId: p.id, kind: "arrive", km: leg.km, hrs: leg.hrs, travelTitle: `Arrive ${p.n}`, note: leg.note });
      }
      for (let d = 0; d < n - 1; d++) skel.push({ placeId: p.id, kind: "full", km: 0, hrs: 0 });
      cur = p.id;
    }
    return skel;
  };

  const fitToDays = (skel: Skel[], budget: number) => {
    let guard = 0;
    while (skel.length > budget && guard++ < 60) {
      let idx = -1;
      let most = 0;
      for (let i = skel.length - 1; i >= 0; i--) {
        if (skel[i].kind !== "full") continue;
        const pid = skel[i].placeId;
        const place = PLACE_BY_ID[pid];
        // flagship stops (3+ recommended nights) always keep at least one full day
        const minFull = place && place.nights >= 3 ? 1 : 0;
        const count = skel.filter((s) => s.placeId === pid && s.kind === "full").length;
        if (count <= minFull) continue;
        if (count > most) { most = count; idx = i; }
      }
      if (idx === -1) break;
      skel.splice(idx, 1);
    }
    return skel;
  };

  let ordered: Place[] = [];
  let skel: Skel[] = [];
  let exitGatewayId = gatewayId;

  search: for (let t = targetStart; t >= 1; t--) {
    for (let attempt = 0; attempt < 10; attempt++) {
      const cand = pickTop(t);
      if (!cand.length) break;
      const draft = orderPlaces(gatewayId, cand, gatewayId);
      let cur = gatewayId;
      let offender: Place | null = null;
      for (const p of draft) {
        const leg = shortestPath(cur, p.id);
        if (!leg || leg.hrs > maxLegHrs) { offender = p; break; }
        cur = p.id;
      }
      if (offender) { excluded.add(offender.id); continue; }
      const core = coreSkeleton(draft);
      if (fitToDays(core, days - 1).length > days - 1) break;
      exitGatewayId = chooseExit(draft);
      ordered = orderPlaces(gatewayId, cand, exitGatewayId);
      let ok = true;
      cur = gatewayId;
      for (const p of ordered) {
        const leg = shortestPath(cur, p.id);
        if (!leg || leg.hrs > maxLegHrs) { ok = false; break; }
        cur = p.id;
      }
      if (!ok) { excluded.add(ordered[ordered.length - 1].id); continue; }
      skel = fitToDays(coreSkeleton(ordered), days - 1);
      break search;
    }
  }

  if (!ordered.length) {
    const fb = pool.find((s) => !excluded.has(s.place.id))?.place ?? PLACES.find((p) => p.id === "shillong")!;
    ordered = [fb];
    skel = fitToDays(coreSkeleton(ordered), days - 1);
  }

  const exitPlace = PLACE_BY_ID[exitGatewayId] ?? startPlace;
  const allowedIds = new Set(pool.map((s) => s.place.id));
  const exitFromId = ordered.length ? ordered[ordered.length - 1].id : gatewayId;
  const exitPath = shortestPath(exitFromId, exitGatewayId);
  const exitDays = exitPath && exitPath.hrs >= 9 ? 2 : 1;
  skel = fitToDays(skel, Math.max(1, days - exitDays));

  /* ── materialise days ── */
  const planDays: PlanDay[] = [];
  const legs: Leg[] = [];

  const pushDay = (baseId: string, blocks: PlanBlock[], km: number, hrs: number, title: string, note?: string) => {
    const base = PLACE_BY_ID[baseId];
    if (planDays.length >= days) return;
    planDays.push({
      index: planDays.length + 1,
      title,
      baseId,
      base: base ? base.n : baseId,
      state: base ? base.st : ("AS" as StateCode),
      driveKm: Math.round(km),
      driveHrs: Math.round(hrs * 10) / 10,
      blocks,
      note,
    });
  };

  const foodLine = (p: Place) => `Try ${pick(STATE_META[p.st].food, seed + Math.round(p.lat * 10))}`;
  const mealCost = () => (work.tier === "budget" ? 220 : work.tier === "mid" ? 480 : 1050);

  const highlightQueue = new Map<string, string[]>();
  const nextHighlight = (p: Place) => {
    const q = highlightQueue.get(p.id) ?? [...p.highlights];
    const h = q.shift() ?? `${p.n} — wander and see what you find`;
    highlightQueue.set(p.id, q);
    return h;
  };

  // figure out the fill days up front so "golden hour" lands on the right day
  const fillCount = Math.max(0, days - exitDays - skel.length);
  const lastBaseId = skel.length ? skel[skel.length - 1].placeId : gatewayId;
  const allSkel: Skel[] = [...skel];
  for (let i = 0; i < fillCount; i++) allSkel.push({ placeId: lastBaseId, kind: "full", km: 0, hrs: 0 });
  const lastDayFor = new Map<string, number>();
  allSkel.forEach((s, i) => {
    if (!allSkel.slice(i + 1).some((x) => x.placeId === s.placeId)) lastDayFor.set(s.placeId, i);
  });

  let cur = gatewayId;
  for (let si = 0; si < skel.length; si++) {
    const s = skel[si];
    const p = PLACE_BY_ID[s.placeId];
    if (!p) continue;
    const t = transportCost(s.km, work.tier, work.people);

    if (s.km > 0 && cur !== s.placeId) {
      legs.push({
        fromId: cur,
        toId: s.placeId,
        from: PLACE_BY_ID[cur]?.n ?? cur,
        to: p.n,
        km: s.km,
        hrs: Math.round(s.hrs * 10) / 10,
        mode: t.mode,
        cost: t.perPerson,
        road: "winding",
        note: s.note,
      });
    }

    if (s.kind === "half") {
      pushDay(
        s.placeId,
        [
          { time: "07:00", kind: "travel", title: `Leave ${PLACE_BY_ID[cur]?.n ?? cur} early`, detail: `${Math.round(s.km)} km · ${s.hrs.toFixed(1)} hrs today · ${t.mode}${s.note ? ` — ${s.note}` : ""}`, cost: t.perPerson, minutes: Math.round(s.hrs * 60) },
          { time: "12:30", kind: "meal", title: "Lunch halt at a highway dhaba", detail: "Trunk-road dhabas in Assam do the best fish thali and dal in the region.", cost: mealCost() },
          { time: "15:30", kind: "sight", title: "Break the journey — roadside stop", detail: "Viewpoints, tea stalls, a stretch of the legs. Halt before dark: mountain roads after sunset aren't worth the risk.", cost: 0, placeId: s.placeId },
          { time: "19:30", kind: "stay", title: "Overnight halt en route", detail: "Splitting this drive over two days is the right call — you'll arrive fresh instead of wrecked.", cost: work.tier === "budget" ? 900 : work.tier === "mid" ? 2200 : 4500 },
        ],
        s.km,
        s.hrs,
        s.travelTitle ?? `Halt en route to ${p.n}`,
        "Long-haul day. Book the halt town ahead — small towns fill up without warning.",
      );
      cur = s.placeId;
      continue;
    }

    if (s.kind === "travel") {
      pushDay(
        s.placeId,
        [
          { time: "06:30", kind: "travel", title: `Depart ${PLACE_BY_ID[cur]?.n ?? cur} for ${p.n}`, detail: `${Math.round(s.km)} km · ${s.hrs.toFixed(1)} hrs · ${t.mode}${s.note ? ` — ${s.note}` : ""}`, cost: t.perPerson, minutes: Math.round(s.hrs * 60) },
          { time: "11:00", kind: "meal", title: "Roadside stop", detail: foodLine(p), cost: mealCost() },
          { time: "15:30", kind: "sight", title: nextHighlight(p), detail: `Arrive and settle in${p.alt > 2500 ? `. You're at ${p.alt} m — go slow tonight, hydrate, skip alcohol.` : ", then take an easy orientation walk before the light goes."}`, cost: p.fee, placeId: p.id },
          { time: "19:30", kind: "meal", title: `Dinner in ${p.n}`, detail: foodLine(p), cost: mealCost() },
        ],
        s.km,
        s.hrs,
        s.travelTitle ?? `Transfer to ${p.n}`,
        p.alt > 2800 ? "Altitude day — take it easy, drink water, sleep early." : undefined,
      );
      cur = s.placeId;
      continue;
    }

    if (s.kind === "arrive") {
      pushDay(
        s.placeId,
        [
          { time: "08:30", kind: "travel", title: `Short drive to ${p.n}`, detail: `${Math.round(s.km)} km · ${s.hrs.toFixed(1)} hrs · ${t.mode}`, cost: s.km > 0 ? t.perPerson : 0, minutes: Math.round(s.hrs * 60) },
          { time: "11:00", kind: "sight", title: nextHighlight(p), detail: `Start with the headline act at ${p.n} before the day-trippers arrive.`, cost: p.fee, placeId: p.id },
          { time: "13:30", kind: "meal", title: "Lunch", detail: foodLine(p), cost: mealCost() },
          { time: "15:15", kind: "sight", title: nextHighlight(p), detail: p.blurb, cost: 0, placeId: p.id },
          { time: "19:30", kind: "meal", title: "Dinner", detail: foodLine(p), cost: mealCost() },
        ],
        s.km,
        s.hrs,
        s.travelTitle ?? `Arrive ${p.n}`,
      );
      cur = s.placeId;
      continue;
    }

    const exp = experienceFor(p, interestSet);
    const isLast = lastDayFor.get(p.id) === si;
    pushDay(
      s.placeId,
      [
        { time: "07:00", kind: "experience", title: exp.title, detail: exp.detail, cost: exp.cost, placeId: p.id, minutes: exp.minutes },
        { time: "10:30", kind: "sight", title: nextHighlight(p), detail: `${p.n} · ${p.region}, ${STATE_META[p.st].name}`, cost: p.fee, placeId: p.id },
        { time: "13:00", kind: "meal", title: "Lunch", detail: foodLine(p), cost: mealCost() },
        { time: "15:00", kind: "sight", title: nextHighlight(p), detail: p.blurb, cost: 0, placeId: p.id },
        ...(isLast ? [{ time: "17:45", kind: "experience", title: `Golden hour — ${p.n} viewpoint`, detail: "Best light is 30–45 minutes before sunset. Carry a headlamp for the walk back.", cost: 0, placeId: p.id } as PlanBlock] : []),
        { time: "19:45", kind: "meal", title: "Dinner", detail: foodLine(p), cost: mealCost() },
      ],
      0,
      0,
      `${p.n} — full day`,
      p.gem ? "Off-grid zone: cash only, patchy network, homestay hospitality. Tell someone your plan." : undefined,
    );
  }

  // day-trip / flex days, kept before the exit day
  const visited = new Set(ordered.map((p) => p.id));
  while (planDays.length < days - exitDays) {
    const baseId = planDays[planDays.length - 1]?.baseId ?? gatewayId;
    const base = PLACE_BY_ID[baseId];
    if (!base) break;
    const options = PLACES.filter((p) => p.st === base.st && p.id !== base.id && !visited.has(p.id) && haversine(base, p) < 115).sort(
      (a, b) => haversine(base, a) - haversine(base, b),
    );
    const preferred = options.find((o) => allowedIds.has(o.id)) ?? options[0];
    const isFinal = planDays.length === days - exitDays - 1;

    if (preferred) {
      const dist = Math.max(22, haversine(base, preferred) * 1.35);
      const t = transportCost(dist, work.tier, work.people);
      legs.push({
        fromId: baseId,
        toId: preferred.id,
        from: base.n,
        to: preferred.n,
        km: dist,
        hrs: Math.round((dist / 26) * 10) / 10,
        mode: t.mode,
        cost: t.perPerson,
        road: "winding",
        note: "Day trip from your base",
      });
      pushDay(
        baseId,
        [
          { time: "08:00", kind: "travel", title: `Day trip to ${preferred.n}`, detail: `${Math.round(dist)} km each way · ${t.mode}`, cost: t.perPerson, minutes: Math.round((dist / 32) * 60) },
          { time: "10:30", kind: "sight", title: preferred.highlights[0] ?? preferred.n, detail: preferred.blurb, cost: preferred.fee, placeId: preferred.id },
          { time: "13:00", kind: "meal", title: "Lunch", detail: foodLine(preferred), cost: mealCost() },
          { time: "15:00", kind: "sight", title: preferred.highlights[1] ?? `Explore ${preferred.n}`, detail: preferred.blurb, cost: 0, placeId: preferred.id },
          ...(isFinal ? [{ time: "17:30", kind: "experience", title: `Golden hour back near ${base.n}`, detail: "Last full evening — find the viewpoint your host recommends.", cost: 0, placeId: baseId } as PlanBlock] : []),
          { time: "19:30", kind: "meal", title: `Dinner in ${base.n}`, detail: foodLine(base), cost: mealCost() },
        ],
        dist * 2,
        dist / 26,
        `Day trip — ${preferred.n}`,
      );
      visited.add(preferred.id);
      ordered.push(preferred);
      if (ordered.length > 14) break;
      continue;
    }

    pushDay(
      baseId,
      [
        { time: "08:00", kind: "experience", title: `Flex day in ${base.n}`, detail: "No fixed plan. This is deliberate slack — use it for the thing you didn't have time for, or for weather that didn't cooperate.", cost: 0, placeId: baseId },
        { time: "11:00", kind: "sight", title: nextHighlight(base), detail: base.blurb, cost: base.fee, placeId: baseId },
        { time: "13:00", kind: "meal", title: "Long lunch", detail: foodLine(base), cost: mealCost() },
        { time: "15:30", kind: "experience", title: "Something local", detail: "Ask your host: a weaving workshop, a village football match, a short walk to a viewpoint, or just the market.", cost: 300, placeId: baseId },
        { time: "19:30", kind: "meal", title: "Dinner", detail: foodLine(base), cost: mealCost() },
      ],
      0,
      0,
      `${base.n} — flex day`,
      "Buffer days are how good Northeast trips survive landslides, fog and bandh calls.",
    );
    if (planDays.length >= days - exitDays) break;
  }

  // exit day always last
  const exitLeg = shortestPath(cur, exitGatewayId);
  if (exitLeg && planDays.length < days) {
    const t = transportCost(exitLeg.km, work.tier, work.people);
    legs.push({
      fromId: cur,
      toId: exitGatewayId,
      from: PLACE_BY_ID[cur]?.n ?? cur,
      to: exitPlace.n,
      km: exitLeg.km,
      hrs: Math.round(exitLeg.hrs * 10) / 10,
      mode: t.mode,
      cost: t.perPerson,
      road: exitLeg.road,
      note: exitLeg.note,
    });
    const openJaw = exitGatewayId !== gatewayId;
    if (exitDays === 2) {
      const t2 = transportCost(exitPath!.km / 2, work.tier, work.people);
      pushDay(
        exitGatewayId,
        [
          { time: "07:00", kind: "travel", title: `Leave ${PLACE_BY_ID[cur]?.n ?? cur} early`, detail: `${Math.round(exitPath!.km)} km back to ${exitPlace.n} — too far for one safe push, so we split it.`, cost: t2.perPerson, minutes: Math.round((exitPath!.hrs / 2) * 60) },
          { time: "12:30", kind: "meal", title: "Lunch halt", detail: foodLine(exitPlace), cost: mealCost() },
          { time: "16:00", kind: "sight", title: "Arrive, walk, sleep early", detail: "An unhurried evening before your travel day. If you'd rather push on, leave by 06:00 — never after dark.", cost: 0, placeId: exitGatewayId },
          { time: "19:30", kind: "meal", title: "Dinner", detail: foodLine(exitPlace), cost: mealCost() },
        ],
        exitPath!.km / 2,
        exitPath!.hrs / 2,
        `Halt en route to ${exitPlace.n}`,
        "Splitting the return is the safe, sane choice on these roads.",
      );
      pushDay(
        exitGatewayId,
        [
          { time: "08:00", kind: "travel", title: `Final leg into ${exitPlace.n}`, detail: `${Math.round(exitPath!.km / 2)} km · ${t.mode} · reach by early afternoon`, cost: t.perPerson, minutes: Math.round((exitPath!.hrs / 2) * 60) },
          { time: "13:00", kind: "meal", title: "Last meal", detail: foodLine(exitPlace), cost: mealCost() },
          { time: "15:00", kind: "buffer", title: "Buffer before departure", detail: "Allow at least four hours between arriving and your flight. Convoy delays and roadwork are routine.", cost: 0 },
        ],
        exitPath!.km / 2,
        exitPath!.hrs / 2,
        `Arrive ${exitPlace.n}`,
      );
    } else {
    pushDay(
      exitGatewayId,
      [
        { time: "07:30", kind: "travel", title: openJaw ? `Drive to ${exitPlace.n} for your flight out` : `Return to ${exitPlace.n}`, detail: `${Math.round(exitLeg.km)} km · ${exitLeg.hrs.toFixed(1)} hrs · ${t.mode}${exitLeg.note ? ` — ${exitLeg.note}` : ""}`, cost: t.perPerson, minutes: Math.round(exitLeg.hrs * 60) },
        { time: "12:00", kind: "meal", title: "Last meal in the hills", detail: foodLine(exitPlace), cost: mealCost() },
        ...(openJaw
          ? [{ time: "14:00", kind: "buffer", title: `Open-jaw: fly out of ${exitPlace.n}`, detail: `You avoided retracing ${Math.round(shortestPath(exitGatewayId, gatewayId)?.km ?? 0)} km of road by exiting from a second city. Book a multi-city ticket, not two one-ways.`, cost: 0 } as PlanBlock]
          : []),
        { time: "16:00", kind: "buffer", title: "Buffer before departure", detail: "Never book an evening flight after a morning mountain drive — allow at least four hours of slack.", cost: 0 },
      ],
      exitLeg.km,
      exitLeg.hrs,
      openJaw ? `Onward from ${exitPlace.n}` : `Return to ${exitPlace.n}`,
      "Book a flight no earlier than late afternoon. Landslides and convoy delays are routine.",
    );
    }
  }

  /* ── dates ── */
  const startDate = new Date(new Date().getFullYear(), months[0] - 1, 1);
  planDays.forEach((d, idx) => {
    const dt = new Date(startDate.getTime() + idx * 86400000);
    d.date = dt.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  });

  /* ── budget ── */
  const tier = work.tier;
  const stayNights = planDays.length;
  const stay = planDays.reduce((sum, d) => {
    const p = PLACE_BY_ID[d.baseId];
    return sum + (p ? p.cost[tier] : 3000);
  }, 0);
  const transport = legs.reduce((s, l) => s + l.cost, 0);
  const activity = planDays.reduce(
    (s, d) => s + d.blocks.reduce((x, b) => x + (b.kind === "sight" || b.kind === "experience" ? b.cost ?? 0 : 0), 0),
    0,
  );
  const food = planDays.reduce(
    (s, d) => s + d.blocks.reduce((x, b) => x + (b.kind === "meal" ? b.cost ?? 0 : 0), 0),
    0,
  );
  const permitStates = Array.from(new Set(ordered.map((p) => p.st).filter((st) => STATE_META[st].permit !== "none")));
  const permitCost = permitStates.reduce((s, st) => {
    if (work.nationality === "foreign") return s + (st === "AR" ? 5200 : st === "NL" || st === "MZ" ? 0 : 0);
    return s + (st === "AR" ? 500 : st === "NL" ? 140 : st === "MZ" ? 120 : 0);
  }, 0);
  const buffer = Math.round((stay + transport + activity + food + permitCost) * 0.07);
  const perPerson = stay + transport + activity + food + permitCost + buffer;
  const lines: BudgetLine[] = [
    { key: "stay", label: "Stays + local costs", amount: stay, detail: `${stayNights} nights · ${tier === "budget" ? "dorms & village homestays" : tier === "mid" ? "boutique guesthouses & tea bungalows" : "heritage stays & lodges"} (most include breakfast)`, color: "#1FA97A" },
    { key: "food", label: "Meals & cafés", amount: food, detail: "Local kitchens, market stalls, park-side dhabas", color: "#F0A73C" },
    { key: "transport", label: "Inter-city transport", amount: transport, detail: `${legs.length} legs · ${legs.reduce((s, l) => s + l.km, 0).toFixed(0)} km total · ${legs.reduce((s, l) => s + l.hrs, 0).toFixed(0)} hrs`, color: "#4C7DF0" },
    { key: "activity", label: "Safaris, entries & guides", amount: activity, detail: "Park fees, boat rides, treks, village hosts", color: "#C05621" },
    { key: "permit", label: "Permits", amount: permitCost, detail: permitStates.length ? permitStates.map((s) => STATE_META[s].name).join(", ") : "No permits on this route", color: "#9B6BFF" },
    { key: "buffer", label: "Contingency (7%)", amount: buffer, detail: "Road closures, extra fuel, tips, surprises", color: "#6B7280" },
  ];

  /* ── gems ── */
  const selectedIds = new Set(ordered.map((p) => p.id));
  const hiddenGems = ordered
    .filter((p) => p.gem)
    .slice(0, 5)
    .map((p) => ({
      place: p,
      why: gemWhy(p),
      when: `Best ${p.best.slice(0, 3).map((m) => MONTH_NAMES[m - 1]).join(", ")}`,
    }));
  const nearbyGems = pool
    .filter((s) => s.place.gem && !selectedIds.has(s.place.id) && ordered.some((o) => o.st === s.place.st))
    .slice(0, 4);
  for (const g of nearbyGems) {
    if (hiddenGems.length >= 8) break;
    hiddenGems.push({
      place: g.place,
      why: `${gemWhy(g.place)} Add a day here if your schedule stretches.`,
      when: `Best ${g.place.best.slice(0, 3).map((m) => MONTH_NAMES[m - 1]).join(", ")}`,
    });
  }

  /* ── alternatives ── */
  const alternatives: Itinerary["alternatives"] = [];
  if (work.budget && perPerson > work.budget) {
    const over = perPerson - work.budget;
    alternatives.push({
      title: `Bring it under ${inr(work.budget)}`,
      body: `This plan lands at ${inr(perPerson)} per person — about ${inr(over)} over. Three levers, in order of impact: (1) shift long legs from private cab to shared Sumos (saves roughly ${inr(Math.round(transport * 0.45))}); (2) travel late October or mid-January instead of the December peak, when homestays drop 25–35%; (3) give the days you'd have spent on ${ordered[ordered.length - 1]?.n ?? "the last stop"} to ${ordered[0]?.n ?? "your first stop"} instead.`,
      save: inr(Math.round(over * 0.8)),
    });
  } else if (work.budget) {
    alternatives.push({
      title: `You have ${inr(Math.max(0, work.budget - perPerson))} of headroom`,
      body: `Spend it on the two things that genuinely change a Northeast trip: a private vehicle for the high passes (flexibility at viewpoints is worth everything) and one night upgraded to a heritage tea bungalow or a boutique stay in ${ordered[0]?.n ?? "Shillong"}. Nothing else buys better weather.`,
      save: inr(Math.round((work.budget - perPerson) * 0.4)),
    });
  }
  for (const p of ordered.filter((x) => months.some((m) => x.avoid.includes(m))).slice(0, 2)) {
    alternatives.push({
      title: `${p.n} is risky in ${months.map((m) => MONTH_NAMES[m - 1]).join("/")}`,
      body: `${p.avoid.map((m) => MONTH_NAMES[m - 1]).join(", ")} is this destination's difficult window (${p.id === "kaziranga" ? "the park closes mid-June to mid-October for Brahmaputra flooding" : "rain, fog and landslide risk on the approach roads"}). Either shift your dates to ${p.best.slice(0, 3).map((m) => MONTH_NAMES[m - 1]).join("/")} or swap it for ${swapFor(p)?.n ?? "a valley alternative"}.`,
    });
  }
  if (work.nationality === "foreign" && permitStates.includes("AR")) {
    alternatives.push({
      title: "Foreign national? Your Arunachal permit is a PAP, not an ILP",
      body: "It must be filed by a government-registered tour operator, takes 2–4 weeks, costs about USD 50 plus handling, and requires a group of at least two. Solo foreign travellers cannot enter Arunachal — pair up, or plan Meghalaya and Assam instead, which need no permits at all.",
    });
  }
  if (months.includes(12) && !ordered.some((p) => p.st === "NL")) {
    alternatives.push({
      title: "The Hornbill Festival is on while you're there",
      body: "Hornbill runs 1–10 December at Kisama, 12 km from Kohima. Adding Nagaland costs an ILP (₹140) and about 3 days — and it is the single most extraordinary cultural event in India. Book Kohima rooms two months ahead.",
    });
  }
  if (exitGatewayId !== gatewayId) {
    alternatives.push({
      title: "Open-jaw routing saves you a full day of driving",
      body: `You enter via ${startPlace.n} and exit via ${exitPlace.n}. Flying out of a second city avoids retracing roughly ${Math.round(shortestPath(exitGatewayId, gatewayId)?.km ?? 0)} km of mountain road. Book a multi-city ticket rather than two one-ways.`,
    });
  }
  if (legs.some((l) => l.hrs >= 9)) {
    alternatives.push({
      title: "One of your drives is a two-day haul — on purpose",
      body: `We split it with an overnight halt rather than pretend 14 hours of mountain road is a morning's work. If that doesn't appeal, cut ${ordered.filter((p) => p.st !== ordered[0]?.st).slice(-1)[0]?.n ?? "the far stop"} and deepen the first half of the trip instead.`,
    });
  }
  if (!alternatives.length) {
    alternatives.push({
      title: "Add one buffer day you'll be glad you had",
      body: "The Northeast punishes perfectionism: fog on Sela, a bandh call in Manipur, a cancelled ferry at Nimati ghat. Keep a spare day — or at least a refundable last-night hotel — before your flight home.",
    });
  }

  /* ── permits ── */
  const permitDetail = permitStates.map((st) => ({
    state: STATE_META[st].name,
    fee: work.nationality === "foreign" ? PERMITS[st].feeForeign : PERMITS[st].feeIndian,
    portal: PERMITS[st].portal,
    processing: PERMITS[st].processing,
  }));
  const foreignDetail = permitStates.map((st) => ({
    state: STATE_META[st].name,
    fee: PERMITS[st].feeForeign,
    portal: PERMITS[st].portal === "—" ? "FRRO registration / registered tour operator" : PERMITS[st].portal,
    processing: PERMITS[st].processing,
    note: PERMITS[st].foreign,
  }));
  const steps: string[] = [];
  for (const st of permitStates) {
    const info = PERMITS[st];
    steps.push(`${info.stateName}: apply on ${info.portal} — ${info.processing}. Fee ${work.nationality === "foreign" ? info.feeForeign : info.feeIndian}. Carry two printed copies plus your original ID.`);
    steps.push(...info.tips.slice(0, 2).map((tp) => `${info.stateName} tip — ${tp}`));
  }
  if (!permitStates.length) {
    steps.push("Good news: your route needs no Inner Line Permit at all. Assam, Meghalaya, Tripura and Sikkim's main circuits are fully open.");
    steps.push("Still carry a government photo ID — state border and army checkpoints ask for it routinely.");
  }

  /* ── packing & tips ── */
  const month = months[0];
  const season = month >= 10 || month <= 2 ? "winter" : month >= 6 && month <= 9 ? "monsoon" : "summer";
  const packing = [
    ...PACKING.all,
    ...(PACKING[season] ?? []),
    ...(interestSet.has("adventure") ? PACKING.trek : []),
  ];

  const metrics = {
    km: Math.round(legs.reduce((s, l) => s + l.km, 0)),
    driveHrs: Math.round(legs.reduce((s, l) => s + l.hrs, 0) * 10) / 10,
    states: new Set(ordered.map((p) => p.st)).size,
    experiences: planDays.reduce((s, d) => s + d.blocks.filter((b) => b.kind === "experience" || b.kind === "sight").length, 0),
    gems: ordered.filter((p) => p.gem).length,
    greenScore: greenScoreFor(ordered, legs, work),
  };

  const stateNames = Array.from(new Set(ordered.map((p) => p.st))).map((s) => STATE_META[s].name);
  const topTags = Array.from(interestSet).slice(0, 3).map((t) => t.toLowerCase());
  const title =
    stateNames.length > 2
      ? `${days} days · ${stateNames.slice(0, 2).join(" + ")} + ${stateNames.length - 2} more`
      : `${days} days · ${stateNames.join(" + ")}`;
  const summary = `A ${work.pace === "relaxed" ? "slow" : work.pace === "packed" ? "fast-moving" : "balanced"} ${days}-day ${tier === "budget" ? "backpacker" : tier === "mid" ? "mid-range" : "comfort"} route built around ${topTags.join(", ")}. ${planDays.length} planned days, ${metrics.km} km of road across ${metrics.states} state${metrics.states > 1 ? "s" : ""}, ${metrics.gems} hidden gem${metrics.gems === 1 ? "" : "s"} — from ${inr(perPerson)} per person.`;

  const reasoning: Itinerary["reasoning"][number][] = [
    { label: `Why enter from ${startPlace.n}`, text: `${GATEWAYS.find((g) => g.id === gatewayId)?.note ?? "Best connected gateway in the region."} Every stop on this route is reachable from here without backtracking.` },
    { label: "How the stops were chosen", text: `Ranked all ${PLACES.length} mapped destinations against your interests (${topTags.join(", ")}), a ${work.pace} pace, the ${months.map((m) => MONTH_NAMES[m - 1]).join("/")} window and your ${tier} budget tier — then penalised anything too far from the gateway for a ${days}-day trip. ${ordered.filter((p) => p.gem).length} of ${ordered.length} stops are off-grid gems; the rest are anchors you shouldn't miss first time.` },
    { label: "Why this order", text: `Nearest-neighbour routing across ${EDGES.length} real road segments, then 2-opt optimisation, brought total driving down to ${metrics.driveHrs} hours (${metrics.km} km). ${exitGatewayId !== gatewayId ? `Finishing at ${exitPlace.n} avoids backtracking.` : `The loop returns to ${startPlace.n} for your exit.`}` },
    { label: "Drive-time discipline", text: `Nothing over ${maxLegHrs} hours in one push. Any leg beyond 9 hours gets split into two days with an overnight halt — which is how Sela, Dirang and the Siang gorge should be done. Legs between 5.5 and 9 hours become dedicated transfer days with an afternoon to acclimatise.` },
    { label: "Season check", text: seasonLine(months) },
    { label: "Budget model", text: `Built from 2025–26 ground rates: about ${inr(ordered[0]?.cost[tier] ?? 3000)} per night in ${ordered[0]?.n ?? "the region"} covering your room and local costs, ${work.tier === "budget" ? "shared Sumo seats at roughly ₹3.5/km" : `a private vehicle split across ${work.people} traveller${work.people > 1 ? "s" : ""}`}, published park and entry fees, and a 7% contingency for the things that always happen.` },
  ];

  const slugBase = titleCase(stateNames.join("-")).replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "northeast";

  return {
    slug: `${slugBase}-${days}d-${Math.abs(seed).toString(36).slice(0, 5)}`,
    createdAt: new Date().toISOString(),
    title,
    summary,
    input: work,
    gateway: {
      id: gatewayId,
      name: startPlace.n,
      code: GATEWAYS.find((g) => g.id === gatewayId)?.code ?? "",
      note: GATEWAYS.find((g) => g.id === gatewayId)?.note ?? "",
    },
    places: ordered,
    days: planDays,
    legs,
    budget: {
      perPerson,
      total: perPerson * work.people,
      lines,
      dailyAvg: Math.round(perPerson / Math.max(1, planDays.length)),
      fitsBudget: work.budget ? perPerson <= work.budget : true,
      userBudget: work.budget,
    },
    permits: { needed: permitStates, indian: permitDetail, foreign: foreignDetail, steps, costPerPerson: permitCost },
    hiddenGems,
    alternatives,
    packing,
    tips: PRACTICAL_TIPS.slice(0, 6),
    reasoning,
    metrics,
  };
}

function experienceFor(p: Place, interests: Set<string>): { title: string; detail: string; cost: number; minutes: number } {
  if (p.tags.includes("wildlife")) {
    return { title: `Dawn safari at ${p.n}`, detail: "Be at the gate 30 minutes before opening — sightings drop sharply after 9 am. Take the park guide; they know the rhino and tiger crossings.", cost: p.fee || 1800, minutes: 180 };
  }
  if (p.tags.includes("adventure") && interests.has("adventure")) {
    return { title: `Early activity window at ${p.n}`, detail: "Start at first light — cloud build-up after 10 am kills the views and turns trails slippery.", cost: p.fee || 600, minutes: 240 };
  }
  if (p.tags.includes("spiritual")) {
    return { title: `Morning prayers, ${p.n}`, detail: "Monasteries hold morning puja between 6 and 8 am. Remove your shoes, walk clockwise, and accept the butter tea if it's offered.", cost: 0, minutes: 90 };
  }
  if (p.tags.includes("culture")) {
    return { title: "Village walk with a local host", detail: `Ask your homestay to introduce you to a weaver or an elder in ${p.n} — the stories are worth more than the sights, and the money goes straight into the household.`, cost: 400, minutes: 150 };
  }
  if (p.tags.includes("nature")) {
    return { title: `Sunrise at ${p.n}`, detail: "Cloud inversions and mirror-calm water happen in the first 90 minutes of light. Carry a torch for the walk out.", cost: 0, minutes: 75 };
  }
  return { title: `Slow morning in ${p.n}`, detail: "Breakfast with your hosts, then wander without an agenda.", cost: 0, minutes: 90 };
}

function gemWhy(p: Place) {
  const map: Record<string, string> = {
    nongriat: "You have to earn it — 3,500 steps each way, which is exactly why it stays quiet. Stay the night, not the day-trip.",
    mawphanlur: "A grassland bowl holding seven small lakes with essentially one place to stay. No network, by design.",
    mechuka: "Six hours of gorge road keeps almost everyone out. What's left is India's most beautiful empty valley.",
    dzukou: "The Dzukou lily exists nowhere else on earth. Camp in the shelter and you'll have the valley at dawn to yourself.",
    khonoma: "The Angami banned hunting in 1998 and the forest came back. India's first genuinely community-run green village.",
    majuli: "The satras still teach 500-year-old Sattriya dance. Majuli erodes a little every monsoon — go sooner rather than later.",
    manas: "Tigers, wild buffalo and golden langur with a fraction of Kaziranga's traffic. Stay inside the park at Mathanguri.",
    loktak: "Phumdis — floating rings of vegetation — occur at scale nowhere else. Keibul Lamjao is the world's only floating national park.",
    mon: "The Konyak chief's house sits across the India–Myanmar border. The last tattooed head-hunters are still there to meet.",
    ukhrul: "Home of the Shirui lily, which botanists have never successfully transplanted anywhere else on the planet.",
    unakoti: "One less than a crore carved gods in a forest, still half-swallowed by jungle.",
    ziro: "Paddy-fish farming that sits on UNESCO's tentative list, plus India's prettiest music festival each September.",
    nongkhnum: "Asia's second-largest river island and almost nobody goes — sandy river beaches and two big falls.",
    kongthong: "Every resident has a tune instead of a name. Mothers compose a melody for each child, sung across the valley.",
    mawlyngbna: "",
  };
  return map[p.id] ?? `Only a ${p.crowd <= 1 ? "handful" : "few"} of travellers make it to ${p.region} — crowd level ${p.crowd}/5.`;
}

function swapFor(p: Place): Place | undefined {
  const map: Record<string, string> = {
    kaziranga: "manas",
    tawang: "dirang",
    sohra: "mawphanlur",
    dawki: "nongkhnum",
    lachung: "pelling",
    dzukou: "mokokchung",
  };
  const id = map[p.id];
  return id ? PLACE_BY_ID[id] : PLACES.find((x) => x.st === p.st && x.id !== p.id);
}

function seasonLine(months: number[]) {
  const note =
    SEASON_NOTES.find((s) => months.every((m) => s.months.includes(m))) ??
    SEASON_NOTES.find((s) => months.some((m) => s.months.includes(m)));
  return note ? `${note.title} — ${note.body}` : "Mixed season across your dates — expect real variation between the Brahmaputra plains and the high passes.";
}

function greenScoreFor(ordered: Place[], legs: Leg[], input: PlannerInput) {
  const gemShare = ordered.filter((p) => p.gem).length / Math.max(1, ordered.length);
  const shared = input.tier === "budget" ? 1 : input.tier === "mid" ? 0.55 : 0.2;
  const homestay = input.tier === "budget" ? 1 : input.tier === "mid" ? 0.7 : 0.35;
  const localSpend = ordered.reduce((s, p) => s + (p.crowd <= 2 ? 1 : 0.4), 0) / Math.max(1, ordered.length);
  const km = legs.reduce((s, l) => s + l.km, 0);
  const efficiency = clamp(1 - km / 2200, 0.1, 1);
  return Math.round(clamp((gemShare * 0.25 + shared * 0.25 + homestay * 0.2 + localSpend * 0.15 + efficiency * 0.15) * 100, 28, 98));
}

export function defaultInput(): PlannerInput {
  return {
    months: [11],
    days: 8,
    interests: ["nature", "culture", "offbeat"],
    tier: "mid",
    pace: "balanced",
    traveller: "friends",
    people: 2,
    nationality: "indian",
    states: [],
  };
}
