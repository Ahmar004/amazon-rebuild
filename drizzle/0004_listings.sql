CREATE TYPE "public"."listing_status" AS ENUM('active', 'paused', 'removed');--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "seller_id" uuid;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "status" "listing_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "products_seller_idx" ON "products" USING btree ("seller_id") WHERE "products"."seller_id" is not null;