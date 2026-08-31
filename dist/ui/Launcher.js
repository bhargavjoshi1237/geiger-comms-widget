import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// The circular launcher — direction 1a's defining element.
//
// Three drawn states: idle (white circle, chat glyph), unread (same, with a
// blue count badge) and open (neutral surface, close glyph).
import { MessageCircle, X } from "./icons";
export function Launcher({ state, unread = 0, onClick, label, }) {
    const open = state === "open";
    const name = label !== null && label !== void 0 ? label : (open
        ? "Close messenger"
        : unread > 0
            ? `Open messenger, ${unread} unread`
            : "Open messenger");
    return (_jsxs("button", { type: "button", className: "gc-launcher", "data-state": state, onClick: onClick, "aria-label": name, "aria-expanded": open, children: [open ? _jsx(X, { size: 20 }) : _jsx(MessageCircle, { size: 24 }), !open && unread > 0 ? (_jsx("span", { className: "gc-launcher__badge", "aria-hidden": "true", children: unread })) : null] }));
}
