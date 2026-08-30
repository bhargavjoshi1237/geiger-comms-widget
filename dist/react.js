"use client";
import { jsx as _jsx } from "react/jsx-runtime";
// React bindings: GeigerProvider boots on mount, re-boots when the identity
// (jwt) changes, and shuts down on unmount — so a signed-out user never
// inherits the previous user's session.
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { GeigerComms } from "./index";
const GeigerContext = createContext(null);
export function GeigerProvider({ jwt, children, ...settings }) {
    const [isReady, setIsReady] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    // Identity changes re-boot; unrelated re-renders must not.
    const identityRef = useRef(null);
    const bootKey = `${settings.appId}:${jwt !== null && jwt !== void 0 ? jwt : ""}`;
    useEffect(() => {
        if (identityRef.current === bootKey)
            return;
        identityRef.current = bootKey;
        if (!settings.appId)
            return;
        GeigerComms.boot({ ...settings, jwt: jwt !== null && jwt !== void 0 ? jwt : undefined });
        setIsReady(true);
        // settings fields are plain values; bootKey covers identity.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bootKey]);
    useEffect(() => {
        const offs = [
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
    const value = useMemo(() => ({
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
    }), [isReady, unreadCount]);
    return _jsx(GeigerContext.Provider, { value: value, children: children });
}
export function useGeigerComms() {
    const value = useContext(GeigerContext);
    if (!value)
        throw new Error("useGeigerComms must be used inside <GeigerProvider>");
    return value;
}
/** Listener-friendly hook around `onEvent`. */
export function useGeigerEvent(handler) {
    const ref = useRef(handler);
    ref.current = handler;
    useEffect(() => {
        return GeigerComms.onEvent((event) => ref.current(event));
    }, []);
}
