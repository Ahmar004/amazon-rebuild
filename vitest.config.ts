import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./", import.meta.url)) } },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
    // lib/db/client.ts reads DATABASE_URL at import time; unit tests that only exercise pure
    // query-builder logic (e.g. tests/unit/data/search-query.test.ts) never open a connection,
    // so a placeholder is enough to let the module load without a real database.
    env: { DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://user:pass@localhost:5432/db" },
  },
});
