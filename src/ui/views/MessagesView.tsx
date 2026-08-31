// 2b — Your conversations.
//
// Open/Closed filter, a row per thread with status pill and unread count, and
// a "team is online" footer. Re-skinned into 1a: the bottom nav is supplied by
// the panel, so this view stops at the footer card.

import { useState } from "react";
import { Plus, Sparkles } from "../icons";
import { Avatar, AvatarStack, StatusPill, UnreadCount } from "../primitives";
import type { Conversation, Person } from "../model";

type Filter = "open" | "closed";

export function MessagesView({
  conversations,
  team,
  onOpen,
  onNew,
}: {
  conversations: Conversation[];
  team: Person[];
  onOpen: (id: string) => void;
  onNew: () => void;
}) {
  const [filter, setFilter] = useState<Filter>("open");

  const open = conversations.filter((c) => c.status !== "closed");
  const closed = conversations.filter((c) => c.status === "closed");
  const shown = filter === "open" ? open : closed;
  const online = team.some((p) => p.online);

  return (
    <>
      <header className="gc-listhead">
        <span className="gc-listhead__title">Your conversations</span>
        <button type="button" className="gc-primarybtn" onClick={onNew}>
          <Plus />
          New
        </button>
      </header>

      <div className="gc-panel__body gc-panel__body--stack">
        <div className="gc-filters" role="tablist" aria-label="Filter conversations">
          <button
            type="button"
            role="tab"
            className="gc-filter"
            aria-selected={filter === "open"}
            onClick={() => setFilter("open")}
          >
            Open · {open.length}
          </button>
          <button
            type="button"
            role="tab"
            className="gc-filter"
            aria-selected={filter === "closed"}
            onClick={() => setFilter("closed")}
          >
            Closed · {closed.length}
          </button>
        </div>

        {shown.map((c, i) => (
          <button
            key={c.id}
            type="button"
            className="gc-convo"
            data-active={i === 0 && filter === "open"}
            data-closed={c.status === "closed"}
            onClick={() => onOpen(c.id)}
          >
            {c.with.ai ? (
              <div className="gc-avatar gc-avatar--lg" aria-hidden="true">
                <Sparkles size={14} />
              </div>
            ) : (
              <Avatar person={c.with} size="lg" showStatus />
            )}
            <div className="gc-convo__body">
              <div className="gc-convo__top">
                <span className="gc-convo__title">{c.title}</span>
                <span className="gc-convo__time">{c.time}</span>
              </div>
              <p className={c.unread ? "gc-convo__preview gc-convo__preview--unread" : "gc-convo__preview"}>
                <strong>{c.previewAuthor}:</strong> {c.preview}
              </p>
              <div className="gc-convo__meta">
                <StatusPill status={c.status} />
                {c.unread ? <UnreadCount count={c.unread} /> : null}
              </div>
            </div>
          </button>
        ))}

        {shown.length === 0 ? (
          <p style={{ padding: "24px 14px", margin: 0, font: "400 12px var(--gc-font-sans)", color: "var(--gc-text-secondary)" }}>
            Nothing here yet.
          </p>
        ) : null}

        <div className="gc-listfoot">
          <div className="gc-teamcard">
            <AvatarStack people={team} />
            <span>{online ? "Team is online now" : "Team is away — Aria can still help"}</span>
          </div>
        </div>
      </div>
    </>
  );
}
