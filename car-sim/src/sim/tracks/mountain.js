// Mountain loop (~3.5 km, counter-clockwise): valley start, V-shaped switchback hairpins climbing
// ~80 m, a sharp summit crest (cars go light / airborne at speed), ridge section, fast descent.
// Narrow (9.5 m), armco close to the road.
import { turtle } from './util.js';

export const MOUNTAIN_SEGMENTS = [
  { s: 260, start: true, startAt: 120, w: 9.5, z: -10 }, // 0 valley straight
  { r: 80, a: 45 },                                     // 1
  { s: 230, z: 4 },                                     // 2 climb
  { r: 16, a: 160, z: 8 },                              // 3 switchback hairpin (left)
  { s: 250, z: 26 },                                    // 4 climb
  { r: 16, a: -160, z: 30 },                            // 5 switchback hairpin (right)
  { s: 250, z: 48 },                                    // 6 climb
  { r: 50, a: 60, z: 54 },                              // 7
  { s: 140, z: 62 },                                    // 8
  { r: 120, a: 40 },                                    // 9 fast left onto the ridge
  { s: 150, z: 64 },                                    // 10 ridge
  { s: 45, z: 69 },                                     // 11 summit crest (airborne at speed)
  { s: 45, z: 64 },                                     // 12
  { s: 60, z: 62 },                                     // 13
  { r: 35, a: 70 },                                     // 14
  { s: 260, z: 40 },                                    // 15 descent
  { r: 60, a: -60, z: 33 },                             // 16
  { s: 90, z: 28 },                                     // 17 crest before the drop
  { s: 110, z: 20 },                                    // 18
  { r: 18, a: 130, z: 16 },                             // 19 descending hairpin
  { s: 300, z: -2 },                                    // 20 fast descent
  { r: 70, a: 75 },                                     // 21
  { s: 100, z: -10 },                                   // 22
];

export function mountainDef() {
  const t = turtle(MOUNTAIN_SEGMENTS, { width: 9.5, step: 8, close: [0, 20], scale: 1.0 });
  return {
    key: 'mountain', label: 'Mountain Loop', points: t.points, width: 9.5,
    startFrac: t.startFrac, marks: t.marks, smooth: 3.5, zSmooth: 6,
    runoff: 4, edgeMax: 26, gravel: false, terrain: { amp: 4, radius: 120 },
    barrier: { kind: 'armco', height: 0.75 }, scenery: { trees: 1.6, grandstands: 1 },
  };
}
