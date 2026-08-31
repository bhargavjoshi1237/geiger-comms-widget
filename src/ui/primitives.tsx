// Small pieces the screens share: avatars, status pills, the AI badge and the
// panel header bars. Kept presentational — no state, no data fetching.

import type { ReactNode } from "react";
import type { ConversationStatus, Person } from "./model";
import { ChevronLeft, CircleCheck, X } from "./icons";

/* -------------------------------------------------------------- avatar -- */

export function Avatar({
  person,
  size = "md",
  showStatus = false,
}: {
  person: Pick<Person, "initials" | "online" | "name">;
  size?: "xs" | "sm" | "md" | "lg";
  showStatus?: boolean;
}) {
  const cls = size === "md" ? "gc-avatar" : `gc-avatar gc-avatar--${size}`;
  const dot = <div className={cls}>{person.initials}</div>;
  if (!showStatus || !person.online) return dot;
  return (
    <div className="gc-avatar-wrap">
      {dot}
      <span className="gc-online-dot" />
      <span className="gc-sr">{person.name} is online</span>
    </div>
  );
}

export function AvatarStack({ people }: { people: Person[] }) {
  return (
    <div className="gc-avatar-stack">
      {people.map((p) => (
        <div key={p.id} className="gc-avatar">
          {p.initials}
        </div>
      ))}
    </div>
  );
}

/* --------------------------------------------------------------- chips -- */

export function AiBadge() {
  return (
    <span className="gc-badge-ai" title="Answered by AI">
      AI
    </span>
  );
}

export function Cap({ children }: { children: ReactNode }) {
  return <span className="gc-cap">{children}</span>;
}

const STATUS_LABEL: Record<ConversationStatus, string> = {
  open: "Open",
  waiting: "Waiting on you",
  closed: "Closed",
};

export function StatusPill({ status }: { status: ConversationStatus }) {
  if (status === "open") {
    return (
      <span className="gc-pill gc-pill--open">
        <span className="gc-pill__dot" />
        {STATUS_LABEL.open}
      </span>
    );
  }
  return (
    <span className="gc-pill">
      {status === "closed" ? <CircleCheck /> : null}
      {STATUS_LABEL[status]}
    </span>
  );
}

export function UnreadCount({ count }: { count: number }) {
  return (
    <span className="gc-count">
      {count}
      <span className="gc-sr"> unread messages</span>
    </span>
  );
}

/* -------------------------------------------------------------- headers -- */

/** The plain back / title / action bar used by every sub-screen. */
export function HeaderBar({
  onBack,
  onClose,
  children,
  action,
}: {
  onBack?: () => void;
  onClose?: () => void;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="gc-header gc-header--bar">
      {onBack ? (
        <button type="button" className="gc-iconbtn gc-iconbtn--sm" onClick={onBack} aria-label="Back">
          <ChevronLeft />
        </button>
      ) : null}
      {children}
      {action}
      {onClose ? (
        <button type="button" className="gc-iconbtn gc-iconbtn--sm" onClick={onClose} aria-label="Close messenger">
          <X />
        </button>
      ) : null}
    </header>
  );
}
