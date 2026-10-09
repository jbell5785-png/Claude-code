// Glue between the visuals layer (initFX) and the front-end's render hooks (render/context.js).
// main.js calls installFx(renderContext, { quality, onQualityChange }) once at start-up.
// Track scene only: the garage/menu studio keeps the front-end's own render path.
// Potato quality skips the FX layer entirely (cheapest path for weak laptops).

import { initFX } from './index.js';

export function installFx(rc, { quality = 'auto', onQualityChange } = {}) {
  let fx = null;
  let q = quality;
  const added = new Set();
  const preset = (() => { try { return localStorage.getItem('nv.fx.env') || 'night'; } catch { return 'night'; } })();

  const enabled = () => q !== 'potato';

  function ensure() {
    if (fx || !enabled() || !rc.renderer || !rc.scene || !rc.camera || !rc.track || !rc.trackGroup) return fx;
    fx = initFX({ renderer: rc.renderer, scene: rc.scene, camera: rc.camera, track: rc.track, trackGroup: rc.trackGroup,
      cars: [], preset, quality: q, autoScale: true, targetFps: 60 });
    return fx;
  }

  rc.hooks.track.add((group, track) => {
    if (fx) fx.setTrack(track, group);
    else ensure();
  });
  rc.hooks.carRemoved.add((cv) => {
    if (fx && added.has(cv)) { fx.removeCar(cv.group); added.delete(cv); }
  });
  rc.hooks.frame.add((dt) => {
    if (rc.activeScene !== 'track' || !ensure()) return;
    const vehicleOf = rc.vehicleOf || (() => null);
    for (const cv of rc.cars || []) {
      if (added.has(cv)) continue;
      const v = vehicleOf(cv);
      if (v) { fx.addCar(cv.group, v, { player: cv === rc.world?.focus }); added.add(cv); }
    }
    const focus = rc.world?.focus;
    const pv = focus ? vehicleOf(focus) : null;
    fx.update(dt, { playerVehicle: pv, speed: pv ? Math.abs(pv.speed) : 0 });
  });
  rc.renderFn = (scene, camera, dt) => {
    if (fx && rc.activeScene === 'track' && scene === rc.scene) fx.render(dt);
    else rc.renderer.render(scene, camera);
  };

  if (typeof onQualityChange === 'function') {
    try {
      onQualityChange((nq) => {
        q = nq?.name || nq;
        if (!enabled() && fx) { fx.dispose(); fx = null; added.clear(); }
        else if (fx) fx.setQuality(q);
      });
    } catch { /* optional */ }
  }

  return {
    get fx() { return fx; },
    setEnvironment(p) { try { localStorage.setItem('nv.fx.env', p); } catch { /* ignore */ } fx?.setEnvironment(p); },
  };
}
