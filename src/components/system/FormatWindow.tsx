"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Lockup, type LockupHandle } from "../winwin-logo/Lockup";
import {
  STATES,
  type Media,
  type Pose,
  type Screen,
  type StateName,
} from "../winwin-logo/geometry";
import { BEAT, morphPose } from "../winwin-logo/timeline";

const FORMATS: { name: string; where: string; state: StateName }[] = [
  { name: "Vierkant", where: "Instagram · LinkedIn", state: "square" },
  { name: "Staand", where: "Reels · TikTok · Shorts", state: "portrait" },
  { name: "Liggend", where: "YouTube", state: "landscape" },
  { name: "Post", where: "4:5", state: "post" },
];

/** Counts on each format while nobody has chosen one: a move and a rest. */
const CYCLE = 6 * BEAT;

type Props = {
  className?: string;
  /** Pictures to show in the window, per format. */
  media?: Media;
};

/**
 * The block as a window onto the work: pick a channel and it takes on that
 * channel's format, with the same move as in the logo. Left alone it walks
 * through all of them.
 */
export function FormatWindow({ className, media }: Props) {
  const lockup = useRef<LockupHandle>(null);
  const pose = useRef<Pose>({ ...STATES[FORMATS[0].state] });
  // Every format has a place on the screen; only the first one is lit.
  const screen = useRef<Screen>(
    Object.fromEntries(
      FORMATS.map(({ state }, index) => [state, index === 0 ? 1 : 0]),
    ),
  );
  const [active, setActive] = useState(0);
  const [chosen, setChosen] = useState(false);

  const draw = useCallback(
    () => lockup.current?.draw(pose.current, screen.current),
    [],
  );

  const show = useCallback(
    (index: number) => {
      setActive(index);
      morphPose(pose.current, STATES[FORMATS[index].state], draw);
      // The old picture goes at once; the new one comes in as the block lands.
      gsap.killTweensOf(screen.current);
      for (const { state } of FORMATS) {
        const on = state === FORMATS[index].state;
        gsap.to(screen.current, {
          [state]: on ? 1 : 0,
          duration: BEAT,
          delay: on ? 2 * BEAT : 0,
          ease: "none",
          onUpdate: draw,
        });
      }
    },
    [draw],
  );

  // Show the first picture, and stop any move still under way on leaving.
  useEffect(() => {
    draw();
    const moving = [pose.current, screen.current];
    return () => gsap.killTweensOf(moving);
  }, [draw]);

  useEffect(() => {
    if (chosen) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(
      () => show((active + 1) % FORMATS.length),
      CYCLE * 1000,
    );
    return () => window.clearTimeout(timer);
  }, [active, chosen, show]);

  return (
    <div className={`flex w-full flex-col items-center gap-6 ${className ?? ""}`}>
      <Lockup
        ref={lockup}
        initial={STATES[FORMATS[0].state]}
        media={media}
        className="w-full"
      />
      <div className="flex flex-wrap justify-center gap-2 font-mono text-[11px] tracking-wide">
        {FORMATS.map((format, index) => (
          <button
            key={format.name}
            type="button"
            aria-pressed={index === active}
            onClick={() => {
              setChosen(true);
              show(index);
            }}
            className={`cursor-pointer border px-3 py-1.5 transition-colors ${
              index === active
                ? "border-[rgb(var(--ink))] bg-[rgb(var(--ink))] text-[var(--background)]"
                : "border-[rgb(var(--ink)/0.20)] text-[rgb(var(--ink)/0.60)] hover:border-[rgb(var(--ink)/0.60)] hover:text-[rgb(var(--ink))]"
            }`}
          >
            {format.name}
            <span className="ml-2 opacity-60">{format.where}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
