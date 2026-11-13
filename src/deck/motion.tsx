"use client";

import { createContext, useContext, type CSSProperties, type ReactNode } from "react";
import { motion } from "motion/react";
import { FLOW, POP, UNFOLD } from "@/components/winwin-logo/motion";
import { BEAT } from "@/components/winwin-logo/timeline";

/**
 * Every slide element reveals itself through one of these primitives. They
 * move the way the brand moves: surfaces open with the brand's own curves and
 * everything starts on the count the logo keeps (a quarter of a second).
 *
 * `at` is in counts after the slide mounts. In still mode (PDF, overview
 * thumbnails, reduced motion) each primitive renders its final state.
 */

export const StillContext = createContext(false);
export const useStill = () => useContext(StillContext);

/** A number of counts, in seconds. */
export const counts = (n: number) => n * BEAT;

/** Text settles with a plain deceleration: it should arrive, not perform. */
export const EASE = [0.16, 1, 0.3, 1] as const;

/** The brand's curves, as functions the page animations can use. */
export const flow = (t: number) => FLOW(t);
export const pop = (t: number) => POP(t);
export const unfold = (t: number) => UNFOLD(t);

type Base = {
  /** When it starts, in counts. */
  at?: number;
  /** How long it takes, in counts. */
  dur?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

/** Fade and settle upward. The default entrance for blocks of copy. */
export function Rise({ at = 0, dur = 3, y = 26, className, style, children }: Base & { y?: number }) {
  const still = useStill();
  return (
    <motion.div
      className={className}
      style={style}
      initial={still ? false : { opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: counts(at), duration: counts(dur), ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function Fade({ at = 0, dur = 2, className, style, children }: Base) {
  const still = useStill();
  return (
    <motion.div
      className={className}
      style={style}
      initial={still ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: counts(at), duration: counts(dur), ease: "linear" }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Headline reveal: each authored line rises from behind an edge, as the title
 * in a text panel does. Line breaks are a design decision, so lines are
 * passed explicitly.
 */
export function Lines({
  lines,
  at = 0,
  stagger = 0.5,
  dur = 3,
  className,
  style,
}: {
  lines: ReactNode[];
  at?: number;
  stagger?: number;
  dur?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const still = useStill();
  return (
    <div className={className} style={style}>
      {lines.map((line, i) => (
        <span
          key={i}
          className="block overflow-hidden"
          // Room for accents and descenders inside the mask without moving the lines.
          style={{ paddingTop: "0.16em", marginTop: "-0.16em", paddingBottom: "0.3em", marginBottom: "-0.3em", paddingRight: "0.08em" }}
        >
          <motion.span
            className="block"
            initial={still ? false : { y: "135%" }}
            animate={{ y: 0 }}
            transition={{ delay: counts(at + i * stagger), duration: counts(dur), ease: EASE }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </div>
  );
}

/** A hairline that draws itself. Horizontal by default. */
export function Rule({
  at = 0,
  dur = 3,
  vertical = false,
  origin,
  className,
  style,
}: Base & { vertical?: boolean; origin?: string }) {
  const still = useStill();
  return (
    <motion.div
      aria-hidden
      className={className}
      style={{
        background: "var(--line)",
        transformOrigin: origin ?? (vertical ? "top" : "left"),
        ...(vertical ? { width: 1, height: "100%" } : { height: 1, width: "100%" }),
        ...style,
      }}
      initial={still ? false : vertical ? { scaleY: 0 } : { scaleX: 0 }}
      animate={vertical ? { scaleY: 1 } : { scaleX: 1 }}
      transition={{ delay: counts(at), duration: counts(dur), ease: flow }}
    />
  );
}

/** Reveal a block by opening a clip. Used for images and filled planes. */
export function Wipe({
  at = 0,
  dur = 3,
  from = "left",
  className,
  style,
  children,
}: Base & { from?: "bottom" | "top" | "left" | "right" }) {
  const still = useStill();
  const closed = {
    bottom: "inset(100% 0% 0% 0%)",
    top: "inset(0% 0% 100% 0%)",
    left: "inset(0% 100% 0% 0%)",
    right: "inset(0% 0% 0% 100%)",
  }[from];
  return (
    <motion.div
      className={className}
      style={style}
      initial={still ? false : { clipPath: closed }}
      animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
      transition={{ delay: counts(at), duration: counts(dur), ease: flow }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Out of nothing, a little too far, and settle: the way the square of a
 * label appears. For blocks, tiles and markers.
 */
export function Pop({ at = 0, dur = 2, origin = "center", className, style, children }: Base & { origin?: string }) {
  const still = useStill();
  return (
    <motion.div
      className={className}
      style={{ transformOrigin: origin, ...style }}
      initial={still ? false : { scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: counts(at), duration: counts(dur), ease: pop }}
    >
      {children}
    </motion.div>
  );
}

/**
 * A large surface pulled out of one of its corners in one move, the way the
 * text panel comes out from under a label. Slower than Pop: a big shape that
 * moves as fast as a small one looks rushed.
 */
export function Unfold({ at = 0, dur = 3.5, origin = "top left", className, style, children }: Base & { origin?: string }) {
  const still = useStill();
  return (
    <motion.div
      className={className}
      style={{ transformOrigin: origin, ...style }}
      initial={still ? false : { scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: counts(at), duration: counts(dur), ease: unfold }}
    >
      {children}
    </motion.div>
  );
}
