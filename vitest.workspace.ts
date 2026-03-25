import { defineWorkspace } from "vitest/config"

export default defineWorkspace([
  "apps/web/vitest.config.ts",
  "apps/api/vitest.config.ts",
  "apps/scraper/vitest.config.ts",
  "apps/notifier/vitest.config.ts",
])
