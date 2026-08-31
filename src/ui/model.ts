// View model for the messenger UI.
//
// These types describe what the panel renders, not what the transport sends.
// The loader in ../index.ts still owns the network surface; everything here is
// plain data a host (or the demo) can hand to <Messenger>.

/** Who authored a message. "system" renders as a centred rule, not a bubble. */
export type Author = "visitor" | "agent" | "ai" | "system";

export interface Person {
  id: string;
  name: string;
  /** Two-letter monogram drawn in the avatar circle. */
  initials: string;
  online?: boolean;
  /** Shown under the name in a conversation header. */
  role?: string;
  /**
   * The AI persona renders differently everywhere: a sparkles glyph instead of
   * a monogram, an "AI" badge next to the name, and a "Get a human" escape
   * hatch in the header.
   */
  ai?: boolean;
}

/** A numbered step inside an AI answer (the "1 / 2 / 3" list in the design). */
export interface AnswerStep {
  text: string;
}

/** A help-centre article an AI answer cites. */
export interface SourceRef {
  articleId: string;
  title: string;
}

export interface Attachment {
  id: string;
  name: string;
  /** Human-readable size, e.g. "1.2 MB". Omit while uploading. */
  size?: string;
  kind: "image" | "file";
  /** 0–100 while in flight; omit once sent. */
  progress?: number;
  /** Set when the upload failed — renders the red error card. */
  error?: string;
}

export interface Message {
  id: string;
  author: Author;
  /** Absent for pure-attachment messages. */
  body?: string;
  /** The person who sent it; used for the avatar beside agent bubbles. */
  from?: Person;
  /** Clock time, e.g. "14:08". */
  time?: string;
  steps?: AnswerStep[];
  sources?: SourceRef[];
  attachments?: Attachment[];
  /** Renders the "Read 14:08 ✓✓" receipt under a visitor bubble. */
  readReceipt?: string;
  /** Renders the "Was this helpful?" thumbs under an AI answer. */
  askFeedback?: boolean;
}

export type ConversationStatus = "open" | "waiting" | "closed";

export interface Conversation {
  id: string;
  title: string;
  /** Who the visitor is talking to right now. */
  with: Person;
  /** Rendered in the list row: "Maya: I've approved the refund." */
  preview: string;
  previewAuthor: string;
  time: string;
  status: ConversationStatus;
  unread?: number;
  messages: Message[];
  /** Someone on the other end is typing. */
  typing?: boolean;
  /** Suggested replies pinned to the bottom of the thread. */
  quickReplies?: string[];
  /** Show the star-rating card (2h). */
  awaitingRating?: boolean;
  /** Show the "we'll email you the rest" nudge above the composer. */
  transcriptNudge?: string;
  closedAt?: string;
  /** Divider text when Aria handed the thread to a human. */
  handoffNote?: string;
  /** Day separator at the top of the thread, e.g. "Today 14:02". */
  dayMark?: string;
  /** Renders the dashed drop target and switches the composer to "Add a note…". */
  attachmentMode?: boolean;
}

export interface Article {
  id: string;
  title: string;
  /** Short summary shown in search results. */
  excerpt: string;
  category: string;
  readingTime: string;
  author?: Person;
  updated?: string;
  /** Rendered in order by the article reader. */
  blocks: ArticleBlock[];
}

export type ArticleBlock =
  | { type: "lead"; text: string }
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "callout"; text: string };

export interface Order {
  id: string;
  label: string;
  status: string;
}

/** Topic chips on the "new conversation" screen. */
export type Topic = string;

export interface ProactiveMessage {
  from: Person;
  when: string;
  body: string;
  confirmLabel: string;
  dismissLabel: string;
}

/** Everything the panel needs in order to render. */
export interface MessengerData {
  brand: { name: string; initials: string };
  /** The AI persona — "Aria" in the design. */
  assistant: { name: string; tagline: string };
  team: Person[];
  conversations: Conversation[];
  articles: Article[];
  orders: Order[];
  topics: Topic[];
  /** Team availability. `false` routes the panel to the offline screen. */
  online: boolean;
  /** Shown on the offline screen: "back at 09:00 GMT, in about 11 hours." */
  backAt?: string;
  proactive?: ProactiveMessage;
  visitorEmail?: string;
}

/** Which screen the panel is showing. */
export type View =
  | { kind: "home" }
  | { kind: "messages" }
  | { kind: "help" }
  | { kind: "ask" }
  | { kind: "conversation"; id: string }
  | { kind: "article"; id: string }
  | { kind: "new" }
  | { kind: "offline" };

/** The three bottom-nav tabs. `null` when the view is not a tab root. */
export type Tab = "home" | "messages" | "help";

export function tabForView(view: View): Tab | null {
  switch (view.kind) {
    case "home":
      return "home";
    case "messages":
      return "messages";
    case "help":
      return "help";
    default:
      // Sub-screens (a thread, an article, the composer) hide the nav so the
      // panel reads as one task rather than a tab you happen to be inside.
      return null;
  }
}
