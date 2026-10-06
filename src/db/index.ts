import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

type Db = NodePgDatabase;

const globalForDb = globalThis as typeof globalThis & {
  __appDbPool?: Pool;
  __appDb?: Db;
};

function requireDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    // Thrown lazily (on first query) rather than at import time, so a missing
    // DATABASE_URL during `next build` / static page-data collection does not
    // fail the deployment.
    throw new Error(
      "DATABASE_URL is not set. Add a Postgres connection string to your environment (Vercel → Project → Settings → Environment Variables) and redeploy.",
    );
  }
  return databaseUrl;
}

export function getPool(): Pool {
  if (globalForDb.__appDbPool) return globalForDb.__appDbPool;

  const pool = new Pool({
    connectionString: requireDatabaseUrl(),
    // Serverless runtimes are short-lived: keep the pool small and fail fast
    // instead of hanging until the function times out.
    max: Number(process.env.PGPOOL_MAX ?? 3),
    connectionTimeoutMillis: Number(process.env.PG_CONNECTION_TIMEOUT_MS ?? 10_000),
    idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS ?? 10_000),
    ssl: process.env.PGSSLMODE === "disable" ? undefined : { rejectUnauthorized: false },
  });

  pool.on("error", (error) => {
    console.error("idle postgres client error", error);
  });

  globalForDb.__appDbPool = pool;
  return pool;
}

export function getDb(): Db {
  if (globalForDb.__appDb) return globalForDb.__appDb;
  globalForDb.__appDb = drizzle(getPool());
  return globalForDb.__appDb;
}

/**
 * Lazy proxy: importing `db` is side-effect free (safe at build time), while
 * every actual query goes through `getDb()` and surfaces a clear error if
 * DATABASE_URL is missing or the database is unreachable.
 */
export const db: Db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    const value = Reflect.get(getDb(), prop, receiver);
    return typeof value === "function" ? value.bind(getDb()) : value;
  },
});

export const pool = new Proxy({} as Pool, {
  get(_target, prop, receiver) {
    const value = Reflect.get(getPool(), prop, receiver);
    return typeof value === "function" ? value.bind(getPool()) : value;
  },
});
