// Seeded procedural song generator. A song is pure data (no audio nodes): style, key, tempo,
// harmony, motifs, riffs, drum patterns and an arrangement. The sequencer realises it.
import { makeRng } from './rng.js';
import { SCALES, NOTE_NAMES } from './theory.js';
import { STYLES, STYLE_KEYS } from './styles.js';

const PRE = ['Turbo', 'Apex', 'Nitro', 'Chrome', 'Hyper', 'Neon', 'Slipstream', 'Redline', 'Overdrive',
  'Drift', 'Boost', 'Torque', 'Ghost', 'Phantom', 'Rotary', 'Chicane', 'Pole Position', 'Grid', 'Rally',
  'Velocity', 'Afterburner', 'Hot Lap', 'Pit Lane', 'Launch Control', 'Downforce', 'Rev Limiter',
  'Hairpin', 'Paddle Shift', 'Night Circuit', 'Burnout', 'Wheelspin', 'Gravel Trap', 'Full Throttle',
  'Lap Record', 'Kerb Hopper', 'Sector Three', 'Apex Predator', 'Nitrous', 'Slick Tyre'];
const NOUN = ['Hunter', 'Riddim', 'Dub', 'Anthem', 'Run', 'Pressure', 'Theory', 'Fever', 'Rush', 'Ritual',
  'Bounce', 'System', 'Funk', 'Mirage', 'Circuit', 'Lag', 'Bandit', 'Junkie', 'Shuffle', 'Patrol',
  'Syndrome', 'Signal', 'Mission', 'Fury', 'Motion', 'Dreams', 'Warning', 'Business', 'Vibes', 'Killer',
  'Express', 'Frequency', 'Overload', 'Stomp', 'Ghost Town'];

function makeTitle(rng, S) {
  const pre = rng.pick(PRE);
  const noun = rng.pick(NOUN);
  const word = rng.pick(S.words);
  const form = rng.int(0, 4);
  let t;
  if (form === 0) t = `${pre} ${noun}`;
  else if (form === 1) t = `${pre} ${word}`;
  else if (form === 2) t = `${word} ${noun}`;
  else if (form === 3) t = `The ${pre} ${noun}`;
  else t = `${pre} ${noun}`;
  const suf = rng.chance(0.45) ? rng.pick(S.suffixes) : '';
  return suf ? `${t} ${suf}` : t;
}

/** Melodic motif: call (ends unresolved) + response (resolves). Degrees are absolute scale degrees. */
function makeMotif(rng, S) {
  const rhythm = rng.pick(S.motifRhythms);
  let d = rng.pick([0, 2, 4, 4, 7]);
  const degs = [];
  for (let i = 0; i < rhythm.length; i++) {
    if (i > 0) {
      const r = rng.next();
      if (r < 0.5) d += rng.pick([-1, 1]);
      else if (r < 0.8) d += rng.pick([-2, 2, -3, 3]);
      else d = rng.pick([0, 2, 4, 7, 9]);
      d = Math.max(-2, Math.min(9, d));
    }
    degs.push(d);
  }
  const call = rhythm.map(([s, l], i) => ({ s, l, d: degs[i] }));
  // the call ends on tension (2nd, 5th, 7th) ...
  const last = call[call.length - 1];
  const tension = [1, 4, 6, 8].reduce((a, b) => (Math.abs(b - last.d) < Math.abs(a - last.d) ? b : a));
  last.d = tension;
  // ... and the response answers: same opening, ends home (root/3rd)
  const resp = call.map((n) => ({ ...n }));
  if (resp.length > 2 && rng.chance(0.6)) resp[resp.length - 2].d += rng.pick([-1, 1, 2]);
  const rl = resp[resp.length - 1];
  rl.d = [0, 2, 7].reduce((a, b) => (Math.abs(b - rl.d) < Math.abs(a - rl.d) ? b : a));
  // development: inverted contour around the first note, ending home
  const pivot = call[0].d;
  const inv = call.map((n) => ({ ...n, d: Math.max(-3, Math.min(10, 2 * pivot - n.d)) }));
  inv[inv.length - 1].d = rl.d;
  return { call, resp, inv };
}

function makeBreak(rng) {
  const hits = [];
  const add = (step, s, g) => hits.push({ step, s, g });
  for (let bar = 0; bar < 2; bar++) {
    const o = bar * 16;
    add(o, 'kick', 1);
    add(o + 4, 'snare', 0.95);
    add(o + 12, 'snare', bar === 1 && rng.chance(0.5) ? 0.8 : 0.95);
    if (bar === 0) {
      add(o + 2, 'kick', 0.85);
      add(o + 10, 'kick', 0.9);
      if (rng.chance(0.6)) add(o + 11, 'kick', 0.75);
      if (rng.chance(0.8)) add(o + 7, 'ghost', 0.38);
      if (rng.chance(0.7)) add(o + 9, 'ghost', 0.42);
      if (rng.chance(0.5)) add(o + 15, 'ghost', 0.35);
    } else {
      add(o + 2, 'kick', 0.85);
      if (rng.chance(0.5)) add(o + 10, 'kick', 0.85);
      else add(o + 11, 'kick', 0.85);
      add(o + 7, 'ghost', 0.4);
      if (rng.chance(0.6)) add(o + 9, 'ghost', 0.45);
      if (rng.chance(0.6)) add(o + 14, 'snare', 0.7);
      else add(o + 15, 'ghost', 0.4);
    }
    const ride = rng.chance(0.35);
    for (let s = 0; s < 16; s += 2) {
      if (bar === 1 && s === 14 && rng.chance(0.5)) add(o + s, 'ohat', 0.45);
      else add(o + s, ride ? 'ride' : 'hat', s % 4 === 0 ? 0.55 : 0.4);
    }
  }
  return hits;
}

function makeAcid(rng) {
  const A = [];
  for (let s = 0; s < 16; s++) {
    const gate = s === 0 || rng.chance(s % 4 === 0 ? 0.85 : 0.62);
    const d = s === 0 ? 0 : rng.weighted([0, 7, 2, 4, 6, -1, 1, 9], [10, 4, 2, 3, 2, 2, 1, 1]);
    A.push({ gate, d, acc: rng.chance(0.3), sl: s > 0 && rng.chance(0.22) });
  }
  const B = A.map((x) => ({ ...x }));
  for (let k = 0; k < 4; k++) {
    const i = rng.int(1, 15);
    B[i] = { gate: true, d: rng.pick([0, 7, 4, 2, 9]), acc: rng.chance(0.5), sl: rng.chance(0.3) };
  }
  return { A, B };
}

function makeVox(rng, motif) {
  const pairs = [['o', 'a'], ['a', 'e'], ['e', 'i'], ['u', 'a'], ['a', 'y'], ['i', 'o'], ['o', 'u']];
  const chop = (notes) => {
    const out = [];
    for (const n of notes) {
      const [v1, v2] = rng.pick(pairs);
      if (n.l >= 3 && rng.chance(0.6)) {
        // stutter long notes into re-triggered syllables
        const parts = n.l >= 4 ? 2 : 1;
        for (let k = 0; k <= parts; k++) {
          const s = n.s + k * Math.floor(n.l / (parts + 1));
          out.push({ s, l: 1, d: n.d, v1: k % 2 ? v2 : v1, v2: k % 2 ? v1 : v2 });
        }
      } else out.push({ s: n.s, l: Math.min(n.l, 2), d: n.d, v1, v2 });
    }
    return out;
  };
  return { call: chop(motif.call), resp: chop(motif.resp) };
}

/**
 * @param {number} seed
 * @param {string} style  'dnb'|'breaks'|'garage'|'acid'
 */
export function generateSong(seed, style) {
  if (!STYLES[style]) style = STYLE_KEYS[seed % STYLE_KEYS.length];
  const S = STYLES[style];
  const rng = makeRng(seed);
  const bpm = Math.round(rng.range(S.bpm[0], S.bpm[1] + 0.99));
  const scaleName = rng.pick(S.scales);
  const tonic = rng.int(S.rootRange[0], S.rootRange[1]);
  const progression = rng.pick(S.progressions);
  const chordBars = rng.pick(S.chordBars);
  const motif = makeMotif(rng.fork('motif'), S);
  const [kickA, kickB] = rng.pick(S.kicks);
  const riff = S.riffs ? rng.pick(S.riffs) : null;
  const intro = style === 'garage' || style === 'acid' ? rng.pick([8, 16]) : 8;
  const song = {
    seed,
    style,
    styleLabel: S.label,
    title: makeTitle(rng.fork('title'), S),
    bpm,
    swing: rng.range(S.swing[0], S.swing[1]),
    scaleName,
    scale: SCALES[scaleName],
    tonic,
    keyName: `${NOTE_NAMES[tonic % 12]} ${scaleName === 'aeolian' ? 'minor' : scaleName}`,
    progression,
    chordBars,
    chordSize: S.chordSize,
    motif,
    vox: null,
    stabRhythm: rng.pick(S.stabRhythms),
    riff,
    riffLen: S.riffLen,
    acid: style === 'acid' || (style === 'breaks' && rng.chance(0.35)) ? makeAcid(rng.fork('acid')) : null,
    kickA,
    kickB,
    breakHits: makeBreak(rng.fork('break')),
    arpPattern: rng.pick([[0, 1, 2, 1], [0, 2, 1, 2], [0, 1, 2, 3], [2, 1, 0, 1], [0, 2, 3, 1]]),
    arpRate: rng.pick([1, 2]), // steps per arp note
    rimSteps: rng.pick([[3, 7, 14], [6, 9, 15], [3, 10], [7, 13, 14]]),
    finalTranspose: rng.pick([1, 2, 2]),
    chopSeed: rng.int(1, 1e9),
    arrangement: [
      { name: 'intro', bars: intro },
      { name: 'build', bars: 8 },
      { name: 'drop', bars: 16 },
      { name: 'break', bars: 8 },
      { name: 'build2', bars: 4 },
      { name: 'drop2', bars: 16 },
      { name: 'outro', bars: 8 },
    ],
  };
  song.vox = makeVox(rng.fork('vox'), motif);
  return song;
}
