// One-off, re-runnable: removes the source marketplace's name from catalogue text already in the
// database (frontend-rebuild.md point 1). New seeds apply the same functions (scripts/seed.ts).
// Usage: npx tsx scripts/scrub-store-name.ts
import { config } from "dotenv";

config({ path: ".env.local" });

async function main() {
  const { db } = await import("../lib/db/client");
  const { sql } = await import("drizzle-orm");
  const { scrubDetails, scrubName, scrubProse } = await import("../lib/catalogue/store-name");

  const products = await db.execute<{
    asin: string;
    title: string;
    brand: string;
    category_path: string[];
    features: string[];
    description: string;
    details: Record<string, string>;
  }>(sql`
    select asin, title, brand, category_path, features, description, details from products
    where title ilike '%amazon%' or brand ilike '%amazon%' or description ilike '%amazon%'
      or array_to_string(category_path, ' ') ilike '%amazon%' or array_to_string(features, ' ') ilike '%amazon%'
      or details::text ilike '%amazon%'`);

  // Each array element is bound as its own parameter.
  const textArray = (items: string[]) =>
    items.length ? sql`array[${sql.join(items.map((item) => sql`${item}`), sql`, `)}]::text[]` : sql`'{}'::text[]`;

  for (const p of products.rows) {
    await db.execute(sql`
      update products set
        title = ${scrubName(p.title)},
        brand = ${scrubName(p.brand)},
        category_path = ${textArray(p.category_path.map(scrubName))},
        features = ${textArray(p.features.map(scrubProse))},
        description = ${scrubProse(p.description)},
        details = ${JSON.stringify(scrubDetails(p.details))}::jsonb
      where asin = ${p.asin}`);
  }

  const reviews = await db.execute<{ id: number; title: string; body: string }>(
    sql`select id, title, body from reviews where title ilike '%amazon%' or body ilike '%amazon%'`,
  );
  for (const r of reviews.rows) {
    await db.execute(sql`update reviews set title = ${scrubProse(r.title)}, body = ${scrubProse(r.body)} where id = ${r.id}`);
  }

  console.log(`scrubbed ${products.rows.length} products and ${reviews.rows.length} reviews`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
