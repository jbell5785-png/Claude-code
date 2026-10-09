// Centreline construction shared by track.js and the procedural generator (owner D: tracks).
// Control points → centripetal Catmull–Rom → uniform resample → Gaussian smoothing → ds≈1 m samples.

const TWO_PI = Math.PI * 2;

// ---------------------------------------------------------------------------------------------
// Centreline construction
// ---------------------------------------------------------------------------------------------

export function normalisePoints(def) {
  const W = def.width ?? 12;
  const out = [];
  for (const p of def.points) {
    let q;
    if (Array.isArray(p)) q = { x: p[0], y: p[1], z: p[2] ?? 0, w: p[3] ?? W, b: p[4] ?? 0 };
    else q = { x: p.x, y: p.y, z: p.z ?? 0, w: p.width ?? p.w ?? W, b: p.bank ?? 0 };
    const last = out[out.length - 1];
    if (last && Math.hypot(q.x - last.x, q.y - last.y, q.z - last.z) < 1e-6) continue;
    out.push(q);
  }
  while (out.length > 1) { // drop a duplicated closing point
    const a = out[0], b = out[out.length - 1];
    if (Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) < 1e-6) out.pop(); else break;
  }
  if (out.length < 4) throw new Error('track needs at least 4 distinct control points');
  return out;
}

/** Dense centripetal Catmull–Rom evaluation of the closed loop. */
export function catmullRomDense(P, step) {
  const m = P.length;
  const xs = [], ys = [], zs = [], ws = [], bs = [];
  const dist = (a, b) => Math.max(1e-6, Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z));
  for (let k = 0; k < m; k++) {
    const p0 = P[(k - 1 + m) % m], p1 = P[k], p2 = P[(k + 1) % m], p3 = P[(k + 2) % m];
    const t0 = 0, t1 = t0 + Math.sqrt(dist(p0, p1));
    const t2 = t1 + Math.sqrt(dist(p1, p2)), t3 = t2 + Math.sqrt(dist(p2, p3));
    const nsub = Math.max(2, Math.ceil(dist(p1, p2) / step));
    for (let j = 0; j < nsub; j++) {
      const u = j / nsub, t = t1 + (t2 - t1) * u;
      const ev = (c) => {
        const a1 = ((t1 - t) * p0[c] + (t - t0) * p1[c]) / (t1 - t0);
        const a2 = ((t2 - t) * p1[c] + (t - t1) * p2[c]) / (t2 - t1);
        const a3 = ((t3 - t) * p2[c] + (t - t2) * p3[c]) / (t3 - t2);
        const b1 = ((t2 - t) * a1 + (t - t0) * a2) / (t2 - t0);
        const b2 = ((t3 - t) * a2 + (t - t1) * a3) / (t3 - t1);
        return ((t2 - t) * b1 + (t - t1) * b2) / (t2 - t1);
      };
      xs.push(ev('x')); ys.push(ev('y')); zs.push(ev('z'));
      ws.push(p1.w + (p2.w - p1.w) * u); bs.push(p1.b + (p2.b - p1.b) * u);
    }
  }
  return { xs, ys, zs, ws, bs };
}

/** Linear resample of a closed polyline (with attributes) at uniform 3D arc-length spacing h. */
export function resampleLinear(cols, h) {
  const { xs, ys, zs } = cols;
  const N = xs.length;
  const cum = new Float64Array(N + 1);
  for (let i = 0; i < N; i++) {
    const j = (i + 1) % N;
    cum[i + 1] = cum[i] + Math.hypot(xs[j] - xs[i], ys[j] - ys[i], zs[j] - zs[i]);
  }
  const L = cum[N];
  const M = Math.max(64, Math.round(L / h));
  const keys = Object.keys(cols);
  const out = {};
  for (const k of keys) out[k] = new Float64Array(M);
  let seg = 0;
  for (let q = 0; q < M; q++) {
    const s = (L * q) / M;
    while (seg < N - 1 && cum[seg + 1] <= s) seg++;
    const j = (seg + 1) % N;
    const f = (s - cum[seg]) / Math.max(1e-12, cum[seg + 1] - cum[seg]);
    for (const k of keys) out[k][q] = cols[k][seg] + (cols[k][j] - cols[k][seg]) * f;
  }
  return { cols: out, L, M };
}

/** Circular Gaussian smoothing (sigma in samples). */
export function smoothCirc(a, sigma) {
  const N = a.length;
  if (!(sigma > 0.3)) return Float64Array.from(a);
  const r = Math.min(Math.floor(N / 2) - 1, Math.ceil(3 * sigma));
  const w = new Float64Array(2 * r + 1);
  let sw = 0;
  for (let k = -r; k <= r; k++) { w[k + r] = Math.exp((-0.5 * k * k) / (sigma * sigma)); sw += w[k + r]; }
  for (let k = 0; k < w.length; k++) w[k] /= sw;
  const out = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    let acc = 0;
    for (let k = -r; k <= r; k++) {
      let j = i + k;
      if (j < 0) j += N; else if (j >= N) j -= N;
      acc += w[k + r] * a[j];
    }
    out[i] = acc;
  }
  return out;
}

export function boxCirc(a, r, passes = 1) {
  let cur = Float64Array.from(a);
  const N = a.length;
  for (let p = 0; p < passes; p++) {
    const out = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      let acc = 0;
      for (let k = -r; k <= r; k++) acc += cur[(i + k + N) % N];
      out[i] = acc / (2 * r + 1);
    }
    cur = out;
  }
  return cur;
}

export function minFilterCirc(a, r) {
  const N = a.length, out = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    let m = Infinity;
    for (let k = -r; k <= r; k++) { const v = a[(i + k + N) % N]; if (v < m) m = v; }
    out[i] = m;
  }
  return out;
}

export function maxFilterCirc(a, r) {
  const N = a.length, out = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    let m = -Infinity;
    for (let k = -r; k <= r; k++) { const v = a[(i + k + N) % N]; if (v > m) m = v; }
    out[i] = m;
  }
  return out;
}

export const wrapAngle = (a) => a - TWO_PI * Math.round(a / TWO_PI);

export function buildSamples(def) {
  const P = normalisePoints(def);
  const dense = catmullRomDense(P, 0.2);
  const h = 0.25;
  const { cols, L: L0 } = resampleLinear({ xs: dense.xs, ys: dense.ys, zs: dense.zs, ws: dense.ws, bs: dense.bs }, h);
  const sig = (m) => m / h;
  const sx = smoothCirc(cols.xs, sig(def.smooth ?? 4));
  const sy = smoothCirc(cols.ys, sig(def.smooth ?? 4));
  const sz = smoothCirc(cols.zs, sig(def.zSmooth ?? def.smooth ?? 4));
  const sw = smoothCirc(cols.ws, sig(def.widthSmooth ?? 10));
  const sb = smoothCirc(cols.bs, sig(def.bankSmooth ?? 15));
  const M = sx.length;
  // cumulative length of the smoothed polyline
  const cum = new Float64Array(M + 1);
  for (let i = 0; i < M; i++) {
    const j = (i + 1) % M;
    cum[i + 1] = cum[i] + Math.hypot(sx[j] - sx[i], sy[j] - sy[i], sz[j] - sz[i]);
  }
  const L = cum[M];
  const n = Math.max(32, Math.round(L / (def.ds ?? 1)));
  const ds = L / n;
  const startS = (((def.startFrac ?? 0) % 1) + 1) % 1 * L;
  const X = new Float64Array(n), Y = new Float64Array(n), Z = new Float64Array(n);
  const Wd = new Float64Array(n), B = new Float64Array(n);
  const cr = (a, i, f) => {
    const p0 = a[(i - 1 + M) % M], p1 = a[i], p2 = a[(i + 1) % M], p3 = a[(i + 2) % M];
    const f2 = f * f, f3 = f2 * f;
    return 0.5 * (2 * p1 + (-p0 + p2) * f + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f2 + (-p0 + 3 * p1 - 3 * p2 + p3) * f3);
  };
  for (let k = 0; k < n; k++) {
    let s = startS + k * ds;
    if (s >= L) s -= L;
    // binary search interval
    let lo = 0, hi = M - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (cum[mid] <= s) lo = mid; else hi = mid - 1; }
    const f = (s - cum[lo]) / Math.max(1e-12, cum[lo + 1] - cum[lo]);
    X[k] = cr(sx, lo, f); Y[k] = cr(sy, lo, f); Z[k] = cr(sz, lo, f);
    Wd[k] = sw[lo] + (sw[(lo + 1) % M] - sw[lo]) * f;
    B[k] = sb[lo] + (sb[(lo + 1) % M] - sb[lo]) * f;
  }
  return { n, ds, L, X, Y, Z, Wd, B, rawLength: L0, startS };
}


/**
 * Frame quantities for sample arrays: unit tangent, horizontal left normal, heading, grade and
 * smoothed signed horizontal curvature.
 */
export function computeFrame(S) {
  const { n, ds, X, Y, Z } = S;
  const TX = new Float64Array(n), TY = new Float64Array(n), TZ = new Float64Array(n);
  const NX = new Float64Array(n), NY = new Float64Array(n);
  const HD = new Float64Array(n), GR = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const a = (i - 1 + n) % n, b = (i + 1) % n;
    let tx = X[b] - X[a], ty = Y[b] - Y[a], tz = Z[b] - Z[a];
    const l = Math.hypot(tx, ty, tz);
    tx /= l; ty /= l; tz /= l;
    TX[i] = tx; TY[i] = ty; TZ[i] = tz;
    const lh = Math.hypot(tx, ty);
    NX[i] = -ty / lh; NY[i] = tx / lh;
    HD[i] = Math.atan2(ty, tx);
    GR[i] = (Z[b] - Z[a]) / (2 * ds);
  }
  let KAP = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const a = (i - 1 + n) % n, b = (i + 1) % n;
    KAP[i] = wrapAngle(HD[b] - HD[a]) / Math.hypot(X[b] - X[a], Y[b] - Y[a]);
  }
  KAP = boxCirc(KAP, 1, 2);
  return { TX, TY, TZ, NX, NY, HD, GR, KAP };
}

/**
 * Minimum clearance between non-local parts of the track: min over sample pairs (i, j) whose
 * arc separation exceeds 1.5x their distance + 10 m of (distance - halfWidth_i - halfWidth_j).
 * Returns { gap, i, j }. O(n * neighbours) using a coarse hash.
 */
export function proximityGap(S, radius = 60) {
  const { n, ds, X, Y, Wd } = S;
  const cell = radius;
  const map = new Map();
  const key = (cx, cy) => cx * 73856093 ^ cy * 19349663;
  for (let i = 0; i < n; i += 2) {
    const k = key(Math.floor(X[i] / cell), Math.floor(Y[i] / cell));
    let a = map.get(k); if (!a) map.set(k, (a = [])); a.push(i);
  }
  let gap = Infinity, gi = -1, gj = -1;
  for (let i = 0; i < n; i += 2) {
    const cx = Math.floor(X[i] / cell), cy = Math.floor(Y[i] / cell);
    for (let ox = -1; ox <= 1; ox++) for (let oy = -1; oy <= 1; oy++) {
      const a = map.get(key(cx + ox, cy + oy)); if (!a) continue;
      for (const j of a) {
        if (j <= i) continue;
        const d = Math.hypot(X[j] - X[i], Y[j] - Y[i]);
        if (d > radius) continue;
        let arc = Math.abs(j - i); if (arc > n / 2) arc = n - arc; arc *= ds;
        if (arc < 1.5 * d + 10) continue;
        const g = d - Wd[i] / 2 - Wd[j] / 2;
        if (g < gap) { gap = g; gi = i; gj = j; }
      }
    }
  }
  return { gap, i: gi, j: gj };
}
