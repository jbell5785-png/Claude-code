// Tide Tables, concept B: procedural copperplate elevation of Richmond Bridge.
// Original drawing: geometry from the listing text (five segmental arches rising to the
// widest and tallest centre arch, two land-bound semicircular arches, semicircular
// cutwaters) and proportions studied (not traced) from client photo 4.
// Output: SVG strings consumed by build.mjs.

const INK = '#2A2F33';
const PAPER = '#D9D3C3';
const RIVER = '#8391A1';

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const f = (n) => {
  const v = Math.round(n * 10) / 10;
  return (Object.is(v, -0) ? 0 : v).toString();
};


// ---------------------------------------------------------------- path compaction
// Absolute -> relative commands, rounded against the *rounded* pen position so no drift.
function num(v) { let s = (Math.round(v * 10) / 10).toString(); if (s === '-0') s = '0'; return s.replace(/^0\./, '.').replace(/^-0\./, '-.'); }
function join(nums) { let o = ''; nums.forEach((s, k) => { if (k && !(s[0] === '-' || (s[0] === '.' && /\./.test(nums[k - 1])))) o += ' '; o += s; }); return o; }
export function compactD(d) {
  const toks = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e-?\d+)?/g) || [];
  let i = 0, cx = 0, cy = 0, sx = 0, sy = 0, out = '', cmd = '', first = true;
  const n = () => parseFloat(toks[i++]);
  const R = (v) => Math.round(v * 10) / 10;
  while (i < toks.length) {
    if (/[a-zA-Z]/.test(toks[i])) cmd = toks[i++];
    const abs = cmd === cmd.toUpperCase();
    const C = cmd.toUpperCase();
    if (C === 'Z') { out += 'z'; cx = sx; cy = sy; continue; }
    const pt = (x, y) => { const X = abs ? x : cx + x, Y = abs ? y : cy + y; return [X, Y]; };
    if (C === 'M' || C === 'L') {
      const [X, Y] = pt(n(), n());
      if (first) { const a = R(X), b = R(Y); out += 'M' + join([num(a), num(b)]); cx = a; cy = b; first = false; }
      else { const dx = R(X - cx), dy = R(Y - cy); out += (C === 'M' ? 'm' : 'l') + join([num(dx), num(dy)]); cx += dx; cy += dy; }
      if (C === 'M') { sx = cx; sy = cy; cmd = abs ? 'L' : 'l'; }
    } else if (C === 'H') { const X = abs ? n() : cx + n(); const dx = R(X - cx); out += 'h' + num(dx); cx += dx; }
    else if (C === 'V') { const Y = abs ? n() : cy + n(); const dy = R(Y - cy); out += 'v' + num(dy); cy += dy; }
    else if (C === 'Q') { const [x1, y1] = pt(n(), n()); const [X, Y] = pt(n(), n()); const dx = R(X - cx), dy = R(Y - cy); out += 'q' + join([num(x1 - cx), num(y1 - cy), num(dx), num(dy)]); cx += dx; cy += dy; }
    else if (C === 'C') { const [x1, y1] = pt(n(), n()); const [x2, y2] = pt(n(), n()); const [X, Y] = pt(n(), n()); const dx = R(X - cx), dy = R(Y - cy); out += 'c' + join([num(x1 - cx), num(y1 - cy), num(x2 - cx), num(y2 - cy), num(dx), num(dy)]); cx += dx; cy += dy; }
    else if (C === 'A') { const rx = n(), ry = n(), rot = n(), la = n(), sw = n(); const [X, Y] = pt(n(), n()); const dx = R(X - cx), dy = R(Y - cy); out += 'a' + join([num(rx), num(ry), num(rot), String(la), String(sw), num(dx), num(dy)]); cx += dx; cy += dy; }
    else { i++; }
  }
  return out;
}
export const compactAll = (svg) => svg.replace(/ d="([^"]+)"/g, (m, d) => ` d="${compactD(d)}"`);

// ---------------------------------------------------------------- geometry
export const W = 1600, H = 740, WY = 520;
const SPANS = [150, 190, 230, 190, 150];
const P = 44;
const CROWN = [68, 84, 100, 84, 68];
const SPRING = [20, 22, 24, 22, 20];
const RING = 12;
const yC = (x) => 384 + 1.3e-4 * (x - 800) ** 2; // top of cornice (deck line)
const L_END = 130, R_END = 1480;            // ends of the drawn bridge
const L_BANK = 244, R_BANK = 1356;          // where the banks meet the water
const GROUND = 508;

export const arches = [];
{
  let x = 257;
  SPANS.forEach((s, i) => {
    const x0 = x, x1 = x + s, cx = (x0 + x1) / 2;
    const sy = WY - SPRING[i];
    const rise = CROWN[i] - SPRING[i];
    const R = (rise * rise + (s / 2) ** 2) / (2 * rise);
    const crownY = WY - CROWN[i];
    const cy = crownY + R;
    arches.push({ i: i + 1, x0, x1, cx, sy, R, cy, crownY, s });
    x = x1 + P;
  });
}
export const piers = [];
for (let j = 0; j < 4; j++) {
  const a = arches[j], b = arches[j + 1];
  const pc = (a.x1 + b.x0) / 2;
  const capBase = Math.min(a.sy, b.sy) - 6;
  piers.push({ pc, capBase, r: 17 });
}
const landArches = [
  { cx: 190, sy: 476, r: 26 },
  { cx: 1408, sy: 476, r: 26 },
];

function inArchRegion(x, y, pad = 0) {
  for (const a of arches) {
    if (y >= a.sy) { if (x > a.x0 - pad && x < a.x1 + pad && y <= WY) return a; continue; }
    const rr = a.R + RING + pad;
    const dy = y - a.cy;
    if (rr * rr - dy * dy > 0 && Math.abs(x - a.cx) < Math.sqrt(rr * rr - dy * dy)) return a;
  }
  return null;
}
function inOpening(a, x, y) {
  if (y >= a.sy) return x > a.x0 && x < a.x1;
  const dy = y - a.cy;
  return a.R * a.R - dy * dy > 0 && Math.abs(x - a.cx) < Math.sqrt(a.R * a.R - dy * dy);
}
function inCutwater(x, y, pad = 0) {
  for (const p of piers) {
    const hw = p.r + 2 + pad;
    if (Math.abs(x - p.pc) < hw && y > p.capBase - p.r - pad) {
      if (y >= p.capBase) return true;
      const dy = p.capBase - y;
      if (Math.abs(x - p.pc) < Math.sqrt(Math.max(0, (p.r + pad) ** 2 - dy * dy))) return true;
    }
  }
  return false;
}
function inLandArch(x, y, pad = 0) {
  for (const l of landArches) {
    const rr = l.r + 8 + pad;
    if (y >= l.sy && y <= GROUND && Math.abs(x - l.cx) < rr) return true;
    const dy = y - l.sy;
    if (y < l.sy && rr * rr - dy * dy > 0 && Math.abs(x - l.cx) < Math.sqrt(rr * rr - dy * dy)) return true;
  }
  return false;
}
const belowCornice = (x, y) => y > yC(x) + 10.5;

// Generic scanline: returns [x0,x1] runs where pred(x) holds, stepping `step`.
function runs(xa, xb, pred, step = 0.5) {
  const out = []; let start = null;
  for (let x = xa; x <= xb; x += step) {
    const ok = pred(x);
    if (ok && start === null) start = x;
    if (!ok && start !== null) { out.push([start, x - step]); start = null; }
  }
  if (start !== null) out.push([start, xb]);
  return out;
}

// ---------------------------------------------------------------- pieces
function sky(r) {
  let d = '';
  const clouds = [[300, 70, 210, 26], [980, 52, 260, 22], [1280, 112, 160, 16], [620, 128, 220, 14], [80, 120, 150, 12]];
  const inCloud = (x, y) => clouds.some(([cx, cy, rx, ry]) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1);
  let k = 0;
  for (let y = 12; y < 150; y += 3.3 + (y - 12) * 0.022, k++) {
    const fade = (y - 12) / 138;
    for (const [a, b] of runs(0, W, (x) => !inCloud(x, y) && (fade < 0.55 || ((Math.sin(x * 0.011 + k * 1.7) + Math.sin(x * 0.0041 + k)) > (fade - 0.55) * 4.4 - 0.6)), 2)) if (b - a > 6) d += `M${f(a)} ${f(y)}H${f(b)}`;
  }
  // cloud contour hints
  let c = '';
  clouds.forEach(([cx, cy, rx, ry]) => { c += `M${f(cx - rx * 0.8)} ${f(cy + ry * 0.55)}Q${f(cx - rx * 0.2)} ${f(cy + ry * 1.05)} ${f(cx + rx * 0.7)} ${f(cy + ry * 0.62)}`; });
  return `<path d="${d}" stroke-width=".42" stroke-opacity=".7"/><path d="${c}" stroke-width=".4" stroke-opacity=".5"/>`;
}

function silhouette() {
  let d = `M${L_END} ${WY}`;
  for (let x = L_END; x <= R_END; x += 10) d += `L${f(x)} ${f(yC(x) - 38)}`;
  d += `L${R_END} ${f(yC(R_END) - 38)}L${R_END} ${WY}Z`;
  return `<path d="${d}" fill="${PAPER}" stroke="none"/>`;
}

function coursing(r) {
  let d = '';
  const COURSE = 11;
  const ys = [];
  for (let y = WY - COURSE; y > 330; y -= COURSE) ys.push(y);
  const isStone = (x, y) => x >= 257 && x <= 1343 && y < WY && belowCornice(x, y) && !inArchRegion(x, y, 0.8) && !inCutwater(x, y, 1);
  ys.forEach((y) => { for (const [a, b] of runs(252, 1348, (x) => isStone(x, y))) if (b - a > 2) d += `M${f(a)} ${y}H${f(b)}`; });
  // vertical joints
  ys.forEach((y, k) => {
    const yTop = y - COURSE;
    let x = 257 + (k % 2 ? 17 : 0) + r() * 6;
    while (x < 1343) {
      if (isStone(x, y - 0.6) && isStone(x, yTop + 0.6)) d += `M${f(x)} ${y}V${yTop}`;
      x += 30 + r() * 12;
    }
  });
  // also the course between WY and the first line inside piers
  return `<path d="${d}" stroke-width=".5" stroke-opacity=".62"/>`;
}

function abutments(r) {
  let d = '', dd = '';
  const COURSE = 15;
  const isAb = (x, y) => ((x >= L_END && x <= 257) || (x >= 1343 && x <= R_END)) && y < WY && belowCornice(x, y) && !inLandArch(x, y, 0.8) && !inArchRegion(x, y, 0.8);
  const ys = [];
  for (let y = WY - 12; y > 380; y -= COURSE) ys.push(y);
  ys.forEach((y) => {
    for (const [a, b] of runs(L_END, R_END, (x) => isAb(x, y))) if (b - a > 2) { d += `M${f(a)} ${y}H${f(b)}`; dd += `M${f(a)} ${f(y - 1.8)}H${f(b)}`; }
  });
  ys.forEach((y, k) => {
    const yTop = y - COURSE;
    for (const [xs, xe] of [[L_END, 257], [1343, R_END]]) {
      let x = xs + (k % 2 ? 22 : 6) + r() * 6;
      while (x < xe - 4) {
        if (isAb(x, y - 2) && isAb(x, yTop + 1)) { d += `M${f(x)} ${f(y - 1.8)}V${yTop}`; dd += `M${f(x + 1.6)} ${f(y - 1.8)}V${yTop}`; }
        x += 38 + r() * 14;
      }
    }
  });
  // end faces
  let edge = '';
  for (const x of [L_END, R_END]) edge += `M${x} ${f(yC(x) + 10)}V${GROUND}`;
  return `<path d="${d}" stroke-width=".6" stroke-opacity=".7"/><path d="${dd}" stroke-width=".4" stroke-opacity=".45"/><path class="bu" pathLength="1" style="--d:200" d="${edge}" stroke-width=".9"/>`;
}

function landArchesSvg(r) {
  let out = '';
  landArches.forEach((l, k) => {
    const { cx, sy, r: R } = l;
    // opening (dark brick interior seen from the bank)
    let h = '';
    for (let y = sy - R + 1.5; y < GROUND; y += 2.1) {
      const dy = y - sy;
      const half = y < sy ? Math.sqrt(Math.max(0, R * R - dy * dy)) : R;
      if (half > 1) h += `M${f(cx - half + 0.6)} ${f(y)}H${f(cx + half - 0.6)}`;
    }
    let v = '';
    for (let x = cx - R + 2; x < cx + R; x += 3.2) {
      const dx = x - cx; const top = sy - Math.sqrt(Math.max(0, R * R - dx * dx));
      v += `M${f(x)} ${f(top + 1)}V${GROUND - 0.5}`;
    }
    // ring with voussoirs
    let ring = `M${cx - R} ${GROUND}V${sy}A${R} ${R} 0 0 1 ${cx + R} ${sy}V${GROUND}`;
    let ring2 = `M${cx - R - 8} ${sy}A${R + 8} ${R + 8} 0 0 1 ${cx + R + 8} ${sy}`;
    let vj = '';
    for (let a = Math.PI; a >= 0; a -= Math.PI / 13) {
      vj += `M${f(cx + Math.cos(a) * R)} ${f(sy - Math.sin(a) * R)}L${f(cx + Math.cos(a) * (R + 8))} ${f(sy - Math.sin(a) * (R + 8))}`;
    }
    out += `<g class="landarch"><path d="${h}" stroke-width=".55"/><path d="${v}" stroke-width=".35" stroke-opacity=".7"/>`
      + `<path class="bu" pathLength="1" style="--d:${k ? 1150 : 150}" d="${ring}" stroke-width=".9"/><path class="bu" pathLength="1" style="--d:${k ? 1180 : 180}" d="${ring2}" stroke-width=".8"/><path d="${vj}" stroke-width=".45"/></g>`;
  });
  return out;
}

function archOpenings(r) {
  const groups = [];
  arches.forEach((a) => {
    const { x0, x1, cx, cy, R, sy, crownY, i } = a;
    const openD = `M${x0} ${WY}V${sy}A${f(R)} ${f(R)} 0 0 1 ${x1} ${sy}V${WY}Z`;
    const ry = 2 * WY - sy;
    const reflD = `M${x0} ${WY}V${ry}A${f(R)} ${f(R)} 0 0 0 ${x1} ${ry}V${WY}Z`;
    const halfAt = (y) => (y >= sy ? (x1 - x0) / 2 : Math.sqrt(Math.max(0, R * R - (y - cy) ** 2)));
    const halfAtR = (y) => halfAt(2 * WY - y);
    // base tone: horizontal ruling
    let base = '';
    for (let y = crownY + 2.2; y < WY - 0.5; y += 3.2) {
      const h = halfAt(y) - 0.8; if (h > 1) base += `M${f(cx - h)} ${f(y)}H${f(cx + h)}`;
    }
    // soffit hint: three inner arcs
    let soff = '';
    for (const k of [2.2, 4.6]) {
      const rr = R - k; const dy = cy - sy; const dx = Math.sqrt(Math.max(0, rr * rr - dy * dy));
      soff += `M${f(cx - dx)} ${sy}A${f(rr)} ${f(rr)} 0 0 1 ${f(cx + dx)} ${sy}`;
    }
    // reflection base: broken ruling
    let rb = '';
    for (let y = WY + 2.2; y < 2 * WY - crownY - 1; y += 3.2) {
      const h = halfAtR(y) - 1;
      if (h < 2) continue;
      let x = cx - h;
      while (x < cx + h) { const len = 8 + r() * 30; const e = Math.min(cx + h, x + len); if (r() > 0.18) rb += `M${f(x)} ${f(y)}H${f(e)}`; x = e + 2 + r() * 7; }
    }
    // ink layer
    const ink = [];
    const lines = [];
    for (let y = crownY + 0.6; y < WY - 0.3; y += 4) lines.push(y);
    const nl = lines.length;
    lines.forEach((y, k) => {
      const yy = y + 2 > WY - 0.4 ? WY - 0.6 : y + 2; // interleave
      const h = halfAt(yy) - 0.5; if (h < 1) return;
      ink.push(`<path pathLength="1" style="--t:${Math.round((k / nl) * 360)}ms" d="M${f(cx - h)} ${f(yy)}H${f(cx + h)}" stroke-width=".85"/>`);
    });
    // diagonal cross-hatch, clipped
    const diag = [];
    const hgt = WY - crownY;
    for (let s = x0 - hgt; s < x1; s += 4.2) diag.push(s);
    diag.forEach((s, k) => {
      diag[k] = `<path pathLength="1" style="--t:${Math.round(120 + (k / diag.length) * 380)}ms" d="M${f(s)} ${WY}L${f(s + hgt)} ${f(crownY)}" stroke-width=".5"/>`;
    });
    // reflection ink: dense broken strokes
    const rlines = [];
    for (let y = WY + 0.8; y < 2 * WY - crownY - 0.5; y += 2) rlines.push(y);
    rlines.forEach((y, k) => {
      const h = halfAtR(y) - 0.6; if (h < 1.5) return;
      let d = ''; let x = cx - h;
      while (x < cx + h) { const len = 10 + r() * 46; const e = Math.min(cx + h, x + len); d += `M${f(x)} ${f(y)}H${f(e)}`; x = e + 0.8 + r() * 3.2; }
      ink.push(`<path pathLength="1" style="--t:${Math.round(300 + (k / rlines.length) * 380)}ms" d="${d}" stroke-width="${k % 2 ? '.55' : '.8'}"/>`);
    });
    groups.push({
      i,
      clip: `<clipPath id="op${i}"><path d="${openD}"/></clipPath>`,
      svg: `<g class="arch a${i}${i === 3 ? '' : ''}" data-arch="${i}">`
        + `<g class="t" style="--d:${300 + Math.abs(i - 3) * 160}"><path d="${base}" stroke-width=".55" stroke-opacity=".9"/><path d="${soff}" stroke-width=".45" stroke-opacity=".8"/><path d="${rb}" stroke-width=".55" stroke-opacity=".85"/></g>`
        + `<g class="ink">${ink.join('')}<g clip-path="url(#op${i})">${diag.join('')}</g></g>`
        + `</g>`,
      openD, reflD,
    });
  });
  return groups;
}

function rings() {
  let out = '', vj = '';
  arches.forEach((a, k) => {
    const { cx, cy, R, sy, x0, x1 } = a;
    const d0 = 120 + Math.abs(a.i - 3) * 170;
    [0, 4, 8, RING].forEach((o, n) => {
      const rr = R + o; const dy = cy - sy; const dx = Math.sqrt(rr * rr - dy * dy);
      out += `<path class="bu" pathLength="1" style="--d:${d0 + n * 40}" d="M${f(cx - dx)} ${sy}A${f(rr)} ${f(rr)} 0 0 1 ${f(cx + dx)} ${sy}" stroke-width="${n === 0 ? 1.05 : n === 3 ? 0.9 : 0.5}"/>`;
    });
    // jambs below springing to the water
    out += `<path class="bu" pathLength="1" style="--d:${d0}" d="M${x0} ${sy}V${WY}M${x1} ${sy}V${WY}" stroke-width=".9"/>`;
    // voussoir joints across the ring
    const a0 = Math.atan2(cy - sy, -(Math.sqrt(R * R - (cy - sy) ** 2)));
    const a1 = Math.atan2(cy - sy, Math.sqrt(R * R - (cy - sy) ** 2));
    const step = 9.5 / (R + RING);
    for (let t = a0 - step; t > a1 + step * 0.4; t -= step) {
      vj += `M${f(cx + Math.cos(t) * R)} ${f(cy - Math.sin(t) * R)}L${f(cx + Math.cos(t) * (R + RING))} ${f(cy - Math.sin(t) * (R + RING))}`;
    }
  });
  return out + `<path d="${vj}" stroke-width=".42" stroke-opacity=".8"/>`;
}

function cutwaters() {
  let out = '';
  piers.forEach((p, k) => {
    const { pc, capBase, r } = p;
    const d0 = 260 + Math.abs(pc - 800) * 0.45;
    const body = `M${pc - r} ${WY}V${capBase + 4}H${pc + r}V${WY}Z`;
    const band = `M${pc - r - 2} ${capBase + 4}V${capBase}H${pc + r + 2}V${capBase + 4}Z`;
    const dome = `M${pc - r} ${capBase}A${r} ${r} 0 0 1 ${pc + r} ${capBase}Z`;
    let sh = '';
    [0.18, 0.5, 0.74, 0.92, 1.06, 1.18, 1.28, 1.37, 1.45, 1.51].forEach((th, n) => {
      const x = pc + r * Math.sin(th);
      sh += `M${f(x)} ${capBase + 5}V${WY - 0.6}`;
    });
    let dm = '';
    [0.5, 0.92, 1.18, 1.37, 1.5].forEach((th) => {
      const rx = r * Math.sin(th);
      dm += `M${f(pc + rx)} ${capBase - 0.4}A${f(rx)} ${r - 0.4} 0 0 0 ${pc} ${f(capBase - r + 0.4)}`;
    });
    // band underside shadow
    let bs = '';
    for (let x = pc - r - 1.5; x <= pc + r + 1.5; x += 1.6) bs += `M${f(x)} ${capBase + 4.3}v2.2`;
    out += `<g class="cutwater"><path d="${body}" fill="${PAPER}" stroke="none"/><path class="bu" pathLength="1" style="--d:${d0}" d="M${pc - r} ${WY}V${capBase + 4}M${pc + r} ${capBase + 4}V${WY}" stroke-width=".95"/>`
      + `<path d="${sh}" stroke-width=".45"/><path d="${bs}" stroke-width=".4"/>`
      + `<path d="${band}" fill="${PAPER}" stroke-width=".8"/><path d="${dome}" fill="${PAPER}" stroke="none"/><path class="bu" pathLength="1" style="--d:${d0 + 80}" d="M${pc - r} ${capBase}A${r} ${r} 0 0 1 ${pc + r} ${capBase}" stroke-width=".95"/><path d="${dm}" stroke-width=".42"/></g>`;
  });
  return out;
}

function cornice() {
  const xs = []; for (let x = L_END - 4; x <= R_END + 4; x += 8) xs.push(x);
  const line = (o, ext = 0) => {
    let d = ''; xs.forEach((x, n) => { d += `${n ? 'L' : 'M'}${f(x)} ${f(yC(x) + o)}`; }); return d;
  };
  let sh = '';
  for (let x = L_END - 3; x <= R_END + 3; x += 1.7) sh += `M${f(x)} ${f(yC(x) + 6.6)}v3.2`;
  return `<path class="bu" pathLength="1" style="--d:60" d="${line(0)}" stroke-width=".9"/><path d="${line(2.6)}" stroke-width=".45"/><path class="bu" pathLength="1" style="--d:120" d="${line(6.2)}" stroke-width=".8"/><path d="${sh}" stroke-width=".42" stroke-opacity=".9"/><path class="bu" pathLength="1" style="--d:180" d="${line(10.2)}" stroke-width=".7"/>`;
}

function balustrade() {
  // dies over each pier, at the abutment ends and over the land arches
  const dies = [L_END + 10, 257 - 6, ...piers.map((p) => p.pc), 1343 + 6, R_END - 10];
  const isDie = (x) => dies.some((dx) => Math.abs(x - dx) < 16);
  let bal = '', shade = '', dieD = '', diePanel = '';
  const prof = [[0, 3.6], [2.6, 3.6], [3.2, 2.4], [5.5, 3.3], [9.5, 3.5], [13.5, 2.4], [16.5, 1.5], [18, 2.2], [19, 1.5], [20.5, 3.4], [24, 3.4]];
  for (let x = L_END + 6; x < R_END - 6; x += 11.5) {
    if (isDie(x)) continue;
    const by = yC(x) - 6;
    let left = '', right = '';
    prof.forEach(([hh, w], n) => { left += `${n ? 'L' : 'M'}${f(x - w)} ${f(by - hh)}`; });
    [...prof].reverse().forEach(([hh, w]) => { right += `L${f(x + w)} ${f(by - hh)}`; });
    bal += left + right + 'Z';
    shade += `M${f(x + 1.6)} ${f(by - 4)}Q${f(x + 2.6)} ${f(by - 9)} ${f(x + 1.4)} ${f(by - 14)}`;
  }
  dies.forEach((x) => {
    const y = yC(x);
    dieD += `M${f(x - 14)} ${f(y - 6)}V${f(y - 31.5)}H${f(x + 14)}V${f(y - 6)}`;
    diePanel += `M${f(x - 9)} ${f(y - 10)}V${f(y - 27)}H${f(x + 9)}V${f(y - 10)}Z`;
    for (let k = 0; k < 6; k++) shade += `M${f(x + 9 + 0.9 * k * 0.0)} 0`; // placeholder no-op removed below
  });
  shade = shade.replace(/M[\d.]+ 0/g, '');
  const xs = []; for (let x = L_END - 2; x <= R_END + 2; x += 8) xs.push(x);
  const line = (o) => { let d = ''; xs.forEach((x, n) => { d += `${n ? 'L' : 'M'}${f(x)} ${f(yC(x) + o)}`; }); return d; };
  // die shading (right side hatch)
  let dsh = '';
  dies.forEach((x) => { const y = yC(x); for (let k = 0; k < 4; k++) dsh += `M${f(x + 10.5 + k * 0.9)} ${f(y - 9)}V${f(y - 28)}`; });
  return `<g class="balustrade">`
    + `<path class="bu" pathLength="1" style="--d:40" d="${line(-6)}" stroke-width=".7"/>`
    + `<path d="${bal}" fill="${PAPER}" stroke-width=".55"/><path d="${shade}" stroke-width=".4"/>`
    + `<path d="${dieD}" fill="${PAPER}" stroke-width=".7"/><path d="${diePanel}" stroke-width=".45"/><path d="${dsh}" stroke-width=".35"/>`
    + `<path class="bu" pathLength="1" style="--d:20" d="${line(-30)}" stroke-width=".7"/><path d="${line(-33)}" stroke-width=".45"/><path class="bu" pathLength="1" style="--d:0" d="${line(-38)}" stroke-width=".95"/>`
    + `</g>`;
}

function water(r) {
  let d1 = '', d2 = '', d3 = '';
  const eye = (x, y) => arches.some((a) => inOpening(a, x, 2 * WY - y));
  const mass = (x, y) => x > L_END && x < R_END && y < WY + (WY - (yC(x) - 38)) * 0.9;
  const treeR = (x, y) => x > 1430 && y < WY + 120 - (x - 1430) * 0.1;
  const cutR = (x, y) => piers.some((p) => Math.abs(x - p.pc) < p.r + 1 && y < WY + (WY - (p.capBase - p.r)) * 0.95);
  for (let y = WY + 3; y < H - 3; y += 3.6 + (y - WY) * 0.012) {
    let x = 0;
    while (x < W) {
      const m = mass(x, y), e = eye(x, y), c = cutR(x, y);
      if (e) { x += 1.5; continue; }
      if (c) {
        const len = 3 + r() * 10; d3 += `M${f(x)} ${f(y)}h${f(len)}`; x += len + 0.8 + r() * 1.6; continue;
      }
      if (m || treeR(x, y)) {
        const len = 6 + r() * 30; let e2 = x + len; while (e2 > x && eye(e2, y)) e2 -= 1;
        if (r() > 0.1) d2 += `M${f(x)} ${f(y)}H${f(e2)}`; x = e2 + 1.6 + r() * 5.5; continue;
      }
      const depth = (y - WY) / (H - WY);
      const len = 8 + r() * 70; let e2 = x + len; while (e2 > x && (eye(e2, y) || mass(e2, y))) e2 -= 1;
      if (r() < 0.62 - depth * 0.25) d1 += `M${f(x)} ${f(y)}H${f(e2)}`;
      x = e2 + 5 + r() * 36;
    }
  }
  // waterline
  const wl = `M0 ${WY}H${W}`;
  return `<path d="${d1}" stroke-width=".42" stroke-opacity=".8"/><path d="${d2}" stroke-width=".55" stroke-opacity=".9"/><path d="${d3}" stroke-width=".75"/><path class="bu" pathLength="1" style="--d:0" d="${wl}" stroke-width=".8"/>`;
}

function glints(r) {
  let d = '';
  for (let k = 0; k < 16; k++) {
    const y = WY + 8 + r() * 190; const x = r() * W; const len = 40 + r() * 260;
    d += `M${f(x)} ${f(y)}h${f(len)}`;
  }
  return `<g class="live"><path class="glint g1" d="${d}" stroke="${PAPER}" stroke-width="1.5" stroke-dasharray="3 31 7 52 2 44"/></g>`;
}

// ---------------------------------------------------------------- plane trees
function scallop(cx, cy, rad, r) {
  const n = Math.max(7, Math.round((2 * Math.PI * rad) / (7 + r() * 3)));
  const pts = [];
  const a0 = r() * Math.PI * 2;
  for (let k = 0; k < n; k++) {
    const a = a0 + (k / n) * Math.PI * 2;
    const rr = rad * (0.9 + r() * 0.16);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.86, a, rr]);
  }
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let k = 0; k < n; k++) {
    const p = pts[k], q = pts[(k + 1) % n];
    let am = (p[2] + q[2]) / 2; if (k === n - 1) am = p[2] + (Math.PI * 2) / n / 2;
    const rr = ((p[3] + q[3]) / 2) * (1.16 + r() * 0.08);
    d += `Q${f(cx + Math.cos(am) * rr)} ${f(cy + Math.sin(am) * rr * 0.86)} ${f(q[0])} ${f(q[1])}`;
  }
  return d + 'Z';
}
function vnoise(x, y, seed = 0) {
  return (Math.sin(x * 0.13 + seed) + Math.sin(y * 0.11 - seed * 1.3) + Math.sin((x + y) * 0.07 + seed * 2.1) + Math.sin((x - y) * 0.17 + seed * 0.7)) / 4;
}
// A foliage mass: lumpy outline edged with small leaf scallops; tone from short touches.
function mass(r, m, o = {}) {
  const { cx, cy, rx, ry } = m;
  const weight = o.weight ?? 1, tone = o.tone ?? 1;
  const lumps = []; const nl = 8 + Math.floor(r() * 5);
  for (let k = 0; k < nl; k++) lumps.push([r() * Math.PI * 2, 0.16 + r() * 0.22, (r() - 0.4) * 0.42]);
  const rad = (t) => { let v = 1; lumps.forEach(([a, w, amp]) => { let d = Math.atan2(Math.sin(t - a), Math.cos(t - a)); v += amp * Math.exp(-(d * d) / (w * w)); }); return v; };
  const inside = (x, y) => { const dx = (x - cx) / rx, dy = (y - cy) / ry; const t = Math.atan2(dy, dx); return Math.hypot(dx, dy) < rad(t) * 0.97; };
  // outline
  const per = Math.PI * (rx + ry); const n = Math.round(per / 4.2);
  const pts = [];
  for (let k = 0; k < n; k++) { const t = (k / n) * Math.PI * 2; const rr = rad(t) * (1 + (r() - 0.5) * 0.03); pts.push([cx + Math.cos(t) * rx * rr, cy + Math.sin(t) * ry * rr, t]); }
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let k = 0; k < n; k++) {
    const p = pts[k], q = pts[(k + 1) % n];
    const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
    const nx = mx - cx, ny = my - cy; const L = Math.hypot(nx, ny) || 1;
    const bump = 1.6 + r() * 1.8;
    d += `Q${f(mx + (nx / L) * bump)} ${f(my + (ny / L) * bump)} ${f(q[0])} ${f(q[1])}`;
  }
  d += 'Z';
  // touches
  let light = '', dark = '';
  const seed = r() * 50;
  const step = 2.75;
  for (let y = cy - ry * 1.4; y < cy + ry * 1.4; y += step) {
    for (let x = cx - rx * 1.4; x < cx + rx * 1.4; x += step) {
      const jx = x + (r() - 0.5) * step, jy = y + (r() - 0.5) * step;
      if (!inside(jx, jy)) continue;
      const nx = (jx - cx) / rx, ny = (jy - cy) / ry;
      const clus = vnoise(jx, jy, seed);
      let s = 0.44 + nx * 0.28 + ny * 0.58 + clus * 0.55;
      s = Math.max(0, Math.min(1, s)) * tone;
      if (r() > s * s * 1.1) continue;
      if (s > 0.72) {
        const len = 3 + r() * 3.5; dark += `M${f(jx - len / 2)} ${f(jy + 0.6)}l${f(len)} ${f(-1.1)}`;
      } else {
        const w = 1.6 + r() * 1.3; light += `M${f(jx - w)} ${f(jy)}q${f(w)} ${f(-w * 0.9)} ${f(w * 2)} 0`;
      }
    }
  }
  return { svg: `<path d="${d}" fill="${PAPER}" stroke-width="${0.42 * weight}" stroke-dasharray="${f(9 + r() * 6)} 1.6 ${f(4 + r() * 4)} 2.4"/><path d="${light}" stroke-width="${0.38 * weight}"/><path d="${dark}" stroke-width="${0.46 * weight}"/>`, inside };
}
function limbPath(pts, w0, w1) {
  // pts: centreline points; returns a tapered filled outline + a shade line
  const n = pts.length; const L = [], R = [];
  for (let k = 0; k < n; k++) {
    const a = pts[Math.max(0, k - 1)], b = pts[Math.min(n - 1, k + 1)];
    const tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1;
    const w = w0 + (w1 - w0) * (k / (n - 1));
    L.push([pts[k][0] - (ty / l) * w, pts[k][1] + (tx / l) * w]); R.push([pts[k][0] + (ty / l) * w, pts[k][1] - (tx / l) * w]);
  }
  const smooth = (arr) => { let d = `${f(arr[0][0])} ${f(arr[0][1])}`; for (let k = 1; k < arr.length - 1; k++) { const m = [(arr[k][0] + arr[k + 1][0]) / 2, (arr[k][1] + arr[k + 1][1]) / 2]; d += `Q${f(arr[k][0])} ${f(arr[k][1])} ${f(m[0])} ${f(m[1])}`; } const e = arr[arr.length - 1]; return d + `L${f(e[0])} ${f(e[1])}`; };
  const out = `M${smooth(L)}L${smooth([...R].reverse())}Z`;
  const S = pts.map((p, k) => [(p[0] + R[k][0] * 1.4) / 2.4, (p[1] + R[k][1] * 1.4) / 2.4]);
  return { d: out, shade: `M${smooth(S)}` };
}
function curve(x0, y0, x1, y1, bend, n = 6) {
  const pts = [];
  for (let k = 0; k <= n; k++) { const t = k / n; const x = x0 + (x1 - x0) * t + Math.sin(t * Math.PI) * bend; const y = y0 + (y1 - y0) * t - Math.sin(t * Math.PI) * Math.abs(bend) * 0.15; pts.push([x, y]); }
  return pts;
}
function barkPlates(r, poly, n) {
  // plane bark: large jigsaw plates, some left pale and some hatched dark
  const [xa, ya, xb, yb, halfAt] = poly; let p = '', hd = '';
  for (let k = 0; k < n; k++) {
    const py = ya + r() * (yb - ya); const hw = halfAt(py); const px = xa + (r() * 2 - 1) * hw * 0.82; const s = 3 + r() * 6;
    const pts = []; const m = 7;
    for (let q = 0; q < m; q++) { const a = (q / m) * Math.PI * 2; const rr = s * (0.5 + r() * 0.7); pts.push([px + Math.cos(a) * rr * 0.9, py + Math.sin(a) * rr * 1.35]); }
    p += `M${pts.map((q) => f(q[0]) + ' ' + f(q[1])).join('L')}Z`;
    if (r() < 0.45) for (let q = -s; q < s; q += 1.25) hd += `M${f(px - s * 0.45)} ${f(py + q)}h${f(s * 0.9)}`;
  }
  return { p, hd };
}
function planeTree(o, r) {
  const { x, y, h, bw, tw, limbs, masses, weight = 1, tone = 1 } = o;
  const fy = y - h;
  let out = '';
  let ld = '', ls = '';
  limbs.forEach(([pts, w0, w1]) => { const L = limbPath(pts, w0, w1); ld += L.d; ls += L.shade; const L2 = limbPath(pts.map((p) => [p[0] + w0 * 0.18, p[1]]), w0 * 0.55, w1 * 0.5); ls += L2.shade; });
  out += `<path d="${ld}" fill="${PAPER}" stroke-width="${0.75 * weight}"/><path d="${ls}" stroke-width="${0.45 * weight}"/>`;
  // trunk
  const trunk = `M${f(x - bw - 12)} ${y}C${f(x - bw + 1)} ${f(y - 5)} ${f(x - bw - 3)} ${f(y - h * 0.45)} ${f(x - tw)} ${f(fy)}L${f(x + tw)} ${f(fy)}C${f(x + bw + 2)} ${f(y - h * 0.5)} ${f(x + bw - 2)} ${f(y - 6)} ${f(x + bw + 14)} ${y}Z`;
  out += `<path d="${trunk}" fill="${PAPER}" stroke-width="${1 * weight}"/>`;
  const halfAt = (yy) => { const t = (y - yy) / h; return bw * (1 - t) + tw * t; };
  const bp = barkPlates(r, [x, fy + 3, x, y - 3, halfAt], Math.round(h * 0.42));
  let tsh = '';
  for (let k = 0; k < 10; k++) { const o2 = 0.38 + k * 0.064; tsh += `M${f(x + (bw + 8) * o2)} ${y - 1}C${f(x + bw * o2 * 1.02)} ${f(y - h * 0.4)} ${f(x + tw * o2 * 1.05)} ${f(y - h * 0.8)} ${f(x + tw * o2)} ${f(fy + 2)}`; }
  out += `<path d="${bp.p}" stroke-width="${0.45 * weight}"/><path d="${bp.hd}" stroke-width=".38"/><path d="${tsh}" stroke-width="${0.42 * weight}"/>`;
  masses.forEach((m) => { out += mass(r, m, { weight, tone }).svg; });
  return out;
}
function trees(r) {
  // Three plane trees on the Richmond bank, beside the stone (the café: "three majestic plane trees").
  const back = [{ cx: 1398, cy: 300, rx: 70, ry: 44 }, { cx: 1450, cy: 262, rx: 64, ry: 50 }].map((m) => mass(r, m, { weight: 0.7, tone: 0.75 }).svg).join('');
  const t2 = planeTree({ x: 1592, y: 512, h: 150, bw: 18, tw: 12, weight: 0.85, tone: 0.95,
    limbs: [[curve(1590, 370, 1560, 280, -12), 9, 3], [curve(1594, 372, 1616, 290, 8), 8, 3]],
    masses: [{ cx: 1590, cy: 300, rx: 52, ry: 50 }, { cx: 1560, cy: 250, rx: 44, ry: 40 }] }, r);
  const t1 = planeTree({ x: 1512, y: 516, h: 104, bw: 36, tw: 24,
    limbs: [
      [curve(1500, 424, 1380, 330, -18, 8), 15, 4], [curve(1404, 346, 1350, 318, -6), 6, 2],
      [curve(1508, 422, 1462, 250, -22, 8), 14, 4], [curve(1520, 420, 1548, 226, 16, 8), 13, 4],
      [curve(1530, 426, 1592, 330, 12), 10, 3],
    ],
    masses: [
      { cx: 1492, cy: 160, rx: 64, ry: 46 }, { cx: 1548, cy: 196, rx: 56, ry: 42 }, { cx: 1430, cy: 206, rx: 60, ry: 42 },
      { cx: 1380, cy: 262, rx: 52, ry: 36 }, { cx: 1596, cy: 252, rx: 44, ry: 44 }, { cx: 1490, cy: 236, rx: 62, ry: 40 },
      { cx: 1340, cy: 318, rx: 46, ry: 28 }, { cx: 1430, cy: 296, rx: 58, ry: 34 }, { cx: 1548, cy: 290, rx: 54, ry: 36 },
      { cx: 1500, cy: 330, rx: 40, ry: 22 },
      { cx: 1452, cy: 350, rx: 48, ry: 22 }, { cx: 1548, cy: 352, rx: 42, ry: 20 }, { cx: 1392, cy: 340, rx: 34, ry: 18 },
    ] }, r);
  const far = [{ cx: 46, cy: 410, rx: 74, ry: 62 }, { cx: 138, cy: 432, rx: 60, ry: 44 }, { cx: 212, cy: 455, rx: 40, ry: 30 }].map((m) => mass(r, m, { weight: 0.7, tone: 0.6 }).svg).join('');
  return { back, front: t2 + t1, far };
}

function banks(r) {
  // ground lines and the embankment edges; gravel stipple on the Richmond bank (the garden)
  let d = `M0 ${GROUND}H${L_BANK}M${R_BANK} ${GROUND}H${W}`;
  let edge = `M${L_BANK} ${GROUND}L${L_BANK + 6} ${WY}M${R_BANK} ${GROUND}L${R_BANK - 6} ${WY}`;
  let hatch = '';
  for (let x = 0; x < L_BANK; x += 2.4) hatch += `M${f(x)} ${GROUND + 1.5}v${f(2 + r() * 7)}`;
  for (let x = R_BANK; x < W; x += 2.4) hatch += `M${f(x)} ${GROUND + 6 + r() * 2}v${f(2 + r() * 4)}`;
  let dots = '';
  for (let k = 0; k < 320; k++) { const x = R_BANK + 4 + r() * (W - R_BANK - 4); const y = GROUND + 0.8 + r() * 5; dots += `M${f(x)} ${f(y)}h.6`; }
  let grass = '';
  for (let x = 2; x < L_BANK; x += 3 + r() * 4) grass += `M${f(x)} ${GROUND}l${f((r() - 0.5) * 3)} ${f(-2 - r() * 4)}`;
  // bank fill under the land arches region so the abutment base reads
  return `<path d="M0 ${GROUND}H${L_BANK}L${L_BANK + 6} ${WY}H0Z M${R_BANK} ${GROUND}H${W}V${WY}H${R_BANK - 6}Z" fill="${PAPER}" stroke="none"/>`
    + `<path class="bu" pathLength="1" style="--d:100" d="${d}${edge}" stroke-width=".85"/><path d="${hatch}" stroke-width=".4" stroke-opacity=".8"/><path d="${dots}" stroke-width="1" stroke-linecap="round"/><path d="${grass}" stroke-width=".45"/>`;
}

// ---------------------------------------------------------------- highlights (facts key)
function highlights() {
  const wash = `fill="${RIVER}" stroke="none" style="mix-blend-mode:multiply"`;
  const crowns = arches.map((a) => [a.cx, a.crownY]);
  let cd = `M${f(crowns[0][0] - 120)} ${f(crowns[0][1] + 22)}`;
  // smooth line through crowns
  crowns.forEach((c, k) => { cd += k === 0 ? `L${f(c[0])} ${f(c[1])}` : `L${f(c[0])} ${f(c[1])}`; });
  cd += `L${f(crowns[4][0] + 120)} ${f(crowns[4][1] + 22)}`;
  const dots = crowns.map((c) => `<circle cx="${f(c[0])}" cy="${f(c[1])}" r="4.2" fill="${INK}" stroke="none"/>`).join('');
  const cuts = piers.map((p) => `<path d="M${p.pc - p.r - 2} ${WY}V${p.capBase}A${p.r + 2} ${p.r + 2} 0 0 1 ${p.pc + p.r + 2} ${p.capBase}V${WY}Z" ${wash}/>`).join('');
  const lands = landArches.map((l) => `<path d="M${l.cx - l.r - 8} ${GROUND}V${l.sy}A${l.r + 8} ${l.r + 8} 0 0 1 ${l.cx + l.r + 8} ${l.sy}V${GROUND}Z" ${wash}/>`).join('');
  const ringsW = arches.map((a) => {
    const dy = a.cy - a.sy; const dxo = Math.sqrt((a.R + RING) ** 2 - dy * dy); const dxi = Math.sqrt(a.R ** 2 - dy * dy);
    return `<path d="M${f(a.cx - dxo)} ${a.sy}A${f(a.R + RING)} ${f(a.R + RING)} 0 0 1 ${f(a.cx + dxo)} ${a.sy}H${f(a.cx + dxi)}A${f(a.R)} ${f(a.R)} 0 0 0 ${f(a.cx - dxi)} ${a.sy}Z" ${wash}/>`;
  }).join('');
  const xs = []; for (let x = L_END; x <= R_END; x += 10) xs.push(x);
  let bal = ''; xs.forEach((x, n) => { bal += `${n ? 'L' : 'M'}${f(x)} ${f(yC(x) - 39)}`; }); [...xs].reverse().forEach((x) => { bal += `L${f(x)} ${f(yC(x) - 5)}`; }); bal += 'Z';
  let stone = `M${L_END} ${WY}`; xs.forEach((x) => { stone += `L${f(x)} ${f(yC(x) + 10)}`; }); stone += `L${R_END} ${WY}Z`;
  const T = 'transition:opacity .45s ease';
  return `<g class="hl" aria-hidden="true">`
    + `<g style="opacity:var(--hl-stone,0);${T}"><path d="${stone}" ${wash} fill-opacity=".45"/></g>`
    + `<g style="opacity:var(--hl-arches,0);${T}">${ringsW}<path d="${cd}" stroke="${INK}" stroke-width="1.3" stroke-dasharray="5 4" fill="none"/>${dots}</g>`
    + `<g style="opacity:var(--hl-cut,0);${T}">${cuts}</g>`
    + `<g style="opacity:var(--hl-land,0);${T}">${lands}</g>`
    + `<g style="opacity:var(--hl-bal,0);${T}"><path d="${bal}" ${wash}/></g>`
    + `</g>`;
}

// ---------------------------------------------------------------- assemble the plate
export function plate({ current = 3 } = {}) {
  const r = rng(1777);
  const T = trees(r);
  const ops = archOpenings(r);
  const parts = [];
  parts.push(`<rect x="0" y="0" width="${W}" height="${H}" fill="${PAPER}" stroke="none"/>`);
  parts.push(`<g class="t" style="--d:0">${sky(r)}</g>`);
  parts.push(`<g class="t" style="--d:500">${T.far}${T.back}</g>`);
  parts.push(`<g class="t" style="--d:250">${water(r)}</g>`);
  parts.push(glints(r));
  parts.push(`<g class="bridge">${silhouette()}<g class="t" style="--d:350">${coursing(r)}${abutments(r)}</g>`);
  parts.push(ops.map((o) => o.svg.replace(`class="arch a${o.i}"`, `class="arch a${o.i}${o.i === current ? ' is-current' : ''}"`)).join(''));
  parts.push(`${rings()}${cutwaters()}${landArchesSvg(r)}${cornice()}${balustrade()}</g>`);
  parts.push(`<g class="t" style="--d:650">${banks(r)}${T.front}</g>`);
  parts.push(highlights());
  const defs = `<defs>${ops.map((o) => o.clip).join('')}</defs>`;
  return { defs: compactAll(defs), art: compactAll(`<g id="plate-art" fill="none" stroke="${INK}" stroke-linecap="round" stroke-linejoin="round">${parts.join('')}</g>`) };
}

// ---------------------------------------------------------------- mobile bridge bar
// A condensed bridge: same span ratios, flatter heights, heavier lines for small sizes.
export function bar({ current = 3 } = {}) {
  const BY = 100; // water line
  const crown = [38, 46, 54, 46, 38], spring = [8, 8, 9, 8, 8];
  const dk = (x) => BY - 70 + 20 * ((x - 800) / 468) ** 2;
  const xA = 230, xB = 1370;
  let out = '';
  // deck & parapet
  const xs = []; for (let x = xA; x <= xB; x += 10) xs.push(x);
  const line = (o) => xs.map((x, n) => `${n ? 'L' : 'M'}${f(x)} ${f(dk(x) + o)}`).join('');
  let sil = `M${xA} ${BY}` + xs.map((x) => `L${f(x)} ${f(dk(x) - 18)}`).join('') + `L${xB} ${BY}Z`;
  out += `<path d="${sil}" fill="${PAPER}" stroke="none"/>`;
  let balD = '';
  for (let x = xA + 8; x < xB - 4; x += 13) balD += `M${f(x)} ${f(dk(x) - 3)}V${f(dk(x) - 14)}`;
  out += `<path d="${line(0)}" stroke-width="2.4"/><path d="${line(-3)}" stroke-width="1.4"/><path d="${balD}" stroke-width="1.6"/><path d="${line(-15)}" stroke-width="1.4"/><path d="${line(-18)}" stroke-width="2.6"/>`;
  // arches
  let x = 257;
  const geo = [];
  SPANS.forEach((s, i) => {
    const x0 = x, x1 = x + s, cx = (x0 + x1) / 2, sy = BY - spring[i], rise = crown[i] - spring[i];
    const R = (rise * rise + (s / 2) ** 2) / (2 * rise); const cy = BY - crown[i] + R;
    geo.push({ x0, x1, cx, sy, R, cy, i: i + 1, crownY: BY - crown[i] });
    x = x1 + P;
  });
  geo.forEach((a) => {
    const open = `M${a.x0} ${BY}V${a.sy}A${f(a.R)} ${f(a.R)} 0 0 1 ${a.x1} ${a.sy}V${BY}Z`;
    const ry = 2 * BY - a.sy;
    const refl = `M${a.x0} ${BY}V${ry}A${f(a.R)} ${f(a.R)} 0 0 0 ${a.x1} ${ry}V${BY}Z`;
    let hatch = '';
    for (let y = a.crownY + 4; y < BY; y += 6) { const h = y >= a.sy ? (a.x1 - a.x0) / 2 : Math.sqrt(Math.max(0, a.R ** 2 - (y - a.cy) ** 2)); if (h > 2) hatch += `M${f(a.cx - h + 2)} ${f(y)}H${f(a.cx + h - 2)}`; }
    const dy = a.cy - a.sy; const dxo = Math.sqrt((a.R + 9) ** 2 - dy * dy);
    out += `<g class="barch ba${a.i}${a.i === current ? ' is-current' : ''}">`
      + `<path d="${hatch}" stroke-width="1.2" stroke-opacity=".7"/>`
      + `<path class="bink" d="${open}" fill="${INK}" stroke="none"/><path class="bink" d="${refl}" fill="${INK}" stroke="none" opacity=".55"/>`
      + `<path d="M${a.x0} ${BY}V${a.sy}A${f(a.R)} ${f(a.R)} 0 0 1 ${a.x1} ${a.sy}V${BY}" stroke-width="2.6"/>`
      + `<path d="M${f(a.cx - dxo)} ${a.sy}A${f(a.R + 9)} ${f(a.R + 9)} 0 0 1 ${f(a.cx + dxo)} ${a.sy}" stroke-width="1.6"/>`
      + `</g>`;
  });
  // cutwaters
  for (let j = 0; j < 4; j++) {
    const pc = (geo[j].x1 + geo[j + 1].x0) / 2; const cb = Math.min(geo[j].sy, geo[j + 1].sy) - 4;
    out += `<path d="M${pc - 15} ${BY}V${cb}A15 15 0 0 1 ${pc + 15} ${cb}V${BY}Z" fill="${PAPER}" stroke-width="1.8"/><path d="M${pc + 8} ${cb + 3}V${BY}M${pc + 12} ${cb + 3}V${BY}" stroke-width="1"/>`;
  }
  // water
  let wd = `M${xA - 30} ${BY}H${xB + 30}`;
  const rr = rng(59);
  for (let y = BY + 7; y < BY + 34; y += 7) { let xx = xA; while (xx < xB) { const len = 20 + rr() * 80; wd += `M${f(xx)} ${f(y)}h${f(len)}`; xx += len + 14 + rr() * 40; } }
  out += `<path d="${wd}" stroke-width="1.3" stroke-opacity=".8"/>`;
  const vb = `${xA - 4} ${BY - 96} ${xB - xA + 8} 132`;
  return { vb, svg: compactAll(`<g fill="none" stroke="${INK}" stroke-linecap="round" stroke-linejoin="round">${out}</g>`) };
}

// ---------------------------------------------------------------- small locator ornament
export function locator(n) {
  const geo = [[6, 18, 8, 11], [22, 38, 6, 12], [41, 59, 4, 13], [62, 78, 6, 12], [81, 93, 8, 11]];
  let o = `<path d="M2 3.2Q50 0.4 98 3.2M2 5.4Q50 2.6 98 5.4" stroke-width=".9"/>`;
  geo.forEach(([a, b, top], k) => {
    const d = `M${a} 18V14Q${(a + b) / 2} ${top - 1} ${b} 14V18`;
    o += k + 1 === n ? `<path d="${d}Z" fill="${INK}" stroke-width="1"/>` : `<path d="${d}" stroke-width="1"/>`;
  });
  o += `<path d="M0 18H100" stroke-width=".9"/>`;
  return `<svg class="locator" viewBox="0 0 100 20" width="100" height="20" aria-hidden="true" focusable="false"><g fill="none" stroke="${INK}" stroke-linecap="round">${o}</g></svg>`;
}

export function favicon() {
  const s = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='6' fill='%232A2F33'/><g fill='none' stroke='%23FFEBC0' stroke-width='3' stroke-linecap='round'><path d='M4 22Q32 16 60 22'/><path d='M6 44V38Q10 33 14 38V44M19 44V35Q24.5 28 30 35V44'/><path d='M34 44V35Q39.5 28 45 35V44M50 44V38Q54 33 58 38V44'/><path d='M4 44H60'/><path d='M10 52H22M30 52H48' stroke-width='2'/></g><path d='M22 44V33Q32 22 42 33V44Z' fill='%23FFEBC0'/></svg>`;
  return s;
}
