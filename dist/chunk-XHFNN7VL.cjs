'use strict';

// src/index.ts
var DEFAULT_SCRIPT_URL = "https://geiger.studio/comms/widget/v1.js";
var SCRIPT_ATTR = "data-geiger-comms-sdk";
var LOG = "[geiger-comms]";
var NEEDS_BOOT = /* @__PURE__ */ new Set([
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
  "trackEvent"
]);
var INITIAL_STATE = Object.freeze({
  loaded: false,
  booted: false,
  isOpen: false,
  unreadCount: 0
});
var core = null;
function getCore() {
  if (!core) {
    core = {
      queue: [],
      loadOptions: null,
      loading: null,
      wired: null,
      state: INITIAL_STATE,
      stateListeners: /* @__PURE__ */ new Set(),
      listeners: { show: /* @__PURE__ */ new Set(), hide: /* @__PURE__ */ new Set(), unread: /* @__PURE__ */ new Set(), email: /* @__PURE__ */ new Set(), event: /* @__PURE__ */ new Set() }
    };
  }
  return core;
}
function isBrowser() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}
function noop() {
}
function realLoader() {
  const g = window.GeigerComms;
  return typeof g === "function" && typeof g.boot === "function" ? g : null;
}
function emit(set, value) {
  for (const cb of Array.from(set)) {
    try {
      cb(value);
    } catch (error) {
      console.error(`${LOG} listener threw`, error);
    }
  }
}
function setState(patch) {
  const c = getCore();
  const prev = c.state;
  const next = { ...prev, ...patch };
  if (next.loaded === prev.loaded && next.booted === prev.booted && next.isOpen === prev.isOpen && next.unreadCount === prev.unreadCount) {
    return;
  }
  c.state = next;
  for (const l of Array.from(c.stateListeners)) l();
}
function attach(g) {
  const c = getCore();
  if (c.wired === g) return;
  c.wired = g;
  const on = (name, cb) => {
    const fn = g[name];
    if (typeof fn === "function") fn.call(g, cb);
  };
  on("onShow", () => {
    setState({ isOpen: true });
    emit(c.listeners.show, void 0);
  });
  on("onHide", () => {
    setState({ isOpen: false });
    emit(c.listeners.hide, void 0);
  });
  on("onUnreadCountChange", (n) => {
    const count = Math.max(0, Number(n) | 0);
    if (count === c.state.unreadCount) return;
    setState({ unreadCount: count });
    emit(c.listeners.unread, count);
  });
  on("onUserEmailSupplied", (email) => {
    if (typeof email === "string" && email) emit(c.listeners.email, email);
  });
  on("onEvent", (event) => {
    var _a;
    const e = event;
    if (e && typeof e.name === "string") {
      emit(c.listeners.event, { name: e.name, meta: (_a = e.meta) != null ? _a : null });
    }
  });
}
function run(g, method, args) {
  const fn = g[method];
  if (typeof fn !== "function") {
    console.warn(`${LOG} the loader has no ${method}(); is it an older version?`);
    return void 0;
  }
  let result;
  try {
    result = fn.apply(g, args);
  } catch (error) {
    console.error(`${LOG} ${method}() failed`, error);
    return void 0;
  }
  if (method === "boot") setState({ booted: true });
  else if (method === "shutdown") afterShutdown();
  return result;
}
function afterShutdown() {
  const c = getCore();
  const { isOpen, unreadCount } = c.state;
  setState({ booted: false, isOpen: false, unreadCount: 0 });
  if (unreadCount !== 0) emit(c.listeners.unread, 0);
  if (isOpen) emit(c.listeners.hide, void 0);
}
function drain(g) {
  const c = getCore();
  attach(g);
  if (!c.state.loaded) setState({ loaded: true });
  if (!c.queue.length) return;
  const pending = c.queue.splice(0);
  const held = [];
  for (const [method, args] of pending) {
    if (NEEDS_BOOT.has(method) && !c.state.booted) {
      held.push([method, args]);
      continue;
    }
    run(g, method, args);
    if (method === "boot") {
      for (const [m, a] of held.splice(0)) run(g, m, a);
    }
  }
  c.queue.push(...held);
}
function call(method, args) {
  if (!isBrowser()) return void 0;
  const c = getCore();
  const g = realLoader();
  if (g) {
    drain(g);
    if (!(NEEDS_BOOT.has(method) && !c.state.booted)) {
      const result = run(g, method, args);
      if (method === "boot") drain(g);
      return result;
    }
  }
  c.queue.push([method, args]);
  return void 0;
}
function hasLoadOptions(o) {
  return Boolean(o && (o.scriptUrl || o.apiBase));
}
function resolveScriptUrl(o) {
  if (o == null ? void 0 : o.scriptUrl) return o.scriptUrl;
  if (o == null ? void 0 : o.apiBase) return `${o.apiBase.replace(/\/+$/, "")}/widget/v1.js`;
  return DEFAULT_SCRIPT_URL;
}
function absolute(src) {
  try {
    return new URL(src, window.location.href).href;
  } catch {
    return src;
  }
}
function findScript(src) {
  const target = absolute(src);
  const scripts = document.getElementsByTagName("script");
  for (let i = 0; i < scripts.length; i++) {
    const s = scripts[i];
    if (s.hasAttribute(SCRIPT_ATTR) || s.src && s.src === target) return s;
  }
  return null;
}
function ensureStub() {
  const w = window;
  if (w.GeigerComms) return;
  const stub = function() {
    stub.q.push(arguments);
  };
  stub.q = [];
  w.GeigerComms = stub;
}
function load(options) {
  if (!isBrowser()) return Promise.resolve(false);
  const c = getCore();
  if (hasLoadOptions(options) && !c.loading && !c.state.loaded) c.loadOptions = options;
  const live = realLoader();
  if (live) {
    drain(live);
    return Promise.resolve(true);
  }
  if (c.loading) return c.loading;
  const src = resolveScriptUrl(c.loadOptions);
  ensureStub();
  c.loading = new Promise((resolve) => {
    const existing = findScript(src);
    const el = existing != null ? existing : document.createElement("script");
    const finish = (ok, reason) => {
      el.removeEventListener("load", onLoad);
      el.removeEventListener("error", onError);
      c.loading = null;
      if (!ok) {
        if (!existing && el.parentNode) el.parentNode.removeChild(el);
        console.warn(`${LOG} ${reason} (${src})`);
      }
      resolve(ok);
    };
    const onLoad = () => {
      const g = realLoader();
      if (!g) {
        finish(false, "the loader script ran but did not install window.GeigerComms");
        return;
      }
      drain(g);
      finish(true);
    };
    const onError = () => finish(false, "couldn't load the Messenger loader script");
    el.addEventListener("load", onLoad);
    el.addEventListener("error", onError);
    if (!existing) {
      el.src = src;
      el.async = true;
      el.setAttribute(SCRIPT_ATTR, "");
      (document.head || document.documentElement).appendChild(el);
    }
  });
  return c.loading;
}
function boot(settings) {
  if (!isBrowser()) return;
  if (!settings || typeof settings.appId !== "string" || !settings.appId) {
    console.warn(`${LOG} boot() needs the widget app's public id, e.g. { appId: "wg_7fk2p9" }`);
    return;
  }
  const { scriptUrl, apiBase, ...loaderSettings } = settings;
  call("boot", [loaderSettings]);
  void load({ scriptUrl, apiBase });
}
function update(data) {
  call("update", [{ ...data }]);
}
function shutdown() {
  call("shutdown", []);
}
function show() {
  call("show", []);
}
function hide() {
  call("hide", []);
}
function showSpace(name) {
  call("showSpace", [name]);
}
function showMessages() {
  call("showMessages", []);
}
function showNewMessage(text) {
  call("showNewMessage", [text]);
}
function showConversation(id) {
  call("showConversation", [id]);
}
function showArticle(id) {
  call("showArticle", [id]);
}
function showNews(id) {
  call("showNews", [id]);
}
function showTicket(id) {
  call("showTicket", [id]);
}
function showAsk(text) {
  call("showAsk", [text]);
}
function setLauncherState(state) {
  call("setLauncherState", [{ ...state }]);
}
function trackEvent(name, meta) {
  call("trackEvent", meta === void 0 ? [name] : [name, meta]);
}
function getVisitorId() {
  if (!isBrowser()) return null;
  const g = realLoader();
  if (!g || typeof g.getVisitorId !== "function") return null;
  const id = g.getVisitorId();
  return typeof id === "string" && id ? id : null;
}
function listen(kind, cb) {
  if (!isBrowser() || typeof cb !== "function") return noop;
  const c = getCore();
  const g = realLoader();
  if (g) drain(g);
  const set = c.listeners[kind];
  set.add(cb);
  return () => {
    set.delete(cb);
  };
}
function onShow(callback) {
  return listen("show", callback);
}
function onHide(callback) {
  return listen("hide", callback);
}
function onUnreadCountChange(callback) {
  const off = listen("unread", callback);
  if (off !== noop) {
    try {
      callback(getCore().state.unreadCount);
    } catch (error) {
      console.error(`${LOG} listener threw`, error);
    }
  }
  return off;
}
function onUserEmailSupplied(callback) {
  return listen("email", callback);
}
function onEvent(callback) {
  return listen("event", callback);
}
var onTrackedEvent = onEvent;
function getState() {
  return isBrowser() ? getCore().state : INITIAL_STATE;
}
function subscribe(listener) {
  if (!isBrowser()) return noop;
  const c = getCore();
  c.stateListeners.add(listener);
  return () => {
    c.stateListeners.delete(listener);
  };
}
var GeigerComms = {
  boot,
  update,
  shutdown,
  show,
  hide,
  showSpace,
  showMessages,
  showNewMessage,
  showConversation,
  showArticle,
  showNews,
  showTicket,
  showAsk,
  setLauncherState,
  trackEvent,
  getVisitorId,
  onShow,
  onHide,
  onUnreadCountChange,
  onUserEmailSupplied,
  onEvent,
  onTrackedEvent,
  load
};
var src_default = GeigerComms;

exports.DEFAULT_SCRIPT_URL = DEFAULT_SCRIPT_URL;
exports.boot = boot;
exports.getState = getState;
exports.getVisitorId = getVisitorId;
exports.hide = hide;
exports.load = load;
exports.onEvent = onEvent;
exports.onHide = onHide;
exports.onShow = onShow;
exports.onTrackedEvent = onTrackedEvent;
exports.onUnreadCountChange = onUnreadCountChange;
exports.onUserEmailSupplied = onUserEmailSupplied;
exports.setLauncherState = setLauncherState;
exports.show = show;
exports.showArticle = showArticle;
exports.showAsk = showAsk;
exports.showConversation = showConversation;
exports.showMessages = showMessages;
exports.showNewMessage = showNewMessage;
exports.showNews = showNews;
exports.showSpace = showSpace;
exports.showTicket = showTicket;
exports.shutdown = shutdown;
exports.src_default = src_default;
exports.subscribe = subscribe;
exports.trackEvent = trackEvent;
exports.update = update;
