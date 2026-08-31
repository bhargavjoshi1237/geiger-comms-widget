import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// 2d — Article reader.
//
// Category eyebrow, title, byline, body blocks and a "did this answer your
// question?" footer that offers the AI as the next step.
import { ArrowUpRight, Clock, ThumbsUp } from "../icons";
import { HeaderBar } from "../primitives";
export function ArticleView({ article, onBack, onAskInstead, onRate, onOpenExternal, }) {
    return (_jsxs(_Fragment, { children: [_jsx(HeaderBar, { onBack: onBack, action: _jsx("button", { type: "button", className: "gc-iconbtn gc-iconbtn--sm", onClick: onOpenExternal, "aria-label": "Open in help centre", children: _jsx(ArrowUpRight, {}) }), children: _jsx("span", { className: "gc-header__eyebrow", children: article.category.toUpperCase() }) }), _jsxs("article", { className: "gc-article", children: [_jsx("h2", { children: article.title }), article.author ? (_jsxs("div", { className: "gc-article__byline", children: [_jsx("div", { className: "gc-avatar gc-avatar--xs", "aria-hidden": "true", children: article.author.initials }), _jsxs("span", { children: [article.author.name.toUpperCase(), article.updated ? ` · UPDATED ${article.updated.toUpperCase()}` : ""] })] })) : null, _jsx("div", { className: "gc-article__divider" }), article.blocks.map((block, i) => {
                        switch (block.type) {
                            case "lead":
                                return (_jsx("p", { className: "gc-article__lead", children: block.text }, i));
                            case "heading":
                                return (_jsx("p", { className: "gc-article__h3", children: block.text }, i));
                            case "paragraph":
                                return (_jsx("p", { className: "gc-article__p", children: block.text }, i));
                            case "callout":
                                return (_jsxs("aside", { className: "gc-callout", children: [_jsx(Clock, {}), _jsx("p", { children: block.text })] }, i));
                        }
                    })] }), _jsxs("footer", { className: "gc-panel__footer gc-articlefoot", children: [_jsxs("div", { className: "gc-articlefoot__row", children: [_jsx("span", { className: "gc-articlefoot__label", children: "Did this answer your question?" }), _jsxs("div", { className: "gc-articlefoot__thumbs", children: [_jsx("button", { type: "button", className: "gc-thumb gc-thumb--up", onClick: () => onRate(true), "aria-label": "Yes", children: _jsx(ThumbsUp, { size: 13 }) }), _jsx("button", { type: "button", className: "gc-thumb gc-thumb--down", onClick: () => onRate(false), "aria-label": "No", children: _jsx(ThumbsUp, { size: 13 }) })] })] }), _jsx("button", { type: "button", className: "gc-outlinebtn", onClick: onAskInstead, children: "Ask about my order instead" })] })] }));
}
