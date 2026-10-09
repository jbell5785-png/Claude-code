// Seeded random helpers (mulberry32). Deterministic per seed so a song can be regenerated.

/** @param {number} seed */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hash a string (or number) to a 32-bit seed. */
export function hashSeed(s) {
  const str = String(s);
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * @param {number} seed
 * @returns {{next:()=>number, range:(a:number,b:number)=>number, int:(a:number,b:number)=>number,
 *   pick:<T>(arr:T[])=>T, chance:(p:number)=>boolean, weighted:<T>(items:T[], w:number[])=>T,
 *   shuffle:<T>(arr:T[])=>T[], fork:(salt:any)=>any, seed:number}}
 */
export function makeRng(seed) {
  const next = mulberry32(seed);
  const r = {
    seed,
    next,
    range: (a, b) => a + (b - a) * next(),
    int: (a, b) => a + Math.floor(next() * (b - a + 1)),
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    chance: (p) => next() < p,
    weighted(items, w) {
      let sum = 0;
      for (const x of w) sum += x;
      let v = next() * sum;
      for (let i = 0; i < items.length; i++) {
        v -= w[i];
        if (v <= 0) return items[i];
      }
      return items[items.length - 1];
    },
    shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
    fork: (salt) => makeRng(hashSeed(seed + ':' + salt)),
  };
  return r;
}
