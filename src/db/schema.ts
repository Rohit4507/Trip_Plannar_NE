import { integer, jsonb, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import type { Itinerary, PlannerInput } from "@/lib/types";

export const itineraries = pgTable("itineraries", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  days: integer("days").notNull(),
  states: text("states").notNull(),
  perPerson: integer("per_person").notNull(),
  gateway: text("gateway").notNull(),
  input: jsonb("input").$type<PlannerInput>().notNull(),
  plan: jsonb("plan").$type<Itinerary>().notNull(),
  likes: integer("likes").notNull().default(0),
  views: integer("views").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ItineraryRow = typeof itineraries;
