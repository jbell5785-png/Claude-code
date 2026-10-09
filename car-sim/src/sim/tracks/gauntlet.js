// Gauntlet (~2.5 km, clockwise): held-out AI test track. Wide opening bend, two zigzag chicane
// sequences, 12–14 m radius corners (tighter than any other preset) and obstacles placed on the
// racing line (each leaves a >= 5 m drivable gap).
import { turtle } from './util.js';

export const GAUNTLET_SEGMENTS = [
  { s: 260, start: true, startAt: 140, w: 14, z: 0 },   // 0 start straight (wide)
  { r: 120, a: -90 },                                   // 1 wide opening bend
  { s: 420, w: 11, z: 2 },                              // 2
  { r: 20, a: 60, mark: 'zigzag1' },                    // 3 zigzag 1
  { r: 20, a: -120 },                                    // 4
  { r: 20, a: 120 },                                     // 5
  { r: 20, a: -60, markEnd: 'zigzag1' },                // 6
  { s: 180, z: 3, obstacles: [{ at: 0.55, offset: 1.0, kind: 'cylinder', r: 0.9, h: 1.2 }] },
  { r: 12, a: -120 },                                   // 8 very tight right
  { s: 450, z: 1, obstacles: [{ at: 0.6, offset: -2.0, kind: 'box', hx: 1.5, hy: 1.0, heading: 20, h: 1.0 }] }, // 9
  { r: 25, a: 70 },                                     // 10
  { r: 14, a: -110 },                                   // 11 tight right
  { s: 120, z: -1 },                                    // 12
  { r: 18, a: -55, mark: 'zigzag2' },                   // 13 zigzag 2
  { r: 18, a: 110 },                                     // 14
  { r: 18, a: -110 },                                    // 15
  { r: 18, a: 55, markEnd: 'zigzag2' },                 // 16
  { s: 100, z: 0, obstacles: [{ at: 0.5, offset: 2.5, kind: 'cylinder', r: 0.7, h: 1.2 }] },
  { r: 30, a: -80 },                                    // 18
  { s: 60 },                                            // 19
  { r: 13, a: 100 },                                    // 20 tight left
  { r: 35, a: -130 },                                   // 21
  { s: 100 },                                           // 22
];

export function gauntletDef() {
  const t = turtle(GAUNTLET_SEGMENTS, { width: 11, step: 6, close: [0, 12], scale: 1.0 });
  return {
    key: 'gauntlet', label: 'Gauntlet (held-out test)', points: t.points, width: 11,
    startFrac: t.startFrac, marks: t.marks, obstacles: t.obstacles, smooth: 3, zSmooth: 10,
    runoff: 6, edgeMax: 22, terrain: { amp: 1.2, radius: 70 },
    barrier: { kind: 'tyres', height: 0.8 }, scenery: { trees: 1, grandstands: 2 },
  };
}
