// Helpers for authoring track definitions (owner D: tracks).
//
// A track definition ("trackDef") consumed by createTrack() in ../track.js:
// {
//   key, label,
//   points: [[x, y, z, width, bankDeg], ...]   // closed loop of control points (metres / degrees)
//   width: 12,                // default full asphalt width if a point omits it
//   startFrac: 0,             // start/finish line position as a fraction of the loop (0..1)
//   marks: { name: [f0, f1] } // optional named ranges (fractions of the loop), e.g. the chicane
//   smooth: 4,                // Gaussian smoothing sigma (m) of the centreline (curvature continuity)
//   bankSmooth: 15, widthSmooth: 10,
//   kerbs: true, gravel: true, runoff: 8, edgeMax: 30,
//   terrain: { amp: 1.5, radius: 80 },
//   barrier: { kind: 'armco', offset: null }, scenery: { trees: 1 },
// }
// Bank convention: bank > 0 lowers the LEFT edge, i.e. banked for a LEFT-hand turn
// (properly banked corners have bank * curvature > 0).

/** Deterministic 32-bit PRNG (mulberry32). Returns () => [0,1). */
export function rng(seed) {
  let a = (seed >>> 0) || 0x9e3779b9;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** FNV-1a string hash → uint32. */
export function hashString(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Build closed-loop control points from a "turtle" description of straights and arcs.
 *
 * segs: array of
 *   { s: length }                 straight
 *   { r: radius, a: deg }         arc, a > 0 turns LEFT (CCW), a < 0 turns RIGHT
 *   optional on any segment: w (full width from here on), bank (deg, from here on),
 *   z (elevation key at the END of the segment), mark: 'name' / markEnd: 'name' (range markers),
 *   start: true (start/finish line at the START of this segment; startAt: metres into segment)
 * opts:
 *   close: [i, j]  indices of two non-parallel straights whose lengths are adjusted so the loop
 *                  closes exactly in x/y (the heading total must be ±360°, residual is added to
 *                  the arc with index opts.fixAngle, default: the last arc).
 *   step: control point spacing (m, default 10)
 *   width, z0 (elevation of the first key if none at segment 0 end)
 *   scale: uniform scale applied to lengths & radii (closure is preserved)
 * Returns { points, startFrac, marks, length }.
 */
export function turtle(segs, opts = {}) {
  const scale = opts.scale ?? 1;
  const step = opts.step ?? 10;
  segs = segs.map((g) => ({ ...g }));
  for (const g of segs) {
    if (g.s != null) g.s *= scale;
    if (g.r != null) g.r *= scale;
  }
  // heading closure
  let total = 0;
  for (const g of segs) if (g.a != null) total += g.a;
  const target = total >= 0 ? 360 : -360;
  const resid = target - total;
  if (Math.abs(resid) > 1e-9) {
    let fi = opts.fixAngle;
    if (fi == null) for (let k = segs.length - 1; k >= 0; k--) if (segs[k].a != null) { fi = k; break; }
    if (Math.abs(resid) > 25) throw new Error(`turtle: heading residual ${resid.toFixed(1)} deg too large`);
    segs[fi].a += resid;
  }
  // position closure: solve for length changes on two straights
  const walkEnd = () => {
    let x = 0, y = 0, h = 0;
    const dirs = [];
    for (const g of segs) {
      dirs.push(h);
      if (g.s != null) { x += g.s * Math.cos(h); y += g.s * Math.sin(h); }
      else {
        const a = (g.a * Math.PI) / 180, sgn = Math.sign(a), r = g.r;
        // centre to the left (a>0) or right
        const cx = x - sgn * r * Math.sin(h), cy = y + sgn * r * Math.cos(h);
        h += a;
        x = cx + sgn * r * Math.sin(h); y = cy - sgn * r * Math.cos(h);
      }
    }
    return { x, y, dirs };
  };
  if (opts.close) {
    const [i, j] = opts.close;
    const { x, y, dirs } = walkEnd();
    const ux = Math.cos(dirs[i]), uy = Math.sin(dirs[i]);
    const vx = Math.cos(dirs[j]), vy = Math.sin(dirs[j]);
    const det = ux * vy - uy * vx;
    if (Math.abs(det) < 0.2) throw new Error('turtle: closing straights nearly parallel');
    // ux*da + vx*db = -x ; uy*da + vy*db = -y
    const da = (-x * vy + y * vx) / det;
    const db = (-y * ux + x * uy) / det;
    segs[i].s += da; segs[j].s += db;
    if (segs[i].s < 5 || segs[j].s < 5) {
      throw new Error(`turtle: closure needs negative straight (${segs[i].s.toFixed(1)}, ${segs[j].s.toFixed(1)})`);
    }
  }
  // walk and emit points
  const pts = [];
  let x = 0, y = 0, h = 0, s = 0;
  let w = opts.width ?? 12, bank = 0;
  const zKeys = [];
  let startS = 0;
  const markStart = {}, marks = {};
  const emit = (px, py, ps) => pts.push({ x: px, y: py, s: ps, w, bank });
  for (const g of segs) {
    if (g.w != null) w = g.w;
    if (g.bank != null) bank = g.bank;
    if (g.start) startS = s + (g.startAt ?? 0) * scale;
    if (g.mark) markStart[g.mark] = s;
    if (g.s != null) {
      const nStep = Math.max(1, Math.round(g.s / step));
      for (let k = 0; k < nStep; k++) {
        const d = (g.s * k) / nStep;
        emit(x + d * Math.cos(h), y + d * Math.sin(h), s + d);
      }
      x += g.s * Math.cos(h); y += g.s * Math.sin(h); s += g.s;
    } else {
      const a = (g.a * Math.PI) / 180, sgn = Math.sign(a), r = g.r;
      const len = Math.abs(a) * r;
      const cx = x - sgn * r * Math.sin(h), cy = y + sgn * r * Math.cos(h);
      const nStep = Math.max(2, Math.round(len / Math.min(step, Math.max(3, r * 0.35))));
      for (let k = 0; k < nStep; k++) {
        const hh = h + (a * k) / nStep;
        emit(cx + sgn * r * Math.sin(hh), cy - sgn * r * Math.cos(hh), s + (len * k) / nStep);
      }
      h += a;
      x = cx + sgn * r * Math.sin(h); y = cy - sgn * r * Math.cos(h);
      s += len;
    }
    if (g.z != null) zKeys.push([s, g.z]);
    if (g.markEnd) marks[g.markEnd] = [markStart[g.markEnd], s];
  }
  const L = s;
  if (Math.hypot(x, y) > 0.5 && opts.close) throw new Error('turtle: closure failed');
  // elevation: cubic Hermite (Catmull-Rom slopes) through periodic keys
  const zAt = makePeriodicProfile(zKeys, L, opts.z0 ?? 0);
  const points = pts.map((p) => [p.x, p.y, zAt(p.s), p.w, p.bank]);
  const fr = {};
  for (const k in marks) fr[k] = [marks[k][0] / L, marks[k][1] / L];
  return { points, startFrac: startS / L, marks: fr, length: L };
}

/**
 * Periodic C1 profile through keys [[s, value], ...] over [0, L) using cubic Hermite with
 * Catmull-Rom (finite difference) slopes. Returns f(s).
 */
export function makePeriodicProfile(keys, L, fallback = 0) {
  if (!keys.length) return () => fallback;
  const K = keys.slice().sort((a, b) => a[0] - b[0]);
  const m = K.length;
  if (m === 1) return () => K[0][1];
  const S = (k) => { // unwrapped key position
    const q = Math.floor(k / m);
    return K[((k % m) + m) % m][0] + q * L;
  };
  const V = (k) => K[((k % m) + m) % m][1];
  const slope = (k) => (V(k + 1) - V(k - 1)) / (S(k + 1) - S(k - 1));
  return (s) => {
    s = ((s % L) + L) % L;
    // find k with S(k) <= s < S(k+1)
    let k = -1;
    for (let q = 0; q < m; q++) if (K[q][0] <= s) k = q;
    // if s before first key, interval is (last-1 period, first)
    const s0 = S(k), s1 = S(k + 1);
    const h = s1 - s0, t = (s - s0) / h;
    const t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * V(k) + (t3 - 2 * t2 + t) * h * slope(k)
      + (-2 * t3 + 3 * t2) * V(k + 1) + (t3 - t2) * h * slope(k + 1);
  };
}
