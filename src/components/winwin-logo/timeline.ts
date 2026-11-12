import gsap from "gsap";
import {
  HOME,
  STATES,
  extent,
  type Pose,
  type Screen,
  type StateName,
} from "./geometry";
import { BURST, FLOW } from "./motion";

type Step = {
  to: StateName;
  /** Length of the move, wind-up and settle included, in seconds. */
  duration: number;
  /** Rest on this state after the move has settled. */
  hold: number;
  /**
   * The pose the move ends on when it gets to the state by another route,
   * such as a square arriving a quarter turn round. It looks identical to
   * the state, and is swapped for it once the move is done.
   */
  arriveAs?: Partial<Pose>;
  /** Seconds the width starts after everything else. */
  widthLag?: number;
  /** Seconds the height starts after everything else. */
  heightLag?: number;
  /** The curve of the move; the wind-up-and-release accent unless set. */
  ease?: gsap.EaseFunction;
  /** The curve of the turning, when it differs from the rest of the move. */
  turnEase?: gsap.EaseString | gsap.EaseFunction;
  /**
   * Throws the words this much further out than where they end up, and lets
   * them come back. For a move in which the block does a lot but the words
   * would otherwise hardly shift.
   */
  fling?: number;
};

/**
 * This animation only ever plays as a loop, so it has no beginning or end:
 * the logo is one beat among the others and never a place where everything
 * stops.
 *
 * Rhythm: every move starts and ends on a count of a quarter of a second, so
 * the loop keeps time when it is seen over and over. The spin and the move to
 * landscape are the accents; the others flow on.
 *
 * Character: the block behaves like something soft. Width and height never
 * change in step: pressed down it squirts out sideways, squeezed from the
 * sides it bulges up.
 */

/** One count of the rhythm everything keeps to, in seconds. */
export const BEAT = 0.25;

/** The logo's count at the start of the loop; it gets another at the end. */
const HOME_HOLD = BEAT;

const STEPS: Step[] = [
  // The one spin, and the same one as in the social labels: the diamond is
  // given a flick, like a top, turns a little over a turn and a half and
  // slows all the way down, opening into the square as it does and coming to
  // rest upright. No wind-up and no overshoot. The growing waits until the
  // spin has slowed, so the corners never swing out at full size, and the
  // spin throws the words outward.
  {
    to: "square",
    duration: 4 * BEAT,
    hold: 0,
    arriveAs: { rot: 630 },
    widthLag: 0.4,
    heightLag: 0.4,
    ease: FLOW,
    turnEase: "power2.out",
    fling: 13,
  },
  // Stretched upward: the height leads, the sides follow.
  { to: "portrait", duration: 2 * BEAT, hold: BEAT, ease: FLOW, widthLag: 0.07 },
  // Accent: pressed flat, it squirts out sideways into the widest shape.
  { to: "landscape", duration: 3 * BEAT, hold: BEAT, widthLag: 0.09 },
  // Squeezed in from the sides, it bulges back up.
  { to: "post", duration: 2 * BEAT, hold: BEAT, ease: FLOW, heightLag: 0.07 },
  // The post folds back onto its point without ceremony: in a loop this is
  // not an ending but the breath before the next spin.
  { to: "diamond", duration: 2 * BEAT, hold: BEAT, ease: FLOW },
];

export type Marker = { name: StateName; time: number };

export type LogoTimeline = {
  /**
   * The looping animation. To jump around in it use `time()` or `progress()`;
   * `seek()` and `pause(time)` move the playhead without redrawing the logo.
   */
  timeline: gsap.core.Timeline;
  /** When the logo has fully arrived at each state, in seconds. */
  markers: Marker[];
};

/**
 * Builds the looping logo animation. `pose` is animated in place and `render`
 * is called whenever it changes. `states` can be another set of the same five
 * shapes, such as the small ones of the mark on its own. Only the block is animated; the words take
 * their place from it, so the two can never drift apart.
 */
export function buildLogoTimeline(
  pose: Pose,
  render: () => void,
  screen: Screen = {},
  states: Record<StateName, Pose> = STATES,
): LogoTimeline {
  Object.assign(pose, states[HOME], { reach: extent(states[HOME]) });
  // Pictures only exist for the shapes that were given one.
  const pictured = (name: StateName) => name in screen;

  const timeline = gsap.timeline({
    repeat: -1,
    onUpdate: render,
    defaults: { immediateRender: false },
  });
  const markers: Marker[] = [{ name: HOME, time: 0 }];

  let from: Pose = { ...states[HOME] };
  let fromName: StateName = HOME;
  let at = HOME_HOLD;

  for (const step of STEPS) {
    const state: Pose = states[step.to];
    const to: Pose = { ...state, ...step.arriveAs };
    const widthLag = step.widthLag ?? 0;
    const heightLag = step.heightLag ?? 0;
    const end = at + step.duration;
    const ease = step.ease ?? BURST;

    timeline.fromTo(
      pose,
      { w: from.w },
      { w: to.w, duration: step.duration - widthLag, ease },
      at + widthLag,
    );
    timeline.fromTo(
      pose,
      { h: from.h },
      { h: to.h, duration: step.duration - heightLag, ease },
      at + heightLag,
    );
    // Where the words stand. They go straight from one resting place to the
    // next, whatever the block does on the way: it can spin as much as it
    // likes without the words wobbling along. Timed with the width, so the
    // words and the block's sides move as one.
    const wordsFrom = { gap: from.gap, reach: extent(from) };
    const wordsTo = { gap: state.gap, reach: extent(state) };
    if (step.fling) {
      // Out past the mark while the block is at its fastest, then back in.
      const out = step.duration * 0.6;
      timeline.fromTo(
        pose,
        wordsFrom,
        {
          gap: wordsTo.gap + step.fling,
          reach: wordsTo.reach,
          duration: out - 0.12,
          ease: FLOW,
        },
        at + 0.12,
      );
      timeline.fromTo(
        pose,
        { gap: wordsTo.gap + step.fling },
        { gap: wordsTo.gap, duration: step.duration - out, ease: FLOW },
        at + out,
      );
    } else {
      timeline.fromTo(
        pose,
        wordsFrom,
        { ...wordsTo, duration: step.duration - widthLag, ease },
        at + widthLag,
      );
    }
    if (from.rot !== to.rot) {
      timeline.fromTo(
        pose,
        { rot: from.rot },
        { rot: to.rot, duration: step.duration, ease: step.turnEase ?? ease },
        at,
      );
    }
    if (step.arriveAs) timeline.set(pose, { ...state }, end);

    // The picture of the shape being left fades out early and the one of the
    // shape being reached fades in late, so a spinning or half-formed block
    // is always plain.
    const fade = step.duration * 0.35;
    if (pictured(fromName)) {
      timeline.fromTo(
        screen,
        { [fromName]: 1 },
        { [fromName]: 0, duration: fade, ease: "none" },
        at + step.duration * 0.1,
      );
    }
    if (pictured(step.to)) {
      timeline.fromTo(
        screen,
        { [step.to]: 0 },
        { [step.to]: 1, duration: fade, ease: "none" },
        at + step.duration * 0.5,
      );
    }

    markers.push({ name: step.to, time: end });
    at = end + step.hold;
    from = { ...state };
    fromName = step.to;
  }

  // Pad the end so the last hold is part of the loop.
  timeline.to({}, { duration: 0 }, at);

  return { timeline, markers };
}

/**
 * Moves a pose from wherever it is to another, with the same accent and the
 * same soft behaviour as the loop: getting wider, the height goes first and
 * the width squirts out after it; getting narrower, it is the other way
 * round. For one-off moves in response to something, such as a click; it
 * takes over from any move still under way.
 */
export function morphPose(
  pose: Pose,
  to: Pose,
  render: () => void,
  duration = 3 * BEAT,
): gsap.core.Timeline {
  gsap.killTweensOf(pose);
  const lag = 0.08;
  const widthLag = to.w > pose.w ? lag : 0;
  const heightLag = to.w > pose.w ? 0 : lag;
  const timeline = gsap.timeline({
    onUpdate: render,
    defaults: { ease: BURST },
  });
  timeline.to(
    pose,
    { w: to.w, gap: to.gap, duration: duration - widthLag },
    widthLag,
  );
  timeline.to(pose, { h: to.h, duration: duration - heightLag }, heightLag);
  if (pose.rot !== to.rot) timeline.to(pose, { rot: to.rot, duration }, 0);
  return timeline;
}
