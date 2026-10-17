// SSR safety: the built package imports and runs under plain Node with no
// window/document, as a Next.js server component would.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

const require = createRequire(import.meta.url);

test("runs with no browser globals", () => {
  assert.equal(typeof globalThis.window, "undefined");
  assert.equal(typeof globalThis.document, "undefined");
});

test("ESM core (by package name) imports and every method is a server no-op", async () => {
  const mod = await import("@geiger/comms-widget");
  const G = mod.default;
  assert.doesNotThrow(() => {
    G.boot({ appId: "wg_test", jwt: "a.b.c", options: { hideDefaultLauncher: true } });
    G.update({ jwt: "x" });
    G.show();
    G.hide();
    G.showSpace("help");
    G.showMessages();
    G.showNewMessage("hi");
    G.showConversation("c1");
    G.showArticle("a1");
    G.showNews();
    G.showTicket("t1");
    G.showAsk("q");
    G.setLauncherState({ label: "Help" });
    G.trackEvent("plan_upgraded", { plan: "pro" });
    G.shutdown();
  });
  assert.equal(G.getVisitorId(), null);
  assert.equal(await G.load(), false);
  const off = G.onUnreadCountChange(() => assert.fail("listeners never fire on the server"));
  assert.equal(typeof off, "function");
  off();
  assert.deepEqual(mod.getState(), { loaded: false, booted: false, isOpen: false, unreadCount: 0 });
});

test("CJS builds import without a window", () => {
  const cjs = require("../dist/index.cjs");
  assert.equal(typeof cjs.default.boot, "function");
  assert.equal(typeof cjs.boot, "function");
  const react = require("../dist/react.cjs");
  assert.equal(typeof react.GeigerProvider, "function");
  assert.equal(typeof react.useGeigerComms, "function");
});

test("GeigerProvider server-renders children without touching the browser", async () => {
  const { GeigerProvider, useGeigerComms } = await import("@geiger/comms-widget/react");
  function Probe() {
    const c = useGeigerComms();
    return createElement("span", null, `ready=${c.isReady} unread=${c.unreadCount} open=${c.isOpen}`);
  }
  const html = renderToString(
    createElement(GeigerProvider, { appId: "wg_test", jwt: "a.b.c" }, createElement(Probe)),
  );
  assert.equal(html, "<span>ready=false unread=0 open=false</span>");
});

test("only the React entry is a client module", () => {
  for (const f of ["../dist/react.js", "../dist/react.cjs"]) {
    assert.match(readFileSync(new URL(f, import.meta.url), "utf8"), /^"use client";/);
  }
  for (const f of ["../dist/index.js", "../dist/index.cjs"]) {
    assert.doesNotMatch(readFileSync(new URL(f, import.meta.url), "utf8"), /use client/);
  }
});
