// Verifies every home-page tile href returns at least one product from our catalogue, using
// the same search shape planned for Slice 3 (search_vector @@ websearch_to_tsquery('english', k),
// filtered by department). Run: npx tsx scripts/check-home-links.ts
import { config } from "dotenv";

config({ path: ".env.local" });

async function main() {
  const { db } = await import("../lib/db/client");
  const { departments, products } = await import("../lib/db/schema");
  const { heroSlides, homeCards } = await import("../lib/content/home");
  const { sql, eq, and } = await import("drizzle-orm");

  const depts = await db.select({ id: departments.id, slug: departments.slug }).from(departments);
  const deptIdBySlug = new Map(depts.map((d) => [d.slug, d.id]));

  type Href = { href: string; from: string };
  const hrefs: Href[] = [];
  for (const slide of heroSlides) hrefs.push({ href: slide.href, from: `hero:${slide.alt}` });
  for (const card of homeCards) {
    hrefs.push({ href: card.href, from: `card-title:${card.title}` });
    for (const tile of card.tiles ?? []) {
      hrefs.push({ href: tile.href, from: `card:${card.title} > tile:${tile.label}` });
    }
  }

  let failures = 0;
  for (const { href, from } of hrefs) {
    const query = href.split("?")[1] ?? "";
    const params = new URLSearchParams(query);
    const k = params.get("k");
    const i = params.get("i");
    if (!i) {
      console.log(`NO DEPARTMENT: ${href} (${from})`);
      failures++;
      continue;
    }
    const departmentId = deptIdBySlug.get(i);
    if (departmentId === undefined) {
      console.log(`UNKNOWN DEPARTMENT "${i}": ${href} (${from})`);
      failures++;
      continue;
    }
    const conditions = [eq(products.departmentId, departmentId)];
    if (k) {
      conditions.push(sql`${products.searchVector} @@ websearch_to_tsquery('english', ${k})`);
    }
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(and(...conditions));
    if (count === 0) {
      console.log(`0 RESULTS: ${href} (${from})`);
      failures++;
    }
  }

  console.log(`\nChecked ${hrefs.length} hrefs, ${failures} failing.`);
  if (failures > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
