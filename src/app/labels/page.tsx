import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SocialLabel } from "@/components/labels/SocialLabel";
import { TwoLineLabel } from "@/components/labels/TwoLineLabel";
import { BRAND, VIOLET_LIGHT_MARK } from "@/components/labels/palette";
import { Tile } from "@/components/system/Tile";
import { BEAT } from "@/components/winwin-logo/timeline";

export const metadata: Metadata = {
  title: "Win Win — Labels",
};

/** Placeholder words; the real ones are for Win Win to choose. */
const STACK = ["Creators", "Campagnes", "Content", "Community"];

/**
 * The surface a label is shown on: always the brand's dark, whatever ground
 * the rest of the site is set to, because that is what the labels are made
 * for.
 */
function Surface({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex min-h-[380px] w-full items-center justify-center self-stretch overflow-hidden p-6"
      style={{ background: BRAND.dark, color: BRAND.light }}
    >
      {children}
    </div>
  );
}

export default function LabelsPage() {
  return (
    <main className="mx-auto flex w-full max-w-[1400px] flex-col gap-12 px-6 pt-28 pb-24 sm:px-10">
      <header className="flex flex-col gap-5">
        <h1 className="max-w-[16ch] text-5xl font-semibold tracking-tight sm:text-7xl">
          Labels voor social.
        </h1>
        <p className="max-w-[56ch] text-[rgb(var(--ink)/0.50)]">
          Een gekleurd vak met het blok van het logo, en een vak met tekst dat
          eruit schuift. Ze bouwen zichzelf op in dezelfde tel als het logo.
        </p>
      </header>

      {/* One to a row: side by side they would compete for the eye. */}
      <div className="grid gap-4">
        <Tile
          number="01"
          title="Eén regel"
          note="Het paarse vak springt tevoorschijn, de ruit draait anderhalve slag en komt tot stilstand, en pas dan schuift het lichte vak met het woord eruit. Hier met de ruit in de donkere tint."
        >
          <Surface>
            <SocialLabel className="text-[clamp(1.75rem,4.5vw,4rem)]">
              Creators
            </SocialLabel>
          </Surface>
        </Tile>

        <Tile
          number="02"
          title="Twee regels"
          note="Een staand vak met het staande formaat erin, en per regel een eigen lichte balk die stopt waar de tekst stopt. De bovenste regel is altijd de langste. Het blokje draait om zijn eigen as tot stilstand; daarna schuiven de balken er na elkaar uit."
        >
          <Surface>
            <TwoLineLabel
              lines={["De juiste creators", "voor je merk"]}
              className="text-[clamp(1.5rem,3.6vw,3.25rem)]"
            />
          </Surface>
        </Tile>

        <Tile
          number="03"
          title="Als stapel"
          note="Vier labels onder elkaar, die elk een tel na de vorige beginnen. Hier met de ruit in de lichte tint, om de twee tinten te vergelijken."
        >
          <Surface>
            <div className="flex flex-col items-start gap-[0.35em] text-[clamp(1.5rem,3.2vw,2.75rem)]">
              {STACK.map((word, index) => (
                <SocialLabel
                  key={word}
                  delay={index * BEAT}
                  colours={VIOLET_LIGHT_MARK}
                >
                  {word}
                </SocialLabel>
              ))}
            </div>
          </Surface>
        </Tile>
      </div>
    </main>
  );
}
