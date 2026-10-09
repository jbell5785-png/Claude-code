// App entry: shell DOM, shared context for modes, main loop, global keys, lazy modules.
import '@fontsource/russo-one/latin-400.css';
import '@fontsource/chakra-petch/latin-400.css';
import '@fontsource/chakra-petch/latin-600.css';
import '@fontsource/chakra-petch/latin-700.css';
import '@fontsource/chakra-petch/latin-600-italic.css';
import './styles.css';
import * as sim from './simapi.js';
import { World } from './render/world.js';
import { renderContext } from './render/context.js';
import { Hud } from './hud/hud.js';
import { Telemetry } from './hud/telemetry.js';
import { Input, KEY_HELP } from './input/input.js';
import { CarAudio } from './audio/engineAudio.js';
import { uiSound } from './audio/uiSound.js';
import { listModes, getMode, onModesChanged, FixedStepper } from './modes/index.js';
import { CAMERA_LABELS } from './render/cameras.js';
import { getQuality, onQualityChange } from './quality.js';
import { loadCurrentSpec } from './garage/garage.js';
import { openOptions } from './modes/menu.js';
import './modes/menu.js';
import './modes/drive.js';
import './modes/race.js';

// Lazy optional modules (separate chunks; resolved at build time only if the files exist).
const fxMods = import.meta.glob('./fx/index.js');
const musicMods = import.meta.glob('./music/index.js');
const driverMods = import.meta.glob('../ai/driver.js');

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const app = document.getElementById('app'); const canvas = document.getElementById('view');
const shell = document.createElement('div'); shell.className = 'shell';
shell.innerHTML = `
  <header class="topbar">
    <button class="brand display" title="Main menu">NOVA<span>VADERSPEED</span></button>
    <nav class="modes"></nav>
    <div class="tb-right">
      <select class="tb-track" aria-label="Track"></select>
      <button class="tb-btn tb-cam" title="Camera (C)">Chase</button>
      <button class="tb-btn tb-tel" title="Telemetry (T)">Telemetry</button>
      <button class="tb-btn tb-mute" title="Mute (N)">🔊</button>
      <button class="tb-btn tb-opt" title="Options">⚙</button>
      <button class="tb-btn tb-fs" title="Fullscreen">⛶</button>
    </div>
  </header>
  <main class="mode-panel"></main>
  <div class="toast"></div>
  <div class="fps mono"></div>
  <div class="pause overlay hide"><div class="panel skew-in"><h2 class="display">PAUSED</h2><div class="keys">${KEY_HELP.map(([k, d]) => `<kbd>${esc(k)}</kbd><span>${esc(d)}</span>`).join('')}</div><div class="res-btns"><button class="btn primary p-resume">Resume</button><button class="btn p-menu">Main menu</button></div></div></div>
  <div class="scanlines"></div>`;
app.appendChild(shell);
const $ = (s) => shell.querySelector(s);

let world;
try { world = new World(canvas, { preserveDrawingBuffer: new URLSearchParams(location.search).has('capture') }); }
catch (err) {
  console.error(err); document.getElementById('boot').innerHTML = '<div class="boot-logo"><span class="l1">NOVA</span><span class="l2">VADERSPEED</span></div><div class="boot-sub">WebGL is not available on this device/browser.</div>'; throw err;
}
const hud = new Hud(app); const telemetry = new Telemetry(app); const input = new Input(app); const audio = new CarAudio();

// ---------------------------------------------------------------- shared state & context
if (new URLSearchParams(location.search).has('debug') || localStorage.getItem('carsim.debug') === '1') document.body.classList.add('debug');
const state = { spec: loadCurrentSpec(sim.DEFAULT_SPEC), params: null, trackKey: localStorage.getItem('carsim.track') || Object.keys(sim.TRACKS)[0], track: null, showFps: false };
try { state.params = sim.build(state.spec); } catch (err) { console.error('[main] build of saved spec failed — using default', err); state.spec = JSON.parse(JSON.stringify(sim.DEFAULT_SPEC)); state.params = sim.build(state.spec); }
if (!sim.TRACKS[state.trackKey]) state.trackKey = Object.keys(sim.TRACKS)[0];

const trackCache = new Map();
let current = null; let currentId = null; let paused = false;
const ctx = {
  sim, world, hud, telemetry, input, audio, state, panel: $('.mode-panel'), music: null, uiSound,
  get paused() { return paused; },
  quality: getQuality,
  stepper: () => new FixedStepper(sim.DT, { maxSteps: 60, budgetMs: 14 }),
  toast,
  switchMode, currentMode: () => current,
  setTrackKey(k) { state.trackKey = k; try { localStorage.setItem('carsim.track', k); } catch { /* ignore */ } $('.tb-track').value = k; },
  /** Create (cached) and show a track. */
  async getTrack(key = state.trackKey) {
    let t = trackCache.get(key);
    if (!t) {
      showLoading(true, 'BUILDING TRACK'); await new Promise((r) => setTimeout(r, 30));
      try { t = sim.createTrack(key); } catch (err) { console.error('[main] createTrack failed', err); toast('Track failed to load: ' + err.message); key = Object.keys(sim.TRACKS)[0]; t = sim.createTrack(key); }
      trackCache.set(key, t);
    }
    state.track = t; state.trackKey = key;
    if (world.track !== t) { world.setTrack(t); }
    showLoading(false); return t;
  },
  async driverApi() {
    if (ctx._driverApiCache !== undefined) return ctx._driverApiCache;
    const load = Object.values(driverMods)[0];
    try { ctx._driverApiCache = load ? await load() : null; } catch (err) { console.error('[main] AI driver module failed', err); ctx._driverApiCache = null; }
    return ctx._driverApiCache;
  },
  setMuted(m) { audio.setMuted(m); $('.tb-mute').textContent = m ? '🔇' : '🔊'; try { localStorage.setItem('carsim.muted', m ? '1' : '0'); } catch { /* ignore */ } },
  sourcesText() { return 'sim: ' + Object.entries(sim.sources).map(([k, v]) => `${k} ${v}`).join(' · '); },
};
window.__carsim = ctx; // handy for debugging and for the screenshot script
renderContext.ctx = ctx;

function toast(msg, ms = 2400) { const t = $('.toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), ms); }
function showLoading(on, text = 'LOADING') {
  let el = document.getElementById('boot'); if (!el) return;
  el.classList.toggle('hidden', !on); if (on) el.querySelector('.boot-sub').textContent = text.toLowerCase() + '…';
}

// ---------------------------------------------------------------- modes / topbar
function renderModeTabs() {
  $('.modes').innerHTML = listModes().map((m) => `<button class="mtab ${m.id === currentId ? 'on' : ''}" data-id="${esc(m.id)}">${esc(m.label)}</button>`).join('');
}
$('.modes').onclick = (e) => { const b = e.target.closest('.mtab'); if (b) { uiSound('click'); switchMode(b.dataset.id); } };
onModesChanged(renderModeTabs);
$('.brand').onclick = () => switchMode('menu');
$('.tb-track').innerHTML = Object.entries(sim.TRACKS).map(([k, t]) => `<option value="${esc(k)}">${esc(t.label)}</option>`).join('');
$('.tb-track').value = state.trackKey;
$('.tb-track').onchange = async (e) => {
  ctx.setTrackKey(e.target.value);
  if (currentId === 'drive') { await switchMode('drive', true); }
  else if (current?.id === 'race' && current.setup) { current.setup.trackKey = e.target.value; if (current.phase === 'setup') current.renderSetup(); }
};
$('.tb-cam').onclick = () => cycleCamera();
$('.tb-tel').onclick = () => telemetry.toggle();
$('.tb-mute').onclick = () => ctx.setMuted(!audio.muted);
$('.tb-opt').onclick = () => openOptions(ctx);
$('.tb-fs').onclick = () => { if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {}); else document.exitFullscreen?.(); };
$('.p-resume').onclick = () => setPaused(false);
$('.p-menu').onclick = () => { setPaused(false); switchMode('menu'); };

async function switchMode(id, force = false) {
  const next = getMode(id); if (!next) { toast(`Unknown mode ${id}`); return; }
  if (id === currentId && !force) return;
  if (current) { try { current.unmount?.(ctx); } catch (err) { console.error('[main] unmount', err); } }
  ctx.panel.innerHTML = ''; ctx.panel.className = 'mode-panel mode-' + id; document.body.dataset.mode = id;
  current = next; currentId = id; renderModeTabs();
  ctx.panel.classList.add('wipe'); setTimeout(() => ctx.panel.classList.remove('wipe'), 450);
  try { await next.mount(ctx); } catch (err) { console.error(`[main] mount ${id} failed`, err); toast(`Could not open ${next.label}: ${err.message}`); }
  updateCamButton();
}

function cycleCamera() { if (world.active === 'studio') return; const m = world.rig.cycle(); updateCamButton(); hud.flash(CAMERA_LABELS[m] + ' cam', 0.8, 'small'); }
function updateCamButton() { $('.tb-cam').textContent = CAMERA_LABELS[world.rig.mode] || 'Camera'; }
function setPaused(p) { paused = p; $('.pause').classList.toggle('hide', !p); if (p) audio.suspend(); else { audio.resume(); last = performance.now(); } }

input.on('camera', cycleCamera);
input.on('telemetry', () => telemetry.toggle());
input.on('mute', () => ctx.setMuted(!audio.muted));
input.on('pause', () => { if (currentId === 'drive' || currentId === 'race') setPaused(!paused); });
input.on('help', () => { if (currentId === 'drive' || currentId === 'race') setPaused(!paused); });
input.on('reset', () => current?.reset?.(ctx));
input.on('gearMode', () => hud.flash(input.c.gearMode === 'manual' ? 'MANUAL' : 'AUTO', 0.8, 'small'));
input.on('spectate', () => current?.keys?.KeyV?.(ctx));
window.addEventListener('keydown', (e) => {
  if (e.code === 'Escape') { if (document.querySelector('.options')) document.querySelector('.options .o-close')?.click(); else if (currentId === 'drive' || currentId === 'race') setPaused(!paused); else if (currentId !== 'menu') switchMode('menu'); }
  const k = current?.keys?.[e.code]; if (k && e.code !== 'KeyV' && !e.repeat) k(ctx);
});

// ---------------------------------------------------------------- audio / music start on first gesture
const startAudio = async () => {
  window.removeEventListener('pointerdown', startAudio); window.removeEventListener('keydown', startAudio);
  try { await audio.start(); uiSound.attach(audio.ctx, audio.master); if (localStorage.getItem('carsim.muted') === '1') ctx.setMuted(true); if (state.params) audio.setCar(state.params); } catch (err) { console.warn('[audio] start failed', err); }
  const loadMusic = Object.values(musicMods)[0];
  if (loadMusic) {
    try {
      const m = await loadMusic(); const player = m.createMusicPlayer?.({ audioContext: audio.ctx, destination: audio.master });
      ctx.music = player || null; if (player && m.mountMusicWidget) m.mountMusicWidget($(".tb-right"), player);
      ctx.music?.setRaceState?.(currentId === 'race' ? 'countdown' : 'menu');
    } catch (err) { console.warn('[music] unavailable', err); }
  }
};
window.addEventListener('pointerdown', startAudio); window.addEventListener('keydown', startAudio);

// ---------------------------------------------------------------- visuals plug-in (engineer H)
const loadFx = Object.values(fxMods)[0];
if (loadFx && !new URLSearchParams(location.search).has('nofx')) {
  loadFx().then((m) => (m.installFx || m.default)?.(renderContext, { quality: getQuality(), onQualityChange })).catch((err) => console.warn('[fx] failed to install', err));
}

// ---------------------------------------------------------------- main loop
let last = performance.now(); let fpsAcc = 0, fpsN = 0;
function frame(now) {
  requestAnimationFrame(frame);
  if (document.hidden) { last = now; return; }
  const dt = Math.min(0.1, Math.max(0, (now - last) / 1000)); last = now;
  try { current?.update?.(ctx, paused ? 0 : dt); } catch (err) { console.error('[main] update', err); if (!frame._errShown) { frame._errShown = true; toast('Error: ' + err.message, 5000); } }
  fpsAcc += dt; fpsN++;
  if (fpsAcc > 0.5) { if (state.showFps) $('.fps').textContent = `${Math.round(fpsN / fpsAcc)} fps · ${(fpsAcc / fpsN * 1000).toFixed(1)} ms · ${Math.round(world.renderScale * 100)}% · ${getQuality().name}`; fpsAcc = 0; fpsN = 0; }
}
document.addEventListener('visibilitychange', () => { if (document.hidden) audio.suspend(); else { audio.resume(); last = performance.now(); } });

const qs = new URLSearchParams(location.search);
const startMode = qs.get('mode') || 'menu';
await switchMode(getMode(startMode) ? startMode : 'menu');
showLoading(false);
requestAnimationFrame(frame);
