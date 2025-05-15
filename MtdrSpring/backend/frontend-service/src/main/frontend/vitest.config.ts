import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    testTimeout: 10000,
    hookTimeout: 10000,
    cache: {
      dir: "./node_modules/.vitest",
    },
    pool: "threads",
    poolOptions: {
      threads: {
        minThreads: 1,
        maxThreads: 2,
        singleThread: true,
      },
    },
    coverage: {
      exclude: [
        "node_modules/**",
        "dist/**",
        "**/*.d.ts",
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.spec.ts",
        "**/*.spec.tsx",
        "src/test/**",
      ],
    },
    maxWorkers: 1,
    maxConcurrency: 1,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
