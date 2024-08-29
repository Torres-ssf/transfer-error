import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [],
  esbuild: { target: "es2022" },
  test: {
    exclude: [
      "node_modules",
    ],
    coverage: {
      enabled: false,
    },
    globals: true,
    poolOptions: {
      threads: {
        minThreads: 1,
        maxThreads: 16,
      },
    },
  },
});
