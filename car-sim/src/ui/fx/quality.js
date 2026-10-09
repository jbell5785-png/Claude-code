// Quality tiers, auto-detection and dynamic resolution / effect shedding.
// Tiny on purpose (no three.js passes): E can import this eagerly, decide the tier, and only then
// lazy-load the heavy post-processing (`post.js`) for tiers that use it.

/** Ordered from cheapest to most expensive. */
export const QUALITY_LEVELS = ['potato', 'low', 'medium', 'high', 'ultra'];

/**
 * Per-tier settings. `renderScale` multiplies the (capped) device pixel ratio; the dynamic
 * resolution controller moves it between `minScale` and `renderScale`.
 */
export const QUALITY = {
  potato: {
    maxDpr: 1, renderScale: 0.5, minScale: 0.4, post: false,
    shadows: false, shadowSize: 0, shadowSoft: false, shadowExtent: 0, blobShadows: true,
    materials: 'lambert', pmrem: false, flakes: false, transmission: false, anisotropy: 1,
    lights: 4, bloom: 0, ao: 0, ssr: 0, motionBlur: 'none', aa: 'none', msaa: 0,
    grain: false, ca: false, lensDirt: false, softParticles: false, cones: false, probe: false,
    particles: 0.25, rain: 500, speedLines: 0, sparks: 60, dressing: 0.35, skyline: false,
  },
  low: {
    maxDpr: 1.5, renderScale: 0.75, minScale: 0.5, post: true,
    shadows: true, shadowSize: 1024, shadowSoft: false, shadowExtent: 30, blobShadows: true,
    materials: 'standard', pmrem: true, flakes: false, transmission: false, anisotropy: 2,
    lights: 6, bloom: 0.25, ao: 0, ssr: 0, motionBlur: 'radial', aa: 'none', msaa: 0,
    grain: false, ca: false, lensDirt: false, softParticles: false, cones: false, probe: false,
    particles: 0.45, rain: 1500, speedLines: 60, sparks: 150, dressing: 0.6, skyline: true,
  },
  medium: {
    maxDpr: 1.5, renderScale: 1, minScale: 0.6, post: true,
    shadows: true, shadowSize: 2048, shadowSoft: true, shadowExtent: 36, blobShadows: false,
    materials: 'physical', pmrem: true, flakes: true, transmission: false, anisotropy: 4,
    lights: 10, bloom: 0.5, ao: 0, ssr: 0, motionBlur: 'radial', aa: 'fxaa', msaa: 0,
    grain: true, ca: true, lensDirt: false, softParticles: false, cones: true, probe: false,
    particles: 0.7, rain: 3500, speedLines: 140, sparks: 300, dressing: 0.85, skyline: true,
  },
  high: {
    maxDpr: 2, renderScale: 1, minScale: 0.6, post: true,
    shadows: true, shadowSize: 2048, shadowSoft: true, shadowExtent: 42, blobShadows: false,
    materials: 'physical', pmrem: true, flakes: true, transmission: false, anisotropy: 8,
    lights: 16, bloom: 0.5, ao: 0.5, ssr: 0.5, ssrSteps: 28, motionBlur: 'depth', aa: 'smaa', msaa: 0,
    grain: true, ca: true, lensDirt: true, softParticles: true, cones: true, probe: false,
    particles: 1, rain: 6000, speedLines: 220, sparks: 500, dressing: 1, skyline: true,
  },
  ultra: {
    maxDpr: 2, renderScale: 1, minScale: 0.7, post: true,
    shadows: true, shadowSize: 4096, shadowSoft: true, shadowExtent: 52, blobShadows: false,
    materials: 'physical', pmrem: true, flakes: true, transmission: true, anisotropy: 16,
    lights: 24, bloom: 0.5, ao: 1, ssr: 1, ssrSteps: 56, motionBlur: 'depth', aa: 'smaa', msaa: 4,
    grain: true, ca: true, lensDirt: true, softParticles: true, cones: true, probe: true,
    particles: 1, rain: 10000, speedLines: 300, sparks: 800, dressing: 1, skyline: true,
  },
};

/**
 * Effects shed (in this order) when frame time stays over budget after the render scale has
 * reached its floor. Each entry: [key, value-when-shed]. Restored in reverse order.
 */
export const SHED_ORDER = [
  ['probe', false], ['msaa', 0], ['ssr', 0], ['ao', 0], ['lensDirt', false], ['softParticles', false],
  ['motionBlur', 'radial'], ['cones', false], ['aa', 'fxaa'], ['shadowSize', 1024], ['lights', 6],
  ['ca', false], ['grain', false], ['bloom', 0.25], ['shadowSoft', false], ['motionBlur', 'none'],
];

/** Settings object for a tier with optional overrides. */
export function qualitySettings(q, overrides) {
  const base = QUALITY[q] || QUALITY.medium;
  return Object.assign({ name: QUALITY[q] ? q : 'medium' }, base, overrides || {});
}

const LS_KEY = 'carsim.fx.quality';

/** Read the saved tier (or null). Never throws. */
export function savedQuality() {
  try { const q = localStorage.getItem(LS_KEY); return QUALITY[q] ? q : null; } catch { return null; }
}
export function saveQuality(q) { try { localStorage.setItem(LS_KEY, q); } catch { /* private mode */ } }

/** GPU renderer string ('' if unavailable). Works with a three WebGLRenderer or a raw GL context. */
export function gpuString(rendererOrGl) {
  try {
    const gl = rendererOrGl && rendererOrGl.getContext ? rendererOrGl.getContext() : rendererOrGl;
    if (!gl) return '';
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    return String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)) || '';
  } catch { return ''; }
}

/**
 * Heuristic first-run tier from the GPU string, device class and memory. Returns { quality, reason, gpu }.
 * Follow it with a short benchmark (see DynamicResolution) to refine.
 */
export function detectQuality(renderer) {
  const gpu = gpuString(renderer); const g = gpu.toLowerCase();
  const nav = typeof navigator !== 'undefined' ? navigator : {};
  const ua = (nav.userAgent || '').toLowerCase();
  const mem = nav.deviceMemory || 8; const cores = nav.hardwareConcurrency || 4;
  const coarse = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;
  const mobile = coarse || /android|iphone|ipad|mobile/.test(ua);
  const cros = /cros/.test(ua);
  let q = 'medium'; let reason = 'default';
  if (/swiftshader|llvmpipe|softpipe|software|basic render/.test(g)) { q = 'potato'; reason = 'software renderer'; }
  else if (mobile) {
    q = /apple gpu|adreno \(tm\) (7|8)\d\d|mali-g(7|9)\d|xclipse/.test(g) ? 'low' : 'potato'; reason = 'mobile';
  } else if (/rtx|radeon rx ?[6-9]\d\d\d|rx ?7\d\d\d|arc a7|apple m[2-9] (pro|max|ultra)/.test(g)) { q = 'ultra'; reason = 'high-end discrete GPU'; }
  else if (/gtx 1[06-9]|gtx 16|rx ?5[5-9]\d\d|rx ?5\d\d\b|radeon pro|apple m\d|quadro|geforce/.test(g)) { q = 'high'; reason = 'discrete GPU'; }
  else if (/iris xe|radeon(\(tm\))? graphics|vega|780m|680m|arc/.test(g)) { q = 'medium'; reason = 'modern integrated GPU'; }
  else if (/intel|uhd|hd graphics|mali|powervr|adreno/.test(g) || cros) { q = 'low'; reason = 'integrated GPU'; }
  if ((mem <= 4 || cores <= 2) && QUALITY_LEVELS.indexOf(q) > 1) { q = 'low'; reason += ', low memory/cores'; }
  if (cros && /intel|mali|powervr|adreno|uhd|hd graphics/.test(g)) { q = 'potato'; reason += ', chromebook'; }
  return { quality: q, reason, gpu };
}

/**
 * Dynamic resolution + effect shedding controller. Feed it frame times (ms); it calls
 * `apply.scale(s)` and `apply.shed(level)` (0 = nothing shed). Hysteresis avoids oscillation.
 */
export class DynamicResolution {
  constructor({ targetFps = 60, minScale = 0.5, maxScale = 1, apply, maxShed = SHED_ORDER.length } = {}) {
    this.targetMs = 1000 / targetFps; this.minScale = minScale; this.maxScale = maxScale; this.scale = maxScale;
    this.apply = apply || {}; this.maxShed = maxShed; this.shed = 0;
    this.avg = this.targetMs; this.timer = 0; this.over = 0; this.under = 0; this.enabled = true;
  }
  setTarget(fps) { this.targetMs = 1000 / fps; }
  reset(scale) { this.scale = scale ?? this.maxScale; this.avg = this.targetMs; this.over = this.under = 0; }
  /** @param {number} ms frame time (CPU+GPU wall clock between frames) */
  update(ms) {
    if (!this.enabled || !(ms > 0) || ms > 500) return;
    this.avg += (ms - this.avg) * 0.08; this.timer += ms;
    if (this.timer < 500) return; // decide twice per second
    this.timer = 0; const r = this.avg / this.targetMs;
    if (r > 1.08) {
      this.under = 0;
      if (this.scale > this.minScale + 1e-3) { this.scale = Math.max(this.minScale, this.scale * Math.max(0.8, 1 / Math.sqrt(r))); this.apply.scale && this.apply.scale(this.scale); }
      else if (++this.over >= 2 && this.shed < this.maxShed) { this.shed++; this.over = 0; this.apply.shed && this.apply.shed(this.shed); }
    } else if (r < 0.75) {
      this.over = 0;
      if (++this.under >= 3) {
        this.under = 0;
        if (this.shed > 0) { this.shed--; this.apply.shed && this.apply.shed(this.shed); }
        else if (this.scale < this.maxScale - 1e-3) { this.scale = Math.min(this.maxScale, this.scale * 1.08); this.apply.scale && this.apply.scale(this.scale); }
      }
    } else { this.over = 0; this.under = 0; }
  }
}
