import type { MessengerData } from "../model";
export declare function OfflineView({ data, onAsk, onLeaveMessage, onClose, }: {
    data: MessengerData;
    onAsk: () => void;
    onLeaveMessage: (draft: {
        email: string;
        body: string;
    }) => void;
    onClose: () => void;
}): import("react").JSX.Element;
