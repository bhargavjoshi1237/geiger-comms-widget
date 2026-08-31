// The message composer that anchors the AI and human threads.
//
// Auto-grows to a 96px cap (matching the design's four-ish lines), sends on
// Enter, and keeps Shift+Enter for a newline.

import { useLayoutEffect, useRef, useState } from "react";
import { ArrowUp, ImageIcon, Paperclip } from "./icons";

export interface ComposerProps {
  placeholder?: string;
  /** Footnote under the box — the design uses it for the AI disclosure. */
  note?: string;
  /** Hide the image button; the human thread only offers a paperclip. */
  allowImages?: boolean;
  onSend?: (text: string) => void;
  onAttach?: () => void;
}

export function Composer({
  placeholder = "Message…",
  note,
  allowImages = true,
  onSend,
  onAttach,
}: ComposerProps) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Reset first so the box can shrink again when text is deleted.
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
  }, [value]);

  const send = () => {
    const text = value.trim();
    if (!text) return;
    onSend?.(text);
    setValue("");
  };

  return (
    <div className="gc-panel__footer gc-composer">
      <div className="gc-composer__box">
        <textarea
          ref={ref}
          className="gc-composer__input"
          rows={1}
          value={value}
          placeholder={placeholder}
          aria-label={placeholder}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button type="button" className="gc-composer__btn" onClick={onAttach} aria-label="Attach file">
          <Paperclip />
        </button>
        {allowImages ? (
          <button type="button" className="gc-composer__btn" onClick={onAttach} aria-label="Add image">
            <ImageIcon />
          </button>
        ) : null}
        <button
          type="button"
          className="gc-composer__btn gc-composer__send"
          onClick={send}
          disabled={value.trim() === ""}
          aria-label="Send message"
        >
          <ArrowUp />
        </button>
      </div>
      {note ? <p className="gc-composer__note">{note}</p> : null}
    </div>
  );
}
