// Deterministic training episode: one genome, one car, one scenario → fitness.
// Environment-agnostic (Node main thread, worker_threads, Web Workers).
//
// Fitness = metres of forward progress (lap timer) + 100 per completed lap
//           − 30 for leaving the track (all four wheels off for > 0.5 s, episode ends)
//           − 30 for driving the wrong way (episode ends)
//           − 100 for hitting an obstacle (episode ends)
// Early termination also when stuck (< 3 m progress in 3 s after the first 4 s).
// Compute is metered in simulated car-seconds (steps × DT), the unit of the competition budget.

import { DT } from '../sim/constants.js';
import { createTrack, createLapTimer } from '../sim/track.js';
import { createVehicle } from '../sim/vehicle.js';
import { build } from '../sim/build.js';
import { createNeuralDriver } from './neural.js';
import { DRIVER_HZ } from './driver.js';

const trackCache = new Map();
/** Cached track by key string ('club', 'random:7') or random spec object. */
export function getTrack(t) {
  const key = typeof t === 'string' ? t : JSON.stringify(t);
  let tr = trackCache.get(key);
  if (!tr) {
    tr = createTrack(t);
    trackCache.set(key, tr);
    if (trackCache.size > 24) trackCache.delete(trackCache.keys().next().value);
  }
  return tr;
}

const vehCache = new Map();
function getVehicle(params, track, pose) {
  const k = track;
  let e = vehCache.get(k);
  if (!e || e.params !== params) { e = { params, v: createVehicle(params, track, pose), lt: createLapTimer(track) }; vehCache.set(k, e); }
  else e.v.reset(pose);
  e.lt.reset();
  return e;
}

const paramsCache = new Map();
export function getParams(spec) {
  const k = JSON.stringify(spec);
  let p = paramsCache.get(k);
  if (!p) { p = build(spec); paramsCache.set(k, p); }
  return p;
}

/** True if the car's CG footprint overlaps an obstacle (approximate, car half-width 1 m). */
function hitsObstacle(track, x, y) {
  for (const ob of track.obstacles || []) {
    const dx = x - ob.x, dy = y - ob.y;
    if (ob.kind === 'box') {
      const c = Math.cos(ob.heading || 0), s = Math.sin(ob.heading || 0);
      if (Math.abs(c * dx + s * dy) < ob.hx + 1.2 && Math.abs(-s * dx + c * dy) < ob.hy + 1.0) return true;
    } else if (dx * dx + dy * dy < (ob.r + 1.1) ** 2) return true;
  }
  return false;
}

/**
 * Run one episode.
 * @param {object} o { spec | params, arch, weights (Float32Array), scenario: { track, startS, duration } }
 * @returns {{ fitness, carSeconds, progress, laps, end: 'time'|'offtrack'|'wrongway'|'crash'|'stuck', bestLap }}
 */
export function runEpisode(o) {
  const params = o.params || getParams(o.spec);
  const track = getTrack(o.scenario.track);
  const sc = o.scenario;
  const p = track.pointAt(((sc.startS ?? 0) % track.length + track.length) % track.length, {});
  const pose = sc.startS == null ? track.startPose(0) : { x: p.x, y: p.y, heading: p.heading ?? Math.atan2(p.ty, p.tx) };
  const { v, lt } = getVehicle(params, track, pose);
  const driver = o.driver || createNeuralDriver({ arch: o.arch, weights: o.weights });
  driver.reset(v, track);
  const controls = { steer: 0, throttle: 0, brake: 0, handbrake: 0, shiftUp: false, shiftDown: false, gearMode: 'auto', nitrous: false };
  const world = { cars: [v], time: 0 };
  const every = Math.max(1, Math.round(1 / (DT * DRIVER_HZ)));
  const nSteps = Math.round((sc.duration ?? 20) / DT);
  let end = 'time', penalty = 0, offT = 0, step = 0, checkP = 0, checkT = 0;
  for (; step < nSteps; step++) {
    if (step % every === 0) {
      world.time = step * DT;
      driver.act(v, track, world, controls);
      const t = step * DT;
      if (lt.offTrack) offT += 1 / DRIVER_HZ; else offT = 0;
      if (offT > 0.5) { end = 'offtrack'; penalty = 30; break; }
      if (lt.wrongWay) { end = 'wrongway'; penalty = 30; break; }
      if (hitsObstacle(track, v.pos[0], v.pos[1])) { end = 'crash'; penalty = 100; break; }
      if (!(v.pos[0] === v.pos[0])) { end = 'crash'; penalty = 100; break; }
      if (t >= 4 && t - checkT >= 3) { if (lt.progress - checkP < 3) { end = 'stuck'; break; } checkP = lt.progress; checkT = t; }
    }
    v.step(controls);
    lt.update(v);
  }
  const progress = lt.progress;
  const fitness = progress + 100 * lt.lap - penalty;
  return { fitness, carSeconds: step * DT, progress, laps: lt.lap, end, bestLap: lt.bestLap };
}
