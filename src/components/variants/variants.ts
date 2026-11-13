import { STATES, wordDistance } from "../winwin-logo/geometry";
import { BURST, FLOW, REEL, SPIN } from "../winwin-logo/motion";
import { BEAT } from "../winwin-logo/timeline";
import { COMMENT, EYE, HEART, SAVE, SHARE } from "./icons";
import {
  DIAMOND,
  HOME_DISTANCE,
  apart,
  block,
  type Variant,
} from "./scene";

/**
 * Eight ways of playing with "WIN, something, WIN", held to the same rules as
 * the main logo animation:
 *
 * - each is a loop with no beginning or end, and no long rests;
 * - every move starts and ends on a count (`BEAT`, a quarter of a second);
 * - accents wind up and overshoot (BURST), everything else flows (FLOW);
 * - the words are solid objects that move clearly or not at all.
 *
 * Times are counts from the start of the loop; sizes are in the logo's own
 * units, where a letter is 106.84 tall.
 */

/** A number of counts, in seconds. */
const counts = (n: number) => n * BEAT;

/**
 * Where to place a move that follows straight on from the one added before
 * it. Without this a move lands at the very end of everything added so far.
 */
const THEN = ">";

// 1. Slash -------------------------------------------------------------------

const SLASH = { w: 20, h: 112, rot: 20 };
const SLASH_DISTANCE = 97;

const slash: Variant = {
  id: "slash",
  title: "Slash",
  note: "Win/win. De schuine streep begint te tollen, wordt onderweg dikker en landt als ruit.",
  create: () => ({
    words: apart(SLASH_DISTANCE),
    blocks: [block(SLASH)],
  }),
  build: (scene, timeline) => {
    const [bar] = scene.blocks;
    // Two full turns and a bit, ending on the diamond's point. The words
    // make room first, and the bar fattens up as it gathers speed.
    timeline.to(
      scene.words,
      { ...apart(HOME_DISTANCE), duration: counts(2), ease: FLOW },
      counts(2),
    );
    timeline.to(bar, { rot: 765, duration: counts(5), ease: SPIN }, counts(2));
    timeline.to(
      bar,
      { w: DIAMOND, h: DIAMOND, duration: counts(2), ease: FLOW },
      counts(2) + 0.06,
    );
    timeline.set(bar, { rot: 45 }, counts(7));
    // Accent: the diamond tips over and stretches into the slash again.
    timeline.to(bar, { ...SLASH, duration: counts(3), ease: BURST }, counts(9));
    timeline.to(
      scene.words,
      { ...apart(SLASH_DISTANCE), duration: counts(3), ease: BURST },
      counts(9),
    );
  },
};

// 2. Back and forth ----------------------------------------------------------

const RALLY = {
  /** How far each word stands from the middle. */
  court: 150,
  /** How far the diamond travels before its point meets a word. */
  reach: 100,
  /** How far a word is knocked back. */
  knock: 24,
  /** Counts from one side to the other. */
  crossing: counts(3),
};

const rally: Variant = {
  id: "rally",
  title: "Heen en weer",
  note: "De ruit rolt van woord naar woord, deukt in bij elke tik en stoot de woorden om de beurt aan.",
  centred: true,
  // The loop starts at the moment the diamond hits the right-hand word.
  create: () => ({
    words: apart(RALLY.court * 2),
    blocks: [block({ x: RALLY.reach, rot: 135 })],
  }),
  build: (scene, timeline) => {
    const [ball] = scene.blocks;
    const { court, reach, knock, crossing } = RALLY;

    const hit = (side: "left" | "right", at: number) => {
      // The word is knocked back and comes home in two counts.
      timeline.to(
        scene.words,
        { [side]: court + knock, duration: 0.14, ease: "power2.out" },
        at,
      );
      timeline.to(
        scene.words,
        { [side]: court, duration: counts(2) - 0.14, ease: FLOW },
        at + 0.14,
      );
      // The diamond is soft: it dents against the word and springs back.
      timeline.fromTo(
        ball,
        { sx: 0.8 },
        { sx: 1, duration: counts(1), ease: "power2.out" },
        at,
      );
    };

    // Rolling: half a turn per crossing, in the direction of travel.
    hit("right", 0);
    timeline.to(
      ball,
      { x: -reach, rot: -45, duration: crossing, ease: "none" },
      0,
    );
    hit("left", crossing);
    timeline.to(
      ball,
      { x: reach, rot: 135, duration: crossing, ease: "none" },
      crossing,
    );
  },
};

// 3. Match -------------------------------------------------------------------

const PAIR = { w: 36, h: 36, rot: 0 };
const PAIR_AT = 78;
const PAIR_DISTANCE = 250;

const match: Variant = {
  id: "match",
  title: "Match",
  note: "Twee blokjes, van elke kant één, schieten op elkaar af en worden samen de ruit.",
  create: () => ({
    words: apart(PAIR_DISTANCE),
    blocks: [block({ ...PAIR, x: -PAIR_AT }), block({ ...PAIR, x: PAIR_AT })],
  }),
  build: (scene, timeline) => {
    const [one, other] = scene.blocks;
    const meet = counts(3);
    const split = counts(8);

    timeline.to(
      [one, other],
      { x: 0, duration: counts(2), ease: "power3.in" },
      counts(1),
    );
    // From here on there is one block: the other sits exactly behind it.
    timeline.set(other, { alpha: 0 }, meet);
    timeline.to(
      one,
      {
        w: DIAMOND,
        h: DIAMOND,
        rot: 135,
        duration: counts(3),
        ease: "back.out(2.2)",
      },
      meet,
    );
    timeline.to(
      scene.words,
      { ...apart(HOME_DISTANCE), duration: counts(2), ease: FLOW },
      meet - 0.05,
    );
    timeline.set(one, { rot: 45 }, meet + counts(3));

    // Accent: and apart again.
    timeline.set(other, { alpha: 1, w: DIAMOND, h: DIAMOND, rot: 45 }, split);
    timeline.to(
      one,
      { ...PAIR, x: -PAIR_AT, duration: counts(3), ease: BURST },
      split,
    );
    timeline.to(
      other,
      { ...PAIR, x: PAIR_AT, duration: counts(3), ease: BURST },
      split,
    );
    timeline.to(
      scene.words,
      { ...apart(PAIR_DISTANCE), duration: counts(3), ease: BURST },
      split,
    );
    timeline.to({}, { duration: 0 }, counts(12));
  },
};

// 4. Jackpot -----------------------------------------------------------------

/** Size of the signs on the reel: a little under the height of the letters. */
const SIGN = 96;

/** What is on the reel, in the order it comes past. The logo is the prize. */
const SYMBOLS: { path?: string }[] = [
  {},
  { path: HEART },
  { path: COMMENT },
  { path: EYE },
  { path: SHARE },
  { path: SAVE },
];
/** Distance between two symbols on the reel. */
const PITCH = 180;
const REEL_LENGTH = SYMBOLS.length * PITCH;

/** The words step back while the reel runs, and close in on what it lands on. */
const REEL_RUNNING = 204;
const REEL_STOPPED = 156;

const jackpot: Variant = {
  id: "jackpot",
  title: "Jackpot",
  note: "Het midden is de rol van een fruitautomaat: likes, reacties, views, shares en saves draaien voorbij, tot het logo valt.",
  band: 62,
  create: () => ({
    words: apart(HOME_DISTANCE),
    blocks: SYMBOLS.map(({ path }, index) =>
      path
        ? block({ path, w: SIGN, h: SIGN, rot: 0, y: index * PITCH })
        : block({ y: index * PITCH }),
    ),
  }),
  build: (scene, timeline) => {
    const reel = { travelled: 0 };

    // Four pulls of five counts each: likes, comments, views, and then the
    // logo. Per pull: the words step back, the reel runs three counts, and
    // the words close in on what it stopped at.
    const pulls = [
      { symbol: 1, turns: 1 },
      { symbol: 2, turns: 2 },
      { symbol: 3, turns: 3 },
      { symbol: 0, turns: 4 },
    ];
    let at = counts(1);
    for (const pull of pulls) {
      const stop = pull.symbol * PITCH + pull.turns * REEL_LENGTH;
      const home = pull.symbol === 0;
      timeline.to(
        scene.words,
        { ...apart(REEL_RUNNING), duration: counts(2), ease: BURST },
        at,
      );
      timeline.to(
        reel,
        { travelled: stop, duration: counts(3), ease: REEL },
        at,
      );
      timeline.to(
        scene.words,
        {
          ...apart(home ? HOME_DISTANCE : REEL_STOPPED),
          duration: counts(2),
          ease: FLOW,
        },
        at + counts(2),
      );
      at += counts(5);
    }
    timeline.to({}, { duration: 0 }, at);

    // Place every symbol on the reel; it runs upwards and wraps round.
    return () => {
      scene.blocks.forEach((symbol, index) => {
        const along = index * PITCH - reel.travelled;
        const wrapped =
          ((((along + REEL_LENGTH / 2) % REEL_LENGTH) + REEL_LENGTH) %
            REEL_LENGTH) -
          REEL_LENGTH / 2;
        symbol.y = wrapped;
      });
    };
  },
};

// 5. Reach -------------------------------------------------------------------

const BAR = { w: 22, h: 106, rot: 0 };
/** Distance from one bar to the next. */
const BAR_PITCH = 34;
const BAR_GAP = 26;
const barsDistance = (count: number) =>
  BAR.w + (count - 1) * BAR_PITCH + 2 * BAR_GAP;

const reach: Variant = {
  id: "reach",
  title: "Bereik",
  note: "Eén balk wordt er drie, dan vijf. Elke keer duwt het de woorden verder uit elkaar.",
  create: () => ({
    words: apart(HOME_DISTANCE),
    blocks: [
      block(),
      block({ ...BAR, alpha: 0 }),
      block({ ...BAR, alpha: 0 }),
      block({ ...BAR, alpha: 0 }),
      block({ ...BAR, alpha: 0 }),
    ],
  }),
  build: (scene, timeline) => {
    const [middle, innerLeft, innerRight, outerLeft, outerRight] = scene.blocks;
    const sides = [innerLeft, innerRight, outerLeft, outerRight];
    const wave = { height: 0, phase: 0 };
    const words = (bars: number, at: number, length: number, ease = BURST) =>
      timeline.to(
        scene.words,
        { ...apart(barsDistance(bars)), duration: length, ease },
        at,
      );

    // Accent: the diamond stands up straight as a single bar.
    timeline.to(middle, { ...BAR, duration: counts(3), ease: BURST }, counts(1));
    words(1, counts(1), counts(3));

    // One becomes three: two more slide out from behind it.
    timeline.set([innerLeft, innerRight], { alpha: 1 }, counts(4));
    timeline.to(
      innerLeft,
      { x: -BAR_PITCH, duration: counts(2), ease: FLOW },
      counts(4),
    );
    timeline.to(
      innerRight,
      { x: BAR_PITCH, duration: counts(2), ease: FLOW },
      counts(4),
    );
    words(3, counts(4), counts(2), FLOW);

    // Accent: three become five.
    timeline.set(outerLeft, { alpha: 1, x: -BAR_PITCH }, counts(6));
    timeline.set(outerRight, { alpha: 1, x: BAR_PITCH }, counts(6));
    timeline.to(
      outerLeft,
      { x: -2 * BAR_PITCH, duration: counts(3), ease: BURST },
      counts(6),
    );
    timeline.to(
      outerRight,
      { x: 2 * BAR_PITCH, duration: counts(3), ease: BURST },
      counts(6),
    );
    words(5, counts(6), counts(3));

    // A wave runs through the bars while they are out.
    timeline.to(wave, { height: 1, duration: counts(2), ease: FLOW }, counts(4));
    timeline.to(
      wave,
      { phase: Math.PI * 6, duration: counts(10), ease: "none" },
      counts(4),
    );
    timeline.to(wave, { height: 0, duration: counts(2), ease: FLOW }, counts(12));

    // Everything folds back into the middle and pops into the diamond.
    const fold = counts(14);
    timeline.to(sides, { x: 0, duration: counts(1), ease: "power2.in" }, fold);
    timeline.set(sides, { alpha: 0 }, fold + counts(1));
    timeline.to(
      middle,
      {
        w: DIAMOND,
        h: DIAMOND,
        rot: 135,
        duration: counts(3),
        ease: "back.out(2)",
      },
      fold + counts(1),
    );
    timeline.to(
      scene.words,
      { ...apart(HOME_DISTANCE), duration: counts(3), ease: FLOW },
      fold,
    );
    timeline.set(middle, { rot: 45 }, fold + counts(4));
    timeline.to({}, { duration: 0 }, counts(19));

    return () => {
      if (wave.height < 0.001) return;
      for (const bar of scene.blocks) {
        const place = bar.x / BAR_PITCH;
        bar.h = BAR.h + wave.height * 46 * Math.sin(wave.phase - 0.9 * place);
      }
    };
  },
};

// 6. Drop --------------------------------------------------------------------

const TOGETHER = 60;
/** Far enough up and down to be out of sight. */
const ABOVE = -330;
const BELOW = 330;

const drop: Variant = {
  id: "drop",
  title: "Val",
  note: "De ruit valt van boven tussen de woorden, wrikt ze uit elkaar en stuitert na.",
  centred: true,
  create: () => ({
    words: apart(TOGETHER),
    blocks: [block({ y: ABOVE })],
  }),
  build: (scene, timeline) => {
    const [stone] = scene.blocks;
    const fall = counts(1);
    const land = fall + counts(2);

    timeline.to(stone, { y: 0, duration: counts(2), ease: "power2.in" }, fall);
    // The words give way a few frames before the point would touch them.
    timeline.to(
      scene.words,
      { ...apart(HOME_DISTANCE), duration: 0.6, ease: "back.out(2)" },
      fall + 0.39,
    );
    timeline
      .to(stone, { y: -34, duration: 0.17, ease: "power2.out" }, land)
      .to(stone, { y: 0, duration: 0.17, ease: "power2.in" }, THEN)
      .to(stone, { y: -9, duration: 0.08, ease: "power2.out" }, THEN)
      .to(stone, { y: 0, duration: 0.08, ease: "power2.in" }, THEN);

    // A little hop, and it drops out of the bottom; the words close behind it.
    const leave = counts(7);
    timeline
      .to(stone, { y: -18, duration: 0.15, ease: "power2.out" }, leave)
      .to(stone, { y: BELOW, duration: counts(2), ease: "power2.in" }, THEN);
    timeline.to(
      scene.words,
      { ...apart(TOGETHER), duration: counts(2), ease: FLOW },
      leave + 0.45,
    );
    timeline.set(stone, { y: ABOVE }, counts(11));
    timeline.to({}, { duration: 0 }, counts(12));
  },
};

// 7. Tip over ----------------------------------------------------------------

/** The logo's own landscape and portrait: one is the other on its side, resized. */
const LYING = STATES.landscape;
const STANDING = STATES.portrait;

const tip: Variant = {
  id: "tip",
  title: "Kantel",
  note: "Het blok springt op en landt op zijn andere kant: liggend wordt staand en weer terug.",
  create: () => ({
    words: apart(wordDistance(LYING)),
    blocks: [block({ w: LYING.w, h: LYING.h, rot: 0 })],
  }),
  build: (scene, timeline) => {
    const [brick] = scene.blocks;
    const hop = (at: number) =>
      timeline
        .to(brick, { y: -46, duration: 0.3, ease: "power2.out" }, at + 0.12)
        .to(brick, { y: 0, duration: 0.3, ease: "power2.in" }, THEN);

    // Accent, lying to standing: a quarter turn, taking on the portrait's
    // size on the way. The words wait for the corners to swing clear.
    const up = counts(1);
    timeline.to(
      brick,
      { rot: 90, w: STANDING.h, h: STANDING.w, duration: counts(3), ease: BURST },
      up,
    );
    hop(up);
    timeline.to(
      scene.words,
      { ...apart(wordDistance(STANDING)), duration: counts(2), ease: FLOW },
      up + 0.33,
    );
    // The same block, described upright again.
    timeline.set(brick, { rot: 0, w: STANDING.w, h: STANDING.h }, up + counts(3));

    // Accent, standing to lying: the words make room first.
    const down = counts(6);
    timeline.to(
      scene.words,
      { ...apart(wordDistance(LYING)), duration: counts(2), ease: FLOW },
      down,
    );
    timeline.to(
      brick,
      { rot: 90, w: LYING.h, h: LYING.w, duration: counts(3), ease: BURST },
      down + 0.1,
    );
    hop(down + 0.1);
    timeline.set(brick, { rot: 0, w: LYING.w, h: LYING.h }, counts(10));
    timeline.to({}, { duration: 0 }, counts(10));
  },
};

// 8. Toss --------------------------------------------------------------------

const HUDDLED = 84;

const toss: Variant = {
  id: "toss",
  title: "Tos",
  note: "De ruit wordt opgegooid als een munt en tuimelt rond. Kop of munt: allebei winst.",
  create: () => ({
    words: apart(HOME_DISTANCE),
    blocks: [block()],
  }),
  build: (scene, timeline) => {
    const [coin] = scene.blocks;
    const flip = { turned: 0 };
    const up = counts(1);
    const top = up + counts(2);
    const down = top + counts(2);

    timeline.to(coin, { y: -120, duration: counts(2), ease: "power2.out" }, up);
    timeline.to(coin, { y: 0, duration: counts(2), ease: "power2.in" }, top);
    // One and a half flips; a diamond looks the same from both sides.
    timeline.to(
      flip,
      { turned: Math.PI * 3, duration: counts(4), ease: "none" },
      up,
    );
    timeline.set(flip, { turned: 0 }, down + 0.02);

    // The words lean in under it, and are pushed back out as it comes down.
    timeline.to(
      scene.words,
      { ...apart(HUDDLED), duration: counts(2), ease: FLOW },
      up + 0.15,
    );
    timeline.to(
      scene.words,
      { ...apart(HOME_DISTANCE), duration: 0.55, ease: "back.out(2)" },
      top + 0.2,
    );
    timeline
      .to(coin, { y: -14, duration: 0.1, ease: "power2.out" }, down)
      .to(coin, { y: 0, duration: 0.1, ease: "power2.in" }, THEN);
    timeline.to({}, { duration: 0 }, counts(8));

    return () => {
      coin.sy = Math.cos(flip.turned);
    };
  },
};

export const VARIANTS: Variant[] = [
  slash,
  rally,
  match,
  jackpot,
  reach,
  drop,
  tip,
  toss,
];
