// Vehicle dynamics validation (owner C). Run: node scripts/test-vehicle.js [presetKey ...] [--quick]
//
// For every preset: 0-100 km/h, quarter mile, top speed (ideal throttle, auto gearbox), 100-0 km/h
// braking, steady-state 50 m skidpad lateral g (closed-loop steering), compared with `targets`.
// Plus: parked on a 10 % slope with brakes (drift), static equilibrium at spawn, step-steer yaw
// response, long runs on the real tracks with a path-following driver (NaN / stability), gearbox
// functions (reverse, manual, launch control), engine failure, brake fade, and µs/step.
import { build } from '../src/sim/build.js';
import { PRESETS } from '../src/sim/presets.js';
import { createTrack, TRACKS } from '../src/sim/track.js';
import { createVehicle } from '../src/sim/vehicle.js';
import { DT, G } from '../src/sim/constants.js';
import { createFlatTrack } from './lib/flatTrack.js';
import {
  controls, accelRun, brakeRun, skidpadRun, slopeRun, spawnRun, stepSteerRun, finiteState,
} from './lib/drivers.js';

const args = process.argv.slice(2);
const quick = args.includes('--quick');
const only = args.filter((a) => !a.startsWith('--'));
let failures = 0;
const T0 = Date.now();
const fail = (msg) => { failures++; console.log(`  FAIL ${msg}`); };
const pass = (msg) => console.log(`  ok   ${msg}`);
const check = (cond, msg) => (cond ? pass(msg) : fail(msg));

const fmt = (x, d = 2) => (x == null || !Number.isFinite(x) ? '   -  ' : x.toFixed(d).padStart(6));
const errPct = (sim, tgt) => (tgt == null || !sim ? null : (sim - tgt) / tgt * 100);
const fmtErr = (e) => (e == null ? '      ' : `${e >= 0 ? '+' : ''}${e.toFixed(0)}%`.padStart(6));

// ---------------------------------------------------------------------------------------------
// 1. Preset performance table
// ---------------------------------------------------------------------------------------------
console.log('\n== Preset performance vs targets (sim / target / error) ==');
console.log('preset        | 0-100 s              | 1/4 mile s           | top km/h             | 100-0 m              | skidpad g            | slope cm | spawn mm | step-steer');
const rows = [];
for (const [key, pr] of Object.entries(PRESETS)) {
  if (only.length && !only.includes(key)) continue;
  const p = build(pr.spec);
  if (p.errors.length) console.log(`  (${key} build errors: ${p.errors.join('; ')})`);
  const t = pr.targets || {};
  const acc = accelRun(p, quick ? 60 : 150);
  const brk = brakeRun(p);
  const sk = skidpadRun(p);
  const sl = slopeRun(p, 0.1, 0, 10);
  const sp = spawnRun(p);
  const st = stepSteerRun(p);
  const r = {
    key, acc, brk, sk, sl, sp, st,
    e100: errPct(acc.t100, t.zeroTo100s), eQ: errPct(acc.tQuarter, t.quarterMileS),
    eTop: errPct(acc.vTop * 3.6, t.topSpeedKph), eBrk: errPct(brk.dist, t.brake100to0m), eG: errPct(sk.g, t.lateralG),
  };
  rows.push(r);
  console.log(
    `${key.padEnd(13)} |${fmt(acc.t100)} ${fmt(t.zeroTo100s, 1)} ${fmtErr(r.e100)} |${fmt(acc.tQuarter)} ${fmt(t.quarterMileS, 1)} ${fmtErr(r.eQ)} |`
    + `${fmt(acc.vTop * 3.6, 0)} ${fmt(t.topSpeedKph, 0)} ${fmtErr(r.eTop)} |${fmt(brk.dist, 1)} ${fmt(t.brake100to0m, 1)} ${fmtErr(r.eBrk)} |`
    + `${fmt(sk.g)} ${fmt(t.lateralG)} ${fmtErr(r.eG)} | ${fmt(sl.drift * 100, 2)} | ${fmt(sp.dz * 1000, 3)} | `
    + `os ${(st.overshoot * 100).toFixed(1)}% t90 ${st.tRise.toFixed(2)}s ${st.settled ? 'settled' : 'NOT settled'}`,
  );
}
console.log('\n-- checks --');
for (const r of rows) {
  check(r.acc.ok && r.acc.t100 > 0, `${r.key}: reaches 100 km/h, no NaN`);
  check(r.sl.drift < 0.02, `${r.key}: parked on 10% slope with brakes, drift ${(r.sl.drift * 100).toFixed(2)} cm < 2 cm`);
  check(r.sp.dz < 0.005, `${r.key}: static equilibrium at spawn, bounce ${(r.sp.dz * 1000).toFixed(4)} mm < 5 mm`);
  check(r.st.settled, `${r.key}: step-steer yaw rate settles (overshoot ${(r.st.overshoot * 100).toFixed(1)}%)`);
  for (const [n, e] of [['0-100', r.e100], ['1/4 mile', r.eQ], ['top speed', r.eTop], ['braking', r.eBrk], ['skidpad', r.eG]]) {
    if (e != null && Math.abs(e) > 15) console.log(`  note ${r.key}: ${n} off target by ${e.toFixed(0)}%`);
  }
}

// ---------------------------------------------------------------------------------------------
// 2. Functional checks (gearbox, aids, failures, fade)
// ---------------------------------------------------------------------------------------------
console.log(`\n== Functional checks == (${((Date.now() - T0) / 1000).toFixed(0)} s)`);
{
  const key = PRESETS.naCoupe ? 'naCoupe' : Object.keys(PRESETS)[0];
  const p = build(PRESETS[key].spec);
  // Reverse in auto: hold brake at standstill -> R, throttle reverses
  let v = createVehicle(p, createFlatTrack(), { x: 0, y: 0, heading: 0 });
  let c = controls();
  c.brake = 1;
  for (let i = 0; i < 600; i++) v.step(c);
  const gearR = v.gear;
  c.brake = 0; c.throttle = 0.4;
  for (let i = 0; i < 1500; i++) v.step(c);
  check(gearR === -1 && v.speed < -2, `auto reverse: gear ${gearR}, speed after 3 s ${v.speed.toFixed(2)} m/s`);
  // brake to a stop and keep holding -> stays in R (no toggle when braking into a stop)
  c.throttle = 0; c.brake = 1;
  for (let i = 0; i < 1500; i++) v.step(c);
  const gearStill = v.gear;
  // release, then a fresh press held at standstill -> N; throttle -> forward
  c.brake = 0; for (let i = 0; i < 10; i++) v.step(c);
  c.brake = 1; for (let i = 0; i < 400; i++) v.step(c);
  const gearN = v.gear;
  c.brake = 0; c.throttle = 0.4;
  for (let i = 0; i < 1500; i++) v.step(c);
  check(gearStill === -1 && gearN === 0, `auto: braking to rest keeps R (${gearStill}); fresh brake hold at rest selects N (${gearN})`);
  check(v.gear >= 1 && v.speed > 2, `auto leave reverse: gear ${v.gear}, speed ${v.speed.toFixed(2)} m/s`);
  // braking to a stop in D and holding the brake must NOT select reverse
  c.throttle = 0; c.brake = 1;
  for (let i = 0; i < 3000; i++) v.step(c);
  check(v.gear === 0, `auto: stopping and holding the brake in D gives N, not R (gear ${v.gear})`);

  // Manual mode: shift up through gears with paddles
  v = createVehicle(p, createFlatTrack(), { x: 0, y: 0, heading: 0 });
  c = controls(); c.gearMode = 'manual';
  const press = (field) => { c[field] = true; v.step(c); c[field] = false; v.step(c); };
  press('shiftUp');
  c.throttle = 1;
  let maxGear = 1, maxRpm = 0, limiterHit = false;
  for (let i = 0; i < 500 * 25; i++) {
    v.step(c);
    const rpm = v.engines[0].rpm;
    maxRpm = Math.max(maxRpm, rpm);
    if (v.engines[0].limiter) limiterHit = true;
    if (rpm > v.redlineRpm - 200 && !v.shifting && v.gear < v.nGears) press('shiftUp');
    maxGear = Math.max(maxGear, v.gear);
  }
  check(maxGear >= 4 && v.speed > 40, `manual upshifts: reached gear ${maxGear}, ${(v.speed * 3.6).toFixed(0)} km/h, max rpm ${maxRpm.toFixed(0)}`);
  // manual downshift protection: at speed in top gear, mash downshift -> must not exceed maxRpm
  for (let i = 0; i < 8; i++) { press('shiftDown'); for (let k = 0; k < 200; k++) v.step(c); }
  check(v.engines[0].rpm < v.maxRpm, `manual downshift over-rev protection: gear ${v.gear}, rpm ${v.engines[0].rpm.toFixed(0)}`);
  void limiterHit;

  // Engine failure -> no drive torque
  v = createVehicle(p, createFlatTrack(), { x: 0, y: 0, heading: 0 });
  c = controls(); c.throttle = 1;
  for (let i = 0; i < 1500; i++) v.step(c);
  const vBefore = v.speed;
  v.engines[0].failed = true;
  for (let i = 0; i < 1500; i++) v.step(c);
  check(v.failed && v.speed < vBefore, `engine failure: no drive (speed ${vBefore.toFixed(1)} -> ${v.speed.toFixed(1)} m/s, failed=${v.failed})`);

  // Brake fade: repeated 160->40 km/h stops heat the brakes and lengthen stopping
  v = createVehicle(p, createFlatTrack(), { x: 0, y: 0, heading: 0 });
  c = controls();
  const decels = [];
  for (let k = 0; k < 15; k++) {
    c.brake = 0; c.throttle = 1;
    while (v.speed < 160 / 3.6 && v.time < 400) v.step(c);
    c.throttle = 0; c.brake = 1;
    const t0 = v.time, v0 = v.speed;
    while (v.speed > 40 / 3.6) v.step(c);
    decels.push((v0 - v.speed) / (v.time - t0) / G);
  }
  const tMax = Math.max(...v.wheels.map((w) => w.brakeTempC));
  console.log(`  info brake fade: decel per stop [${decels.map((d) => d.toFixed(2)).join(', ')}] g, peak disc temp ${tMax.toFixed(0)} C (fade starts ${p.axles[0].brakeFadeStart} C)`);
  check(tMax > 100, 'brake temperatures rise under repeated stops');
  // Fade: same stop with discs pre-heated well past the fade threshold
  const stopDecel = (preheat) => {
    const w = createVehicle(p, createFlatTrack(), { x: 0, y: 0, heading: 0 });
    const cc = controls(); cc.throttle = 1;
    while (w.speed < 110 / 3.6) w.step(cc);
    if (preheat) for (const wh of w.wheels) wh.brakeTempC = p.axles[0].brakeFadeStart + 250;
    cc.throttle = 0; cc.brake = 1;
    const t0 = w.time, v0 = w.speed;
    while (w.speed > 40 / 3.6) w.step(cc);
    return (v0 - w.speed) / (w.time - t0) / G;
  };
  const dCold = stopDecel(false), dHot = stopDecel(true);
  check(dHot < dCold * 0.9, `brake fade: decel cold ${dCold.toFixed(2)} g vs discs at fadeStart+250 C ${dHot.toFixed(2)} g`);
  // ABS keeps braking slip near the peak (no lock-up)
  {
    const w = createVehicle(p, createFlatTrack(), { x: 0, y: 0, heading: 0 });
    const cc = controls(); cc.throttle = 1;
    while (w.speed < 100 / 3.6) w.step(cc);
    cc.throttle = 0; cc.brake = 1;
    let maxSlip = 0, absSeen = false;
    while (w.speed > 5) {
      w.step(cc);
      if (w.aids.absActive) absSeen = true;
      for (const wh of w.wheels) maxSlip = Math.max(maxSlip, -wh.slipRatio);
    }
    check(!p.electronics.abs || (absSeen && maxSlip < 0.35), `ABS: active ${absSeen}, max braking slip ratio ${maxSlip.toFixed(2)} (peak ${w.peakSlip.toFixed(2)})`);
  }
  // Handbrake turn: locks the rear wheels and rotates the car
  {
    const w = createVehicle(p, createFlatTrack(), { x: 0, y: 0, heading: 0 });
    const cc = controls(); cc.throttle = 1;
    while (w.speed < 60 / 3.6) w.step(cc);
    cc.throttle = 0; cc.steer = 0.4; cc.handbrake = 1;
    let maxYaw = 0, rearLocked = false;
    for (let i = 0; i < 400; i++) {
      w.step(cc);
      maxYaw = Math.max(maxYaw, Math.abs(w.angVel[2]));
      if (Math.abs(w.wheels[2].omega) < 0.5 && w.speed > 5) rearLocked = true;
    }
    check(rearLocked && maxYaw > 0.8, `handbrake: rear wheels lock ${rearLocked}, peak yaw rate ${maxYaw.toFixed(2)} rad/s`);
  }
}
// Launch control (any preset with electronics.launch)
for (const [key, pr] of Object.entries(PRESETS)) {
  const p = build(pr.spec);
  if (!p.electronics.launch || p.drivetrain.isEV) continue;
  const v = createVehicle(p, createFlatTrack(), { x: 0, y: 0, heading: 0 });
  const c = controls();
  c.brake = 1; c.throttle = 1;
  let held = 0;
  for (let i = 0; i < 1000; i++) { v.step(c); held = v.engines[0].rpm; }
  const launchSeen = v.aids.launchActive;
  c.brake = 0;
  let t100 = 0;
  for (let i = 0; i < 500 * 15 && !t100; i++) { v.step(c); if (v.speed > 100 / 3.6) t100 = v.time - 2; }
  check(launchSeen && Math.abs(held - v.launchRpm) < 600, `${key}: launch control holds ${held.toFixed(0)} rpm (target ${v.launchRpm.toFixed(0)}), 0-100 with launch ${t100.toFixed(2)} s`);
  break;
}

// ---------------------------------------------------------------------------------------------
// 3. Real tracks: spawn equilibrium + long runs with a path-following driver
// ---------------------------------------------------------------------------------------------
console.log(`\n== Real tracks (spawn equilibrium, long runs, NaN) == (${((Date.now() - T0) / 1000).toFixed(0)} s)`);
function trackDriver(v, track, pt, mu) {
  const L = v.params.geometry.wheelbase, lock = v.params.steering.maxLock;
  const c = controls();
  let n = 0, vt = 80;
  return () => {
    const s = v.trackState.s, spd = Math.max(0, v.speed);
    const Ld = 6 + 0.35 * spd;
    track.pointAt(s + Ld, pt);
    const dx = pt.x - v.pos[0], dy = pt.y - v.pos[1], h = v.heading;
    const lx = Math.cos(h) * dx + Math.sin(h) * dy, ly = -Math.sin(h) * dx + Math.cos(h) * dy;
    const k = 2 * ly / (lx * lx + ly * ly);
    c.steer = Math.max(-1, Math.min(1, Math.atan(L * k) / lock));
    if ((n++ % 25) === 0) {
      vt = 80;
      const look = 20 + spd * spd / (2 * 5);
      for (let d = 0; d < look; d += 5) {
        track.pointAt(s + d, pt);
        const kk = Math.abs(pt.curvature) + 1e-4, g0 = pt.grade;
        let vlim = Math.sqrt(mu * G / kk);
        track.pointAt(s + d + 5, pt);
        const kv = -(pt.grade - g0) / 5;                 // crest curvature: keep unloading below ~0.5 g
        if (kv > 1e-4) vlim = Math.min(vlim, Math.sqrt(0.5 * G / kv));
        const vc = Math.sqrt(vlim * vlim + 2 * 5 * d);
        if (vc < vt) vt = vc;
      }
    }
    const ev = vt - spd;
    c.throttle = Math.max(0, Math.min(1, 0.5 * ev));
    c.brake = Math.max(0, Math.min(1, -0.3 * ev));
    return c;
  };
}
{
  const keyPreset = PRESETS.rallySaloon ? 'rallySaloon' : Object.keys(PRESETS)[0];
  const tracks = Object.keys(TRACKS).filter((k) => k !== 'random');
  const pt = {};
  let totalSteps = 0, totalNs = 0n;
  for (const tk of tracks) {
    const track = createTrack(tk);
    for (const pk of [keyPreset, 'evSaloon', 'hotHatch'].filter((k) => PRESETS[k])) {
      const p = build(PRESETS[pk].spec);
      const pose = track.startPose(0);
      const sp = spawnRun(p, track, pose, 2);
      const v = createVehicle(p, track, pose);
      const drive = trackDriver(v, track, pt, 0.8);
      const secs = quick ? 60 : 180;
      let ok = true, maxSpd = 0, offTrack = 0, dist = 0;
      const t0 = process.hrtime.bigint();
      for (let i = 0; i < secs / DT; i++) {
        v.step(drive());
        if ((i & 255) === 0 && !finiteState(v)) { ok = false; break; }
        if (v.speed > maxSpd) maxSpd = v.speed;
        dist += v.speed * DT;
        if (!v.wheels[0].onTrack && !v.wheels[1].onTrack) offTrack += DT;
      }
      const ns = process.hrtime.bigint() - t0;
      totalNs += ns; totalSteps += secs / DT;
      check(ok && finiteState(v) && sp.dz < 0.005,
        `${tk.padEnd(9)} ${pk.padEnd(12)} spawn bounce ${(sp.dz * 1000).toFixed(3)} mm, ${secs}s run: dist ${dist.toFixed(0)} m, vmax ${(maxSpd * 3.6).toFixed(0)} km/h, off-track ${offTrack.toFixed(1)} s, ${(Number(ns) / 1e3 / (secs / DT)).toFixed(2)} us/step`);
    }
  }
  console.log(`  info mean step cost on tracks: ${(Number(totalNs) / 1e3 / totalSteps).toFixed(2)} us/step (incl. driver)`);
}

// ---------------------------------------------------------------------------------------------
// 3b. Closed-loop laps with the racing-line AI (src/ai, owner F) — informational
// ---------------------------------------------------------------------------------------------
console.log(`\n== Racing-line AI laps (info) == (${((Date.now() - T0) / 1000).toFixed(0)} s)`);
try {
  const { createDriver, DRIVER_HZ } = await import('../src/ai/driver.js');
  const { createLapTimer } = await import('../src/sim/track.js');
  for (const [tk, pk] of [['gp', 'hotHatch'], ['gp', 'supercar'], ['club', 'naCoupe']]) {
    if (!PRESETS[pk] || !TRACKS[tk]) continue;
    const track = createTrack(tk), p = build(PRESETS[pk].spec);
    const v = createVehicle(p, track, track.startPose(0));
    const d = createDriver('pursuit'); d.reset(v, track);
    const lt = createLapTimer(track), c = controls(), every = Math.round(1 / DT / DRIVER_HZ);
    let off = 0, ok = true;
    for (let i = 0; i < (quick ? 200 : 400) / DT && lt.lap < 2; i++) {
      if (i % every === 0) d.act(v, track, { cars: [v], time: v.time }, c);
      v.step(c); lt.update(v);
      if (!v.wheels.some((w) => w.onTrack)) off += DT;
      if ((i & 1023) === 0 && !finiteState(v)) { ok = false; break; }
    }
    check(ok, `AI ${tk}/${pk}: laps ${lt.lap}, last lap ${lt.lastLap ? lt.lastLap.toFixed(2) + ' s' : '-'}, all-wheels-off-track ${off.toFixed(1)} s, no NaN`);
  }
} catch (e) { console.log(`  info AI driver unavailable: ${e.message}`); }

// ---------------------------------------------------------------------------------------------
// 4. Performance: 100 cars x 500 Hz
// ---------------------------------------------------------------------------------------------
console.log(`\n== Performance == (${((Date.now() - T0) / 1000).toFixed(0)} s)`);
{
  const track = createTrack(TRACKS.gp ? 'gp' : Object.keys(TRACKS)[0]);
  const keys = Object.keys(PRESETS);
  const cars = [];
  for (let i = 0; i < 100; i++) {
    const p = build(PRESETS[keys[i % keys.length]].spec);
    cars.push(createVehicle(p, track, track.startPose(i)));
  }
  const c = controls(); c.throttle = 0.6; c.steer = 0.05;
  for (let k = 0; k < 500; k++) for (const v of cars) v.step(c);
  const N = quick ? 500 : 2000;
  const t0 = process.hrtime.bigint();
  for (let k = 0; k < N; k++) for (const v of cars) v.step(c);
  const us = Number(process.hrtime.bigint() - t0) / 1e3 / (N * cars.length);
  console.log(`  info 100 mixed cars: ${us.toFixed(2)} us per car-step -> ${(1e6 / us / 500).toFixed(0)} cars real-time at 500 Hz per core`);
  check(us < 10, `step cost ${us.toFixed(2)} us < 10 us`);
  let finite = true; for (const v of cars) if (!finiteState(v)) finite = false;
  check(finite, '100 cars: no NaN');
}

console.log(failures ? `\n${failures} check(s) FAILED` : '\nall checks passed');
process.exitCode = failures ? 1 : 0;
