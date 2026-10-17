// Loader injection edge cases: apiBase -> scriptUrl, a failed load cleans up
// and can be retried, and a loader tag already on the page is reused.
import { test } from "node:test";
import assert from "node:assert/strict";
import { installFakeBrowser, installFakeLoader } from "./helpers.mjs";

const mod = await import("../dist/index.js");
const G = mod.default;

test("apiBase derives the loader URL; a failed load is cleaned up and retryable", async () => {
  const { window, scripts } = installFakeBrowser();
  const warn = console.warn;
  const warnings = [];
  console.warn = (...a) => warnings.push(a.join(" "));
  try {
    G.boot({ appId: "wg_test", apiBase: "http://localhost:3000/" });
    assert.equal(scripts.length, 1);
    assert.equal(scripts[0].src, "http://localhost:3000/widget/v1.js");

    const first = G.load();
    scripts[0].dispatch("error");
    assert.equal(await first, false);
    assert.equal(scripts.length, 0, "failed tag removed");
    assert.match(warnings[0], /couldn't load the Messenger loader script/);

    // Retry re-injects from the same remembered base, and the queued boot survives.
    const retry = G.load();
    assert.equal(scripts.length, 1);
    assert.equal(scripts[0].src, "http://localhost:3000/widget/v1.js");
    const loader = installFakeLoader(window);
    scripts[0].dispatch("load");
    assert.equal(await retry, true);
    assert.deepEqual(loader.commands(), [["boot", { appId: "wg_test" }]]);
  } finally {
    console.warn = warn;
  }
});
