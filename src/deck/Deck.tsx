"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SlideFrame } from "./SlideFrame";
import { Overview } from "./Overview";
import {
  IconArrowLeft,
  IconArrowRight,
  IconClose,
  IconDownload,
  IconFullscreen,
  IconFullscreenExit,
  IconGrid,
} from "./icons";
import { DeckNavContext } from "./nav";
import { STAGE_H, STAGE_W, type DeckDef } from "./types";

type Phase = "boot" | "intro" | "live";

/** How long a page takes to fade in over the one before, in seconds. */
const PAGE_FADE = 0.4;

const pad = (n: number) => String(n).padStart(2, "0");

function useViewport() {
  const [vp, setVp] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const update = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);
  return vp;
}

const subscribeFullscreen = (onChange: () => void) => {
  document.addEventListener("fullscreenchange", onChange);
  return () => document.removeEventListener("fullscreenchange", onChange);
};
const subscribeNever = () => () => {};

const subscribeReducedMotion = (onChange: () => void) => {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};
/** With reduced motion every slide appears in its final state. */
const useReducedMotion = () =>
  useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );

function useFullscreen() {
  const isFs = useSyncExternalStore(subscribeFullscreen, () => !!document.fullscreenElement, () => false);
  const canFs = useSyncExternalStore(subscribeNever, () => !!document.fullscreenEnabled, () => false);
  return { isFs, canFs };
}

/**
 * Whether the intro should play: only when landing on the first slide, once
 * per session, and never with reduced motion. `null` until we are on the client.
 */
function useWantsIntro(basePath: string, enabled: boolean): boolean | null {
  return useSyncExternalStore(
    subscribeNever,
    () => {
      if (!enabled) return false;
      const params = new URLSearchParams(window.location.search);
      if (params.has("nointro")) return false;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
      return params.has("intro") || sessionStorage.getItem(`intro:${basePath}`) !== "1";
    },
    () => null,
  );
}

/** Preload images and fonts, reporting 0..1. Never blocks longer than `cap` ms. */
function usePreload(urls: string[] | undefined, cap = 6000) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const list = urls ?? [];
    const total = list.length + 1;
    let done = 0;
    let cancelled = false;
    const tick = () => {
      done += 1;
      if (!cancelled) setProgress(Math.min(1, done / total));
    };
    document.fonts.ready.then(tick, tick);
    list.forEach((src) => {
      const img = new Image();
      img.onload = img.onerror = tick;
      img.src = src;
    });
    const t = window.setTimeout(() => !cancelled && setProgress(1), cap);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [urls, cap]);
  return progress;
}

export function Deck({ deck, initialSlug }: { deck: DeckDef; initialSlug?: string }) {
  const { slides, chapters } = deck;
  const startIndex = Math.max(
    0,
    slides.findIndex((s) => s.slug === initialSlug),
  );

  const [index, setIndex] = useState(startIndex);
  const [introDone, setIntroDone] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const reveal = useCallback(() => setRevealing(true), []);
  const [overview, setOverview] = useState(false);
  const [rotated, setRotated] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const vp = useViewport();
  const { isFs, canFs } = useFullscreen();
  const progress = usePreload(deck.preload);
  const reducedMotion = useReducedMotion();

  const slide = slides[index];
  const chapter = chapters[slide.chapter];
  const total = slides.length;

  const portrait = vp.w > 0 && vp.h > vp.w && vp.w < 900;
  const phoneLandscape = vp.w > 0 && vp.w > vp.h && vp.h < 520;
  const immersive = isFs || phoneLandscape;
  // "Volledig scherm" on a phone: the deck lies on its side and fills the upright screen. Where the browser can turn
  // the screen itself (Android), it does, the screen becomes landscape and the deck no longer has to be turned.
  const turned = rotated && vp.h > vp.w;

  /* ── Boot: decide whether the intro plays ── */
  const wantsIntro = useWantsIntro(deck.basePath, !!deck.Intro && startIndex === 0);
  const phase: Phase = wantsIntro === null ? "boot" : wantsIntro && !introDone ? "intro" : "live";

  const finishIntro = useCallback(() => {
    setIntroDone(true);
    sessionStorage.setItem(`intro:${deck.basePath}`, "1");
  }, [deck.basePath]);

  /* ── Navigation ── */
  const go = useCallback(
    (to: number) => {
      setIndex(Math.max(0, Math.min(total - 1, to)));
    },
    [total],
  );

  // Keep the address bar on the current slide, so a reload or a shared link lands here.
  useEffect(() => {
    const path = `${deck.basePath}/${slides[index].slug}`;
    if (window.location.pathname !== path) {
      window.history.replaceState(null, "", path + window.location.search);
    }
  }, [index, deck.basePath, slides]);
  const goSlug = useCallback(
    (slug: string) => {
      const i = slides.findIndex((s) => s.slug === slug);
      if (i >= 0) go(i);
    },
    [slides, go],
  );
  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen();
    else rootRef.current?.requestFullscreen?.().catch(() => {});
  }, []);

  /* ── Phone: full screen, lying on its side ── */
  const enterBig = useCallback(async () => {
    setRotated(true);
    try {
      await rootRef.current?.requestFullscreen?.();
      await (screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> }).lock?.("landscape");
    } catch {
      // iPhone has no full screen for a page, and not every browser may turn the screen: the turned deck is enough.
    }
  }, []);
  const leaveBig = useCallback(() => {
    setRotated(false);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }, []);
  // Leaving full screen by the system (back gesture, Esc) also ends the turned view.
  const wasFs = useRef(false);
  useEffect(() => {
    if (wasFs.current && !isFs) {
      setRotated(false);
      screen.orientation?.unlock?.();
    }
    wasFs.current = isFs;
  }, [isFs]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (phase !== "live") return;
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
        case "PageDown":
        case " ":
        case "Enter":
          if (overview) return;
          e.preventDefault();
          next();
          break;
        case "ArrowLeft":
        case "ArrowUp":
        case "PageUp":
          if (overview) return;
          e.preventDefault();
          prev();
          break;
        case "Home":
          e.preventDefault();
          go(0);
          break;
        case "End":
          e.preventDefault();
          go(total - 1);
          break;
        case "f":
        case "F":
          toggleFullscreen();
          break;
        case "g":
        case "G":
        case "o":
        case "O":
          setOverview((v) => !v);
          break;
        case "Escape":
          setOverview(false);
          leaveBig();
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, overview, next, prev, go, total, toggleFullscreen, leaveBig]);

  /* ── Stage scale ── */
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBox({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setBox({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, [portrait, immersive, turned]);

  const scale = useMemo(() => {
    if (turned) return Math.min(vp.h / STAGE_W, vp.w / STAGE_H);
    if (!box.w || !box.h) return 0;
    return Math.min(box.w / STAGE_W, box.h / STAGE_H);
  }, [box, turned, vp]);

  /* ── Auto-hiding chrome while immersive ── */
  useEffect(() => {
    if (!immersive) return;
    let t = window.setTimeout(() => setChromeVisible(false), 2400);
    const show = () => {
      setChromeVisible(true);
      window.clearTimeout(t);
      t = window.setTimeout(() => setChromeVisible(false), 2400);
    };
    window.addEventListener("mousemove", show);
    window.addEventListener("touchstart", show, { passive: true });
    window.addEventListener("keydown", show);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("mousemove", show);
      window.removeEventListener("touchstart", show);
      window.removeEventListener("keydown", show);
      setChromeVisible(true);
    };
  }, [immersive]);

  /* ── Swipe ── */
  const touch = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return;
    const dx = e.changedTouches[0].clientX - touch.current.x;
    const dy = e.changedTouches[0].clientY - touch.current.y;
    touch.current = null;
    // In rotated mode the slide's horizontal axis runs down the screen.
    const along = turned ? dy : dx;
    const across = turned ? dx : dy;
    if (Math.abs(along) < 44 || Math.abs(along) < Math.abs(across)) return;
    if (along < 0) next();
    else prev();
  };

  // An intro that uncovers the first page asks for the deck to be there already.
  const live = phase === "live" || revealing;
  const stage = (
    <div
      className="absolute top-1/2 left-1/2"
      style={{
        width: STAGE_W,
        height: STAGE_H,
        transform: `translate(-50%, -50%) ${turned ? "rotate(90deg) " : ""}scale(${scale})`,
        background: "var(--deck-ink)",
        boxShadow: immersive || turned ? undefined : "0 24px 80px rgba(0,0,0,0.55)",
        visibility: scale ? "visible" : "hidden",
      }}
    >
      {/* From page to page: the new page fades in over the one before, which
          stays as it is underneath until it is covered. Quiet, and without a
          dip to the ground in between. */}
      <AnimatePresence initial={false} custom={!!slide.seamless}>
        {live && (
          <motion.div
            key={slide.slug}
            className="absolute inset-0"
            custom={!!slide.seamless}
            variants={{
              from: (seamless: boolean) => ({ opacity: seamless || reducedMotion ? 1 : 0, zIndex: 1 }),
              in: { opacity: 1, zIndex: 1, transition: { duration: PAGE_FADE, ease: "easeOut" } },
              out: (seamless: boolean) => ({ opacity: 0, zIndex: 0, transition: { delay: seamless || reducedMotion ? 0 : PAGE_FADE, duration: 0 } }),
            }}
            initial="from"
            animate="in"
            exit="out"
          >
            <DeckNavContext.Provider value={goSlug}>
              <SlideFrame slide={slide} still={reducedMotion} />
            </DeckNavContext.Provider>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const counter = (
    <span className="tabular text-[13px] tracking-[0.02em]">
      {pad(index + 1)}
      <span className="text-white/40"> / {pad(total)}</span>
    </span>
  );

  const progressBar = (
    <ChapterProgress deck={deck} index={index} onJump={go} />
  );

  const actions = (
    <>
      <ChromeButton label="Overzicht (G)" onClick={() => setOverview(true)}>
        <IconGrid />
        <span className="hidden lg:inline">Overzicht</span>
      </ChromeButton>
      {deck.pdfHref && (
        <a
          href={deck.pdfHref}
          download={deck.pdfFilename}
          className="flex h-9 min-w-9 items-center justify-center gap-2 rounded-full px-2.5 text-[13px] text-white/70 no-underline transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Download als PDF"
          title="Download de laatste versie als PDF"
        >
          <IconDownload />
          <span className="hidden lg:inline">Download als PDF</span>
        </a>
      )}
      {canFs && (
        <ChromeButton label={isFs ? "Verlaat volledig scherm (Esc)" : "Volledig scherm (F)"} onClick={toggleFullscreen}>
          {isFs ? <IconFullscreenExit /> : <IconFullscreen />}
          <span className="hidden lg:inline">{isFs ? "Sluiten" : "Volledig scherm"}</span>
        </ChromeButton>
      )}
    </>
  );

  return (
    <div
      ref={rootRef}
      className={`deck-root fixed inset-0 z-50 flex flex-col overflow-hidden text-white select-none ${immersive ? "bg-[var(--deck-ink)]" : "bg-[var(--deck-surround)]"}`}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {/* ───────────── Desktop and tablet ───────────── */}
      {!portrait && !immersive && (
        <header className="flex h-14 shrink-0 items-center justify-between px-5">
          <div className="flex items-baseline gap-3 text-[14px]">
            <span className="font-medium tracking-[-0.01em]">{deck.client}</span>
            <span className="text-white/45">{deck.title}</span>
            <span className="hidden text-white/30 md:inline">{deck.date}</span>
          </div>
          <div className="flex items-center gap-1">{actions}</div>
        </header>
      )}

      {/* ───────────── Phone, portrait: top panel ───────────── */}
      {portrait && (
        <div className="flex min-h-0 flex-1 flex-col px-5 pt-[max(14px,env(safe-area-inset-top))]">
          <div className="flex h-11 items-center justify-between text-[14px]">
            <div className="flex items-baseline gap-2">
              <span className="font-medium">{deck.client}</span>
              <span className="text-white/45">{deck.title}</span>
            </div>
            <div className="-mr-2 flex items-center">
              <ChromeButton label="Overzicht" onClick={() => setOverview(true)}>
                <IconGrid />
              </ChromeButton>
              {deck.pdfHref && (
                <a
                  href={deck.pdfHref}
                  download={deck.pdfFilename}
                  aria-label="Download als PDF"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-white/70"
                >
                  <IconDownload />
                </a>
              )}
            </div>
          </div>
          <div className="flex min-h-0 flex-1 flex-col justify-end pb-5">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={slide.chapter}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="tabular text-[13px] text-white/40">
                  {chapter.n === "00" ? "Vooraf" : `Hoofdstuk ${chapter.n}`}
                </div>
                <div className="mt-1 text-[30px] leading-[32px] font-medium tracking-[-0.035em]">
                  {chapter.title}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ───────────── Stage ───────────── */}
      <div
        ref={viewportRef}
        className={
          turned
            ? "fixed inset-0 z-40 bg-[var(--deck-ink)]"
            : portrait
              ? "relative w-full shrink-0"
              : `relative min-h-0 flex-1 ${immersive ? "" : "mx-5"}`
        }
        style={portrait && !turned ? { height: `${(vp.w * STAGE_H) / STAGE_W}px` } : undefined}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {stage}

        {/* Tap zones on touch screens: left half back, right half forward. */}
        {live && !overview && (
          <div className={`absolute inset-0 hidden pointer-coarse:flex ${turned ? "flex-col" : "flex-row"}`}>
            <button aria-label="Vorige" tabIndex={-1} className="flex-1 border-0 bg-transparent" onClick={prev} />
            <button aria-label="Volgende" tabIndex={-1} className="flex-1 border-0 bg-transparent" onClick={next} />
          </div>
        )}

        {turned && (
          <>
            <button
              aria-label="Sluit volledig scherm"
              onClick={leaveBig}
              className="absolute bottom-[max(14px,env(safe-area-inset-bottom))] left-3 z-10 flex h-10 w-10 rotate-90 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md"
            >
              <IconClose />
            </button>
            {/* Read with the phone on its side: for a moment, how to go on. */}
            <motion.div
              key="hint"
              className="pointer-events-none absolute top-1/2 left-4 z-10 rounded-full bg-black/55 px-3 py-4 text-[13px] text-white/90 backdrop-blur-md"
              style={{ writingMode: "vertical-rl", translateY: "-50%" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ duration: 3.4, times: [0, 0.1, 0.8, 1], ease: "linear" }}
            >
              Tik of veeg voor de volgende
            </motion.div>
          </>
        )}
      </div>

      {/* ───────────── Phone, portrait: bottom panel ───────────── */}
      {portrait && (
        <div className="flex min-h-0 flex-1 flex-col px-5 pb-[max(16px,env(safe-area-inset-bottom))]">
          <div className="pt-4">{progressBar}</div>
          <div className="min-h-0 flex-1 overflow-hidden pt-4">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={slide.slug}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="text-[17px] leading-[22px] font-medium tracking-[-0.015em]">{slide.title}</div>
                <p className="mt-2 text-[15px] leading-[22px] text-white/55">{slide.kern}</p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex items-center justify-between pt-3">
            <div className="flex items-center gap-2">
              <RoundButton label="Vorige" onClick={prev} disabled={index === 0}>
                <IconArrowLeft />
              </RoundButton>
              <RoundButton label="Volgende" onClick={next} disabled={index === total - 1} solid>
                <IconArrowRight />
              </RoundButton>
              <span className="ml-2">{counter}</span>
            </div>
            <button
              onClick={enterBig}
              className="flex h-11 items-center gap-2 rounded-full border border-white/20 px-4 text-[14px] text-white/85"
            >
              <IconFullscreen />
              Volledig scherm
            </button>
          </div>
        </div>
      )}

      {/* ───────────── Desktop and tablet: bottom bar ───────────── */}
      {!portrait && !immersive && (
        <footer className="grid h-16 shrink-0 grid-cols-[auto_1fr_auto] items-center gap-6 px-5">
          <div className="flex items-center gap-1">
            <ChromeButton label="Vorige (←)" onClick={prev} disabled={index === 0}>
              <IconArrowLeft />
            </ChromeButton>
            <ChromeButton label="Volgende (→)" onClick={next} disabled={index === total - 1}>
              <IconArrowRight />
            </ChromeButton>
            <span className="ml-2 w-[64px]">{counter}</span>
          </div>
          {progressBar}
          <div className="hidden w-[300px] items-center justify-end gap-4 text-right text-[13px] text-white/45 md:flex">
            <span className="min-w-0 truncate">
              {chapter.n !== "00" && <span className="tabular mr-2 text-white/30">{chapter.n}</span>}
              {slide.title}
            </span>
            {deck.Floor && (
              <deck.Floor
                chapter={slide.chapter}
                total={chapters.length}
                onJump={(c) => {
                  const i = slides.findIndex((s) => s.chapter === c);
                  if (i >= 0) go(i);
                }}
              />
            )}
          </div>
        </footer>
      )}

      {/* ───────────── Immersive overlay (fullscreen, phone landscape) ───────────── */}
      {immersive && !turned && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex items-end justify-between p-4 transition-opacity duration-300"
          style={{ opacity: chromeVisible ? 1 : 0 }}
        >
          <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-black/55 p-1 pr-4 backdrop-blur-md">
            <ChromeButton label="Vorige" onClick={prev} disabled={index === 0}>
              <IconArrowLeft />
            </ChromeButton>
            <ChromeButton label="Volgende" onClick={next} disabled={index === total - 1}>
              <IconArrowRight />
            </ChromeButton>
            <span className="ml-2">{counter}</span>
          </div>
          <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-black/55 p-1 backdrop-blur-md">
            {actions}
          </div>
        </div>
      )}

      {/* ───────────── Overview ───────────── */}
      <AnimatePresence>
        {overview && (
          <Overview
            deck={deck}
            index={index}
            onPick={(i) => {
              go(i);
              setOverview(false);
            }}
            onClose={() => setOverview(false)}
          />
        )}
      </AnimatePresence>

      {/* ───────────── Intro ───────────── */}
      <AnimatePresence>
        {phase !== "live" && (
          <motion.div
            key="intro"
            className={`absolute inset-0 z-50 ${revealing ? "" : "bg-[var(--deck-ink)]"}`}
            style={revealing || !deck.introBackground ? undefined : { background: deck.introBackground }}
            exit={{ opacity: 0, transition: { duration: 0.5, ease: "linear" } }}
          >
            {phase === "intro" && deck.Intro && <deck.Intro onDone={finishIntro} onReveal={reveal} progress={progress} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───────────────────────────── Chrome pieces ───────────────────────────── */

function ChromeButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="flex h-9 min-w-9 items-center justify-center gap-2 rounded-full border-0 bg-transparent px-2.5 text-[13px] text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-25"
    >
      {children}
    </button>
  );
}

function RoundButton({
  label,
  onClick,
  disabled,
  solid,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  solid?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-11 w-11 items-center justify-center rounded-full transition-opacity disabled:opacity-25 ${
        solid ? "border-0 bg-white text-black" : "border border-white/25 bg-transparent text-white"
      }`}
    >
      {children}
    </button>
  );
}

/** One segment per chapter, sized by its slide count. Click a segment to jump to it. */
function ChapterProgress({
  deck,
  index,
  onJump,
}: {
  deck: DeckDef;
  index: number;
  onJump: (i: number) => void;
}) {
  const groups = useMemo(() => {
    const out: { chapter: number; first: number; count: number }[] = [];
    deck.slides.forEach((s, i) => {
      const last = out[out.length - 1];
      if (last && last.chapter === s.chapter) last.count += 1;
      else out.push({ chapter: s.chapter, first: i, count: 1 });
    });
    return out;
  }, [deck.slides]);

  return (
    <div className="flex w-full items-center gap-[3px]" role="navigation" aria-label="Hoofdstukken">
      {groups.map((g) => {
        const filled = Math.max(0, Math.min(1, (index - g.first + 1) / g.count));
        const active = index >= g.first && index < g.first + g.count;
        const ch = deck.chapters[g.chapter];
        return (
          <button
            key={g.first}
            type="button"
            onClick={() => onJump(g.first)}
            title={ch.n === "00" ? ch.title : `${ch.n} ${ch.title}`}
            aria-label={`Ga naar ${ch.title}`}
            aria-current={active ? "step" : undefined}
            className="group relative h-6 border-0 bg-transparent p-0"
            style={{ flexGrow: g.count, flexBasis: 0 }}
          >
            <span className="absolute inset-x-0 top-1/2 block h-[2px] -translate-y-1/2 bg-white/15 transition-[height] group-hover:h-[4px]">
              <span
                className="block h-full bg-white transition-[width] duration-500 ease-out"
                style={{ width: `${filled * 100}%` }}
              />
            </span>
          </button>
        );
      })}
    </div>
  );
}
