import type { Config } from "jest";
import { pathsToModuleNameMapper } from "ts-jest";
import { compilerOptions } from "./tsconfig.json";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/" }),
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/__mocks__/fileMock.js",
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@/components/ui/(.*)$": "<rootDir>/src/__mocks__/ui.tsx",
  },
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
      },
    ],
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(@clerk|@babel|@emotion|@mui|@radix-ui|@floating-ui|@hookform|@radix-ui|@tanstack|@testing-library|@types|@vitejs|axios|clsx|date-fns|framer-motion|lucide-react|next-themes|react-day-picker|react-dom|react-hook-form|react-icons|react-router|react-router-dom|react-select|react-toastify|recharts|tailwind-merge|tailwindcss-animate|uuid|zod)/)",
  ],
  testMatch: ["**/__tests__/**/*.test.(ts|tsx)"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testEnvironmentOptions: {
    customExportConditions: ["node", "node-addons"],
    url: "http://localhost",
  },
  globals: {
    "ts-jest": {
      isolatedModules: true,
    },
  },
  roots: ["<rootDir>/src"],
  moduleDirectories: ["node_modules", "src"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/main.tsx",
    "!src/vite-env.d.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

export default config;
