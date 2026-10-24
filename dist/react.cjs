"use client";
'use strict';

var chunkXHFNN7VL_cjs = require('./chunk-XHFNN7VL.cjs');
var react = require('react');
var jsxRuntime = require('react/jsx-runtime');

var live = null;
var SERVER_STATE = Object.freeze({
  loaded: false,
  booted: false,
  isOpen: false,
  unreadCount: 0
});
function getServerState() {
  return SERVER_STATE;
}
function decodeSegment(segment) {
  const b64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(b64 + "===".slice((b64.length + 3) % 4));
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(binary, (ch) => ch.charCodeAt(0))));
}
function identityOf(jwt) {
  var _a;
  if (!jwt) return null;
  try {
    const payload = decodeSegment((_a = jwt.split(".")[1]) != null ? _a : "");
    if (payload && typeof payload.user_id === "string" && payload.user_id) return `user:${payload.user_id}`;
  } catch {
  }
  return `jwt:${jwt}`;
}
function GeigerProvider({ appId, jwt, user, options, scriptUrl, apiBase, children }) {
  const identity = react.useMemo(() => identityOf(jwt), [jwt]);
  const hideDefaultLauncher = Boolean(options == null ? void 0 : options.hideDefaultLauncher);
  const sound = (options == null ? void 0 : options.sound) !== false;
  const email = user == null ? void 0 : user.email;
  const signature = JSON.stringify([hideDefaultLauncher, sound, email != null ? email : null]);
  const latest = react.useRef({ jwt, email, hideDefaultLauncher, sound, scriptUrl, apiBase });
  react.useEffect(() => {
    latest.current = { jwt, email, hideDefaultLauncher, sound, scriptUrl, apiBase };
  });
  react.useEffect(() => {
    const prev = live;
    if (prev == null ? void 0 : prev.timer) clearTimeout(prev.timer);
    const current = { appId, identity, signature, timer: null };
    live = current;
    const p = latest.current;
    const bootOptions = { hideDefaultLauncher: p.hideDefaultLauncher };
    if (!p.sound) bootOptions.sound = false;
    const settings = { appId, options: bootOptions };
    if (p.jwt) settings.jwt = p.jwt;
    if (p.email) settings.user = { email: p.email };
    if (p.scriptUrl) settings.scriptUrl = p.scriptUrl;
    if (p.apiBase) settings.apiBase = p.apiBase;
    if (!prev) {
      chunkXHFNN7VL_cjs.boot(settings);
    } else if (prev.appId === appId && prev.identity === identity) {
      if (prev.signature !== signature) chunkXHFNN7VL_cjs.boot(settings);
    } else if (prev.appId === appId && prev.identity === null) {
      chunkXHFNN7VL_cjs.boot(settings);
    } else {
      chunkXHFNN7VL_cjs.shutdown();
      chunkXHFNN7VL_cjs.boot(settings);
    }
    return () => {
      if (live !== current) return;
      current.timer = setTimeout(() => {
        if (live !== current) return;
        live = null;
        chunkXHFNN7VL_cjs.shutdown();
      }, 0);
    };
  }, [appId, identity, signature]);
  return /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children });
}
function useGeigerComms() {
  const state = react.useSyncExternalStore(chunkXHFNN7VL_cjs.subscribe, chunkXHFNN7VL_cjs.getState, getServerState);
  return react.useMemo(
    () => ({
      open: chunkXHFNN7VL_cjs.show,
      close: chunkXHFNN7VL_cjs.hide,
      showSpace: chunkXHFNN7VL_cjs.showSpace,
      unreadCount: state.unreadCount,
      isReady: state.loaded && state.booted,
      isOpen: state.isOpen
    }),
    [state]
  );
}

exports.GeigerProvider = GeigerProvider;
exports.useGeigerComms = useGeigerComms;
