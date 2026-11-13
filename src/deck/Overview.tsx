"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { SlideFrame } from "./SlideFrame";
import { IconClose } from "./icons";
import { STAGE_H, STAGE_W, type DeckDef } from "./types";

/** All slides at a glance, grouped by chapter. Thumbnails are the real slides, rendered still. */
export function Overview({
  deck,
  index,
  onPick,
  onClose,
}: {
  deck: DeckDef;
  index: number;
  onPick: (i: number) => void;
  onClose: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [thumbW, setThumbW] = useState(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const cols = w < 520 ? 2 : w < 900 ? 3 : w < 1400 ? 4 : 5;
      const gap = 16;
      setThumbW(Math.floor((w - gap * (cols - 1)) / cols));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    document.getElementById(`thumb-${index}`)?.scrollIntoView({ block: "center" });
  }, [index, thumbW]);

  const groups = useMemo(() => {
    const out: { chapter: number; items: number[] }[] = [];
    deck.slides.forEach((s, i) => {
      const last = out[out.length - 1];
      if (last && last.chapter === s.chapter) last.items.push(i);
      else out.push({ chapter: s.chapter, items: [i] });
    });
    return out;
  }, [deck.slides]);

  const scale = thumbW / STAGE_W;

  return (
    <motion.div
      className="absolute inset-0 z-40 overflow-y-auto bg-[var(--deck-ink)] select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      role="dialog"
      aria-label="Overzicht van alle pagina's"
    >
      <div className="sticky top-0 z-10 flex h-14 items-center justify-between bg-[var(--deck-ink)] px-5">
        <div className="flex items-baseline gap-3 text-[14px]">
          <span className="font-medium">Overzicht</span>
          <span className="tabular text-white/45">{deck.slides.length} pagina&apos;s</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Sluit overzicht (Esc)"
          className="flex h-9 w-9 items-center justify-center rounded-full border-0 bg-transparent text-white/70 hover:bg-white/10 hover:text-white"
        >
          <IconClose />
        </button>
      </div>

      <div ref={wrapRef} className="mx-5 pt-2 pb-16">
        {thumbW > 0 &&
          groups.map((g) => {
            const ch = deck.chapters[g.chapter];
            return (
              <section key={g.items[0]} className="mt-8 first:mt-2">
                <h2 className="mb-3 flex items-baseline gap-3 text-[14px] font-normal">
                  {ch.n !== "00" && <span className="tabular text-white/40">{ch.n}</span>}
                  <span>{ch.title}</span>
                </h2>
                <div className="flex flex-wrap gap-4">
                  {g.items.map((i) => {
                    const s = deck.slides[i];
                    const current = i === index;
                    return (
                      // A slide can hold buttons of its own, so the thumbnail is not a <button>.
                      <div
                        key={s.slug}
                        id={`thumb-${i}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => onPick(i)}
                        onKeyDown={(e) => e.key === "Enter" && onPick(i)}
                        className="group block cursor-pointer text-left"
                        style={{ width: thumbW }}
                        aria-current={current ? "page" : undefined}
                      >
                        <div
                          className={`relative overflow-hidden transition-shadow ${
                            current ? "shadow-[0_0_0_2px_#fff]" : "shadow-[0_0_0_1px_rgba(255,255,255,0.14)] group-hover:shadow-[0_0_0_1px_rgba(255,255,255,0.6)]"
                          }`}
                          style={{ width: thumbW, height: (thumbW * STAGE_H) / STAGE_W }}
                        >
                          <div
                            className="pointer-events-none absolute top-0 left-0 origin-top-left"
                            style={{ width: STAGE_W, height: STAGE_H, transform: `scale(${scale})` }}
                          >
                            <SlideFrame slide={s} still />
                          </div>
                        </div>
                        <div className="mt-2 flex gap-2 text-[12px] leading-[16px]">
                          <span className="tabular text-white/40">{String(i + 1).padStart(2, "0")}</span>
                          <span className={current ? "text-white" : "text-white/60 group-hover:text-white"}>
                            {s.title}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
      </div>
    </motion.div>
  );
}
