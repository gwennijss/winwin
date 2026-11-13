import { STATES, wordDistance } from "../winwin-logo/geometry";

/**
 * What a variant animates. Unlike the main logo animation, a variant can use
 * several blocks, move them around and tip them over, and move each word on
 * its own. The words stay solid objects here too.
 */

export type Block = {
  /** Sideways from the middle between the words. */
  x: number;
  /** Down from the middle of the letters; negative is up. */
  y: number;
  w: number;
  h: number;
  /** Rotation in degrees. */
  rot: number;
  /** Sideways squash as seen on screen: 1 is none. For a block that hits something. */
  sx: number;
  /** Vertical squash as seen on screen: 1 is none, 0 is edge-on, like a coin mid-flip. */
  sy: number;
  /** 0 is invisible, 1 is solid. */
  alpha: number;
  /**
   * Draws this outline instead of a rectangle: a path in a box of 100 by
   * 100, stretched to the block's width and height.
   */
  path?: string;
};

export type Scene = {
  /** How far each word stands from the middle. */
  words: { left: number; right: number };
  blocks: Block[];
};

/** Side of the logo's diamond. */
export const DIAMOND = STATES.diamond.w;

/** Distance between the words when the logo is at rest. */
export const HOME_DISTANCE = wordDistance(STATES.diamond);

/** A block; the logo's diamond unless told otherwise. */
export function block(overrides: Partial<Block> = {}): Block {
  return {
    x: 0,
    y: 0,
    w: DIAMOND,
    h: DIAMOND,
    rot: 45,
    sx: 1,
    sy: 1,
    alpha: 1,
    ...overrides,
  };
}

/** Both words the same distance from the middle, `distance` apart. */
export function apart(distance: number) {
  return { left: distance / 2, right: distance / 2 };
}

export type Variant = {
  id: string;
  title: string;
  note: string;
  /** Half the height of the band the blocks are visible in, when they are masked. */
  band?: number;
  /** Set when the block travels from word to word, so it must sit exactly in the middle. */
  centred?: boolean;
  /** The scene at the start of the loop. */
  create: () => Scene;
  /**
   * Adds the animation to the timeline. May return a function that is run
   * every frame, for movement that is worked out rather than tweened.
   */
  build: (scene: Scene, timeline: gsap.core.Timeline) => void | (() => void);
};
