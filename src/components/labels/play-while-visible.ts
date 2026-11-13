/**
 * Plays a label's animation from the start each time it scrolls into view and
 * holds it while it is out of sight, so that every label is seen from its
 * first frame and labels further down the page are not running unwatched.
 * Returns a function that stops the watching.
 */
export function playWhileVisible(
  element: Element,
  timeline: gsap.core.Timeline,
): () => void {
  const watcher = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) timeline.restart(true);
      else timeline.pause();
    },
    { threshold: 0.6 },
  );
  watcher.observe(element);
  return () => watcher.disconnect();
}
