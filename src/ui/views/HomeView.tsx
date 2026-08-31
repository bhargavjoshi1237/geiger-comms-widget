// 1a — Home.
//
// Greeting header, the "Ask Aria" hero card, the most recent conversation and
// a help search box. The bottom nav is supplied by the panel, not by this view.

import { ChevronRight, Search, Sparkles, X } from "../icons";
import { AiBadge, Avatar, Cap } from "../primitives";
import type { Conversation, MessengerData } from "../model";

export function HomeView({
  data,
  recent,
  onAsk,
  onOpenConversation,
  onSeeAll,
  onSearch,
  onClose,
}: {
  data: MessengerData;
  /** Most recent thread, or undefined for a first-time visitor. */
  recent?: Conversation;
  onAsk: () => void;
  onOpenConversation: (id: string) => void;
  onSeeAll: () => void;
  onSearch: (query: string) => void;
  onClose: () => void;
}) {
  return (
    <>
      <header className="gc-header gc-header--home">
        <div className="gc-header__row">
          <div className="gc-header__brand">
            <div className="gc-header__logo" aria-hidden="true">
              {data.brand.initials}
            </div>
            <span className="gc-header__brandname">{data.brand.name}</span>
          </div>
          <button type="button" className="gc-iconbtn" onClick={onClose} aria-label="Close messenger">
            <X />
          </button>
        </div>
        <div className="gc-header__greeting">
          <p>Hi there.</p>
          <p>How can we help?</p>
        </div>
      </header>

      <div className="gc-home">
        <button type="button" className="gc-card" onClick={onAsk}>
          <div className="gc-card__icon" aria-hidden="true">
            <Sparkles size={15} />
          </div>
          <div className="gc-card__body">
            <div className="gc-card__titlerow">
              <span className="gc-card__title">Ask {data.assistant.name}</span>
              <AiBadge />
            </div>
            <p className="gc-card__desc">{data.assistant.tagline}</p>
          </div>
          <ChevronRight className="gc-card__chev" />
        </button>

        {recent ? (
          <>
            <div className="gc-sectionrow">
              <Cap>Recent</Cap>
              <button type="button" className="gc-link" onClick={onSeeAll}>
                See all
              </button>
            </div>
            <button
              type="button"
              className="gc-recent"
              onClick={() => onOpenConversation(recent.id)}
            >
              <Avatar person={recent.with} showStatus />
              <div className="gc-recent__body">
                <div className="gc-recent__top">
                  <span className="gc-recent__name">{recent.with.name}</span>
                  <span className="gc-recent__time">{recent.time}</span>
                </div>
                <p className="gc-recent__preview">{recent.preview}</p>
              </div>
            </button>
          </>
        ) : null}

        <form
          className="gc-search"
          onSubmit={(e) => {
            e.preventDefault();
            const input = e.currentTarget.elements.namedItem("q");
            if (input instanceof HTMLInputElement) onSearch(input.value);
          }}
        >
          <Search className="gc-search__icon" />
          <input
            name="q"
            type="search"
            className="gc-search__input"
            placeholder="Search for help"
            aria-label="Search for help"
          />
        </form>
      </div>
    </>
  );
}
