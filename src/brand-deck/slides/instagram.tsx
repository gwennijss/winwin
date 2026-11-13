"use client";

import { useRef, type ComponentType, type CSSProperties, type ReactNode } from "react";
import { motion, useAnimationFrame } from "motion/react";
import type { StateName } from "@/components/winwin-logo/geometry";
import { counts, EASE, Fade, flow, useStill } from "@/deck/motion";
import { Block, Corner, DARK, DEEP, Field, FW, LabelDivider, LIGHT, LILAC, LiveTag, LogoStill, PH, Photo, Picture, Stage, Tag, useMedia, VIOLET } from "../parts";

/**
 * Instagram: the profile as it is on a phone, in the app's dark mode. The
 * head of the profile, the highlights with the five shapes of the block as
 * their covers, and the grid: a picture of the work and a post of Win Win's
 * own in turn. Left alone the profile scrolls down to the grid and back.
 */

const WHITE = "#F3F6FF";
const SCREEN = "#0C0C0D";
const GREY = "rgb(243 246 255 / 0.6)";
const BUTTON = "#28282B";

/** The phone: its left and top on the page, the width of its screen, and the frame around that. */
const PHONE = { left: 180, top: 100, frame: 12 };
const SW = 576;
/** The grid: three posts across, 4:5, a hair apart. */
const GAP = 3;
const TW = (SW - 2 * GAP) / 3;
const TH = Math.round(TW * 1.25);
/** The bars that stay, and the head of the profile that scrolls away under them. */
const STATUS = 50;
const BAR = 54;
const HEAD = 462;
const TABS = 60;

/* ───────────────────────────── The app's own signs ───────────────────────────── */

const Icon = ({ children, size = 30, style }: { children: ReactNode; size?: number; style?: CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden>
    {children}
  </svg>
);

const Plus = () => (
  <Icon>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <path d="M12 8v8M8 12h8" />
  </Icon>
);
const Menu = () => (
  <Icon>
    <path d="M4 6.5h16M4 12h16M4 17.5h16" />
  </Icon>
);
const GridSign = () => (
  <Icon>
    <rect x="3" y="3" width="18" height="18" rx="1.5" />
    <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
  </Icon>
);
const ReelSign = ({ size }: { size?: number }) => (
  <Icon size={size}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <path d="M3 8.5h18M8 3l3 5.5M14 3l3 5.5" />
    <path d="M10.5 12.2v4.6l4-2.3z" fill="currentColor" />
  </Icon>
);
const TaggedSign = () => (
  <Icon>
    <path d="M12 2.5l2.2 2.2H19a2 2 0 0 1 2 2V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6.7a2 2 0 0 1 2-2h4.8z" />
    <circle cx="12" cy="11" r="2.4" />
    <path d="M7.5 18.5c.6-2.2 2.3-3.4 4.5-3.4s3.9 1.2 4.5 3.4" />
  </Icon>
);
/** Two posts on top of each other: a post with more than one picture. */
const Stacked = () => (
  <svg width={17} height={17} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <rect x="3" y="7" width="14" height="14" rx="3" />
    <path d="M8 3h9a4 4 0 0 1 4 4v9a3 3 0 0 1-2 2.8V7a2 2 0 0 0-2-2H5.2A3 3 0 0 1 8 3z" />
  </svg>
);

/* ───────────────────────────── The posts ───────────────────────────── */

/** One post in the grid. */
function Post({ ground = "#111", ink = WHITE, sign, children }: { ground?: string; ink?: string; sign?: ReactNode; children: ReactNode }) {
  return (
    <div className="relative overflow-hidden" style={{ width: TW, height: TH, background: ground, color: ink }}>
      {children}
      {sign && (
        <div className="absolute" style={{ right: 9, top: 9 }}>
          {sign}
        </div>
      )}
    </div>
  );
}

/**
 * A picture of the work, with the label on it. Each one is a frame from
 * another creator's video, cut to the post's 4:5.
 */
function Shot({ name, n, tag, reel = false }: { name: string; n: number; tag?: ReactNode; reel?: boolean }) {
  return (
    <Post sign={reel ? <ReelSign size={19} /> : undefined}>
      <Photo name={name} n={n} />
      {tag && (
        <div className="absolute" style={{ left: 9, bottom: 9 }}>
          <Tag size={10.5}>{tag}</Tag>
        </div>
      )}
    </Post>
  );
}

/**
 * One of the animated posts from the pages before, as it stands in the
 * grid: a frame of it. Without the frame it is the post's own still, and
 * without that a plain field.
 */
function Animated({ name, ink = WHITE }: { name: string; ink?: string }) {
  const { photos, posts } = useMedia();
  const src = photos?.includes(`feed-${name}`) ? `/media/photos/feed-${name}.jpg` : posts?.includes(name) ? `/media/posts/${name}.jpg` : undefined;
  return (
    <Post ground={DEEP} ink={ink} sign={<ReelSign size={19} />}>
      {/* eslint-disable-next-line @next/next/no-img-element -- a fixed still, sized by the slide */}
      {src && <img src={src} alt="" draggable={false} className="absolute inset-0 size-full object-cover" />}
    </Post>
  );
}

/**
 * A result as a post, made the way the split post is made: the figure as
 * wide as the post, a picture of the work wedged under it, and what it
 * counts at the foot.
 */
function ResultPost() {
  return (
    <Post ground={LILAC} ink={DEEP}>
      <div className="absolute overflow-hidden" style={{ left: 58, top: 98, width: 74, height: 93, borderRadius: 2, background: "#111" }}>
        <Photo name="post-reel" n={2} />
      </div>
      <div className="f-label absolute" style={{ left: 9, top: 14, fontSize: 104, lineHeight: "92px", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
        4,1M
      </div>
      <div className="f-title absolute" style={{ left: 11, bottom: 9, fontSize: 30, lineHeight: "30px" }}>
        weergaven
      </div>
    </Post>
  );
}

/** What Win Win stands for, as the cover of a post with more than one page: two lines, the second in the soft tint. */
function ClaimPost() {
  return (
    <Post ground={DEEP} ink={WHITE} sign={<Stacked />}>
      <div className="f-title absolute" style={{ left: 11, top: 14, fontSize: 41, lineHeight: "38px", letterSpacing: "-0.012em" }}>
        Bereik
        <br />
        koop je.
        <br />
        <span style={{ color: LILAC }}>
          Aandacht
          <br />
          verdien je.
        </span>
      </div>
      <div className="absolute" style={{ left: 2, bottom: 6, color: WHITE }}>
        <LogoStill width={88} />
      </div>
    </Post>
  );
}

/**
 * The grid, newest first. Pictures of the work and posts of Win Win's own
 * take turns: every picture carries a label and comes from another campaign
 * video; between them stand the animated posts, a result and a claim.
 */
const POSTS: ReactNode[] = [
  <Shot key={0} name="feed-dekuyper" n={4} tag="De Kuyper" reel />,
  <Animated key={1} name="split" />,
  <Shot key={2} name="feed-creators" n={1} tag="Creators" />,
  <Animated key={3} name="canvas" />,
  <Shot key={4} name="feed-content" n={3} tag="Content" />,
  <ResultPost key={5} />,
  <Shot
    key={6}
    name="feed-boost"
    n={7}
    reel
    tag={
      <>
        Boost
        <LabelDivider />
        De Kuyper
      </>
    }
  />,
  <Animated key={7} name="cube" />,
  <Shot key={8} name="feed-los" n={5} />,
  <Animated key={9} name="reel" ink={DARK} />,
  <ClaimPost key={10} />,
  <Animated key={11} name="billboard" />,
];

/* ───────────────────────────── The head of the profile ───────────────────────────── */

const COUNTS = [
  ["86", "berichten"],
  ["12,4K", "volgers"],
  ["148", "volgend"],
];

/** The highlights: the five shapes of the block as their covers. */
const HIGHLIGHTS: { name: string; state: StateName; unit: number; ground: string; ink: string }[] = [
  { name: "Werk", state: "diamond", unit: 0.46, ground: VIOLET, ink: DEEP },
  { name: "Reels", state: "portrait", unit: 0.2, ground: DEEP, ink: LILAC },
  { name: "Cases", state: "square", unit: 0.3, ground: LILAC, ink: DEEP },
  { name: "Creators", state: "post", unit: 0.25, ground: LIGHT, ink: DARK },
  { name: "Over ons", state: "landscape", unit: 0.19, ground: "#2E2E31", ink: LILAC },
];

const pill: CSSProperties = { height: 44, borderRadius: 11, fontSize: 18, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" };

function Head() {
  return (
    <div style={{ height: HEAD, padding: "20px 22px 0" }}>
      <div className="flex items-center">
        {/* The picture, with the ring of a story that has not been seen yet. */}
        <div className="flex shrink-0 items-center justify-center rounded-full" style={{ width: 122, height: 122, background: `linear-gradient(135deg, ${LILAC}, ${VIOLET})` }}>
          <div className="flex items-center justify-center rounded-full" style={{ width: 112, height: 112, background: VIOLET, color: DEEP, border: `5px solid ${SCREEN}`, boxSizing: "border-box" }}>
            <Block unit={0.6} />
          </div>
        </div>
        <div className="flex flex-1 justify-around" style={{ marginLeft: 18 }}>
          {COUNTS.map(([value, what]) => (
            <div key={what} className="text-center">
              <div className="tabular" style={{ fontSize: 24, lineHeight: "30px", fontWeight: 700 }}>
                {value}
              </div>
              <div style={{ fontSize: 17, lineHeight: "22px" }}>{what}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 14, fontSize: 18, lineHeight: "24px" }}>
        <div style={{ fontWeight: 700 }}>Win Win</div>
        <div style={{ color: GREY }}>Marketingbureau</div>
        <div>Influencer agency. Elk kanaal, elk formaat.</div>
        <div>Het merk wint, de creator wint.</div>
      </div>
      <div className="flex" style={{ gap: 8, marginTop: 16 }}>
        <span className="flex-1" style={{ ...pill, background: VIOLET }}>
          Volgen
        </span>
        <span className="flex-1" style={{ ...pill, background: BUTTON }}>
          Bericht
        </span>
        <span className="flex-1" style={{ ...pill, background: BUTTON }}>
          Contact
        </span>
      </div>
      <div className="flex justify-between" style={{ marginTop: 22 }}>
        {HIGHLIGHTS.map((h) => (
          <div key={h.name} className="text-center" style={{ width: 96 }}>
            <div className="mx-auto flex items-center justify-center rounded-full" style={{ width: 88, height: 88, border: "1.5px solid rgb(243 246 255 / 0.28)" }}>
              <div className="flex items-center justify-center overflow-hidden rounded-full" style={{ width: 76, height: 76, background: h.ground, color: h.ink }}>
                <Block state={h.state} unit={h.unit} style={{ borderRadius: 2 }} />
              </div>
            </div>
            <div style={{ fontSize: 15, lineHeight: "20px", marginTop: 6 }}>{h.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────────── The phone ───────────────────────────── */

/** Seconds on the head of the profile, on the grid, and on the way between them. */
const ON_HEAD = 3.4;
const ON_GRID = 4.2;
const MOVE = 1.5;
/** How far it scrolls: until the tabs stand under the bar. */
const TRAVEL = HEAD;

function Phone() {
  const still = useStill();
  const page = useRef<HTMLDivElement>(null);

  useAnimationFrame((ms) => {
    if (still || !page.current) return;
    const t = (ms / 1000) % (ON_HEAD + ON_GRID + 2 * MOVE);
    const down = Math.min(1, Math.max(0, (t - ON_HEAD) / MOVE));
    const up = Math.min(1, Math.max(0, (t - ON_HEAD - MOVE - ON_GRID) / MOVE));
    page.current.style.transform = `translate3d(0, ${-TRAVEL * (flow(down) - flow(up))}px, 0)`;
  });

  const height = PH - PHONE.top + 60;
  return (
    <motion.div
      className="absolute"
      style={{ left: PHONE.left, top: PHONE.top, width: SW + 2 * PHONE.frame, height, padding: PHONE.frame, paddingBottom: 0, background: "#050506", borderRadius: "58px 58px 0 0", boxShadow: "inset 0 0 0 2px rgb(243 246 255 / 0.18)", fontFamily: '-apple-system, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif', color: WHITE, letterSpacing: "-0.01em" }}
      initial={still ? false : { y: 160, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: counts(1), duration: counts(5), ease: EASE }}
    >
      <div className="relative overflow-hidden" style={{ width: SW, height: height - PHONE.frame, background: SCREEN, borderRadius: "46px 46px 0 0" }}>
        {/* What scrolls. */}
        <div ref={page} className="absolute" style={{ left: 0, top: STATUS + BAR, width: SW, willChange: "transform" }}>
          <Head />
          <div className="flex" style={{ height: TABS, borderBottom: "1px solid rgb(243 246 255 / 0.12)" }}>
            {[<GridSign key="g" />, <ReelSign key="r" />, <TaggedSign key="t" />].map((sign, i) => (
              <div key={i} className="flex flex-1 items-center justify-center" style={{ opacity: i ? 0.5 : 1, borderBottom: i ? undefined : `2px solid ${WHITE}` }}>
                {sign}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3" style={{ gap: GAP, paddingTop: GAP }}>
            {POSTS}
          </div>
        </div>
        {/* What stays: the time, and the name of the account. */}
        <div className="absolute" style={{ left: 0, top: 0, width: SW, height: STATUS + BAR, background: SCREEN }}>
          <div className="absolute" style={{ left: 44, top: 17, fontSize: 20, lineHeight: "24px", fontWeight: 600 }}>
            9:41
          </div>
          <div className="absolute" style={{ left: (SW - 150) / 2, top: 12, width: 150, height: 36, borderRadius: 18, background: "#000" }} />
          <div className="absolute flex items-center" style={{ right: 40, top: 20, gap: 7 }}>
            <svg width={22} height={16} viewBox="0 0 22 16" fill={WHITE} aria-hidden>
              <rect x="0" y="11" width="4" height="5" rx="1" />
              <rect x="6" y="8" width="4" height="8" rx="1" />
              <rect x="12" y="4" width="4" height="12" rx="1" />
              <rect x="18" y="0" width="4" height="16" rx="1" />
            </svg>
            <svg width={32} height={16} viewBox="0 0 32 16" fill="none" aria-hidden>
              <rect x="0.75" y="0.75" width="27" height="14.5" rx="4.5" stroke={WHITE} strokeOpacity={0.5} strokeWidth={1.5} />
              <rect x="3" y="3" width="22.5" height="10" rx="2.5" fill={WHITE} />
              <rect x="29.5" y="5" width="2.5" height="6" rx="1.2" fill={WHITE} fillOpacity={0.5} />
            </svg>
          </div>
          <div className="absolute flex items-center" style={{ left: 22, right: 20, top: STATUS, height: BAR }}>
            <span style={{ fontSize: 27, lineHeight: "32px", fontWeight: 700, letterSpacing: "-0.02em" }}>winwin</span>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 6, marginTop: 4 }} aria-hidden>
              <path d="M6 9l6 6 6-6" />
            </svg>
            <span className="ml-auto flex items-center" style={{ gap: 22 }}>
              <Plus />
              <Menu />
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/** The reel beside the phone: the chosen frame of it when that is there, and the running footage otherwise. */
function Reel() {
  const { photos } = useMedia();
  return photos?.includes("may-sip") ? <Photo name="may-sip" position="50% 42%" /> : <Picture n={7} position="50% 35%" />;
}

/** The profile on a phone on the left, one post large on the right. */
function Instagram() {
  return (
    <Stage tone="dark">
      <Phone />
      <Field from="right" at={1} style={{ left: FW / 2, top: 0, width: FW / 2, height: PH, background: "#111" }}>
        <Reel />
        <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(rgb(20 20 21 / 0) 55%, rgb(20 20 21 / 0.72))" }} />
        <div className="absolute" style={{ left: 64, bottom: 150 }}>
          <LiveTag size={40}>De Kuyper</LiveTag>
        </div>
        <Fade at={5} className="t-sign absolute" style={{ left: 64, bottom: 76, color: WHITE, opacity: 0.85 }}>
          winwin · Reel
        </Fade>
      </Field>
      <Corner />
    </Stage>
  );
}

export const slides: Record<string, ComponentType> = {
  "toep-instagram": Instagram,
};
