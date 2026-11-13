const base = {
  width: 18,
  height: 18,
  viewBox: "0 0 18 18",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "square" as const,
  "aria-hidden": true,
};

export const IconArrowLeft = () => (
  <svg {...base}>
    <path d="M14.5 9h-11M7.5 4.5 3 9l4.5 4.5" />
  </svg>
);

export const IconArrowRight = () => (
  <svg {...base}>
    <path d="M3.5 9h11M10.5 4.5 15 9l-4.5 4.5" />
  </svg>
);

export const IconGrid = () => (
  <svg {...base}>
    <path d="M3 3h4.5v4.5H3zM10.5 3H15v4.5h-4.5zM3 10.5h4.5V15H3zM10.5 10.5H15V15h-4.5z" />
  </svg>
);

export const IconDownload = () => (
  <svg {...base}>
    <path d="M9 2.5v9M5 8l4 4 4-4M3 15.5h12" />
  </svg>
);

export const IconFullscreen = () => (
  <svg {...base}>
    <path d="M3 7V3h4M11 3h4v4M15 11v4h-4M7 15H3v-4" />
  </svg>
);

export const IconFullscreenExit = () => (
  <svg {...base}>
    <path d="M7 3v4H3M15 7h-4V3M11 15v-4h4M3 11h4v4" />
  </svg>
);

export const IconClose = () => (
  <svg {...base}>
    <path d="m4 4 10 10M14 4 4 14" />
  </svg>
);

export const IconRotate = () => (
  <svg {...base}>
    <path d="M6 2.5h6v13H6zM2.5 7v4M15.5 7v4" />
  </svg>
);
