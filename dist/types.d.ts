export interface GeigerCommsSettings {
    /** Your widget app's public id (wg_…). The only identifier that may live in a page. */
    appId: string;
    /**
     * Identity JWT signed HS256 by YOUR backend with the app's signing secret.
     * exp must be ≤ 24h. Omit for anonymous visitors.
     * Sign it server-side — never in the browser.
     */
    jwt?: string;
    /** Override the loader-owned anonymous id (rarely needed; it is a UUID in host localStorage). */
    anonymousId?: string;
    /** Hide the default launcher button if your UI renders its own. */
    hideDefaultLauncher?: boolean;
}
/** Every space the messenger can route to. */
export type GeigerSpace = "home" | "ask" | "messages" | "help" | "news" | "tickets";
/** Launcher UI states. */
export type GeigerLauncherState = "idle" | "unread" | "open" | "minimized" | "typing";
export type UnreadCountHandler = (count: number) => void;
export type SimpleHandler = () => void;
export type EmailHandler = (email: string) => void;
/** Generic widget event emitted by the messenger. */
export type WidgetEventHandler = (event: WidgetEvent) => void;
/** Fired when the messenger's tracked events stream — typing, ratings, attachments. */
export type TrackedEventHandler = (event: WidgetTrackedEvent) => void;
/** Function returned by on* subscriptions to stop listening. */
export type Unsubscribe = () => void;
/** Event names the host page can subscribe to. */
export interface WidgetEvent {
    /** Stable event name (e.g. "space:opened", "ask:submitted"). */
    name: string;
    /** Optional payload attached to the event. */
    meta?: Record<string, unknown>;
}
/**
 * Forward-compatible passthrough for tracked events emitted by the messenger
 * (ask submissions, ratings, attachment uploads, handovers …). The host can
 * listen via `onTrackedEvent` to pipe them to its own analytics.
 */
export type WidgetTrackedEvent = WidgetEvent;
export interface GeigerCommsApi {
    boot(settings: GeigerCommsSettings): void;
    update(data: Partial<GeigerCommsSettings>): void;
    shutdown(): void;
    show(): void;
    hide(): void;
    showSpace(name: GeigerSpace): void;
    showMessages(): void;
    showAsk(text?: string): void;
    showNewMessage(text?: string): void;
    showConversation(id: string): void;
    showArticle(id: string): void;
    showNews(id?: string): void;
    showTicket(id: string): void;
    /** Update the launcher appearance at runtime (icon, label, unread count). */
    setLauncherState(state: Partial<{
        label: string;
        unread: number;
        icon: "help" | "minimize" | "close" | "ai";
    }>): void;
    trackEvent(name: string, metadata?: Record<string, unknown>): void;
    getVisitorId(): string;
    onShow(cb: SimpleHandler): Unsubscribe;
    onHide(cb: SimpleHandler): Unsubscribe;
    onUnreadCountChange(cb: UnreadCountHandler): Unsubscribe;
    onUserEmailSupplied(cb: EmailHandler): Unsubscribe;
    onEvent(cb: WidgetEventHandler): Unsubscribe;
    onTrackedEvent(cb: TrackedEventHandler): Unsubscribe;
}
