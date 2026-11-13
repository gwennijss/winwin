/**
 * The deck as plain data: order, titles and the one-sentence takeaway per
 * page. No slide code is imported here, so the server route can read it.
 *
 * The deck is a presentation and a guideline in one, and it builds up to the
 * brand: the cover, the contents and the idea show nothing of it yet. Then
 * the logo is made step by step, and from there each chapter adds a part:
 * how it moves, type, colour, what goes over a video and where it all lands.
 * The deck's own pages follow: see `levelOf` in `deck.tsx`.
 * Numbering: a chapter opens on n.0, its pages are n.1, n.2…
 */
export const chapters = [
  { n: "00", title: "Win Win", label: "Win Win" },
  { n: "01", title: "Idee", label: "Idee" },
  { n: "02", title: "Logo", label: "Logo" },
  { n: "03", title: "Beweging", label: "Beweging" },
  { n: "04", title: "Typografie", label: "Typografie" },
  { n: "05", title: "Kleur", label: "Kleur" },
  { n: "06", title: "Op beeld", label: "Op beeld" },
  { n: "07", title: "Toepassingen", label: "Toepassingen" },
] as const;

/**
 * spec: the text panel on the left, the plane with the work on the right.
 * full: the whole page is the work, with a label in the corner.
 * divider: a chapter page. bare: a full page with no furniture.
 */
export type Kind = "spec" | "full" | "divider" | "bare";

export interface OutlineItem {
  id: string;
  title: string;
  chapter: number;
  kind: Kind;
  kern: string;
  /** A few sentences in the panel on the left, for what the page shows. */
  note?: string;
  /** Enters without the fade of the page before. */
  seamless?: boolean;
  /** What the page is called in the list on its chapter page, when that differs from its title. */
  list?: string;
  /** Left out of the list on its chapter page: a step of the page before it. */
  hide?: boolean;
}

const items: OutlineItem[] = [
  { id: "cover", title: "Brand Presentation", chapter: 0, kind: "bare", kern: "Win Win, de merkidentiteit en hoe je ermee werkt." },
  { id: "inhoud", title: "Inhoud", chapter: 0, kind: "bare", kern: "Zeven hoofdstukken, van het idee tot de toepassingen." },

  { id: "d-1", title: "Idee", chapter: 1, kind: "divider", kern: "Waar het merk op rust." },
  { id: "idee-naam", title: "Win, win", chapter: 1, kind: "full", kern: "De naam is de belofte: een samenwerking waar beide kanten beter van worden." },
  { id: "idee-midden", title: "Het midden", chapter: 1, kind: "spec", kern: "Tussen de twee woorden staat het werk.", note: "De naam is twee keer hetzelfde woord. Wat ertussen staat, is het werk: de post, de video, de campagne. Dat is het enige dat steeds anders is." },
  { id: "idee-quote", title: "Uit de discovery", chapter: 1, kind: "full", kern: "Je kunt ons voor LinkedIn inzetten, voor Insta, maakt helemaal niet uit." },

  { id: "d-2", title: "Logo", chapter: 2, kind: "divider", kern: "Twee keer WIN, en een blok ertussen." },
  { id: "logo-stap-1", title: "Eén woord", list: "Van Helvetica naar logo, in vijf stappen", chapter: 2, kind: "full", kern: "We beginnen met één woord: WIN, in Helvetica." },
  { id: "logo-stap-2", title: "Twee keer", hide: true, chapter: 2, kind: "full", kern: "Er schuift een tweede WIN uit.", seamless: true },
  { id: "logo-stap-3", title: "Zwaarder", hide: true, chapter: 2, kind: "full", kern: "We maken de letters zwaarder.", seamless: true },
  { id: "logo-stap-4", title: "De ruit ertussen", hide: true, chapter: 2, kind: "full", kern: "Ertussen komt een ruit, die de woorden opzijduwt.", seamless: true },
  { id: "logo-stap-5", title: "Het logo", hide: true, chapter: 2, kind: "full", kern: "In elke hoek een ronding. Dit is het logo.", seamless: true },
  { id: "logo-opbouw", title: "Opbouw", chapter: 2, kind: "spec", kern: "Eén letterhoogte, één ruit, en overal dezelfde ronding.", note: "De maten komen uit de tekening in Figma. De ruit staat een fractie rechts van het midden: zo houdt hij de rechte stok van de N en de schuine start van de W in balans." },
  { id: "logo-formaten", title: "Elk formaat", chapter: 2, kind: "spec", kern: "Het blok neemt het formaat aan van het kanaal.", note: "Elk kanaal heeft zijn eigen formaat. Het blok neemt ze allemaal aan: vierkant, staand, liggend en 4:5. Zo laat het logo zelf zien dat Win Win overal inzetbaar is." },
  { id: "logo-vormen", title: "Vijf vormen", chapter: 2, kind: "spec", kern: "De ruit, vierkant, staand, liggend en 4:5.", note: "Het blok kent vijf vormen. Vierkant en liggend zijn precies zo hoog als de letters. Staand en 4:5 steken erbovenuit. De woorden schuiven mee en houden steeds dezelfde lucht tot het blok." },
  { id: "logo-ruit", title: "De ruit", chapter: 2, kind: "spec", kern: "Het blok alleen, voor waar het logo niet past.", note: "Waar het hele logo niet past, staat de ruit alleen: als avatar, als favicon, in een knop of als lader. In het paarse vak staat hij in de diepe tint." },
  { id: "logo-ruimte", title: "Ruimte en formaat", chapter: 2, kind: "spec", kern: "Vrije ruimte ter grootte van de ruit.", note: "Rondom het logo blijft een ruimte vrij ter grootte van de ruit. Onder de 120 px breed op een scherm, of 30 mm in druk, neemt de ruit het over." },
  { id: "logo-venster", title: "Het blok als venster", chapter: 2, kind: "spec", kern: "In het blok kan beeld staan, in het formaat van het kanaal.", note: "Het blok is een venster op het werk. Kies een kanaal en het blok neemt dat formaat aan, met het beeld erin. Het beeld staat stil achter het blok. Het blok beweegt." },
  { id: "logo-niet", title: "Wat niet", chapter: 2, kind: "spec", kern: "Zes dingen die het logo breken.", note: "Het logo is sterk omdat het simpel is. Deze zes dingen breken het." },

  { id: "d-3", title: "Beweging", chapter: 3, kind: "divider", kern: "Het merk beweegt zoals het logo beweegt." },
  { id: "beweging-lus", title: "De lus", chapter: 3, kind: "full", kern: "Vijf vormen in achttien tellen, zonder begin of eind." },
  { id: "beweging-principes", title: "Drie regels", chapter: 3, kind: "spec", kern: "Het blok duwt, alles loopt op de tel, en het blok is zacht.", note: "Alles wat beweegt volgt dezelfde drie regels als het logo. Daardoor voelt een knop hetzelfde als een lader, en een label hetzelfde als het logo." },
  { id: "beweging-twee", title: "Bereik en jackpot", chapter: 3, kind: "full", kern: "Twee keer spelen met het midden: het bereik dat groeit, en de jackpot." },
  { id: "beweging-laders", title: "Laders", chapter: 3, kind: "spec", kern: "Wachten, in de vormen van het logo.", note: "De paginalader begint als vierkant en groeit met het laden mee, tot het blok het hele beeld overspant en de woorden tegen de randen staan. Bij honderd procent draait hij dicht tot het logo. De kleine lader is de lus, gespeeld door het blok alleen." },
  { id: "beweging-interactie", title: "Knoppen en navigatie", chapter: 3, kind: "spec", kern: "Het blok verschijnt, het label schuift opzij.", note: "Dezelfde regel als in het logo: het blok verschijnt of verandert van formaat, en het label wordt opzijgeduwd. Beweeg over de knoppen en klik op de pagina." },

  { id: "d-4", title: "Typografie", chapter: 4, kind: "divider", kern: "Eén letter voor titels, één voor zinnen." },
  { id: "type-trabat", title: "Trabat Display", chapter: 4, kind: "spec", kern: "De letter van de titels en de labels.", note: "Trabat Display Semi Condensed is de letter van het merk: smal, rond en stevig, verwant aan de letters van het logo. Voor titels, labels en alles wat je van een afstand leest." },
  { id: "type-breedtes", title: "Twee breedtes", chapter: 4, kind: "spec", kern: "Semi Condensed voor bijna alles, Condensed alleen voor cijfers op beeld.", note: "Bijna alles staat in de Semi Condensed: daarin hebben de ronde letters lucht. Alleen cijfers over een video staan in de smallere Condensed. Daar kan het cijfer groter in hetzelfde blok." },
  { id: "type-hanken", title: "Hanken Grotesk", chapter: 4, kind: "spec", kern: "De letter van de zinnen.", note: "Hanken Grotesk is voor alles wat je als zin leest. Rond en open, rustig naast Trabat. Regular voor tekst, Medium en SemiBold voor bijschriften en kleine labels." },
  { id: "type-hierarchie", title: "Hiërarchie", chapter: 4, kind: "spec", kern: "Zes stijlen, elk met een eigen taak.", note: "Zes stijlen dekken alles. Trabat voor wat je van een afstand leest, Hanken voor wat je van dichtbij leest. Titels krijgen een hoofdletter aan het begin, geen kapitalen." },
  { id: "type-regels", title: "Wel en niet", chapter: 4, kind: "spec", kern: "Hoe de twee letters samenwerken.", note: "De twee letters hebben elk een taak en nemen die niet van elkaar over." },

  { id: "d-5", title: "Kleur", chapter: 5, kind: "divider", kern: "Violet, donker en licht, met twee tinten." },
  { id: "kleur-palet", title: "Palet", chapter: 5, kind: "spec", kern: "Violet, donker, licht, en twee tinten van het violet.", note: "Drie kleuren dragen het merk: violet, donker en licht. Daarnaast twee tinten van het violet, een diepe en een zachte, voor de ruit in het paarse vak en voor cijfers op donker." },
  { id: "kleur-verhouding", title: "Verhouding", chapter: 5, kind: "spec", kern: "Vooral donker en licht, violet als accent.", note: "Donker en licht dragen het beeld. Violet is het accent: het vak van een label, een knop, een cijfer. Hoe minder ervan, hoe harder het werkt." },
  { id: "kleur-combinaties", title: "Combinaties", chapter: 5, kind: "spec", kern: "De combinaties die altijd leesbaar zijn.", note: "Deze combinaties zijn getoetst op contrast. Het getal is de contrastverhouding: vanaf 4,5 is gewone tekst goed leesbaar, vanaf 3 alleen grote tekst." },
  { id: "kleur-logo", title: "Het logo in kleur", chapter: 5, kind: "spec", kern: "Licht op donker, donker op licht, licht op violet.", note: "Het logo is altijd één kleur: woorden en blok samen. Licht op donker is de eerste keuze, want daar is het op getekend. Donker op licht en licht op violet mogen ook." },

  { id: "d-6", title: "Op beeld", chapter: 6, kind: "divider", kern: "Wat Win Win over een video zet." },
  { id: "beeld-label", title: "Het label", chapter: 6, kind: "spec", kern: "Een paars vak met de ruit, en een vak met één woord.", note: "Het label is het logo in het klein: een paars vak met de ruit, en een licht vak met een woord dat eruit schuift. Het benoemt wat je ziet: een dienst, een klant, een sector." },
  { id: "beeld-label-opbouw", title: "Opbouw van het label", chapter: 6, kind: "spec", kern: "Het vak, de ruit, dan het woord.", note: "Alle maten hangen aan de lettergrootte, dus het label schaalt als tekst. Het bouwt zich op in drie stappen, op dezelfde tel als het logo: het vak, de ruit die tot stilstand draait, en dan pas het woord." },
  { id: "beeld-label-gebruik", title: "Labels gebruiken", chapter: 6, kind: "spec", kern: "Alleen, met een blokje ertussen, of als stapel.", note: "Een label staat alleen, of benoemt twee dingen met een blokje ertussen: de dienst en de klant. In een stapel begint elk label een tel na het vorige." },
  { id: "beeld-formaten", title: "Eén campagne, elk formaat", chapter: 6, kind: "full", kern: "Hetzelfde label, op elk kanaal op dezelfde plek." },
  { id: "beeld-case", title: "Het tekstvlak", chapter: 6, kind: "spec", kern: "Het label als tabblad van een donker vlak met tekst.", note: "Tekst die meer is dan een woord, staat in een donker vlak onder het label. Het label wordt het tabblad." },
  { id: "beeld-stats", title: "Resultaten", chapter: 6, kind: "spec", kern: "De video blijft waar je naar kijkt. De cijfers kapen een klein deel van het beeld.", note: "De video blijft waar je naar kijkt. De cijfers kapen er een klein deel van, twee tegelijk." },

  { id: "d-7", title: "Toepassingen", chapter: 7, kind: "divider", kern: "Het merk waar het landt." },
  { id: "toep-post-cube", title: "Post", list: "Posts, vijf in beweging", chapter: 7, kind: "full", kern: "Een post in beweging, en ernaast een foto in hetzelfde formaat." },
  { id: "toep-post-reel", title: "Post", hide: true, chapter: 7, kind: "full", kern: "Gezien, gekocht, gedeeld." },
  { id: "toep-post-split", title: "Post", hide: true, chapter: 7, kind: "full", kern: "Waar content campagne wordt." },
  { id: "toep-post-canvas", title: "Post", hide: true, chapter: 7, kind: "full", kern: "Niet één grote naam, wel honderd kleine: de post als canvas." },
  { id: "toep-post-billboard", title: "Post", hide: true, chapter: 7, kind: "full", kern: "Het merk buiten, op een billboard." },
  { id: "toep-instagram", title: "Instagram", chapter: 7, kind: "full", kern: "Het profiel zoals je het op je telefoon ziet: foto en vlak om en om." },
  { id: "toep-linkedin", title: "LinkedIn", chapter: 7, kind: "full", kern: "Het logo loopt door de omslag, een case als post." },
  { id: "toep-beeld-ruit", title: "Merkbeeld", list: "Merkbeeld, in twee beelden", chapter: 7, kind: "full", kern: "De ruit, veel te groot, met één zin ernaast." },
  { id: "toep-beeld-venster", title: "Merkbeeld", hide: true, chapter: 7, kind: "full", kern: "Het werk, gezien door de ruit." },
  { id: "toep-deck-1", title: "Presentatie", list: "Presentatie, twee pagina's", chapter: 7, kind: "full", kern: "In een presentatie mag het merk uitpakken: de zin groot, de cijfers in ruiten." },
  { id: "toep-deck-2", title: "Presentatie", hide: true, chapter: 7, kind: "full", kern: "Het werk tot de rand, de formaten als vlakken kleur." },

  { id: "volgt", title: "Wat volgt", chapter: 0, kind: "bare", kern: "Wat er staat, en wat er nog komt." },
  { id: "slot", title: "Win Win", chapter: 0, kind: "bare", kern: "Win Win." },
];

export const outline = items.map((item, i) => ({ ...item, slug: String(i + 1).padStart(2, "0") }));

export type OutlineEntry = (typeof outline)[number];

/** The section number of every page: "3.0" for a chapter page, "3.2" for its second page. */
export const sections: Record<string, string> = (() => {
  const out: Record<string, string> = {};
  const count = new Map<number, number>();
  for (const o of outline) {
    if (o.kind === "divider") {
      out[o.id] = `${o.chapter}.0`;
      count.set(o.chapter, 0);
    } else if ((o.kind === "spec" || o.kind === "full") && o.chapter > 0) {
      const k = (count.get(o.chapter) ?? 0) + 1;
      count.set(o.chapter, k);
      out[o.id] = `${o.chapter}.${k}`;
    }
  }
  return out;
})();
