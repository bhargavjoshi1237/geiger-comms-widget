import type { Conversation, MessengerData } from "../model";
export declare function HomeView({ data, recent, onAsk, onOpenConversation, onSeeAll, onSearch, onClose, }: {
    data: MessengerData;
    /** Most recent thread, or undefined for a first-time visitor. */
    recent?: Conversation;
    onAsk: () => void;
    onOpenConversation: (id: string) => void;
    onSeeAll: () => void;
    onSearch: (query: string) => void;
    onClose: () => void;
}): import("react").JSX.Element;
