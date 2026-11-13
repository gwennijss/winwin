import type { Metadata } from "next";
import { FormatWindow } from "@/components/system/FormatWindow";
import { MarkLoader } from "@/components/system/MarkLoader";
import { PageTransition } from "@/components/system/PageTransition";
import { ProgressLoader } from "@/components/system/ProgressLoader";
import { PushLabel } from "@/components/system/PushLabel";
import { Tile } from "@/components/system/Tile";
import { MARK_SHAPES } from "@/components/winwin-logo/geometry";
import { findMedia } from "@/lib/media";

export const metadata: Metadata = {
  title: "Win Win — Motion system",
};

const PRINCIPLES = [
  {
    title: "Het blok duwt",
    text: "Het blok is het enige dat uit zichzelf beweegt. Woorden en labels worden er als één geheel door opzijgeduwd.",
  },
  {
    title: "Accent en doorloop, op de tel",
    text: "Een accent haalt uit en schiet door; een doorloop glijdt naar de volgende vorm. Alles begint en eindigt op een tel van een kwart seconde.",
  },
  {
    title: "Vijf vormen, zacht van aard",
    text: "De ruit, vierkant, staand, liggend en 4:5. Platgedrukt wordt het blok breed, van opzij ingeknepen wordt het hoog.",
  },
];

const NAV = ["Werk", "Creators", "Over ons", "Contact"];

export default function SystemPage() {
  return (
    <main className="mx-auto flex w-full max-w-[1400px] flex-col gap-16 px-6 pt-28 pb-24 sm:px-10">
      <header className="flex flex-col gap-10">
        <h1 className="max-w-[18ch] text-5xl font-semibold tracking-tight sm:text-7xl">
          Eén beweging, de hele site.
        </h1>
        <ul className="grid gap-8 sm:grid-cols-3">
          {PRINCIPLES.map((principle) => (
            <li key={principle.title} className="flex flex-col gap-2 border-t border-[rgb(var(--ink)/0.15)] pt-4">
              <h2 className="font-medium">{principle.title}</h2>
              <p className="max-w-[40ch] text-sm leading-relaxed text-[rgb(var(--ink)/0.50)]">
                {principle.text}
              </p>
            </li>
          ))}
        </ul>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <Tile
          number="01"
          title="Paginalader"
          note="Het blok begint als vierkant en groeit mee met het laden tot het liggende formaat, en duwt zo de woorden uit elkaar. Bij 100% draait het dicht tot het logo."
        >
          <ProgressLoader className="max-w-[640px]" />
        </Tile>

        <Tile
          number="02"
          title="Kleine lader"
          note="De lus van het logo, gespeeld door het blok alleen: dezelfde vormen, hetzelfde ritme, dezelfde spin. Voor knoppen, formulieren en plekken waar het hele logo niet past."
        >
          <div className="flex items-center gap-12">
            <MarkLoader className="size-5" />
            <MarkLoader className="size-9" />
            <MarkLoader className="size-20" />
            <span className="inline-flex items-center gap-3 bg-[rgb(var(--ink))] px-5 py-3 text-sm font-medium text-[var(--background)]">
              <MarkLoader className="size-4" />
              Versturen
            </span>
          </div>
        </Tile>

        <Tile
          number="03"
          title="Formaatvenster"
          note="Het blok als venster op het werk: kies een kanaal en het neemt dat formaat aan. Hier komt straks beeld of video van creators in."
          className="lg:col-span-2"
        >
          <FormatWindow className="max-w-[900px]" media={findMedia()} />
        </Tile>

        <Tile
          number="04"
          title="Navigatie en knoppen"
          note="Dezelfde regel als in het logo: het blok verschijnt of verandert van formaat, en het label schuift ervoor opzij. Beweeg erover en klik."
        >
          <div className="flex flex-col items-start gap-10">
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-xl font-medium">
              {NAV.map((item, index) => (
                <PushLabel
                  key={item}
                  href="#"
                  rest={index === 0 ? MARK_SHAPES.diamond : MARK_SHAPES.none}
                  hover={index === 0 ? MARK_SHAPES.landscape : MARK_SHAPES.bud}
                >
                  {item}
                </PushLabel>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <PushLabel
                rest={MARK_SHAPES.diamond}
                hover={MARK_SHAPES.landscape}
                className="bg-[rgb(var(--ink))] px-7 py-4 text-lg font-semibold text-[var(--background)]"
              >
                Werk met ons
              </PushLabel>
              <PushLabel
                rest={MARK_SHAPES.square}
                hover={MARK_SHAPES.portrait}
                press={MARK_SHAPES.diamond}
                className="border border-[rgb(var(--ink)/0.30)] px-7 py-4 text-lg font-semibold"
              >
                Bekijk cases
              </PushLabel>
            </div>
          </div>
        </Tile>

        <Tile
          number="05"
          title="Paginaovergang"
          note="De ruit barst open tot hij het scherm vult, de pagina wisselt eronder en het blok draait door en krimpt weer weg."
        >
          <PageTransition className="min-h-[260px]" />
        </Tile>
      </div>
    </main>
  );
}
