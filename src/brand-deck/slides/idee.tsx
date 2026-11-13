"use client";

import type { ComponentType, ReactNode } from "react";
import type { StateName } from "@/components/winwin-logo/geometry";
import { Fade, Lines, Pop, Rise, Rule } from "@/deck/motion";
import { Block, Corner, DEEP, LILAC, PH, Plane, PW, Stage } from "../parts";

/**
 * The idea, before any of the brand is shown: these pages are set in a plain
 * sans, in the brand's dark, light and violet, and nothing else.
 */

const FPAD = 80;

/* ───────────────────────────── Win, win ───────────────────────────── */

const SIDES: [string, string, string][] = [
  ["Win", "Het merk", "Krijgt werk dat past bij het kanaal en bij de mensen die het zien."],
  ["Win", "De creator", "Maakt wat bij hem of haar past, voor een merk dat dat begrijpt."],
  ["Ertussen", "Het werk", "De post, de video, de campagne. Daar komen de twee samen."],
];

/** The name, large, and what it promises: both sides win, and the work stands between them. */
function Naam() {
  const w = 480;
  return (
    <Stage tone="dark">
      <Corner />
      <Lines at={0.5} className="absolute" style={{ left: FPAD - 14, top: 150, fontSize: 380, lineHeight: "360px", fontWeight: 500, letterSpacing: "-0.06em" }} lines={["Win, win."]} />
      <Rise at={3} y={14} className="soft absolute" style={{ left: FPAD, top: 580, width: 1100, fontSize: 40, lineHeight: "54px", letterSpacing: "-0.02em" }}>
        De naam is de belofte: een samenwerking waar beide kanten beter van worden.
      </Rise>
      {SIDES.map(([side, title, text], i) => (
        <div key={title} className="absolute" style={{ left: FPAD + i * (w + 80), top: 800, width: w }}>
          <Rule at={4 + i * 0.5} />
          <Fade at={5 + i * 0.5}>
            <div className="t-cap" style={{ marginTop: 22, color: LILAC }}>
              {side}
            </div>
            <div className="t-card" style={{ marginTop: 10 }}>
              {title}
            </div>
            <div className="t-aside mute" style={{ marginTop: 8 }}>
              {text}
            </div>
          </Fade>
        </div>
      ))}
    </Stage>
  );
}

/* ───────────────────────────── Het midden ───────────────────────────── */

/** A part of the name with a line over it that says what it is. */
function Part({ label, at, children }: { label: string; at: number; children: ReactNode }) {
  return (
    <div className="flex flex-col items-stretch">
      <Fade at={at} style={{ color: LILAC, marginBottom: 44 }}>
        <div className="t-card text-center" style={{ marginBottom: 14, fontSize: 28, lineHeight: "34px" }}>
          {label}
        </div>
        <div style={{ height: 14, borderLeft: "1px solid currentColor", borderRight: "1px solid currentColor", position: "relative" }}>
          <div className="absolute" style={{ left: 0, right: 0, top: 6.5, height: 1, background: "currentColor" }} />
        </div>
      </Fade>
      {children}
    </div>
  );
}

/**
 * The name as two words with an open place between them: a word, the work,
 * a word. Drawn with plain type and an empty frame, because the logo has not
 * been made yet at this point in the deck.
 */
function Midden() {
  const word = { fontSize: 250, lineHeight: "210px", fontWeight: 500, letterSpacing: "-0.055em" } as const;
  return (
    <Plane tone="dark">
      <div className="absolute flex items-end justify-center" style={{ left: 0, top: 270, width: PW, gap: 64 }}>
        <Part label="Het merk wint" at={4}>
          <Rise at={0.5} y={18} style={word}>
            Win
          </Rise>
        </Part>
        <Part label="Het werk" at={5.5}>
          <Fade at={2} style={{ width: 210, height: 210, border: "2px dashed rgb(243 246 255 / 0.5)" }} />
        </Part>
        <Part label="De creator wint" at={4.5}>
          <Rise at={1} y={18} style={word}>
            Win
          </Rise>
        </Part>
      </div>
      <Fade at={7} className="t-body mute absolute text-center" style={{ left: 0, width: PW, top: PH - 250 }}>
        De woorden staan vast. Wat ertussen staat, verandert met het werk.
      </Fade>
    </Plane>
  );
}

/* ───────────────────────────── Uit de discovery ───────────────────────────── */

const FORMATS: StateName[] = ["square", "portrait", "landscape", "post"];

/** The sentence from the discovery that the logo is built on, large on violet. */
function Quote() {
  return (
    <Stage tone="violet">
      <Corner onViolet />
      <Lines
        at={0.5}
        className="absolute"
        style={{ left: FPAD - 4, top: 210, fontSize: 112, lineHeight: "120px", fontWeight: 500, letterSpacing: "-0.045em" }}
        lines={["“Je kan ons voor LinkedIn", "inzetten, je kan ons voor", "Insta inzetten, maakt", "helemaal niet uit.”"]}
      />
      <Fade at={5} className="t-body absolute" style={{ left: FPAD, bottom: 84, opacity: 0.85 }}>
        Win Win, in de discovery
      </Fade>
      {/* The four formats, as plain blocks: a first hint of what the middle of the logo will do. */}
      <div className="absolute flex items-end" style={{ right: FPAD, bottom: 84, gap: 26, color: DEEP }}>
        {FORMATS.map((state, i) => (
          <Pop key={state} at={5 + i} origin="center bottom">
            <Block state={state} unit={0.9} />
          </Pop>
        ))}
      </div>
    </Stage>
  );
}

export const slides: Record<string, ComponentType> = {
  "idee-naam": Naam,
  "idee-midden": Midden,
  "idee-quote": Quote,
};
