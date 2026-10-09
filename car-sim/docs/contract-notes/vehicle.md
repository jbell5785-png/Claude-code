# Vehicle dynamics & drivetrain — contract notes (owner C)

Files: `src/sim/vehicle.js`, `src/sim/drivetrain.js`, `scripts/test-vehicle.js`
(`node scripts/test-vehicle.js [presetKey …] [--quick]`), test helpers in `scripts/lib/`
(`flatTrack.js` infinite flat/sloped plane, `fixture.js` hand-written params, `drivers.js` ideal test drivers).

Everything in ARCHITECTURE.md §5 is implemented with the names given there, including
`controls.nitrous` (passed to `engineUpdate` as `env.nitrous` for ICE units). Nothing was renamed or
removed. Interpretations and additions below.

## Interpretations (please code against these)

- **`createVehicle(params, track, pose, opts?)`** — optional 4th arg `opts = { tyreTempC }`. By default
  tyres start at each compound's `tOpt` ("after a warm-up lap"); pass e.g. `{ tyreTempC: 20 }` for
  cold tyres. `reset(pose)` re-creates tyre and engine states (fuel/damage restored).
- **`track` needs only `query(x, y, hint, out)`**; `track.samples`/`track.length` are used if present
  (see trackState below). Any object with `query` works (e.g. `scripts/lib/flatTrack.js`).
- **`wheels[i].compression`** = suspension travel from the STATIC position along body z (m, + = bump),
  i.e. in `[-maxDroop, maxCompression]` before the stops. Spring force = static corner load + k·travel.
  Renderer: use `wheels[i].pos` (world wheel centre, already includes travel).
- **`wheels[i].camber`** is in the tyre-input convention (§4): rad relative to the road, + = top of the
  wheel leaning LEFT (+y). Visual tilt about the wheel's forward axis.
- **`wheels[i].steer`** = road-wheel angle incl. Ackermann and toe (rad, + = left).
- **`wheels[i].slipRatio/slipAngle/usage/sliding`** are the tyre model's transient values.
- **`accBody`** is the kinematic acceleration in body axes WITHOUT gravity (cornering left → ay > 0;
  standing still → 0,0,0). It is not an accelerometer (specific-force) reading.
- **`v.speed`** = forward (body-x) component of the CG velocity; negative when reversing.
- **`trackState`** is derived from the four wheel ground queries interpolated to the CG (saves a fifth
  `track.query`, ~15 % of the step). It lags the body by one step (2 ms); `index = floor(s/samples.ds)`.
  If the track has no `samples`, a direct `query` of the CG is used.
- **`v.gear`**: auto mode shows 0 (N) when stopped without throttle; throttle selects 1.
- **`v.clutch`** = auto-clutch engagement 0..1 (EV: always 1). **`v.shifting`** = within `shiftTime`.
- **`v.controls`** = last applied controls after the ECU/aids (`throttle` = throttle actually sent to
  the engine after TC / shift cut / launch hold; `brake` = pedal; per-wheel ABS modulation is internal).
- **Geometry**: `geometry.a/b/cgHeight` are the SPRUNG CG = body origin (as A documents). Body-x/y
  translation uses `mass.total`; body-z uses `mass.sprung` (recomputed as total − 2uF − 2uR if
  inconsistent); each unsprung mass has its own DOF along body z. Inertia = `mass.inertia` + unsprung
  masses' parallel-axis terms (yaw/roll/pitch about the CG).
- **Aero ride-height sensitivity** (A uses the same definition): per axle,
  `downforce *= clamp(1 + groundEffect·(refRideHeight − h)/refRideHeight, 0.4, 1.8)` with
  `h − refRideHeight = −(mean axle travel) − (tyre deflection change)`. Front downforce acts at the front
  axle, rear at the rear axle; drag at `copHeight`, on the CG's x.
- **Brake temperature**: per-wheel disc node, heat = applied brake torque × |ω|, cooling
  `heatCap·(0.0015 + 0.0002·v)·(T − 20 °C)` W (τ ≈ 130 s at 30 m/s). Fade: torque ×
  `max(0.35, 1 − (T − brakeFadeStart)/400)` above `brakeFadeStart`.
- **Handbrake** adds `max(1.5·rear brakeTorque, 1500 Nm)·handbrake` to the rear wheels and opens the
  auto clutch above 0.5.

## Driver interface / ECU behaviour

- **Auto clutch** (ICE, both gear modes): slip-controlled pull-away — capacity = engine torque
  (feed-forward) + 0.4 Nm/rpm × (rpm − target), target rising with pedal to `launchRpm` (= rpm of peak
  torque, clamped to 2.5×idle…0.65×redline); additionally capped at the traction the driven tyres can
  take (Fz·µpeak·R/ratio) with wheel-slip feedback. Locks when synchronised (checked against ground
  speed so wheelspin doesn't fake a lock). Opens below 0.9×idle at the gearbox input (no stalls).
- **Pre-rev / launch**: brake + throttle at standstill holds the clutch open and the crank at
  `launchRpm`; releasing the brake launches through the clutch controller. Cars with
  `electronics.launch` keep `launchRpm` regardless of pedal until the clutch locks
  (`aids.launchActive`).
- **Auto gearbox**: upshift rpm per gear precomputed from `engineCurve` (wheel-force crossover of
  adjacent gears, else just below the limiter), scaled by a peak-held pedal (50 %…100 %); wheelspin
  does not trigger upshifts unless the engine is on the limiter. Downshift when lugging
  (`rpm < idle·(1.5+pedal)`) or kick-down at > 90 % pedal; never if the lower gear would exceed 90 %
  of the limiter. Shift = `shiftTime` of torque interruption (clutch open 70 %, re-engage 30 %),
  throttle cut on upshifts, rev-match blip on downshifts.
- **Reverse (auto)**: a brake press that BEGINS at standstill, held 0.6 s with throttle released,
  toggles D/N ↔ R; in R the throttle drives backwards. Braking to a stop and staying on the brake never
  selects R (avoids the start-line trap). `shiftDown` at standstill in N/1 → R, `shiftUp` in R → N also
  work in auto. AI note: the most direct way to reverse is `gearMode:'manual'` + `shiftDown` from N.
- **Manual**: `shiftUp/shiftDown` are edge-triggered; R ↔ N ↔ 1…n; R only below 2 m/s; downshifts that
  would mechanically over-rev (> `maxRpm`) are refused.
- **ABS** per wheel (bang-bang modulation around the tyre's peak slip ratio, found from
  `tyreSteadyForces` at build), **TC** (PI throttle cut on driven-wheel slip), both only when
  `params.electronics` enables them. Engine `failed` → zero drive torque.
- **EV**: one motor per driven axle, fixed reduction = `finalDrive`, rigid coupling;
  reverse flips the reduction sign; brake pedal requests regen (`env.regen`) above 1.5 m/s when ABS is
  idle (friction brakes act too); brake + throttle at standstill → no drive (override).

## Drivetrain model (drivetrain.js)

Velocity-level projected Gauss–Seidel (10 iterations, warm-started) over bodies {crank or front motor,
rear motor, 4 wheels}. The gearbox output / propshaft and diff carriers are folded into the drive-row
Jacobian instead of being separate near-massless bodies (keeps PGS convergent with 1:1000 inertia
ratios); propshaft inertia is reflected onto the driven wheels. Rows: clutch∘gear∘final-drive∘centre
split (`ω_e = g·fd·Σ shareᵢ ωᵢ`, |λ| ≤ clutch capacity; share = s/2 front, (1−s)/2 rear for an open
centre → exact torque split s), LSD rows on ωL−ωR bounded by `preload + lockAccel|lockDecel·|T_in|`
(clutch), `(TBR−1)/(TBR+1)·|T_in|` (Torsen), unbounded (locked); locked centre row; brake rows per
wheel bounded by brake + handbrake + |rolling-resistance| torque (so a braked car holds still).
Viscous diffs/couplings are explicit torques. Positive engine torque × `drivetrain.efficiency`.

## Proposed contract additions (non-breaking, already implemented)

- `v.bodyContact` (bool): the sprung body is touching the ground (12-point box vs local ground
  plane, penalty contact with friction) — rollovers and bottoming no longer fall through the world.
- `v.peakSlip`, `v.launchRpm`, `v.upRpm` (Float64Array), `v.nGears`, `v.drive` (Drivetrain:
  `axleTorque[2]`, `clutchTorque`, `clutchSlip`, `brakeTorque[4]`) for telemetry.
- `computeShiftPoints(curve, ratios, limiterRpm)` exported from vehicle.js.

## Known limitations

- No bump steer / heave camber / caster; camber gain is roll-only (as the params describe).
- Anti-dive/anti-squat use the simple `anti·h/L` jacking form, independent of brake split.
- Tyre contact point = below the wheel centre on the local ground plane (no enveloping on sharp kerbs).
- Body collision uses the nearest wheel's ground plane, so it is approximate over strongly curved terrain.
