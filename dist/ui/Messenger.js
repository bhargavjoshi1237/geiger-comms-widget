import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// The messenger — direction 1a, assembled.
//
// Owns the open/closed state, which screen is showing and which thread is
// selected; every screen below it is presentational. Routing is deliberately a
// plain tagged union rather than a router: the panel only ever has one screen,
// and "back" is always a known destination.
import { useCallback, useMemo, useState } from "react";
import { Launcher } from "./Launcher";
import { ProactiveCard } from "./ProactiveCard";
import { TabBar } from "./TabBar";
import { HomeView } from "./views/HomeView";
import { MessagesView } from "./views/MessagesView";
import { HelpView } from "./views/HelpView";
import { ArticleView } from "./views/ArticleView";
import { NewConversationView } from "./views/NewConversationView";
import { OfflineView } from "./views/OfflineView";
import { ThreadView } from "./views/ThreadView";
import { tabForView } from "./model";
export function Messenger({ data, defaultOpen = false, defaultView, inline = false, mobile = false, align = "right", hideLauncher = false, theme = "dark", onEvent, }) {
    const initialView = defaultView !== null && defaultView !== void 0 ? defaultView : (data.online ? { kind: "home" } : { kind: "offline" });
    const [open, setOpen] = useState(defaultOpen);
    const [view, setView] = useState(initialView);
    const [proactiveOpen, setProactiveOpen] = useState(Boolean(data.proactive));
    const [rating, setRating] = useState(0);
    const [helpQuery, setHelpQuery] = useState("");
    const emit = useCallback((name, meta) => onEvent === null || onEvent === void 0 ? void 0 : onEvent(name, meta), [onEvent]);
    const go = useCallback((next) => {
        setView(next);
        emit("space:opened", { space: next.kind });
    }, [emit]);
    const unread = useMemo(() => data.conversations.reduce((sum, c) => { var _a; return sum + ((_a = c.unread) !== null && _a !== void 0 ? _a : 0); }, 0), [data.conversations]);
    const recent = data.conversations[0];
    const conversation = view.kind === "conversation" ? data.conversations.find((c) => c.id === view.id) : undefined;
    const article = view.kind === "article" ? data.articles.find((a) => a.id === view.id) : undefined;
    const close = useCallback(() => {
        setOpen(false);
        emit("messenger:hidden");
    }, [emit]);
    const toggle = useCallback(() => {
        setOpen((prev) => {
            emit(prev ? "messenger:hidden" : "messenger:shown");
            return !prev;
        });
        setProactiveOpen(false);
    }, [emit]);
    const openThread = useCallback((id) => {
        setRating(0);
        go({ kind: "conversation", id });
    }, [go]);
    /** The AI thread is just the conversation whose participant is the assistant. */
    const askThread = useMemo(() => data.conversations.find((c) => c.with.ai && c.status !== "closed"), [data.conversations]);
    const openAsk = useCallback(() => {
        if (askThread)
            openThread(askThread.id);
        else
            go({ kind: "new" });
        emit("ask:opened");
    }, [askThread, openThread, go, emit]);
    const onTab = useCallback((tab) => {
        go({ kind: tab });
    }, [go]);
    const activeTab = tabForView(view);
    let screen = null;
    switch (view.kind) {
        case "home":
            screen = (_jsx(HomeView, { data: data, recent: recent, onAsk: openAsk, onOpenConversation: openThread, onSeeAll: () => go({ kind: "messages" }), onSearch: (q) => {
                    setHelpQuery(q);
                    go({ kind: "help" });
                }, onClose: close }));
            break;
        case "messages":
            screen = (_jsx(MessagesView, { conversations: data.conversations, team: data.team, onOpen: openThread, onNew: () => go({ kind: "new" }) }));
            break;
        case "help":
            screen = (_jsx(HelpView, { articles: data.articles, assistantName: data.assistant.name, initialQuery: helpQuery, onOpenArticle: (id) => go({ kind: "article", id }), onAsk: openAsk, onMessageTeam: () => go({ kind: "new" }), onClose: close }));
            break;
        case "article":
            screen = article ? (_jsx(ArticleView, { article: article, onBack: () => go({ kind: "help" }), onAskInstead: openAsk, onRate: (helpful) => emit("article:rated", { id: article.id, helpful }) })) : null;
            break;
        case "new":
            screen = (_jsx(NewConversationView, { data: data, onBack: () => go({ kind: "messages" }), onSend: (draft) => {
                    emit("conversation:started", { ...draft });
                    go({ kind: "messages" });
                } }));
            break;
        case "offline":
            screen = (_jsx(OfflineView, { data: data, onAsk: openAsk, onLeaveMessage: (draft) => {
                    emit("message:left", { email: draft.email });
                    if (draft.email)
                        emit("user:email", { email: draft.email });
                }, onClose: close }));
            break;
        case "conversation":
            screen = conversation ? (_jsx(ThreadView, { conversation: conversation, dayMark: conversation.dayMark, showDropzone: conversation.attachmentMode, assistantName: data.assistant.name, rating: rating, onRatingChange: setRating, onSubmitRating: () => {
                    emit("conversation:rated", { id: conversation.id, rating });
                    go({ kind: "messages" });
                }, onSkipRating: () => go({ kind: "messages" }), onBack: () => go({ kind: "messages" }), onGetHuman: () => emit("handover:requested", { id: conversation.id }), onOpenArticle: (id) => go({ kind: "article", id }), onSend: (text) => emit("message:sent", { id: conversation.id, text }), onQuickReply: (text) => emit("message:sent", { id: conversation.id, text, quick: true }), onRateMessage: (id, helpful) => emit("answer:rated", { id, helpful }) })) : null;
            break;
    }
    const panel = (_jsxs("div", { className: mobile ? "gc-panel gc-panel--mobile" : "gc-panel", role: "dialog", "aria-label": "Messenger", children: [mobile ? (_jsxs("div", { className: "gc-statusbar", "aria-hidden": "true", children: [_jsx("span", { children: "9:41" }), _jsxs("span", { className: "gc-statusbar__icons", children: [_jsx("span", { className: "gc-statusbar__battery" }), _jsx("span", { className: "gc-statusbar__tip" })] })] })) : null, screen, activeTab ? _jsx(TabBar, { active: activeTab, unread: unread, onChange: onTab }) : null, mobile ? _jsx("div", { className: "gc-homebar", "aria-hidden": "true" }) : null] }));
    return (_jsx("div", { className: "gc-widget", "data-theme": theme, children: _jsxs("div", { className: "gc-root", "data-align": align, "data-inline": inline || undefined, children: [open ? panel : null, !open && proactiveOpen && data.proactive ? (_jsx(ProactiveCard, { message: data.proactive, onConfirm: () => {
                        setProactiveOpen(false);
                        setOpen(true);
                        openAsk();
                    }, onDismiss: () => {
                        setProactiveOpen(false);
                        emit("proactive:dismissed");
                    }, onReply: (text) => {
                        setProactiveOpen(false);
                        setOpen(true);
                        emit("message:sent", { text, proactive: true });
                    } })) : null, hideLauncher ? null : (_jsx(Launcher, { state: open ? "open" : unread > 0 ? "unread" : "idle", unread: unread, onClick: toggle }))] }) }));
}
