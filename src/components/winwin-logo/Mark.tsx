"use client";

import { useImperativeHandle, useRef, type Ref } from "react";
import { BLOCK_RADIUS, MARK_SHAPES, type Shape } from "./geometry";

export type MarkHandle = {
  draw: (shape: Shape) => void;
};

function attributes(shape: Shape) {
  return {
    x: -shape.w / 2,
    y: -shape.h / 2,
    width: Math.max(0, shape.w),
    height: Math.max(0, shape.h),
    transform: `rotate(${shape.rot})`,
  };
}

type Props = {
  className?: string;
  ref?: Ref<MarkHandle>;
  initial?: Shape;
};

/**
 * The block of the logo on its own: the smallest piece of the brand, used for
 * loaders, links, buttons and anything else that needs a sign of life.
 * It takes the text colour and is sized by its width or height.
 */
export function Mark({
  className,
  ref,
  initial = MARK_SHAPES.diamond,
}: Props) {
  const rect = useRef<SVGRectElement>(null);

  useImperativeHandle(ref, () => ({
    draw: (shape) => {
      const el = rect.current;
      if (!el) return;
      for (const [name, value] of Object.entries(attributes(shape))) {
        el.setAttribute(name, String(value));
      }
    },
  }));

  return (
    <svg
      className={className}
      viewBox="-50 -50 100 100"
      overflow="visible"
      aria-hidden
    >
      <rect
        ref={rect}
        {...attributes(initial)}
        rx={BLOCK_RADIUS}
        fill="currentColor"
      />
    </svg>
  );
}
