import { defineConfig } from "vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: "demo",
  appType: "spa",
  build: {
    outDir: resolve(rootDir, "dist"),
    emptyOutDir: true,
  },
});
