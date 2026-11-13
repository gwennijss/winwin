"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";

/** One of a row of choices. */
export function Choice({
  chosen,
  onChoose,
  children,
}: {
  chosen: boolean;
  onChoose: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={chosen}
      onClick={onChoose}
      className={`cursor-pointer border px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--ink))] ${
        chosen
          ? "border-[rgb(var(--ink)/0.80)] text-[rgb(var(--ink))]"
          : "border-[rgb(var(--ink)/0.14)] text-[rgb(var(--ink)/0.55)] hover:text-[rgb(var(--ink))]"
      }`}
    >
      {children}
    </button>
  );
}

type Playback = {
  /** Give this to the animation, which hands over its timeline. */
  follow: (timeline: gsap.core.Timeline | null) => void;
  playing: boolean;
  toggle: () => void;
  scrub: (share: number) => void;
  toStill: () => void;
  /** Give this to the range input that scrubs. */
  attach: (scrubber: HTMLInputElement | null) => void;
};

/**
 * Pausing and scrubbing for an animation on a stage. `still` is the moment,
 * in seconds, at which everything stands finished.
 */
export function usePlayback(still: number): Playback {
  const [playing, setPlaying] = useState(true);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const scrubber = useRef<HTMLInputElement>(null);

  // Keeps the scrubber level with the animation without redrawing the page
  // on every frame.
  const follow = useCallback((next: gsap.core.Timeline | null) => {
    timeline.current = next;
    if (!next) return;
    setPlaying(!next.paused());
    next.eventCallback("onUpdate", () => {
      if (scrubber.current) {
        scrubber.current.value = String(next.time() / next.duration());
      }
    });
  }, []);

  const toggle = useCallback(() => {
    const now = timeline.current;
    if (!now) return;
    now.paused(!now.paused());
    setPlaying(!now.paused());
  }, []);

  const scrub = useCallback((share: number) => {
    const now = timeline.current;
    if (!now) return;
    now.pause().time(share * now.duration());
    setPlaying(false);
  }, []);

  const toStill = useCallback(() => {
    timeline.current?.pause().time(still);
    setPlaying(false);
  }, [still]);

  const attach = useCallback((element: HTMLInputElement | null) => {
    scrubber.current = element;
  }, []);

  return { follow, playing, toggle, scrub, toStill, attach };
}

/**
 * A portrait video, 9:16, with the controls to pause and scrub under it.
 * Everything on it is sized in 27ths of its width, so it looks the same at
 * any size: 40 pixels on 1080.
 */
export function PortraitStage({
  playback,
  children,
}: {
  playback: Playback;
  children: ReactNode;
}) {
  const { playing, toggle, scrub, toStill, attach } = playback;
  return (
    <div className="flex flex-col gap-4">
      <div
        className="relative aspect-[9/16] w-[calc(min(82vh,900px)*9/16)] max-w-full overflow-hidden"
        style={{ containerType: "inline-size" }}
      >
        <div className="absolute inset-0 text-[calc(100cqw/27)]">{children}</div>
      </div>
      <div className="flex items-center gap-4 font-mono text-[11px] tracking-wide text-[rgb(var(--ink)/0.55)]">
        <button
          type="button"
          onClick={toggle}
          className="w-[5.5em] cursor-pointer text-left transition-colors hover:text-[rgb(var(--ink))]"
        >
          {playing ? "Pauze" : "Speel af"}
        </button>
        <input
          ref={attach}
          type="range"
          min={0}
          max={1}
          step={0.001}
          defaultValue={0}
          aria-label="Plek in de animatie"
          onChange={(event) => scrub(Number(event.target.value))}
          className="min-w-0 flex-1 accent-[#593CFF]"
        />
        <button
          type="button"
          onClick={toStill}
          className="cursor-pointer transition-colors hover:text-[rgb(var(--ink))]"
        >
          Eindbeeld
        </button>
      </div>
    </div>
  );
}
