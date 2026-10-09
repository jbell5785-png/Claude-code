// Test-only hand-written params fixture (used before/independently of build.js).
// Roughly a 1300 kg front-engine RWD 2.0 turbo coupe on sport tyres.
import { makeTyreParams } from '../../src/sim/tyre.js';
import { makeEngineParams } from '../../src/sim/engine.js';
import { DIFFS, CENTRE_DIFFS } from '../../src/sim/catalog.js';
import { G } from '../../src/sim/constants.js';

export function fixtureParams(over = {}) {
  const total = 1300, uF = 40, uR = 42, sprung = total - 2 * uF - 2 * uR;
  const L = 2.57, b = 1.25, a = L - b, cgH = 0.47;
  const R = 0.317;
  const FzF = total * G * b / L / 2, FzR = total * G * a / L / 2;
  const kF = 60e3, kR = 55e3;
  const cc = (k, m) => 2 * Math.sqrt(k * m);
  const engine = makeEngineParams({
    layout: 'I4', displacement: 2.0, induction: 'turboMedium', boost: 1.2, intercooler: 'fmic',
    fuel: 'petrol98', fuelSystem: 'sport', cams: 'stock', intake: 'stock', exhaust: 'sport',
    internals: 'forged', flywheel: 'light', ecu: 'stage1', antiLag: false,
  }, 40);
  const axle = (front) => ({
    steered: front, driven: !front,
    spring: front ? kF : kR,
    bumpDamp: 0.45 * cc(front ? kF : kR, (front ? FzF : FzR) / G),
    reboundDamp: 0.45 * 1.5 * cc(front ? kF : kR, (front ? FzF : FzR) / G),
    arb: front ? 25e3 : 15e3,
    restLength: 0.35, maxCompression: 0.07, maxDroop: 0.09,
    rollCentre: front ? 0.05 : 0.09,
    camberStatic: (front ? -2 : -1.5) * Math.PI / 180, camberGain: 0.65,
    toe: front ? 0 : 0.1 * Math.PI / 180,
    anti: front ? 0.25 : 0.2,
    brakeTorque: front ? 3600 / 2 * 1.1 : 2000 / 2 * 1.1,
    brakeHeatCap: 8000, brakeFadeStart: 550,
    tyre: makeTyreParams('sport', front ? 245 : 265, R, front ? FzF : FzR),
  });
  const ratios = [];
  for (let i = 0; i < 6; i++) ratios.push(3.6 * Math.pow(0.75 / 3.6, i / 5));
  const p = {
    spec: {}, valid: true, warnings: [], errors: [], price: 0,
    geometry: { wheelbase: L, a, b, trackF: 1.55, trackR: 1.57, cgHeight: cgH, rideHeight: 0.12 },
    mass: { total, sprung, unsprungF: uF, unsprungR: uR, inertia: { Ixx: 450, Iyy: 1900, Izz: 2100 } },
    axles: [axle(true), axle(false)],
    aero: { cdA: 0.62, clAFront: 0.15, clARear: 0.35, groundEffect: 0, refRideHeight: 0.12, copHeight: 0.5 },
    powerUnits: [{ engine, drives: 'centre' }],
    drivetrain: {
      layout: 'RWD', gearRatios: ratios, reverseRatio: 3.4, finalDrive: 3.9, shiftTime: 0.3, efficiency: 0.92,
      frontDiff: DIFFS.open, rearDiff: DIFFS.lsd15way, centreDiff: CENTRE_DIFFS.open, centreSplit: 0.4,
      clutchMaxTorque: 600, isEV: false, driveshaftInertia: 0.02,
    },
    electronics: { abs: true, tc: true, launch: false },
    steering: { maxLock: 35 * Math.PI / 180, ackermann: 0.6, rate: 4 },
    fuel: { tankKg: 37, density: 0.75, x: -1.0 },
    battery: null,
    render: {},
    summary: {},
    targets: {},
  };
  return Object.assign(p, over);
}
