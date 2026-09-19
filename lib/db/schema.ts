import { sql } from "drizzle-orm";
import {
  boolean,
  customType,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const tsvector = customType<{ data: string }>({ dataType: () => "tsvector" });
const createdAt = () => timestamp({ withTimezone: true }).notNull().defaultNow();

export const deliverySpeedEnum = pgEnum("delivery_speed", ["standard", "fast"]);
export const reviewSourceEnum = pgEnum("review_source", ["dataset", "user"]);

export type ProductImage = { thumb: string; large: string; hiRes: string | null };
export type AddressSnapshot = {
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  zip: string;
};

export const users = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  email: text().notNull().unique(), // stored lowercased
  name: text().notNull(),
  passwordHash: text().notNull(),
  stripeCustomerId: text(),
  createdAt: createdAt(),
});

export const sessions = pgTable("sessions", {
  id: text().primaryKey(),
  userId: uuid()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
});

export const departments = pgTable("departments", {
  id: serial().primaryKey(),
  slug: text().notNull().unique(),
  name: text().notNull(),
  sortOrder: integer().notNull(),
});

export const products = pgTable(
  "products",
  {
    asin: text().primaryKey(),
    title: text().notNull(),
    brand: text().notNull(),
    departmentId: integer()
      .notNull()
      .references(() => departments.id),
    categoryPath: text().array().notNull(),
    priceCents: integer().notNull(),
    listPriceCents: integer(),
    // [1-star, 2-star, 3-star, 4-star, 5-star]. Seeded by lib/reviews/histogram from the dataset's
    // average and count, then incremented and decremented by user reviews.
    ratingCounts: integer().array().notNull(),
    ratingCount: integer().generatedAlwaysAs(
      sql`rating_counts[1] + rating_counts[2] + rating_counts[3] + rating_counts[4] + rating_counts[5]`,
    ),
    ratingAvg: numeric({ precision: 2, scale: 1, mode: "number" }).generatedAlwaysAs(
      sql`round(case when (rating_counts[1] + rating_counts[2] + rating_counts[3] + rating_counts[4] + rating_counts[5]) = 0 then 0 else (rating_counts[1] + 2 * rating_counts[2] + 3 * rating_counts[3] + 4 * rating_counts[4] + 5 * rating_counts[5])::numeric / (rating_counts[1] + rating_counts[2] + rating_counts[3] + rating_counts[4] + rating_counts[5]) end, 1)`,
    ),
    stock: integer().notNull(),
    isBestSeller: boolean().notNull().default(false),
    features: text().array().notNull(),
    description: text().notNull(),
    details: jsonb().$type<Record<string, string>>().notNull(),
    images: jsonb().$type<ProductImage[]>().notNull(),
    importedRank: integer().notNull(),
    searchVector: tsvector().generatedAlwaysAs(
      sql`setweight(to_tsvector('english', coalesce(title, '')), 'A') || setweight(to_tsvector('english', coalesce(brand, '')), 'B') || setweight(to_tsvector('english', array_to_string(features, ' ')), 'C')`,
    ),
  },
  (t) => [
    index("products_search_idx").using("gin", t.searchVector),
    index("products_title_trgm_idx").using("gin", sql`${t.title} gin_trgm_ops`),
    index("products_brand_trgm_idx").using("gin", sql`${t.brand} gin_trgm_ops`),
    index("products_department_idx").on(t.departmentId),
    index("products_price_idx").on(t.priceCents),
  ],
);

export const reviews = pgTable(
  "reviews",
  {
    id: serial().primaryKey(),
    asin: text()
      .notNull()
      .references(() => products.asin),
    userId: uuid().references(() => users.id, { onDelete: "cascade" }),
    authorName: text().notNull(),
    rating: integer().notNull(),
    title: text().notNull(),
    body: text().notNull(),
    verified: boolean().notNull().default(false),
    helpfulCount: integer().notNull().default(0),
    source: reviewSourceEnum().notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    index("reviews_asin_idx").on(t.asin),
    uniqueIndex("reviews_one_per_user_idx").on(t.asin, t.userId).where(sql`${t.userId} is not null`),
  ],
);

export const reviewVotes = pgTable(
  "review_votes",
  {
    reviewId: integer()
      .notNull()
      .references(() => reviews.id, { onDelete: "cascade" }),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.reviewId, t.userId] })],
);

export const carts = pgTable("carts", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  guestToken: text().unique(),
  updatedAt: createdAt(),
});

export const cartItems = pgTable(
  "cart_items",
  {
    cartId: uuid()
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    asin: text()
      .notNull()
      .references(() => products.asin),
    quantity: integer().notNull(),
    savedForLater: boolean().notNull().default(false),
    addedAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.cartId, t.asin] })],
);

export const addresses = pgTable(
  "addresses",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    fullName: text().notNull(),
    phone: text().notNull(),
    line1: text().notNull(),
    line2: text(),
    city: text().notNull(),
    state: text().notNull(),
    zip: text().notNull(),
    instructions: text(),
    isDefault: boolean().notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [index("addresses_user_idx").on(t.userId)],
);

export const paymentMethods = pgTable(
  "payment_methods",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    stripePaymentMethodId: text().notNull().unique(),
    brand: text().notNull(),
    last4: text().notNull(),
    expMonth: integer().notNull(),
    expYear: integer().notNull(),
    nameOnCard: text().notNull(),
    isDefault: boolean().notNull().default(false),
  },
  (t) => [index("payment_methods_user_idx").on(t.userId)],
);

export const orders = pgTable(
  "orders",
  {
    id: text().primaryKey(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    placedAt: createdAt(),
    speed: deliverySpeedEnum().notNull(),
    deliveryDate: date({ mode: "date" }).notNull(),
    address: jsonb().$type<AddressSnapshot>().notNull(),
    paymentBrand: text().notNull(),
    paymentLast4: text().notNull(),
    itemsCents: integer().notNull(),
    shippingCents: integer().notNull(),
    taxCents: integer().notNull(),
    totalCents: integer().notNull(),
    stripePaymentIntentId: text().notNull().unique(),
    cancelledAt: timestamp({ withTimezone: true }),
  },
  (t) => [index("orders_user_placed_idx").on(t.userId, t.placedAt)],
);

export const orderItems = pgTable(
  "order_items",
  {
    orderId: text()
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    asin: text()
      .notNull()
      .references(() => products.asin),
    title: text().notNull(),
    imageUrl: text().notNull(),
    unitPriceCents: integer().notNull(),
    quantity: integer().notNull(),
  },
  (t) => [primaryKey({ columns: [t.orderId, t.asin] })],
);

export const lists = pgTable(
  "lists",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text().notNull(),
    isDefault: boolean().notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [index("lists_user_idx").on(t.userId)],
);

export const listItems = pgTable(
  "list_items",
  {
    listId: uuid()
      .notNull()
      .references(() => lists.id, { onDelete: "cascade" }),
    asin: text()
      .notNull()
      .references(() => products.asin),
    priceAtAddCents: integer().notNull(),
    addedAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.listId, t.asin] })],
);

export const browsingHistory = pgTable(
  "browsing_history",
  {
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    asin: text()
      .notNull()
      .references(() => products.asin),
    viewedAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.asin] }), index("history_user_viewed_idx").on(t.userId, t.viewedAt)],
);
