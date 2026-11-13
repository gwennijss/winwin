"use client";

import type { ComponentType, CSSProperties } from "react";
import { motion } from "motion/react";
import { counts, EASE, Fade, Lines, Rise, Rule, useStill } from "@/deck/motion";
import { useDeckNav } from "@/deck/nav";
import { chapters, outline, sections } from "../outline";
import { Block, FW, LabelDivider, LILAC, LogoLoop, PH, Stage, Tag, VIOLET } from "../parts";

const M = 60;

/**
 * A line of text whose letters rise one by one from behind an edge, each a
 * little after the one before: the way the text arrives in a label.
 */
function Rising({ text, at = 0, className, style }: { text: string; at?: number; className?: string; style?: CSSProperties }) {
  const still = useStill();
  return (
    <div className={className} style={{ ...style, display: "flex", overflow: "hidden", paddingTop: "0.1em", marginTop: "-0.1em", paddingBottom: "0.26em", marginBottom: "-0.26em", paddingRight: "0.1em" }} aria-label={text}>
      {Array.from(text).map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden
          style={{ display: "inline-block", whiteSpace: "pre" }}
          initial={still ? false : { y: "105%" }}
          animate={{ y: "0%" }}
          transition={{ delay: counts(at) + i * 0.03, duration: counts(3), ease: EASE }}
        >
          {ch}
        </motion.span>
      ))}
    </div>
  );
}

/* ───────────────────────────── The frame ─────────────────────────────
   The cover, the contents and the chapter pages are the frame of the deck,
   not the brand: the brand's dark and its light, and the name in a plain
   sans. The logo is not shown until chapter 2 has made it, step by step. */

/** What stands in the top corners of every page of the frame. */
function Corners({ right, at = 2 }: { right: string; at?: number }) {
  return (
    <>
      <Fade at={at} className="t-sign absolute" style={{ left: M, top: 48 }}>
        Brand Presentation
      </Fade>
      <Fade at={at} className="t-sign mute absolute" style={{ left: FW / 2, top: 48 }}>
        Win Win
      </Fade>
      <Fade at={at} className="t-sign mute absolute" style={{ right: M, top: 48 }}>
        {right}
      </Fade>
    </>
  );
}

/** The cover: the name, large, at the bottom left. Nothing of the brand yet. */
function Cover() {
  return (
    <Stage tone="dark">
      <Corners right="November 2026" />
      <Rising text="Win Win" at={0.5} className="t-chapter absolute" style={{ left: M - 12, bottom: 30, fontSize: 300, lineHeight: "270px" }} />
    </Stage>
  );
}

/* ───────────────────────────── Contents ───────────────────────────── */

/** The chapters as rows: the number, the title, one line, and where it starts. Click a row to go there. */
function Inhoud() {
  const go = useDeckNav();
  const rows = chapters.slice(1).map((c, i) => {
    const first = outline.find((o) => o.chapter === i + 1 && o.kind === "divider")!;
    return { ...c, kern: first.kern, slug: first.slug };
  });
  const top = 170;
  const rowH = (PH - top - 60) / rows.length;
  return (
    <Stage tone="dark">
      <Corners right="Inhoud" at={0} />
      <Rising text="Inhoud" at={0.5} className="t-chapter absolute" style={{ left: M - 8, bottom: 30 }} />
      {rows.map((r, i) => (
        <div
          key={r.n}
          role="link"
          tabIndex={0}
          onClick={() => go(r.slug)}
          onKeyDown={(e) => e.key === "Enter" && go(r.slug)}
          className="group absolute cursor-pointer"
          style={{ left: FW / 2, right: M, top: top + i * rowH, height: rowH }}
        >
          <Rule at={0.5 + i * 0.4} className="absolute" style={{ left: 0, top: 0 }} />
          <Fade at={1.5 + i * 0.4} className="absolute inset-0 flex items-center">
            <div className="t-card tabular mute shrink-0" style={{ width: 96 }}>
              {r.n}
            </div>
            <div className="t-card shrink-0" style={{ width: 300 }}>
              {r.title}
            </div>
            <div className="t-aside mute min-w-0 flex-1 transition-colors duration-200 group-hover:text-[#F3F6FF]">{r.kern}</div>
            <div className="t-sign tabular mute shrink-0 text-right" style={{ width: 60 }}>
              {r.slug}
            </div>
          </Fade>
        </div>
      ))}
      <Rule at={0.5 + rows.length * 0.4} className="absolute" style={{ left: FW / 2, width: FW / 2 - M, top: top + rows.length * rowH }} />
    </Stage>
  );
}

/* ───────────────────────────── Chapter pages ───────────────────────────── */

/**
 * A chapter opens on the dark of the frame: the number in grey and the title
 * under it, as one block at the bottom left, at the same size and on the
 * same edge. On the right, above the line of the title, what the chapter is
 * about in one sentence and the pages it holds. Click a page to go there.
 */
const divider = (i: number) => {
  const c = chapters[i];
  const first = outline.find((o) => o.chapter === i && o.kind === "divider")!;
  const pages = outline.filter((o) => o.chapter === i && o.kind !== "divider" && !o.hide);
  const rowH = 60;
  const colL = 1150;

  function Divider() {
    const go = useDeckNav();
    return (
      <Stage tone="dark">
        <Corners right={`Hoofdstuk ${i} van ${chapters.length - 1}`} at={0} />
        <div className="absolute" style={{ left: M - 8, bottom: 60 }}>
          <Rising text={c.n} at={0.5} className="t-chapter tabular" style={{ color: "rgb(243 246 255 / 0.3)" }} />
          <Rising text={c.title} at={1.5} className="t-chapter" />
        </div>
        <div className="absolute" style={{ left: colL, right: M, top: 150 }}>
          <Rise at={3} y={14} className="soft" style={{ fontSize: 34, lineHeight: "44px", marginBottom: 44, maxWidth: 620 }}>
            {first.kern}
          </Rise>
          {pages.map((p, k) => (
            <div key={p.id} role="link" tabIndex={0} onClick={() => go(p.slug)} onKeyDown={(e) => e.key === "Enter" && go(p.slug)} className="group relative cursor-pointer" style={{ height: rowH }}>
              <Rule at={3.5 + k * 0.3} className="absolute" style={{ left: 0, top: 0 }} />
              <Fade at={4 + k * 0.3} className="absolute inset-0 flex items-center" style={{ fontSize: 22, lineHeight: "30px" }}>
                <span className="tabular mute shrink-0" style={{ width: 76 }}>
                  {sections[p.id]}
                </span>
                <span className="min-w-0 flex-1 truncate opacity-80 transition-opacity duration-200 group-hover:opacity-100">{p.list ?? p.title}</span>
                <span className="tabular mute shrink-0">{p.slug}</span>
              </Fade>
            </div>
          ))}
          <Rule at={3.5 + pages.length * 0.3} />
        </div>
      </Stage>
    );
  }
  return Divider;
};

/* ───────────────────────────── What follows ───────────────────────────── */

const DONE = [
  ["Logo", "De lockup, vijf vormen van het blok en de ruit alleen."],
  ["Beweging", "De lus, drie regels, laders, knoppen en de paginaovergang."],
  ["Typografie", "Trabat Display in twee breedtes, en Hanken Grotesk."],
  ["Kleur", "Violet, donker en licht, met een diepe en een zachte tint."],
  ["Op beeld", "Het label, het tekstvlak en de resultaten over een video."],
];

const TODO = [
  ["Beeld van creators", "Foto en video voor in het blok en op de site. Nu staat er één campagne."],
  ["Tone of voice", "Hoe Win Win schrijft, met de woorden voor de labels."],
  ["Echte cases", "De teksten en cijfers in deze presentatie zijn voorbeelden."],
  ["Sjablonen", "Vaste opzetten voor posts, stories en presentaties."],
  ["Kleur voor druk", "CMYK en Pantone leggen we vast bij de eerste drukproef."],
];

/** What is there, and what is still to come: an honest last page before the close. */
function Volgt() {
  const col = (FW - 2 * M - 80) / 2;
  const list = (rows: string[][], x: number, at: number, done: boolean) => (
    <>
      <Fade at={at} className="t-cap absolute" style={{ left: x, top: 372, color: done ? "var(--mute)" : LILAC }}>
        {done ? "Dit staat" : "Dit komt nog"}
      </Fade>
      {rows.map(([title, text], i) => (
        <div key={title} className="absolute" style={{ left: x, top: 420 + i * 112, width: col, height: 112 }}>
          <Rule at={at + i * 0.4} />
          <Fade at={at + 1 + i * 0.4} className="absolute flex items-start" style={{ left: 0, right: 0, top: 22, gap: 28 }}>
            <div className="shrink-0" style={{ width: 22, paddingTop: 12, color: done ? LILAC : VIOLET }}>
              <Block state={done ? "square" : "diamond"} unit={done ? 0.16 : 0.2} />
            </div>
            <div className="t-card shrink-0" style={{ width: 330, fontSize: 34, lineHeight: "40px" }}>
              {title}
            </div>
            <div className="t-aside mute" style={{ fontSize: 20, lineHeight: "28px", paddingTop: 5 }}>
              {text}
            </div>
          </Fade>
        </div>
      ))}
    </>
  );
  return (
    <Stage tone="dark">
      <div className="absolute" style={{ left: 40, top: 40 }}>
        <Tag size={20}>
          Win Win
          <LabelDivider />
          Wat volgt
        </Tag>
      </div>
      <Lines at={0} className="t-display absolute" style={{ left: M, top: 150 }} lines={["Dit is het begin."]} />
      {list(DONE, M, 2, true)}
      {list(TODO, M + col + 80, 3, false)}
    </Stage>
  );
}

/* ───────────────────────────── Close ───────────────────────────── */

/** The close: the loop once more, light on violet. */
function Slot() {
  return (
    <Stage tone="violet">
      <div className="absolute" style={{ left: (FW - 1640) / 2, top: (PH - 1640 * 0.24) / 2 - 10 }}>
        <LogoLoop width={1640} />
      </div>
      <Fade at={3} className="t-sign absolute inset-x-0 text-center" style={{ bottom: 48, opacity: 0.8 }}>
        Win Win · Brand Presentation · November 2026
      </Fade>
    </Stage>
  );
}

export const slides: Record<string, ComponentType> = {
  cover: Cover,
  inhoud: Inhoud,
  "d-1": divider(1),
  "d-2": divider(2),
  "d-3": divider(3),
  "d-4": divider(4),
  "d-5": divider(5),
  "d-6": divider(6),
  "d-7": divider(7),
  volgt: Volgt,
  slot: Slot,
};
