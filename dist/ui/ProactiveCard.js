import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// 2f — Proactive message.
//
// Sits above the launcher, not inside the panel: a compact card from a named
// teammate with two answers and a reply box. In 1a the launcher underneath
// stays circular (the design drew this beside 1b's pill).
import { useState } from "react";
import { ArrowUp, X } from "./icons";
import { Avatar } from "./primitives";
export function ProactiveCard({ message, onConfirm, onDismiss, onReply, }) {
    const [reply, setReply] = useState("");
    const send = () => {
        const text = reply.trim();
        if (!text)
            return;
        onReply(text);
        setReply("");
    };
    return (_jsxs("section", { className: "gc-proactive", "aria-label": `Message from ${message.from.name}`, children: [_jsxs("div", { className: "gc-proactive__head", children: [_jsx(Avatar, { person: message.from, size: "sm", showStatus: true }), _jsxs("div", { className: "gc-proactive__who", children: [_jsx("span", { className: "gc-proactive__name", children: message.from.name }), _jsx("span", { className: "gc-proactive__when", children: message.when.toUpperCase() })] }), _jsx("button", { type: "button", className: "gc-proactive__dismiss", onClick: onDismiss, "aria-label": "Dismiss message", children: _jsx(X, { size: 13 }) })] }), _jsxs("div", { className: "gc-proactive__body", children: [_jsx("p", { className: "gc-proactive__msg", children: message.body }), _jsxs("div", { className: "gc-proactive__actions", children: [_jsx("button", { type: "button", className: "gc-proactive__yes", onClick: onConfirm, children: message.confirmLabel }), _jsx("button", { type: "button", className: "gc-proactive__no", onClick: onDismiss, children: message.dismissLabel })] })] }), _jsx("div", { className: "gc-proactive__reply", children: _jsxs("div", { className: "gc-proactive__replybox", children: [_jsx("input", { value: reply, placeholder: "Reply\u2026", "aria-label": `Reply to ${message.from.name}`, onChange: (e) => setReply(e.target.value), onKeyDown: (e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    send();
                                }
                            } }), _jsx("button", { type: "button", className: "gc-proactive__send", onClick: send, "aria-label": "Send reply", children: _jsx(ArrowUp, { size: 12 }) })] }) })] }));
}
