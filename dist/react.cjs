"use strict";
// React bindings: GeigerProvider boots on mount, re-boots when the identity
// (jwt) changes, and shuts down on unmount — so a signed-out user never
// inherits the previous user's session.
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeigerProvider = GeigerProvider;
exports.useGeigerComms = useGeigerComms;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const index_1 = require("./index");
const GeigerContext = (0, react_1.createContext)(null);
function GeigerProvider({ jwt, children, ...settings }) {
    const [isReady, setIsReady] = (0, react_1.useState)(false);
    const [unreadCount, setUnreadCount] = (0, react_1.useState)(0);
    // Identity changes re-boot; unrelated re-renders must not.
    const identityRef = (0, react_1.useRef)(null);
    const bootKey = `${settings.appId}:${jwt !== null && jwt !== void 0 ? jwt : ""}`;
    (0, react_1.useEffect)(() => {
        if (identityRef.current === bootKey)
            return;
        identityRef.current = bootKey;
        if (!settings.appId)
            return;
        index_1.GeigerComms.boot({ ...settings, jwt: jwt !== null && jwt !== void 0 ? jwt : undefined });
        setIsReady(true);
        // settings fields are plain values; bootKey covers identity.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bootKey]);
    (0, react_1.useEffect)(() => {
        const offs = [
            index_1.GeigerComms.onUnreadCountChange(setUnreadCount),
            index_1.GeigerComms.onShow(() => setIsReady(true)),
        ];
        return () => {
            offs.forEach((off) => off());
            if (identityRef.current !== null) {
                index_1.GeigerComms.shutdown();
                identityRef.current = null;
                setIsReady(false);
                setUnreadCount(0);
            }
        };
    }, []);
    const value = (0, react_1.useMemo)(() => ({
        isReady,
        unreadCount,
        open: () => index_1.GeigerComms.show(),
        close: () => index_1.GeigerComms.hide(),
        showSpace: (name) => index_1.GeigerComms.showSpace(name),
        showMessages: () => index_1.GeigerComms.showMessages(),
        showNewMessage: (text) => index_1.GeigerComms.showNewMessage(text),
        showArticle: (id) => index_1.GeigerComms.showArticle(id),
        showNews: (id) => index_1.GeigerComms.showNews(id),
        showTicket: (id) => index_1.GeigerComms.showTicket(id),
    }), [isReady, unreadCount]);
    return (0, jsx_runtime_1.jsx)(GeigerContext.Provider, { value: value, children: children });
}
function useGeigerComms() {
    const value = (0, react_1.useContext)(GeigerContext);
    if (!value)
        throw new Error("useGeigerComms must be used inside <GeigerProvider>");
    return value;
}
