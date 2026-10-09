// Classical racing-line driver: pure-pursuit + cross-track (Stanley) steering on the racing line,
// speed-profile tracking, and tyre-aware control — traction control on the driven wheels, lifting
// on understeer, steering capped near peak slip, counter-steer on oversteer. An adaptive grip
// estimate is learned from the tyres while driving. Built-in Race-mode opponent and the baseline
// the learning AIs must beat.

import { racingLine, speedProfile } from './racingline.js';
import { G } from '../sim/constants.js';

const ALPHA_PEAK = 0.11; // rad, typical front slip angle at peak lateral force

/**
 * @param {object} opts { skill 0..1 (default 0.85), aggression 0..1 }
 */
export function createPursuitDriver(opts = {}) {
  const skill = opts.skill ?? 0.85;
  const aggression = opts.aggression ?? 0.5;
  let line = null, profile = null, track = null, params = null;
  let laneShift = 0;        // m, temporary offset for overtaking
  let thrCap = 1;           // traction-control throttle ceiling
  let gripScale = 1;        // adaptive grip estimate (re-profiles when it drifts)
  let profiledScale = 1;
  let drivenF = false, drivenR = true, wb = 2.6, maxLock = 0.6, muCar = 1;
  const p = {};

  function reset(vehicle, trk) {
    track = trk; params = vehicle.params;
    line = racingLine(track);
    gripScale = profiledScale = 1;
    profile = speedProfile(line, params, skill, { gripScale });
    laneShift = 0; thrCap = 1;
    drivenF = !!params.axles[0].driven; drivenR = !!params.axles[1].driven;
    wb = params.geometry.wheelbase; maxLock = params.steering.maxLock;
    muCar = 0.5 * ((params.axles[0].tyre.mu ?? 1) + (params.axles[1].tyre.mu ?? 1)) * 0.85;
  }

  function sample(arr, s) {
    const n = line.n, f = (((s / line.ds) % n) + n) % n, i = Math.floor(f), j = (i + 1) % n, t = f - i;
    return arr[i] * (1 - t) + arr[j] * t;
  }

  /**
   * @param {object} v      vehicle (contract §5)
   * @param {object} trk    track
   * @param {object} world  { cars: [vehicles] } (may be omitted)
   * @param {object} out    controls to fill
   */
  function act(v, trk, world, out) {
    if (trk !== track || v.params !== params) reset(v, trk);
    const s = v.trackState.s;
    const speed = Math.max(0, v.speed);
    const W = v.wheels;

    // --- traffic: shift lane to pass a slower car ahead that sits on our line
    let wantShift = 0;
    if (world && world.cars) {
      for (const o of world.cars) {
        if (o === v) continue;
        let ds = o.trackState.s - s;
        if (ds < -track.length / 2) ds += track.length; else if (ds > track.length / 2) ds -= track.length;
        if (ds <= 0 || ds > 18 + speed * 0.8) continue;
        const dLat = o.trackState.offset - (sample(line.offset, s) + laneShift);
        if (Math.abs(dLat) > 2.6 || o.speed > speed - 0.5) continue;
        track.pointAt(s + ds, p);
        const roomL = p.widthL - o.trackState.offset, roomR = p.widthR + o.trackState.offset;
        wantShift = roomL > roomR ? Math.min(3.2, roomL - 1.6) : -Math.min(3.2, roomR - 1.6);
        wantShift *= 0.6 + 0.4 * aggression;
      }
    }
    laneShift += (wantShift - laneShift) * 0.04;

    // --- adaptive grip: tyres past peak → we're asking too much; comfortably below → a bit more
    const uF = Math.max(W[0].usage, W[1].usage), uR = Math.max(W[2].usage, W[3].usage);
    const latG = Math.abs(v.accBody ? v.accBody[1] : 0) / G;
    if (speed > 12) {
      const cornering = latG > 0.45 * muCar;
      if (cornering && Math.max(uF, uR) > 1.08) gripScale -= 0.004;
      else if (cornering && Math.max(uF, uR) < 0.8) gripScale += 0.0015;
      gripScale = Math.min(1.08, Math.max(0.75, gripScale));
      if (Math.abs(gripScale - profiledScale) > 0.03) {
        profiledScale = gripScale;
        profile = speedProfile(line, params, skill, { gripScale });
      }
    }

    // --- target on the (possibly shifted) racing line
    const look = Math.min(32, Math.max(6, 3 + speed * 0.38));
    const sT = s + look;
    track.pointAt(sT, p);
    let offT = sample(line.offset, sT) + laneShift;
    offT = Math.max(-p.widthR + 1.0, Math.min(p.widthL - 1.0, offT));
    const tx = p.x + offT * p.nx, ty = p.y + offT * p.ny;
    const c = Math.cos(v.heading), sn = Math.sin(v.heading);
    const dx = tx - v.pos[0], dy = ty - v.pos[1];
    const lx = c * dx + sn * dy, ly = -sn * dx + c * dy;
    const ld = Math.max(1, Math.hypot(lx, ly));

    // Pure pursuit + cross-track correction at the car's own station.
    const alpha = Math.atan2(ly, Math.max(0.1, lx));
    let delta = Math.atan2(2 * wb * Math.sin(alpha), ld);
    const eLat = (sample(line.offset, s) + laneShift) - v.trackState.offset; // +: line is to our left
    delta += Math.atan2(0.6 * eLat, speed + 4);

    // Oversteer only (yawing faster than the path needs, rear past peak) → counter-steer.
    // Never add lock for understeer: that just overloads the fronts further.
    const yawNeeded = speed * (2 * Math.sin(alpha) / ld);
    const r = v.angVel[2];
    if (Math.abs(r) > Math.abs(yawNeeded) && Math.sign(r) === Math.sign(r - yawNeeded)) {
      delta -= (uR > 1.0 ? 0.12 : 0.04) * (r - yawNeeded);
    }
    // Cap steering near peak front slip: kinematic angle for the grip-limited curvature + α_peak
    // (counter-steer against a slide may exceed it).
    const kMax = (muCar * gripScale * G) / Math.max(25, speed * speed);
    const dMax = Math.atan(wb * kMax) + ALPHA_PEAK * (0.9 + 0.3 * skill);
    const slideCorr = uR > 1.0 ? 0.25 : 0;
    if (delta > dMax + (r < 0 ? slideCorr : 0)) delta = dMax + (r < 0 ? slideCorr : 0);
    else if (delta < -dMax - (r > 0 ? slideCorr : 0)) delta = -dMax - (r > 0 ? slideCorr : 0);
    out.steer = Math.max(-1, Math.min(1, delta / maxLock));

    // --- speed tracking against the profile, anticipating ~0.3 s ahead
    let vT = sample(profile, s + speed * 0.3 + 2);
    const offTrack = !W.some((w) => w.onTrack);
    if (offTrack) vT = Math.min(vT, 16);
    const err = vT - speed;
    let thr, brk;
    if (err >= 0) { thr = Math.min(1, 0.3 + err * 0.45); brk = 0; }
    else { thr = err > -1.2 ? Math.max(0, 0.25 + err * 0.25) : 0; brk = err < -1.2 ? Math.min(1, (-err - 1.2) * 0.3) : 0; }

    // Traction control on driven wheels: back off the throttle ceiling when they pass peak.
    const uDrive = Math.max(drivenF ? uF : 0, drivenR ? uR : 0);
    if (uDrive > 1.02) thrCap = Math.max(0.15, thrCap - 0.08 * (uDrive - 1.02) * 10);
    else thrCap = Math.min(1, thrCap + 0.03);
    // Understeer (fronts past peak while steering hard): lift so weight moves forward.
    if (uF > 1.1 && Math.abs(out.steer) > 0.25 * dMax / maxLock) thrCap = Math.min(thrCap, 0.4);
    thr = Math.min(thr, thrCap);

    out.throttle = thr;
    out.brake = brk;
    out.handbrake = 0;
    out.shiftUp = false; out.shiftDown = false;
    out.gearMode = 'auto';
    out.nitrous = false;
    return out;
  }

  return { kind: 'pursuit', skill, reset, act, get gripScale() { return gripScale; } };
}
