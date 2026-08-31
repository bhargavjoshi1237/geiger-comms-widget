export interface ComposerProps {
    placeholder?: string;
    /** Footnote under the box — the design uses it for the AI disclosure. */
    note?: string;
    /** Hide the image button; the human thread only offers a paperclip. */
    allowImages?: boolean;
    onSend?: (text: string) => void;
    onAttach?: () => void;
}
export declare function Composer({ placeholder, note, allowImages, onSend, onAttach, }: ComposerProps): import("react").JSX.Element;
