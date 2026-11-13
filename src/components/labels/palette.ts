/** The Win Win colours. */
export const BRAND = {
  violet: "#593CFF",
  dark: "#252526",
  light: "#F3F6FF",
} as const;

/**
 * Secondary colours: a darker and a lighter shade of the violet, for the
 * diamond inside a violet square.
 */
export const SHADE = {
  violetDark: "#1D0F66",
  violetLight: "#C9C0FF",
} as const;

/** The colours of one label. */
export type LabelColours = {
  /** The square on the left. */
  tile: string;
  /** The diamond inside the square. */
  mark: string;
  /** The box the text stands in. */
  box: string;
  text: string;
};

/** Violet square with a diamond in the darker shade; dark text on light. */
export const VIOLET_DARK_MARK: LabelColours = {
  tile: BRAND.violet,
  mark: SHADE.violetDark,
  box: BRAND.light,
  text: BRAND.dark,
};

/** The same with the diamond in the lighter shade. */
export const VIOLET_LIGHT_MARK: LabelColours = {
  ...VIOLET_DARK_MARK,
  mark: SHADE.violetLight,
};
