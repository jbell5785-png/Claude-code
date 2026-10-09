// Speedway: ~2.4 km tri-oval, counter-clockwise, 22° banked turns, 9° dogleg, 5° straights.
import { turtle } from './util.js';

export function speedwayDef() {
  const t = turtle([
    { s: 170, start: true, startAt: 120, w: 14, bank: 5 },  // front stretch, first leg
    { r: 600, a: 24, bank: 9 },                              // tri-oval dogleg
    { s: 170, bank: 5 },                                     // front stretch, second leg
    { r: 235, a: 168, bank: 22 },                            // turns 1-2
    { s: 300, bank: 4 },                                     // back straight
    { r: 235, a: 168, bank: 22 },                            // turns 3-4
  ], { width: 14, step: 15, close: [0, 4] });
  return {
    key: 'speedway', label: 'Speedway (tri-oval)', points: t.points, width: 14,
    startFrac: t.startFrac, marks: t.marks, smooth: 8, bankSmooth: 30, widthSmooth: 10,
    kerbs: false, gravel: false, runoff: 10, edgeMax: 35,
    terrain: { amp: 0.6, radius: 110 },
    // outer (right-hand) SAFER-style wall close to the edge, inner armco beyond the apron
    barrier: { kind: 'wall', offsetR: 2.5, offsetL: 14, height: 1.2, fence: 4 },
    scenery: { trees: 0.5, grandstands: 4 },
  };
}
