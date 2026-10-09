// Free Drive / time attack: player car on the selected track with HUD, telemetry, audio.
import { registerMode, FixedStepper } from './index.js';

/** Pose on the centreline at arc length s (heading along the track). */
export function poseAt(track, s, offset = 0) {
  const p = track.pointAt(s, {}); const n = track.samples; const i = Math.floor((((s % track.length) + track.length) % track.length) / n.ds) % n.n;
  return { x: p.x + n.nx[i] * offset, y: p.y + n.ny[i] * offset, heading: p.heading ?? Math.atan2(p.ty, p.tx) };
}

/** Create vehicle + view + lap timer. */
export function spawnCar(ctx, params, pose, viewOpts = {}) {
  const track = ctx.state.track; const v = ctx.sim.createVehicle(params, track, pose);
  const cv = ctx.world.addCar(params, viewOpts); cv.vehicle = v; const lt = ctx.sim.createLapTimer(track);
  cv.capturePrev(v); cv.sync(v, 1);
  return { v, cv, lt, params };
}

const NEUTRAL = { steer: 0, throttle: 0, brake: 0, handbrake: 0, shiftUp: false, shiftDown: false, gearMode: 'auto', nitrous: false };

registerMode({
  id: 'drive', label: 'Free Drive', order: 20,
  async mount(ctx) {
    const track = await ctx.getTrack(ctx.state.trackKey);
    let params = ctx.state.params; if (!params) params = ctx.state.params = ctx.sim.build(ctx.state.spec);
    this.car = spawnCar(ctx, params, track.startPose(0));
    ctx.world.setFocus(this.car.cv); if (ctx.world.rig.mode === 'studio') ctx.world.rig.setMode('chase');
    ctx.hud.setTrack(track); ctx.hud.show(true); ctx.input.setDriving(true); ctx.input.enabled = true;
    ctx.audio.setCar(params);
    this.stepper = ctx.stepper(); this.paused = false;
    ctx.hud.flash(track.label || 'Free drive', 2.2, 'title', 'W/↑ throttle · S/↓ brake · A/D steer · C camera · T telemetry');
    ctx.music?.setRaceState?.('racing');
    this.keys = {};
  },
  reset(ctx) {
    const c = this.car; if (!c) return; const tr = ctx.state.track;
    const s = c.v.trackState?.s ?? 0; c.v.reset(poseAt(tr, s, 0)); c.cv.hasState = false; c.cv.capturePrev(c.v); ctx.world.fx.get(c.cv)?.reset();
  },
  update(ctx, dt) {
    const c = this.car; if (!c) { ctx.world.frame(dt, (cv) => cv.vehicle); return; }
    const controls = ctx.paused ? NEUTRAL : ctx.input.update(dt, c.v);
    if (!ctx.paused) {
      this.stepper.run(dt, () => { c.cv.capturePrev(c.v); c.v.step(controls); c.lt.update(c.v); });
    }
    c.cv.sync(c.v, this.stepper.alpha); c.cv.update(dt, c.v);
    ctx.hud.update(c.v, c.lt, { gearMode: controls.gearMode, slow: this.stepper.slow });
    ctx.telemetry.update(dt, c.v); ctx.audio.update(c.v, dt);
    ctx.music?.setIntensity?.(Math.min(1, Math.abs(c.v.speed) / 60));
    ctx.world.frame(dt, (cv) => cv.vehicle);
  },
  unmount(ctx) { if (this.car) ctx.world.removeCar(this.car.cv); this.car = null; ctx.hud.show(false); ctx.input.setDriving(false); ctx.telemetry.toggle(false); },
});
