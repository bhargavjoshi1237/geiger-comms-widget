// Core of @geiger/comms-widget: a pre-boot command queue, injection of the
// Geiger Comms loader script, and a typed method API mirroring the loader's
// global `window.GeigerComms`. SSR-safe: nothing here touches `window` or
// `document` until a method is called in a browser, so importing it in a
// Next.js server component is a no-op rather than a crash.

import type {
  EventMetadata,
  GeigerBootSettings,
  GeigerCommsApi,
  GeigerCommsState,
  GeigerLoadOptions,
  GeigerUpdateData,
  LauncherState,
  SpaceName,
  TrackedEvent,
  Unsubscribe,
} from "./types";

export type {
  EventMetadata,
  GeigerBootOptions,
  GeigerBootSettings,
  GeigerCommsApi,
  GeigerCommsState,
  GeigerLoadOptions,
  GeigerUpdateData,
  GeigerUser,
  LauncherIcon,
  LauncherState,
  SpaceName,
  TrackedEvent,
  Unsubscribe,
} from "./types";

/** Production loader; the loader bakes its own origin and /comms base path. */
export const DEFAULT_SCRIPT_URL = "https://geiger.studio/comms/widget/v1.js";

const SCRIPT_ATTR = "data-geiger-comms-sdk";
const LOG = "[geiger-comms]";

// Commands that need a booted Messenger; issued earlier, they wait for boot().
const NEEDS_BOOT = new Set([
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
]);

type Command = [method: string, args: unknown[]];
type Listener<T> = (value: T) => void;

// The real loader is a function with methods attached; the install-snippet
// stub is a bare function with only a `q` array.
type LoaderGlobal = ((method: string, arg?: unknown) => void) & {
  q?: unknown[];
  [method: string]: unknown;
};

interface Core {
  queue: Command[];
  loadOptions: GeigerLoadOptions | null;
  loading: Promise<boolean> | null;
  wired: LoaderGlobal | null;
  state: GeigerCommsState;
  stateListeners: Set<() => void>;
  listeners: {
    show: Set<Listener<void>>;
    hide: Set<Listener<void>>;
    unread: Set<Listener<number>>;
    email: Set<Listener<string>>;
    event: Set<Listener<TrackedEvent>>;
  };
}

const INITIAL_STATE: GeigerCommsState = Object.freeze({
  loaded: false,
  booted: false,
  isOpen: false,
  unreadCount: 0,
});

let core: Core | null = null;

function getCore(): Core {
  if (!core) {
    core = {
      queue: [],
      loadOptions: null,
      loading: null,
      wired: null,
      state: INITIAL_STATE,
      stateListeners: new Set(),
      listeners: { show: new Set(), hide: new Set(), unread: new Set(), email: new Set(), event: new Set() },
    };
  }
  return core;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function noop(): void {}

function realLoader(): LoaderGlobal | null {
  const g = (window as unknown as { GeigerComms?: unknown }).GeigerComms as LoaderGlobal | undefined;
  return typeof g === "function" && typeof g.boot === "function" ? g : null;
}

function emit<T>(set: Set<Listener<T>>, value: T): void {
  for (const cb of Array.from(set)) {
    try {
      cb(value);
    } catch (error) {
      console.error(`${LOG} listener threw`, error);
    }
  }
}

function setState(patch: Partial<GeigerCommsState>): void {
  const c = getCore();
  const prev = c.state;
  const next = { ...prev, ...patch };
  if (
    next.loaded === prev.loaded &&
    next.booted === prev.booted &&
    next.isOpen === prev.isOpen &&
    next.unreadCount === prev.unreadCount
  ) {
    return;
  }
  c.state = next;
  for (const l of Array.from(c.stateListeners)) l();
}

// One forwarding callback per event on each loader instance; the loader's own
// on* methods return nothing, so SDK listeners (and their unsubscribe) live here.
function attach(g: LoaderGlobal): void {
  const c = getCore();
  if (c.wired === g) return;
  c.wired = g;
  const on = (name: string, cb: (value: unknown) => void) => {
    const fn = g[name];
    if (typeof fn === "function") fn.call(g, cb);
  };
  on("onShow", () => {
    setState({ isOpen: true });
    emit(c.listeners.show, undefined);
  });
  on("onHide", () => {
    setState({ isOpen: false });
    emit(c.listeners.hide, undefined);
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
    const e = event as { name?: unknown; meta?: unknown } | null;
    if (e && typeof e.name === "string") {
      emit(c.listeners.event, { name: e.name, meta: (e.meta as EventMetadata | undefined) ?? null });
    }
  });
}

function run(g: LoaderGlobal, method: string, args: unknown[]): unknown {
  const fn = g[method];
  if (typeof fn !== "function") {
    console.warn(`${LOG} the loader has no ${method}(); is it an older version?`);
    return undefined;
  }
  let result: unknown;
  try {
    result = (fn as (...a: unknown[]) => unknown).apply(g, args);
  } catch (error) {
    console.error(`${LOG} ${method}() failed`, error);
    return undefined;
  }
  if (method === "boot") setState({ booted: true });
  else if (method === "shutdown") afterShutdown();
  return result;
}

// The loader's shutdown neither emits hide nor resets the badge; do both so
// the next user never sees the previous user's state.
function afterShutdown(): void {
  const c = getCore();
  const { isOpen, unreadCount } = c.state;
  setState({ booted: false, isOpen: false, unreadCount: 0 });
  if (unreadCount !== 0) emit(c.listeners.unread, 0);
  if (isOpen) emit(c.listeners.hide, undefined);
}

// Replays queued commands in order; display commands issued before boot()
// are held and run right after it.
function drain(g: LoaderGlobal): void {
  const c = getCore();
  attach(g);
  if (!c.state.loaded) setState({ loaded: true });
  if (!c.queue.length) return;
  const pending = c.queue.splice(0);
  const held: Command[] = [];
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

function call(method: string, args: unknown[]): unknown {
  if (!isBrowser()) return undefined;
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
  return undefined;
}

function hasLoadOptions(o: GeigerLoadOptions | null | undefined): o is GeigerLoadOptions {
  return Boolean(o && (o.scriptUrl || o.apiBase));
}

function resolveScriptUrl(o: GeigerLoadOptions | null): string {
  if (o?.scriptUrl) return o.scriptUrl;
  if (o?.apiBase) return `${o.apiBase.replace(/\/+$/, "")}/widget/v1.js`;
  return DEFAULT_SCRIPT_URL;
}

function absolute(src: string): string {
  try {
    return new URL(src, window.location.href).href;
  } catch {
    return src;
  }
}

// Reuse a loader tag already on the page (ours, or the install snippet's)
// instead of running the loader twice.
function findScript(src: string): HTMLScriptElement | null {
  const target = absolute(src);
  const scripts = document.getElementsByTagName("script");
  for (let i = 0; i < scripts.length; i++) {
    const s = scripts[i];
    if (s.hasAttribute(SCRIPT_ATTR) || (s.src && s.src === target)) return s;
  }
  return null;
}

// Same stub as the install snippet, so code using the global pre-load works.
function ensureStub(): void {
  const w = window as unknown as { GeigerComms?: unknown };
  if (w.GeigerComms) return;
  const stub = function () {
    (stub as unknown as { q: unknown[] }).q.push(arguments);
  } as unknown as LoaderGlobal;
  stub.q = [];
  w.GeigerComms = stub;
}

/** Inject the loader (once) and resolve when its API is live. Never rejects. */
export function load(options?: GeigerLoadOptions): Promise<boolean> {
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
  c.loading = new Promise<boolean>((resolve) => {
    const existing = findScript(src);
    const el = existing ?? document.createElement("script");
    const finish = (ok: boolean, reason?: string) => {
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

/** Start the Messenger. Injects the loader on first call; earlier calls are queued. */
export function boot(settings: GeigerBootSettings): void {
  if (!isBrowser()) return;
  if (!settings || typeof settings.appId !== "string" || !settings.appId) {
    console.warn(`${LOG} boot() needs the widget app's public id, e.g. { appId: "wg_7fk2p9" }`);
    return;
  }
  const { scriptUrl, apiBase, ...loaderSettings } = settings;
  call("boot", [loaderSettings]);
  void load({ scriptUrl, apiBase });
}

export function update(data: GeigerUpdateData): void {
  call("update", [{ ...data }]);
}

export function shutdown(): void {
  call("shutdown", []);
}

export function show(): void {
  call("show", []);
}

export function hide(): void {
  call("hide", []);
}

export function showSpace(name: SpaceName): void {
  call("showSpace", [name]);
}

export function showMessages(): void {
  call("showMessages", []);
}

export function showNewMessage(text?: string): void {
  call("showNewMessage", [text]);
}

export function showConversation(id: string): void {
  call("showConversation", [id]);
}

export function showArticle(id: string): void {
  call("showArticle", [id]);
}

export function showNews(id?: string): void {
  call("showNews", [id]);
}

export function showTicket(id: string): void {
  call("showTicket", [id]);
}

export function showAsk(text?: string): void {
  call("showAsk", [text]);
}

export function setLauncherState(state: LauncherState): void {
  call("setLauncherState", [{ ...state }]);
}

// Called directly (not through the snippet's one-argument queue) so meta survives.
export function trackEvent(name: string, meta?: EventMetadata): void {
  call("trackEvent", meta === undefined ? [name] : [name, meta]);
}

export function getVisitorId(): string | null {
  if (!isBrowser()) return null;
  const g = realLoader();
  if (!g || typeof g.getVisitorId !== "function") return null;
  const id = (g.getVisitorId as () => unknown)();
  return typeof id === "string" && id ? id : null;
}

function listen<K extends keyof Core["listeners"]>(
  kind: K,
  cb: Core["listeners"][K] extends Set<infer L> ? L : never,
): Unsubscribe {
  if (!isBrowser() || typeof cb !== "function") return noop;
  const c = getCore();
  const g = realLoader();
  if (g) drain(g);
  const set = c.listeners[kind] as Set<typeof cb>;
  set.add(cb);
  return () => {
    set.delete(cb);
  };
}

export function onShow(callback: () => void): Unsubscribe {
  return listen("show", callback);
}

export function onHide(callback: () => void): Unsubscribe {
  return listen("hide", callback);
}

/** Called immediately with the current count, then on every change. */
export function onUnreadCountChange(callback: (count: number) => void): Unsubscribe {
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

export function onUserEmailSupplied(callback: (email: string) => void): Unsubscribe {
  return listen("email", callback);
}

export function onEvent(callback: (event: TrackedEvent) => void): Unsubscribe {
  return listen("event", callback);
}

export const onTrackedEvent = onEvent;

/** Current SDK state; a new object whenever anything changes. */
export function getState(): GeigerCommsState {
  return isBrowser() ? getCore().state : INITIAL_STATE;
}

/** Subscribe to state changes (shape matches React's useSyncExternalStore). */
export function subscribe(listener: () => void): Unsubscribe {
  if (!isBrowser()) return noop;
  const c = getCore();
  c.stateListeners.add(listener);
  return () => {
    c.stateListeners.delete(listener);
  };
}

const GeigerComms: GeigerCommsApi = {
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
  load,
};

export default GeigerComms;
