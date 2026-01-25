import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["index.ts"],
  clean: true,
  format: ["esm"],
  platform: "node",
  external: ["@prisma/client", "@prisma/adapter-pg", "pg"],
  sourcemap: false,
});
