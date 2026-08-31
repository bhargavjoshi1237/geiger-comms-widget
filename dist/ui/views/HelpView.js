import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// 2c — Help centre search.
//
// Live-filtered article list with the matched term highlighted, an "ask Aria
// instead" nudge above the results, and a "can't find it?" escape hatch.
import { useMemo, useState } from "react";
import { ChevronRight, FileText, Search, Sparkles, X } from "../icons";
import { Cap } from "../primitives";
/** Wraps every case-insensitive hit of `term` in a <mark>. */
function highlight(text, term) {
    const q = term.trim();
    if (!q)
        return text;
    const parts = [];
    const lower = text.toLowerCase();
    const needle = q.toLowerCase();
    let from = 0;
    for (;;) {
        const at = lower.indexOf(needle, from);
        if (at === -1)
            break;
        if (at > from)
            parts.push(text.slice(from, at));
        parts.push({ hit: text.slice(at, at + needle.length) });
        from = at + needle.length;
    }
    if (from < text.length)
        parts.push(text.slice(from));
    return parts.map((p, i) => typeof p === "string" ? _jsx("span", { children: p }, i) : _jsx("mark", { children: p.hit }, i));
}
export function HelpView({ articles, assistantName, initialQuery = "", onOpenArticle, onAsk, onMessageTeam, onClose, }) {
    const [query, setQuery] = useState(initialQuery);
    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q)
            return articles;
        return articles.filter((a) => a.title.toLowerCase().includes(q) ||
            a.excerpt.toLowerCase().includes(q) ||
            a.category.toLowerCase().includes(q));
    }, [articles, query]);
    return (_jsxs(_Fragment, { children: [_jsxs("header", { className: "gc-helphead", children: [_jsxs("div", { className: "gc-helphead__row", children: [_jsx("span", { className: "gc-listhead__title", children: "Help centre" }), _jsx("button", { type: "button", className: "gc-iconbtn gc-iconbtn--sm", onClick: onClose, "aria-label": "Close messenger", children: _jsx(X, {}) })] }), _jsxs("div", { className: "gc-search", style: { marginTop: 0 }, children: [_jsx(Search, { className: "gc-search__icon" }), _jsx("input", { type: "search", className: "gc-search__input", value: query, placeholder: "Search for help", "aria-label": "Search the help centre", onChange: (e) => setQuery(e.target.value) })] })] }), _jsxs("div", { className: "gc-panel__body", style: { padding: "12px 0" }, children: [_jsxs("button", { type: "button", className: "gc-suggest", onClick: onAsk, children: [_jsx(Sparkles, { size: 15, className: "gc-suggest__icon" }), _jsxs("div", { className: "gc-suggest__body", children: [_jsxs("p", { className: "gc-suggest__title", children: ["Ask ", assistantName, " instead"] }), _jsx("p", { className: "gc-suggest__desc", children: "She\u2019ll check your actual order rather than the general article." })] }), _jsx(ChevronRight, { size: 14, style: { color: "var(--gc-text-tertiary)", flex: "none", marginTop: 3 } })] }), _jsx("div", { style: { padding: "0 14px 6px" }, children: _jsxs(Cap, { children: [results.length, " ", results.length === 1 ? "article" : "articles"] }) }), results.map((a) => (_jsxs("button", { type: "button", className: "gc-article-row", onClick: () => onOpenArticle(a.id), children: [_jsx(FileText, { size: 14, className: "gc-article-row__icon" }), _jsxs("span", { style: { minWidth: 0 }, children: [_jsx("span", { className: "gc-article-row__title", children: highlight(a.title, query) }), _jsx("span", { className: "gc-article-row__desc", children: a.excerpt }), _jsxs("span", { className: "gc-article-row__meta", children: [a.category.toUpperCase(), " \u00B7 ", a.readingTime.toUpperCase()] })] })] }, a.id)))] }), _jsxs("div", { className: "gc-panel__footer gc-helpfoot", children: [_jsx("span", { className: "gc-helpfoot__text", children: "Can\u2019t find it?" }), _jsx("button", { type: "button", className: "gc-primarybtn", onClick: onMessageTeam, children: "Message the team" })] })] }));
}
