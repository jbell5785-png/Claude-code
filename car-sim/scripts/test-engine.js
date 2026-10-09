// Engine model validation: steady-state curves of real-world-like configurations vs published figures,
// turbo spool lag, fuel/knock behaviour, EV motor, and hot-path timing.
// Run: node scripts/test-engine.js
import { NITROUS } from '../src/sim/catalog.js';
import { makeEngineParams, makeMotorParams, createEngineState, engineUpdate, engineCurve, curvePeaks } from '../src/sim/engine.js';

const base = { cams: 'stock', intake: 'stock', exhaust: 'stock', internals: 'stock', flywheel: 'stock',
  ecu: 'stock', intercooler: 'none', fuel: 'petrol98', fuelSystem: 'sport', induction: 'na', boost: 0, antiLag: false };
const E = (o) => ({ ...base, ...o });

// real = published figures of the comparable production engine
const CASES = [
  { name: '2.0 NA I4 high-rev', ref: 'K20A Type R (148 kW @8000, 202 Nm @7000)', real: { kw: 148, nm: 202 },
    spec: E({ layout: 'I4', displacement: 2.0, cams: 'fastRoad', ecu: 'stage1' }) },
  { name: '2.0 turbo I4 stock', ref: 'EA888/Ecoboost 2.0T (~185 kW, 350 Nm)', real: { kw: 185, nm: 350 },
    spec: E({ layout: 'I4', displacement: 2.0, induction: 'turboMedium', boost: 1.2, intercooler: 'stock', fuel: 'petrol95', fuelSystem: 'street' }) },
  { name: '5.0 NA V8', ref: 'Coyote Gen2 (324 kW @6500, 542 Nm @4250)', real: { kw: 324, nm: 542 },
    spec: E({ layout: 'V8', displacement: 5.0, fuelSystem: 'sport' }) },
  { name: '3.0 twin-turbo I6', ref: 'B58/S55 class (~280 kW, 500 Nm)', real: { kw: 280, nm: 500 },
    spec: E({ layout: 'I6', displacement: 3.0, induction: 'twinTurbo', boost: 1.2, intercooler: 'stock', fuelSystem: 'sport' }) },
  { name: '2.4 NA flat-4', ref: 'FA24 (170 kW @7000, 250 Nm @3700)', real: { kw: 170, nm: 250 },
    spec: E({ layout: 'F4', displacement: 2.4, fuelSystem: 'street' }) },
  { name: '1.3 NA twin-rotor', ref: 'Renesis 13B-MSP (175 kW @8200, 211 Nm @5500)', real: { kw: 175, nm: 211 },
    spec: E({ layout: 'R2', displacement: 1.3, fuelSystem: 'street' }) },
  { name: '2.0 turbo-diesel I4', ref: 'B47/N47 20d (140 kW @4000, 400 Nm @2000)', real: { kw: 140, nm: 400 },
    spec: E({ layout: 'I4', displacement: 2.0, induction: 'turboMedium', boost: 1.6, intercooler: 'stock', fuel: 'diesel', fuelSystem: 'street', ecu: 'stage1' }) },
  { name: '4.0 twin-turbo V8', ref: 'M178/F154 class (~470 kW, 700-760 Nm)', real: { kw: 470, nm: 730 },
    spec: E({ layout: 'V8', displacement: 4.0, induction: 'twinTurbo', boost: 1.4, intercooler: 'waterAir', fuelSystem: 'race' }) },
];

let fails = 0;
const pct = (sim, real) => ((sim / real - 1) * 100);
console.log('\n=== Steady-state full-throttle validation (sim vs real) ===');
console.log('config                 | redline | kW sim  real   err  @rpm | Nm sim  real   err  @rpm | boost | retard | comparable');
for (const c of CASES) {
  const ep = makeEngineParams(c.spec);
  const cur = engineCurve(ep);
  const pk = curvePeaks(cur);
  const atP = cur.find((p) => p.rpm === pk.peakPowerRpm);
  const maxB = Math.max(...cur.map((p) => p.boostBar));
  const maxR = Math.max(...cur.map((p) => p.knockRetard));
  const ek = pct(pk.powerKW, c.real.kw), et = pct(pk.torqueNm, c.real.nm);
  const ok = Math.abs(ek) <= 10 && Math.abs(et) <= 10;
  if (!ok) fails++;
  console.log(`${c.name.padEnd(22)} | ${String(ep.redlineRpm).padStart(7)} | ${pk.powerKW.toFixed(0).padStart(4)} ${String(c.real.kw).padStart(5)} ${ek.toFixed(1).padStart(5)}% ${pk.peakPowerRpm.toFixed(0).padStart(5)} | ${pk.torqueNm.toFixed(0).padStart(4)} ${String(c.real.nm).padStart(5)} ${et.toFixed(1).padStart(5)}% ${pk.peakTorqueRpm.toFixed(0).padStart(5)} | ${maxB.toFixed(2).padStart(5)} | ${maxR.toFixed(2).padStart(6)} | ${c.ref}${ok ? '' : '  <-- >10%'}${atP.fuelLimited ? ' [fuel-limited]' : ''}`);
  if (cur.some((p) => !Number.isFinite(p.torque))) { console.log('  NaN in curve!'); fails++; }
}

// ----- curve shape print for two engines
function shape(label, spec) {
  const ep = makeEngineParams(spec);
  const cur = engineCurve(ep, 12);
  console.log(`\n${label}: ` + cur.map((p) => `${(p.rpm / 1000).toFixed(1)}k:${p.torque.toFixed(0)}Nm/${p.boostBar.toFixed(2)}b`).join(' '));
}
shape('2.0T stock curve', CASES[1].spec);
shape('5.0 V8 curve', CASES[2].spec);
shape('Diesel curve', CASES[6].spec);

// ----- turbo spool lag
console.log('\n=== Turbo spool lag: tip-in from closed throttle at fixed rpm ===');
function spool(spec, rpm) {
  const ep = makeEngineParams(spec);
  const es = createEngineState(ep);
  const w = rpm * Math.PI / 30, dt = 1 / 500;
  for (let i = 0; i < 2000; i++) engineUpdate(es, ep, 0.0, w, dt, null);
  // final boost: settle a copy
  const es2 = createEngineState(ep);
  for (let i = 0; i < 5000; i++) engineUpdate(es2, ep, 1, w, dt, null);
  const final = es2.boostBar;
  let t = 0, t90 = NaN;
  const start = es.boostBar;
  for (let i = 0; i < 5000; i++) {
    engineUpdate(es, ep, 1, w, dt, null); t += dt;
    if (es.boostBar >= start + 0.9 * (final - start)) { t90 = t; break; }
  }
  return { final, t90, start };
}
for (const [lab, spec] of [['2.0T medium turbo', CASES[1].spec],
  ['2.0 large turbo 1.6b', E({ layout: 'I4', displacement: 2.0, induction: 'turboLarge', boost: 1.6, ecu: 'stage1', intercooler: 'fmic' })],
  ['2.0 huge turbo 2.2b', E({ layout: 'I4', displacement: 2.0, induction: 'turboHuge', boost: 2.2, ecu: 'stage1', intercooler: 'fmic', internals: 'forged', fuelSystem: 'race' })],
  ['3.0 twin-turbo', CASES[3].spec]]) {
  for (const rpm of [3000, 4500]) {
    const r = spool(spec, rpm);
    console.log(`${lab.padEnd(22)} @${rpm}: MAP ${r.start.toFixed(2)} -> ${r.final.toFixed(2)} bar g, t90 = ${Number.isNaN(r.t90) ? 'n/a' : r.t90.toFixed(2) + ' s'}`);
  }
}

// ----- anti-lag
{
  const spec = E({ layout: 'I4', displacement: 2.0, induction: 'turboLarge', boost: 1.6, ecu: 'stage1', intercooler: 'fmic', internals: 'forged', antiLag: true });
  const ep = makeEngineParams(spec); const es = createEngineState(ep); const w = 5000 * Math.PI / 30;
  for (let i = 0; i < 3000; i++) engineUpdate(es, ep, 1, w, 1 / 500, null);
  const fuel0 = es.fuelKg;
  for (let i = 0; i < 500; i++) engineUpdate(es, ep, 0, w, 1 / 500, null);
  const noAls = { ...spec, antiLag: false }; const ep2 = makeEngineParams(noAls); const es2 = createEngineState(ep2);
  for (let i = 0; i < 3000; i++) engineUpdate(es2, ep2, 1, w, 1 / 500, null);
  for (let i = 0; i < 500; i++) engineUpdate(es2, ep2, 0, w, 1 / 500, null);
  console.log(`\nAnti-lag: turbo pressure after 1 s lift at 5000 rpm: ALS ${es.boost.toFixed(2)} bar (active=${es.antiLagActive}, fuel ${((fuel0 - es.fuelKg) * 1000).toFixed(0)} g/s, damage ${es.damage.toFixed(4)}) vs no ALS ${es2.boost.toFixed(2)} bar`);
}

// ----- fuel octane vs boost
console.log('\n=== Knock: high boost (large turbo, 2.0 bar target, stage 2) on different fuels ===');
for (const fuel of ['petrol95', 'petrol98', 'race102', 'e85', 'methanol']) {
  const spec = E({ layout: 'I4', displacement: 2.0, induction: 'turboLarge', boost: 2.0, ecu: 'stage2', intercooler: 'fmic', fuel, fuelSystem: 'drag', internals: 'forged' });
  const ep = makeEngineParams(spec); const cur = engineCurve(ep); const pk = curvePeaks(cur);
  const maxR = Math.max(...cur.map((p) => p.knockRetard));
  const p = cur.find((q) => q.rpm === pk.peakPowerRpm);
  console.log(`${fuel.padEnd(9)} ${pk.powerKW.toFixed(0)} kW ${pk.torqueNm.toFixed(0)} Nm  max knockRetard ${maxR.toFixed(2)}  charge ${p.chargeTempC.toFixed(0)} C  fuel ${p.fuelFlowGs.toFixed(1)} g/s`);
}
{
  const ep95 = makeEngineParams(E({ layout: 'I4', displacement: 2.0, induction: 'turboLarge', boost: 2.0, ecu: 'stage2', intercooler: 'fmic', fuel: 'petrol95', fuelSystem: 'drag' }));
  const epE = makeEngineParams(E({ layout: 'I4', displacement: 2.0, induction: 'turboLarge', boost: 2.0, ecu: 'stage2', intercooler: 'fmic', fuel: 'e85', fuelSystem: 'drag' }));
  const a = curvePeaks(engineCurve(ep95)), b = curvePeaks(engineCurve(epE));
  if (!(b.powerKW > a.powerKW * 1.1)) { console.log('FAIL: E85 should make clearly more power than RON95 at high boost'); fails++; }
}

// ----- fuel system cap
{
  const spec = E({ layout: 'I4', displacement: 2.0, induction: 'turboLarge', boost: 1.8, ecu: 'stage1', intercooler: 'fmic', fuelSystem: 'stock' });
  const pkS = curvePeaks(engineCurve(makeEngineParams(spec)));
  const pkR = curvePeaks(engineCurve(makeEngineParams({ ...spec, fuelSystem: 'race' })));
  console.log(`\nFuel system: stock injectors ${pkS.powerKW.toFixed(0)} kW vs race ${pkR.powerKW.toFixed(0)} kW (same turbo)`);
}

// ----- limiter, idle, engine braking, damage
{
  const ep = makeEngineParams(CASES[0].spec); const es = createEngineState(ep);
  let w = 0.0, J = ep.inertia;
  for (let i = 0; i < 5000; i++) { const t = engineUpdate(es, ep, 0, w, 1 / 500, null); w += t / J / 500; }
  console.log(`\nIdle: settles at ${es.rpm.toFixed(0)} rpm (target ${ep.idleRpm}), MAP ${es.mapBar.toFixed(2)} bar`);
  for (let i = 0; i < 3000; i++) { const t = engineUpdate(es, ep, 1, w, 1 / 500, null); w += t / J / 500; }
  console.log(`Free rev on limiter: rpm ${es.rpm.toFixed(0)} (limiter ${ep.limiterRpm}), limiter=${es.limiter}, damage ${es.damage}`);
  const tb = engineUpdate(es, ep, 0, 6000 * Math.PI / 30, 1 / 500, null);
  for (let i = 0; i < 200; i++) engineUpdate(es, ep, 0, 6000 * Math.PI / 30, 1 / 500, null);
  console.log(`Engine braking @6000 closed throttle: ${es.torque.toFixed(1)} Nm (MAP ${es.mapBar.toFixed(2)} bar)`);
  const es3 = createEngineState(ep);
  let t = 0; const wOver = (ep.redlineRpm + ep.overRev + 1200) * Math.PI / 30;
  while (!es3.failed && t < 10) { engineUpdate(es3, ep, 0, wOver, 1 / 500, null); t += 1 / 500; }
  console.log(`Money shift to ${(wOver * 30 / Math.PI).toFixed(0)} rpm: failed after ${t.toFixed(2)} s; failed torque @3000 = ${engineUpdate(es3, ep, 1, 3000 * Math.PI / 30, 1 / 500, null).toFixed(1)} Nm`);
  const es4 = createEngineState(ep); es4.fuelKg = 0.001;
  let tt = 0; while (es4.fuelKg > 0 && tt < 10) { engineUpdate(es4, ep, 1, 5000 * Math.PI / 30, 1 / 500, null); tt += 1 / 500; }
  console.log(`Out of fuel after ${tt.toFixed(2)} s at WOT 5000: torque now ${engineUpdate(es4, ep, 1, 5000 * Math.PI / 30, 1 / 500, null).toFixed(1)} Nm`);
}
// overboost damage
{
  const spec = E({ layout: 'I4', displacement: 2.0, induction: 'turboHuge', boost: 3.0, ecu: 'stage2', intercooler: 'waterAir', fuel: 'methanol', fuelSystem: 'drag', internals: 'stock' });
  const ep = makeEngineParams(spec); const es = createEngineState(ep); let t = 0;
  while (!es.failed && t < 60) { engineUpdate(es, ep, 1, 6500 * Math.PI / 30, 1 / 500, null); t += 1 / 500; }
  console.log(`Overboost on stock internals (MAP ${es.mapBar.toFixed(2)} bar vs max ${ep.maxPressure}): ${es.failed ? 'failed after ' + t.toFixed(1) + ' s' : 'survived 60 s'}`);
}

// ----- nitrous oxide
console.log('\n=== Nitrous (wet kits) ===');
{
  const v8 = E({ layout: 'V8', displacement: 5.0, exhaust: 'sport', fuelSystem: 'race' });
  const p0 = curvePeaks(engineCurve(makeEngineParams(v8))).powerKW;
  console.log('Gain vs shot size, 5.0 NA V8 (race fuel system), steady WOT with env.nitrous:');
  let last = 0;
  for (const n of ['street', 'sport', 'race', 'drag']) {
    const ep = makeEngineParams({ ...v8, nitrous: n });
    const cur = engineCurve(ep, 60, { nitrous: true }); const pk = curvePeaks(cur);
    const at = cur.find((q) => q.rpm === pk.peakPowerRpm);
    console.log(`  ${n.padEnd(7)} nominal ${String(NITROUS[n].kW).padStart(3)} kW: ${pk.powerKW.toFixed(0)} kW (+${(pk.powerKW - p0).toFixed(0)}), ${pk.torqueNm.toFixed(0)} Nm, charge ${at.chargeTempC.toFixed(0)} C, fuel ${at.fuelFlowGs.toFixed(1)} g/s`);
    if (!(pk.powerKW - p0 > last)) { console.log('FAIL: bigger shot should give more power'); fails++; }
    if (Math.abs((pk.powerKW - p0) / NITROUS[n].kW - 1) > 0.25) { console.log('FAIL: shot gain far from nominal'); fails++; }
    last = pk.powerKW - p0;
  }
  // fuel-system cap: wet shot fuel goes through the same pump/injectors
  const i4 = E({ layout: 'I4', displacement: 2.0, cams: 'fastRoad', nitrous: 'race' });
  const pkS = curvePeaks(engineCurve(makeEngineParams({ ...i4, fuelSystem: 'stock' }), 60, { nitrous: true }));
  const pkR = curvePeaks(engineCurve(makeEngineParams({ ...i4, fuelSystem: 'race' }), 60, { nitrous: true }));
  const pkN = curvePeaks(engineCurve(makeEngineParams({ ...i4, fuelSystem: 'stock' })));
  console.log(`Fuel cap: 2.0 NA + 150 kW shot: stock pump ${pkS.powerKW.toFixed(0)} kW vs race pump ${pkR.powerKW.toFixed(0)} kW (no shot ${pkN.powerKW.toFixed(0)} kW)`);
  if (!(pkR.powerKW > pkS.powerKW * 1.08)) { console.log('FAIL: weak pump should limit the shot'); fails++; }
  // knock: 2.0 turbo at stock boost + race shot on RON95 vs race fuel; dynamic damage at 4500 rpm
  const knockRes = {};
  for (const [fuel, internals] of [['petrol95', 'billet'], ['race102', 'billet'], ['race102', 'stock']]) {
    const spec = E({ layout: 'I4', displacement: 2.0, induction: 'turboMedium', boost: 1.2, intercooler: 'stock', fuel, fuelSystem: 'drag', nitrous: 'race', internals });
    const ep = makeEngineParams(spec);
    const cur = engineCurve(ep, 60, { nitrous: true }); const pk = curvePeaks(cur);
    const es = createEngineState(ep); let t = 0; const env = { nitrous: true };
    while (!es.failed && t < 20 && es.nitrousKg > 0) { engineUpdate(es, ep, 1, 4500 * Math.PI / 30, 1 / 500, env); t += 1 / 500; }
    console.log(`Knock: 2.0T 1.0 bar + 150 kW shot, ${fuel.padEnd(8)} ${internals.padEnd(6)} internals: ${pk.powerKW.toFixed(0)} kW, max retard ${Math.max(...cur.map((q) => q.knockRetard)).toFixed(2)}, held at 4500 rpm: ${es.failed ? 'ENGINE FAILED after ' + t.toFixed(1) + ' s' : 'damage ' + es.damage.toFixed(2) + ' after ' + t.toFixed(1) + ' s (bottle ' + (es.nitrousKg > 0 ? 'left' : 'empty') + ')'}`);
    knockRes[fuel + internals] = es;
  }
  if (!knockRes.petrol95billet.failed || knockRes.race102billet.failed || !knockRes.race102stock.failed) { console.log('FAIL: expected RON95 detonation failure, race fuel survival on billet, stock internals failure'); fails++; }
  // arming + bottle duration
  const ep = makeEngineParams({ ...v8, nitrous: 'sport' }); const es = createEngineState(ep); const env = { nitrous: true };
  engineUpdate(es, ep, 0.8, 5000 * Math.PI / 30, 1 / 500, env); const a1 = es.nitrousActive;
  engineUpdate(es, ep, 1, 2000 * Math.PI / 30, 1 / 500, env); const a2 = es.nitrousActive;
  engineUpdate(es, ep, 1, 5000 * Math.PI / 30, 1 / 500, { nitrous: false }); const a3 = es.nitrousActive;
  let t = 0;
  while (es.nitrousKg > 0 && t < 600) { engineUpdate(es, ep, 1, 5000 * Math.PI / 30, 1 / 500, env); t += 1 / 500; }
  console.log(`Arming: throttle 0.8 -> ${a1}, 2000 rpm -> ${a2}, button off -> ${a3}; ${ep.nitrousCapacity} kg bottle (sport) empties in ${t.toFixed(1)} s, then active=${(engineUpdate(es, ep, 1, 5000 * Math.PI / 30, 1 / 500, env), es.nitrousActive)}`);
  if (a1 || a2 || a3 || es.nitrousActive) { console.log('FAIL: nitrous arming'); fails++; }
  const evp = makeMotorParams('medium', 'b60'); const evs = createEngineState(evp);
  engineUpdate(evs, evp, 1, 500, 1 / 500, { nitrous: true });
  if (evs.nitrousActive || evs.nitrousKg !== 0) { console.log('FAIL: EV nitrous should be a no-op'); fails++; }
}

// ----- EV motor
console.log('\n=== EV motors (single, with battery limits) ===');
for (const [m, b] of [['small', 'b60'], ['medium', 'b80'], ['large', 'b100'], ['large', 'b40']]) {
  const ep = makeMotorParams(m, b, 1); const pk = curvePeaks(engineCurve(ep));
  console.log(`${m.padEnd(6)} + ${b}: ${pk.powerKW.toFixed(0)} kW peak @ ${pk.peakPowerRpm.toFixed(0)} rpm, ${pk.torqueNm.toFixed(0)} Nm`);
}
{
  const ep = makeMotorParams('medium', 'b60', 1); const es = createEngineState(ep);
  const w = 8000 * Math.PI / 30;
  es.batteryKwh = 0.5 * ep.batteryKwh;
  const e0 = es.batteryKwh;
  for (let i = 0; i < 500; i++) engineUpdate(es, ep, 1, w, 1 / 500, null);
  const e1 = es.batteryKwh;
  for (let i = 0; i < 500; i++) engineUpdate(es, ep, 0, w, 1 / 500, { regen: 1 });
  console.log(`EV energy: 1 s WOT used ${((e0 - e1) * 3600).toFixed(0)} kJ; 1 s full regen torque ${es.torque.toFixed(0)} Nm, recovered ${((es.batteryKwh - e1) * 3600).toFixed(0)} kJ, SoC ${es.soc.toFixed(4)}`);
}

// ----- hot path timing + allocation sanity
{
  const ep = makeEngineParams(CASES[3].spec); const es = createEngineState(ep);
  const N = 2e6; let w = 300, s = 0;
  const t0 = performance.now();
  for (let i = 0; i < N; i++) { s += engineUpdate(es, ep, (i % 1000) / 1000, w, 1 / 500, null); w = 100 + (i % 700); }
  const dt = performance.now() - t0;
  console.log(`\nengineUpdate: ${(dt / N * 1e6).toFixed(0)} ns/call (${N} calls), checksum ${Number.isFinite(s)}`);
  const t1 = performance.now(); for (let i = 0; i < 20; i++) engineCurve(ep); console.log(`engineCurve: ${((performance.now() - t1) / 20).toFixed(1)} ms`);
}

console.log(fails ? `\n${fails} validation case(s) outside 10 %` : '\nAll validation cases within 10 %');
process.exitCode = fails ? 1 : 0;
