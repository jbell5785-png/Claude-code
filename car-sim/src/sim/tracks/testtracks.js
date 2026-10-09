// Test tracks: skidpad (constant-radius circle) and drag oval (two 1.6 km straights).
import { turtle } from './util.js';

/** 50 m radius constant circle (counter-clockwise, i.e. a left-hand turn) for lateral-g tests. */
export function skidpadDef() {
  const R = 50, m = 64, sigma = 1.5;
  // compensate the slight radius shrink of the Gaussian smoothing: r' = r exp(-sigma^2 / 2r^2)
  const Rc = R * Math.exp((sigma * sigma) / (2 * R * R));
  const points = [];
  for (let k = 0; k < m; k++) {
    const a = (k / m) * Math.PI * 2 - Math.PI / 2;
    points.push([Rc * Math.cos(a), Rc * Math.sin(a), 0, 10, 0]);
  }
  return {
    key: 'skidpad', label: 'Skidpad (50 m radius)', points, width: 10, startFrac: 0,
    smooth: sigma, kerbs: false, gravel: false, runoff: 15, edgeMax: 30,
    terrain: { amp: 0.3, radius: 90 }, barrier: { kind: 'tyres', offsetL: 12, offsetR: 20 },
    scenery: { trees: 0.5, grandstands: 1 },
  };
}

/** Long oval with two 1.6 km straights for acceleration / top-speed tests. */
export function dragDef() {
  const t = turtle([
    { s: 1600, start: true, startAt: 40, w: 14, bank: 0 },
    { r: 160, a: 180, bank: 10 },
    { s: 1600, bank: 0 },
    { r: 160, a: 180, bank: 10 },
  ], { width: 14, step: 20 });
  return {
    key: 'drag', label: 'Drag Oval (1.6 km straights)', points: t.points, width: 14,
    startFrac: t.startFrac, marks: t.marks, smooth: 6, bankSmooth: 30,
    kerbs: false, gravel: false, runoff: 12, edgeMax: 35,
    terrain: { amp: 0.5, radius: 100 }, barrier: { kind: 'wall', offsetR: 6, offsetL: 15, height: 1.0 },
    scenery: { trees: 0.6, grandstands: 3 },
  };
}
