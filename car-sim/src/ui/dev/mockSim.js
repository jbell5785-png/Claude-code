// Development mock of the sim modules (§2, §3, §5, §6 of ARCHITECTURE.md).
// Only used when a real module in src/sim/ is missing or when the page is opened with ?sim=mock.
// The physics here is a deliberately simple dynamic bicycle model — good enough to exercise the UI.
import {
  CHASSIS, LAYOUTS, INDUCTION, GEARBOXES, COMPOUNDS, EV_MOTORS, EV_BATTERIES, EXHAUSTS,
  WINGS, SPLITTERS, DIFFUSERS, BODY_KITS, ELECTRONICS, BRAKES, FUELS, WEIGHT_REDUCTION,
} from '../../sim/catalog.js';
import { DT, G, SURFACE } from '../../sim/constants.js';

const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
const lerp = (a, b, t) => a + (b - a) * t;

// ---------------------------------------------------------------- build / engine
export const MOCK_DEFAULT_SPEC = {
  name: 'Mock coupe', chassis: 'coupe', powertrain: 'ice',
  engine: { layout: 'I6', displacement: 3.0, placement: 'front', induction: 'turboMedium', boost: 1.0,
    intercooler: 'fmic', fuel: 'petrol98', fuelSystem: 'sport', cams: 'fastRoad', intake: 'coldAir',
    exhaust: 'sport', internals: 'forged', flywheel: 'light', ecu: 'stage1', antiLag: false },
  ev: { front: null, rear: 'large', battery: 'b80' },
  drivetrain: { layout: 'RWD', gearbox: 'mt6', finalDrive: 3.7, frontDiff: 'open', rearDiff: 'lsd15way', centreDiff: 'open', centreSplit: 0.4 },
  suspension: { type: 'doubleWishbone', dampers: 'coilover', springF: 60, springR: 55, arbF: 25, arbR: 15, damping: 0.45,
    rideHeight: -20, camberF: -2, camberR: -1.5, toeF: 0, toeR: 0.1 },
  tyres: { compound: 'sport', widthF: 245, widthR: 265 },
  brakes: { kit: 'sport', bias: 0.64 },
  aero: { splitter: 'lip', wing: 'ducktail', wingAngle: 8, diffuser: 'none', bodyKit: 'stock' },
  weight: { reduction: 'light', ballastKg: 0, ballastPos: 0.5 },
  electronics: 'absTc', fuelLitres: 50,
  steering: { ratio: 14, maxLock: 35, ackermann: 0.6 },
  color: '#d0302a',
};

function mockEngineParams(spec) {
  if (spec.powertrain === 'ev') {
    const m = EV_MOTORS[spec.ev.rear || spec.ev.front || 'large'];
    const power = (spec.ev.front ? EV_MOTORS[spec.ev.front].power : 0) + (spec.ev.rear ? EV_MOTORS[spec.ev.rear].power : 0);
    return { isEV: true, inertia: 0.05, idleRpm: 0, redlineRpm: m.maxRpm, limiterRpm: m.maxRpm, maxRpm: m.maxRpm,
      cylinders: 0, rotary: false, layout: 'EV', loudness: 0.2, induction: 'ev', peakPower: power, peakTorque: m.torque * 2 };
  }
  const e = spec.engine; const L = LAYOUTS[e.layout] || LAYOUTS.I4; const ind = INDUCTION[e.induction] || INDUCTION.na;
  const disp = clamp(e.displacement, L.disp[0], L.disp[1]);
  const boost = ind.kind === 'na' ? 0 : clamp(e.boost, 0, ind.maxBoost);
  const red = L.rotary ? 9000 : clamp(8600 - disp * 450 / Math.sqrt(L.cyl / 4), 5800, 9200);
  const tq = disp * 105 * (1 + boost * 0.85);
  return { isEV: false, inertia: 0.18, idleRpm: 850, redlineRpm: red, limiterRpm: red + 150, maxRpm: red + 800,
    cylinders: L.cyl, rotary: !!L.rotary, layout: e.layout, loudness: (EXHAUSTS[e.exhaust] || EXHAUSTS.stock).loudness,
    induction: ind.kind, peakTorque: tq, boostMax: boost, turboTau: ind.tau || 0.3 };
}

function torqueAt(ep, rpm) {
  if (ep.isEV) {
    const w = rpm * Math.PI / 30; const tq = ep.peakTorque;
    return Math.min(tq, ep.peakPower / Math.max(w, 1));
  }
  const x = rpm / ep.redlineRpm;
  const shape = Math.exp(-Math.pow((x - 0.62) / 0.55, 2));
  const spool = ep.induction === 'turbo' ? clamp((x - 0.25) / 0.3, 0, 1) : 1;
  const base = ep.peakTorque / (1 + (ep.boostMax || 0) * 0.85);
  return base * shape * (1 + (ep.boostMax || 0) * 0.85 * spool) * (rpm > ep.limiterRpm ? 0 : 1);
}

export function mockEngineCurve(ep) {
  const out = []; const r0 = ep.isEV ? 0 : ep.idleRpm; const r1 = ep.isEV ? ep.maxRpm : ep.limiterRpm;
  for (let i = 0; i < 60; i++) {
    const rpm = lerp(r0, r1, i / 59); const t = torqueAt(ep, rpm);
    const x = rpm / ep.redlineRpm;
    out.push({ rpm, torque: t, powerKW: t * rpm * Math.PI / 30 / 1000,
      boostBar: ep.induction === 'turbo' ? ep.boostMax * clamp((x - 0.25) / 0.3, 0, 1) : ep.induction === 'super' ? ep.boostMax * Math.min(1, x * 1.3) : 0 });
  }
  return out;
}

export function mockBuild(specIn) {
  const spec = JSON.parse(JSON.stringify(Object.assign({}, MOCK_DEFAULT_SPEC, specIn || {})));
  const ch = CHASSIS[spec.chassis] || CHASSIS.coupe;
  const kit = BODY_KITS[spec.aero.bodyKit] || BODY_KITS.stock;
  const ep = mockEngineParams(spec);
  const warnings = []; const errors = [];
  if (spec.powertrain === 'ice' && !ch.placements.includes(spec.engine.placement)) {
    warnings.push(`${ch.label} does not allow a ${spec.engine.placement} engine — using ${ch.placements[0]}`);
    spec.engine.placement = ch.placements[0];
  }
  if (spec.tyres.widthF > ch.maxTyreWidth + kit.tyreAdd) warnings.push('Front tyres too wide for arches (clamped)');
  let mass = ch.mass + 75 + spec.fuelLitres * 0.75 + (WEIGHT_REDUCTION[spec.weight.reduction] || { mass: 0 }).mass + kit.mass + spec.weight.ballastKg;
  if (spec.powertrain === 'ice') { const L = LAYOUTS[spec.engine.layout]; mass += L.massBase + L.perL * spec.engine.displacement + 60; }
  else mass += (EV_BATTERIES[spec.ev.battery] || EV_BATTERIES.b60).mass + 80;
  const place = spec.engine.placement;
  let wdf = 1 - ch.cgFromRear; wdf += spec.powertrain === 'ice' ? (place === 'front' ? 0.06 : place === 'mid' ? -0.06 : -0.12) : -0.02;
  wdf += (spec.weight.ballastPos - 0.5) * spec.weight.ballastKg / mass;
  wdf = clamp(wdf, 0.3, 0.7);
  const wb = ch.wheelbase; const a = wb * (1 - wdf); const b = wb * wdf;
  const rideHeight = 0.13 + spec.suspension.rideHeight / 1000;
  const cgH = ch.cgHeight + spec.suspension.rideHeight / 1000;
  const comp = COMPOUNDS[spec.tyres.compound] || COMPOUNDS.sport;
  const gb = GEARBOXES[spec.powertrain === 'ev' ? 'ev1' : spec.drivetrain.gearbox] || GEARBOXES.mt6;
  const gearRatios = [];
  for (let i = 0; i < gb.gears; i++) gearRatios.push(gb.gears === 1 ? 1 : gb.first * Math.pow(gb.top / gb.first, i / (gb.gears - 1)));
  const curve = mockEngineCurve(ep); let pk = curve[0], tk = curve[0];
  for (const p of curve) { if (p.powerKW > pk.powerKW) pk = p; if (p.torque > tk.torque) tk = p; }
  const cdA = ch.Cd * ch.frontalArea + kit.cdA + (WINGS[spec.aero.wing] || WINGS.none).cdA;
  const vmax = Math.cbrt(pk.powerKW * 1000 * 0.85 / (0.5 * 1.2 * cdA));
  const elec = ELECTRONICS[spec.electronics] || ELECTRONICS.none;
  const brk = BRAKES[spec.brakes.kit] || BRAKES.stock;
  const wr = ch.wheelRadius;
  const isEV = spec.powertrain === 'ev';
  const layout = isEV ? (spec.ev.front && spec.ev.rear ? 'AWD' : spec.ev.front ? 'FWD' : 'RWD') : spec.drivetrain.layout;
  const axle = (front) => ({
    steered: front, driven: layout === 'AWD' || (front ? layout === 'FWD' : layout === 'RWD'),
    spring: (front ? spec.suspension.springF : spec.suspension.springR) * 1000, bumpDamp: 3000, reboundDamp: 5000,
    arb: (front ? spec.suspension.arbF : spec.suspension.arbR) * 1000, restLength: 0.3, maxCompression: 0.08, maxDroop: 0.1,
    rollCentre: 0.06, camberStatic: (front ? spec.suspension.camberF : spec.suspension.camberR) * Math.PI / 180, camberGain: 0.5,
    toe: 0, anti: 0.2, brakeTorque: (front ? brk.torqueF : brk.torqueR) / 2, brakeHeatCap: brk.heatCap / 2, brakeFadeStart: brk.fadeStart,
    tyre: { mu: comp.mu, width: (front ? spec.tyres.widthF : spec.tyres.widthR) / 1000, radius: wr, tOpt: comp.tOpt, tWindow: comp.tWindow },
  });
  const price = ch.price + 12000;
  const price2 = price + (FUELS[spec.engine.fuel] || { price: 0 }).price + (SPLITTERS[spec.aero.splitter] || { price: 0 }).price;
  return {
    spec, valid: errors.length === 0, warnings, errors, price: price2,
    geometry: { wheelbase: wb, a, b, trackF: ch.trackF + kit.trackAdd, trackR: ch.trackR + kit.trackAdd, cgHeight: cgH, rideHeight },
    mass: { total: mass, sprung: mass - 4 * 40, unsprungF: 40, unsprungR: 40, inertia: { Ixx: mass * 0.3, Iyy: mass * 1.2, Izz: mass * 1.4 } },
    axles: [axle(true), axle(false)],
    aero: { cdA, clAFront: 0.1, clARear: 0.15, groundEffect: 0, refRideHeight: rideHeight, copHeight: 0.5 },
    powerUnits: [{ engine: ep, drives: isEV ? (spec.ev.rear ? 'rear' : 'front') : 'centre' }],
    drivetrain: { layout, gearRatios, reverseRatio: 3.3, finalDrive: spec.drivetrain.finalDrive, shiftTime: gb.shiftTime,
      efficiency: gb.efficiency, frontDiff: {}, rearDiff: {}, centreDiff: {}, centreSplit: 0.4, clutchMaxTorque: 900, isEV, driveshaftInertia: 0.1 },
    electronics: { abs: elec.abs, tc: elec.tc, launch: elec.launch },
    steering: { maxLock: spec.steering.maxLock * Math.PI / 180, ackermann: spec.steering.ackermann, rate: 6 },
    fuel: { tankKg: spec.fuelLitres * 0.75, density: 0.75, x: -1 },
    battery: isEV ? { kwh: EV_BATTERIES[spec.ev.battery].kwh, maxPower: EV_BATTERIES[spec.ev.battery].maxPower } : null,
    render: { style: ch.style, length: ch.length, width: ch.width + kit.trackAdd, height: ch.height + spec.suspension.rideHeight / 1000,
      color: spec.color, wing: spec.aero.wing, splitter: spec.aero.splitter, diffuser: spec.aero.diffuser, bodyKit: spec.aero.bodyKit,
      tyreWidthF: spec.tyres.widthF, tyreWidthR: spec.tyres.widthR, wheelRadiusF: wr, wheelRadiusR: wr,
      engineLayout: isEV ? 'EV' : spec.engine.layout, placement: isEV ? 'mid' : spec.engine.placement, exhaust: spec.engine.exhaust },
    summary: { powerKW: pk.powerKW, peakPowerRpm: pk.rpm, torqueNm: tk.torque, peakTorqueRpm: tk.rpm, mass, weightDistFront: wdf,
      powerToWeight: pk.powerKW / (mass / 1000), topSpeedEstKph: vmax * 3.6, drivetrain: layout, price: price2 },
  };
}

export const MOCK_PRESETS = {
  mockCoupe: { label: 'Mock: turbo I6 coupe', spec: MOCK_DEFAULT_SPEC },
  mockV8: { label: 'Mock: V8 sedan', spec: { ...MOCK_DEFAULT_SPEC, name: 'V8 saloon', chassis: 'sedan', color: '#1f4fbf',
    engine: { ...MOCK_DEFAULT_SPEC.engine, layout: 'V8', displacement: 5.0, induction: 'na', boost: 0 } } },
  mockEV: { label: 'Mock: dual-motor EV', spec: { ...MOCK_DEFAULT_SPEC, name: 'EV', powertrain: 'ev', chassis: 'supercar', color: '#e8e8e8',
    ev: { front: 'medium', rear: 'large', battery: 'b80' }, engine: { ...MOCK_DEFAULT_SPEC.engine, placement: 'mid' } } },
};

// ---------------------------------------------------------------- track
const TRACK_DEFS = {
  mockRing: { label: 'Mock Ring (dev)', width: 12, pts: [
    [0, 0, 0], [220, 0, 0], [330, 40, 3], [360, 150, 8], [300, 240, 10], [180, 250, 6], [120, 180, 4],
    [40, 220, 2], [-80, 250, 0], [-170, 180, -1], [-160, 70, 0], [-90, 10, 0]] },
  mockOval: { label: 'Mock Oval (dev)', width: 14, pts: [
    [0, 0, 0], [250, 0, 0], [340, 60, 0], [340, 160, 0], [250, 220, 0], [0, 220, 0], [-90, 160, 0], [-90, 60, 0]] },
};

function catmull(p0, p1, p2, p3, t) {
  const t2 = t * t, t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}

export function createMockTrack(key) {
  const def = TRACK_DEFS[key] || TRACK_DEFS.mockRing;
  const P = def.pts; const m = P.length; const dense = [];
  for (let i = 0; i < m; i++) {
    const p0 = P[(i - 1 + m) % m], p1 = P[i], p2 = P[(i + 1) % m], p3 = P[(i + 2) % m];
    for (let k = 0; k < 40; k++) {
      const t = k / 40; dense.push([0, 1, 2].map((c) => catmull(p0[c], p1[c], p2[c], p3[c], t)));
    }
  }
  // arc-length resample
  const cum = [0];
  for (let i = 1; i <= dense.length; i++) {
    const a = dense[i - 1], b = dense[i % dense.length];
    cum.push(cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]));
  }
  const length = cum[cum.length - 1]; const ds = 2; const n = Math.round(length / ds);
  const S = { n, ds: length / n };
  for (const f of ['x', 'y', 'z', 'tx', 'ty', 'tz', 'nx', 'ny', 'bank', 'curvature', 'widthL', 'widthR']) S[f] = new Float64Array(n);
  let j = 0;
  for (let i = 0; i < n; i++) {
    const s = i * S.ds; while (cum[j + 1] < s) j++;
    const t = (s - cum[j]) / (cum[j + 1] - cum[j]); const a = dense[j], b = dense[(j + 1) % dense.length];
    S.x[i] = lerp(a[0], b[0], t); S.y[i] = lerp(a[1], b[1], t); S.z[i] = lerp(a[2], b[2], t);
  }
  for (let i = 0; i < n; i++) {
    const i0 = (i - 1 + n) % n, i1 = (i + 1) % n;
    let tx = S.x[i1] - S.x[i0], ty = S.y[i1] - S.y[i0], tz = S.z[i1] - S.z[i0]; const l = Math.hypot(tx, ty, tz);
    tx /= l; ty /= l; tz /= l; S.tx[i] = tx; S.ty[i] = ty; S.tz[i] = tz;
    const h = Math.hypot(tx, ty); S.nx[i] = -ty / h; S.ny[i] = tx / h;
    S.widthL[i] = def.width / 2; S.widthR[i] = def.width / 2;
  }
  for (let i = 0; i < n; i++) {
    const i0 = (i - 1 + n) % n, i1 = (i + 1) % n;
    const h0 = Math.atan2(S.ty[i0], S.tx[i0]), h1 = Math.atan2(S.ty[i1], S.tx[i1]);
    let d = h1 - h0; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
    S.curvature[i] = d / (2 * S.ds);
  }
  for (let i = 0; i < n; i++) { // smoothed banking into corners
    let c = 0; for (let k = -6; k <= 6; k++) c += S.curvature[(i + k + n) % n]; c /= 13;
    S.bank[i] = clamp(c * 6, -0.08, 0.08);
  }
  const track = {
    key, label: def.label, length, width: def.width, closed: true, samples: S,
    query(x, y, hint, out) {
      let best = -1, bd = Infinity;
      const scan = (a, b) => { for (let k = a; k <= b; k++) { const i = ((k % n) + n) % n; const d = (x - S.x[i]) ** 2 + (y - S.y[i]) ** 2; if (d < bd) { bd = d; best = i; } } };
      if (hint >= 0) scan(hint - 20, hint + 20); else scan(0, n - 1);
      const i = best; const dx = x - S.x[i], dy = y - S.y[i];
      const along = dx * S.tx[i] + dy * S.ty[i]; const off = dx * S.nx[i] + dy * S.ny[i];
      out.s = ((i * S.ds + along) % length + length) % length; out.offset = off; out.index = i;
      const wl = S.widthL[i], wr = S.widthR[i]; const edge = off > 0 ? wl : wr; const a = Math.abs(off);
      const bankH = clamp(off, -wr, wl) * Math.tan(S.bank[i]);
      const beyond = Math.max(0, a - edge);
      out.height = S.z[i] + along * S.tz[i] + bankH - Math.min(beyond, 6) * 0.03 + Math.sin(x * 0.02) * Math.cos(y * 0.025) * Math.min(1, beyond / 30) * 3;
      out.nx = 0; out.ny = 0; out.nz = 1;
      const inside = (S.curvature[i] > 0) === (off > 0);
      const curvy = Math.abs(S.curvature[i]) > 0.006;
      out.surface = a <= edge ? SURFACE.ASPHALT : (a <= edge + 1.2 && curvy) ? SURFACE.KERB : (!inside && curvy && a < edge + 14) ? SURFACE.GRAVEL : SURFACE.GRASS;
      return out;
    },
    pointAt(s, out) {
      s = ((s % length) + length) % length; const f = s / S.ds; const i = Math.floor(f) % n; const t = f - Math.floor(f); const k = (i + 1) % n;
      out.x = lerp(S.x[i], S.x[k], t); out.y = lerp(S.y[i], S.y[k], t); out.z = lerp(S.z[i], S.z[k], t);
      out.tx = S.tx[i]; out.ty = S.ty[i]; out.heading = Math.atan2(S.ty[i], S.tx[i]); out.curvature = S.curvature[i]; out.bank = S.bank[i];
      return out;
    },
    startPose(slot = 0) {
      const p = this.pointAt(length - 8 - slot * 8, {});
      const side = slot % 2 ? -2.5 : 2.5;
      return { x: p.x + S.nx[0] * side * 0, y: p.y, heading: p.heading };
    },
    scenery: null,
  };
  return track;
}

export const MOCK_TRACKS = Object.fromEntries(Object.entries(TRACK_DEFS).map(([k, d]) => [k, { label: d.label, build: () => k }]));

export function createMockLapTimer(track) {
  const lt = { lap: 0, lapTime: 0, lastLap: null, bestLap: null, sector: 0, progress: 0, wrongWay: false, offTrackTime: 0,
    sectorTimes: [null, null, null], _lastS: null };
  lt.update = (v) => {
    const s = v.trackState.s; lt.lapTime += DT;
    if (lt._lastS != null) {
      let d = s - lt._lastS; if (d < -track.length / 2) { d += track.length; lt.lap++; if (lt.lap > 1) { lt.lastLap = lt.lapTime; lt.bestLap = lt.bestLap == null ? lt.lapTime : Math.min(lt.bestLap, lt.lapTime); } lt.lapTime = 0; }
      if (d > track.length / 2) d -= track.length; lt.progress += d; lt.wrongWay = d < -1e-4 && v.speed > 2;
    }
    lt.sector = Math.min(2, Math.floor(s / track.length * 3));
    if (v.trackState.surface >= 2) lt.offTrackTime += DT;
    lt._lastS = s;
  };
  return lt;
}

// ---------------------------------------------------------------- vehicle
export function createMockVehicle(params, track, pose) {
  const ep = params.powerUnits[0].engine; const geo = params.geometry; const m = params.mass.total;
  const r = params.render.wheelRadiusF || 0.32;
  const q = { s: 0, offset: 0, height: 0, nx: 0, ny: 0, nz: 1, surface: 0, index: -1 };
  const es = { rpm: ep.idleRpm, omega: 0, throttle: 0, torque: 0, powerKW: 0, boostBar: 0, chargeTempC: 25, knockRetard: 0,
    fuelFlowGs: 0, fuelKg: params.fuel.tankKg, batteryKwh: params.battery ? params.battery.kwh : 0, soc: 0.9, damage: 0, failed: false,
    overRev: false, limiter: false, antiLagActive: false };
  const mkWheel = () => ({ pos: [0, 0, 0], steer: 0, spin: 0, omega: 0, compression: 0.04, Fz: m * G / 4, Fx: 0, Fy: 0, slipRatio: 0, slipAngle: 0,
    usage: 0, sliding: false, contact: true, surface: 0, camber: 0, tyre: { tempSurface: 40, tempCarcass: 40, wear: 0, kappa: 0, alpha: 0 }, brakeTempC: 60, onTrack: true });
  const v = {
    params, time: 0, pos: [0, 0, 0], quat: [0, 0, 0, 1], vel: [0, 0, 0], angVel: [0, 0, 0], speed: 0, heading: 0, accBody: [0, 0, 0],
    gear: 1, clutch: 1, shifting: false, controls: { steer: 0, throttle: 0, brake: 0, handbrake: 0 }, aids: { absActive: false, tcActive: false, launchActive: false },
    engines: [es], wheels: [mkWheel(), mkWheel(), mkWheel(), mkWheel()], trackState: { s: 0, offset: 0, index: -1, surface: 0 }, damage: 0, failed: false,
  };
  let x, y, hd, vx, vy, yr, pitch, roll, shiftT, gearMode, prevUp, prevDown, ax, ay;
  v.reset = (p) => {
    x = p.x; y = p.y; hd = p.heading; vx = 0; vy = 0; yr = 0; pitch = 0; roll = 0; shiftT = 0; v.gear = 1; ax = 0; ay = 0;
    v.time = 0; for (const w of v.wheels) { w.spin = 0; w.brakeTempC = 60; w.tyre.wear = 0; }
    update(0);
  };
  const ratios = params.drivetrain.gearRatios; const fd = params.drivetrain.finalDrive;
  function update(steerAng) {
    track.query(x, y, v.trackState.index, q);
    v.trackState.s = q.s; v.trackState.offset = q.offset; v.trackState.index = q.index; v.trackState.surface = q.surface;
    const z = q.height + geo.cgHeight;
    const ch = Math.cos(hd), sh = Math.sin(hd);
    v.pos[0] = x; v.pos[1] = y; v.pos[2] = z; v.heading = hd; v.speed = vx;
    v.vel[0] = vx * ch - vy * sh; v.vel[1] = vx * sh + vy * ch; v.vel[2] = 0; v.angVel[2] = yr;
    // quaternion: yaw * pitch * roll (body→world)
    const cy = Math.cos(hd / 2), sy = Math.sin(hd / 2), cp = Math.cos(pitch / 2), sp = Math.sin(pitch / 2), cr = Math.cos(roll / 2), sr = Math.sin(roll / 2);
    v.quat[0] = sr * cp * cy - cr * sp * sy; v.quat[1] = cr * sp * cy + sr * cp * sy; v.quat[2] = cr * cp * sy - sr * sp * cy; v.quat[3] = cr * cp * cy + sr * sp * sy;
    const pts = [[geo.a, geo.trackF / 2], [geo.a, -geo.trackF / 2], [-geo.b, geo.trackR / 2], [-geo.b, -geo.trackR / 2]];
    for (let i = 0; i < 4; i++) {
      const w = v.wheels[i]; const [bx, by] = pts[i];
      const lz = -roll * by + pitch * -bx; // approximate body-relative drop
      const comp = clamp(0.04 + lz * 0.6 + (i < 2 ? -ax : ax) * 0.002 + (by > 0 ? ay : -ay) * 0.003, 0, 0.09);
      w.compression = comp;
      w.pos[0] = x + bx * ch - by * sh; w.pos[1] = y + bx * sh + by * ch; w.pos[2] = q.height + r;
      w.steer = i < 2 ? steerAng : 0;
    }
  }
  v.step = (c) => {
    const dt = DT; v.time += dt;
    v.controls.steer = c.steer; v.controls.brake = c.brake; v.controls.handbrake = c.handbrake;
    gearMode = c.gearMode || 'auto';
    if (shiftT > 0) { shiftT -= dt; v.shifting = shiftT > 0; }
    const nG = ratios.length;
    if (c.shiftUp && !prevUp && v.gear < nG) { v.gear++; shiftT = params.drivetrain.shiftTime; }
    if (c.shiftDown && !prevDown && v.gear > -1) { v.gear--; shiftT = params.drivetrain.shiftTime; }
    prevUp = c.shiftUp; prevDown = c.shiftDown;
    const gr = v.gear > 0 ? ratios[v.gear - 1] : v.gear < 0 ? 3.3 : 0;
    let wheelOmega = vx / r;
    let rpm = Math.abs(wheelOmega * gr * fd) * 30 / Math.PI;
    if (!ep.isEV) rpm = Math.max(rpm, ep.idleRpm + c.throttle * (v.gear === 0 || shiftT > 0 ? 6000 : 0) * (vx < 3 ? 0.4 : 0));
    if (gearMode === 'auto' && shiftT <= 0 && !ep.isEV) {
      if (v.gear > 0 && rpm > ep.redlineRpm * 0.96 && v.gear < nG) { v.gear++; shiftT = params.drivetrain.shiftTime; }
      else if (v.gear > 1 && rpm < ep.redlineRpm * 0.45) { v.gear--; shiftT = params.drivetrain.shiftTime; }
    }
    es.limiter = rpm > ep.limiterRpm; rpm = Math.min(rpm, ep.limiterRpm + 50);
    const tq = torqueAt(ep, rpm) * c.throttle * (shiftT > 0 ? 0 : 1);
    es.rpm = es.rpm + (rpm - es.rpm) * 0.05; es.omega = es.rpm * Math.PI / 30; es.throttle = c.throttle; es.torque = tq;
    es.powerKW = tq * es.omega / 1000; es.boostBar += ((ep.boostMax || 0) * c.throttle * clamp(rpm / ep.redlineRpm * 1.6 - 0.3, 0, 1) - es.boostBar) * dt / (ep.turboTau || 0.2);
    es.fuelFlowGs = 0.2 + es.powerKW * 0.07; es.fuelKg = Math.max(0, es.fuelKg - es.fuelFlowGs * dt / 1000);
    es.chargeTempC = 25 + es.boostBar * 30;
    if (ep.isEV) { es.batteryKwh = Math.max(0, es.batteryKwh - es.powerKW * dt / 3600); es.soc = es.batteryKwh / params.battery.kwh; }
    const surfMu = q.surface === SURFACE.GRASS ? 0.55 : q.surface === SURFACE.GRAVEL ? 0.45 : 1;
    const mu = params.axles[0].tyre.mu * surfMu;
    let Fdrive = v.gear !== 0 ? tq * gr * fd * 0.9 / r * Math.sign(v.gear) : 0;
    const Fbrake = (c.brake * 1.1 * m * G) * Math.sign(vx) * (Math.abs(vx) > 0.2 ? 1 : Math.abs(vx) / 0.2);
    let absA = false; let tcA = false;
    if (params.electronics.tc && Math.abs(Fdrive) > mu * m * G * 0.55) { Fdrive = Math.sign(Fdrive) * mu * m * G * 0.55; tcA = c.throttle > 0.3; }
    const drag = 0.5 * 1.2 * params.aero.cdA * vx * Math.abs(vx) + 0.012 * m * G * Math.sign(vx) * Math.min(1, Math.abs(vx));
    const steerAng = c.steer * params.steering.maxLock / (1 + Math.abs(vx) * 0.02);
    const a = geo.a, b = geo.b; const Iz = params.mass.inertia.Izz;
    const Fzf = m * G * b / (a + b), Fzr = m * G * a / (a + b);
    const Cf = 9 * Fzf, Cr = 10 * Fzr; const svx = Math.max(Math.abs(vx), 1);
    const af = Math.atan2(vy + a * yr, svx) - steerAng * Math.sign(vx || 1); const ar = Math.atan2(vy - b * yr, svx);
    const hb = c.handbrake > 0.5 ? 0.35 : 1;
    let Fyf = clamp(-Cf * af, -mu * Fzf, mu * Fzf), Fyr = clamp(-Cr * ar, -mu * Fzr * hb, mu * Fzr * hb);
    let Fx = Fdrive - (c.brake > 0 ? Fbrake : 0) - drag;
    if (params.electronics.abs && c.brake > 0.8 && Math.abs(vx) > 3) absA = true;
    Fx = clamp(Fx, -mu * m * G, mu * m * G);
    if (Math.abs(vx) < 0.3 && c.throttle < 0.05) { vx *= 0.9; }
    ax = Fx / m - Fyf * Math.sin(steerAng) / m; ay = (Fyf * Math.cos(steerAng) + Fyr) / m;
    vx += (ax + vy * yr) * dt; vy += (ay - vx * yr) * dt; yr += (a * Fyf * Math.cos(steerAng) - b * Fyr) / Iz * dt;
    if (Math.abs(vx) < 1) { vy *= 0.95; yr *= 0.95; }
    hd += yr * dt; x += (vx * Math.cos(hd) - vy * Math.sin(hd)) * dt; y += (vx * Math.sin(hd) + vy * Math.cos(hd)) * dt;
    pitch += ((-ax * 0.006) - pitch) * dt * 8; roll += ((ay * 0.008) - roll) * dt * 8;
    v.accBody[0] = ax; v.accBody[1] = ay; v.accBody[2] = 0;
    v.controls.throttle = tq > 0 ? c.throttle : 0; v.aids.absActive = absA; v.aids.tcActive = tcA;
    update(steerAng);
    const uf = Math.abs(Fyf) / (mu * Fzf), ur = Math.hypot(Fyr / (mu * Fzr), Fx / (mu * m * G));
    for (let i = 0; i < 4; i++) {
      const w = v.wheels[i]; const front = i < 2;
      const lt = (i % 2 === 0 ? 1 : -1) * ay * 0.05 * m; const lg = (front ? -1 : 1) * ax * 0.04 * m;
      w.Fz = (front ? Fzf : Fzr) / 2 + lt + lg; w.usage = front ? uf : ur; w.sliding = w.usage > 0.98;
      w.slipAngle = front ? af : ar; w.slipRatio = front ? 0 : clamp((Fx / (m * G)) * 0.08, -1, 1);
      w.Fx = front ? 0 : Fx / 2; w.Fy = (front ? Fyf : Fyr) / 2;
      w.omega = c.handbrake > 0.5 && !front ? 0 : vx / r * (1 + w.slipRatio); w.spin += w.omega * dt;
      w.surface = q.surface; w.onTrack = q.surface <= 1;
      w.brakeTempC += (c.brake * Math.abs(vx) * 0.9 - (w.brakeTempC - 40) * 0.02) * dt * 8;
      w.tyre.tempSurface += (w.usage * 40 + 40 - w.tyre.tempSurface) * dt * 0.5; w.tyre.tempCarcass += (w.tyre.tempSurface - w.tyre.tempCarcass) * dt * 0.1;
      w.tyre.wear += w.usage * Math.abs(vx) * dt * 1e-6;
    }
  };
  v.reset(pose);
  return v;
}
