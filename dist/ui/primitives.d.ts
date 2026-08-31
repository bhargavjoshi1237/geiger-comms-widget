import type { ReactNode } from "react";
import type { ConversationStatus, Person } from "./model";
export declare function Avatar({ person, size, showStatus, }: {
    person: Pick<Person, "initials" | "online" | "name">;
    size?: "xs" | "sm" | "md" | "lg";
    showStatus?: boolean;
}): import("react").JSX.Element;
export declare function AvatarStack({ people }: {
    people: Person[];
}): import("react").JSX.Element;
export declare function AiBadge(): import("react").JSX.Element;
export declare function Cap({ children }: {
    children: ReactNode;
}): import("react").JSX.Element;
export declare function StatusPill({ status }: {
    status: ConversationStatus;
}): import("react").JSX.Element;
export declare function UnreadCount({ count }: {
    count: number;
}): import("react").JSX.Element;
/** The plain back / title / action bar used by every sub-screen. */
export declare function HeaderBar({ onBack, onClose, children, action, }: {
    onBack?: () => void;
    onClose?: () => void;
    children: ReactNode;
    action?: ReactNode;
}): import("react").JSX.Element;
