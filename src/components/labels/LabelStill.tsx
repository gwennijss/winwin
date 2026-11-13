import type { ReactNode } from "react";
import { VIOLET_DARK_MARK, type LabelColours } from "./palette";

/** Corner radius of the label, as a share of the font size. */
const CORNER = "0.05em";

type Props = {
  children: ReactNode;
  colours?: LabelColours;
  className?: string;
};

/**
 * The social label standing still, as it looks once it has built itself:
 * for places where something else is the thing that moves. It is sized by
 * its font size.
 */
export function LabelStill({
  children,
  colours = VIOLET_DARK_MARK,
  className,
}: Props) {
  return (
    <span
      className={`relative inline-flex h-[2.4em] items-stretch font-display leading-none font-normal ${className ?? ""}`}
    >
      <span
        className="flex aspect-square h-full items-center justify-center"
        style={{
          background: colours.tile,
          borderRadius: `${CORNER} 0 0 ${CORNER}`,
        }}
      >
        <span
          className="block size-[0.72em] rotate-45 rounded-[0.03em]"
          style={{ background: colours.mark }}
        />
      </span>
      <span
        className="flex items-center"
        style={{
          background: colours.box,
          borderRadius: `0 ${CORNER} ${CORNER} 0`,
        }}
      >
        {/* Set larger and nudged down, as in the one-line label. */}
        <span
          className="relative top-[0.075em] pr-[0.5em] pl-[0.47em] text-[1.45em] whitespace-nowrap"
          style={{ color: colours.text }}
        >
          {children}
        </span>
      </span>
    </span>
  );
}

/** The small block that divides two words in a label, in the text's colour. */
export function LabelDivider() {
  return (
    <span
      aria-hidden
      className="mx-[0.2em] inline-block size-[0.24em] rounded-[0.03em] bg-current align-[0.205em]"
    />
  );
}
