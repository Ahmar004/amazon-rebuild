import { neon, Pool } from "@neondatabase/serverless";
import { drizzle as drizzleHttp } from "drizzle-orm/neon-http";
import { drizzle as drizzlePool } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

function databaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return url;
}

// HTTP driver: one round trip per query and no open connection, which suits short-lived functions.
export const db = drizzleHttp({ client: neon(databaseUrl()), schema, casing: "snake_case" });

type PoolDb = ReturnType<typeof drizzlePool<typeof schema>>;
export type Tx = Parameters<Parameters<PoolDb["transaction"]>[0]>[0];

// The HTTP driver cannot run interactive transactions, so writes that must succeed or fail
// together (checkout, cancel) open a short-lived WebSocket pool for the transaction only.
export async function withTransaction<T>(work: (tx: Tx) => Promise<T>): Promise<T> {
  const pool = new Pool({ connectionString: databaseUrl() });
  try {
    return await drizzlePool({ client: pool, schema, casing: "snake_case" }).transaction(work);
  } finally {
    await pool.end();
  }
}
