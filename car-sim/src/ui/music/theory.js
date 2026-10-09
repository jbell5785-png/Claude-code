// Music theory helpers: scales, scale-degree arithmetic, chord voicing.

export const SCALES = {
  aeolian: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
};

export const NOTE_NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

export const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

/** Semitone offset (from tonic) of a scale degree; degrees may be negative or > 6. */
export function degSemi(scale, deg) {
  const n = scale.length;
  const o = Math.floor(deg / n);
  return scale[deg - o * n] + 12 * o;
}

/** Scale degrees of a chord built by stacking thirds on rootDeg. */
export function chordDegs(rootDeg, size = 3) {
  const out = [];
  for (let i = 0; i < size; i++) out.push(rootDeg + 2 * i);
  return out;
}

/** True if a degree is a chord tone of the triad on rootDeg (also 7th if size>3). */
export function isChordTone(deg, rootDeg, size = 3) {
  const rel = (((deg - rootDeg) % 7) + 7) % 7;
  return rel === 0 || rel === 2 || rel === 4 || (size > 3 && rel === 6);
}

/** Nearest chord-tone degree to `deg` (ties resolve downward). */
export function snapToChord(deg, rootDeg, size = 3) {
  for (let d = 0; d < 4; d++) {
    if (isChordTone(deg - d, rootDeg, size)) return deg - d;
    if (isChordTone(deg + d, rootDeg, size)) return deg + d;
  }
  return deg;
}

/**
 * Voice a chord near `center` (midi), with minimal movement from `prev` voicing.
 * @returns {number[]} sorted midi notes
 */
export function voiceChord(scale, tonicMidi, rootDeg, size, center, prev) {
  const pcs = chordDegs(rootDeg, size).map((d) => tonicMidi + degSemi(scale, d));
  let best = null;
  let bestCost = Infinity;
  for (let base = center - 7; base <= center + 5; base++) {
    // place each tone at its first occurrence >= base
    const notes = pcs.map((p) => {
      let m = p;
      while (m < base) m += 12;
      while (m >= base + 12) m -= 12;
      return m;
    }).sort((a, b) => a - b);
    let cost;
    if (prev && prev.length === notes.length) {
      cost = 0;
      for (let i = 0; i < notes.length; i++) cost += Math.abs(notes[i] - prev[i]);
      const mid = (notes[0] + notes[notes.length - 1]) / 2;
      cost += Math.abs(mid - center) * 0.35;
    } else {
      const mid = (notes[0] + notes[notes.length - 1]) / 2;
      cost = Math.abs(mid - center);
    }
    if (cost < bestCost) {
      bestCost = cost;
      best = notes;
    }
  }
  return best;
}
