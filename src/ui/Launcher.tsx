// The circular launcher — direction 1a's defining element.
//
// Three drawn states: idle (white circle, chat glyph), unread (same, with a
// blue count badge) and open (neutral surface, close glyph).

import { MessageCircle, X } from "./icons";

export type LauncherState = "idle" | "unread" | "open";

export function Launcher({
  state,
  unread = 0,
  onClick,
  label,
}: {
  state: LauncherState;
  unread?: number;
  onClick?: () => void;
  /** Overrides the derived accessible name. */
  label?: string;
}) {
  const open = state === "open";
  const name =
    label ??
    (open
      ? "Close messenger"
      : unread > 0
        ? `Open messenger, ${unread} unread`
        : "Open messenger");

  return (
    <button
      type="button"
      className="gc-launcher"
      data-state={state}
      onClick={onClick}
      aria-label={name}
      aria-expanded={open}
    >
      {open ? <X size={20} /> : <MessageCircle size={24} />}
      {!open && unread > 0 ? (
        <span className="gc-launcher__badge" aria-hidden="true">
          {unread}
        </span>
      ) : null}
    </button>
  );
}
