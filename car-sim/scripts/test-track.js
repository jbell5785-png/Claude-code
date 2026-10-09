// Headless tests for the track module (owner D): node scripts/test-track.js [--quick]
import { createTrack, createLapTimer, TRACKS, RAY, KERB_W } from '../src/sim/track.js';
import { SURFACE } from '../src/sim/constants.js';

const QUICK = process.argv.includes('--quick');
let failures = 0, checks = 0;
const fail = (msg) => { failures++; console.log('  FAIL', msg); };
const check = (cond, msg) => { checks++; if (!cond) fail(msg); return cond; };
const fmt = (v, d = 2) => (v == null ? '-' : Number(v).toFixed(d));

// deterministic RNG for tests
let seed = 12345;
const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

function wrapDs(a, L) { let d = a % L; if (d > L / 2) d -= L; if (d < -L / 2) d += L; return d; }

function segIntersect(ax, ay, bx, by, cx, cy, dx, dy) {
  const d1x = bx - ax, d1y = by - ay, d2x = dx - cx, d2y = dy - cy;
  const den = d1x * d2y - d1y * d2x;
  if (Math.abs(den) < 1e-12) return false;
  const u = ((cx - ax) * d2y - (cy - ay) * d2x) / den;
  const v = ((cx - ax) * d1y - (cy - ay) * d1x) / den;
  return u > 0 && u < 1 && v > 0 && v < 1;
}

/** Count intersections between all edge polylines (left/right asphalt+kerb edges), ignoring adjacent segments. */
function edgeIntersections(track) {
  const lines = track.edgeLines.map((e) => e.pts);
  const segs = [];
  lines.forEach((p, li) => { const m = p.length / 2; for (let k = 0; k < m; k++) { const k2 = (k + 1) % m; segs.push([p[2 * k], p[2 * k + 1], p[2 * k2], p[2 * k2 + 1], li, k, m]); } });
  const cell = 20, map = new Map();
  const key = (x, y) => `${Math.floor(x / cell)},${Math.floor(y / cell)}`;
  segs.forEach((s, id) => { const k = key((s[0] + s[2]) / 2, (s[1] + s[3]) / 2); (map.get(k) || map.set(k, []).get(k)).push(id); });
  let count = 0;
  segs.forEach((s, id) => {
    const cx = Math.floor((s[0] + s[2]) / 2 / cell), cy = Math.floor((s[1] + s[3]) / 2 / cell);
    for (let ox = -1; ox <= 1; ox++) for (let oy = -1; oy <= 1; oy++) {
      const list = map.get(`${cx + ox},${cy + oy}`); if (!list) continue;
      for (const j of list) {
        if (j <= id) continue;
        const t = segs[j];
        if (t[4] === s[4]) { let d = Math.abs(t[5] - s[5]); d = Math.min(d, s[6] - d); if (d <= 1) continue; }
        if (segIntersect(s[0], s[1], s[2], s[3], t[0], t[1], t[2], t[3])) count++;
      }
    }
  });
  return count;
}

function bruteRay(track, x, y, dx, dy, maxDist, mask) {
  let best = maxDist;
  const test = (ax, ay, bx, by) => {
    const ex = bx - ax, ey = by - ay, den = dx * ey - dy * ex;
    if (Math.abs(den) < 1e-12) return;
    const wx = ax - x, wy = ay - y;
    const t = (wx * ey - wy * ex) / den, u = (wx * dy - wy * dx) / den;
    if (t >= 0 && u >= 0 && u <= 1 && t < best) best = t;
  };
  if (mask & RAY.EDGE) for (const e of track.edgeLines) { const p = e.pts, m = p.length / 2; for (let k = 0; k < m; k++) { const k2 = (k + 1) % m; test(p[2 * k], p[2 * k + 1], p[2 * k2], p[2 * k2 + 1]); } }
  if (mask & RAY.WALL) { const s = track.walls.segs; for (let k = 0; k < track.walls.n; k++) test(s[4 * k], s[4 * k + 1], s[4 * k + 2], s[4 * k + 3]); }
  if (mask & RAY.OBSTACLE) for (const o of track.obstacles) {
    if (o.kind === 'cylinder') {
      const ox = x - o.x, oy = y - o.y, b = ox * dx + oy * dy, c = ox * ox + oy * oy - o.r * o.r, disc = b * b - c;
      if (disc >= 0) { let t = -b - Math.sqrt(disc); if (t < 0 && c <= 0) t = 0; if (t >= 0 && t < best) best = t; }
    } else {
      const c = Math.cos(o.heading), s = Math.sin(o.heading);
      const P = [[o.hx, o.hy], [-o.hx, o.hy], [-o.hx, -o.hy], [o.hx, -o.hy]].map(([a, b]) => [o.x + c * a - s * b, o.y + s * a + c * b]);
      for (let k = 0; k < 4; k++) test(P[k][0], P[k][1], P[(k + 1) % 4][0], P[(k + 1) % 4][1]);
    }
  }
  return best;
}

// ------------------------------------------------------------------------------------------------
// Synthetic car for lap timer tests
function makeCar() {
  return { pos: [0, 0, 0], time: 0, wheels: [0, 1, 2, 3].map(() => ({ pos: [0, 0, 0] })) };
}
const _p = {};
function placeCar(car, track, x, y, heading) {
  car.pos[0] = x; car.pos[1] = y;
  const c = Math.cos(heading), s = Math.sin(heading);
  const off = [[1.3, 0.8], [1.3, -0.8], [-1.3, 0.8], [-1.3, -0.8]];
  for (let i = 0; i < 4; i++) { car.wheels[i].pos[0] = x + c * off[i][0] - s * off[i][1]; car.wheels[i].pos[1] = y + s * off[i][0] + c * off[i][1]; }
}
function placeAtS(car, track, s, offset = 0, reverse = false) {
  track.pointAt(s, _p);
  placeCar(car, track, _p.x + offset * _p.nx, _p.y + offset * _p.ny, _p.heading + (reverse ? Math.PI : 0));
}
/** Drive from s0 to s1 (unwrapped, may be decreasing) at speed v with step dt. */
function drive(lt, car, track, s0, s1, v = 50, dt = 0.01, offset = 0) {
  const n = Math.max(1, Math.ceil(Math.abs(s1 - s0) / (v * dt)));
  for (let k = 1; k <= n; k++) {
    const s = s0 + ((s1 - s0) * k) / n;
    car.time += dt;
    placeAtS(car, track, s, offset, s1 < s0);
    lt.update(car);
  }
}
function driveLine(lt, car, ax, ay, bx, by, v = 50, dt = 0.01) {
  const d = Math.hypot(bx - ax, by - ay), n = Math.max(1, Math.ceil(d / (v * dt)));
  const h = Math.atan2(by - ay, bx - ax);
  for (let k = 1; k <= n; k++) { car.time += dt; placeCar(car, null, ax + ((bx - ax) * k) / n, ay + ((by - ay) * k) / n, h); lt.update(car); }
}

function lapTimerTests(track) {
  const L = track.length, v = 50;
  const res = {};
  // 1. three clean laps from the grid
  {
    const lt = createLapTimer(track), car = makeCar();
    const sp = track.startPose(0);
    const s0 = sp.s - L; // unwrapped, slightly negative
    placeAtS(car, track, s0); lt.update(car);
    drive(lt, car, track, s0, 3 * L + 30, v);
    res.laps = lt.lap;
    check(lt.lap === 3, `${track.key}: expected 3 laps, got ${lt.lap}`);
    check(lt.lastLap != null && Math.abs(lt.lastLap - L / v) < 0.02, `${track.key}: lap time ${lt.lastLap} vs ${L / v}`);
    check(lt.bestLap != null && lt.lastLapValid, `${track.key}: clean lap must be valid`);
    const ssum = lt.lastSectors.reduce((a, b) => a + b, 0);
    check(Math.abs(ssum - lt.lastLap) < 1e-6, `${track.key}: sectors sum ${ssum} != lap ${lt.lastLap}`);
    check(lt.cuts === 0 && lt.offTrackTime === 0, `${track.key}: clean laps have cuts=${lt.cuts} offTrack=${lt.offTrackTime}`);
    check(Math.abs(lt.progress - (3 * L + 30 - s0)) < 0.5, `${track.key}: progress ${lt.progress} vs ${3 * L + 30 - s0}`);
    res.lapTime = lt.lastLap;
  }
  // 2. reverse crossing of the line is not a lap, wrongWay flags
  {
    const lt = createLapTimer(track), car = makeCar();
    placeAtS(car, track, -40); lt.update(car);
    drive(lt, car, track, -40, 20, v);          // start lap
    drive(lt, car, track, 20, -60, 10);         // reverse back over the line
    const ww = lt.wrongWay;
    drive(lt, car, track, -60, 30, v);          // forward over the line again
    check(ww, `${track.key}: wrongWay not set while reversing`);
    check(lt.lap === 0, `${track.key}: reverse+forward crossing counted a lap (${lt.lap})`);
    check(!lt.wrongWay, `${track.key}: wrongWay stuck`);
    drive(lt, car, track, 30, L + 10, v);       // one real lap
    check(lt.lap === 1, `${track.key}: real lap after reversing not counted (${lt.lap})`);
    res.reverse = lt.lap === 1 && ww;
  }
  // 3. infield short cut: straight line from 25% to 60% of the lap → lap not counted
  {
    const lt = createLapTimer(track), car = makeCar();
    placeAtS(car, track, -20); lt.update(car);
    drive(lt, car, track, -20, 0.25 * L, v);
    const a = track.pointAt(0.25 * L), b = track.pointAt(0.6 * L);
    driveLine(lt, car, a.x, a.y, b.x, b.y, v);
    drive(lt, car, track, 0.6 * L, L + 20, v);
    const ok = lt.lap === 0 || (lt.lastLapValid === false && lt.bestLap === null);
    check(ok, `${track.key}: infield shortcut counted as a valid lap`);
    check(lt.progress < L + 40 - 0.35 * L + Math.hypot(b.x - a.x, b.y - a.y) + 1, `${track.key}: shortcut gained progress ${lt.progress}`);
    res.shortcut = ok;
  }
  // 4. drive off-track (all wheels on grass) for 100 m: offTrackTime and lap invalid
  {
    const lt = createLapTimer(track), car = makeCar();
    placeAtS(car, track, -20); lt.update(car);
    drive(lt, car, track, -20, 200, v);
    const p = track.pointAt(250);
    const off = p.widthL + KERB_W + 2.5;
    drive(lt, car, track, 200, 300, v, 0.01, off * (track.samples.edgeL[p.index] > KERB_W + 4 ? 1 : 0));
    drive(lt, car, track, 300, L + 20, v);
    const expectT = 100 / v;
    if (track.samples.edgeL[p.index] > KERB_W + 4) {
      check(Math.abs(lt.offTrackTime - expectT) < 0.3, `${track.key}: offTrackTime ${lt.offTrackTime} vs ~${expectT}`);
      check(lt.lap === 1 && lt.lastLapValid === false && lt.bestLap === null, `${track.key}: off-track lap should be counted but invalid`);
    }
    res.offTrack = lt.offTrackTime;
  }
  // 5. chicane / zigzag cut (if marked): straight line through it → lap invalid
  const mk = track.marks.chicane || track.marks.zigzag1;
  if (mk) {
    const lt = createLapTimer(track), car = makeCar();
    placeAtS(car, track, -20); lt.update(car);
    const sa = mk[0] - 15, sb = mk[1] + 15;
    drive(lt, car, track, -20, sa, v);
    const a = track.pointAt(sa), b = track.pointAt(sb);
    driveLine(lt, car, a.x, a.y, b.x, b.y, v);
    drive(lt, car, track, sb, L + 20, v);
    const detected = lt.lap === 0 || lt.lastLapValid === false;
    check(detected, `${track.key}: chicane cut not detected (lap=${lt.lap}, valid=${lt.lastLapValid}, cuts=${lt.cuts}, off=${lt.offTrackTime.toFixed(2)})`);
    res.chicane = detected ? (lt.cuts ? 'jump' : 'limits') : 'MISSED';
  }
  return res;
}

// ------------------------------------------------------------------------------------------------
const presets = ['gp', 'club', 'speedway', 'mountain', 'skidpad', 'drag', 'gauntlet'];
const randoms = QUICK ? [{ type: 'random', seed: 1 }] : [
  { type: 'random', seed: 1 }, { type: 'random', seed: 2 }, { type: 'random', seed: 3 },
  { type: 'random', seed: 4, difficulty: 0 }, { type: 'random', seed: 5, difficulty: 1, obstacles: 4 },
  { type: 'random', seed: 6, difficulty: 0.7, obstacles: 3 }, { type: 'random', seed: 7, difficulty: 1 },
];
const table = [];
const perfRows = [];

for (const key of [...presets, ...randoms]) {
  const name = typeof key === 'string' ? key : `random:${key.seed}${key.difficulty != null ? '/d' + key.difficulty : ''}${key.obstacles ? '/o' + key.obstacles : ''}`;
  console.log(`\n== ${name}`);
  const tb = performance.now();
  const tr = createTrack(key);
  const buildMs = performance.now() - tb;
  const S = tr.samples, n = S.n, L = tr.length;
  const st = tr.stats;

  // --- geometry stats
  let dk = 0, db = 0, dg = 0, minClear = Infinity, foldMax = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    dk = Math.max(dk, Math.abs(S.curvature[j] - S.curvature[i]));
    db = Math.max(db, Math.abs(S.bank[j] - S.bank[i]));
    dg = Math.max(dg, Math.abs(S.grade[j] - S.grade[i]));
    minClear = Math.min(minClear, S.freeL[i] - S.widthL[i], S.freeR[i] - S.widthR[i]);
    foldMax = Math.max(foldMax, Math.abs(S.curvature[i]) * Math.max(S.widthL[i], S.widthR[i]) + Math.abs(S.curvature[i]) * KERB_W);
  }
  const inter = edgeIntersections(tr);
  check(inter === 0, `${name}: ${inter} edge intersections`);
  check(foldMax < 0.7, `${name}: edge fold risk (kappa*halfwidth ${foldMax.toFixed(2)})`);
  check(minClear > KERB_W + 2, `${name}: min clearance to other track parts ${minClear.toFixed(1)} m`);
  check(dk < Math.max(0.004, 0.2 / st.minRadius), `${name}: curvature jump ${dk} (kappa max ${1 / st.minRadius})`);
  check(db < 0.005, `${name}: bank jump ${db}`);
  check(st.minRadius >= (name === 'gauntlet' ? 11 : 14.5), `${name}: min radius ${st.minRadius.toFixed(1)}`);
  const avgW = tr.width;
  check(avgW >= 9 && avgW <= 14.01, `${name}: width ${avgW}`);

  // --- query round trip
  const q = { s: 0, offset: 0, height: 0, nx: 0, ny: 0, nz: 1, surface: 0, index: -1 };
  const p = {};
  let errS = 0, errO = 0, errSg = 0, errOg = 0;
  const NRT = QUICK ? 2000 : 6000;
  for (let k = 0; k < NRT; k++) {
    const s = rand() * L;
    tr.pointAt(s, p);
    const i = p.index;
    const side = rand() < 0.5 ? 1 : -1;
    const lim = (side > 0 ? S.widthL[i] + S.edgeL[i] : S.widthR[i] + S.edgeR[i]) * 0.97;
    const o = side * rand() * lim;
    const x = p.x + o * p.nx, y = p.y + o * p.ny;
    tr.query(x, y, (i + Math.floor(rand() * 7) - 3 + n) % n, q);
    errS = Math.max(errS, Math.abs(wrapDs(q.s - s, L))); errO = Math.max(errO, Math.abs(q.offset - o));
    tr.query(x, y, -1, q);
    errSg = Math.max(errSg, Math.abs(wrapDs(q.s - s, L))); errOg = Math.max(errOg, Math.abs(q.offset - o));
  }
  check(errS < 1e-3 && errO < 1e-3, `${name}: round trip (hint) err s ${errS} o ${errO}`);
  check(errSg < 1e-3 && errOg < 1e-3, `${name}: round trip (global) err s ${errSg} o ${errOg}`);

  // --- height / normal consistency (finite differences) and continuity
  let gradErr = 0, gradErrAt = '', maxSlopeNear = 0, maxSlopeRoad = 0, jumpMax = 0;
  const NH = QUICK ? 2000 : 6000, h = 2e-4;
  const surfCount = [0, 0, 0, 0];
  for (let k = 0; k < NH; k++) {
    const s = rand() * L;
    tr.pointAt(s, p);
    const i = p.index;
    const side = rand() < 0.5 ? 1 : -1;
    const lim = (side > 0 ? S.widthL[i] + S.edgeL[i] : S.widthR[i] + S.edgeR[i]) + 15;
    const o = side * rand() * lim;
    const x = p.x + o * p.nx, y = p.y + o * p.ny;
    tr.query(x, y, i, q);
    const g0x = -q.nx / q.nz, g0y = -q.ny / q.nz, idx = q.index;
    surfCount[q.surface]++;
    const hx1 = tr.query(x + h, y, idx, q).height, hx0 = tr.query(x - h, y, idx, q).height;
    const hy1 = tr.query(x, y + h, idx, q).height, hy0 = tr.query(x, y - h, idx, q).height;
    const fx = (hx1 - hx0) / (2 * h), fy = (hy1 - hy0) / (2 * h);
    const e = Math.hypot(fx - g0x, fy - g0y);
    if (e > gradErr) { gradErr = e; gradErrAt = `s=${s.toFixed(1)} o=${o.toFixed(2)}`; }
    const slope = Math.hypot(g0x, g0y);
    const eo = Math.abs(o) - (side > 0 ? S.widthL[i] : S.widthR[i]);
    if (eo > 0) maxSlopeNear = Math.max(maxSlopeNear, slope); else maxSlopeRoad = Math.max(maxSlopeRoad, slope);
    // continuity: tiny step must give tiny height change
    const step = 0.01;
    const a = tr.query(x, y, idx, q).height, b = tr.query(x + step * 0.6, y + step * 0.8, idx, q).height;
    jumpMax = Math.max(jumpMax, Math.abs(b - a) - step * slope * 1.5);
  }
  check(gradErr < 0.02, `${name}: gradient vs normal error ${gradErr.toFixed(4)} at ${gradErrAt}`);
  check(jumpMax < 2e-3, `${name}: height discontinuity ${jumpMax}`);
  check(maxSlopeNear < 1.0, `${name}: max terrain slope near track ${maxSlopeNear.toFixed(2)}`);
  // continuity along lines crossing the track every ~50 m (fine steps), incl. kerbs & blend zone
  let crossJump = 0;
  for (let s = 0; s < L; s += 47) {
    tr.pointAt(s, p);
    let hint = p.index, prev = null;
    const lim = Math.max(S.widthL[p.index] + S.edgeL[p.index], S.widthR[p.index] + S.edgeR[p.index]) + 5;
    for (let o = -lim; o <= lim; o += 0.02) {
      const x = p.x + o * p.nx + o * 0.3 * p.tx, y = p.y + o * p.ny + o * 0.3 * p.ty;
      tr.query(x, y, hint, q); hint = q.index;
      if (prev != null) crossJump = Math.max(crossJump, Math.abs(q.height - prev) - 0.02 * 1.1 * Math.hypot(q.nx, q.ny) / q.nz);
      prev = q.height;
    }
  }
  check(crossJump < 2e-3, `${name}: cross-section height jump ${crossJump}`);

  // --- surfaces present
  if (tr.def.kerbs !== false) check(surfCount[SURFACE.KERB] > 0, `${name}: no kerbs found by random sampling`);

  // --- query performance
  const NP = QUICK ? 200000 : 1000000;
  const xs = new Float64Array(4096), ys = new Float64Array(4096);
  // simulate a car moving 0.15 m per step with lateral wander, hint = last index
  let hint = -1;
  const path = [];
  for (let k = 0; k < 4096; k++) {
    tr.pointAt((k * 0.15) % L, p);
    const o = Math.sin(k * 0.01) * (S.widthL[p.index] - 1);
    xs[k] = p.x + o * p.nx; ys[k] = p.y + o * p.ny;
  }
  let sink = 0;
  let t0 = performance.now();
  for (let k = 0; k < NP; k++) { const j = k & 4095; if (j === 0) hint = -1; tr.query(xs[j], ys[j], hint, q); hint = q.index; sink += q.height; }
  const nsHint = ((performance.now() - t0) * 1e6) / NP;
  const NG = QUICK ? 20000 : 100000;
  const gx = new Float64Array(1024), gy = new Float64Array(1024);
  for (let k = 0; k < 1024; k++) {
    tr.pointAt(rand() * L, p); const o = (rand() * 2 - 1) * 30;
    gx[k] = p.x + o * p.nx; gy[k] = p.y + o * p.ny;
  }
  t0 = performance.now();
  for (let k = 0; k < NG; k++) { const j = k & 1023; tr.query(gx[j], gy[j], -1, q); sink += q.height; }
  const nsGlobal = ((performance.now() - t0) * 1e6) / NG;
  check(nsHint < 300, `${name}: hinted query ${nsHint.toFixed(0)} ns`);

  // --- raycast correctness vs brute force & performance
  const out = { dist: 0, kind: 0, nx: 0, ny: 0 };
  let rayErr = 0, rayBad = 0;
  const NR = QUICK ? 300 : 1000;
  for (let k = 0; k < NR; k++) {
    tr.pointAt(rand() * L, p);
    const o = (rand() * 2 - 1) * S.widthL[p.index];
    const x = p.x + o * p.nx, y = p.y + o * p.ny;
    const a = rand() * Math.PI * 2, dx = Math.cos(a), dy = Math.sin(a);
    const mask = [7, 1, 2, 4, 3, 5][k % 6];
    const md = 20 + rand() * 180;
    const d1 = tr.raycast(x, y, dx, dy, md, mask, out), d2 = bruteRay(tr, x, y, dx, dy, md, mask);
    const e = Math.abs(d1 - d2);
    rayErr = Math.max(rayErr, e);
    if (e > 1e-3) rayBad++;
    if (d1 < md) check(out.kind & mask, `${name}: ray hit kind ${out.kind} not in mask ${mask}`);
  }
  // obstacles explicitly: a ray along the track towards each obstacle must hit it
  for (const ob of tr.obstacles) {
    tr.pointAt(ob.s - 30, p);
    const x = p.x + ob.offset * p.nx, y = p.y + ob.offset * p.ny;
    const dx = ob.x - x, dy = ob.y - y, dl = Math.hypot(dx, dy);
    const d = tr.raycast(x, y, dx / dl, dy / dl, 100, RAY.OBSTACLE, out);
    check(d < dl && out.kind === RAY.OBSTACLE, `${name}: ray to obstacle at s=${ob.s.toFixed(0)} missed`);
    check(Math.max(ob.gapL, ob.gapR) >= 5 - 1e-9, `${name}: obstacle gap ${Math.max(ob.gapL, ob.gapR).toFixed(2)} < 5 m`);
  }
  check(rayBad === 0, `${name}: ${rayBad}/${NR} rays differ from brute force (max err ${rayErr})`);
  // perf: 15 rays (±105°) of 100 m from positions along the racing line
  const NRP = QUICK ? 30000 : 150000;
  for (let k = 0; k < 20000; k++) sink += tr.raycast(xs[k & 4095], ys[k & 4095], 1, 0, 100, 7, null);
  t0 = performance.now();
  for (let k = 0; k < NRP; k++) {
    const j = (k * 7) & 4095;
    const th = (((k % 15) - 7) / 7) * 1.83 + Math.atan2(ys[(j + 1) & 4095] - ys[j], xs[(j + 1) & 4095] - xs[j]);
    sink += tr.raycast(xs[j], ys[j], Math.cos(th), Math.sin(th), 100, 7, null);
  }
  const nsRay = ((performance.now() - t0) * 1e6) / NRP;
  check(nsRay < 1000, `${name}: raycast ${nsRay.toFixed(0)} ns`);
  if (sink === 42) console.log('');

  // --- start poses
  for (let g = 0; g < 8; g++) {
    const sp = tr.startPose(g);
    tr.query(sp.x, sp.y, -1, q);
    check(q.surface === SURFACE.ASPHALT, `${name}: grid slot ${g} not on asphalt`);
  }
  // scenery sanity: trees not on the run-off
  let badTrees = 0;
  for (const t of tr.scenery.trees) {
    tr.query(t.x, t.y, -1, q);
    const i = q.index;
    const e = Math.abs(q.offset) - (q.offset >= 0 ? S.widthL[i] : S.widthR[i]);
    if (e < Math.min(q.offset >= 0 ? S.runoffL[i] : S.runoffR[i], 6) + 1) badTrees++;
  }
  check(badTrees === 0, `${name}: ${badTrees} trees on/near the run-off`);

  // --- lap timer
  const lr = lapTimerTests(tr);

  table.push({
    track: name, len: fmt(L / 1000, 3) + ' km', w: fmt(avgW, 1), minR: fmt(st.minRadius, 1), elev: fmt(st.elevationRange, 1),
    bank: fmt(st.maxBankDeg, 1), grade: fmt(st.maxGrade * 100, 1) + '%', crestR: st.minCrestRadius === Infinity ? '-' : fmt(st.minCrestRadius, 0),
    clear: fmt(minClear, 1), dK: dk.toExponential(1), rt: Math.max(errS, errO, errSg, errOg).toExponential(1),
    gradErr: gradErr.toExponential(1), slopeOff: fmt(maxSlopeNear, 2), obst: tr.obstacles.length,
    trees: tr.scenery.trees.length, build: fmt(buildMs, 0) + 'ms',
  });
  perfRows.push({ track: name, queryHint: nsHint.toFixed(0) + ' ns', queryGlobal: nsGlobal.toFixed(0) + ' ns', ray100m: nsRay.toFixed(0) + ' ns', laps: lr.laps, lap: fmt(lr.lapTime, 2), chicane: lr.chicane ?? '-' });
}

// determinism of random generator
{
  const a = createTrack({ type: 'random', seed: 9, difficulty: 0.5, obstacles: 2 }), b = createTrack({ type: 'random', seed: 9, difficulty: 0.5, obstacles: 2 });
  check(a.length === b.length && a.samples.x[100] === b.samples.x[100] && a.scenery.trees.length === b.scenery.trees.length, 'random generator not deterministic');
  const c = createTrack('random:10');
  check(Math.abs(c.length - a.length) > 1e-6, 'different seeds produce identical tracks');
}
check(Object.keys(TRACKS).length >= 8, 'TRACKS registry incomplete');

console.log('\nPreset statistics');
console.table(table);
console.log('Performance / lap timer');
console.table(perfRows);
console.log(`\n${checks - failures}/${checks} checks passed${failures ? `, ${failures} FAILED` : ''}`);
process.exit(failures ? 1 : 0);
