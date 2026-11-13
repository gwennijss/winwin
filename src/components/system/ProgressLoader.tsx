"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Lockup, type LockupHandle } from "../winwin-logo/Lockup";
import { STATES, type Pose } from "../winwin-logo/geometry";
import { BURST, FLOW } from "../winwin-logo/motion";
import { BEAT } from "../winwin-logo/timeline";
import { respectReducedMotion } from "./reduced-motion";

gsap.registerPlugin(useGSAP);

/** Nothing loaded yet: the square. Everything loaded: the landscape. */
const EMPTY: Pose = STATES.square;
const FULL: Pose = STATES.landscape;

/** Loading never runs evenly; these are the fits and starts it is shown in. */
const STAGES = [
  { to: 0.16, counts: 2 },
  { to: 0.43, counts: 3 },
  { to: 0.58, counts: 2 },
  { to: 0.9, counts: 3 },
  { to: 1, counts: 2 },
];

const between = (progress: number): Pick<Pose, "w" | "gap"> => ({
  w: EMPTY.w + progress * (FULL.w - EMPTY.w),
  gap: EMPTY.gap + progress * (FULL.gap - EMPTY.gap),
});

/**
 * A page loader made of the logo's own shapes: the block starts as the square
 * and widens into the landscape as the page loads, pushing the words apart.
 * When it is done it spins shut into the logo.
 */
export function ProgressLoader({ className }: { className?: string }) {
  const lockup = useRef<LockupHandle>(null);
  const count = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const pose: Pose = { ...EMPTY };
    const progress = { value: 0 };
    const draw = () => {
      lockup.current?.draw(pose);
      if (count.current) {
        count.current.textContent = String(Math.round(progress.value)).padStart(3, "0");
      }
    };

    const timeline = gsap.timeline({
      repeat: -1,
      onUpdate: draw,
      defaults: { immediateRender: false },
    });

    // Each stage flows into place and then waits a count for the next.
    let at = BEAT;
    let loaded = 0;
    for (const stage of STAGES) {
      const duration = stage.counts * BEAT;
      timeline.fromTo(
        pose,
        between(loaded),
        { ...between(stage.to), duration, ease: FLOW },
        at,
      );
      timeline.fromTo(
        progress,
        { value: loaded * 100 },
        { value: stage.to * 100, duration, ease: FLOW },
        at,
      );
      at += duration + BEAT;
      loaded = stage.to;
    }

    // Done: the accent. The landscape closes in and spins onto its point.
    // Half a turn more than needed looks the same and gives it the spin.
    const logo: Pose = { ...STATES.diamond, rot: 225 };
    timeline.fromTo(
      pose,
      { ...FULL },
      { ...logo, duration: 3 * BEAT, ease: BURST },
      at,
    );
    at += 3 * BEAT + 4 * BEAT;

    // And back to the square for the next round.
    timeline.fromTo(
      pose,
      { ...logo },
      { ...EMPTY, rot: 360, duration: 2 * BEAT, ease: FLOW },
      at,
    );
    timeline.set(progress, { value: 0 }, at + BEAT);
    at += 2 * BEAT;
    timeline.set(pose, { rot: 0 }, at);
    timeline.to({}, { duration: 0 }, at + BEAT);

    respectReducedMotion(timeline);
  });

  return (
    <div className={`flex w-full flex-col items-center gap-2 ${className ?? ""}`}>
      <Lockup ref={lockup} initial={EMPTY} className="w-full" />
      <span
        ref={count}
        className="font-mono text-xs tabular-nums tracking-widest text-[rgb(var(--ink)/0.5)]"
      >
        000
      </span>
    </div>
  );
}
