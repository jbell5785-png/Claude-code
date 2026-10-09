// 3D closed-loop track geometry, ground queries and scenery data (owner D: tracks).
//
// Pipeline (createTrack):
//   control points (x, y, z, width, bank) → centripetal Catmull–Rom (dense, ~0.2 m)
//   → uniform 0.25 m resample → circular Gaussian smoothing (curvature/bank/width continuity)
//   → cubic resample at ds ≈ 1 m (start/finish line at s = 0) → tangents, normals, curvature
//   → kerbs / gravel / run-off extents → terrain grid → spatial hash for global queries.
//
// Ground model (per side, e = lateral distance outside the asphalt edge):
//   e <= 0           asphalt, banked plane  z = zc(s) + offset * m(s),  m = -tan(bank)
//   0 < e < KERB_W   kerb (where the kerb intensity is > 0): raised ridged profile on the plane
//   e < runoff       plane continues (grass / gravel)
//   runoff..edgeEnd  C1 smoothstep blend from the plane to the global terrain T(x, y)
//   e >= edgeEnd     terrain T(x, y) (bicubic grid, gentle, built from the track elevation)
// Bank convention: bank > 0 lowers the LEFT edge (banked for a left-hand turn).
// The ground normal is computed analytically from the gradient of this height function.

import { SURFACE } from './constants.js';
import { rng, hashString } from './tracks/util.js';
import { buildSamples, computeFrame, boxCirc, minFilterCirc } from './tracks/geometry.js';
import { buildRaycaster } from './tracks/raycast.js';
import { gpDef } from './tracks/gp.js';
import { clubDef } from './tracks/club.js';
import { speedwayDef } from './tracks/speedway.js';
import { mountainDef } from './tracks/mountain.js';
import { skidpadDef, dragDef } from './tracks/testtracks.js';
import { randomTrackDef } from './tracks/random.js';
import { gauntletDef } from './tracks/gauntlet.js';

export { createLapTimer } from './laptimer.js';

/** Track preset registry: key → { label, build(arg?) → trackDef }. */
export const TRACKS = {
  gp: { label: 'Grand Prix Circuit', build: gpDef },
  club: { label: 'Club Circuit', build: clubDef },
  speedway: { label: 'Speedway (tri-oval)', build: speedwayDef },
  mountain: { label: 'Mountain Loop', build: mountainDef },
  skidpad: { label: 'Skidpad (50 m radius)', build: skidpadDef },
  drag: { label: 'Drag Oval (1.6 km straights)', build: dragDef },
  gauntlet: { label: 'Gauntlet (held-out test)', build: gauntletDef },
  random: { label: 'Random (seeded)', build: (seed = 1) => randomTrackDef(seed) },
};

/** Raycast mask bits / hit kinds. */
export const RAY = { EDGE: 1, WALL: 2, OBSTACLE: 4 };

// Cross-section constants.
export const KERB_W = 1.1;          // m, kerb width outside the asphalt edge
const KERB_H = 0.025;               // m, kerb base height
const RIDGE_H = 0.015;              // m, ridge amplitude on top of the base
const RIDGE_LEN = 1.0;              // m, ridge wavelength along s (snapped so the loop is periodic)
const KERB_IN = 0.25, KERB_OUT = 0.3; // m, kerb ramp widths (inner / outer)
const GRAVEL_START = 3.0;           // m outside the asphalt edge

const TWO_PI = Math.PI * 2;

function resolveDef(keyOrDef) {
  if (typeof keyOrDef === 'string') {
    const [k, arg] = keyOrDef.split(':');
    const e = TRACKS[k];
    if (!e) throw new Error(`Unknown track '${keyOrDef}'`);
    const d = arg != null ? e.build(Number(arg)) : e.build();
    d.key = d.key || k;
    return d;
  }
  if (keyOrDef && keyOrDef.type === 'random') return randomTrackDef(keyOrDef.seed ?? 1, keyOrDef);
  if (keyOrDef && keyOrDef.points) return keyOrDef;
  throw new Error('createTrack: expected a track key or a track definition with points');
}

// ---------------------------------------------------------------------------------------------
// Spatial hash over samples (global nearest-sample search)
// ---------------------------------------------------------------------------------------------

function buildHash(X, Y, n, cell) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let i = 0; i < n; i++) {
    if (X[i] < minX) minX = X[i]; if (X[i] > maxX) maxX = X[i];
    if (Y[i] < minY) minY = Y[i]; if (Y[i] > maxY) maxY = Y[i];
  }
  const x0 = minX - cell, y0 = minY - cell;
  const cols = Math.ceil((maxX - x0) / cell) + 2, rows = Math.ceil((maxY - y0) / cell) + 2;
  const count = new Int32Array(cols * rows + 1);
  const cellOf = new Int32Array(n);
  for (let i = 0; i < n; i++) {
    const c = Math.floor((X[i] - x0) / cell) + cols * Math.floor((Y[i] - y0) / cell);
    cellOf[i] = c; count[c + 1]++;
  }
  for (let c = 0; c < cols * rows; c++) count[c + 1] += count[c];
  const start = Int32Array.from(count);
  const items = new Int32Array(n);
  const fill = Int32Array.from(count);
  for (let i = 0; i < n; i++) items[fill[cellOf[i]]++] = i;
  return { x0, y0, cell, cols, rows, start, items, minX, minY, maxX, maxY };
}

function makeNearest(X, Y, H) {
  const { x0, y0, cell, cols, rows, start, items } = H;
  const maxR = Math.max(cols, rows);
  let lastD2 = 0;
  /** Nearest sample index to (x, y). Squared distance in nearest.d2. */
  function nearest(x, y) {
    let cx = Math.floor((x - x0) / cell), cy = Math.floor((y - y0) / cell);
    if (cx < 0) cx = 0; else if (cx >= cols) cx = cols - 1;
    if (cy < 0) cy = 0; else if (cy >= rows) cy = rows - 1;
    let best = -1, bd = Infinity;
    for (let r = 0; r <= maxR; r++) {
      const ya = cy - r, yb = cy + r;
      for (let yy = ya; yy <= yb; yy++) {
        if (yy < 0 || yy >= rows) continue;
        const edgeRow = yy === ya || yy === yb;
        const stepX = edgeRow ? 1 : 2 * r;
        for (let xx = cx - r; xx <= cx + r; xx += stepX || 1) {
          if (xx < 0 || xx >= cols) continue;
          const c = xx + yy * cols;
          for (let q = start[c], e = start[c + 1]; q < e; q++) {
            const i = items[q];
            const dx = X[i] - x, dy = Y[i] - y, d2 = dx * dx + dy * dy;
            if (d2 < bd) { bd = d2; best = i; }
          }
        }
      }
      if (best >= 0 && bd <= (r * cell) * (r * cell)) break;
    }
    lastD2 = bd;
    return best;
  }
  nearest.lastD2 = () => lastD2;
  return nearest;
}

// ---------------------------------------------------------------------------------------------
// Terrain grid (bicubic Catmull–Rom, C1)
// ---------------------------------------------------------------------------------------------

function buildTerrain(S, def, seed) {
  const { n, X, Y, Z } = S;
  const tdef = def.terrain || {};
  const R = tdef.radius ?? 80;
  const amp = tdef.amp ?? 1.5;
  const cell = tdef.cell ?? 8;
  const margin = tdef.margin ?? 360;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity, zSum = 0, zMin = Infinity;
  for (let i = 0; i < n; i++) {
    minX = Math.min(minX, X[i]); maxX = Math.max(maxX, X[i]);
    minY = Math.min(minY, Y[i]); maxY = Math.max(maxY, Y[i]);
    zSum += Z[i]; zMin = Math.min(zMin, Z[i]);
  }
  const zRef = tdef.base ?? zSum / n;
  const x0 = minX - margin, y0 = minY - margin;
  const cols = Math.ceil((maxX - x0 + margin) / cell) + 1;
  const rows = Math.ceil((maxY - y0 + margin) / cell) + 1;
  // two-scale compact-kernel splat of the centreline elevation: fine (radius R) follows the road,
  // coarse (radius 3R) forms the surrounding hills; far away the terrain tends to the mean height.
  const splat = (Rk, strideM) => {
    const sw = new Float64Array(cols * rows), swz = new Float64Array(cols * rows);
    const stride = Math.max(1, Math.round(strideM / S.ds));
    const rc = Math.ceil(Rk / cell);
    for (let i = 0; i < n; i += stride) {
      const gx = Math.round((X[i] - x0) / cell), gy = Math.round((Y[i] - y0) / cell);
      for (let yy = Math.max(0, gy - rc); yy <= Math.min(rows - 1, gy + rc); yy++) {
        const py = y0 + yy * cell - Y[i];
        for (let xx = Math.max(0, gx - rc); xx <= Math.min(cols - 1, gx + rc); xx++) {
          const px = x0 + xx * cell - X[i];
          const q = (px * px + py * py) / (Rk * Rk);
          if (q >= 1) continue;
          const w = (1 - q) * (1 - q) * (1 - q) * stride;
          sw[xx + yy * cols] += w; swz[xx + yy * cols] += w * Z[i];
        }
      }
    }
    return { sw, swz };
  };
  const fine = splat(R, 2), coarse = splat(3 * R, 6);
  const r = rng(seed ^ 0x5bd1e995);
  const ph = [r() * TWO_PI, r() * TWO_PI, r() * TWO_PI, r() * TWO_PI];
  const H = new Float32Array(cols * rows);
  const w0 = 1.0;
  for (let yy = 0; yy < rows; yy++) {
    for (let xx = 0; xx < cols; xx++) {
      const k = xx + yy * cols;
      const x = x0 + xx * cell, y = y0 + yy * cell;
      const sw = fine.sw[k], swz = fine.swz[k];
      const T2 = (coarse.swz[k] + w0 * zRef) / (coarse.sw[k] + w0);
      const cw = 2.0; // weight of the coarse field against the fine one
      const far = cw / (sw + cw);
      const noise = amp * (Math.sin(x / 97 + ph[0]) * Math.sin(y / 131 + ph[1])
        + 0.5 * Math.sin((x + y) / 59 + ph[2]) + 0.35 * Math.sin((x - 2 * y) / 173 + ph[3]));
      H[k] = (swz + cw * T2) / (sw + cw) + far * noise;
    }
  }
  return { x0, y0, cell, cols, rows, heights: H };
}

function makeTerrainEval(T) {
  const { x0, y0, cell, cols, rows, heights: H } = T;
  const inv = 1 / cell;
  const out = { h: 0, dx: 0, dy: 0 };
  function evalT(x, y) {
    let fx = (x - x0) * inv, fy = (y - y0) * inv;
    let clampX = false, clampY = false;
    if (fx < 0) { fx = 0; clampX = true; } else if (fx > cols - 1.000001) { fx = cols - 1.000001; clampX = true; }
    if (fy < 0) { fy = 0; clampY = true; } else if (fy > rows - 1.000001) { fy = rows - 1.000001; clampY = true; }
    const ix = Math.floor(fx), iy = Math.floor(fy);
    const u = fx - ix, v = fy - iy;
    const u2 = u * u, u3 = u2 * u, v2 = v * v, v3 = v2 * v;
    const wx0 = 0.5 * (-u3 + 2 * u2 - u), wx1 = 0.5 * (3 * u3 - 5 * u2 + 2);
    const wx2 = 0.5 * (-3 * u3 + 4 * u2 + u), wx3 = 0.5 * (u3 - u2);
    const dx0 = 0.5 * (-3 * u2 + 4 * u - 1), dx1 = 0.5 * (9 * u2 - 10 * u);
    const dx2 = 0.5 * (-9 * u2 + 8 * u + 1), dx3 = 0.5 * (3 * u2 - 2 * u);
    const wy0 = 0.5 * (-v3 + 2 * v2 - v), wy1 = 0.5 * (3 * v3 - 5 * v2 + 2);
    const wy2 = 0.5 * (-3 * v3 + 4 * v2 + v), wy3 = 0.5 * (v3 - v2);
    const dy0 = 0.5 * (-3 * v2 + 4 * v - 1), dy1 = 0.5 * (9 * v2 - 10 * v);
    const dy2 = 0.5 * (-9 * v2 + 8 * v + 1), dy3 = 0.5 * (3 * v2 - 2 * v);
    let h = 0, gx = 0, gy = 0;
    for (let b = 0; b < 4; b++) {
      let yy = iy - 1 + b; if (yy < 0) yy = 0; else if (yy >= rows) yy = rows - 1;
      const wy = b === 0 ? wy0 : b === 1 ? wy1 : b === 2 ? wy2 : wy3;
      const dy = b === 0 ? dy0 : b === 1 ? dy1 : b === 2 ? dy2 : dy3;
      const base = yy * cols;
      let xm = ix - 1; if (xm < 0) xm = 0;
      let xp = ix + 1; if (xp >= cols) xp = cols - 1;
      let xq = ix + 2; if (xq >= cols) xq = cols - 1;
      const h0 = H[base + xm], h1 = H[base + ix], h2 = H[base + xp], h3 = H[base + xq];
      const rowV = wx0 * h0 + wx1 * h1 + wx2 * h2 + wx3 * h3;
      const rowD = dx0 * h0 + dx1 * h1 + dx2 * h2 + dx3 * h3;
      h += wy * rowV; gx += wy * rowD; gy += dy * rowV;
    }
    out.h = h;
    out.dx = clampX ? 0 : gx * inv;
    out.dy = clampY ? 0 : gy * inv;
    return out;
  }
  return evalT;
}

// ---------------------------------------------------------------------------------------------
// Corner analysis: kerbs and gravel
// ---------------------------------------------------------------------------------------------

function findCorners(K, thr) {
  const n = K.length;
  const on = (i) => Math.abs(K[i]) > thr;
  const runs = [];
  if (Array.from({ length: n }, (_, i) => i).every(on)) {
    runs.push({ a: 0, len: n, sign: Math.sign(K[0]), full: true });
    return runs;
  }
  // start scanning at an "off" index
  let s0 = 0;
  while (on(s0)) s0++;
  let i = 0;
  while (i < n) {
    const idx = (s0 + i) % n;
    if (on(idx)) {
      const sign = Math.sign(K[idx]);
      let len = 0;
      while (i + len < n && on((s0 + i + len) % n) && Math.sign(K[(s0 + i + len) % n]) === sign) len++;
      runs.push({ a: idx, len, sign });
      i += len;
    } else i++;
  }
  return runs;
}

// ---------------------------------------------------------------------------------------------
// createTrack
// ---------------------------------------------------------------------------------------------

/**
 * Build a track from a preset key (e.g. 'gp', 'random:42') or a track definition.
 * @param {string|object} keyOrDef
 * @returns {object} track (see ARCHITECTURE.md §6)
 */
export function createTrack(keyOrDef) {
  const def = resolveDef(keyOrDef);
  const S = buildSamples(def);
  const { n, ds, L, X, Y, Z, Wd, B } = S;
  const seed = hashString(String(def.key ?? def.label ?? 'track') + ':' + (def.seed ?? 0));

  // --- differential geometry
  const { TX, TY, TZ, NX, NY, GR, KAP } = computeFrame(S);
  // vertical curvature (for stats / AI): d(grade)/ds
  const KV = new Float64Array(n);
  for (let i = 0; i < n; i++) KV[i] = (GR[(i + 1) % n] - GR[(i - 1 + n) % n]) / (2 * ds);

  const BANK = new Float64Array(n), MS = new Float64Array(n);
  const WL = new Float64Array(n), WR = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    BANK[i] = (B[i] * Math.PI) / 180;
    MS[i] = -Math.tan(BANK[i]);
    WL[i] = Wd[i] / 2; WR[i] = Wd[i] / 2;
  }

  // --- spatial hash
  const hash = buildHash(X, Y, n, 12);
  const nearest = makeNearest(X, Y, hash);

  // --- free lateral distance per side (distance along the normal until another part of the
  //     track, or the inside centre of curvature, becomes closer)
  const DMAX = 70;
  const local = Math.max(3, Math.ceil(3 / ds));
  const freeL = new Float64Array(n), freeR = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    for (let side = 0; side < 2; side++) {
      const sg = side === 0 ? 1 : -1;
      let f = DMAX;
      for (let d = 1; d <= DMAX; d += d < 20 ? 1 : 2) {
        const j = nearest(X[i] + sg * d * NX[i], Y[i] + sg * d * NY[i]);
        let dj = Math.abs(j - i); if (dj > n / 2) dj = n - dj;
        if (dj > local) { f = d - 0.5; break; }
      }
      (side === 0 ? freeL : freeR)[i] = f;
    }
  }

  // --- edge (terrain blend end) and run-off plane extents
  const edgeMax = def.edgeMax ?? 30;
  const runoffDef = def.runoff ?? 8;
  const win = Math.ceil(12 / ds);
  const mkEdge = (free, W) => {
    const a = new Float64Array(n);
    for (let i = 0; i < n; i++) a[i] = Math.max(2.5, Math.min(edgeMax, 0.9 * (free[i] - W[i]) - 0.5));
    return boxCirc(minFilterCirc(a, win), Math.ceil(win / 2), 1);
  };
  const EL = mkEdge(freeL, WL), ER = mkEdge(freeR, WR);
  const RL = new Float64Array(n), RR = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    RL[i] = Math.max(KERB_W + 0.4, Math.min(runoffDef, 0.35 * EL[i]));
    RR[i] = Math.max(KERB_W + 0.4, Math.min(runoffDef, 0.35 * ER[i]));
    if (RL[i] > EL[i] - 1) RL[i] = EL[i] - 1;
    if (RR[i] > ER[i] - 1) RR[i] = ER[i] - 1;
  }

  // --- kerbs & gravel from corner analysis
  const KL = new Float64Array(n), KR = new Float64Array(n);
  const GVL = new Float64Array(n), GVR = new Float64Array(n);
  const corners = [];
  if (def.kerbs !== false) {
    const thr = def.kerbCurvature ?? 1 / 150;
    for (const c of findCorners(KAP, thr)) {
      corners.push(c);
      const inside = c.sign > 0 ? KL : KR, outside = c.sign > 0 ? KR : KL;
      if (c.full) { inside.fill(1); continue; }
      let apex = c.a, km = 0;
      for (let q = 0; q < c.len; q++) {
        const i = (c.a + q) % n;
        if (Math.abs(KAP[i]) > km) { km = Math.abs(KAP[i]); apex = q; }
      }
      const pre = Math.ceil(4 / ds), post = Math.ceil(4 / ds), exitX = Math.ceil(18 / ds);
      for (let q = -pre; q < c.len + post; q++) inside[(c.a + q + n * 4) % n] = 1;
      if (c.len * ds > 8) for (let q = Math.floor(apex + (c.len - apex) * 0.5); q < c.len + exitX; q++) outside[(c.a + q + n * 4) % n] = 1;
    }
  }
  const ramp = Math.max(1, Math.round(1.5 / ds));
  const KLs = boxCirc(KL, ramp, 2), KRs = boxCirc(KR, ramp, 2);
  if (def.gravel !== false) {
    const thrG = 1 / 450;
    for (const c of findCorners(KAP, thrG)) {
      if (c.full) continue;
      let km = 0;
      for (let q = 0; q < c.len; q++) km = Math.max(km, Math.abs(KAP[(c.a + q) % n]));
      if (c.len * ds < 15) continue;
      const outside = c.sign > 0 ? GVR : GVL;
      const E = c.sign > 0 ? ER : EL;
      const pre = Math.ceil(25 / ds), post = Math.ceil((km > 1 / 40 ? 50 : 80) / ds);
      for (let q = -pre; q < c.len + post; q++) {
        const i = (c.a + q + n * 4) % n;
        if (E[i] >= GRAVEL_START + 8) outside[i] = 1;
      }
    }
  }
  const GLs = boxCirc(GVL, Math.ceil(3 / ds), 1), GRs = boxCirc(GVR, Math.ceil(3 / ds), 1);
  // gravel extent (outer limit) per side
  const GEL = new Float64Array(n), GER = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    GEL[i] = Math.min(GRAVEL_START + (def.gravelDepth ?? 22), EL[i] - 1.5);
    GER[i] = Math.min(GRAVEL_START + (def.gravelDepth ?? 22), ER[i] - 1.5);
  }

  // --- terrain
  const terrain = buildTerrain(S, def, seed);
  const evalT = makeTerrainEval(terrain);

  // Kerb ridge wavelength snapped so that the pattern is periodic over the loop.
  const ridgeK = TWO_PI / (L / Math.max(1, Math.round(L / RIDGE_LEN)));

  // =============================================================================================
  // Hot path: projection and ground evaluation (no allocation)
  // =============================================================================================
  let _t = 0, _o = 0, _gtx = 0, _gty = 0, _gox = 0, _goy = 0;

  /** Solve for segment-local t such that (P - C(t)) ∥ N(t); returns t (NaN if degenerate). */
  function solveT(i, x, y) {
    const j = i + 1 === n ? 0 : i + 1;
    const ax = X[i], ay = Y[i];
    const dx = X[j] - ax, dy = Y[j] - ay;
    const n0x = NX[i], n0y = NY[i];
    const dnx = NX[j] - n0x, dny = NY[j] - n0y;
    const qx = x - ax, qy = y - ay;
    const c0 = qx * n0y - qy * n0x;
    const c1 = (qx * dny - qy * dnx) - (dx * n0y - dy * n0x);
    const c2 = -(dx * dny - dy * dnx);
    // c2 is tiny (normal change per segment): linear guess + 2 Newton steps on the quadratic
    let t = -c0 / c1;
    t -= (c0 + t * (c1 + c2 * t)) / (c1 + 2 * c2 * t);
    t -= (c0 + t * (c1 + c2 * t)) / (c1 + 2 * c2 * t);
    return t;
  }

  /** Given segment i and local t, compute offset and the gradients of t and offset w.r.t. x,y. */
  function project(i, t, x, y) {
    const j = i + 1 === n ? 0 : i + 1;
    const dx = X[j] - X[i], dy = Y[j] - Y[i];
    const dnx = NX[j] - NX[i], dny = NY[j] - NY[i];
    let nx = NX[i] + t * dnx, ny = NY[i] + t * dny;
    const nl = 1 / Math.sqrt(nx * nx + ny * ny);
    nx *= nl; ny *= nl;
    const px = x - X[i] - t * dx, py = y - Y[i] - t * dy;
    const o = px * nx + py * ny;
    const j1x = dx + o * dnx, j1y = dy + o * dny;
    const det = j1x * ny - j1y * nx;
    const idet = 1 / det;
    _t = t; _o = o;
    _gtx = ny * idet; _gty = -nx * idet;
    _gox = -j1y * idet; _goy = j1x * idet;
  }

  /** Walk from segment i to the segment containing the projection of (x,y); -1 on failure. */
  function walk(i, x, y, maxIter) {
    let dir = 0;
    for (let k = 0; k < maxIter; k++) {
      const t = solveT(i, x, y);
      if (t >= 0 && t <= 1) { _t = t; return i; }
      if (t < 0) {
        if (dir === 1) return -1;
        dir = -1; i = i === 0 ? n - 1 : i - 1;
      } else if (t > 1) {
        if (dir === -1) return -1;
        dir = 1; i = i + 1 === n ? 0 : i + 1;
      } else return -1; // NaN
    }
    return -1;
  }

  function globalSeg(x, y) {
    const j = nearest(x, y);
    let i = walk(j, x, y, 6);
    if (i < 0) {
      // fold / degenerate region: pick the adjacent segment and clamp t
      let t = solveT(j, x, y);
      i = j;
      if (!(t >= 0)) { i = j === 0 ? n - 1 : j - 1; t = solveT(i, x, y); }
      _t = t >= 0 ? (t <= 1 ? t : 1) : 0;
    }
    return i;
  }

  /** True if the projection (_t,_o) on segment i lies in the region owned by that segment. */
  function owned(i) {
    const j = i + 1 === n ? 0 : i + 1;
    const t = _t;
    if (_o >= 0) return _o - (WL[i] + t * (WL[j] - WL[i])) <= EL[i] + t * (EL[j] - EL[i]);
    return -_o - (WR[i] + t * (WR[j] - WR[i])) <= ER[i] + t * (ER[j] - ER[i]);
  }

  /**
   * Ground query. Finds the centreline segment, signed lateral offset (+left), arc length s,
   * ground height & normal (consistent with the height function), surface id.
   * @param {number} x
   * @param {number} y
   * @param {number} hint  last segment index (out.index), or -1 for a global search
   * @param {object} out   { s, offset, height, nx, ny, nz, surface, index } (filled)
   * @returns {object} out
   */
  function query(x, y, hint, out) {
    let i = -1;
    if (hint >= 0 && hint < n) {
      i = walk(hint | 0, x, y, 24);
      if (i >= 0) {
        project(i, _t, x, y);
        if (!owned(i)) i = -1;
      }
    }
    if (i < 0) {
      i = globalSeg(x, y);
      project(i, _t, x, y);
    }
    evaluate(i, x, y, out);
    return out;
  }

  function evaluate(i, x, y, out) {
    const j = i + 1 === n ? 0 : i + 1;
    const t = _t, o = _o;
    const s = (i + t) * ds;
    // centreline height (cubic Hermite in s) and banked plane
    const t2 = t * t, t3 = t2 * t;
    const z0 = Z[i], z1 = Z[j], m0 = GR[i] * ds, m1 = GR[j] * ds;
    const zc = (2 * t3 - 3 * t2 + 1) * z0 + (t3 - 2 * t2 + t) * m0 + (-2 * t3 + 3 * t2) * z1 + (t3 - t2) * m1;
    const zct = (6 * t2 - 6 * t) * z0 + (3 * t2 - 4 * t + 1) * m0 + (-6 * t2 + 6 * t) * z1 + (3 * t2 - 2 * t) * m1;
    const ms0 = MS[i], dms = MS[j] - ms0, msl = ms0 + t * dms;
    let H = zc + o * msl, Ht = zct + o * dms, Ho = msl;
    let surface = SURFACE.ASPHALT;
    let tW = 0, tX = 0, tY = 0; // terrain blend weight and its xy-gradient contribution

    let e, et, eo, kI, dk, gI, gEnd, eEnd, deEnd, R0, dR0;
    if (o >= 0) {
      const w = WL[i] + t * (WL[j] - WL[i]);
      e = o - w; et = -(WL[j] - WL[i]); eo = 1;
      if (e > 0) {
        kI = KLs[i] + t * (KLs[j] - KLs[i]); dk = KLs[j] - KLs[i];
        gI = GLs[i] + t * (GLs[j] - GLs[i]); gEnd = GEL[i] + t * (GEL[j] - GEL[i]);
        eEnd = EL[i] + t * (EL[j] - EL[i]); deEnd = EL[j] - EL[i];
        R0 = RL[i] + t * (RL[j] - RL[i]); dR0 = RL[j] - RL[i];
      }
    } else {
      const w = WR[i] + t * (WR[j] - WR[i]);
      e = -o - w; et = -(WR[j] - WR[i]); eo = -1;
      if (e > 0) {
        kI = KRs[i] + t * (KRs[j] - KRs[i]); dk = KRs[j] - KRs[i];
        gI = GRs[i] + t * (GRs[j] - GRs[i]); gEnd = GER[i] + t * (GER[j] - GER[i]);
        eEnd = ER[i] + t * (ER[j] - ER[i]); deEnd = ER[j] - ER[i];
        R0 = RR[i] + t * (RR[j] - RR[i]); dR0 = RR[j] - RR[i];
      }
    }
    let hx, hy;
    if (e <= 0) {
      hx = Ht * _gtx + Ho * _gox; hy = Ht * _gty + Ho * _goy;
    } else if (e >= eEnd) {
      const T = evalT(x, y);
      H = T.h; hx = T.dx; hy = T.dy;
      surface = gI > 0.5 && e > GRAVEL_START && e < gEnd ? SURFACE.GRAVEL : SURFACE.GRASS;
    } else {
      // kerb
      if (e < KERB_W && kI > 0) {
        // C1 profile: ramp in over [0, KERB_IN], ramp out over [KERB_W-KERB_OUT, KERB_W]
        let a = 1, da = 0, b = 1, db = 0;
        if (e < KERB_IN) { const u = e / KERB_IN; a = u * u * (3 - 2 * u); da = 6 * u * (1 - u) / KERB_IN; }
        const eo2 = e - (KERB_W - KERB_OUT);
        if (eo2 > 0) { const u = eo2 / KERB_OUT; b = 1 - u * u * (3 - 2 * u); db = -6 * u * (1 - u) / KERB_OUT; }
        const p = a * b, pe = da * b + a * db;
        const ph = s * ridgeK;
        const rr = 0.5 - 0.5 * Math.cos(ph), rrt = 0.5 * Math.sin(ph) * ridgeK * ds;
        const amp = KERB_H + RIDGE_H * rr;
        const hk = kI * amp * p;
        H += hk;
        Ht += (dk * amp + kI * RIDGE_H * rrt) * p + kI * amp * pe * et;
        Ho += kI * amp * pe * eo;
        surface = kI > 0.5 ? SURFACE.KERB : SURFACE.GRASS;
      } else {
        surface = gI > 0.5 && e > GRAVEL_START && e < gEnd ? SURFACE.GRAVEL : SURFACE.GRASS;
      }
      if (e > R0) {
        const den = eEnd - R0;
        const u = (e - R0) / den;
        const w = u * u * (3 - 2 * u), dw = 6 * u * (1 - u);
        const ut = (et - dR0 - u * (deEnd - dR0)) / den, uo = eo / den;
        const T = evalT(x, y);
        const dH = T.h - H;
        Ht = (1 - w) * Ht + dH * dw * ut;
        Ho = (1 - w) * Ho + dH * dw * uo;
        H = H + w * dH;
        tW = w; tX = T.dx; tY = T.dy;
      }
      hx = Ht * _gtx + Ho * _gox + tW * tX;
      hy = Ht * _gty + Ho * _goy + tW * tY;
    }
    const inv = 1 / Math.sqrt(hx * hx + hy * hy + 1);
    out.s = s >= L ? s - L : s;
    out.offset = o;
    out.height = H;
    out.nx = -hx * inv; out.ny = -hy * inv; out.nz = inv;
    out.surface = surface;
    out.index = i;
    return out;
  }

  // =============================================================================================
  // Convenience API
  // =============================================================================================

  /**
   * Centreline point at arc length s (wraps).
   * @returns {{x,y,z,tx,ty,heading,curvature,bank,nx,ny,grade,widthL,widthR,index}}
   */
  function pointAt(s, out = {}) {
    s = s % L; if (s < 0) s += L;
    let fi = s / ds;
    let i = Math.floor(fi); if (i >= n) i = n - 1;
    const t = fi - i, j = i + 1 === n ? 0 : i + 1;
    const t2 = t * t, t3 = t2 * t;
    out.x = X[i] + t * (X[j] - X[i]);
    out.y = Y[i] + t * (Y[j] - Y[i]);
    out.z = (2 * t3 - 3 * t2 + 1) * Z[i] + (t3 - 2 * t2 + t) * GR[i] * ds + (-2 * t3 + 3 * t2) * Z[j] + (t3 - t2) * GR[j] * ds;
    let tx = TX[i] + t * (TX[j] - TX[i]), ty = TY[i] + t * (TY[j] - TY[i]);
    const tl = Math.hypot(tx, ty); tx /= tl; ty /= tl;
    out.tx = tx; out.ty = ty;
    out.heading = Math.atan2(ty, tx);
    let nx = NX[i] + t * (NX[j] - NX[i]), ny = NY[i] + t * (NY[j] - NY[i]);
    const nl = Math.hypot(nx, ny);
    out.nx = nx / nl; out.ny = ny / nl;
    out.curvature = KAP[i] + t * (KAP[j] - KAP[i]);
    out.bank = BANK[i] + t * (BANK[j] - BANK[i]);
    out.grade = GR[i] + t * (GR[j] - GR[i]);
    out.widthL = WL[i] + t * (WL[j] - WL[i]);
    out.widthR = WR[i] + t * (WR[j] - WR[i]);
    out.index = i;
    return out;
  }

  /**
   * Starting grid pose behind the start line: staggered two-wide, 8 m between consecutive slots.
   * @param {number} gridSlot 0 = pole
   * @returns {{x,y,z,heading,s,offset}}
   */
  function startPose(gridSlot = 0) {
    const slot = Math.max(0, gridSlot | 0);
    const s = -(6 + 8 * slot);
    const p = pointAt(s);
    const lat = Math.min(p.widthL, p.widthR) * 0.42;
    const off = slot % 2 === 0 ? lat : -lat;
    const pose = { x: p.x + off * p.nx, y: p.y + off * p.ny, z: 0, heading: p.heading, s: ((s % L) + L) % L, offset: off };
    pose.z = heightAt(pose.x, pose.y, p.index);
    return pose;
  }

  const _q = { s: 0, offset: 0, height: 0, nx: 0, ny: 0, nz: 1, surface: 0, index: 0 };
  /** Ground height at (x, y) (global search unless a hint is given). Allocation free. */
  function heightAt(x, y, hint = -1) {
    return query(x, y, hint, _q).height;
  }

  /** Signed distance outside the asphalt edge at (x, y) (negative on the asphalt). */
  function edgeDistance(x, y, hint = -1) {
    query(x, y, hint, _q);
    const i = _q.index;
    const j = i + 1 === n ? 0 : i + 1;
    const t = _q.s / ds - i;
    const tt = t < 0 ? t + n : t;
    if (_q.offset >= 0) return _q.offset - (WL[i] + tt * (WL[j] - WL[i]));
    return -_q.offset - (WR[i] + tt * (WR[j] - WR[i]));
  }

  // --- walls: barrier polylines (both sides) at the outer edge of the run-off
  const bdef = def.barrier || {};
  const barrierOff = (i, side) => {
    const E = side > 0 ? EL[i] : ER[i];
    const fixed = side > 0 ? (bdef.offsetL ?? bdef.offset) : (bdef.offsetR ?? bdef.offset);
    if (fixed != null) return Math.max(KERB_W + 0.3, Math.min(fixed, E - 0.3));
    const g = side > 0 ? GLs[i] : GRs[i];
    const gEnd = side > 0 ? GEL[i] : GER[i];
    const R0 = side > 0 ? RL[i] : RR[i];
    const b = Math.max(R0 + 1.5, g > 0.05 ? gEnd + 1.5 : 0);
    return Math.max(KERB_W + 0.5, Math.min(b, E * 0.9));
  };
  const wallStep = Math.max(1, Math.round(3 / ds));
  const wallLines = [];
  const segList = [], kindList = [];
  for (const side of [1, -1]) {
    const pts = [];
    for (let i = 0; i < n; i += wallStep) {
      const off = side * ((side > 0 ? WL[i] : WR[i]) + barrierOff(i, side));
      pts.push(X[i] + off * NX[i], Y[i] + off * NY[i]);
    }
    wallLines.push({ side, pts, offsets: null });
    const m = pts.length / 2;
    for (let k = 0; k < m; k++) {
      const k2 = (k + 1) % m;
      segList.push(pts[2 * k], pts[2 * k + 1], pts[2 * k2], pts[2 * k2 + 1]); kindList.push(RAY.WALL);
    }
  }
  const wallSegCount = kindList.length;
  const walls = { segs: Float32Array.from(segList), n: wallSegCount, height: bdef.height ?? 0.9 };

  // --- edge lines (asphalt + kerb boundary) for raycasts
  const edgeStep = Math.max(1, Math.round(2 / ds));
  const edgeLines = [];
  for (const side of [1, -1]) {
    const pts = [];
    for (let i = 0; i < n; i += edgeStep) {
      const k = side > 0 ? KLs[i] : KRs[i];
      const off = side * ((side > 0 ? WL[i] : WR[i]) + KERB_W * Math.min(1, Math.max(0, k)));
      pts.push(X[i] + off * NX[i], Y[i] + off * NY[i]);
    }
    edgeLines.push({ side, pts: Float32Array.from(pts) });
    const m = pts.length / 2;
    for (let k = 0; k < m; k++) {
      const k2 = (k + 1) % m;
      segList.push(pts[2 * k], pts[2 * k + 1], pts[2 * k2], pts[2 * k2 + 1]); kindList.push(RAY.EDGE);
    }
  }

  // --- obstacles on the racing surface ({ s | f, offset, kind, ... } → world coordinates)
  const obstacles = [];
  const circles = [];
  const pa = {};
  for (const od of def.obstacles || []) {
    const s0 = od.s != null ? od.s : (od.f ?? 0) * L;
    pointAt(s0, pa);
    const kind = od.kind === 'box' ? 'box' : 'cylinder';
    const rel = ((od.heading ?? 0) * Math.PI) / 180;
    const hx = od.hx ?? 1, hy = od.hy ?? 1, r = od.r ?? 0.6;
    const ext = kind === 'box' ? Math.abs(hx * Math.sin(rel)) + Math.abs(hy * Math.cos(rel)) : r;
    let off = od.offset ?? 0;
    const MIN_GAP = 5.0;
    let gapL = pa.widthL - (off + ext), gapR = pa.widthR + (off - ext);
    let adjusted = false;
    if (Math.max(gapL, gapR) < MIN_GAP) {
      adjusted = true;
      if (gapL >= gapR) off = pa.widthL - ext - MIN_GAP; else off = -pa.widthR + ext + MIN_GAP;
      gapL = pa.widthL - (off + ext); gapR = pa.widthR + (off - ext);
    }
    const x = pa.x + off * pa.nx, y = pa.y + off * pa.ny;
    const o = { kind, x, y, z: 0, s: ((s0 % L) + L) % L, offset: off, h: od.h ?? (kind === 'box' ? 1.0 : 1.2), gapL, gapR, adjusted };
    if (kind === 'cylinder') {
      o.r = r;
      circles.push({ x, y, r, kind: RAY.OBSTACLE });
    } else {
      o.hx = hx; o.hy = hy; o.heading = pa.heading + rel;
      const c = Math.cos(o.heading), sn = Math.sin(o.heading);
      const cx = [hx, -hx, -hx, hx], cy = [hy, hy, -hy, -hy];
      const P = cx.map((_, k) => [x + c * cx[k] - sn * cy[k], y + sn * cx[k] + c * cy[k]]);
      for (let k = 0; k < 4; k++) {
        const q2 = P[(k + 1) % 4];
        segList.push(P[k][0], P[k][1], q2[0], q2[1]); kindList.push(RAY.OBSTACLE);
      }
    }
    obstacles.push(o);
  }
  const raycast = buildRaycaster(Float32Array.from(segList), kindList, circles, def.rayCell ?? 10);

  // --- stats
  let zMin = Infinity, zMax = -Infinity, kMax = 0, bankMax = 0, gradeMax = 0, wSum = 0, kvMax = 0;
  for (let i = 0; i < n; i++) {
    zMin = Math.min(zMin, Z[i]); zMax = Math.max(zMax, Z[i]);
    kMax = Math.max(kMax, Math.abs(KAP[i]));
    bankMax = Math.max(bankMax, Math.abs(BANK[i]));
    gradeMax = Math.max(gradeMax, Math.abs(GR[i]));
    kvMax = Math.max(kvMax, -KV[i]);
    wSum += WL[i] + WR[i];
  }

  const samples = {
    n, ds,
    x: Float32Array.from(X), y: Float32Array.from(Y), z: Float32Array.from(Z),
    tx: Float32Array.from(TX), ty: Float32Array.from(TY), tz: Float32Array.from(TZ),
    nx: Float32Array.from(NX), ny: Float32Array.from(NY),
    bank: Float32Array.from(BANK), curvature: Float32Array.from(KAP),
    widthL: Float32Array.from(WL), widthR: Float32Array.from(WR),
    // extras (not in the contract, documented in docs/contract-notes/track.md)
    grade: Float32Array.from(GR), vcurvature: Float32Array.from(KV),
    kerbL: Float32Array.from(KLs), kerbR: Float32Array.from(KRs),
    gravelL: Float32Array.from(GLs), gravelR: Float32Array.from(GRs),
    gravelEndL: Float32Array.from(GEL), gravelEndR: Float32Array.from(GER),
    runoffL: Float32Array.from(RL), runoffR: Float32Array.from(RR),
    edgeL: Float32Array.from(EL), edgeR: Float32Array.from(ER),
    freeL: Float32Array.from(freeL), freeR: Float32Array.from(freeR),
  };

  const marks = {};
  if (def.marks) {
    for (const k in def.marks) {
      const [f0, f1] = def.marks[k];
      const sf = def.startFrac ?? 0;
      marks[k] = [(((f0 - sf) % 1) + 1) % 1 * L, (((f1 - sf) % 1) + 1) % 1 * L];
    }
  }

  const track = {
    key: def.key ?? 'custom',
    label: def.label ?? 'Custom track',
    def,
    length: L,
    width: wSum / n,
    closed: true,
    samples,
    marks,
    corners: corners.map((c) => ({ s: c.a * ds, length: c.len * ds, sign: c.sign })),
    stats: {
      length: L, minRadius: 1 / Math.max(kMax, 1e-9), zMin, zMax, elevationRange: zMax - zMin,
      maxBankDeg: (bankMax * 180) / Math.PI, maxGrade: gradeMax,
      minCrestRadius: kvMax > 0 ? 1 / kvMax : Infinity,
    },
    bounds: { minX: hash.minX, minY: hash.minY, maxX: hash.maxX, maxY: hash.maxY, minZ: zMin, maxZ: zMax },
    terrain,
    surfaces: SURFACE,
    kerbWidth: KERB_W,
    walls, obstacles, edgeLines, raycast, RAY,
    query, pointAt, startPose, heightAt, edgeDistance,
    terrainHeight: (x, y) => evalT(x, y).h,
    nearestIndex: nearest,
    scenery: null,
  };
  for (const o of obstacles) o.z = heightAt(o.x, o.y);
  track.scenery = buildScenery(track, def, seed, wallLines, barrierOff);
  return track;
}

// ---------------------------------------------------------------------------------------------
// Scenery (renderer data). Deterministic per track.
// ---------------------------------------------------------------------------------------------

function buildScenery(track, def, seed, wallLines, barrierOff) {
  const r = rng(seed ^ 0x2545f491);
  const S = track.samples;
  const { n, ds } = S;
  const L = track.length;
  const sdef = def.scenery || {};
  const bdef = def.barrier || {};
  const p = {};
  const q = { s: 0, offset: 0, height: 0, nx: 0, ny: 0, nz: 1, surface: 0, index: 0 };

  const barriers = [];
  for (const wl of wallLines) {
    const pts = [];
    let hint = 0;
    for (let k = 0; k < wl.pts.length; k += 2) {
      track.query(wl.pts[k], wl.pts[k + 1], hint, q); hint = q.index;
      pts.push(wl.pts[k], wl.pts[k + 1], q.height);
    }
    barriers.push({ side: wl.side > 0 ? 'left' : 'right', kind: bdef.kind ?? 'armco', height: track.walls.height, closed: true, points: Float32Array.from(pts), fence: bdef.fence ?? 0 });
  }

  // start / finish gantry
  track.pointAt(0, p);
  const gantry = { x: p.x, y: p.y, z: p.z, heading: p.heading, width: p.widthL + p.widthR + 3, height: 6 };

  // grandstands: along the main straight, on the side with more room, plus the tightest corner
  const grandstands = [];
  const stand = (s, len) => {
    track.pointAt(s, p);
    const i = p.index;
    const side = S.edgeL[i] >= S.edgeR[i] ? 1 : -1;
    const w = side > 0 ? p.widthL : p.widthR;
    const off = side * (w + barrierOff(i, side) + 7);
    const x = p.x + off * p.nx, y = p.y + off * p.ny;
    const E = side > 0 ? S.edgeL[i] : S.edgeR[i];
    if (Math.abs(off) - w > E + 25) return;
    grandstands.push({ x, y, z: track.heightAt(x, y, i), heading: Math.atan2(-side * p.ny, -side * p.nx), length: len, side: side > 0 ? 'left' : 'right' });
  };
  const nStands = sdef.grandstands ?? 3;
  for (let k = 0; k < nStands; k++) stand(-60 - k * 70, 50);
  if (track.corners.length && nStands > 0) {
    let best = null, km = 0;
    for (const c of track.corners) {
      const i = Math.floor(c.s / ds + c.length / ds / 2) % n;
      if (Math.abs(S.curvature[i]) > km) { km = Math.abs(S.curvature[i]); best = i; }
    }
    if (best != null) {
      // stand on the outside of the tightest corner
      track.pointAt(best * ds, p);
      const side = S.curvature[best] > 0 ? -1 : 1;
      const i = best;
      const w = side > 0 ? p.widthL : p.widthR;
      const E = side > 0 ? S.edgeL[i] : S.edgeR[i];
      const off = side * (w + Math.min(barrierOff(i, side) + 8, E + 10));
      const x = p.x + off * p.nx, y = p.y + off * p.ny;
      grandstands.push({ x, y, z: track.heightAt(x, y, i), heading: Math.atan2(-side * p.ny, -side * p.nx), length: 40, side: side > 0 ? 'left' : 'right' });
    }
  }

  // marshal posts every ~300 m, alternating sides, just behind the barrier
  const marshalPosts = [];
  const nPost = Math.max(2, Math.round(L / 300));
  for (let k = 0; k < nPost; k++) {
    const s = ((k + 0.5) * L) / nPost;
    track.pointAt(s, p);
    const i = p.index;
    const side = k % 2 === 0 ? 1 : -1;
    const w = side > 0 ? p.widthL : p.widthR;
    const off = side * (w + barrierOff(i, side) + 2);
    const x = p.x + off * p.nx, y = p.y + off * p.ny;
    marshalPosts.push({ x, y, z: track.heightAt(x, y, i), heading: Math.atan2(-side * p.ny, -side * p.nx) });
  }

  // trees: random candidates kept clear of asphalt, run-off, gravel and barriers
  const trees = [];
  const density = sdef.trees ?? 1;
  if (density > 0) {
    const b = track.bounds, M = 160;
    const area = (b.maxX - b.minX + 2 * M) * (b.maxY - b.minY + 2 * M);
    const tries = Math.min(40000, Math.round((area / 900) * density));
    const maxTrees = Math.round(4000 * density);
    for (let k = 0; k < tries && trees.length < maxTrees; k++) {
      const x = b.minX - M + r() * (b.maxX - b.minX + 2 * M);
      const y = b.minY - M + r() * (b.maxY - b.minY + 2 * M);
      track.query(x, y, -1, q);
      const i = q.index;
      const left = q.offset >= 0;
      const w = left ? S.widthL[i] : S.widthR[i];
      const e = Math.abs(q.offset) - w;
      const side = left ? 1 : -1;
      const clear = Math.max(barrierOff(i, side) + 4, (left ? S.edgeL[i] : S.edgeR[i]) + 2);
      if (e < clear) continue;
      // keep a clear view near the start straight & stands
      if (e < clear + 10 && (q.s < 200 || q.s > L - 500)) continue;
      // cluster: thin out randomly with a smooth field so forests form
      const f = 0.5 + 0.5 * Math.sin(x / 71 + 1.3 * Math.sin(y / 53)) * Math.cos(y / 89);
      if (r() > 0.25 + 0.75 * f) continue;
      trees.push({ x, y, z: q.height, scale: 0.7 + 0.7 * r(), rot: r() * TWO_PI, kind: r() < 0.6 ? 0 : 1 });
    }
  }
  return { trees, barriers, gantry, grandstands, marshalPosts, obstacles: track.obstacles, bounds: track.bounds };
}
