"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { FLOW, GLIDE } from "@/components/winwin-logo/motion";
import { DARK, LIGHT } from "./parts";

/**
 * The opening shows nothing of the brand yet: the name in a plain sans fills
 * from left to right while a line runs along the bottom, and then the dark
 * ground lifts off the first page. The logo is made in chapter 2; here it
 * would arrive before anyone knows why it looks the way it does.
 */
export function Intro({ onDone, onReveal }: { onDone: () => void; onReveal?: () => void; progress: number }) {
  const root = useRef<HTMLDivElement>(null);
  const cb = useRef({ onReveal, onDone });
  useEffect(() => {
    cb.current = { onReveal, onDone };
  }, [onReveal, onDone]);

  useEffect(() => {
    if (!root.current) return;
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: GLIDE } });
      timeline.fromTo("[data-intro-text]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "none" }, 0);
      timeline.to("[data-intro-bar]", { scaleX: 1, duration: 2.4 }, 0.1);
      timeline.to("[data-intro-fill]", { clipPath: "inset(0% 0% 0% 0%)", duration: 2.4 }, 0.1);
      timeline.add("lift", 2.7);
      timeline.to("[data-intro-content]", { autoAlpha: 0, duration: 0.35, ease: "none" }, "lift");
      timeline.to("[data-intro-bar]", { scaleX: 0, transformOrigin: "right center", duration: 0.45 }, "lift");
      timeline.call(() => cb.current.onReveal?.(), [], "lift+=0.3");
      timeline.to("[data-intro-ground]", { yPercent: -101, duration: 0.9, ease: FLOW }, "lift+=0.3");
      timeline.call(() => cb.current.onDone());
    }, root);
    return () => ctx.revert();
  }, []);

  const name = (
    <span style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: "clamp(48px, 9vw, 150px)", lineHeight: 1, fontWeight: 500, letterSpacing: "-0.055em", whiteSpace: "nowrap" }}>
      Win Win
    </span>
  );

  return (
    <div ref={root} className="absolute inset-0 overflow-hidden" style={{ color: LIGHT }}>
      <div data-intro-ground className="absolute inset-0" style={{ background: DARK }}>
        <div data-intro-bar className="absolute inset-x-0 bottom-0 h-[5px] origin-left scale-x-0" style={{ background: LIGHT }} />
      </div>
      <div data-intro-content className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <div style={{ opacity: 0.2 }}>{name}</div>
          <div data-intro-fill className="absolute inset-0" style={{ clipPath: "inset(0% 100% 0% 0%)" }}>
            {name}
          </div>
        </div>
        <span
          data-intro-text
          className="invisible absolute bottom-12 text-[12px] font-medium tracking-[0.16em] uppercase"
          style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', color: "rgb(243 246 255 / 0.55)" }}
        >
          Brand Presentation · November 2026
        </span>
      </div>
    </div>
  );
}
