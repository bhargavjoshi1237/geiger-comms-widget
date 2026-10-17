// Test doubles: a minimal fake browser (just what the core touches) and a fake
// loader with the same shape as the real one (methods hung off a function,
// one-argument queue drain, on* callbacks with no unsubscribe).

const LOADER_METHODS = [
  "boot",
  "update",
  "shutdown",
  "show",
  "hide",
  "showSpace",
  "showMessages",
  "showNewMessage",
  "showConversation",
  "showArticle",
  "showNews",
  "showTicket",
  "showAsk",
  "setLauncherState",
  "trackEvent",
];
const LOADER_EVENTS = ["onShow", "onHide", "onUnreadCountChange", "onUserEmailSupplied", "onEvent", "onTrackedEvent"];

export function installFakeBrowser({ href = "https://customer.example/app" } = {}) {
  const scripts = [];
  function createElement(tag) {
    const listeners = {};
    return {
      tagName: String(tag).toUpperCase(),
      attributes: {},
      src: "",
      async: false,
      parentNode: null,
      setAttribute(name, value) {
        this.attributes[name] = String(value);
      },
      hasAttribute(name) {
        return name in this.attributes;
      },
      addEventListener(type, fn) {
        (listeners[type] ||= new Set()).add(fn);
      },
      removeEventListener(type, fn) {
        listeners[type]?.delete(fn);
      },
      dispatch(type) {
        for (const fn of [...(listeners[type] || [])]) fn({ type });
      },
      listenerCount(type) {
        return listeners[type]?.size ?? 0;
      },
    };
  }
  const head = {
    appendChild(el) {
      el.parentNode = head;
      scripts.push(el);
      return el;
    },
    removeChild(el) {
      const i = scripts.indexOf(el);
      if (i >= 0) scripts.splice(i, 1);
      el.parentNode = null;
      return el;
    },
  };
  const document = {
    head,
    documentElement: head,
    createElement,
    getElementsByTagName: (tag) => (String(tag).toLowerCase() === "script" ? [...scripts] : []),
  };
  const window = { location: { href } };
  globalThis.window = window;
  globalThis.document = document;
  return { window, document, scripts, createElement };
}

export function installFakeLoader(win) {
  const calls = [];
  const callbacks = Object.fromEntries(LOADER_EVENTS.map((k) => [k, []]));
  const state = { unread: 0, visitorId: null };
  const queued = win.GeigerComms && win.GeigerComms.q ? win.GeigerComms.q : [];
  const api = function (method, arg) {
    if (typeof api[method] === "function") api[method](arg);
  };
  for (const m of LOADER_METHODS) {
    api[m] = (...args) => {
      calls.push([m, ...args]);
    };
  }
  for (const k of LOADER_EVENTS) {
    api[k] = (cb) => {
      callbacks[k].push(cb);
      if (k === "onUnreadCountChange") cb(state.unread);
    };
  }
  api.getVisitorId = () => state.visitorId;
  api.q = [];
  win.GeigerComms = api;
  for (const item of queued) if (item && item.length) api(item[0], item[1]);
  return {
    api,
    calls,
    state,
    /** Commands only, without the SDK's one-time on* wiring. */
    commands: () => calls.filter(([m]) => LOADER_METHODS.includes(m)),
    fire(event, value) {
      if (event === "onUnreadCountChange") state.unread = value;
      for (const cb of callbacks[event]) cb(value);
    },
    listenerCount: (event) => callbacks[event].length,
  };
}

export function fakeJwt(claims) {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  return `${b64({ alg: "HS256", typ: "JWT" })}.${b64(claims)}.signature`;
}

export const tick = (ms = 5) => new Promise((resolve) => setTimeout(resolve, ms));
