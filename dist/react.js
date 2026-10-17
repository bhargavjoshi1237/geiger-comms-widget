"use client";
import { boot, shutdown, subscribe, getState, showSpace, hide, show } from './chunk-3MQSN5DE.js';
import { useMemo, useRef, useEffect, useSyncExternalStore } from 'react';
import { jsx, Fragment } from 'react/jsx-runtime';

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
  const identity = useMemo(() => identityOf(jwt), [jwt]);
  const hideDefaultLauncher = Boolean(options == null ? void 0 : options.hideDefaultLauncher);
  const email = user == null ? void 0 : user.email;
  const signature = JSON.stringify([hideDefaultLauncher, email != null ? email : null]);
  const latest = useRef({ jwt, email, hideDefaultLauncher, scriptUrl, apiBase });
  useEffect(() => {
    latest.current = { jwt, email, hideDefaultLauncher, scriptUrl, apiBase };
  });
  useEffect(() => {
    const prev = live;
    if (prev == null ? void 0 : prev.timer) clearTimeout(prev.timer);
    const current = { appId, identity, signature, timer: null };
    live = current;
    const p = latest.current;
    const settings = { appId, options: { hideDefaultLauncher: p.hideDefaultLauncher } };
    if (p.jwt) settings.jwt = p.jwt;
    if (p.email) settings.user = { email: p.email };
    if (p.scriptUrl) settings.scriptUrl = p.scriptUrl;
    if (p.apiBase) settings.apiBase = p.apiBase;
    if (!prev) {
      boot(settings);
    } else if (prev.appId === appId && prev.identity === identity) {
      if (prev.signature !== signature) boot(settings);
    } else if (prev.appId === appId && prev.identity === null) {
      boot(settings);
    } else {
      shutdown();
      boot(settings);
    }
    return () => {
      if (live !== current) return;
      current.timer = setTimeout(() => {
        if (live !== current) return;
        live = null;
        shutdown();
      }, 0);
    };
  }, [appId, identity, signature]);
  return /* @__PURE__ */ jsx(Fragment, { children });
}
function useGeigerComms() {
  const state = useSyncExternalStore(subscribe, getState, getServerState);
  return useMemo(
    () => ({
      open: show,
      close: hide,
      showSpace,
      unreadCount: state.unreadCount,
      isReady: state.loaded && state.booted,
      isOpen: state.isOpen
    }),
    [state]
  );
}

export { GeigerProvider, useGeigerComms };
