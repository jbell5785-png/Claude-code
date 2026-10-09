# Tyre module (B) — contract notes

All §4 names are implemented as specified. The points below clarify conventions the contract left open,
and list additions. Nothing in the contract was changed.

## Clarified conventions
- **slipAngle** (`out.slipAngle`, rad) = atan(u'), where u' is the transient lateral slip ≈ vy/|vx|.
  **Positive when the contact patch slides left (vy > 0), which gives Fy < 0.** `ts.alpha` stores u'
  (the tangent), not the angle.
- **slipRatio** (`out.slipRatio`, `ts.kappa`) is the *transient* κ' = (ωR − vx)/|vx| after relaxation.
  It is positive when driving and −1 when locked at speed.
- **rollResTorque**: a signed torque about the axle, in the same sense as ω, to be added to the wheel.
  It always opposes ω and ramps linearly to 0 for |ωR| < 0.3 m/s. It includes the extra drag on grass
  and gravel. Callers can also use `|rollResTorque|` as a friction-limited brake capacity (vehicle.js
  does this).
- **Mz** is about +z (counter-clockwise from above). Mz = −trail·Fy, so it aligns the wheel.
- **camberOpt** is in the *automotive* sense (negative means the top leans toward the car centre). It is
  applied relative to the direction of the lateral force, so it works for both left and right wheels
  with the contract's camber sign (+ = top leaning left). For a force pointing left, the optimum contract
  camber is −camberOpt (> 0). For a force pointing right, it is +camberOpt. In a straight line the
  optimum is 0.
- **width** is in metres. `widthMm` is also provided.
- **mass** and **inertia** cover the tyre plus the rim.

## Additions
- `createTyreState(tp, opts)`: `opts` is either a number (initial temperature in °C for both nodes) or
  `{ tempC, tempSurface, tempCarcass, ambientC, wear }`. The default is 20 °C ambient.
- `resetTyreState(ts, tp, opts)` resets a state in place.
- `tyreSteadyForces(tp, Fz, kappa, alphaRad, camber, surface, out, gripMult=1)` returns steady-state
  forces with no state, relaxation or damping. It is meant for curves, the UI, and estimating peak slip.
  `out = { Fx, Fy, Mz, usage, mu }`.
- Extra `ts` fields: `temp` (effective grip temperature), `ambientT`, `gripTemp`, `gripWear`, `muEff`,
  `slipEnergy` (J), `Fz`, `usage`, plus the internals `still` and `omegaPrev`.

## Behaviour notes for integrators (C)
- The low-speed longitudinal damper is capped at `0.8·I/(R²·DT)` so that a free wheel integrated
  explicitly stays stable. Full (critical) damping is used only after ω has stayed below 1e-3 rad/s and
  unchanged for 2 steps, for example when the brake has locked the wheel. A wheel the PGS brake
  constraint holds at exactly ω = 0 therefore gets full damping.
- At vx = 0 the slip states act as a contact spring, so a locked wheel holds on a slope with no creep.
  After sliding to a stop, the stored deflection is capped at normalised slip 0.5 (static friction is
  about 0.9 of peak). The resulting rebound is about 7 mm and does not oscillate.
- The model assumes it is called once per DT step per wheel. Each call advances the relaxation,
  thermal and wear states.
