import { CANVAS, CLIP_SECONDS, FORMATS, FPS, LAYOUT, SCENES, SHADE, SMALL, TIMING, TYPE, clipId } from "./config.js";

const W = CANVAS.width;
const H = CANVAS.height;
const N = SCENES.length;
const P = TIMING.scene;
const LOOP = N * P;
const LAST_FRAME = Math.floor(CLIP_SECONDS * FPS);
const TITLE_FONT = '"Trabat Semi Condensed"';
const SMALL_FONT = `500 ${SMALL.size}px "Hanken Grotesk"`;
const SVG = "http://www.w3.org/2000/svg";

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const mod = (a, n) => ((a % n) + n) % n;
const caps = (t) => (TYPE.caps ? t.toUpperCase() : t);

/* ------------------------------------------------------------------ layout */

const ctx = document.createElement("canvas").getContext("2d");

/** Where the ink of `text` starts and ends, relative to its starting point. */
function ink(text, font) {
  ctx.font = font;
  const m = ctx.measureText(text);
  return { left: -m.actualBoundingBoxLeft, right: m.actualBoundingBoxRight, ascent: m.actualBoundingBoxAscent };
}

/** The size at which the longest line in any scene runs from margin to margin. */
function titleSize() {
  const probe = 200;
  const widest = Math.max(
    ...SCENES.flatMap((s) => [...s.top, ...s.bottom]).map((t) => {
      const box = ink(caps(t), `${probe}px ${TITLE_FONT}`);
      return box.right - box.left;
    }),
  );
  return (probe * (W - 2 * LAYOUT.margin)) / widest;
}

/**
 * Lines of text with their ink flush with the margin on `side`. Each line
 * knows how far it is from the middle, so it can slide there.
 */
function lines(texts, font, baselines, side, cls, converge) {
  return texts.map((text, i) => {
    const box = ink(text, font);
    const x = side === "left" ? LAYOUT.margin - box.left : W - LAYOUT.margin - box.right;
    const centre = x + (box.left + box.right) / 2;
    return { text, x, y: baselines[i], cls, reach: (W / 2 - centre) * converge };
  });
}

/** Lays out scene `i`. Even scenes have the upper words on the right, as the reference starts. */
function arrange(i, size) {
  const scene = SCENES[i];
  const title = `${size}px ${TITLE_FONT}`;
  const cap = ink("H", title).ascent;
  const step = size * TYPE.leading;
  const m = LAYOUT.margin;
  const topBase = [m + cap, m + cap + step];
  const bottomBase = [H - m - step, H - m];

  const smallCap = ink("H", SMALL_FONT).ascent;
  const smallStep = SMALL.size * 1.2;
  const smallTop = [m + smallCap, m + smallCap + smallStep];
  const smallBottom = [H - m - smallStep, H - m];

  const upper = i % 2 === 0 ? "right" : "left";
  const lower = upper === "right" ? "left" : "right";

  // The video reaches from inside the last upper line to inside the first
  // lower one, and sits in the middle across.
  // Lower-case words are measured by their small letters, so ascenders such
  // as the k in "kopen" may stand in front of the video.
  const letter = TYPE.caps ? cap : ink("x", title).ascent;
  const reach = LAYOUT.overlap * letter;
  const top = topBase[1] - reach;
  const bottom = bottomBase[0] - letter + reach;
  const height = bottom - top;
  const width = height * FORMATS[scene.format];

  return {
    size,
    lines: [
      ...lines(scene.top.map(caps), title, topBase, upper, "title", TIMING.converge),
      ...lines(scene.bottom.map(caps), title, bottomBase, lower, "title", TIMING.converge),
      ...lines(SMALL.top, SMALL_FONT, smallTop, lower, "small", TIMING.convergeSmall),
      ...lines(SMALL.bottom, SMALL_FONT, smallBottom, upper, "small", TIMING.convergeSmall),
    ],
    video: { left: (W - width) / 2, top, width, height },
  };
}

/* --------------------------------------------------------------------- DOM */

const stage = document.getElementById("stage");
const words = document.getElementById("words");
const video = document.getElementById("video");
const img = video.querySelector("img");
const shade = document.getElementById("shade");
let layouts = [];
let shown = -1;
let drawn = [];

/** Puts scene `i` on the stage: colour, words, the video's frame. */
function show(i) {
  if (shown === i) return;
  shown = i;
  const scene = SCENES[i];
  const place = layouts[i];
  stage.style.background = scene.background;
  shade.style.background = SHADE ? `linear-gradient(to bottom, rgba(0,0,0,0) 45%, rgba(0,0,0,${SHADE}) 100%)` : "none";

  words.innerHTML = "";
  const defs = document.createElementNS(SVG, "defs");
  words.appendChild(defs);
  drawn = place.lines.map((line, n) => {
    // A filter of its own per line, for motion blur along the slide.
    const filter = document.createElementNS(SVG, "filter");
    filter.id = `blur-${n}`;
    for (const [k, v] of Object.entries({ x: "-0.3", y: "-0.1", width: "1.6", height: "1.2" })) filter.setAttribute(k, v);
    const blur = document.createElementNS(SVG, "feGaussianBlur");
    filter.appendChild(blur);
    defs.appendChild(filter);

    const text = document.createElementNS(SVG, "text");
    text.setAttribute("class", line.cls);
    text.setAttribute("x", line.x.toFixed(2));
    text.setAttribute("y", line.y.toFixed(2));
    text.setAttribute("fill", scene.ink);
    text.setAttribute("font-size", line.cls === "title" ? place.size.toFixed(2) : SMALL.size);
    text.textContent = line.text;
    words.appendChild(text);
    return { text, blur, filter: `url(#${filter.id})`, reach: line.reach };
  });

  const v = place.video;
  Object.assign(video.style, { left: `${v.left}px`, top: `${v.top}px`, width: `${v.width}px`, height: `${v.height}px` });
  img.style.objectPosition = `50% ${scene.clip.focus * 100}%`;
  img.style.transformOrigin = `50% ${scene.clip.focus * 100}%`;
}

/* ------------------------------------------------------------------ render */

const frameUrl = (i, time) => {
  const index = clamp(Math.floor(time * FPS) + 1, 1, LAST_FRAME);
  return `../media/frames/split-post/${clipId(SCENES[i].clip)}/${String(index).padStart(4, "0")}.jpg`;
};

/**
 * Draws time `t`. Scene i runs from cut (i − ½)·P to cut (i + ½)·P, so the
 * loop starts and ends in the middle of scene 0, at rest.
 */
function renderAt(t) {
  const u = mod(t + P / 2, LOOP);
  const i = Math.floor(u / P);
  const since = u - i * P; // seconds since the cut into this scene
  const until = P - since; // seconds to the cut out of it
  show(i);

  // At a cut every line is all the way to the middle (times `converge`); it
  // settles from there, and builds back up to it, exponentially.
  const k = TIMING.rate;
  const settle = Math.exp(-k * since);
  const build = Math.exp(-k * until);
  const away = settle + build;
  const speed = (k * Math.abs(build - settle)) / FPS; // share of `reach` moved per frame
  for (const { text, blur, filter, reach } of drawn) {
    text.setAttribute("transform", `translate(${(reach * away).toFixed(2)} 0)`);
    const sd = TIMING.blur * Math.abs(reach) * speed;
    if (sd > 0.4) {
      blur.setAttribute("stdDeviation", `${sd.toFixed(2)} 0`);
      text.setAttribute("filter", filter);
    } else {
      text.removeAttribute("filter");
    }
  }

  // The video draws in before a cut and opens out after it, while the
  // picture inside settles back from closer, for a little depth.
  const { zoom = 1 } = SCENES[i].clip;
  video.style.transform = `scale(${(1 - TIMING.videoIn * settle - TIMING.videoOut * build).toFixed(4)})`;
  img.style.transform = `scale(${(zoom * (1 + TIMING.zoomIn * settle)).toFixed(4)})`;

  const url = frameUrl(i, since);
  if (img.getAttribute("src") !== url) {
    img.setAttribute("src", url);
    return img.decode().catch(() => undefined);
  }
  return Promise.resolve();
}

/* -------------------------------------------------------------------- boot */

async function boot() {
  await Promise.all([document.fonts.load(`100px ${TITLE_FONT}`), document.fonts.load(SMALL_FONT)]);
  await document.fonts.ready;
  const size = titleSize();
  layouts = SCENES.map((_, i) => arrange(i, size));
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
