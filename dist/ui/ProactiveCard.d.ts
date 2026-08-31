import type { ProactiveMessage } from "./model";
export declare function ProactiveCard({ message, onConfirm, onDismiss, onReply, }: {
    message: ProactiveMessage;
    onConfirm: () => void;
    onDismiss: () => void;
    onReply: (text: string) => void;
}): import("react").JSX.Element;
