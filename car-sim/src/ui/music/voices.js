// Web Audio synth voices. Mono basses are persistent (oscillators run continuously, notes are
// parameter automation) so they cost no node allocation per note and can glide like a 303.
// Poly voices (stabs, pads, leads...) are one-shot graphs that are released after they end.
import { mtof } from './theory.js';
import { driveCurve } from './dsp.js';

// ----------------------------------------------------------------------------- MonoSynth

/**
 * Persistent monophonic synth: N oscillators -> 2x lowpass -> drive -> VCA, plus a sine sub
 * that bypasses the filter, plus an LFO on the filter cutoff (reese movement / garage wobble).
 */
export class MonoSynth {
  constructor(ctx, dest, cfg) {
    this.ctx = ctx;
    this.cfg = cfg;
    this.oscs = [];
    this.lastFreq = 0;
    const mixer = ctx.createGain();
    for (const o of cfg.oscs) {
      const osc = ctx.createOscillator();
      osc.type = o.type;
      osc.detune.value = o.detune || 0;
      const g = ctx.createGain();
      g.gain.value = o.g;
      osc.connect(g).connect(mixer);
      this.oscs.push({ osc, mult: o.mult || 1 });
    }
    this.f1 = ctx.createBiquadFilter();
    this.f1.type = 'lowpass';
    this.f1.Q.value = cfg.q;
    this.f1.frequency.value = cfg.cutoff;
    this.f2 = ctx.createBiquadFilter();
    this.f2.type = 'lowpass';
    this.f2.Q.value = cfg.q2 ?? 0.6;
    this.f2.frequency.value = cfg.cutoff;
    this.filters = [this.f1, this.f2];
    this.vca = ctx.createGain();
    this.vca.gain.value = 0;
    let node = mixer.connect(this.f1).connect(this.f2);
    if (cfg.drive) {
      const pre = ctx.createGain();
      pre.gain.value = cfg.preGain ?? 1;
      const ws = ctx.createWaveShaper();
      ws.curve = driveCurve(cfg.drive);
      node = node.connect(pre).connect(ws);
    }
    if (cfg.hp) {
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = cfg.hp;
      node = node.connect(hp);
    }
    node.connect(this.vca);
    this.out = ctx.createGain();
    this.out.gain.value = cfg.level ?? 1;
    this.vca.connect(this.out).connect(dest);
    if (cfg.sub) {
      this.sub = ctx.createOscillator();
      this.sub.type = 'sine';
      this.subVca = ctx.createGain();
      this.subVca.gain.value = 0;
      this.sub.connect(this.subVca).connect(this.out);
    }
    if (cfg.lfo) {
      this.lfo = ctx.createOscillator();
      this.lfo.frequency.value = cfg.lfo.rate;
      this.lfoGain = ctx.createGain();
      this.lfoGain.gain.value = cfg.lfo.depth;
      this.lfo.connect(this.lfoGain);
      for (const f of this.filters) this.lfoGain.connect(f.frequency);
    }
  }

  start(t) {
    for (const o of this.oscs) o.osc.start(t);
    if (this.sub) this.sub.start(t);
    if (this.lfo) this.lfo.start(t);
  }

  stop(t) {
    try {
      for (const o of this.oscs) o.osc.stop(t);
      if (this.sub) this.sub.stop(t);
      if (this.lfo) this.lfo.stop(t);
    } catch (_) { /* already stopped */ }
  }

  disconnect() {
    try { this.out.disconnect(); } catch (_) { /* noop */ }
  }

  /**
   * @param {number} t start time
   * @param {number} midi
   * @param {number} dur seconds
   * @param {{vel?:number, slide?:boolean, hold?:boolean, accent?:boolean, cutoff?:number,
   *   env?:number, decay?:number, wob?:number, wobDepth?:number}} o
   */
  note(t, midi, dur, o = {}) {
    const c = this.cfg;
    const f = mtof(midi);
    const vel = (o.vel ?? 1) * (o.accent ? 1.25 : 1);
    const glide = c.glide ?? 0.06;
    for (const { osc, mult } of this.oscs) {
      const p = osc.frequency;
      if (o.slide && this.lastFreq) {
        p.setValueAtTime(this.lastFreq * mult, t);
        p.exponentialRampToValueAtTime(f * mult, t + glide);
      } else {
        p.setValueAtTime(f * mult, t);
      }
    }
    if (this.sub) {
      const p = this.sub.frequency;
      const sm = c.subMult ?? 1;
      if (o.slide && this.lastFreq) {
        p.setValueAtTime(this.lastFreq * sm, t);
        p.exponentialRampToValueAtTime(f * sm, t + glide);
      } else p.setValueAtTime(f * sm, t);
    }
    this.lastFreq = f;
    // amplitude gate
    const atk = c.attack ?? 0.004;
    const rel = c.release ?? 0.04;
    if (!o.slide) {
      this.vca.gain.setTargetAtTime(vel, t, atk);
      if (this.subVca) this.subVca.gain.setTargetAtTime(c.sub * (o.subVel ?? 1), t, atk * 2);
    } else {
      this.vca.gain.setTargetAtTime(vel, t, 0.01);
    }
    if (!o.hold) {
      this.vca.gain.setTargetAtTime(0, t + dur, rel);
      if (this.subVca) this.subVca.gain.setTargetAtTime(0, t + dur, rel * 1.5);
    }
    // filter envelope (a 303 slide does not retrigger the envelope)
    const base = Math.max(40, o.cutoff ?? c.cutoff);
    if (!o.slide || c.envOnSlide) {
      const env = (o.env ?? c.env) * (o.accent ? 1.6 : 1);
      const dec = (o.decay ?? c.decay) * (o.accent ? 0.7 : 1);
      for (const fl of this.filters) {
        fl.frequency.setTargetAtTime(Math.min(16000, base + env), t, 0.0015);
        fl.frequency.setTargetAtTime(base, t + 0.006, dec);
      }
    } else {
      for (const fl of this.filters) fl.frequency.setTargetAtTime(base, t, 0.05);
    }
    if (this.lfo && o.wob !== undefined) {
      this.lfo.frequency.setValueAtTime(o.wob || 0.5, t);
      this.lfoGain.gain.setTargetAtTime(o.wob ? (o.wobDepth ?? c.lfo.wobDepth ?? 600) : c.lfo.depth, t, 0.01);
    }
  }

  /** Cancel automation from `t` on (used when the arrangement is re-anchored for a drop). */
  cancel(t) {
    const params = [this.vca.gain, ...this.filters.map((f) => f.frequency), ...this.oscs.map((o) => o.osc.frequency)];
    if (this.subVca) params.push(this.subVca.gain, this.sub.frequency);
    for (const p of params) p.cancelScheduledValues(t);
    this.vca.gain.setTargetAtTime(0, t, 0.01);
    if (this.subVca) this.subVca.gain.setTargetAtTime(0, t, 0.01);
  }
}

export const BASS_PRESETS = {
  reese: {
    oscs: [
      { type: 'sawtooth', detune: -15, g: 0.45 },
      { type: 'sawtooth', detune: 13, g: 0.45 },
      { type: 'sawtooth', detune: 6, mult: 2, g: 0.22 },
    ],
    cutoff: 520, q: 3, q2: 0.7, env: 900, decay: 0.3, drive: 2.5, preGain: 1.2, hp: 150,
    sub: 0.8, glide: 0.08, attack: 0.006, release: 0.05, level: 0.9,
    lfo: { rate: 0.35, depth: 160 },
  },
  wobble: {
    oscs: [
      { type: 'square', detune: 0, g: 0.45 },
      { type: 'sawtooth', detune: 9, g: 0.4 },
    ],
    cutoff: 320, q: 7, q2: 0.7, env: 400, decay: 0.12, drive: 2, hp: 130,
    sub: 0.95, glide: 0.05, attack: 0.004, release: 0.03, level: 0.85,
    lfo: { rate: 4, depth: 0, wobDepth: 700 },
  },
  bigbeat: {
    oscs: [
      { type: 'sawtooth', detune: -8, g: 0.5 },
      { type: 'square', detune: 7, g: 0.35 },
    ],
    cutoff: 420, q: 4, q2: 0.7, env: 2400, decay: 0.09, drive: 5, preGain: 1.3, hp: 140,
    sub: 0.75, glide: 0.05, attack: 0.003, release: 0.03, level: 0.75,
  },
  acid: {
    oscs: [{ type: 'sawtooth', detune: 0, g: 0.9 }],
    cutoff: 300, q: 15, q2: 0.9, env: 2200, decay: 0.16, drive: 3.5, preGain: 1.4, hp: 90,
    sub: 0, glide: 0.055, attack: 0.002, release: 0.025, level: 0.55,
  },
  sub: {
    oscs: [{ type: 'triangle', detune: 0, g: 0.25 }],
    cutoff: 300, q: 0.7, env: 120, decay: 0.08, sub: 1, attack: 0.003, release: 0.04, level: 0.85,
  },
};

// ----------------------------------------------------------------------------- one-shot voices

const organWaves = new WeakMap();
function organWave(ctx) {
  let w = organWaves.get(ctx);
  if (!w) {
    // drawbar-ish: 8' 4' 2 2/3' 2' plus a little 1 3/5'
    const real = new Float32Array(10);
    const imag = new Float32Array([0, 1, 0.75, 0.55, 0.45, 0.18, 0.3, 0, 0.22, 0]);
    w = ctx.createPeriodicWave(real, imag);
    organWaves.set(ctx, w);
  }
  return w;
}

/** Stereo filter pair: oscs on the left feed L, right feed R; returns merger output. */
function stereoFilter(ctx, type, freq, Q) {
  const L = ctx.createBiquadFilter();
  const R = ctx.createBiquadFilter();
  L.type = R.type = type;
  L.frequency.value = R.frequency.value = freq;
  L.Q.value = R.Q.value = Q;
  const m = ctx.createChannelMerger(2);
  L.connect(m, 0, 0);
  R.connect(m, 0, 1);
  return { L, R, out: m, freqs: [L.frequency, R.frequency] };
}

function finish(v, sources, nodesToDrop, endT, onEnd) {
  v.sources = sources;
  v.end = endT;
  for (const s of sources) s.stop(endT);
  sources[0].onended = () => {
    for (const n of nodesToDrop) { try { n.disconnect(); } catch (_) { /* noop */ } }
    onEnd && onEnd(v);
  };
  return v;
}

/**
 * Chord stab. kind: 'rave' (detuned saws, snappy filter), 'organ' (garage organ), 'hoover'.
 * @returns voice record {start,end,sources,vca,oscCount}
 */
export function playStab(ctx, dest, t, notes, o, onEnd) {
  const kind = o.kind || 'rave';
  const vca = ctx.createGain();
  vca.gain.value = 0;
  const sources = [];
  const g = (o.gain ?? 1) / Math.sqrt(notes.length);
  let filt;
  let len = o.dur ?? 0.18;
  if (kind === 'organ') {
    filt = stereoFilter(ctx, 'lowpass', o.bright ?? 5500, 0.8);
    const wave = organWave(ctx);
    notes.forEach((m, i) => {
      const osc = ctx.createOscillator();
      osc.setPeriodicWave(wave);
      osc.frequency.value = mtof(m);
      osc.detune.value = (i % 2 ? 4 : -4);
      osc.connect(i % 2 ? filt.R : filt.L);
      if (i === 0) { osc.connect(filt.R); }
      sources.push(osc);
    });
    vca.gain.setValueAtTime(0, t);
    vca.gain.linearRampToValueAtTime(g * 1.1, t + 0.004);
    vca.gain.setTargetAtTime(g * 0.6, t + 0.01, 0.08);
    vca.gain.setTargetAtTime(0, t + len, 0.035);
    len += 0.25;
  } else if (kind === 'hoover') {
    filt = stereoFilter(ctx, 'lowpass', o.bright ?? 2600, 1.2);
    notes.forEach((m) => {
      const f = mtof(m);
      for (const [det, side] of [[-22, 'L'], [21, 'R'], [0, 'L']]) {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.detune.value = det;
        osc.frequency.setValueAtTime(f * 0.79, t);
        osc.frequency.exponentialRampToValueAtTime(f, t + 0.09);
        osc.connect(filt[side]);
        if (det === 0) osc.connect(filt.R);
        sources.push(osc);
      }
    });
    vca.gain.setValueAtTime(0, t);
    vca.gain.linearRampToValueAtTime(g * 0.8, t + 0.02);
    vca.gain.setTargetAtTime(0, t + len, 0.09);
    len += 0.45;
  } else {
    filt = stereoFilter(ctx, 'lowpass', 2600, o.q ?? 3);
    const top = o.bright ?? 10000;
    for (const fp of filt.freqs) {
      fp.setValueAtTime(top, t);
      fp.setTargetAtTime(2600, t + 0.003, o.fdecay ?? 0.12);
    }
    notes.forEach((m) => {
      const f = mtof(m);
      for (const [det, side] of [[-11, 'L'], [11, 'R']]) {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = f;
        osc.detune.value = det;
        osc.connect(filt[side]);
        sources.push(osc);
      }
    });
    vca.gain.setValueAtTime(0, t);
    vca.gain.linearRampToValueAtTime(g, t + 0.002);
    vca.gain.setTargetAtTime(0, t + 0.01, (o.adecay ?? 0.11));
    len = Math.max(len, 0.5);
  }
  filt.out.connect(vca).connect(dest);
  for (const s of sources) s.start(t);
  const v = { start: t, vca, oscCount: sources.length };
  return finish(v, sources, [vca, filt.out], t + len, onEnd);
}

/** Warm detuned-saw pad with slow attack, held for `dur` seconds. */
export function playPad(ctx, dest, t, notes, dur, o, onEnd) {
  const filt = stereoFilter(ctx, 'lowpass', o.cutoff ?? 1400, 0.6);
  const vca = ctx.createGain();
  const sources = [];
  notes.forEach((m) => {
    const f = mtof(m);
    for (const [det, side] of [[-9, 'L'], [8, 'R']]) {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = f;
      osc.detune.value = det;
      osc.connect(filt[side]);
      sources.push(osc);
    }
  });
  if (o.sweep) {
    for (const fp of filt.freqs) {
      fp.setValueAtTime(o.cutoff * 0.5, t);
      fp.linearRampToValueAtTime(o.cutoff * 1.4, t + dur);
    }
  }
  const g = (o.gain ?? 1) / Math.sqrt(notes.length);
  const atk = o.attack ?? 0.35;
  vca.gain.setValueAtTime(0, t);
  vca.gain.linearRampToValueAtTime(g, t + atk);
  vca.gain.setTargetAtTime(0, t + dur, o.release ?? 0.35);
  filt.out.connect(vca).connect(dest);
  for (const s of sources) s.start(t);
  const v = { start: t, vca, oscCount: sources.length };
  return finish(v, sources, [vca, filt.out], t + dur + (o.release ?? 0.35) * 5, onEnd);
}

/** Plucky arp / bell note. */
export function playPluck(ctx, dest, t, midi, o, onEnd) {
  const osc = ctx.createOscillator();
  osc.type = o.wave || 'square';
  osc.frequency.value = mtof(midi);
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass';
  f.Q.value = o.q ?? 3;
  f.frequency.setValueAtTime(o.bright ?? 7000, t);
  f.frequency.setTargetAtTime(1800, t + 0.002, o.fdecay ?? 0.06);
  const vca = ctx.createGain();
  vca.gain.setValueAtTime(0, t);
  vca.gain.linearRampToValueAtTime(o.gain ?? 0.5, t + 0.002);
  vca.gain.setTargetAtTime(0, t + 0.004, o.decay ?? 0.1);
  osc.connect(f).connect(vca).connect(dest);
  osc.start(t);
  const v = { start: t, vca, oscCount: 1 };
  return finish(v, [osc], [vca], t + (o.decay ?? 0.1) * 6, onEnd);
}

/** Lead: 'hoover' (detuned, pitch-scoop) or 'supersaw' or 'square'. */
export function playLead(ctx, dest, t, midi, dur, o, onEnd) {
  const kind = o.kind || 'supersaw';
  const f = mtof(midi);
  const filt = stereoFilter(ctx, 'lowpass', o.bright ?? (kind === 'hoover' ? 3400 : 6500), kind === 'square' ? 4 : 1);
  const vca = ctx.createGain();
  const sources = [];
  const dets = kind === 'square' ? [[-6, 'L'], [6, 'R']] : [[-24, 'L'], [-8, 'R'], [9, 'L'], [23, 'R']];
  for (const [det, side] of dets) {
    const osc = ctx.createOscillator();
    osc.type = kind === 'square' ? 'square' : 'sawtooth';
    osc.detune.value = det;
    if (kind === 'hoover' || o.slideFrom) {
      const from = o.slideFrom ? mtof(o.slideFrom) : f * 0.84;
      osc.frequency.setValueAtTime(from, t);
      osc.frequency.exponentialRampToValueAtTime(f, t + (o.slideFrom ? 0.06 : 0.1));
    } else osc.frequency.value = f;
    osc.connect(filt[side]);
    sources.push(osc);
  }
  if (kind === 'hoover') {
    const sub = ctx.createOscillator();
    sub.type = 'sawtooth';
    sub.frequency.setValueAtTime(f * 0.42, t);
    sub.frequency.exponentialRampToValueAtTime(f * 0.5, t + 0.1);
    sub.connect(filt.L);
    sub.connect(filt.R);
    sources.push(sub);
  }
  const g = (o.gain ?? 0.5) / Math.sqrt(sources.length);
  vca.gain.setValueAtTime(0, t);
  vca.gain.linearRampToValueAtTime(g, t + (o.attack ?? 0.008));
  vca.gain.setTargetAtTime(g * 0.75, t + 0.05, 0.2);
  vca.gain.setTargetAtTime(0, t + dur, o.release ?? 0.08);
  filt.out.connect(vca).connect(dest);
  for (const s of sources) s.start(t);
  const v = { start: t, vca, oscCount: sources.length };
  return finish(v, sources, [vca, filt.out], t + dur + (o.release ?? 0.08) * 6, onEnd);
}

const VOWELS = {
  a: [800, 1150, 2900], e: [420, 1700, 2600], i: [300, 2200, 3000],
  o: [480, 820, 2800], u: [330, 720, 2500], y: [380, 1900, 2500],
};
const FORMANT_GAIN = [1, 0.9, 0.6];

/** Chopped "vocal" blip: buzzy source through three moving formant band-passes. */
export function playVox(ctx, dest, t, midi, dur, o, onEnd) {
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  const f = mtof(midi);
  osc.frequency.setValueAtTime(f * 0.94, t);
  osc.frequency.exponentialRampToValueAtTime(f, t + 0.035);
  const va = VOWELS[o.v1] || VOWELS.a;
  const vb = VOWELS[o.v2] || va;
  const vca = ctx.createGain();
  const nodes = [vca];
  for (let k = 0; k < 3; k++) {
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 7 + k * 3;
    bp.frequency.setValueAtTime(va[k], t);
    bp.frequency.linearRampToValueAtTime(vb[k], t + dur);
    const g = ctx.createGain();
    g.gain.value = FORMANT_GAIN[k] * 5;
    osc.connect(bp).connect(g).connect(vca);
    nodes.push(bp, g);
  }
  const gain = o.gain ?? 0.5;
  vca.gain.setValueAtTime(0, t);
  vca.gain.linearRampToValueAtTime(gain, t + 0.006);
  vca.gain.setValueAtTime(gain, t + Math.max(0.01, dur - 0.012));
  vca.gain.linearRampToValueAtTime(0, t + dur);
  vca.connect(dest);
  osc.start(t);
  const v = { start: t, vca, oscCount: 1 };
  return finish(v, [osc], nodes, t + dur + 0.02, onEnd);
}

/** Noise + pitch riser, swept up over `dur`. Returns a voice that can be cut at the drop. */
export function playRiser(ctx, dest, noiseBuf, t, dur, o, onEnd) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  src.loop = true;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 1.6;
  bp.frequency.setValueAtTime(350, t);
  bp.frequency.exponentialRampToValueAtTime(9000, t + dur);
  const vca = ctx.createGain();
  const peak = o.gain ?? 0.35;
  vca.gain.setValueAtTime(0.0001, t);
  vca.gain.exponentialRampToValueAtTime(peak, t + dur);
  src.connect(bp).connect(vca);
  const sources = [src];
  // pitch riser: two detuned saws gliding up two octaves
  if (o.pitch !== false) {
    const pf = ctx.createBiquadFilter();
    pf.type = 'highpass';
    pf.frequency.value = 300;
    const pg = ctx.createGain();
    pg.gain.value = 0.22;
    for (const det of [-12, 12]) {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.detune.value = det;
      const f0 = mtof(o.midi ?? 60);
      osc.frequency.setValueAtTime(f0 / 2, t);
      osc.frequency.exponentialRampToValueAtTime(f0 * 2, t + dur);
      osc.connect(pf);
      sources.push(osc);
    }
    pf.connect(pg).connect(vca);
  }
  vca.connect(dest);
  for (const s of sources) s.start(t);
  const v = { start: t, vca, oscCount: sources.length, riser: true };
  return finish(v, sources, [vca], t + dur + 0.02, onEnd);
}

/** Sub boom impact for drops. */
export function playBoom(ctx, dest, t, o, onEnd) {
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(o.f0 ?? 120, t);
  osc.frequency.exponentialRampToValueAtTime(o.f1 ?? 34, t + 0.45);
  const vca = ctx.createGain();
  vca.gain.setValueAtTime(0, t);
  vca.gain.linearRampToValueAtTime(o.gain ?? 0.8, t + 0.005);
  vca.gain.setTargetAtTime(0, t + 0.05, 0.45);
  osc.connect(vca).connect(dest);
  osc.start(t);
  const v = { start: t, vca, oscCount: 1 };
  return finish(v, [osc], [vca], t + 2.5, onEnd);
}
