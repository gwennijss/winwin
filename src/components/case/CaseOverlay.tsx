"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { BRAND, SHADE } from "../labels/palette";
import { FLOW, POP, UNFOLD } from "../winwin-logo/motion";
import { BEAT } from "../winwin-logo/timeline";
import { addLabelText, type LabelTextMotion } from "./labelText";

/** A number of counts, in seconds. */
const counts = (n: number) => n * BEAT;

/** The moments of one round, in counts. */
const AT = {
  /** The label's box slides out; its text follows in one of several ways. */
  box: 4,
  /** The label's bottom corners straighten, so the panel can join on. */
  join: 8,
  /** The panel is pulled out of the corner under the label, in one move. */
  panel: 9,
  /** The panel has a hair left to settle here, and looks at rest. */
  title: 12,
  body: 13.5,
  figures: 15,
  /** Everything is in place and can be read. */
  readable: 19,
  /** The text goes first. */
  leave: 45,
  /** The panel only draws back once the text is gone. */
  panelBack: 48.5,
  /** The label packs itself away. */
  pack: 52,
  end: 58,
} as const;

/** When everything can be read, in seconds: where a still of the overlay is taken. */
export const READABLE = counts(AT.readable);

/** How far the diamond in the square turns before it comes to rest. */
const SPIN = 1.5 * 360;

/** Corner radius of the label, as a share of its font size. */
const CORNER = "0.05em";
/** The same radius for the panel, whose font size is two thirds of the label's. */
const PANEL_CORNER = "0.075em";

/** The colours of the panel. */
const TONES = {
  dark: {
    panel: BRAND.dark,
    title: BRAND.light,
    body: "rgb(243 246 255 / 0.84)",
    figure: SHADE.violetLight,
    caption: "rgb(243 246 255 / 0.62)",
  },
  light: {
    panel: BRAND.light,
    title: BRAND.dark,
    body: "rgb(37 37 38 / 0.86)",
    figure: BRAND.violet,
    caption: "rgb(37 37 38 / 0.62)",
  },
} as const;

export type PanelTone = keyof typeof TONES;

/**
 * The widths of the title typeface for inside the panel, and the sizes each
 * is set at. The label itself always stays in the condensed width. The semi
 * condensed runs about 14% wider than that and the normal width about 28%,
 * so they are set smaller to fill the same room: the same words on the same
 * number of lines. Sizes are in shares of the panel's font size, for small
 * letters and for capitals.
 */
export const FACES = {
  condensed: {
    family: "var(--font-trabat)",
    title: { small: 2.3, capitals: 2 },
  },
  semi: {
    family: "var(--font-trabat-semi)",
    title: { small: 2.2, capitals: 1.8 },
  },
  regular: {
    family: "var(--font-trabat-regular)",
    title: { small: 2.05, capitals: 1.62 },
  },
} as const;

export type TitleFace = keyof typeof FACES;

export type CaseText = {
  /** What Win Win did, as it stands in the label. */
  service: string;
  /** Who it was for. */
  client: string;
  /** The title, line by line. The first line should be the longer one. */
  title: string[];
  /** A few sentences on the campaign: about 150 characters reads comfortably. */
  body: string;
  /** Results: a figure and what it counts. Two fit side by side. */
  figures: { value: string; caption: string }[];
};

type Props = {
  text: CaseText;
  tone?: PanelTone;
  /** The CSS font family of the running text. */
  bodyFont: string;
  /** The width of the title typeface inside the panel. */
  face?: TitleFace;
  /** Sets everything that is in the title typeface in capitals. */
  caps?: boolean;
  /** How the text arrives in the label. */
  labelText?: LabelTextMotion;
  /** Hands the animation to whoever wants to pause or scrub it. */
  onTimeline?: (timeline: gsap.core.Timeline | null) => void;
};

/**
 * Text over a case video. The label is the one from the label page, with the
 * service and the client in it as one line of text, and a small block
 * between the two. Under it hangs a panel with a title, a few sentences and
 * the results, so that the label becomes the tab of a card. It arrives like
 * this:
 *
 * 1. the label builds itself as on the label page, and its text arrives in
 *    one of the ways in `labelText.ts`;
 * 2. the panel is pulled out of the corner under the label's square, down
 *    and to the right in one move;
 * 3. only when the panel is at rest, the title rises line by line from
 *    behind an edge, the sentences come in word by word, and the figures
 *    rise last.
 *
 * It stays readable for six and a half seconds. Then the text goes first,
 * the panel draws back once it is empty, and the label packs itself away. It
 * is sized by its font size, which is one 27th of the width of a portrait
 * video: 40 pixels on 1080.
 */
export function CaseOverlay({
  text,
  tone = "dark",
  bodyFont,
  face = "semi",
  caps = false,
  labelText = "letters",
  onTimeline,
}: Props) {
  const root = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const tile = useRef<HTMLSpanElement>(null);
  const mark = useRef<HTMLSpanElement>(null);
  const box = useRef<HTMLSpanElement>(null);
  const serviceText = useRef<HTMLSpanElement>(null);
  const divider = useRef<HTMLSpanElement>(null);
  const clientText = useRef<HTMLSpanElement>(null);
  const mask = useRef<HTMLSpanElement>(null);
  const line = useRef<HTMLSpanElement>(null);
  const pieces = useRef<(HTMLSpanElement | null)[]>([]);
  const panel = useRef<HTMLDivElement>(null);
  const panelFill = useRef<HTMLSpanElement>(null);
  const titleLines = useRef<(HTMLSpanElement | null)[]>([]);
  const words = useRef<(HTMLSpanElement | null)[]>([]);
  const figureValues = useRef<(HTMLSpanElement | null)[]>([]);
  const figureCaptions = useRef<(HTMLSpanElement | null)[]>([]);

  // Where the animation was when it last had to be built again, so that a
  // change of setting carries on from the same moment. A change in how the
  // label's text arrives starts from the top instead, to show it.
  const resume = useRef<{
    time: number;
    paused: boolean;
    labelText: LabelTextMotion;
  } | null>(null);

  // The label's text, a piece per letter, with the dividing block (null)
  // between the service and the client.
  const glyphs: (string | null)[] = [...text.service, null, ...text.client];

  const colours = TONES[tone];
  // Capitals are set a little apart, as capitals need, and a size smaller:
  // they stand taller than small letters and run wider.
  const capitals = caps ? "uppercase tracking-[0.03em]" : "";
  const type = FACES[face];
  const titleSize = `${caps ? type.title.capitals : type.title.small}em`;

  useEffect(() => {
    let context: gsap.Context | undefined;
    let current: gsap.core.Timeline | undefined;
    let tidy: (() => void) | undefined;
    let gone = false;

    const build = () => {
      if (
        !label.current ||
        !panel.current ||
        !mask.current ||
        !line.current ||
        !serviceText.current?.firstChild ||
        !clientText.current?.firstChild ||
        !divider.current
      ) {
        return;
      }

      // The text that is seen is a piece per letter, so that the letters can
      // move apart from each other. Each piece is put exactly where its
      // letter stands in the line as the typeface sets it, kerning included;
      // that line is in the label too, unseen, and gives the label its width.
      const size = parseFloat(getComputedStyle(mask.current).fontSize);
      const frame = mask.current.getBoundingClientRect();
      // Measurements on screen are in the pixels that are seen. When the
      // overlay sits on something that is shown scaled, such as a slide of
      // the presentation, they differ from its own pixels by this much.
      const zoom = frame.width / mask.current.offsetWidth || 1;
      const range = document.createRange();
      const boxes: DOMRect[] = [];
      [serviceText.current, clientText.current].forEach((part, second) => {
        const node = part.firstChild as Text;
        for (let index = 0; index < node.length; index++) {
          range.setStart(node, index);
          range.setEnd(node, index + 1);
          boxes.push(range.getBoundingClientRect());
        }
        if (!second) boxes.push(divider.current!.getBoundingClientRect());
      });
      const shown = pieces.current.filter(
        (piece): piece is HTMLSpanElement => piece !== null,
      );
      const em = (pixels: number) => `${(pixels / zoom / size).toFixed(4)}em`;
      shown.forEach((piece, index) => {
        const place = boxes[index];
        piece.style.left = em(place.left - frame.left);
        if (piece.dataset.divider) {
          piece.style.top = em(place.top - frame.top);
        } else {
          piece.style.width = em(place.width);
        }
      });

      const timeline = gsap.timeline({
        repeat: -1,
        defaults: { immediateRender: false },
      });

      // Every round starts from nothing; see the one-line label.
      timeline.set(
        tile.current,
        {
          borderTopRightRadius: CORNER,
          borderBottomRightRadius: CORNER,
          borderBottomLeftRadius: CORNER,
        },
        0,
      );
      timeline.set(mark.current, { scale: 0, rotation: 45 - SPIN }, 0);
      timeline.set(
        box.current,
        { scaleX: 0, borderBottomRightRadius: CORNER },
        0,
      );
      timeline.set(panelFill.current, { scale: 0 }, 0);
      timeline.set(titleLines.current, { yPercent: 115, autoAlpha: 1 }, 0);
      timeline.set(words.current, { y: "0.45em", autoAlpha: 0 }, 0);
      timeline.set(figureValues.current, { yPercent: 115, autoAlpha: 1 }, 0);
      timeline.set(figureCaptions.current, { autoAlpha: 0 }, 0);

      // 1. The label, move for move as on the label page: the square, the
      // diamond's spin, then the box. The service and the client are one
      // line of text; how it arrives is one of the ways in `labelText.ts`.
      timeline.fromTo(
        tile.current,
        { scaleX: 0 },
        { scaleX: 1, duration: counts(2), ease: POP },
        0,
      );
      timeline.fromTo(
        tile.current,
        { scaleY: 0 },
        { scaleY: 1, duration: counts(2) - 0.06, ease: POP },
        0.06,
      );
      timeline.fromTo(
        mark.current,
        { scale: 0 },
        { scale: 1, duration: counts(2), ease: POP },
        counts(0.5),
      );
      timeline.fromTo(
        mark.current,
        { rotation: 45 - SPIN },
        { rotation: 45, duration: counts(AT.box - 0.5), ease: "power2.out" },
        counts(0.5),
      );
      timeline.to(
        tile.current,
        {
          borderTopRightRadius: "0em",
          borderBottomRightRadius: "0em",
          duration: counts(1),
          ease: "none",
        },
        counts(AT.box - 1),
      );
      timeline.fromTo(
        box.current,
        { scaleX: 0 },
        { scaleX: 1, duration: counts(3), ease: POP },
        counts(AT.box),
      );
      tidy = addLabelText(
        timeline,
        labelText,
        {
          line: line.current,
          pieces: shown,
          letters: shown.filter((piece) => !piece.dataset.divider),
          reach: boxes.map((place) => (place.right - frame.left) / zoom),
          size,
          drop: frame.height / zoom,
        },
        AT.box,
      );

      // 2. The panel. The label's bottom corners straighten first, so the
      // two meet in a straight line. Then the panel is pulled out of its
      // top left-hand corner, under the label's square, like a sheet drawn
      // out by its far corner: one move, down and to the right at once.
      timeline.to(
        tile.current,
        { borderBottomLeftRadius: "0em", duration: counts(1), ease: "none" },
        counts(AT.join),
      );
      timeline.to(
        box.current,
        { borderBottomRightRadius: "0em", duration: counts(1), ease: "none" },
        counts(AT.join),
      );
      timeline.fromTo(
        panelFill.current,
        { scale: 0 },
        { scale: 1, duration: counts(3.5), ease: UNFOLD },
        counts(AT.panel),
      );

      // 3. The text, which waits until the panel has all but come to rest. The title is
      // the moment: each line rises from behind an edge. The sentences stay
      // quiet and come in word by word, in about the time it takes to start
      // reading them. The figures rise last.
      timeline.to(
        titleLines.current,
        {
          yPercent: 0,
          duration: counts(3),
          ease: "power3.out",
          stagger: counts(0.75),
        },
        counts(AT.title),
      );
      timeline.to(
        words.current,
        {
          y: 0,
          autoAlpha: 1,
          duration: counts(2),
          ease: "power2.out",
          stagger: { amount: counts(2.5) },
        },
        counts(AT.body),
      );
      timeline.to(
        figureValues.current,
        {
          yPercent: 0,
          duration: counts(3),
          ease: "power3.out",
          stagger: counts(0.5),
        },
        counts(AT.figures),
      );
      timeline.to(
        figureCaptions.current,
        {
          autoAlpha: 1,
          duration: counts(2),
          ease: "none",
          stagger: counts(0.5),
        },
        counts(AT.figures + 1),
      );

      // Readable for a good while. Then the text goes the way it came, from
      // the bottom up: the figures and the title sink back behind their
      // edges and the sentences fade.
      const leave = counts(AT.leave);
      timeline.to(
        figureCaptions.current,
        { autoAlpha: 0, duration: counts(1), ease: "none" },
        leave,
      );
      timeline.to(
        figureValues.current,
        { yPercent: 115, duration: counts(2), ease: "power2.in" },
        leave,
      );
      timeline.to(
        words.current,
        { autoAlpha: 0, duration: counts(2), ease: "power1.in" },
        leave + counts(0.5),
      );
      timeline.to(
        titleLines.current,
        {
          yPercent: 115,
          duration: counts(2),
          ease: "power2.in",
          stagger: { each: counts(0.5), from: "end" },
        },
        leave + counts(1),
      );

      // Only when the panel is empty does it draw back, the way it came:
      // into its top left-hand corner, in one move.
      const back = counts(AT.panelBack);
      timeline.to(
        panelFill.current,
        { scale: 0, duration: counts(3), ease: FLOW },
        back,
      );
      timeline.to(
        tile.current,
        { borderBottomLeftRadius: CORNER, duration: counts(1), ease: "none" },
        back + counts(2.25),
      );
      timeline.to(
        box.current,
        { borderBottomRightRadius: CORNER, duration: counts(1), ease: "none" },
        back + counts(2.25),
      );

      // Last, the label packs itself away as on the label page.
      const pack = counts(AT.pack);
      timeline.to(
        line.current,
        { xPercent: -10, autoAlpha: 0, duration: counts(1), ease: FLOW },
        pack,
      );
      timeline.to(
        box.current,
        { scaleX: 0, duration: counts(2), ease: FLOW },
        pack + 0.1,
      );
      timeline.to(
        tile.current,
        {
          borderTopRightRadius: CORNER,
          borderBottomRightRadius: CORNER,
          duration: counts(1),
          ease: "none",
        },
        pack + counts(2) + 0.1,
      );
      timeline.to(
        mark.current,
        { scale: 0, rotation: 225, duration: counts(2), ease: FLOW },
        pack + counts(2),
      );
      timeline.to(
        tile.current,
        { scaleX: 0, scaleY: 0, duration: counts(2), ease: FLOW },
        pack + counts(2) + 0.1,
      );
      timeline.to({}, { duration: 0 }, counts(AT.end));

      // People who ask for less motion get the finished overlay, standing
      // still.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        timeline.pause().time(READABLE);
      } else if (resume.current?.labelText === labelText) {
        timeline.time(resume.current.time).paused(resume.current.paused);
      }
      current = timeline;
      onTimeline?.(timeline);
    };

    // The measurements above are only right once the label's typeface is in.
    const family = label.current
      ? getComputedStyle(label.current).fontFamily
      : "sans-serif";
    Promise.all([document.fonts.load(`16px ${family}`), document.fonts.ready])
      .catch(() => undefined)
      .then(() => {
        if (gone) return;
        context = gsap.context(build, root);
      });

    return () => {
      gone = true;
      if (current) {
        resume.current = {
          time: current.time(),
          paused: current.paused(),
          labelText,
        };
      }
      onTimeline?.(null);
      context?.revert();
      tidy?.();
    };
    // The label is wider in capitals, so the measurements are taken again.
  }, [onTimeline, caps, labelText]);

  return (
    <div ref={root} className="flex w-full flex-col items-start">
      {/* The label: the tab of the card. */}
      <span
        ref={label}
        className="relative z-10 inline-flex h-[2.4em] items-stretch font-display text-[1.5em] leading-none font-normal"
      >
        <span
          ref={tile}
          className="relative z-10 flex aspect-square h-full items-center justify-center"
          // Hidden until the animation takes over, so nothing flashes on load.
          style={{
            background: BRAND.violet,
            borderRadius: CORNER,
            transform: "scale(0)",
          }}
        >
          <span
            ref={mark}
            className="block size-[0.72em] rounded-[0.03em]"
            style={{ background: SHADE.violetDark, transform: "scale(0)" }}
          />
        </span>
        <span className="relative flex items-center">
          <span
            ref={box}
            aria-hidden
            className="absolute inset-y-0 right-0 -left-px origin-left"
            style={{
              background: BRAND.light,
              borderTopRightRadius: CORNER,
              borderBottomRightRadius: CORNER,
              transform: "scaleX(0)",
            }}
          />
          <span
            className="relative flex h-full items-center overflow-hidden"
            style={{ color: BRAND.dark }}
          >
            {/* Set larger and nudged down, as in the one-line label. */}
            <span
              className={`relative top-[0.075em] pr-[0.5em] pl-[0.47em] text-[1.45em] whitespace-nowrap ${capitals}`}
            >
              <span className="sr-only">
                {text.service}, {text.client}
              </span>
              {/* The line as the typeface sets it. It is never seen: it
                  gives the label its width and tells each piece below where
                  to stand. A small block divides the service from the
                  client, at the middle of the capitals' height. */}
              <span aria-hidden className="invisible">
                <span ref={serviceText}>{text.service}</span>
                <span
                  ref={divider}
                  className="mx-[0.2em] inline-block size-[0.24em] align-[0.205em]"
                />
                <span ref={clientText}>{text.client}</span>
              </span>
              {/* What is seen: a piece per letter, behind an edge that sits
                  close round the line, as round a line of the title. */}
              <span
                ref={mask}
                aria-hidden
                className="absolute inset-x-0 -top-[0.14em] -bottom-[0.06em] overflow-hidden"
              >
                <span ref={line} className="invisible absolute inset-0 block">
                  {glyphs.map((glyph, index) =>
                    glyph === null ? (
                      <span
                        key={index}
                        ref={(el) => {
                          pieces.current[index] = el;
                        }}
                        data-divider="true"
                        className="absolute block size-[0.24em] rounded-[0.03em]"
                        style={{ background: BRAND.dark }}
                      />
                    ) : (
                      <span
                        key={index}
                        ref={(el) => {
                          pieces.current[index] = el;
                        }}
                        className="absolute top-[0.14em] block text-center whitespace-pre"
                      >
                        {glyph}
                      </span>
                    ),
                  )}
                </span>
              </span>
            </span>
          </span>
        </span>
      </span>

      {/* The panel: the card the label is the tab of. It starts a hair under
          the label, so no line of the video can show between the two. */}
      <div ref={panel} className="relative -mt-px w-full">
        <span
          ref={panelFill}
          aria-hidden
          className="absolute inset-0 origin-top-left"
          style={{
            background: colours.panel,
            borderRadius: `0 ${PANEL_CORNER} ${PANEL_CORNER} ${PANEL_CORNER}`,
            transform: "scale(0)",
          }}
        />
        <div className="relative flex flex-col px-[1.3em] pt-[1.25em] pb-[1.35em]">
          <h2
            className={`font-normal ${caps ? "leading-none" : "leading-[1.04]"} ${capitals}`}
            style={{
              color: colours.title,
              fontFamily: type.family,
              fontSize: titleSize,
            }}
          >
            {text.title.map((line, row) => (
              // The edge the line rises from behind. It reaches a little
              // above the line, so an accent on a capital is not cut off.
              <span key={row} className="-mt-[0.14em] block overflow-hidden pt-[0.14em]">
                <span
                  ref={(el) => {
                    titleLines.current[row] = el;
                  }}
                  className="invisible block whitespace-nowrap"
                >
                  {line}
                </span>
              </span>
            ))}
          </h2>
          <p
            className="mt-[0.7em] text-[1.05em] leading-[1.38] font-medium"
            style={{ color: colours.body, fontFamily: bodyFont }}
          >
            {text.body.split(" ").map((word, index) => (
              <span key={index}>
                <span
                  ref={(el) => {
                    words.current[index] = el;
                  }}
                  className="invisible inline-block"
                >
                  {word}
                </span>{" "}
              </span>
            ))}
          </p>
          <dl className="mt-[1.1em] flex gap-[2.2em]">
            {text.figures.map((figure, index) => (
              <div key={figure.caption} className="flex flex-col-reverse">
                <dt
                  ref={(el) => {
                    figureCaptions.current[index] = el;
                  }}
                  className="invisible text-[0.82em] leading-[1.3] font-medium"
                  style={{ color: colours.caption, fontFamily: bodyFont }}
                >
                  {figure.caption}
                </dt>
                <dd
                  className={`overflow-hidden ${caps ? "leading-[1.1]" : "leading-[1.04]"} ${capitals}`}
                  style={{ fontFamily: type.family, fontSize: titleSize }}
                >
                  <span
                    ref={(el) => {
                      figureValues.current[index] = el;
                    }}
                    className="invisible block"
                    style={{ color: colours.figure }}
                  >
                    {figure.value}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
