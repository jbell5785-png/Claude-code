// Test-only closed-loop "ideal drivers" for vehicle validation runs.
import { DT, G } from '../../src/sim/constants.js';
import { createVehicle } from '../../src/sim/vehicle.js';
import { createFlatTrack } from './flatTrack.js';

export function controls() {
  return { steer: 0, throttle: 0, brake: 0, handbrake: 0, shiftUp: false, shiftDown: false, gearMode: 'auto' };
}

function finiteState(v) {
  const a = [v.pos, v.vel, v.quat, v.angVel];
  for (const arr of a) for (const x of arr) if (!Number.isFinite(x)) return false;
  for (const w of v.wheels) if (!Number.isFinite(w.omega) || !Number.isFinite(w.Fz)) return false;
  return true;
}
export { finiteState };

/** Max driven-wheel slip ratio (ωR − vx)/max(vx, 2) from public state. */
function drivenSlip(v) {
  const d = v.drive; let k = -1;
  for (let i = 0; i < 4; i++) {
    const driven = i < 2 ? d.frontDriven : d.rearDriven;
    if (!driven) continue;
    const vx = v.vxW[i];
    const s = (v.wheels[i].omega * v.rad[i] - vx) / Math.max(Math.abs(vx), 2);
    if (s > k) k = s;
  }
  return k;
}
function brakeSlip(v) {
  let k = 0;
  for (let i = 0; i < 4; i++) {
    const vx = v.vxW[i];
    if (vx < 1) continue;
    const s = (vx - v.wheels[i].omega * v.rad[i]) / vx;
    if (s > k) k = s;
  }
  return k;
}

/**
 * Standing start, full throttle with an ideal driver modulating wheelspin; auto gearbox.
 * @returns {{t60:number,t100:number,tQuarter:number,vQuarter:number,vTop:number,ok:boolean}}
 */
export function accelRun(params, maxTime = 150) {
  const v = createVehicle(params, createFlatTrack(), { x: 0, y: 0, heading: 0 });
  const c = controls();
  for (let i = 0; i < 250; i++) v.step(c); // settle
  // staged launch: hold the brake and pre-rev for 1 s (ICE), timing starts at brake release
  c.brake = 1; c.throttle = 1;
  for (let i = 0; i < 500; i++) v.step(c);
  c.brake = 0;
  const x0 = v.pos[0], t0 = v.time;
  let thr = 1, t60 = 0, t100 = 0, tQ = 0, vQ = 0, vTop = 0, lastCheckV = 0, lastCheckT = 0, ok = true;
  const target = v.peakSlip;
  while (v.time - t0 < maxTime) {
    const k = drivenSlip(v);
    thr = Math.min(1, Math.max(0.2, thr + DT * 30 * (target * 1.1 - k)));
    c.throttle = thr;
    v.step(c);
    if (!finiteState(v)) { ok = false; break; }
    const spd = v.speed, t = v.time - t0;
    if (!t60 && spd >= 60 / 3.6) t60 = t;
    if (!t100 && spd >= 100 / 3.6) t100 = t;
    if (!tQ && v.pos[0] - x0 >= 402.336) { tQ = t; vQ = spd; }
    if (spd > vTop) vTop = spd;
    if (t - lastCheckT >= 5) {
      if (tQ && spd - lastCheckV < 0.1 && t > 20) break;
      lastCheckV = spd; lastCheckT = t;
    }
  }
  return { t60, t100, tQuarter: tQ, vQuarter: vQ, vTop, ok };
}

/** 100→0 km/h with full braking (ideal threshold braking if no ABS). @returns distance m */
export function brakeRun(params) {
  const v = createVehicle(params, createFlatTrack(), { x: 0, y: 0, heading: 0 });
  const c = controls();
  let thr = 1;
  while (v.speed < 103 / 3.6 && v.time < 60) {
    const k = drivenSlip(v);
    if (k > v.peakSlip * 1.25) thr -= DT * 10; else thr += DT * 5;
    c.throttle = Math.min(1, Math.max(0.15, thr));
    v.step(c);
  }
  c.throttle = 0;
  // coast until exactly 100 km/h, then brake
  while (v.speed > 100 / 3.6) v.step(c);
  const x0 = v.pos[0], y0 = v.pos[1];
  const hasABS = v.hasABS;
  let brk = 1;
  const t0 = v.time;
  while (v.speed > 0.05 && v.time - t0 < 20) {
    if (!hasABS) {
      const k = brakeSlip(v);
      if (k > v.peakSlip * 1.3) brk -= DT * 12; else brk += DT * 6;
      brk = Math.min(1, Math.max(0.1, brk));
    }
    c.brake = brk;
    v.step(c);
  }
  return { dist: Math.hypot(v.pos[0] - x0, v.pos[1] - y0), time: v.time - t0, maxTempC: Math.max(...v.wheels.map((w) => w.brakeTempC)) };
}

/**
 * Steady-state skidpad on a radius-R circle (left turn), slowly ramping speed with a closed-loop
 * path-following steering controller. @returns max sustained lateral acceleration in g.
 */
export function skidpadRun(params, R = 50) {
  const v = createVehicle(params, createFlatTrack(), { x: 0, y: 0, heading: 0 });
  const c = controls();
  const cx = 0, cy = R, L = params.geometry.wheelbase, lock = params.steering.maxLock;
  let I = 0, vT = 8, ayF = 0, best = 0, bestV = 0, held = 0;
  const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  while (v.time < 400) {
    const px = v.pos[0] - cx, py = v.pos[1] - cy;
    const r = Math.hypot(px, py), e = r - R;
    const theta = Math.atan2(py, px) + Math.PI / 2;
    const chi = Math.hypot(v.vel[0], v.vel[1]) > 1 ? Math.atan2(v.vel[1], v.vel[0]) : v.heading;
    const pe = wrap(chi - theta);
    I = Math.max(-0.2, Math.min(0.2, I + 0.02 * e * DT));
    const delta = L / R + I + 0.03 * e - 0.8 * pe;
    c.steer = Math.max(-1, Math.min(1, delta / lock));
    const spd = Math.hypot(v.vel[0], v.vel[1]);
    const ev = vT - spd;
    c.throttle = Math.max(0, Math.min(1, 0.25 + 0.6 * ev));
    c.brake = ev < -1.5 ? Math.min(1, -0.2 * ev) : 0;
    v.step(c);
    if (!finiteState(v)) break;
    const ay = v.accBody[1];
    ayF += (ay - ayF) * DT / 0.5;
    if (Math.abs(e) < 1.5 && Math.abs(pe) < 0.12) {
      held += DT;
      if (held > 1.5 && ayF > best) { best = ayF; bestV = spd; }
    } else held = 0;
    if (e > 8 || e < -8 || Math.abs(pe) > 0.6) break;
    // ramp speed slowly once settled
    if (v.time > 5) vT += 0.08 * DT;
    if (Math.abs(e) > 3) vT -= 0.3 * DT;   // back off when running wide
  }
  return { g: best / G, v: bestV };
}

/** Parked on a grade with brakes: returns drift (m) over `secs`. */
export function slopeRun(params, grade = 0.1, heading = 0, secs = 10) {
  const v = createVehicle(params, createFlatTrack({ grade }), { x: 0, y: 0, heading });
  const c = controls();
  c.brake = 1;
  const x0 = v.pos[0], y0 = v.pos[1], z0 = v.pos[2];
  let jit = 0, prevx = x0;
  for (let i = 0; i < secs / DT; i++) {
    v.step(c);
    jit = Math.max(jit, Math.abs(v.pos[0] - prevx)); prevx = v.pos[0];
  }
  return { drift: Math.hypot(v.pos[0] - x0, v.pos[1] - y0, v.pos[2] - z0), maxStep: jit, gear: v.gear };
}

/** Spawn and sit still: max vertical excursion (m) of the body over `secs`. */
export function spawnRun(params, track, pose, secs = 2) {
  const v = createVehicle(params, track || createFlatTrack(), pose || { x: 0, y: 0, heading: 0 });
  const c = controls();
  const z0 = v.pos[2];
  let dz = 0, dxy = 0;
  const x0 = v.pos[0], y0 = v.pos[1];
  for (let i = 0; i < secs / DT; i++) {
    v.step(c);
    dz = Math.max(dz, Math.abs(v.pos[2] - z0));
    dxy = Math.max(dxy, Math.hypot(v.pos[0] - x0, v.pos[1] - y0));
  }
  return { dz, dxy };
}

/**
 * Step steer at ~80 km/h to ~0.4 g steady. Returns yaw-rate response metrics.
 */
export function stepSteerRun(params, speed = 80 / 3.6, ayTarget = 4) {
  const v = createVehicle(params, createFlatTrack(), { x: 0, y: 0, heading: 0 });
  const c = controls();
  const spdCtl = () => {
    const ev = speed - v.speed;
    c.throttle = Math.max(0, Math.min(1, 0.3 + 0.4 * ev));
    c.brake = ev < -2 ? 0.3 : 0;
  };
  while (v.time < 40 && Math.abs(v.speed - speed) > 0.2) { spdCtl(); v.step(c); }
  for (let i = 0; i < 1000; i++) { spdCtl(); v.step(c); }
  const Rr = speed * speed / ayTarget;
  const delta = params.geometry.wheelbase / Rr * 1.15;
  c.steer = delta / params.steering.maxLock;
  const t0 = v.time;
  const hist = [];
  while (v.time - t0 < 4) {
    // hold throttle constant during the manoeuvre (open loop)
    v.step(c);
    hist.push(v.angVel[2]);
  }
  const n = hist.length, final = hist.slice(n - 250).reduce((a, b) => a + b, 0) / 250;
  let peak = 0, tRise = 0;
  for (let i = 0; i < n; i++) {
    if (Math.abs(hist[i]) > Math.abs(peak)) peak = hist[i];
    if (!tRise && Math.abs(hist[i]) >= 0.9 * Math.abs(final)) tRise = i * DT;
  }
  let spread = 0;
  for (let i = n - 500; i < n; i++) spread = Math.max(spread, Math.abs(hist[i] - final));
  return {
    final, peak, overshoot: Math.abs(final) > 1e-6 ? (Math.abs(peak) / Math.abs(final) - 1) : 0,
    tRise, settled: spread < 0.02 * Math.abs(final) + 1e-3, ay: v.accBody[1],
  };
}
