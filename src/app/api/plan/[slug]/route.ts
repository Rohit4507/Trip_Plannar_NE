import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { itineraries } from "@/db/schema";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const rows = await db.select().from(itineraries).where(eq(itineraries.slug, slug)).limit(1);
    if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ plan: rows[0].plan, views: rows[0].views, createdAt: rows[0].createdAt });
  } catch (error) {
    console.error("fetch plan failed", error);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}

export async function PATCH(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const rows = await db
      .update(itineraries)
      .set({ likes: sql`${itineraries.likes} + 1` })
      .where(eq(itineraries.slug, slug))
      .returning({ likes: itineraries.likes });
    if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ likes: rows[0].likes });
  } catch (error) {
    console.error("like failed", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
