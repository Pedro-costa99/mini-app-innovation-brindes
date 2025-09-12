import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
    css: false,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  esbuild: {
    jsx: "automatic", 
    jsxInject: `import React from "react";`,
    },
});
