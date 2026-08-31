import type { MessengerData } from "../model";
export declare function NewConversationView({ data, onBack, onSend, }: {
    data: MessengerData;
    onBack: () => void;
    onSend: (draft: {
        topic: string;
        orderId?: string;
        body: string;
    }) => void;
}): import("react").JSX.Element;
