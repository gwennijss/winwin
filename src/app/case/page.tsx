import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { CaseStudy } from "@/components/case/CaseStudy";
import type { CaseText } from "@/components/case/CaseOverlay";
import { Footage } from "@/components/case/Footage";
import { hanken, instrument, trabatRegular, trabatSemi } from "../fonts";

export const metadata: Metadata = {
  title: "Win Win — Case",
};

/**
 * Stand-in text: the campaign and its figures are made up, to have something
 * of the right length to look at.
 */
const TEXT: CaseText = {
  service: "Boost",
  client: "BYD",
  title: ["Twaalf creators,", "één proefrit."],
  body: "BYD wilde elektrisch rijden dichterbij brengen. Wij gaven twaalf creators een week de sleutels en zetten hun beste video's door met Boost.",
  figures: [
    { value: "4,1 mln", caption: "keer bekeken" },
    { value: "+38%", caption: "proefritten" },
  ],
};

/** A video in `public/media/case.mp4` plays behind the text, if it is there. */
function findVideo(): string | undefined {
  const there = existsSync(
    path.join(process.cwd(), "public", "media", "case.mp4"),
  );
  return there ? "/media/case.mp4" : undefined;
}

export default function CasePage() {
  return (
    <main
      className={`${instrument.variable} ${hanken.variable} ${trabatSemi.variable} ${trabatRegular.variable} mx-auto flex w-full max-w-[1400px] flex-col gap-12 px-6 pt-28 pb-24 sm:px-10`}
    >
      <header className="flex flex-col gap-5">
        <h1 className="max-w-[16ch] text-5xl font-semibold tracking-tight sm:text-7xl">
          Tekst op een case.
        </h1>
        <p className="max-w-[56ch] text-[rgb(var(--ink)/0.50)]">
          Het label wordt het tabblad van een tekstvlak: bovenin de dienst en
          de klant, daaronder een titel in Trabat en een paar zinnen in een
          rustiger lettertype. Hier op een staande video van 9:16.
        </p>
      </header>

      <CaseStudy text={TEXT} footage={<Footage video={findVideo()} />} />
    </main>
  );
}
