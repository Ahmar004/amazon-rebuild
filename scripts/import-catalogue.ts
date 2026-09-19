// Builds data/catalogue.json from the "Amazon Reviews 2023" dataset (McAuley Lab, UCSD) on Hugging Face.
// The files are several GB each, so only the first slice of each department's metadata and review file
// is downloaded with an HTTP range request. Run: npm run catalogue:import
import { writeFileSync, mkdirSync } from "node:fs";

const BASE = "https://huggingface.co/datasets/McAuley-Lab/Amazon-Reviews-2023/resolve/main/raw";
const META_BYTES = 20_000_000;
const REVIEW_BYTES = 40_000_000;
const PRODUCTS_PER_DEPARTMENT = 60;
const REVIEWS_PER_PRODUCT = 8;

type DepartmentSource = { slug: string; name: string; file: string; pick?: (m: Meta) => boolean };

const isComputer = (m: Meta) => (m.categories ?? []).includes("Computers & Accessories");

// Order matches the "All Departments" dropdown on amazon.com (alphabetical).
const DEPARTMENTS: DepartmentSource[] = [
  { slug: "baby", name: "Baby", file: "Baby_Products" },
  { slug: "beauty", name: "Beauty & Personal Care", file: "Beauty_and_Personal_Care" },
  { slug: "books", name: "Books", file: "Books" },
  { slug: "fashion", name: "Clothing, Shoes & Jewelry", file: "Clothing_Shoes_and_Jewelry" },
  { slug: "computers", name: "Computers", file: "Electronics", pick: isComputer },
  { slug: "electronics", name: "Electronics", file: "Electronics", pick: (m) => !isComputer(m) },
  { slug: "home-kitchen", name: "Home & Kitchen", file: "Home_and_Kitchen" },
  { slug: "pets", name: "Pet Supplies", file: "Pet_Supplies" },
  { slug: "sports", name: "Sports & Outdoors", file: "Sports_and_Outdoors" },
  { slug: "tools", name: "Tools & Home Improvement", file: "Tools_and_Home_Improvement" },
  { slug: "toys", name: "Toys & Games", file: "Toys_and_Games" },
  { slug: "video-games", name: "Video Games", file: "Video_Games" },
];

type Meta = {
  parent_asin: string;
  title?: string;
  store?: string | null;
  price?: number | string | null;
  average_rating?: number;
  rating_number?: number;
  features?: string[];
  description?: string[];
  categories?: string[];
  details?: Record<string, unknown>;
  images?: { thumb?: string; large?: string; hi_res?: string | null; variant?: string }[];
  author?: { name?: string } | null;
};

type Review = {
  parent_asin: string;
  rating: number;
  title: string;
  text: string;
  timestamp: number;
  helpful_vote: number;
  verified_purchase: boolean;
};

export type CatalogueProduct = {
  asin: string;
  departmentSlug: string;
  title: string;
  brand: string;
  categoryPath: string[];
  priceCents: number;
  listPriceCents: number | null;
  averageRating: number;
  ratingCount: number;
  stock: number;
  isBestSeller: boolean;
  features: string[];
  description: string;
  details: Record<string, string>;
  images: { thumb: string; large: string; hiRes: string | null }[];
  importedRank: number;
};

export type CatalogueReview = {
  asin: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
  helpfulCount: number;
  createdAt: string;
};

// Small stable hash so derived fields (stock, list price) are the same on every run.
function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

async function fetchLines<T>(file: string, bytes: number): Promise<T[]> {
  const res = await fetch(`${BASE}/${file}`, { headers: { Range: `bytes=0-${bytes - 1}` } });
  if (res.status !== 206 && res.status !== 200) throw new Error(`${file}: HTTP ${res.status}`);
  const lines = (await res.text()).split("\n");
  lines.pop(); // the last line is cut off by the byte range
  return lines.flatMap((line) => {
    try {
      return [JSON.parse(line) as T];
    } catch {
      return [];
    }
  });
}

const SKIPPED_DETAILS = new Set(["Best Sellers Rank", "Customer Reviews", "Date First Available"]);

function toProduct(m: Meta, departmentSlug: string, rank: number): CatalogueProduct | null {
  const price = typeof m.price === "number" ? m.price : Number(m.price);
  const images = (m.images ?? [])
    .filter((i) => i.large)
    // Book records carry only the "large" size; the thumbnail then reuses it.
    .map((i) => ({ thumb: i.thumb ?? i.large!, large: i.large!, hiRes: i.hi_res ?? null }));
  const title = (m.title ?? "").trim();
  if (!Number.isFinite(price) || price <= 0 || price > 3000) return null;
  if (images.length === 0 || title.length < 10 || title.length > 250) return null;
  if (!m.average_rating || !m.rating_number || m.rating_number < 20) return null;

  const details: Record<string, string> = {};
  for (const [key, value] of Object.entries(m.details ?? {})) {
    if (!SKIPPED_DETAILS.has(key) && (typeof value === "string" || typeof value === "number")) details[key] = String(value);
  }
  const h = hash(m.parent_asin);
  const priceCents = Math.round(price * 100);
  return {
    asin: m.parent_asin,
    departmentSlug,
    title,
    // Books have an author instead of a brand; Amazon shows the author in the same place.
    brand: (m.author?.name || m.store || details.Brand || "Generic").trim(),
    categoryPath: m.categories ?? [],
    priceCents,
    // About a third of products get a higher list price, which makes them deals (tech-stack section 6).
    listPriceCents: h % 3 === 0 ? Math.round(priceCents * (1.1 + (h % 31) / 100)) : null,
    averageRating: m.average_rating,
    ratingCount: m.rating_number,
    stock: 3 + (h % 58),
    isBestSeller: false,
    features: (m.features ?? []).filter((f) => typeof f === "string" && f.trim()).slice(0, 10),
    description: (m.description ?? []).filter((d) => typeof d === "string").join("\n\n"),
    details,
    images: images.slice(0, 8),
    importedRank: rank,
  };
}

function toReview(r: Review): CatalogueReview | null {
  const body = (r.text ?? "").replace(/<br\s*\/?>/gi, "\n").trim();
  if (body.length < 20 || body.length > 3000 || !(r.rating >= 1 && r.rating <= 5)) return null;
  return {
    asin: r.parent_asin,
    rating: Math.round(r.rating),
    title: (r.title ?? "").trim().slice(0, 200) || "Review",
    body,
    verified: Boolean(r.verified_purchase),
    helpfulCount: r.helpful_vote ?? 0,
    createdAt: new Date(r.timestamp).toISOString(),
  };
}

async function main() {
  const products: CatalogueProduct[] = [];
  const reviews: CatalogueReview[] = [];
  const cache = new Map<string, { metas: Meta[]; reviews: Review[] }>();

  for (const dept of DEPARTMENTS) {
    if (!cache.has(dept.file)) {
      console.log(`downloading ${dept.file} ...`);
      const [metas, revs] = await Promise.all([
        fetchLines<Meta>(`meta_categories/meta_${dept.file}.jsonl`, META_BYTES),
        fetchLines<Review>(`review_categories/${dept.file}.jsonl`, REVIEW_BYTES),
      ]);
      cache.set(dept.file, { metas, reviews: revs });
    }
    const source = cache.get(dept.file)!;
    const taken = new Set(products.map((p) => p.asin));
    const candidates = source.metas
      .filter((m) => !taken.has(m.parent_asin) && (!dept.pick || dept.pick(m)))
      .map((m, i) => toProduct(m, dept.slug, i))
      .filter((p): p is CatalogueProduct => p !== null);

    const reviewsByAsin = new Map<string, CatalogueReview[]>();
    const wanted = new Set(candidates.map((p) => p.asin));
    for (const r of source.reviews) {
      if (!wanted.has(r.parent_asin)) continue;
      const review = toReview(r);
      if (!review) continue;
      const list = reviewsByAsin.get(r.parent_asin) ?? [];
      if (list.length < REVIEWS_PER_PRODUCT) list.push(review);
      reviewsByAsin.set(r.parent_asin, list);
    }

    // Prefer products with real reviews, then the most-rated ones.
    const chosen = candidates
      .sort((a, b) => (reviewsByAsin.get(b.asin)?.length ?? 0) - (reviewsByAsin.get(a.asin)?.length ?? 0) || b.ratingCount - a.ratingCount)
      .slice(0, PRODUCTS_PER_DEPARTMENT);
    const bestSellers = new Set([...chosen].sort((a, b) => b.ratingCount - a.ratingCount).slice(0, 5).map((p) => p.asin));
    for (const p of chosen) {
      products.push({ ...p, isBestSeller: bestSellers.has(p.asin) });
      reviews.push(...(reviewsByAsin.get(p.asin) ?? []));
    }
    const withReviews = chosen.filter((p) => reviewsByAsin.has(p.asin)).length;
    console.log(`  ${dept.name}: ${chosen.length} products (${withReviews} with reviews) from ${candidates.length} usable`);
  }

  mkdirSync("data", { recursive: true });
  const departments = DEPARTMENTS.map((d, i) => ({ slug: d.slug, name: d.name, sortOrder: i }));
  writeFileSync("data/catalogue.json", JSON.stringify({ source: "McAuley-Lab/Amazon-Reviews-2023", departments, products, reviews }));
  console.log(`wrote data/catalogue.json: ${products.length} products, ${reviews.length} reviews`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
