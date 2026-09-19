// Loads data/catalogue.json into the database named by DATABASE_URL (from .env.local).
// Refuses to run on a database that already has products unless --reset is passed,
// so it can never wipe live user data by accident. Run: npm run db:seed [-- --reset]
import { config } from "dotenv";
import { readFileSync } from "node:fs";

config({ path: ".env.local" });

type Catalogue = {
  departments: { slug: string; name: string; sortOrder: number }[];
  products: import("./import-catalogue").CatalogueProduct[];
  reviews: import("./import-catalogue").CatalogueReview[];
};

const REVIEW_AUTHOR = "Amazon Customer"; // the dataset has no reviewer names; this is Amazon's own default

function chunks<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

async function main() {
  // Imported after dotenv so the client sees DATABASE_URL.
  const { db } = await import("../lib/db/client");
  const { departments, products, reviews } = await import("../lib/db/schema");
  const { histogramFromAverage } = await import("../lib/reviews/histogram");
  const { count, sql } = await import("drizzle-orm");

  const catalogue: Catalogue = JSON.parse(readFileSync("data/catalogue.json", "utf8"));
  const [{ value: existing }] = await db.select({ value: count() }).from(products);
  if (existing > 0 && !process.argv.includes("--reset")) {
    console.log(`database already has ${existing} products; pass --reset to reload the catalogue`);
    return;
  }
  if (existing > 0) {
    await db.execute(sql`truncate reviews, review_votes, cart_items, list_items, browsing_history, order_items, products, departments restart identity cascade`);
  }

  const inserted = await db.insert(departments).values(catalogue.departments).returning({ id: departments.id, slug: departments.slug });
  const departmentId = new Map(inserted.map((d) => [d.slug, d.id]));

  for (const batch of chunks(catalogue.products, 100)) {
    await db.insert(products).values(
      batch.map((p) => ({
        asin: p.asin,
        title: p.title,
        brand: p.brand,
        departmentId: departmentId.get(p.departmentSlug)!,
        categoryPath: p.categoryPath,
        priceCents: p.priceCents,
        listPriceCents: p.listPriceCents,
        ratingCounts: histogramFromAverage(p.averageRating, p.ratingCount),
        stock: p.stock,
        isBestSeller: p.isBestSeller,
        features: p.features,
        description: p.description,
        details: p.details,
        images: p.images,
        importedRank: p.importedRank,
      })),
    );
  }

  for (const batch of chunks(catalogue.reviews, 200)) {
    await db.insert(reviews).values(
      batch.map((r) => ({
        asin: r.asin,
        authorName: REVIEW_AUTHOR,
        rating: r.rating,
        title: r.title,
        body: r.body,
        verified: r.verified,
        helpfulCount: r.helpfulCount,
        source: "dataset" as const,
        createdAt: new Date(r.createdAt),
      })),
    );
  }

  console.log(`seeded ${catalogue.departments.length} departments, ${catalogue.products.length} products, ${catalogue.reviews.length} reviews`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
