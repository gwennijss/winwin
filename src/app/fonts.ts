import { Anton, Hanken_Grotesk, Instrument_Sans } from "next/font/google";
import localFont from "next/font/local";

/**
 * Trabat Display Condensed: the typeface chosen for the social labels. It
 * comes in one weight.
 */
export const trabat = localFont({
  src: "./fonts/TrabatDisplay-Condensed.otf",
  variable: "--font-trabat",
  weight: "400",
  display: "swap",
});

/**
 * Trabat Display Semi Condensed: the width chosen for titles and figures
 * inside a text panel, where the condensed one looked squeezed.
 */
export const trabatSemi = localFont({
  src: "./fonts/TrabatDisplay-SemiCondensed.otf",
  variable: "--font-trabat-semi",
  weight: "400",
  display: "swap",
});

/**
 * Trabat Display in its normal width, to compare with the narrower ones on the
 * case page.
 */
export const trabatRegular = localFont({
  src: "./fonts/TrabatDisplay-Regular.ttf",
  variable: "--font-trabat-regular",
  weight: "400",
  display: "swap",
});

/**
 * Candidates for running text next to Trabat, which is only for titles. They
 * are tried out on the case page.
 */
export const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
});

export const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
});

/**
 * Not a typeface of the brand. It is on the stats page only to show what a
 * much taller, heavier face does to a number, next to Trabat.
 */
export const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
});
