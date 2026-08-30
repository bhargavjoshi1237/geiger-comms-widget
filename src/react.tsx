"use client";

// React bindings: GeigerProvider boots on mount, re-boots when the identity
// (jwt) changes, and shuts down on unmount — so a signed-out user never
// inherits the previous user's session.

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { GeigerComms } from "./index";
import type {
  GeigerCommsSettings,
  GeigerSpace,
  Unsubscribe,
  WidgetEvent,
} from "./types";

export interface GeigerProviderProps extends Omit<GeigerCommsSettings, "jwt"> {
  /** Signed server-side; a change in value re-boots the widget as that identity. */
  jwt?: string | null;
  children: ReactNode;
}

interface GeigerContextValue {
  isReady: boolean;
  unreadCount: number;
  open(): void;
  close(): void;
  showSpace(name: GeigerSpace): void;
  showMessages(): void;
  showAsk(text?: string): void;
  showNewMessage(text?: string): void;
  showArticle(id: string): void;
  showNews(id?: string): void;
  showTicket(id: string): void;
  setLauncherState(state: { label?: string; unread?: number; icon?: "help" | "minimize" | "close" | "ai" }): void;
}

const GeigerContext = createContext<GeigerContextValue | null>(null);

export function GeigerProvider({ jwt, children, ...settings }: GeigerProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  // Identity changes re-boot; unrelated re-renders must not.
  const identityRef = useRef<string | null>(null);
  const bootKey = `${settings.appId}:${jwt ?? ""}`;

  useEffect(() => {
    if (identityRef.current === bootKey) return;
    identityRef.current = bootKey;
    if (!settings.appId) return;
    GeigerComms.boot({ ...settings, jwt: jwt ?? undefined });
    setIsReady(true);
    // settings fields are plain values; bootKey covers identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bootKey]);

  useEffect(() => {
    const offs: Unsubscribe[] = [
      GeigerComms.onUnreadCountChange(setUnreadCount),
      GeigerComms.onShow(() => setIsReady(true)),
    ];
    return () => {
      offs.forEach((off) => off());
      if (identityRef.current !== null) {
        GeigerComms.shutdown();
        identityRef.current = null;
        setIsReady(false);
        setUnreadCount(0);
      }
    };
  }, []);

  const value = useMemo<GeigerContextValue>(
    () => ({
      isReady,
      unreadCount,
      open: () => GeigerComms.show(),
      close: () => GeigerComms.hide(),
      showSpace: (name) => GeigerComms.showSpace(name),
      showMessages: () => GeigerComms.showMessages(),
      showAsk: (text) => GeigerComms.showAsk(text),
      showNewMessage: (text) => GeigerComms.showNewMessage(text),
      showArticle: (id) => GeigerComms.showArticle(id),
      showNews: (id) => GeigerComms.showNews(id),
      showTicket: (id) => GeigerComms.showTicket(id),
      setLauncherState: (state) => GeigerComms.setLauncherState(state),
    }),
    [isReady, unreadCount],
  );

  return <GeigerContext.Provider value={value}>{children}</GeigerContext.Provider>;
}

export function useGeigerComms(): GeigerContextValue {
  const value = useContext(GeigerContext);
  if (!value) throw new Error("useGeigerComms must be used inside <GeigerProvider>");
  return value;
}

/** Listener-friendly hook around `onEvent`. */
export function useGeigerEvent(handler: (event: WidgetEvent) => void): void {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    return GeigerComms.onEvent((event) => ref.current(event));
  }, []);
}
