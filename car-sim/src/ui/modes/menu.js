// Main menu: big animated title + menu over the turntable showroom with the player's car.
import { registerMode, listModes } from './index.js';
import { QUALITY_ORDER, QUALITY_PRESETS, getQuality, setQuality, detectQuality } from '../quality.js';
import { KEY_HELP } from '../input/input.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const aiModules = import.meta.glob(['../../ai/**/mode*.js', '../../ai/**/ui*.js', '../../ai/lab*.js']);

/** Lazy-load AI Lab modules (they call registerMode themselves). Returns the first ai mode id or null. */
export async function loadAiLab() {
  for (const load of Object.values(aiModules)) { try { await load(); } catch (err) { console.error('[menu] AI module failed to load', err); } }
  const m = listModes().find((x) => /^ai/i.test(x.id)); return m ? m.id : null;
}

export function openOptions(ctx) {
  const q = getQuality(); const old = document.querySelector('.options'); if (old) old.remove();
  const el = document.createElement('div'); el.className = 'options overlay'; document.body.appendChild(el);
  const det = detectQuality();
  el.innerHTML = `<div class="opt-card panel skew-in">
    <h2 class="display">OPTIONS</h2>
    <label class="f"><span>Graphics quality</span><select class="o-q">
      <option value="auto">Auto (detected: ${esc(QUALITY_PRESETS[det.name].label)})</option>
      ${QUALITY_ORDER.map((k) => `<option value="${k}" ${!q.auto && q.name === k ? 'selected' : ''}>${QUALITY_PRESETS[k].label}</option>`).join('')}
    </select></label>
    <p class="hint mono">GPU: ${esc(det.gpu || q.gpu || 'unknown')} · now: ${esc(q.label)} · render scale ${Math.round((ctx.world.renderScale || 1) * 100)}%</p>
    <label class="f toggle"><span>Dynamic resolution</span><input type="checkbox" class="o-dyn" ${ctx.world.dynres.enabled ? 'checked' : ''}><i></i></label>
    <label class="f range"><span>Master volume<output>${Math.round(ctx.audio.volume * 100)}%</output></span><input type="range" class="o-vol" min="0" max="1" step="0.05" value="${ctx.audio.volume}"></label>
    <label class="f toggle"><span>Mute</span><input type="checkbox" class="o-mute" ${ctx.audio.muted ? 'checked' : ''}><i></i></label>
    <label class="f toggle"><span>On-screen touch controls</span><input type="checkbox" class="o-touch" ${ctx.input.touchShown ? 'checked' : ''}><i></i></label>
    <label class="f toggle"><span>Debug info (module sources)</span><input type="checkbox" class="o-dbg" ${document.body.classList.contains('debug') ? 'checked' : ''}><i></i></label>
    <label class="f toggle"><span>Show FPS</span><input type="checkbox" class="o-fps" ${ctx.state.showFps ? 'checked' : ''}><i></i></label>
    <details><summary>Controls</summary><div class="keys">${KEY_HELP.map(([k, d]) => `<kbd>${esc(k)}</kbd><span>${esc(d)}</span>`).join('')}<kbd>Gamepad</kbd><span>RT/LT pedals · stick steer · X nitrous · B handbrake · LB/RB shift · Y camera</span></div></details>
    <div class="res-btns"><button class="btn primary o-close">Done</button></div></div>`;
  const $ = (s) => el.querySelector(s);
  $('.o-q').onchange = (e) => { const v = e.target.value; if (v === 'auto') setQuality(det.name, { auto: true }); else setQuality(v); ctx.toast(`Quality: ${QUALITY_PRESETS[getQuality().name].label}${getQuality().antialias !== q.antialias ? ' (anti-aliasing applies after reload)' : ''}`); };
  $('.o-dyn').onchange = (e) => { ctx.world.dynres.enabled = e.target.checked; if (!e.target.checked) ctx.world.dynres.reset(getQuality().renderScale); };
  $('.o-vol').oninput = (e) => { ctx.audio.volume = Number(e.target.value); ctx.audio.setMuted(ctx.audio.muted); e.target.previousElementSibling.querySelector('output').textContent = Math.round(ctx.audio.volume * 100) + '%'; };
  $('.o-mute').onchange = (e) => ctx.setMuted(e.target.checked);
  $('.o-touch').onchange = (e) => { ctx.input._wantTouch = e.target.checked; ctx.input.setTouchVisible(e.target.checked); };
  $('.o-dbg').onchange = (e) => { document.body.classList.toggle('debug', e.target.checked); try { localStorage.setItem('carsim.debug', e.target.checked ? '1' : '0'); } catch { /* ignore */ } };
  $('.o-fps').onchange = (e) => { ctx.state.showFps = e.target.checked; document.body.classList.toggle('show-fps', e.target.checked); };
  const close = () => { el.classList.add('closing'); setTimeout(() => el.remove(), 180); };
  $('.o-close').onclick = close; el.addEventListener('click', (e) => { if (e.target === el) close(); });
}

registerMode({
  id: 'menu', label: 'Menu', order: 0, hidden: true,
  mount(ctx) {
    const el = document.createElement('div'); el.className = 'menu'; ctx.panel.appendChild(el);
    const items = [
      ['race', 'RACE', 'Your build vs AI on the grid'],
      ['garage', 'GARAGE', 'Engines, aero, suspension, tyres'],
      ['drive', 'FREE DRIVE', 'Time attack · telemetry'],
      ['ai', 'AI LAB', 'Train & watch neural drivers'],
      ['options', 'OPTIONS', 'Graphics · audio · controls'],
    ];
    el.innerHTML = `
      <div class="menu-title"><div class="logo"><div class="streaks"><i></i><i></i><i></i></div><span class="l1">NOVA</span><span class="l2">VADERSPEED</span></div><div class="tagline">build · tune · race · beyond the redline</div></div>
      <nav class="menu-items">${items.map(([id, t, d], i) => `<button class="mi" data-id="${id}" style="--i:${i}"><b class="display">${t}</b><small>${d}</small></button>`).join('')}</nav>
      <div class="menu-car"><span class="mc-lbl">CURRENT BUILD</span><b class="display">${esc(ctx.state.spec.name || 'Unnamed')}</b><small>${Math.round(ctx.state.params?.summary?.powerKW || 0)} kW · ${Math.round(ctx.state.params?.summary?.mass || 0)} kg · ${esc(ctx.state.params?.summary?.drivetrain || '')}</small></div>
      <div class="menu-foot mono">${esc(ctx.sourcesText())}</div>`;
    el.querySelectorAll('.mi').forEach((b) => {
      b.onmouseenter = () => ctx.uiSound?.('hover');
      b.onclick = async () => {
        ctx.uiSound?.('confirm'); const id = b.dataset.id;
        if (id === 'options') return openOptions(ctx);
        if (id === 'ai') { const m = await loadAiLab(); if (m) ctx.switchMode(m); else ctx.toast('AI Lab is not installed yet (src/ai mode module missing).'); return; }
        ctx.switchMode(id);
      };
    });
    ctx.world.setActive('studio'); if (ctx.state.params) ctx.world.setStudioCar(ctx.state.params);
    const cam = ctx.world.camera; cam.position.set(-5.8, 1.5, 6.5); ctx.world.rig.orbit.target.set(0.6, 0.55, 0); cam.fov = 34; cam.updateProjectionMatrix();
    ctx.hud.show(false); ctx.input.setDriving(false); ctx.music?.setRaceState?.('menu');
  },
  update(ctx, dt) { ctx.world.frame(dt, (cv) => cv.vehicle); },
  unmount() {},
});
