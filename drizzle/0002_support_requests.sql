CREATE TYPE "public"."support_status" AS ENUM('open', 'closed');--> statement-breakpoint
CREATE TYPE "public"."support_topic" AS ENUM('order', 'delivery', 'return', 'payment', 'account', 'other');--> statement-breakpoint
CREATE TABLE "support_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"order_id" text,
	"topic" "support_topic" NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"status" "support_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "support_requests" ADD CONSTRAINT "support_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_requests" ADD CONSTRAINT "support_requests_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "support_requests_user_created_idx" ON "support_requests" USING btree ("user_id","created_at");