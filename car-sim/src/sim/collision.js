// Collision module (engineer I): car-car and car-wall contacts, impulse response, FX events.
// See docs/contract-notes/collision.md (§9). No changes to vehicle.js are required: the solver
// reads the vehicle's public/instance state (pos, vel, angVel, R, mTot, Ixx/Iyy/Izz) and writes
// velocity (vel world, angVel body) and position corrections directly.
//
// Shapes: each car = oriented box from params.render (length/width/height) and the body pose.
// Walls = track.walls segments, one-sided (the track side is solid; inward normal precomputed),
// so a car can never tunnel through at any speed (per-step travel at 90 m/s = 0.18 m << half width).
// Broad phase: sort-and-sweep on x (persistent, nearly-sorted insertion sort) for cars,
// uniform grid for wall segments. Narrow phase: 2D SAT on the footprints + vertical overlap
// (car-car), box vertices vs wall half-space (walls). Contact height = middle of the vertical
// overlap, so high/low hits induce roll and pitch.

const CAP_EVENTS = 256;

function boxOf(v) {
  const p = v.params, r = p.render || {}, g = p.geometry || {};
  const len = r.length || g.length || 4.3, wid = r.width || g.width || 1.8, hgt = r.height || g.height || 1.35;
  const L = g.wheelbase || (g.a + g.b), oh = Math.max(0.2, 0.5 * (len - L));
  const xf = g.a + oh, xr = -(g.b + oh);
  const zb = -(g.cgHeight - (g.rideHeight || 0.12)), zt = hgt - g.cgHeight;
  return { cx: 0.5 * (xf + xr), cz: 0.5 * (zb + zt), hx: 0.5 * (xf - xr), hy: 0.5 * wid, hz: 0.5 * (zt - zb) };
}

/**
 * @param {object} track createTrack() output (walls optional)
 * @param {{ghosts?:boolean, restitution?:number, friction?:number, wallRestitution?:number, wallFriction?:number}} [opts]
 */
export function createCollisionWorld(track, opts = {}) {
  const ghosts = !!opts.ghosts;
  const eCar = opts.restitution ?? 0.3, muCar = opts.friction ?? 0.45;
  const kind = (track && track.def && track.def.barrier && track.def.barrier.kind) || 'armco';
  const eWall = opts.wallRestitution ?? (kind === 'tyres' ? 0.3 : kind === 'wall' ? 0.15 : 0.1);
  const muWall = opts.wallFriction ?? (kind === 'tyres' ? 0.7 : kind === 'wall' ? 0.5 : 0.35);

  // ---- walls: per-segment data + uniform grid ----
  const W = track && track.walls;
  const nSeg = W ? W.n : 0;
  const S = new Float64Array(nSeg * 9); // ax ay tx ty len nx ny zTop(A) zTop(B)
  const CELL = 8;
  let gx0 = 0, gy0 = 0, gcols = 1, grows = 1, cellStart = new Int32Array(2), cellItems = new Int32Array(0);
  if (nSeg) {
    const h = W.height || 0.9, half = nSeg >> 1;
    const q = { s: 0, offset: 0, height: 0, nx: 0, ny: 0, nz: 1, surface: 0, index: -1 };
    const vote = [0, 0];
    const raw = new Int8Array(nSeg);
    let minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
    for (let k = 0; k < nSeg; k++) {
      const ax = W.segs[4 * k], ay = W.segs[4 * k + 1], bx = W.segs[4 * k + 2], by = W.segs[4 * k + 3];
      const len = Math.hypot(bx - ax, by - ay) || 1e-6, tx = (bx - ax) / len, ty = (by - ay) / len;
      const mx = 0.5 * (ax + bx), my = 0.5 * (ay + by);
      track.query(mx + ty, my - tx, -1, q); const o1 = Math.abs(q.offset);
      track.query(mx - ty, my + tx, -1, q); const o2 = Math.abs(q.offset);
      raw[k] = o1 < o2 ? 1 : -1;                        // +1: inward normal = (ty, -tx)
      vote[k < half ? 0 : 1] += raw[k];
      const zA = track.heightAt ? track.heightAt(ax, ay) : (track.query(ax, ay, -1, q), q.height);
      const zB = track.heightAt ? track.heightAt(bx, by) : (track.query(bx, by, -1, q), q.height);
      S.set([ax, ay, tx, ty, len, 0, 0, zA + h, zB + h], 9 * k);
      minx = Math.min(minx, ax, bx); miny = Math.min(miny, ay, by); maxx = Math.max(maxx, ax, bx); maxy = Math.max(maxy, ay, by);
    }
    for (let k = 0; k < nSeg; k++) {
      // per-loop majority (left loop = first half, right loop = second half) removes outliers
      const sg = (vote[k < half ? 0 : 1] >= 0 ? 1 : -1);
      S[9 * k + 5] = sg * S[9 * k + 3]; S[9 * k + 6] = -sg * S[9 * k + 2];
    }
    gx0 = minx - CELL; gy0 = miny - CELL;
    gcols = Math.ceil((maxx - gx0) / CELL) + 2; grows = Math.ceil((maxy - gy0) / CELL) + 2;
    const lists = Array.from({ length: gcols * grows }, () => []);
    for (let k = 0; k < nSeg; k++) {
      const ax = S[9 * k], ay = S[9 * k + 1], bx = ax + S[9 * k + 2] * S[9 * k + 4], by = ay + S[9 * k + 3] * S[9 * k + 4];
      const c0 = Math.floor((Math.min(ax, bx) - gx0) / CELL), c1 = Math.floor((Math.max(ax, bx) - gx0) / CELL);
      const r0 = Math.floor((Math.min(ay, by) - gy0) / CELL), r1 = Math.floor((Math.max(ay, by) - gy0) / CELL);
      for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) lists[r * gcols + c].push(k);
    }
    cellStart = new Int32Array(gcols * grows + 1);
    let tot = 0; for (let i = 0; i < lists.length; i++) { cellStart[i] = tot; tot += lists[i].length; }
    cellStart[lists.length] = tot;
    cellItems = new Int32Array(tot); let w = 0; for (const l of lists) for (const k of l) cellItems[w++] = k;
  }
  const stamp = new Int32Array(Math.max(1, nSeg)); let stampId = 0;

  // ---- per-car scratch (grown on demand) ----
  let cap = 0, boxes = [], C = null, order = null, scrape = null;
  const ensure = (n) => {
    if (n <= cap) return;
    cap = Math.max(n, 2 * cap, 8);
    C = new Float64Array(cap * 24); order = new Int32Array(cap); scrape = new Int32Array(cap);
    for (let i = 0; i < cap; i++) order[i] = i;
  };

  const events = [];
  for (let i = 0; i < CAP_EVENTS; i++) events.push({ type: '', kind: '', pos: [0, 0, 0], normal: [0, 0, 0], impulse: 0, speed: 0, a: 0, b: 0, time: 0 });
  const world = { events, eventHead: 0, eventCount: 0, stepEventStart: 0, contacts: 0, ghosts, time: 0, step };

  function emit(type, kindStr, px, py, pz, nx, ny, nz, imp, speed, a, b) {
    const e = events[world.eventHead % CAP_EVENTS]; world.eventHead++;
    e.type = type; e.kind = kindStr; e.pos[0] = px; e.pos[1] = py; e.pos[2] = pz;
    e.normal[0] = nx; e.normal[1] = ny; e.normal[2] = nz; e.impulse = imp; e.speed = speed; e.a = a; e.b = b; e.time = world.time;
  }

  // world-space velocity of point (px,py,pz) of car i -> out
  const pv = [0, 0, 0];
  function pointVel(v, px, py, pz) {
    const R = v.R, w = v.angVel;
    const rx = px - v.pos[0], ry = py - v.pos[1], rz = pz - v.pos[2];
    const bx = R[0] * rx + R[3] * ry + R[6] * rz, by = R[1] * rx + R[4] * ry + R[7] * rz, bz = R[2] * rx + R[5] * ry + R[8] * rz;
    const cx = w[1] * bz - w[2] * by, cy = w[2] * bx - w[0] * bz, cz = w[0] * by - w[1] * bx;
    pv[0] = v.vel[0] + R[0] * cx + R[1] * cy + R[2] * cz;
    pv[1] = v.vel[1] + R[3] * cx + R[4] * cy + R[5] * cz;
    pv[2] = v.vel[2] + R[6] * cx + R[7] * cy + R[8] * cz;
  }
  // inverse effective mass along world direction d at point p
  function invMass(v, px, py, pz, dx, dy, dz) {
    const R = v.R;
    const rx = px - v.pos[0], ry = py - v.pos[1], rz = pz - v.pos[2];
    const bx = R[0] * rx + R[3] * ry + R[6] * rz, by = R[1] * rx + R[4] * ry + R[7] * rz, bz = R[2] * rx + R[5] * ry + R[8] * rz;
    const ex = R[0] * dx + R[3] * dy + R[6] * dz, ey = R[1] * dx + R[4] * dy + R[7] * dz, ez = R[2] * dx + R[5] * dy + R[8] * dz;
    const cx = by * ez - bz * ey, cy = bz * ex - bx * ez, cz = bx * ey - by * ex;
    return 1 / v.mTot + cx * cx / v.Ixx + cy * cy / v.Iyy + cz * cz / v.Izz;
  }
  function impulse(v, px, py, pz, jx, jy, jz) {
    const R = v.R, inv = 1 / v.mTot;
    v.vel[0] += jx * inv; v.vel[1] += jy * inv; v.vel[2] += jz * inv;
    const rx = px - v.pos[0], ry = py - v.pos[1], rz = pz - v.pos[2];
    const bx = R[0] * rx + R[3] * ry + R[6] * rz, by = R[1] * rx + R[4] * ry + R[7] * rz, bz = R[2] * rx + R[5] * ry + R[8] * rz;
    const ex = R[0] * jx + R[3] * jy + R[6] * jz, ey = R[1] * jx + R[4] * jy + R[7] * jz, ez = R[2] * jx + R[5] * jy + R[8] * jz;
    v.angVel[0] += (by * ez - bz * ey) / v.Ixx; v.angVel[1] += (bz * ex - bx * ez) / v.Iyy; v.angVel[2] += (bx * ey - by * ex) / v.Izz;
  }

  /**
   * Resolve one contact point between car b (and car a, or static if a == null), normal n from a to b.
   * Returns the normal impulse.
   */
  function resolve(va, vb, px, py, pz, nx, ny, nz, e, mu) {
    pointVel(vb, px, py, pz); let rvx = pv[0], rvy = pv[1], rvz = pv[2];
    if (va) { pointVel(va, px, py, pz); rvx -= pv[0]; rvy -= pv[1]; rvz -= pv[2]; }
    const vn = rvx * nx + rvy * ny + rvz * nz;
    if (vn >= 0) return 0;
    const kn = invMass(vb, px, py, pz, nx, ny, nz) + (va ? invMass(va, px, py, pz, nx, ny, nz) : 0);
    const Pn = -(1 + (vn < -1 ? e : 0)) * vn / kn;
    // Coulomb friction along the sliding direction
    let tx = rvx - vn * nx, ty = rvy - vn * ny, tz = rvz - vn * nz;
    const vt = Math.hypot(tx, ty, tz);
    let jx = Pn * nx, jy = Pn * ny, jz = Pn * nz;
    if (vt > 1e-6) {
      tx /= vt; ty /= vt; tz /= vt;
      const kt = invMass(vb, px, py, pz, tx, ty, tz) + (va ? invMass(va, px, py, pz, tx, ty, tz) : 0);
      const Pt = Math.min(vt / kt, mu * Pn);
      jx -= Pt * tx; jy -= Pt * ty; jz -= Pt * tz;
    }
    impulse(vb, px, py, pz, jx, jy, jz);
    if (va) impulse(va, px, py, pz, -jx, -jy, -jz);
    return Pn;
  }

  // ---- car geometry cache: C[i*24..]: centre(3) axes u0(3) u1(3) u2(3) half(3) radius, zmin, zmax
  function prep(i, v) {
    if (!boxes[i] || boxes[i].p !== v.params) { boxes[i] = boxOf(v); boxes[i].p = v.params; }
    const b = boxes[i], R = v.R, o = i * 24;
    C[o] = v.pos[0] + R[0] * b.cx + R[2] * b.cz;
    C[o + 1] = v.pos[1] + R[3] * b.cx + R[5] * b.cz;
    C[o + 2] = v.pos[2] + R[6] * b.cx + R[8] * b.cz;
    C[o + 3] = R[0]; C[o + 4] = R[3]; C[o + 5] = R[6];
    C[o + 6] = R[1]; C[o + 7] = R[4]; C[o + 8] = R[7];
    C[o + 9] = R[2]; C[o + 10] = R[5]; C[o + 11] = R[8];
    C[o + 12] = b.hx; C[o + 13] = b.hy; C[o + 14] = b.hz;
    C[o + 15] = Math.hypot(b.hx, b.hy, b.hz);
    const ez = b.hx * Math.abs(R[6]) + b.hy * Math.abs(R[7]) + b.hz * Math.abs(R[8]);
    C[o + 16] = C[o + 2] - ez; C[o + 17] = C[o + 2] + ez;
    // horizontal footprint axes (from the box x axis projected)
    const hl = Math.hypot(R[0], R[3]) || 1;
    C[o + 18] = R[0] / hl; C[o + 19] = R[3] / hl;
    // footprint half extents (projected box)
    const fx = C[o + 18], fy = C[o + 19];
    C[o + 20] = b.hx * Math.abs(R[0] * fx + R[3] * fy) + b.hy * Math.abs(R[1] * fx + R[4] * fy) + b.hz * Math.abs(R[2] * fx + R[5] * fy);
    C[o + 21] = b.hx * Math.abs(-R[0] * fy + R[3] * fx) + b.hy * Math.abs(-R[1] * fy + R[4] * fx) + b.hz * Math.abs(-R[2] * fy + R[5] * fx);
  }

  const ptsX = new Float64Array(8), ptsY = new Float64Array(8);
  // 2D footprint OBB pair (i, j): returns true and fills contact data if overlapping
  const ct = { nx: 0, ny: 0, depth: 0, px: 0, py: 0, pz: 0 };
  function carCar(i, j) {
    const a = i * 24, b = j * 24;
    const zlo = Math.max(C[a + 16], C[b + 16]), zhi = Math.min(C[a + 17], C[b + 17]);
    if (zhi <= zlo) return false;
    const dx = C[b] - C[a], dy = C[b + 1] - C[a + 1];
    const axes = [C[a + 18], C[a + 19], -C[a + 19], C[a + 18], C[b + 18], C[b + 19], -C[b + 19], C[b + 18]];
    let best = Infinity, bnx = 0, bny = 0;
    for (let k = 0; k < 4; k++) {
      const lx = axes[2 * k], ly = axes[2 * k + 1];
      const ra = C[a + 20] * Math.abs(lx * C[a + 18] + ly * C[a + 19]) + C[a + 21] * Math.abs(-lx * C[a + 19] + ly * C[a + 18]);
      const rb = C[b + 20] * Math.abs(lx * C[b + 18] + ly * C[b + 19]) + C[b + 21] * Math.abs(-lx * C[b + 19] + ly * C[b + 18]);
      const d = dx * lx + dy * ly, pen = ra + rb - Math.abs(d);
      if (pen <= 0) return false;
      if (pen < best) { best = pen; const sg = d >= 0 ? 1 : -1; bnx = sg * lx; bny = sg * ly; }
    }
    // contact point: average of footprint corners lying inside the other footprint
    let n = 0;
    const corners = (o, other) => {
      for (let s1 = -1; s1 <= 1; s1 += 2) for (let s2 = -1; s2 <= 1; s2 += 2) {
        const x = C[o] + s1 * C[o + 20] * C[o + 18] - s2 * C[o + 21] * C[o + 19];
        const y = C[o + 1] + s1 * C[o + 20] * C[o + 19] + s2 * C[o + 21] * C[o + 18];
        const rx = x - C[other], ry = y - C[other + 1];
        const lx = rx * C[other + 18] + ry * C[other + 19], ly = -rx * C[other + 19] + ry * C[other + 18];
        if (Math.abs(lx) <= C[other + 20] + 1e-3 && Math.abs(ly) <= C[other + 21] + 1e-3) { ptsX[n] = x; ptsY[n] = y; n++; }
      }
    };
    corners(a, b); corners(b, a);
    let px, py;
    if (n) { px = 0; py = 0; for (let k = 0; k < n; k++) { px += ptsX[k]; py += ptsY[k]; } px /= n; py /= n; }
    else { px = 0.5 * (C[a] + C[b]); py = 0.5 * (C[a + 1] + C[b + 1]); }
    ct.nx = bnx; ct.ny = bny; ct.depth = best; ct.px = px; ct.py = py; ct.pz = 0.5 * (zlo + zhi);
    return true;
  }

  function translate(v, dx, dy) {
    v.pos[0] += dx; v.pos[1] += dy;
    for (let k = 0; k < 4; k++) { const p = v.wheels[k].pos; p[0] += dx; p[1] += dy; }
  }

  function step(vehicles) {
    const n = vehicles.length;
    ensure(n);
    world.time += 1 / 500;
    world.stepEventStart = world.eventHead; world.contacts = 0;
    for (let i = 0; i < n; i++) prep(i, vehicles[i]);

    // ---- car-car: sort-and-sweep on x ----
    if (!ghosts && n > 1) {
      let m = 0;
      for (let k = 0; k < cap; k++) if (order[k] < n) order[m++] = order[k];
      for (let k = 0; k < n; k++) { let found = false; for (let q = 0; q < m; q++) if (order[q] === k) { found = true; break; } if (!found) order[m++] = k; }
      const key = (i) => C[i * 24] - C[i * 24 + 15];
      for (let k = 1; k < n; k++) {
        const id = order[k], kv = key(id); let q = k - 1;
        while (q >= 0 && (key(order[q]) > kv || (key(order[q]) === kv && order[q] > id))) { order[q + 1] = order[q]; q--; }
        order[q + 1] = id;
      }
      for (let k = n; k < cap; k++) order[k] = k;
      for (let k = 0; k < n; k++) {
        const i0 = order[k], maxX = C[i0 * 24] + C[i0 * 24 + 15];
        for (let q = k + 1; q < n; q++) {
          const j0 = order[q];
          if (key(j0) > maxX) break;
          const i = Math.min(i0, j0), j = Math.max(i0, j0);
          const dx = C[j * 24] - C[i * 24], dy = C[j * 24 + 1] - C[i * 24 + 1], rr = C[i * 24 + 15] + C[j * 24 + 15];
          if (dx * dx + dy * dy > rr * rr) continue;
          if (!carCar(i, j)) continue;
          const va = vehicles[i], vb = vehicles[j];
          const nx = ct.nx, ny = ct.ny;
          pointVel(vb, ct.px, ct.py, ct.pz); let rvx = pv[0], rvy = pv[1];
          pointVel(va, ct.px, ct.py, ct.pz); rvx -= pv[0]; rvy -= pv[1];
          const vn = rvx * nx + rvy * ny;
          let P = 0;
          for (let it = 0; it < 3; it++) P += resolve(va, vb, ct.px, ct.py, ct.pz, nx, ny, 0, eCar, muCar);
          // position correction split by mass
          const corr = 0.2 * Math.max(0, ct.depth - 0.005);
          const wa = 1 / va.mTot, wb = 1 / vb.mTot, f = corr / (wa + wb);
          translate(va, -nx * f * wa, -ny * f * wa); translate(vb, nx * f * wb, ny * f * wb);
          world.contacts++;
          if (vn < -1) emit('car', 'impact', ct.px, ct.py, ct.pz, -nx, -ny, 0, P, -vn, i, j);
          else if (Math.hypot(rvx - vn * nx, rvy - vn * ny) > 1.5 && scrape[i]++ % 10 === 0) emit('car', 'scrape', ct.px, ct.py, ct.pz, -nx, -ny, 0, P, Math.hypot(rvx - vn * nx, rvy - vn * ny), i, j);
        }
      }
    }

    // ---- car-wall ----
    if (nSeg) {
      for (let i = 0; i < n; i++) {
        const v = vehicles[i], o = i * 24, rad = C[o + 15];
        const cx = C[o], cy = C[o + 1];
        const c0 = Math.max(0, Math.floor((cx - rad - gx0) / CELL)), c1 = Math.min(gcols - 1, Math.floor((cx + rad - gx0) / CELL));
        const r0 = Math.max(0, Math.floor((cy - rad - gy0) / CELL)), r1 = Math.min(grows - 1, Math.floor((cy + rad - gy0) / CELL));
        if (c0 > c1 || r0 > r1) continue;
        stampId++;
        for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
          const cell = r * gcols + c;
          for (let q = cellStart[cell]; q < cellStart[cell + 1]; q++) {
            const k = cellItems[q];
            if (stamp[k] === stampId) continue; stamp[k] = stampId;
            const s = 9 * k, ax = S[s], ay = S[s + 1], tx = S[s + 2], ty = S[s + 3], len = S[s + 4], nx = S[s + 5], ny = S[s + 6];
            const dc = (cx - ax) * nx + (cy - ay) * ny;            // box centre must be on the track side
            if (dc <= 0 || dc > rad) continue;
            const ext = C[o + 12] * Math.abs(C[o + 3] * nx + C[o + 4] * ny) + C[o + 13] * Math.abs(C[o + 6] * nx + C[o + 7] * ny) + C[o + 14] * Math.abs(C[o + 9] * nx + C[o + 10] * ny);
            if (dc >= ext) continue;
            // box vertices behind the wall, inside the segment extent and below its top
            let cnt = 0, sx = 0, sy = 0, sz = 0, dmax = 0;
            for (let m = 0; m < 8; m++) {
              const s0 = m & 1 ? 1 : -1, s1 = m & 2 ? 1 : -1, s2 = m & 4 ? 1 : -1;
              const px = cx + s0 * C[o + 12] * C[o + 3] + s1 * C[o + 13] * C[o + 6] + s2 * C[o + 14] * C[o + 9];
              const py = cy + s0 * C[o + 12] * C[o + 4] + s1 * C[o + 13] * C[o + 7] + s2 * C[o + 14] * C[o + 10];
              let pz = C[o + 2] + s0 * C[o + 12] * C[o + 5] + s1 * C[o + 13] * C[o + 8] + s2 * C[o + 14] * C[o + 11];
              const d = -((px - ax) * nx + (py - ay) * ny);
              if (d <= 0) continue;
              const t = (px - ax) * tx + (py - ay) * ty;
              if (t < 0 || t > len) continue;
              const top = S[s + 7] + (S[s + 8] - S[s + 7]) * t / len;
              if (pz > top) { if (s2 > 0) pz = top; else continue; } // clip the box's vertical edge at the wall top
              cnt++; sx += px; sy += py; sz += pz; if (d > dmax) dmax = d;
            }
            if (!cnt) continue;
            const px = sx / cnt, py = sy / cnt, pz = sz / cnt;
            pointVel(v, px, py, pz);
            const vn = pv[0] * nx + pv[1] * ny;
            const vt = Math.abs(pv[0] * tx + pv[1] * ty);
            let P = 0;
            for (let it = 0; it < 3; it++) P += resolve(null, v, px, py, pz, nx, ny, 0, eWall, muWall);
            const corr = 0.3 * Math.max(0, dmax - 0.005);
            translate(v, nx * corr, ny * corr);
            C[o] += nx * corr; C[o + 1] += ny * corr;
            world.contacts++;
            if (vn < -1) emit('wall', 'impact', px, py, pz, nx, ny, 0, P, -vn, i, k);
            else if (vt > 1.5 && scrape[i]++ % 10 === 0) emit('wall', 'scrape', px, py, pz, nx, ny, 0, P, vt, i, k);
          }
        }
      }
    }
    for (let i = 0; i < n; i++) { const v = vehicles[i], R = v.R; v.speed = R[0] * v.vel[0] + R[3] * v.vel[1] + R[6] * v.vel[2]; }
    world.eventCount = world.eventHead - world.stepEventStart;
  }
  return world;
}

/** Iterate events written since sequence number `seq` (ring buffer); returns the new head. */
export function eventsSince(world, seq, cb) {
  const start = Math.max(seq, world.eventHead - CAP_EVENTS);
  for (let k = start; k < world.eventHead; k++) cb(world.events[k % CAP_EVENTS]);
  return world.eventHead;
}

const WORLDS = new WeakMap();
/** Convenience for race mode: collide(vehicles) — one world per track, created lazily. */
export function collide(vehicles, opts) {
  if (!vehicles.length) return null;
  const tr = vehicles[0].track;
  let w = WORLDS.get(tr);
  if (!w) { w = createCollisionWorld(tr, opts); WORLDS.set(tr, w); }
  w.step(vehicles);
  return w;
}
