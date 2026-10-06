import { NextResponse } from "next/server";
import { db } from "@/db";
import { itineraries } from "@/db/schema";
import { buildItinerary } from "@/lib/planner";
import type { Interest, Pace, PlannerInput, StateCode, Tier, Traveller } from "@/lib/types";
import { PLACES } from "@/lib/data/places";

const INTERESTS: Interest[] = ["nature", "culture", "adventure", "wildlife", "food", "festivals", "spiritual", "photography", "relax", "offbeat"];
const TIERS: Tier[] = ["budget", "mid", "comfort"];
const PACES: Pace[] = ["relaxed", "balanced", "packed"];
const TRAVELLERS: Traveller[] = ["solo", "couple", "friends", "family"];
const STATE_CODES: StateCode[] = ["AR", "AS", "ML", "MN", "MZ", "NL", "SK", "TR"];

function num(v: unknown, fallback: number, lo: number, hi: number) {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rawMonths = Array.isArray(body.months) ? body.months : [];
  const months = rawMonths
    .map((m) => num(m, 11, 1, 12))
    .filter((m, i, a) => a.indexOf(m) === i)
    .slice(0, 3);
  const rawInterests = Array.isArray(body.interests) ? body.interests : [];
  const interests = rawInterests.filter((t): t is Interest => INTERESTS.includes(t as Interest)).slice(0, 10);
  const rawStates = Array.isArray(body.states) ? body.states : [];
  const states = rawStates.filter((s): s is StateCode => STATE_CODES.includes(s as StateCode));

  const input: PlannerInput = {
    months: months.length ? months : [11],
    days: num(body.days, 8, 3, 21),
    interests: interests.length ? interests : ["nature", "culture"],
    tier: TIERS.includes(body.tier as Tier) ? (body.tier as Tier) : "mid",
    pace: PACES.includes(body.pace as Pace) ? (body.pace as Pace) : "balanced",
    traveller: TRAVELLERS.includes(body.traveller as Traveller) ? (body.traveller as Traveller) : "friends",
    people: num(body.people, 2, 1, 12),
    nationality: body.nationality === "foreign" ? "foreign" : "indian",
    states,
    budget: body.budget ? num(body.budget, 0, 0, 5_000_000) : undefined,
    start: typeof body.start === "string" && PLACES.some((p) => p.id === body.start) ? body.start : undefined,
    avoidPermits: Boolean(body.avoidPermits),
    seed: typeof body.seed === "string" ? body.seed : String(Date.now()),
  };

  let plan;
  try {
    plan = buildItinerary(input);
  } catch (error) {
    console.error("planner failed", error);
    return NextResponse.json({ error: "Could not build an itinerary for those constraints. Try widening your filters." }, { status: 422 });
  }

  try {
    await db
      .insert(itineraries)
      .values({
        slug: plan.slug,
        title: plan.title,
        summary: plan.summary,
        days: plan.days.length,
        states: Array.from(new Set(plan.places.map((p) => p.st))).join(","),
        perPerson: Math.round(plan.budget.perPerson),
        gateway: plan.gateway.name,
        input: plan.input,
        plan,
      })
      .onConflictDoNothing({ target: itineraries.slug });
  } catch (error) {
    console.error("persist failed", error);
  }

  return NextResponse.json({ slug: plan.slug, plan });
}
