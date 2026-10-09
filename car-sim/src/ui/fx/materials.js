// Material upgrades for cars and track, plus the potato-tier Lambert/Phong downgrade.
// Works on E's existing meshes in place: materials E keeps references to (paint, tail lights,
// brake discs) are modified, never replaced, so E's per-frame updates keep working.
import * as THREE from 'three';
import { addShaderHook, injectFxLights } from './lights.js';
import { asphaltSet, puddleTexture } from './textures.js';

/** Shared uniforms all upgraded track materials read (wetness, time, futuristic tint). */
export const trackUniforms = {
  fxWet: { value: 0 }, fxTime: { value: 0 }, fxPuddle: { value: null },
  fxKerbTint: { value: new THREE.Color(1, 0, 0) }, fxKerbMix: { value: 0 }, fxKerbGlow: { value: 0 },
  fxLineColor: { value: new THREE.Color(0xf2f2ea) }, fxLineGlow: { value: 0 }, fxRubber: { value: 1 },
  fxCentreLine: { value: 0 },
};

const HASH = /* glsl */`
float fxHash13( vec3 p3 ) { p3 = fract( p3 * 0.1031 ); p3 += dot( p3, p3.zyx + 31.32 ); return fract( ( p3.x + p3.y ) * p3.z ); }
`;

// --------------------------------------------------------------------------------- car paint
export const PAINTS = {
  solid: { metalness: 0.0, roughness: 0.38, clearcoat: 1, clearcoatRoughness: 0.03, flake: 0, flop: 0.1 },
  metallic: { metalness: 0.75, roughness: 0.34, clearcoat: 1, clearcoatRoughness: 0.025, flake: 1, flop: 0.45 },
  pearl: { metalness: 0.35, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.025, flake: 0.6, flop: 0.3, iridescence: 0.75 },
  candy: { metalness: 0.9, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.02, flake: 0.8, flop: 0.75, candy: true },
  matte: { metalness: 0.25, roughness: 0.62, clearcoat: 0, clearcoatRoughness: 0.5, flake: 0, flop: 0.15 },
  chrome: { metalness: 1.0, roughness: 0.05, clearcoat: 0.6, clearcoatRoughness: 0.02, flake: 0, flop: 0.05, chrome: true },
};

function upgradePaint(mat, paint, q) {
  const P = PAINTS[paint] || PAINTS.metallic;
  if (!mat.userData.fxBaseColor) mat.userData.fxBaseColor = mat.color.clone();
  const base = mat.userData.fxBaseColor;
  mat.color.copy(base);
  if (P.chrome) mat.color.lerp(new THREE.Color(1, 1, 1), 0.55);
  if (P.candy) { const hsl = {}; mat.color.getHSL(hsl); mat.color.setHSL(hsl.h, Math.min(1, hsl.s * 1.2 + 0.1), hsl.l * 0.8); }
  mat.metalness = P.metalness; mat.roughness = P.roughness;
  if (mat.isMeshPhysicalMaterial) {
    mat.clearcoat = P.clearcoat; mat.clearcoatRoughness = P.clearcoatRoughness;
    mat.iridescence = P.iridescence || 0; mat.iridescenceIOR = 1.5; mat.iridescenceThicknessRange = [180, 520];
    mat.specularIntensity = 1; mat.envMapIntensity = 1.15;
  }
  const flakes = q.flakes ? P.flake : 0;
  mat.userData.fxFlake = { value: flakes }; mat.userData.fxFlop = { value: P.flop }; mat.userData.fxCandy = { value: P.candy ? 1 : 0 };
  addShaderHook(mat, 'paint', (shader) => {
    shader.uniforms.fxFlake = mat.userData.fxFlake; shader.uniforms.fxFlop = mat.userData.fxFlop; shader.uniforms.fxCandy = mat.userData.fxCandy;
    shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vFxObj;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvFxObj = position;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vFxObj; uniform float fxFlake, fxFlop, fxCandy;' + HASH)
      .replace('#include <normal_fragment_maps>', /* glsl */`#include <normal_fragment_maps>
        if ( fxFlake > 0.0 ) {
          vec3 fp = vFxObj * 420.0; vec3 cell = floor( fp );
          vec3 rnd = vec3( fxHash13( cell ), fxHash13( cell + 17.17 ), fxHash13( cell + 41.3 ) ) * 2.0 - 1.0;
          float fade = 1.0 - smoothstep( 0.35, 1.2, length( fwidth( fp ) ) );
          normal = normalize( normal + rnd * 0.22 * fxFlake * fade );
        }`)
      .replace('#include <lights_physical_fragment>', /* glsl */`
        {
          float facing = saturate( dot( normal, normalize( vViewPosition ) ) );
          vec3 deep = diffuseColor.rgb * diffuseColor.rgb * 1.4;
          diffuseColor.rgb = mix( mix( diffuseColor.rgb * ( 1.0 - fxFlop * 0.6 ), deep, fxCandy ), diffuseColor.rgb, pow( facing, 0.6 ) );
        }
        #include <lights_physical_fragment>`);
  }, () => (flakes > 0 ? 'f' : 'n'));
  mat.userData.fxReflect = P.clearcoat > 0 ? 0.55 : P.chrome ? 0.9 : 0.15;
  mat.needsUpdate = true;
}

/** Multiply emissive output by a uniform (HDR boost for bloom without touching E's emissiveIntensity). */
function emissiveBoost(mat, k) {
  if (!mat.userData.fxEmBoost) mat.userData.fxEmBoost = { value: k }; else mat.userData.fxEmBoost.value = k;
  addShaderHook(mat, 'emboost', (shader) => {
    shader.uniforms.fxEmBoost = mat.userData.fxEmBoost;
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nuniform float fxEmBoost;')
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance *= fxEmBoost;');
  });
}

/** Classify E's car materials by their properties (no hard dependency on carModel.js internals). */
export function classifyCarMaterial(m, mesh) {
  if (!m) return 'other';
  if (m.isMeshBasicMaterial) return m.blending === THREE.AdditiveBlending ? 'flame' : 'basic';
  const em = m.emissive; const e = em ? em.r + em.g + em.b : 0;
  if (m.isMeshPhysicalMaterial && m.transparent && m.opacity < 0.9 && !m.userData.fxPaint) return 'glass';
  if (m.userData.fxPaint || (m.isMeshPhysicalMaterial && m.clearcoat > 0.5 && !m.transparent)) return 'paint';
  if (e > 0 && em.r > 0.9 && em.g < 0.2 && em.b < 0.2) return 'tail';
  if (e > 2.4 && em.b > 0.9) return 'headlight';
  if (e > 0 && em.r > 0.9 && em.g > 0.4 && em.b < 0.2) return 'indicator';
  if (m.map && m.roughness > 0.85 && m.metalness === 0) return 'tyre';
  if (m.metalness >= 0.99) return 'chrome';
  if (m.metalness >= 0.85 && m.color.r > 0.4) return 'rim';
  if (m.metalness >= 0.8 && m.color.r < 0.1) return 'rimDark';
  if (m.metalness >= 0.75 && Math.abs(m.color.r - m.color.b) < 0.05 && m.roughness > 0.4 && mesh && mesh.geometry && mesh.geometry.type === 'CylinderGeometry') return 'disc';
  if (m.color && m.color.r > 0.5 && m.color.g < 0.15 && m.metalness < 0.5) return 'caliper';
  if (m.roughness > 0.5 && m.color.r < 0.08) return 'trim';
  return 'other';
}

/**
 * Upgrade a car (E's CarView.group or any Group) in place.
 * @param {THREE.Object3D} carGroup
 * @param {object} opts { paint: 'solid'|'metallic'|'pearl'|'candy'|'matte'|'chrome', quality (settings object) }
 * @returns {{ paint, tail:[], headlight:[], discs:[], exhausts:[{mesh, radius}], glass }} parts found
 */
export function upgradeCarMaterials(carGroup, opts = {}) {
  const q = opts.quality || { flakes: true, transmission: false };
  const found = { paint: null, tail: [], headlight: [], discs: [], exhausts: [], glass: null, meshes: [] };
  const seen = new Set();
  carGroup.traverse((o) => {
    if (!o.isMesh) return;
    o.userData.fxDynamic = true; found.meshes.push(o);
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of mats) {
      const kind = classifyCarMaterial(m, o);
      if (kind === 'chrome' && o.geometry && o.geometry.type === 'CylinderGeometry' && o.geometry.parameters.openEnded) found.exhausts.push({ mesh: o, radius: o.geometry.parameters.radiusTop });
      if (kind === 'tail') found.tail.push(o);
      if (kind === 'headlight') found.headlight.push(o);
      if (seen.has(m)) continue; seen.add(m);
      switch (kind) {
        case 'paint': m.userData.fxPaint = true; found.paint = m; upgradePaint(m, opts.paint || m.userData.fxPaintKind || 'metallic', q); m.userData.fxPaintKind = opts.paint || m.userData.fxPaintKind || 'metallic'; injectFxLights(m); break;
        case 'glass':
          found.glass = m; if (m.userData.fxUp) break; m.userData.fxUp = true;
          m.color.set(0x0b1016); m.roughness = 0.02; m.metalness = 0; m.clearcoat = 1; m.clearcoatRoughness = 0.0; m.envMapIntensity = 1.6; m.specularIntensity = 1;
          if (q.transmission) { m.transmission = 0.9; m.thickness = 0.02; m.ior = 1.5; m.color.set(0x1a2836); m.opacity = 1; m.transparent = false; m.depthWrite = true; }
          else { m.opacity = 0.7; }
          m.userData.fxReflect = 0.6; injectFxLights(m); break;
        case 'tail': emissiveBoost(m, 3.2); m.userData.fxReflect = 0.3; break;
        case 'headlight': emissiveBoost(m, 2); m.roughness = 0.05; break;
        case 'indicator': emissiveBoost(m, 3); break;
        case 'disc': emissiveBoost(m, 5); m.roughness = 0.38; m.metalness = 0.9; found.discs.push(m); injectFxLights(m); break;
        case 'rim': if (!m.userData.fxUp) { m.userData.fxUp = true; m.color.set(0xd6dae0); m.roughness = 0.16; m.metalness = 1; m.envMapIntensity = 1.3; m.userData.fxReflect = 0.5; injectFxLights(m); } break;
        case 'rimDark': if (!m.userData.fxUp) { m.userData.fxUp = true; m.color.set(0x24272d); m.roughness = 0.2; m.metalness = 1; m.envMapIntensity = 1.3; m.userData.fxReflect = 0.35; injectFxLights(m); } break;
        case 'chrome': if (!m.userData.fxUp) { m.userData.fxUp = true; m.roughness = 0.04; m.color.set(0xf0f0f0); m.envMapIntensity = 1.4; m.userData.fxReflect = 0.9; injectFxLights(m); } break;
        case 'tyre': if (!m.userData.fxUp) { m.userData.fxUp = true; m.roughness = 0.82; m.color.set(0xcfcfcf); injectFxLights(m); } break;
        case 'trim': if (!m.userData.fxUp) { m.userData.fxUp = true; m.roughness = 0.42; injectFxLights(m); } break;
        default: if (m.isMeshStandardMaterial) injectFxLights(m);
      }
    }
  });
  return found;
}

/** Change paint type on an already-upgraded car. */
export function setCarPaint(carGroup, paint, quality) {
  carGroup.traverse((o) => { if (o.isMesh && o.material && o.material.userData && o.material.userData.fxPaint) { o.material.userData.fxPaintKind = paint; upgradePaint(o.material, paint, quality || { flakes: true }); } });
}

// --------------------------------------------------------------------------------- track
const ROAD_FRAG_PARS = /* glsl */`
varying vec2 vFxUv; varying vec3 vFxWorld; varying vec3 vFxRoad;
uniform float fxWet, fxTime, fxLineGlow, fxRubber, fxCentreLine; uniform vec3 fxLineColor; uniform sampler2D fxPuddle;
float fxPud;
`;

function roadHook(mat, hasRoadAttr) {
  addShaderHook(mat, 'road', (shader) => {
    Object.assign(shader.uniforms, trackUniforms);
    shader.defines = shader.defines || {}; if (hasRoadAttr) shader.defines.FX_ROAD_ATTR = 1;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vFxUv; varying vec3 vFxWorld; varying vec3 vFxRoad;\n#ifdef FX_ROAD_ATTR\nattribute vec3 fxRoad;\n#endif')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vFxUv = uv; vFxWorld = ( modelMatrix * vec4( position, 1.0 ) ).xyz;
        #ifdef FX_ROAD_ATTR
          vFxRoad = fxRoad;
        #else
          vFxRoad = vec3( uv.x * 12.0, 12.0, abs( uv.x - 0.5 ) * 12.0 );
        #endif`);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\n' + ROAD_FRAG_PARS)
      .replace('#include <map_fragment>', /* glsl */`#include <map_fragment>
        {
          float across = vFxRoad.x; float width = vFxRoad.y;
          float de = min( across, width - across );
          float fw = max( fwidth( across ), 1e-3 );
          float ln = smoothstep( 0.18 - fw, 0.18 + fw, de ) * ( 1.0 - smoothstep( 0.36 - fw, 0.36 + fw, de ) );
          float cl = 0.0;
          if ( fxCentreLine > 0.0 ) {
            float dc = abs( across - width * 0.5 );
            float dash = step( 0.45, fract( vFxUv.y * 12.0 / 9.0 ) );
            cl = ( 1.0 - smoothstep( 0.07 - fw, 0.07 + fw, dc ) ) * dash * fxCentreLine;
          }
          float rubber = exp( - vFxRoad.z * vFxRoad.z / 1.6 ) * fxRubber;
          float wear = 0.5 + 0.5 * sin( vFxWorld.x * 0.11 + sin( vFxWorld.z * 0.07 ) * 2.0 );
          diffuseColor.rgb *= 1.0 - rubber * ( 0.32 + 0.12 * wear );
          float paint = max( ln, cl );
          diffuseColor.rgb = mix( diffuseColor.rgb, fxLineColor * ( 0.85 + 0.15 * wear ), paint * 0.94 );
          fxPud = fxWet > 0.0 ? smoothstep( 0.35, 0.75, texture2D( fxPuddle, vFxWorld.xz / 18.0 ).r + ( 1.0 - fxWet ) * -0.4 ) : 0.0;
          diffuseColor.rgb *= mix( 1.0, mix( 0.62, 0.45, fxPud ), fxWet );
          vFxRoadPaint = paint; vFxRubber = rubber;
        }`)
      .replace('#include <roughnessmap_fragment>', /* glsl */`#include <roughnessmap_fragment>
        roughnessFactor = mix( roughnessFactor, roughnessFactor * 0.72, vFxRubber );
        roughnessFactor = mix( roughnessFactor, 0.45, vFxRoadPaint * 0.7 );
        roughnessFactor = mix( roughnessFactor, mix( roughnessFactor * 0.55, 0.06, fxPud ), fxWet );`)
      .replace('#include <normal_fragment_maps>', /* glsl */`#include <normal_fragment_maps>
        normal = normalize( mix( normal, normalize( vNormal ) * faceDirection, max( fxPud * fxWet, vFxRoadPaint * 0.6 ) ) );`)
      .replace('#include <lights_physical_fragment>', /* glsl */`#include <lights_physical_fragment>
        #ifdef USE_CLEARCOAT
          material.clearcoat = fxWet * mix( 0.55, 1.0, fxPud );
          material.clearcoatRoughness = mix( 0.2, 0.0525, fxPud );
        #endif`)
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += fxLineColor * vFxRoadPaint * fxLineGlow;');
    // these are written in map_fragment (declared as globals so later chunks can read them)
    shader.fragmentShader = shader.fragmentShader.replace('float fxPud;', 'float fxPud; float vFxRoadPaint; float vFxRubber;');
  }, () => (hasRoadAttr ? 'a' : 'u'));
}

function wetGenericHook(mat) {
  addShaderHook(mat, 'wet', (shader) => {
    shader.uniforms.fxWet = trackUniforms.fxWet;
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nuniform float fxWet;')
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor *= mix( 1.0, 0.55, fxWet );\ndiffuseColor.rgb *= mix( 1.0, 0.72, fxWet );');
  });
}

function kerbHook(mat) {
  addShaderHook(mat, 'kerb', (shader) => {
    Object.assign(shader.uniforms, { fxKerbTint: trackUniforms.fxKerbTint, fxKerbMix: trackUniforms.fxKerbMix, fxKerbGlow: trackUniforms.fxKerbGlow, fxWet: trackUniforms.fxWet });
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 fxKerbTint; uniform float fxKerbMix, fxKerbGlow, fxWet; float fxRed;')
      .replace('#include <map_fragment>', `#include <map_fragment>
        fxRed = clamp( ( diffuseColor.r - diffuseColor.g ) * 2.5, 0.0, 1.0 );
        diffuseColor.rgb = mix( diffuseColor.rgb, fxKerbTint * ( 0.6 + 0.4 * diffuseColor.r ), fxRed * fxKerbMix );
        diffuseColor.rgb *= mix( 1.0, 0.75, fxWet );`)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor *= mix( 1.0, 0.4, fxWet );')
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += fxKerbTint * fxRed * fxKerbGlow;');
  });
}

/**
 * Upgrade E's track group (names from trackMesh.js: road, kerbs, runoff, terrain, scenery).
 * @param {THREE.Group} trackGroup
 * @param {object} env resolved environment def (needs .wet, .edgeStrips) or {}
 * @param {object} opts { track (sim track, enables per-vertex racing line), quality, racingLine (offset array) }
 */
export function upgradeTrackMaterials(trackGroup, env = {}, opts = {}) {
  const q = opts.quality || {};
  if (!trackUniforms.fxPuddle.value) trackUniforms.fxPuddle.value = puddleTexture();
  const done = trackGroup.userData.fxTrack;
  if (!done) {
    trackGroup.userData.fxTrack = { orig: new Map() };
    trackGroup.traverse((o) => {
      if (!o.isMesh || !o.material) return;
      const m = o.material;
      if (o.name === 'road') {
        const set = asphaltSet(q.anisotropy >= 8 ? 1024 : 512);
        const width = opts.track ? opts.track.width || 12 : 12;
        const mk = (t) => { const c = t.clone(); c.needsUpdate = true; c.repeat.set(width / 3.2, 12 / 3.2); c.anisotropy = q.anisotropy || 4; return c; };
        const road = new THREE.MeshPhysicalMaterial({
          color: 0x4a4c51, map: mk(set.map), normalMap: mk(set.normalMap), normalScale: new THREE.Vector2(0.55, 0.55),
          roughnessMap: mk(set.roughnessMap), roughness: 1, metalness: 0, clearcoat: 0, specularIntensity: 0.6,
          polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
        });
        const hasAttr = addRoadAttribute(o.geometry, opts.track, opts.racingLine);
        roadHook(road, hasAttr); injectFxLights(road);
        trackGroup.userData.fxTrack.orig.set(o, m); o.material = road; o.userData.fxRoad = true; o.userData.fxReflect = 0.15;
        trackGroup.userData.fxTrack.road = road;
      } else if (o.name === 'kerbs') {
        const k = new THREE.MeshPhysicalMaterial({ map: m.map, roughness: 0.42, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.2, side: m.side, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
        kerbHook(k); injectFxLights(k); trackGroup.userData.fxTrack.orig.set(o, m); o.material = k; o.userData.fxReflect = 0.12;
      } else if (m.isMeshStandardMaterial) {
        if (!m.userData.fxUp) { m.userData.fxUp = true; if (o.name === 'runoff' || o.name === 'terrain') wetGenericHook(m); injectFxLights(m); }
      }
    });
  }
  applyTrackEnv(trackGroup, env);
  return trackGroup.userData.fxTrack;
}

/** Update shared track uniforms + clearcoat switch for an environment. */
export function applyTrackEnv(trackGroup, env = {}) {
  const wet = +env.wet || 0; const fut = !!env.edgeStrips;
  trackUniforms.fxWet.value = wet;
  trackUniforms.fxKerbMix.value = fut ? 1 : 0; trackUniforms.fxKerbTint.value.set(fut ? 0xc01ab0 : 0xd02020); trackUniforms.fxKerbGlow.value = fut ? 0.6 : 0;
  trackUniforms.fxLineColor.value.set(fut ? 0x6af0ff : 0xf0f0e8); trackUniforms.fxLineGlow.value = fut ? 2.5 : 0;
  trackUniforms.fxCentreLine.value = fut ? 1 : 0;
  const t = trackGroup && trackGroup.userData.fxTrack;
  if (t && t.road) {
    const cc = wet > 0 ? 1 : 0; if (t.road.clearcoat !== cc) { t.road.clearcoat = cc; t.road.needsUpdate = true; }
    t.road.color.set(fut ? 0x2a2c34 : 0x4a4c51);
    t.road.roughness = fut ? 0.7 : 1;
  }
  trackGroup && trackGroup.traverse((o) => { if (o.userData.fxRoad) o.userData.fxReflect = wet > 0 ? 0.9 : fut ? 0.35 : 0.15; });
}

/** Per-vertex (metres from right edge, width, |distance to racing line|) for E's road ribbon. */
function addRoadAttribute(geo, track, lineOffsets) {
  if (!track || !geo.attributes.uv) return false;
  try {
    const S = track.samples; const n = S.n; const uv = geo.attributes.uv; const out = new Float32Array(uv.count * 3);
    const off = lineOffsets || null;
    for (let v = 0; v < uv.count; v++) {
      const u = uv.getX(v); const r = Math.round(uv.getY(v) * 12 / S.ds); const i = ((r % n) + n) % n;
      const wl = S.widthL[i], wr = S.widthR[i]; const across = (wl + wr) * u; const o = -wr + across;
      out[v * 3] = across; out[v * 3 + 1] = wl + wr; out[v * 3 + 2] = off ? Math.abs(o - off[i]) : Math.abs(o) + 0.5;
    }
    geo.setAttribute('fxRoad', new THREE.BufferAttribute(out, 3));
    return true;
  } catch (e) { console.warn('[fx] road attribute failed', e); return false; }
}

/** Restore E's original track materials. */
export function restoreTrackMaterials(trackGroup) {
  const t = trackGroup && trackGroup.userData.fxTrack; if (!t) return;
  for (const [o, m] of t.orig) { o.material.dispose(); o.material = m; }
  delete trackGroup.userData.fxTrack;
}

// --------------------------------------------------------------------------------- potato downgrade
const cheap = new WeakMap();
/**
 * Swap Standard/Physical materials for Lambert (Phong for paint/chrome) under `root`. Reversible.
 * @param {THREE.Object3D} root @param {boolean} on @param {THREE.Texture} envCube small cube map for Phong reflections
 */
export function setCheapMaterials(root, on, envCube) {
  root.traverse((o) => {
    if (!o.isMesh || !o.material || Array.isArray(o.material)) return;
    if (on) {
      const m = o.material; if (!m.isMeshStandardMaterial) return;
      let c = cheap.get(m);
      if (!c) {
        const shiny = m.userData.fxPaint || m.metalness > 0.85 || (m.isMeshPhysicalMaterial && m.transparent);
        const P = shiny ? THREE.MeshPhongMaterial : THREE.MeshLambertMaterial;
        c = new P({ color: m.color, map: m.map, emissive: m.emissive, emissiveMap: m.emissiveMap, emissiveIntensity: m.emissiveIntensity,
          vertexColors: m.vertexColors, transparent: m.transparent, opacity: m.opacity, side: m.side, alphaTest: m.alphaTest, depthWrite: m.depthWrite,
          polygonOffset: m.polygonOffset, polygonOffsetFactor: m.polygonOffsetFactor, polygonOffsetUnits: m.polygonOffsetUnits, flatShading: m.flatShading });
        if (shiny) { c.shininess = m.userData.fxPaint ? 90 : 60; c.specular = new THREE.Color(m.userData.fxPaint ? 0x666666 : 0x999999); if (envCube) { c.envMap = envCube; c.reflectivity = m.userData.fxPaint ? 0.22 : 0.6; c.combine = THREE.MixOperation; } }
        if (m.userData.fxEmBoost) { c.userData.fxEmBoost = m.userData.fxEmBoost; emissiveBoost(c, m.userData.fxEmBoost.value); }
        c.userData.fxSrc = m; cheap.set(m, c);
        if (m.userData.fxLights) injectFxLights(c);
      } else if (envCube && c.envMap !== envCube && c.isMeshPhongMaterial) { c.envMap = envCube; c.needsUpdate = true; }
      o.userData.fxOrigMat = m; o.material = c;
    } else if (o.userData.fxOrigMat) { o.material = o.userData.fxOrigMat; delete o.userData.fxOrigMat; }
  });
}

/** Copy E's per-frame material changes (brake glow, brake lights, opacity) onto the cheap copies. */
export function syncCheapMaterials(root) {
  root.traverse((o) => {
    const c = o.material; if (!o.isMesh || !c || !c.userData || !c.userData.fxSrc) return;
    const m = c.userData.fxSrc; c.emissive.copy(m.emissive); c.emissiveIntensity = m.emissiveIntensity; c.opacity = m.opacity; c.color.copy(m.color);
  });
}
