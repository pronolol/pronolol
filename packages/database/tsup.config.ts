import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["index.ts"],
  format: ["esm"],
  platform: "node",
  external: ["@prisma/client", "@prisma/adapter-pg", "pg"],
  clean: true,
  dts: true,
})
