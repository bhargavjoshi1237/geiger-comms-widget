import { G as GeigerBootSettings, a as GeigerCommsApi, b as GeigerCommsState, c as GeigerLoadOptions, T as TrackedEvent, U as Unsubscribe, L as LauncherState, S as SpaceName, E as EventMetadata, d as GeigerUpdateData } from './types-BC94cziO.cjs';
export { e as GeigerBootOptions, f as GeigerUser, g as LauncherIcon } from './types-BC94cziO.cjs';

/** Production loader; the loader bakes its own origin and /comms base path. */
declare const DEFAULT_SCRIPT_URL = "https://geiger.studio/comms/widget/v1.js";
/** Inject the loader (once) and resolve when its API is live. Never rejects. */
declare function load(options?: GeigerLoadOptions): Promise<boolean>;
/** Start the Messenger. Injects the loader on first call; earlier calls are queued. */
declare function boot(settings: GeigerBootSettings): void;
declare function update(data: GeigerUpdateData): void;
declare function shutdown(): void;
declare function show(): void;
declare function hide(): void;
declare function showSpace(name: SpaceName): void;
declare function showMessages(): void;
declare function showNewMessage(text?: string): void;
declare function showConversation(id: string): void;
declare function showArticle(id: string): void;
declare function showNews(id?: string): void;
declare function showTicket(id: string): void;
declare function showAsk(text?: string): void;
declare function setLauncherState(state: LauncherState): void;
declare function trackEvent(name: string, meta?: EventMetadata): void;
declare function getVisitorId(): string | null;
declare function onShow(callback: () => void): Unsubscribe;
declare function onHide(callback: () => void): Unsubscribe;
/** Called immediately with the current count, then on every change. */
declare function onUnreadCountChange(callback: (count: number) => void): Unsubscribe;
declare function onUserEmailSupplied(callback: (email: string) => void): Unsubscribe;
declare function onEvent(callback: (event: TrackedEvent) => void): Unsubscribe;
declare const onTrackedEvent: typeof onEvent;
/** Current SDK state; a new object whenever anything changes. */
declare function getState(): GeigerCommsState;
/** Subscribe to state changes (shape matches React's useSyncExternalStore). */
declare function subscribe(listener: () => void): Unsubscribe;
declare const GeigerComms: GeigerCommsApi;

export { DEFAULT_SCRIPT_URL, EventMetadata, GeigerBootSettings, GeigerCommsApi, GeigerCommsState, GeigerLoadOptions, GeigerUpdateData, LauncherState, SpaceName, TrackedEvent, Unsubscribe, boot, GeigerComms as default, getState, getVisitorId, hide, load, onEvent, onHide, onShow, onTrackedEvent, onUnreadCountChange, onUserEmailSupplied, setLauncherState, show, showArticle, showAsk, showConversation, showMessages, showNewMessage, showNews, showSpace, showTicket, shutdown, subscribe, trackEvent, update };
