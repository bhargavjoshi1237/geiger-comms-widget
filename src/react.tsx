"use client";

// React bindings: GeigerProvider owns the Messenger's lifecycle (boot on
// mount, re-boot on identity change, shutdown on unmount) and useGeigerComms
// exposes controls plus live unread/open state. SSR-safe: nothing runs until
// effects fire in the browser.

import { useEffect, useMemo, useRef, useSyncExternalStore, type ReactNode } from "react";
import { boot, getState, hide, show, showSpace, shutdown, subscribe } from "./index";
import type { GeigerBootOptions, GeigerBootSettings, GeigerCommsState, GeigerUser, SpaceName } from "./types";

export interface GeigerProviderProps {
  /** The widget app's public id from Messenger > Install, e.g. "wg_7fk2p9". */
  appId: string;
  /** JWT signed by your backend for the signed-in user; omit for anonymous visitors. */
  jwt?: string | null;
  user?: GeigerUser;
  options?: GeigerBootOptions;
  /** Loader script URL override, e.g. "http://localhost:3000/widget/v1.js". Read once. */
  scriptUrl?: string;
  /** Geiger Comms deployment base, e.g. "http://localhost:3000". Read once. */
  apiBase?: string;
  children?: ReactNode;
}

export interface UseGeigerCommsResult {
  /** Open the Messenger panel. */
  open: () => void;
  /** Close the Messenger panel. */
  close: () => void;
  showSpace: (name: SpaceName) => void;
  unreadCount: number;
  /** The loader is live and the Messenger has booted. */
  isReady: boolean;
  /** The Messenger panel is open (handy for a custom launcher). */
  isOpen: boolean;
}

interface LiveSession {
  appId: string;
  identity: string | null;
  signature: string;
  timer: ReturnType<typeof setTimeout> | null;
}

// What the provider last booted; one Messenger per page, so module scope.
let live: LiveSession | null = null;

const SERVER_STATE: GeigerCommsState = Object.freeze({
  loaded: false,
  booted: false,
  isOpen: false,
  unreadCount: 0,
});

function getServerState(): GeigerCommsState {
  return SERVER_STATE;
}

function decodeSegment(segment: string): unknown {
  const b64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(b64 + "===".slice((b64.length + 3) % 4));
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(binary, (ch) => ch.charCodeAt(0))));
}

// Who a JWT identifies, from its user_id claim. Not verified here: the token is
// already in the browser and only the server's check matters.
function identityOf(jwt: string | null | undefined): string | null {
  if (!jwt) return null;
  try {
    const payload = decodeSegment(jwt.split(".")[1] ?? "") as { user_id?: unknown } | null;
    if (payload && typeof payload.user_id === "string" && payload.user_id) return `user:${payload.user_id}`;
  } catch {
    // Opaque token: any change counts as a new identity.
  }
  return `jwt:${jwt}`;
}

/**
 * Boots the Messenger on mount, re-boots when `jwt` changes identity, and
 * shuts it down on unmount. Anonymous -> signed-in keeps the anonymous id so
 * the visitor's history merges; any other identity change shuts down first so
 * one user's session never leaks into the next. A same-user token refresh does
 * not re-boot.
 */
export function GeigerProvider({ appId, jwt, user, options, scriptUrl, apiBase, children }: GeigerProviderProps) {
  const identity = useMemo(() => identityOf(jwt), [jwt]);
  const hideDefaultLauncher = Boolean(options?.hideDefaultLauncher);
  const email = user?.email;
  const signature = JSON.stringify([hideDefaultLauncher, email ?? null]);

  // Latest props for the boot effect, which deliberately ignores same-user jwt changes.
  const latest = useRef({ jwt, email, hideDefaultLauncher, scriptUrl, apiBase });
  useEffect(() => {
    latest.current = { jwt, email, hideDefaultLauncher, scriptUrl, apiBase };
  });

  useEffect(() => {
    const prev = live;
    if (prev?.timer) clearTimeout(prev.timer);
    const current: LiveSession = { appId, identity, signature, timer: null };
    live = current;

    const p = latest.current;
    const settings: GeigerBootSettings = { appId, options: { hideDefaultLauncher: p.hideDefaultLauncher } };
    if (p.jwt) settings.jwt = p.jwt;
    if (p.email) settings.user = { email: p.email };
    if (p.scriptUrl) settings.scriptUrl = p.scriptUrl;
    if (p.apiBase) settings.apiBase = p.apiBase;

    if (!prev) {
      boot(settings);
    } else if (prev.appId === appId && prev.identity === identity) {
      // StrictMode re-run or a remount for the same user: keep the live session.
      if (prev.signature !== signature) boot(settings);
    } else if (prev.appId === appId && prev.identity === null) {
      // Sign-in: re-boot WITHOUT shutdown so the anonymous history merges (spec §4.2).
      boot(settings);
    } else {
      shutdown();
      boot(settings);
    }

    // Deferred a tick so StrictMode's unmount/remount doesn't tear the session down.
    return () => {
      if (live !== current) return;
      current.timer = setTimeout(() => {
        if (live !== current) return;
        live = null;
        shutdown();
      }, 0);
    };
  }, [appId, identity, signature]);

  return <>{children}</>;
}

/** Messenger controls and live state. Works inside or outside GeigerProvider. */
export function useGeigerComms(): UseGeigerCommsResult {
  const state = useSyncExternalStore(subscribe, getState, getServerState);
  return useMemo(
    () => ({
      open: show,
      close: hide,
      showSpace,
      unreadCount: state.unreadCount,
      isReady: state.loaded && state.booted,
      isOpen: state.isOpen,
    }),
    [state],
  );
}

export type { GeigerBootOptions, GeigerUser, SpaceName } from "./types";
