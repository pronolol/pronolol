import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  clean: true,
  format: ["esm"],
  platform: "node",
  minify: true,
  external: ["playwright", "@prisma/client", "@pronolol/database"],
  sourcemap: false,
})
