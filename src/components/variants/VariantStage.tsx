"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import WinLeft from "@/assets/logo/win-left.svg";
import WinRight from "@/assets/logo/win-right.svg";
import {
  BLOCK_OFFSET_X,
  BLOCK_RADIUS,
  VIEW,
  WORD,
} from "../winwin-logo/geometry";
import type { Block, Scene, Variant } from "./scene";

gsap.registerPlugin(useGSAP);

const CENTER_X = VIEW.width / 2;
const CENTER_Y = VIEW.height / 2;
const WORD_Y = CENTER_Y - WORD.height / 2;

const leftWordAt = (scene: Scene) =>
  `translate(${CENTER_X - scene.words.left - WORD.width} ${WORD_Y})`;
const rightWordAt = (scene: Scene) =>
  `translate(${CENTER_X + scene.words.right} ${WORD_Y})`;

function blockAttributes(block: Block, offset: number) {
  return {
    transform: `translate(${CENTER_X + offset + block.x} ${CENTER_Y + block.y}) scale(${block.sx} ${block.sy}) rotate(${block.rot})`,
    opacity: Math.min(1, Math.max(0, block.alpha)),
    rect: {
      x: -block.w / 2,
      y: -block.h / 2,
      width: Math.max(0, block.w),
      height: Math.max(0, block.h),
    },
    // For a block drawn as an outline: fit its 100 by 100 box to the block.
    fit: `scale(${block.w / 100} ${block.h / 100}) translate(-50 -50)`,
  };
}

type Props = {
  variant: Variant;
  className?: string;
  /** Shows the first frame and does not play: for a printed page. */
  still?: boolean;
};

/** Plays one variant of the logo animation, looping while it is on screen. */
export function VariantStage({ variant, className, still = false }: Props) {
  const svg = useRef<SVGSVGElement>(null);
  const leftWord = useRef<SVGGElement>(null);
  const rightWord = useRef<SVGGElement>(null);
  const holders = useRef<(SVGGElement | null)[]>([]);
  const shapes = useRef<(SVGRectElement | SVGPathElement | null)[]>([]);

  const offset = variant.centred ? 0 : BLOCK_OFFSET_X;
  const first = variant.create();

  useGSAP(
    () => {
      const scene = variant.create();
      // Filled in once the variant has built its animation.
      const hooks: { everyFrame?: () => void } = {};

      const draw = () => {
        hooks.everyFrame?.();
        leftWord.current?.setAttribute("transform", leftWordAt(scene));
        rightWord.current?.setAttribute("transform", rightWordAt(scene));
        scene.blocks.forEach((block, index) => {
          const next = blockAttributes(block, offset);
          const holder = holders.current[index];
          const shape = shapes.current[index];
          holder?.setAttribute("transform", next.transform);
          holder?.setAttribute("opacity", String(next.opacity));
          if (!shape) return;
          if (block.path) {
            shape.setAttribute("transform", next.fit);
          } else {
            for (const [name, value] of Object.entries(next.rect)) {
              shape.setAttribute(name, String(value));
            }
          }
        });
      };

      const timeline = gsap.timeline({ repeat: -1, onUpdate: draw });
      hooks.everyFrame = variant.build(scene, timeline) ?? undefined;
      draw();

      const el = svg.current;
      if (!el) return;

      // Lets review tooling step through this animation frame by frame.
      if (process.env.NODE_ENV !== "production") {
        Object.assign(el, { timeline });
      }

      const calm =
        still ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (calm) timeline.pause().time(0);

      // Only play while visible: eight loops at once is a lot to ask.
      const watcher = new IntersectionObserver(([entry]) => {
        if (!calm) timeline.paused(!entry.isIntersecting);
      });
      watcher.observe(el);
      return () => watcher.disconnect();
    },
    { dependencies: [variant, offset, still] },
  );

  const clipId = `band-${variant.id}`;

  return (
    <svg
      ref={svg}
      className={`winwin-logo ${className ?? ""}`}
      viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
      overflow="visible"
      role="img"
      aria-label={`Win Win, variant: ${variant.title}`}
      data-variant={variant.id}
    >
      {variant.band !== undefined && (
        <clipPath id={clipId}>
          <rect
            x={0}
            y={CENTER_Y - variant.band}
            width={VIEW.width}
            height={variant.band * 2}
          />
        </clipPath>
      )}
      <g ref={leftWord} transform={leftWordAt(first)}>
        <WinLeft aria-hidden />
      </g>
      <g ref={rightWord} transform={rightWordAt(first)}>
        <WinRight aria-hidden />
      </g>
      <g clipPath={variant.band !== undefined ? `url(#${clipId})` : undefined}>
        {first.blocks.map((block, index) => {
          const attributes = blockAttributes(block, offset);
          return (
            <g
              key={index}
              ref={(el) => {
                holders.current[index] = el;
              }}
              transform={attributes.transform}
              opacity={attributes.opacity}
            >
              {block.path ? (
                <path
                  ref={(el) => {
                    shapes.current[index] = el;
                  }}
                  d={block.path}
                  transform={attributes.fit}
                  fill="currentColor"
                  fillRule="evenodd"
                  // A stroke in the same colour rounds the corners off, the
                  // way the logo's letters are rounded.
                  stroke="currentColor"
                  strokeWidth={5}
                  strokeLinejoin="round"
                />
              ) : (
                <rect
                  ref={(el) => {
                    shapes.current[index] = el;
                  }}
                  {...attributes.rect}
                  rx={BLOCK_RADIUS}
                  fill="currentColor"
                />
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}
