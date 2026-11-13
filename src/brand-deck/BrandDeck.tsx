"use client";

import { useSyncExternalStore } from "react";
import { Deck } from "@/deck/Deck";
import { SlideFrame } from "@/deck/SlideFrame";
import { winwinBrandDeck } from "./deck";
import { MediaContext, type DeckMedia } from "./parts";

/** The deck without its download button, for when the printed version has not been made. */
const withoutPdf = { ...winwinBrandDeck, pdfHref: undefined };

export function BrandDeck({ initialSlug, media }: { initialSlug?: string; media: DeckMedia }) {
  return (
    <MediaContext.Provider value={media}>
      <Deck deck={media.pdf ? winwinBrandDeck : withoutPdf} initialSlug={initialSlug} />
    </MediaContext.Provider>
  );
}

const subscribeNever = () => () => {};

/**
 * Every slide stacked in its final state, for printing. The pages are drawn
 * in the browser only, as in the deck itself: many of them hold an animation
 * that is put in its finished state there.
 */
export function BrandPrint({ media }: { media: DeckMedia }) {
  const inBrowser = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
  if (!inBrowser) return null;
  return (
    <MediaContext.Provider value={media}>
      <div>
        {winwinBrandDeck.slides.map((slide) => (
          <div key={slide.slug} className="print-page">
            <SlideFrame slide={slide} still />
          </div>
        ))}
      </div>
    </MediaContext.Provider>
  );
}
