// build(spec) -> params (ARCHITECTURE §1-2, owner A: powertrain & build).
//
// Everything physical is derived from components: mass properties (total + sprung CG, inertia
// tensor by parallel axis over component boxes, unsprung masses), suspension rates and damping
// from the requested damping ratio, aero coefficients split onto the axles by lever arms,
// tyre parameters from tyre.js, brake torques, gearing and the engine/motor models (engine.js).
// The static weight distribution is an OUTPUT of the component layout, never an input.

import { G, RHO_AIR } from './constants.js';
import {
  CHASSIS, LAYOUTS, FUELS, INDUCTION, INTERCOOLERS, FUEL_SYSTEMS, CAMS, INTAKES, EXHAUSTS, INTERNALS,
  FLYWHEELS, ECU_TUNES, EV_MOTORS, EV_BATTERIES, GEARBOXES, DIFFS, CENTRE_DIFFS, SUSPENSION_TYPES,
  DAMPERS, BRAKES, COMPOUNDS, SPLITTERS, WINGS, DIFFUSERS, BODY_KITS, WEIGHT_REDUCTION, ELECTRONICS,
  ANTI_LAG,
} from './catalog.js';
import { makeEngineParams, makeMotorParams, engineCurve, curvePeaks } from './engine.js';
import { makeTyreParams } from './tyre.js';

const DEG = Math.PI / 180;
const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
const num = (v, d) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const pick = (table, key, d) => (key != null && Object.prototype.hasOwnProperty.call(table, key) ? key : d);

const DRIVER_KG = 75;
const REF_WHEEL_KG = 18;        // wheel+tyre mass included in SUSPENSION_TYPES.unsprung figures

/** Default, drivable spec (sports coupe, NA, RWD). */
export function defaultSpec() {
  return {
    name: 'Sports coupe',
    chassis: 'coupe',
    powertrain: 'ice',
    engine: {
      layout: 'I4', displacement: 2.0, placement: 'front',
      induction: 'na', boost: 0, intercooler: 'none', fuel: 'petrol98', fuelSystem: 'street',
      cams: 'stock', intake: 'stock', exhaust: 'sport', internals: 'stock',
      flywheel: 'stock', ecu: 'stock', antiLag: false,
    },
    ev: { front: null, rear: 'medium', battery: 'b60' },
    drivetrain: {
      layout: 'RWD', gearbox: 'mt6', finalDrive: 4.1,
      frontDiff: 'open', rearDiff: 'lsd15way', centreDiff: 'open', centreSplit: 0.4,
    },
    suspension: {
      type: 'doubleWishbone', dampers: 'sport',
      springF: 35, springR: 32, arbF: 18, arbR: 10, damping: 0.35,
      rideHeight: 0, camberF: -1.0, camberR: -1.2, toeF: 0.0, toeR: 0.15,
    },
    tyres: { compound: 'street', widthF: 225, widthR: 225 },
    brakes: { kit: 'stock', bias: 0.66 },
    aero: { splitter: 'none', wing: 'none', wingAngle: 8, diffuser: 'none', bodyKit: 'stock' },
    weight: { reduction: 'none', ballastKg: 0, ballastPos: 0.5 },
    electronics: 'absTc',
    fuelLitres: 45,
    steering: { ratio: 14, maxLock: 35, ackermann: 0.6 },
    color: '#d0302a',
  };
}

function merge(def, src) {
  if (src == null || typeof src !== 'object' || Array.isArray(src)) return def;
  const out = {};
  for (const k of Object.keys(def)) {
    const d = def[k];
    if (d && typeof d === 'object' && !Array.isArray(d)) out[k] = merge(d, src[k]);
    else out[k] = src[k] === undefined ? d : src[k];
  }
  for (const k of Object.keys(src)) if (!(k in out)) out[k] = src[k];
  return out;
}

/**
 * Normalise / clamp a spec, collecting warnings and errors.
 * @returns {{ spec: object, warnings: string[], errors: string[] }}
 */
export function normalizeSpec(input) {
  const warnings = [], errors = [];
  const s = merge(defaultSpec(), input || {});
  const def = defaultSpec();
  const fix = (obj, key, table, label) => {
    const k = pick(table, obj[key], null);
    if (k == null) { warnings.push(`Unknown ${label} '${obj[key]}', using '${def[label] || Object.keys(table)[0]}'`); obj[key] = Object.keys(table)[0]; }
  };
  s.name = String(s.name || 'Car').slice(0, 60);
  if (!CHASSIS[s.chassis]) { errors.push(`Unknown chassis '${s.chassis}'`); s.chassis = def.chassis; }
  s.powertrain = s.powertrain === 'ev' ? 'ev' : 'ice';
  const ch = CHASSIS[s.chassis];
  const e = s.engine, dt = s.drivetrain;

  if (s.powertrain === 'ice') {
    fix(e, 'layout', LAYOUTS, 'layout');
    const L = LAYOUTS[e.layout];
    const d0 = num(e.displacement, L.disp[0]);
    e.displacement = Math.round(clamp(d0, L.disp[0], L.disp[1]) * 100) / 100;
    if (Math.abs(d0 - e.displacement) > 0.005 && !L.rotary) warnings.push(`Displacement clamped to ${e.displacement} L for ${L.label}`);
    for (const [k, t] of [['induction', INDUCTION], ['intercooler', INTERCOOLERS], ['fuel', FUELS], ['fuelSystem', FUEL_SYSTEMS],
      ['cams', CAMS], ['intake', INTAKES], ['exhaust', EXHAUSTS], ['internals', INTERNALS], ['flywheel', FLYWHEELS], ['ecu', ECU_TUNES]]) fix(e, k, t, k);
    if (!ch.placements.includes(e.placement)) {
      errors.push(`Engine placement '${e.placement}' not possible in the ${ch.label}; using '${ch.placements[0]}'`);
      e.placement = ch.placements[0];
    }
    const ind = INDUCTION[e.induction];
    if (ind.kind === 'na') { e.boost = 0; if (e.intercooler !== 'none') { warnings.push('Intercooler has no effect on a naturally aspirated engine (removed)'); e.intercooler = 'none'; } }
    else {
      const b = num(e.boost, ind.maxBoost * 0.7);
      e.boost = Math.round(clamp(b, 0, ind.maxBoost) * 100) / 100;
      if (b > ind.maxBoost + 1e-6) warnings.push(`Boost limited to ${ind.maxBoost} bar by the ${ind.label}`);
    }
    if (INTAKES[e.intake].naOnly && ind.kind !== 'na') { warnings.push('Individual throttle bodies need a naturally aspirated engine (fitted stock airbox)'); e.intake = 'stock'; }
    if (e.antiLag && ind.kind !== 'turbo') { warnings.push('Anti-lag needs a turbo (disabled)'); e.antiLag = false; }
    e.antiLag = !!e.antiLag;
    if (FUELS[e.fuel].diesel && L.rotary) { errors.push('A Wankel rotary cannot run on diesel; using RON 98'); e.fuel = 'petrol98'; }
    if (FUELS[e.fuel].diesel && ind.kind === 'super') warnings.push('Supercharged diesel: unusual but modelled');
    if (FUELS[e.fuel].diesel && ind.kind === 'na') warnings.push('Naturally aspirated diesel will be very slow');
    fix(dt, 'gearbox', GEARBOXES, 'gearbox');
    if (GEARBOXES[dt.gearbox].evOnly) { errors.push('Single-speed reduction is for electric motors only; using 6-speed manual'); dt.gearbox = 'mt6'; }
    if (!['FWD', 'RWD', 'AWD'].includes(dt.layout)) { warnings.push(`Unknown drive layout '${dt.layout}', using RWD`); dt.layout = 'RWD'; }
    if (dt.layout === 'FWD' && e.placement !== 'front') { errors.push(`FWD is not possible with a ${e.placement}-mounted engine; using RWD`); dt.layout = 'RWD'; }
    const fd = num(dt.finalDrive, 4.0);
    dt.finalDrive = clamp(fd, 2.5, 5.5);
  } else {
    const ev = s.ev;
    ev.front = ev.front && EV_MOTORS[ev.front] ? ev.front : null;
    ev.rear = ev.rear && EV_MOTORS[ev.rear] ? ev.rear : null;
    if (!ev.front && !ev.rear) { errors.push('EV needs at least one motor; fitted a rear 250 kW motor'); ev.rear = 'medium'; }
    fix(ev, 'battery', EV_BATTERIES, 'battery');
    dt.gearbox = 'ev1';
    dt.layout = ev.front && ev.rear ? 'AWD' : ev.front ? 'FWD' : 'RWD';
    dt.finalDrive = clamp(num(dt.finalDrive, 9), 6, 12);
  }
  fix(dt, 'frontDiff', DIFFS, 'frontDiff');
  fix(dt, 'rearDiff', DIFFS, 'rearDiff');
  fix(dt, 'centreDiff', CENTRE_DIFFS, 'centreDiff');
  dt.centreSplit = clamp(num(dt.centreSplit, 0.4), 0.1, 0.9);

  const su = s.suspension;
  fix(su, 'type', SUSPENSION_TYPES, 'type');
  fix(su, 'dampers', DAMPERS, 'dampers');
  su.springF = clamp(num(su.springF, 35), 10, 300);
  su.springR = clamp(num(su.springR, 32), 10, 300);
  su.arbF = clamp(num(su.arbF, 15), 0, 200);
  su.arbR = clamp(num(su.arbR, 10), 0, 200);
  const dr = DAMPERS[su.dampers].range;
  const z0 = num(su.damping, 0.35);
  su.damping = clamp(z0, dr[0], dr[1]);
  if (Math.abs(z0 - su.damping) > 1e-6) warnings.push(`Damping ratio limited to ${su.damping} by ${DAMPERS[su.dampers].label}`);
  const rhMin = su.dampers === 'stock' ? -15 : su.dampers === 'sport' ? -35 : -80;
  su.rideHeight = clamp(num(su.rideHeight, 0), rhMin, 60);
  su.camberF = clamp(num(su.camberF, -1), -6, 2);
  su.camberR = clamp(num(su.camberR, -1), -6, 2);
  su.toeF = clamp(num(su.toeF, 0), -2, 2);
  su.toeR = clamp(num(su.toeR, 0), -2, 2);

  const ty = s.tyres;
  fix(ty, 'compound', COMPOUNDS, 'compound');
  const kit = BODY_KITS[pick(BODY_KITS, s.aero.bodyKit, 'stock')];
  const maxW = ch.maxTyreWidth + kit.tyreAdd;
  for (const k of ['widthF', 'widthR']) {
    const w = Math.round(clamp(num(ty[k], 225), 145, 405) / 5) * 5;
    if (w > maxW) { warnings.push(`Tyre ${w} mm too wide for the ${ch.label}${kit.tyreAdd ? ' with ' + kit.label : ''} (max ${maxW} mm)`); ty[k] = maxW; }
    else ty[k] = w;
  }

  fix(s.brakes, 'kit', BRAKES, 'kit');
  s.brakes.bias = clamp(num(s.brakes.bias, 0.65), 0.4, 0.85);
  const ae = s.aero;
  fix(ae, 'splitter', SPLITTERS, 'splitter');
  fix(ae, 'wing', WINGS, 'wing');
  fix(ae, 'diffuser', DIFFUSERS, 'diffuser');
  fix(ae, 'bodyKit', BODY_KITS, 'bodyKit');
  ae.wingAngle = clamp(num(ae.wingAngle, 8), 0, 15);
  const wt = s.weight;
  fix(wt, 'reduction', WEIGHT_REDUCTION, 'reduction');
  wt.ballastKg = clamp(num(wt.ballastKg, 0), 0, 300);
  wt.ballastPos = clamp(num(wt.ballastPos, 0.5), 0, 1);
  if (!ELECTRONICS[s.electronics]) { warnings.push(`Unknown electronics '${s.electronics}'`); s.electronics = 'abs'; }
  s.fuelLitres = s.powertrain === 'ev' ? 0 : clamp(num(s.fuelLitres, 45), 1, 120);
  const st = s.steering;
  st.ratio = clamp(num(st.ratio, 14), 8, 24);
  st.maxLock = clamp(num(st.maxLock, 35), 20, 65);
  st.ackermann = clamp(num(st.ackermann, 0.6), 0, 1);
  if (typeof s.color !== 'string') s.color = def.color;
  return { spec: s, warnings, errors };
}

// ---------------------------------------------------------------------------------------------
// Mass model
// ---------------------------------------------------------------------------------------------

/** Component list: { name, m, x (from rear axle, +fwd), z (height, stock ride), lx, ly, lz (box) } */
function components(s, ch, ctx) {
  const wb = ch.wheelbase, list = [];
  const ohF = (ch.length - wb) * 0.55, ohR = (ch.length - wb) * 0.45;
  const add = (name, m, x, z, lx, ly, lz) => { if (m !== 0) list.push({ name, m, x, z, lx, ly, lz }); };
  const kit = BODY_KITS[s.aero.bodyKit];
  const red = WEIGHT_REDUCTION[s.weight.reduction];

  // Shell: body-in-white + interior + systems; CG from the catalogue; box ~ the cabin/structure.
  add('chassis', ch.mass, ch.cgFromRear * wb, ch.cgHeight + 0.02, ch.length * 0.85, ch.width * 0.9, ch.height * 0.85);
  add('bodyPanels', kit.mass, wb * 0.5, ch.cgHeight + 0.15, ch.length * 0.9, ch.width, ch.height * 0.5);
  add('interior', red.mass, wb * 0.4, 0.55, 1.6, ch.width * 0.8, 0.5);
  const placement = ctx.placement;
  // driver
  const xDriver = placement === 'mid' ? wb * 0.62 : placement === 'rear' ? wb * 0.55 : wb * 0.42;
  add('driver', DRIVER_KG, xDriver, 0.50, 0.6, 0.45, 0.8);

  if (s.powertrain === 'ice') {
    const e = s.engine, L = LAYOUTS[e.layout];
    const len = L.length;
    const flat = e.layout[0] === 'F', vee = e.layout[0] === 'V';
    let mEng = L.massBase + L.perL * e.displacement + INTERNALS[e.internals].massAdd;
    if (FUELS[e.fuel].diesel) mEng *= 1.2;        // thicker block/heads, heavier crank
    const zEng = L.rotary ? 0.44 : flat ? 0.42 : vee ? 0.50 : 0.53;
    const wEng = flat ? 0.75 : vee ? 0.70 : 0.55;
    const transverse = s.drivetrain.layout === 'FWD' || (placement === 'mid' && ch.style === 'kei');
    let xEng, xBox, zBox = 0.38;
    if (placement === 'front') {
      if (transverse) { xEng = wb + 0.08; xBox = wb + 0.02; }
      else { xEng = wb - 0.10 - 0.35 * len; xBox = xEng - 0.5 * len - 0.30; }
    } else if (placement === 'mid') { xEng = 0.25 + 0.5 * len; xBox = -0.15; }
    else { xEng = -(0.08 + 0.35 * len); xBox = 0.25; }
    ctx.xEngine = xEng;
    add('engine', mEng, xEng, zEng, transverse ? wEng : len, transverse ? len : wEng, 0.6);
    const ind = INDUCTION[e.induction];
    add('induction', ind.mass, xEng, zEng + 0.12, 0.4, 0.4, 0.3);
    const ic = INTERCOOLERS[e.intercooler];
    const xIc = placement === 'front' ? wb + ohF * 0.85 : xEng;
    add('intercooler', ic.mass, xIc, 0.42, 0.12, 0.7, 0.35);
    // cooling pack (radiator + coolant), always at the front for front engines
    add('cooling', 12, placement === 'front' ? wb + ohF * 0.75 : placement === 'mid' ? xEng : xEng - 0.4, 0.45, 0.1, 0.7, 0.45);
    const ex = EXHAUSTS[e.exhaust];
    const xEx = placement === 'front' ? wb * 0.35 : -ohR * 0.5;
    add('exhaust', ex.mass, xEx, 0.22, placement === 'front' ? wb + 0.6 : 0.8, 0.4, 0.15);
    const gb = GEARBOXES[s.drivetrain.gearbox];
    add('gearbox', gb.mass, xBox, zBox, 0.6, 0.35, 0.35);
    if (s.drivetrain.layout === 'AWD') {
      add('transferCase', 18, placement === 'front' ? xBox : xEng - 0.5, 0.33, 0.3, 0.3, 0.3);
      add('propshaft', 12, wb * 0.5, 0.28, wb * 0.8, 0.1, 0.1);
      add('frontDiff', 20, wb, 0.30, 0.3, 0.4, 0.3);
      add('rearDiff', 25, 0, 0.32, 0.3, 0.4, 0.3);
    } else if (s.drivetrain.layout === 'RWD') {
      if (placement === 'front') add('propshaft', 10, wb * 0.5, 0.28, wb * 0.8, 0.1, 0.1);
      if (placement === 'front' && s.suspension.type !== 'solidAxle') add('rearDiff', 25, 0, 0.32, 0.3, 0.4, 0.3);
    }
    if (e.antiLag) add('antiLag', ANTI_LAG.mass, xEng, zEng, 0.3, 0.3, 0.2);
    // fuel tank near the rear axle (ahead of the engine in a mid-engined car)
    const xTank = placement === 'mid' ? wb * 0.55 : placement === 'rear' ? wb + ohF * 0.4 : 0.30;
    ctx.xTank = xTank;
    add('fuel', s.fuelLitres * FUELS[e.fuel].density, xTank, 0.30, 0.6, 0.8, 0.25);
    add('fuelTank', 8, xTank, 0.30, 0.6, 0.8, 0.25);
  } else {
    const ev = s.ev, bat = EV_BATTERIES[ev.battery];
    add('battery', bat.mass, wb * 0.5, 0.26, wb * 0.8, ch.width * 0.75, 0.14);
    if (ev.front) { add('motorFront', EV_MOTORS[ev.front].mass, wb, 0.34, 0.35, 0.5, 0.35); add('reductionFront', GEARBOXES.ev1.mass, wb, 0.32, 0.3, 0.3, 0.3); add('inverterFront', 12, wb + 0.25, 0.45, 0.3, 0.3, 0.15); }
    if (ev.rear) { add('motorRear', EV_MOTORS[ev.rear].mass, 0, 0.34, 0.35, 0.5, 0.35); add('reductionRear', GEARBOXES.ev1.mass, 0, 0.32, 0.3, 0.3, 0.3); add('inverterRear', 12, -0.25, 0.45, 0.3, 0.3, 0.15); }
    add('thermal', 15, wb + ohF * 0.7, 0.45, 0.1, 0.7, 0.4); // radiator + coolant + heat pump
    ctx.xTank = wb * 0.5;
  }
  // aero
  add('splitter', SPLITTERS[s.aero.splitter].mass, wb + ohF * 0.95, 0.12, 0.3, ch.width, 0.03);
  add('wing', WINGS[s.aero.wing].mass, -ohR * 0.85, ch.height * 0.95, 0.35, ch.width * 0.85, 0.2);
  add('diffuser', DIFFUSERS[s.aero.diffuser].mass, -ohR * 0.4, 0.2, 0.9, ch.width * 0.8, 0.1);
  // ballast on the floor between the axles (0 = rear axle, 1 = front axle)
  add('ballast', s.weight.ballastKg, s.weight.ballastPos * wb, 0.18, 0.4, 0.4, 0.1);
  return list;
}

// ---------------------------------------------------------------------------------------------
// build
// ---------------------------------------------------------------------------------------------

/**
 * Build physical vehicle params from a spec (ARCHITECTURE §2).
 * @param {object} input spec (partial specs are merged onto defaultSpec())
 */
export function build(input) {
  const { spec: s, warnings, errors } = normalizeSpec(input);
  const ch = CHASSIS[s.chassis];
  const isEV = s.powertrain === 'ev';
  const wb = ch.wheelbase;
  const dRide = s.suspension.rideHeight / 1000;           // m, negative = lowered
  const kit = BODY_KITS[s.aero.bodyKit];
  const trackF = ch.trackF + kit.trackAdd, trackR = ch.trackR + kit.trackAdd;
  const ctx = { placement: isEV ? 'front' : s.engine.placement };
  const comps = components(s, ch, ctx);

  // ---- unsprung masses ----
  const susp = SUSPENSION_TYPES[s.suspension.type];
  const brk = BRAKES[s.brakes.kit];
  const rad = ch.wheelRadius;
  // tyres need the static loads, which need the masses: tyre/wheel mass barely depends on Fz0,
  // so make provisional tyres for mass, then final tyres with the real static loads.
  const tyreProbeF = makeTyreParams(s.tyres.compound, s.tyres.widthF, rad, 3500);
  const tyreProbeR = makeTyreParams(s.tyres.compound, s.tyres.widthR, rad, 3500);
  const frontHw = (s.suspension.type === 'solidAxle' ? SUSPENSION_TYPES.macpherson.unsprung : susp.unsprung) - REF_WHEEL_KG;
  const rearHw = susp.unsprung - REF_WHEEL_KG;
  const unsprungF = frontHw + tyreProbeF.mass + brk.mass * 0.6 / 2;
  const unsprungR = rearHw + tyreProbeR.mass + brk.mass * 0.4 / 2;

  // ---- sprung mass properties ----
  let mS = 0, mx = 0, mz = 0;
  for (const c of comps) { mS += c.m; mx += c.m * c.x; mz += c.m * (c.z + dRide); }
  const xS = mx / mS, zS = mz / mS;
  let Ixx = 0, Iyy = 0, Izz = 0;
  for (const c of comps) {
    const dx = c.x - xS, dz = c.z + dRide - zS;
    const sx = c.lx * c.lx, sy = c.ly * c.ly, sz = c.lz * c.lz;
    // self inertia of a solid box (negative masses = removed material, same shape)
    Ixx += c.m * (sy + sz) / 12 + c.m * dz * dz;
    Iyy += c.m * (sx + sz) / 12 + c.m * (dx * dx + dz * dz);
    Izz += c.m * (sx + sy) / 12 + c.m * dx * dx;
  }
  const mU = 2 * unsprungF + 2 * unsprungR;
  const mTot = mS + mU;
  const xT = (mS * xS + 2 * unsprungF * wb) / mTot;
  const zT = (mS * zS + mU * rad) / mTot;
  const weightDistFront = xT / wb;
  const a = wb - xS, b = xS;                            // sprung CG (body-frame origin)

  // static corner loads (total) for the tyres
  const FzF = mTot * G * xT / wb / 2, FzR = mTot * G * (1 - xT / wb) / 2;

  // ---- engine / motors ----
  const powerUnits = [];
  let fuelKg = 0, fuelDensity = 0.75, battery = null;
  let curve = null, pk = null, evCurves = [];
  if (!isEV) {
    const fuel = FUELS[s.engine.fuel];
    fuelDensity = fuel.density;
    fuelKg = s.fuelLitres * fuel.density;
    const ep = makeEngineParams(s.engine, fuelKg);
    powerUnits.push({ engine: ep, drives: 'centre' });
    curve = engineCurve(ep);
    pk = curvePeaks(curve);
    engineWarnings(s, ep, curve, pk, warnings);
  } else {
    const ev = s.ev, bat = EV_BATTERIES[ev.battery];
    const pF = ev.front ? EV_MOTORS[ev.front].power : 0, pR = ev.rear ? EV_MOTORS[ev.rear].power : 0;
    for (const [key, drives, p] of [[ev.front, 'front', pF], [ev.rear, 'rear', pR]]) {
      if (!key) continue;
      const ep = makeMotorParams(key, ev.battery, p / (pF + pR));
      powerUnits.push({ engine: ep, drives });
      evCurves.push(engineCurve(ep));
    }
    battery = { kwh: bat.kwh, maxPower: bat.maxPower };
    if (pF + pR > bat.maxPower * 0.92) warnings.push(`Battery limits power to ${Math.round(bat.maxPower * 0.92 / 1000)} kW (motors rated ${Math.round((pF + pR) / 1000)} kW)`);
    // combined: motors see the same road speed, each with its own reduction (same here)
    const n = evCurves[0].length;
    curve = [];
    for (let i = 0; i < n; i++) {
      let t = 0, p = 0;
      for (const c of evCurves) { t += c[i].torque; p += c[i].powerKW; }
      curve.push({ rpm: evCurves[0][i].rpm, torque: t, powerKW: p, boostBar: 0 });
    }
    pk = curvePeaks(curve);
  }

  // ---- drivetrain ----
  const dts = s.drivetrain, gb = GEARBOXES[dts.gearbox];
  const gearRatios = [];
  if (isEV) gearRatios.push(1);
  else for (let i = 0; i < gb.gears; i++) gearRatios.push(gb.first * Math.pow(gb.top / gb.first, gb.gears > 1 ? i / (gb.gears - 1) : 0));
  const layout = dts.layout;
  const frontDriven = layout !== 'RWD', rearDriven = layout !== 'FWD';
  if (!isEV && pk.torqueNm > gb.maxTorque) warnings.push(`Gearbox torque capacity exceeded (${Math.round(pk.torqueNm)} Nm > ${gb.maxTorque} Nm)`);
  const centreSplit = layout === 'FWD' ? 1 : layout === 'RWD' ? 0 : dts.centreSplit;
  const efficiency = gb.efficiency * (layout === 'AWD' ? 0.96 : 0.98);
  const drivetrain = {
    layout, gearRatios, reverseRatio: isEV ? 1 : gb.first * 0.95, finalDrive: dts.finalDrive,
    shiftTime: gb.shiftTime, efficiency,
    frontDiff: { key: dts.frontDiff, ...DIFFS[dts.frontDiff] },
    rearDiff: { key: dts.rearDiff, ...DIFFS[dts.rearDiff] },
    centreDiff: { key: dts.centreDiff, ...CENTRE_DIFFS[dts.centreDiff] },
    centreSplit,
    clutchMaxTorque: isEV ? 1e5 : Math.max(150, 1.5 * pk.torqueNm),
    isEV,
    driveshaftInertia: isEV ? 0.01 : 0.015 + (layout === 'AWD' ? 0.03 : 0) + (layout === 'RWD' && ctx.placement === 'front' ? 0.012 : 0),
  };

  // ---- suspension ----
  const msF = mS * b / wb / 2, msR = mS * a / wb / 2;   // sprung mass per corner
  const dmp = s.suspension.damping;
  const mkAxle = (front) => {
    const su = s.suspension;
    const k = (front ? su.springF : su.springR) * 1000;
    const m = front ? msF : msR;
    const c = 2 * dmp * Math.sqrt(k * m);
    const solidRear = !front && su.type === 'solidAxle';
    const tp = front ? SUSPENSION_TYPES[su.type] : SUSPENSION_TYPES[su.type];
    const rc0 = front ? tp.rcF : tp.rcR;
    // lowering drops the roll centre: struts ~1.5x the body drop (link angles), others ~1x
    const rcSens = su.type === 'macpherson' ? 1.5 : solidRear ? 0.0 : 1.0;
    const rollCentre = clamp(rc0 + rcSens * dRide, -0.05, 0.4);
    const raceLike = su.type === 'pushrod';
    const bumpStock = raceLike ? 0.06 : su.type === 'solidAxle' && !front ? 0.11 : 0.09;
    const droopStock = raceLike ? 0.06 : 0.10;
    const camberGain = solidRear ? (tp.camberGainR != null ? tp.camberGainR : 1) : tp.camberGain;
    const staticDefl = m * G / k;
    const bt = BRAKES[s.brakes.kit];
    const totalBrake = bt.torqueF + bt.torqueR;
    const share = front ? s.brakes.bias : 1 - s.brakes.bias;
    const FzW = front ? FzF : FzR;
    return {
      steered: front,
      driven: front ? frontDriven : rearDriven,
      spring: k,
      bumpDamp: c * 0.8,
      reboundDamp: c * 1.2,
      arb: (front ? su.arbF : su.arbR) * 1000,
      restLength: 0.30 + (ch.style === 'suv' || ch.style === 'pickup' ? 0.08 : 0) + dRide,
      staticCompression: staticDefl,
      maxCompression: clamp(bumpStock + dRide, 0.025, 0.20),
      maxDroop: clamp(droopStock - 0.3 * dRide, 0.04, 0.20),
      rollCentre,
      camberStatic: (front ? su.camberF : su.camberR) * DEG,
      camberGain,
      toe: (front ? su.toeF : su.toeR) * DEG,
      anti: front ? tp.antiDive : tp.antiSquat,
      brakeTorque: totalBrake * share / 2,
      brakeHeatCap: (front ? bt.heatCap * 0.6 : bt.heatCap * 0.4),
      brakeFadeStart: bt.fadeStart,
      tyre: makeTyreParams(s.tyres.compound, front ? s.tyres.widthF : s.tyres.widthR, rad, FzW),
    };
  };
  const axles = [mkAxle(true), mkAxle(false)];
  // natural frequencies for the summary
  const fF = Math.sqrt(axles[0].spring / msF) / (2 * Math.PI), fR = Math.sqrt(axles[1].spring / msR) / (2 * Math.PI);
  if (fF < 0.9 || fR < 0.9) warnings.push(`Very soft springs (ride frequency ${Math.min(fF, fR).toFixed(2)} Hz): expect bottoming out`);
  if (axles[0].staticCompression > 0.12 || axles[1].staticCompression > 0.12) warnings.push('Springs too soft for the car\'s weight');

  // ---- aero ----
  const aero = buildAero(s, ch, wb, a, b, dRide, warnings);

  // ---- brakes sanity ----
  if (s.brakes.bias > 0.78) warnings.push('Very front-biased brakes: long stops, front lock-up');
  if (s.brakes.bias < 0.55) warnings.push('Rear-biased brakes: unstable under braking');

  // ---- price ----
  const price = priceOf(s);

  // ---- summary ----
  const crr = (axles[0].tyre.crr + axles[1].tyre.crr) / 2;
  const top = topSpeed(curve, drivetrain, rad, mTot, aero, crr, isEV ? powerUnits[0].engine.maxRpm : powerUnits[0].engine.limiterRpm, isEV);
  const powerKW = isEV ? Math.min(pk.powerKW, battery.maxPower * 0.92 / 1000) : pk.powerKW;

  const ep0 = powerUnits[0].engine;
  const params = {
    spec: s,
    valid: errors.length === 0,
    warnings, errors,
    price,
    geometry: {
      wheelbase: wb, a, b, trackF, trackR, cgHeight: zS,
      rideHeight: (ch.clearance || 0.13) + dRide,
      cgTotal: { a: wb - xT, b: xT, height: zT },
      length: ch.length, width: ch.width + kit.trackAdd, height: ch.height + dRide,
    },
    mass: {
      total: mTot, sprung: mS, unsprungF, unsprungR,
      inertia: { Ixx, Iyy, Izz },
      components: comps.map((c) => ({ name: c.name, m: Math.round(c.m * 10) / 10, x: Math.round((c.x - xS) * 1000) / 1000, z: Math.round((c.z + dRide) * 1000) / 1000 })),
    },
    axles,
    aero,
    powerUnits,
    drivetrain,
    electronics: { ...ELECTRONICS[s.electronics] },
    steering: { maxLock: s.steering.maxLock * DEG, ackermann: s.steering.ackermann, rate: 720 / s.steering.ratio * DEG, ratio: s.steering.ratio },
    fuel: { tankKg: fuelKg, density: fuelDensity, x: ctx.xTank - xS },
    battery,
    render: {
      style: ch.style, length: ch.length, width: ch.width + kit.trackAdd, height: ch.height + dRide,
      color: s.color, wing: s.aero.wing, wingAngle: s.aero.wingAngle, splitter: s.aero.splitter, diffuser: s.aero.diffuser, bodyKit: s.aero.bodyKit,
      tyreWidthF: s.tyres.widthF, tyreWidthR: s.tyres.widthR, wheelRadiusF: rad, wheelRadiusR: rad,
      engineLayout: isEV ? 'EV' : s.engine.layout, placement: ctx.placement, exhaust: isEV ? 'none' : s.engine.exhaust,
      induction: isEV ? 'ev' : INDUCTION[s.engine.induction].kind, rideHeightMm: s.suspension.rideHeight,
    },
    summary: {
      powerKW, peakPowerRpm: pk.peakPowerRpm, torqueNm: pk.torqueNm, peakTorqueRpm: pk.peakTorqueRpm,
      mass: mTot, weightDistFront, powerToWeight: powerKW / (mTot / 1000), topSpeedEstKph: top * 3.6,
      drivetrain: layout, price,
      redlineRpm: ep0.redlineRpm, rideFreqF: fF, rideFreqR: fR,
      maxBoostBar: isEV ? 0 : Math.max(...curve.map((p) => p.boostBar)),
      downforce200: 0.5 * RHO_AIR * (aero.clAFront + aero.clARear) * (200 / 3.6) ** 2 / G,
      cdA: aero.cdA,
    },
  };
  return params;
}

function engineWarnings(s, ep, curve, pk, warnings) {
  const e = s.engine;
  let maxRetard = 0, fuelLim = false, maxMap = 0;
  for (const p of curve) { if (p.knockRetard > maxRetard) maxRetard = p.knockRetard; if (p.fuelLimited) fuelLim = true; if (p.mapBar > maxMap) maxMap = p.mapBar; }
  if (maxRetard > 0.15) warnings.push(`Boost limited by fuel octane: ${Math.round(maxRetard * 100)} % knock retard on ${FUELS[e.fuel].label}`);
  if (maxRetard >= 0.999) warnings.push('Engine will detonate at full boost: internals at risk (use higher-octane fuel or less boost)');
  if (fuelLim) warnings.push(`Fuel system limiting power (${FUEL_SYSTEMS[e.fuelSystem].label}, ${FUEL_SYSTEMS[e.fuelSystem].flow} g/s)`);
  const pr = maxMap * 1e5 / 101325;
  if (pr > ep.maxPressure) warnings.push(`Internals at risk: ${pr.toFixed(2)} bar abs manifold pressure exceeds the ${INTERNALS[e.internals].label} limit (${ep.maxPressure})`);
  else if (pr > ep.maxPressure * 0.93) warnings.push('Internals near their pressure limit');
  if (e.antiLag) warnings.push('Anti-lag: extra fuel use and turbo/exhaust wear');
  if (CAMS[e.cams].idleRough >= 0.5) warnings.push('Race cams: lumpy idle and weak low-end torque');
}

function buildAero(s, ch, wb, a, b, dRide, warnings) {
  const ae = s.aero;
  const sp = SPLITTERS[ae.splitter], wg = WINGS[ae.wing], df = DIFFUSERS[ae.diffuser], kit = BODY_KITS[ae.bodyKit];
  const ohF = (ch.length - wb) * 0.55, ohR = (ch.length - wb) * 0.45;
  const A = ch.frontalArea;
  // Wing: lift slope with ~-4 deg zero-lift angle for a cambered profile; catalogue values at 8 deg.
  let wingFactor = 1;
  if (wg.adjustable) wingFactor = (ae.wingAngle + 4) / 12;
  else if (wg.clA > 0 && ae.wingAngle !== 8) { /* fixed spoiler: angle ignored */ }
  const wingClA = wg.clA * wingFactor;
  // profile drag 40 %, induced drag 60 % (~CL^2) of the catalogue drag at the reference angle
  const wingCdA = wg.cdA * (0.4 + 0.6 * wingFactor * wingFactor);
  // ride height: lowering reduces underbody lift and frontal area / drag slightly
  const bodyClA = -ch.Cl * A + (-dRide) * 1.0 * A * 0.5;
  const cdA = Math.max(0.2, ch.Cd * A * (1 + 0.6 * dRide) + sp.cdA + wingCdA + df.cdA + kit.cdA);
  // Split each downforce source onto the axles by its lever arm (x from rear axle)
  const parts = [
    { clA: bodyClA, x: wb * 0.52, ge: 0.3 },
    { clA: sp.clA, x: wb + ohF * 0.95, ge: 0.9 },
    { clA: wingClA, x: -ohR * 0.85, ge: 0 },
    { clA: df.clA, x: -ohR * 0.1 + 0.15 * wb, ge: 1.5 * df.groundEffect },
  ];
  let clAF = 0, clAR = 0, geNum = 0, clTot = 0;
  for (const p of parts) {
    const fF = p.x / wb;                              // fraction on the front axle (can be <0 or >1)
    clAF += p.clA * fF; clAR += p.clA * (1 - fF);
    geNum += Math.abs(p.clA) * p.ge; clTot += p.clA;
  }
  const groundEffect = clamp(geNum / Math.max(clTot, 0.25), 0, 1.5);
  const copHeight = (ch.Cd * A * ch.height * 0.45 + wingCdA * ch.height * 0.95 + sp.cdA * 0.12 + df.cdA * 0.2 + kit.cdA * 0.4) / Math.max(cdA, 0.1) + dRide;
  if (clAR < 0.05 && clAF > 0.25) warnings.push('Aero balance far forward: expect high-speed oversteer');
  if (wg.adjustable && ae.wingAngle > 13) warnings.push('Wing near stall angle: big drag penalty');
  return { cdA, clAFront: clAF, clARear: clAR, groundEffect, refRideHeight: (ch.clearance || 0.13) + dRide, copHeight, wingAngle: ae.wingAngle };
}

function priceOf(s) {
  const ch = CHASSIS[s.chassis];
  let p = ch.price;
  if (s.powertrain === 'ice') {
    const e = s.engine;
    p += LAYOUTS[e.layout].price + INDUCTION[e.induction].price + INTERCOOLERS[e.intercooler].price + FUELS[e.fuel].price
      + FUEL_SYSTEMS[e.fuelSystem].price + CAMS[e.cams].price + INTAKES[e.intake].price + EXHAUSTS[e.exhaust].price
      + INTERNALS[e.internals].price + FLYWHEELS[e.flywheel].price + ECU_TUNES[e.ecu].price + (e.antiLag ? ANTI_LAG.price : 0);
  } else {
    if (s.ev.front) p += EV_MOTORS[s.ev.front].price;
    if (s.ev.rear) p += EV_MOTORS[s.ev.rear].price;
    p += EV_BATTERIES[s.ev.battery].price;
  }
  const d = s.drivetrain;
  p += GEARBOXES[d.gearbox].price + DIFFS[d.frontDiff].price * (d.layout !== 'RWD' ? 1 : 0)
    + DIFFS[d.rearDiff].price * (d.layout !== 'FWD' ? 1 : 0) + (d.layout === 'AWD' ? CENTRE_DIFFS[d.centreDiff].price + (s.powertrain === 'ice' ? 2500 : 0) : 0);
  p += SUSPENSION_TYPES[s.suspension.type].price + DAMPERS[s.suspension.dampers].price;
  p += COMPOUNDS[s.tyres.compound].price + BRAKES[s.brakes.kit].price;
  p += SPLITTERS[s.aero.splitter].price + WINGS[s.aero.wing].price + DIFFUSERS[s.aero.diffuser].price + BODY_KITS[s.aero.bodyKit].price;
  p += WEIGHT_REDUCTION[s.weight.reduction].price + ELECTRONICS[s.electronics].price;
  return Math.round(p);
}

/** Top speed: highest v where wheel power >= drag + rolling resistance, in any gear, rpm <= limit. */
function topSpeed(curve, dt, rad, mass, aero, crr, rpmLimit, isEV) {
  const lo = curve[0].rpm, hi = curve[curve.length - 1].rpm;
  const powerAt = (rpm) => {
    if (rpm < lo || rpm > hi + 1) return 0;
    const f = (rpm - lo) / (hi - lo) * (curve.length - 1);
    const i = Math.min(curve.length - 2, Math.floor(f)), t = f - i;
    return (curve[i].powerKW * (1 - t) + curve[i + 1].powerKW * t) * 1000;
  };
  const ratios = dt.gearRatios;
  let best = 0;
  for (let v = 5; v < 160; v += 0.25) {
    const resist = (0.5 * RHO_AIR * aero.cdA * v * v + crr * (mass * G + 0.5 * RHO_AIR * (aero.clAFront + aero.clARear) * v * v)) * v;
    let ok = false;
    for (const g of ratios) {
      const rpm = v / rad * g * dt.finalDrive * 60 / (2 * Math.PI);
      if (rpm > Math.min(rpmLimit, hi)) continue;
      if (powerAt(rpm) * dt.efficiency >= resist) { ok = true; break; }
    }
    if (ok) best = v;
    else if (best > 0) break;
  }
  return best;
}

export { components as _components };
