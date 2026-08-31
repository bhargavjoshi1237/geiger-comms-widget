export type LauncherState = "idle" | "unread" | "open";
export declare function Launcher({ state, unread, onClick, label, }: {
    state: LauncherState;
    unread?: number;
    onClick?: () => void;
    /** Overrides the derived accessible name. */
    label?: string;
}): import("react").JSX.Element;
