import type { Article } from "../model";
export declare function ArticleView({ article, onBack, onAskInstead, onRate, onOpenExternal, }: {
    article: Article;
    onBack: () => void;
    onAskInstead: () => void;
    onRate: (helpful: boolean) => void;
    onOpenExternal?: () => void;
}): import("react").JSX.Element;
