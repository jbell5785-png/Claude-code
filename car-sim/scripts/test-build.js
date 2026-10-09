// build() tests: every preset builds, no NaN anywhere, physically plausible mass properties,
// summary table, and build() timing. Run: node scripts/test-build.js
import { build, defaultSpec } from '../src/sim/build.js';
import { PRESETS } from '../src/sim/presets.js';

let fails = 0;
const fail = (m) => { console.log('FAIL: ' + m); fails++; };

function findNaN(o, path = 'params', seen = new Set()) {
  if (typeof o === 'number') return Number.isNaN(o) || o === Infinity || o === -Infinity ? [path] : [];
  if (!o || typeof o !== 'object' || seen.has(o)) return [];
  seen.add(o);
  let out = [];
  for (const k of Object.keys(o)) if (k !== 'spec') out = out.concat(findNaN(o[k], `${path}.${k}`, seen));
  return out;
}

const rows = [];
const entries = [['default', { label: 'defaultSpec()', spec: defaultSpec(), targets: {} }], ...Object.entries(PRESETS)];
for (const [key, p] of entries) {
  const t0 = performance.now();
  const params = build(p.spec);
  const ms = performance.now() - t0;
  const bad = findNaN(params);
  if (bad.length) fail(`${key}: non-finite values at ${bad.slice(0, 5).join(', ')}`);
  if (!params.valid) fail(`${key}: invalid build: ${params.errors.join('; ')}`);
  JSON.parse(JSON.stringify(params)); // must be pure data
  const s = params.summary, g = params.geometry, m = params.mass;
  // plausibility
  if (!(m.total > 500 && m.total < 3200)) fail(`${key}: mass ${m.total}`);
  if (!(s.weightDistFront > 0.3 && s.weightDistFront < 0.7)) fail(`${key}: weight distribution ${s.weightDistFront}`);
  if (!(g.cgHeight > 0.25 && g.cgHeight < 0.9)) fail(`${key}: cg height ${g.cgHeight}`);
  if (Math.abs(g.a + g.b - g.wheelbase) > 1e-9) fail(`${key}: a+b != wheelbase`);
  const dyn = (m.inertia.Izz + 2 * m.unsprungF * (g.a ** 2 + (g.trackF / 2) ** 2) + 2 * m.unsprungR * (g.b ** 2 + (g.trackR / 2) ** 2)) / (m.total * g.cgTotal.a * g.cgTotal.b);
  if (!(dyn > 0.7 && dyn < 1.3)) fail(`${key}: yaw dynamic index ${dyn.toFixed(2)} implausible`);
  for (const ax of params.axles) if (!(ax.tyre && ax.tyre.mu > 0)) fail(`${key}: tyre params missing`);
  rows.push({ key, label: p.label, s, g, m, params, ms, dyn, targets: p.targets });
}

const pad = (v, n) => String(v).padStart(n);
console.log('\npreset         |  mass  | %front | CGh  | Izz  | dynIdx |  kW   |  Nm  | kW/t | top(est) | 0-100 tgt | price  | ms');
for (const r of rows) {
  const { s, g, m } = r;
  console.log(`${r.key.padEnd(14)} | ${pad(m.total.toFixed(0), 6)} | ${pad((s.weightDistFront * 100).toFixed(1), 6)} | ${g.cgTotal.height.toFixed(2)} | ${pad(m.inertia.Izz.toFixed(0), 4)} | ${pad(r.dyn.toFixed(2), 6)} | ${pad(s.powerKW.toFixed(0), 5)} | ${pad(s.torqueNm.toFixed(0), 4)} | ${pad(s.powerToWeight.toFixed(0), 4)} | ${pad(s.topSpeedEstKph.toFixed(0), 8)} | ${pad(r.targets.zeroTo100s ?? '-', 9)} | ${pad(s.price, 6)} | ${r.ms.toFixed(1)}`);
}
console.log('\nDetails:');
for (const r of rows) {
  const p = r.params, a0 = p.axles[0], a1 = p.axles[1];
  console.log(`- ${r.key}: ${p.spec.powertrain === 'ev' ? 'EV' : p.spec.engine.layout + ' ' + p.spec.engine.displacement + 'L ' + p.spec.engine.induction}, ${p.drivetrain.layout}, gears [${p.drivetrain.gearRatios.map((x) => x.toFixed(2)).join(' ')}] fd ${p.drivetrain.finalDrive}`
    + `\n    redline ${p.summary.redlineRpm}, peak ${p.summary.powerKW.toFixed(0)} kW @${p.summary.peakPowerRpm.toFixed(0)} / ${p.summary.torqueNm.toFixed(0)} Nm @${p.summary.peakTorqueRpm.toFixed(0)}, boost ${p.summary.maxBoostBar.toFixed(2)} bar`
    + `, brake capability ${p.summary.brakeCapG.toFixed(2)} g`
    + `\n    unsprung F/R ${p.mass.unsprungF.toFixed(1)}/${p.mass.unsprungR.toFixed(1)} kg, ride ${p.summary.rideFreqF.toFixed(2)}/${p.summary.rideFreqR.toFixed(2)} Hz, rc ${a0.rollCentre.toFixed(3)}/${a1.rollCentre.toFixed(3)} m, brakes ${a0.brakeTorque.toFixed(0)}/${a1.brakeTorque.toFixed(0)} Nm/wheel`
    + `\n    aero cdA ${p.aero.cdA.toFixed(3)} clA F/R ${p.aero.clAFront.toFixed(3)}/${p.aero.clARear.toFixed(3)} (downforce @200 km/h ${p.summary.downforce200.toFixed(0)} kg), GE ${p.aero.groundEffect.toFixed(2)}, Ixx/Iyy/Izz ${p.mass.inertia.Ixx.toFixed(0)}/${p.mass.inertia.Iyy.toFixed(0)}/${p.mass.inertia.Izz.toFixed(0)}`
    + (p.warnings.length ? `\n    warnings: ${p.warnings.join(' | ')}` : ''));
}

// ---- warnings / normalisation behaviour
const w = (spec) => build(spec);
{
  const p = w({ chassis: 'sedan', engine: { placement: 'mid' } });
  if (!p.errors.some((e) => /placement/.test(e)) || p.spec.engine.placement !== 'front') fail('placement not allowed by chassis should error + fall back');
  const q = w({ chassis: 'kei', tyres: { widthF: 255, widthR: 255 } });
  if (!q.warnings.some((e) => /too wide/.test(e)) || q.spec.tyres.widthF !== 205) fail('tyre width clamp');
  const r = w({ engine: { layout: 'I6', displacement: 3.0, induction: 'turboLarge', boost: 2.2, ecu: 'stage2', intercooler: 'fmic', fuelSystem: 'race', internals: 'forged' }, drivetrain: { gearbox: 'mt5' } });
  if (!r.warnings.some((e) => /Gearbox torque/.test(e))) fail('gearbox torque warning');
  const o = w({ engine: { induction: 'turboLarge', boost: 2.2, ecu: 'stage2', intercooler: 'fmic', fuel: 'petrol95', fuelSystem: 'race', internals: 'billet' } });
  if (!o.warnings.some((e) => /octane/.test(e))) fail('octane warning');
  const f = w({ engine: { induction: 'turboLarge', boost: 1.8, ecu: 'stage1', intercooler: 'fmic', fuelSystem: 'stock', internals: 'forged' } });
  if (!f.warnings.some((e) => /Fuel system/.test(e))) fail('fuel system warning');
  const i = w({ engine: { induction: 'turboMedium', boost: 1.6, intake: 'itb' } });
  if (!i.warnings.some((e) => /throttle bodies/.test(e))) fail('ITB on turbo warning');
  const k = w({ engine: { induction: 'turboHuge', boost: 3.0, ecu: 'stage2', fuel: 'methanol', fuelSystem: 'drag', intercooler: 'waterAir' } });
  if (!k.warnings.some((e) => /Internals at risk/.test(e))) fail('internals warning');
  console.log('\nWarning samples:', [p.errors[0], q.warnings[0], r.warnings.find((e) => /Gearbox/.test(e)), o.warnings.find((e) => /octane/.test(e)), f.warnings.find((e) => /Fuel/.test(e)), i.warnings[0], k.warnings.find((e) => /Internals/.test(e))].join('\n  '));
  // weight distribution is an output: moving the engine moves it
  const fr = w({ chassis: 'coupe', engine: { placement: 'front' } }).summary.weightDistFront;
  const mid = w({ chassis: 'coupe', engine: { placement: 'mid' } }).summary.weightDistFront;
  const rr = w({ chassis: 'coupe', engine: { placement: 'rear' } }).summary.weightDistFront;
  console.log(`Coupe weight distribution front: front-engine ${(fr * 100).toFixed(1)} %, mid ${(mid * 100).toFixed(1)} %, rear ${(rr * 100).toFixed(1)} %`);
  if (!(fr > mid && mid > rr)) fail('engine placement should move the weight distribution');
  const bal = w({ weight: { ballastKg: 100, ballastPos: 1 } }).summary.weightDistFront;
  if (!(bal > fr)) fail('front ballast should move weight forward');
  // garbage input still builds
  const junk = build({ chassis: 'nope', engine: { layout: 'W16', displacement: 'x' }, suspension: { springF: -5, damping: 9 }, tyres: { widthF: NaN } });
  if (findNaN(junk).length) fail('junk spec produced NaN');
  const empty = build();
  if (findNaN(empty).length || !empty.valid) fail('build() with no spec');
}

// ---- timing
{
  const N = 50; const t0 = performance.now();
  for (let i = 0; i < N; i++) build(PRESETS.supercar.spec);
  console.log(`\nbuild(): ${((performance.now() - t0) / N).toFixed(2)} ms per call`);
}
console.log(fails ? `\n${fails} FAILURE(S)` : '\nAll build tests passed');
process.exitCode = fails ? 1 : 0;
