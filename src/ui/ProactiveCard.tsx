// 2f — Proactive message.
//
// Sits above the launcher, not inside the panel: a compact card from a named
// teammate with two answers and a reply box. In 1a the launcher underneath
// stays circular (the design drew this beside 1b's pill).

import { useState } from "react";
import { ArrowUp, X } from "./icons";
import { Avatar } from "./primitives";
import type { ProactiveMessage } from "./model";

export function ProactiveCard({
  message,
  onConfirm,
  onDismiss,
  onReply,
}: {
  message: ProactiveMessage;
  onConfirm: () => void;
  onDismiss: () => void;
  onReply: (text: string) => void;
}) {
  const [reply, setReply] = useState("");

  const send = () => {
    const text = reply.trim();
    if (!text) return;
    onReply(text);
    setReply("");
  };

  return (
    <section className="gc-proactive" aria-label={`Message from ${message.from.name}`}>
      <div className="gc-proactive__head">
        <Avatar person={message.from} size="sm" showStatus />
        <div className="gc-proactive__who">
          <span className="gc-proactive__name">{message.from.name}</span>
          <span className="gc-proactive__when">{message.when.toUpperCase()}</span>
        </div>
        <button type="button" className="gc-proactive__dismiss" onClick={onDismiss} aria-label="Dismiss message">
          <X size={13} />
        </button>
      </div>

      <div className="gc-proactive__body">
        <p className="gc-proactive__msg">{message.body}</p>
        <div className="gc-proactive__actions">
          <button type="button" className="gc-proactive__yes" onClick={onConfirm}>
            {message.confirmLabel}
          </button>
          <button type="button" className="gc-proactive__no" onClick={onDismiss}>
            {message.dismissLabel}
          </button>
        </div>
      </div>

      <div className="gc-proactive__reply">
        <div className="gc-proactive__replybox">
          <input
            value={reply}
            placeholder="Reply…"
            aria-label={`Reply to ${message.from.name}`}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                send();
              }
            }}
          />
          <button type="button" className="gc-proactive__send" onClick={send} aria-label="Send reply">
            <ArrowUp size={12} />
          </button>
        </div>
      </div>
    </section>
  );
}
