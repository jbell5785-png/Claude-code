// Quality presets (ARCHITECTURE §8): potato | low | medium | high | ultra.
// Auto-detected on first run from the GPU renderer string, refined by a short in-game benchmark,
// overridable in Options. Physics never changes with quality.
//
// Hook for visuals/fx code:  onQualityChange((q) => ...)  where q = { name, ...settings }  and getQuality().
import * as THREE from 'three';

export const QUALITY_ORDER = ['potato', 'low', 'medium', 'high', 'ultra'];
export const QUALITY_PRESETS = {
  potato: { label: 'Potato', renderScale: 0.5, minScale: 0.4, pixelRatioCap: 1, antialias: false, shadows: false, shadowMap: 0, materials: 'lambert', trees: 0.2, terrainGrid: 48, particles: 350, skids: 1200, aiDefault: 3, targetFps: 30, envMap: false, sky: false },
  low: { label: 'Low', renderScale: 0.75, minScale: 0.5, pixelRatioCap: 1, antialias: false, shadows: true, shadowMap: 1024, materials: 'standard', trees: 0.45, terrainGrid: 70, particles: 700, skids: 2500, aiDefault: 5, targetFps: 60, envMap: true, sky: true },
  medium: { label: 'Medium', renderScale: 1, minScale: 0.6, pixelRatioCap: 1.5, antialias: true, shadows: true, shadowMap: 2048, materials: 'standard', trees: 0.75, terrainGrid: 100, particles: 1200, skids: 4000, aiDefault: 7, targetFps: 60, envMap: true, sky: true },
  high: { label: 'High', renderScale: 1, minScale: 0.7, pixelRatioCap: 2, antialias: true, shadows: true, shadowMap: 2048, materials: 'physical', trees: 1, terrainGrid: 120, particles: 1800, skids: 6000, aiDefault: 7, targetFps: 60, envMap: true, sky: true },
  ultra: { label: 'Ultra', renderScale: 1, minScale: 0.8, pixelRatioCap: 2.5, antialias: true, shadows: true, shadowMap: 4096, materials: 'physical', trees: 1, terrainGrid: 160, particles: 2600, skids: 9000, aiDefault: 7, targetFps: 60, envMap: true, sky: true },
};
const KEY = 'carsim.quality.v1';
const listeners = new Set();
let current = null;

function gpuString() {
  try {
    const c = document.createElement('canvas'); const gl = c.getContext('webgl2') || c.getContext('webgl'); if (!gl) return { str: 'none', webgl2: false };
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const str = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    const webgl2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return { str: String(str || ''), webgl2 };
  } catch { return { str: 'unknown', webgl2: false }; }
}

/** Guess a preset from the GPU string and device hints. */
export function detectQuality() {
  const { str, webgl2 } = gpuString(); const s = str.toLowerCase();
  const mobile = matchMedia('(pointer: coarse)').matches; const mem = navigator.deviceMemory || 8; const cores = navigator.hardwareConcurrency || 4;
  let q = 'medium';
  if (!webgl2 || /swiftshader|llvmpipe|softpipe|software|microsoft basic/.test(s)) q = 'potato';
  else if (/rtx|radeon rx [67]\d{3}|rx 7\d{3}|rx 6[89]\d{2}|arc a7|apple m[234] (pro|max|ultra)/.test(s)) q = 'ultra';
  else if (/geforce|radeon|apple m\d|apple gpu|arc/.test(s) && !mobile) q = 'high';
  else if (/intel.*(hd|uhd)|mali|adreno [3-5]|powervr|mesa|vivante|videocore/.test(s)) q = 'low';
  else if (/iris|adreno [6-7]|apple/.test(s)) q = 'medium';
  if (mobile && QUALITY_ORDER.indexOf(q) > 2) q = 'medium';
  if ((mem <= 2 || cores <= 2) && QUALITY_ORDER.indexOf(q) > 1) q = 'low';
  return { name: q, gpu: str };
}

export function getQuality() {
  if (current) return current;
  const forced = new URLSearchParams(location.search).get('quality');
  let name = forced && QUALITY_PRESETS[forced] ? forced : null; let auto = false;
  if (!name) { try { const st = JSON.parse(localStorage.getItem(KEY) || 'null'); if (st && QUALITY_PRESETS[st.name]) { name = st.name; auto = !!st.auto; } } catch { /* ignore */ } }
  let gpu = '';
  if (!name) { const d = detectQuality(); name = d.name; gpu = d.gpu; auto = true; save(name, true); }
  current = { name, auto, gpu, ...QUALITY_PRESETS[name] };
  return current;
}
function save(name, auto) { try { localStorage.setItem(KEY, JSON.stringify({ name, auto })); } catch { /* ignore */ } }

export function setQuality(name, { auto = false, persist = true } = {}) {
  if (!QUALITY_PRESETS[name]) return current;
  current = { ...getQuality(), name, auto, ...QUALITY_PRESETS[name] };
  if (persist) save(name, auto);
  for (const f of listeners) { try { f(current); } catch (e) { console.error(e); } }
  return current;
}
export function onQualityChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

/** Replace PBR materials with Lambert equivalents (potato tier). */
export function downgradeMaterials(root) {
  const cache = new Map();
  root.traverse((o) => {
    if (!o.isMesh || !o.material) return;
    const conv = (m) => {
      if (!m || !(m.isMeshStandardMaterial || m.isMeshPhysicalMaterial)) return m;
      if (cache.has(m)) return cache.get(m);
      const l = new THREE.MeshLambertMaterial({ color: m.color, map: m.map, vertexColors: m.vertexColors, emissive: m.emissive, emissiveIntensity: m.emissiveIntensity,
        transparent: m.transparent, opacity: m.opacity, side: m.side, depthWrite: m.depthWrite, flatShading: m.flatShading,
        polygonOffset: m.polygonOffset, polygonOffsetFactor: m.polygonOffsetFactor, polygonOffsetUnits: m.polygonOffsetUnits });
      if (m.metalness > 0.6) l.color = m.color.clone().multiplyScalar(0.8);
      cache.set(m, l); return l;
    };
    o.material = Array.isArray(o.material) ? o.material.map(conv) : conv(o.material);
  });
}

/**
 * Dynamic resolution: call `tick(dt)` each frame; adjusts render scale between preset min and max
 * to hold the preset's target frame rate. Calls `apply(scale)` when it changes.
 */
export class DynamicResolution {
  constructor(apply) { this.apply = apply; this.scale = 1; this.t = 0; this.n = 0; this.sum = 0; this.enabled = true; this.warm = 1.5; this.history = []; }
  reset(scale) { this.scale = scale; this.t = 0; this.n = 0; this.sum = 0; this.warm = 1.5; this.apply(scale); }
  tick(dt, q) {
    if (!this.enabled || dt <= 0 || dt > 0.5) return;
    if (this.warm > 0) { this.warm -= dt; return; }
    this.t += dt; this.n++; this.sum += dt;
    if (this.t < 1) return;
    const avg = this.sum / this.n; this.t = 0; this.n = 0; this.sum = 0; this.history.push(avg); if (this.history.length > 10) this.history.shift();
    const target = 1 / q.targetFps;
    let s = this.scale;
    if (avg > target * 1.2) s = Math.max(q.minScale, s - (avg > target * 1.8 ? 0.15 : 0.07));
    else if (avg < target * 0.85) s = Math.min(q.renderScale, s + 0.04);
    if (Math.abs(s - this.scale) > 0.001) { this.scale = s; this.apply(s); }
  }
  get avgFrameMs() { const h = this.history; return h.length ? (h.reduce((a, b) => a + b, 0) / h.length) * 1000 : 0; }
}
