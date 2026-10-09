// Procedural car models built from params.render + params.geometry.
// Model frame: +X forward, +Y up, +Z right (three-ified body frame); origin on the ground below the CG.
//
// Body = smooth loft of cross-section rings along x: each ring has a rounded lower corner, side wall,
// rounded shoulder and crowned top, with wheel wells notched out around the tyres, fender bulges
// over the wheels (supercar "valley" between them), and superellipse rounding of the nose/tail in
// plan and elevation. Glasshouse = a second loft (belt → roof profile, tumblehome) whose faces are
// split into painted pillars/roof and glass by region. Detail is tiered by the quality preset.
// CarView wraps a model and syncs it from the §5 vehicle public state.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { simToThree, simQuatToThree } from './coords.js';
import { tyreTexture } from './textures.js';
import { getQuality } from '../quality.js';

const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
/** Superellipse rounding: 0 at d=0, 1 at d>=L. */
const roundF = (d, L, p) => (d >= L ? 1 : d <= 0 ? 0 : Math.pow(1 - Math.pow(1 - d / L, p), 1 / p));

// Side profiles. x: 0 = tail, 1 = nose (fraction of length). y: fraction of total height.
// hull = top of the lower body (bonnet / deck line) tail -> nose.
// cabin = rear base, roof-rear, roof points..., roof-front, windscreen base (the A/C pillar rake per style).
// plan: nose/tail rounding length (m) and exponent; elev: vertical rounding length at nose/tail.
const STYLES = {
  kei: { fo: 0.55, clear: 0.15, cabinW: 0.92, tumble: 0.07, bPillar: 0.44, spokes: 6, crown: 0.02, plan: [0.32, 0.22, 3.2], elev: [0.16, 0.1], shoulder: 0.07,
    hull: [[0, 0.30], [0.012, 0.52], [0.03, 0.56], [0.78, 0.56], [0.90, 0.52], [0.975, 0.45], [1, 0.32]],
    cabin: [[0.012, 0.56], [0.03, 0.96], [0.08, 1.0], [0.62, 0.99], [0.83, 0.56]] },
  hatch: { fo: 0.62, clear: 0.13, cabinW: 0.86, tumble: 0.16, bPillar: 0.43, spokes: 10, crown: 0.025, plan: [0.42, 0.26, 2.8], elev: [0.18, 0.12], shoulder: 0.09,
    hull: [[0, 0.36], [0.012, 0.58], [0.035, 0.665], [0.66, 0.655], [0.82, 0.60], [0.95, 0.52], [1, 0.36]],
    cabin: [[0.025, 0.665], [0.075, 0.95], [0.15, 1.0], [0.50, 0.99], [0.665, 0.655]] },
  sedan: { fo: 0.52, clear: 0.13, cabinW: 0.86, tumble: 0.17, bPillar: 0.465, spokes: 10, crown: 0.025, plan: [0.46, 0.34, 2.6], elev: [0.2, 0.14], shoulder: 0.1,
    hull: [[0, 0.40], [0.015, 0.59], [0.05, 0.675], [0.17, 0.69], [0.25, 0.69], [0.69, 0.655], [0.84, 0.615], [0.95, 0.54], [1, 0.38]],
    cabin: [[0.235, 0.69], [0.32, 0.955], [0.40, 1.0], [0.56, 0.99], [0.695, 0.66]] },
  coupe: { fo: 0.55, clear: 0.12, cabinW: 0.82, tumble: 0.22, bPillar: null, spokes: 5, crown: 0.03, plan: [0.5, 0.36, 2.4], elev: [0.2, 0.15], shoulder: 0.11,
    hull: [[0, 0.40], [0.015, 0.58], [0.06, 0.66], [0.20, 0.675], [0.30, 0.67], [0.62, 0.635], [0.80, 0.575], [0.93, 0.495], [0.99, 0.41], [1, 0.34]],
    cabin: [[0.17, 0.675], [0.40, 0.985], [0.47, 1.0], [0.55, 0.98], [0.655, 0.64]] },
  roadster: { fo: 0.55, clear: 0.12, cabinW: 0.86, tumble: 0.15, bPillar: null, spokes: 6, crown: 0.03, open: true, plan: [0.5, 0.36, 2.4], elev: [0.2, 0.15], shoulder: 0.12,
    hull: [[0, 0.42], [0.02, 0.62], [0.07, 0.69], [0.32, 0.71], [0.60, 0.68], [0.80, 0.62], [0.94, 0.53], [1, 0.40]],
    cabin: null, screen: [[0.60, 0.68], [0.535, 0.95]], cockpit: [0.33, 0.585] },
  suv: { fo: 0.55, clear: 0.21, cabinW: 0.9, tumble: 0.11, bPillar: 0.42, spokes: 6, crown: 0.02, rails: true, plan: [0.4, 0.28, 3.0], elev: [0.2, 0.14], shoulder: 0.09,
    hull: [[0, 0.38], [0.012, 0.58], [0.03, 0.625], [0.70, 0.625], [0.86, 0.59], [0.97, 0.52], [1, 0.36]],
    cabin: [[0.025, 0.625], [0.065, 0.96], [0.13, 1.0], [0.57, 0.99], [0.715, 0.625]] },
  pickup: { fo: 0.6, clear: 0.25, cabinW: 0.9, tumble: 0.09, bPillar: 0.53, spokes: 6, crown: 0.015, bed: [0.012, 0.36], plan: [0.36, 0.2, 3.4], elev: [0.18, 0.08], shoulder: 0.07,
    hull: [[0, 0.32], [0.006, 0.56], [0.014, 0.59], [0.78, 0.59], [0.90, 0.56], [0.98, 0.50], [1, 0.34]],
    cabin: [[0.37, 0.59], [0.382, 0.97], [0.42, 1.0], [0.615, 0.99], [0.765, 0.59]] },
  supercar: { fo: 0.5, clear: 0.10, cabinW: 0.72, tumble: 0.26, bPillar: null, spokes: 5, crown: 0.0, valley: true, intakes: true, plan: [0.62, 0.4, 2.1], elev: [0.16, 0.2], shoulder: 0.1,
    hull: [[0, 0.44], [0.012, 0.64], [0.05, 0.71], [0.18, 0.73], [0.33, 0.715], [0.62, 0.53], [0.82, 0.42], [0.95, 0.33], [1, 0.24]],
    cabin: [[0.26, 0.715], [0.42, 0.985], [0.48, 1.0], [0.555, 0.955], [0.70, 0.50]] },
};

/** Geometry detail tier from the quality preset. */
function detailTier() {
  const q = getQuality().name;
  return q === 'potato' ? 0 : q === 'low' ? 1 : q === 'medium' ? 2 : 3;
}
const DETAIL = [
  { st: 22, arc: 2, cab: 14, cabArc: 2, wheelSeg: 16, spokes: false, lights: false },
  { st: 34, arc: 3, cab: 22, cabArc: 3, wheelSeg: 24, spokes: true, lights: true },
  { st: 48, arc: 4, cab: 30, cabArc: 4, wheelSeg: 32, spokes: true, lights: true },
  { st: 70, arc: 6, cab: 42, cabArc: 5, wheelSeg: 48, spokes: true, lights: true },
];

const MAT = {};
function mats() {
  if (MAT.trim) return MAT;
  MAT.trim = new THREE.MeshStandardMaterial({ color: 0x111214, roughness: 0.55, metalness: 0.1 });
  MAT.carbon = new THREE.MeshStandardMaterial({ color: 0x1a1c20, roughness: 0.3, metalness: 0.35 });
  MAT.grille = new THREE.MeshStandardMaterial({ color: 0x050506, roughness: 0.75, metalness: 0.2, side: THREE.DoubleSide });
  MAT.glass = new THREE.MeshPhysicalMaterial({ color: 0x0b1118, roughness: 0.03, metalness: 0.25, transparent: true, opacity: 0.74, clearcoat: 1, depthWrite: false, side: THREE.DoubleSide });
  MAT.interior = new THREE.MeshStandardMaterial({ color: 0x0c0c0e, roughness: 0.92, side: THREE.BackSide });
  MAT.interiorF = new THREE.MeshStandardMaterial({ color: 0x0c0c0e, roughness: 0.92 });
  MAT.housing = new THREE.MeshStandardMaterial({ color: 0x1b1e23, roughness: 0.18, metalness: 0.9 });
  MAT.headlight = new THREE.MeshStandardMaterial({ color: 0xdfe8f2, emissive: 0xeaf2ff, emissiveIntensity: 1.4, roughness: 0.08, metalness: 0.3 });
  MAT.drl = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xdff0ff, emissiveIntensity: 2.6, roughness: 0.2 });
  MAT.indicator = new THREE.MeshStandardMaterial({ color: 0xff9a1f, emissive: 0xff8a10, emissiveIntensity: 0.3, roughness: 0.2 });
  MAT.rim = new THREE.MeshStandardMaterial({ color: 0xc4c9d0, roughness: 0.22, metalness: 0.95 });
  MAT.rimDark = new THREE.MeshStandardMaterial({ color: 0x2a2d33, roughness: 0.3, metalness: 0.85 });
  MAT.tyre = new THREE.MeshStandardMaterial({ color: 0xffffff, map: tyreTexture(), roughness: 0.9, metalness: 0 });
  MAT.caliper = new THREE.MeshStandardMaterial({ color: 0xc81e1e, roughness: 0.4, metalness: 0.2 });
  MAT.chrome = new THREE.MeshStandardMaterial({ color: 0xe6e6e6, roughness: 0.12, metalness: 1 });
  MAT.helmet = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.3, metalness: 0.1 });
  MAT.visor = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.05, metalness: 0.8 });
  MAT.flame = new THREE.MeshBasicMaterial({ color: 0xffa040, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
  MAT.flameCore = new THREE.MeshBasicMaterial({ color: 0x9fd0ff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
  return MAT;
}

function paintMaterial(color, ghost, opacity) {
  if (ghost) return new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.2, transparent: true, opacity, depthWrite: false });
  return new THREE.MeshPhysicalMaterial({ color, roughness: 0.3, metalness: 0.5, clearcoat: 1, clearcoatRoughness: 0.05 });
}

function interpProfile(pts, f) {
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    if (f >= a[0] && f <= b[0]) { const t = (f - a[0]) / (b[0] - a[0] || 1); return lerp(a[1], b[1], t * t * (3 - 2 * t) * 0.35 + t * 0.65); }
  }
  return f < pts[0][0] ? pts[0][1] : pts[pts.length - 1][1];
}

/** Dimensions/derived layout for a car from params. */
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
  const wide = /wide/i.test(r.bodyKit || '');
  const cgH = geo.cgHeight || 0.45;
  return { style, S, L, W, H, wb, a, b, xF, xR, xNose, xTail, rF, rR, twF, twR, trackF, trackR, wide, cgH,
    X: (f) => xTail + f * (xNose - xTail), F: (x) => (x - xTail) / (xNose - xTail), color: r.color || params.spec?.color || '#c0392b' };
}

// ------------------------------------------------------------------ body loft
function bodyFns(lay) {
  const { S, H, W, xF, xR, rF, rR, xNose, xTail } = lay;
  const RaF = rF + 0.045 + (lay.wide ? 0.02 : 0), RaR = rR + 0.05 + (lay.wide ? 0.02 : 0);
  const archTopF = rF + RaF + 0.05, archTopR = rR + RaR + 0.05;
  const topC = (x) => interpProfile(S.hull, lay.F(x)) * H;
  const fender = (x) => {
    const bump = (cx, top, R) => { const d = Math.abs(x - cx) / (R + 0.4); return d < 1 ? top * (1 - Math.pow(d, 3)) + topC(x) * Math.pow(d, 3) : 0; };
    return Math.max(topC(x), bump(xF, archTopF, RaF), bump(xR, archTopR, RaR));
  };
  const flareAmt = lay.wide ? 0.07 : 0.018;
  const flare = (x) => { const f = (cx, R) => { const d = Math.abs(x - cx) / (R + 0.25); return d < 1 ? 0.5 + 0.5 * Math.cos(Math.PI * d) : 0; }; return flareAmt * Math.max(f(xF, RaF), f(xR, RaR)); };
  const [Lpn, Lpt, pp] = S.plan; const [Lvn, Lvt] = S.elev;
  const planK = (x) => Math.min(roundF(xNose - x, Lpn, pp), roundF(x - xTail, Lpt, pp));
  const elevK = (x) => Math.min(roundF(xNose - x, Lvn, 2.2), roundF(x - xTail, Lvt, 2.2));
  const bottom = (x) => S.clear + 0.1 * smooth(xF + RaF + 0.1, xNose, x) * 0.8 + 0.12 * smooth(xR - RaR - 0.1, xTail, x) * 0.8;
  const arch = (x) => {
    for (const [cx, R, r] of [[xF, RaF, rF], [xR, RaR, rR]]) { const dx = x - cx; if (Math.abs(dx) <= R) return r + Math.sqrt(Math.max(0, R * R - dx * dx)); }
    return 0;
  };
  return { RaF, RaR, topC, fender, flare, planK, elevK, bottom, arch, halfW: (x) => (W / 2) * planK(x) + flare(x) };
}

/** Half ring (z >= 0) from bottom centre to top centre for the hull at station x. */
function hullHalfRing(lay, fn, x, archOn, D) {
  const S = lay.S; const hw = Math.max(fn.halfW(x), 0.0005);
  let yb = fn.bottom(x); let ytf = fn.fender(x); let ytc = fn.topC(x);
  const ek = fn.elevK(x); const mid = lerp(yb, ytc, 0.45);
  yb = lerp(mid, yb, ek); ytf = lerp(mid, ytf, ek); ytc = lerp(mid, ytc, ek);
  const h = ytf - yb;
  const rl = Math.min(0.07, h * 0.2, hw * 0.3); const rc = Math.min(S.shoulder, h * 0.35, hw * 0.4);
  let notchH = 0; const notchW = Math.min(hw * 0.45, (x > 0 ? lay.twF : lay.twR) + 0.1);
  if (archOn) notchH = Math.max(0, Math.min(fn.arch(x) - yb, ytf - rc - rl - yb - 0.03));
  const pts = [];
  pts.push([0, yb], [hw * 0.55, yb], [hw - notchW, yb], [hw - notchW, yb + notchH], [hw - rl - 0.001, yb + notchH]);
  const A = D.arc;
  for (let i = 1; i <= A; i++) { const t = -Math.PI / 2 + (i / A) * (Math.PI / 2); pts.push([hw - rl + Math.cos(t) * rl, yb + notchH + rl + Math.sin(t) * rl]); }
  const s0 = yb + notchH + rl, s1 = ytf - rc; const tumble = 0.03 * hw;
  for (let i = 1; i <= 3; i++) { const t = i / 4; const y = lerp(s0, s1, t); pts.push([hw + Math.sin(Math.PI * t) * 0.008 - tumble * t * t, y]); }
  const hs = hw - tumble;
  for (let i = 0; i <= A + 1; i++) { const t = (i / (A + 1)) * (Math.PI / 2); pts.push([hs - rc + Math.cos(t) * rc, s1 + Math.sin(t) * rc]); }
  const T = 5;
  for (let i = 1; i <= T; i++) {
    const z = (hs - rc) * (1 - i / T); const zr = z / hw;
    const ytop = S.valley ? lerp(ytc, ytf, smooth(0.3, 0.72, zr)) : lerp(ytc, ytf, smooth(0.55, 0.95, zr));
    pts.push([z, ytop + (S.crown || 0) * (1 - zr * zr) * ek]);
  }
  return pts;
}

/** Closed tube through half-ring cross-sections (mirrored about z = 0). */
function loft(stations, ringFn) {
  const half0 = ringFn(stations[0], 0); const M = half0.length; const R = 2 * (M - 1);
  const pos = new Float32Array(stations.length * R * 3); let o = 0;
  stations.forEach((x, si) => {
    const h = si === 0 ? half0 : ringFn(x, si);
    for (let j = 0; j < M; j++) { pos[o++] = x; pos[o++] = h[j][1]; pos[o++] = h[j][0]; }
    for (let j = M - 2; j >= 1; j--) { pos[o++] = x; pos[o++] = h[j][1]; pos[o++] = -h[j][0]; }
  });
  const idx = [];
  for (let s = 0; s < stations.length - 1; s++) for (let j = 0; j < R; j++) {
    const a = s * R + j, b = s * R + ((j + 1) % R), c = (s + 1) * R + j, d = (s + 1) * R + ((j + 1) % R);
    idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(idx);
  return { g, M, R };
}

function hullStations(lay, fn, D) {
  const xs = new Set(); const { xNose, xTail, xF, xR } = lay; const n = D.st;
  for (let i = 0; i <= n; i++) { const t = i / n; const u = 0.5 - 0.5 * Math.cos(Math.PI * t); xs.add(+(xTail + (xNose - xTail) * u).toFixed(4)); }
  const list = [...xs].filter((x) => !(Math.abs(x - xF) <= fn.RaF + 0.004 || Math.abs(x - xR) <= fn.RaR + 0.004));
  const out = list.map((x) => ({ x, arch: false }));
  const A = Math.max(6, D.arc * 3);
  for (const [cx, R] of [[xF, fn.RaF], [xR, fn.RaR]]) {
    out.push({ x: cx - R - 0.002, arch: false }, { x: cx + R + 0.002, arch: false });
    for (let i = 0; i <= A; i++) { const t = Math.PI - (i / A) * Math.PI; out.push({ x: cx + Math.cos(t) * R, arch: true }); }
  }
  out.sort((p, q) => p.x - q.x);
  return out;
}

function buildHull(lay, D) {
  const fn = bodyFns(lay); const st = hullStations(lay, fn, D);
  const { g } = loft(st.map((s) => s.x), (x, i) => hullHalfRing(lay, fn, x, st[i].arch, D));
  g.computeVertexNormals();
  return { geo: g, fn };
}

// ------------------------------------------------------------------ glasshouse loft
function cabinFns(lay, fn) {
  const { S, H, W } = lay; const c = S.cabin; const X = lay.X;
  const x0 = X(c[0][0]), x1 = X(c[c.length - 1][0]);
  const xRoofR = X(c[1][0]), xRoofF = X(c[c.length - 2][0]);
  const top = (x) => interpProfile(c, lay.F(x)) * H;
  const belt = (x) => fn.topC(x);
  const half = (x, y) => {
    const b = belt(x); const t = clamp((y - b) / Math.max(H - b, 0.05), 0, 1);
    const base = (W * S.cabinW) / 2 * Math.min(roundF(x1 - x, 0.22, 2.4), roundF(x - x0, 0.2, 2.4));
    return base * (1 - S.tumble * t);
  };
  return { x0, x1, xRoofR, xRoofF, top, belt, half };
}

function cabinHalfRing(lay, cf, x, D) {
  const yb = cf.belt(x) - 0.06; const yt = Math.max(cf.top(x), yb + 0.065); const h = yt - yb;
  const hwb = Math.max(cf.half(x, yb + 0.06), 0.001), hwt = Math.max(cf.half(x, yt), 0.001);
  const rc = Math.min(0.11, h * 0.4, hwt * 0.5);
  const pts = [[0, yb], [hwb * 0.6, yb], [hwb, yb]];
  for (let i = 1; i <= 3; i++) { const t = i / 4; pts.push([lerp(hwb, hwt, t) + Math.sin(Math.PI * t) * 0.006, lerp(yb, yt - rc, t)]); }
  const A = D.cabArc + 1;
  for (let i = 0; i <= A; i++) { const t = (i / A) * (Math.PI / 2); pts.push([hwt - rc + Math.cos(t) * rc, yt - rc + Math.sin(t) * rc]); }
  for (let i = 1; i <= 4; i++) { const z = (hwt - rc) * (1 - i / 4); pts.push([z, yt + 0.018 * (1 - (z / hwt) ** 2)]); }
  return pts;
}

function buildCabin(lay, fn, D) {
  const cf = cabinFns(lay, fn); const n = D.cab; const xs = [];
  for (let i = 0; i <= n; i++) { const t = i / n; xs.push(lerp(cf.x0, cf.x1, 0.5 - 0.5 * Math.cos(Math.PI * t))); }
  const { g, M, R } = loft(xs, (x) => cabinHalfRing(lay, cf, x, D));
  g.computeVertexNormals();
  // classify faces: glass vs paint (pillars and roof stay painted)
  const pos = g.attributes.position; const idx = g.index.array; const paintI = [], glassI = [];
  const S = lay.S; const v = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]; const e1 = new THREE.Vector3(), e2 = new THREE.Vector3(), nrm = new THREE.Vector3();
  const sideEnd = 6;
  const xB = S.bPillar != null ? lay.X(S.bPillar) : null;
  const aRun = cf.x1 - cf.xRoofF, cRun = cf.xRoofR - cf.x0;
  for (let k = 0; k < idx.length; k += 3) {
    for (let q = 0; q < 3; q++) v[q].fromBufferAttribute(pos, idx[k + q]);
    const cx = (v[0].x + v[1].x + v[2].x) / 3, cy = (v[0].y + v[1].y + v[2].y) / 3, cz = (v[0].z + v[1].z + v[2].z) / 3;
    e1.subVectors(v[1], v[0]); e2.subVectors(v[2], v[0]); nrm.crossVectors(e1, e2).normalize();
    const j = idx[k] % R; const jh = j < M ? j : R - j;
    const belt = cf.belt(cx); const top = cf.top(cx); const hw = cf.half(cx, cy);
    let glass = false;
    if (jh >= 2 && jh <= sideEnd + 1 && Math.abs(nrm.z) > 0.55) {
      const xa = cf.x1 - aRun * 0.55, xc = cf.x0 + cRun * (lay.style === 'coupe' || lay.style === 'supercar' ? 0.35 : 0.55);
      glass = cy > belt + 0.045 && cy < top - 0.05 && cx < xa && cx > xc && (xB == null || Math.abs(cx - xB) > 0.05);
    } else if (jh > sideEnd) {
      const inner = Math.abs(cz) < hw * 0.86 - 0.04;
      if (cx > cf.xRoofF - 0.02 && nrm.x > 0.3 && inner && cy > belt + 0.03) glass = true;
      else if (cx < cf.xRoofR + 0.02 && nrm.x < -0.2 && inner && cy > belt + 0.05) glass = true;
    }
    (glass ? glassI : paintI).push(idx[k], idx[k + 1], idx[k + 2]);
  }
  const paint = new THREE.BufferGeometry(); paint.setAttribute('position', pos); paint.setAttribute('normal', g.attributes.normal); paint.setIndex(paintI);
  const glass = new THREE.BufferGeometry(); glass.setAttribute('position', pos); glass.setAttribute('normal', g.attributes.normal); glass.setIndex(glassI);
  return { paint, glass, shell: g, cf };
}

// ------------------------------------------------------------------ wheels
function buildWheelGeometry(R, w, spokes, D, lod) {
  const rimR = R * 0.69; const pts = [];
  const sh = Math.min(0.04, w * 0.2); const bulge = 0.012;
  pts.push(new THREE.Vector2(rimR - 0.004, -w / 2 + 0.012));
  for (let i = 1; i <= 4; i++) { const t = i / 5; pts.push(new THREE.Vector2(lerp(rimR, R - sh, t), -w / 2 - Math.sin(Math.PI * t) * bulge)); }
  for (let i = 0; i <= 4; i++) { const a = -Math.PI / 2 + (i / 4) * (Math.PI / 2); pts.push(new THREE.Vector2(R - sh + Math.cos(a) * sh, -w / 2 + sh + Math.sin(a) * sh)); }
  for (let i = 0; i <= 4; i++) { const a = (i / 4) * (Math.PI / 2); pts.push(new THREE.Vector2(R - sh + Math.cos(a) * sh, w / 2 - sh + Math.sin(a) * sh)); }
  for (let i = 4; i >= 1; i--) { const t = i / 5; pts.push(new THREE.Vector2(lerp(rimR, R - sh, t), w / 2 + Math.sin(Math.PI * t) * bulge)); }
  pts.push(new THREE.Vector2(rimR - 0.004, w / 2 - 0.012));
  const tyre = new THREE.LatheGeometry(pts, D.wheelSeg); tyre.rotateX(Math.PI / 2);
  const parts = []; const seg = D.wheelSeg;
  const barrel = new THREE.CylinderGeometry(rimR - 0.01, rimR - 0.01, w * 0.92, seg, 1, true); barrel.rotateX(Math.PI / 2); parts.push(barrel);
  if (lod !== 'low' && D.spokes) {
    const lip = new THREE.TorusGeometry(rimR - 0.006, 0.012, 6, seg); lip.translate(0, 0, w * 0.44); parts.push(lip);
    const lipFace = new THREE.RingGeometry(rimR - 0.035, rimR - 0.004, seg, 1); lipFace.translate(0, 0, w * 0.43); parts.push(lipFace);
    const hub = new THREE.CylinderGeometry(R * 0.13, R * 0.17, 0.05, 16); hub.rotateX(Math.PI / 2); hub.translate(0, 0, w * 0.3); parts.push(hub);
    const n = spokes || 5; const pair = n === 5; const count = pair ? 10 : n;
    const r0 = R * 0.15, r1 = rimR - 0.02; const wIn = n >= 10 ? 0.022 : 0.03, wOut = n >= 10 ? 0.03 : 0.05;
    for (let i = 0; i < count; i++) {
      const sp = new THREE.Shape(); sp.moveTo(-wIn / 2, r0); sp.lineTo(wIn / 2, r0); sp.lineTo(wOut / 2, r1); sp.lineTo(-wOut / 2, r1); sp.closePath();
      const eg = new THREE.ExtrudeGeometry(sp, { depth: 0.026, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.005, bevelSegments: 1 });
      const p = eg.attributes.position;
      for (let k = 0; k < p.count; k++) { const rr = p.getY(k); p.setZ(k, p.getZ(k) + w * 0.28 + ((rr - r0) / (r1 - r0)) * w * 0.12); }
      const base = pair ? Math.floor(i / 2) * ((Math.PI * 2) / 5) + (i % 2 ? 0.17 : -0.17) : (i / count) * Math.PI * 2;
      eg.rotateZ(base); eg.computeVertexNormals(); parts.push(eg);
    }
    for (let i = 0; i < 5; i++) { const nut = new THREE.CylinderGeometry(0.011, 0.011, 0.02, 6); nut.rotateX(Math.PI / 2); const a = (i / 5) * Math.PI * 2; nut.translate(Math.cos(a) * R * 0.09, Math.sin(a) * R * 0.09, w * 0.34); parts.push(nut); }
  } else {
    const face = new THREE.CircleGeometry(rimR, 12); face.translate(0, 0, w * 0.35); parts.push(face);
  }
  const rim = mergeGeometries(parts.map((p) => { const q = p.index ? p.toNonIndexed() : p; for (const k of Object.keys(q.attributes)) if (k !== 'position' && k !== 'normal') q.deleteAttribute(k); return q; }), false);
  rim.computeVertexNormals();
  return { tyre, rim, rimR };
}

function addBox(group, mat, sx, sy, sz, x, y, z, rot) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat); m.position.set(x, y, z);
  if (rot) m.rotation.set(rot[0] || 0, rot[1] || 0, rot[2] || 0);
  m.castShadow = true; group.add(m); return m;
}
/** Bevelled extrusion of a rounded rectangle (w x h, depth d) centred on the origin, extruded along +z. */
function roundedSlab(w, h, d, r, bevel = 0.006) {
  const s = new THREE.Shape(); const x = -w / 2, y = -h / 2; r = Math.max(0.0005, Math.min(r, w / 2 - 0.001, h / 2 - 0.001));
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 6 });
  g.translate(0, 0, -d / 2); return g;
}

function aerofoil(chord, thick, camber) {
  const s = new THREE.Shape(); const N = 18; const up = [], lo = [];
  for (let i = 0; i <= N; i++) {
    const x = 1 - Math.cos((i / N) * Math.PI / 2); const t = 5 * thick * (0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x * x + 0.2843 * x ** 3 - 0.1015 * x ** 4);
    const c = -camber * 4 * x * (1 - x); up.push([x, c + t]); lo.push([x, c - t]);
  }
  s.moveTo(chord * 0.5 - up[0][0] * chord, up[0][1] * chord);
  for (const p of up) s.lineTo(chord * 0.5 - p[0] * chord, p[1] * chord);
  for (let i = lo.length - 1; i >= 0; i--) s.lineTo(chord * 0.5 - lo[i][0] * chord, lo[i][1] * chord);
  return s;
}

function hitMesh(mesh, origin, dir) { const rc = new THREE.Raycaster(origin, dir, 0, 30); return rc.intersectObject(mesh, false)[0] || null; }
function carbonKit(params) { const k = params.render?.bodyKit || ''; return /carbon/i.test(k) || params.render?.splitter === 'race'; }

/**
 * Build a car model group. Returns { root, body, shell, wheels[4] (spin groups), holders, steerGroups, discs, parts, lay, steeringWheel, eye, paint }.
 * parts.bodyMeshes = painted body meshes, parts.glass = glass mesh, parts.headlights/brakeLights = light meshes (for fx).
 * @param {object} params build(spec) output
 * @param {{ghost?:boolean, opacity?:number, lod?:'high'|'low', color?:string, detail?:number}} opts
 */
export function buildCarModel(params, opts = {}) {
  const M = mats(); const lay = carLayout(params); const { S, W, H } = lay;
  const ghost = !!opts.ghost; const lod = opts.lod || (ghost ? 'low' : 'high');
  const D = DETAIL[opts.detail ?? (lod === 'low' ? 0 : detailTier())];
  const paint = paintMaterial(new THREE.Color(opts.color || lay.color), ghost, opts.opacity ?? 0.35);
  const root = new THREE.Group(); root.name = 'car';
  const body = new THREE.Group(); root.add(body);
  const shell = new THREE.Group(); shell.position.y = -lay.cgH; body.add(shell);
  const parts = { headlights: [], brakeLights: [], flames: [], exhausts: [], glass: null, bodyMeshes: [] };

  const { geo: hullGeo, fn } = buildHull(lay, D);
  const hull = new THREE.Mesh(hullGeo, paint); hull.castShadow = !ghost; hull.receiveShadow = !ghost; hull.name = 'body'; shell.add(hull); parts.bodyMeshes.push(hull);
  hull.updateMatrixWorld(true);
  let cab = null;
  if (S.cabin) {
    cab = buildCabin(lay, fn, D);
    const cp = new THREE.Mesh(cab.paint, paint); cp.castShadow = !ghost; cp.name = 'cabin'; shell.add(cp); parts.bodyMeshes.push(cp);
    if (!ghost) {
      const gl = new THREE.Mesh(cab.glass, M.glass); gl.renderOrder = 2; gl.name = 'glass'; shell.add(gl); parts.glass = gl;
      const inner = new THREE.Mesh(cab.shell, M.interior); inner.scale.set(0.985, 0.985, 0.97); inner.position.y = 0.01; shell.add(inner);
    } else shell.add(new THREE.Mesh(cab.glass, paint));
  }
  const xn = lay.xNose, xt = lay.xTail;
  const tailMat = ghost ? paint : new THREE.MeshStandardMaterial({ color: 0x4a0606, emissive: 0xff1a10, emissiveIntensity: 0.4, roughness: 0.15, metalness: 0.2 });
  parts.tailMat = tailMat;

  if (!ghost) {
    // ---- light clusters / grille via raycasts against the hull
    const place = (y, z, fromFront, geom, mat, out = 0.002) => {
      const o = new THREE.Vector3(fromFront ? xn + 1 : xt - 1, y, z); const d = new THREE.Vector3(fromFront ? -1 : 1, 0, 0);
      const hit = hitMesh(hull, o, d); if (!hit) return null;
      const n = hit.face.normal.clone(); if (fromFront ? n.x < 0.15 : n.x > -0.15) n.set(fromFront ? 1 : -1, n.y * 0.5, n.z * 0.5).normalize();
      const m = new THREE.Mesh(geom, mat); m.position.copy(hit.point).addScaledVector(n, out);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n); shell.add(m); return m;
    };
    const noseTop = fn.topC(xn - 0.25), tailTop = fn.topC(xt + 0.2);
    const hlY = lerp(fn.bottom(xn - 0.2), noseTop, lay.style === 'supercar' ? 0.72 : 0.68);
    const tlY = lerp(fn.bottom(xt + 0.2), tailTop, 0.74);
    const hlW = W * (lay.style === 'supercar' ? 0.2 : lay.style === 'kei' ? 0.15 : 0.18), hlH = lay.style === 'supercar' ? 0.06 : lay.style === 'suv' || lay.style === 'pickup' ? 0.12 : 0.085;
    for (const sgn of [-1, 1]) {
      const housing = place(hlY, sgn * W * 0.31, true, roundedSlab(hlW, hlH, 0.03, 0.025), M.housing, -0.006);
      if (housing) {
        parts.headlights.push(housing);
        if (D.lights) {
          for (let k = 0; k < 2; k++) { const pr = new THREE.Mesh(new THREE.CylinderGeometry(hlH * 0.3, hlH * 0.3, 0.02, 16), M.headlight); pr.rotation.x = Math.PI / 2; pr.position.set((k - 0.5) * hlW * 0.42, -hlH * 0.05, 0.02); housing.add(pr); }
          const drl = new THREE.Mesh(roundedSlab(hlW * 0.9, 0.012, 0.01, 0.005, 0), M.drl); drl.position.set(0, hlH * 0.36, 0.02); housing.add(drl);
        } else { const lens = new THREE.Mesh(roundedSlab(hlW * 0.85, hlH * 0.6, 0.01, 0.01, 0), M.headlight); lens.position.z = 0.02; housing.add(lens); }
      }
      place(hlY - hlH * 1.1, sgn * W * 0.41, true, roundedSlab(0.07, 0.025, 0.01, 0.008, 0.003), M.indicator);
      const th = place(tlY, sgn * W * 0.33, false, roundedSlab(W * 0.22, 0.075, 0.03, 0.02), M.housing, -0.006);
      if (th) { const lens = new THREE.Mesh(roundedSlab(W * 0.2, 0.05, 0.012, 0.014, 0.003), tailMat); lens.position.z = 0.022; th.add(lens); parts.brakeLights.push(lens); }
    }
    if (lay.style === 'supercar' || lay.style === 'coupe') { const bar = place(tlY + 0.01, 0, false, roundedSlab(W * 0.42, 0.018, 0.012, 0.008, 0.002), tailMat); if (bar) parts.brakeLights.push(bar); }
    const big = lay.style === 'suv' || lay.style === 'pickup';
    const gy = lerp(fn.bottom(xn - 0.2), noseTop, lay.style === 'supercar' ? 0.32 : big ? 0.5 : 0.36);
    const gr = place(gy, 0, true, roundedSlab(W * (big ? 0.5 : 0.46), big ? 0.24 : 0.13, 0.02, 0.04), M.grille, -0.004);
    if (gr && D.lights) for (let k = -3; k <= 3; k++) { const bar = new THREE.Mesh(new THREE.BoxGeometry(W * (big ? 0.48 : 0.44), 0.006, 0.012), M.housing); bar.position.set(0, k * (big ? 0.03 : 0.016), 0.012); gr.add(bar); }
    if (lay.style === 'supercar' || lay.style === 'coupe') for (const sgn of [-1, 1]) place(gy, sgn * W * 0.36, true, roundedSlab(W * 0.14, 0.09, 0.02, 0.03), M.grille, -0.004);
    // side skirts between the arches
    const skirtX0 = lay.xR + fn.RaR + 0.02, skirtX1 = lay.xF - fn.RaF - 0.02;
    if (skirtX1 > skirtX0) for (const sgn of [-1, 1]) {
      const sk = new THREE.Mesh(roundedSlab(skirtX1 - skirtX0, 0.07, 0.05, 0.03, 0.01), carbonKit(params) ? M.carbon : paint);
      const hx = (skirtX0 + skirtX1) / 2; sk.position.set(hx, fn.bottom(hx) + 0.035, sgn * (fn.halfW(hx) - 0.012)); sk.castShadow = true; shell.add(sk);
    }
    // mirrors
    if (cab) {
      const cx = cab.cf.x1 - 0.2; const cy = cab.cf.belt(cx) + 0.07;
      for (const sgn of [-1, 1]) {
        const hz = fn.halfW(cx) - 0.02; const mir = new THREE.Mesh(roundedSlab(0.1, 0.075, 0.13, 0.03, 0.01), paint); mir.rotation.y = Math.PI / 2; mir.position.set(cx, cy + 0.04, sgn * (hz + 0.1)); mir.castShadow = true; shell.add(mir);
        const glassM = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.06), M.chrome); glassM.rotation.y = -Math.PI / 2; glassM.position.set(cx - 0.051, cy + 0.04, sgn * (hz + 0.1)); shell.add(glassM);
        addBox(shell, M.trim, 0.04, 0.02, 0.1, cx + 0.01, cy + 0.02, sgn * (hz + 0.04));
      }
    }
    if (S.intakes) for (const sgn of [-1, 1]) {
      const x = lay.xR + fn.RaR + 0.42; const hit = hitMesh(hull, new THREE.Vector3(x, H * 0.4, sgn * W), new THREE.Vector3(0, 0, -sgn));
      if (hit) { const m = new THREE.Mesh(roundedSlab(0.5, 0.18, 0.04, 0.06), M.grille); m.position.copy(hit.point); m.position.z -= sgn * 0.012; m.rotation.set(0, sgn > 0 ? 0 : Math.PI, -0.22); shell.add(m); }
    }
    if (S.open) {
      const [a, b] = S.screen; const pa = new THREE.Vector3(lay.X(a[0]), a[1] * H, 0), pb = new THREE.Vector3(lay.X(b[0]), b[1] * H, 0);
      const len = pa.distanceTo(pb);
      const scr = new THREE.Mesh(roundedSlab(W * 0.8, len, 0.01, 0.06, 0.004), M.glass); scr.rotation.set(0, Math.PI / 2, 0); scr.rotateX(-(Math.PI / 2 - Math.atan2(pb.y - pa.y, pa.x - pb.x)));
      scr.position.copy(pa).lerp(pb, 0.5); shell.add(scr);
      const frame = new THREE.Mesh(roundedSlab(W * 0.82, 0.03, 0.03, 0.01, 0.004), M.trim); frame.rotation.y = Math.PI / 2; frame.position.copy(pb); shell.add(frame);
      const [c0, c1] = S.cockpit; const topY = interpProfile(S.hull, (c0 + c1) / 2) * H;
      const tub = new THREE.Mesh(roundedSlab(lay.X(c1) - lay.X(c0), W * 0.7, 0.04, 0.12, 0.01), M.interiorF); tub.rotation.x = -Math.PI / 2; tub.position.set((lay.X(c0) + lay.X(c1)) / 2, topY + 0.03, 0); shell.add(tub);
      for (const sgn of [-1, 1]) {
        const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 8, 16, Math.PI), M.chrome); hoop.position.set(lay.X(c0) + 0.1, topY + 0.16, sgn * W * 0.2); hoop.rotation.y = Math.PI / 2; shell.add(hoop);
        const seat = new THREE.Mesh(roundedSlab(0.42, 0.55, 0.1, 0.08, 0.02), M.interiorF); seat.position.set(lay.X(c0) + 0.28, topY + 0.15, sgn * W * 0.2); seat.rotation.set(0, Math.PI / 2, 0); seat.rotateX(-0.25); shell.add(seat);
      }
    }
    if (S.bed) { const x0 = lay.X(S.bed[0]), x1 = lay.X(S.bed[1]); const y = fn.topC((x0 + x1) / 2); const cov = new THREE.Mesh(roundedSlab(x1 - x0, W * 0.86, 0.03, 0.03, 0.006), M.carbon); cov.rotation.x = -Math.PI / 2; cov.position.set((x0 + x1) / 2, y + 0.02, 0); shell.add(cov); }
    if (S.rails && cab) {
      const r0 = cab.cf.xRoofR + 0.05, r1 = cab.cf.xRoofF - 0.05; const yt = cab.cf.top((r0 + r1) / 2);
      for (const sgn of [-1, 1]) { const rail = new THREE.Mesh(roundedSlab(r1 - r0, 0.035, 0.035, 0.015, 0.005), M.trim); rail.position.set((r0 + r1) / 2, yt + 0.035, sgn * cab.cf.half((r0 + r1) / 2, yt) * 0.78); shell.add(rail); }
    }
  }

  // ---- aero parts
  const r = params.render || {}; const spec = params.spec || {};
  if (r.splitter && r.splitter !== 'none') {
    const big = r.splitter === 'race'; const ext = big ? 0.09 : 0.04;
    const sh = new THREE.Shape(); const xs = []; const x0 = xn - 0.7; for (let i = 0; i <= 16; i++) xs.push(lerp(x0, xn, i / 16));
    sh.moveTo(x0, -(fn.halfW(x0) + 0.01)); for (const x of xs) sh.lineTo(x + ext * roundF(xn - x + 0.3, 0.4, 2), -(fn.halfW(x) * 0.98 + ext * 0.3));
    for (let i = xs.length - 1; i >= 0; i--) { const x = xs[i]; sh.lineTo(x + ext * roundF(xn - x + 0.3, 0.4, 2), fn.halfW(x) * 0.98 + ext * 0.3); }
    sh.lineTo(x0, fn.halfW(x0) + 0.01);
    const sg = new THREE.ExtrudeGeometry(sh, { depth: big ? 0.022 : 0.016, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 1 }); sg.rotateX(Math.PI / 2);
    const spl = new THREE.Mesh(sg, ghost ? paint : M.carbon); spl.position.y = fn.bottom(xn - 0.1) + 0.02; spl.castShadow = true; shell.add(spl);
    if (big && !ghost) for (const sgn of [-1, 1]) { const can = new THREE.Mesh(roundedSlab(0.2, 0.012, 0.11, 0.004, 0.002), M.carbon); can.position.set(xn - 0.16, fn.bottom(xn) + 0.2, sgn * (fn.halfW(xn - 0.16) + 0.01)); can.rotation.set(0.25 * sgn, 0, -0.2); shell.add(can); }
  }
  if (r.diffuser && r.diffuser !== 'none' && !ghost) {
    const big = r.diffuser === 'race'; const n = big ? 5 : 3; const len = big ? 0.5 : 0.32; const yb = fn.bottom(xt + 0.2);
    const plate = new THREE.Mesh(roundedSlab(len, W * 0.78, 0.015, 0.02, 0.003), M.carbon); plate.rotation.set(-Math.PI / 2, 0, 0); plate.rotateY(0.2); plate.position.set(xt + len / 2 + 0.02, yb + 0.04, 0); shell.add(plate);
    for (let i = 0; i < n; i++) { const z = (i / (n - 1) - 0.5) * W * 0.62; const fin = new THREE.Mesh(roundedSlab(len, big ? 0.16 : 0.1, 0.012, 0.03, 0.002), M.carbon); fin.position.set(xt + len / 2 + 0.03, yb + 0.03, z); fin.rotation.z = -0.2; shell.add(fin); }
  }
  if (r.wing && r.wing !== 'none') {
    const hatchy = lay.style === 'hatch' || lay.style === 'suv' || lay.style === 'kei';
    const deckX = lay.X(lay.style === 'supercar' ? 0.06 : 0.07); const deckY = fn.topC(deckX);
    if (r.wing === 'ducktail') {
      const lipShape = new THREE.Shape(); lipShape.moveTo(0, 0); lipShape.lineTo(0.2, 0); lipShape.quadraticCurveTo(0.05, 0.02, -0.02, 0.07); lipShape.lineTo(0, 0);
      const lg = new THREE.ExtrudeGeometry(lipShape, { depth: W * 0.84, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.008, bevelSegments: 2 }); lg.translate(0, 0, -W * 0.42);
      const lip = new THREE.Mesh(lg, paint); lip.castShadow = true;
      if (hatchy && cab) lip.position.set(cab.cf.xRoofR - 0.02, cab.cf.top(cab.cf.xRoofR) - 0.012, 0);
      else lip.position.set(xt + 0.03, fn.topC(xt + 0.1) - 0.005, 0);
      shell.add(lip);
    } else {
      const ta = r.wing === 'timeAttack'; const chord = ta ? 0.36 : 0.28; const span = W * (ta ? 1.0 : 0.88);
      const hgt = (ta ? 0.36 : 0.24) + (hatchy ? -0.1 : 0);
      const wg = new THREE.ExtrudeGeometry(aerofoil(chord, 0.12, 0.06), { depth: span, bevelEnabled: false, curveSegments: 4 }); wg.translate(0, 0, -span / 2);
      const wing = new THREE.Mesh(wg, ghost ? paint : M.carbon); const ang = ((spec.aero && spec.aero.wingAngle) ?? 8) * Math.PI / 180;
      const wx = hatchy && cab ? cab.cf.xRoofR + 0.02 : deckX + 0.08; const wy = (hatchy && cab ? cab.cf.top(cab.cf.xRoofR + 0.05) : deckY) + hgt;
      wing.position.set(wx, wy, 0); wing.rotation.z = -ang; wing.castShadow = true; shell.add(wing);
      if (ta) { const g2 = new THREE.ExtrudeGeometry(aerofoil(chord * 0.45, 0.1, 0.05), { depth: span * 0.98, bevelEnabled: false }); g2.translate(0, 0, -span * 0.49); const flap = new THREE.Mesh(g2, ghost ? paint : M.carbon); flap.position.set(wx - chord * 0.55, wy + 0.06, 0); flap.rotation.z = -ang - 0.35; shell.add(flap); }
      if (!ghost) {
        for (const sgn of [-1, 1]) {
          const ep = new THREE.Shape(); const L0 = chord * (ta ? 1.7 : 1.35), Hh = ta ? 0.26 : 0.16;
          ep.moveTo(-L0 / 2, -Hh / 2); ep.lineTo(L0 / 2, -Hh / 2 + 0.02); ep.quadraticCurveTo(L0 / 2 + 0.03, Hh / 2, L0 / 2 - 0.06, Hh / 2); ep.lineTo(-L0 / 2 + 0.04, Hh / 2); ep.closePath();
          const em = new THREE.Mesh(new THREE.ExtrudeGeometry(ep, { depth: 0.008, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.002, bevelSegments: 1 }), M.carbon);
          em.position.set(wx - chord * 0.2, wy + 0.02, sgn * span / 2 - (sgn > 0 ? 0 : 0.008)); shell.add(em);
          const neck = new THREE.Shape(); neck.moveTo(0, 0); neck.lineTo(0.05, 0); neck.quadraticCurveTo(0.1, hgt * 0.6, 0.02, hgt + 0.03); neck.lineTo(-0.03, hgt + 0.03); neck.quadraticCurveTo(0.04, hgt * 0.6, 0, 0);
          const nm = new THREE.Mesh(new THREE.ExtrudeGeometry(neck, { depth: 0.014, bevelEnabled: false }), M.trim);
          nm.position.set(wx - 0.08, wy - hgt - 0.01, sgn * span * 0.28); shell.add(nm);
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
      if (centre) z = (i - (nTips - 1) / 2) * 0.12;
      else if (nTips >= 4) z = (i < 2 ? -1 : 1) * (W * 0.32) + (i % 2 ? 0.06 : -0.06);
      else if (nTips === 2) z = (i ? 1 : -1) * W * 0.3;
      else z = W * 0.3;
      const tipR = ex === 'straight' ? 0.05 : 0.042; const ty = centre ? fn.bottom(xt) + 0.17 : fn.bottom(xt) + 0.07;
      const tip = new THREE.Mesh(new THREE.CylinderGeometry(tipR, tipR * 0.92, 0.2, 18, 1, true), M.chrome); tip.rotation.z = Math.PI / 2; tip.position.set(xt + 0.04, ty, z); shell.add(tip);
      const rimT = new THREE.Mesh(new THREE.TorusGeometry(tipR, 0.006, 6, 18), M.chrome); rimT.rotation.y = Math.PI / 2; rimT.position.set(xt - 0.06, ty, z); shell.add(rimT);
      const inner = new THREE.Mesh(new THREE.CircleGeometry(tipR * 0.92, 14), M.grille); inner.rotation.y = -Math.PI / 2; inner.position.set(xt - 0.04, ty, z); shell.add(inner);
      const fl = new THREE.Group(); fl.position.set(xt - 0.07, ty, z);
      const outer = new THREE.Mesh(new THREE.ConeGeometry(tipR * 1.6, 0.55, 10, 1, true), M.flame); outer.rotation.z = Math.PI / 2; outer.position.x = -0.27;
      const core = new THREE.Mesh(new THREE.ConeGeometry(tipR * 0.8, 0.3, 8, 1, true), M.flameCore); core.rotation.z = Math.PI / 2; core.position.x = -0.15;
      fl.add(outer, core); fl.visible = false; shell.add(fl); parts.flames.push(fl); parts.exhausts.push(tip);
    }
  }

  // ---- cockpit: helmet, seat, steering wheel (right-hand drive)
  let steeringWheel = null; const eye = new THREE.Vector3();
  {
    let fx, headY; const dz = W * 0.2;
    if (cab) { fx = lerp(cab.cf.xRoofR, cab.cf.xRoofF, 0.62); headY = Math.min(cab.cf.top(fx) - 0.2, cab.cf.belt(fx) + 0.36); }
    else { fx = lay.X(S.cockpit ? S.cockpit[0] + 0.1 : 0.4); headY = fn.topC(fx) + 0.4; }
    eye.set(fx + 0.06, headY + 0.02, dz);
    if (!ghost) {
      const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), M.helmet); helmet.position.set(fx, headY, dz); shell.add(helmet);
      const visor = new THREE.Mesh(new THREE.SphereGeometry(0.132, 16, 8, -0.9, 1.8, 1.1, 0.7), M.visor); visor.position.copy(helmet.position); visor.rotation.y = Math.PI / 2; shell.add(visor);
      helmet.userData.helmet = true; visor.userData.helmet = true;
      steeringWheel = new THREE.Group(); steeringWheel.position.set(fx + 0.42, headY - 0.3, dz);
      const rimW = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.018, 8, 28), M.trim); rimW.rotation.y = Math.PI / 2;
      const spk = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.03, 0.32), M.trim);
      const swInner = new THREE.Group(); swInner.add(rimW, spk); swInner.rotation.z = 0.35; steeringWheel.add(swInner); shell.add(steeringWheel);
      const dash = new THREE.Mesh(roundedSlab(0.35, 0.14, W * 0.74, 0.04, 0.01), M.interiorF); dash.position.set(fx + 0.62, headY - 0.33, 0); shell.add(dash);
      const dashGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.07), new THREE.MeshBasicMaterial({ color: 0x3fd8ff })); dashGlow.position.set(fx + 0.45, headY - 0.24, dz); dashGlow.rotation.y = -Math.PI / 2; shell.add(dashGlow);
      const seat = new THREE.Mesh(roundedSlab(0.5, 0.6, 0.12, 0.08, 0.02), M.interiorF); seat.position.set(fx - 0.14, headY - 0.3, dz); seat.rotation.set(0, Math.PI / 2, 0); seat.rotateX(-0.2); shell.add(seat);
    }
  }

  // ---- wheels
  const wheels = []; const steerGroups = []; const discs = []; const holders = [];
  const geoCache = {};
  for (let i = 0; i < 4; i++) {
    const front = i < 2; const left = i % 2 === 0; const R = front ? lay.rF : lay.rR; const w = front ? lay.twF : lay.twR;
    const key = `${R.toFixed(3)}_${w.toFixed(3)}`;
    const gw = geoCache[key] || (geoCache[key] = buildWheelGeometry(R, w, S.spokes, D, lod));
    const holder = new THREE.Group(); const steerG = new THREE.Group(); holder.add(steerG);
    const spinG = new THREE.Group(); steerG.add(spinG);
    const side = new THREE.Group(); side.scale.z = left ? -1 : 1; spinG.add(side);
    const tyreMesh = new THREE.Mesh(gw.tyre, ghost ? paint : M.tyre); tyreMesh.castShadow = !ghost; tyreMesh.name = 'tyre'; side.add(tyreMesh);
    const rimMesh = new THREE.Mesh(gw.rim, ghost ? paint : (lay.style === 'supercar' || lay.style === 'coupe' ? M.rimDark : M.rim)); rimMesh.castShadow = !ghost; rimMesh.name = 'rim'; side.add(rimMesh);
    if (!ghost) {
      const dm = new THREE.MeshStandardMaterial({ color: 0x80838a, roughness: 0.4, metalness: 0.85, emissive: 0x000000 });
      const dside = new THREE.Group(); dside.scale.z = left ? -1 : 1; steerG.add(dside);
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(gw.rimR * 0.84, gw.rimR * 0.84, 0.028, 28), dm); disc.rotation.x = Math.PI / 2; disc.position.z = w * 0.1; dside.add(disc);
      const hat = new THREE.Mesh(new THREE.CylinderGeometry(gw.rimR * 0.4, gw.rimR * 0.4, 0.05, 16), M.housing); hat.rotation.x = Math.PI / 2; hat.position.z = w * 0.12; dside.add(hat);
      const cal = new THREE.Mesh(roundedSlab(0.16, 0.08, 0.07, 0.03, 0.008), M.caliper); cal.position.set(-gw.rimR * 0.62, gw.rimR * 0.32, w * 0.14); cal.rotation.z = 0.5 + Math.PI / 2; dside.add(cal);
      discs.push(dm);
    } else discs.push(null);
    holders.push(holder); steerGroups.push(steerG); wheels.push(spinG);
  }

  root.traverse((o) => { if (o.isMesh && ghost) { o.castShadow = false; o.receiveShadow = false; } });
  return { root, body, shell, wheels, holders, steerGroups, discs, parts, lay, steeringWheel, eye, paint };
}

let _blobMat = null;
function blobMaterial() {
  if (_blobMat) return _blobMat;
  const c = document.createElement('canvas'); c.width = 128; c.height = 64; const g = c.getContext('2d');
  const gr = g.createRadialGradient(64, 32, 4, 64, 32, 62); gr.addColorStop(0, 'rgba(0,0,0,0.75)'); gr.addColorStop(0.55, 'rgba(0,0,0,0.45)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.setTransform(1, 0, 0, 0.5, 0, 16); g.fillStyle = gr; g.fillRect(0, -32, 128, 128);
  _blobMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -8, polygonOffsetUnits: -8 });
  return _blobMat;
}

/** Snapshot of vehicle render state (for interpolation). */
class Snapshot {
  constructor() { this.pos = new THREE.Vector3(); this.quat = new THREE.Quaternion(); this.wpos = [0, 1, 2, 3].map(() => new THREE.Vector3()); this.spin = [0, 0, 0, 0]; this.steer = [0, 0, 0, 0]; }
  copyFromVehicle(v) {
    simToThree(v.pos, this.pos); simQuatToThree(v.quat, this.quat);
    for (let i = 0; i < 4; i++) { const w = v.wheels[i]; simToThree(w.pos, this.wpos[i]); this.spin[i] = w.spin; this.steer[i] = w.steer; }
  }
  copy(s) { this.pos.copy(s.pos); this.quat.copy(s.quat); for (let i = 0; i < 4; i++) { this.wpos[i].copy(s.wpos[i]); this.spin[i] = s.spin[i]; this.steer[i] = s.steer[i]; } }
}

const _v = new THREE.Vector3(); const _c = new THREE.Color();
function brakeGlow(T, out) { const t = clamp((T - 320) / 600, 0, 1); out.setRGB(t, 0.25 * t * t, 0.02 * t * t * t); return t; }

/** A renderable car bound to a vehicle state: interpolation, wheel spin/steer, brake glow, lights, flames. */
export class CarView {
  constructor(params, opts = {}) {
    this.params = params; this.opts = opts;
    this.model = buildCarModel(params, opts);
    this.group = new THREE.Group(); this.group.add(this.model.root);
    this.wheelGroup = new THREE.Group(); for (const h of this.model.holders) this.wheelGroup.add(h); this.group.add(this.wheelGroup);
    this.prev = new Snapshot(); this.cur = new Snapshot(); this.render = new Snapshot();
    this.hasState = false; this.prevThrottle = 0; this.popTimer = 0; this.brake = 0;
    const lay = this.model.lay; const blob = new THREE.Mesh(new THREE.PlaneGeometry(lay.L * 1.15, lay.W * 1.25), blobMaterial());
    blob.rotation.x = -Math.PI / 2; blob.renderOrder = 1; this.blob = blob; this.blobOn = false; this.group.add(blob); blob.visible = false;
  }
  get eye() { return this.model.eye; }
  setBlobShadow(on) { this.blobOn = on; this.blob.visible = on; }
  /** Store the interpolation start (call before each physics step). */
  capturePrev(v) { if (!this.hasState) { this.cur.copyFromVehicle(v); this.hasState = true; } this.prev.copyFromVehicle(v); }
  /** After stepping; alpha in [0,1] = fraction of DT accumulated beyond the current state. */
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
    if (this.blobOn) {
      const w = this.cur.wpos; const gy = (w[0].y + w[1].y + w[2].y + w[3].y) / 4 - (this.model.lay.rF + this.model.lay.rR) / 2 + 0.03;
      this.blob.position.set(R.pos.x, gy, R.pos.z); _v.set(1, 0, 0).applyQuaternion(R.quat); this.blob.rotation.set(-Math.PI / 2, 0, Math.atan2(-_v.z, _v.x));
    }
  }
  /** Per-frame cosmetic updates (dt = real frame time). */
  update(dt, v) {
    const M = this.model; const es = v.engines && v.engines[0];
    for (let i = 0; i < 4; i++) { const dm = M.discs[i]; if (!dm) continue; const t = brakeGlow(v.wheels[i].brakeTempC ?? 20, _c); dm.emissive.copy(_c); dm.emissiveIntensity = 1.5 * t; }
    const br = (v.controls && v.controls.brake) || 0; this.brake += (br - this.brake) * Math.min(1, dt * 20);
    if (M.parts.tailMat && M.parts.tailMat.emissiveIntensity != null) M.parts.tailMat.emissiveIntensity = 0.4 + this.brake * 3.5;
    if (M.steeringWheel) { const lock = this.params.steering?.maxLock || 0.6; const st = (v.wheels[0].steer + v.wheels[1].steer) / 2; M.steeringWheel.rotation.x = -st / lock * 2.2; }
    if (M.parts.flames.length && es && !this.params.powerUnits?.[0]?.engine?.isEV) {
      const thr = (v.controls && v.controls.throttle) || 0; const ep = this.params.powerUnits[0].engine;
      const rpmFrac = es.rpm / (ep.redlineRpm || 7000);
      if (this.prevThrottle > 0.6 && thr < 0.15 && rpmFrac > 0.55) this.popTimer = 0.25 + Math.random() * 0.4;
      this.prevThrottle = thr; this.popTimer -= dt;
      const want = es.limiter || es.antiLagActive || this.popTimer > 0 || (v.controls?.nitrous && es.nitrousActive);
      for (const f of M.parts.flames) {
        const on = want && Math.random() < (es.limiter ? 0.75 : 0.45);
        f.visible = on; if (on) { const s = 0.6 + Math.random() * 0.8; f.scale.set(s, 0.8 + Math.random() * 0.5, 0.8 + Math.random() * 0.5); }
      }
    }
  }
  setVisible(b) { this.group.visible = b; }
  setOpacity(o) { const p = this.model.paint; p.transparent = o < 1; p.opacity = o; p.depthWrite = o >= 1; }
  dispose() { this.group.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); this.model.paint.dispose(); }
}

export { STYLES };
