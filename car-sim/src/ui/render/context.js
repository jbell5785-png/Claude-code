// Render integration point for the visuals engineer (src/ui/fx/**) and anything else that needs
// the live three.js objects. World fills these fields; fx modules register hooks.
//
//   import { renderContext as rc, onFrame, setRenderFunction, onTrackBuilt, onCarAdded } from '../render/context.js';
//   rc.renderer (THREE.WebGLRenderer), rc.scene (outdoor scene), rc.studioScene (garage/menu scene),
//   rc.camera (active PerspectiveCamera), rc.activeScene ('track' | 'studio'), rc.world (World),
//   rc.cars (Set<CarView>; cv.model.root / cv.model.paint / cv.model.wheels...), rc.trackGroup,
//   rc.sun (DirectionalLight), rc.hemi (HemisphereLight), rc.sky (Sky), rc.quality ('low'|'high'|...)
//   onFrame((dt, rc) => ...)            called every frame before rendering
//   setRenderFunction((scene, camera, dt) => composer.render(dt))   replaces renderer.render (null = default)
//   onTrackBuilt((group, track) => ...)  after a track scene is (re)built
//   onCarAdded((cv) => ...) / onCarRemoved((cv) => ...)
//   onResize((w, h) => ...)
// If src/ui/fx/index.js exists and exports `installFx(rc)`, main.js calls it once at start-up.

export const renderContext = {
  renderer: null, scene: null, studioScene: null, camera: null, activeScene: 'track', world: null,
  cars: null, trackGroup: null, track: null, sun: null, hemi: null, sky: null, quality: 'high',
  hooks: { frame: new Set(), track: new Set(), carAdded: new Set(), carRemoved: new Set(), resize: new Set() },
  renderFn: null,
};
const add = (set, fn) => { set.add(fn); return () => set.delete(fn); };
export const onFrame = (fn) => add(renderContext.hooks.frame, fn);
export const onTrackBuilt = (fn) => add(renderContext.hooks.track, fn);
export const onCarAdded = (fn) => add(renderContext.hooks.carAdded, fn);
export const onCarRemoved = (fn) => add(renderContext.hooks.carRemoved, fn);
export const onResize = (fn) => add(renderContext.hooks.resize, fn);
export function setRenderFunction(fn) { renderContext.renderFn = fn || null; }
export function emit(name, ...args) { for (const f of renderContext.hooks[name]) { try { f(...args); } catch (err) { console.error(`[render hook ${name}]`, err); } } }
