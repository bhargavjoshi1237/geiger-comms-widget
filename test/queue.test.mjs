// Pre-load queue: calls made before the loader script arrives are replayed in
// order against the real API, with full arguments, and display commands wait
// for boot(). The module is imported BEFORE any window exists to prove the
// browser is only touched lazily.
import { test } from "node:test";
import assert from "node:assert/strict";
import { installFakeBrowser, installFakeLoader } from "./helpers.mjs";

const mod = await import("../dist/index.js");
const G = mod.default;

test("queues before load, injects the loader once, replays after load", async () => {
  const { window, scripts } = installFakeBrowser();

  const unread = [];
  const offUnread = G.onUnreadCountChange((n) => unread.push(n));
  assert.deepEqual(unread, [0], "called immediately with the current count");

  const shown = [];
  G.onShow(() => shown.push("show"));
  const hidden = [];
  G.onHide(() => hidden.push("hide"));
  const events = [];
  G.onEvent((e) => events.push(e));

  // A display command before boot (e.g. a child effect firing before the provider's).
  G.showSpace("help");
  G.boot({
    appId: "wg_test",
    jwt: "tok",
    user: { email: "ada@example.com" },
    options: { hideDefaultLauncher: true },
    scriptUrl: "http://localhost:3000/widget/v1.js",
  });
  G.trackEvent("plan_upgraded", { plan: "pro" });
  G.update({ user: { email: "ada@example.org" } });

  assert.equal(scripts.length, 1, "one loader tag");
  const [script] = scripts;
  assert.equal(script.src, "http://localhost:3000/widget/v1.js");
  assert.equal(script.async, true);
  assert.ok(script.hasAttribute("data-geiger-comms-sdk"));
  assert.equal(typeof window.GeigerComms, "function", "install-snippet stub defined");
  assert.ok(Array.isArray(window.GeigerComms.q));
  assert.equal(mod.getState().loaded, false);

  const pending = G.load();
  assert.equal(G.load(), pending, "concurrent loads share one promise");
  G.boot({ appId: "wg_test", jwt: "tok", options: { hideDefaultLauncher: true } });
  assert.equal(scripts.length, 1, "no second tag");

  const loader = installFakeLoader(window);
  assert.equal(loader.commands().length, 0, "nothing ran before the script's load event");
  script.dispatch("load");
  assert.equal(await pending, true);

  assert.deepEqual(loader.commands(), [
    ["boot", { appId: "wg_test", jwt: "tok", user: { email: "ada@example.com" }, options: { hideDefaultLauncher: true } }],
    ["showSpace", "help"],
    ["trackEvent", "plan_upgraded", { plan: "pro" }],
    ["update", { user: { email: "ada@example.org" } }],
    ["boot", { appId: "wg_test", jwt: "tok", options: { hideDefaultLauncher: true } }],
  ]);
  assert.equal("scriptUrl" in loader.commands()[0][1], false, "SDK-only fields never reach the loader");
  assert.deepEqual(mod.getState(), { loaded: true, booted: true, isOpen: false, unreadCount: 0 });

  // Live: calls go straight through.
  G.show();
  assert.deepEqual(loader.commands().at(-1), ["show"]);

  // Events forward through the SDK's own listeners, with working unsubscribe.
  loader.fire("onUnreadCountChange", 3);
  assert.deepEqual(unread, [0, 3]);
  assert.equal(mod.getState().unreadCount, 3);
  offUnread();
  loader.fire("onUnreadCountChange", 4);
  assert.deepEqual(unread, [0, 3]);

  loader.fire("onShow");
  assert.deepEqual(shown, ["show"]);
  assert.equal(mod.getState().isOpen, true);

  loader.fire("onEvent", { name: "conversation_started", meta: { source: "home" } });
  assert.deepEqual(events, [{ name: "conversation_started", meta: { source: "home" } }]);

  loader.state.visitorId = "v_123";
  assert.equal(G.getVisitorId(), "v_123");

  // Wired exactly once per loader instance.
  assert.equal(loader.listenerCount("onShow"), 1);
  assert.equal(loader.listenerCount("onUnreadCountChange"), 1);
});

test("shutdown resets state and holds display commands until the next boot", () => {
  const live = globalThis.window.GeigerComms;
  assert.equal(mod.getState().isOpen, true, "continues from the open Messenger above");

  const hidden = [];
  G.onHide(() => hidden.push("hide"));
  const unread = [];
  G.onUnreadCountChange((n) => unread.push(n));

  G.shutdown();
  assert.deepEqual(mod.getState(), { loaded: true, booted: false, isOpen: false, unreadCount: 0 });
  assert.deepEqual(hidden, ["hide"], "an open Messenger reports hidden on shutdown");
  assert.deepEqual(unread, [4, 0], "badge resets to 0");

  const calls = [];
  const original = { show: live.show, boot: live.boot };
  live.show = (...a) => calls.push(["show", ...a]);
  live.boot = (...a) => calls.push(["boot", ...a]);
  G.show();
  assert.deepEqual(calls, [], "show() after shutdown waits for boot");
  G.boot({ appId: "wg_test" });
  assert.deepEqual(calls, [["boot", { appId: "wg_test" }], ["show"]]);
  Object.assign(live, original);
});
