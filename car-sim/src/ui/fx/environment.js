// Environments / time of day: sky, sun or moon (+ fitted shadows), hemisphere fill, fog, PMREM
// reflections, colour grade (LUT), bloom tuning, wetness. applyEnvironment() is the stand-alone
// entry; the EnvironmentFX class is what initFX uses (it also owns the track dressing).
import * as THREE from 'three';
import { createSky, setSkyParams } from './sky.js';

/**
 * Presets. Colours are sRGB hex (three converts to linear). Grade operates after tone mapping.
 * Each may be combined with { wet: 0..1 }.
 */
export const ENVIRONMENTS = {
  day: {
    label: 'Day', sunElev: 50, sunAzim: 215, sunColor: 0xfff1de, sunIntensity: 3.6,
    hemiSky: 0xb4d2ff, hemiGround: 0x5a5a48, hemiIntensity: 1.0,
    fog: 0xb5cde6, fogDensity: 0.00042, exposure: 0.95, envIntensity: 1.0,
    sky: { zenith: 0x1f63d9, horizon: 0xb9d6f2, ground: 0x6d6a60, sunColor: 0xfff4e0, sunSize: 0.012, sunGlow: 1.6, sunDisk: 60, haze: 0.45,
      clouds: 0.42, cloudScale: 0.9, cloudColor: 0xffffff, cloudShade: 0x9aaac0, glowColor: 0xffffff, horizonGlow: 0.05, glowHeight: 0.08 },
    bloom: { strength: 0.32, radius: 0.55, threshold: 1.1 },
    grade: { contrast: 1.14, saturation: 1.22, lift: [0.0, 0.0, 0.012], gain: [1.03, 1.0, 0.96], shadowTint: [0.0, 0.03, 0.06], highlightTint: [0.05, 0.03, 0.0], vignette: 0.28 },
    streetlights: false, neon: 0, skyline: null, edgeStrips: false,
  },
  goldenHour: {
    label: 'Golden hour', sunElev: 7, sunAzim: 255, sunColor: 0xffa055, sunIntensity: 4.2,
    hemiSky: 0x8f8fd8, hemiGround: 0x5a4030, hemiIntensity: 0.75,
    fog: 0xe8a77a, fogDensity: 0.0006, exposure: 1.0, envIntensity: 1.1,
    sky: { zenith: 0x2a3a8a, horizon: 0xffa060, ground: 0x4a3028, sunColor: 0xffb070, sunSize: 0.03, sunGlow: 3.5, sunDisk: 40, haze: 0.5,
      clouds: 0.35, cloudScale: 0.7, cloudColor: 0xffb88a, cloudShade: 0x6a4a78, glowColor: 0xff7a3a, horizonGlow: 0.45, glowHeight: 0.12 },
    bloom: { strength: 0.48, radius: 0.7, threshold: 1.0 },
    grade: { contrast: 1.16, saturation: 1.18, lift: [0.01, 0.0, 0.025], gain: [1.08, 0.99, 0.9], shadowTint: [-0.02, 0.02, 0.08], highlightTint: [0.1, 0.04, -0.04], vignette: 0.34 },
    streetlights: false, neon: 0, skyline: null, edgeStrips: false,
  },
  night: {
    label: 'Night city', sunElev: 38, sunAzim: 140, sunColor: 0x8aa6ff, sunIntensity: 0.32, moon: true,
    hemiSky: 0x23305a, hemiGround: 0x2a1a10, hemiIntensity: 0.45,
    fog: 0x1a1830, fogDensity: 0.0011, exposure: 1.25, envIntensity: 0.9,
    sky: { zenith: 0x02040d, horizon: 0x1a1838, ground: 0x0a0806, sunColor: 0x000000, sunSize: 0.0, sunGlow: 0, sunDisk: 0, haze: 0.2,
      clouds: 0.3, cloudScale: 0.8, cloudColor: 0x3a2a4a, cloudShade: 0x0a0a14, glowColor: 0xff6a20, horizonGlow: 0.22, glowHeight: 0.06,
      stars: 1.0, moon: 1, moonDir: [0.5, 0.55, -0.6] },
    bloom: { strength: 0.75, radius: 0.75, threshold: 0.9 },
    grade: { contrast: 1.18, saturation: 1.25, lift: [0.0, 0.006, 0.03], gain: [1.05, 1.0, 1.02], shadowTint: [-0.02, 0.02, 0.1], highlightTint: [0.1, 0.03, -0.05], vignette: 0.42 },
    streetlights: true, neon: 1, skyline: 'city', edgeStrips: false, envLights: 'sodium',
  },
  futuristic: {
    label: 'Anti-grav 2097', sunElev: 22, sunAzim: 200, sunColor: 0xb08cff, sunIntensity: 0.9,
    hemiSky: 0x3a2a7a, hemiGround: 0x101030, hemiIntensity: 0.55,
    fog: 0x24124a, fogDensity: 0.0009, exposure: 1.15, envIntensity: 1.2,
    sky: { zenith: 0x05021a, horizon: 0x5a1a7a, ground: 0x08041a, sunColor: 0xff70d0, sunSize: 0.05, sunGlow: 1.5, sunDisk: 6, haze: 0.25,
      clouds: 0.0, glowColor: 0xff2bd6, horizonGlow: 0.5, glowHeight: 0.05, stars: 1.2,
      grid: 1.2, gridColor: 0x29e7ff, planet: 1, planetColor: 0x9a7bff, planetDir: [-0.5, 0.32, -0.8] },
    bloom: { strength: 0.85, radius: 0.8, threshold: 0.85 },
    grade: { contrast: 1.2, saturation: 1.3, lift: [0.015, 0.0, 0.04], gain: [1.02, 0.98, 1.06], shadowTint: [0.02, -0.01, 0.12], highlightTint: [0.06, 0.0, 0.06], vignette: 0.45 },
    streetlights: false, neon: 0, skyline: 'towers', edgeStrips: true, envLights: 'neon',
  },
};

/** Overcast/rain variant applied on top of a base preset when wet. */
function wetVariant(E, wet) {
  const o = structuredClone(E);
  o.wet = wet;
  const night = !!E.streetlights || !!E.edgeStrips;
  if (!night) {
    o.sunIntensity *= 1 - 0.75 * wet; o.hemiIntensity *= 1 + 0.2 * wet; o.fogDensity *= 1 + 2.2 * wet; o.exposure *= 1 + 0.1 * wet;
    o.fog = lerpHex(E.fog, 0x8a929c, wet);
    Object.assign(o.sky, { clouds: Math.min(0.95, (E.sky.clouds || 0) + 0.7 * wet), cloudColor: lerpHex(E.sky.cloudColor ?? 0xffffff, 0xb8bec8, wet), cloudShade: lerpHex(E.sky.cloudShade ?? 0x808080, 0x4a5058, wet),
      zenith: lerpHex(E.sky.zenith, 0x5a6878, wet * 0.85), horizon: lerpHex(E.sky.horizon, 0x9aa2ac, wet * 0.85), sunGlow: (E.sky.sunGlow || 0) * (1 - 0.8 * wet), sunDisk: (E.sky.sunDisk || 0) * (1 - wet) });
    o.grade = Object.assign({}, E.grade, { saturation: E.grade.saturation * (1 - 0.15 * wet), contrast: E.grade.contrast * (1 + 0.02 * wet), shadowTint: [0, 0.02, 0.06] });
  } else {
    o.fogDensity *= 1 + 0.8 * wet; o.sky.clouds = Math.min(0.9, (E.sky.clouds || 0) + 0.5 * wet); o.sky.stars = (E.sky.stars || 0) * (1 - wet);
    o.bloom = Object.assign({}, E.bloom, { strength: E.bloom.strength * 1.15 });
  }
  return o;
}
function lerpHex(a, b, t) { return new THREE.Color(a).lerp(new THREE.Color(b), t).getHex(); }

/**
 * Parse 'night', 'night-wet', 'nightWet', { base:'night', wet:0.8 } → { key, wet, def }.
 */
export function resolveEnvironment(preset) {
  let key = 'day', wet = 0;
  if (typeof preset === 'string') {
    const m = preset.match(/^([a-zA-Z]+?)(?:[-_ ]?(wet|rain))?$/i);
    key = m ? m[1] : preset; if (m && m[2]) wet = 1;
    if (/^golden/i.test(key)) key = 'goldenHour'; if (/^(future|futuristic|antigrav)/i.test(key)) key = 'futuristic';
  } else if (preset && typeof preset === 'object') { key = preset.base || preset.name || 'day'; wet = preset.wet === true ? 1 : +preset.wet || 0; }
  if (!ENVIRONMENTS[key]) key = 'day';
  const def = wet > 0 ? wetVariant(ENVIRONMENTS[key], wet) : Object.assign({ wet: 0 }, ENVIRONMENTS[key]);
  def.key = key; return { key, wet, def, name: key + (wet > 0 ? '-wet' : '') };
}

// ------------------------------------------------------------------ colour grade → 3D LUT
/** Grade one sRGB colour (0..1) in place. */
function gradeColor(c, G) {
  let [r, g, b] = c;
  const lift = G.lift || [0, 0, 0], gain = G.gain || [1, 1, 1], gamma = G.gamma || [1, 1, 1];
  const ch = [r, g, b].map((v, i) => { v = v * gain[i] + lift[i] * (1 - v); return Math.pow(Math.max(v, 0), 1 / gamma[i]); });
  [r, g, b] = ch;
  // contrast S-curve around mid grey
  const k = G.contrast ?? 1;
  const sc = (v) => { const x = Math.min(Math.max(v, 0), 1); const s = x < 0.5 ? 0.5 * Math.pow(2 * x, k) : 1 - 0.5 * Math.pow(2 * (1 - x), k); return s + (v - x); };
  r = sc(r); g = sc(g); b = sc(b);
  const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  // split toning
  const st = G.shadowTint || [0, 0, 0], ht = G.highlightTint || [0, 0, 0];
  const ws = Math.pow(1 - Math.min(l, 1), 2), wh = Math.pow(Math.min(l, 1), 2);
  r += st[0] * ws + ht[0] * wh; g += st[1] * ws + ht[1] * wh; b += st[2] * ws + ht[2] * wh;
  // saturation (luma-preserving), with a little vibrance protection on already-saturated colours
  const l2 = 0.2126 * r + 0.7152 * g + 0.0722 * b; const sat = G.saturation ?? 1;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b); const cur = mx - mn; const s = 1 + (sat - 1) * (1 - Math.min(cur, 1) * 0.5);
  r = l2 + (r - l2) * s; g = l2 + (g - l2) * s; b = l2 + (b - l2) * s;
  c[0] = r; c[1] = g; c[2] = b; return c;
}

/** Build a size³ RGBA8 LUT texture (sRGB in → sRGB out). */
export function makeGradeLUT(grade, size = 32) {
  const data = new Uint8Array(size * size * size * 4); const c = [0, 0, 0];
  for (let b = 0; b < size; b++) for (let g = 0; g < size; g++) for (let r = 0; r < size; r++) {
    c[0] = r / (size - 1); c[1] = g / (size - 1); c[2] = b / (size - 1); gradeColor(c, grade);
    const i = ((b * size + g) * size + r) * 4;
    data[i] = Math.round(Math.min(Math.max(c[0], 0), 1) * 255); data[i + 1] = Math.round(Math.min(Math.max(c[1], 0), 1) * 255); data[i + 2] = Math.round(Math.min(Math.max(c[2], 0), 1) * 255); data[i + 3] = 255;
  }
  const t = new THREE.Data3DTexture(data, size, size, size);
  t.format = THREE.RGBAFormat; t.type = THREE.UnsignedByteType; t.minFilter = t.magFilter = THREE.LinearFilter;
  t.wrapS = t.wrapT = t.wrapR = THREE.ClampToEdgeWrapping; t.generateMipmaps = false; t.unpackAlignment = 1; t.needsUpdate = true;
  return t;
}

// ------------------------------------------------------------------ environment map
function buildEnvScene(def, sunDir) {
  const s = new THREE.Scene();
  const sky = createSky(50); setSkyParams(sky, def.sky, sunDir);
  // in the env map the sun disk is replaced by a broad bright lobe (better highlights on paint)
  sky.material.uniforms.uSunDisk.value = Math.min(def.sky.sunDisk ?? 0, 12); s.add(sky);
  // ground disc so lower hemisphere reflections read as tarmac/grass, not sky
  const gcol = new THREE.Color(def.streetlights || def.edgeStrips ? 0x050506 : 0x2a2b2c);
  const ground = new THREE.Mesh(new THREE.CircleGeometry(48, 32), new THREE.MeshBasicMaterial({ color: gcol })); ground.rotation.x = -Math.PI / 2; ground.position.y = -1.5; s.add(ground);
  const add = (color, intensity, w, h, x, y, z) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, y, 0); s.add(m);
  };
  if (def.envLights === 'sodium') {
    for (let k = 0; k < 14; k++) { const a = (k / 14) * Math.PI * 2; add(0xffa040, 18, 1.6, 0.6, Math.cos(a) * 22, 7 + (k % 3), Math.sin(a) * 22); }
    for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2 + 0.3; add([0xff2bd6, 0x29e7ff, 0xffb020][k % 3], 8, 5, 1.2, Math.cos(a) * 30, 4, Math.sin(a) * 30); }
  } else if (def.envLights === 'neon') {
    for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2; add(k % 2 ? 0xff2bd6 : 0x29e7ff, 12, 9, 0.35, Math.cos(a) * 26, 1 + (k % 3) * 3, Math.sin(a) * 26); }
  } else {
    // soft studio-ish strip so solid paints get a crisp horizon line
    add(0xffffff, 0.6, 60, 2, 0, 1.5, -40);
  }
  return s;
}

/** Simple sun shadow fitted around a focus point, snapped to texels in light space. */
function fitShadow(light, focus, forward, extent, dir) {
  const cam = light.shadow.camera;
  if (cam.right !== extent) { cam.left = -extent; cam.right = extent; cam.top = extent; cam.bottom = -extent; cam.updateProjectionMatrix(); }
  const c = _v1.copy(focus).addScaledVector(forward, extent * 0.45);
  // light-space basis
  _m.lookAt(_v0.set(0, 0, 0), _v2.copy(dir).negate(), _up);
  _mi.copy(_m).invert();
  c.applyMatrix4(_mi);
  const texel = (2 * extent) / light.shadow.mapSize.x;
  c.x = Math.round(c.x / texel) * texel; c.y = Math.round(c.y / texel) * texel;
  c.applyMatrix4(_m);
  light.target.position.copy(c); light.position.copy(c).addScaledVector(dir, 200);
  cam.near = 50; cam.far = 400; cam.updateProjectionMatrix();
  light.target.updateMatrixWorld();
}
const _v0 = new THREE.Vector3(), _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0), _m = new THREE.Matrix4(), _mi = new THREE.Matrix4();

/**
 * Owns all scene-level environment objects. Hides lights/sky/fog it did not create (E's defaults)
 * and restores them on dispose().
 */
export class EnvironmentFX {
  constructor({ renderer, scene, camera, quality }) {
    this.renderer = renderer; this.scene = scene; this.camera = camera; this.q = quality;
    this.root = new THREE.Group(); this.root.name = 'fx-environment'; scene.add(this.root);
    this.sky = createSky(); this.root.add(this.sky);
    this.sun = new THREE.DirectionalLight(0xffffff, 3); this.sun.name = 'fx-sun'; this.root.add(this.sun); this.root.add(this.sun.target);
    this.sun.shadow.bias = -0.00025; this.sun.shadow.normalBias = 0.035;
    this.hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1); this.root.add(this.hemi);
    this.sunDir = new THREE.Vector3(0, 1, 0);
    this.pmrem = null; this.envRT = null; this.lut = null; this.def = null; this.name = null; this.time = 0;
    this._hidden = [];
    this._hideForeign();
  }
  _hideForeign() {
    // E's World adds its own Sky, sun, hemisphere light and env map. Park them while FX is active.
    const keep = new Set(); this.root.traverse((o) => keep.add(o));
    this.scene.traverse((o) => {
      if (keep.has(o)) return;
      const isSky = o.isMesh && o.material && o.material.uniforms && o.material.uniforms.sunPosition && o.material.uniforms.rayleigh;
      if ((o.isLight && (o.isDirectionalLight || o.isHemisphereLight || o.isAmbientLight)) || isSky) {
        if (o.visible) { this._hidden.push(o); o.visible = false; }
      }
    });
    this._prev = { fog: this.scene.fog, env: this.scene.environment, envI: this.scene.environmentIntensity, bg: this.scene.background, exp: this.renderer.toneMappingExposure, tm: this.renderer.toneMapping };
  }
  /** Re-scan for foreign lights (call after E adds lights). */
  rehide() { this._hideForeign(); }

  setQuality(q) {
    this.q = q; const r = this.renderer;
    r.shadowMap.enabled = !!q.shadows; r.shadowMap.type = q.shadowSoft ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
    this.sun.castShadow = !!q.shadows;
    if (q.shadows) {
      const sz = q.shadowSize; if (this.sun.shadow.mapSize.x !== sz) { this.sun.shadow.mapSize.set(sz, sz); if (this.sun.shadow.map) { this.sun.shadow.map.dispose(); this.sun.shadow.map = null; } }
      this.sun.shadow.radius = q.shadowSoft ? 2.5 : 1;
    }
    if (this.def) this._buildEnvMap();
  }

  apply(preset) {
    const R = resolveEnvironment(preset); const E = R.def; this.def = E; this.name = R.name;
    const el = THREE.MathUtils.degToRad(E.sunElev), az = THREE.MathUtils.degToRad(E.sunAzim);
    this.sunDir.setFromSphericalCoords(1, Math.PI / 2 - el, az);
    setSkyParams(this.sky, E.sky, this.sunDir);
    this.sun.color.set(E.sunColor); this.sun.intensity = E.sunIntensity;
    if (E.moon && E.sky.moonDir) this.sunDir.set(...E.sky.moonDir).normalize();
    this.hemi.color.set(E.hemiSky); this.hemi.groundColor.set(E.hemiGround); this.hemi.intensity = E.hemiIntensity;
    this.scene.fog = new THREE.FogExp2(E.fog, E.fogDensity);
    this.scene.background = null;
    this.renderer.toneMappingExposure = E.exposure;
    if (this.lut) this.lut.dispose(); this.lut = makeGradeLUT(E.grade);
    this._buildEnvMap();
    return E;
  }

  _buildEnvMap() {
    const q = this.q; const E = this.def;
    if (this.envRT) { this.envRT.dispose(); this.envRT = null; }
    if (!q.pmrem) {
      // potato: no PMREM. A cheap tiny cube map from the sky for Phong/Lambert envMap reflections.
      if (!this.cube) { this.cube = new THREE.WebGLCubeRenderTarget(32); this.cubeCam = new THREE.CubeCamera(0.1, 100, this.cube); }
      const s = buildEnvScene(E, this.sunDir); this.cubeCam.update(this.renderer, s); disposeScene(s);
      this.scene.environment = null; this.envCube = this.cube.texture; return;
    }
    if (!this.pmrem) this.pmrem = new THREE.PMREMGenerator(this.renderer);
    const s = buildEnvScene(E, this.sunDir);
    this.envRT = this.pmrem.fromScene(s, 0.0, 0.1, 200); disposeScene(s);
    this.scene.environment = this.envRT.texture; this.scene.environmentIntensity = E.envIntensity;
    this.envCube = null;
  }

  /** @param {THREE.Vector3} focus world point to centre shadows on (player car) */
  update(dt, focus, camera) {
    this.time += dt; this.sky.material.uniforms.uTime.value = this.time;
    this.sky.position.copy(camera.position);
    if (this.sun.castShadow && focus) {
      camera.getWorldDirection(_fw); _fw.y = 0; if (_fw.lengthSq() < 1e-6) _fw.set(1, 0, 0); _fw.normalize();
      fitShadow(this.sun, focus, _fw, this.q.shadowExtent || 40, this.sunDir);
    } else if (focus) { this.sun.position.copy(focus).addScaledVector(this.sunDir, 200); this.sun.target.position.copy(focus); this.sun.target.updateMatrixWorld(); }
  }

  dispose() {
    this.scene.remove(this.root);
    for (const o of this._hidden) o.visible = true; this._hidden.length = 0;
    const p = this._prev; this.scene.fog = p.fog; this.scene.environment = p.env; this.scene.environmentIntensity = p.envI; this.scene.background = p.bg;
    this.renderer.toneMappingExposure = p.exp; this.renderer.toneMapping = p.tm;
    if (this.envRT) this.envRT.dispose(); if (this.pmrem) this.pmrem.dispose(); if (this.lut) this.lut.dispose(); if (this.cube) this.cube.dispose();
    this.sky.geometry.dispose(); this.sky.material.dispose();
  }
}
const _fw = new THREE.Vector3();

function disposeScene(s) { s.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); }); }

/**
 * Stand-alone helper (no track dressing / post): applies sky, lights, fog and environment map
 * for a preset to any scene. Returns the EnvironmentFX controller (call .update each frame for
 * shadows, .dispose() to restore).
 */
export function applyEnvironment(scene, renderer, preset, { camera, quality } = {}) {
  const env = new EnvironmentFX({ renderer, scene, camera, quality: quality || { shadows: true, shadowSize: 2048, shadowSoft: true, shadowExtent: 40, pmrem: true } });
  env.setQuality(env.q); env.apply(preset); return env;
}
