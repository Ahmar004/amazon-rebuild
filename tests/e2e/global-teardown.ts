import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { del } from "@vercel/blob";
import { E2E_EMAIL_DOMAIN, E2E_EMAIL_PREFIX } from "./support";

// Removes every account the suite registered, with their orders, listings and listing photos, so
// test runs never leave records in the shared store. Accounts are matched by the e2e email prefix.
export default async function globalTeardown() {
  config({ path: ".env.local", quiet: true });
  if (!process.env.DATABASE_URL) return;
  const sql = neon(process.env.DATABASE_URL);
  const pattern = `${E2E_EMAIL_PREFIX}%${E2E_EMAIL_DOMAIN}`;

  const listings = await sql`select asin, images from products where seller_id in (select id from users where email like ${pattern})`;
  const asins = listings.map((l) => l.asin as string);
  const photos = listings.flatMap((l) => (l.images as { large: string }[]).map((i) => i.large)).filter((u) => u.includes("blob.vercel-storage.com"));

  await sql`delete from orders where user_id in (select id from users where email like ${pattern})`;
  if (asins.length) {
    await sql`delete from orders where id in (select order_id from order_items where asin = any(${asins}))`;
    await sql`delete from reviews where asin = any(${asins})`;
    await sql`delete from cart_items where asin = any(${asins})`;
    await sql`delete from list_items where asin = any(${asins})`;
    await sql`delete from browsing_history where asin = any(${asins})`;
    await sql`delete from products where asin = any(${asins})`;
  }
  const removed = await sql`delete from users where email like ${pattern} returning id`;
  if (photos.length && process.env.BLOB_READ_WRITE_TOKEN) await del(photos).catch(() => undefined);
  console.log(`e2e teardown: removed ${removed.length} test accounts, ${asins.length} listings, ${photos.length} photos`);
}
