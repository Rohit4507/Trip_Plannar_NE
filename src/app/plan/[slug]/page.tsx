import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { itineraries } from "@/db/schema";
import { ItineraryView } from "@/components/itinerary-view";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import type { Itinerary } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getPlan(slug: string): Promise<Itinerary | null> {
  try {
    const rows = await db.select().from(itineraries).where(eq(itineraries.slug, slug)).limit(1);
    const row = rows[0];
    if (!row) return null;
    void db
      .update(itineraries)
      .set({ views: sql`${itineraries.views} + 1` })
      .where(eq(itineraries.slug, slug))
      .catch(() => undefined);
    return row.plan;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const plan = await getPlan(slug);
  if (!plan) return { title: "Itinerary not found" };
  return {
    title: plan.title,
    description: plan.summary,
    openGraph: { title: plan.title, description: plan.summary },
  };
}

export default async function PlanPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const plan = await getPlan(slug);
  if (!plan) notFound();

  return (
    <>
      <SiteNav />
      <main className="min-h-screen">
        <ItineraryView plan={plan} />
      </main>
      <SiteFooter />
    </>
  );
}
