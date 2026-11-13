import type { ComponentType } from "react";
import { Fade, Lines } from "@/deck/motion";
import type { DeckDef } from "@/deck/types";
import { Intro } from "./Intro";
import { chapters, outline, sections, type OutlineEntry } from "./outline";
import { CornerContext, DARK, LabelDivider, LevelContext, LogoStill, PANEL, PH, PW, Tag, type Level } from "./parts";
import * as beeld from "./slides/beeld";
import * as beweging from "./slides/beweging";
import * as decks from "./slides/decks";
import * as front from "./slides/front";
import * as idee from "./slides/idee";
import * as instagram from "./slides/instagram";
import * as kleur from "./slides/kleur";
import * as logo from "./slides/logo";
import * as making from "./slides/making";
import * as merkbeeld from "./slides/merkbeeld";
import * as site from "./slides/site";
import * as toepassingen from "./slides/toepassingen";
import * as typografie from "./slides/typografie";

/** Slide id → component. Every id in the outline needs an entry here. */
const components: Record<string, ComponentType> = {
  ...front.slides,
  ...idee.slides,
  ...making.slides,
  ...logo.slides,
  ...beweging.slides,
  ...typografie.slides,
  ...kleur.slides,
  ...beeld.slides,
  ...toepassingen.slides,
  ...site.slides,
  ...instagram.slides,
  ...merkbeeld.slides,
  ...decks.slides,
};

function Missing() {
  return null;
}

/**
 * How much of the brand a page may show: the deck builds up to the brand, so
 * a page only uses what the chapters before it have introduced. The front
 * and the idea are plain. From the logo on, the logo may stand on a page;
 * from the typefaces on, pages are set in them; and once the label has been
 * shown, it becomes the signage. The closing pages have it all.
 */
function levelOf(o: OutlineEntry): Level {
  if (o.id === "volgt" || o.id === "slot") return "full";
  // A chapter page stands before its chapter: it shows what was there already.
  const chapter = o.kind === "divider" ? o.chapter - 1 : o.chapter;
  if (chapter <= 1) return "plain";
  if (chapter <= 3) return "logo";
  if (chapter <= 5) return "type";
  return "full";
}

/** A title of more than about thirteen characters breaks into two lines at a space near the middle. */
function titleLines(title: string): string[] {
  if (title.length <= 13) return [title];
  const middle = title.length / 2;
  let best = -1;
  for (let i = 0; i < title.length; i++) {
    if (title[i] === " " && (best < 0 || Math.abs(i - middle) < Math.abs(best - middle))) best = i;
  }
  return best < 0 ? [title] : [title.slice(0, best), title.slice(best + 1)];
}

/**
 * A spec page: on the left a dark panel with the section, a title and a few
 * sentences; on the right the plane, where the slide itself draws its ground
 * and its work. The panel is the brand's own text panel, and it becomes one
 * step by step: plain at first, then with the logo at its foot, then in the
 * brand's typefaces, and in the end with a label as its tab.
 */
function Panel({ o, level }: { o: OutlineEntry; level: Level }) {
  const chapter = chapters[o.chapter];
  return (
    <div className="ww--dark absolute" style={{ left: 0, top: 0, width: PANEL, height: PH, background: DARK }}>
      {level === "full" ? (
        <div className="absolute" style={{ left: 40, top: 40 }}>
          <Tag size={20}>
            {chapter.label}
            <LabelDivider />
            {sections[o.id]}
          </Tag>
        </div>
      ) : (
        <div className="t-sign absolute flex" style={{ left: 40, top: 50, gap: 16 }}>
          <span className="tabular mute">{sections[o.id]}</span>
          <span>{chapter.label}</span>
        </div>
      )}
      <div className="absolute" style={{ left: 40, top: 148, width: PANEL - 76 }}>
        <Lines at={0} className="t-title" lines={titleLines(o.title)} />
        {o.note && (
          <Fade at={1.5} className="t-aside soft" style={{ marginTop: 34 }}>
            {o.note}
          </Fade>
        )}
      </div>
      {level === "plain" ? (
        <div className="t-sign absolute" style={{ left: 40, bottom: 50 }}>
          Win Win
        </div>
      ) : (
        <div className="absolute" style={{ left: 40, bottom: 40, opacity: 0.9 }}>
          <LogoStill width={190} style={{ marginLeft: -21 }} />
        </div>
      )}
      <div className="t-sign tabular mute absolute" style={{ right: 36, bottom: 50 }}>
        {o.slug} / {String(outline.length).padStart(2, "0")}
      </div>
      <div className="absolute" style={{ right: 0, top: 0, width: 1, height: PH, background: "var(--line)" }} />
    </div>
  );
}

/** Wraps a slide in what its kind of page needs, at the level of the brand its place in the deck allows. */
function withFrame(Body: ComponentType, o: OutlineEntry): ComponentType {
  const level = levelOf(o);
  const plainType = level === "plain" || level === "logo";
  const corner = { n: sections[o.id], chapter: chapters[o.chapter].label, title: o.title };
  function Slide() {
    return (
      <LevelContext.Provider value={level}>
        <div className={`absolute inset-0 ${plainType ? "pre-type" : ""}`}>
          {o.kind === "spec" ? (
            <>
              <Panel o={o} level={level} />
              <div className="absolute overflow-hidden" style={{ left: PANEL, top: 0, width: PW, height: PH }}>
                <Body />
              </div>
            </>
          ) : (
            <CornerContext.Provider value={o.kind === "full" ? corner : null}>
              <Body />
            </CornerContext.Provider>
          )}
        </div>
      </LevelContext.Provider>
    );
  }
  return Slide;
}

export const winwinBrandDeck: DeckDef = {
  client: "Win Win",
  title: "Brand Presentation",
  date: "November 2026",
  version: "1.0",
  basePath: "/presentatie",
  pdfHref: "/deck/Win-Win-Brand-Presentation.pdf",
  pdfFilename: "Win-Win-Brand-Presentation.pdf",
  chapters: chapters.map((c) => ({ n: c.n, title: c.title })),
  Intro,
  introBackground: DARK,
  slides: outline.map((o) => ({
    slug: o.slug,
    title: o.title,
    chapter: o.chapter,
    kern: o.kern,
    Component: withFrame(components[o.id] ?? Missing, o),
    seamless: o.seamless,
  })),
};
