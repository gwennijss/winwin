"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { STATES } from "../winwin-logo/geometry";
import { FLOW, POP } from "../winwin-logo/motion";
import { BEAT } from "../winwin-logo/timeline";
import { VIOLET_DARK_MARK, type LabelColours } from "./palette";
import { playWhileVisible } from "./play-while-visible";

gsap.registerPlugin(useGSAP);

/** A number of counts, in seconds. */
const counts = (n: number) => n * BEAT;

/** When everything is in place and the label can be read, in seconds. */
const READABLE = counts(10);
/** The first bar starts here, and the block must be standing still by then. */
const BARS_FROM = counts(4);
/** The second bar and line follow the first by this much. */
const SECOND_AFTER = counts(0.75);
/** The block starts half a count in, as soon as there is something to be in. */
const MARK_FROM = counts(0.5);

/** How far the block turns before it comes to rest: a turn and a half. */
const SPIN = 1.5 * 360;

/** Corner radius of the label, as a share of the font size. */
const CORNER = "0.05em";

type Props = {
  /**
   * The two lines of text. The first should be the longer one: the label
   * steps in towards the bottom and looks top-heavy the other way round.
   */
  lines: [string, string];
  colours?: LabelColours;
  /** Seconds to wait before this label starts, to stagger a stack of them. */
  delay?: number;
  className?: string;
};

/**
 * The label for two lines of text. Its left-hand side is an upright box with
 * the logo's portrait format in it. Each line has a bar of its own, which
 * ends where its text ends, so there is no empty light area. It arrives like
 * this:
 *
 * 1. the upright box pops out of nothing, sideways first, then shooting up;
 * 2. the portrait block is given a spin round its own upright axis and slows
 *    down until it faces front;
 * 3. only then the top bar slides out with its line, and the bottom bar and
 *    its line follow.
 *
 * It keeps the same timing as the one-line label, so the two can be used side
 * by side. It is sized by its font size.
 */
export function TwoLineLabel({
  lines,
  colours = VIOLET_DARK_MARK,
  delay = 0,
  className,
}: Props) {
  const root = useRef<HTMLSpanElement>(null);
  const tile = useRef<HTMLSpanElement>(null);
  const mark = useRef<HTMLSpanElement>(null);
  const bars = useRef<(HTMLSpanElement | null)[]>([]);
  const texts = useRef<(HTMLSpanElement | null)[]>([]);

  useGSAP(() => {
    const timeline = gsap.timeline({
      repeat: -1,
      delay,
      defaults: { immediateRender: false },
    });
    // The upright box's right-hand corners: round while it stands alone,
    // square once the bars join on, so they meet in a straight line.
    const joinCorners = (radius: string) => ({
      borderTopRightRadius: radius,
      borderBottomRightRadius: radius,
    });

    // Every round starts from nothing; see the one-line label.
    timeline.set(tile.current, joinCorners(CORNER), 0);
    timeline.set(mark.current, { scale: 0, rotationY: -SPIN }, 0);
    timeline.set(bars.current, { scaleX: 0 }, 0);
    timeline.set(texts.current, { xPercent: -12, autoAlpha: 0 }, 0);

    // 1. The upright box, out of nothing: the width leads, the height shoots
    // up after it.
    timeline.fromTo(
      tile.current,
      { scaleX: 0 },
      { scaleX: 1, duration: counts(2), ease: POP },
      0,
    );
    timeline.fromTo(
      tile.current,
      { scaleY: 0 },
      { scaleY: 1, duration: counts(2) - 0.08, ease: POP },
      0.08,
    );

    // 2. The block is given a spin round its own upright axis, like a card
    // standing on its edge, or a top seen from the side: a turn and a half,
    // slowing all the way down until it faces front. It is the upright
    // counterpart of the spinning diamond in the one-line label, and like it
    // has only the time until the bars set off.
    timeline.fromTo(
      mark.current,
      { scale: 0 },
      { scale: 1, duration: counts(2), ease: POP },
      MARK_FROM,
    );
    timeline.fromTo(
      mark.current,
      { rotationY: -SPIN },
      { rotationY: 0, duration: BARS_FROM - MARK_FROM, ease: "power2.out" },
      MARK_FROM,
    );

    // 3. The bars slide out one after the other, top first, each with its
    // line close behind.
    timeline.to(
      tile.current,
      { ...joinCorners("0em"), duration: counts(1), ease: "none" },
      counts(3),
    );
    [0, 1].forEach((row) => {
      const from = BARS_FROM + row * SECOND_AFTER;
      timeline.fromTo(
        bars.current[row],
        { scaleX: 0 },
        { scaleX: 1, duration: counts(3), ease: POP },
        from,
      );
      timeline.fromTo(
        texts.current[row],
        { xPercent: -12, autoAlpha: 0 },
        { xPercent: 0, autoAlpha: 1, duration: counts(2), ease: FLOW },
        from + counts(1) + 0.1,
      );
    });

    // Readable for a good while, then away again in reverse order: the
    // bottom bar first.
    const leave = counts(17);
    timeline.to(
      texts.current,
      { xPercent: -8, autoAlpha: 0, duration: counts(1), ease: FLOW },
      leave,
    );
    timeline.to(
      bars.current[1],
      { scaleX: 0, duration: counts(2), ease: FLOW },
      leave + 0.1,
    );
    timeline.to(
      bars.current[0],
      { scaleX: 0, duration: counts(2), ease: FLOW },
      leave + 0.1 + counts(0.5),
    );
    timeline.to(
      tile.current,
      { ...joinCorners(CORNER), duration: counts(1), ease: "none" },
      leave + counts(2.5) + 0.1,
    );
    timeline.to(
      mark.current,
      { scale: 0, rotationY: 180, duration: counts(2), ease: FLOW },
      leave + counts(2.5),
    );
    timeline.to(
      tile.current,
      { scaleX: 0, scaleY: 0, duration: counts(2), ease: FLOW },
      leave + counts(2.5) + 0.1,
    );
    timeline.to({}, { duration: 0 }, counts(23));

    // People who ask for less motion get the finished label, standing still.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      timeline.pause().time(READABLE);
      return;
    }
    if (root.current) return playWhileVisible(root.current, timeline);
  });

  return (
    <span
      ref={root}
      // Kept low for two lines of this size, so the lines sit close
      // together: the bars leave just enough room for a tail under the line.
      className={`relative inline-flex h-[3.2em] items-stretch font-display font-normal leading-none ${className ?? ""}`}
    >
      <span
        ref={tile}
        className="relative z-10 flex h-full w-[2em] items-center justify-center"
        // Hidden until the animation takes over, so nothing flashes on load.
        style={{
          background: colours.tile,
          borderRadius: CORNER,
          transform: "scale(0)",
          // Gives the block's spin depth: the near edge looms, the far edge
          // falls away.
          perspective: "7em",
        }}
      >
        <span
          ref={mark}
          className="block h-[1.78em] rounded-[0.03em]"
          style={{
            background: colours.mark,
            aspectRatio: `${STATES.portrait.w} / ${STATES.portrait.h}`,
            transform: "scale(0)",
          }}
        />
      </span>
      {/* Two rows, each as wide as its own line of text. */}
      <span className="flex flex-col items-start">
        {lines.map((line, row) => (
          <span key={row} className="relative flex h-1/2 items-center">
            {/* The bar starts a hair under the upright box, and the bottom
                one a hair under the top one, so no line of background can
                show at the joins. Only the corners on the outside are
                rounded. */}
            <span
              ref={(el) => {
                bars.current[row] = el;
              }}
              aria-hidden
              className={`absolute right-0 bottom-0 -left-px origin-left ${row === 0 ? "top-0" : "-top-px"}`}
              style={{
                background: colours.box,
                borderTopRightRadius: row === 0 ? CORNER : 0,
                borderBottomRightRadius: CORNER,
                transform: "scaleX(0)",
              }}
            />
            <span className="relative flex h-full items-center overflow-hidden">
              <span
                ref={(el) => {
                  texts.current[row] = el;
                }}
                // Set larger than the label's own size, and nudged down so
                // the capitals sit in the middle of the bar by eye; see the
                // one-line label.
                className="invisible relative top-[0.06em] pr-[0.5em] pl-[0.47em] text-[1.4em] whitespace-nowrap"
                style={{ color: colours.text }}
              >
                {line}
              </span>
            </span>
          </span>
        ))}
      </span>
    </span>
  );
}
