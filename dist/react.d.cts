import * as react from 'react';
import { ReactNode } from 'react';
import { f as GeigerUser, e as GeigerBootOptions, S as SpaceName } from './types-D6kpPxsF.cjs';

interface GeigerProviderProps {
    /** The widget app's public id from Messenger > Install, e.g. "wg_7fk2p9". */
    appId: string;
    /** JWT signed by your backend for the signed-in user; omit for anonymous visitors. */
    jwt?: string | null;
    user?: GeigerUser;
    options?: GeigerBootOptions;
    /** Loader script URL override, e.g. "http://localhost:3000/widget/v1.js". Read once. */
    scriptUrl?: string;
    /** Geiger Comms deployment base, e.g. "http://localhost:3000". Read once. */
    apiBase?: string;
    children?: ReactNode;
}
interface UseGeigerCommsResult {
    /** Open the Messenger panel. */
    open: () => void;
    /** Close the Messenger panel. */
    close: () => void;
    showSpace: (name: SpaceName) => void;
    unreadCount: number;
    /** The loader is live and the Messenger has booted. */
    isReady: boolean;
    /** The Messenger panel is open (handy for a custom launcher). */
    isOpen: boolean;
}
/**
 * Boots the Messenger on mount, re-boots when `jwt` changes identity, and
 * shuts it down on unmount. Anonymous -> signed-in keeps the anonymous id so
 * the visitor's history merges; any other identity change shuts down first so
 * one user's session never leaks into the next. A same-user token refresh does
 * not re-boot.
 */
declare function GeigerProvider({ appId, jwt, user, options, scriptUrl, apiBase, children }: GeigerProviderProps): react.JSX.Element;
/** Messenger controls and live state. Works inside or outside GeigerProvider. */
declare function useGeigerComms(): UseGeigerCommsResult;

export { GeigerBootOptions, GeigerProvider, type GeigerProviderProps, GeigerUser, SpaceName, type UseGeigerCommsResult, useGeigerComms };
