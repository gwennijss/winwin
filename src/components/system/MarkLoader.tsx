"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Mark, type MarkHandle } from "../winwin-logo/Mark";
import {
  MARK_SHAPES,
  type Pose,
  type StateName,
} from "../winwin-logo/geometry";
import { buildLogoTimeline } from "../winwin-logo/timeline";
import { respectReducedMotion } from "./reduced-motion";

gsap.registerPlugin(useGSAP);

/** The five shapes at the size of the mark; it has no words to keep apart. */
const SHAPES: Record<StateName, Pose> = {
  diamond: { ...MARK_SHAPES.diamond, gap: 0 },
  square: { ...MARK_SHAPES.square, gap: 0 },
  portrait: { ...MARK_SHAPES.portrait, gap: 0 },
  landscape: { ...MARK_SHAPES.landscape, gap: 0 },
  post: { ...MARK_SHAPES.post, gap: 0 },
};

/**
 * The small loader: the logo's own loop, played by the mark alone. Same
 * shapes, same rhythm, same spin. For buttons, inline waits and anywhere the
 * full lockup does not fit.
 */
export function MarkLoader({ className }: { className?: string }) {
  const mark = useRef<MarkHandle>(null);

  useGSAP(() => {
    const pose: Pose = { ...SHAPES.diamond };
    const { timeline } = buildLogoTimeline(
      pose,
      () => mark.current?.draw(pose),
      {},
      SHAPES,
    );
    respectReducedMotion(timeline);
  });

  return <Mark ref={mark} className={className} />;
}
