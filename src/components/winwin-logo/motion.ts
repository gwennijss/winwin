import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(CustomEase);

/**
 * The motion language of the brand, shared by the logo and everything on the
 * site that borrows from it.
 */

/**
 * The signature move: a short wind-up the wrong way, a fast release, a little
 * too far, then a calm settle. The wind-up is 4% and the overshoot 5% of the
 * distance; more than that starts to feel aggressive.
 */
export const BURST = CustomEase.create(
  "winwin-burst",
  "M0,0 C0.09,0 0.14,-0.04 0.2,-0.04 0.3,-0.04 0.32,1.05 0.56,1.05 0.72,1.05 0.78,1 1,1",
);

/**
 * The connecting move: no wind-up and no overshoot, just a smooth start and a
 * soft landing. Shorter than BURST for the same top speed, so it keeps a loop
 * moving between the accents.
 */
export const FLOW = CustomEase.create("winwin-flow", "0.6, 0, 0.25, 1");

/**
 * For something that appears out of nothing: there is nothing yet to wind up
 * with, so it starts gently, comes out fast, goes a little too far and
 * settles.
 */
export const POP = CustomEase.create(
  "winwin-pop",
  "M0,0 C0.12,0 0.14,1.05 0.42,1.05 0.6,1.05 0.68,1 1,1",
);

/**
 * For a large surface that opens out of something smaller, like a text panel
 * out of a label. It is POP with a longer run and less overshoot (2%): a big
 * shape that moves as fast as a small one looks rushed.
 */
export const UNFOLD = CustomEase.create(
  "winwin-unfold",
  "M0,0 C0.2,0 0.26,1.02 0.56,1.02 0.74,1.02 0.8,1 1,1",
);

/** A quick release that starts at full speed, for things that react to a pointer. */
export const SNAP = CustomEase.create(
  "winwin-snap",
  "M0,0 C0.06,0.5 0.14,1.08 0.34,1.08 0.52,1.08 0.62,1 1,1",
);

/** A firm, quiet move for things that should not draw attention. */
export const GLIDE = CustomEase.create("winwin-glide", "0.7, 0, 0.2, 1");

/**
 * A spin that starts slowly, gathers speed and lands a little past its mark
 * before settling.
 */
export const SPIN = CustomEase.create(
  "winwin-spin",
  "M0,0 C0.35,0 0.45,0.25 0.6,0.62 0.72,0.92 0.8,1.025 0.88,1.025 0.94,1.025 0.96,1 1,1",
);

/**
 * A reel being pulled: a nudge the wrong way, a fast run, and a landing that
 * rocks past its stop.
 */
export const REEL = CustomEase.create(
  "winwin-reel",
  "M0,0 C0.1,0 0.12,-0.03 0.18,-0.03 0.3,-0.03 0.35,0.55 0.55,0.88 0.68,1.03 0.82,1.02 1,1",
);
