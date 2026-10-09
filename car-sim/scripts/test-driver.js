// Closed-loop lap test for the built-in racing-line driver on the real physics.
// node scripts/test-driver.js [--tracks gp,club] [--presets hotHatch,supercar] [--skill 0.85] [--laps 2]
import { build } from '../src/sim/build.js';
import { PRESETS } from '../src/sim/presets.js';
import { createVehicle } from '../src/sim/vehicle.js';
import { createTrack, createLapTimer } from '../src/sim/track.js';
import { createDriver, DRIVER_HZ } from '../src/ai/driver.js';
import { DT } from '../src/sim/constants.js';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const tracks = arg('tracks', 'gp,club,mountain,gauntlet,speedway').split(',');
const presets = arg('presets', 'hotHatch,naCoupe,supercar,rallySaloon,evSaloon,muscleV8').split(',');
const skill = Number(arg('skill', 0.85));
const laps = Number(arg('laps', 2));
const verbose = process.argv.includes('--verbose');

let fails = 0;
console.log(`skill ${skill}, ${laps} laps (lap 1 is a standing start)`);
console.log('track      preset        laps  best lap   off-track  wallish  max|α_f|  max usage_f  cuts');
for (const tk of tracks) {
  const track = createTrack(tk);
  for (const pk of presets) {
    if (!PRESETS[pk]) continue;
    const p = build(PRESETS[pk].spec);
    const v = createVehicle(p, track, track.startPose(0));
    const d = createDriver('pursuit', { skill });
    d.reset(v, track);
    const lt = createLapTimer(track);
    const c = { steer: 0, throttle: 0, brake: 0, handbrake: 0, shiftUp: false, shiftDown: false, gearMode: 'auto', nitrous: false };
    const every = Math.round(1 / DT / DRIVER_HZ);
    let off = 0, wallish = 0, maxA = 0, maxU = 0, bad = false;
    const offAt = [];
    const tMax = 150 * laps;
    for (let i = 0; i < tMax / DT && lt.lap < laps; i++) {
      if (i % every === 0) d.act(v, track, { cars: [v], time: v.time }, c);
      v.step(c); lt.update(v);
      const onAny = v.wheels.some((w) => w.onTrack);
      if (!onAny) { off += DT; if (offAt.length < 12 && (offAt.length === 0 || Math.abs(offAt[offAt.length - 1] - v.trackState.s) > 30)) offAt.push(Math.round(v.trackState.s)); }
      const ts = v.trackState;
      if (Math.abs(ts.offset) > 25) wallish += DT;
      const a = Math.max(Math.abs(v.wheels[0].slipAngle), Math.abs(v.wheels[1].slipAngle));
      if (v.speed > 10) { maxA = Math.max(maxA, a); maxU = Math.max(maxU, v.wheels[0].usage, v.wheels[1].usage); }
      if (!Number.isFinite(v.pos[0])) { bad = true; break; }
    }
    const best = lt.bestLap != null ? lt.bestLap.toFixed(2) + ' s' : '   -   ';
    const ok = !bad && lt.lap >= laps && off < 1.0;
    if (!ok) fails++;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${tk.padEnd(9)} ${pk.padEnd(12)} ${String(lt.lap).padStart(3)}  ${best.padStart(9)}  ${off.toFixed(1).padStart(7)} s  ${wallish.toFixed(1).padStart(5)} s  ${(maxA * 57.3).toFixed(1).padStart(6)}°  ${maxU.toFixed(2).padStart(8)}  ${lt.cuts ?? '-'}`);
    if (verbose && offAt.length) console.log('       off-track near s =', offAt.join(', '));
  }
}
console.log(fails ? `\n${fails} FAILED` : '\nall driver laps clean');
process.exit(fails ? 1 : 0);
