// Classical racing-line driver: pure-pursuit steering on the racing line + speed-profile tracking.
// Used as the built-in opponent in Race mode and as a baseline the learning AIs must beat.

import { racingLine, speedProfile } from './racingline.js';

/**
 * @param {object} opts { skill 0..1 (default 0.85), aggression 0..1, seed }
 */
export function createPursuitDriver(opts = {}) {
  const skill = opts.skill ?? 0.85;
  const aggression = opts.aggression ?? 0.5;
  let line = null, profile = null, track = null, params = null;
  let laneShift = 0;           // m, temporary offset for overtaking / avoiding cars
  const p = {};

  function reset(vehicle, trk) {
    track = trk; params = vehicle.params;
    line = racingLine(track);
    profile = speedProfile(line, params, skill);
    laneShift = 0;
  }

  /** Lateral offset of the line at arc length s (linear interpolation). */
  function lineOffsetAt(s) {
    const n = line.n, f = (((s / line.ds) % n) + n) % n, i = Math.floor(f), j = (i + 1) % n, t = f - i;
    return line.offset[i] * (1 - t) + line.offset[j] * t;
  }
  function speedAt(s) {
    const n = line.n, f = (((s / line.ds) % n) + n) % n, i = Math.floor(f), j = (i + 1) % n, t = f - i;
    return profile[i] * (1 - t) + profile[j] * t;
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

    // --- traffic: shift lane to pass a slower car ahead that sits on our line
    let wantShift = 0;
    if (world && world.cars) {
      for (const o of world.cars) {
        if (o === v) continue;
        let ds = o.trackState.s - s;
        if (ds < -track.length / 2) ds += track.length; else if (ds > track.length / 2) ds -= track.length;
        if (ds <= 0 || ds > 18 + speed * 0.8) continue;
        const myLat = lineOffsetAt(s) + laneShift;
        const dLat = o.trackState.offset - myLat;
        if (Math.abs(dLat) > 2.6 || o.speed > speed - 0.5) continue;
        pointAt(s + ds);
        const roomL = p.widthL - o.trackState.offset, roomR = p.widthR + o.trackState.offset;
        wantShift = roomL > roomR ? Math.min(3.2, roomL - 1.6) : -Math.min(3.2, roomR - 1.6);
        wantShift *= 0.6 + 0.4 * aggression;
      }
    }
    laneShift += (wantShift - laneShift) * 0.04;

    // --- pure pursuit on the (possibly shifted) racing line
    const look = Math.min(45, Math.max(7, 4 + speed * 0.42));
    const sT = s + look;
    pointAt(sT);
    let off = lineOffsetAt(sT) + laneShift;
    off = Math.max(-p.widthR + 1.0, Math.min(p.widthL - 1.0, off));
    const tx = p.x + off * p.nx, ty = p.y + off * p.ny;
    const c = Math.cos(v.heading), sn = Math.sin(v.heading);
    const dx = tx - v.pos[0], dy = ty - v.pos[1];
    const lx = c * dx + sn * dy, ly = -sn * dx + c * dy;
    const alpha = Math.atan2(ly, Math.max(0.1, lx));
    const L = params.geometry.wheelbase;
    let delta = Math.atan2(2 * L * Math.sin(alpha), Math.hypot(lx, ly));
    // Counter-steer a slide: damp yaw rate beyond what the path needs.
    const yawNeeded = speed * (2 * Math.sin(alpha) / Math.max(1, Math.hypot(lx, ly)));
    delta -= 0.05 * (v.angVel[2] - yawNeeded);
    out.steer = Math.max(-1, Math.min(1, delta / params.steering.maxLock));

    // --- speed tracking against the profile, anticipating ~0.25 s ahead
    let vT = speedAt(s + speed * 0.25 + 2);
    if (Math.abs(v.trackState.offset) > Math.min(p.widthL, p.widthR) + 1) vT = Math.min(vT, 18); // off track: recover
    const err = vT - speed;
    if (err >= 0) {
      out.throttle = Math.min(1, 0.35 + err * 0.5);
      out.brake = 0;
    } else {
      out.throttle = err > -1.0 ? Math.max(0, 0.3 + err * 0.3) : 0;
      out.brake = err < -1.0 ? Math.min(1, (-err - 1.0) * 0.35) : 0;
    }
    out.handbrake = 0;
    out.shiftUp = false; out.shiftDown = false;
    out.gearMode = 'auto';
    return out;
  }

  function pointAt(s) { return track.pointAt(s, p); }

  return { kind: 'pursuit', skill, reset, act };
}
