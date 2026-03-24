import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    environmentOptions: {
      jsdom: {
        storage: "memory",
      },
    },
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
    exclude: ["**/node_modules/**", "**/dist/**", "e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["lcov", "text"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/test/**", "src/api/**", "**/*.d.ts"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
