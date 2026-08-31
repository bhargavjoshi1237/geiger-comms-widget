import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// The three-tab bottom nav: Home · Messages · Help.
//
// Only tab roots show it. Sub-screens (a thread, an article) hide it so the
// panel reads as one task — see tabForView() in ./model.
import { BookHeart, Mail, MessageCircle } from "./icons";
const TABS = [
    { id: "home", label: "Home", Icon: MessageCircle },
    { id: "messages", label: "Messages", Icon: Mail },
    { id: "help", label: "Help", Icon: BookHeart },
];
export function TabBar({ active, unread = 0, onChange, }) {
    return (_jsx("nav", { className: "gc-tabs", "aria-label": "Messenger sections", children: TABS.map(({ id, label, Icon }) => {
            const selected = id === active;
            const badge = id === "messages" && unread > 0;
            return (_jsxs("button", { type: "button", className: "gc-tab", role: "tab", "aria-selected": selected, onClick: () => onChange(id), children: [_jsx(Icon, {}), _jsx("span", { children: label }), badge ? (_jsx("span", { className: "gc-tab__badge", "aria-hidden": "true", children: unread })) : null, badge ? _jsxs("span", { className: "gc-sr", children: [", ", unread, " unread"] }) : null] }, id));
        }) }));
}
