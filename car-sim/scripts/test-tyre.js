// Headless tests for src/sim/tyre.js:  node scripts/test-tyre.js
import { makeTyreParams, createTyreState, tyreForces, tyreSteadyForces } from '../src/sim/tyre.js';
import { DT, G, SURFACE } from '../src/sim/constants.js';
import { COMPOUNDS } from '../src/sim/catalog.js';

const DEG = Math.PI / 180;
let fails = 0;
function check(cond, msg) {
  if (!cond) { fails++; console.log('  FAIL: ' + msg); } else console.log('  ok:   ' + msg);
}
const f1 = (x) => x.toFixed(1), f2 = (x) => x.toFixed(2), f3 = (x) => x.toFixed(3);
const pad = (s, n) => String(s).padStart(n);
const out = { Fx: 0, Fy: 0, Mz: 0, slipRatio: 0, slipAngle: 0, usage: 0, sliding: false, rollResTorque: 0 };
const so = { Fx: 0, Fy: 0, Mz: 0, usage: 0, mu: 0 };

const R = 0.317, FZ0 = 4000;
let KPK = 0, APK = 0;
const street = makeTyreParams('street', 245, R, FZ0);
const slick = makeTyreParams('slick', 245, R, FZ0);

// ---------------------------------------------------------------------------
console.log('\n=== 1. Lateral Fy-alpha (steady state, kappa = 0, camber 0) ===');
function latPeak(tp, Fz, camber = 0, dir = -1) {
  // dir -1: slide right (alpha<0) -> force left (+Fy)
  let best = 0, bestA = 0;
  for (let a = 0; a <= 25; a += 0.02) {
    tyreSteadyForces(tp, Fz, 0, dir * a * DEG, camber, 0, so);
    const f = -dir * so.Fy;
    if (f > best) { best = f; bestA = a; }
  }
  return { F: best, a: bestA };
}
for (const [name, tp] of [['street', street], ['slick', slick]]) {
  console.log(`-- ${name} (${tp.label}), width 245, Fz0 ${FZ0} N`);
  console.log('    Fz |' + [1, 2, 4, 6, 8, 10, 15, 20].map((a) => pad(a + 'deg', 7)).join('') +
    ' |  peakFy  @deg   mu_eff  Mz@2deg  Ky(N/deg)');
  for (const Fz of [2000, 4000, 6000]) {
    const row = [1, 2, 4, 6, 8, 10, 15, 20].map((a) => { tyreSteadyForces(tp, Fz, 0, -a * DEG, 0, 0, so); return pad(so.Fy.toFixed(0), 7); });
    const p = latPeak(tp, Fz);
    tyreSteadyForces(tp, Fz, 0, -2 * DEG, 0, 0, so); const mz2 = so.Mz;
    tyreSteadyForces(tp, Fz, 0, -0.01 * DEG, 0, 0, so); const ky = so.Fy / 0.01;
    console.log(pad(Fz, 6) + ' |' + row.join('') + ` | ${pad(p.F.toFixed(0), 7)} ${pad(f1(p.a), 5)}   ${f3(p.F / Fz)}  ${pad(mz2.toFixed(1), 6)}  ${pad(ky.toFixed(0), 7)}`);
    if (Fz === 4000) {
      if (name === 'street') check(p.a >= 6 && p.a <= 10, `street peak slip angle ${f1(p.a)} deg in 6..10`);
      else check(p.a >= 4 && p.a <= 6.2, `slick peak slip angle ${f1(p.a)} deg in 4..6`);
    }
  }
}
{
  const a = latPeak(street, 2000).F / 2000, b = latPeak(street, 6000).F / 6000;
  check(a > b, `load sensitivity: mu(2000)=${f3(a)} > mu(6000)=${f3(b)}`);
}
console.log('-- all compounds at Fz 4000 (width 245):  peak Fy, alpha_pk, kappa_pk, mu_y, slide/peak @ 30deg');
for (const k of Object.keys(COMPOUNDS)) {
  const tp = makeTyreParams(k, 245, R, FZ0);
  const p = latPeak(tp, 4000);
  let bk = 0, bf = 0;
  for (let kk = 0; kk <= 0.5; kk += 0.0005) { tyreSteadyForces(tp, 4000, kk, 0, 0, 0, so); if (so.Fx > bf) { bf = so.Fx; bk = kk; } }
  tyreSteadyForces(tp, 4000, 0, -30 * DEG, 0, 0, so);
  console.log(`   ${k.padEnd(10)} ${pad(p.F.toFixed(0), 5)} N  ${pad(f1(p.a), 5)} deg  kpk ${f3(bk)}  mu ${f3(p.F / 4000)}  ${f2(so.Fy / p.F)}`);
}
console.log('-- width effect (sport compound, Fz 4000): width -> mu, Ky, crr, mass, inertia');
for (const w of [185, 225, 265, 305, 335]) {
  const tp = makeTyreParams('sport', w, R, FZ0);
  tyreSteadyForces(tp, 4000, 0, -0.01 * DEG, 0, 0, so); const ky = so.Fy / 0.01;
  console.log(`   ${w} mm  mu ${f3(latPeak(tp, 4000).F / 4000)}  Ky ${ky.toFixed(0)} N/deg  crr ${tp.crr.toFixed(4)}  mass ${f1(tp.mass)} kg  I ${f3(tp.inertia)}  kz ${(tp.vertStiff / 1000).toFixed(0)} kN/m  relax ${f3(tp.relaxLong)}/${f3(tp.relaxLat)} m`);
}

// ---------------------------------------------------------------------------
console.log('\n=== 2. Longitudinal Fx-kappa (Fz 4000) ===');
const kaps = [0.02, 0.05, 0.08, 0.1, 0.12, 0.15, 0.2, 0.3, 0.5, 1.0];
console.log('  tyre   |' + kaps.map((k) => pad(k, 7)).join('') + ' | peakFx  kappa_pk  locked(-1)/peak');
for (const [name, tp] of [['street', street], ['slick', slick]]) {
  const row = kaps.map((k) => { tyreSteadyForces(tp, 4000, k, 0, 0, 0, so); return pad(so.Fx.toFixed(0), 7); });
  let bk = 0, bf = 0;
  for (let k = 0; k <= 0.5; k += 0.0005) { tyreSteadyForces(tp, 4000, k, 0, 0, 0, so); if (so.Fx > bf) { bf = so.Fx; bk = k; } }
  tyreSteadyForces(tp, 4000, -1, 0, 0, 0, so);
  const lockRatio = -so.Fx / bf;
  console.log(`  ${name.padEnd(6)} |` + row.join('') + ` | ${pad(bf.toFixed(0), 6)}  ${f3(bk)}     ${f2(lockRatio)}`);
  check(bk >= 0.07 && bk <= 0.15, `${name} peak slip ratio ${f3(bk)} in 0.07..0.15`);
  check(lockRatio > 0.6 && lockRatio < 0.9, `${name} locked-wheel force ${f2(lockRatio)} of peak`);
}

// ---------------------------------------------------------------------------
console.log('\n=== 3. Combined slip / friction ellipse (street, Fz 4000) ===');
{
  const tp = street;
  console.log('  alpha  kappa:' + [-1, -0.2, -0.1, -0.05, 0, 0.05, 0.1, 0.2, 1].map((k) => pad(k, 13)).join(''));
  let maxE = 0;
  for (const a of [2, 5, 8, 15]) {
    const cells = [-1, -0.2, -0.1, -0.05, 0, 0.05, 0.1, 0.2, 1].map((k) => {
      tyreSteadyForces(tp, 4000, k, -a * DEG, 0, 0, so);
      return pad(`${so.Fx.toFixed(0)}/${so.Fy.toFixed(0)}`, 13);
    });
    console.log(`  ${pad(a, 3)}deg      ` + cells.join(''));
  }
  // ellipse sweep: normalised slip of 1 (peak) at varying direction
  peakSlips(tp);
  console.log('  ellipse at rho = 1 / rho = 3 (direction theta in normalised slip space):');
  for (let th = 0; th <= 90; th += 15) {
    const t = th * DEG;
    const r1 = sample(tp, 1, t), r3 = sample(tp, 3, t);
    console.log(`   theta ${pad(th, 2)}:  Fx ${pad(r1[0].toFixed(0), 5)}  Fy ${pad(r1[1].toFixed(0), 5)}  |  Fx ${pad(r3[0].toFixed(0), 5)}  Fy ${pad(r3[1].toFixed(0), 5)}  (e=${f3(r1[2])})`);
  }
  for (let i = 0; i < 2000; i++) {
    tyreSteadyForces(tp, 4000, (Math.random() * 2 - 1) * 1.5, (Math.random() * 2 - 1) * 1.2, 0, 0, so);
    const e = (so.Fx / (1.04 * so.mu * 4000)) ** 2 + (so.Fy / (so.mu * 4000)) ** 2;
    if (e > maxE) maxE = e;
  }
  check(maxE <= 1.0001, `combined force inside friction ellipse (max normalised ${f3(maxE)})`);
  // drift behaviour: big wheelspin kills lateral force
  tyreSteadyForces(tp, 4000, 0, -6 * DEG, 0, 0, so); const fy0 = so.Fy;
  tyreSteadyForces(tp, 4000, 0.5, -6 * DEG, 0, 0, so);
  check(so.Fy < 0.5 * fy0, `wheelspin kappa 0.5 at 6deg cuts Fy ${fy0.toFixed(0)} -> ${so.Fy.toFixed(0)}`);
}
function peakSlips(tp) {
  let bf = 0; for (let k = 0; k <= 0.5; k += 0.0005) { tyreSteadyForces(tp, 4000, k, 0, 0, 0, so); if (so.Fx > bf) { bf = so.Fx; KPK = k; } }
  APK = Math.tan(latPeak(tp, 4000).a * DEG);
}
function sample(tp, rho, t) {
  tyreSteadyForces(tp, 4000, rho * KPK * Math.cos(t), -Math.atan(rho * APK * Math.sin(t)), 0, 0, so);
  return [so.Fx, so.Fy, (so.Fx / (1.04 * so.mu * 4000)) ** 2 + (so.Fy / (so.mu * 4000)) ** 2];
}

// ---------------------------------------------------------------------------
console.log('\n=== 4. Camber sweep (slick, Fz 4000): peak |Fy| for force LEFT and RIGHT ===');
console.log(`   camberOpt (automotive) = ${f2(slick.camberOpt / DEG)} deg; contract camber + = top leaning left`);
{
  let bestL = -1, bestLc = 0, bestR = -1, bestRc = 0;
  for (let c = -6; c <= 6.001; c += 0.5) {
    const L = latPeak(slick, 4000, c * DEG, -1).F, Rr = latPeak(slick, 4000, c * DEG, +1).F;
    tyreSteadyForces(slick, 4000, 0, 0, c * DEG, 0, so);
    const thrust = so.Fy;
    if (L > bestL) { bestL = L; bestLc = c; }
    if (Rr > bestR) { bestR = Rr; bestRc = c; }
    if (Math.abs(c % 1) < 1e-9) console.log(`   camber ${pad(c.toFixed(1), 5)} deg: peak Fy left ${pad(L.toFixed(0), 5)}  right ${pad(Rr.toFixed(0), 5)}   camber thrust @alpha0 ${pad(thrust.toFixed(0), 5)} N`);
  }
  console.log(`   optimum for force-left  at contract camber ${bestLc} deg (outside RIGHT wheel, top leaning toward corner)`);
  console.log(`   optimum for force-right at contract camber ${bestRc} deg (outside LEFT wheel, top leaning toward corner)`);
  check(Math.abs(bestLc - 2.5) <= 0.5 && Math.abs(bestRc + 2.5) <= 0.5, 'camber optimum mirrored for both force directions at ~|camberOpt|');
  tyreSteadyForces(slick, 4000, 0, 0, 2 * DEG, 0, so);
  check(so.Fy > 0, 'camber thrust toward the lean (top left -> +Fy)');
  // straight-line: upright best
  let bk = -1, bkc = 0;
  for (let c = -4; c <= 4.001; c += 0.5) {
    let bf = 0; for (let k = 0; k <= 0.3; k += 0.001) { tyreSteadyForces(slick, 4000, k, 0, c * DEG, 0, so); if (so.Fx > bf) bf = so.Fx; }
    if (bf > bk) { bk = bf; bkc = c; }
  }
  check(Math.abs(bkc) <= 0.5, `pure braking/traction optimum camber ~0 (got ${bkc})`);
}

// ---------------------------------------------------------------------------
console.log('\n=== 5. Surfaces (street vs rally, Fz 4000): mu and rolling-resistance torque at 20 m/s ===');
for (const k of ['street', 'rally']) {
  const tp = makeTyreParams(k, 225, R, FZ0);
  const row = [];
  for (const [sn, sid] of Object.entries(SURFACE)) {
    const p = (() => { let b = 0; for (let a = 0; a < 30; a += 0.05) { tyreSteadyForces(tp, 4000, 0, -a * DEG, 0, sid, so); if (so.Fy > b) b = so.Fy; } return b; })();
    const ts = createTyreState(tp);
    tyreForces(ts, tp, { Fz: 4000, vx: 20, vy: 0, omega: 20 / R, camber: 0, surface: sid }, DT, out);
    row.push(`${sn.toLowerCase()} mu ${f2(p / 4000)} rr ${out.rollResTorque.toFixed(1)}Nm`);
  }
  console.log(`   ${k.padEnd(7)} ` + row.join(' | '));
}

// ---------------------------------------------------------------------------
console.log('\n=== 6. Transient: relaxation response to a slip-angle step (street, Fz 4000) ===');
for (const v of [5, 20, 50]) {
  const ts = createTyreState(street, street.tOpt);
  const vy = -v * Math.tan(3 * DEG);
  let tss = 0, t63 = -1;
  for (let i = 0; i < 2000; i++) { tyreForces(ts, street, { Fz: 4000, vx: v, vy, omega: v / R, camber: 0, surface: 0 }, DT, out); }
  tss = out.Fy;
  const ts2 = createTyreState(street, street.tOpt);
  for (let i = 0; i < 2000; i++) {
    tyreForces(ts2, street, { Fz: 4000, vx: v, vy, omega: v / R, camber: 0, surface: 0 }, DT, out);
    if (t63 < 0 && out.Fy >= 0.632 * tss) { t63 = (i + 1) * DT; break; }
  }
  console.log(`   v=${pad(v, 2)} m/s: Fy_ss ${tss.toFixed(0)} N, t63 ${(t63 * 1000).toFixed(1)} ms -> distance ${f3(t63 * v)} m (relaxLat ${f3(street.relaxLat)})`);
}

// ---------------------------------------------------------------------------
console.log('\n=== 7. Quarter-car rig at 500 Hz (400 kg on one street tyre) ===');
function rig({ tp, mass = 400, grade = 0, v0 = 0, brake = () => 0, T = 10, omega0 }) {
  const th = Math.atan(grade), Fz = mass * G * Math.cos(th), Fg = -mass * G * Math.sin(th);
  const ts = createTyreState(tp);
  let x = 0, v = v0, om = omega0 === undefined ? v0 / tp.radius : omega0;
  const inp = { Fz, vx: v, vy: 0, omega: om, camber: 0, surface: 0 };
  const hist = [];
  let tStop = -1, xStop = 0;
  const n = Math.round(T / DT);
  for (let i = 0; i < n; i++) {
    const t = i * DT;
    inp.vx = v; inp.omega = om;
    tyreForces(ts, tp, inp, DT, out);
    // wheel with Coulomb brake (friction-limited, like a PGS brake constraint)
    const Tb = brake(t);
    const wf = om + DT * (-out.Fx * tp.radius + out.rollResTorque) / tp.inertia;
    const bi = Tb * DT / tp.inertia;
    om = Math.abs(wf) <= bi ? 0 : wf - Math.sign(wf) * bi;
    v += DT * (out.Fx + Fg) / mass;
    x += DT * v;
    if (tStop < 0 && v0 > 0 && v <= 0) { tStop = t; xStop = x; }
    hist.push([t, x, v, om, out.Fx]);
    if (!Number.isFinite(x + v + om + out.Fx)) return { bad: true, hist };
  }
  return { hist, tStop, xStop, x, v, om, ts };
}
{
  // (a) parked on a 10% slope, wheel locked
  const r = rig({ tp: street, grade: 0.10, brake: () => 3000, T: 10 });
  let maxV = 0, signCh = 0, last = 0;
  for (const h of r.hist) { if (Math.abs(h[2]) > maxV) maxV = Math.abs(h[2]); if (h[0] > 0.5 && Math.abs(h[2]) > 1e-4) { const s = Math.sign(h[2]); if (last && s !== last) signCh++; last = s; } }
  console.log(`  (a) 10% slope, locked wheel, 10 s: drift ${(r.x * 1000).toFixed(3)} mm, max |v| ${(maxV * 1000).toFixed(2)} mm/s, final v ${(r.v * 1e6).toFixed(3)} um/s, Fx ${r.hist[r.hist.length - 1][4].toFixed(1)} N (need ${(400 * G * Math.sin(Math.atan(0.1))).toFixed(1)})`);
  check(!r.bad && Math.abs(r.x) < 0.01, 'stands on 10% slope with drift < 1 cm');
  const dLate = Math.abs(r.hist[r.hist.length - 1][1] - r.hist[Math.round(2 / DT)][1]);
  check(dLate < 1e-5, `no creep after settling (2..10 s moved ${(dLate * 1e6).toFixed(3)} um)`);
  check(signCh <= 1, `no oscillation on the slope (velocity reversals > 0.1 mm/s after 0.5 s: ${signCh})`);
}
for (const [label, Tb] of [['threshold braking 1100 Nm', 1100], ['locked wheel 4000 Nm', 4000]]) {
  const r = rig({ tp: street, v0: 30, brake: (t) => Math.min(1, t / 0.15) * Tb, T: 9 });
  let rev = 0, last = 0, maxBack = 0;
  for (const h of r.hist) {
    if (r.tStop >= 0 && h[0] > r.tStop) {
      if (Math.abs(h[2]) > 1e-3) { const s = Math.sign(h[2]); if (last && s !== last) rev++; last = s; }
      maxBack = Math.max(maxBack, Math.abs(h[1] - r.xStop));
    }
  }
  const decel = 30 / r.tStop / G;
  console.log(`  (b) ${label}: stop in ${f2(r.tStop)} s / ${f1(r.xStop)} m (mean ${f2(decel)} g), rebound after stop ${(maxBack * 1000).toFixed(2)} mm, velocity reversals ${rev}, final v ${(r.v * 1000).toFixed(4)} mm/s`);
  check(!r.bad && r.tStop > 0, `${label}: stops`);
  check(rev <= 1 && maxBack < 0.01, `${label}: no oscillation after stop`);
}
{
  // (c) free wheel coasting at low speed (no brake): wheel must follow without jitter
  const r = rig({ tp: street, v0: 0.5, omega0: 0, T: 4 });
  let rev = 0, last = 0;
  for (const h of r.hist) { if (h[0] > 0.1 && Math.abs(h[3]) > 1e-4) { const s = Math.sign(h[3]); if (last && s !== last) rev++; last = s; } }
  console.log(`  (c) free wheel at 0.5 m/s, wheel initially stopped: after 4 s v ${(r.v * 1000).toFixed(1)} mm/s, omega*R ${(r.om * street.radius * 1000).toFixed(1)} mm/s, spin reversals ${rev}`);
  check(!r.bad && rev === 0 && Math.abs(r.v - r.om * street.radius) < 0.01, 'free wheel spins up smoothly, no jitter');
}

// ---------------------------------------------------------------------------
console.log('\n=== 8. Thermal warm-up under sustained cornering (35 m/s, 90% of peak slip angle) ===');
for (const [name, k] of [['slick', 'slick'], ['street', 'street']]) {
  const tp = makeTyreParams(k, 265, R, FZ0);
  const ts = createTyreState(tp);  // 20 C
  const a = Math.atan(0.9 * Math.tan(latPeak(tp, 4000).a * DEG));
  const v = 35, inp = { Fz: 4000, vx: v, vy: -v * Math.tan(a), omega: v / R, camber: 0, surface: 0 };
  console.log(`  ${name} (tOpt ${tp.tOpt}, window ${tp.tWindow}), alpha ${f2(a / DEG)} deg, initial grip ${f3(ts.gripTemp)}`);
  let tReach = -1;
  for (let i = 1; i <= 300 / DT; i++) {
    tyreForces(ts, tp, inp, DT, out);
    if (tReach < 0 && ts.temp >= tp.tOpt - 10) tReach = i * DT;
    if (i % Math.round(30 / DT) === 0) console.log(`    t ${pad(i * DT, 3)} s: surface ${pad(f1(ts.tempSurface), 5)} C  carcass ${pad(f1(ts.tempCarcass), 5)} C  grip ${f3(ts.gripTemp)}  Fy ${out.Fy.toFixed(0)} N  wear ${ts.wear.toFixed(4)}`);
  }
  console.log(`    reaches tOpt-10 at ${tReach.toFixed(1)} s`);
  if (k === 'slick') {
    const cold = makeTyreParams('slick', 265, R, FZ0);
    check(createTyreState(cold).gripTemp < 0.8, 'cold slick (20 C) clearly lacks grip');
    check(tReach > 20 && tReach < 240, 'slick warms into window within 20..240 s of hard cornering');
    const hot = createTyreState(cold, 160);
    check(hot.gripTemp < 0.85, `overheated slick (160 C) loses grip (${f3(hot.gripTemp)})`);
  }
}
{
  const tp = makeTyreParams('street', 225, R, FZ0);
  const ts = createTyreState(tp);
  const inp = { Fz: 4000, vx: 30, vy: 0, omega: 30 / R, camber: 0, surface: 0 };
  for (let i = 0; i < 1200 / DT; i++) tyreForces(ts, tp, inp, DT, out);
  console.log(`  street cruising 30 m/s straight for 20 min: surface ${f1(ts.tempSurface)} C carcass ${f1(ts.tempCarcass)} C`);
}

// ---------------------------------------------------------------------------
console.log('\n=== 9. Wear ===');
{
  const tp = makeTyreParams('slick', 265, R, FZ0);
  const ts = createTyreState(tp, tp.tOpt);
  const a = Math.atan(1.3 * Math.tan(latPeak(tp, 4000).a * DEG));
  const inp = { Fz: 4000, vx: 30, vy: -30 * Math.tan(a), omega: 30 / R, camber: 0, surface: 0 };
  let t = 0;
  for (let i = 0; i < 600 / DT; i++) { tyreForces(ts, tp, inp, DT, out); t += DT; }
  console.log(`  slick sliding at 1.3x peak slip for 10 min: wear ${f3(ts.wear)}, grip factor ${f3(ts.gripWear)}, slip energy ${(ts.slipEnergy / 1e6).toFixed(1)} MJ, temp ${f1(ts.tempSurface)}/${f1(ts.tempCarcass)}`);
  check(ts.wear > 0 && ts.wear <= 1 && ts.gripWear < 1, 'wear accumulates and reduces grip');
}

// ---------------------------------------------------------------------------
console.log('\n=== 10. NaN / edge cases ===');
{
  let bad = 0;
  const keys = ['Fx', 'Fy', 'Mz', 'slipRatio', 'slipAngle', 'usage', 'rollResTorque'];
  const sk = ['kappa', 'alpha', 'tempSurface', 'tempCarcass', 'wear', 'gripTemp'];
  const tps = Object.keys(COMPOUNDS).map((k) => makeTyreParams(k, 245, R, FZ0));
  tps.push(makeTyreParams('nonsense', NaN, undefined, 0));
  const fixed = [
    { Fz: 0, vx: 0, vy: 0, omega: 0, camber: 0, surface: 0 },
    { Fz: 4000, vx: 0, vy: 0, omega: 0, camber: 0, surface: 0 },
    { Fz: 4000, vx: 0, vy: 0, omega: 50, camber: 0, surface: 0 },
    { Fz: 4000, vx: 0, vy: 3, omega: 0, camber: 0.1, surface: 2 },
    { Fz: -100, vx: 30, vy: 2, omega: 10, camber: 0, surface: 3 },
    { Fz: 1e-9, vx: 1e-12, vy: -1e-12, omega: 0, camber: 0, surface: 1 },
    { Fz: 4000, vx: -20, vy: 1, omega: -60, camber: -0.05, surface: 0 },
    { Fz: 40000, vx: 90, vy: 30, omega: 400, camber: 1, surface: 9 },
    { Fz: 4000 },
    { Fz: NaN, vx: NaN, vy: NaN, omega: NaN, camber: NaN, surface: NaN },
  ];
  for (const tp of tps) {
    const ts = createTyreState(tp);
    for (const inp of fixed) for (let i = 0; i < 50; i++) {
      tyreForces(ts, tp, inp, DT, out);
      for (const k of keys) if (!Number.isFinite(out[k])) bad++;
    }
    for (let i = 0; i < 20000; i++) {
      const r = Math.random;
      const inp = { Fz: r() < 0.1 ? 0 : r() * 12000 - 500, vx: r() < 0.2 ? 0 : (r() * 2 - 1) * 80, vy: r() < 0.2 ? 0 : (r() * 2 - 1) * 20,
        omega: r() < 0.2 ? 0 : (r() * 2 - 1) * 300, camber: (r() * 2 - 1) * 0.2, surface: (r() * 4) | 0 };
      tyreForces(ts, tp, inp, DT, out);
      for (const k of keys) if (!Number.isFinite(out[k])) bad++;
    }
    for (const k of sk) if (!Number.isFinite(ts[k])) bad++;
    for (const k of ['Fx', 'Fy', 'Mz']) { tyreSteadyForces(tp, 0, 0, 0, 0, 0, so); if (!Number.isFinite(so[k])) bad++; tyreSteadyForces(tp, 4000, 0, 0, 0, 0, so); if (!Number.isFinite(so[k])) bad++; }
  }
  check(bad === 0, `no NaN/Infinity in outputs or state over fuzz + edge cases (${bad} bad)`);
  const tp = street, ts = createTyreState(tp);
  ts.kappa = 0.1; ts.alpha = 0.05;
  for (let i = 0; i < 100; i++) tyreForces(ts, tp, { Fz: 0, vx: 20, vy: 0, omega: 60, camber: 0, surface: 0 }, DT, out);
  check(out.Fx === 0 && out.Fy === 0 && Math.abs(ts.kappa) < 0.01 && Math.abs(ts.alpha) < 0.005, 'Fz=0: zero force, relaxation states decay');
  const ts2 = createTyreState(tp);
  tyreForces(ts2, tp, { Fz: 4000, vx: 0, vy: 0, omega: 0, camber: 0.05, surface: 0 }, DT, out);
  check(out.Fx === 0 && out.Fy === 0, 'standstill with camber produces no force');
  check(createTyreState(tp, 80).tempCarcass === 80 && createTyreState(tp, { tempC: 60, ambientC: 30 }).ambientT === 30, 'initial temperature override');
}

// ---------------------------------------------------------------------------
console.log('\n=== 11. Performance ===');
{
  const tp = makeTyreParams('sport', 245, R, FZ0);
  const N = 1024, inputs = [];
  for (let i = 0; i < N; i++) inputs.push({ Fz: 2000 + Math.random() * 5000, vx: 5 + Math.random() * 60, vy: (Math.random() - 0.5) * 4, omega: (5 + Math.random() * 60) / R * (0.9 + Math.random() * 0.2), camber: (Math.random() - 0.5) * 0.06, surface: 0 });
  const states = [0, 1, 2, 3].map(() => createTyreState(tp));
  let acc = 0;
  for (let i = 0; i < 300000; i++) { tyreForces(states[i & 3], tp, inputs[i & (N - 1)], DT, out); acc += out.Fx; }
  const M = 4000000;
  const t0 = process.hrtime.bigint();
  for (let i = 0; i < M; i++) { tyreForces(states[i & 3], tp, inputs[i & (N - 1)], DT, out); acc += out.Fx; }
  const ns = Number(process.hrtime.bigint() - t0) / M;
  console.log(`  tyreForces: ${ns.toFixed(1)} ns/call (${(1000 / ns).toFixed(1)} M calls/s)  [checksum ${Number.isFinite(acc)}]`);
  check(ns < 1000, 'tyreForces < 1 us per call');
}

console.log(fails ? `\n${fails} CHECK(S) FAILED` : '\nALL TYRE CHECKS PASSED');
process.exit(fails ? 1 : 0);
