// esbuild drops module directives when bundling, so re-add "use client" to the
// React entry only. The core stays directive-free: it must remain importable
// (as a no-op) from a Next.js server component.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const DIRECTIVE = '"use client";';

for (const file of ["../dist/react.js", "../dist/react.cjs"]) {
  const path = fileURLToPath(new URL(file, import.meta.url));
  const source = readFileSync(path, "utf8");
  const body = source.replace(/^\s*["']use client["'];?\s*/, "");
  writeFileSync(path, `${DIRECTIVE}\n${body}`);
}

for (const file of ["../dist/index.js", "../dist/index.cjs"]) {
  const source = readFileSync(fileURLToPath(new URL(file, import.meta.url)), "utf8");
  if (/^\s*["']use client["']/.test(source)) throw new Error(`${file} must not be a client module`);
}
