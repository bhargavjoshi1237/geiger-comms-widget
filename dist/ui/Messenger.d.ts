import type { MessengerData, View } from "./model";
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
export declare function Messenger({ data, defaultOpen, defaultView, inline, mobile, align, hideLauncher, theme, onEvent, }: MessengerProps): import("react").JSX.Element;
