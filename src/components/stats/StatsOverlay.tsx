"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { BRAND, SHADE } from "../labels/palette";
import { BEAT } from "../winwin-logo/timeline";
import {
  addStats,
  counterRun,
  type StatMotion,
  type StatRow,
} from "./statMotion";

/** When the first result stands finished, in seconds: where a still is taken. */
export const STILL = 5 * BEAT;

/** The typefaces to try for the number. */
export const NUMBER_FACES = {
  condensed: "var(--font-trabat)",
  semi: "var(--font-trabat-semi)",
  tall: "var(--font-anton)",
} as const;

export type NumberFace = keyof typeof NUMBER_FACES;

export type Stat = {
  /** The result itself, short: four glyphs or so. */
  value: string;
  /** What it counts. */
  caption: string;
};

type Props = {
  stats: Stat[];
  motion: StatMotion;
  face?: NumberFace;
  /** Hands the animation to whoever wants to pause or scrub it. */
  onTimeline?: (timeline: gsap.core.Timeline | null) => void;
};

/**
 * Cuts a line of type down to its capitals: from the top of a capital to the
 * baseline, whatever the typeface. It makes the edge a glyph rolls behind
 * sit tight on the number, and lets the caption hang close under it.
 */
const CAPITALS = "[text-box:trim-both_cap_alphabetic]";

/**
 * Results as the main thing on a story: one number at a time, as large as
 * the width allows, with what it counts hanging from its right-hand end.
 * Each makes way for the next in one of the ways in `statMotion.ts`, and the
 * last for the first, so the round loops. It fills the width it is given;
 * its font size is one 27th of the width of a portrait video.
 */
export function StatsOverlay({
  stats,
  motion,
  face = "condensed",
  onTimeline,
}: Props) {
  const root = useRef<HTMLDivElement>(null);
  const block = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let context: gsap.Context | undefined;
    let tidy: (() => void) | undefined;
    let gone = false;

    const build = () => {
      if (!root.current || !block.current) return;
      const area = root.current;
      const rows: StatRow[] = Array.from(
        area.querySelectorAll<HTMLElement>("[data-stat]"),
      ).map((row) => ({
        row,
        glyphs: Array.from(row.querySelectorAll<HTMLElement>("[data-glyph]")),
        caption: row.querySelector<HTMLElement>("[data-caption]")!,
      }));

      // The number is set as large as it can be: the widest result fills
      // the width, and the others are set at the same size.
      const numbers = Array.from(
        area.querySelectorAll<HTMLElement>("[data-number]"),
      );
      const widest = Math.max(...numbers.map((number) => number.offsetWidth));
      const now = parseFloat(area.style.getPropertyValue("--number")) || 10;
      area.style.setProperty(
        "--number",
        ((now * area.clientWidth) / widest).toFixed(3),
      );

      const timeline = gsap.timeline({
        repeat: -1,
        defaults: { immediateRender: false },
      });
      tidy = addStats(timeline, motion, rows, { block: block.current });

      // People who ask for less motion get the first result, standing still.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        timeline.pause().time(STILL);
      }
      onTimeline?.(timeline);
    };

    // The number is measured, which is only right once its typeface is in.
    const family = getComputedStyle(root.current!).fontFamily;
    Promise.all([document.fonts.load(`16px ${family}`), document.fonts.ready])
      .catch(() => undefined)
      .then(() => {
        if (gone) return;
        context = gsap.context(build, root);
      });

    return () => {
      gone = true;
      onTimeline?.(null);
      context?.revert();
      tidy?.();
    };
  }, [motion, face, onTimeline]);

  return (
    // All results stand in the same place, one over the other.
    <div
      ref={root}
      className="relative grid w-full"
      style={{ fontFamily: NUMBER_FACES[face] }}
    >
      {stats.map((stat) => {
        let digit = 0;
        return (
          <div
            key={stat.caption}
            data-stat
            className="invisible col-start-1 row-start-1 flex flex-col items-end justify-self-start"
          >
            <span className="sr-only">
              {stat.value} {stat.caption}
            </span>
            <div
              data-number
              aria-hidden
              className="flex leading-none whitespace-pre"
              style={{
                fontSize: "calc(var(--number, 10) * 1em)",
                color: SHADE.violetLight,
              }}
            >
              {[...stat.value].map((glyph, index) => {
                const counted = motion === "count" && /\d/.test(glyph);
                const run = counted ? counterRun(digit++) : 0;
                return (
                  // The edge a glyph rolls behind: the top of a capital and,
                  // a little under the baseline, room for the tail of a
                  // comma. Open at the sides, so a wider digit passing
                  // through is not cut.
                  <span
                    key={index}
                    // A comma or full stop in a number this size stands in
                    // too much room of its own, so it is drawn in a little.
                    className={`inline-block ${/[.,]/.test(glyph) ? "-mx-[0.045em]" : ""}`}
                    style={{ clipPath: "inset(0 -0.4em -0.2em -0.4em)" }}
                  >
                    <span
                      data-glyph
                      data-run={counted ? run : undefined}
                      className={`relative block ${CAPITALS}`}
                    >
                      {/* The digits the counter passes on its way, stacked
                          above the one it lands on. */}
                      {counted &&
                        Array.from({ length: run }, (_, step) => (
                          <span
                            key={step}
                            className={`absolute left-1/2 block -translate-x-1/2 ${CAPITALS}`}
                            style={{ top: `${-(step + 1) * 100}%` }}
                          >
                            {(Number(glyph) + 10 * run - (step + 1)) % 10}
                          </span>
                        ))}
                      {glyph}
                    </span>
                  </span>
                );
              })}
            </div>
            {/* What the number counts, in capitals, hanging close under its
                right-hand end. */}
            <div
              data-caption
              aria-hidden
              className={`mt-[0.42em] text-[1.9em] leading-none tracking-[0.03em] whitespace-pre uppercase ${CAPITALS}`}
              style={{ color: BRAND.light }}
            >
              {stat.caption}
            </div>
          </div>
        );
      })}
      {/* The violet block that one of the motions slides across. */}
      <span
        ref={block}
        aria-hidden
        className="absolute -inset-x-[0.5em] -inset-y-[0.7em] block rounded-[0.08em]"
        style={{ background: BRAND.violet, transform: "scaleX(0)" }}
      />
    </div>
  );
}
