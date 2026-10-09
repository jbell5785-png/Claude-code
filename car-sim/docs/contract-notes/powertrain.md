# Powertrain & build (engineer A) — contract notes

Implemented: `src/sim/engine.js`, `src/sim/build.js`, `src/sim/presets.js`, tests `scripts/test-engine.js`,
`scripts/test-build.js`. All contract fields of §2/§3 are present. Clarifications and additions below.
No contract field was removed or renamed.

## Interpretations (please code against these)

- **`geometry.a`, `b`, `cgHeight` are the SPRUNG-mass CG** (= body-frame origin, as vehicle.js assumes).
  Whole-car CG is in the extra field `geometry.cgTotal = { a, b, height }`. `summary.weightDistFront` is
  the whole-car static distribution (includes unsprung masses).
- **Suspension travel**: `maxCompression` / `maxDroop` are travel from the STATIC position (bump / droop),
  matching vehicle.js (`s ∈ [-maxDroop, maxCompression]`, spring preload = static corner weight).
  `restLength` is a nominal static spring length (informational). Extra field `staticCompression` =
  static deflection of the spring (corner sprung weight / wheel rate).
- **`aero.groundEffect`** is dimensionless: downforce multiplier = 1 + groundEffect·(refRideHeight − h)/refRideHeight
  (same as vehicle.js). `refRideHeight` = static clearance incl. the ride-height setting.
- **`axles[i].brakeTorque`** is per wheel at full pedal. Catalogue brake torques are for a 1350 kg car on
  0.317 m wheels; build scales disc size (torque and heat capacity) by `1.25·mass·radius / (1350·0.317)`
  so every car can lock its tyres at full pedal (stock ≈ 1.3 g, `summary.brakeCapG`).
- **`env.ambientT`** in K (values < 150 are treated as °C), `env.ambientP` in Pa; `env` may be null.
- **EV battery**: each motor's `ep` owns a power-proportional share of the pack (`batteryKwh`,
  `batteryMaxPower`), so with proportional use both shares drain together. Optional helper
  `shareBattery([es0, es1])` makes several motor states draw from one shared pack object.
  EV motor overspeed (> 1.05 maxRpm) sets `es.overRev` but causes no damage (inverter stops torque).
- **ICE "anti-stall"**: torque per revolution does not vanish at 0 rpm, and the idle PI controller
  raises airflow when rpm drops, so the engine recovers rather than stalling. There is no stall state.
- Combustion with λ < 1: energy per kg air = LHV/AFR·(1 + 0.35(1−λ)) (excess fuel does not all burn)
  instead of the literal LHV/(AFR·λ); λ > 1 (diesel) uses LHV/(AFR·λ).

## Additions (extra fields, safe to ignore)

- engine.js exports `makeEngineParams(engineSpec, fuelKg)`, `makeMotorParams(motor, battery, share)`,
  `curvePeaks(curve)`, `shareBattery(states)`, `MODEL` (calibration constants). `engineCurve(ep, n=60, env)`
  points also carry `knockRetard, chargeTempC, fuelLimited, fuelFlowGs, mapBar`.
- `es` also exposes `knockIndex, mapBar (bar abs), lambda, airFlow (kg/s), fuelLimited, fuelCut, boost` (turbo
  pressure upstream of the throttle, bar g). `es.boostBar` = manifold gauge pressure (negative = vacuum).
- `build.js` exports `defaultSpec()`, `normalizeSpec(spec)`; params gain `mass.components` (debug list),
  `geometry.cgTotal/length/width/height`, `steering.ratio`, `aero.wingAngle`, `render.induction/wingAngle/rideHeightMm`,
  `summary.redlineRpm/rideFreqF/rideFreqR/maxBoostBar/downforce200/cdA/brakeCapG`.
- Diffs in `params.drivetrain` are catalogue entries plus `key`.
- catalog.js extended (no keys removed): `LAYOUTS.*.boreStroke` (+ rotary `vePeakAdd/veWidthMult`),
  `CAMS.*.veGain`, `INTAKES.*.heatK`, `ECU_TUNES.*.boostTaper`, `CHASSIS.*.clearance`, `ANTI_LAG`.

## Model summary (for reviewers)

- Geometry: bore/stroke from layout ratio; redline = min(mean piston speed 21 m/s (diesel 14),
  valvetrain 7600 rpm) + cam/ECU additions. Rotary: 9000 rpm e-shaft, airflow of 2× displacement.
- Air: VE(rpm) (cam peak/width, intake/exhaust/cam gains, turbine residuals) × ρ(MAP, T_charge) × Vd/2 per rev.
  MAP from a drive-by-wire throttle between closed-throttle leakage and the WOT orifice limit (analytic
  compressible-orifice solution), lagged by manifold filling time.
- Work: η_i = 0.415 (petrol, CR 11 ref) / 0.45 (diesel, CR 16.5) scaled by Otto efficiency of the CR
  (NA 12, super 10, turbo 9.5, diesel 16.5, rotary ×0.80); FMEP Chen–Flynn (0.55 + 0.004·Pmax + 0.03·Up + 0.0009·Up² bar);
  PMEP from throttling + turbine back-pressure (∝ (flow/flowMax)²).
- Turbo: capability = maxBoost × spool(flow) with spool linear between flowStart and flowFull (positive
  feedback), wastegate at min(spec·ECU trim, maxBoost) with stock-map boost taper near redline,
  compressor choke above 0.85 flowMax, first-order spool τ = tau·(flowFull/flow)^0.8, slower spin-down.
- Knock index KI = (MAP/2.05)^0.75 (T/330)^3 (CR/10)^1.3 timing^8 vs fuel knockLimit → timing retard (≤25 % torque);
  saturated retard → detonation damage.

## Known weaknesses

- Turbo spool near the threshold rpm converges slowly (marginal positive feedback): a large turbo at its
  threshold creeps to partial boost over several seconds. Physically plausible, but strong.
- Small-car masses: the catalogue kei shell (520 kg) makes the kei preset ~150 kg heavier than a real kei car.
- The 2.0T reference uses the catalogue's medium turbo, which spools at ~2300 rpm (real OEM 2.0T: ~1600).
- Diesel low-end torque below the turbo threshold is weak (no VGT model).
