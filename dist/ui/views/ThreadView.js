import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// The conversation screen.
//
// One renderer covers every thread the design draws: the AI conversation from
// 1a, the human handoff (2a), the post-chat rating (2h) and the attachment
// states (2i). What changes between them is the data, not the layout — an AI
// author gets steps and sources, a human author gets an avatar and a read
// receipt, a closed thread swaps the composer for the rating card.
import { useEffect, useRef } from "react";
import { CheckCheck, FileText, ImageIcon, Mail, Sparkles, Star, ThumbsUp, User, X } from "../icons";
import { AiBadge, Avatar, HeaderBar, StatusPill } from "../primitives";
import { Composer } from "../Composer";
/* --------------------------------------------------------------- header -- */
function ThreadHeader({ person, conversation, onBack, onGetHuman, }) {
    // 2i titles the header with the thread subject rather than the participant.
    if (conversation.attachmentMode) {
        return (_jsxs(HeaderBar, { onBack: onBack, children: [_jsx("span", { className: "gc-header__title", children: conversation.title }), _jsx(AiBadge, {})] }));
    }
    if (conversation.status === "closed") {
        // 2h: no back arrow, just who it was with and a closed pill.
        return (_jsxs("header", { className: "gc-header gc-header--bar", children: [_jsx(Avatar, { person: person, size: "sm" }), _jsx("span", { className: "gc-header__title", children: person.name }), _jsx(StatusPill, { status: "closed" })] }));
    }
    return (_jsxs(HeaderBar, { onBack: onBack, children: [person.ai ? (_jsx("div", { className: "gc-avatar", "aria-hidden": "true", children: _jsx(Sparkles, { size: 14 }) })) : (_jsx(Avatar, { person: person, showStatus: true })), _jsxs("div", { className: "gc-header__ident", children: [_jsxs("div", { className: "gc-header__identtop", children: [_jsx("span", { className: "gc-header__name", children: person.name }), person.ai ? _jsx(AiBadge, {}) : null] }), person.role ? _jsx("span", { className: "gc-header__sub", children: person.role }) : null] }), person.ai && onGetHuman ? (_jsxs("button", { type: "button", className: "gc-ghostbtn", onClick: onGetHuman, children: [_jsx(User, {}), "Get a human"] })) : null] }));
}
/* ---------------------------------------------------------- attachments -- */
function AttachmentCard({ attachment, onCancel }) {
    if (attachment.error) {
        return (_jsxs("div", { className: "gc-upload gc-upload--error", children: [_jsxs("div", { className: "gc-upload__row", children: [_jsx(ImageIcon, { size: 14 }), _jsx("span", { className: "gc-upload__name", children: attachment.name })] }), _jsx("span", { className: "gc-upload__error", role: "alert", children: attachment.error })] }));
    }
    if (attachment.progress !== undefined) {
        return (_jsxs("div", { className: "gc-upload", children: [_jsxs("div", { className: "gc-upload__row", children: [_jsx(FileText, { size: 14 }), _jsx("span", { className: "gc-upload__name", children: attachment.name }), _jsx("button", { type: "button", className: "gc-upload__cancel", onClick: onCancel, "aria-label": `Cancel upload of ${attachment.name}`, children: _jsx(X, { size: 12 }) })] }), _jsx("div", { className: "gc-progress", role: "progressbar", "aria-valuenow": attachment.progress, "aria-valuemin": 0, "aria-valuemax": 100, "aria-label": `Uploading ${attachment.name}`, children: _jsx("div", { className: "gc-progress__bar", style: { width: `${attachment.progress}%` } }) }), _jsxs("span", { className: "gc-upload__status", children: ["UPLOADING \u00B7 ", attachment.progress, "%"] })] }));
    }
    return (_jsxs("div", { className: "gc-attach-img", children: [_jsx("div", { className: "gc-attach-img__thumb", "aria-hidden": "true", children: _jsx(ImageIcon, { size: 22 }) }), _jsxs("div", { className: "gc-attach-img__meta", children: [_jsx("span", { className: "gc-attach-img__name", children: attachment.name }), attachment.size ? _jsx("span", { className: "gc-attach-img__size", children: attachment.size }) : null] })] }));
}
/* ------------------------------------------------------------- messages -- */
function AnswerBody({ message, onOpenArticle, }) {
    var _a, _b;
    return (_jsxs(_Fragment, { children: [message.body, ((_a = message.steps) === null || _a === void 0 ? void 0 : _a.length) ? (_jsx("ol", { className: "gc-steps", children: message.steps.map((step, i) => (_jsxs("li", { className: "gc-step", style: { listStyle: "none" }, children: [_jsx("span", { className: "gc-step__n", children: i + 1 }), step.text] }, step.text))) })) : null, ((_b = message.sources) === null || _b === void 0 ? void 0 : _b.length) ? (_jsxs("div", { className: "gc-sources", children: [_jsx("span", { className: "gc-cap", children: "Sources" }), message.sources.map((source) => (_jsxs("button", { type: "button", className: "gc-source", onClick: () => onOpenArticle(source.articleId), children: [_jsx(FileText, {}), source.title] }, source.articleId)))] })) : null] }));
}
function MessageRow({ message, onOpenArticle, onRate, }) {
    var _a, _b;
    if (message.author === "system") {
        return (_jsx("div", { className: "gc-rule", children: _jsx("span", { className: "gc-rule__label", children: message.body }) }));
    }
    if (message.author === "visitor") {
        const hasAttachments = (_a = message.attachments) === null || _a === void 0 ? void 0 : _a.length;
        if (hasAttachments || message.readReceipt) {
            return (_jsxs("div", { className: "gc-sent", children: [message.body ? _jsx("div", { className: "gc-bubble--user gc-bubble", children: message.body }) : null, (_b = message.attachments) === null || _b === void 0 ? void 0 : _b.map((a) => (_jsx(AttachmentCard, { attachment: a }, a.id))), message.readReceipt ? (_jsxs("span", { className: "gc-receipt", children: [message.readReceipt, _jsx(CheckCheck, {})] })) : null] }));
        }
        return _jsx("div", { className: "gc-bubble gc-bubble--user", children: message.body });
    }
    if (message.author === "agent") {
        return (_jsxs("div", { className: "gc-msgrow", children: [message.from ? _jsx(Avatar, { person: message.from, size: "sm" }) : null, _jsx("div", { className: "gc-bubble gc-bubble--agent", children: message.body })] }));
    }
    // AI.
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: message.steps || message.sources ? "gc-bubble" : "gc-bubble gc-bubble--sys", children: _jsx(AnswerBody, { message: message, onOpenArticle: onOpenArticle }) }), message.askFeedback ? (_jsxs("div", { className: "gc-feedback", children: [_jsx("span", { className: "gc-feedback__label", children: "Was this helpful?" }), _jsx("button", { type: "button", className: "gc-thumb gc-thumb--up", onClick: () => onRate(message.id, true), "aria-label": "Helpful", children: _jsx(ThumbsUp, {}) }), _jsx("button", { type: "button", className: "gc-thumb gc-thumb--down", onClick: () => onRate(message.id, false), "aria-label": "Not helpful", children: _jsx(ThumbsUp, {}) })] })) : null] }));
}
/* --------------------------------------------------------------- rating -- */
function RatingCard({ value, onChange, onSubmit, onSkip, agentName, }) {
    return (_jsxs("section", { className: "gc-rating", "aria-label": "Rate this conversation", children: [_jsx("p", { className: "gc-rating__title", children: "How did we do?" }), _jsxs("p", { className: "gc-rating__sub", children: ["Rating helps ", agentName, " and the team."] }), _jsx("div", { className: "gc-stars", role: "radiogroup", "aria-label": "Rating out of 5", children: [1, 2, 3, 4, 5].map((n) => (_jsx("button", { type: "button", className: "gc-star", "data-filled": n <= value, role: "radio", "aria-checked": n === value, "aria-label": `${n} out of 5`, onClick: () => onChange(n), children: _jsx(Star, { filled: n <= value }) }, n))) }), _jsx("textarea", { className: "gc-rating__comment", placeholder: "Add a comment (optional)", "aria-label": "Comment" }), _jsxs("div", { className: "gc-rating__actions", children: [_jsx("button", { type: "button", className: "gc-primarybtn", onClick: onSubmit, children: "Send rating" }), _jsx("button", { type: "button", className: "gc-textbtn", onClick: onSkip, children: "Skip" })] })] }));
}
export function ThreadView({ conversation, dayMark, showDropzone, assistantName, rating, onRatingChange, onSubmitRating, onSkipRating, onBack, onGetHuman, onOpenArticle, onSend, onQuickReply, onRateMessage, }) {
    var _a, _b;
    const person = conversation.with;
    const closed = conversation.status === "closed";
    const threadRef = useRef(null);
    // Keep the newest message in view as the thread grows.
    useEffect(() => {
        const el = threadRef.current;
        if (el)
            el.scrollTop = el.scrollHeight;
    }, [conversation.messages.length, conversation.typing]);
    return (_jsxs(_Fragment, { children: [_jsx(ThreadHeader, { person: person, conversation: conversation, onBack: onBack, onGetHuman: onGetHuman }), _jsxs("div", { ref: threadRef, className: person.ai && !closed ? "gc-thread" : "gc-thread gc-thread--tight", role: "log", "aria-label": `Conversation with ${person.name}`, children: [dayMark ? _jsx("div", { className: "gc-daymark", children: dayMark }) : null, conversation.messages.map((message) => (_jsx(MessageRow, { message: message, onOpenArticle: onOpenArticle, onRate: onRateMessage }, message.id))), conversation.typing ? (_jsxs("div", { className: "gc-msgrow gc-msgrow--typing", children: [_jsx(Avatar, { person: person, size: "sm" }), _jsxs("div", { className: "gc-typing", "aria-hidden": "true", children: [_jsx("span", { className: "gc-dot" }), _jsx("span", { className: "gc-dot" }), _jsx("span", { className: "gc-dot" })] }), _jsxs("span", { className: "gc-typing__label", children: [person.name, " is typing"] })] })) : null, showDropzone ? (_jsxs("div", { className: "gc-dropzone", children: [_jsx("p", { className: "gc-dropzone__title", children: "Drop files to attach" }), _jsx("p", { className: "gc-dropzone__hint", children: "JPG, PNG, PDF \u00B7 25 MB" })] })) : null, conversation.transcriptNudge ? (_jsxs("div", { className: "gc-nudge", children: [_jsx(Mail, { size: 14, style: { color: "var(--gc-text-secondary)", flex: "none" } }), _jsx("span", { className: "gc-nudge__text", children: conversation.transcriptNudge }), _jsx("button", { type: "button", className: "gc-nudge__toggle", "aria-pressed": "true", children: "On" })] })) : null, conversation.awaitingRating ? (_jsx(RatingCard, { value: rating, onChange: onRatingChange, onSubmit: onSubmitRating, onSkip: onSkipRating, agentName: (_a = person.name.split(" ")[0]) !== null && _a !== void 0 ? _a : person.name })) : null, ((_b = conversation.quickReplies) === null || _b === void 0 ? void 0 : _b.length) ? (_jsx("div", { className: "gc-replies", children: conversation.quickReplies.map((reply) => (_jsx("button", { type: "button", className: "gc-reply", onClick: () => onQuickReply(reply), children: reply }, reply))) })) : null] }), closed ? null : (_jsx(Composer, { placeholder: showDropzone ? "Add a note…" : person.ai ? "Message…" : `Message ${person.name.split(" ")[0]}…`, note: person.ai && !showDropzone ? `${assistantName} is an AI assistant. Ask for a person any time.` : undefined, allowImages: person.ai && !showDropzone, onSend: onSend }))] }));
}
