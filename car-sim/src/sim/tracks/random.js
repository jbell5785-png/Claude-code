// Seeded procedural circuit generator (owner D: tracks).
//
// Star-shaped radial perturbation of a circle (low harmonics + per-point jitter), optional
// zigzag/chicane sequences (difficulty), optional elevation harmonics; centripetal Catmull–Rom +
// smoothing in createTrack. Candidates are validated cheaply on the smoothed centreline:
// minimum corner radius >= 15 m (scaled up if needed) and clearance between non-adjacent parts of
// the track (edges incl. widths) >= 14 m; failing candidates are re-rolled deterministically.
import { rng } from './util.js';
import { buildSamples, computeFrame, proximityGap } from './geometry.js';

const MIN_RADIUS = 15;
const MIN_GAP = 14;

/**
 * @param {number} seed
 * @param {{ difficulty?: number, obstacles?: number, elevation?: boolean }} [opts]
 * @returns {object} trackDef
 */
export function randomTrackDef(seed = 1, opts = {}) {
  const difficulty = Math.max(0, Math.min(1, opts.difficulty ?? 0.3));
  const nObs = Math.max(0, opts.obstacles ?? 0) | 0;
  let def = null, S = null, frame = null;
  for (let attempt = 0; attempt < 40 && !def; attempt++) {
    const r = rng((seed >>> 0) * 2654435761 + attempt * 97 + 13);
    const cand = candidate(r, difficulty, opts, attempt);
    // validate (and scale up for the minimum radius if moderately short of it)
    for (let k = 0; k < 3; k++) {
      const s = buildSamples(cand);
      const f = computeFrame(s);
      let km = 0;
      for (let i = 0; i < s.n; i++) km = Math.max(km, Math.abs(f.KAP[i]));
      const minR = 1 / km;
      if (minR < MIN_RADIUS) {
        const sc = (MIN_RADIUS / minR) * 1.03;
        if (sc > 1.6) break;
        for (const p of cand.points) { p[0] *= sc; p[1] *= sc; }
        continue;
      }
      if (proximityGap(s).gap < MIN_GAP) break;
      def = cand; S = s; frame = f;
      break;
    }
  }
  if (!def) { // fallback: gentle blob, always valid
    const r = rng(seed ^ 0xabcdef);
    def = candidate(r, 0, { ...opts, elevation: false }, 99);
    S = buildSamples(def); frame = computeFrame(S);
  }
  // start line: 60% into the longest low-curvature stretch
  const { n, ds } = S;
  const straight = (i) => Math.abs(frame.KAP[i]) < 1 / 400;
  let bestLen = 0, bestStart = 0;
  for (let i0 = 0; i0 < n; i0++) {
    if (!straight(i0) || straight((i0 - 1 + n) % n)) continue;
    let len = 0;
    while (len < n && straight((i0 + len) % n)) len++;
    if (len > bestLen) { bestLen = len; bestStart = i0; }
  }
  def.startFrac = ((bestStart + 0.6 * bestLen) % n) / n;
  // obstacles on straights, away from the start (s measured from the start line)
  if (nObs > 0) {
    const r = rng(seed * 31 + 7);
    const L = n * ds;
    const startIdx = Math.round(def.startFrac * n);
    const used = [];
    const obstacles = [];
    for (let tries = 0; tries < 400 && obstacles.length < nObs; tries++) {
      const sRel = 250 + r() * (L - 350);
      const i = (startIdx + Math.round(sRel / ds)) % n;
      if (Math.abs(frame.KAP[i]) > 1 / 120) continue;
      if (used.some((u) => Math.abs(u - sRel) < 120)) continue;
      used.push(sRel);
      const half = S.Wd[i] / 2;
      const box = r() < 0.4;
      const o = box
        ? { kind: 'box', hx: 0.8 + r() * 1.0, hy: 0.5 + r() * 0.8, heading: (r() - 0.5) * 60, h: 1.0 }
        : { kind: 'cylinder', r: 0.5 + r() * 0.5, h: 1.2 };
      o.s = sRel;
      o.offset = (r() * 2 - 1) * (half - 2.0);
      obstacles.push(o);
    }
    def.obstacles = obstacles;
  }
  def.key = 'random';
  def.seed = seed;
  def.difficulty = difficulty;
  def.label = `Random #${seed}${difficulty !== 0.3 ? ` (difficulty ${difficulty.toFixed(2)})` : ''}`;
  return def;
}

function candidate(r, d, opts, attempt) {
  const N = 14 + Math.floor(r() * 8);
  const R0 = 200 + r() * 170;
  const width = 10 + r() * 3;
  const harm = [];
  for (let k = 2; k <= 5; k++) harm.push({ k, a: (0.04 + r() * 0.12) * (0.7 + 0.6 * d) / Math.sqrt(k - 1), p: r() * Math.PI * 2 });
  const jitter = 0.05 + 0.1 * d;
  const elev = opts.elevation === false ? 0 : r() < 0.7 ? r() * 14 : 0;
  const e1 = r() * Math.PI * 2, e2 = r() * Math.PI * 2;
  const rad = (th) => {
    let v = 1;
    for (const h of harm) v += h.a * Math.sin(h.k * th + h.p);
    return R0 * v;
  };
  const zAt = (th) => elev * (0.7 * Math.sin(th + e1) + 0.3 * Math.sin(2 * th + e2));
  // angular samples with jitter
  const pts = [];
  const thetas = [];
  for (let k = 0; k < N; k++) thetas.push(((k + (r() - 0.5) * 0.5) / N) * Math.PI * 2);
  const radial = thetas.map((th) => rad(th) * (1 + (r() * 2 - 1) * jitter));
  // zigzag sequences (difficulty): replace an angular window by alternating lateral offsets
  const nZig = Math.floor(d * 2.2 + r() * d);
  const zig = [];
  for (let z = 0; z < nZig; z++) {
    const k = Math.floor(r() * N);
    if (zig.some((q) => Math.min(Math.abs(q - k), N - Math.abs(q - k)) < 3)) continue;
    zig.push(k);
  }
  for (let k = 0; k < N; k++) {
    const th0 = thetas[k], th1 = k + 1 < N ? thetas[k + 1] : thetas[0] + Math.PI * 2;
    const r0 = radial[k];
    pts.push([r0 * Math.cos(th0), r0 * Math.sin(th0), zAt(th0), width, 0]);
    if (zig.includes(k)) {
      // insert a zigzag between control points k and k+1
      const r1 = k + 1 < N ? radial[k + 1] : radial[0];
      const arc = (th1 - th0) * (r0 + r1) / 2;
      const m = Math.max(3, Math.min(6, Math.floor(arc / 45)));
      const amp = 7 + 7 * d;
      for (let q = 1; q < m; q++) {
        const u = q / m, th = th0 + (th1 - th0) * u;
        const rr = r0 + (r1 - r0) * u + (q % 2 ? amp : -amp) * Math.sin(Math.PI * u);
        pts.push([rr * Math.cos(th), rr * Math.sin(th), zAt(th), width, 0]);
      }
    }
  }
  return {
    key: 'random', points: pts, width, smooth: 4, zSmooth: 15,
    runoff: 7, edgeMax: 28, terrain: { amp: 1.5, radius: 90 },
    barrier: { kind: attempt % 2 ? 'tyres' : 'armco' }, scenery: { trees: 1, grandstands: 2 },
  };
}
