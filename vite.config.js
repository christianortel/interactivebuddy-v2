import { cpSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  plugins: [copyOfflineRuntimeAssets()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: false
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: false
  },
  build: {
    target: "es2022",
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        // Parity build only. The legacy Buddy Lab app (legacy.html) is kept in
        // the tree as behavior reference during the rewrite but is no longer
        // built or shipped (GAP-02 disposition).
        main: resolve(process.cwd(), "index.html")
      }
    }
  }
});

function copyOfflineRuntimeAssets() {
  return {
    name: "copy-offline-runtime-assets",
    closeBundle() {
      const root = process.cwd();
      const dist = resolve(root, "dist");
      for (const folder of ["assets/packs", "assets/private", "vendor"]) {
        const source = resolve(root, folder);
        const target = resolve(dist, folder);
        if (existsSync(source)) {
          cpSync(source, target, { recursive: true });
        }
      }
    }
  };
}
