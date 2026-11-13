/**
 * The signs of a post doing well, drawn for the reel in the Jackpot variant.
 * Each is a path in a box of 100 by 100. They are not stock signs: each is
 * built from the logo's own two shapes, the block and the diamond, with the
 * same straight sides and the same weight as its letters.
 */

/** Likes: a heart made of two diamonds, side by side on one point. */
export const HEART = "M50 90L2 42L29 15L50 36L71 15L98 42Z";

/** Comments: a block that speaks, with the diamond as what it says. */
export const COMMENT =
  "M6 10H94V72H54L32 94V72H6Z" + "M50 24L67 41L50 58L33 41Z";

/** Views: the diamond pulled wide into an eye, with a block for a pupil. */
export const EYE = "M2 50L50 16L98 50L50 84Z" + "M38 38H62V62H38Z";

/** Shares: a block that goes somewhere, its head a half diamond. */
export const SHARE = "M6 36H52V12L96 50L52 88V64H6Z";

/** Saves: the standing block, with a diamond cut out of its foot. */
export const SAVE = "M20 6H80V94L50 64L20 94Z";
