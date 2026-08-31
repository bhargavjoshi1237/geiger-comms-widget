import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// The message composer that anchors the AI and human threads.
//
// Auto-grows to a 96px cap (matching the design's four-ish lines), sends on
// Enter, and keeps Shift+Enter for a newline.
import { useLayoutEffect, useRef, useState } from "react";
import { ArrowUp, ImageIcon, Paperclip } from "./icons";
export function Composer({ placeholder = "Message…", note, allowImages = true, onSend, onAttach, }) {
    const [value, setValue] = useState("");
    const ref = useRef(null);
    useLayoutEffect(() => {
        const el = ref.current;
        if (!el)
            return;
        // Reset first so the box can shrink again when text is deleted.
        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
    }, [value]);
    const send = () => {
        const text = value.trim();
        if (!text)
            return;
        onSend === null || onSend === void 0 ? void 0 : onSend(text);
        setValue("");
    };
    return (_jsxs("div", { className: "gc-panel__footer gc-composer", children: [_jsxs("div", { className: "gc-composer__box", children: [_jsx("textarea", { ref: ref, className: "gc-composer__input", rows: 1, value: value, placeholder: placeholder, "aria-label": placeholder, onChange: (e) => setValue(e.target.value), onKeyDown: (e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                send();
                            }
                        } }), _jsx("button", { type: "button", className: "gc-composer__btn", onClick: onAttach, "aria-label": "Attach file", children: _jsx(Paperclip, {}) }), allowImages ? (_jsx("button", { type: "button", className: "gc-composer__btn", onClick: onAttach, "aria-label": "Add image", children: _jsx(ImageIcon, {}) })) : null, _jsx("button", { type: "button", className: "gc-composer__btn gc-composer__send", onClick: send, disabled: value.trim() === "", "aria-label": "Send message", children: _jsx(ArrowUp, {}) })] }), note ? _jsx("p", { className: "gc-composer__note", children: note }) : null] }));
}
