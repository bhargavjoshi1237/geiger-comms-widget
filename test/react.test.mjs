// GeigerProvider lifecycle in a real React DOM render (happy-dom): boots once
// under StrictMode, merges on sign-in, ignores same-user token refreshes,
// shuts down before switching users, and shuts down on unmount.
import { test } from "node:test";
import assert from "node:assert/strict";
import { Window } from "happy-dom";
import { fakeJwt, installFakeLoader, tick } from "./helpers.mjs";

const win = new Window({ url: "https://customer.example/" });
globalThis.window = win;
globalThis.document = win.document;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Loader already live, so the provider drives the real-shaped API directly.
const loader = installFakeLoader(win);

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const { GeigerProvider, useGeigerComms } = await import("../dist/react.js");
const { act, createElement: h, StrictMode } = React;

const JWT_U1 = fakeJwt({ user_id: "u_1", iat: 1000, exp: 4600 });
const JWT_U1_REFRESHED = fakeJwt({ user_id: "u_1", iat: 2000, exp: 5600 });
const JWT_U2 = fakeJwt({ user_id: "u_2", iat: 1000, exp: 4600 });

let hook = null;
function Probe() {
  hook = useGeigerComms();
  return h("span", { id: "probe" }, `ready=${hook.isReady} unread=${hook.unreadCount} open=${hook.isOpen}`);
}

const container = win.document.createElement("div");
win.document.body.appendChild(container);
const root = createRoot(container);
const render = (props) =>
  act(async () => {
    root.render(h(StrictMode, null, h(GeigerProvider, { appId: "wg_test", ...props }, h(Probe))));
  });
const commandsSince = (n) => loader.commands().slice(n).map(([m, arg]) => [m, arg?.jwt ?? null]);

test("boots once on mount, even under StrictMode's double effects", async () => {
  await render({});
  await tick();
  assert.deepEqual(commandsSince(0), [["boot", null]]);
  assert.deepEqual(loader.commands()[0][1], { appId: "wg_test", options: { hideDefaultLauncher: false } });
  assert.equal(container.textContent, "ready=true unread=0 open=false");
});

test("anonymous -> signed in re-boots WITHOUT shutdown so history merges", async () => {
  const n = loader.commands().length;
  await render({ jwt: JWT_U1 });
  await tick();
  assert.deepEqual(commandsSince(n), [["boot", JWT_U1]]);
});

test("a same-user token refresh does not re-boot", async () => {
  const n = loader.commands().length;
  await render({ jwt: JWT_U1_REFRESHED });
  await tick();
  assert.deepEqual(commandsSince(n), []);
});

test("switching users shuts down first, then boots the new identity", async () => {
  const n = loader.commands().length;
  await render({ jwt: JWT_U2 });
  await tick();
  assert.deepEqual(commandsSince(n), [["shutdown", null], ["boot", JWT_U2]]);
});

test("options changes re-apply without a shutdown", async () => {
  const n = loader.commands().length;
  await render({ jwt: JWT_U2, options: { hideDefaultLauncher: true } });
  await tick();
  assert.deepEqual(commandsSince(n), [["boot", JWT_U2]]);
  assert.deepEqual(loader.commands().at(-1)[1].options, { hideDefaultLauncher: true });

  // sound: false reaches the loader, and dropping it boots again with the default (no key).
  await render({ jwt: JWT_U2, options: { hideDefaultLauncher: true, sound: false } });
  await tick();
  assert.deepEqual(loader.commands().at(-1)[1].options, { hideDefaultLauncher: true, sound: false });
  await render({ jwt: JWT_U2, options: { hideDefaultLauncher: true } });
  await tick();
  assert.deepEqual(commandsSince(n), [["boot", JWT_U2], ["boot", JWT_U2], ["boot", JWT_U2]]);
  assert.deepEqual(loader.commands().at(-1)[1].options, { hideDefaultLauncher: true });
});

test("useGeigerComms reflects unread/open state and drives the Messenger", async () => {
  await act(async () => loader.fire("onUnreadCountChange", 2));
  assert.equal(container.textContent, "ready=true unread=2 open=false");
  await act(async () => loader.fire("onShow"));
  assert.equal(container.textContent, "ready=true unread=2 open=true");

  const n = loader.commands().length;
  hook.close();
  hook.open();
  hook.showSpace("help");
  assert.deepEqual(loader.commands().slice(n), [["hide"], ["show"], ["showSpace", "help"]]);
});

test("unmount shuts the Messenger down", async () => {
  const n = loader.commands().length;
  await act(async () => root.unmount());
  await tick();
  assert.deepEqual(commandsSince(n), [["shutdown", null]]);
  const { getState } = await import("../dist/index.js");
  assert.deepEqual(getState(), { loaded: true, booted: false, isOpen: false, unreadCount: 0 });
});

test("a fresh mount after unmount boots again", async () => {
  const again = createRoot(container);
  const n = loader.commands().length;
  await act(async () => again.render(h(GeigerProvider, { appId: "wg_test" })));
  await tick();
  assert.deepEqual(commandsSince(n), [["boot", null]]);
  await act(async () => again.unmount());
  await tick();
  assert.deepEqual(commandsSince(n), [["boot", null], ["shutdown", null]]);
  await win.happyDOM.close();
});
