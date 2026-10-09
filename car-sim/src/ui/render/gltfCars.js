// Low-poly car bodies from Kenney "Car Kit" (CC0, www.kenney.nl — see src/assets/cars/LICENSE-kenney-car-kit.txt).
// The GLB body is baked into the procedural model's shell space (x forward, y up, ground ≈ 0), scaled so its axles
// sit on the physics wheelbase and its width/height match params.render. The GLB's own wheels are dropped; the
// procedural wheel/tyre/brake meshes (steer/spin/suspension animation) are kept. Body triangles are split by their
// colormap cell into paint (MeshPhysicalMaterial, build colour), head/tail lights and textured trim.
// Asset URLs are imported with `?url`, so the single-file build inlines them as data URLs.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import hatchUrl from '../../assets/cars/hatchback-sports.glb?url';
import sedanUrl from '../../assets/cars/sedan.glb?url';
import sportsUrl from '../../assets/cars/sedan-sports.glb?url';
import suvUrl from '../../assets/cars/suv.glb?url';
import truckUrl from '../../assets/cars/truck.glb?url';
import raceUrl from '../../assets/cars/race.glb?url';
import colormapUrl from '../../assets/cars/colormap.png?url';

const FILES = { hatch: hatchUrl, sedan: sedanUrl, sports: sportsUrl, suv: suvUrl, truck: truckUrl, race: raceUrl };
/** chassis style -> model key */
export const STYLE_MODEL = { kei: 'hatch', hatch: 'hatch', sedan: 'sedan', coupe: 'sports', roadster: 'sports', suv: 'suv', pickup: 'truck', supercar: 'race' };

const cache = {}; // key -> { parts: {paint,trim,head,tail: BufferGeometry (GLB space)}, spoiler, trimMat, zF, zR, top, halfW }
let preloadPromise = null;

function splitBody(geo) {
  const g = geo.index ? geo.toNonIndexed() : geo.clone();
  const P = g.attributes.position, N = g.attributes.normal, U = g.attributes.uv;
  const buckets = { paint: [], trim: [], head: [], tail: [], glass: [] };
  g.computeBoundingBox(); const yGlass = g.boundingBox.min.y + 0.55 * (g.boundingBox.max.y - g.boundingBox.min.y);
  for (let t = 0; t < P.count; t += 3) {
    const u = (U.getX(t) + U.getX(t + 1) + U.getX(t + 2)) / 3, v = (U.getY(t) + U.getY(t + 1) + U.getY(t + 2)) / 3;
    const col = Math.floor(u * 8), row = Math.floor(v * 4);
    const cy = (P.getY(t) + P.getY(t + 1) + P.getY(t + 2)) / 3;
    const k = row === 1 ? 'paint' : row === 3 && col === 1 ? 'head' : row === 3 && col === 2 ? 'tail' : row === 3 && col === 0 && cy > yGlass ? 'glass' : 'trim';
    buckets[k].push(t);
  }
  const out = {};
  for (const [k, tris] of Object.entries(buckets)) {
    if (!tris.length) continue;
    const n = tris.length * 3; const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2);
    let o = 0;
    for (const t of tris) for (let i = t; i < t + 3; i++, o++) {
      pos.set([P.getX(i), P.getY(i), P.getZ(i)], o * 3); nor.set([N.getX(i), N.getY(i), N.getZ(i)], o * 3); uv.set([U.getX(i), U.getY(i)], o * 2);
    }
    const b = new THREE.BufferGeometry();
    b.setAttribute('position', new THREE.BufferAttribute(pos, 3)); b.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); b.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    out[k] = b;
  }
  return out;
}

function prepare(gltf) {
  const scene = gltf.scene; scene.updateMatrixWorld(true);
  const byNode = (name) => { let m = null; scene.traverse((o) => { if (!m && o.name === name) m = o; }); return m; };
  const meshOf = (o) => { if (!o) return null; if (o.isMesh) return o; let m = null; o.traverse((c) => { if (!m && c.isMesh) m = c; }); return m; };
  const bodyM = meshOf(byNode('body')); if (!bodyM) throw new Error('GLB has no body');
  const bodyGeo = bodyM.geometry.clone().applyMatrix4(bodyM.matrixWorld);
  const parts = splitBody(bodyGeo);
  const sp = meshOf(byNode('spoiler')); const spoiler = sp ? sp.geometry.clone().applyMatrix4(sp.matrixWorld) : null;
  const wz = (re) => { const o = byNode(re); return o ? new THREE.Vector3().setFromMatrixPosition(o.matrixWorld).z : null; };
  const zF = wz('wheel-front-left') ?? 0.7, zR = wz('wheel-back-left') ?? -0.7;
  bodyGeo.computeBoundingBox(); const bb = bodyGeo.boundingBox;
  const trimMat = bodyM.material; trimMat.roughness = 0.6; trimMat.metalness = 0.05; trimMat.color.setScalar(0.5);
  return { parts, spoiler, trimMat, zF, zR, top: bb.max.y, halfW: Math.max(-bb.min.x, bb.max.x) };
}

/** Load all car GLBs once. Resolves true when at least one loaded (never rejects). */
export function preloadCarModels() {
  if (preloadPromise) return preloadPromise;
  const mgr = new THREE.LoadingManager();
  mgr.setURLModifier((u) => (/colormap\.png$/i.test(u) ? colormapUrl : u));
  const loader = new GLTFLoader(mgr);
  preloadPromise = Promise.all(Object.entries(FILES).map(([k, url]) => loader.loadAsync(url)
    .then((g) => { cache[k] = prepare(g); })
    .catch((e) => console.warn('[gltfCars] failed', k, e))))
    .then(() => Object.keys(cache).length > 0);
  return preloadPromise;
}

export function hasGltfModel(params) { return !!cache[STYLE_MODEL[params?.render?.style]]; }

/**
 * Replace the procedural body of `model` (from buildCarModel) with the GLB body for its style. Keeps wheels,
 * exhausts/flames, paint material, tail-light material and eye. Returns model (mutated) or null if unavailable.
 */
export function applyGltfBody(model, params, opts = {}) {
  const C = cache[STYLE_MODEL[params?.render?.style]]; if (!C) return null;
  const { shell, lay, parts } = model; const ghost = !!opts.ghost;
  // keep only exhaust/flame objects from the procedural shell
  const keep = new Set([...parts.flames, ...parts.exhausts]);
  const keeps = (o) => { let k = false; o.traverse((c) => { if (keep.has(c)) k = true; }); return k; };
  for (const ch of [...shell.children]) if (!keeps(ch)) { shell.remove(ch); ch.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); }
  // GLB (x lateral, y up, z forward; wheel centre y 0.3) -> shell (x forward, y up, z lateral)
  const rAvg = (lay.rF + lay.rR) / 2;
  const sx = lay.wb / Math.max(0.3, C.zF - C.zR);
  const sz = (lay.W / 2) / C.halfW;
  const sy = THREE.MathUtils.clamp((lay.H - rAvg) / Math.max(0.2, C.top - 0.3), 0.5, 3);
  const zc = (C.zF + C.zR) / 2, xc = (lay.xF + lay.xR) / 2;
  const M = new THREE.Matrix4().makeTranslation(xc, rAvg, 0)
    .multiply(new THREE.Matrix4().makeScale(sx, sy, sz))
    .multiply(new THREE.Matrix4().makeRotationY(Math.PI / 2))
    .multiply(new THREE.Matrix4().makeTranslation(0, -0.3, -zc));
  const headMat = ghost ? model.paint : new THREE.MeshStandardMaterial({ color: 0xfff4dc, emissive: 0xfff0d0, emissiveIntensity: 1.3, roughness: 0.1, metalness: 0.2 });
  const tailMat = ghost ? model.paint : parts.tailMat;
  const glassMat = ghost ? model.paint : new THREE.MeshPhysicalMaterial({ color: 0x0e151c, roughness: 0.05, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.03 });
  const mats = { paint: model.paint, trim: ghost ? model.paint : C.trimMat, head: headMat, tail: tailMat, glass: glassMat };
  parts.bodyMeshes = []; parts.headlights = []; parts.brakeLights = []; parts.glass = null;
  const add = (geo, mat, name) => {
    const m = new THREE.Mesh(geo.clone().applyMatrix4(M), mat); m.name = name; m.castShadow = !ghost; m.receiveShadow = !ghost; shell.add(m); return m;
  };
  for (const [k, geo] of Object.entries(C.parts)) {
    const m = add(geo, mats[k], { paint: 'body', trim: 'trim', head: 'headlight', tail: 'taillight', glass: 'glass' }[k]);
    if (k === 'paint') parts.bodyMeshes.push(m); else if (k === 'head') parts.headlights.push(m); else if (k === 'tail') parts.brakeLights.push(m); else if (k === 'glass') { m.userData.helmet = true; parts.glass = m; }
  }
  const wing = params.aero?.wing ?? params.render?.wing;
  if (C.spoiler && wing && wing !== 'none') parts.bodyMeshes.push(add(C.spoiler, model.paint, 'spoiler'));
  model.steeringWheel = null; model.gltf = true;
  return model;
}
