// FX showcase: real track (src/sim/track.js + E's trackMesh.js) and real car models (E's carModel.js
// from src/sim/build.js presets) driven kinematically along the start straight, with every FX
// environment / quality switchable. Falls back to a stand-in oval + box car if those modules fail.
// Automation hook: window.fxShowcase (used by scripts/fx-screenshots.js).
import * as THREE from 'three';
import { initFX, QUALITY_LEVELS, ENVIRONMENT_KEYS } from './index.js';

const qs = new URLSearchParams(location.search);
const canvas = document.getElementById('view');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: qs.has('capture') });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 9000);

let track = null, trackGroup = null, mkCar = null, standIn = qs.has('standin');
async function loadReal() {
  const [{ createTrack }, { buildTrackScene }, { CarView }, { build }, { PRESETS }] = await Promise.all([
    import('../../sim/track.js'), import('../render/trackMesh.js'), import('../render/carModel.js'), import('../../sim/build.js'), import('../../sim/presets.js')]);
  track = createTrack(qs.get('track') || 'gp');
  trackGroup = buildTrackScene(track, {}).group; scene.add(trackGroup);
  mkCar = (preset, color) => {
    const spec = structuredClone(PRESETS[preset].spec || PRESETS[preset]); if (color) spec.color = color;
    const params = build(spec); const cv = new CarView(params, {}); scene.add(cv.group);
    return { group: cv.group, params, lay: cv.model.lay, cv };
  };
}

// ------------------------------------------------------------------ stand-in (no sim/E modules)
function standInTrack() {
  const R = 160, Ls = 900, ds = 1; const per = 2 * Ls + 2 * Math.PI * R; const n = Math.round(per / ds);
  const S = { n, ds: per / n }; for (const k of ['x', 'y', 'z', 'tx', 'ty', 'tz', 'nx', 'ny', 'bank', 'curvature', 'widthL', 'widthR']) S[k] = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const s = i * S.ds; let x, y, h, c = 0;
    if (s < Ls) { x = s - Ls / 2; y = -R; h = 0; }
    else if (s < Ls + Math.PI * R) { const a = (s - Ls) / R; x = Ls / 2 + Math.sin(a) * R; y = -Math.cos(a) * R; h = a; c = 1 / R; }
    else if (s < 2 * Ls + Math.PI * R) { x = Ls / 2 - (s - Ls - Math.PI * R); y = R; h = Math.PI; }
    else { const a = (s - 2 * Ls - Math.PI * R) / R; x = -Ls / 2 - Math.sin(a) * R; y = Math.cos(a) * R; h = Math.PI + a; c = 1 / R; }
    S.x[i] = x; S.y[i] = y; S.tx[i] = Math.cos(h); S.ty[i] = Math.sin(h); S.nx[i] = -Math.sin(h); S.ny[i] = Math.cos(h); S.curvature[i] = c; S.widthL[i] = S.widthR[i] = 6.5;
  }
  const t = { length: per, width: 13, closed: true, samples: S, scenery: null };
  t.query = (x, y, hint, out) => {
    let best = 0, bd = Infinity; const lo = hint >= 0 ? hint - 40 : 0, hi = hint >= 0 ? hint + 40 : n;
    for (let k = lo; k < hi; k++) { const i = (k % n + n) % n; const d = (S.x[i] - x) ** 2 + (S.y[i] - y) ** 2; if (d < bd) { bd = d; best = i; } }
    const off = (x - S.x[best]) * S.nx[best] + (y - S.y[best]) * S.ny[best];
    Object.assign(out, { s: best * S.ds, offset: off, height: 0, nx: 0, ny: 0, nz: 1, surface: Math.abs(off) < 6.5 ? 0 : 1, index: best }); return out;
  };
  t.pointAt = (s, out = {}) => { const i = Math.floor(((s % per) + per) % per / S.ds) % n; return Object.assign(out, { x: S.x[i], y: S.y[i], z: 0, tx: S.tx[i], ty: S.ty[i], heading: Math.atan2(S.ty[i], S.tx[i]), bank: 0, curvature: S.curvature[i] }); };
  return t;
}
function standInScene(t) {
  const g = new THREE.Group(); const S = t.samples; const M = 10; const pos = [], uv = [], ind = [];
  for (let r = 0; r <= S.n; r++) { const i = r % S.n; for (let k = 0; k <= M; k++) { const off = -6.5 + 13 * k / M; pos.push(S.x[i] + S.nx[i] * off, 0.004, -(S.y[i] + S.ny[i] * off)); uv.push(k / M, r * S.ds / 12); } }
  for (let r = 0; r < S.n; r++) for (let k = 0; k < M; k++) { const a = r * (M + 1) + k, b = a + M + 1; ind.push(a, b, a + 1, a + 1, b, b + 1); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(ind); geo.computeVertexNormals();
  const road = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x555555 })); road.name = 'road'; road.receiveShadow = true; g.add(road);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000), new THREE.MeshStandardMaterial({ color: 0x3d5a2a, roughness: 1 })); ground.rotation.x = -Math.PI / 2; ground.position.y = -0.02; ground.name = 'terrain'; ground.receiveShadow = true; g.add(ground);
  return g;
}
function standInCar(color) {
  const root = new THREE.Group(); root.name = 'car'; const group = new THREE.Group(); group.add(root);
  const paint = new THREE.MeshPhysicalMaterial({ color, roughness: 0.3, metalness: 0.5, clearcoat: 1 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.6, 1.9), paint); body.position.y = 0.0; body.castShadow = true; root.add(body);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.5, 1.6), new THREE.MeshPhysicalMaterial({ color: 0x0a0e14, transparent: true, opacity: 0.6, roughness: 0.05 })); cab.position.set(-0.3, 0.5, 0); root.add(cab);
  const tail = new THREE.MeshStandardMaterial({ color: 0x5a0a0a, emissive: 0xff1a10, emissiveIntensity: 0.35 });
  const head = new THREE.MeshStandardMaterial({ color: 0xdfe8f2, emissive: 0xeaf2ff, emissiveIntensity: 1.6 });
  for (const z of [-0.65, 0.65]) { const t = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 0.4), tail); t.position.set(-2.22, 0.1, z); root.add(t); const h = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 0.4), head); h.position.set(2.22, 0.1, z); root.add(h); }
  const ex = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.18, 12, 1, true), new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 1, roughness: 0.15 })); ex.rotation.z = Math.PI / 2; ex.position.set(-2.2, -0.2, 0.5); root.add(ex);
  const tyre = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
  for (const [x, z] of [[1.4, -0.85], [1.4, 0.85], [-1.4, -0.85], [-1.4, 0.85]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.25, 20), tyre); w.rotation.x = Math.PI / 2; w.position.set(x, -0.2, z); w.castShadow = true; root.add(w); }
  return { group, params: null, lay: { cgH: 0.53, xF: 1.4, xR: -1.4, trackF: 1.7, trackR: 1.7, rF: 0.33, rR: 0.33, L: 4.4 }, cv: null };
}

// ------------------------------------------------------------------ kinematic driving
const cars = [];
function fakeVehicle(c) {
  return { params: c.params, pos: [0, 0, 0], quat: [0, 0, 0, 1], vel: [0, 0, 0], speed: 0, heading: 0, angVel: [0, 0, 0],
    wheels: [0, 1, 2, 3].map(() => ({ pos: [0, 0, 0], steer: 0, spin: 0, omega: 0, brakeTempC: 80, contact: true, compression: 0.04, usage: 0.3, sliding: false, surface: 0, slipAngle: 0 })),
    controls: { throttle: 1, brake: 0, steer: 0, handbrake: 0 }, engines: [{ rpm: 6500, limiter: false, antiLagActive: false, nitrousActive: false }] };
}
const pq = { s: 0, offset: 0, height: 0, nx: 0, ny: 0, nz: 1, surface: 0, index: -1 };
function placeCar(c, dt) {
  const t = track; c.s = (c.s + c.speed * dt) % t.length; const p = t.pointAt(c.s, {}); const h = p.heading;
  const nx = -Math.sin(h), ny = Math.cos(h); const x = p.x + nx * c.offset, y = p.y + ny * c.offset;
  t.query(x, y, pq.index, pq); const z = pq.height; const v = c.v; const lay = c.lay;
  v.pos[0] = x; v.pos[1] = y; v.pos[2] = z + lay.cgH; v.quat[0] = 0; v.quat[1] = 0; v.quat[2] = Math.sin(h / 2); v.quat[3] = Math.cos(h / 2);
  v.vel[0] = Math.cos(h) * c.speed; v.vel[1] = Math.sin(h) * c.speed; v.speed = c.speed; v.heading = h;
  for (let i = 0; i < 4; i++) {
    const front = i < 2, left = i % 2 === 0; const bx = front ? lay.xF : lay.xR; const by = (left ? 1 : -1) * (front ? lay.trackF : lay.trackR) / 2; const R = front ? lay.rF : lay.rR;
    const w = v.wheels[i]; w.pos[0] = x + Math.cos(h) * bx - Math.sin(h) * by; w.pos[1] = y + Math.sin(h) * bx + Math.cos(h) * by; w.pos[2] = z + R; w.spin += c.speed / R * dt; w.omega = c.speed / R;
  }
  v.controls.brake = c.brake || 0; v.engines[0].nitrousActive = !!c.boost; v.engines[0].rpm = 6500;
  if (c.cv) { c.cv.sync(v, 1); c.cv.update(dt, v); }
  else { const root = c.group.children[0]; root.position.set(x, z + lay.cgH, -y); root.rotation.set(0, h, 0); }
}

// ------------------------------------------------------------------ setup
let fx = null; const shot = { name: 'chase', s0: 0 };
const camState = { pos: new THREE.Vector3(), look: new THREE.Vector3(), init: false };
async function setup() {
  if (!standIn) { try { await loadReal(); } catch (e) { console.warn('[showcase] real modules failed, using stand-in', e); standIn = true; } }
  if (standIn) { track = standInTrack(); trackGroup = standInScene(track); scene.add(trackGroup); mkCar = (p, color) => { const c = standInCar(color); scene.add(c.group); return c; }; }
  const S = track.samples; const start = standIn ? 200 : track.length - 210;
  const defs = [
    { preset: 'supercar', color: '#c81d25', paint: 'metallic', offset: -1.6, ds: 0, speed: 58, player: true, underglow: null },
    { preset: 'timeAttack', color: '#1d5fd8', paint: 'pearl', offset: 2.6, ds: 26, speed: 57 },
    { preset: 'muscleV8', color: '#f2b705', paint: 'candy', offset: -2.8, ds: 52, speed: 56.5 },
    { preset: 'drift', color: '#e8e8ec', paint: 'solid', offset: 1.4, ds: 85, speed: 56 },
  ];
  for (const d of defs) {
    let c; try { c = mkCar(d.preset, d.color); } catch (e) { console.warn(e); c = standInCar(d.color); scene.add(c.group); }
    Object.assign(c, { s: (start + d.ds) % track.length, offset: d.offset, speed: d.speed, base: d, v: null });
    c.v = fakeVehicle(c); if (!c.params) c.v.params = null; cars.push(c);
  }
  void S;
  let line = null;
  if (!standIn && !qs.has('noline')) { try { const { racingLine } = await import('../../ai/racingline.js'); line = racingLine(track).offset; } catch (e) { console.warn(e); } }
  const env = qs.get('env') || 'night'; const quality = qs.get('q') || 'high';
  for (const c of cars) placeCar(c, 0);
  fx = initFX({ renderer, scene, camera, track, trackGroup, preset: env, quality, racingLine: line, autoScale: qs.has('autoscale'),
    cars: cars.map((c) => ({ group: c.group, vehicle: c.v, player: !!c.base.player, paint: c.base.paint, underglow: c.base.underglow })) });
  await fx.ready;
  resize(); buildUI();
  window.fxShowcase = api; document.body.dataset.ready = '1';
  if (!qs.has('capture')) loop();
}

function setCamera(dt) {
  const p = cars[0]; const root = p.group.getObjectByName('car') || p.group.children[0];
  const pos = root.position; const fwd = new THREE.Vector3(1, 0, 0).applyQuaternion(root.quaternion).setY(0).normalize();
  const right = new THREE.Vector3(-fwd.z, 0, fwd.x);
  let want, look, fov = 62;
  switch (shot.name) {
    case 'side': want = pos.clone().addScaledVector(right, 4.6).addScaledVector(fwd, 1.2).setY(pos.y + 0.55); look = pos.clone().addScaledVector(fwd, 0.4).setY(pos.y + 0.25); fov = 48; break;
    case 'front': want = pos.clone().addScaledVector(fwd, 7.5).addScaledVector(right, -2.2).setY(pos.y + 0.6); look = pos.clone().setY(pos.y + 0.3); fov = 46; break;
    case 'rear': want = pos.clone().addScaledVector(fwd, -4.2).addScaledVector(right, 2.0).setY(pos.y + 0.35); look = pos.clone().addScaledVector(fwd, 1).setY(pos.y + 0.35); fov = 52; break;
    case 'wide': want = pos.clone().addScaledVector(fwd, -14).addScaledVector(right, 9).setY(pos.y + 6); look = pos.clone().addScaledVector(fwd, 20); fov = 60; break;
    default: want = pos.clone().addScaledVector(fwd, -6.6).setY(pos.y + 1.55); look = pos.clone().addScaledVector(fwd, 3.5).setY(pos.y + 0.75); fov = 62 + Math.min(p.speed / 80, 1) * 14;
  }
  camera.position.copy(want); camera.lookAt(look); if (camera.fov !== fov) { camera.fov = fov; camera.updateProjectionMatrix(); }
  void dt;
}

function advance(dt) {
  for (const c of cars) placeCar(c, dt);
  setCamera(dt);
  fx.update(dt, { playerVehicle: cars[0].v, speed: cars[0].speed, boost: cars[0].boost ? 1 : 0 });
  fx.render(dt);
}

let last = 0;
function loop(t = 0) { const dt = last ? Math.min(0.05, (t - last) / 1000) : 1 / 60; last = t; advance(dt); stats(); requestAnimationFrame(loop); }
let statT = 0, statN = 0, statEl = null;
function stats() { statN++; const now = performance.now(); if (now - statT > 500) { if (statEl) { const s = fx.stats(); statEl.textContent = `${(1000 * statN / (now - statT)).toFixed(0)} fps · ${s.tier} · scale ${s.renderScale.toFixed(2)} · shed ${s.shed} · ${s.env}`; } statT = now; statN = 0; } }

function resize() {
  const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
}
addEventListener('resize', resize);

function buildUI() {
  if (qs.has('capture')) return;
  const ui = document.getElementById('ui'); ui.hidden = false;
  const row = (label, items, fn) => { const d = document.createElement('div'); d.className = 'row'; d.innerHTML = `<span>${label}</span>`; for (const it of items) { const b = document.createElement('button'); b.textContent = it; b.onclick = () => fn(it); d.appendChild(b); } ui.appendChild(d); };
  row('env', [...ENVIRONMENT_KEYS, 'night-wet', 'day-wet'], (e) => fx.setEnvironment(e));
  row('quality', QUALITY_LEVELS, (q) => fx.setQuality(q));
  row('shot', ['chase', 'side', 'front', 'rear', 'wide'], (s) => { shot.name = s; });
  row('paint', ['solid', 'metallic', 'pearl', 'candy', 'matte', 'chrome'], (p) => fx.setPaint(cars[0].group, p));
  row('fx', ['boost', 'brake', 'sparks', 'underglow'], (k) => {
    const c = cars[0];
    if (k === 'boost') c.boost = !c.boost; if (k === 'brake') c.brake = c.brake ? 0 : 1;
    if (k === 'sparks') { const r = c.group.getObjectByName('car') || c.group; fx.spawnSparks(r.position.clone().setY(r.position.y - 0.4), new THREE.Vector3(0, 0.6, 0), 1, new THREE.Vector3(c.v.vel[0], 0, -c.v.vel[1])); }
    if (k === 'underglow') { c.ug = !c.ug; fx.setUnderglow(c.group, c.ug ? 0x29e7ff : null); }
  });
  statEl = document.createElement('div'); statEl.className = 'stat'; ui.appendChild(statEl);
}

const api = {
  setEnv: (e) => fx.setEnvironment(e),
  setQuality: (q) => fx.setQuality(q),
  setShot: (s) => { shot.name = s; },
  setBoost: (b) => { cars[0].boost = !!b; }, setBrake: (b) => { cars[0].brake = b; },
  setPaint: (p) => fx.setPaint(cars[0].group, p),
  setUnderglow: (c) => fx.setUnderglow(cars[0].group, c),
  sparks: (n = 1) => { const c = cars[0]; const r = c.group.getObjectByName('car') || c.group; for (let k = 0; k < n; k++) fx.spawnSparks(r.position.clone().add(new THREE.Vector3(-1.2, -0.45, 0.6)), new THREE.Vector3(0, 0.5, 0), 1, new THREE.Vector3(c.v.vel[0], 0, -c.v.vel[1])); },
  /** advance n frames of fixed dt and force GPU completion; returns avg ms per frame */
  frames(n = 1, dt = 1 / 60) {
    const gl = renderer.getContext(); const px = new Uint8Array(4);
    const t0 = performance.now(); for (let k = 0; k < n; k++) advance(dt); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
    return (performance.now() - t0) / n;
  },
  reset() { cars.forEach((c, i) => { c.s = ((standIn ? 200 : track.length - 210) + c.base.ds) % track.length; void i; }); },
  stats: () => fx.stats(), gpu: () => { const gl = renderer.getContext(); const e = gl.getExtension('WEBGL_debug_renderer_info'); return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : ''; },
  get fx() { return fx; }, renderer, scene, camera,
};

setup().catch((e) => { console.error(e); document.body.dataset.error = String(e && e.stack || e); });
