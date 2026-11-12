import { BEAT, BOARD, CAMERA, CANVAS, CLIP_SECONDS, FPS, LINES, LOGO, TIMING, clipId } from "./config.js";

/* global gsap, CustomEase */
gsap.registerPlugin(CustomEase);

// The Win Win motion language, as in the logo animation.
/**
 * For something that appears out of nothing: it starts gently, comes out
 * fast, goes a little too far (5%) and settles.
 */
const POP = CustomEase.create("winwin-pop", "M0,0 C0.12,0 0.14,1.05 0.42,1.05 0.6,1.05 0.68,1 1,1");
/** No wind-up, no overshoot: a smooth start and a soft landing. */
const FLOW = CustomEase.create("winwin-flow", "0.6, 0, 0.25, 1");

const TITLE_FONT = '"Trabat Condensed"';
const SVG = "http://www.w3.org/2000/svg";
const LOOP = TIMING.loop * BEAT;
const LAST_FRAME = Math.floor(CLIP_SECONDS * FPS);
/** The picture in a gap is a little larger than the gap, for when it opens too far. */
const BLEED = 1.08;

const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const lerp = (a, b, t) => a + (b - a) * t;
const mod = (a, n) => ((a % n) + n) % n;
const counts = (n) => n * BEAT;

/* ---------------------------------------------------------------- timeline */

/** The moments of the loop that every line goes by, in seconds. */
const AT = (() => {
  const second = TIMING.closed + TIMING.firstHold + TIMING.close + TIMING.pause;
  const finale = second + TIMING.secondHold;
  const logo = finale + 1;
  const back = logo + TIMING.logo + TIMING.logoHold;
  return { second: counts(second), finale: counts(finale), logo: counts(logo), back: counts(back) };
})();

/** The lines that leave at the end: all but the one that becomes the logo. */
const upper = LINES.map((line, index) => index).filter((index) => !LINES[index].logo);

/**
 * What line `index` is doing at time `t`:
 * - `round`: which of its two places it opens in, with which video;
 * - `share`: how far its gap is open, 1 is fully (a little over on the way);
 * - `since`: seconds since the gap started to open, for the footage;
 * - `away`: how far it has left the board, 0 to 1 (the upper lines, at the end);
 * - `logo`, `back`: how far along the last line is in becoming the logo, and
 *   in turning back into words for the loop, both 0 to 1 and not eased.
 */
function stateAt(index, t) {
  const lag = counts(index * TIMING.stagger);
  const first = counts(TIMING.closed) + lag;
  const firstClose = counts(TIMING.closed + TIMING.firstHold) + lag;
  const second = AT.second + lag;
  const state = { round: 0, share: 0, since: 0, away: 0, logo: 0, back: 0 };

  if (t < firstClose + counts(TIMING.close)) {
    // First time: opens, stays, closes.
    state.since = t - first;
    if (t >= firstClose) state.share = 1 - FLOW(clamp((t - firstClose) / counts(TIMING.close)));
    else if (t >= first) state.share = POP(clamp((t - first) / counts(TIMING.open)));
  } else if (t < AT.back) {
    // Second time: opens somewhere else and stays open until the end.
    state.round = 1;
    state.since = t - second;
    if (t >= second) state.share = POP(clamp((t - second) / counts(TIMING.open)));
  }

  if (LINES[index].logo) {
    state.logo = clamp((t - AT.logo) / counts(TIMING.logo));
    state.back = clamp((t - AT.back) / counts(TIMING.back));
  } else {
    // The upper lines leave one after the other from the top, and come back
    // closed, the lowest first.
    const order = upper.indexOf(index);
    const step = counts(0.5);
    if (t < AT.back) {
      state.away = FLOW(clamp((t - AT.finale - order * step) / counts(TIMING.leave)));
    } else {
      const wait = (upper.length - 1 - order) * step;
      const length = counts(TIMING.back) - (upper.length - 1) * step;
      state.away = 1 - FLOW(clamp((t - AT.back - wait) / length));
    }
  }
  return state;
}

/* --------------------------------------------------------------------- DOM */

const stage = document.getElementById("stage");
const camera = document.getElementById("camera");
const board = document.getElementById("board");
const linesBox = document.getElementById("lines");

function element(tag, className, parent) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (parent) parent.appendChild(el);
  return el;
}

/** The words as they are set: in capitals if the board asks for that. */
const set = (text) => (BOARD.caps ? text.toUpperCase() : text);

/** One line: the words before and after the gap, and the gap between them. */
const rows = LINES.map((source) => {
  const line = { ...source, text: set(source.text), opens: source.opens.map((pair) => pair.map(set)) };
  const root = element("div", "line", linesBox);
  const svg = document.createElementNS(SVG, "svg");
  root.appendChild(svg);
  const halves = [0, 1].map(() => {
    const text = document.createElementNS(SVG, "text");
    svg.appendChild(text);
    return text;
  });
  const gap = element("div", "gap", root);
  const img = element("img", "", gap);
  img.decoding = "sync";
  return { line, root, halves, gap, img, round: -1 };
});

const layout = {};

function setUp() {
  const ctx = document.createElement("canvas").getContext("2d");
  ctx.font = `1000px ${TITLE_FONT}`;
  const width = (text) => ctx.measureText(text).width / 1000;
  const capRatio = ctx.measureText("H").actualBoundingBoxAscent / 1000;

  const inner = BOARD.width - 2 * BOARD.padding;
  layout.inner = inner;

  // Every line is set in the same size: as large as lets the longest line,
  // opened by its gap, run from one edge of the board to the other. The
  // shorter lines open wider, so that they end up as wide as the board too.
  const longest = Math.max(...rows.flatMap((row) => row.line.opens.map(([before, after]) => width(before) + width(after))));
  const fontSize = inner / (longest + BOARD.narrowestGap * capRatio);
  const cap = fontSize * capRatio;
  const breathing = BOARD.breathing * cap;

  let top = 0;
  rows.forEach((row) => {
    const { line } = row;
    row.cap = cap;
    row.top = top;
    row.root.style.cssText = `top:${top}px;width:${inner}px;height:${cap}px;`;
    top += cap + BOARD.lineGap;
    for (const half of row.halves) {
      half.setAttribute("font-size", fontSize.toFixed(2));
      half.setAttribute("y", cap.toFixed(2));
    }
    const full = width(line.text) * fontSize;
    row.full = full;
    // How much the line has to grow to be as wide as the room on the board.
    row.grow = inner - full;
    // Per place the line opens: how wide the words before and after the gap
    // are, how wide the gap already is when closed (a space between two
    // words), and which sides of the video have words next to them.
    row.places = line.opens.map(([before, after]) => {
      const left = width(before) * fontSize;
      const right = width(after) * fontSize;
      return {
        before,
        after,
        left,
        right,
        space: Math.max(0, full - left - right),
        padLeft: before ? breathing : 0,
        padRight: after ? breathing : 0,
      };
    });
    // The picture: wide enough to fill the widest the gap gets, and taller
    // than it, as the footage is upright.
    const widestGap = Math.max(...row.places.map((place) => place.space + row.grow - place.padLeft - place.padRight));
    const pictureWidth = Math.max(widestGap, (cap * 9) / 16) * BLEED;
    row.picture = { width: pictureWidth, height: (pictureWidth * 16) / 9 };
    row.img.style.width = `${row.picture.width}px`;
    row.img.style.height = `${row.picture.height}px`;
  });

  const linesHeight = top - BOARD.lineGap;
  const height = linesHeight + 2 * BOARD.padding;
  rows.forEach((row) => {
    // Leaving, a line goes up until it is over the top edge of the board.
    row.exit = row.top + cap + BOARD.padding + 12;
    if (!row.line.logo) return;
    // As the logo, the line is as large as the board allows and stands in
    // the middle of it, with the diamond between the two words.
    const place = row.places.at(-1);
    row.logoOpening = (LOGO.side * Math.SQRT2 + 2 * LOGO.gap) * cap;
    row.logoScale = Math.min(inner / (place.left + place.right + row.logoOpening), (LOGO.maxHeight * height) / cap);
    row.logoShift = linesHeight / 2 - (row.top + cap / 2);
  });
  board.style.cssText = `left:${BOARD.left}px;top:${BOARD.top}px;width:${BOARD.width}px;height:${height}px;`;
  stage.style.setProperty("--board", BOARD.background);
  stage.style.setProperty("--ink", BOARD.ink);
  // The border is inside the board's box; the words keep their room from it.
  linesBox.style.cssText = `left:${BOARD.padding - 7}px;top:${BOARD.padding - 7}px;width:${inner}px;`;

  // The rest of the street, placed from the board.
  const boardBottom = BOARD.top + height;
  const glow = document.getElementById("glow");
  glow.style.cssText = `left:${BOARD.left - 30}px;top:${BOARD.top - 30}px;width:${BOARD.width + 60}px;height:${height + 60}px;`;
  const plinthTop = boardBottom + 118;
  document.getElementById("plinth").style.top = `${plinthTop}px`;
  const pavement = document.getElementById("pavement");
  const pavementTop = plinthTop + 34;
  pavement.style.top = `${pavementTop}px`;
  drawTiles(CANVAS.width + 80, CANVAS.height + 40 - pavementTop);
  layout.info = rows.map((row) => ({ text: row.line.text, cap: row.cap, gaps: row.places.map((place) => place.space + row.grow - place.padLeft - place.padRight) }));
}

/** The joints between the paving stones, running away from the camera. */
function drawTiles(width, height) {
  const tiles = document.getElementById("tiles");
  tiles.setAttribute("viewBox", `0 0 ${width} ${height}`);
  const lines = [];
  // Across: closer together towards the wall.
  for (let k = 1; k <= 5; k++) {
    const y = height * Math.pow(k / 5.6, 1.9);
    lines.push(`<line x1="0" y1="${y.toFixed(1)}" x2="${width}" y2="${y.toFixed(1)}"/>`);
  }
  // Away from the camera: fanning out from a point far behind the wall.
  const vanish = { x: width / 2, y: -height * 1.5 };
  for (let k = -9; k <= 9; k++) {
    const x = width / 2 + k * 250;
    const top = vanish.x + ((x - vanish.x) * (0 - vanish.y)) / (height - vanish.y);
    lines.push(`<line x1="${top.toFixed(1)}" y1="0" x2="${x}" y2="${height}"/>`);
  }
  tiles.innerHTML =
    `<g stroke="rgb(0 0 0 / 0.2)" stroke-width="2">${lines.join("")}</g>` +
    `<g stroke="rgb(255 255 255 / 0.12)" stroke-width="1" transform="translate(0 2)">${lines.join("")}</g>`;
}

/* ------------------------------------------------------------------ render */

const frameUrl = (clip, time) => {
  const index = clamp(Math.floor(time * FPS) + 1, 1, LAST_FRAME);
  return `../media/frames/billboard-post/${clipId(clip)}/${String(index).padStart(4, "0")}.jpg`;
};

/** Draws time `t`. Resolves once every picture in it has been decoded. */
function renderAt(t) {
  const u = mod(t, LOOP);
  const pending = [];

  rows.forEach((row, index) => {
    const { share, round, since, away, logo, back } = stateAt(index, u);
    const place = row.places[round];
    if (row.round !== round) {
      row.round = round;
      row.halves[0].textContent = place.before;
      row.halves[1].textContent = place.after;
    }
    const { cap } = row;
    const clip = row.line.clips[round];

    // Closed, the line stands in the middle of the board. Opening, the gap
    // pushes what is before it and what is after it apart by the same
    // amount, out to the edges. The video fills the gap, less the room the
    // words next to it keep.
    let opening = place.space + Math.max(0, row.grow * share);
    let box = { width: Math.max(0, opening - place.padLeft - place.padRight), height: cap, turn: 0, picture: 1 };
    let scale = 1;
    let shift = -away * row.exit;

    if (logo > 0) {
      // The last line becomes the logo: the bar draws in to a square, the
      // words close in on it, the square turns onto its point and loses its
      // picture, and the whole line grows to fill the board. Going back,
      // the diamond shrinks to nothing and the words close up.
      const morph = POP(clamp(logo / 0.7));
      const spin = FLOW(clamp((logo - 0.2) / 0.8));
      const undo = FLOW(back);
      const side = LOGO.side * cap;
      opening = back > 0 ? lerp(row.logoOpening, place.space, undo) : lerp(opening, row.logoOpening, morph);
      box = {
        width: back > 0 ? side * (1 - undo) : lerp(box.width, side, morph),
        height: back > 0 ? side * (1 - undo) : lerp(cap, side, morph),
        turn: LOGO.turn * spin + 90 * undo,
        picture: 1 - clamp(logo * 2.2),
      };
      const large = morph * (1 - undo);
      scale = 1 + (row.logoScale - 1) * large;
      shift = row.logoShift * large;
    }

    const start = (layout.inner - (place.left + place.right + opening)) / 2;
    row.halves[0].setAttribute("x", start.toFixed(2));
    row.halves[1].setAttribute("x", (start + place.left + opening).toFixed(2));
    const inset = logo > 0 ? (opening - box.width) / 2 : place.padLeft;
    row.gap.style.left = `${(start + place.left + inset).toFixed(2)}px`;
    row.gap.style.top = `${((cap - box.height) / 2).toFixed(2)}px`;
    row.gap.style.width = `${box.width.toFixed(2)}px`;
    row.gap.style.height = `${box.height.toFixed(2)}px`;
    row.gap.style.transform = box.turn ? `rotate(${box.turn.toFixed(2)}deg)` : "";
    row.gap.style.display = box.width > 0.5 ? "" : "none";
    row.root.style.transform = `translateY(${shift.toFixed(2)}px) scale(${scale.toFixed(4)})`;

    // The picture stays where it is while the gap opens over it.
    row.img.style.opacity = box.picture.toFixed(3);
    row.img.style.left = `${((box.width - row.picture.width) / 2).toFixed(2)}px`;
    row.img.style.top = `${(-(row.picture.height - cap) * clip.focus - (cap - box.height) / 2).toFixed(2)}px`;
    const url = frameUrl(clip, clamp(since, 0, CLIP_SECONDS - 1 / FPS));
    if (row.img.getAttribute("src") !== url) {
      row.img.setAttribute("src", url);
      if (box.width > 0.5 && box.picture > 0) pending.push(row.img.decode().catch(() => undefined));
    }
  });

  // The camera moves in slowly, and goes back while the words come back. It
  // is held by hand, so it drifts a little too.
  const moved = u < AT.back ? u / AT.back : 1 - FLOW(clamp((u - AT.back) / counts(TIMING.back)));
  const zoom = lerp(CAMERA.from, CAMERA.to, moved);
  const turn = (2 * Math.PI * u) / LOOP;
  const x = 4 * Math.sin(turn);
  const y = 3 * Math.sin(2 * turn + 1);
  camera.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${zoom.toFixed(4)})`;

  return Promise.all(pending);
}

/* -------------------------------------------------------------------- boot */

async function boot() {
  await document.fonts.load(`100px ${TITLE_FONT}`);
  await document.fonts.ready;
  setUp();
  await renderAt(0);
}

window.LOOP = LOOP;
window.FPS = FPS;
window.renderAt = renderAt;
window.layout = layout;
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
