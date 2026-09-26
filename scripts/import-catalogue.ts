// Builds data/catalogue.json.gz from the "Reviews 2023" product dataset (McAuley Lab, UCSD) on
// Hugging Face (frontend-rebuild.md C3: ~12k products across 24 departments). Each source file is
// several GB, so it is streamed and the download stops once enough usable products (price, image,
// 20+ ratings) are found or the byte cap is reached. Run: npm run catalogue:import
import { writeFileSync, mkdirSync } from "node:fs";
import { gzipSync } from "node:zlib";

// The dataset's public repository path; its name is fixed by the publisher.
const BASE = "https://huggingface.co/datasets/McAuley-Lab/Amazon-Reviews-2023/resolve/main/raw";
const PRODUCTS_PER_DEPARTMENT = 500;
const CANDIDATES_WANTED = PRODUCTS_PER_DEPARTMENT * 3;
const META_BYTE_CAP = 250_000_000;
const REVIEW_BYTE_CAP = 120_000_000;
const REVIEWS_PER_PRODUCT = 6;
const PARALLEL_FILES = 4;

type DepartmentSource = { slug: string; name: string; file: string; pick?: (m: Meta) => boolean };

const isComputer = (m: Meta) => (m.categories ?? []).includes("Computers & Accessories");

// Alphabetical, the order the department filter and the All menu list them in.
const DEPARTMENTS: DepartmentSource[] = [
  { slug: "appliances", name: "Appliances", file: "Appliances" },
  { slug: "arts-crafts", name: "Arts, Crafts & Sewing", file: "Arts_Crafts_and_Sewing" },
  { slug: "automotive", name: "Automotive", file: "Automotive" },
  { slug: "baby", name: "Baby", file: "Baby_Products" },
  { slug: "beauty", name: "Beauty & Personal Care", file: "Beauty_and_Personal_Care" },
  { slug: "books", name: "Books", file: "Books" },
  { slug: "cell-phones", name: "Cell Phones & Accessories", file: "Cell_Phones_and_Accessories" },
  { slug: "fashion", name: "Clothing, Shoes & Jewelry", file: "Clothing_Shoes_and_Jewelry" },
  { slug: "computers", name: "Computers", file: "Electronics", pick: isComputer },
  { slug: "electronics", name: "Electronics", file: "Electronics", pick: (m) => !isComputer(m) },
  { slug: "grocery", name: "Grocery & Gourmet Food", file: "Grocery_and_Gourmet_Food" },
  { slug: "handmade", name: "Handmade", file: "Handmade_Products" },
  { slug: "health", name: "Health & Household", file: "Health_and_Household" },
  { slug: "home-kitchen", name: "Home & Kitchen", file: "Home_and_Kitchen" },
  { slug: "industrial", name: "Industrial & Scientific", file: "Industrial_and_Scientific" },
  { slug: "movies-tv", name: "Movies & TV", file: "Movies_and_TV" },
  { slug: "musical-instruments", name: "Musical Instruments", file: "Musical_Instruments" },
  { slug: "office", name: "Office Products", file: "Office_Products" },
  { slug: "garden", name: "Patio, Lawn & Garden", file: "Patio_Lawn_and_Garden" },
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

// Streams a JSONL file line by line; `onLine` returns false to stop the download early.
async function streamLines(path: string, byteCap: number, onLine: (line: string) => boolean): Promise<void> {
  const controller = new AbortController();
  const res = await fetch(`${BASE}/${path}`, { headers: { Range: `bytes=0-${byteCap - 1}` }, signal: controller.signal });
  if (!res.ok || !res.body) throw new Error(`${path}: HTTP ${res.status}`);
  const decoder = new TextDecoder();
  let carry = "";
  try {
    for await (const chunk of res.body as unknown as AsyncIterable<Uint8Array>) {
      const lines = (carry + decoder.decode(chunk, { stream: true })).split("\n");
      carry = lines.pop() ?? ""; // the last piece may be cut off mid-line
      for (const line of lines) {
        if (line && !onLine(line)) {
          controller.abort();
          return;
        }
      }
    }
  } catch (error) {
    if (!controller.signal.aborted) throw error;
  }
}

function parse<T>(line: string): T | null {
  try {
    return JSON.parse(line) as T;
  } catch {
    return null;
  }
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
    // Books have an author instead of a brand, shown in the same place.
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

type FileData = { metas: Meta[]; reviews: Map<string, Review[]> };

// Reads one source file: metadata until every department drawing on it has enough candidates,
// then reviews for just those candidates.
async function loadFile(file: string, depts: DepartmentSource[]): Promise<FileData> {
  const metas: Meta[] = [];
  const counts = new Map(depts.map((d) => [d.slug, 0]));
  await streamLines(`meta_categories/meta_${file}.jsonl`, META_BYTE_CAP, (line) => {
    const m = parse<Meta>(line);
    if (!m || !toProduct(m, "", 0)) return true;
    metas.push(m);
    for (const d of depts) if (!d.pick || d.pick(m)) counts.set(d.slug, counts.get(d.slug)! + 1);
    return [...counts.values()].some((c) => c < CANDIDATES_WANTED);
  });

  const wanted = new Set(metas.map((m) => m.parent_asin));
  const reviews = new Map<string, Review[]>();
  await streamLines(`review_categories/${file}.jsonl`, REVIEW_BYTE_CAP, (line) => {
    const r = parse<Review>(line);
    if (!r || !wanted.has(r.parent_asin)) return true;
    const list = reviews.get(r.parent_asin) ?? [];
    if (list.length < REVIEWS_PER_PRODUCT * 2) list.push(r);
    reviews.set(r.parent_asin, list);
    return true;
  });
  console.log(`  ${file}: ${metas.length} usable products, reviews for ${reviews.size}`);
  return { metas, reviews };
}

async function main() {
  const files = [...new Set(DEPARTMENTS.map((d) => d.file))];
  const loaded = new Map<string, FileData>();
  for (let i = 0; i < files.length; i += PARALLEL_FILES) {
    const group = files.slice(i, i + PARALLEL_FILES);
    console.log(`downloading ${group.join(", ")} ...`);
    const results = await Promise.all(group.map((f) => loadFile(f, DEPARTMENTS.filter((d) => d.file === f))));
    group.forEach((f, j) => loaded.set(f, results[j]));
  }

  const products: CatalogueProduct[] = [];
  const reviews: CatalogueReview[] = [];
  const taken = new Set<string>();
  for (const dept of DEPARTMENTS) {
    const source = loaded.get(dept.file)!;
    const candidates = source.metas
      .filter((m) => !taken.has(m.parent_asin) && (!dept.pick || dept.pick(m)))
      .map((m, i) => toProduct(m, dept.slug, i))
      .filter((p): p is CatalogueProduct => p !== null);

    const reviewsByAsin = new Map<string, CatalogueReview[]>();
    for (const p of candidates) {
      const list = (source.reviews.get(p.asin) ?? [])
        .map(toReview)
        .filter((r): r is CatalogueReview => r !== null)
        .slice(0, REVIEWS_PER_PRODUCT);
      if (list.length > 0) reviewsByAsin.set(p.asin, list);
    }

    // Prefer products with real reviews, then the most-rated ones.
    const chosen = candidates
      .sort((a, b) => (reviewsByAsin.get(b.asin)?.length ?? 0) - (reviewsByAsin.get(a.asin)?.length ?? 0) || b.ratingCount - a.ratingCount)
      .slice(0, PRODUCTS_PER_DEPARTMENT);
    const bestSellers = new Set([...chosen].sort((a, b) => b.ratingCount - a.ratingCount).slice(0, 20).map((p) => p.asin));
    for (const p of chosen) {
      taken.add(p.asin);
      products.push({ ...p, isBestSeller: bestSellers.has(p.asin) });
      reviews.push(...(reviewsByAsin.get(p.asin) ?? []));
    }
    const withReviews = chosen.filter((p) => reviewsByAsin.has(p.asin)).length;
    console.log(`  ${dept.name}: ${chosen.length} products (${withReviews} with reviews) from ${candidates.length} usable`);
  }

  mkdirSync("data", { recursive: true });
  const departments = DEPARTMENTS.map((d, i) => ({ slug: d.slug, name: d.name, sortOrder: i }));
  const json = JSON.stringify({ source: "McAuley-Lab Reviews 2023", departments, products, reviews });
  writeFileSync("data/catalogue.json.gz", gzipSync(json));
  console.log(`wrote data/catalogue.json.gz: ${products.length} products, ${reviews.length} reviews`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
