// Procedural car models built from params.render + params.geometry.
// Model frame: +X forward, +Y up, +Z right (three-ified body frame); origin on the ground below the CG.
// CarView wraps a model and syncs it from the §5 vehicle public state (pose, wheels, brakes, flames).
import * as THREE from 'three';
import { mergeGeometries, mergeVertices, toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';
import { simToThree, simQuatToThree } from './coords.js';
import { tyreTexture } from './textures.js';

const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;

// Side profiles. x: 0 = tail, 1 = nose (fraction of length). y: fraction of total height.
// hull = upper outline of the lower body, tail -> nose. cabin = rear base, roof points..., windscreen base.
const STYLES = {
  kei: { fo: 0.55, clear: 0.15, belt: 0.56, cabinW: 0.9, tumble: 0.1, bPillar: 0.45, spokes: 6, crown: 0.02,
    hull: [[0, 0.30], [0.008, 0.5], [0.025, 0.56], [0.80, 0.55], [0.92, 0.50], [0.985, 0.43], [1, 0.30]],
    cabin: [[0.012, 0.56], [0.025, 0.97], [0.07, 1.0], [0.62, 0.99], [0.82, 0.56]] },
  hatch: { fo: 0.62, clear: 0.13, cabinW: 0.86, tumble: 0.18, bPillar: 0.43, spokes: 5, crown: 0.025,
    hull: [[0, 0.36], [0.01, 0.58], [0.03, 0.66], [0.66, 0.65], [0.82, 0.60], [0.95, 0.52], [1, 0.36]],
    cabin: [[0.02, 0.66], [0.08, 0.95], [0.16, 1.0], [0.50, 0.99], [0.67, 0.655]] },
  sedan: { fo: 0.52, clear: 0.13, cabinW: 0.86, tumble: 0.18, bPillar: 0.47, spokes: 10, crown: 0.025,
    hull: [[0, 0.40], [0.015, 0.58], [0.045, 0.67], [0.16, 0.685], [0.24, 0.685], [0.70, 0.65], [0.84, 0.61], [0.95, 0.53], [1, 0.38]],
    cabin: [[0.22, 0.685], [0.31, 0.96], [0.40, 1.0], [0.57, 0.99], [0.70, 0.655]] },
  coupe: { fo: 0.55, clear: 0.12, cabinW: 0.84, tumble: 0.22, bPillar: null, spokes: 5, crown: 0.03,
    hull: [[0, 0.38], [0.015, 0.57], [0.06, 0.65], [0.20, 0.67], [0.30, 0.665], [0.62, 0.63], [0.80, 0.57], [0.93, 0.49], [0.99, 0.41], [1, 0.33]],
    cabin: [[0.20, 0.67], [0.40, 0.985], [0.47, 1.0], [0.555, 0.98], [0.655, 0.635]] },
  roadster: { fo: 0.55, clear: 0.12, cabinW: 0.86, tumble: 0.15, bPillar: null, spokes: 6, crown: 0.03, open: true,
    hull: [[0, 0.42], [0.02, 0.62], [0.07, 0.69], [0.32, 0.71], [0.60, 0.68], [0.80, 0.62], [0.94, 0.53], [1, 0.40]],
    cabin: null, screen: [[0.60, 0.68], [0.53, 0.96]], cockpit: [0.33, 0.585] },
  suv: { fo: 0.55, clear: 0.21, cabinW: 0.9, tumble: 0.12, bPillar: 0.42, spokes: 6, crown: 0.02, rails: true,
    hull: [[0, 0.38], [0.01, 0.58], [0.03, 0.62], [0.70, 0.62], [0.86, 0.585], [0.97, 0.52], [1, 0.36]],
    cabin: [[0.025, 0.62], [0.07, 0.96], [0.14, 1.0], [0.57, 0.99], [0.715, 0.62]] },
  pickup: { fo: 0.6, clear: 0.25, cabinW: 0.9, tumble: 0.1, bPillar: 0.53, spokes: 6, crown: 0.015, bed: [0.012, 0.365],
    hull: [[0, 0.32], [0.004, 0.56], [0.012, 0.585], [0.78, 0.585], [0.90, 0.555], [0.98, 0.50], [1, 0.34]],
    cabin: [[0.37, 0.585], [0.385, 0.97], [0.42, 1.0], [0.615, 0.99], [0.765, 0.585]] },
  supercar: { fo: 0.5, clear: 0.10, cabinW: 0.74, tumble: 0.26, bPillar: null, spokes: 5, crown: 0.0, valley: true, intakes: true,
    hull: [[0, 0.42], [0.01, 0.63], [0.04, 0.70], [0.18, 0.73], [0.32, 0.72], [0.62, 0.54], [0.82, 0.44], [0.95, 0.35], [1, 0.25]],
    cabin: [[0.27, 0.72], [0.42, 0.985], [0.48, 1.0], [0.56, 0.955], [0.69, 0.50]] },
};

const MAT = {};
function mats() {
  if (MAT.trim) return MAT;
  MAT.trim = new THREE.MeshStandardMaterial({ color: 0x111214, roughness: 0.55, metalness: 0.1 });
  MAT.carbon = new THREE.MeshStandardMaterial({ color: 0x1a1c20, roughness: 0.32, metalness: 0.3 });
  MAT.grille = new THREE.MeshStandardMaterial({ color: 0x050506, roughness: 0.8, metalness: 0 });
  MAT.glass = new THREE.MeshPhysicalMaterial({ color: 0x0a0e14, roughness: 0.04, metalness: 0.1, transparent: true, opacity: 0.62, clearcoat: 1, depthWrite: false, side: THREE.DoubleSide });
  MAT.interior = new THREE.MeshStandardMaterial({ color: 0x0b0b0c, roughness: 0.9 });
  MAT.headlight = new THREE.MeshStandardMaterial({ color: 0xdfe8f2, emissive: 0xeaf2ff, emissiveIntensity: 1.6, roughness: 0.1, metalness: 0.4 });
  MAT.indicator = new THREE.MeshStandardMaterial({ color: 0xff9a1f, emissive: 0xff8a10, emissiveIntensity: 0.25, roughness: 0.2 });
  MAT.rim = new THREE.MeshStandardMaterial({ color: 0xb9bec6, roughness: 0.28, metalness: 0.9 });
  MAT.rimDark = new THREE.MeshStandardMaterial({ color: 0x2a2d33, roughness: 0.35, metalness: 0.85 });
  MAT.tyre = new THREE.MeshStandardMaterial({ color: 0xffffff, map: tyreTexture(), roughness: 0.92, metalness: 0 });
  MAT.caliper = new THREE.MeshStandardMaterial({ color: 0xc81e1e, roughness: 0.45, metalness: 0.2 });
  MAT.chrome = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.15, metalness: 1 });
  MAT.helmet = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.3, metalness: 0.1 });
  MAT.visor = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.05, metalness: 0.8 });
  MAT.flame = new THREE.MeshBasicMaterial({ color: 0xffa040, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
  MAT.flameCore = new THREE.MeshBasicMaterial({ color: 0x9fd0ff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
  return MAT;
}

function paintMaterial(color, ghost, opacity) {
  if (ghost) return new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.2, transparent: true, opacity, depthWrite: false });
  return new THREE.MeshPhysicalMaterial({ color, roughness: 0.32, metalness: 0.45, clearcoat: 1, clearcoatRoughness: 0.06 });
}

// Inset a convex polygon by d (positive = inward). pts CCW.
function insetPolygon(pts, d) {
  const n = pts.length; const lines = [];
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n]; const dx = b.x - a.x, dy = b.y - a.y; const l = Math.hypot(dx, dy) || 1;
    const nx = -dy / l, ny = dx / l; // left normal = inward for CCW
    lines.push({ px: a.x + nx * d, py: a.y + ny * d, dx, dy });
  }
  const out = [];
  for (let i = 0; i < n; i++) {
    const L1 = lines[(i - 1 + n) % n], L2 = lines[i];
    const den = L1.dx * L2.dy - L1.dy * L2.dx;
    if (Math.abs(den) < 1e-9) { out.push(new THREE.Vector2(L2.px, L2.py)); continue; }
    const t = ((L2.px - L1.px) * L2.dy - (L2.py - L1.py) * L2.dx) / den;
    out.push(new THREE.Vector2(L1.px + L1.dx * t, L1.py + L1.dy * t));
  }
  return out;
}
function clipX(pts, x, keepGreater) {
  const out = []; const n = pts.length;
  const inside = (p) => (keepGreater ? p.x >= x : p.x <= x);
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    if (inside(a)) out.push(a);
    if (inside(a) !== inside(b)) { const t = (x - a.x) / (b.x - a.x); out.push(new THREE.Vector2(x, a.y + (b.y - a.y) * t)); }
  }
  return out;
}
function polyArea(p) { let s = 0; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; s += a.x * b.y - b.x * a.y; } return s / 2; }

function interpProfile(pts, f) {
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    if (f >= a[0] && f <= b[0]) { const t = (f - a[0]) / (b[0] - a[0] || 1); return lerp(a[1], b[1], t * t * (3 - 2 * t) * 0.35 + t * 0.65); }
  }
  return f < pts[0][0] ? pts[0][1] : pts[pts.length - 1][1];
}

/**
 * Compute dimensions for a car from params.
 * @returns layout object used by geometry builders
 */
export function carLayout(params) {
  const r = params.render || {}; const geo = params.geometry || {};
  const style = STYLES[r.style] ? r.style : 'coupe'; const S = STYLES[style];
  const L = r.length || 4.3, W = r.width || 1.8, H = r.height || 1.35;
  const wb = geo.wheelbase || 2.6; const a = geo.a ?? wb / 2; const b = geo.b ?? wb / 2;
  const over = Math.max(0.3, L - wb);
  const xF = a, xR = -b; const xNose = xF + over * S.fo; const xTail = xR - over * (1 - S.fo);
  const mm = (v, d) => (v == null ? d : v > 5 ? v / 1000 : v);
  const rF = r.wheelRadiusF || 0.32, rR = r.wheelRadiusR || rF;
  const twF = mm(r.tyreWidthF, 0.235), twR = mm(r.tyreWidthR, 0.255);
  const trackF = geo.trackF || W - 0.25, trackR = geo.trackR || W - 0.25;
  const wide = /wide|Wide/.test(r.bodyKit || '');
  const cgH = geo.cgHeight || 0.45;
  return { style, S, L, W, H, wb, a, b, xF, xR, xNose, xTail, rF, rR, twF, twR, trackF, trackR, wide, cgH,
    X: (f) => xTail + f * (xNose - xTail), color: r.color || params.spec?.color || '#c0392b' };
}

function buildHullGeometry(lay) {
  const { S, H, W, xF, xR, rF, rR, X } = lay;
  const yb = S.clear; const shape = new THREE.Shape();
  const RaF = rF + 0.05 + (lay.wide ? 0.02 : 0), RaR = rR + 0.05 + (lay.wide ? 0.02 : 0);
  const arch = (cx, cy, R) => {
    const th = Math.asin(clamp((yb - cy) / R, -1, 1));
    shape.lineTo(cx - R * Math.cos(th), yb);
    shape.absarc(cx, cy, R, Math.PI - th, th, true);
  };
  shape.moveTo(X(0) + 0.06, yb);
  arch(xR, rR, RaR);
  arch(xF, rF, RaF);
  shape.lineTo(X(1) - 0.08, yb);
  // upper outline nose -> tail, sampled densely, with fender bulges over the wheels
  const N = 70; const archTopF = rF + RaF + 0.045, archTopR = rR + RaR + 0.05;
  for (let i = N; i >= 0; i--) {
    const f = i / N; const x = X(f); let y = interpProfile(S.hull, f) * H;
    const bump = (cx, top, R) => { const d = Math.abs(x - cx) / (R + 0.32); return d < 1 ? top * (1 - Math.pow(d, 4)) : 0; };
    y = Math.max(y, bump(xF, archTopF, RaF), bump(xR, archTopR, RaR));
    if (i === N) y = Math.max(y, yb + 0.12);
    shape.lineTo(x, y);
  }
  const bevel = 0.05;
  const g = new THREE.ExtrudeGeometry(shape, { depth: W - bevel * 2, steps: 12, curveSegments: 18, bevelEnabled: true, bevelThickness: bevel, bevelSize: 0.035, bevelSegments: 4 });
  g.translate(0, 0, -(W - bevel * 2) / 2);
  const pos = g.attributes.position; const v = new THREE.Vector3();
  const xn = X(1), xt = X(0);
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const prof = interpProfile(S.hull, (v.x - xt) / (xn - xt)) * H;
    const zr = Math.abs(v.z) / (W / 2);
    // plan view taper at the nose and tail
    const tn = smooth(xn - 0.9, xn + 0.05, v.x), tt = smooth(xt + 0.6, xt - 0.05, v.x);
    let k = 1 - 0.16 * tn * tn - 0.08 * tt * tt;
    // slight tumblehome on the upper body
    k *= 1 - 0.05 * smooth(prof - 0.25, prof, v.y);
    v.z *= k;
    // supercar valley between the fenders / bonnet crown
    if (v.y > prof - 0.01 && S.valley) { const c = 1 - smooth(0.42, 0.72, zr); v.y = lerp(v.y, Math.max(prof, yb + 0.15) + 0.0, c); }
    if (v.y > prof - 0.06 && S.crown) v.y += S.crown * (1 - zr * zr) * smooth(prof - 0.06, prof, v.y);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  g.deleteAttribute('uv'); g.deleteAttribute('normal');
  const m = mergeVertices(g, 1e-4);
  return toCreasedNormals(m, 0.62);
}

function cabinPoints(lay) {
  const { S, H, X } = lay;
  const c = S.cabin; const pts = c.map(([f, y]) => new THREE.Vector2(X(f), y * H));
  // close below the beltline so it overlaps the hull
  const first = pts[0], last = pts[pts.length - 1];
  return { outline: [new THREE.Vector2(last.x, last.y - 0.12), new THREE.Vector2(first.x, first.y - 0.12), ...pts], top: pts };
}

function cabinHalfWidth(lay, y) {
  const { S, H, W } = lay; const belt = S.cabin[0][1] * H; const t = clamp((y - belt) / (H - belt), 0, 1);
  return (W * S.cabinW) / 2 * (1 - S.tumble * t);
}

function buildCabin(lay, paint, M, group) {
  const { S, W } = lay; if (!S.cabin) return;
  const { outline, top } = cabinPoints(lay);
  // outline is ordered: windscreen-base-low, rear-base-low, rear base, roof..., windscreen base -> CW or CCW? ensure CCW
  let poly = outline; if (polyArea(poly) < 0) poly = poly.slice().reverse();
  const shape = new THREE.Shape(poly);
  const bevel = 0.04; const Wc = W * S.cabinW;
  const g = new THREE.ExtrudeGeometry(shape, { depth: Wc - bevel * 2, steps: 6, curveSegments: 8, bevelEnabled: true, bevelThickness: bevel, bevelSize: 0.03, bevelSegments: 3 });
  g.translate(0, 0, -(Wc - bevel * 2) / 2);
  const pos = g.attributes.position; const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    v.z = v.z / (Wc / 2) * cabinHalfWidth(lay, v.y);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  g.deleteAttribute('uv'); g.deleteAttribute('normal');
  const cab = new THREE.Mesh(toCreasedNormals(mergeVertices(g, 1e-4), 0.6), paint);
  cab.castShadow = true; group.add(cab);

  // ---- glass: side windows (inset outline), windscreen, rear screen
  const belt = Math.min(top[0].y, top[top.length - 1].y);
  let side = [new THREE.Vector2(top[top.length - 1].x, top[top.length - 1].y), ...top.slice(0, -1).map((p) => p.clone())];
  side = top.map((p) => p.clone()); if (polyArea(side) < 0) side.reverse();
  const winPoly = insetPolygon(side, 0.06).map((p) => new THREE.Vector2(p.x, Math.max(p.y, belt + 0.035)));
  const panes = [];
  if (S.bPillar != null) {
    const bx = lay.X(S.bPillar);
    panes.push(clipX(winPoly, bx + 0.045, true), clipX(winPoly, bx - 0.045, false));
  } else panes.push(winPoly);
  const geos = [];
  for (const pane of panes) {
    if (pane.length < 3) continue;
    for (const sgn of [-1, 1]) {
      const sg = new THREE.ShapeGeometry(new THREE.Shape(pane));
      const p = sg.attributes.position;
      for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setZ(i, sgn * (cabinHalfWidth(lay, y) + 0.006)); }
      if (sgn < 0) { // flip winding so it faces outward
        const idx = sg.index.array; for (let i = 0; i < idx.length; i += 3) { const t = idx[i]; idx[i] = idx[i + 1]; idx[i + 1] = t; }
      }
      sg.computeVertexNormals(); geos.push(sg);
    }
  }
  // windscreen: from last base point to first roof point after (going backwards along top)
  const screen = (pa, pb, outSign) => {
    // pa = lower point, pb = upper point; quad across the cabin width
    const ins = 0.07; const ha = cabinHalfWidth(lay, pa.y) - ins, hb = cabinHalfWidth(lay, pb.y) - ins;
    const dx = pb.x - pa.x, dy = pb.y - pa.y; const l = Math.hypot(dx, dy); const nx = dy / l * outSign, ny = -dx / l * outSign;
    const o = 0.034; const t0 = 0.05, t1 = 0.94;
    const A = [lerp(pa.x, pb.x, t0) + nx * o, lerp(pa.y, pb.y, t0) + ny * o], B = [lerp(pa.x, pb.x, t1) + nx * o, lerp(pa.y, pb.y, t1) + ny * o];
    const hA = lerp(ha, hb, t0), hB = lerp(ha, hb, t1);
    const geo = new THREE.BufferGeometry();
    const verts = new Float32Array([A[0], A[1], -hA, A[0], A[1], hA, B[0], B[1], hB, B[0], B[1], -hB]);
    geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    geo.setIndex(outSign > 0 ? [0, 1, 2, 0, 2, 3] : [0, 2, 1, 0, 3, 2]);
    geo.computeVertexNormals(); return geo;
  };
  const n = top.length;
  geos.push(screen(top[n - 1], top[n - 2], 1)); // windscreen
  geos.push(screen(top[0], top[1], -1));         // rear screen
  const glassGeo = mergeGeometries(geos.map((gg) => { const q = gg.index ? gg.toNonIndexed() : gg; if (q.attributes.uv) q.deleteAttribute('uv'); return q; }), false);
  const glass = new THREE.Mesh(glassGeo, M.glass);
  glass.renderOrder = 2; group.add(glass);

  // dark interior so the glass doesn't look into the void
  const minX = Math.min(...top.map((p) => p.x)), maxX = Math.max(...top.map((p) => p.x));
  const inner = new THREE.Mesh(new THREE.BoxGeometry((maxX - minX) * 0.8, (lay.H - belt) * 0.8, cabinHalfWidth(lay, belt) * 1.7), M.interior);
  inner.position.set((minX + maxX) / 2, belt + (lay.H - belt) * 0.35, 0); group.add(inner);
}

function buildWheelGeometry(R, w, spokes, lod) {
  // tyre: lathe profile around Y, then rotated so the axle is Z
  const rimR = R * (lod === 'low' ? 0.66 : 0.68); const pts = [];
  const sh = Math.min(0.035, w * 0.18);
  pts.push(new THREE.Vector2(rimR, -w / 2 + 0.01));
  pts.push(new THREE.Vector2(R - sh * 1.4, -w / 2));
  for (let i = 0; i <= 5; i++) { const a = -Math.PI / 2 + (i / 5) * (Math.PI / 2); pts.push(new THREE.Vector2(R - sh + Math.cos(a) * sh, -w / 2 + sh + Math.sin(a) * sh)); }
  for (let i = 0; i <= 5; i++) { const a = (i / 5) * (Math.PI / 2); pts.push(new THREE.Vector2(R - sh + Math.cos(a) * sh, w / 2 - sh + Math.sin(a) * sh)); }
  pts.push(new THREE.Vector2(R - sh * 1.4, w / 2));
  pts.push(new THREE.Vector2(rimR, w / 2 - 0.01));
  const tyre = new THREE.LatheGeometry(pts, lod === 'low' ? 16 : 36);
  tyre.rotateX(Math.PI / 2);
  // rim: barrel + lip + spokes + hub, outer face at +z
  const parts = [];
  const barrel = new THREE.CylinderGeometry(rimR, rimR, w * 0.9, lod === 'low' ? 12 : 28, 1, true); barrel.rotateX(Math.PI / 2); parts.push(barrel);
  if (lod !== 'low') {
    const lip = new THREE.TorusGeometry(rimR - 0.008, 0.012, 6, 32); lip.translate(0, 0, w * 0.42); parts.push(lip);
    const hub = new THREE.CylinderGeometry(R * 0.16, R * 0.18, 0.06, 16); hub.rotateX(Math.PI / 2); hub.translate(0, 0, w * 0.36); parts.push(hub);
    const n = spokes || 5;
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2;
      const len = rimR - R * 0.14;
      const sp = new THREE.BoxGeometry(n >= 10 ? 0.03 : 0.055, len, 0.035);
      sp.translate(0, R * 0.14 + len / 2, w * 0.38);
      if (n < 10) { // slightly dished: tilt spokes
        const pa = sp.attributes.position; for (let k = 0; k < pa.count; k++) pa.setZ(k, pa.getZ(k) - (pa.getY(k) / rimR) * 0.03);
      }
      sp.rotateZ(ang); parts.push(sp);
      if (n === 5) { const sp2 = sp.clone(); sp2.rotateZ(0.2); parts.push(sp2); }
    }
    for (const p of parts) { if (p.index) continue; }
  } else {
    const face = new THREE.CircleGeometry(rimR, 12); face.translate(0, 0, w * 0.35); parts.push(face);
  }
  const rim = mergeGeometries(parts.map((p) => (p.index ? p.toNonIndexed() : p)).map((p) => { p.deleteAttribute('uv'); return p; }), false);
  rim.computeVertexNormals();
  return { tyre, rim, rimR };
}

function addBox(group, mat, sx, sy, sz, x, y, z, rot) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat); m.position.set(x, y, z);
  if (rot) m.rotation.set(rot[0] || 0, rot[1] || 0, rot[2] || 0);
  m.castShadow = true; group.add(m); return m;
}

function aerofoil(chord, thick, camber) {
  const s = new THREE.Shape(); const N = 16; const up = [], lo = [];
  for (let i = 0; i <= N; i++) {
    const x = i / N; const t = 5 * thick * (0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x * x + 0.2843 * x ** 3 - 0.1015 * x ** 4);
    const c = -camber * 4 * x * (1 - x); // inverted camber (downforce)
    up.push([x, c + t]); lo.push([x, c - t]);
  }
  // chord along -x (leading edge at +x)
  s.moveTo(chord * 0.5 - up[0][0] * chord, up[0][1] * chord);
  for (const p of up) s.lineTo(chord * 0.5 - p[0] * chord, p[1] * chord);
  for (let i = lo.length - 1; i >= 0; i--) s.lineTo(chord * 0.5 - lo[i][0] * chord, lo[i][1] * chord);
  return s;
}

/** Raycast helper: hit the hull from outside at (y,z), travelling along dir. */
function hitHull(mesh, origin, dir) {
  const rc = new THREE.Raycaster(origin, dir, 0, 20); const h = rc.intersectObject(mesh, false)[0];
  return h || null;
}

/**
 * Build a car model group. Returns { root, body, wheels[4] (spin groups), steerGroups, discs, brakeLights, flames, lay }.
 * @param {object} params build(spec) output
 * @param {{ghost?:boolean, opacity?:number, lod?:'high'|'low', color?:string}} opts
 */
export function buildCarModel(params, opts = {}) {
  const M = mats(); const lay = carLayout(params); const { S, W, H } = lay;
  const ghost = !!opts.ghost; const lod = opts.lod || (ghost ? 'low' : 'high');
  const paint = paintMaterial(new THREE.Color(opts.color || lay.color), ghost, opts.opacity ?? 0.35);
  const trimM = ghost ? paint : M.trim;
  const root = new THREE.Group(); root.name = 'car';
  const body = new THREE.Group(); root.add(body); // sprung body, origin at CG; contents offset to ground frame
  const shell = new THREE.Group(); shell.position.y = -lay.cgH; body.add(shell);

  const hull = new THREE.Mesh(buildHullGeometry(lay), paint); hull.castShadow = !ghost; hull.receiveShadow = !ghost; shell.add(hull);
  hull.updateMatrixWorld(true);
  if (!ghost) buildCabin(lay, paint, M, shell);
  else if (S.cabin) {
    const { outline } = cabinPoints(lay); let poly = outline; if (polyArea(poly) < 0) poly = poly.slice().reverse();
    const g = new THREE.ExtrudeGeometry(new THREE.Shape(poly), { depth: W * S.cabinW * 0.9, bevelEnabled: false });
    g.translate(0, 0, -W * S.cabinW * 0.45); shell.add(new THREE.Mesh(g, paint));
  }

  const parts = { headlights: [], brakeLights: [], flames: [], exhausts: [] };
  const xn = lay.X(1), xt = lay.X(0);
  const tailMat = ghost ? paint : new THREE.MeshStandardMaterial({ color: 0x5a0a0a, emissive: 0xff1a10, emissiveIntensity: 0.35, roughness: 0.2 });
  parts.tailMat = tailMat;

  if (!ghost) {
    // ---- lights via raycasts against the hull
    const place = (y, z, fromFront, w, h, mat, depth = 0.04) => {
      const o = new THREE.Vector3(fromFront ? xn + 1 : xt - 1, y, z); const d = new THREE.Vector3(fromFront ? -1 : 1, 0, 0);
      const hit = hitHull(hull, o, d); if (!hit) return null;
      const n = hit.face.normal.clone();
      const m = new THREE.Mesh(new THREE.BoxGeometry(depth, h, w), mat);
      m.position.copy(hit.point).addScaledVector(n, 0.004);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(fromFront ? 1 : -1, 0, 0), n);
      shell.add(m); return m;
    };
    const hlY = interpProfile(S.hull, 0.985) * H * 0.92;
    const tlY = interpProfile(S.hull, 0.01) * H * 0.9;
    for (const sgn of [-1, 1]) {
      const hl = place(hlY, sgn * W * 0.33, true, W * (lay.style === 'supercar' ? 0.2 : 0.17), 0.07, M.headlight);
      if (hl) parts.headlights.push(hl);
      place(hlY - 0.08, sgn * W * 0.40, true, 0.06, 0.03, M.indicator);
      const tl = place(tlY, sgn * W * 0.35, false, W * 0.2, 0.07, tailMat);
      if (tl) parts.brakeLights.push(tl);
    }
    if (lay.style === 'supercar' || lay.style === 'coupe') { const bar = place(tlY + 0.02, 0, false, W * 0.45, 0.025, tailMat); if (bar) parts.brakeLights.push(bar); }
    // grille / intake
    const gy = interpProfile(S.hull, 0.99) * H * (lay.style === 'supercar' ? 0.55 : 0.6);
    place(gy, 0, true, W * (lay.style === 'suv' || lay.style === 'pickup' ? 0.55 : 0.42), lay.style === 'suv' || lay.style === 'pickup' ? 0.22 : 0.12, M.grille, 0.03);
    // lower valance / bumper strip front + rear
    addBox(shell, M.trim, 0.12, 0.06, W * 0.86, xn - 0.08, S.clear + 0.04, 0);
    addBox(shell, M.trim, 0.14, 0.08, W * 0.84, xt + 0.08, S.clear + 0.05, 0);
    // mirrors
    if (S.cabin) {
      const cx = lay.X(S.cabin[S.cabin.length - 1][0]) - 0.12; const cy = S.cabin[S.cabin.length - 1][1] * H + 0.08;
      for (const sgn of [-1, 1]) {
        const mir = addBox(shell, paint, 0.12, 0.08, 0.14, cx, cy, sgn * (cabinHalfWidth(lay, cy) + 0.1));
        addBox(shell, M.trim, 0.05, 0.03, 0.1, cx + 0.02, cy - 0.03, sgn * (cabinHalfWidth(lay, cy) + 0.03));
        mir.castShadow = false;
      }
    }
    // supercar side intakes
    if (S.intakes) {
      for (const sgn of [-1, 1]) {
        const x = lay.xR + lay.rR + 0.45; const o = new THREE.Vector3(x, H * 0.4, sgn * (W)); const hit = hitHull(hull, o, new THREE.Vector3(0, 0, -sgn));
        if (hit) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.03), M.grille); m.position.copy(hit.point); m.position.z -= sgn * 0.005; m.rotation.z = -0.25; shell.add(m); }
      }
    }
    // roadster: windscreen, cockpit opening, roll hoops
    if (S.open) {
      const [a, b] = S.screen; const pa = new THREE.Vector3(lay.X(a[0]), a[1] * H, 0), pb = new THREE.Vector3(lay.X(b[0]), b[1] * H, 0);
      const len = pa.distanceTo(pb); const scr = new THREE.Mesh(new THREE.BoxGeometry(0.012, len, W * 0.78), M.glass);
      scr.position.copy(pa).lerp(pb, 0.5); scr.rotation.z = Math.atan2(pb.y - pa.y, pb.x - pa.x) - Math.PI / 2; shell.add(scr);
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, W * 0.8), M.trim); frame.position.copy(pb); shell.add(frame);
      const [c0, c1] = S.cockpit; const topY = interpProfile(S.hull, (c0 + c1) / 2) * H;
      addBox(shell, M.interior, lay.X(c1) - lay.X(c0), 0.03, W * 0.72, (lay.X(c0) + lay.X(c1)) / 2, topY + 0.02, 0);
      for (const sgn of [-1, 1]) {
        const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 8, 16, Math.PI), M.chrome);
        hoop.position.set(lay.X(c0) + 0.12, topY + 0.18, sgn * W * 0.2); hoop.rotation.y = Math.PI / 2; shell.add(hoop);
        addBox(shell, M.interior, 0.12, 0.5, 0.42, lay.X(c0) + 0.3, topY + 0.18, sgn * W * 0.2, [0, 0, 0.18]);
      }
    }
    // pickup bed (tonneau cover) and roof rails
    if (S.bed) {
      const x0 = lay.X(S.bed[0]), x1 = lay.X(S.bed[1]); const y = S.hull[2][1] * H;
      addBox(shell, M.carbon, x1 - x0, 0.03, W * 0.84, (x0 + x1) / 2, y + 0.025, 0);
      addBox(shell, M.trim, 0.06, 0.05, W * 0.9, x1 - 0.02, y + 0.05, 0);
    }
    if (S.rails && S.cabin) {
      const r0 = lay.X(S.cabin[1][0]) + 0.1, r1 = lay.X(S.cabin[S.cabin.length - 2][0]) - 0.1;
      for (const sgn of [-1, 1]) addBox(shell, M.trim, r1 - r0, 0.035, 0.04, (r0 + r1) / 2, H + 0.04, sgn * cabinHalfWidth(lay, H) * 0.8);
    }
  }

  // ---- aero parts
  const r = params.render || {}; const spec = params.spec || {};
  if (r.splitter && r.splitter !== 'none') {
    const big = r.splitter === 'race';
    addBox(shell, ghost ? paint : M.carbon, big ? 0.32 : 0.16, 0.02, W * (big ? 0.98 : 0.86), xn - (big ? 0.06 : 0.1), S.clear - 0.01, 0);
    if (big && !ghost) for (const sgn of [-1, 1]) addBox(shell, M.carbon, 0.22, 0.012, 0.12, xn - 0.18, S.clear + 0.22, sgn * W * 0.47, [0.25, 0, -0.25]);
  }
  if (r.diffuser && r.diffuser !== 'none' && !ghost) {
    const big = r.diffuser === 'race'; const n = big ? 6 : 4;
    for (let i = 0; i < n; i++) {
      const z = (i / (n - 1) - 0.5) * W * 0.7;
      addBox(shell, M.carbon, big ? 0.45 : 0.25, big ? 0.16 : 0.1, 0.012, xt + 0.2, S.clear + 0.05, z, [0, 0, -0.18]);
    }
    addBox(shell, M.carbon, big ? 0.5 : 0.3, 0.015, W * 0.8, xt + 0.25, S.clear + (big ? 0.12 : 0.08), 0, [0, 0, -0.18]);
  }
  if (r.wing && r.wing !== 'none') {
    const deckF = lay.style === 'supercar' ? 0.06 : lay.style === 'hatch' || lay.style === 'suv' || lay.style === 'kei' ? 0.03 : 0.07;
    const deckY = interpProfile(S.hull, deckF) * H; const deckX = lay.X(deckF);
    if (r.wing === 'ducktail') {
      const lip = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, W * 0.86), paint); lip.position.set(lay.X(0.02) + 0.03, interpProfile(S.hull, 0.02) * H + 0.03, 0); lip.rotation.z = -0.35; shell.add(lip);
      if (lay.style === 'hatch' || lay.style === 'suv' || lay.style === 'kei') { lip.position.set(lay.X(S.cabin ? S.cabin[1][0] : 0.05), H - 0.01, 0); lip.rotation.z = -0.1; }
    } else {
      const ta = r.wing === 'timeAttack'; const chord = ta ? 0.36 : 0.28; const span = W * (ta ? 0.98 : 0.86);
      const hgt = (ta ? 0.38 : 0.26) + (lay.style === 'hatch' || lay.style === 'suv' || lay.style === 'kei' ? -0.1 : 0);
      const g = new THREE.ExtrudeGeometry(aerofoil(chord, 0.12, 0.05), { depth: span, bevelEnabled: false, curveSegments: 4 }); g.translate(0, 0, -span / 2);
      const wing = new THREE.Mesh(g, ghost ? paint : M.carbon); const ang = ((spec.aero && spec.aero.wingAngle) ?? 8) * Math.PI / 180;
      const wx = lay.style === 'hatch' || lay.style === 'suv' || lay.style === 'kei' ? lay.X(S.cabin ? S.cabin[1][0] : 0.05) + 0.05 : deckX + 0.05;
      const wy = (lay.style === 'hatch' || lay.style === 'suv' || lay.style === 'kei' ? H : deckY) + hgt;
      wing.position.set(wx, wy, 0); wing.rotation.z = -ang; wing.castShadow = true; shell.add(wing);
      if (!ghost) {
        for (const sgn of [-1, 1]) {
          addBox(shell, M.carbon, chord * 1.4, ta ? 0.26 : 0.16, 0.01, wx - 0.03, wy + 0.02, sgn * span / 2); // endplates
          const st = addBox(shell, M.trim, 0.08, hgt + 0.04, 0.02, wx + 0.02, wy - hgt / 2 - 0.02, sgn * span * 0.3);
          st.rotation.z = 0.12;
        }
      }
    }
  }

  // ---- exhausts
  const layEng = r.engineLayout || 'I4'; const ex = r.exhaust || 'stock';
  const nTips = /V8|V10|V12|F6/.test(layEng) ? 4 : /V6|I6|R3|EV/.test(layEng) ? 2 : ex === 'stock' ? 1 : 2;
  if (layEng !== 'EV' && !ghost) {
    const centre = lay.style === 'supercar' || r.placement === 'mid';
    for (let i = 0; i < nTips; i++) {
      let z;
      if (centre) z = (i - (nTips - 1) / 2) * 0.11;
      else if (nTips >= 4) z = (i < 2 ? -1 : 1) * (W * 0.32) + (i % 2 ? 0.055 : -0.055);
      else if (nTips === 2) z = (i ? 1 : -1) * W * 0.3;
      else z = W * 0.3;
      const tipR = ex === 'straight' ? 0.05 : 0.04;
      const tip = new THREE.Mesh(new THREE.CylinderGeometry(tipR, tipR, 0.18, 14, 1, true), M.chrome);
      tip.rotation.z = Math.PI / 2; const ty = centre ? S.clear + 0.18 : S.clear + 0.06;
      tip.position.set(xt + 0.02, ty, z); shell.add(tip);
      const inner = new THREE.Mesh(new THREE.CircleGeometry(tipR * 0.9, 12), M.grille); inner.rotation.y = -Math.PI / 2; inner.position.set(xt - 0.06, ty, z); shell.add(inner);
      const fl = new THREE.Group(); fl.position.set(xt - 0.07, ty, z);
      const outer = new THREE.Mesh(new THREE.ConeGeometry(tipR * 1.6, 0.55, 10, 1, true), M.flame); outer.rotation.z = Math.PI / 2; outer.position.x = -0.27;
      const core = new THREE.Mesh(new THREE.ConeGeometry(tipR * 0.8, 0.3, 8, 1, true), M.flameCore); core.rotation.z = Math.PI / 2; core.position.x = -0.15;
      fl.add(outer, core); fl.visible = false; shell.add(fl); parts.flames.push(fl);
      parts.exhausts.push(tip);
    }
  }

  // ---- cockpit details: helmet + steering wheel (right-hand drive)
  let steeringWheel = null; let eye = new THREE.Vector3();
  {
    const cab = S.cabin; const belt = cab ? cab[0][1] * H : interpProfile(S.hull, 0.5) * H;
    const fx = cab ? lay.X(lerp(cab[cab.length - 1][0], cab[1][0], 0.45)) : lay.X(S.cockpit ? S.cockpit[0] + 0.08 : 0.4);
    const headY = cab ? Math.min(H - 0.17, belt + 0.38) : belt + 0.42;
    const dz = W * 0.21;
    eye.set(fx + 0.06, headY + 0.02, dz);
    if (!ghost) {
      const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), M.helmet); helmet.position.set(fx, headY, dz); shell.add(helmet);
      const visor = new THREE.Mesh(new THREE.SphereGeometry(0.132, 16, 8, -0.9, 1.8, 1.1, 0.7), M.visor); visor.position.copy(helmet.position); visor.rotation.y = Math.PI / 2; shell.add(visor);
      steeringWheel = new THREE.Group(); steeringWheel.position.set(fx + 0.42, headY - 0.3, dz); steeringWheel.rotation.z = 0.0;
      const rimW = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.018, 8, 28), M.trim); rimW.rotation.y = Math.PI / 2;
      const spk = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.03, 0.32), M.trim);
      const swInner = new THREE.Group(); swInner.add(rimW, spk); swInner.rotation.z = 0.35; steeringWheel.add(swInner);
      steeringWheel.userData.inner = swInner;
      shell.add(steeringWheel);
      // dashboard
      addBox(shell, M.interior, 0.35, 0.14, W * 0.78, fx + 0.62, headY - 0.33, 0);
      const dashGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.07), new THREE.MeshBasicMaterial({ color: 0x3fa9ff }));
      dashGlow.position.set(fx + 0.45, headY - 0.24, dz); dashGlow.rotation.y = -Math.PI / 2; shell.add(dashGlow);
    }
  }

  // ---- wheels
  const wheels = []; const steerGroups = []; const discs = []; const holders = [];
  const geoCache = {};
  for (let i = 0; i < 4; i++) {
    const front = i < 2; const left = i % 2 === 0; const R = front ? lay.rF : lay.rR; const w = front ? lay.twF : lay.twR;
    const key = `${R.toFixed(3)}_${w.toFixed(3)}`;
    const gw = geoCache[key] || (geoCache[key] = buildWheelGeometry(R, w, S.spokes, lod));
    const holder = new THREE.Group(); // positioned at wheel centre with body orientation (world)
    const steerG = new THREE.Group(); holder.add(steerG);
    const spinG = new THREE.Group(); steerG.add(spinG);
    const side = new THREE.Group(); side.scale.z = left ? -1 : 1; spinG.add(side);
    const tyreMesh = new THREE.Mesh(gw.tyre, ghost ? paint : M.tyre); tyreMesh.castShadow = !ghost; side.add(tyreMesh);
    const rimMesh = new THREE.Mesh(gw.rim, ghost ? paint : (lay.style === 'supercar' || lay.style === 'coupe' ? M.rimDark : M.rim)); rimMesh.castShadow = !ghost; side.add(rimMesh);
    if (!ghost) {
      const dm = new THREE.MeshStandardMaterial({ color: 0x777a80, roughness: 0.45, metalness: 0.8, emissive: 0x000000 });
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(gw.rimR * 0.82, gw.rimR * 0.82, 0.028, 24), dm); disc.rotation.x = Math.PI / 2;
      const dside = new THREE.Group(); dside.scale.z = left ? -1 : 1; steerG.add(dside);
      disc.position.z = w * 0.12; dside.add(disc);
      const cal = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.09, 0.07), M.caliper); cal.position.set(-gw.rimR * 0.62, gw.rimR * 0.35, w * 0.16); cal.rotation.z = 0.5; dside.add(cal);
      discs.push(dm);
    } else discs.push(null);
    // widebody arch flares (attached to the body, not the wheel)
    if (lay.wide && !ghost) {
      const fl = new THREE.Mesh(new THREE.TorusGeometry(R + 0.07, 0.055, 8, 20, Math.PI), paint);
      fl.position.set(front ? lay.xF : lay.xR, R, (left ? -1 : 1) * (W / 2 - 0.035)); fl.scale.z = 1.6; fl.castShadow = true;
      shell.add(fl);
    }
    holders.push(holder); steerGroups.push(steerG); wheels.push(spinG);
  }

  root.traverse((o) => { if (o.isMesh && ghost) { o.castShadow = false; o.receiveShadow = false; } });
  return { root, body, shell, wheels, holders, steerGroups, discs, parts, lay, steeringWheel, eye, paint };
}

/** Linear blend between two snapshots of vehicle render state. */
class Snapshot {
  constructor() { this.pos = new THREE.Vector3(); this.quat = new THREE.Quaternion(); this.wpos = [0, 1, 2, 3].map(() => new THREE.Vector3()); this.spin = [0, 0, 0, 0]; this.steer = [0, 0, 0, 0]; }
  copyFromVehicle(v) {
    simToThree(v.pos, this.pos); simQuatToThree(v.quat, this.quat);
    for (let i = 0; i < 4; i++) { const w = v.wheels[i]; simToThree(w.pos, this.wpos[i]); this.spin[i] = w.spin; this.steer[i] = w.steer; }
  }
  copy(s) { this.pos.copy(s.pos); this.quat.copy(s.quat); for (let i = 0; i < 4; i++) { this.wpos[i].copy(s.wpos[i]); this.spin[i] = s.spin[i]; this.steer[i] = s.steer[i]; } }
}

const _q = new THREE.Quaternion(); const _v = new THREE.Vector3(); const _c = new THREE.Color();

function brakeGlow(T, out) {
  // dull red at ~400C to orange/yellow at 900C
  const t = clamp((T - 320) / 600, 0, 1);
  out.setRGB(0.9 * t + 0.1 * t, 0.25 * t * t, 0.02 * t * t * t);
  return t;
}

/** A renderable car bound to a vehicle state. Handles interpolation, wheel spin/steer, brake glow, lights and flames. */
export class CarView {
  constructor(params, opts = {}) {
    this.params = params; this.opts = opts;
    this.model = buildCarModel(params, opts);
    this.group = new THREE.Group(); this.group.add(this.model.root);
    this.wheelGroup = new THREE.Group(); for (const h of this.model.holders) this.wheelGroup.add(h); this.group.add(this.wheelGroup);
    this.prev = new Snapshot(); this.cur = new Snapshot(); this.render = new Snapshot();
    this.hasState = false; this.flameT = 0; this.prevThrottle = 0; this.popTimer = 0;
    this.brake = 0;
  }
  get eye() { return this.model.eye; }
  /** Call right before the last physics substep of a frame (stores the interpolation start). */
  capturePrev(v) { if (!this.hasState) { this.cur.copyFromVehicle(v); this.hasState = true; } this.prev.copyFromVehicle(v); }
  /** Call after stepping; alpha in [0,1] = fraction of DT accumulated beyond the current state. */
  sync(v, alpha = 1) {
    this.cur.copyFromVehicle(v); if (!this.hasState) { this.prev.copy(this.cur); this.hasState = true; }
    const P = this.prev, C = this.cur, R = this.render;
    R.pos.lerpVectors(P.pos, C.pos, alpha); R.quat.slerpQuaternions(P.quat, C.quat, alpha);
    const root = this.model.root; root.position.copy(R.pos); root.quaternion.copy(R.quat);
    for (let i = 0; i < 4; i++) {
      const h = this.model.holders[i]; h.position.lerpVectors(P.wpos[i], C.wpos[i], alpha); h.quaternion.copy(R.quat);
      this.model.steerGroups[i].rotation.y = lerp(P.steer[i], C.steer[i], alpha);
      this.model.wheels[i].rotation.z = -lerp(P.spin[i], C.spin[i], alpha);
    }
  }
  /** Per-frame cosmetic updates (dt = real frame time). */
  update(dt, v) {
    const M = this.model; const es = v.engines && v.engines[0];
    // brake discs glow
    for (let i = 0; i < 4; i++) {
      const dm = M.discs[i]; if (!dm) continue; const t = brakeGlow(v.wheels[i].brakeTempC ?? 20, _c);
      dm.emissive.copy(_c); dm.emissiveIntensity = 1.5 * t;
    }
    // brake lights
    const br = (v.controls && v.controls.brake) || 0; this.brake += (br - this.brake) * Math.min(1, dt * 20);
    if (M.parts.tailMat && M.parts.tailMat.emissiveIntensity != null) M.parts.tailMat.emissiveIntensity = 0.35 + this.brake * 3.5;
    // steering wheel
    if (M.steeringWheel) {
      const lock = this.params.steering?.maxLock || 0.6; const st = (v.wheels[0].steer + v.wheels[1].steer) / 2;
      M.steeringWheel.rotation.x = -st / lock * 2.2;
    }
    // exhaust flames: limiter, anti-lag, or lift-off pops at high rpm
    if (M.parts.flames.length && es && !this.params.powerUnits?.[0]?.engine?.isEV) {
      const thr = (v.controls && v.controls.throttle) || 0; const ep = this.params.powerUnits[0].engine;
      const rpmFrac = es.rpm / (ep.redlineRpm || 7000);
      if (this.prevThrottle > 0.6 && thr < 0.15 && rpmFrac > 0.55) this.popTimer = 0.25 + Math.random() * 0.4;
      this.prevThrottle = thr; this.popTimer -= dt;
      const want = es.limiter || es.antiLagActive || this.popTimer > 0;
      this.flameT = want ? Math.random() : 0;
      for (const f of M.parts.flames) {
        const on = want && Math.random() < (es.limiter ? 0.75 : 0.45);
        f.visible = on; if (on) { const s = 0.6 + Math.random() * 0.8; f.scale.set(s, 0.8 + Math.random() * 0.5, 0.8 + Math.random() * 0.5); }
      }
    }
  }
  setVisible(b) { this.group.visible = b; }
  setOpacity(o) { const p = this.model.paint; p.transparent = o < 1; p.opacity = o; p.depthWrite = o >= 1; }
  dispose() {
    this.group.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
    this.model.paint.dispose();
  }
}

export { STYLES };
