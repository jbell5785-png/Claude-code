// Tyre model (owner: B). Contract: ARCHITECTURE.md §4.
//
// Physics summary
// ---------------
// * Pure-slip shape: Pacejka Magic Formula  F = D sin(C atan(Bx - E(Bx - atan Bx))).
//   Longitudinal uses C_x = C + 0.1, lateral C_y = C (compound shapeC/shapeE).
// * Combined slip: normalised slip  rho = sqrt((kappa/kappa_pk)^2 + (tanA/alpha_pk)^2).
//   |F| comes from the MF shape evaluated at rho (B is solved so the MF peak is at rho = 1),
//   direction from the normalised slip components -> friction ellipse with Dx = 1.04 Dy.
//   kappa_pk = Dx Bx Cx / Kx and alpha_pk = Dy By Cy / Ky, so the initial slopes equal the
//   longitudinal stiffness Kx = stiffLong*Fz and cornering stiffness
//   Ky = stiff*Fz0*sin(2 atan(Fz/(2 Fz0)))/sin(2 atan(1/2)).
// * Peak friction: mu(Fz) = mu*(1 - loadSens*(Fz/Fz0 - 1)), ratio clamped to [0.5, 1.3],
//   times surface, temperature, wear and camber factors.
// * Transient slip (Pacejka ch. 7, first-order relaxation, implicit/stiffly-stable update):
//     sigma_k d(kappa')/dt + |vx| kappa' = -Vsx,          Vsx = vx - omega*R
//     sigma_a d(u')/dt     + |vx| u'     =  vy - |vx| u_g  (u' ~ tan(slip angle), u_g = camber shift)
//   At vx = 0 the states integrate the contact-patch deflection (a carcass spring k = K/sigma),
//   so a locked wheel holds on a slope without creep. A low-speed damper (critically damped
//   against a quarter-car mass Fz/g, faded out above ~3 m/s and above the friction peak) stops
//   the spring from ringing. The longitudinal damper is capped at 0.8*I/(R^2*DT) unless the
//   wheel has been stationary for >= 2 steps (brake-locked), so an explicitly integrated free
//   wheel stays stable at 500 Hz.
// * Camber (input convention per contract): camber is the wheel's lean relative to the road,
//   POSITIVE = top of the wheel leaning LEFT (+y). For the LEFT wheel positive = outward
//   (= positive "automotive" camber); for the RIGHT wheel positive = inward (= negative
//   automotive camber). Effects:
//     - camber thrust  Fy_gamma = camberStiff*Fz*camber (toward the lean, +y for camber>0),
//       implemented as a lateral slip shift inside the relaxation equation (so it needs rolling,
//       never pushes a stationary car, and saturates with the friction ellipse);
//     - mu sensitivity  f = 1 - camberMuSens*(camber - camber*)^2, where the optimum camber*
//       is taken RELATIVE TO THE LATERAL FORCE DIRECTION: camber* = -camberOpt * dirY,
//       dirY in [-1,1] = share of the force pointing left. camberOpt is given in the usual
//       automotive sense (negative = top leaning toward the car centre / toward the corner),
//       e.g. -2.7 deg for slicks. So a right (outside) wheel in a left-hand corner (force +y)
//       wants top-leaning-left = +2.7 deg contract camber = -2.7 deg automotive camber; the
//       mirror case for the left wheel in a right-hander; straight-line (dirY ~ 0) wants 0.
// * Thermal: 2 nodes (tread surface, carcass). Heat: 50% of slip power |Fx Vsx| + |Fy Vsy|
//   (75% of it to the surface), rolling hysteresis (crr Fz |omega R|) to the carcass,
//   surface<->carcass conduction, speed-dependent convection. Grip factor is a smooth window
//   around tOpt (effective temp = 0.4 surface + 0.6 carcass), half-width tWindow, depth
//   tempDrop (deeper for narrow-window compounds, ~30% for slicks).
// * Wear: d(wear)/dt = wearK * slip power * (1 + overheat); grip *= 1 - 0.12 w - 0.18 w^2.
// * Surfaces: asphalt 1.0, kerb 0.9, grass grassMult, gravel 0.95*grassMult; loose surfaces
//   soften K (peak slip grows) and add rolling drag (returned via rollResTorque).
// * Self-aligning moment: Mz = -t*Fy, pneumatic trail t = trail0 sqrt(Fz/Fz0)(1-rho)/(1+rho^2).
//
// Sign conventions of outputs
//   Fx forward, Fy left (wheel frame). slipRatio = kappa' = (omega R - vx)/|vx| (transient),
//   positive when driving. slipAngle = atan(u') with u' ~ vy/|vx|: POSITIVE when the contact
//   patch slides LEFT, which produces NEGATIVE Fy (Fy opposes lateral slip).
//   rollResTorque is a signed torque ABOUT THE WHEEL AXLE in the omega sense, to be ADDED to
//   the wheel's torque balance (it always opposes omega: negative when rolling forward).
//   It ramps linearly to zero for |omega R| < 0.3 m/s so it never chatters at standstill.
//   Mz is about the wheel's vertical axis (+z, counter-clockwise seen from above).
//
// Hot path (tyreForces) does not allocate.

import { COMPOUNDS } from './catalog.js';
import { DT, G, SURFACE } from './constants.js';

const DEG = Math.PI / 180;

function clamp(x, lo, hi) { return x < lo ? lo : x > hi ? hi : x; }

/** Solve for B such that the MF curve sin(C atan(Bx - E(Bx - atan Bx))) peaks at x = 1. */
function peakB(C, E) {
  const target = Math.tan(Math.PI / (2 * C));
  let lo = 0, hi = 200;
  for (let i = 0; i < 100; i++) {
    const m = 0.5 * (lo + hi);
    const f = m - E * (m - Math.atan(m));
    if (f < target) lo = m; else hi = m;
  }
  return 0.5 * (lo + hi);
}

/**
 * Build tyre parameters for one wheel/axle.
 * @param {string} compoundKey key of COMPOUNDS (falls back to 'street')
 * @param {number} widthMm section width in mm (225 = reference)
 * @param {number} radius loaded/unloaded rolling radius in m
 * @param {number} nominalLoad nominal (static) wheel load Fz0 in N
 * @returns {object} tyreParams (pure data)
 */
export function makeTyreParams(compoundKey, widthMm, radius, nominalLoad) {
  const compound = COMPOUNDS[compoundKey] ? compoundKey : 'street';
  const c = COMPOUNDS[compound];
  const widthMmC = clamp(Number.isFinite(widthMm) ? widthMm : 225, 125, 405);
  const R = clamp(Number.isFinite(radius) && radius > 0 ? radius : 0.31, 0.2, 0.6);
  const Fz0 = clamp(Number.isFinite(nominalLoad) && nominalLoad > 0 ? nominalLoad : 3500, 300, 20000);
  const wf = widthMmC / 225, rf = R / 0.31;
  const perf = clamp((c.mu - 0.85) / (1.42 - 0.85), 0, 1); // 0 = eco/rally, 1 = slick
  const wM = widthMmC / 1000;

  // MF shape
  const Cy = Math.max(1.05, c.shapeC), Ey = Math.min(0.9, c.shapeE);
  const Cx = Math.min(1.9, Cy + 0.1), Ex = Ey;
  const By = peakB(Cy, Ey), Bx = peakB(Cx, Ex);

  // Friction / stiffness with width effects
  const mu = c.mu * Math.pow(wf, 0.06);
  const loadSens = c.loadSens * Math.pow(wf, -0.3);
  const stiff = (1.2 * c.stiff + 5) * Math.pow(wf, 0.25);       // Ky/Fz0 per rad at Fz0
  const stiffLong = (1.3 * c.stiff + 4) * Math.pow(wf, 0.15);   // Kx/Fz per unit slip ratio
  const kyC2 = 2.0;
  const kyNorm = Math.sin(2 * Math.atan(1 / kyC2));

  // Relaxation lengths at Fz0 and the equivalent carcass stiffnesses
  const lf = Math.pow(Fz0 / 4000, 0.3);
  const relaxLong = clamp(0.14 * Math.sqrt(rf) * lf, 0.06, 0.4);
  const relaxLat = clamp(0.32 * Math.sqrt(rf) * lf * Math.pow(25 / stiff, 0.3), 0.1, 0.5);
  const kcx = stiffLong * Fz0 / relaxLong;   // N/m longitudinal contact spring
  const kcy = stiff * Fz0 / relaxLat;        // N/m lateral contact spring

  // Mass & inertia (tyre + rim)
  const tyreMass = 8.5 * wf * Math.pow(rf, 1.5) * (1 - 0.1 * perf);
  const rimMass = 9.0 * rf * rf * Math.sqrt(wf);
  const mass = tyreMass + rimMass;
  const inertia = tyreMass * (0.86 * R) ** 2 + rimMass * (0.6 * R) ** 2;

  // Vertical
  const vertStiff = 230e3 * Math.pow(wf, 0.4) * (1 + 0.15 * perf) * Math.pow(Fz0 / 3500, 0.2);
  const vertDamp = 250 * Math.sqrt(wf);

  // Camber
  const camberOpt = -(0.3 + 2.4 * perf) * DEG;  // automotive sense (negative = top toward corner)
  const camberMuSens = 8 + 14 * perf;           // per rad^2
  const camberStiff = 1.0 - 0.4 * perf;         // Fy per (Fz * rad)

  // Thermal
  const treadArea = 2 * Math.PI * R * wM;
  const sideArea = 2 * Math.PI * R * R * (1 - 0.6 * 0.6);
  const capSurface = 1700 * 1150 * treadArea * 0.003;  // J/K (3 mm tread skin)
  const capCarcass = 1700 * 0.45 * tyreMass;           // J/K (effective)
  const tWindow = c.tWindow;
  const tempDrop = clamp(6 / tWindow, 0.08, 0.32);

  const gm = c.grass;
  return {
    compound, label: c.label,
    // ---- contract fields ----
    mu, loadSens, Fz0, stiff, shapeC: Cy, shapeE: Ey,
    relaxLong, relaxLat,
    crr: c.crr * Math.pow(wf, 0.25),
    tOpt: c.tOpt, tWindow,
    wearRate: c.wear,
    grassMult: gm,
    width: wM, widthMm: widthMmC, radius: R, inertia,
    vertStiff, vertDamp, camberStiff, camberOpt, mass,
    // ---- model internals ----
    stiffLong, muLongRatio: 1.04,
    Bx, Cx, Ex, By, Cy, Ey, BCx: Bx * Cx, BCy: By * Cy,
    kyC2, kyCoef: stiff * Fz0 / kyNorm, kyNorm,
    kcx, kcy,
    camberMuSens,
    dampLongCoef: 2 * 1.0 * Math.sqrt(kcx / G),   // * sqrt(Fz) -> N s/m (zeta 1 vs Fz/g)
    dampLatCoef: 2 * 0.8 * Math.sqrt(kcy / G),
    dampWheelMax: 0.8 * inertia / (R * R * DT),   // explicit free-wheel stability cap
    vDamp: 3.0,                                    // m/s low-speed damping fade
    vFloor: 0.1,                                   // m/s floor for steady-state slip estimate
    rhoStatic: 0.5,                                // max normalised slip stored when not sliding
    crrSpeed: 1.6e-4,                              // crr *= 1 + crrSpeed v^2
    trail0: 0.032 * Math.sqrt(rf),
    // surfaces indexed by SURFACE id: asphalt, kerb, grass, gravel
    surfMu: [1.0, 0.9, gm, 0.95 * gm],
    surfK: [1.0, 0.92, Math.pow(gm, 1.5), Math.pow(0.95 * gm, 1.5)],
    surfCrr: [0, 0.004, 0.035, 0.10],
    // thermal
    capSurface, capCarcass,
    hCond: 160 * wf,
    hS0: 10 * treadArea, hS1: 5.5 * treadArea,   // W/K, convection = h0 + h1 v^0.75
    hC0: 4 * sideArea, hC1: 2.5 * sideArea,
    heatSlipFrac: 0.5, heatSurfShare: 0.75,
    tempDrop,
    wearK: c.wear / (30e6 * wf),                  // per J of slip energy
  };
}

/**
 * Create the per-wheel tyre state.
 * @param {object} tp tyreParams
 * @param {number|object} [opts] initial temperature in deg C, or
 *   { tempC, tempSurface, tempCarcass, ambientC, wear }
 */
export function createTyreState(tp, opts) {
  const ts = {
    kappa: 0, alpha: 0,             // transient slip states (alpha = tan of transient slip angle)
    tempSurface: 20, tempCarcass: 20, temp: 20, ambientT: 20,
    wear: 0, slipEnergy: 0,
    gripTemp: 1, gripWear: 1, muEff: tp.mu, Fz: 0, usage: 0,
    still: 0, omegaPrev: 0,
  };
  resetTyreState(ts, tp, opts);
  return ts;
}

/** Reset an existing tyre state in place (same options as createTyreState). */
export function resetTyreState(ts, tp, opts) {
  let amb = 20, tS, tC, wear = 0;
  if (typeof opts === 'number' && Number.isFinite(opts)) { tS = tC = opts; }
  else if (opts && typeof opts === 'object') {
    if (Number.isFinite(opts.ambientC)) amb = opts.ambientC;
    if (Number.isFinite(opts.tempC)) tS = tC = opts.tempC;
    if (Number.isFinite(opts.tempSurface)) tS = opts.tempSurface;
    if (Number.isFinite(opts.tempCarcass)) tC = opts.tempCarcass;
    if (Number.isFinite(opts.wear)) wear = clamp(opts.wear, 0, 1);
  }
  ts.ambientT = amb;
  ts.tempSurface = tS === undefined ? amb : tS;
  ts.tempCarcass = tC === undefined ? amb : tC;
  ts.kappa = 0; ts.alpha = 0; ts.wear = wear; ts.slipEnergy = 0;
  ts.still = 0; ts.omegaPrev = 0; ts.Fz = 0; ts.usage = 0;
  updateGrip(ts, tp);
  return ts;
}

function updateGrip(ts, tp) {
  const te = 0.4 * ts.tempSurface + 0.6 * ts.tempCarcass;
  ts.temp = te;
  const d = (te - tp.tOpt) / tp.tWindow;
  ts.gripTemp = 1 - tp.tempDrop * (1 - Math.exp(-0.6931471805599453 * d * d));
  const w = ts.wear;
  ts.gripWear = 1 - 0.12 * w - 0.18 * w * w;
}

function thermalStep(ts, tp, pSlip, pRoll, speed, dt) {
  const Ta = ts.ambientT, Ts = ts.tempSurface, Tc = ts.tempCarcass;
  const v75 = Math.sqrt(speed * Math.sqrt(speed));
  const qIn = tp.heatSlipFrac * pSlip;
  const qCond = tp.hCond * (Ts - Tc);
  const dTs = (tp.heatSurfShare * qIn - qCond - (tp.hS0 + tp.hS1 * v75) * (Ts - Ta)) / tp.capSurface;
  const dTc = ((1 - tp.heatSurfShare) * qIn + pRoll + qCond - (tp.hC0 + tp.hC1 * v75) * (Tc - Ta)) / tp.capCarcass;
  ts.tempSurface = Ts + dt * dTs;
  ts.tempCarcass = Tc + dt * dTc;
  if (pSlip > 0) {
    const over = Ts - (tp.tOpt + tp.tWindow);
    const e = pSlip * dt;
    ts.slipEnergy += e;
    let w = ts.wear + tp.wearK * e * (over > 0 ? 1 + over / 30 : 1);
    ts.wear = w > 1 ? 1 : w;
  }
  updateGrip(ts, tp);
}

// Module scratch (no per-call allocation).
const SC = { Dx: 0, Dy: 0, kpk: 0, apk: 0, Ky: 0, kyl: 0, fx: 0, fy: 0, rho: 0, mu: 0 };

/** Peak forces / peak slips without the camber factor. Fills SC. */
function peaks(tp, Fz, surf, grip) {
  const fzr = Fz / tp.Fz0;
  const muR = clamp(1 - tp.loadSens * (fzr - 1), 0.5, 1.3);
  const sK = tp.surfK[surf];
  const mu = tp.mu * muR * tp.surfMu[surf] * grip;
  const kyl = Math.sin(2 * Math.atan(fzr / tp.kyC2)) / tp.kyNorm;
  const Ky = tp.stiff * tp.Fz0 * kyl * sK;
  const Kx = tp.stiffLong * Fz * sK;
  SC.mu = mu;
  SC.Dx = mu * tp.muLongRatio * Fz;
  SC.Dy = mu * Fz;
  SC.kpk = SC.Dx * tp.BCx / Kx;
  SC.apk = SC.Dy * tp.BCy / Ky;
  SC.Ky = Ky; SC.kyl = kyl;
}

/** Combined-slip MF forces from slip states (uses SC from peaks()). Fills SC.fx/fy/rho. */
function mfForces(tp, kap, u, camber) {
  let kn = kap / SC.kpk, an = u / SC.apk;
  const r0 = Math.sqrt(kn * kn + an * an);
  // camber mu factor with optimum relative to lateral force direction
  const dirY = -an / (r0 + 0.05);
  const dg = camber + tp.camberOpt * dirY;
  let fg = 1 - tp.camberMuSens * dg * dg;
  if (fg < 0.6) fg = 0.6;
  const Dx = SC.Dx * fg, Dy = SC.Dy * fg;
  SC.Dx = Dx; SC.Dy = Dy; SC.kpk *= fg; SC.apk *= fg; SC.mu *= fg;
  const ifg = 1 / fg;
  kn *= ifg; an *= ifg;
  const rho = r0 * ifg;
  if (rho > 1e-9) {
    const bx = tp.Bx * rho, by = tp.By * rho, ir = 1 / rho;
    const mx = Math.sin(tp.Cx * Math.atan(bx - tp.Ex * (bx - Math.atan(bx))));
    const my = Math.sin(tp.Cy * Math.atan(by - tp.Ey * (by - Math.atan(by))));
    SC.fx = Dx * mx * kn * ir;
    SC.fy = -Dy * my * an * ir;
  } else {
    SC.fx = Dx * tp.BCx * kn;
    SC.fy = -Dy * tp.BCy * an;
  }
  SC.rho = rho;
}

/**
 * Tyre forces + state update (relaxation, thermal, wear). Advances the state by dt.
 * @param {object} ts tyre state (createTyreState)
 * @param {object} tp tyre params (makeTyreParams)
 * @param {{Fz:number,vx:number,vy:number,omega:number,camber:number,surface:number}} input
 * @param {number} dt s
 * @param {object} out filled: { Fx, Fy, Mz, slipRatio, slipAngle, usage, sliding, rollResTorque }
 * @returns {object} out
 */
export function tyreForces(ts, tp, input, dt, out) {
  if (!(dt > 0)) dt = DT;
  const Fz = +input.Fz || 0;
  const vx = +input.vx || 0, vy = +input.vy || 0, omega = +input.omega || 0;
  let camber = +input.camber || 0;
  if (camber > 0.35) camber = 0.35; else if (camber < -0.35) camber = -0.35;
  let surf = input.surface | 0;
  if (surf < 0 || surf > 3) surf = SURFACE.ASPHALT;
  const R = tp.radius;
  const avx = vx < 0 ? -vx : vx;
  const Vsx = vx - omega * R;

  // wheel held stationary (e.g. brake-locked) for >= 2 steps -> full low-speed damping allowed
  const aom = omega < 0 ? -omega : omega, dom = omega - ts.omegaPrev;
  if (aom < 1e-3 && dom < 1e-5 && dom > -1e-5) { if (ts.still < 3) ts.still++; } else ts.still = 0;
  ts.omegaPrev = omega;

  if (!(Fz > 1)) {
    // airborne: no forces, slip states relax toward zero, tyre cools
    const dec = 1 / (1 + dt / 0.03);
    ts.kappa *= dec; ts.alpha *= dec;
    thermalStep(ts, tp, 0, 0, avx, dt);
    ts.Fz = 0; ts.usage = 0;
    out.Fx = 0; out.Fy = 0; out.Mz = 0;
    out.slipRatio = ts.kappa; out.slipAngle = Math.atan(ts.alpha);
    out.usage = 0; out.sliding = false; out.rollResTorque = 0;
    return out;
  }

  peaks(tp, Fz, surf, ts.gripTemp * ts.gripWear);
  const kpk = SC.kpk, apk = SC.apk, kyl = SC.kyl;
  const fzr = Fz / tp.Fz0;
  const ug = tp.camberStiff * Fz * camber / SC.Ky;   // camber thrust as lateral slip shift

  // ---- transient slip: implicit first-order relaxation ----
  const sx = tp.relaxLong * clamp(fzr, 0.3, 2.5);
  const sy = tp.relaxLat * clamp(kyl, 0.3, 2);
  const ax = dt / sx, ay = dt / sy;
  const vyEff = vy - avx * ug;
  let kap = (ts.kappa - ax * Vsx) / (1 + ax * avx);
  let u = (ts.alpha + ay * vyEff) / (1 + ay * avx);
  // limit stored deflection: at most rhoStatic (static friction ~0.9 peak) or the current
  // steady-state slip, so a tyre that slid to a stop only stores a small, realistic deflection
  const vden = avx > tp.vFloor ? avx : tp.vFloor;
  const kssn = Vsx / (vden * kpk), ussn = vyEff / (vden * apk);
  const rss = Math.sqrt(kssn * kssn + ussn * ussn);
  const kn0 = kap / kpk, an0 = u / apk;
  const rs = Math.sqrt(kn0 * kn0 + an0 * an0);
  const rst = tp.rhoStatic;
  const cap = rss > rst ? (rss < 60 ? rss : 60) : rst;
  if (rs > cap) { const s = cap / rs; kap *= s; u *= s; }
  ts.kappa = kap; ts.alpha = u;

  // ---- steady MF combined-slip forces ----
  mfForces(tp, kap, u, camber);
  let fx = SC.fx, fy = SC.fy;
  const rho = SC.rho, Dx = SC.Dx, Dy = SC.Dy;

  // self-aligning moment from pneumatic trail (before damping terms)
  const trail = tp.trail0 * Math.sqrt(fzr) * (1 - rho) / (1 + rho * rho);
  const Mz = -trail * fy;

  // ---- low-speed damping of the contact spring ----
  const fv = avx / tp.vDamp, fr = rho * (1 / 1.5), fr2 = fr * fr;
  const wd = 1 / ((1 + fv * fv) * (1 + fr2 * fr2));
  if (wd > 1e-5) {
    const sq = Math.sqrt(Fz);
    let cdx = tp.dampLongCoef * sq;
    if (ts.still < 2 && cdx > tp.dampWheelMax) cdx = tp.dampWheelMax;
    fx -= cdx * Vsx * wd;
    fy -= tp.dampLatCoef * sq * vy * wd;
  }
  // friction-ellipse limit
  const ex = fx / Dx, ey = fy / Dy, e2 = ex * ex + ey * ey;
  if (e2 > 1) { const s = 1 / Math.sqrt(e2); fx *= s; fy *= s; }

  // ---- rolling resistance ----
  const crrBase = tp.crr * (1 + tp.crrSpeed * vx * vx);
  const crrV = crrBase + tp.surfCrr[surf];
  const wR = omega * R;
  let sg = wR * (1 / 0.3);
  if (sg > 1) sg = 1; else if (sg < -1) sg = -1;
  const rrT = -crrV * Fz * R * sg;

  // ---- thermal & wear ----
  const pSlip = (fx * Vsx < 0 ? -fx * Vsx : fx * Vsx) + (fy * vy < 0 ? -fy * vy : fy * vy);
  const pRoll = crrBase * Fz * (wR < 0 ? -wR : wR);
  thermalStep(ts, tp, pSlip, pRoll, avx, dt);

  ts.Fz = Fz; ts.usage = rho; ts.muEff = SC.mu;
  out.Fx = fx; out.Fy = fy; out.Mz = Mz;
  out.slipRatio = kap; out.slipAngle = Math.atan(u);
  out.usage = rho; out.sliding = rho > 1;
  out.rollResTorque = rrT;
  return out;
}

/**
 * Steady-state (no relaxation, no damping, no state change) forces, e.g. for curves/UI.
 * Grip as at optimum temperature with no wear unless `gripMult` is given.
 * @param {object} tp
 * @param {number} Fz N
 * @param {number} kappa slip ratio
 * @param {number} alpha slip angle rad (positive = sliding left -> Fy < 0)
 * @param {number} camber rad (contract convention)
 * @param {number} surface SURFACE id
 * @param {object} out { Fx, Fy, Mz, usage, mu }
 * @param {number} [gripMult=1]
 */
export function tyreSteadyForces(tp, Fz, kappa, alpha, camber, surface, out, gripMult = 1) {
  if (!(Fz > 1)) { out.Fx = 0; out.Fy = 0; out.Mz = 0; out.usage = 0; out.mu = 0; return out; }
  const surf = (surface | 0) >= 0 && (surface | 0) <= 3 ? surface | 0 : 0;
  peaks(tp, Fz, surf, gripMult);
  const u = Math.tan(clamp(alpha, -1.5, 1.5)) - tp.camberStiff * Fz * camber / SC.Ky;
  mfForces(tp, kappa, u, camber);
  const rho = SC.rho;
  const trail = tp.trail0 * Math.sqrt(Fz / tp.Fz0) * (1 - rho) / (1 + rho * rho);
  out.Fx = SC.fx; out.Fy = SC.fy; out.Mz = -trail * SC.fy; out.usage = rho; out.mu = SC.mu;
  return out;
}
