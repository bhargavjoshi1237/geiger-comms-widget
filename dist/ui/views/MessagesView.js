import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// 2b — Your conversations.
//
// Open/Closed filter, a row per thread with status pill and unread count, and
// a "team is online" footer. Re-skinned into 1a: the bottom nav is supplied by
// the panel, so this view stops at the footer card.
import { useState } from "react";
import { Plus, Sparkles } from "../icons";
import { Avatar, AvatarStack, StatusPill, UnreadCount } from "../primitives";
export function MessagesView({ conversations, team, onOpen, onNew, }) {
    const [filter, setFilter] = useState("open");
    const open = conversations.filter((c) => c.status !== "closed");
    const closed = conversations.filter((c) => c.status === "closed");
    const shown = filter === "open" ? open : closed;
    const online = team.some((p) => p.online);
    return (_jsxs(_Fragment, { children: [_jsxs("header", { className: "gc-listhead", children: [_jsx("span", { className: "gc-listhead__title", children: "Your conversations" }), _jsxs("button", { type: "button", className: "gc-primarybtn", onClick: onNew, children: [_jsx(Plus, {}), "New"] })] }), _jsxs("div", { className: "gc-panel__body gc-panel__body--stack", children: [_jsxs("div", { className: "gc-filters", role: "tablist", "aria-label": "Filter conversations", children: [_jsxs("button", { type: "button", role: "tab", className: "gc-filter", "aria-selected": filter === "open", onClick: () => setFilter("open"), children: ["Open \u00B7 ", open.length] }), _jsxs("button", { type: "button", role: "tab", className: "gc-filter", "aria-selected": filter === "closed", onClick: () => setFilter("closed"), children: ["Closed \u00B7 ", closed.length] })] }), shown.map((c, i) => (_jsxs("button", { type: "button", className: "gc-convo", "data-active": i === 0 && filter === "open", "data-closed": c.status === "closed", onClick: () => onOpen(c.id), children: [c.with.ai ? (_jsx("div", { className: "gc-avatar gc-avatar--lg", "aria-hidden": "true", children: _jsx(Sparkles, { size: 14 }) })) : (_jsx(Avatar, { person: c.with, size: "lg", showStatus: true })), _jsxs("div", { className: "gc-convo__body", children: [_jsxs("div", { className: "gc-convo__top", children: [_jsx("span", { className: "gc-convo__title", children: c.title }), _jsx("span", { className: "gc-convo__time", children: c.time })] }), _jsxs("p", { className: c.unread ? "gc-convo__preview gc-convo__preview--unread" : "gc-convo__preview", children: [_jsxs("strong", { children: [c.previewAuthor, ":"] }), " ", c.preview] }), _jsxs("div", { className: "gc-convo__meta", children: [_jsx(StatusPill, { status: c.status }), c.unread ? _jsx(UnreadCount, { count: c.unread }) : null] })] })] }, c.id))), shown.length === 0 ? (_jsx("p", { style: { padding: "24px 14px", margin: 0, font: "400 12px var(--gc-font-sans)", color: "var(--gc-text-secondary)" }, children: "Nothing here yet." })) : null, _jsx("div", { className: "gc-listfoot", children: _jsxs("div", { className: "gc-teamcard", children: [_jsx(AvatarStack, { people: team }), _jsx("span", { children: online ? "Team is online now" : "Team is away — Aria can still help" })] }) })] })] }));
}
