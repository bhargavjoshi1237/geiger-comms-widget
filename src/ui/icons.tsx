// Icons used by the messenger, transcribed from the design canvas.
//
// The canvas draws Lucide outlines at 24×24 with a 2px round stroke; these keep
// the exact path data so the rendered widget matches it pixel for pixel. Every
// icon is decorative — the interactive element around it carries the label — so
// they are all aria-hidden.

import type { SVGProps } from "react";

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  /** Rendered width and height in px. Matches the design's per-use sizing. */
  size?: number;
}

function base(size: number, strokeWidth: number | string, rest: SVGProps<SVGSVGElement>) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
    ...rest,
  };
}

export function MessageCircle({ size = 16, strokeWidth = 2, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth, rest)}>
      <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />
    </svg>
  );
}

export function Sparkles({ size = 16, strokeWidth = 2, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth, rest)}>
      <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
      <path d="M20 2v4" />
      <path d="M22 4h-4" />
      <circle cx="4" cy="20" r="2" />
    </svg>
  );
}

export function X({ size = 15, strokeWidth = 2, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth, rest)}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export function ChevronRight({ size = 15, strokeWidth = 2, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth, rest)}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function ChevronLeft({ size = 16, strokeWidth = 2, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth, rest)}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export function Search({ size = 14, strokeWidth = 2, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth, rest)}>
      <path d="m21 21-4.34-4.34" />
      <circle cx="11" cy="11" r="8" />
    </svg>
  );
}

export function Mail({ size = 16, strokeWidth = 2, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth, rest)}>
      <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
      <rect x="2" y="4" width="20" height="16" rx="2" />
    </svg>
  );
}

export function BookHeart({ size = 16, strokeWidth = 2, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth, rest)}>
      <path d="M12 5v16" />
      <path d="M20.001 19A2 2 0022 17V5a2 2 0 0 0-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z" />
    </svg>
  );
}

export function User({ size = 12, strokeWidth = 2, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth, rest)}>
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg>
  );
}

export function FileText({ size = 11, strokeWidth = 2, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth, rest)}>
      <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
      <path d="M14 2v5a1 1 0 0 0 1 1h5" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  );
}

export function ThumbsUp({ size = 12, strokeWidth = 2, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth, rest)}>
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
      <path d="M7 10v12" />
    </svg>
  );
}

export function Paperclip({ size = 15, strokeWidth = 2, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth, rest)}>
      <path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551" />
    </svg>
  );
}

export function ImageIcon({ size = 15, strokeWidth = 2, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth, rest)}>
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}

export function ArrowUp({ size = 14, strokeWidth = 2, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth, rest)}>
      <path d="m5 12 7-7 7 7" />
      <path d="M12 19V5" />
    </svg>
  );
}

export function CheckCheck({ size = 12, strokeWidth = 2, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth, rest)}>
      <path d="M18 6 7 17l-5-5" />
      <path d="m22 10-7.5 7.5L13 16" />
    </svg>
  );
}

export function Plus({ size = 13, strokeWidth = 2, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth, rest)}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

export function Clock({ size = 14, strokeWidth = 2, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth, rest)}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

export function CircleCheck({ size = 9, strokeWidth = 3, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth, rest)}>
      <path d="M21.801 10A10 10 0 1 1 17 3.335" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
}

export function ArrowUpRight({ size = 14, strokeWidth = 2, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth, rest)}>
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  );
}

export function Star({ size = 18, strokeWidth = 1.8, filled = false, ...rest }: IconProps & { filled?: boolean }) {
  return (
    <svg {...base(size, strokeWidth, rest)} fill={filled ? "currentColor" : "none"}>
      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
    </svg>
  );
}
