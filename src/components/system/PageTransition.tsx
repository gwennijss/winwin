"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { MARK_SHAPES } from "../winwin-logo/geometry";
import { FLOW, SNAP } from "../winwin-logo/motion";
import { BEAT } from "../winwin-logo/timeline";
import { PushLabel } from "./PushLabel";

const PAGES = ["Creators", "Cases", "Over ons"];

/** Side of the block before it grows, in pixels. */
const SEED = 40;

/**
 * Going from page to page: the diamond bursts open until it covers the
 * screen, the page changes underneath, and the block turns on and shrinks
 * away again.
 */
export function PageTransition({ className }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const cover = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const [page, setPage] = useState(0);

  // Stop a transition still under way when this goes away.
  useEffect(() => {
    const el = cover.current;
    return () => gsap.killTweensOf(el);
  }, []);

  const next = () => {
    if (busy.current || !root.current || !cover.current) return;
    busy.current = true;
    const box = root.current.getBoundingClientRect();
    // Enough to reach the corners, whatever angle the block is at.
    const reach = (Math.hypot(box.width, box.height) / SEED) * 1.1;

    gsap
      .timeline({ onComplete: () => void (busy.current = false) })
      .set(cover.current, { scale: 0, rotation: 45, autoAlpha: 1 })
      .to(cover.current, {
        scale: reach,
        rotation: 135,
        duration: 3 * BEAT,
        ease: SNAP,
      })
      .add(() => setPage((current) => (current + 1) % PAGES.length))
      // It leaves the way it came: turning on, back down to nothing.
      .to(
        cover.current,
        { scale: 0, rotation: 225, duration: 2 * BEAT, ease: FLOW },
        `+=${BEAT}`,
      )
      .set(cover.current, { autoAlpha: 0 });
  };

  return (
    <div
      ref={root}
      className={`relative flex w-full flex-col items-start justify-between gap-10 overflow-hidden border border-[rgb(var(--ink)/0.10)] p-6 ${className ?? ""}`}
    >
      <span className="font-mono text-[11px] tracking-wide text-[rgb(var(--ink)/0.40)]">
        /{PAGES[page].toLowerCase().replace(" ", "-")}
      </span>
      <h3 className="text-5xl font-semibold tracking-tight sm:text-6xl">
        {PAGES[page]}
      </h3>
      <PushLabel
        rest={MARK_SHAPES.diamond}
        hover={MARK_SHAPES.landscape}
        onClick={next}
        className="text-base font-medium"
      >
        Volgende pagina
      </PushLabel>
      <div
        ref={cover}
        aria-hidden
        className="pointer-events-none invisible absolute top-1/2 left-1/2 -mt-5 -ml-5 size-10 rounded-[1px] bg-[rgb(var(--ink))]"
      />
    </div>
  );
}
