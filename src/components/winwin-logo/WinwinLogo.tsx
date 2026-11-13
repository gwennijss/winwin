"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Lockup, type LockupHandle } from "./Lockup";
import {
  HOME,
  STATES,
  type Media,
  type Pose,
  type Screen,
} from "./geometry";
import { buildLogoTimeline, type LogoTimeline } from "./timeline";

gsap.registerPlugin(useGSAP);

type Props = {
  className?: string;
  /** Called once the animation exists, e.g. to drive it from playback controls. */
  onReady?: (logo: LogoTimeline) => void;
  /** Pictures to show inside the block, per shape. */
  media?: Media;
};

/** The animated Win Win logo: the main lockup animation, looping. */
export function WinwinLogo({ className, onReady, media }: Props) {
  const lockup = useRef<LockupHandle>(null);

  useGSAP(() => {
    const pose: Pose = { ...STATES[HOME] };
    const screen: Screen = Object.fromEntries(
      Object.keys(media ?? {}).map((name) => [name, 0]),
    );
    const logo = buildLogoTimeline(
      pose,
      () => lockup.current?.draw(pose, screen),
      screen,
    );

    // People who ask for less motion get the resting logo; the animation is
    // still there for anything that plays it deliberately.
    const reducedMotion = gsap.matchMedia();
    reducedMotion.add("(prefers-reduced-motion: reduce)", () => {
      logo.timeline.pause().time(0);
    });

    onReady?.(logo);
    return () => reducedMotion.revert();
  });

  return <Lockup ref={lockup} className={className} media={media} />;
}
