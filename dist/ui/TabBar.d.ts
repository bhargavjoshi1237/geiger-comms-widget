import type { Tab } from "./model";
export declare function TabBar({ active, unread, onChange, }: {
    active: Tab;
    /** Badge on the Messages tab. */
    unread?: number;
    onChange: (tab: Tab) => void;
}): import("react").JSX.Element;
