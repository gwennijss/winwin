"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { Mark, type MarkHandle } from "../winwin-logo/Mark";
import { MARK_SHAPES } from "../winwin-logo/geometry";
import { extent, type Shape } from "../winwin-logo/geometry";
import { SNAP } from "../winwin-logo/motion";
import { BEAT } from "../winwin-logo/timeline";

/** Space between the mark and the label, in em. */
const GAP = 0.32;

/** Room the mark takes up in front of the label, in em. The mark's box is 1em. */
const roomFor = (shape: Shape) =>
  shape.w > 0 ? extent(shape) / 100 + GAP : 0;

/** Where the mark's 1em box starts so the mark is centred in its room. */
const offsetFor = (room: number) => `${(room - GAP) / 2 - 0.5}em`;

type Props = {
  children: ReactNode;
  className?: string;
  href?: string;
  /** Shape when nothing is happening; leave out for no mark at all. */
  rest?: Shape;
  /** Shape under the pointer or on keyboard focus. */
  hover: Shape;
  /** Shape while pressed. */
  press?: Shape;
  onClick?: () => void;
};

/**
 * A link or button with the mark in front of its label. Just as in the logo,
 * the mark changes shape and the label gets pushed aside by it.
 */
export function PushLabel({
  children,
  className,
  href,
  rest = MARK_SHAPES.none,
  hover,
  press = MARK_SHAPES.square,
  onClick,
}: Props) {
  const mark = useRef<MarkHandle>(null);
  const room = useRef<HTMLSpanElement>(null);
  const holder = useRef<HTMLSpanElement>(null);
  const state = useRef({ ...rest, room: roomFor(rest) });

  // Stop any move still under way when the label goes away.
  useEffect(() => {
    const current = state.current;
    return () => gsap.killTweensOf(current);
  }, []);

  const go = (shape: Shape) => {
    gsap.to(state.current, {
      ...shape,
      room: roomFor(shape),
      duration: 2 * BEAT,
      ease: SNAP,
      overwrite: true,
      onUpdate: () => {
        const now = state.current;
        mark.current?.draw(now);
        if (room.current) room.current.style.width = `${Math.max(0, now.room)}em`;
        if (holder.current) holder.current.style.left = offsetFor(now.room);
      },
    });
  };

  const Tag = href ? "a" : "button";

  return (
    <Tag
      href={href}
      type={href ? undefined : "button"}
      className={`inline-flex cursor-pointer items-center ${className ?? ""}`}
      onClick={onClick}
      onPointerEnter={() => go(hover)}
      onPointerLeave={() => go(rest)}
      onPointerDown={() => go(press)}
      onPointerUp={() => go(hover)}
      onFocus={() => go(hover)}
      onBlur={() => go(rest)}
    >
      <span
        ref={room}
        className="relative inline-block h-[1em] shrink-0"
        style={{ width: `${roomFor(rest)}em` }}
      >
        <span
          ref={holder}
          className="absolute top-0 block size-[1em]"
          style={{ left: offsetFor(roomFor(rest)) }}
        >
          <Mark ref={mark} initial={rest} className="size-full" />
        </span>
      </span>
      <span>{children}</span>
    </Tag>
  );
}
