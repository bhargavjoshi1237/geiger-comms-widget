/** A Messenger space, as accepted by `showSpace(name)`. */
type SpaceName = "home" | "messages" | "help" | "news" | "tickets";
/** Glyph the default launcher can show (see `setLauncherState`). */
type LauncherIcon = "help" | "ai" | "minimize";
/** JSON-safe event metadata; it crosses postMessage and is stored server-side. */
type EventMetadata = Record<string, string | number | boolean | null>;
/** Unsubscribes a listener added with one of the `on*` methods. */
type Unsubscribe = () => void;
/** Where the loader script comes from. Read on the first load only. */
interface GeigerLoadOptions {
    /**
     * Full URL of the loader script. Defaults to the production loader
     * (`DEFAULT_SCRIPT_URL`). Use `http://localhost:3000/widget/v1.js` against a
     * local Geiger Comms.
     */
    scriptUrl?: string;
    /**
     * Base URL of a Geiger Comms deployment (origin + base path), e.g.
     * `http://localhost:3000` or `https://geiger.studio/comms`. The loader is
     * fetched from `${apiBase}/widget/v1.js`; it then talks to that same
     * deployment's `/api/widget/*`. Ignored when `scriptUrl` is set.
     */
    apiBase?: string;
}
/** Visitor attributes passed alongside boot/update. */
interface GeigerUser {
    /** Prefills the visitor's email for lead capture. */
    email?: string;
}
/** Display options applied at boot. */
interface GeigerBootOptions {
    /** Hide the default launcher so the host page can render its own button. */
    hideDefaultLauncher?: boolean;
    /**
     * Play the reply chime when a support reply arrives. Defaults to true; pass
     * false to keep the Messenger silent on this site.
     */
    sound?: boolean;
}
/** Settings for `boot()`. */
interface GeigerBootSettings extends GeigerLoadOptions {
    /** The widget app's public id from Messenger > Install, e.g. "wg_7fk2p9". */
    appId: string;
    /**
     * A JWT signed by YOUR backend (HS256, the app's signing secret, `user_id`
     * claim, exp at most 24h). Omit for an anonymous visitor. Never sign it in
     * the browser.
     */
    jwt?: string | null;
    user?: GeigerUser;
    options?: GeigerBootOptions;
}
/** Fields `update()` can change on a running Messenger. */
interface GeigerUpdateData {
    /** A fresh JWT; the Messenger re-authenticates with it. */
    jwt?: string | null;
    user?: GeigerUser;
}
/** Overrides for the default launcher's look. */
interface LauncherState {
    /** Turns the launcher into a pill with this label; null resets it. */
    label?: string | null;
    /** Badge count shown on the round launcher. */
    unread?: number;
    icon?: LauncherIcon;
}
/** A tracked or Messenger-emitted event, as delivered to `onEvent`. */
interface TrackedEvent {
    name: string;
    meta?: EventMetadata | null;
}
/** Live SDK state, as read by `getState()` and the React hook. */
interface GeigerCommsState {
    /** The loader script has loaded and the real API is installed. */
    loaded: boolean;
    /** `boot()` has run against the loader and `shutdown()` has not since. */
    booted: boolean;
    /** The Messenger panel is open. */
    isOpen: boolean;
    /** Unread conversation count reported by the Messenger. */
    unreadCount: number;
}
/** The Messenger's method API (Intercom-compatible names, spec §9.1). */
interface GeigerCommsApi {
    /** Start the Messenger for this page. Injects the loader on first call. */
    boot(settings: GeigerBootSettings): void;
    /** Change the running Messenger's identity or visitor attributes. */
    update(data: GeigerUpdateData): void;
    /** Tear down the Messenger and its session (call on sign-out). */
    shutdown(): void;
    /** Open the Messenger panel. */
    show(): void;
    /** Close the Messenger panel. */
    hide(): void;
    /** Open the Messenger on a given space. */
    showSpace(name: SpaceName): void;
    /** Open the Messages space. */
    showMessages(): void;
    /** Open a new conversation, optionally with a prefilled draft. */
    showNewMessage(text?: string): void;
    /** Open one of the visitor's conversations by id. */
    showConversation(id: string): void;
    /** Open a Help article by id. */
    showArticle(id: string): void;
    /** Open News, or one post by id. */
    showNews(id?: string): void;
    /** Open one of the visitor's tickets by id. */
    showTicket(id: string): void;
    /** Open the AI Ask space, optionally with a prefilled question (Geiger extension). */
    showAsk(text?: string): void;
    /** Override the default launcher's label, badge or icon (Geiger extension). */
    setLauncherState(state: LauncherState): void;
    /** Record a custom event against the current visitor. */
    trackEvent(name: string, meta?: EventMetadata): void;
    /** The current visitor's id once the Messenger has booted a session, else null. */
    getVisitorId(): string | null;
    onShow(callback: () => void): Unsubscribe;
    onHide(callback: () => void): Unsubscribe;
    /** Called immediately with the current count, then on every change. */
    onUnreadCountChange(callback: (count: number) => void): Unsubscribe;
    onUserEmailSupplied(callback: (email: string) => void): Unsubscribe;
    /** Tracked and Messenger-emitted events (Geiger extension). */
    onEvent(callback: (event: TrackedEvent) => void): Unsubscribe;
    /** Alias of `onEvent`, matching the loader. */
    onTrackedEvent(callback: (event: TrackedEvent) => void): Unsubscribe;
    /**
     * Load the loader script without booting, e.g. to warm it up early. Resolves
     * true once the API is live, false on the server or when loading fails.
     * Never rejects.
     */
    load(options?: GeigerLoadOptions): Promise<boolean>;
}

export type { EventMetadata as E, GeigerBootSettings as G, LauncherState as L, SpaceName as S, TrackedEvent as T, Unsubscribe as U, GeigerCommsApi as a, GeigerCommsState as b, GeigerLoadOptions as c, GeigerUpdateData as d, GeigerBootOptions as e, GeigerUser as f, LauncherIcon as g };
