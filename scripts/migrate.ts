// Applies drizzle/ migrations to DATABASE_URL. Used instead of `drizzle-kit migrate`, whose Neon
// WebSocket connection stalls on this setup; the same pool works fine through drizzle-orm's migrator.
// Run: npm run db:migrate
import { config } from "dotenv";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";

config({ path: ".env.local", quiet: true });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const pool = new Pool({ connectionString: url });
  try {
    await migrate(drizzle({ client: pool, casing: "snake_case" }), { migrationsFolder: "drizzle" });
    console.log("migrations applied");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
