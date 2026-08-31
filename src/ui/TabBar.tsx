// The three-tab bottom nav: Home · Messages · Help.
//
// Only tab roots show it. Sub-screens (a thread, an article) hide it so the
// panel reads as one task — see tabForView() in ./model.

import { BookHeart, Mail, MessageCircle } from "./icons";
import type { Tab } from "./model";

const TABS: { id: Tab; label: string; Icon: typeof MessageCircle }[] = [
  { id: "home", label: "Home", Icon: MessageCircle },
  { id: "messages", label: "Messages", Icon: Mail },
  { id: "help", label: "Help", Icon: BookHeart },
];

export function TabBar({
  active,
  unread = 0,
  onChange,
}: {
  active: Tab;
  /** Badge on the Messages tab. */
  unread?: number;
  onChange: (tab: Tab) => void;
}) {
  return (
    <nav className="gc-tabs" aria-label="Messenger sections">
      {TABS.map(({ id, label, Icon }) => {
        const selected = id === active;
        const badge = id === "messages" && unread > 0;
        return (
          <button
            key={id}
            type="button"
            className="gc-tab"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(id)}
          >
            <Icon />
            <span>{label}</span>
            {badge ? (
              <span className="gc-tab__badge" aria-hidden="true">
                {unread}
              </span>
            ) : null}
            {badge ? <span className="gc-sr">, {unread} unread</span> : null}
          </button>
        );
      })}
    </nav>
  );
}
