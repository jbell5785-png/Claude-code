// Lap timing and progress tracking (owner D: tracks).
//
// Robust lap counting by arc-length progress: the loop is divided into K checkpoints (~150 m
// apart, a multiple of 3 so sector boundaries coincide with checkpoints). A lap only counts when
// the start/finish line is crossed forwards after every checkpoint has been passed in order.
// Reversing over a checkpoint/line "un-passes" it. Discontinuous jumps of the track position
// (cutting across the infield / chicanes so the projection jumps, or teleports) are never counted
// as progress and invalidate the lap; so does a long excursion with all four wheels off the
// asphalt+kerb (track limits).

import { DT, SURFACE } from './constants.js';

/**
 * @param {object} track  from createTrack()
 * @param {{ checkpointSpacing?: number, offTrackLimit?: number }} [opts]
 * @returns {object} lap timer `lt`; call lt.update(v) after every vehicle step.
 */
export function createLapTimer(track, opts = {}) {
  const L = track.length;
  const m = Math.max(2, Math.round(L / 3 / (opts.checkpointSpacing ?? 150)));
  const K = 3 * m;                       // segments; checkpoints at k*L/K for k = 1..K-1
  const NC = K - 1;
  const cps = new Float64Array(NC);
  for (let k = 0; k < NC; k++) cps[k] = ((k + 1) * L) / K;
  const sectorCp = [m - 1, 2 * m - 1];   // checkpoint index closing sector 1 and sector 2
  const offTrackLimit = opts.offTrackLimit ?? 8; // m of progress with all wheels off → invalid

  const q = { s: 0, offset: 0, height: 0, nx: 0, ny: 0, nz: 1, surface: 0, index: -1 };
  const wq = [0, 1, 2, 3].map(() => ({ s: 0, offset: 0, height: 0, nx: 0, ny: 0, nz: 1, surface: 0, index: -1 }));

  const lt = {
    track,
    lap: 0,                 // completed (valid or invalid) laps
    lapTime: 0,             // s, current lap (0 before the first crossing of the line)
    lastLap: null,          // s
    bestLap: null,          // s (valid laps only)
    lastLapValid: true,
    lapValid: true,         // current lap still valid
    sector: 0,              // current sector 0..2
    sectorTimes: [null, null, null], // current lap splits (s)
    lastSectors: [null, null, null],
    bestSectors: [null, null, null],
    progress: 0,            // m, net forward progress along the track since creation/reset
    maxProgress: 0,
    wrongWay: false,
    offTrack: false,        // all four wheels off asphalt+kerb
    offTrackTime: 0,        // s, total
    cuts: 0,                // detected position jumps / short cuts
    started: false,         // crossed the start line at least once
    checkpoint: 0,          // checkpoints passed in the current lap
    checkpoints: NC,
    s: 0, offset: 0, index: -1,
    time: 0,
    update, reset,
  };

  let init = false, lastS = 0, lastX = 0, lastY = 0, lastT = 0, lapStart = 0, sectorStart = 0;
  let wwTimer = 0, offProg = 0, ownTime = 0, hint = -1;
  const wHint = [-1, -1, -1, -1];

  function reset() {
    init = false; lt.lap = 0; lt.lapTime = 0; lt.lastLap = null; lt.bestLap = null;
    lt.lastLapValid = true; lt.lapValid = true; lt.sector = 0;
    lt.sectorTimes = [null, null, null]; lt.lastSectors = [null, null, null]; lt.bestSectors = [null, null, null];
    lt.progress = 0; lt.maxProgress = 0; lt.wrongWay = false; lt.offTrack = false; lt.offTrackTime = 0;
    lt.cuts = 0; lt.started = false; lt.checkpoint = 0; hint = -1; wwTimer = 0; offProg = 0; ownTime = 0;
    wHint.fill(-1);
  }

  function crossTime(t0, t1, sFrom, ds, target) {
    const f = ds !== 0 ? (target - sFrom) / ds : 1;
    return t0 + (t1 - t0) * Math.min(1, Math.max(0, f));
  }

  function completeSector(k, tCross) {
    const st = tCross - sectorStart;
    lt.sectorTimes[k] = st;
    sectorStart = tCross;
  }

  /**
   * Advance with the vehicle state (contract §5: v.pos, v.time, v.wheels[i].surface | .pos,
   * optional v.trackState {s, index}).
   */
  function update(v) {
    let t;
    if (typeof v.time === 'number') t = v.time; else { ownTime += DT; t = ownTime; }
    const x = v.pos[0], y = v.pos[1];
    let s, idx;
    const ts = v.trackState;
    if (ts && typeof ts.s === 'number' && ts.index >= 0 && Number.isFinite(ts.s)) { s = ts.s; idx = ts.index; lt.offset = ts.offset; }
    else { track.query(x, y, hint, q); s = q.s; idx = q.index; lt.offset = q.offset; }
    hint = idx;
    lt.s = s; lt.index = idx; lt.time = t;

    // all four wheels off asphalt + kerb?
    let off = false;
    if (v.wheels && v.wheels.length === 4) {
      off = true;
      for (let i = 0; i < 4; i++) {
        const w = v.wheels[i];
        let surf = w.surface;
        if (typeof surf !== 'number') {
          const p = w.pos || v.pos;
          track.query(p[0], p[1], wHint[i], wq[i]); wHint[i] = wq[i].index; surf = wq[i].surface;
        }
        if (surf === SURFACE.ASPHALT || surf === SURFACE.KERB) { off = false; break; }
      }
    } else {
      off = !(q.surface === SURFACE.ASPHALT || q.surface === SURFACE.KERB);
    }

    if (!init) {
      init = true; lastS = s; lastX = x; lastY = y; lastT = t;
      lt.checkpoint = NC; // pre-start: only the line crossing matters
      lt.offTrack = off;
      return lt;
    }
    const dt = Math.max(0, t - lastT);
    let ds = s - lastS;
    if (ds > L / 2) ds -= L; else if (ds < -L / 2) ds += L;
    const moved = Math.hypot(x - lastX, y - lastY);
    const jump = Math.abs(ds) > 3 * moved + 3;

    if (jump) {
      lt.cuts++;
      lt.lapValid = false;
    } else {
      // progress while fully off track is capped at the distance actually travelled, so cutting
      // across the inside of a corner/infield cannot gain more than driving would.
      lt.progress += off && ds > moved ? moved : ds;
      if (lt.progress > lt.maxProgress) lt.maxProgress = lt.progress;
      const sNew = lastS + ds; // unwrapped
      if (ds > 0) {
        // checkpoints in order
        if (lt.started) {
          while (lt.checkpoint < NC) {
            const c = cps[lt.checkpoint];
            const hit = (c > lastS && c <= sNew) || (sNew >= L && c + L > lastS && c + L <= sNew);
            if (!hit) break;
            const tc = crossTime(lastT, t, lastS, ds, c > lastS ? c : c + L);
            if (lt.checkpoint === sectorCp[0]) completeSector(0, tc);
            else if (lt.checkpoint === sectorCp[1]) completeSector(1, tc);
            lt.checkpoint++;
          }
        }
        if (sNew >= L) { // crossed the line forwards
          const tc = crossTime(lastT, t, lastS, ds, L);
          if (!lt.started) {
            lt.started = true; lapStart = tc; sectorStart = tc; lt.checkpoint = 0; lt.lapValid = true;
          } else if (lt.checkpoint >= NC) {
            completeSector(2, tc);
            const lapT = tc - lapStart;
            lt.lap++;
            lt.lastLap = lapT;
            lt.lastLapValid = lt.lapValid;
            lt.lastSectors = lt.sectorTimes.slice();
            if (lt.lapValid) {
              if (lt.bestLap === null || lapT < lt.bestLap) lt.bestLap = lapT;
              for (let k = 0; k < 3; k++) {
                const st = lt.sectorTimes[k];
                if (st != null && (lt.bestSectors[k] === null || st < lt.bestSectors[k])) lt.bestSectors[k] = st;
              }
            }
            lt.sectorTimes = [null, null, null];
            lapStart = tc; sectorStart = tc; lt.checkpoint = 0; lt.lapValid = true;
          }
        }
      } else if (ds < 0) {
        if (sNew < 0) {
          // reversed over the line: forward crossing again must not count
          if (lt.started && lt.checkpoint >= NC) lt.checkpoint = NC - 1;
        }
        // un-pass checkpoints crossed backwards
        while (lt.started && lt.checkpoint > 0 && lt.checkpoint <= NC) {
          const c = cps[lt.checkpoint - 1];
          const hit = (c <= lastS && c > sNew) || (sNew < 0 && c - L <= lastS && c - L > sNew);
          if (!hit) break;
          lt.checkpoint--;
        }
      }
    }

    // wrong way: moving backwards along the track for > 0.5 s
    const along = dt > 0 && !jump ? ds / dt : 0;
    if (along < -1) wwTimer += dt; else if (along > 0.5) wwTimer = 0;
    lt.wrongWay = wwTimer > 0.5;

    // track limits
    lt.offTrack = off;
    if (off) {
      lt.offTrackTime += dt;
      if (!jump && ds > 0) offProg += ds;
      if (offProg > offTrackLimit) lt.lapValid = false;
    } else offProg = 0;

    lt.sector = !lt.started ? 0 : lt.checkpoint > sectorCp[1] ? 2 : lt.checkpoint > sectorCp[0] ? 1 : 0;
    lt.lapTime = lt.started ? t - lapStart : 0;
    lastS = s; lastX = x; lastY = y; lastT = t;
    return lt;
  }

  return lt;
}
