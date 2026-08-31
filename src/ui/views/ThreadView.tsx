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
import type { Attachment, Conversation, Message, Person } from "../model";

/* --------------------------------------------------------------- header -- */

function ThreadHeader({
  person,
  conversation,
  onBack,
  onGetHuman,
}: {
  person: Person;
  conversation: Conversation;
  onBack: () => void;
  onGetHuman?: () => void;
}) {
  // 2i titles the header with the thread subject rather than the participant.
  if (conversation.attachmentMode) {
    return (
      <HeaderBar onBack={onBack}>
        <span className="gc-header__title">{conversation.title}</span>
        <AiBadge />
      </HeaderBar>
    );
  }

  if (conversation.status === "closed") {
    // 2h: no back arrow, just who it was with and a closed pill.
    return (
      <header className="gc-header gc-header--bar">
        <Avatar person={person} size="sm" />
        <span className="gc-header__title">{person.name}</span>
        <StatusPill status="closed" />
      </header>
    );
  }

  return (
    <HeaderBar onBack={onBack}>
      {person.ai ? (
        <div className="gc-avatar" aria-hidden="true">
          <Sparkles size={14} />
        </div>
      ) : (
        <Avatar person={person} showStatus />
      )}
      <div className="gc-header__ident">
        <div className="gc-header__identtop">
          <span className="gc-header__name">{person.name}</span>
          {person.ai ? <AiBadge /> : null}
        </div>
        {person.role ? <span className="gc-header__sub">{person.role}</span> : null}
      </div>
      {person.ai && onGetHuman ? (
        <button type="button" className="gc-ghostbtn" onClick={onGetHuman}>
          <User />
          Get a human
        </button>
      ) : null}
    </HeaderBar>
  );
}

/* ---------------------------------------------------------- attachments -- */

function AttachmentCard({ attachment, onCancel }: { attachment: Attachment; onCancel?: () => void }) {
  if (attachment.error) {
    return (
      <div className="gc-upload gc-upload--error">
        <div className="gc-upload__row">
          <ImageIcon size={14} />
          <span className="gc-upload__name">{attachment.name}</span>
        </div>
        <span className="gc-upload__error" role="alert">
          {attachment.error}
        </span>
      </div>
    );
  }

  if (attachment.progress !== undefined) {
    return (
      <div className="gc-upload">
        <div className="gc-upload__row">
          <FileText size={14} />
          <span className="gc-upload__name">{attachment.name}</span>
          <button
            type="button"
            className="gc-upload__cancel"
            onClick={onCancel}
            aria-label={`Cancel upload of ${attachment.name}`}
          >
            <X size={12} />
          </button>
        </div>
        <div
          className="gc-progress"
          role="progressbar"
          aria-valuenow={attachment.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Uploading ${attachment.name}`}
        >
          <div className="gc-progress__bar" style={{ width: `${attachment.progress}%` }} />
        </div>
        <span className="gc-upload__status">UPLOADING · {attachment.progress}%</span>
      </div>
    );
  }

  return (
    <div className="gc-attach-img">
      <div className="gc-attach-img__thumb" aria-hidden="true">
        <ImageIcon size={22} />
      </div>
      <div className="gc-attach-img__meta">
        <span className="gc-attach-img__name">{attachment.name}</span>
        {attachment.size ? <span className="gc-attach-img__size">{attachment.size}</span> : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- messages -- */

function AnswerBody({
  message,
  onOpenArticle,
}: {
  message: Message;
  onOpenArticle: (id: string) => void;
}) {
  return (
    <>
      {message.body}
      {message.steps?.length ? (
        <ol className="gc-steps">
          {message.steps.map((step, i) => (
            <li key={step.text} className="gc-step" style={{ listStyle: "none" }}>
              <span className="gc-step__n">{i + 1}</span>
              {step.text}
            </li>
          ))}
        </ol>
      ) : null}
      {message.sources?.length ? (
        <div className="gc-sources">
          <span className="gc-cap">Sources</span>
          {message.sources.map((source) => (
            <button
              key={source.articleId}
              type="button"
              className="gc-source"
              onClick={() => onOpenArticle(source.articleId)}
            >
              <FileText />
              {source.title}
            </button>
          ))}
        </div>
      ) : null}
    </>
  );
}

function MessageRow({
  message,
  onOpenArticle,
  onRate,
}: {
  message: Message;
  onOpenArticle: (id: string) => void;
  onRate: (id: string, helpful: boolean) => void;
}) {
  if (message.author === "system") {
    return (
      <div className="gc-rule">
        <span className="gc-rule__label">{message.body}</span>
      </div>
    );
  }

  if (message.author === "visitor") {
    const hasAttachments = message.attachments?.length;
    if (hasAttachments || message.readReceipt) {
      return (
        <div className="gc-sent">
          {message.body ? <div className="gc-bubble--user gc-bubble">{message.body}</div> : null}
          {message.attachments?.map((a) => (
            <AttachmentCard key={a.id} attachment={a} />
          ))}
          {message.readReceipt ? (
            <span className="gc-receipt">
              {message.readReceipt}
              <CheckCheck />
            </span>
          ) : null}
        </div>
      );
    }
    return <div className="gc-bubble gc-bubble--user">{message.body}</div>;
  }

  if (message.author === "agent") {
    return (
      <div className="gc-msgrow">
        {message.from ? <Avatar person={message.from} size="sm" /> : null}
        <div className="gc-bubble gc-bubble--agent">{message.body}</div>
      </div>
    );
  }

  // AI.
  return (
    <>
      <div className={message.steps || message.sources ? "gc-bubble" : "gc-bubble gc-bubble--sys"}>
        <AnswerBody message={message} onOpenArticle={onOpenArticle} />
      </div>
      {message.askFeedback ? (
        <div className="gc-feedback">
          <span className="gc-feedback__label">Was this helpful?</span>
          <button
            type="button"
            className="gc-thumb gc-thumb--up"
            onClick={() => onRate(message.id, true)}
            aria-label="Helpful"
          >
            <ThumbsUp />
          </button>
          <button
            type="button"
            className="gc-thumb gc-thumb--down"
            onClick={() => onRate(message.id, false)}
            aria-label="Not helpful"
          >
            <ThumbsUp />
          </button>
        </div>
      ) : null}
    </>
  );
}

/* --------------------------------------------------------------- rating -- */

function RatingCard({
  value,
  onChange,
  onSubmit,
  onSkip,
  agentName,
}: {
  value: number;
  onChange: (n: number) => void;
  onSubmit: () => void;
  onSkip: () => void;
  agentName: string;
}) {
  return (
    <section className="gc-rating" aria-label="Rate this conversation">
      <p className="gc-rating__title">How did we do?</p>
      <p className="gc-rating__sub">Rating helps {agentName} and the team.</p>
      <div className="gc-stars" role="radiogroup" aria-label="Rating out of 5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className="gc-star"
            data-filled={n <= value}
            role="radio"
            aria-checked={n === value}
            aria-label={`${n} out of 5`}
            onClick={() => onChange(n)}
          >
            <Star filled={n <= value} />
          </button>
        ))}
      </div>
      <textarea className="gc-rating__comment" placeholder="Add a comment (optional)" aria-label="Comment" />
      <div className="gc-rating__actions">
        <button type="button" className="gc-primarybtn" onClick={onSubmit}>
          Send rating
        </button>
        <button type="button" className="gc-textbtn" onClick={onSkip}>
          Skip
        </button>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- view -- */

export interface ThreadViewProps {
  conversation: Conversation;
  /** Day separator at the top of the thread, e.g. "Today 14:02". */
  dayMark?: string;
  /** Shows the dashed "Drop files to attach" target (2i). */
  showDropzone?: boolean;
  assistantName: string;
  rating: number;
  onRatingChange: (n: number) => void;
  onSubmitRating: () => void;
  onSkipRating: () => void;
  onBack: () => void;
  onGetHuman: () => void;
  onOpenArticle: (id: string) => void;
  onSend: (text: string) => void;
  onQuickReply: (text: string) => void;
  onRateMessage: (id: string, helpful: boolean) => void;
}

export function ThreadView({
  conversation,
  dayMark,
  showDropzone,
  assistantName,
  rating,
  onRatingChange,
  onSubmitRating,
  onSkipRating,
  onBack,
  onGetHuman,
  onOpenArticle,
  onSend,
  onQuickReply,
  onRateMessage,
}: ThreadViewProps) {
  const person = conversation.with;
  const closed = conversation.status === "closed";
  const threadRef = useRef<HTMLDivElement>(null);

  // Keep the newest message in view as the thread grows.
  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [conversation.messages.length, conversation.typing]);

  return (
    <>
      <ThreadHeader
        person={person}
        conversation={conversation}
        onBack={onBack}
        onGetHuman={onGetHuman}
      />

      <div
        ref={threadRef}
        className={person.ai && !closed ? "gc-thread" : "gc-thread gc-thread--tight"}
        role="log"
        aria-label={`Conversation with ${person.name}`}
      >
        {dayMark ? <div className="gc-daymark">{dayMark}</div> : null}

        {conversation.messages.map((message) => (
          <MessageRow
            key={message.id}
            message={message}
            onOpenArticle={onOpenArticle}
            onRate={onRateMessage}
          />
        ))}

        {conversation.typing ? (
          <div className="gc-msgrow gc-msgrow--typing">
            <Avatar person={person} size="sm" />
            <div className="gc-typing" aria-hidden="true">
              <span className="gc-dot" />
              <span className="gc-dot" />
              <span className="gc-dot" />
            </div>
            <span className="gc-typing__label">{person.name} is typing</span>
          </div>
        ) : null}

        {showDropzone ? (
          <div className="gc-dropzone">
            <p className="gc-dropzone__title">Drop files to attach</p>
            <p className="gc-dropzone__hint">JPG, PNG, PDF · 25 MB</p>
          </div>
        ) : null}

        {conversation.transcriptNudge ? (
          <div className="gc-nudge">
            <Mail size={14} style={{ color: "var(--gc-text-secondary)", flex: "none" }} />
            <span className="gc-nudge__text">{conversation.transcriptNudge}</span>
            <button type="button" className="gc-nudge__toggle" aria-pressed="true">
              On
            </button>
          </div>
        ) : null}

        {conversation.awaitingRating ? (
          <RatingCard
            value={rating}
            onChange={onRatingChange}
            onSubmit={onSubmitRating}
            onSkip={onSkipRating}
            agentName={person.name.split(" ")[0] ?? person.name}
          />
        ) : null}

        {conversation.quickReplies?.length ? (
          <div className="gc-replies">
            {conversation.quickReplies.map((reply) => (
              <button key={reply} type="button" className="gc-reply" onClick={() => onQuickReply(reply)}>
                {reply}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {closed ? null : (
        <Composer
          placeholder={
            showDropzone ? "Add a note…" : person.ai ? "Message…" : `Message ${person.name.split(" ")[0]}…`
          }
          note={person.ai && !showDropzone ? `${assistantName} is an AI assistant. Ask for a person any time.` : undefined}
          allowImages={person.ai && !showDropzone}
          onSend={onSend}
        />
      )}
    </>
  );
}
