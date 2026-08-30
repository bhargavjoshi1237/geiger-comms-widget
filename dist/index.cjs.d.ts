import type { EmailHandler, GeigerCommsSettings, GeigerSpace, SimpleHandler, UnreadCountHandler, Unsubscribe } from "./types";
export type { GeigerCommsApi, GeigerCommsSettings, GeigerSpace } from "./types";
/** Points future loads at a different deployment (e.g. localhost:3000 in dev). */
export declare function configure(options?: {
    scriptUrl?: string;
}): void;
export declare const GeigerComms: {
    /** Loads the loader and boots the messenger. Safe to call again; updates settings. */
    boot(settings: GeigerCommsSettings): void;
    update(data: Partial<GeigerCommsSettings>): void;
    shutdown(): void;
    show(): void;
    hide(): void;
    showSpace(name: GeigerSpace): void;
    showMessages(): void;
    showNewMessage(text?: string): void;
    showConversation(id: string): void;
    showArticle(id: string): void;
    showNews(id?: string): void;
    showTicket(id: string): void;
    trackEvent(name: string, metadata?: Record<string, unknown>): void;
    getVisitorId(): string;
    onShow(cb: SimpleHandler): Unsubscribe;
    onHide(cb: SimpleHandler): Unsubscribe;
    onUnreadCountChange(cb: UnreadCountHandler): Unsubscribe;
    onUserEmailSupplied(cb: EmailHandler): Unsubscribe;
};
export default GeigerComms;
