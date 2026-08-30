"use strict";
// @geiger/comms-widget — typed entry point.
//
// Loads the widget's loader script on demand (deferred under your control,
// not the browser's parse order), then proxies every call to the global
// GeigerComms API. SSR-safe: importing this module never touches `window`;
// calling boot() on the server is a no-op.
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeigerComms = void 0;
exports.configure = configure;
const DEFAULT_SCRIPT_URL = "https://app.geiger.dev/comms/widget/v1.js";
let loadPromise = null;
let scriptUrl = DEFAULT_SCRIPT_URL;
function globalApi() {
    if (typeof window === "undefined")
        return null;
    const api = window.GeigerComms;
    // The loader exposes .api once real; before that only the stub queue exists.
    return api && typeof api === "object" && "api" in api ? api.api : null;
}
/** Points future loads at a different deployment (e.g. localhost:3000 in dev). */
function configure(options = {}) {
    if (options.scriptUrl)
        scriptUrl = options.scriptUrl;
}
function injectLoader() {
    if (loadPromise)
        return loadPromise;
    loadPromise = new Promise((resolve, reject) => {
        if (typeof document === "undefined") {
            reject(new Error("@geiger/comms-widget loaded outside a browser"));
            return;
        }
        const existing = document.querySelector("script[data-geiger-comms]");
        const script = existing !== null && existing !== void 0 ? existing : document.createElement("script");
        script.addEventListener("load", () => {
            let attempts = 0;
            const poll = () => {
                const api = globalApi();
                if (api)
                    resolve(api);
                else if (attempts++ > 100)
                    reject(new Error("GeigerComms failed to initialise"));
                else
                    setTimeout(poll, 50);
            };
            poll();
        });
        script.addEventListener("error", () => reject(new Error("Failed to load the Geiger Comms loader")));
        script.src = scriptUrl;
        script.async = true;
        script.dataset.geigerComms = "";
        if (!existing)
            document.head.appendChild(script);
    });
    return loadPromise;
}
function withApi(run) {
    void injectLoader().then(run).catch(() => { });
}
function subscription(register, cb) {
    let off = null;
    withApi((api) => {
        off = register(api, cb);
    });
    return () => off === null || off === void 0 ? void 0 : off();
}
exports.GeigerComms = {
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
    showSpace(name) {
        withApi((api) => api.showSpace(name));
    },
    showMessages() {
        withApi((api) => api.showMessages());
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
    trackEvent(name, metadata) {
        withApi((api) => api.trackEvent(name, metadata));
    },
    getVisitorId() {
        var _a, _b;
        return typeof window === "undefined" ? "" : ((_b = (_a = globalApi()) === null || _a === void 0 ? void 0 : _a.getVisitorId()) !== null && _b !== void 0 ? _b : "");
    },
    onShow(cb) {
        return subscription((api, handler) => api.onShow(handler), cb);
    },
    onHide(cb) {
        return subscription((api, handler) => api.onHide(handler), cb);
    },
    onUnreadCountChange(cb) {
        return subscription((api, handler) => api.onUnreadCountChange(handler), cb);
    },
    onUserEmailSupplied(cb) {
        return subscription((api, handler) => api.onUserEmailSupplied(handler), cb);
    },
};
exports.default = exports.GeigerComms;
