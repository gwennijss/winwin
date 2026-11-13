import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // The dev badge sits on top of the playback controls.
  devIndicators: false,
  partialPrefetching: true,
  experimental: {
    // The dev server's on-disk cache has twice kept serving an old version of
    // a file after it was edited. Without it a restart always gives the
    // current code, at the cost of a slightly slower first load.
    turbopackFileSystemCacheForDev: false,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
      // Lets the logo vectors from Figma be imported as React components,
      // untouched (no SVGO), so they can be drawn inside the animated SVG.
      "*.svg": {
        loaders: [{ loader: "@svgr/webpack", options: { svgo: false } }],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
