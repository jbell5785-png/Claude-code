// Collision module tests (engineer I). Run: node scripts/test-collision.js
import { build } from '../src/sim/build.js';
import { PRESETS } from '../src/sim/presets.js';
import { createTrack } from '../src/sim/track.js';
import { createVehicle } from '../src/sim/vehicle.js';
import { createCollisionWorld } from '../src/sim/collision.js';
import { createDriver } from '../src/ai/driver.js';
import { createFlatTrack } from './lib/flatTrack.js';

let failures = 0;
const check = (c, m) => { if (!c) failures++; console.log(`  ${c ? 'ok  ' : 'FAIL'} ${m}`); };
const ctl = () => ({ steer: 0, throttle: 0, brake: 0, handbrake: 0, shiftUp: false, shiftDown: false, gearMode: 'auto', nitrous: false });
const P = build(PRESETS.hotHatch.spec);
const finite = (v) => [...v.pos, ...v.vel, ...v.angVel].every(Number.isFinite);

function flatWithWall(y) {
  const t = createFlatTrack();
  t.walls = { segs: Float32Array.from([-2000, y, 2000, y]), n: 1, height: 0.9 };
  return t;
}
const mom = (vs) => vs.reduce((s, v) => [s[0] + v.mTot * v.vel[0], s[1] + v.mTot * v.vel[1]], [0, 0]);
const ke = (vs) => vs.reduce((s, v) => s + 0.5 * v.mTot * (v.vel[0] ** 2 + v.vel[1] ** 2), 0);

function carCar(name, vA, vB, headingB) {
  const tr = createFlatTrack();
  const a = createVehicle(P, tr, { x: 0, y: 0, heading: 0 });
  const b = createVehicle(P, tr, { x: 6, y: 0, heading: headingB });
  a.vel[0] = vA; b.vel[0] = vB;
  const w = createCollisionWorld(tr);
  const c = ctl();
  let m0, k0, hit = false;
  for (let s = 0; s < 1500 && !hit; s++) {
    a.step(c); b.step(c);
    m0 = mom([a, b]); k0 = ke([a, b]);
    w.step([a, b]);
    if (w.events.slice(0, w.eventHead).some((e) => e.type === 'car' && e.kind === 'impact')) hit = true;
  }
  const m1 = mom([a, b]), k1 = ke([a, b]);
  const err = Math.abs(m1[0] - m0[0]) / (Math.abs(a.mTot * vA) + Math.abs(b.mTot * vB));
  const vrel0 = vA - vB, vrel1 = a.vel[0] - b.vel[0];
  check(hit && err < 0.01, `${name}: momentum error ${(err * 100).toFixed(3)} %`);
  const e = -vrel1 / vrel0;
  check(e > 0.2 && e < 0.4 && k1 < k0, `${name}: effective restitution ${e.toFixed(2)}, KE ${(k0 / 1e3).toFixed(0)} -> ${(k1 / 1e3).toFixed(0)} kJ`);
}

console.log('== car-car ==');
carCar('head-on 20+20 m/s', 20, -20, Math.PI);
carCar('rear-end 30 vs 10 m/s', 30, 10, 0);

console.log('== car vs wall ==');
for (const sp of [30, 60, 90]) for (const angDeg of [10, 60]) {
  const tr = flatWithWall(10);
  const ang = angDeg * Math.PI / 180;
  const v = createVehicle(P, tr, { x: 0, y: 0, heading: ang });
  v.vel[0] = sp * Math.cos(ang); v.vel[1] = sp * Math.sin(ang);
  const w = createCollisionWorld(tr);
  let maxY = -1e9, hits = 0; const c = ctl();
  for (let s = 0; s < 1000; s++) { v.step(c); w.step([v]); maxY = Math.max(maxY, v.pos[1]); hits += w.eventCount; }
  const vyEnd = v.vel[1];
  check(finite(v) && maxY < 10 && hits > 0 && vyEnd <= 0.5,
    `${sp} m/s @ ${angDeg} deg: max CG y ${maxY.toFixed(2)} (< wall 10), final vy ${vyEnd.toFixed(2)}, speed ${Math.hypot(v.vel[0], v.vel[1]).toFixed(1)}`);
}

console.log('== PIT manoeuvre (rear-quarter hit) ==');
{
  const tr = createFlatTrack();
  const a = createVehicle(P, tr, { x: 0, y: 0, heading: 0 }), b = createVehicle(P, tr, { x: 2.5, y: -1.6, heading: 0 });
  a.vel[0] = 25; b.vel[0] = 25; const w = createCollisionWorld(tr); const c = ctl(), ca = ctl();
  let maxYaw = 0;
  for (let s = 0; s < 1000; s++) { ca.steer = s < 400 ? -0.15 : 0; a.step(ca); b.step(c); w.step([a, b]); maxYaw = Math.max(maxYaw, Math.abs(a.angVel[2]) ); }
  let yawB = 0; // measure B's yaw
  check(finite(a) && finite(b), 'PIT: finite');
  yawB = Math.abs(b.heading);
  check(yawB > 0.3, `PIT: target car heading change ${(yawB * 57.3).toFixed(0)} deg`);
}

console.log('== car vs obstacle (gauntlet, first obstacle, 30 m/s) ==');
{
  const tr = createTrack('gauntlet');
  for (const ob of tr.obstacles.slice(0, 2)) for (const lat of [0, 0.8]) {                       // dead-centre and offset (glancing) hits
    const pa = {}; tr.pointAt(ob.s - 30, pa);
    const hd = Math.atan2(ob.y - pa.y, ob.x - pa.x), ux = Math.cos(hd), uy = Math.sin(hd);
    const x0 = ob.x - 30 * ux - lat * uy, y0 = ob.y - 30 * uy + lat * ux;
    const v = createVehicle(P, tr, { x: x0, y: y0, heading: hd });
    v.vel[0] = 30 * ux; v.vel[1] = 30 * uy;
    const w = createCollisionWorld(tr); const c = ctl();
    let hit = false, minLat = 1e9, maxAlong = -1e9;
    for (let s = 0; s < 1500; s++) {
      v.step(c); w.step([v]);
      for (let k = w.stepEventStart; k < w.eventHead; k++) if (w.events[k % 256].type === 'obstacle') hit = true;
      const rx = v.pos[0] - ob.x, ry = v.pos[1] - ob.y, al = rx * ux + ry * uy, la = Math.abs(-rx * uy + ry * ux);
      maxAlong = Math.max(maxAlong, al);
      if (al > -0.5 && al < 0.5) minLat = Math.min(minLat, la);   // CG passing the obstacle's position
    }
    const sp = Math.hypot(v.vel[0], v.vel[1]);
    check(finite(v) && hit && (maxAlong < -(ob.r ?? ob.hx) || minLat > (ob.r ?? ob.hy) + 0.6),
      `${ob.kind} lateral ${lat} m: obstacle event ${hit}, max along ${maxAlong.toFixed(2)} m, min lateral when level ${minLat > 1e8 ? '-' : minLat.toFixed(2)} m, end speed ${sp.toFixed(1)} m/s`);
  }
}

console.log('== 8-car pack, club, AI driver, 120 s ==');
{
  const tr = createTrack('club');
  const keys = ['hotHatch', 'naCoupe', 'muscleV8', 'rallySaloon', 'supercar', 'evSaloon', 'timeAttack', 'drift'];
  const vs = keys.map((k, i) => createVehicle(build(PRESETS[k].spec), tr, tr.startPose(i)));
  const ds = vs.map((v) => { const d = createDriver('pursuit', { skill: 0.85, aggression: 0.7 }); d.reset(v, tr); return d; });
  const cs = vs.map(() => ctl());
  const w = createCollisionWorld(tr);
  let ok = true, maxV = 0, ev = 0, tw = 0, steps = 60000;
  for (let s = 0; s < steps; s++) {
    if (s % 10 === 0) for (let i = 0; i < 8; i++) ds[i].act(vs[i], tr, { cars: vs, time: s / 500 }, cs[i]);
    for (let i = 0; i < 8; i++) vs[i].step(cs[i]);
    const t0 = performance.now(); w.step(vs); tw += performance.now() - t0;
    ev += w.eventCount;
    for (const v of vs) { if (!finite(v)) ok = false; maxV = Math.max(maxV, Math.hypot(...v.vel)); }
    if (!ok) break;
  }
  check(ok && maxV < 95, `no NaN, max speed ${maxV.toFixed(1)} m/s, ${ev} events, ${(tw / steps * 1000).toFixed(2)} us per world.step (8 cars)`);
}

console.log('== performance, 100 cars ==');
{
  const tr = createTrack('gp');
  const vs = []; for (let i = 0; i < 100; i++) vs.push(createVehicle(P, tr, tr.startPose(i % 50)));
  // pairs share grid slots -> overlapping cars stress the narrow phase
  const w = createCollisionWorld(tr); const c = ctl(); c.throttle = 0.5;
  let tw = 0, ok = true;
  for (let s = 0; s < 1000; s++) { for (const v of vs) v.step(c); const t0 = performance.now(); w.step(vs); tw += performance.now() - t0; }
  for (const v of vs) if (!finite(v)) ok = false;
  check(ok, `100 cars (50 overlapping pairs): ${(tw).toFixed(0)} us per world.step, no NaN`);
}

console.log(failures ? `\n${failures} FAILURES` : '\nall collision checks passed');
process.exit(failures ? 1 : 0);
