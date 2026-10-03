import { defineConfig } from "vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: "showcase",
  appType: "spa",
  resolve: {
    alias: {
      "pipe_x/dev": resolve(rootDir, "packages/pipe_x/src/dev.ts"),
      pipe_x: resolve(rootDir, "packages/pipe_x/src/index.ts"),
    },
  },
  build: {
    outDir: resolve(rootDir, "dist-showcase"),
    emptyOutDir: true,
  },
});
