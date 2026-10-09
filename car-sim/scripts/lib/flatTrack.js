// Test-only track: an infinite plane, optionally sloped along +x (grade) and/or banked along +y.
// Implements the subset of the track API used by vehicle.js: query(x, y, hint, out).
import { SURFACE } from '../../src/sim/constants.js';

/**
 * @param {{grade?:number, bank?:number, surface?:number}} [o] grade = dz/dx, bank = dz/dy
 */
export function createFlatTrack(o = {}) {
  const gx = o.grade || 0, gy = o.bank || 0, surf = o.surface || SURFACE.ASPHALT;
  const inv = 1 / Math.sqrt(gx * gx + gy * gy + 1);
  const nx = -gx * inv, ny = -gy * inv, nz = inv;
  return {
    length: 1e9, width: 1e9, closed: false,
    query(x, y, hint, out) {
      out.s = x; out.offset = y; out.height = gx * x + gy * y;
      out.nx = nx; out.ny = ny; out.nz = nz; out.surface = surf; out.index = 0;
      return out;
    },
    startPose() { return { x: 0, y: 0, heading: 0 }; },
  };
}
