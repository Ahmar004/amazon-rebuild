// Loads data/catalogue.json.gz (written by npm run catalogue:import) into the database named by DATABASE_URL (from .env.local).
// Refuses to run on a database that already has products unless --reset is passed,
// so it can never wipe live user data by accident. Run: npm run db:seed [-- --reset]
import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";

config({ path: ".env.local" });

type Catalogue = {
  categories: { slug: string; name: string; sortOrder: number }[];
  products: import("./import-catalogue").CatalogueProduct[];
  reviews: import("./import-catalogue").CatalogueReview[];
};

const REVIEW_AUTHOR = "Verified Customer"; // the dataset has no reviewer names

function chunks<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

async function main() {
  // Imported after dotenv so the client sees DATABASE_URL.
  const { db } = await import("../lib/db/client");
  const { categories, products, reviews } = await import("../lib/db/schema");
  const { histogramFromAverage } = await import("../lib/reviews/histogram");
  // The dataset names the marketplace it came from; Shopeedo never shows that name.
  const { scrubDetails, scrubName, scrubProse } = await import("../lib/catalogue/store-name");
  const { count, sql } = await import("drizzle-orm");

  const catalogue: Catalogue = JSON.parse(gunzipSync(readFileSync("data/catalogue.json.gz")).toString("utf8"));
  const [{ value: existing }] = await db.select({ value: count() }).from(products);
  if (existing > 0 && !process.argv.includes("--reset")) {
    console.log(`database already has ${existing} products; pass --reset to reload the catalogue`);
    return;
  }
  if (existing > 0) {
    await db.execute(sql`truncate reviews, review_votes, cart_items, list_items, browsing_history, order_items, products, categories restart identity cascade`);
  }

  const inserted = await db.insert(categories).values(catalogue.categories).returning({ id: categories.id, slug: categories.slug });
  const categoryId = new Map(inserted.map((d) => [d.slug, d.id]));

  let done = 0;
  for (const batch of chunks(catalogue.products, 100)) {
    await db.insert(products).values(
      batch.map((p) => ({
        asin: p.asin,
        title: scrubName(p.title),
        brand: scrubName(p.brand),
        categoryId: categoryId.get(p.categorySlug)!,
        categoryPath: p.categoryPath.map(scrubName),
        priceCents: p.priceCents,
        listPriceCents: p.listPriceCents,
        ratingCounts: histogramFromAverage(p.averageRating, p.ratingCount),
        stock: p.stock,
        isBestSeller: p.isBestSeller,
        features: p.features.map(scrubProse),
        description: scrubProse(p.description),
        details: scrubDetails(p.details),
        images: p.images,
        importedRank: p.importedRank,
      })),
    );
    done += batch.length;
    if (done % 2000 === 0) console.log(`  products: ${done}/${catalogue.products.length}`);
  }

  for (const batch of chunks(catalogue.reviews, 200)) {
    await db.insert(reviews).values(
      batch.map((r) => ({
        asin: r.asin,
        authorName: REVIEW_AUTHOR,
        rating: r.rating,
        title: scrubProse(r.title),
        body: scrubProse(r.body),
        verified: r.verified,
        helpfulCount: r.helpfulCount,
        source: "dataset" as const,
        createdAt: new Date(r.createdAt),
      })),
    );
  }

  console.log(`seeded ${catalogue.categories.length} categories, ${catalogue.products.length} products, ${catalogue.reviews.length} reviews`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
