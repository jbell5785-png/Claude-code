// Deterministic random numbers for the AI module (training, learners, tournaments).
// Everything that is random in training draws from these seeded generators, so the same seed
// always gives the same fitness (see scripts/test-ai.js "determinism").

/**
 * Mulberry32-style PRNG (32-bit state, period 2^32, fast, good enough for evolution strategies).
 * @param {number} seed
 * @returns {{ next(): number, normal(): number, int(n: number): number, state(): number, setState(s: number): void }}
 */
export function createRng(seed = 1) {
  let s = (seed >>> 0) || 0x9e3779b9;
  let spare = NaN;
  function next() {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  /** Standard normal (Box–Muller, caches the second value). */
  function normal() {
    if (spare === spare) { const v = spare; spare = NaN; return v; }
    let u = 0, v = 0;
    while (u <= 1e-12) u = next();
    v = next();
    const r = Math.sqrt(-2 * Math.log(u));
    spare = r * Math.sin(2 * Math.PI * v);
    return r * Math.cos(2 * Math.PI * v);
  }
  return {
    next, normal,
    int(n) { return Math.floor(next() * n); },
    range(a, b) { return a + (b - a) * next(); },
    state() { return s; },
    setState(v) { s = v >>> 0; spare = NaN; },
  };
}

/** 32-bit string hash (FNV-1a) — for deriving seeds from names. */
export function hashSeed(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}

/** Mix two integers into a new seed (splitmix-like). */
export function mixSeed(a, b = 0) {
  let x = (Math.imul(a >>> 0, 0x9e3779b1) ^ Math.imul((b >>> 0) + 0x7f4a7c15, 0x85ebca6b)) >>> 0;
  x ^= x >>> 16; x = Math.imul(x, 0x7feb352d); x ^= x >>> 15; x = Math.imul(x, 0x846ca68b); x ^= x >>> 16;
  return x >>> 0;
}
