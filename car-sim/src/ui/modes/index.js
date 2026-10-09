// Mode registry — the extension point for new screens (Garage, Drive, Race, and the AI
// training/watch modes added under src/ai/ by engineer F).
//
//   import { registerMode } from '../ui/modes/index.js';
//   registerMode({
//     id: 'ai-train', label: 'AI Lab', order: 40,
//     mount(ctx)       { /* build DOM in ctx.panel, create cars via ctx.world.addCar(params, { ghost: true }) */ },
//     update(ctx, dt)  { /* step sims (use ctx.stepper), sync car views: cv.sync(v, alpha); cv.update(dt, v) */ },
//     unmount(ctx)     { /* remove cars: ctx.world.removeCar(cv); ctx.panel is cleared automatically */ },
//     keys: { KeyV: (ctx) => ... },  // optional extra key bindings while the mode is active
//   });
//
// ctx (see main.js `makeContext`) exposes: sim (simapi: build, createVehicle, createTrack, createLapTimer,
// TRACKS, PRESETS, DT, catalog, engineCurve), world (World: addCar/removeCar/setFocus/setTrack/rig/scene/
// camera), hud, telemetry, input, audio, panel (HTMLElement for the mode's own UI), state ({ spec, params,
// trackKey }), getTrack(key) (cached, also sets the 3D scene), setTrackKey(key), stepper(), toast(msg),
// switchMode(id), driverApi() (async: src/ai/driver.js exports or null).
//
// Car views: world.addCar(params, { ghost: true, opacity: 0.35, lod: 'low', effects: false }) renders a
// transparent, low-poly car (cheap enough for dozens). Set `cv.vehicle = v` so the camera/effects can
// read its state, and world.setFocus(cv) to follow it with the camera.

const modes = new Map();
const listeners = new Set();

/**
 * Register (or replace) a mode.
 * @param {{id:string,label:string,order?:number,mount:Function,unmount?:Function,update?:Function,keys?:object,hidden?:boolean}} def
 */
export function registerMode(def) {
  if (!def || !def.id || typeof def.mount !== 'function') throw new Error('registerMode: id and mount() are required');
  modes.set(def.id, { order: 50, ...def });
  for (const f of listeners) f();
  return def;
}
export function unregisterMode(id) { modes.delete(id); for (const f of listeners) f(); }
export function getMode(id) { return modes.get(id); }
export function listModes() { return [...modes.values()].filter((m) => !m.hidden).sort((a, b) => a.order - b.order); }
export function onModesChanged(fn) { listeners.add(fn); return () => listeners.delete(fn); }

/**
 * Fixed-timestep accumulator with a wall-clock budget: if stepping can't keep up, simulated time
 * slows down instead of spiralling.
 */
export class FixedStepper {
  constructor(dt, { maxSteps = 60, budgetMs = 14 } = {}) { this.dt = dt; this.acc = 0; this.maxSteps = maxSteps; this.budgetMs = budgetMs; this.timeScale = 1; this.slow = 0; this.alpha = 0; }
  reset() { this.acc = 0; }
  /**
   * Run `step(i, isLast)` for every whole DT accumulated this frame. `before(isLast)` may be used to
   * capture interpolation state. Returns the number of steps taken. After it, `alpha` holds the
   * interpolation fraction for rendering.
   */
  run(frameDt, step) {
    this.acc += Math.min(frameDt, 0.1) * this.timeScale;
    let want = Math.floor(this.acc / this.dt); if (want > this.maxSteps) { want = this.maxSteps; }
    const t0 = performance.now(); let done = 0;
    for (; done < want; done++) {
      step(done, done === want - 1);
      if ((done & 7) === 7 && performance.now() - t0 > this.budgetMs) { done++; break; }
    }
    this.acc -= done * this.dt;
    if (this.acc > this.dt * 2) { this.slow = Math.min(1, this.slow + 0.1); this.acc = this.dt * 2; } else this.slow = Math.max(0, this.slow - 0.02);
    this.alpha = Math.min(1, this.acc / this.dt);
    return done;
  }
}
