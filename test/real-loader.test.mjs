// Contract test against the REAL loader from a geiger-comms checkout
// (GEIGER_COMMS_DIR, default ../geiger-comms). Skipped when it isn't there.
// Catches drift between the loader's global API and this SDK.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Window } from "happy-dom";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const commsDir = resolve(repoRoot, process.env.GEIGER_COMMS_DIR || "../geiger-comms");
const loaderPath = resolve(commsDir, "lib/widget/loader.js");
const skip = existsSync(loaderPath) ? false : `no loader at ${loaderPath}`;

const ORIGIN = "https://comms.test";
const BASE = "/comms";

test("SDK drives the real loader: queue replay, options, events, shutdown", { skip }, async () => {
  // loader.js has no imports; a data: URL sidesteps that repo's module-type detection.
  const source = readFileSync(loaderPath, "utf8");
  const { buildLoaderScript } = await import(`data:text/javascript,${encodeURIComponent(source)}`);
  const win = new Window({
    url: "https://customer.example/pricing",
    settings: { disableIframePageLoading: true, disableJavaScriptFileLoading: true },
  });
  globalThis.window = win;
  globalThis.document = win.document;

  // Hold the injected tag instead of letting the DOM fetch it.
  let injected = null;
  const append = win.document.head.appendChild.bind(win.document.head);
  win.document.head.appendChild = (el) => {
    if (el.hasAttribute && el.hasAttribute("data-geiger-comms-sdk")) {
      injected = el;
      return el;
    }
    return append(el);
  };

  const mod = await import("../dist/index.js");
  const G = mod.default;
  const events = [];
  G.onEvent((e) => events.push(e));
  const hides = [];
  G.onHide(() => hides.push(1));

  G.showSpace("help");
  G.boot({ appId: "wg_contract", options: { hideDefaultLauncher: true }, scriptUrl: `${ORIGIN}${BASE}/widget/v1.js` });
  G.trackEvent("plan_upgraded", { plan: "pro" });
  assert.ok(injected, "loader tag injected");
  assert.equal(injected.src, `${ORIGIN}${BASE}/widget/v1.js`);

  // Run the real loader as the browser would, then fire the tag's load event.
  const fakeFetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({ appearance: {} }) });
  new Function("window", "document", "fetch", buildLoaderScript(ORIGIN, BASE))(win, win.document, fakeFetch);
  const loaded = G.load();
  injected.dispatchEvent(new win.Event("load"));
  assert.equal(await loaded, true);

  const root = win.document.querySelector("[data-geiger-comms]");
  assert.ok(root, "launcher root rendered");
  const button = root.querySelector("button");
  assert.equal(button.style.display, "none", "hideDefaultLauncher honoured");
  const iframe = root.querySelector("iframe");
  assert.equal(
    iframe.getAttribute("src"),
    `${ORIGIN}${BASE}/widget?appId=wg_contract&parentOrigin=${encodeURIComponent("https://customer.example")}`,
    "showSpace (queued before boot) opened the panel after boot",
  );
  assert.equal(mod.getState().isOpen, true);
  assert.deepEqual(events, [{ name: "plan_upgraded", meta: { plan: "pro" } }], "trackEvent meta survived the queue");

  // Widget -> host messages surface through the SDK.
  const post = (type, payload) =>
    win.dispatchEvent(
      new win.MessageEvent("message", {
        data: { source: "geiger-comms", v: 1, type, payload },
        origin: ORIGIN,
        source: iframe.contentWindow,
      }),
    );
  const counts = [];
  G.onUnreadCountChange((n) => counts.push(n));
  post("unreadCount", { count: 5 });
  assert.equal(mod.getState().unreadCount, 5);
  assert.deepEqual(counts, [0, 5]);
  post("visitor", { visitorId: "v_9" });
  assert.equal(G.getVisitorId(), "v_9");

  G.hide();
  assert.equal(mod.getState().isOpen, false);
  assert.equal(hides.length, 1);

  G.shutdown();
  assert.equal(win.document.querySelector("[data-geiger-comms]"), null, "shutdown removes the launcher");
  assert.deepEqual(mod.getState(), { loaded: true, booted: false, isOpen: false, unreadCount: 0 });

  G.boot({ appId: "wg_contract" });
  assert.ok(win.document.querySelector("[data-geiger-comms]"), "boot after shutdown rebuilds it");
  G.shutdown();
  await win.happyDOM.close();
});
