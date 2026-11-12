"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { WinwinLogo } from "./winwin-logo/WinwinLogo";
import type { Media } from "./winwin-logo/geometry";
import type { LogoTimeline } from "./winwin-logo/timeline";

const SPEEDS = [1, 0.5, 0.25] as const;
const FRAME = 1 / 60;

/** The logo on its stage, with playback controls for reviewing the motion. */
export function LogoStage({ media }: { media?: Media }) {
  const [logo, setLogo] = useState<LogoTimeline | null>(null);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState<number>(1);
  const [controls, setControls] = useState(true);

  const fill = useRef<HTMLDivElement>(null);
  const range = useRef<HTMLInputElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const resumeAfterScrub = useRef(false);

  const handleReady = useCallback((next: LogoTimeline) => {
    setLogo(next);
    setPlaying(!next.timeline.paused());
    setSpeed(1);
  }, []);

  const timeline = logo?.timeline;
  const duration = timeline?.duration() ?? 1;

  // Keep the scrubber and the time readout in step with the animation.
  useEffect(() => {
    if (!timeline) return;
    const sync = () => {
      const time = timeline.time();
      const progress = time / timeline.duration();
      if (fill.current) fill.current.style.width = `${progress * 100}%`;
      if (range.current) range.current.value = String(progress);
      if (readout.current) {
        readout.current.textContent = `${time.toFixed(2)}s / ${timeline.duration().toFixed(2)}s`;
      }
    };
    gsap.ticker.add(sync);
    return () => gsap.ticker.remove(sync);
  }, [timeline]);

  const toggle = useCallback(() => {
    if (!timeline) return;
    const next = timeline.paused();
    timeline.paused(!next);
    setPlaying(next);
  }, [timeline]);

  const seek = useCallback(
    (time: number) => {
      if (!timeline) return;
      const total = timeline.duration();
      // time() rather than pause(time) or seek(): those skip the update
      // callback that redraws the logo.
      timeline.pause();
      timeline.time(((time % total) + total) % total);
      setPlaying(false);
    },
    [timeline],
  );

  useEffect(() => {
    if (!timeline) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === " ") {
        event.preventDefault();
        toggle();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        seek(timeline.time() + FRAME);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        seek(timeline.time() - FRAME);
      } else if (event.key === "h") {
        setControls((shown) => !shown);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [timeline, toggle, seek]);

  const changeSpeed = (next: number) => {
    timeline?.timeScale(next);
    setSpeed(next);
  };

  return (
    <main className="relative flex min-h-dvh flex-1 flex-col items-center justify-center overflow-hidden">
      <WinwinLogo
        className="w-[min(94vw,1320px)]"
        onReady={handleReady}
        media={media}
      />

      {controls && (
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 px-6 pb-5 font-mono text-[11px] tracking-wide text-[rgb(var(--ink)/0.45)] select-none sm:px-10">
          <div className="relative h-7">
            <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[rgb(var(--ink)/0.15)]" />
            <div
              ref={fill}
              className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-[rgb(var(--ink)/0.80)]"
            >
              <div className="absolute right-0 top-1/2 size-[7px] translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgb(var(--ink))]" />
            </div>
            {logo?.markers.map((marker, index) => (
              <div
                key={index}
                className="absolute top-1/2 h-[7px] w-px -translate-y-1/2 bg-[rgb(var(--ink)/0.35)]"
                style={{ left: `${(marker.time / duration) * 100}%` }}
              />
            ))}
            <input
              ref={range}
              type="range"
              min={0}
              max={1}
              step="any"
              defaultValue={0}
              aria-label="Scrub through the animation"
              className="absolute inset-0 w-full cursor-ew-resize opacity-0"
              onPointerDown={() => {
                resumeAfterScrub.current = !!timeline && !timeline.paused();
              }}
              onInput={(event) => {
                seek(Number(event.currentTarget.value) * duration);
              }}
              onPointerUp={() => {
                if (resumeAfterScrub.current && timeline) {
                  timeline.play();
                  setPlaying(true);
                }
                resumeAfterScrub.current = false;
              }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <button
              type="button"
              onClick={toggle}
              className="w-12 text-left text-[rgb(var(--ink)/0.80)] transition-colors hover:text-[rgb(var(--ink))]"
            >
              {playing ? "Pause" : "Play"}
            </button>

            <div className="flex gap-3">
              {SPEEDS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => changeSpeed(option)}
                  aria-pressed={speed === option}
                  className={`transition-colors hover:text-[rgb(var(--ink))] ${
                    speed === option ? "text-[rgb(var(--ink)/0.80)]" : ""
                  }`}
                >
                  {option}×
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              {logo?.markers.slice(0, -1).map((marker) => (
                <button
                  key={marker.name}
                  type="button"
                  onClick={() => seek(marker.time)}
                  className="capitalize transition-colors hover:text-[rgb(var(--ink))]"
                >
                  {marker.name}
                </button>
              ))}
            </div>

            <span ref={readout} className="ml-auto tabular-nums" />
            <span className="hidden text-[rgb(var(--ink)/0.30)] md:inline">
              space play/pause · ← → frame · h hide
            </span>
          </div>
        </div>
      )}
    </main>
  );
}
