// Light load check (roadmap S7): fires concurrent signed-in requests at the main read paths and
// prints each route's status codes and p50/p95 latency. It signs in as a throwaway e2e- account
// created straight in the database, and deletes it at the end.
// Usage: npx tsx scripts/load-check.ts [baseUrl] [concurrency] [requestsPerRoute]
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { randomBytes } from "node:crypto";

config({ path: ".env.local", quiet: true });
const [base = "http://localhost:3000", concurrencyArg = "10", perRouteArg = "20"] = process.argv.slice(2);
const concurrency = Number(concurrencyArg);
const perRoute = Number(perRouteArg);
const sql = neon(process.env.DATABASE_URL!);

function percentile(sorted: number[], p: number) {
  return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
}

async function main() {
  const email = `e2e-load-${randomBytes(4).toString("hex")}@shopeedo.test`;
  const [user] = await sql`insert into users (email, name, password_hash) values (${email}, 'Load Check', 'x') returning id`;
  const session = randomBytes(32).toString("hex");
  await sql`insert into sessions (id, user_id, expires_at) values (${session}, ${user.id}, now() + interval '1 hour')`;
  const [product] = await sql`select asin from products where status = 'active' and seller_id is null order by imported_rank limit 1`;

  const routes = ["/", "/search?k=headphones", "/search?k=lamp&sort=price-asc", `/product/${product.asin}`, "/deals", "/cart", "/api/suggest?q=hea"];
  const jobs = routes.flatMap((route) => Array.from({ length: perRoute }, () => route));
  type RouteResult = { ms: number[]; statuses: Map<number, number> };
  const results = new Map<string, RouteResult>();
  const started = Date.now();

  async function worker() {
    for (let route = jobs.shift(); route; route = jobs.shift()) {
      const t = performance.now();
      const status = await fetch(base + route, { headers: { cookie: `session=${session}` }, redirect: "manual" })
        .then(async (r) => (await r.arrayBuffer(), r.status))
        .catch(() => 0);
      const entry: RouteResult = results.get(route) ?? { ms: [], statuses: new Map() };
      entry.ms.push(performance.now() - t);
      entry.statuses.set(status, (entry.statuses.get(status) ?? 0) + 1);
      results.set(route, entry);
    }
  }

  try {
    await Promise.all(Array.from({ length: concurrency }, worker));
  } finally {
    await sql`delete from users where id = ${user.id}`;
  }

  const seconds = (Date.now() - started) / 1000;
  console.log(`${routes.length * perRoute} requests, ${concurrency} at a time, against ${base} in ${seconds.toFixed(1)}s`);
  for (const [route, { ms, statuses }] of results) {
    const sorted = [...ms].sort((a, b) => a - b);
    const codes = [...statuses].map(([code, n]) => `${code}x${n}`).join(" ");
    console.log(`${route.padEnd(34)} ${codes.padEnd(10)} p50 ${percentile(sorted, 50).toFixed(0)} ms  p95 ${percentile(sorted, 95).toFixed(0)} ms`);
  }
}

main();
