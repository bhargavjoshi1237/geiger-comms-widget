// The messenger — direction 1a, assembled.
//
// Owns the open/closed state, which screen is showing and which thread is
// selected; every screen below it is presentational. Routing is deliberately a
// plain tagged union rather than a router: the panel only ever has one screen,
// and "back" is always a known destination.

import { useCallback, useMemo, useState } from "react";
import { Launcher } from "./Launcher";
import { ProactiveCard } from "./ProactiveCard";
import { TabBar } from "./TabBar";
import { HomeView } from "./views/HomeView";
import { MessagesView } from "./views/MessagesView";
import { HelpView } from "./views/HelpView";
import { ArticleView } from "./views/ArticleView";
import { NewConversationView } from "./views/NewConversationView";
import { OfflineView } from "./views/OfflineView";
import { ThreadView } from "./views/ThreadView";
import { tabForView } from "./model";
import type { MessengerData, Tab, View } from "./model";

export interface MessengerProps {
  data: MessengerData;
  /** Start with the panel open. */
  defaultOpen?: boolean;
  /** Screen to show when the panel opens. Defaults to home (or offline). */
  defaultView?: View;
  /**
   * Render in normal document flow instead of pinned to the viewport corner.
   * The demo gallery uses this to lay panels out side by side.
   */
  inline?: boolean;
  /** Force the full-screen phone treatment (2j) regardless of viewport. */
  mobile?: boolean;
  /** Which corner to pin to. */
  align?: "left" | "right";
  /** Hide the launcher when the host renders its own trigger. */
  hideLauncher?: boolean;
  /** The canvas draws dark; "light" swaps in the bundle's light token set. */
  theme?: "dark" | "light";
  /** Fires on every meaningful interaction, mirroring the widget's event bus. */
  onEvent?: (name: string, meta?: Record<string, unknown>) => void;
}

export function Messenger({
  data,
  defaultOpen = false,
  defaultView,
  inline = false,
  mobile = false,
  align = "right",
  hideLauncher = false,
  theme = "dark",
  onEvent,
}: MessengerProps) {
  const initialView: View = defaultView ?? (data.online ? { kind: "home" } : { kind: "offline" });

  const [open, setOpen] = useState(defaultOpen);
  const [view, setView] = useState<View>(initialView);
  const [proactiveOpen, setProactiveOpen] = useState(Boolean(data.proactive));
  const [rating, setRating] = useState(0);
  const [helpQuery, setHelpQuery] = useState("");

  const emit = useCallback(
    (name: string, meta?: Record<string, unknown>) => onEvent?.(name, meta),
    [onEvent],
  );

  const go = useCallback(
    (next: View) => {
      setView(next);
      emit("space:opened", { space: next.kind });
    },
    [emit],
  );

  const unread = useMemo(
    () => data.conversations.reduce((sum, c) => sum + (c.unread ?? 0), 0),
    [data.conversations],
  );

  const recent = data.conversations[0];
  const conversation =
    view.kind === "conversation" ? data.conversations.find((c) => c.id === view.id) : undefined;
  const article = view.kind === "article" ? data.articles.find((a) => a.id === view.id) : undefined;

  const close = useCallback(() => {
    setOpen(false);
    emit("messenger:hidden");
  }, [emit]);

  const toggle = useCallback(() => {
    setOpen((prev) => {
      emit(prev ? "messenger:hidden" : "messenger:shown");
      return !prev;
    });
    setProactiveOpen(false);
  }, [emit]);

  const openThread = useCallback(
    (id: string) => {
      setRating(0);
      go({ kind: "conversation", id });
    },
    [go],
  );

  /** The AI thread is just the conversation whose participant is the assistant. */
  const askThread = useMemo(
    () => data.conversations.find((c) => c.with.ai && c.status !== "closed"),
    [data.conversations],
  );

  const openAsk = useCallback(() => {
    if (askThread) openThread(askThread.id);
    else go({ kind: "new" });
    emit("ask:opened");
  }, [askThread, openThread, go, emit]);

  const onTab = useCallback(
    (tab: Tab) => {
      go({ kind: tab });
    },
    [go],
  );

  const activeTab = tabForView(view);

  let screen: React.ReactNode = null;

  switch (view.kind) {
    case "home":
      screen = (
        <HomeView
          data={data}
          recent={recent}
          onAsk={openAsk}
          onOpenConversation={openThread}
          onSeeAll={() => go({ kind: "messages" })}
          onSearch={(q) => {
            setHelpQuery(q);
            go({ kind: "help" });
          }}
          onClose={close}
        />
      );
      break;

    case "messages":
      screen = (
        <MessagesView
          conversations={data.conversations}
          team={data.team}
          onOpen={openThread}
          onNew={() => go({ kind: "new" })}
        />
      );
      break;

    case "help":
      screen = (
        <HelpView
          articles={data.articles}
          assistantName={data.assistant.name}
          initialQuery={helpQuery}
          onOpenArticle={(id) => go({ kind: "article", id })}
          onAsk={openAsk}
          onMessageTeam={() => go({ kind: "new" })}
          onClose={close}
        />
      );
      break;

    case "article":
      screen = article ? (
        <ArticleView
          article={article}
          onBack={() => go({ kind: "help" })}
          onAskInstead={openAsk}
          onRate={(helpful) => emit("article:rated", { id: article.id, helpful })}
        />
      ) : null;
      break;

    case "new":
      screen = (
        <NewConversationView
          data={data}
          onBack={() => go({ kind: "messages" })}
          onSend={(draft) => {
            emit("conversation:started", { ...draft });
            go({ kind: "messages" });
          }}
        />
      );
      break;

    case "offline":
      screen = (
        <OfflineView
          data={data}
          onAsk={openAsk}
          onLeaveMessage={(draft) => {
            emit("message:left", { email: draft.email });
            if (draft.email) emit("user:email", { email: draft.email });
          }}
          onClose={close}
        />
      );
      break;

    case "conversation":
      screen = conversation ? (
        <ThreadView
          conversation={conversation}
          dayMark={conversation.dayMark}
          showDropzone={conversation.attachmentMode}
          assistantName={data.assistant.name}
          rating={rating}
          onRatingChange={setRating}
          onSubmitRating={() => {
            emit("conversation:rated", { id: conversation.id, rating });
            go({ kind: "messages" });
          }}
          onSkipRating={() => go({ kind: "messages" })}
          onBack={() => go({ kind: "messages" })}
          onGetHuman={() => emit("handover:requested", { id: conversation.id })}
          onOpenArticle={(id) => go({ kind: "article", id })}
          onSend={(text) => emit("message:sent", { id: conversation.id, text })}
          onQuickReply={(text) => emit("message:sent", { id: conversation.id, text, quick: true })}
          onRateMessage={(id, helpful) => emit("answer:rated", { id, helpful })}
        />
      ) : null;
      break;
  }

  const panel = (
    <div className={mobile ? "gc-panel gc-panel--mobile" : "gc-panel"} role="dialog" aria-label="Messenger">
      {mobile ? (
        <div className="gc-statusbar" aria-hidden="true">
          <span>9:41</span>
          <span className="gc-statusbar__icons">
            <span className="gc-statusbar__battery" />
            <span className="gc-statusbar__tip" />
          </span>
        </div>
      ) : null}
      {screen}
      {activeTab ? <TabBar active={activeTab} unread={unread} onChange={onTab} /> : null}
      {mobile ? <div className="gc-homebar" aria-hidden="true" /> : null}
    </div>
  );

  return (
    <div className="gc-widget" data-theme={theme}>
      <div className="gc-root" data-align={align} data-inline={inline || undefined}>
        {open ? panel : null}
        {!open && proactiveOpen && data.proactive ? (
          <ProactiveCard
            message={data.proactive}
            onConfirm={() => {
              setProactiveOpen(false);
              setOpen(true);
              openAsk();
            }}
            onDismiss={() => {
              setProactiveOpen(false);
              emit("proactive:dismissed");
            }}
            onReply={(text) => {
              setProactiveOpen(false);
              setOpen(true);
              emit("message:sent", { text, proactive: true });
            }}
          />
        ) : null}
        {hideLauncher ? null : (
          <Launcher
            state={open ? "open" : unread > 0 ? "unread" : "idle"}
            unread={unread}
            onClick={toggle}
          />
        )}
      </div>
    </div>
  );
}
