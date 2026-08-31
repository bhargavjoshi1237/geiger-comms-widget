import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// 2e — Start a new conversation.
//
// Topic chips, an order picker (only when the topic needs one) and a free-text
// box, with the response-time expectation set just above the send button.
import { useState } from "react";
import { AvatarStack, Cap, HeaderBar } from "../primitives";
export function NewConversationView({ data, onBack, onSend, }) {
    var _a, _b, _c;
    const [topic, setTopic] = useState((_a = data.topics[0]) !== null && _a !== void 0 ? _a : "");
    const [orderId, setOrderId] = useState((_c = (_b = data.orders[0]) === null || _b === void 0 ? void 0 : _b.id) !== null && _c !== void 0 ? _c : "");
    const [body, setBody] = useState("");
    // The order picker is only meaningful for order-shaped topics.
    const needsOrder = /order|return|deliver/i.test(topic);
    return (_jsxs(_Fragment, { children: [_jsx(HeaderBar, { onBack: onBack, children: _jsx("span", { className: "gc-header__title", children: "New conversation" }) }), _jsxs("div", { className: "gc-newconvo", children: [_jsxs("div", { children: [_jsx(Cap, { children: "What\u2019s it about?" }), _jsx("div", { className: "gc-chips", children: data.topics.map((t) => (_jsx("button", { type: "button", className: "gc-chip", "aria-pressed": t === topic, onClick: () => setTopic(t), children: t }, t))) })] }), needsOrder && data.orders.length > 0 ? (_jsxs("div", { children: [_jsx(Cap, { children: "Which order?" }), _jsx("div", { className: "gc-radiogroup", role: "radiogroup", "aria-label": "Which order?", children: data.orders.map((o) => (_jsxs("button", { type: "button", className: "gc-radio", role: "radio", "aria-checked": o.id === orderId, onClick: () => setOrderId(o.id), children: [_jsx("span", { className: "gc-radio__mark", "aria-hidden": "true" }), _jsxs("span", { className: "gc-radio__body", children: [_jsx("span", { className: "gc-radio__title", children: o.label }), _jsx("span", { className: "gc-radio__sub", children: o.status })] })] }, o.id))) })] })) : null, _jsxs("div", { className: "gc-field gc-field--grow", children: [_jsx(Cap, { children: "Your message" }), _jsx("textarea", { className: "gc-textarea", value: body, onChange: (e) => setBody(e.target.value), "aria-label": "Your message", placeholder: "Tell us what's happened \u2014 the more detail, the fewer questions back." })] })] }), _jsxs("footer", { className: "gc-panel__footer gc-newconvofoot", children: [_jsxs("div", { className: "gc-newconvofoot__eta", children: [_jsx(AvatarStack, { people: data.team }), _jsxs("span", { children: [data.assistant.name, " answers first \u00B7 a person within ~2 minutes"] })] }), _jsx("button", { type: "button", className: "gc-primarybtn gc-primarybtn--block", disabled: body.trim() === "", onClick: () => onSend({ topic, orderId: needsOrder ? orderId : undefined, body: body.trim() }), children: "Send message" })] })] }));
}
