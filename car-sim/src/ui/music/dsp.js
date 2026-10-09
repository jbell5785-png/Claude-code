// Offline (plain JS) DSP used to synthesise drum samples, the breakbeat loop and the reverb
// impulse into AudioBuffers once per song. Playback is then just AudioBufferSourceNodes,
// which is far cheaper than building oscillator graphs for every drum hit.

const TAU = Math.PI * 2;

/** RBJ biquad, processed in place (direct form I). */
export function biquad(x, type, freq, Q, sr, gainDb = 0) {
  const f = Math.min(freq, sr * 0.45);
  const w0 = (TAU * f) / sr;
  const cw = Math.cos(w0);
  const sw = Math.sin(w0);
  const alpha = sw / (2 * Q);
  const A = Math.pow(10, gainDb / 40);
  let b0, b1, b2, a0, a1, a2;
  switch (type) {
    case 'highpass':
      b0 = (1 + cw) / 2; b1 = -(1 + cw); b2 = (1 + cw) / 2; a0 = 1 + alpha; a1 = -2 * cw; a2 = 1 - alpha;
      break;
    case 'bandpass':
      b0 = alpha; b1 = 0; b2 = -alpha; a0 = 1 + alpha; a1 = -2 * cw; a2 = 1 - alpha;
      break;
    case 'peaking':
      b0 = 1 + alpha * A; b1 = -2 * cw; b2 = 1 - alpha * A; a0 = 1 + alpha / A; a1 = -2 * cw; a2 = 1 - alpha / A;
      break;
    default: // lowpass
      b0 = (1 - cw) / 2; b1 = 1 - cw; b2 = (1 - cw) / 2; a0 = 1 + alpha; a1 = -2 * cw; a2 = 1 - alpha;
  }
  b0 /= a0; b1 /= a0; b2 /= a0; a1 /= a0; a2 /= a0;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const xi = x[i];
    const y = b0 * xi + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = xi; y2 = y1; y1 = y;
    x[i] = y;
  }
  return x;
}

export function whiteNoise(n, rnd) {
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = rnd() * 2 - 1;
  return out;
}

export function saturate(x, drive) {
  if (drive <= 0) return x;
  const k = Math.tanh(drive);
  for (let i = 0; i < x.length; i++) x[i] = Math.tanh(x[i] * drive) / k;
  return x;
}

export function normalize(x, peak = 0.95) {
  let m = 0;
  for (let i = 0; i < x.length; i++) m = Math.max(m, Math.abs(x[i]));
  if (m > 0) {
    const g = peak / m;
    for (let i = 0; i < x.length; i++) x[i] *= g;
  }
  return x;
}

export function fadeOut(x, n) {
  n = Math.min(n | 0, x.length);
  for (let i = 0; i < n; i++) x[x.length - 1 - i] *= i / n;
  return x;
}

export function fadeIn(x, n) {
  n = Math.min(n | 0, x.length);
  for (let i = 0; i < n; i++) x[i] *= i / n;
  return x;
}

/** Sum of square waves at metallic (TR-style) ratios. */
function metallic(n, sr, base, ratios, rnd) {
  const out = new Float32Array(n);
  const ph = ratios.map(() => rnd());
  for (let i = 0; i < n; i++) {
    let s = 0;
    for (let k = 0; k < ratios.length; k++) {
      ph[k] += (base * ratios[k]) / sr;
      if (ph[k] >= 1) ph[k] -= 1;
      s += ph[k] < 0.5 ? 1 : -1;
    }
    out[i] = s / ratios.length;
  }
  return out;
}

const HAT_RATIOS = [1, 1.4471, 1.6170, 1.9265, 2.5028, 2.6637];

// ---------------------------------------------------------------- drum voices

export function synthKick(sr, rnd, p) {
  const n = Math.floor((p.dur || 0.5) * sr);
  const out = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const f = p.f1 + (p.f0 - p.f1) * Math.exp(-t / p.pTau);
    ph += (TAU * f) / sr;
    const amp = t < p.hold ? 1 : Math.exp(-(t - p.hold) / p.aTau);
    out[i] = Math.sin(ph) * amp;
  }
  // beater click: short band-limited noise + tiny tone blip
  const cn = Math.floor(0.012 * sr);
  const click = whiteNoise(cn, rnd);
  biquad(click, 'bandpass', p.clickFreq || 3000, 0.9, sr);
  for (let i = 0; i < cn; i++) {
    const t = i / sr;
    out[i] += click[i] * p.click * Math.exp(-t / 0.0025) * 3;
  }
  saturate(out, p.drive);
  fadeIn(out, 8);
  fadeOut(out, 0.03 * sr);
  return normalize(out, 0.97);
}

export function synthSnare(sr, rnd, p) {
  const n = Math.floor((p.dur || 0.35) * sr);
  const tone = new Float32Array(n);
  let ph1 = 0, ph2 = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const f = p.tone * (1 + 0.6 * Math.exp(-t / 0.008));
    ph1 += (TAU * f) / sr;
    ph2 += (TAU * f * 1.62) / sr;
    tone[i] = (Math.sin(ph1) + 0.45 * Math.sin(ph2)) * Math.exp(-t / p.toneDecay);
  }
  const nz = whiteNoise(n, rnd);
  biquad(nz, 'highpass', p.nhp, 0.7, sr);
  biquad(nz, 'lowpass', p.nlp, 0.7, sr);
  biquad(nz, 'peaking', p.crack || 4000, 1.2, sr, 5);
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const env = Math.exp(-t / p.noiseDecay) * (1 - Math.exp(-t / 0.0007));
    nz[i] = nz[i] * env * p.noise + tone[i] * p.toneAmt;
  }
  saturate(nz, p.drive);
  fadeOut(nz, 0.02 * sr);
  return normalize(nz, 0.95);
}

export function synthClap(sr, rnd) {
  const n = Math.floor(0.4 * sr);
  const nz = whiteNoise(n, rnd);
  biquad(nz, 'bandpass', 1300, 1.4, sr);
  biquad(nz, 'highpass', 600, 0.7, sr);
  const bursts = [0, 0.010, 0.021, 0.031];
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    let env = 0;
    for (let b = 0; b < bursts.length - 1; b++) {
      if (t >= bursts[b] && t < bursts[b + 1]) env = Math.exp(-(t - bursts[b]) / 0.004);
    }
    if (t >= bursts[3]) env = Math.exp(-(t - bursts[3]) / 0.11);
    nz[i] *= env;
  }
  saturate(nz, 1.5);
  fadeOut(nz, 0.02 * sr);
  return normalize(nz, 0.9);
}

export function synthHat(sr, rnd, p) {
  const n = Math.floor((p.decay * 5 + 0.02) * sr);
  const m = metallic(n, sr, p.base || 320, HAT_RATIOS, rnd);
  const nz = whiteNoise(n, rnd);
  for (let i = 0; i < n; i++) m[i] = m[i] * (1 - p.noise) + nz[i] * p.noise;
  biquad(m, 'highpass', p.hp || 7000, 0.8, sr);
  biquad(m, 'highpass', p.hp || 7000, 0.6, sr);
  biquad(m, 'lowpass', p.lp || 12500, 0.7, sr); // tame the fizz on small speakers
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    m[i] *= Math.exp(-t / p.decay) * (1 - Math.exp(-t / 0.0004));
  }
  fadeOut(m, Math.min(n, 0.01 * sr));
  return normalize(m, 0.9);
}

export function synthCymbal(sr, rnd, p) {
  const n = Math.floor(p.dur * sr);
  const m = metallic(n, sr, p.base, HAT_RATIOS, rnd);
  const nz = whiteNoise(n, rnd);
  const bell = new Float32Array(n);
  let ph1 = 0, ph2 = 0;
  for (let i = 0; i < n; i++) {
    ph1 += (TAU * p.bell) / sr;
    ph2 += (TAU * p.bell * 1.48) / sr;
    bell[i] = (Math.sin(ph1) + 0.6 * Math.sin(ph2)) * Math.exp(-i / sr / (p.decay * 0.5));
  }
  for (let i = 0; i < n; i++) m[i] = m[i] * (1 - p.noise) + nz[i] * p.noise;
  biquad(m, 'highpass', p.hp, 0.7, sr);
  biquad(m, 'lowpass', p.lp || 13000, 0.7, sr);
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    m[i] = m[i] * Math.exp(-t / p.decay) * (1 - Math.exp(-t / (p.attack || 0.0008))) + bell[i] * p.bellAmt;
  }
  fadeOut(m, 0.05 * sr);
  return normalize(m, 0.9);
}

export function synthTom(sr, rnd, freq) {
  const n = Math.floor(0.45 * sr);
  const out = new Float32Array(n);
  let ph = 0;
  const nz = whiteNoise(n, rnd);
  biquad(nz, 'bandpass', freq * 4, 1, sr);
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const f = freq * (1 + 0.5 * Math.exp(-t / 0.04));
    ph += (TAU * f) / sr;
    out[i] = Math.sin(ph) * Math.exp(-t / 0.16) + nz[i] * 0.3 * Math.exp(-t / 0.02);
  }
  saturate(out, 1.8);
  fadeOut(out, 0.03 * sr);
  return normalize(out, 0.9);
}

export function synthRim(sr, rnd) {
  const n = Math.floor(0.08 * sr);
  const out = new Float32Array(n);
  let p1 = 0, p2 = 0;
  const nz = whiteNoise(n, rnd);
  biquad(nz, 'bandpass', 3500, 1.5, sr);
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    p1 += (TAU * 1720) / sr;
    p2 += (TAU * 520) / sr;
    out[i] = (Math.sin(p1) * 0.6 + Math.sin(p2) * 0.8) * Math.exp(-t / 0.012) + nz[i] * Math.exp(-t / 0.004) * 0.8;
  }
  fadeOut(out, 0.01 * sr);
  return normalize(out, 0.85);
}

export function synthShaker(sr, rnd) {
  const n = Math.floor(0.12 * sr);
  const nz = whiteNoise(n, rnd);
  biquad(nz, 'bandpass', 6500, 1.0, sr);
  biquad(nz, 'lowpass', 11000, 0.7, sr);
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    nz[i] *= (1 - Math.exp(-t / 0.006)) * Math.exp(-t / 0.03);
  }
  fadeOut(nz, 0.01 * sr);
  return normalize(nz, 0.8);
}

/**
 * Render a 2-bar (32 step) breakbeat loop at the song tempo, with "sampled record" character
 * (humanised timing, saturation, band-limiting and a small room), so it can be sliced and
 * rearranged like a chopped amen-style break.
 * @param {object} kit  { kick, snare, hat, ride } Float32Arrays
 * @param {Array<{step:number, s:string, g:number}>} hits
 */
export function renderBreakLoop(sr, rnd, bpm, kit, hits) {
  const stepDur = 60 / bpm / 4;
  const n = Math.floor(32 * stepDur * sr);
  const out = new Float32Array(n);
  for (const h of hits) {
    const smp = kit[h.s];
    if (!smp) continue;
    const jitter = h.step === 0 ? 0 : (rnd() - 0.5) * 0.006;
    let start = Math.floor((h.step * stepDur + Math.max(0, jitter)) * sr);
    for (let i = 0; i < smp.length; i++) {
      const j = (start + i) % n; // wrap tails so the loop is seamless
      out[j] += smp[i] * h.g;
    }
  }
  // small room: 3 short feedback combs
  const room = new Float32Array(n);
  const combs = [0.0237, 0.0311, 0.0367].map((d) => Math.floor(d * sr));
  for (const d of combs) {
    const buf = new Float32Array(d);
    let idx = 0;
    for (let k = 0; k < 2; k++) {
      for (let i = 0; i < n; i++) {
        const y = buf[idx];
        buf[idx] = out[i] + y * 0.55;
        if (k === 1) room[i] += y;
        idx = (idx + 1) % d;
      }
    }
  }
  biquad(room, 'lowpass', 4000, 0.7, sr);
  for (let i = 0; i < n; i++) out[i] += room[i] * 0.09;
  biquad(out, 'highpass', 45, 0.7, sr);
  biquad(out, 'lowpass', 9500, 0.7, sr);
  biquad(out, 'peaking', 220, 1.0, sr, 2.5);
  normalize(out, 0.9);
  saturate(out, 1.6);
  return normalize(out, 0.92);
}

/** Stereo reverb impulse: exponentially decaying noise that darkens over time. */
export function makeImpulse(sr, seconds, rnd) {
  const n = Math.floor(seconds * sr);
  const chans = [new Float32Array(n), new Float32Array(n)];
  const pre = Math.floor(0.012 * sr);
  for (const ch of chans) {
    let y = 0;
    for (let i = pre; i < n; i++) {
      const t = (i - pre) / sr;
      const frac = t / seconds;
      const a = 0.85 - 0.75 * frac; // one-pole coefficient: bright -> dark
      y += a * ((rnd() * 2 - 1) - y);
      ch[i] = y * Math.pow(1 - frac, 2.2) * Math.exp(-t * 1.8);
    }
    // a few early reflections
    for (const [d, g] of [[0.017, 0.5], [0.029, 0.35], [0.041, 0.28], [0.063, 0.2]]) {
      const j = pre + Math.floor((d + rnd() * 0.004) * sr);
      if (j < n) ch[j] += g * (rnd() < 0.5 ? -1 : 1);
    }
    fadeIn(ch, pre + 64);
  }
  // normalise energy
  let e = 0;
  for (const ch of chans) for (let i = 0; i < n; i++) e += ch[i] * ch[i];
  const g = 1 / Math.sqrt(e / 2) * 0.35;
  for (const ch of chans) for (let i = 0; i < n; i++) ch[i] *= g;
  return chans;
}

/** tanh waveshaper curve (cached per amount). */
const curveCache = new Map();
export function driveCurve(amount) {
  const key = Math.round(amount * 100);
  let c = curveCache.get(key);
  if (c) return c;
  c = new Float32Array(1024);
  const k = Math.tanh(amount);
  for (let i = 0; i < 1024; i++) {
    const x = (i / 1023) * 2 - 1;
    c[i] = Math.tanh(x * amount) / k;
  }
  curveCache.set(key, c);
  return c;
}

/** Soft limiter curve: linear to `knee`, then smoothly saturating to 1. */
export function softClipCurve(knee = 0.85) {
  const c = new Float32Array(2048);
  for (let i = 0; i < 2048; i++) {
    const x = (i / 2047) * 2 - 1;
    const ax = Math.abs(x);
    let y;
    if (ax <= knee) y = ax;
    else y = knee + (1 - knee) * Math.tanh((ax - knee) / (1 - knee));
    c[i] = Math.sign(x) * Math.min(y, 0.995);
  }
  return c;
}
