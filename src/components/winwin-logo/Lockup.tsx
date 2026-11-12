"use client";

import { useId, useImperativeHandle, useRef, type Ref } from "react";
import WinLeft from "@/assets/logo/win-left.svg";
import WinRight from "@/assets/logo/win-right.svg";
import {
  BLOCK_OFFSET_X,
  BLOCK_RADIUS,
  HOME,
  STATES,
  VIEW,
  WORD,
  wordDistance,
  type Media,
  type Pose,
  type Screen,
  type StateName,
} from "./geometry";

export type LockupHandle = {
  /** Draws the lockup in a pose, with each picture as visible as `screen` says. */
  draw: (pose: Pose, screen?: Screen) => void;
};

/**
 * A picture is laid out a little larger than the shape it belongs to, so the
 * block never shows a bare edge when it overshoots.
 */
const BLEED = 1.1;

const CENTER_X = VIEW.width / 2;
const CENTER_Y = VIEW.height / 2;
const WORD_Y = CENTER_Y - WORD.height / 2;

/**
 * Where everything goes for a pose. Each word is one solid object: the
 * letters never move relative to each other.
 */
function attributes(pose: Pose) {
  const reach = wordDistance(pose) / 2;
  return {
    leftWord: `translate(${CENTER_X - reach - WORD.width} ${WORD_Y})`,
    rightWord: `translate(${CENTER_X + reach} ${WORD_Y})`,
    block: `translate(${CENTER_X + BLOCK_OFFSET_X} ${CENTER_Y}) rotate(${pose.rot})`,
    rect: {
      x: -pose.w / 2,
      y: -pose.h / 2,
      width: Math.max(0, pose.w),
      height: Math.max(0, pose.h),
    },
  };
}

type Props = {
  className?: string;
  ref?: Ref<LockupHandle>;
  /** The pose drawn before any animation takes over. */
  initial?: Pose;
  /**
   * Pictures to show inside the block. The block is a window onto them: each
   * picture stays put and uncropped behind it while the block changes shape.
   */
  media?: Media;
};

/**
 * The Win Win lockup as a drawing surface: it shows whatever pose it is told
 * to. It takes its colour from the text colour and its size from its width.
 */
export function Lockup({
  className,
  ref,
  initial = STATES[HOME],
  media,
}: Props) {
  const leftWord = useRef<SVGGElement>(null);
  const rightWord = useRef<SVGGElement>(null);
  const block = useRef<SVGGElement>(null);
  const rect = useRef<SVGRectElement>(null);
  const windowRect = useRef<SVGRectElement>(null);
  const pictures = useRef<Partial<Record<StateName, SVGImageElement | null>>>({});
  const clipId = useId();
  const shown = Object.entries(media ?? {}) as [StateName, string][];

  useImperativeHandle(ref, () => ({
    draw: (pose, screen) => {
      const next = attributes(pose);
      leftWord.current?.setAttribute("transform", next.leftWord);
      rightWord.current?.setAttribute("transform", next.rightWord);
      block.current?.setAttribute("transform", next.block);
      // The window onto the pictures is the block itself.
      windowRect.current?.setAttribute("transform", next.block);
      for (const el of [rect.current, windowRect.current]) {
        if (!el) continue;
        for (const [name, value] of Object.entries(next.rect)) {
          el.setAttribute(name, String(value));
        }
      }
      for (const [name, picture] of Object.entries(pictures.current)) {
        picture?.setAttribute(
          "opacity",
          String(Math.min(1, Math.max(0, screen?.[name as StateName] ?? 0))),
        );
      }
    },
  }));

  const first = attributes(initial);

  return (
    <svg
      className={`winwin-logo ${className ?? ""}`}
      viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
      overflow="visible"
      role="img"
      aria-label="Win Win"
    >
      <g ref={leftWord} transform={first.leftWord}>
        <WinLeft aria-hidden />
      </g>
      <g ref={rightWord} transform={first.rightWord}>
        <WinRight aria-hidden />
      </g>
      <g ref={block} transform={first.block}>
        <rect
          ref={rect}
          {...first.rect}
          rx={BLOCK_RADIUS}
          fill="currentColor"
        />
      </g>
      {shown.length > 0 && (
        <>
          {/* A clip path may only hold shapes, so the rectangle carries the
              block's position and turn itself. */}
          <clipPath id={clipId}>
            <rect
              ref={windowRect}
              {...first.rect}
              rx={BLOCK_RADIUS}
              transform={first.block}
            />
          </clipPath>
          <g clipPath={`url(#${clipId})`}>
            {shown.map(([name, href]) => {
              const width = STATES[name].w * BLEED;
              const height = STATES[name].h * BLEED;
              return (
                <image
                  key={name}
                  ref={(el) => {
                    pictures.current[name] = el;
                  }}
                  href={href}
                  x={CENTER_X + BLOCK_OFFSET_X - width / 2}
                  y={CENTER_Y - height / 2}
                  width={width}
                  height={height}
                  preserveAspectRatio="xMidYMid slice"
                  opacity={0}
                />
              );
            })}
          </g>
        </>
      )}
    </svg>
  );
}
