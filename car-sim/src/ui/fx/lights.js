// "Clustered-lite" forward lights: hundreds of streetlights / neon / headlights exist on the CPU,
// the N most relevant are uploaded each frame into shared uniform arrays that any material can
// opt into via injectFxLights(material). Uses three's own RE_Direct BRDF, so clearcoat, wet
// roads (GGX streaks) and Lambert materials all respond correctly. N is a compile-time define
// (FX_MAX_LIGHTS) per quality tier.
import * as THREE from 'three';

export const FX_LIGHT_CAP = 24;

const mk = (C) => Array.from({ length: FX_LIGHT_CAP }, () => new C());
/** Shared uniform objects (the same references are handed to every patched material). */
export const fxLightUniforms = {
  fxLightPos: { value: mk(THREE.Vector3) },     // view space
  fxLightDir: { value: mk(THREE.Vector3) },     // view space, cone axis (direction light travels)
  fxLightColor: { value: mk(THREE.Vector3) },   // linear rgb * intensity
  fxLightParams: { value: mk(THREE.Vector4) },  // range, cosOuter, cosInner, decay
  fxLightCount: { value: 0 },
};

let maxLights = 8;
const patched = new Set();

/** Change the compile-time light budget; recompiles patched materials. */
export function setMaxFxLights(n) {
  n = Math.max(0, Math.min(FX_LIGHT_CAP, n | 0)); if (n === maxLights) return; maxLights = n;
  for (const m of patched) m.needsUpdate = true;
}
export function getMaxFxLights() { return maxLights; }

const FRAG_DECL = /* glsl */`
#if FX_MAX_LIGHTS > 0
uniform vec3 fxLightPos[ FX_MAX_LIGHTS ];
uniform vec3 fxLightDir[ FX_MAX_LIGHTS ];
uniform vec3 fxLightColor[ FX_MAX_LIGHTS ];
uniform vec4 fxLightParams[ FX_MAX_LIGHTS ];
uniform int fxLightCount;
#endif
`;
const FRAG_LOOP = /* glsl */`
#if FX_MAX_LIGHTS > 0
for ( int fxi = 0; fxi < FX_MAX_LIGHTS; fxi ++ ) {
  if ( fxi >= fxLightCount ) break;
  vec4 fxp = fxLightParams[ fxi ];
  vec3 fxlv = fxLightPos[ fxi ] - geometryPosition;
  float fxd = length( fxlv );
  if ( fxd > fxp.x ) continue;
  IncidentLight fxl;
  fxl.direction = fxlv / max( fxd, 1e-3 );
  float fxcone = smoothstep( fxp.y, fxp.z, dot( - fxl.direction, fxLightDir[ fxi ] ) );
  fxl.color = fxLightColor[ fxi ] * ( min( getDistanceAttenuation( fxd, fxp.x, fxp.w ), 1.0 ) * fxcone );
  fxl.visible = true;
  RE_Direct( fxl, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
}
#endif
`;

/**
 * Chain an onBeforeCompile hook by name (re-adding a name replaces it). keyFn() feeds the program
 * cache key so variants (e.g. light budget) compile separately.
 */
export function addShaderHook(material, name, fn, keyFn) {
  const ud = material.userData;
  if (!ud.fxHooks) {
    ud.fxHooks = [];
    const prevKey = material.customProgramCacheKey ? material.customProgramCacheKey.bind(material) : null;
    material.onBeforeCompile = (shader, r) => { for (const h of ud.fxHooks) h.fn(shader, r); };
    material.customProgramCacheKey = () => (prevKey ? prevKey() : '') + '|' + ud.fxHooks.map((h) => h.name + (h.keyFn ? h.keyFn() : '')).join(',');
  }
  const ex = ud.fxHooks.find((h) => h.name === name);
  if (ex) { ex.fn = fn; ex.keyFn = keyFn; } else ud.fxHooks.push({ name, fn, keyFn });
  material.needsUpdate = true;
}

/** Make a lit three material (Lambert/Phong/Standard/Physical) receive the fx lights. */
export function injectFxLights(material) {
  if (!material || material.userData.fxLights) return material;
  if (!(material.isMeshStandardMaterial || material.isMeshLambertMaterial || material.isMeshPhongMaterial)) return material;
  material.userData.fxLights = true; patched.add(material);
  addShaderHook(material, 'fxl', (shader) => {
    shader.defines = shader.defines || {}; shader.defines.FX_MAX_LIGHTS = maxLights;
    Object.assign(shader.uniforms, fxLightUniforms);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <lights_pars_begin>', '#include <lights_pars_begin>\n' + FRAG_DECL)
      .replace('#include <lights_fragment_end>', FRAG_LOOP + '\n#include <lights_fragment_end>');
  }, () => maxLights);
  return material;
}
export function forgetFxLights(material) { patched.delete(material); }

/**
 * CPU light registry. add() returns a handle you can mutate (pos/dir/color/intensity/enabled).
 * Each frame select() uploads the most relevant lights (closest to the focus point, weighted by
 * intensity), fading lights in/out near the selection boundary to avoid popping.
 */
export class FxLightSet {
  constructor() { this.lights = []; this._view = new THREE.Matrix3(); this._tmp = new THREE.Vector3(); this.scoreBuf = []; }
  /**
   * @param {object} o { pos: Vector3 (world), dir?: Vector3 (world, unit; default down), color: Color|hex,
   *   intensity, range (m), angle? (outer half-angle rad, default PI = omni), penumbra? 0..1, decay?, priority? }
   */
  add(o) {
    const L = {
      pos: o.pos ? o.pos.clone() : new THREE.Vector3(), dir: (o.dir ? o.dir.clone() : new THREE.Vector3(0, -1, 0)).normalize(),
      color: new THREE.Color(o.color ?? 0xffffff), intensity: o.intensity ?? 10, range: o.range ?? 20,
      angle: o.angle ?? Math.PI, penumbra: o.penumbra ?? 0.4, decay: o.decay ?? 1.6, priority: o.priority ?? 1,
      enabled: true, group: o.group || null, fade: 0,
    };
    this.lights.push(L); return L;
  }
  remove(L) { const i = this.lights.indexOf(L); if (i >= 0) this.lights.splice(i, 1); }
  removeGroup(g) { this.lights = this.lights.filter((L) => L.group !== g); }
  clear() { this.lights.length = 0; }

  /** @param {THREE.Camera} camera @param {THREE.Vector3} focus point of interest (e.g. ahead of the camera) */
  select(camera, focus, dt = 1 / 60) {
    const U = fxLightUniforms; const n = Math.min(maxLights, FX_LIGHT_CAP);
    const cand = this.scoreBuf; cand.length = 0;
    const cp = camera.position;
    for (const L of this.lights) {
      if (!L.enabled || L.intensity <= 0) { L.fade = 0; continue; }
      const d2 = L.pos.distanceToSquared(focus); const dc2 = L.pos.distanceToSquared(cp);
      L._score = Math.min(d2, dc2 * 1.5) / (L.priority * L.priority);
      cand.push(L);
    }
    // partial selection sort of the best n (n is small)
    const k = Math.min(n, cand.length);
    for (let i = 0; i < k; i++) {
      let best = i; for (let j = i + 1; j < cand.length; j++) if (cand[j]._score < cand[best]._score) best = j;
      if (best !== i) { const t = cand[i]; cand[i] = cand[best]; cand[best] = t; }
    }
    // the (k+1)th score defines the boundary; lights near it fade out
    const edge = cand.length > k ? cand[k]._score : Infinity;
    const vm = camera.matrixWorldInverse; this._view.setFromMatrix4(vm);
    let c = 0;
    for (let i = 0; i < k; i++) {
      const L = cand[i];
      let w = 1;
      if (edge !== Infinity) { const r = Math.sqrt(L._score / edge); w = Math.min(1, Math.max(0, (1 - r) / 0.25)); }
      L.fade += (w - L.fade) * Math.min(1, dt * 8); if (L.fade < 0.01 && w === 0) continue;
      U.fxLightPos.value[c].copy(L.pos).applyMatrix4(vm);
      U.fxLightDir.value[c].copy(L.dir).applyMatrix3(this._view).normalize();
      const I = L.intensity * Math.max(L.fade, w > 0.99 ? 1 : L.fade);
      U.fxLightColor.value[c].set(L.color.r * I, L.color.g * I, L.color.b * I);
      const outer = Math.cos(Math.min(Math.PI, L.angle)); const inner = Math.cos(Math.min(Math.PI, L.angle) * (1 - L.penumbra));
      U.fxLightParams.value[c].set(L.range, L.angle >= Math.PI ? -2 : outer, L.angle >= Math.PI ? -1 : inner, L.decay);
      c++;
    }
    U.fxLightCount.value = c;
    return c;
  }
}
