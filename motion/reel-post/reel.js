import {
  BEAT,
  CAPTION,
  CLIPS,
  CLIP_SECONDS,
  FPS,
  JUMP_BEATS,
  REEL,
  SCENES,
  STEPS,
  WORDS,
  clipId,
} from "./config.js";

/* global gsap, CustomEase */
gsap.registerPlugin(CustomEase);

/**
 * A jump is the brand's signature move, BURST, as in the logo animation: a
 * short wind-up the wrong way, a fast release, a little too far, then a calm
 * settle. The reel covers nearly all of the distance in a third of the time.
 */
const JUMP = CustomEase.create(
  "winwin-burst",
  "M0,0 C0.09,0 0.14,-0.04 0.2,-0.04 0.3,-0.04 0.32,1.05 0.56,1.05 0.72,1.05 0.78,1 1,1",
);

/**
 * Drawing back and springing forward, over a jump and the settling after it:
 * back quickly as the reel lets go, forward again as it lands, a touch closer
 * than where it rests, and then still.
 */
const PULSE = CustomEase.create(
  "winwin-reel-pulse",
  "M0,0 C0.1,0 0.16,1 0.3,1 0.5,1 0.56,-0.14 0.74,-0.14 0.87,-0.14 0.92,0 1,0",
);

const N = CLIPS.length;
const TITLE_FONT = '"Trabat Condensed"';
const SVG = "http://www.w3.org/2000/svg";
/** Seconds of a clip that have already played when the reel lands on it. */
const LEAD = 0.3;
/** A clip the reel comes back to carries on this much further in. */
const VISIT_SHIFT = 1.0;
/** Videos kept ready either side of the one in the middle. */
const REACH = 2;

/** From the middle of one video to the middle of the next along the reel; set in `setUp`. */
let PITCH = 0;

const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const mod = (a, n) => ((a % n) + n) % n;

/* ---------------------------------------------------------------- timeline */

/**
 * The stops, worked out from the steps: which video the reel rests on, when
 * it gets there and when it sets off again. Positions count videos and are
 * not wrapped, so a jump is always a plain distance.
 */
const stops = [];
let clock = 0;
let place = 0;
for (const step of STEPS) {
  const leave = clock + step.hold * BEAT;
  stops.push({ at: place, arrive: clock, leave, jump: step.jump, land: leave + JUMP_BEATS * BEAT });
  clock = leave + JUMP_BEATS * BEAT;
  place += step.jump;
}
const LOOP = clock;
const TRAVEL = place;
if (mod(TRAVEL, N) !== 0) {
  throw new Error(`The jumps add up to ${TRAVEL}; they must add up to a multiple of ${N} clips.`);
}

/** Each visit a clip gets, in order, so a second visit can show a later moment. */
const visits = CLIPS.map(() => []);
for (const stop of stops) visits[mod(stop.at, N)].push(stop);

/** Where the reel is at time `t` within the loop, and what it is doing. */
function within(t) {
  const index = stops.findIndex((stop) => t < stop.land);
  const stop = stops[index === -1 ? stops.length - 1 : index];
  if (t < stop.leave) return { position: stop.at, from: stop.at, to: stop.at, share: 0 };
  const share = JUMP(clamp((t - stop.leave) / (JUMP_BEATS * BEAT)));
  return { position: stop.at + stop.jump * share, from: stop.at, to: stop.at + stop.jump, share };
}

/** The reel's position at any time, running on from loop to loop. */
const positionAt = (t) => Math.floor(t / LOOP) * TRAVEL + within(mod(t, LOOP)).position;

/**
 * How far everything has drawn back at time `t`: 1 is all the way, and a
 * little below 0 is closer than at rest. It goes with a jump and springs
 * forward again just after landing.
 */
function drawnBack(t) {
  const u = mod(t, LOOP);
  const jump = JUMP_BEATS * BEAT;
  const span = jump + REEL.settle;
  let most = 0;
  for (const stop of stops) {
    for (const since of [u - stop.leave, u - stop.leave + LOOP]) {
      if (since <= 0 || since >= span) continue;
      const pulse = PULSE(since / span);
      if (Math.abs(pulse) > Math.abs(most)) most = pulse;
    }
  }
  return most;
}

/** Seconds into clip `clip`'s footage at time `t`: it plays from when the reel lands on it. */
function clipTime(clip, t) {
  let best = null;
  visits[clip].forEach((stop, turn) => {
    // Time since arriving, the short way round the loop.
    const since = mod(t - stop.arrive + LOOP / 2, LOOP) - LOOP / 2;
    const away = since < 0 ? -since : Math.max(0, since - (stop.leave - stop.arrive));
    if (!best || away < best.away) best = { away, since, turn };
  });
  const time = best ? LEAD + best.turn * VISIT_SHIFT + best.since : LEAD;
  return clamp(time, 0, CLIP_SECONDS - 1 / FPS);
}

/* --------------------------------------------------------------------- DOM */

const stage = document.getElementById("stage");
const reel = document.getElementById("reel");
const blurAmount = document.getElementById("jump-blur-amount");
const LAST_FRAME = Math.floor(CLIP_SECONDS * FPS);

function element(tag, className, parent) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (parent) parent.appendChild(el);
  return el;
}

function makeWord() {
  const svg = document.createElementNS(SVG, "svg");
  svg.setAttribute("class", "word");
  const text = document.createElementNS(SVG, "text");
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("x", "0.5");
  svg.appendChild(text);
  reel.appendChild(svg);
  return { svg, text, shown: "" };
}

function makeVideo() {
  const box = element("div", "video", reel);
  const img = element("img", "", box);
  img.decoding = "sync";
  return { box, img };
}

// Built once and handed round as the reel moves: a video for every place in
// reach, and a word for every gap between them.
const videos = Array.from({ length: 2 * REACH + 1 }, makeVideo);
const words = Array.from({ length: 2 * REACH + 2 }, makeWord);

/** Size of a clip's picture inside the video: zoomed in, so subtitles can be left out. */
const ZOOM = 1.3;
const PICTURE = { width: REEL.video.width * ZOOM, height: (REEL.video.width * ZOOM * 16) / 9 };

function setUp() {
  // The letters are set so that a capital is `capHeight` tall when the reel
  // is at rest, smaller if the longest word would not fit.
  const ctx = document.createElement("canvas").getContext("2d");
  ctx.font = `1000px ${TITLE_FONT}`;
  const inked = [...WORDS, "H"].map((word) => ctx.measureText(word));
  const capRatio = inked.at(-1).actualBoundingBoxAscent / 1000;
  const widest = Math.max(...inked.map((m) => m.width)) / 1000;
  const fontSeen = Math.min(REEL.capHeight / capRatio, REEL.maxWordWidth / widest);
  // Where the ink of the words reaches: above the capitals for a d, k or l
  // and the dot on an i, below the line for a g. The room between the words
  // and the video is measured from the ink, so it is the same above and below.
  const above = (Math.max(...inked.map((m) => m.actualBoundingBoxAscent)) / 1000) * fontSeen;
  const below = (Math.max(...inked.map((m) => m.actualBoundingBoxDescent)) / 1000) * fontSeen;

  // The reel as it would lie flat. A word rests where the drum shows it at
  // the size and place asked for; the next video is twice as far, just over
  // the top of the drum.
  const seenAt = REEL.video.height / 2 + REEL.gap + (above + below) / 2;
  const angle = Math.asin(seenAt / REEL.radius);
  const scale = Math.cos(angle);
  PITCH = 2 * angle * REEL.radius;
  const fontSize = fontSeen / scale;
  for (const word of words) {
    word.text.setAttribute("font-size", fontSize.toFixed(2));
    // The baseline, so that the middle of the ink is the middle of the word.
    word.text.setAttribute("y", ((above - below) / 2 / scale + 0.5).toFixed(2));
  }
  for (const { box, img } of videos) {
    box.style.width = `${REEL.video.width}px`;
    box.style.height = `${REEL.video.height}px`;
    box.style.margin = `${-REEL.video.height / 2}px 0 0 ${-REEL.video.width / 2}px`;
    img.style.width = `${PICTURE.width}px`;
    img.style.height = `${PICTURE.height}px`;
    img.style.left = `${-(PICTURE.width - REEL.video.width) / 2}px`;
  }
  for (const side of ["left", "right"]) {
    const box = document.querySelector(`.caption.${side}`);
    for (const line of CAPTION[side]) element("span", "", box).textContent = line;
  }
}

/* ------------------------------------------------------------------ render */

const frameUrl = (clip, time) => {
  const index = clamp(Math.floor(time * FPS) + 1, 1, LAST_FRAME);
  return `../media/frames/reel-post/${clipId(CLIPS[clip])}/${String(index).padStart(4, "0")}.jpg`;
};

/**
 * Puts something that lies `distance` pixels along the reel from the middle
 * on the drum: it moves less and gets smaller the further round it is, and is
 * gone once it is over the top.
 */
function onDrum(el, distance) {
  const angle = distance / REEL.radius;
  if (Math.abs(angle) > 1.45) {
    el.style.display = "none";
    return;
  }
  const scale = Math.cos(angle);
  el.style.display = "";
  el.style.zIndex = String(Math.round(scale * 100));
  el.style.transform = `translateY(${(REEL.radius * Math.sin(angle)).toFixed(2)}px) scale(${scale.toFixed(4)})`;
}

function setWord(word, text) {
  if (word.shown === text) return;
  word.shown = text;
  word.text.textContent = text;
}

/** Draws time `t`. Resolves once every picture in it has been decoded. */
function renderAt(t) {
  const now = within(mod(t, LOOP));
  const pending = [];

  // One flat colour behind everything: the look of the video the reel is on,
  // and from halfway through a jump that of the one it is heading for.
  const on = now.share < 0.5 ? now.from : now.to;
  const scene = CLIPS[mod(on, N)].flash ? SCENES.flash : SCENES.base;
  stage.style.background = scene.background;
  stage.style.setProperty("--ink", scene.ink);

  const middle = Math.round(now.position);
  for (let place = middle - REACH; place <= middle + REACH; place++) {
    const { box, img } = videos[mod(place, videos.length)];
    const clip = mod(place, N);
    onDrum(box, (place - now.position) * PITCH);
    img.style.top = `${-(PICTURE.height - REEL.video.height) * CLIPS[clip].focus}px`;
    const url = frameUrl(clip, clipTime(clip, mod(t, LOOP)));
    if (img.getAttribute("src") !== url) {
      img.setAttribute("src", url);
      if (box.style.display !== "none") pending.push(img.decode().catch(() => undefined));
    }
  }
  // Word `gap` stands between video `gap - 1` and video `gap`.
  for (let gap = middle - REACH; gap <= middle + REACH + 1; gap++) {
    const word = words[mod(gap, words.length)];
    setWord(word, WORDS[mod(gap, WORDS.length)]);
    onDrum(word.svg, (gap - 0.5 - now.position) * PITCH);
  }

  // On a jump everything draws back and springs forward again.
  const back = drawnBack(t);
  reel.style.transform = `scale(${(1 - REEL.zoomOut * back).toFixed(4)})`;
  // Two kinds of blur. Motion blur, up and down only, by how fast the reel is
  // going: the speed is taken over two frames, so it swells and dies away
  // instead of switching on and off. And a soft focus all round while the
  // reel is drawn back, which sharpens as it springs forward.
  const tick = 1 / FPS;
  const speed = Math.abs(positionAt(t + tick) - positionAt(t - tick)) / (2 * tick);
  const motion = REEL.blur * Math.pow(clamp(speed / REEL.blurSpeed), 0.75);
  const soft = REEL.soften * clamp(back);
  blurAmount.setAttribute("stdDeviation", `${soft.toFixed(2)} ${(soft + motion).toFixed(2)}`);
  reel.style.filter = soft + motion > 0.3 ? "url(#jump-blur)" : "none";

  return Promise.all(pending);
}

/* -------------------------------------------------------------------- boot */

async function boot() {
  await Promise.all([
    document.fonts.load(`100px ${TITLE_FONT}`),
    document.fonts.load('500 15px "Hanken Grotesk"'),
  ]);
  await document.fonts.ready;
  setUp();
  await renderAt(0);
}

window.LOOP = LOOP;
window.FPS = FPS;
window.renderAt = renderAt;
window.ready = boot();

// Previewing in a browser: ?play plays it, ?t=3.5 shows one moment.
const params = new URLSearchParams(location.search);
window.ready.then(() => {
  if (params.has("t")) {
    renderAt(Number(params.get("t")));
    return;
  }
  if (!params.has("play")) return;
  const controls = document.getElementById("controls");
  const toggle = document.getElementById("toggle");
  const scrub = document.getElementById("scrub");
  const time = document.getElementById("time");
  controls.hidden = false;
  let playing = true;
  let at = 0;
  let last = performance.now();
  toggle.onclick = () => {
    playing = !playing;
    toggle.textContent = playing ? "Pauze" : "Speel af";
  };
  scrub.oninput = () => {
    at = Number(scrub.value) * LOOP;
    playing = false;
    toggle.textContent = "Speel af";
  };
  const tick = (now) => {
    if (playing) at = mod(at + (now - last) / 1000, LOOP);
    last = now;
    renderAt(at);
    scrub.value = String(at / LOOP);
    time.textContent = `${at.toFixed(2)}s / ${LOOP.toFixed(2)}s`;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});
