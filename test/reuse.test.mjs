// Defaults to the production loader, and reuses a loader tag that the install
// snippet already put on the page instead of running the loader twice.
import { test } from "node:test";
import assert from "node:assert/strict";
import { installFakeBrowser, installFakeLoader } from "./helpers.mjs";

const mod = await import("../dist/index.js");
const G = mod.default;

test("reuses an existing loader tag at the default URL", async () => {
  const { window, document, scripts, createElement } = installFakeBrowser();
  const snippetTag = createElement("script");
  snippetTag.src = mod.DEFAULT_SCRIPT_URL;
  document.head.appendChild(snippetTag);

  G.boot({ appId: "wg_test" });
  assert.equal(scripts.length, 1, "no second tag injected");
  assert.equal(snippetTag.listenerCount("load"), 1, "waits on the existing tag");

  const loader = installFakeLoader(window);
  snippetTag.dispatch("load");
  assert.equal(await G.load(), true);
  assert.deepEqual(loader.commands(), [["boot", { appId: "wg_test" }]]);
});

test("boot() without an appId is rejected with a warning, not queued", () => {
  const warn = console.warn;
  const warnings = [];
  console.warn = (...a) => warnings.push(a.join(" "));
  try {
    G.boot({ appId: "" });
    assert.match(warnings[0], /needs the widget app's public id/);
  } finally {
    console.warn = warn;
  }
});
