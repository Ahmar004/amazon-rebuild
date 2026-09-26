-- "Category" replaces "department" everywhere (user decision, 2026-09-26). Renames keep every row,
-- id and foreign key; the constraint, index and sequence names follow so nothing says department.
ALTER TABLE "departments" RENAME TO "categories";--> statement-breakpoint
ALTER TABLE "products" RENAME COLUMN "department_id" TO "category_id";--> statement-breakpoint
ALTER SEQUENCE "departments_id_seq" RENAME TO "categories_id_seq";--> statement-breakpoint
ALTER TABLE "categories" RENAME CONSTRAINT "departments_pkey" TO "categories_pkey";--> statement-breakpoint
ALTER TABLE "categories" RENAME CONSTRAINT "departments_slug_unique" TO "categories_slug_unique";--> statement-breakpoint
ALTER TABLE "categories" RENAME CONSTRAINT "departments_id_not_null" TO "categories_id_not_null";--> statement-breakpoint
ALTER TABLE "categories" RENAME CONSTRAINT "departments_slug_not_null" TO "categories_slug_not_null";--> statement-breakpoint
ALTER TABLE "categories" RENAME CONSTRAINT "departments_name_not_null" TO "categories_name_not_null";--> statement-breakpoint
ALTER TABLE "categories" RENAME CONSTRAINT "departments_sort_order_not_null" TO "categories_sort_order_not_null";--> statement-breakpoint
ALTER TABLE "products" RENAME CONSTRAINT "products_department_id_not_null" TO "products_category_id_not_null";--> statement-breakpoint
ALTER TABLE "products" RENAME CONSTRAINT "products_department_id_departments_id_fk" TO "products_category_id_categories_id_fk";--> statement-breakpoint
ALTER INDEX "products_department_idx" RENAME TO "products_category_idx";
