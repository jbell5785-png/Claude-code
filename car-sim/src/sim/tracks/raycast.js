// Uniform-grid 2D raycaster over line segments and circles (owner D: tracks).
// Used by track.raycast for AI "lidar" sensors: track edges, walls and obstacles.

/**
 * @param {Float32Array|number[]} segs  [x1,y1,x2,y2, ...]
 * @param {Uint8Array|number[]} segKind  RAY bit per segment
 * @param {Array<{x,y,r,kind}>} circles
 * @param {number} cell  grid cell size (m)
 * @returns {(x,y,dx,dy,maxDist,mask,out?) => number}
 */
export function buildRaycaster(segs, segKind, circles, cell = 10) {
  const nS = segKind.length, nC = circles.length;
  const SX1 = new Float64Array(nS), SY1 = new Float64Array(nS), SEX = new Float64Array(nS), SEY = new Float64Array(nS);
  const SK = Uint8Array.from(segKind);
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let k = 0; k < nS; k++) {
    const x1 = segs[4 * k], y1 = segs[4 * k + 1], x2 = segs[4 * k + 2], y2 = segs[4 * k + 3];
    SX1[k] = x1; SY1[k] = y1; SEX[k] = x2 - x1; SEY[k] = y2 - y1;
    minX = Math.min(minX, x1, x2); maxX = Math.max(maxX, x1, x2);
    minY = Math.min(minY, y1, y2); maxY = Math.max(maxY, y1, y2);
  }
  const CX = new Float64Array(nC), CY = new Float64Array(nC), CR = new Float64Array(nC), CK = new Uint8Array(nC);
  for (let k = 0; k < nC; k++) {
    const c = circles[k];
    CX[k] = c.x; CY[k] = c.y; CR[k] = c.r; CK[k] = c.kind;
    minX = Math.min(minX, c.x - c.r); maxX = Math.max(maxX, c.x + c.r);
    minY = Math.min(minY, c.y - c.r); maxY = Math.max(maxY, c.y + c.r);
  }
  if (!(minX < Infinity)) { minX = minY = 0; maxX = maxY = 1; }
  const x0 = minX - cell, y0 = minY - cell;
  const cols = Math.ceil((maxX - x0) / cell) + 2, rows = Math.ceil((maxY - y0) / cell) + 2;
  const gx1 = x0 + cols * cell, gy1 = y0 + rows * cell;
  const inv = 1 / cell;
  // --- bin items: conservative (segment bbox / circle bbox cells), counting sort
  const lists = new Array(cols * rows);
  const addItem = (id, ax, ay, bx, by) => {
    const c0 = Math.max(0, Math.floor((Math.min(ax, bx) - x0) * inv)), c1 = Math.min(cols - 1, Math.floor((Math.max(ax, bx) - x0) * inv));
    const r0 = Math.max(0, Math.floor((Math.min(ay, by) - y0) * inv)), r1 = Math.min(rows - 1, Math.floor((Math.max(ay, by) - y0) * inv));
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
      const k = c + r * cols;
      (lists[k] || (lists[k] = [])).push(id);
    }
  };
  for (let k = 0; k < nS; k++) addItem(k, SX1[k], SY1[k], SX1[k] + SEX[k], SY1[k] + SEY[k]);
  for (let k = 0; k < nC; k++) addItem(nS + k, CX[k] - CR[k], CY[k] - CR[k], CX[k] + CR[k], CY[k] + CR[k]);
  const start = new Int32Array(cols * rows + 1);
  for (let k = 0; k < cols * rows; k++) start[k + 1] = start[k] + (lists[k] ? lists[k].length : 0);
  const items = new Int32Array(start[cols * rows]);
  // per-cell mask of kinds present, to skip cells quickly
  const cellMask = new Uint8Array(cols * rows);
  for (let k = 0; k < cols * rows; k++) {
    const l = lists[k]; if (!l) continue;
    let m = 0;
    for (let q = 0; q < l.length; q++) {
      items[start[k] + q] = l[q];
      m |= l[q] < nS ? SK[l[q]] : CK[l[q] - nS];
    }
    cellMask[k] = m;
  }
  const stamp = new Uint32Array(nS + nC);
  let stampId = 0;

  /**
   * Cast a ray from (x,y) along unit (dx,dy). Returns the distance to the first hit of a kind in
   * `mask`, or maxDist. Fills out { dist, kind, nx, ny } if given (kind 0 = no hit).
   */
  function raycast(x, y, dx, dy, maxDist, mask, out) {
    if (mask === undefined) mask = 7;
    stampId = (stampId + 1) >>> 0;
    if (stampId === 0) { stamp.fill(0); stampId = 1; }
    let best = maxDist, bestKind = 0, bnx = 0, bny = 0;
    // clip the ray to the grid box
    let tmin = 0, tmax = maxDist;
    if (dx !== 0) {
      let a = (x0 - x) / dx, b = (gx1 - x) / dx;
      if (a > b) { const t = a; a = b; b = t; }
      if (a > tmin) tmin = a; if (b < tmax) tmax = b;
    } else if (x < x0 || x >= gx1) tmax = -1;
    if (dy !== 0) {
      let a = (y0 - y) / dy, b = (gy1 - y) / dy;
      if (a > b) { const t = a; a = b; b = t; }
      if (a > tmin) tmin = a; if (b < tmax) tmax = b;
    } else if (y < y0 || y >= gy1) tmax = -1;
    if (tmin <= tmax) {
      const sx = x + dx * tmin, sy = y + dy * tmin;
      let cx = Math.floor((sx - x0) * inv), cy = Math.floor((sy - y0) * inv);
      if (cx < 0) cx = 0; else if (cx >= cols) cx = cols - 1;
      if (cy < 0) cy = 0; else if (cy >= rows) cy = rows - 1;
      const stepX = dx > 0 ? 1 : -1, stepY = dy > 0 ? 1 : -1;
      const tdx = dx !== 0 ? Math.abs(cell / dx) : Infinity, tdy = dy !== 0 ? Math.abs(cell / dy) : Infinity;
      let tMaxX = dx !== 0 ? ((x0 + (cx + (dx > 0 ? 1 : 0)) * cell) - x) / dx : Infinity;
      let tMaxY = dy !== 0 ? ((y0 + (cy + (dy > 0 ? 1 : 0)) * cell) - y) / dy : Infinity;
      for (;;) {
        const c = cx + cy * cols;
        if (cellMask[c] & mask) {
          for (let q = start[c], e = start[c + 1]; q < e; q++) {
            const id = items[q];
            if (stamp[id] === stampId) continue;
            stamp[id] = stampId;
            if (id < nS) {
              if (!(SK[id] & mask)) continue;
              const ex = SEX[id], ey = SEY[id];
              const den = dx * ey - dy * ex;
              if (den > -1e-12 && den < 1e-12) continue;
              const wx = SX1[id] - x, wy = SY1[id] - y;
              const t = (wx * ey - wy * ex) / den;
              if (t < 0 || t >= best) continue;
              const u = (wx * dy - wy * dx) / den;
              if (u < 0 || u > 1) continue;
              best = t; bestKind = SK[id];
              const il = 1 / Math.sqrt(ex * ex + ey * ey);
              bnx = -ey * il; bny = ex * il;
              if (bnx * dx + bny * dy > 0) { bnx = -bnx; bny = -bny; }
            } else {
              const k = id - nS;
              if (!(CK[k] & mask)) continue;
              const ox = x - CX[k], oy = y - CY[k];
              const b = ox * dx + oy * dy, cc = ox * ox + oy * oy - CR[k] * CR[k];
              const disc = b * b - cc;
              if (disc < 0) continue;
              let t = -b - Math.sqrt(disc);
              if (t < 0) { if (cc <= 0) t = 0; else continue; } // origin inside → hit at 0
              if (t >= best) continue;
              best = t; bestKind = CK[k];
              const hx = ox + dx * t, hy = oy + dy * t, hl = Math.sqrt(hx * hx + hy * hy) || 1;
              bnx = hx / hl; bny = hy / hl;
            }
          }
        }
        // advance to the next cell (stop when the next cell starts beyond the best hit)
        if (tMaxX < tMaxY) {
          if (tMaxX > best || tMaxX > tmax) break;
          cx += stepX; tMaxX += tdx;
          if (cx < 0 || cx >= cols) break;
        } else {
          if (tMaxY > best || tMaxY > tmax) break;
          cy += stepY; tMaxY += tdy;
          if (cy < 0 || cy >= rows) break;
        }
      }
    }
    if (out) { out.dist = best; out.kind = bestKind; out.nx = bnx; out.ny = bny; }
    return best;
  }
  raycast.grid = { x0, y0, cell, cols, rows, items: items.length, segments: nS, circles: nC };
  return raycast;
}
