import type { ComponentType } from "react";

export interface Chapter {
  /** Two-digit chapter number as shown, "00" for the front matter. */
  n: string;
  title: string;
}

export interface SlideDef {
  slug: string;
  /** Short title for the chrome, the overview and the PDF outline. */
  title: string;
  /** Index into DeckDef.chapters. */
  chapter: number;
  /** One-sentence takeaway. Shown under the stage on a phone, where the slide itself is small. */
  kern: string;
  /** Enter without the fade of the page before, so a drawing can carry on in the same place. */
  seamless?: boolean;
  Component: ComponentType;
}

export interface DeckDef {
  client: string;
  title: string;
  /** e.g. "Oktober 2026" */
  date: string;
  version: string;
  basePath: string;
  /** The printed version. Without it the download button is left out. */
  pdfHref?: string;
  pdfFilename?: string;
  chapters: Chapter[];
  slides: SlideDef[];
  /** Images to warm up while the intro plays. */
  preload?: string[];
  /**
   * The opening. `onReveal` mounts the deck underneath while the intro is
   * still on screen, for an intro that uncovers the first page itself.
   */
  Intro?: ComponentType<{ onDone: () => void; onReveal?: () => void; progress: number }>;
  /** The colour of the intro's own background, shown from the first paint until the intro starts. */
  introBackground?: string;
  /** A small instrument in the footer that shows where you are, such as a floor indicator. */
  Floor?: ComponentType<{ chapter: number; total: number; onJump: (chapter: number) => void }>;
}

export const STAGE_W = 1920;
export const STAGE_H = 1080;
