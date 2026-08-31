// @geiger/comms-widget/ui — the messenger UI, direction 1a.
//
// This is the rendered widget: a launcher, a panel and the screens inside it.
// It is deliberately independent of the loader in ../index.ts — that module
// still proxies to the hosted script and is unchanged. Import from here when
// you want to render the messenger yourself (a preview, a design review, an
// embedded host that already has the data).
//
// Styles are not injected: import "@geiger/comms-widget/ui/widget.css" once.
export { Messenger } from "./Messenger";
export { Launcher } from "./Launcher";
export { TabBar } from "./TabBar";
export { Composer } from "./Composer";
export { ProactiveCard } from "./ProactiveCard";
export { HomeView } from "./views/HomeView";
export { MessagesView } from "./views/MessagesView";
export { HelpView } from "./views/HelpView";
export { ArticleView } from "./views/ArticleView";
export { NewConversationView } from "./views/NewConversationView";
export { OfflineView } from "./views/OfflineView";
export { ThreadView } from "./views/ThreadView";
export { Avatar, AvatarStack, AiBadge, Cap, HeaderBar, StatusPill, UnreadCount } from "./primitives";
export { sampleData, ARIA, MAYA, DAN } from "./sample";
export { tabForView } from "./model";
