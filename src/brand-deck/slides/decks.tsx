"use client";

import type { ComponentType, ReactNode } from "react";
import { Fade, Lines, Pop, Rise, Rule } from "@/deck/motion";
import { Block, Corner, DARK, DEEP, Field, FW, LabelDivider, LIGHT, LILAC, PH, Picture, Stage, Tag, VIOLET } from "../parts";
import { Diamond } from "./merkbeeld";

/**
 * Win Win's own presentations: a campaign report, two pages of it. A deck is
 * where the brand may go all out: the line as large as the page takes, the
 * work in the formats of the block, the results in diamonds, and the colours
 * as whole fields.
 */

const HALF = FW / 2;

/** What the report is, up the right-hand edge of every page. */
function Spine({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <Fade at={3} className="t-cap absolute" style={{ right: 26, top: 56, writingMode: "vertical-rl", fontSize: 13, lineHeight: "16px", letterSpacing: "0.1em", color: tone === "light" ? LIGHT : DARK, opacity: 0.72 }}>
      Campagnerapport — De Kuyper
    </Fade>
  );
}

/* ───────────────────────────── The opening page ───────────────────────────── */

/** A result in a diamond drawn as a line: the figure and what it counts stand level inside it. */
function Result({ cx, cy, side, at, value, caption, size = 88 }: { cx: number; cy: number; side: number; at: number; value: string; caption: string; size?: number }) {
  return (
    <>
      <Diamond cx={cx} cy={cy} side={side} at={at} dur={5} style={{ border: "1.5px solid rgb(243 246 255 / 0.5)" }} />
      <Fade at={at + 3} className="absolute text-center" style={{ left: cx - side / 2, width: side, top: cy - size * 0.56 }}>
        <div className="f-label" style={{ fontSize: size, lineHeight: `${size * 0.94}px`, color: LILAC }}>
          {value}
        </div>
        <div className="t-cap" style={{ fontSize: 13, lineHeight: "18px", color: LILAC, marginTop: 2 }}>
          {caption}
        </div>
      </Fade>
    </>
  );
}

/** Left the work and the line, right what it brought: the question, and the answers as diamonds. */
function Opening() {
  const x = HALF + 72;
  return (
    <Stage tone="light">
      {/* The work, in three of the block's formats. */}
      <Field from="left" at={1.5} style={{ left: 56, top: 124, width: 380, height: 475, background: "#111", borderRadius: 4 }}>
        <Picture n={1} live={false} position="50% 30%" />
      </Field>
      <Pop at={3.5} className="absolute flex items-center justify-center" style={{ left: 56, top: 629, width: 132, height: 132, background: VIOLET, color: DEEP, borderRadius: 4 }}>
        <Block unit={0.78} />
      </Pop>
      <Field from="top" at={0.5} style={{ left: 466, top: 0, width: 428, height: 761, background: "#111" }}>
        <Picture n={5} live={false} position="50% 30%" />
        <div className="absolute" style={{ left: 22, bottom: 22 }}>
          <Tag size={17}>Creators</Tag>
        </div>
      </Field>
      <Lines at={3} className="f-title absolute" style={{ left: 50, bottom: 44, fontSize: 126, lineHeight: "114px", letterSpacing: "-0.018em" }} lines={["Twaalf creators,", "één zomer"]} />

      {/* What it brought, on the dark. */}
      <Field tone="dark" from="right" at={0.5} style={{ left: HALF, top: 0, width: HALF, height: PH }}>
        <Rise at={4} y={14} className="absolute" style={{ left: 420, top: 92, width: 420, fontSize: 21, lineHeight: "29px", fontWeight: 450 }}>
          De Kuyper zette twaalf creators in, elk op het eigen kanaal en in het eigen formaat. Dit is wat het opleverde.
        </Rise>
        <Fade at={5} className="t-cap absolute" style={{ left: 72, top: 410 }}>
          Resultaten De Kuyper:
        </Fade>
        <Lines at={5.5} className="f-title absolute" style={{ left: 68, top: 444, fontSize: 78, lineHeight: "84px", letterSpacing: "-0.01em" }} lines={["“Wat leverde het op?”"]} />
        <Fade at={7} className="t-cap absolute" style={{ left: 72, top: 586, fontSize: 14 }}>
          Bereik
        </Fade>
        <Fade at={7} className="t-cap absolute" style={{ left: 520, top: 586, fontSize: 14 }}>
          Aandacht
        </Fade>
        <Rule vertical at={7} className="absolute" style={{ left: 492, top: 586, height: PH - 586, background: "rgb(243 246 255 / 0.4)" }} />
      </Field>
      <Result cx={x + 96} cy={950} side={214} at={8} value="12" caption="creators" size={84} />
      <Result cx={x + 286} cy={822} side={258} at={8.5} value="4,1M" caption="weergaven" size={98} />
      <Result cx={x + 586} cy={930} side={262} at={9} value="+38%" caption="meer bereik" size={96} />
      <Result cx={x + 770} cy={748} side={224} at={9.5} value="74%" caption="uitgekeken" size={86} />
      <Spine />
      <Corner />
    </Stage>
  );
}

/* ───────────────────────────── The second page ───────────────────────────── */

const BAND = 290;

/** A format as a figure, with where it is for. */
function Format({ value, children }: { value: string; children: ReactNode }) {
  return (
    <div className="absolute" style={{ left: 44, right: 30, bottom: 34 }}>
      <div className="f-label" style={{ fontSize: 150, lineHeight: "138px" }}>
        {value}
      </div>
      <div style={{ fontSize: 22, lineHeight: "28px", fontWeight: 600, marginTop: 6 }}>{children}</div>
    </div>
  );
}

/** The work to the edge, the line and its paragraph on one edge beside it, and the formats across the foot as fields of colour. */
function Formats() {
  const top = PH - BAND;
  const one = 470;
  return (
    <Stage tone="light">
      <Field from="left" at={0.5} style={{ left: 0, top: 0, width: 820, height: top, background: "#111" }}>
        <Picture n={3} live={false} position="50% 46%" />
        <div className="absolute" style={{ left: 40, bottom: 36 }}>
          <Tag size={24}>
            Boost
            <LabelDivider />
            De Kuyper
          </Tag>
        </div>
      </Field>
      <Lines at={2} className="f-title absolute" style={{ left: 1002, top: 64, fontSize: 150, lineHeight: "132px", letterSpacing: "-0.018em" }} lines={["Het werkt", "op elk", "kanaal"]} />
      <Rise at={5} y={14} className="absolute" style={{ left: 1010, top: 522, width: 600, fontSize: 22, lineHeight: "31px", fontWeight: 450 }}>
        <p>Dezelfde campagne staat op elk kanaal in het formaat van dat kanaal. Het label staat steeds in dezelfde hoek, de creator blijft in beeld.</p>
        <p style={{ marginTop: 22 }}>Zo hoeft een merk niet te kiezen. Voor LinkedIn, voor Insta: maakt niet uit.</p>
      </Rise>

      {/* The formats, across the foot of the page. */}
      <Field tone="lilac" from="bottom" at={5.5} style={{ left: 0, top, width: one, height: BAND }}>
        <Format value="9:16">Staand, voor Reels, TikTok en Shorts</Format>
      </Field>
      <Field tone="violet" from="bottom" at={6} style={{ left: one, top, width: one, height: BAND }}>
        <Format value="4:5">De post in de feed</Format>
      </Field>
      <Field tone="dark" from="bottom" at={6.5} style={{ left: 2 * one, top, width: FW - 2 * one, height: BAND }}>
        <div className="t-cap absolute" style={{ left: 64, top: 34 }}>
          En in elk ander formaat
        </div>
        {[
          ["1:1", "Vierkant, voor Instagram en LinkedIn"],
          ["16:9", "Liggend, voor YouTube"],
        ].map(([value, text], i) => (
          <div key={value} className="absolute flex items-center" style={{ left: 64, right: 90, top: 78 + i * 98, height: 98, borderTop: i ? "1px solid var(--line)" : undefined }}>
            <span className="f-label shrink-0" style={{ width: 250, fontSize: 80, lineHeight: "80px", color: LILAC }}>
              {value}
            </span>
            <span style={{ fontSize: 22, lineHeight: "28px", fontWeight: 600 }}>{text}</span>
          </div>
        ))}
      </Field>
      {/* The diamond between two fields: the violet one points on to the next. */}
      <Pop at={9} className="absolute" style={{ left: 2 * one - 30, top: top + BAND / 2 - 30, width: 60, height: 60 }}>
        <div style={{ width: 60, height: 60, background: VIOLET, borderRadius: 2, transform: "rotate(45deg)" }} />
      </Pop>
      <Spine tone="dark" />
      <Corner />
    </Stage>
  );
}

export const slides: Record<string, ComponentType> = {
  "toep-deck-1": Opening,
  "toep-deck-2": Formats,
};
