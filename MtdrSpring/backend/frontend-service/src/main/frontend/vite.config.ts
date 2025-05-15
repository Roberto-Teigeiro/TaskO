import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import type { UserConfig as ViteUserConfig } from "vite";
import type { InlineConfig as VitestInlineConfig } from "vitest";

interface CustomUserConfig extends ViteUserConfig {
  test?: VitestInlineConfig;
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: "automatic",
      jsxImportSource: "react",
      babel: {
        plugins: [["@babel/plugin-transform-runtime", { regenerator: true }]],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  },
} as CustomUserConfig);
