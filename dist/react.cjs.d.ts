import type { ReactNode } from "react";
import type { GeigerCommsSettings, GeigerSpace } from "./types";
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
    showNewMessage(text?: string): void;
    showArticle(id: string): void;
    showNews(id?: string): void;
    showTicket(id: string): void;
}
export declare function GeigerProvider({ jwt, children, ...settings }: GeigerProviderProps): any;
export declare function useGeigerComms(): GeigerContextValue;
export {};
