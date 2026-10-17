import { defineConfig } from "tsup";

// ESM + CJS + .d.ts, committed to dist/ so a GitHub install needs no build step.
// Splitting keeps the core in one shared chunk, so "@geiger/comms-widget" and
// "@geiger/comms-widget/react" share a single queue/state instance per format.
export default defineConfig({
  entry: { index: "src/index.ts", react: "src/react.tsx" },
  format: ["esm", "cjs"],
  dts: true,
  splitting: true,
  sourcemap: false,
  clean: true,
  treeshake: true,
  target: "es2019",
  external: ["react", "react/jsx-runtime"],
});
