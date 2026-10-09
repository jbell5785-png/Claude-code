// HUMAN TEAM STARTER — a hand-coded driver, no learning at all.
//
// The AI teams get a 79-number observation vector 50 times per second and must output steer,
// throttle and brake. You get EXACTLY the same vector (fairness), and you write the rules yourself.
// Every index is documented in COMPETITION.md §4 and in src/ai/sensors.js (constant OBS below).
//
// Try it: in Node,
//   import { registerDriverKind, createDriver } from '../../src/ai/driver.js';
//   import { createHumanDriver } from './driver.js';
//   registerDriverKind('human', createHumanDriver);
// then use createDriver('human') wherever a driver is needed (it implements reset/act like any driver).

import { createSensors, OBS, N_RAYS } from '../../src/ai/sensors.js';

export function createHumanDriver(opts = {}) {
  const sensors = createSensors();           // one sensor suite per car (it keeps scratch buffers)
  const caution = opts.caution ?? 1.0;       // > 1 = brake earlier, < 1 = braver

  return {
    kind: 'human',
    reset() {},

    /**
     * Called 50 times per second.
     * @param v      the car (you may only use it through the sensors, to keep the contest fair)
     * @param track  the track (same rule)
     * @param world  { cars, time }
     * @param out    fill out.steer (-1 right .. +1 left), out.throttle (0..1), out.brake (0..1)
     */
    act(v, track, world, out) {
      const o = sensors.observe(v, track, world);

      // ---------------------------------------------------------------- 1. STEERING
      // Aim to keep the car pointing along the track (heading error → 0) and near the middle
      // (offset → 0). o[OBS.HEAD_SIN] is sin(heading error): positive when we point LEFT of the road.
      // o[OBS.OFFSET] is our position across the road: +1 = at the left edge, -1 = at the right edge.
      // Also look at the curvature 10–20 m ahead and steer into the corner early.
      const headingErr = o[OBS.HEAD_SIN];
      const offset = o[OBS.OFFSET];
      const curveAhead = o[OBS.CURV + 2];    // curvature 20 m ahead × 20 (+ = left turn coming)
      let steer = -2.0 * headingErr - 0.5 * offset + 0.8 * curveAhead;

      // Counter-steer when the rear slides: lateral velocity (o[OBS.VLAT]) tells us we're drifting.
      steer -= 0.3 * o[OBS.VLAT];

      // Obstacles: the "solid" rays see walls and obstacles. If the straight-ahead solid ray is short,
      // steer towards the side whose rays see more free space.
      const mid = (N_RAYS - 1) / 2;          // index 7 = straight ahead
      const solidAhead = o[OBS.SOLID + mid]; // sqrt-normalised: 0 = touching, 1 = 120 m clear
      if (solidAhead < 0.4) {
        const left = o[OBS.SOLID + mid + 2], right = o[OBS.SOLID + mid - 2];
        steer += left > right ? 0.6 : -0.6;
      }
      out.steer = Math.max(-1, Math.min(1, steer));

      // ---------------------------------------------------------------- 2. SPEED
      // Choose a target speed from how sharp the road gets in the next 50 m:
      // in a corner of radius R, a car with ~1 g of grip can do v ≈ sqrt(9.81 · R).
      let maxCurv = 0;
      for (let k = 0; k < 5; k++) maxCurv = Math.max(maxCurv, Math.abs(o[OBS.CURV + k]) / 20); // undo the ×20
      const radius = 1 / Math.max(maxCurv, 1e-3);
      const target = Math.min(55, Math.sqrt(9.81 * 0.9 * radius)) / caution; // m/s
      const speed = o[OBS.SPEED] * 60;      // undo the /60 normalisation

      if (speed < target) { out.throttle = 1; out.brake = 0; }
      else if (speed < target + 3) { out.throttle = 0.2; out.brake = 0; }
      else { out.throttle = 0; out.brake = Math.min(1, (speed - target) / 10); }

      // ---------------------------------------------------------------- 3. The rest
      out.nitrous = false;                    // only useful with a nitrous kit in your car spec
      out.handbrake = 0; out.gearMode = 'auto';
      return out;
    },
  };
}
