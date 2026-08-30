import type { ReactNode } from "react";
import type { GeigerCommsSettings, GeigerSpace, WidgetEvent } from "./types";
export interface GeigerProviderProps extends Omit<GeigerCommsSettings, "jwt"> {
    /** Signed server-side; a change in value re-boots the widget as that identity. */
    jwt?: string | null;
    children: ReactNode;
}
interface GeigerContextValue {
    isReady: boolean;
    unreadCount: number;
    open(): void;
    close(): void;
    showSpace(name: GeigerSpace): void;
    showMessages(): void;
    showAsk(text?: string): void;
    showNewMessage(text?: string): void;
    showArticle(id: string): void;
    showNews(id?: string): void;
    showTicket(id: string): void;
    setLauncherState(state: {
        label?: string;
        unread?: number;
        icon?: "help" | "minimize" | "close" | "ai";
    }): void;
}
export declare function GeigerProvider({ jwt, children, ...settings }: GeigerProviderProps): import("react").JSX.Element;
export declare function useGeigerComms(): GeigerContextValue;
/** Listener-friendly hook around `onEvent`. */
export declare function useGeigerEvent(handler: (event: WidgetEvent) => void): void;
export {};
