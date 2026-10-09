// Racing line + speed profile for a track (classical, non-learning).
//
// Line: elastic-band minimum-curvature approximation. Each centreline sample i carries a lateral
// offset o[i] (+left); the line point is C_i + o_i * N_i. Repeated Laplacian smoothing over
// neighbours ±k pulls the band tight (= lower curvature), then offsets are clamped to the usable
// width. Speed: v_max(κ) from tyre grip including aero downforce, then a backward braking pass.

import { G, RHO_AIR } from '../sim/constants.js';

const cache = new Map(); // track → line (geometry only, independent of car)

/**
 * Minimum-curvature-ish racing line for a track. Cached per track object.
 * @param {object} track  track from createTrack()
 * @param {number} margin m kept clear of the asphalt edge
 * @returns {{ n, ds, offset: Float32Array, x: Float32Array, y: Float32Array, curvature: Float32Array }}
 */
export function racingLine(track, margin = 1.2) {
  const hit = cache.get(track);
  if (hit && hit.margin === margin) return hit;
  const S = track.samples, n = S.n, ds = S.ds;
  const o = new Float32Array(n), tmp = new Float32Array(n);
  const lo = new Float32Array(n), hi = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    hi[i] = Math.max(0, S.widthL[i] - margin);
    lo[i] = -Math.max(0, S.widthR[i] - margin);
  }
  // Obstacles carve the usable band: pass on the side with the bigger gap, with room for the car.
  const CAR_HALF = 1.1;
  for (const ob of track.obstacles || []) {
    const ext = ob.kind === 'box' ? Math.max(ob.hx, ob.hy) : ob.r;
    const passLeft = (ob.gapL ?? 0) >= (ob.gapR ?? 0);
    const reach = Math.ceil((ext + 10) / ds);
    const i0 = Math.round(ob.s / ds);
    for (let d = -reach; d <= reach; d++) {
      const i = (i0 + d + n) % n;
      const fade = 1 - Math.abs(d) / (reach + 1); // full clearance at the obstacle, tapering off
      const clear = (ext + CAR_HALF + 1.0) * Math.min(1, fade * 1.6);
      if (passLeft) lo[i] = Math.min(hi[i], Math.max(lo[i], ob.offset + clear));
      else hi[i] = Math.max(lo[i], Math.min(hi[i], ob.offset - clear));
    }
  }
  minimiseCurvature(S, o, lo, hi);
  const px = new Float32Array(n), py = new Float32Array(n);
  for (let i = 0; i < n; i++) { px[i] = S.x[i] + o[i] * S.nx[i]; py[i] = S.y[i] + o[i] * S.ny[i]; }
  // Low-pass the offsets (circular Gaussian, σ ≈ 3 m) so centimetre wiggles don't read as corners.
  const sig = 3 / ds, rad = Math.ceil(3 * sig);
  const wts = []; let wsum = 0;
  for (let d = -rad; d <= rad; d++) { const w = Math.exp(-0.5 * (d / sig) ** 2); wts.push(w); wsum += w; }
  for (let i = 0; i < n; i++) {
    let acc = 0;
    for (let d = -rad; d <= rad; d++) acc += wts[d + rad] * o[(i + d + n) % n];
    const v = acc / wsum;
    tmp[i] = v < lo[i] ? lo[i] : v > hi[i] ? hi[i] : v;
  }
  o.set(tmp);
  for (let i = 0; i < n; i++) { px[i] = S.x[i] + o[i] * S.nx[i]; py[i] = S.y[i] + o[i] * S.ny[i]; }
  // Curvature over ±5 m chords — the scale a car actually responds to.
  const kap = new Float32Array(n), h = Math.max(1, Math.round(5 / ds));
  for (let i = 0; i < n; i++) {
    const a = (i - h + n) % n, b = (i + h) % n;
    kap[i] = curvature3(px[a], py[a], px[i], py[i], px[b], py[b]);
  }
  const line = { n, ds, offset: o, x: px, y: py, curvature: kap, margin };
  cache.set(track, line);
  return line;
}

/**
 * Minimise Σ κ² of the line (Menger curvature over chords of ±k nodes) by damped per-node Newton
 * steps on the lateral offsets, coarse-to-fine, on a ~2 m sub-grid, within [lo, hi].
 * Pulling curvature down (not length) makes the line use the full width: outside–apex–outside.
 */
function minimiseCurvature(S, o, lo, hi) {
  // Sub-grid of m nodes spread evenly over the loop (fractional spacing so the seam at s = 0 is
  // spaced like everywhere else).
  const n = S.n, m = Math.max(8, Math.round((n * S.ds) / 2.5)), span = n / m;
  const cx = new Float64Array(m), cy = new Float64Array(m), nx = new Float64Array(m), ny = new Float64Array(m);
  const q = new Float64Array(m), ql = new Float64Array(m), qh = new Float64Array(m), nq = new Float64Array(m);
  for (let j = 0; j < m; j++) {
    const i = Math.min(n - 1, Math.round(j * span));
    cx[j] = S.x[i]; cy[j] = S.y[i]; nx[j] = S.nx[i]; ny[j] = S.ny[i];
    q[j] = o[i]; ql[j] = lo[i]; qh[j] = hi[i];
    // A sub-grid node must respect the tightest bound among the samples it represents.
    const i1 = Math.round((j + 1) * span);
    for (let t = i + 1; t < i1; t++) { const w = t % n; ql[j] = Math.max(ql[j], lo[w]); qh[j] = Math.min(qh[j], hi[w]); }
    if (ql[j] > qh[j]) ql[j] = qh[j] = 0.5 * (ql[j] + qh[j]);
  }
  const X = (j, off) => cx[j] + off * nx[j], Y = (j, off) => cy[j] + off * ny[j];
  const kap = (a, b, c, ob) => { // curvature at node b with b's offset overridden by ob
    return curvature3(X(a, q[a]), Y(a, q[a]), X(b, ob), Y(b, ob), X(c, q[c]), Y(c, q[c]));
  };
  // Energy terms touching node j: curvature at j-k, j, j+k (each uses node j as a vertex).
  const local = (j, k, oj) => {
    const a = (j - k + m) % m, b = (j + k) % m, a2 = (j - 2 * k + 2 * m) % m, b2 = (j + 2 * k) % m;
    const k0 = kap(a, j, b, oj);
    const ka = curvature3(X(a2, q[a2]), Y(a2, q[a2]), X(a, q[a]), Y(a, q[a]), X(j, oj), Y(j, oj));
    const kb = curvature3(X(j, oj), Y(j, oj), X(b, q[b]), Y(b, q[b]), X(b2, q[b2]), Y(b2, q[b2]));
    return k0 * k0 + ka * ka + kb * kb;
  };
  const h = 0.05;
  for (const [k, iters] of [[24, 90], [12, 90], [6, 110], [3, 120], [2, 90]]) {
    if (2 * k >= m) continue;
    for (let it = 0; it < iters; it++) {
      for (let j = 0; j < m; j++) {
        const e0 = local(j, k, q[j]), ep = local(j, k, q[j] + h), em = local(j, k, q[j] - h);
        const g = (ep - em) / (2 * h), H = (ep - 2 * e0 + em) / (h * h);
        let step = H > 1e-12 ? -g / H : -Math.sign(g) * 0.2;
        step = Math.max(-0.5, Math.min(0.5, step * 0.5));
        const v = q[j] + step;
        nq[j] = v < ql[j] ? ql[j] : v > qh[j] ? qh[j] : v;
      }
      q.set(nq);
    }
  }
  // Back to full resolution (Catmull–Rom between sub-grid nodes keeps curvature continuous), then clamp.
  for (let i = 0; i < n; i++) {
    const f = i / span, j = Math.floor(f) % m, t = f - Math.floor(f);
    const p0 = q[(j - 1 + m) % m], p1 = q[j], p2 = q[(j + 1) % m], p3 = q[(j + 2) % m];
    const t2 = t * t, t3 = t2 * t;
    const v = 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
    o[i] = v < lo[i] ? lo[i] : v > hi[i] ? hi[i] : v;
  }
}

function curvature3(x1, y1, x2, y2, x3, y3) {
  const ax = x2 - x1, ay = y2 - y1, bx = x3 - x2, by = y3 - y2, cx = x3 - x1, cy = y3 - y1;
  const cross = ax * by - ay * bx;
  const den = Math.hypot(ax, ay) * Math.hypot(bx, by) * Math.hypot(cx, cy);
  return den > 1e-9 ? (2 * cross) / den : 0;
}

/**
 * Speed profile along a racing line for a given car.
 * @param {object} line   from racingLine()
 * @param {object} params car params from build()
 * @param {number} skill  0..1 — fraction of the car's grip the driver dares to use
 * @returns {Float32Array} target speed (m/s) per sample
 */
export function speedProfile(line, params, skill = 0.9) {
  const n = line.n, ds = line.ds;
  const mu = gripEstimate(params) * (0.72 + 0.26 * skill);
  const m = params.mass.total;
  const clA = (params.aero.clAFront || 0) + (params.aero.clARear || 0);
  const kAero = (0.5 * RHO_AIR * clA) / m;                  // extra normal accel per v^2
  const kDrag = (0.5 * RHO_AIR * params.aero.cdA) / m;
  const vTop = Math.max(20, (params.summary.topSpeedEstKph || 250) / 3.6);
  const v = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const k = Math.abs(line.curvature[i]);
    const den = k - mu * kAero;                              // v^2 k = mu (g + kAero v^2)
    v[i] = den <= 1e-6 ? vTop : Math.min(vTop, Math.sqrt((mu * G) / den));
  }
  // Backward pass: braking capability (grip + aero + drag), two laps for wrap-around.
  const brakeMu = mu * 0.95;
  for (let pass = 0; pass < 2; pass++) {
    for (let j = 2 * n - 1; j >= 0; j--) {
      const i = j % n, nx = (i + 1) % n;
      const vn = v[nx];
      const a = brakeMu * (G + kAero * vn * vn) + kDrag * vn * vn;
      const vb = Math.sqrt(vn * vn + 2 * a * ds);
      if (vb < v[i]) v[i] = vb;
    }
  }
  return v;
}

/** Rough usable friction coefficient of the car's tyres (average of axles, warm, unworn). */
export function gripEstimate(params) {
  const a = params.axles;
  const f = a[0].tyre.mu ?? 1, r = a[1].tyre.mu ?? 1;
  return 0.5 * (f + r);
}
