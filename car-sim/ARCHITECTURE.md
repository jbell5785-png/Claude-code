# Car Sim — Architecture & Module Contracts

This file is the **contract** between modules. Several engineers (agents) build modules in
parallel; each must code against the interfaces here exactly. If you believe a contract must
change, do NOT silently change it: implement the closest compliant version and write the proposed
change + reason in `docs/contract-notes/<your-module>.md`.

Plain JavaScript ES modules (no TypeScript, no build step for sim code), runnable both in Node 22
and the browser. JSDoc comments for public functions. No new npm dependencies except where stated.
Performance matters: the physics runs at 500 Hz for up to ~100 cars during AI training, so the hot
path (`vehicle.step`, `tyreForces`, `engineUpdate`, `track.query`) must not allocate objects/arrays
per call (reuse preallocated state; return results via out-parameters).

## Directory layout & ownership

| Path | Owner | Purpose |
|---|---|---|
| `src/sim/constants.js` | orchestrator | DT, G, air constants, wheel order, surface ids |
| `src/sim/catalog.js` | orchestrator (A may extend) | every part option |
| `src/sim/build.js`, `src/sim/engine.js`, `src/sim/presets.js` | **A: powertrain** | spec → params, engine/motor model, preset builds |
| `src/sim/tyre.js` | **B: tyres** | tyre force/thermal/wear model |
| `src/sim/vehicle.js`, `src/sim/drivetrain.js` | **C: vehicle dynamics** | rigid body, suspension, drivetrain solver, aids, gearbox logic |
| `src/sim/track.js`, `src/sim/tracks/*.js`, `src/sim/laptimer.js` | **D: tracks** | 3D track geometry, ground queries, lap timing |
| `index.html`, `src/ui/**`, `vite.config.js`, `public/**` | **E: front-end** | three.js renderer, garage, HUD, telemetry, audio, input |
| `src/ai/**`, `scripts/train.js`, `scripts/tournament.js` | **F: AI** (wave 2) | sensors, neural nets, neuroevolution, trainers |
| `scripts/test-*.js` | owner of the module tested | headless tests (`node scripts/test-x.js`) |

## Conventions

- **Sim frame**: right-handed, **Z up**. World ground plane is X/Y.
- **Body frame**: origin at sprung-mass CG, **x forward, y left, z up**.
- Yaw/heading: angle from world +X toward +Y (counter-clockwise seen from above).
- Steering: positive = turn **left**. Slip angle sign: see tyre section.
- Quaternions: `[x, y, z, w]`, body → world.
- **Renderer conversion** (three.js is Y up): `three.x = sim.x, three.y = sim.z, three.z = -sim.y`.
- Wheel order: `0 FL, 1 FR, 2 RL, 3 RR` (`constants.js`).
- Units SI internally. Engine speed stored as `omega` (rad/s); `rpm` exposed for UI.
- Fixed timestep `DT = 1/500 s` from `constants.js`.

## 1. Spec (user/AI-facing build description) — input to `build(spec)`

```js
{
  name: 'My car',
  chassis: 'coupe',                       // key of CHASSIS
  powertrain: 'ice',                      // 'ice' | 'ev'
  engine: {                               // used when powertrain === 'ice'
    layout: 'I4', displacement: 2.0,      // L, clamped to LAYOUTS[layout].disp
    placement: 'front',                   // 'front' | 'mid' | 'rear' (must be allowed by chassis)
    induction: 'turboMedium', boost: 1.2, // boost target bar gauge (<= induction.maxBoost)
    intercooler: 'fmic', fuel: 'petrol98', fuelSystem: 'sport',
    cams: 'stock', intake: 'stock', exhaust: 'sport', internals: 'forged',
    flywheel: 'light', ecu: 'stage1', antiLag: false,
  },
  ev: { front: null, rear: 'large', battery: 'b80' }, // used when powertrain === 'ev'; front/rear = EV_MOTORS key or null
  drivetrain: {
    layout: 'RWD',                        // 'FWD' | 'RWD' | 'AWD' (ICE). EV layout follows which motors exist.
    gearbox: 'mt6', finalDrive: 3.9,      // finalDrive 2.5..5.5 (EV: total reduction 6..12)
    frontDiff: 'open', rearDiff: 'lsd15way', centreDiff: 'open', centreSplit: 0.4, // front torque share
  },
  suspension: {
    type: 'doubleWishbone', dampers: 'coilover',
    springF: 60, springR: 55,             // N/mm wheel rate
    arbF: 25, arbR: 15,                   // N/mm equivalent wheel rate (0 = none)
    damping: 0.45,                        // damping ratio target (clamped to DAMPERS range)
    rideHeight: -20,                      // mm relative to stock
    camberF: -2.0, camberR: -1.5,         // deg static
    toeF: 0.0, toeR: 0.1,                 // deg (positive = toe-in)
  },
  tyres: { compound: 'sport', widthF: 245, widthR: 265 },   // mm
  brakes: { kit: 'sport', bias: 0.64 },   // front share
  aero: { splitter: 'lip', wing: 'gt', wingAngle: 8, diffuser: 'none', bodyKit: 'stock' }, // wingAngle 0..15 deg
  weight: { reduction: 'stripped', ballastKg: 0, ballastPos: 0.5 }, // ballastPos 0 = rear axle, 1 = front axle
  electronics: 'absTc',
  fuelLitres: 50,
  steering: { ratio: 14, maxLock: 35, ackermann: 0.6 },      // maxLock deg at the road wheel
  color: '#d0302a',
}
```

## 2. Params — output of `build(spec)` (A owns, C/E/F consume)

`build(spec)` returns `params` (plain object, JSON-serialisable except nothing — keep it pure data):

```js
{
  spec,                                   // normalised/clamped copy of the input spec
  valid: true, warnings: ['Boost limited by fuel octane', ...], errors: [],
  price,                                  // total £
  geometry: { wheelbase, a, b,            // a = CG→front axle, b = CG→rear axle (m, horizontal)
              trackF, trackR, cgHeight,   // static CG height above ground (m) incl. ride height change
              rideHeight },               // static ground clearance of chassis reference (m)
  mass: { total, sprung,                  // kg (includes driver 75 kg and initial fuel)
          unsprungF, unsprungR,           // kg PER WHEEL (wheel+tyre+brake+hub+half link)
          inertia: { Ixx, Iyy, Izz } },   // sprung mass about its CG, body axes (kg m^2)
  axles: [ front, rear ],                 // see below
  aero: { cdA, clAFront, clARear,         // m^2; clA positive = DOWNFORCE
          groundEffect, refRideHeight,    // downforce multiplier slope vs ride height (see C notes)
          copHeight },                    // drag centre height above ground (m)
  powerUnits: [                           // ICE: exactly one. EV: one per motor.
    { engine: <engineParams>, drives: 'centre' | 'front' | 'rear' }
    // ICE: drives 'centre' (through gearbox → centre/axle diff according to drivetrain.layout)
    // EV : drives 'front' or 'rear' directly through its fixed reduction (no gearbox shifting)
  ],
  drivetrain: { layout, gearRatios: [..], reverseRatio, finalDrive, shiftTime, efficiency,
                frontDiff: <DIFFS entry>, rearDiff: <DIFFS entry>, centreDiff: <CENTRE_DIFFS entry>,
                centreSplit, clutchMaxTorque, isEV,
                driveshaftInertia },     // kg m^2 at gearbox output
  electronics: { abs, tc, launch },
  steering: { maxLock, ackermann, rate },// rad, 0..1, rad/s at road wheel
  fuel: { tankKg, density, x },          // initial fuel kg, kg/L, tank position x in body frame (m)
  battery: { kwh, maxPower } | null,
  render: { style, length, width, height, color, wing, splitter, diffuser, bodyKit,
            tyreWidthF, tyreWidthR, wheelRadiusF, wheelRadiusR, engineLayout, placement, exhaust },
  summary: { powerKW, peakPowerRpm, torqueNm, peakTorqueRpm, mass, weightDistFront,
             powerToWeight /* kW/t */, topSpeedEstKph, drivetrain, price },
}
```

Axle object (`axles[0]` front, `axles[1]` rear):

```js
{
  steered, driven,                         // booleans
  spring,                                  // N/m wheel rate
  bumpDamp, reboundDamp,                   // N s/m at the wheel
  arb,                                     // N/m: extra force per m of left-right travel difference
  restLength, maxCompression, maxDroop,    // m (suspension travel along body z)
  rollCentre,                              // m above ground (lateral force application height)
  camberStatic, camberGain,                // rad; camberGain 0..1 (fraction of body roll recovered)
  toe,                                     // rad, positive toe-in
  anti,                                    // anti-dive (front) / anti-squat (rear) fraction 0..1
  brakeTorque,                             // Nm per wheel at full pedal (bias already applied)
  brakeHeatCap, brakeFadeStart,            // J/K per wheel, deg C
  tyre: <tyreParams>,                      // see §4
}
```

## 3. Engine / motor API (`src/sim/engine.js`, owner A)

```js
createEngineState(ep) -> es
engineUpdate(es, ep, throttle /*0..1*/, omega /*rad/s crank*/, dt, env) -> torque  // Nm net at crank
   // env = { regen: 0..1 (EV only, braking regen demand), ambientT, ambientP,
   //         nitrous: bool (added — only effective with a nitrous kit, throttle > 0.9, rpm > arming rpm) }
   // Includes friction/pumping (negative torque when throttle closed), boost dynamics, knock
   // retard, fuel-flow cap, rev limiter (fuel cut), damage accumulation & failure, fuel/battery use.
engineCurve(ep) -> [{ rpm, torque, powerKW, boostBar }]  // steady-state full-throttle sweep, ~60 points
```

`ep` (engineParams) must expose at least: `isEV, inertia (kg m^2 crank side), idleRpm, redlineRpm,
limiterRpm, maxRpm, cylinders, rotary, layout, loudness, induction kind ('na'|'turbo'|'super'|'ev')`.

`es` must expose at least (read by UI/AI/vehicle): `rpm, omega, throttle, torque, powerKW, boostBar,
chargeTempC, knockRetard (0..1), fuelFlowGs, fuelKg, batteryKwh, soc (0..1, EV), damage (0..1),
failed (bool), overRev (bool), limiter (bool), antiLagActive (bool)`,
added: `nitrousActive (bool), nitrousKg (remaining), nitrousCapacityKg`.

Spec addition: `engine.nitrous: 'none' | NITROUS key` (catalog `NITROUS`: shot size, bottle kg, price).

## 4. Tyre API (`src/sim/tyre.js`, owner B)

`tyreParams` is produced by `build.js` using `makeTyreParams(compoundKey, widthMm, radius, nominalLoad)`
which **B exports from tyre.js** (A calls it), returning at least:
`{ mu, loadSens, Fz0, stiff, shapeC, shapeE, relaxLong, relaxLat, crr, tOpt, tWindow, wearRate,
grassMult, width, radius, inertia, vertStiff, vertDamp, camberStiff, camberOpt, mass }`.

```js
createTyreState(tp) -> ts                  // ts: { kappa, alpha (transient slip states), tempSurface, tempCarcass, wear, ... }
tyreForces(ts, tp, input, dt, out)         // fills `out`, updates ts (relaxation, thermal, wear)
  input = { Fz, vx, vy, omega, camber, surface }   // vx/vy: contact-patch velocity in WHEEL frame (x along wheel heading, y left)
                                                  // omega: wheel spin rad/s (positive = rolling forward)
                                                  // camber: rad relative to road, positive = top leaning LEFT (outward on left wheel)
                                                  // surface: SURFACE id
  out = { Fx, Fy, Mz, slipRatio, slipAngle, usage /*0..>1 combined slip vs peak*/, sliding /*bool*/, rollResTorque }
  // Fx forward, Fy left, in the wheel frame. Fy opposes lateral slip (vy>0 → Fy<0).
```

Low-speed behaviour must be stable at standstill and at 500 Hz (car parked on a 10% slope must not
creep or jitter). Relaxation-length transient slip is required.

## 5. Vehicle API (`src/sim/vehicle.js`, `src/sim/drivetrain.js`, owner C)

```js
createVehicle(params, track, pose /* { x, y, heading } on the ground; z resolved from track */) -> v
v.step(controls)              // advances exactly DT
v.reset(pose)
controls = { steer: -1..1, throttle: 0..1, brake: 0..1, handbrake: 0..1,
             shiftUp: bool, shiftDown: bool, gearMode: 'auto' | 'manual',
             nitrous: bool /* added: hold to inject; vehicle passes it to engineUpdate via env.nitrous */ }
```

Public state (read by renderer, telemetry, AI — keep these names):

```js
v.params, v.time
v.pos [x,y,z]  v.quat [x,y,z,w]  v.vel [x,y,z] (world)  v.angVel [x,y,z] (body)
v.speed (m/s, forward), v.heading (rad), v.accBody [ax, ay, az] (m/s^2 incl. no gravity)
v.gear (0 = neutral, -1 = reverse, 1..n), v.clutch (0..1 engagement), v.shifting (bool)
v.controls  (last applied, after aids: throttle/brake actually used)
v.aids { absActive, tcActive, launchActive }
v.engines [es, ...]  (one per power unit; es from engine.js)
v.wheels[4] = {
  pos [x,y,z] (world wheel centre), steer (rad), spin (rad, accumulated), omega,
  compression (m), Fz, Fx, Fy, slipRatio, slipAngle, usage, sliding, contact (bool),
  surface, camber, tyre: <ts>, brakeTempC, onTrack (bool)
}
v.trackState { s, offset, index, surface }    // from track.query of the body centre
v.damage / v.failed (mirrors engine failure)
```

## 6. Track API (`src/sim/track.js`, owner D)

```js
TRACKS                       // { key: { label, build: () => trackDef } }
createTrack(keyOrDef) -> track
track.length, track.width (m, nominal), track.closed (true)
track.samples                // { n, ds, x,y,z, tx,ty,tz (tangent), nx,ny (left normal, horizontal), bank, curvature, widthL, widthR } typed arrays
track.query(x, y, hint, out) // out = { s, offset /*+left*/, height, nx, ny, nz /*ground normal*/, surface, index }
                             // hint = last index (number) for O(1) local search; -1 = global search.
track.pointAt(s, out)        // centreline point: { x, y, z, tx, ty, heading, curvature, bank }
track.startPose(gridSlot=0)  // { x, y, heading }
track.scenery                // optional data for renderer (trees/barriers/stands positions)
createLapTimer(track) -> lt  // lt.update(v) each step; lt.lap, lt.lapTime, lt.lastLap, lt.bestLap,
                             // lt.sector, lt.progress (total metres incl. laps), lt.wrongWay, lt.offTrackTime
```

### 6b. Walls, obstacles & raycasts (added after kickoff — owner D)

```js
track.walls       // { segs: Float32Array [x1,y1,x2,y2, ...], n, height }  barrier polylines (both sides,
                  // at the outer edge of the run-off) — solid for collisions (collision module, wave 2)
track.obstacles   // [{ kind: 'cylinder', x, y, r, h } | { kind: 'box', x, y, hx, hy, heading, h }]
                  // defined in track defs by { s, offset, ... } and resolved to world coords
track.raycast(x, y, dx, dy, maxDist, mask, out) -> distance   // (dx,dy) unit vector; returns maxDist if no hit
                  // mask bits: RAY.EDGE = 1 (edge of asphalt+kerb), RAY.WALL = 2, RAY.OBSTACLE = 4
                  // out (optional) = { dist, kind /*RAY bit hit*/, nx, ny /*hit normal*/ }
                  // must be fast (uniform grid over segments): ~100 cars × 15 rays × 50 Hz
export const RAY = { EDGE: 1, WALL: 2, OBSTACLE: 4 }   // exported from track.js
```

Random tracks accept `{ type: 'random', seed, obstacles: n, difficulty: 0..1 }` (difficulty tightens
corners/zigzags). Obstacles sit on the racing surface and must leave a drivable gap (≥ 5 m).
Car-car and car-wall/obstacle collision physics: separate collision module (wave 2), not owner C.

## 7. AI drivers & Race mode (added — `src/ai/driver.js` orchestrator, extended by F)

```js
import { createDriver, registerDriverKind, DRIVER_HZ } from './src/ai/driver.js';
const d = createDriver('pursuit', { skill: 0.85, aggression: 0.5 }); // built-in racing-line driver
d.reset(vehicle, track);
d.act(vehicle, track, { cars: allVehicles, time }, controlsOut);     // call at DRIVER_HZ (50 Hz)
registerDriverKind('neural', opts => ...)                              // F adds learned drivers
```

`src/ai/racingline.js`: `racingLine(track)` (min-curvature line, obstacle-aware, cached) and
`speedProfile(line, params, skill)`.

**Race mode (E)**: player car (garage build) + up to 7 AI cars on `track.startPose(slot)`; each AI
car = { spec (preset or team car.json), driver kind + opts }; start lights, live positions by
lap timer progress, lap count selection, gaps, results table with best laps; spectate any car.
Cars are ghosts until the collision module (wave 2) lands; then it is called once per step
with all vehicles.

## Physics model summary (for orientation)

- 6-DOF sprung rigid body + 4 unsprung masses with vertical DOF, coil-over spring/damper, anti-roll bars,
  roll-centre (geometric) load transfer, anti-dive/anti-squat, camber gain.
- Tyre: Pacejka Magic-Formula shape with load sensitivity, normalised combined slip, relaxation lengths,
  camber thrust, thermal (surface/carcass) and wear.
- Drivetrain: velocity-level projected Gauss-Seidel constraint solver over rotating bodies
  (engine, gearbox output, diffs, wheels) with friction-limited constraints for clutch, LSDs and brakes.
- Engine: air-mass-flow based torque (VE × charge density × fuel energy × efficiency − FMEP − PMEP),
  turbo spool dynamics with flow-dependent boost, intercooler charge temperature, knock-limited timing,
  fuel-flow limits, rev limiter, mechanical stress damage; EV motor with power/torque limits and regen.
- Aero: drag, front/rear downforce with ride-height sensitivity, wing angle trade-off.
