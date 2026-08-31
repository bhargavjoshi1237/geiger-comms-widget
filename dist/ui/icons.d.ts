import type { SVGProps } from "react";
interface IconProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
    /** Rendered width and height in px. Matches the design's per-use sizing. */
    size?: number;
}
export declare function MessageCircle({ size, strokeWidth, ...rest }: IconProps): import("react").JSX.Element;
export declare function Sparkles({ size, strokeWidth, ...rest }: IconProps): import("react").JSX.Element;
export declare function X({ size, strokeWidth, ...rest }: IconProps): import("react").JSX.Element;
export declare function ChevronRight({ size, strokeWidth, ...rest }: IconProps): import("react").JSX.Element;
export declare function ChevronLeft({ size, strokeWidth, ...rest }: IconProps): import("react").JSX.Element;
export declare function Search({ size, strokeWidth, ...rest }: IconProps): import("react").JSX.Element;
export declare function Mail({ size, strokeWidth, ...rest }: IconProps): import("react").JSX.Element;
export declare function BookHeart({ size, strokeWidth, ...rest }: IconProps): import("react").JSX.Element;
export declare function User({ size, strokeWidth, ...rest }: IconProps): import("react").JSX.Element;
export declare function FileText({ size, strokeWidth, ...rest }: IconProps): import("react").JSX.Element;
export declare function ThumbsUp({ size, strokeWidth, ...rest }: IconProps): import("react").JSX.Element;
export declare function Paperclip({ size, strokeWidth, ...rest }: IconProps): import("react").JSX.Element;
export declare function ImageIcon({ size, strokeWidth, ...rest }: IconProps): import("react").JSX.Element;
export declare function ArrowUp({ size, strokeWidth, ...rest }: IconProps): import("react").JSX.Element;
export declare function CheckCheck({ size, strokeWidth, ...rest }: IconProps): import("react").JSX.Element;
export declare function Plus({ size, strokeWidth, ...rest }: IconProps): import("react").JSX.Element;
export declare function Clock({ size, strokeWidth, ...rest }: IconProps): import("react").JSX.Element;
export declare function CircleCheck({ size, strokeWidth, ...rest }: IconProps): import("react").JSX.Element;
export declare function ArrowUpRight({ size, strokeWidth, ...rest }: IconProps): import("react").JSX.Element;
export declare function Star({ size, strokeWidth, filled, ...rest }: IconProps & {
    filled?: boolean;
}): import("react").JSX.Element;
export {};
