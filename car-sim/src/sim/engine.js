// Combustion engine and EV motor model (contract §3, owner A: powertrain).
//
// Torque is derived from airflow, not from a drawn curve:
//
//   air per crank rev  = VE(rpm) * rho_charge * Vd_eff / 2            (4-stroke; rotary: Vd_eff = 2 x disp)
//   indicated work/rev = air * (LHV / AFR) * f(lambda) * eta_i(CR) * timing * (1 - knock loss)
//   brake torque       = indicated - (FMEP + PMEP) * Vd_eff / (4 pi) - supercharger drive torque
//
// with rho_charge = p_manifold / (R T_charge). Manifold pressure follows a drive-by-wire throttle
// between the closed-throttle leakage flow and the wide-open-throttle orifice limit (compressible
// orifice vs. engine pumping, solved analytically), lagged by the manifold filling time constant.
// Turbo boost is a first-order system whose target rises with the engine's own mass flow
// (positive feedback = spool "hit"); superchargers are crank-driven with a parasitic drive torque
// equal to the isentropic compressor work / efficiency. Charge temperature comes from compressor
// efficiency, intercooler effectiveness and fuel evaporation; the knock index (pressure,
// temperature, compression ratio, spark advance) vs. the fuel's knockLimit drives timing retard.
//
// All calibration constants live in MODEL and are shared by every engine (no per-engine fudge).
// The hot path (engineUpdate) allocates nothing.

import { P_AMB, T_AMB, R_AIR, GAMMA_AIR, CP_AIR } from './constants.js';
import {
  NITROUS, LAYOUTS, FUELS, INDUCTION, INTERCOOLERS, FUEL_SYSTEMS, CAMS, INTAKES, EXHAUSTS, INTERNALS,
  FLYWHEELS, ECU_TUNES, EV_MOTORS, EV_BATTERIES,
} from './catalog.js';

const TWO_PI = 2 * Math.PI;
const FOUR_PI = 4 * Math.PI;
const RAD2RPM = 60 / TWO_PI;
const KAPPA = (GAMMA_AIR - 1) / GAMMA_AIR;       // isentropic exponent (gamma-1)/gamma
const PR_CRIT = 0.528;                            // critical pressure ratio of a compressible orifice
const PR_SUB = 1 - PR_CRIT;

/** Shared physical calibration of the model (validated in scripts/test-engine.js). */
export const MODEL = {
  // Mean piston speed limits at the stock redline (m/s). Valvetrain/ECU options add rpm on top.
  pistonSpeedPetrol: 21.0,
  pistonSpeedDiesel: 14.0,
  valvetrainRpm: 7600,          // stock valvetrain (spring/follower) limit; cams/ECU add rpm on top
  rotaryRedline: 9000,          // eccentric-shaft rpm (stock ports/ECU)
  rotaryEqPistonSpeed: 15.0,    // friction-equivalent "piston speed" at the rotary redline (m/s)
  dieselBoreStroke: 0.90,       // diesels are undersquare
  // Volumetric efficiency
  veBase: 0.95,                 // stock NA peak VE (stock cams, airbox, exhaust)
  veTurboPenalty: 0.98,         // turbine in the exhaust path (residual gas) at low flow
  veLowK: 0.70,                 // VE loss coefficient below the cam's tuned speed (per normalised d^2)
  veHighK: 0.75,                // above it (modern cam phasing keeps VE broad)
  veFloor: 0.45,
  // Indicated thermal efficiency, scaled with the Otto efficiency of the compression ratio.
  etaPetrol: 0.415, crPetrolRef: 11.0,
  etaDiesel: 0.45, crDieselRef: 16.5,
  etaRotaryMult: 0.80,          // long thin combustion chamber: heat loss + crevice HC
  gammaCycle: 1.30,             // effective ratio of specific heats for the CR scaling
  richGain: 0.35,               // indicated work gain per unit (1 - lambda) for rich mixtures
  // Compression ratios chosen by the build (knock-limited design practice)
  cr: { na: 12.0, super: 10.0, turbo: 9.5, diesel: 16.5, rotaryNa: 10.0, rotaryBoost: 9.0 },
  // Friction mean effective pressure (Chen-Flynn form), bar: c0 + c1*Pmax + c2*Up + c3*Up^2
  fmep: [0.55, 0.004, 0.030, 0.0009],
  pmaxPerBarPetrol: 55,         // peak cylinder pressure per bar of MAP (firing)
  pmaxPerBarDiesel: 80,
  pmaxMotoring: 22,             // not firing (compression only)
  exhaustBackPressure: 0.05,    // bar above ambient seen by the pistons at WOT (NA)
  // Throttle / manifold
  throttleCapacity: 4.0,        // WOT throttle flow capacity / engine demand at redline
  itbCapacity: 9.0,
  leakPrAtIdle: 0.12,           // closed-throttle leakage gives this manifold pressure ratio at idle rpm
  manifoldVolPerVd: 1.3,        // plenum + runners, multiple of displacement (ITB: 0.35)
  // Knock: KI = (MAP/pRef)^a * (Tcharge/TRef)^b * (CR/10)^c * timing^d * retardFactor
  knock: { pRef: 2.05, a: 0.75, TRef: 330, b: 3.0, c: 1.3, d: 8, retardRange: 0.40, lossPerRetard: 0.25 },
  // Turbo
  turboChokeStart: 0.85,        // fraction of flowMax where the compressor starts to choke
  turbineBackPressure: 1.0,     // exhaust-manifold over-pressure / MAP at flowMax (turbine restriction, grows with flow^2)
  turbineResidualVE: 0.12,      // VE lost at flowMax from hot residual gas trapped by turbine back-pressure
  turboPreSpool: 0.12,          // capability fraction at flowStart from the quadratic pre-spool region
  turboSpinDown: 1.6,           // spin-down tau multiple (BOV vents, wheel freewheels)
  scTau: 0.08,                  // belt-driven supercharger response (s)
  scBeltEff: 0.95,
  // Idle / limiter
  idleKp: 1.2, idleKi: 2.5, idleMax: 0.35,
  limiterHyst: 180,             // rpm
  limiterAbove: 150,            // limiter rpm above redline
  alsMinFrac: 0.40,             // anti-lag arms above this fraction of redline
  alsTorqueEff: 0.12,           // fraction of normal torque produced with ALS ignition retard
  alsFuelFrac: 0.35,            // extra fuel (fraction of the fuel-system capacity) burnt in the manifold
  alsDamageRate: 0.0015,        // per second (turbine + exhaust valve heat)
  // Nitrous oxide (N2O: 36.4 % O2 by mass vs 23.2 % in air)
  n2oOxygenRatio: 0.364 / 0.232,  // kg of air-equivalent oxygen per kg N2O
  n2oDecompHeat: 1.86e6,         // J/kg released by N2O -> N2 + 1/2 O2 in the flame
  n2oCoolingLatent: 1.5e5,       // J/kg effective evaporative cooling of the charge (liquid flash, ~half reaches the charge)
  n2oCp: 880,                    // J/(kg K) N2O vapour
  n2oMolar: 0.044, airMolar: 0.02896,
  n2oPressureGain: 3.0,          // peak-pressure equivalence per kg N2O vs per kg air: 2.2x energy x ~1.35 faster burn
  n2oKnockCoolingFrac: 0.3,      // share of the N2O charge cooling that survives to the end gas (faster burn heats it)
  n2oLeanDamage: 3.0,            // damage per s per unit fuel shortfall while spraying (lean burn on the shot)
  n2oArmThrottle: 0.9,
  // EV
  evEfficiency: 0.92,
  evRegenTorqueFrac: 0.7,
  evRegenPowerFrac: 0.6,
};

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

/** Otto-cycle efficiency for compression ratio cr. */
function ottoEff(cr) { return 1 - Math.pow(cr, 1 - MODEL.gammaCycle); }

/**
 * Steady manifold/upstream pressure ratio for a throttle whose flow capacity at pr=1 is `s` times the
 * engine's pumping demand at pr=1. Orifice flow: choked below PR_CRIT, elliptic subsonic branch above.
 * Solves s * psi(pr) = pr analytically.
 */
function prFromCapacity(s) {
  if (s <= PR_CRIT) return s;
  const w2 = PR_SUB * PR_SUB;
  const s2 = s * s;
  const A = 1 + s2 / w2;
  const B = -2 * s2 * PR_CRIT / w2;
  const C = s2 * (PR_CRIT * PR_CRIT / w2 - 1);
  const disc = B * B - 4 * A * C;
  const pr = (-B + Math.sqrt(disc > 0 ? disc : 0)) / (2 * A);
  return pr > 1 ? 1 : pr;
}

/** Volumetric efficiency vs normalised engine speed x = rpm / redline. */
function veAt(ep, x) {
  const d = (x - ep.vePeak) / ep.veWidth;
  const k = d < 0 ? MODEL.veLowK : MODEL.veHighK;
  const f = 1 - k * d * d;
  return ep.veMax * (f > MODEL.veFloor ? f : MODEL.veFloor);
}

// ---------------------------------------------------------------------------------------------
// Parameter construction (called by build.js)
// ---------------------------------------------------------------------------------------------

/**
 * Turn an ICE engine spec (ARCHITECTURE §1 `engine` block, already normalised) into engineParams.
 * @param {object} e engine spec
 * @param {number} [fuelKg] initial fuel mass carried
 * @returns {object} ep
 */
export function makeEngineParams(e, fuelKg = 40) {
  const L = LAYOUTS[e.layout] || LAYOUTS.I4;
  const fuel = FUELS[e.fuel] || FUELS.petrol95;
  const ind = INDUCTION[e.induction] || INDUCTION.na;
  const ic = INTERCOOLERS[e.intercooler] || INTERCOOLERS.none;
  const fs = FUEL_SYSTEMS[e.fuelSystem] || FUEL_SYSTEMS.stock;
  const cam = CAMS[e.cams] || CAMS.stock;
  const intake = INTAKES[e.intake] || INTAKES.stock;
  const exh = EXHAUSTS[e.exhaust] || EXHAUSTS.stock;
  const inr = INTERNALS[e.internals] || INTERNALS.stock;
  const fw = FLYWHEELS[e.flywheel] || FLYWHEELS.stock;
  const ecu = ECU_TUNES[e.ecu] || ECU_TUNES.stock;
  const rotary = !!L.rotary;
  const diesel = !!fuel.diesel;
  const kind = ind.kind;
  const disp = clamp(e.displacement || L.disp[0], L.disp[0], L.disp[1]);
  const dispM3 = disp * 1e-3;

  // --- Geometry and rev limit -------------------------------------------------------------
  let bore = 0, stroke = 0, redline, strokeEq, vdEff;
  if (rotary) {
    vdEff = 2 * dispM3; // each rotor face fires once per shaft rev per rotor -> 2x displacement as a 4-stroke
    redline = MODEL.rotaryRedline + cam.redlineAdd + ecu.redlineAdd;
    // equivalent stroke so that Up = rotaryEqPistonSpeed at the stock redline (used by FMEP only)
    strokeEq = MODEL.rotaryEqPistonSpeed * 30 / MODEL.rotaryRedline;
  } else {
    vdEff = dispM3;
    const bs = diesel ? MODEL.dieselBoreStroke : (L.boreStroke || 1.0);
    const vc = dispM3 / L.cyl;
    bore = Math.cbrt(4 * vc * bs / Math.PI);
    stroke = bore / bs;
    const up = diesel ? MODEL.pistonSpeedDiesel : MODEL.pistonSpeedPetrol;
    // whichever is lower: mean-piston-speed limit or the valvetrain limit (small engines)
    redline = Math.min(up * 30 / stroke, diesel ? 1e9 : MODEL.valvetrainRpm) + (diesel ? 0.25 : 1) * (cam.redlineAdd + ecu.redlineAdd);
    strokeEq = stroke;
  }
  redline = Math.round(redline / 50) * 50;
  const idleRpm = diesel ? 780 : rotary ? 900 : Math.round(800 + 400 * cam.idleRough);

  // --- Breathing ------------------------------------------------------------------------------
  const itb = e.intake === 'itb' && kind === 'na';
  const veMax = MODEL.veBase * (cam.veGain || 1) * (itb || e.intake !== 'itb' ? intake.ve : 1) * exh.ve
    * (kind === 'turbo' ? MODEL.veTurboPenalty : 1);
  const vePeak = clamp((diesel ? 0.55 : cam.vePeak) + (L.vePeakAdd || 0), 0.3, 0.95);
  const veWidth = cam.veWidth * (L.veWidthMult || 1);

  // --- Combustion -------------------------------------------------------------------------------
  let cr;
  if (diesel) cr = MODEL.cr.diesel;
  else if (rotary) cr = kind === 'na' ? MODEL.cr.rotaryNa : MODEL.cr.rotaryBoost;
  else cr = MODEL.cr[kind] || MODEL.cr.na;
  let etaI = diesel
    ? MODEL.etaDiesel * ottoEff(cr) / ottoEff(MODEL.crDieselRef)
    : MODEL.etaPetrol * ottoEff(cr) / ottoEff(MODEL.crPetrolRef);
  if (rotary) etaI *= MODEL.etaRotaryMult;

  // --- Induction --------------------------------------------------------------------------------
  const boostReq = e.boost == null ? ind.maxBoost : e.boost;
  const boostTarget = kind === 'na' ? 0 : clamp(Math.min(boostReq * ecu.boostTrim, ind.maxBoost), 0, ind.maxBoost);
  const thrCap = itb ? MODEL.itbCapacity : MODEL.throttleCapacity;

  // Rotating inertia: crank/rods/pistons (or rotors + e-shaft) scale with displacement, plus flywheel/clutch.
  const inertia = (rotary ? 0.03 : 0.02 + 0.028 * disp) + fw.inertia;

  const ep = {
    isEV: false,
    induction: kind,
    inductionKey: e.induction,
    layout: e.layout,
    cylinders: L.cyl,
    rotary,
    diesel,
    displacement: disp,
    bore, stroke, compression: cr,
    vdEff,
    idleRpm,
    redlineRpm: redline,
    limiterRpm: redline + MODEL.limiterAbove,
    limiterHyst: MODEL.limiterHyst,
    maxRpm: redline + inr.overRev + 1500,
    overRev: inr.overRev,
    maxPressure: inr.maxPressure * (diesel ? 1.25 : 1),   // diesel blocks/heads are built for ~2x the peak cylinder pressure
    inertia,
    loudness: clamp(exh.loudness * (kind === 'turbo' ? 0.8 : 1) * (0.7 + 0.1 * Math.sqrt(L.cyl * disp)), 0.1, 1.5),
    // breathing
    veMax, vePeak, veWidth,
    intakeHeat: intake.heatK == null ? 12 : intake.heatK,
    sWotK: thrCap * redline,                    // s_wot = sWotK / rpm
    sLeakK: MODEL.leakPrAtIdle * idleRpm,      // s_leak = sLeakK / rpm
    manifoldVol: (itb ? 0.35 : MODEL.manifoldVolPerVd) * vdEff,
    strokeEq,
    pmaxPerBar: diesel ? MODEL.pmaxPerBarDiesel : MODEL.pmaxPerBarPetrol,
    // combustion
    etaI,
    timing: ecu.timing,
    lhv: fuel.lhv, afr: fuel.afr, lambdaFull: fuel.lambdaFull,
    knockLimit: fuel.knockLimit, fuelCooling: fuel.coolingK || 0,
    fuelDensity: fuel.density,
    fuelCap: fs.flow * 1e-3,                    // kg/s
    fuelKg,
    // induction
    boostTarget,
    turboMaxBoost: ind.maxBoost,
    boostTaper: ecu.boostTaper || 0,
    flowStart: ind.flowStart || 0, flowFull: ind.flowFull || 1, flowMax: ind.flowMax || 1,
    turboTau: ind.tau || 0.5,
    scCurve: ind.curve || null,
    compEff: ind.compEff || 0.7,
    icEff: kind === 'na' ? 0 : ic.effectiveness,
    antiLag: !!e.antiLag && kind === 'turbo',
    // nitrous (wet kit: the kit's solenoid adds matching fuel through the same fuel system)
    nitrousKey: NITROUS[e.nitrous] ? e.nitrous : 'none',
    nitrousFlow: (NITROUS[e.nitrous] || NITROUS.none).flow * 1e-3,       // kg/s N2O at full bottle pressure
    nitrousCapacity: (NITROUS[e.nitrous] || NITROUS.none).bottleKg,
    nitrousArmRpm: Math.min((NITROUS[e.nitrous] || NITROUS.none).armRpm || 3000, 0.6 * redline),
  };
  return ep;
}

/**
 * EV motor params. `share` = this motor's share of the battery (energy and power), so that
 * several motors each tracking their own share drain the pack consistently.
 */
export function makeMotorParams(motorKey, batteryKey, share = 1) {
  const m = EV_MOTORS[motorKey] || EV_MOTORS.medium;
  const b = EV_BATTERIES[batteryKey] || EV_BATTERIES.b60;
  return {
    isEV: true,
    induction: 'ev',
    motorKey,
    layout: 'EV',
    cylinders: 0,
    rotary: false,
    diesel: false,
    displacement: 0,
    motorPower: m.power,
    motorTorque: m.torque,
    idleRpm: 0,
    redlineRpm: m.maxRpm,
    limiterRpm: m.maxRpm,
    maxRpm: m.maxRpm,
    baseRpm: m.power / m.torque * RAD2RPM,
    inertia: 0.0006 * m.mass,          // rotor ~ 0.03-0.07 kg m^2
    efficiency: MODEL.evEfficiency,
    batteryKwh: b.kwh * share,
    batteryMaxPower: b.maxPower * share,
    regenTorque: m.torque * MODEL.evRegenTorqueFrac,
    regenPower: Math.min(m.power, b.maxPower * share) * MODEL.evRegenPowerFrac,
    loudness: 0.15,
    fuelKg: 0,
  };
}

// ---------------------------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------------------------

/** @returns {object} engine state es (see ARCHITECTURE §3) */
export function createEngineState(ep) {
  const es = {
    rpm: 0, omega: 0, throttle: 0, torque: 0, powerKW: 0,
    boostBar: 0, chargeTempC: T_AMB - 273.15, knockRetard: 0, knockIndex: 0,
    fuelFlowGs: 0, fuelKg: ep.fuelKg || 0, batteryKwh: 0, soc: 0,
    damage: 0, failed: false, overRev: false, limiter: false, antiLagActive: false,
    // internals
    pMan: P_AMB * 0.35, boost: 0, airFlow: 0, idleI: 0.1, lambda: 1, mapBar: 0.35,
    fuelLimited: false, fuelCut: false, steady: false, batteryShared: null,
    nitrousActive: false, nitrousKg: ep.nitrousCapacity || 0, nitrousCapacityKg: ep.nitrousCapacity || 0,
    nitrousFlowGs: 0, cylPressureRatio: 0,
  };
  if (ep.isEV) {
    es.batteryKwh = ep.batteryKwh;
    es.soc = 1;
    es.pMan = P_AMB;
  }
  return es;
}

/**
 * Optional helper for multi-motor EVs: make several motor states draw from one shared pack.
 * Each state then reports the pack's batteryKwh/soc. (Not needed: by default each motor owns
 * its power-proportional share of the pack, which drains near-identically.)
 */
export function shareBattery(states) {
  let kwh = 0, cap = 0;
  for (const es of states) { kwh += es.batteryKwh; cap += es.batteryKwh / Math.max(es.soc, 1e-6); }
  const pack = { kwh, capacity: cap };
  for (const es of states) es.batteryShared = pack;
  return pack;
}

// ---------------------------------------------------------------------------------------------
// Update (hot path, no allocation)
// ---------------------------------------------------------------------------------------------

/**
 * Advance the engine by dt at crank speed omega and return the net crank torque (Nm).
 * @param {object} es state from createEngineState
 * @param {object} ep params
 * @param {number} throttle 0..1 driver demand
 * @param {number} omega crank (or motor) speed rad/s
 * @param {number} dt s
 * @param {object} [env] { regen, ambientT (K, or C if < 150), ambientP (Pa), nitrous (bool), reverse (bool, EV: drive backwards) }
 */
export function engineUpdate(es, ep, throttle, omega, dt, env) {
  if (ep.isEV) return motorUpdate(es, ep, throttle, omega, dt, env);

  let Tamb = T_AMB, Pamb = P_AMB;
  if (env) {
    if (env.ambientT > 0) Tamb = env.ambientT < 150 ? env.ambientT + 273.15 : env.ambientT;
    if (env.ambientP > 0) Pamb = env.ambientP;
  }
  throttle = throttle > 0 ? (throttle < 1 ? throttle : 1) : 0;
  const w = omega > 0 ? omega : 0;
  const rpm = w * RAD2RPM;
  const rpmF = rpm > 60 ? rpm : 60;
  const x = rpm / ep.redlineRpm;
  es.omega = omega;
  es.rpm = rpm;
  es.throttle = throttle;

  // --- rev limiter (fuel cut with hysteresis) -------------------------------------------------
  if (rpm > ep.limiterRpm) es.limiter = true;
  else if (es.limiter && rpm < ep.limiterRpm - ep.limiterHyst) es.limiter = false;

  // --- idle speed controller (PI on the air/fuel demand floor) ---------------------------------
  const err = (ep.idleRpm - rpm) / ep.idleRpm;
  if (throttle < 0.08 && !es.steady) {
    es.idleI = clamp(es.idleI + MODEL.idleKi * err * dt, 0, MODEL.idleMax);
  }
  const idleCmd = clamp(es.idleI + MODEL.idleKp * err, 0, MODEL.idleMax);
  const pedal = throttle > idleCmd ? throttle : idleCmd;

  // --- anti-lag -----------------------------------------------------------------------------
  const als = ep.antiLag && !es.failed && es.fuelKg > 0 && throttle < 0.25 && x > MODEL.alsMinFrac;
  es.antiLagActive = als;

  // --- boost (pressure upstream of the throttle) -------------------------------------------
  const kind = ep.induction;
  let compEff = ep.compEff;
  let flowFrac = 0;
  if (kind === 'turbo') {
    // Compressor pressure capability rises with engine (exhaust) mass flow between flowStart and
    // flowFull (full capability = the turbo's maxBoost); the wastegate caps it at the target. Using the
    // engine's own flow closes a positive-feedback loop -> the characteristic spool "hit".
    const flow = es.airFlow;
    const fr = flow / ep.flowMax;
    flowFrac = fr;
    const P = MODEL.turboPreSpool;
    let spool;
    if (flow < ep.flowStart) { const q = flow / ep.flowStart; spool = P * q * q; }
    else spool = P + (1 - P) * (flow - ep.flowStart) / (ep.flowFull - ep.flowStart);
    if (spool > 1) spool = 1;
    const choke = clamp(1 - 3 * (fr - MODEL.turboChokeStart), 0.3, 1);
    if (fr > 0.8) compEff *= clamp(1 - 0.6 * (fr - 0.8), 0.5, 1);
    let cap = ep.turboMaxBoost * spool * choke;
    let wg = ep.boostTarget * (1 - ep.boostTaper * clamp((x - 0.7) / 0.3, 0, 1));
    if (als) { if (cap < 0.9 * wg) cap = 0.9 * wg; }
    if (cap > es.boost) {
      // spool up: shaft accelerates towards the capability, time constant shrinks with flow
      const r = ep.flowFull / (flow > 1e-4 ? flow : 1e-4);
      const tau = ep.turboTau * Math.pow(clamp(r, 0.5, 3), 0.8);
      es.boost += (cap - es.boost) * (1 - Math.exp(-dt / tau));
      if (es.boost > wg) es.boost = wg;              // wastegate opens
    } else {
      const tgt = cap < wg ? cap : wg;
      es.boost += (tgt - es.boost) * (1 - Math.exp(-dt / (ep.turboTau * MODEL.turboSpinDown)));
    }
  } else if (kind === 'super') {
    const xs = x < 1.2 ? x : 1.2;
    const cap = ep.scCurve === 'centrifugal'
      ? ep.boostTarget * xs * xs
      : ep.boostTarget * (0.75 + 0.25 * (xs < 0.5 ? xs / 0.5 : 1));
    const bypass = clamp((pedal - 0.25) / 0.5, 0, 1);
    es.boost += (cap * bypass - es.boost) * (1 - Math.exp(-dt / MODEL.scTau));
  } else es.boost = 0;
  if (es.boost < 0) es.boost = 0;
  const pUp = Pamb + es.boost * 1e5;
  const PR = pUp / Pamb;

  // --- charge temperature -------------------------------------------------------------------
  let Tc = Tamb;
  if (kind !== 'na') {
    const T2 = Tamb * (1 + (Math.pow(PR, KAPPA) - 1) / compEff);
    Tc = T2 - ep.icEff * (T2 - Tamb);
  }
  Tc += ep.intakeHeat;

  // --- manifold pressure --------------------------------------------------------------------
  let prSS;
  if (ep.diesel) prSS = 1;
  else {
    const prClosed = prFromCapacity(ep.sLeakK / rpmF);
    const prWot = prFromCapacity(ep.sWotK / rpmF);
    const airPedal = als && pedal < 0.3 ? 0.3 : pedal;
    prSS = prClosed + (prWot - prClosed) * airPedal;
  }
  let ve = veAt(ep, x);
  if (kind === 'turbo') ve *= 1 - MODEL.turbineResidualVE * (flowFrac < 1.2 ? flowFrac * flowFrac : 1.44);
  const nRps = rpmF / 60;
  const tauM = ep.manifoldVol / (ve * ep.vdEff * 0.5 * nRps);
  es.pMan += (prSS * pUp - es.pMan) * (1 - Math.exp(-dt / tauM));
  const pMan = es.pMan;

  // --- fuelling -----------------------------------------------------------------------------
  const dfco = pedal < 0.01 && rpm > ep.idleRpm + 300 && !als;
  const combust = !es.failed && es.fuelKg > 0 && !es.limiter && !dfco;
  es.fuelCut = !combust;
  let lambda, energyPerAir;
  if (ep.diesel) {
    lambda = ep.lambdaFull / (pedal > 0.02 ? pedal : 0.02);
    energyPerAir = ep.lhv / (ep.afr * lambda);
  } else {
    const enrich = clamp((pMan / Pamb - 0.8) / 0.15, 0, 1);
    lambda = 1 + (ep.lambdaFull - 1) * enrich;
    energyPerAir = ep.lhv / ep.afr * (lambda < 1 ? 1 + MODEL.richGain * (1 - lambda) : 1 / lambda);
  }
  // fuel evaporation cools the charge
  if (combust) Tc -= ep.fuelCooling * clamp(pedal * 1.5, 0, 1);

  // --- nitrous: liquid N2O flashes in the intake (charge cooling), displaces some air by volume,
  // and brings 1.57x its mass in air-equivalent oxygen plus its decomposition heat.
  let n2oPerRev = 0, n2oFlow = 0, airFrac = 1, dTn2o = 0;
  const nos = ep.nitrousFlow > 0 && combust && env !== null && env !== undefined && env.nitrous === true
    && throttle >= MODEL.n2oArmThrottle && rpm > ep.nitrousArmRpm && es.nitrousKg > 0;
  es.nitrousActive = nos;
  if (nos) {
    const fill = es.nitrousKg / ep.nitrousCapacity;
    n2oFlow = ep.nitrousFlow * clamp(fill / 0.15, 0.3, 1);   // bottle pressure sags when nearly empty
    n2oPerRev = n2oFlow / nRps;
    const air0 = ve * pMan / (R_AIR * Tc) * ep.vdEff * 0.5;
    dTn2o = n2oPerRev * MODEL.n2oCoolingLatent / (air0 * CP_AIR + n2oPerRev * MODEL.n2oCp);
    if (Tc - dTn2o < 200) dTn2o = Tc - 200;
    Tc -= dTn2o;
    const nN = n2oPerRev / MODEL.n2oMolar, nA = air0 / MODEL.airMolar;
    airFrac = nA / (nA + nN);                               // N2O vapour takes part of the cylinder volume
  }
  es.nitrousFlowGs = n2oFlow * 1000;
  es.chargeTempC = Tc - 273.15;

  const rho = pMan / (R_AIR * Tc);
  const airPerRev = ve * rho * ep.vdEff * 0.5 * airFrac;  // kg per crank revolution
  const oxPerRev = airPerRev + n2oPerRev * MODEL.n2oOxygenRatio; // air-equivalent oxygen
  const airFlow = airPerRev * w / TWO_PI;                // kg/s
  es.airFlow = airFlow + n2oFlow;                         // exhaust-driving mass flow (turbo spool sees the shot too)
  es.lambda = lambda;
  es.mapBar = pMan / 1e5;

  let fuelFlow = combust ? (airFlow + n2oFlow * MODEL.n2oOxygenRatio) / (ep.afr * lambda) : 0;
  let fuelScale = 1;
  es.fuelLimited = false;
  if (fuelFlow > ep.fuelCap) { fuelScale = ep.fuelCap / fuelFlow; fuelFlow = ep.fuelCap; es.fuelLimited = true; }

  // --- knock ----------------------------------------------------------------------------------
  let retard = 0, kiEff = 0;
  if (!ep.diesel && combust) {
    const K = MODEL.knock;
    // nitrous raises the energy (and peak pressure) per cycle like extra charge density
    const pEff = pMan * (1 + MODEL.n2oPressureGain * n2oPerRev / (airPerRev > 1e-9 ? airPerRev : 1e-9));
    const Tk = Tc + (1 - MODEL.n2oKnockCoolingFrac) * dTn2o;
    const ki = Math.pow(pEff / 1e5 / K.pRef, K.a) * Math.pow(Tk / K.TRef, K.b)
      * Math.pow(ep.compression / 10, K.c) * Math.pow(ep.timing, K.d);
    es.knockIndex = ki;
    if (ki > ep.knockLimit) retard = clamp((1 - ep.knockLimit / ki) / K.retardRange, 0, 1);
    kiEff = ki * (1 - K.retardRange * retard);
  } else es.knockIndex = 0;
  es.knockRetard = retard;

  // --- torque -------------------------------------------------------------------------------
  let tInd = 0;
  if (combust) {
    let eta = ep.etaI * ep.timing * (1 - MODEL.knock.lossPerRetard * retard);
    if (als) eta *= MODEL.alsTorqueEff;
    tInd = (oxPerRev * energyPerAir + n2oPerRev * MODEL.n2oDecompHeat) * eta * fuelScale / TWO_PI;
  }
  const up = 2 * ep.strokeEq * rpm / 60;
  const pCyl = pMan * (1 + MODEL.n2oPressureGain * n2oPerRev / (airPerRev > 1e-9 ? airPerRev : 1e-9));
  const pmax = (combust ? ep.pmaxPerBar : MODEL.pmaxMotoring) * pCyl / 1e5;
  const F = MODEL.fmep;
  const fmep = F[0] + F[1] * pmax + F[2] * up + F[3] * up * up;
  let pmep = 0;
  if (!ep.diesel) {
    pmep = (Pamb + MODEL.exhaustBackPressure * 1e5 - pMan) / 1e5;
    if (pmep < 0) pmep = 0;
  }
  if (kind === 'turbo') pmep += MODEL.turbineBackPressure * flowFrac * flowFrac * pMan / 1e5;
  const spin = Math.tanh(omega / 8);
  let tLoss = (fmep + pmep) * 1e5 * ep.vdEff / FOUR_PI * spin;
  if (kind === 'super' && PR > 1) {
    tLoss += airPerRev / TWO_PI * CP_AIR * Tamb * (Math.pow(PR, KAPPA) - 1) / compEff / MODEL.scBeltEff * spin;
  }
  let torque = es.failed ? -(fmep * 1e5 * ep.vdEff / FOUR_PI * spin) : tInd - tLoss;

  // --- consumption, damage --------------------------------------------------------------------
  if (als) fuelFlow += MODEL.alsFuelFrac * ep.fuelCap;
  es.fuelFlowGs = fuelFlow * 1000;
  const prMan = pCyl / Pamb;   // effective (nitrous-equivalent) charge pressure ratio
  es.cylPressureRatio = prMan;
  es.overRev = rpm > ep.redlineRpm + ep.overRev;
  if (!es.steady) {
    es.fuelKg -= fuelFlow * dt;
    if (es.fuelKg < 0) es.fuelKg = 0;
    if (nos) { es.nitrousKg -= n2oFlow * dt; if (es.nitrousKg < 0) es.nitrousKg = 0; }
    let dmg = 0;
    if (prMan > ep.maxPressure) { const ex = prMan / ep.maxPressure - 1; dmg += 3 * ex * ex + 0.3 * ex; }
    if (es.overRev) dmg += 0.5 + 4 * (rpm - ep.redlineRpm - ep.overRev) / 1000;
    if (retard >= 1 && kiEff > ep.knockLimit * 1.02) dmg += 1.5 * (kiEff / ep.knockLimit - 1);
    if (als) dmg += MODEL.alsDamageRate;
    if (nos && fuelScale < 1) dmg += MODEL.n2oLeanDamage * (1 - fuelScale);
    if (dmg > 0 && !es.failed) {
      es.damage += dmg * dt;
      if (es.damage >= 1) { es.damage = 1; es.failed = true; }
    }
  }
  es.boostBar = (pMan - Pamb) / 1e5;
  es.torque = torque;
  es.powerKW = torque * omega / 1000;
  return torque;
}

function motorUpdate(es, ep, throttle, omega, dt, env) {
  throttle = throttle > 0 ? (throttle < 1 ? throttle : 1) : 0;
  const regen = env && env.regen > 0 ? (env.regen < 1 ? env.regen : 1) : 0;
  const aw = omega < 0 ? -omega : omega;
  const rpm = aw * RAD2RPM;
  es.omega = omega; es.rpm = rpm; es.throttle = throttle;
  const pack = es.batteryShared;
  const kwh = pack ? pack.kwh : es.batteryKwh;
  const cap = pack ? pack.capacity : ep.batteryKwh;
  const soc = cap > 0 ? kwh / cap : 0;
  es.soc = soc;
  const eta = ep.efficiency;
  // Battery power available (tapers below 10 % SoC: voltage sag / BMS limit)
  const socLim = clamp(soc / 0.1, 0, 1);
  let pMech = Math.min(ep.motorPower, ep.batteryMaxPower * eta * socLim);
  // field-weakening region: power falls towards max speed
  const xr = rpm / ep.maxRpm;
  if (xr > 0.85) pMech *= clamp(1 - (xr - 0.85) / 0.15, 0, 1);
  let tDrive = ep.motorTorque;
  const tPow = pMech / (aw > 1 ? aw : 1);
  if (tPow < tDrive) tDrive = tPow;
  if (es.failed) tDrive = 0;
  let torque = throttle * tDrive;
  // Regenerative braking torque (opposes rotation)
  let tReg = 0;
  if (regen > 0 && !es.failed) {
    const chargeOk = clamp((0.98 - soc) / 0.05, 0, 1);
    const pReg = ep.regenPower * chargeOk;
    tReg = Math.min(ep.regenTorque, pReg / (aw > 1 ? aw : 1)) * regen * clamp(aw / 30, 0, 1);
  }
  // Drive torque follows the COMMANDED direction (forward unless env.reverse), never the sign of a
  // (possibly tiny, noisy) shaft speed; regen always opposes rotation and fades out near standstill.
  const dir = env && env.reverse === true ? -1 : 1;
  const rotSgn = omega >= 0 ? 1 : -1;
  // drag: bearings + windage
  const tDrag = (0.3 + 0.0002 * aw) * Math.tanh(omega / 5);
  torque = dir * torque - rotSgn * tReg - tDrag;
  // battery energy
  const pOut = (torque + tDrag) * omega;           // mechanical power delivered by the motor (signed)
  const pBatt = pOut >= 0 ? pOut / eta : pOut * eta;
  if (!es.steady) {
    if (pack) { pack.kwh -= pBatt * dt / 3.6e6; if (pack.kwh < 0) pack.kwh = 0; if (pack.kwh > pack.capacity) pack.kwh = pack.capacity; es.batteryKwh = pack.kwh; }
    else { es.batteryKwh -= pBatt * dt / 3.6e6; if (es.batteryKwh < 0) es.batteryKwh = 0; if (es.batteryKwh > ep.batteryKwh) es.batteryKwh = ep.batteryKwh; }
    es.overRev = rpm > ep.maxRpm * 1.05;   // no damage: inverter simply stops producing torque
  }
  es.limiter = rpm >= ep.maxRpm;
  es.nitrousActive = false;
  es.boostBar = 0;
  es.fuelFlowGs = 0;
  es.chargeTempC = 25;
  es.torque = torque;
  es.powerKW = torque * omega / 1000;
  return torque;
}

// ---------------------------------------------------------------------------------------------
// Steady-state full-throttle curve
// ---------------------------------------------------------------------------------------------

/**
 * Steady-state full-throttle sweep (boost and manifold allowed to settle at each speed).
 * @returns {Array<{rpm:number, torque:number, powerKW:number, boostBar:number}>}
 */
export function engineCurve(ep, n = 60, env = null) {
  const es = createEngineState(ep);
  es.steady = true;
  es.fuelKg = 1;
  const out = [];
  const lo = ep.isEV ? 0 : Math.max(1000, ep.idleRpm);
  const hi = ep.isEV ? ep.maxRpm : ep.redlineRpm;
  for (let i = 0; i < n; i++) {
    const rpm = lo + (hi - lo) * i / (n - 1);
    const w = rpm / RAD2RPM;
    let t = 0;
    if (ep.isEV) t = engineUpdate(es, ep, 1, w, 0.01, env);
    else {
      let lastB = -1, lastP = -1;
      for (let k = 0; k < 600; k++) {
        t = engineUpdate(es, ep, 1, w, 0.02, env);
        if (k > 5 && Math.abs(es.boost - lastB) < 1e-5 && Math.abs(es.pMan - lastP) < 2) break;
        lastB = es.boost; lastP = es.pMan;
      }
    }
    out.push({
      rpm, torque: t, powerKW: t * w / 1000, boostBar: es.boostBar,
      knockRetard: es.knockRetard, chargeTempC: es.chargeTempC, fuelLimited: es.fuelLimited,
      fuelFlowGs: es.fuelFlowGs, mapBar: es.mapBar,
    });
  }
  return out;
}

/** Peak figures of a curve. */
export function curvePeaks(curve) {
  let pk = curve[0], tk = curve[0];
  for (const p of curve) { if (p.powerKW > pk.powerKW) pk = p; if (p.torque > tk.torque) tk = p; }
  return { powerKW: pk.powerKW, peakPowerRpm: pk.rpm, torqueNm: tk.torque, peakTorqueRpm: tk.rpm };
}
