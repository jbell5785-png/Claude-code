// Grand-prix style circuit (~4.8 km, clockwise): long start/finish straight, heavy-braking T1,
// esses, fast sweepers, uphill hairpin, long back straight into a chicane, elevation ±18 m.
import { turtle } from './util.js';

export const GP_SEGMENTS = [
  { s: 900, start: true, startAt: 320, w: 13, z: 0 },       // 0 start/finish straight
  { r: 38, a: -100 },                                      // 1 T1 heavy braking right
  { s: 200, z: 2 },                                        // 2
  { r: 75, a: 45 },                                        // 3 esses (left)
  { r: 90, a: -65 },                                       // 4 esses (right)
  { s: 320, z: 10 },                                       // 5 climb
  { r: 210, a: -50 },                                      // 6 fast sweeper
  { s: 480, z: 16 },                                       // 7
  { r: 130, a: 60 },                                       // 8 fast left
  { s: 380, z: 26 },                                       // 9 uphill to the hairpin
  { r: 16, a: -170, z: 25 },                               // 10 hairpin
  { s: 380, z: 10 },                                       // 11 downhill
  { r: 65, a: 70 },                                        // 12
  { r: 48, a: -50 },                                       // 13
  { s: 500, z: -6 },                                       // 14 back straight
  { r: 20, a: -70, mark: 'chicane' },                      // 15 chicane right
  { s: 12 },                                               // 16
  { r: 20, a: 70, markEnd: 'chicane' },                    // 17 chicane left
  { s: 200, z: -8 },                                       // 18
  { r: 95, a: -60 },                                       // 19
  { s: 160 },                                              // 20
  { r: 60, a: -40, z: -2 },                                // 21 final corner
  { s: 120 },                                              // 22
];

export function gpDef() {
  const t = turtle(GP_SEGMENTS, { width: 13, step: 10, close: [0, 14], scale: 1.11 });
  return {
    key: 'gp', label: 'Grand Prix Circuit', points: t.points, width: 13,
    startFrac: t.startFrac, marks: t.marks, smooth: 4, zSmooth: 12,
    runoff: 8, edgeMax: 32, terrain: { amp: 2, radius: 90 },
    barrier: { kind: 'armco', height: 0.9 }, scenery: { trees: 1, grandstands: 4 },
  };
}
