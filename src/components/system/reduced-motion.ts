/**
 * Stops a self-playing animation at its first frame for people who have asked
 * their device for less motion.
 */
export function respectReducedMotion(timeline: gsap.core.Timeline) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    timeline.pause().time(0);
  }
}
