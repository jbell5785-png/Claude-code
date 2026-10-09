// Race mode (§7): player (garage build) vs up to 7 AI cars. Setup screen → start lights →
// race with position tower and gaps → results. Spectate any car with V.
import { registerMode } from './index.js';
import { spawnCar } from './drive.js';
import { fmtTime } from '../hud/hud.js';

// Optional collision module (wave 2): called once per physics step with all vehicles.
const collisionMods = import.meta.glob('../../sim/collision.js', { eager: true });
const collide = Object.values(collisionMods)[0]?.collide || null;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const DRIVER_NAMES = ['K. Arata', 'M. Voss', 'J. Reyes', 'S. Lindqvist', 'T. Okafor', 'L. Moreau', 'D. Kowalski', 'R. Castillo', 'A. Petrov', 'N. Hale'];
const NEUTRAL = () => ({ steer: 0, throttle: 0, brake: 0, handbrake: 0, shiftUp: false, shiftDown: false, gearMode: 'auto', nitrous: false });

/** Minimal centreline follower used only if src/ai/driver.js is unavailable. */
function fallbackDriver(skill) {
  const p = {};
  return {
    reset() {},
    act(v, track, world, out) {
      const s = v.trackState.s + 8 + Math.abs(v.speed) * 0.5; track.pointAt(s, p);
      let a = Math.atan2(p.y - v.pos[1], p.x - v.pos[0]) - v.heading; while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI;
      out.steer = Math.max(-1, Math.min(1, a * 2.5)); const vt = 18 + 30 * skill;
      out.throttle = v.speed < vt ? 1 : 0; out.brake = v.speed > vt + 4 ? 0.5 : 0; out.gearMode = 'auto'; return out;
    },
  };
}

function hueShift(hex, deg) {
  const c = document.createElement('canvas').getContext('2d'); c.fillStyle = hex; const h = c.fillStyle;
  const r = parseInt(h.slice(1, 3), 16) / 255, g = parseInt(h.slice(3, 5), 16) / 255, b = parseInt(h.slice(5, 7), 16) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let hh = 0; const l = (mx + mn) / 2; const d = mx - mn; const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d) hh = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; hh = (hh * 60 + deg + 360) % 360;
  return `hsl(${hh},${Math.max(55, s * 100)}%,${Math.min(60, Math.max(35, l * 100))}%)`;
}

registerMode({
  id: 'race', label: 'Race', order: 15,
  async mount(ctx) {
    this.ctx = ctx; this.phase = 'setup';
    const prev = ctx.state.raceSetup || {};
    const q = ctx.quality();
    this.setup = { trackKey: prev.trackKey || ctx.state.trackKey, laps: prev.laps || 3, ai: prev.ai || Math.min(7, q.aiDefault || 5), difficulty: prev.difficulty ?? 0.6, mix: prev.mix || 'random', picks: prev.picks || [], slot: prev.slot ?? -1 };
    this.renderSetup();
  },

  renderSetup() {
    const ctx = this.ctx; const S = this.setup; const sim = ctx.sim;
    ctx.panel.innerHTML = ''; const el = document.createElement('div'); el.className = 'race-setup'; ctx.panel.appendChild(el);
    ctx.world.setActive('studio'); if (ctx.state.params) ctx.world.setStudioCar(ctx.state.params);
    ctx.hud.show(false); ctx.input.setDriving(false);
    const trackOpts = Object.entries(sim.TRACKS).map(([k, t]) => `<option value="${esc(k)}" ${k === S.trackKey ? 'selected' : ''}>${esc(t.label)}</option>`).join('');
    const presetOpts = (sel) => sim.PRESETS.map((p) => `<option value="${esc(p.key)}" ${p.key === sel ? 'selected' : ''}>${esc(p.label)}</option>`).join('');
    const nCars = S.ai + 1;
    el.innerHTML = `
      <div class="rs-card panel skew-in">
        <h2 class="display">RACE <span>SETUP</span></h2>
        <div class="rs-grid">
          <label class="f"><span>Track</span><select class="rs-track">${trackOpts}</select></label>
          <label class="f range"><span>Laps<output>${S.laps}</output></span><input type="range" class="rs-laps" min="1" max="20" step="1" value="${S.laps}"></label>
          <label class="f range"><span>Opponents<output>${S.ai}</output></span><input type="range" class="rs-ai" min="1" max="7" step="1" value="${S.ai}"></label>
          <label class="f range"><span>Difficulty<output>${Math.round(S.difficulty * 100)}%</output></span><input type="range" class="rs-diff" min="0" max="1" step="0.05" value="${S.difficulty}"></label>
          <label class="f"><span>Grid slot</span><select class="rs-slot"><option value="-1" ${S.slot < 0 ? 'selected' : ''}>Back of the grid</option>${Array.from({ length: nCars }, (_, i) => `<option value="${i}" ${S.slot === i ? 'selected' : ''}>P${i + 1}${i === 0 ? ' (pole)' : ''}</option>`).join('')}</select></label>
          <div class="f"><span>Opponent cars</span><div class="seg rs-mix"><button data-v="random" class="${S.mix === 'random' ? 'on' : ''}">Random mix</button><button data-v="pick" class="${S.mix === 'pick' ? 'on' : ''}">Pick each</button></div></div>
        </div>
        <div class="rs-picks ${S.mix === 'pick' ? '' : 'hide'}">${Array.from({ length: S.ai }, (_, i) => `<label class="f"><span>AI ${i + 1}</span><select data-i="${i}">${presetOpts(S.picks[i] || sim.PRESETS[i % sim.PRESETS.length]?.key)}</select></label>`).join('')}</div>
        <div class="rs-you"><span>Your car</span><b>${esc(ctx.state.spec.name || 'Garage build')}</b><small>${Math.round(ctx.state.params?.summary?.powerKW || 0)} kW · ${Math.round(ctx.state.params?.summary?.mass || 0)} kg</small><button class="btn ghost rs-garage">Edit in garage</button></div>
        <button class="btn primary big rs-go">START RACE</button>
      </div>`;
    const $ = (s) => el.querySelector(s);
    const upd = () => { ctx.state.raceSetup = { ...S }; };
    $('.rs-track').onchange = (e) => { S.trackKey = e.target.value; upd(); };
    const rng = (cls, key, fmt) => { $(cls).oninput = (e) => { S[key] = Number(e.target.value); e.target.previousElementSibling.querySelector('output').textContent = fmt(S[key]); upd(); if (key === 'ai') this.renderSetup(); }; };
    rng('.rs-laps', 'laps', (v) => v); rng('.rs-ai', 'ai', (v) => v); rng('.rs-diff', 'difficulty', (v) => Math.round(v * 100) + '%');
    $('.rs-slot').onchange = (e) => { S.slot = Number(e.target.value); upd(); };
    $('.rs-mix').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; S.mix = b.dataset.v; upd(); this.renderSetup(); };
    el.querySelectorAll('.rs-picks select').forEach((s) => (s.onchange = () => { S.picks[Number(s.dataset.i)] = s.value; upd(); }));
    $('.rs-garage').onclick = () => ctx.switchMode('garage');
    $('.rs-go').onclick = () => { ctx.uiSound?.('confirm'); this.start(); };
  },

  async start() {
    const ctx = this.ctx; const S = this.setup; const sim = ctx.sim;
    ctx.panel.innerHTML = '<div class="loading display">LOADING TRACK…</div>';
    ctx.setTrackKey(S.trackKey); const track = await ctx.getTrack(S.trackKey); this.track = track;
    ctx.world.setActive('track'); if (ctx.world.rig.mode === 'studio') ctx.world.rig.setMode('chase');
    const api = await ctx.driverApi();
    const nCars = S.ai + 1; const playerSlot = S.slot < 0 ? nCars - 1 : Math.min(S.slot, nCars - 1);
    const skill = 0.6 + 0.38 * S.difficulty;
    const pool = sim.PRESETS.length ? sim.PRESETS : [{ key: 'player', label: 'Car', spec: ctx.state.spec }];
    const usedColors = [String(ctx.state.spec.color || '').toLowerCase()];
    this.cars = []; let ai = 0;
    const playerParams = ctx.state.params || sim.build(ctx.state.spec);
    for (let slot = 0; slot < nCars; slot++) {
      const pose = track.startPose(slot); const behind = track.length - (pose.s ?? (track.length - (6 + 8 * slot)));
      let car;
      if (slot === playerSlot) {
        car = spawnCar(ctx, playerParams, pose); Object.assign(car, { name: ctx.state.spec.name || 'You', player: true, color: playerParams.render?.color || ctx.state.spec.color });
      } else {
        const preset = S.mix === 'pick' ? (pool.find((p) => p.key === S.picks[ai]) || pool[ai % pool.length]) : pool[(Math.random() * pool.length) | 0];
        const spec = JSON.parse(JSON.stringify(preset.spec));
        let col = String(spec.color || '#888').toLowerCase(); let k = 0;
        while (usedColors.includes(col) && k++ < 6) col = hueShift(col, 47 * k);
        usedColors.push(col); spec.color = col.startsWith('hsl') ? toHex(col) : col;
        let params; try { params = sim.build(spec); } catch (err) { console.error('[race] AI build failed', err); params = playerParams; }
        car = spawnCar(ctx, params, pose);
        const aggression = 0.3 + Math.random() * 0.5;
        let driver; try { driver = api ? api.createDriver('pursuit', { skill: Math.min(0.99, skill + (Math.random() - 0.5) * 0.04), aggression, seed: slot }) : fallbackDriver(skill); } catch (err) { console.error('[race] driver', err); driver = fallbackDriver(skill); }
        try { driver.reset(car.v, track); } catch (err) { console.error('[race] driver.reset', err); }
        Object.assign(car, { name: DRIVER_NAMES[ai % DRIVER_NAMES.length], carName: preset.label, driver, color: spec.color });
        ai++;
      }
      Object.assign(car, { slot, behind, controls: NEUTRAL(), finished: false, finishTime: null, dist: -behind });
      this.cars.push(car);
    }
    this.vehicles = this.cars.map((c) => c.v);
    this.player = this.cars.find((c) => c.player); this.focus = this.player;
    ctx.world.setFocus(this.player.cv); ctx.hud.setTrack(track); ctx.hud.show(true); ctx.input.setDriving(true); ctx.input.enabled = true;
    ctx.audio.setCar(this.player.params);
    this.stepper = ctx.stepper(); this.stepCount = 0; this.simTime = 0; this.raceTime = 0; this.leaderTimes = []; this.lightsT = 0;
    this.goAt = 5 + 0.4 + Math.random() * 1.6; this.phase = 'grid'; this.resultsShown = false;
    this.buildRaceUI(); ctx.music?.setRaceState?.('countdown');
  },

  buildRaceUI() {
    const ctx = this.ctx; ctx.panel.innerHTML = '';
    const el = document.createElement('div'); el.className = 'race-ui'; ctx.panel.appendChild(el);
    el.innerHTML = `
      <div class="tower panel glass"><div class="tower-head display">POS</div><ol class="tower-list"></ol><div class="tower-foot"><span class="lapc"></span><span class="spec-hint">V spectate</span></div></div>
      <div class="lights"><i></i><i></i><i></i><i></i><i></i></div>
      <div class="bigpos display"><b></b><small></small></div>
      <div class="spectating"></div>
      <div class="results hide"></div>`;
    this.ui = { root: el, list: el.querySelector('.tower-list'), lights: [...el.querySelectorAll('.lights i')], lightsEl: el.querySelector('.lights'), lapc: el.querySelector('.lapc'),
      bigpos: el.querySelector('.bigpos b'), bigposSub: el.querySelector('.bigpos small'), spect: el.querySelector('.spectating'), results: el.querySelector('.results') };
    this.towerAcc = 1;
  },

  keys: { KeyV(ctx) { const m = ctx.currentMode(); if (m.cars && m.phase !== 'setup') m.cycleFocus(1); } },
  cycleFocus(d) {
    const i = this.cars.indexOf(this.focus); this.focus = this.cars[(i + d + this.cars.length) % this.cars.length];
    this.ctx.world.setFocus(this.focus.cv); this.ctx.audio.setCar(this.focus.params);
  },
  reset(ctx) { if (this.player && this.phase === 'racing') { const v = this.player.v; const s = v.trackState.s; const p = this.track.pointAt(s, {}); v.reset({ x: p.x, y: p.y, heading: p.heading }); this.player.cv.hasState = false; } },

  positions() {
    const L = this.track.length;
    for (const c of this.cars) c.dist = (c.lt.progress ?? 0) - c.behind;
    const order = [...this.cars].sort((a, b) => {
      if (a.finished && b.finished) return a.finishTime - b.finishTime;
      if (a.finished !== b.finished) return a.finished ? -1 : 1;
      return b.dist - a.dist;
    });
    order.forEach((c, i) => { c.pos = i + 1; });
    const lead = order[0];
    for (const c of order) {
      if (c === lead) { c.gap = 'Leader'; continue; }
      if (c.finished && lead.finished) { c.gap = '+' + (c.finishTime - lead.finishTime).toFixed(3); continue; }
      const laps = Math.floor((lead.dist - c.dist) / L);
      if (laps >= 1) { c.gap = `+${laps} LAP${laps > 1 ? 'S' : ''}`; continue; }
      const t = this.leaderTimes[Math.max(0, Math.floor(c.dist / 10))]; c.gap = t != null ? '+' + Math.max(0, this.raceTime - t).toFixed(1) : '–';
    }
    return order;
  },

  update(ctx, dt) {
    if (this.phase === 'setup' || !this.cars) { ctx.world.frame(dt, (cv) => cv.vehicle); return; }
    const DT = ctx.sim.DT; const stepsPerAct = Math.max(1, Math.round(1 / (DT * 50)));
    const pc = ctx.paused ? NEUTRAL() : ctx.input.update(dt, this.player.v);
    if (!ctx.paused && this.phase !== 'results') {
      this.stepper.run(dt, () => {
        this.simTime += DT; const grid = this.phase === 'grid';
        if (grid) { this.lightsT += DT; if (this.lightsT >= this.goAt) { this.phase = 'racing'; this.onGo(); } }
        const doAct = this.stepCount % stepsPerAct === 0; this.stepCount++;
        for (const c of this.cars) {
          c.cv.capturePrev(c.v);
          if (c.player && !c.finished) Object.assign(c.controls, pc);
          else if (doAct) { try { c.driver.act(c.v, this.track, { cars: this.vehicles, time: this.simTime }, c.controls); } catch (err) { if (!this._drvErr) { console.error('[race] driver.act', err); this._drvErr = true; } } }
          if (grid) { c.controls.brake = 0; c.controls.handbrake = 1; c.controls.throttle = 0; c.controls.shiftDown = false; } // brake at standstill would make the ECU select reverse
          c.v.step(c.controls);
        }
        if (collide) collide(this.vehicles);
        for (const c of this.cars) {
          c.lt.update(c.v);
          if (!grid) {
            const b = Math.floor(((c.lt.progress ?? 0) - c.behind) / 10); if (b >= 0 && this.leaderTimes[b] == null) this.leaderTimes[b] = this.raceTime;
            if (!c.finished && (c.lt.lap ?? 0) >= this.setup.laps) { c.finished = true; c.finishTime = this.raceTime; this.onFinish(c); }
          }
        }
        if (!grid) this.raceTime += DT;
      });
    }
    for (const c of this.cars) { c.cv.sync(c.v, this.stepper.alpha); c.cv.update(dt, c.v); }
    const order = this.positions(); const f = this.focus;
    ctx.hud.update(f.v, f.lt, { others: this.cars.map((c) => ({ v: c.v, color: c.color })), position: f.pos, total: this.cars.length, lapsTotal: this.setup.laps, gearMode: pc.gearMode });
    ctx.telemetry.update(dt, f.v); ctx.audio.update(f.v, dt);
    this.updateUI(dt, order);
    ctx.world.frame(dt, (cv) => cv.vehicle);
  },

  onGo() {
    const ctx = this.ctx; ctx.hud.flash('GO!', 1.2, 'go'); ctx.music?.cueDrop?.(); ctx.music?.setRaceState?.('racing'); ctx.uiSound?.('go');
  },
  onFinish(c) {
    const ctx = this.ctx;
    if (c.player) {
      ctx.hud.flash(c.pos === 1 ? 'VICTORY' : `P${c.pos}`, 3, 'finish', `Race time ${fmtTime(c.finishTime)}`); ctx.music?.setRaceState?.('finished');
      // the AI takes over the player's car for the cool-down lap
      const api = ctx._driverApiCache; try { c.driver = api ? api.createDriver('pursuit', { skill: 0.7, aggression: 0.2 }) : fallbackDriver(0.6); c.driver.reset(c.v, this.track); } catch { c.driver = fallbackDriver(0.6); }
      setTimeout(() => this.showResults(), 2500);
    }
    if (this.resultsShown) this.showResults();
  },

  updateUI(dt, order) {
    const ui = this.ui; if (!ui) return; const ctx = this.ctx;
    // start lights
    if (this.phase === 'grid') {
      ui.lightsEl.classList.add('show'); const n = Math.min(5, Math.floor(this.lightsT)); ui.lights.forEach((l, i) => l.classList.toggle('on', i < n));
    } else if (ui.lightsEl.classList.contains('show')) { ui.lights.forEach((l) => { l.classList.remove('on'); l.classList.add('out'); }); setTimeout(() => ui.lightsEl.classList.remove('show'), 900); }
    // tower (10 Hz)
    this.towerAcc += dt; if (this.towerAcc > 0.1) {
      this.towerAcc = 0;
      ui.list.innerHTML = order.map((c) => `<li class="${c.player ? 'me' : ''} ${c === this.focus ? 'focus' : ''} ${c.finished ? 'fin' : ''}"><span class="p">${c.pos}</span><i style="background:${esc(c.color)}"></i><span class="n">${esc(c.name)}</span><span class="g mono">${c.finished ? '🏁 ' : ''}${esc(c.gap)}</span></li>`).join('');
      const lead = order[0]; const lap = Math.min(this.setup.laps, (lead.lt.lap ?? 0) + 1);
      ui.lapc.textContent = `LAP ${lap}/${this.setup.laps}`;
      if (lap === this.setup.laps && !this._finalLap && this.phase === 'racing') { this._finalLap = true; ctx.music?.setRaceState?.('finalLap'); ctx.hud.flash('FINAL LAP', 2, 'final'); }
      ui.bigpos.textContent = `${this.focus.pos}`; ui.bigposSub.textContent = `/${this.cars.length}`;
      ui.spect.textContent = this.focus.player ? '' : `SPECTATING · ${this.focus.name} · ${this.focus.carName || ''}`;
      if (this.stepper.slow > 0.3) ui.spect.textContent += ` · sim ${Math.round((1 - this.stepper.slow * 0.5) * 100)}% speed`;
    }
  },

  showResults() {
    this.resultsShown = true; const ui = this.ui; const ctx = this.ctx; if (!ui) return;
    const order = this.positions();
    ui.results.classList.remove('hide');
    ui.results.innerHTML = `<div class="res-card panel skew-in"><h2 class="display">RESULTS <span>${esc(this.track.label || '')}</span></h2>
      <table><thead><tr><th>Pos</th><th>Driver</th><th>Car</th><th>Time</th><th>Best lap</th></tr></thead><tbody>
      ${order.map((c) => `<tr class="${c.player ? 'me' : ''}"><td>${c.pos}</td><td><i style="background:${esc(c.color)}"></i>${esc(c.name)}</td><td>${esc(c.player ? (ctx.state.spec.name || 'Your build') : c.carName || '')}</td><td class="mono">${c.finished ? fmtTime(c.finishTime) : esc(c.gap === 'Leader' ? 'running' : c.gap)}</td><td class="mono">${fmtTime(c.lt.bestLap)}</td></tr>`).join('')}
      </tbody></table>
      <div class="res-btns"><button class="btn primary r-again">Race again</button><button class="btn r-setup">Change setup</button><button class="btn ghost r-garage">Garage</button></div></div>`;
    ui.results.querySelector('.r-again').onclick = () => { this.teardown(); this.start(); };
    ui.results.querySelector('.r-setup').onclick = () => { this.teardown(); this.renderSetup(); this.phase = 'setup'; };
    ui.results.querySelector('.r-garage').onclick = () => ctx.switchMode('garage');
  },

  teardown() {
    const ctx = this.ctx; if (this.cars) for (const c of this.cars) ctx.world.removeCar(c.cv);
    this.cars = null; this.vehicles = null; this._finalLap = false; this.resultsShown = false; ctx.world.skids.clear();
  },
  unmount(ctx) { this.teardown(); this.phase = 'setup'; ctx.hud.show(false); ctx.input.setDriving(false); ctx.telemetry.toggle(false); ctx.music?.setRaceState?.('menu'); },
});

function toHex(c) { const d = document.createElement('canvas').getContext('2d'); d.fillStyle = c; return d.fillStyle; }
