"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { BRAND } from "../labels/palette";
import { FLOW, POP } from "../winwin-logo/motion";
import { BEAT } from "../winwin-logo/timeline";

/** A number of counts, in seconds. */
const counts = (n: number) => n * BEAT;

export type Stat = {
  /** The result itself, short: two to four glyphs. */
  value: string;
  /** What it counts, in a word or two. */
  caption: string;
};

/** Two results that are shown side by side. */
export type Pair = [Stat, Stat];

/** The moments of one round, in counts. All results have been seen in under six seconds. */
const AT = {
  /** The client's name, at the top. */
  top: 0,
  /** The first two results. */
  first: 1,
  /** The second two take their place, and the blocks trade formats. */
  second: 11,
  /** Everything goes, and the video has the screen to itself. */
  out: 22,
  end: 28,
} as const;

/** When the first two results stand finished, in seconds. */
export const STATS_STILL = counts(7);

/** The widths of the left-hand block, wide and narrow; the right-hand one takes the rest. */
const WIDE = "14.2em";
const NARROW = "9.3em";

/**
 * Cuts a line of type down to its capitals: from the top of a capital to the
 * baseline. It lets a number sit tight in its block and its caption close
 * under it.
 */
const CAPITALS = "[text-box:trim-both_cap_alphabetic]";

/**
 * How far a rolling glyph moves to be out of sight, as a percentage of its
 * height. The edge it moves behind leaves room under the baseline for the
 * tail of a comma, and a per cent sign stands a little taller than a
 * capital, so it takes half as much again either way.
 */
const BELOW = 155;
const ABOVE = -145;

/** A caption in full, wiped away to the left, and waiting to grow in from the right. */
const SHOWN = "inset(0% 0% 0% 0%)";
const WIPED = "inset(0% 100% 0% 0%)";
const WAITING = "inset(0% 0% 0% 100%)";

type Ink = { number: string; caption: string };

const ON_VIOLET: Ink = {
  number: BRAND.light,
  caption: "rgb(243 246 255 / 0.82)",
};
const ON_LIGHT: Ink = { number: BRAND.dark, caption: "rgb(37 37 38 / 0.72)" };

/** A number, cut into glyphs that roll each behind its own edge, with what it counts under it. */
function Figure({ stat, ink }: { stat: Stat; ink: Ink }) {
  return (
    <>
      <span className="sr-only">
        {stat.value} {stat.caption}
      </span>
      <span
        aria-hidden
        className="flex text-[4.3em] leading-none whitespace-pre"
        style={{ color: ink.number }}
      >
        {[...stat.value].map((glyph, index) => (
          // The edge a glyph rolls behind: the top of a capital and, a
          // little under the baseline, room for the tail of a comma. A
          // comma stands in too much room of its own at this size, so it is
          // drawn in a little.
          <span
            key={index}
            className={`inline-block ${/[.,]/.test(glyph) ? "-mx-[0.045em]" : ""}`}
            style={{ clipPath: "inset(0 -0.4em -0.2em -0.4em)" }}
          >
            <span data-glyph className={`block ${CAPITALS}`}>
              {glyph}
            </span>
          </span>
        ))}
      </span>
      <span
        data-caption
        aria-hidden
        className={`mt-[0.72em] block text-[1.2em] leading-none tracking-[0.04em] whitespace-pre uppercase ${CAPITALS}`}
        style={{ color: ink.caption }}
      >
        {stat.caption}
      </span>
    </>
  );
}

type Props = {
  /** Who the campaign was for. */
  client: string;
  /**
   * The results, two at a time. The blocks trade formats, so the first pair
   * needs its long result on the left and the second pair on the right.
   */
  pairs: [Pair, Pair];
  /** Hands the animation to whoever wants to pause or scrub it. */
  onTimeline?: (timeline: gsap.core.Timeline | null) => void;
};

/**
 * Results over a video that stays the thing to watch. The client's name
 * stands in a violet block at the top. At the bottom are two blocks side by
 * side, one violet and one light, each with a result. They stand up out of
 * nothing, the numbers roll in, and for the second pair the blocks trade
 * formats, as the block in the logo does: the wide one narrows and the
 * narrow one widens, while the numbers roll on. It is sized by its font
 * size, which is one 27th of the width of a portrait video.
 */
export function StatBlocks({ client, pairs, onTimeline }: Props) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const build = () => {
      const area = root.current;
      if (!area) return;
      const all = (selector: string, within: Element = area) =>
        Array.from(within.querySelectorAll<HTMLElement>(selector));

      const name = area.querySelector<HTMLElement>("[data-name]");
      const blocks = all("[data-format]");
      const contents = blocks.map((block) => all("[data-content]", block));
      const glyphs = (content: HTMLElement) => all("[data-glyph]", content);
      const caption = (content: HTMLElement) => all("[data-caption]", content);
      const roll = { duration: 0.45, ease: "power4.inOut", stagger: 0.07 };
      const wipe = { duration: counts(1.5), ease: "power2.inOut" };

      const timeline = gsap.timeline({
        repeat: -1,
        defaults: { immediateRender: false },
      });

      // Every round starts from nothing.
      timeline.set(name, { scale: 0 }, 0);
      timeline.set(blocks, { scaleY: 0 }, 0);
      timeline.set(blocks[0], { width: WIDE }, 0);
      contents.flat().forEach((content) => {
        timeline.set(glyphs(content), { yPercent: BELOW }, 0);
        timeline.set(caption(content), { clipPath: WAITING }, 0);
      });

      // The client's name pops out of its corner.
      timeline.fromTo(
        name,
        { scale: 0 },
        { scale: 1, duration: counts(2), ease: POP },
        counts(AT.top),
      );

      blocks.forEach((block, index) => {
        const [first, second] = contents[index];
        // The right-hand block follows the left-hand one by half a count.
        const lag = counts(0.5 * index);

        // The block stands up out of its bottom edge, and its number rolls
        // in glyph by glyph, with the caption growing in after it.
        timeline.fromTo(
          block,
          { scaleY: 0 },
          { scaleY: 1, duration: counts(2), ease: POP },
          counts(AT.first) + lag,
        );
        timeline.fromTo(
          glyphs(first),
          { yPercent: BELOW },
          { yPercent: 0, ...roll },
          counts(AT.first + 1.25) + lag,
        );
        timeline.fromTo(
          caption(first),
          { clipPath: WAITING },
          { clipPath: SHOWN, ...wipe },
          counts(AT.first + 2) + lag,
        );

        // The change: the old number rolls out at the top, the new one in
        // from below.
        timeline.fromTo(
          glyphs(first),
          { yPercent: 0 },
          { yPercent: ABOVE, ...roll },
          counts(AT.second) + lag,
        );
        timeline.fromTo(
          caption(first),
          { clipPath: SHOWN },
          { clipPath: WIPED, duration: counts(1.25), ease: "power2.inOut" },
          counts(AT.second) + lag,
        );
        timeline.fromTo(
          glyphs(second),
          { yPercent: BELOW },
          { yPercent: 0, ...roll },
          counts(AT.second + 1.25) + lag,
        );
        timeline.fromTo(
          caption(second),
          { clipPath: WAITING },
          { clipPath: SHOWN, ...wipe },
          counts(AT.second + 2) + lag,
        );

        // Away: the number rolls out, and the block sinks back into its
        // bottom edge.
        timeline.fromTo(
          glyphs(second),
          { yPercent: 0 },
          { yPercent: ABOVE, ...roll },
          counts(AT.out) + lag,
        );
        timeline.fromTo(
          caption(second),
          { clipPath: SHOWN },
          { clipPath: WIPED, duration: counts(1.25), ease: "power2.inOut" },
          counts(AT.out) + lag,
        );
        timeline.to(
          block,
          { scaleY: 0, duration: counts(2), ease: FLOW },
          counts(AT.out + 1.75) + lag,
        );
      });

      // At the change the blocks trade formats: the wide one narrows, and
      // the other, which takes the rest of the width, widens with it.
      timeline.to(
        blocks[0],
        { width: NARROW, duration: counts(3), ease: FLOW },
        counts(AT.second),
      );
      timeline.to(
        name,
        { scale: 0, duration: counts(2), ease: FLOW },
        counts(AT.out + 1.75),
      );
      timeline.to({}, { duration: 0 }, counts(AT.end));

      // People who ask for less motion get the first two results, standing still.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        timeline.pause().time(STATS_STILL);
      }
      onTimeline?.(timeline);
    };

    const context = gsap.context(build, root);

    return () => {
      onTimeline?.(null);
      context.revert();
    };
  }, [onTimeline]);

  // Both pairs stand in the same place in a block, one over the other.
  const stack = (slot: 0 | 1, ink: Ink) => (
    <div className="grid">
      {pairs.map((pair, index) => (
        <div
          key={index}
          data-content
          className="col-start-1 row-start-1 flex flex-col items-start"
        >
          <Figure stat={pair[slot]} ink={ink} />
        </div>
      ))}
    </div>
  );

  return (
    <div ref={root} className="absolute inset-0 font-display">
      {/* Clear of what the apps put over a video: the bar along the top and
          the caption along the bottom. */}
      <div
        data-name
        className="absolute top-[10%] left-[5.5%] origin-top-left px-[0.8em] py-[0.7em]"
        // Hidden until the animation takes over, so nothing flashes on load.
        style={{ background: BRAND.violet, transform: "scale(0)" }}
      >
        <span
          className={`block text-[2.2em] leading-none ${CAPITALS}`}
          style={{ color: BRAND.light }}
        >
          {client}
        </span>
      </div>
      <div className="absolute inset-x-[5.5%] bottom-[12%] flex gap-[0.5em]">
        <div
          data-format
          className="origin-bottom overflow-hidden px-[1em] py-[1.1em]"
          style={{
            width: WIDE,
            background: BRAND.violet,
            transform: "scaleY(0)",
          }}
        >
          {stack(0, ON_VIOLET)}
        </div>
        <div
          data-format
          className="min-w-0 flex-1 origin-bottom overflow-hidden px-[1em] py-[1.1em]"
          style={{ background: BRAND.light, transform: "scaleY(0)" }}
        >
          {stack(1, ON_LIGHT)}
        </div>
      </div>
    </div>
  );
}
