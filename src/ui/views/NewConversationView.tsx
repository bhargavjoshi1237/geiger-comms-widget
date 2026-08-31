// 2e — Start a new conversation.
//
// Topic chips, an order picker (only when the topic needs one) and a free-text
// box, with the response-time expectation set just above the send button.

import { useState } from "react";
import { AvatarStack, Cap, HeaderBar } from "../primitives";
import type { MessengerData } from "../model";

export function NewConversationView({
  data,
  onBack,
  onSend,
}: {
  data: MessengerData;
  onBack: () => void;
  onSend: (draft: { topic: string; orderId?: string; body: string }) => void;
}) {
  const [topic, setTopic] = useState(data.topics[0] ?? "");
  const [orderId, setOrderId] = useState(data.orders[0]?.id ?? "");
  const [body, setBody] = useState("");

  // The order picker is only meaningful for order-shaped topics.
  const needsOrder = /order|return|deliver/i.test(topic);

  return (
    <>
      <HeaderBar onBack={onBack}>
        <span className="gc-header__title">New conversation</span>
      </HeaderBar>

      <div className="gc-newconvo">
        <div>
          <Cap>What&rsquo;s it about?</Cap>
          <div className="gc-chips">
            {data.topics.map((t) => (
              <button
                key={t}
                type="button"
                className="gc-chip"
                aria-pressed={t === topic}
                onClick={() => setTopic(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {needsOrder && data.orders.length > 0 ? (
          <div>
            <Cap>Which order?</Cap>
            <div className="gc-radiogroup" role="radiogroup" aria-label="Which order?">
              {data.orders.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className="gc-radio"
                  role="radio"
                  aria-checked={o.id === orderId}
                  onClick={() => setOrderId(o.id)}
                >
                  <span className="gc-radio__mark" aria-hidden="true" />
                  <span className="gc-radio__body">
                    <span className="gc-radio__title">{o.label}</span>
                    <span className="gc-radio__sub">{o.status}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="gc-field gc-field--grow">
          <Cap>Your message</Cap>
          <textarea
            className="gc-textarea"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            aria-label="Your message"
            placeholder="Tell us what's happened — the more detail, the fewer questions back."
          />
        </div>
      </div>

      <footer className="gc-panel__footer gc-newconvofoot">
        <div className="gc-newconvofoot__eta">
          <AvatarStack people={data.team} />
          <span>
            {data.assistant.name} answers first · a person within ~2 minutes
          </span>
        </div>
        <button
          type="button"
          className="gc-primarybtn gc-primarybtn--block"
          disabled={body.trim() === ""}
          onClick={() => onSend({ topic, orderId: needsOrder ? orderId : undefined, body: body.trim() })}
        >
          Send message
        </button>
      </footer>
    </>
  );
}
