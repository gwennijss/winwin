"use client";

import { StillContext } from "./motion";
import type { SlideDef } from "./types";

/**
 * The sealed 1920 × 1080 surface. Used by the live stage, the overview
 * thumbnails and the print route, so a slide looks the same in all three.
 */
export function SlideFrame({ slide, still = false }: { slide: SlideDef; still?: boolean }) {
  const Body = slide.Component;
  return (
    <StillContext.Provider value={still}>
      <div className="slide">
        <Body />
      </div>
    </StillContext.Provider>
  );
}
