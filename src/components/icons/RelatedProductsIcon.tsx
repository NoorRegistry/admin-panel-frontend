import type { SVGProps } from "react";

export default function RelatedProductsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="20"
      height="20"
      viewBox="0 0 28 28"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="4" width="8" height="8" rx="2" ry="2" />

        <rect x="16" y="4" width="8" height="8" rx="2" ry="2" />

        <rect x="4" y="16" width="8" height="8" rx="2" ry="2" />

        <rect x="16" y="16" width="8" height="8" rx="2" ry="2" />

        <line x1="12" y1="8" x2="16" y2="8" strokeDasharray="3,2" />
        <line x1="8" y1="12" x2="8" y2="16" strokeDasharray="3,2" />
        <line x1="12" y1="20" x2="16" y2="20" strokeDasharray="3,2" />
        <line x1="20" y1="12" x2="20" y2="16" strokeDasharray="3,2" />

        <circle cx="14" cy="14" r="1.5" fill="currentColor" />
      </g>
    </svg>
  );
}
