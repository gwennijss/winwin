"use client";

import { useCallback, type ComponentType } from "react";
import { StatBlocks, STATS_STILL, type Pair } from "@/components/stats/StatBlocks";
import { Fade, Lines, Unfold, useStill } from "@/deck/motion";
import { Block, Corner, DARK, DEEP, Field, FW, LabelDivider, LIGHT, LILAC, Photo, Picture, Reel, Stage, Tag, useMedia, VIOLET } from "../parts";
import { Running } from "./site";

/** The label the applications carry: a service and a client, as on the case page. Both are stand-ins. */
function CampaignTag({ size }: { size: number }) {
  return (
    <Tag size={size}>
      Boost
      <LabelDivider />
      De Kuyper
    </Tag>
  );
}

/* ───────────────────────────── Posts ───────────────────────────── */

/** The animated posts, 4:5, each named after what it does, and how long one round takes. */
const POSTS: Record<string, { name: string; seconds: number }> = {
  cube: { name: "Kubus", seconds: 20 },
  canvas: { name: "Canvas", seconds: 15 },
  billboard: { name: "Billboard", seconds: 11 },
  split: { name: "Split", seconds: 10 },
  reel: { name: "Rol", seconds: 10 },
};

/** A page darker than the brand's dark, so that a post on that dark keeps its edge. */
const BLACK = "#0D0D0E";

/** One post, playing. In the PDF and the overview it is its still; without the file it is a plain field. */
function PostFilm({ file }: { file: string }) {
  const still = useStill();
  const { posts } = useMedia();
  if (!posts?.includes(file)) return <div className="absolute inset-0" style={{ background: DEEP }} />;
  const poster = `/media/posts/${file}.jpg`;
  if (still) {
    // eslint-disable-next-line @next/next/no-img-element -- a fixed still, sized by the slide
    return <img src={poster} alt="" draggable={false} className="absolute inset-0 size-full object-cover" />;
  }
  return <video src={`/media/posts/${file}.mp4`} poster={poster} muted loop autoPlay playsInline className="absolute inset-0 size-full object-cover" />;
}

/** The photo that goes with a post: a moment from the campaign, cut to the same 4:5, with the label on it. Each post has its own, from another creator's video. */
function PostPhoto({ file }: { file: string }) {
  const { posts, photos } = useMedia();
  return (
    <>
      {photos?.includes(`post-${file}`) ? (
        <Photo name={`post-${file}`} />
      ) : posts?.includes(file) ? (
        // eslint-disable-next-line @next/next/no-img-element -- a fixed still, sized by the slide
        <img src={`/media/posts/${file}-foto.jpg`} alt="" draggable={false} className="absolute inset-0 size-full object-cover" />
      ) : (
        <Picture live={false} />
      )}
      <div className="absolute" style={{ left: 26, bottom: 26 }}>
        <Tag size={19}>De Kuyper</Tag>
      </div>
    </>
  );
}

/**
 * One post on a black page, as large as the page takes, and beside it a
 * photo in the same format: the brand moving and the brand standing still.
 * Nothing else but their names. The five posts open the chapter, one after
 * the other; in some the post is on the left, in others on the right.
 */
const post = (file: string, filmOnRight = false) => {
  const w = 688;
  const h = w * 1.25;
  const gap = 72;
  const x = (FW - 2 * w - gap) / 2;
  const top = 108;
  function Post() {
    const film = (
      <>
        <Field from="bottom" at={1} style={{ position: "relative", width: w, height: h, background: "#111" }}>
          <PostFilm file={file} />
        </Field>
        <Fade at={4.5} className="t-sign flex justify-between" style={{ marginTop: 20 }}>
          <span>{POSTS[file].name}</span>
          <span className="tabular mute">4:5 · {POSTS[file].seconds} s</span>
        </Fade>
      </>
    );
    const photo = (
      <>
        <Field from="bottom" at={2.5} style={{ position: "relative", width: w, height: h, background: "#111" }}>
          <PostPhoto file={file} />
        </Field>
        <Fade at={6} className="t-sign flex justify-between" style={{ marginTop: 20 }}>
          <span>Foto</span>
          <span className="tabular mute">4:5</span>
        </Fade>
      </>
    );
    return (
      <Stage tone="dark" style={{ background: BLACK }}>
        <Corner />
        <div className="absolute" style={{ left: x, top, width: w }}>
          {filmOnRight ? photo : film}
        </div>
        <div className="absolute" style={{ left: x + w + gap, top, width: w }}>
          {filmOnRight ? film : photo}
        </div>
      </Stage>
    );
  }
  return Post;
};

/* ───────────────────────────── Eén campagne, elk formaat ───────────────────────────── */

const FRAMES: { name: string; where: string; w: number; h: number; n: number; live?: boolean; position?: string }[] = [
  { name: "9:16", where: "Reels · TikTok · Shorts", w: 342, h: 608, n: 4, live: true },
  { name: "4:5", where: "De post in de feed", w: 396, h: 495, n: 7 },
  { name: "1:1", where: "Instagram · LinkedIn", w: 378, h: 378, n: 3 },
  { name: "16:9", where: "YouTube", w: 540, h: 304, n: 5, position: "50% 42%" },
];

/** One campaign in the four formats, standing on one line, with the label in the same corner of each. */
function Formaten() {
  const gap = (FW - 160 - FRAMES.reduce((sum, f) => sum + f.w, 0)) / (FRAMES.length - 1);
  const lefts = FRAMES.map((_, i) => 80 + FRAMES.slice(0, i).reduce((sum, f) => sum + f.w + gap, 0));
  const base = 900;
  return (
    <Stage tone="dark">
      <Corner />
      <Lines at={0.5} className="t-statement absolute" style={{ left: 80, top: 132 }} lines={["Hetzelfde label, in dezelfde hoek, op elk kanaal."]} />
      {FRAMES.map((f, i) => (
        <div key={f.name} className="absolute" style={{ left: lefts[i], top: base - f.h, width: f.w }}>
          <Field from="bottom" at={1.5 + i * 0.5} style={{ position: "relative", width: f.w, height: f.h, background: "#111" }}>
            <Picture n={f.n} live={!!f.live} position={f.position} />
            <div className="absolute" style={{ left: "5.5%", bottom: "7%" }}>
              <CampaignTag size={(Math.min(f.w, f.h) / 27) * 1.35} />
            </div>
          </Field>
          <Fade at={3.5 + i * 0.5} className="flex items-baseline" style={{ marginTop: 22, gap: 14 }}>
            <span className="f-label" style={{ fontSize: 36, lineHeight: "40px", color: LILAC }}>
              {f.name}
            </span>
            <span className="t-sign mute">{f.where}</span>
          </Fade>
        </div>
      ))}
    </Stage>
  );
}

/* ───────────────────────────── LinkedIn ───────────────────────────── */

const PAIRS: [Pair, Pair] = [
  [
    { value: "4,1M", caption: "weergaven" },
    { value: "74%", caption: "uitgekeken" },
  ],
  [
    { value: "12", caption: "creators" },
    { value: "+38%", caption: "meer bereik" },
  ],
];

const BANNER = 300;

/** The company page with the running logo as its banner, and a case as a post. */
function LinkedIn() {
  const still = useStill();
  const hold = useCallback(
    (timeline: gsap.core.Timeline | null) => {
      if (still) timeline?.pause().time(STATS_STILL);
    },
    [still],
  );
  const cardW = 940;
  const postW = 500;
  return (
    <Stage tone="light">
      <Corner />
      {/* The page. */}
      <Unfold at={1} className="ww--dark absolute overflow-hidden" style={{ left: 80, top: 150, width: cardW, height: 800, background: DARK, color: LIGHT, borderRadius: 6 }}>
        {/* The banner: the logo's words run through it, with the work in the block. */}
        <div className="ww--violet absolute overflow-hidden" style={{ left: 0, top: 0, width: cardW, height: BANNER, background: VIOLET, color: LIGHT }}>
          <Running letter={132} height={BANNER} speed={34} start={150} />
        </div>
        <div className="absolute flex items-center justify-center" style={{ left: 44, top: 222, width: 156, height: 156, background: VIOLET, color: DEEP, border: `6px solid ${DARK}`, boxSizing: "content-box" }}>
          <Block unit={0.95} />
        </div>
        <div className="absolute" style={{ left: 50, top: 420, right: 50 }}>
          <div style={{ fontSize: 44, lineHeight: "50px", fontWeight: 600 }}>Win Win</div>
          <div className="t-body soft" style={{ marginTop: 8 }}>
            Influencer agency. Elk kanaal, elk formaat.
          </div>
          <div className="t-sign mute" style={{ marginTop: 10, fontWeight: 400 }}>
            Marketingdiensten
          </div>
          <div className="flex" style={{ gap: 14, marginTop: 34 }}>
            <span className="flex items-center" style={{ height: 56, padding: "0 30px", background: VIOLET, color: LIGHT, fontSize: 22, fontWeight: 600, gap: 12 }}>
              <Block unit={0.2} />
              Volgen
            </span>
            <span className="flex items-center" style={{ height: 56, padding: "0 30px", border: "1px solid rgb(243 246 255 / 0.3)", fontSize: 22, fontWeight: 600 }}>
              Bericht
            </span>
          </div>
        </div>
        <div className="absolute flex" style={{ left: 50, bottom: 34, gap: 40, fontSize: 22, fontWeight: 600 }}>
          <span style={{ borderBottom: `3px solid ${LILAC}`, paddingBottom: 10 }}>Home</span>
          <span className="mute">Over ons</span>
          <span className="mute">Berichten</span>
          <span className="mute">Vacatures</span>
        </div>
      </Unfold>
      {/* A post. */}
      <Unfold at={2} className="ww--dark absolute overflow-hidden" style={{ left: 80 + cardW + 60, top: 60, width: postW + 80, height: 960, background: DARK, color: LIGHT, borderRadius: 6 }}>
        <div className="absolute flex items-center" style={{ left: 40, top: 30, gap: 16 }}>
          <div className="flex items-center justify-center" style={{ width: 52, height: 52, background: VIOLET, color: DEEP }}>
            <Block unit={0.3} />
          </div>
          <div>
            <div style={{ fontSize: 20, lineHeight: "26px", fontWeight: 600 }}>Win Win</div>
            <div className="mute" style={{ fontSize: 16, lineHeight: "20px" }}>
              2 d
            </div>
          </div>
        </div>
        <div className="absolute" style={{ left: 40, top: 96 }}>
          <Reel width={postW} n={4}>
            <StatBlocks client="De Kuyper" pairs={PAIRS} onTimeline={hold} />
          </Reel>
        </div>
      </Unfold>
    </Stage>
  );
}

export const slides: Record<string, ComponentType> = {
  "toep-post-cube": post("cube"),
  "toep-post-canvas": post("canvas", true),
  "toep-post-billboard": post("billboard"),
  "toep-post-split": post("split", true),
  "toep-post-reel": post("reel"),
  // Shown in the chapter on what goes over a video, after the pages on the label.
  "beeld-formaten": Formaten,
  "toep-linkedin": LinkedIn,
};
