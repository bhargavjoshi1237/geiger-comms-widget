import type { Conversation } from "../model";
export interface ThreadViewProps {
    conversation: Conversation;
    /** Day separator at the top of the thread, e.g. "Today 14:02". */
    dayMark?: string;
    /** Shows the dashed "Drop files to attach" target (2i). */
    showDropzone?: boolean;
    assistantName: string;
    rating: number;
    onRatingChange: (n: number) => void;
    onSubmitRating: () => void;
    onSkipRating: () => void;
    onBack: () => void;
    onGetHuman: () => void;
    onOpenArticle: (id: string) => void;
    onSend: (text: string) => void;
    onQuickReply: (text: string) => void;
    onRateMessage: (id: string, helpful: boolean) => void;
}
export declare function ThreadView({ conversation, dayMark, showDropzone, assistantName, rating, onRatingChange, onSubmitRating, onSkipRating, onBack, onGetHuman, onOpenArticle, onSend, onQuickReply, onRateMessage, }: ThreadViewProps): import("react").JSX.Element;
