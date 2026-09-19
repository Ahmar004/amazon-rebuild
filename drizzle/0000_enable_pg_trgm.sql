CREATE EXTENSION IF NOT EXISTS pg_trgm;
--> statement-breakpoint
-- array_to_string is only STABLE, and generated columns need IMMUTABLE expressions.
-- Joining a text[] with a fixed separator is deterministic, so this wrapper is safe to mark IMMUTABLE.
CREATE OR REPLACE FUNCTION immutable_array_to_string(text[], text) RETURNS text
  LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$ SELECT array_to_string($1, $2) $$;
