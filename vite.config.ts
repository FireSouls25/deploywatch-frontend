import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { "/api": "http://localhost:8000" } },
  test: {
    environment: "jsdom",
    coverage: {
      reporter: ["lcov", "text", "html"],
      include: ["src/**"],
      exclude: ["src/main.tsx", "**/*.test.*"],
      // Quality gate: la suite falla si la cobertura baja del 80 %.
      thresholds: { lines: 80, branches: 80, functions: 80, statements: 80 },
    },
  },
});
