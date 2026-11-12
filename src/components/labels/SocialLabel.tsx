"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { FLOW, POP } from "../winwin-logo/motion";
import { BEAT } from "../winwin-logo/timeline";
import { VIOLET_DARK_MARK, type LabelColours } from "./palette";
import { playWhileVisible } from "./play-while-visible";

gsap.registerPlugin(useGSAP);

/** A number of counts, in seconds. */
const counts = (n: number) => n * BEAT;

/** When everything is in place and the label can be read, in seconds. */
const READABLE = counts(9);

/** How far the diamond turns before it comes to rest: a turn and a half. */
const SPIN = 1.5 * 360;

/** The diamond starts half a count in, as soon as there is a square to be in. */
const SPIN_FROM = counts(0.5);
/** The box starts here, and the diamond must be standing still by then. */
const BOX_FROM = counts(4);

/** Corner radius of the label, as a share of the font size. */
const CORNER = "0.05em";

type Props = {
  children: ReactNode;
  colours?: LabelColours;
  /** Seconds to wait before this label starts, to stagger a stack of them. */
  delay?: number;
  className?: string;
};

/**
 * A label for social posts: a coloured square with the logo's diamond, and a
 * box with a word in it. It builds itself up on the same count as the logo:
 *
 * 1. the square pops out of nothing, sideways first and upwards just after;
 * 2. the diamond is given a spin, like a top, and slows down to a perfect
 *    standstill;
 * 3. only then the box slides out of the square's right-hand side, and the
 *    word slides out after it.
 *
 * It then stays readable for a while, packs itself away in reverse and starts
 * again. It is sized by its font size.
 */
export function SocialLabel({
  children,
  colours = VIOLET_DARK_MARK,
  delay = 0,
  className,
}: Props) {
  const root = useRef<HTMLSpanElement>(null);
  const tile = useRef<HTMLSpanElement>(null);
  const mark = useRef<HTMLSpanElement>(null);
  const box = useRef<HTMLSpanElement>(null);
  const word = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const timeline = gsap.timeline({
      repeat: -1,
      delay,
      defaults: { immediateRender: false },
    });
    // The square's right-hand corners: round while it stands alone, square
    // once the box joins on, so the two meet in a straight line.
    const joinCorners = (radius: string) => ({
      borderTopRightRadius: radius,
      borderBottomRightRadius: radius,
    });

    // Every round starts from nothing. Said outright, because a part that
    // only joins in later would otherwise sit there in its finished state
    // from the second round on.
    timeline.set(tile.current, joinCorners(CORNER), 0);
    timeline.set(mark.current, { scale: 0, rotation: 45 - SPIN }, 0);
    timeline.set(box.current, { scaleX: 0 }, 0);
    timeline.set(word.current, { xPercent: -16, autoAlpha: 0 }, 0);

    // 1. The square, out of nothing. Soft: the width leads, the height follows.
    timeline.fromTo(
      tile.current,
      { scaleX: 0 },
      { scaleX: 1, duration: counts(2), ease: POP },
      0,
    );
    timeline.fromTo(
      tile.current,
      { scaleY: 0 },
      { scaleY: 1, duration: counts(2) - 0.06, ease: POP },
      0.06,
    );

    // 2. The diamond is given a spin, like a top: a turn and a half, slowing
    // all the way down onto its point. It has only the time until the box
    // sets off, and it is at rest when that happens.
    timeline.fromTo(
      mark.current,
      { scale: 0 },
      { scale: 1, duration: counts(2), ease: POP },
      SPIN_FROM,
    );
    timeline.fromTo(
      mark.current,
      { rotation: 45 - SPIN },
      { rotation: 45, duration: BOX_FROM - SPIN_FROM, ease: "power2.out" },
      SPIN_FROM,
    );

    // 3. The box slides out of the square, and the word after it. The
    // square's corners on that side straighten out just before, so the box
    // never peeks round them.
    timeline.to(
      tile.current,
      { ...joinCorners("0em"), duration: counts(1), ease: "none" },
      counts(3),
    );
    timeline.fromTo(
      box.current,
      { scaleX: 0 },
      { scaleX: 1, duration: counts(3), ease: POP },
      BOX_FROM,
    );
    timeline.fromTo(
      word.current,
      { xPercent: -16, autoAlpha: 0 },
      { xPercent: 0, autoAlpha: 1, duration: counts(2), ease: FLOW },
      counts(5) + 0.1,
    );

    // Readable for a good while, then away again in reverse order.
    const leave = counts(17);
    timeline.to(
      word.current,
      { xPercent: -10, autoAlpha: 0, duration: counts(1), ease: FLOW },
      leave,
    );
    timeline.to(
      box.current,
      { scaleX: 0, duration: counts(2), ease: FLOW },
      leave + 0.1,
    );
    timeline.to(
      tile.current,
      { ...joinCorners(CORNER), duration: counts(1), ease: "none" },
      leave + counts(2) + 0.1,
    );
    timeline.to(
      mark.current,
      { scale: 0, rotation: 225, duration: counts(2), ease: FLOW },
      leave + counts(2),
    );
    timeline.to(
      tile.current,
      { scaleX: 0, scaleY: 0, duration: counts(2), ease: FLOW },
      leave + counts(2) + 0.1,
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
      className={`relative inline-flex h-[2.4em] items-stretch font-display font-normal leading-none ${className ?? ""}`}
    >
      <span
        ref={tile}
        className="relative z-10 flex aspect-square h-full items-center justify-center"
        // Hidden until the animation takes over, so nothing flashes on load.
        style={{
          background: colours.tile,
          borderRadius: CORNER,
          transform: "scale(0)",
        }}
      >
        <span
          ref={mark}
          className="block size-[0.72em] rounded-[0.03em]"
          style={{ background: colours.mark, transform: "scale(0)" }}
        />
      </span>
      <span className="relative flex items-center">
        {/* The box starts a hair under the square, so no line of background
            can show between the two. */}
        <span
          ref={box}
          aria-hidden
          className="absolute inset-y-0 right-0 -left-px origin-left"
          style={{
            background: colours.box,
            borderTopRightRadius: CORNER,
            borderBottomRightRadius: CORNER,
            transform: "scaleX(0)",
          }}
        />
        <span className="relative flex h-full items-center overflow-hidden">
          <span
            ref={word}
            // The typeface is narrow and its capitals are low, so the word
            // is set larger than the label's own size to carry the same
            // weight next to the square. It is also nudged down: a line of
            // type has more room above its capitals than below its baseline,
            // so centring the line leaves the word looking too high. This
            // puts the capitals themselves in the middle.
            className="invisible relative top-[0.075em] pr-[0.5em] pl-[0.47em] text-[1.45em]"
            style={{ color: colours.text }}
          >
            {children}
          </span>
        </span>
      </span>
    </span>
  );
}
