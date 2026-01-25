import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  clean: true,
  format: ["esm"],
  platform: "node",
  minify: true,
  noExternal: ["@pronolol/database"],
  external: ["playwright", "@prisma/client"],
  sourcemap: false,
});
