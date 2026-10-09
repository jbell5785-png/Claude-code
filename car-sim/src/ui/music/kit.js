// Builds a per-song drum kit (AudioBuffers) and the song's breakbeat loop from plain-JS DSP.
import {
  synthKick, synthSnare, synthClap, synthHat, synthCymbal, synthTom, synthRim, synthShaker,
  renderBreakLoop, makeImpulse,
} from './dsp.js';
import { mulberry32 } from './rng.js';

function toBuffer(ctx, data) {
  const b = ctx.createBuffer(1, data.length, ctx.sampleRate);
  b.getChannelData(0).set(data);
  return b;
}

function reversed(data) {
  const r = new Float32Array(data.length);
  for (let i = 0; i < data.length; i++) r[i] = data[data.length - 1 - i];
  return r;
}

/** Per-style drum tone (kick/snare character). */
const STYLE_KIT = {
  dnb: {
    kick: { f0: 230, f1: 52, pTau: 0.028, hold: 0.02, aTau: 0.16, click: 0.6, drive: 2.2, dur: 0.45 },
    snare: { tone: 195, toneDecay: 0.06, noise: 1.0, toneAmt: 0.8, noiseDecay: 0.12, nhp: 1300, nlp: 10000, crack: 4500, drive: 2.4 },
  },
  breaks: {
    kick: { f0: 200, f1: 50, pTau: 0.035, hold: 0.03, aTau: 0.2, click: 0.5, drive: 3.0, dur: 0.5 },
    snare: { tone: 180, toneDecay: 0.08, noise: 1.0, toneAmt: 0.9, noiseDecay: 0.16, nhp: 900, nlp: 9000, crack: 3500, drive: 3.0 },
  },
  garage: {
    kick: { f0: 170, f1: 48, pTau: 0.032, hold: 0.04, aTau: 0.22, click: 0.35, drive: 1.6, dur: 0.55 },
    snare: { tone: 230, toneDecay: 0.05, noise: 0.9, toneAmt: 0.6, noiseDecay: 0.1, nhp: 1800, nlp: 11000, crack: 5000, drive: 1.6 },
  },
  acid: {
    kick: { f0: 190, f1: 46, pTau: 0.03, hold: 0.06, aTau: 0.21, click: 0.45, drive: 2.6, dur: 0.55 },
    snare: { tone: 200, toneDecay: 0.06, noise: 1.0, toneAmt: 0.6, noiseDecay: 0.13, nhp: 1200, nlp: 10000, crack: 4000, drive: 2.0 },
  },
};

/**
 * @param {BaseAudioContext} ctx
 * @param {object} song   generated song (uses style, seed, bpm, breakHits)
 */
export function createKit(ctx, song) {
  const sr = ctx.sampleRate;
  const rnd = mulberry32(song.seed ^ 0x5eed);
  const base = STYLE_KIT[song.style] || STYLE_KIT.dnb;
  const tune = 1 + (rnd() - 0.5) * 0.12;
  const kickP = { ...base.kick, f1: base.kick.f1 * tune };
  const snareP = { ...base.snare, tone: base.snare.tone * tune };
  const data = {
    kick: synthKick(sr, rnd, kickP),
    snare: synthSnare(sr, rnd, snareP),
    clap: synthClap(sr, rnd),
    hat: synthHat(sr, rnd, { decay: 0.028, noise: 0.35, base: 330 + rnd() * 60, hp: 7500, lp: 11500 }),
    ohat: synthHat(sr, rnd, { decay: 0.16, noise: 0.4, base: 330 + rnd() * 60, hp: 6500, lp: 11000 }),
    ride: synthCymbal(sr, rnd, { dur: 1.4, base: 520, noise: 0.25, hp: 3500, decay: 0.45, bell: 2850, bellAmt: 0.18 }),
    crash: synthCymbal(sr, rnd, { dur: 2.4, base: 410, noise: 0.6, hp: 2500, decay: 0.7, bell: 1900, bellAmt: 0.05, attack: 0.002 }),
    tomHi: synthTom(sr, rnd, 170 * tune),
    tomLo: synthTom(sr, rnd, 105 * tune),
    rim: synthRim(sr, rnd),
    shaker: synthShaker(sr, rnd),
  };
  // break kit: rounder vintage kick, ringing cracky snare, dirtier hats
  const bk = {
    kick: synthKick(sr, rnd, { f0: 150, f1: 62 * tune, pTau: 0.03, hold: 0.01, aTau: 0.1, click: 0.7, drive: 3, dur: 0.35 }),
    snare: synthSnare(sr, rnd, { tone: 215 * tune, toneDecay: 0.11, noise: 1, toneAmt: 1.0, noiseDecay: 0.15, nhp: 700, nlp: 8000, crack: 3000, drive: 3.2 }),
    ghost: null,
    hat: synthHat(sr, rnd, { decay: 0.045, noise: 0.6, base: 300, hp: 5500, lp: 9000 }),
    ohat: synthHat(sr, rnd, { decay: 0.2, noise: 0.6, base: 300, hp: 5000, lp: 9000 }),
    ride: synthCymbal(sr, rnd, { dur: 1.0, base: 480, noise: 0.35, hp: 3000, decay: 0.35, bell: 2600, bellAmt: 0.25 }),
  };
  bk.ghost = bk.snare;
  const loop = renderBreakLoop(sr, rnd, song.bpm, bk, song.breakHits);

  const kit = {};
  for (const k of Object.keys(data)) kit[k] = toBuffer(ctx, data[k]);
  kit.crashRev = toBuffer(ctx, reversed(data.crash));
  kit.breakLoop = toBuffer(ctx, loop);
  kit.breakLoopRev = toBuffer(ctx, reversed(loop));
  kit.breakStepDur = 60 / song.bpm / 4;
  return kit;
}

const shared = new WeakMap();

/** Context-wide shared buffers: white noise loop and the reverb impulse. */
export function sharedBuffers(ctx) {
  let s = shared.get(ctx);
  if (s) return s;
  const sr = ctx.sampleRate;
  const rnd = mulberry32(1234567);
  const nn = Math.floor(sr * 2);
  const noise = ctx.createBuffer(1, nn, sr);
  const nd = noise.getChannelData(0);
  for (let i = 0; i < nn; i++) nd[i] = rnd() * 2 - 1;
  const [l, r] = makeImpulse(sr, 2.2, rnd);
  const ir = ctx.createBuffer(2, l.length, sr);
  ir.getChannelData(0).set(l);
  ir.getChannelData(1).set(r);
  s = { noise, ir };
  shared.set(ctx, s);
  return s;
}
