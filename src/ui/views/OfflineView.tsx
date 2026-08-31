// 2g — Offline, leave a message.
//
// Away notice in the header, the AI offered as the immediate path, and an
// email-and-message fallback for anything it can't close out.

import { useState } from "react";
import { Clock, Sparkles, X } from "../icons";
import type { MessengerData } from "../model";

export function OfflineView({
  data,
  onAsk,
  onLeaveMessage,
  onClose,
}: {
  data: MessengerData;
  onAsk: () => void;
  onLeaveMessage: (draft: { email: string; body: string }) => void;
  onClose: () => void;
}) {
  const [email, setEmail] = useState(data.visitorEmail ?? "");
  const [body, setBody] = useState("");

  return (
    <>
      <header className="gc-offlinehead">
        <div className="gc-header__row">
          <div className="gc-header__brand">
            <div className="gc-header__logo" style={{ width: 22, height: 22, fontSize: 10 }} aria-hidden="true">
              {data.brand.initials}
            </div>
            <span className="gc-header__brandname" style={{ fontSize: 12.5 }}>
              {data.brand.name}
            </span>
          </div>
          <button type="button" className="gc-iconbtn gc-iconbtn--sm" onClick={onClose} aria-label="Close messenger">
            <X />
          </button>
        </div>
        <div className="gc-awaybar">
          <Clock />
          <span>
            The team is away{data.backAt ? <> — back at <strong>{data.backAt}</strong></> : null}.
          </span>
        </div>
      </header>

      <div className="gc-offline">
        <div className="gc-offercard">
          <Sparkles size={15} className="gc-offercard__icon" />
          <div style={{ minWidth: 0, flex: 1 }}>
            <p className="gc-offercard__title">{data.assistant.name} is still awake</p>
            <p className="gc-offercard__desc">
              She can answer most questions now and flag anything she can&rsquo;t for the morning.
            </p>
            <button type="button" className="gc-primarybtn" onClick={onAsk}>
              Ask {data.assistant.name} now
            </button>
          </div>
        </div>

        <div className="gc-rule">
          <span className="gc-rule__label">OR LEAVE A MESSAGE</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
          <div className="gc-field">
            <label className="gc-field__label" htmlFor="gc-offline-email">
              Email
            </label>
            <input
              id="gc-offline-email"
              type="email"
              className="gc-input"
              value={email}
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="gc-field gc-field--grow">
            <label className="gc-field__label" htmlFor="gc-offline-body">
              Message
            </label>
            <textarea
              id="gc-offline-body"
              className="gc-textarea"
              style={{ marginTop: 0, borderColor: "var(--gc-border)" }}
              value={body}
              placeholder="What can we help with?"
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
        </div>
      </div>

      <footer className="gc-panel__footer" style={{ padding: "12px 14px" }}>
        <button
          type="button"
          className="gc-outlinebtn"
          style={{ height: 38, borderRadius: 10, fontSize: 13 }}
          disabled={email.trim() === "" || body.trim() === ""}
          onClick={() => onLeaveMessage({ email: email.trim(), body: body.trim() })}
        >
          Send and email me the reply
        </button>
      </footer>
    </>
  );
}
