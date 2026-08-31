import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ChevronLeft, CircleCheck, X } from "./icons";
/* -------------------------------------------------------------- avatar -- */
export function Avatar({ person, size = "md", showStatus = false, }) {
    const cls = size === "md" ? "gc-avatar" : `gc-avatar gc-avatar--${size}`;
    const dot = _jsx("div", { className: cls, children: person.initials });
    if (!showStatus || !person.online)
        return dot;
    return (_jsxs("div", { className: "gc-avatar-wrap", children: [dot, _jsx("span", { className: "gc-online-dot" }), _jsxs("span", { className: "gc-sr", children: [person.name, " is online"] })] }));
}
export function AvatarStack({ people }) {
    return (_jsx("div", { className: "gc-avatar-stack", children: people.map((p) => (_jsx("div", { className: "gc-avatar", children: p.initials }, p.id))) }));
}
/* --------------------------------------------------------------- chips -- */
export function AiBadge() {
    return (_jsx("span", { className: "gc-badge-ai", title: "Answered by AI", children: "AI" }));
}
export function Cap({ children }) {
    return _jsx("span", { className: "gc-cap", children: children });
}
const STATUS_LABEL = {
    open: "Open",
    waiting: "Waiting on you",
    closed: "Closed",
};
export function StatusPill({ status }) {
    if (status === "open") {
        return (_jsxs("span", { className: "gc-pill gc-pill--open", children: [_jsx("span", { className: "gc-pill__dot" }), STATUS_LABEL.open] }));
    }
    return (_jsxs("span", { className: "gc-pill", children: [status === "closed" ? _jsx(CircleCheck, {}) : null, STATUS_LABEL[status]] }));
}
export function UnreadCount({ count }) {
    return (_jsxs("span", { className: "gc-count", children: [count, _jsx("span", { className: "gc-sr", children: " unread messages" })] }));
}
/* -------------------------------------------------------------- headers -- */
/** The plain back / title / action bar used by every sub-screen. */
export function HeaderBar({ onBack, onClose, children, action, }) {
    return (_jsxs("header", { className: "gc-header gc-header--bar", children: [onBack ? (_jsx("button", { type: "button", className: "gc-iconbtn gc-iconbtn--sm", onClick: onBack, "aria-label": "Back", children: _jsx(ChevronLeft, {}) })) : null, children, action, onClose ? (_jsx("button", { type: "button", className: "gc-iconbtn gc-iconbtn--sm", onClick: onClose, "aria-label": "Close messenger", children: _jsx(X, {}) })) : null] }));
}
