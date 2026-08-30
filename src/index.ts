// @geiger/comms-widget — typed entry point.
//
// Loads the widget's loader script on demand (deferred under your control,
// not the browser's parse order), then proxies every call to the global
// GeigerComms API. SSR-safe: importing this module never touches `window`;
// calling boot() on the server is a no-op.

import type {
  GeigerCommsApi,
  GeigerCommsSettings,
  GeigerSpace,
  SimpleHandler,
  UnreadCountHandler,
  Unsubscribe,
  WidgetEventHandler,
  WidgetTrackedEvent,
  EmailHandler,
} from "./types";

export type {
  GeigerCommsApi,
  GeigerCommsSettings,
  GeigerSpace,
  WidgetEvent,
} from "./types";

interface LoaderWindow {
  GeigerComms?: { q: unknown[] } & Record<string, unknown>;
}

const DEFAULT_SCRIPT_URL = "https://app.geiger.dev/comms/widget/v1.js";

let loadPromise: Promise<GeigerCommsApi> | null = null;
let scriptUrl = DEFAULT_SCRIPT_URL;

function globalApi(): GeigerCommsApi | null {
  if (typeof window === "undefined") return null;
  const api = (window as unknown as LoaderWindow).GeigerComms;
  // The loader exposes .api once real; before that only the stub queue exists.
  return api && typeof api === "object" && "api" in api ? (api.api as GeigerCommsApi) : null;
}

/** Points future loads at a different deployment (e.g. localhost:3000 in dev). */
export function configure(options: { scriptUrl?: string } = {}): void {
  if (options.scriptUrl) scriptUrl = options.scriptUrl;
}

function injectLoader(): Promise<GeigerCommsApi> {
  if (loadPromise) return loadPromise;
  loadPromise = new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("@geiger/comms-widget loaded outside a browser"));
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>("script[data-geiger-comms]");
    const script = existing ?? document.createElement("script");
    script.addEventListener("load", () => {
      let attempts = 0;
      const poll = () => {
        const api = globalApi();
        if (api) resolve(api);
        else if (attempts++ > 100) reject(new Error("GeigerComms failed to initialise"));
        else setTimeout(poll, 50);
      };
      poll();
    });
    script.addEventListener("error", () => reject(new Error("Failed to load the Geiger Comms loader")));
    script.src = scriptUrl;
    script.async = true;
    script.dataset.geigerComms = "";
    if (!existing) document.head.appendChild(script);
  });
  return loadPromise;
}

function withApi(run: (api: GeigerCommsApi) => void): void {
  void injectLoader().then(run).catch(() => {});
}

function subscription<T extends (...args: never[]) => void>(
  register: (api: GeigerCommsApi, cb: T) => Unsubscribe,
  cb: T,
): Unsubscribe {
  let off: Unsubscribe | null = null;
  withApi((api) => {
    off = register(api, cb);
  });
  return () => off?.();
}

export const GeigerComms: GeigerCommsApi = {
  /** Loads the loader and boots the messenger. Safe to call again; updates settings. */
  boot(settings) {
    withApi((api) => api.boot(settings));
  },
  update(data) {
    withApi((api) => api.update(data));
  },
  shutdown() {
    withApi((api) => api.shutdown());
  },
  show() {
    withApi((api) => api.show());
  },
  hide() {
    withApi((api) => api.hide());
  },
  showSpace(name: GeigerSpace) {
    withApi((api) => api.showSpace(name));
  },
  showMessages() {
    withApi((api) => api.showMessages());
  },
  /** Open the messenger directly into AI Ask mode, optionally pre-filling the query. */
  showAsk(text) {
    withApi((api) => api.showAsk(text));
  },
  showNewMessage(text) {
    withApi((api) => api.showNewMessage(text));
  },
  showConversation(id) {
    withApi((api) => api.showConversation(id));
  },
  showArticle(id) {
    withApi((api) => api.showArticle(id));
  },
  showNews(id) {
    withApi((api) => api.showNews(id));
  },
  showTicket(id) {
    withApi((api) => api.showTicket(id));
  },
  setLauncherState(state) {
    withApi((api) => api.setLauncherState?.(state));
  },
  trackEvent(name, metadata) {
    withApi((api) => api.trackEvent(name, metadata));
  },
  getVisitorId() {
    return typeof window === "undefined" ? "" : (globalApi()?.getVisitorId() ?? "");
  },
  onShow(cb: SimpleHandler) {
    return subscription<SimpleHandler>((api, handler) => api.onShow(handler), cb);
  },
  onHide(cb: SimpleHandler) {
    return subscription<SimpleHandler>((api, handler) => api.onHide(handler), cb);
  },
  onUnreadCountChange(cb: UnreadCountHandler) {
    return subscription<UnreadCountHandler>((api, handler) => api.onUnreadCountChange(handler), cb);
  },
  onUserEmailSupplied(cb: EmailHandler) {
    return subscription<EmailHandler>((api, handler) => api.onUserEmailSupplied(handler), cb);
  },
  onEvent(cb: WidgetEventHandler) {
    return subscription<WidgetEventHandler>((api, handler) => api.onEvent?.(handler) ?? (() => {}), cb);
  },
  onTrackedEvent(cb: (event: WidgetTrackedEvent) => void) {
    return subscription<(event: WidgetTrackedEvent) => void>(
      (api, handler) => api.onTrackedEvent?.(handler) ?? (() => {}),
      cb,
    );
  },
};

export default GeigerComms;
