import type { Article } from "../model";
export declare function HelpView({ articles, assistantName, initialQuery, onOpenArticle, onAsk, onMessageTeam, onClose, }: {
    articles: Article[];
    assistantName: string;
    initialQuery?: string;
    onOpenArticle: (id: string) => void;
    onAsk: () => void;
    onMessageTeam: () => void;
    onClose: () => void;
}): import("react").JSX.Element;
