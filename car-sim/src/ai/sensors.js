// Observation spec v1 — the exact input vector every AI team receives (fairness: identical for all).
// Documented in COMPETITION.md §4. Fixed layout, fixed normalisation, versioned: if anything here
// changes, OBS_VERSION must be bumped (brains record the version they were trained with).
//
// Layout (OBS_SIZE = 79 floats, roughly in [-1, 1]):
//   [ 0..14]  edge rays   — distance to the edge of the asphalt+kerb  (track.raycast mask EDGE)
//   [15..29]  solid rays  — distance to walls / obstacles             (mask WALL | OBSTACLE)
//   [30..44]  car rays    — distance to other cars' bodies (ray vs oriented box)
//             15 fixed angles relative to the car heading (deg, + = left):
//             RAY_ANGLES = [-100,-75,-55,-40,-28,-18,-9,0,9,18,28,40,55,75,100]
//             origin = car CG (x, y); value = sqrt(min(d, max) / max), so 0 = touching, 1 = nothing
//             in range. max = 120 m (edge), 120 m (solid), 60 m (cars).
//   [45..72]  driver feel (28):
//     45 speed / 60 m/s                    46 lateral velocity (body, +left) / 5 m/s
//     47 yaw rate / 1.5 rad/s              48 longitudinal accel / 10 m/s²   49 lateral accel / 10 m/s²
//     50 front tyre usage (mean, ≤ 2)      51 rear tyre usage (mean, ≤ 2)   (1 = at the friction limit)
//     52 front slip angle (mean) / 0.15    53 rear slip angle (mean) / 0.15 rad (signed)
//     54 driven-wheel slip ratio (mean) / 0.2 (clamped ±3)
//     55 rpm / redline                     56 gear / number of gears (EV: 1)
//     57 sin(heading error)                58 cos(heading error)   (error = car heading − track tangent)
//     59 lateral offset / half width (+left; ±1 = at the asphalt edge)
//     60 track half width / 10 m           61 road-wheel steer angle / max lock
//     62 fraction of wheels on asphalt/kerb
//     63..70 centreline curvature 5, 10, 20, 35, 50, 75, 100, 150 m ahead × 20 (clamped ±2; +left)
//     71 road grade (dz/ds) × 5            72 nitrous remaining (fraction of bottle; 0 = no kit)
//   [73..78]  traffic (nearest car ahead / behind within 60 m along the track):
//     73 gap ahead / 60 (1 = none)   74 lateral offset of that car − mine / 5   75 its speed − mine / 20
//     76 gap behind / 60 (1 = none)  77 lateral offset difference / 5           78 speed difference / 20
//
// The whole vector is computed without allocations; observe() can be called at 50 Hz for ~100 cars.

import { RAY } from '../sim/track.js';

export const OBS_VERSION = 1;
export const RAY_ANGLES_DEG = [-100, -75, -55, -40, -28, -18, -9, 0, 9, 18, 28, 40, 55, 75, 100];
export const N_RAYS = RAY_ANGLES_DEG.length;
export const RAY_MAX = { edge: 120, solid: 120, cars: 60 };
export const CURV_PREVIEW_M = [5, 10, 20, 35, 50, 75, 100, 150];
export const OBS = {
  EDGE: 0, SOLID: N_RAYS, CARS: 2 * N_RAYS,
  SPEED: 45, VLAT: 46, YAW: 47, AX: 48, AY: 49, USE_F: 50, USE_R: 51, SA_F: 52, SA_R: 53, SR_DRIVEN: 54,
  RPM: 55, GEAR: 56, HEAD_SIN: 57, HEAD_COS: 58, OFFSET: 59, HALFW: 60, STEER: 61, ON_TRACK: 62,
  CURV: 63, GRADE: 71, NITROUS: 72, AHEAD: 73, BEHIND: 76,
};
export const OBS_SIZE = 79;

/** Human-readable names for every index (used by the AI Lab and COMPETITION.md). */
export const OBS_NAMES = (() => {
  const n = [];
  for (const ch of ['edge', 'solid', 'car']) for (const a of RAY_ANGLES_DEG) n.push(`${ch}Ray${a >= 0 ? '+' : ''}${a}`);
  n.push('speed', 'vLat', 'yawRate', 'accLong', 'accLat', 'usageF', 'usageR', 'slipAngleF', 'slipAngleR', 'slipRatioDriven',
    'rpmFrac', 'gearFrac', 'headingSin', 'headingCos', 'offsetNorm', 'halfWidth', 'steer', 'onTrack');
  for (const d of CURV_PREVIEW_M) n.push(`curv${d}m`);
  n.push('grade', 'nitrous', 'aheadGap', 'aheadLat', 'aheadRelSpeed', 'behindGap', 'behindLat', 'behindRelSpeed');
  return n;
})();

const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);

/**
 * Create a sensor suite (one per car; holds scratch state).
 * @returns {{ size: number, version: number, observe(v, track, world, out?: Float32Array): Float32Array,
 *             rays: Float32Array /* last raw distances (m): edge[15], solid[15], cars[15] *\/ }}
 */
export function createSensors() {
  const out0 = new Float32Array(OBS_SIZE);
  const rays = new Float32Array(3 * N_RAYS);
  const ca = new Float64Array(N_RAYS), sa = new Float64Array(N_RAYS);
  for (let k = 0; k < N_RAYS; k++) { const a = (RAY_ANGLES_DEG[k] * Math.PI) / 180; ca[k] = Math.cos(a); sa[k] = Math.sin(a); }
  const rdx = new Float64Array(N_RAYS), rdy = new Float64Array(N_RAYS);
  const pt = { x: 0, y: 0, z: 0, tx: 1, ty: 0, heading: 0, curvature: 0, bank: 0 };

  function observe(v, track, world, out = out0) {
    const S = track.samples, n = S.n, ds = S.ds;
    const x = v.pos[0], y = v.pos[1], h = v.heading;
    const ch = Math.cos(h), sh = Math.sin(h);
    for (let k = 0; k < N_RAYS; k++) { rdx[k] = ch * ca[k] - sh * sa[k]; rdy[k] = sh * ca[k] + ch * sa[k]; }

    // --- lidar: track edges, solid objects
    const EM = RAY_MAX.edge, SM = RAY_MAX.solid, CM = RAY_MAX.cars;
    for (let k = 0; k < N_RAYS; k++) {
      const de = track.raycast(x, y, rdx[k], rdy[k], EM, RAY.EDGE);
      const dsd = track.raycast(x, y, rdx[k], rdy[k], SM, RAY.WALL | RAY.OBSTACLE);
      rays[k] = de; rays[N_RAYS + k] = dsd;
      out[OBS.EDGE + k] = Math.sqrt(clamp(de / EM, 0, 1));
      out[OBS.SOLID + k] = Math.sqrt(clamp(dsd / SM, 0, 1));
      rays[2 * N_RAYS + k] = CM;
    }
    // --- car rays (ray vs oriented box) + nearest car ahead/behind along the track
    const ts = v.trackState, L = track.length;
    let gapA = 60, latA = 0, dvA = 0, gapB = 60, latB = 0, dvB = 0;
    const cars = world && world.cars;
    if (cars) {
      for (let c = 0; c < cars.length; c++) {
        const o = cars[c];
        if (o === v || !o || o.ghostSensors) continue;
        const ox = o.pos[0] - x, oy = o.pos[1] - y;
        const d2 = ox * ox + oy * oy;
        if (d2 > (CM + 6) * (CM + 6)) continue;
        // track-relative traffic
        let dsT = o.trackState.s - ts.s;
        if (dsT > L / 2) dsT -= L; else if (dsT < -L / 2) dsT += L;
        if (dsT >= 0 && dsT < gapA) { gapA = dsT; latA = o.trackState.offset - ts.offset; dvA = o.speed - v.speed; }
        else if (dsT < 0 && -dsT < gapB) { gapB = -dsT; latB = o.trackState.offset - ts.offset; dvB = o.speed - v.speed; }
        // oriented box of the other car
        const geo = o.params.geometry || {};
        const hl = 0.5 * (geo.length || 4.3), hw = 0.5 * (geo.width || 1.85);
        const oc = Math.cos(o.heading), os = Math.sin(o.heading);
        // ray origin in the box frame
        const px = -(ox * oc + oy * os), py = -(-ox * os + oy * oc);
        for (let k = 0; k < N_RAYS; k++) {
          const dx = rdx[k] * oc + rdy[k] * os, dy = -rdx[k] * os + rdy[k] * oc;
          let t0 = 0, t1 = rays[2 * N_RAYS + k];
          if (Math.abs(dx) < 1e-9) { if (px < -hl || px > hl) continue; }
          else { let a = (-hl - px) / dx, b = (hl - px) / dx; if (a > b) { const t = a; a = b; b = t; } if (a > t0) t0 = a; if (b < t1) t1 = b; if (t0 > t1) continue; }
          if (Math.abs(dy) < 1e-9) { if (py < -hw || py > hw) continue; }
          else { let a = (-hw - py) / dy, b = (hw - py) / dy; if (a > b) { const t = a; a = b; b = t; } if (a > t0) t0 = a; if (b < t1) t1 = b; if (t0 > t1) continue; }
          rays[2 * N_RAYS + k] = t0;
        }
      }
    }
    for (let k = 0; k < N_RAYS; k++) out[OBS.CARS + k] = Math.sqrt(clamp(rays[2 * N_RAYS + k] / CM, 0, 1));

    // --- driver feel
    const vx = v.vel[0], vy = v.vel[1];
    const vLat = -sh * vx + ch * vy;
    out[OBS.SPEED] = v.speed / 60;
    out[OBS.VLAT] = clamp(vLat / 5, -3, 3);
    out[OBS.YAW] = clamp(v.angVel[2] / 1.5, -3, 3);
    out[OBS.AX] = clamp(v.accBody[0] / 10, -3, 3);
    out[OBS.AY] = clamp(v.accBody[1] / 10, -3, 3);
    const W = v.wheels;
    out[OBS.USE_F] = Math.min(2, 0.5 * ((W[0].usage || 0) + (W[1].usage || 0)));
    out[OBS.USE_R] = Math.min(2, 0.5 * ((W[2].usage || 0) + (W[3].usage || 0)));
    out[OBS.SA_F] = clamp(0.5 * ((W[0].slipAngle || 0) + (W[1].slipAngle || 0)) / 0.15, -3, 3);
    out[OBS.SA_R] = clamp(0.5 * ((W[2].slipAngle || 0) + (W[3].slipAngle || 0)) / 0.15, -3, 3);
    const ax = v.params.axles;
    let sr = 0, nd = 0;
    for (let i = 0; i < 4; i++) if (ax[i >> 1].driven) { sr += W[i].slipRatio || 0; nd++; }
    out[OBS.SR_DRIVEN] = clamp((nd ? sr / nd : 0) / 0.2, -3, 3);
    const es = v.engines && v.engines[0];
    const ep = v.params.powerUnits[0].engine;
    out[OBS.RPM] = es ? clamp(es.rpm / (ep.redlineRpm || ep.maxRpm || 7000), 0, 1.5) : 0;
    out[OBS.GEAR] = v.nGears > 1 ? clamp(v.gear / v.nGears, -0.5, 1) : (v.gear < 0 ? -1 : 1);
    // track-relative
    let i = ts.index; if (!(i >= 0)) i = 0; if (i >= n) i = n - 1;
    const tx = S.tx[i], ty = S.ty[i];
    const tl = Math.hypot(tx, ty) || 1;
    const hs = (ch * ty - sh * tx) / tl, hc = (ch * tx + sh * ty) / tl; // sin/cos of (tangent − heading)
    out[OBS.HEAD_SIN] = -hs; out[OBS.HEAD_COS] = hc;                    // error = heading − tangent
    const wL = S.widthL[i], wR = S.widthR[i], half = 0.5 * (wL + wR);
    out[OBS.OFFSET] = clamp(ts.offset / half, -4, 4);
    out[OBS.HALFW] = half / 10;
    const lock = v.params.steering.maxLock || 0.6;
    out[OBS.STEER] = clamp(0.5 * (W[0].steer + W[1].steer) / lock, -1.5, 1.5);
    let on = 0; for (let w = 0; w < 4; w++) if (W[w].surface === 0 || W[w].surface === 1) on++;
    out[OBS.ON_TRACK] = on / 4;
    for (let k = 0; k < CURV_PREVIEW_M.length; k++) {
      const j = (i + Math.round(CURV_PREVIEW_M[k] / ds)) % n;
      out[OBS.CURV + k] = clamp(S.curvature[j] * 20, -2, 2);
    }
    out[OBS.GRADE] = S.grade ? clamp(S.grade[i] * 5, -2, 2) : 0;
    out[OBS.NITROUS] = es && es.nitrousCapacityKg > 0 ? clamp(es.nitrousKg / es.nitrousCapacityKg, 0, 1) : 0;
    out[OBS.AHEAD] = gapA / 60; out[OBS.AHEAD + 1] = gapA < 60 ? clamp(latA / 5, -2, 2) : 0; out[OBS.AHEAD + 2] = gapA < 60 ? clamp(dvA / 20, -2, 2) : 0;
    out[OBS.BEHIND] = gapB / 60; out[OBS.BEHIND + 1] = gapB < 60 ? clamp(latB / 5, -2, 2) : 0; out[OBS.BEHIND + 2] = gapB < 60 ? clamp(dvB / 20, -2, 2) : 0;
    void pt;
    return out;
  }

  return { size: OBS_SIZE, version: OBS_VERSION, observe, rays, rayDirs: { dx: rdx, dy: rdy } };
}
