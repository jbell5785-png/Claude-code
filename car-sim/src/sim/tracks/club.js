// Club circuit (~2.0 km, counter-clockwise): tight and technical, short straights, two hairpins,
// essentially flat (±2 m), 10.5 m wide.
import { turtle } from './util.js';

export const CLUB_SEGMENTS = [
  { s: 380, start: true, startAt: 170, w: 10.5, z: 0 },  // 0 start/finish straight
  { r: 25, a: 90 },                                     // 1 T1 (left)
  { s: 120, z: 1 },                                     // 2
  { r: 35, a: -60 },                                    // 3 kink right
  { r: 30, a: 100 },                                    // 4 long left
  { s: 160, z: 2 },                                     // 5
  { r: 18, a: 60 },                                     // 6
  { s: 140 },                                           // 7
  { r: 20, a: -100 },                                   // 8 tight right
  { s: 60, z: 1.5 },                                    // 9
  { r: 16, a: 170 },                                    // 10 hairpin left
  { s: 200, z: 0 },                                     // 11 back straight
  { r: 50, a: 40 },                                     // 12
  { r: 30, a: -80 },                                    // 13 right
  { s: 100, z: -1 },                                    // 14
  { r: 28, a: 100 },                                    // 15
  { s: 120 },                                           // 16
  { r: 40, a: 40 },                                     // 17 final corner
  { s: 60 },                                            // 18
];

export function clubDef() {
  const t = turtle(CLUB_SEGMENTS, { width: 10.5, step: 8, close: [0, 11], scale: 1.25 });
  return {
    key: 'club', label: 'Club Circuit', points: t.points, width: 10.5,
    startFrac: t.startFrac, marks: t.marks, smooth: 3.5, zSmooth: 10,
    runoff: 6, edgeMax: 24, terrain: { amp: 1.0, radius: 70 },
    barrier: { kind: 'tyres', height: 0.8 }, scenery: { trees: 1.2, grandstands: 2 },
  };
}
