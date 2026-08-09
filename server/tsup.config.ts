import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/db/migrate.ts"],
  outDir: "dist",
  format: ["esm"],
  target: "node22",
  platform: "node",
  sourcemap: true,
  clean: true,
  splitting: false,
  bundle: true,
  skipNodeModulesBundle: true,
});
