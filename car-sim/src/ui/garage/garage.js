// Garage: every catalog option in tabs, live build summary, engine chart, weight diagram,
// presets, local save/load, JSON import/export, 3D turntable preview (world studio scene).
import { registerMode } from '../modes/index.js';
import { drawEngineChart, drawWeightDiagram } from './charts.js';

const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
const get = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
const set = (o, p, v) => { const ks = p.split('.'); let a = o; for (let i = 0; i < ks.length - 1; i++) { a[ks[i]] = a[ks[i]] ?? {}; a = a[ks[i]]; } a[ks[ks.length - 1]] = v; };
const gbp = (n) => '£' + Math.round(n).toLocaleString('en-GB');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const STORE = 'carsim.builds.v1';
const CUR = 'carsim.currentSpec.v1';

function opts(table, filter) {
  return Object.entries(table).filter(([k, v]) => !filter || filter(k, v)).map(([k, v]) => ({ value: k, label: v.label + (v.price ? ` · ${gbp(v.price)}` : '') }));
}

/** Control schema per tab. `when(spec, C)` hides a control; `range(spec, C)` gives dynamic slider bounds. */
function schema(C) {
  const isEV = (s) => s.powertrain === 'ev'; const ice = (s) => !isEV(s);
  const ind = (s) => C.INDUCTION[s.engine?.induction] || C.INDUCTION.na;
  const ch = (s) => C.CHASSIS[s.chassis] || Object.values(C.CHASSIS)[0];
  const kit = (s) => C.BODY_KITS[s.aero?.bodyKit] || C.BODY_KITS.stock;
  const layoutOf = (s) => (isEV(s) ? (s.ev?.front && s.ev?.rear ? 'AWD' : s.ev?.front ? 'FWD' : 'RWD') : s.drivetrain?.layout);
  return [
    { id: 'chassis', label: 'Chassis', items: [
      { p: 'chassis', label: 'Body / chassis', type: 'select', options: () => opts(C.CHASSIS) },
      { p: 'powertrain', label: 'Powertrain', type: 'seg', options: () => [{ value: 'ice', label: 'Combustion' }, { value: 'ev', label: 'Electric' }] },
      { p: 'steering.ratio', label: 'Steering ratio', type: 'range', min: 10, max: 20, step: 0.5, unit: ':1' },
      { p: 'steering.maxLock', label: 'Max lock (road wheel)', type: 'range', min: 25, max: 50, step: 1, unit: '°' },
      { p: 'steering.ackermann', label: 'Ackermann', type: 'range', min: 0, max: 1, step: 0.05, unit: '', fmt: (v) => `${Math.round(v * 100)}%` },
    ] },
    { id: 'engine', label: 'Engine', when: ice, items: [
      { p: 'engine.layout', label: 'Layout', type: 'select', options: () => opts(C.LAYOUTS) },
      { p: 'engine.displacement', label: 'Displacement', type: 'range', step: 0.1, unit: 'L', range: (s) => (C.LAYOUTS[s.engine.layout] || C.LAYOUTS.I4).disp, fmt: (v) => v.toFixed(1) + ' L' },
      { p: 'engine.placement', label: 'Placement', type: 'seg', options: (s) => ch(s).placements.map((p) => ({ value: p, label: p[0].toUpperCase() + p.slice(1) })) },
      { p: 'engine.cams', label: 'Camshafts', type: 'select', options: () => opts(C.CAMS) },
      { p: 'engine.intake', label: 'Intake', type: 'select', options: () => opts(C.INTAKES) },
      { p: 'engine.exhaust', label: 'Exhaust', type: 'select', options: () => opts(C.EXHAUSTS) },
      { p: 'engine.internals', label: 'Internals', type: 'select', options: () => opts(C.INTERNALS) },
      { p: 'engine.flywheel', label: 'Flywheel', type: 'select', options: () => opts(C.FLYWHEELS) },
      { p: 'engine.ecu', label: 'ECU', type: 'select', options: () => opts(C.ECU_TUNES) },
    ] },
    { id: 'induction', label: 'Induction & Fuel', when: ice, items: [
      { p: 'engine.induction', label: 'Induction', type: 'select', options: () => opts(C.INDUCTION) },
      { p: 'engine.boost', label: 'Boost target', type: 'range', step: 0.05, range: (s) => [0, ind(s).maxBoost || 0], fmt: (v) => v.toFixed(2) + ' bar', when: (s) => ind(s).kind !== 'na' },
      { p: 'engine.intercooler', label: 'Intercooler', type: 'select', options: () => opts(C.INTERCOOLERS), when: (s) => ind(s).kind !== 'na' },
      { p: 'engine.antiLag', label: 'Anti-lag', type: 'toggle', when: (s) => ind(s).kind === 'turbo' },
      { p: 'engine.nitrous', label: 'Nitrous', type: 'select', options: () => opts(C.NITROUS || {}), when: () => !!C.NITROUS },
      { p: 'engine.fuel', label: 'Fuel', type: 'select', options: () => opts(C.FUELS) },
      { p: 'engine.fuelSystem', label: 'Fuel system', type: 'select', options: () => opts(C.FUEL_SYSTEMS) },
      { p: 'fuelLitres', label: 'Fuel load', type: 'range', min: 5, max: 100, step: 1, fmt: (v) => v + ' L' },
    ] },
    { id: 'drivetrain', label: 'Drivetrain', items: [
      { p: 'drivetrain.layout', label: 'Driven wheels', type: 'seg', options: () => ['FWD', 'RWD', 'AWD'].map((v) => ({ value: v, label: v })), when: ice },
      { p: 'drivetrain.gearbox', label: 'Gearbox', type: 'select', options: () => opts(C.GEARBOXES, (k, v) => !v.evOnly), when: ice },
      { p: 'drivetrain.finalDrive', label: 'Final drive', type: 'range', step: 0.05, range: (s) => (isEV(s) ? [6, 12] : [2.5, 5.5]), fmt: (v) => v.toFixed(2) + ':1' },
      { p: 'drivetrain.frontDiff', label: 'Front diff', type: 'select', options: () => opts(C.DIFFS), when: (s) => layoutOf(s) !== 'RWD' },
      { p: 'drivetrain.rearDiff', label: 'Rear diff', type: 'select', options: () => opts(C.DIFFS), when: (s) => layoutOf(s) !== 'FWD' },
      { p: 'drivetrain.centreDiff', label: 'Centre diff', type: 'select', options: () => opts(C.CENTRE_DIFFS), when: (s) => ice(s) && layoutOf(s) === 'AWD' },
      { p: 'drivetrain.centreSplit', label: 'Front torque share', type: 'range', min: 0, max: 1, step: 0.05, fmt: (v) => `${Math.round(v * 100)}% F`, when: (s) => ice(s) && layoutOf(s) === 'AWD' },
    ] },
    { id: 'suspension', label: 'Suspension', items: [
      { p: 'suspension.type', label: 'Architecture', type: 'select', options: () => opts(C.SUSPENSION_TYPES) },
      { p: 'suspension.dampers', label: 'Dampers', type: 'select', options: () => opts(C.DAMPERS) },
      { p: 'suspension.springF', label: 'Spring rate front', type: 'range', min: 10, max: 250, step: 1, unit: 'N/mm' },
      { p: 'suspension.springR', label: 'Spring rate rear', type: 'range', min: 10, max: 250, step: 1, unit: 'N/mm' },
      { p: 'suspension.arbF', label: 'Anti-roll bar front', type: 'range', min: 0, max: 80, step: 1, unit: 'N/mm' },
      { p: 'suspension.arbR', label: 'Anti-roll bar rear', type: 'range', min: 0, max: 80, step: 1, unit: 'N/mm' },
      { p: 'suspension.damping', label: 'Damping ratio', type: 'range', step: 0.01, range: (s) => (C.DAMPERS[s.suspension.dampers] || C.DAMPERS.stock).range, fmt: (v) => v.toFixed(2) },
      { p: 'suspension.rideHeight', label: 'Ride height', type: 'range', min: -60, max: 60, step: 1, fmt: (v) => (v > 0 ? '+' : '') + v + ' mm' },
      { p: 'suspension.camberF', label: 'Camber front', type: 'range', min: -5, max: 1, step: 0.1, fmt: (v) => v.toFixed(1) + '°' },
      { p: 'suspension.camberR', label: 'Camber rear', type: 'range', min: -5, max: 1, step: 0.1, fmt: (v) => v.toFixed(1) + '°' },
      { p: 'suspension.toeF', label: 'Toe front', type: 'range', min: -0.5, max: 0.5, step: 0.02, fmt: (v) => v.toFixed(2) + '°' },
      { p: 'suspension.toeR', label: 'Toe rear', type: 'range', min: -0.5, max: 0.5, step: 0.02, fmt: (v) => v.toFixed(2) + '°' },
    ] },
    { id: 'tyres', label: 'Tyres & Brakes', items: [
      { p: 'tyres.compound', label: 'Compound', type: 'select', options: () => opts(C.COMPOUNDS) },
      { p: 'tyres.widthF', label: 'Width front', type: 'range', step: 5, range: (s) => [155, ch(s).maxTyreWidth + kit(s).tyreAdd], fmt: (v) => v + ' mm' },
      { p: 'tyres.widthR', label: 'Width rear', type: 'range', step: 5, range: (s) => [155, ch(s).maxTyreWidth + kit(s).tyreAdd], fmt: (v) => v + ' mm' },
      { p: 'brakes.kit', label: 'Brakes', type: 'select', options: () => opts(C.BRAKES) },
      { p: 'brakes.bias', label: 'Brake bias', type: 'range', min: 0.5, max: 0.8, step: 0.01, fmt: (v) => `${Math.round(v * 100)}% F` },
    ] },
    { id: 'aero', label: 'Aero & Body', items: [
      { p: 'aero.bodyKit', label: 'Body kit', type: 'select', options: () => opts(C.BODY_KITS) },
      { p: 'aero.splitter', label: 'Front splitter', type: 'select', options: () => opts(C.SPLITTERS) },
      { p: 'aero.wing', label: 'Rear wing', type: 'select', options: () => opts(C.WINGS) },
      { p: 'aero.wingAngle', label: 'Wing angle', type: 'range', min: 0, max: 15, step: 0.5, fmt: (v) => v + '°', when: (s) => (C.WINGS[s.aero.wing] || {}).adjustable },
      { p: 'aero.diffuser', label: 'Diffuser', type: 'select', options: () => opts(C.DIFFUSERS) },
      { p: 'color', label: 'Paint', type: 'color' },
    ] },
    { id: 'weight', label: 'Weight & Electronics', items: [
      { p: 'weight.reduction', label: 'Weight reduction', type: 'select', options: () => opts(C.WEIGHT_REDUCTION) },
      { p: 'weight.ballastKg', label: 'Ballast', type: 'range', min: 0, max: 150, step: 5, fmt: (v) => v + ' kg' },
      { p: 'weight.ballastPos', label: 'Ballast position', type: 'range', min: 0, max: 1, step: 0.05, fmt: (v) => (v < 0.5 ? `rear ${Math.round((1 - v) * 100)}%` : `front ${Math.round(v * 100)}%`) },
      { p: 'electronics', label: 'Driver aids', type: 'select', options: () => opts(C.ELECTRONICS) },
    ] },
    { id: 'ev', label: 'EV', when: isEV, items: [
      { p: 'ev.front', label: 'Front motor', type: 'select', options: () => [{ value: '', label: 'None' }, ...opts(C.EV_MOTORS)], nullable: true },
      { p: 'ev.rear', label: 'Rear motor', type: 'select', options: () => [{ value: '', label: 'None' }, ...opts(C.EV_MOTORS)], nullable: true },
      { p: 'ev.battery', label: 'Battery', type: 'select', options: () => opts(C.EV_BATTERIES) },
    ] },
  ];
}

function loadStore() { try { return JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch { return {}; } }
function saveStore(o) { try { localStorage.setItem(STORE, JSON.stringify(o)); } catch { /* storage unavailable */ } }

export function loadCurrentSpec(fallback) {
  try { const s = JSON.parse(localStorage.getItem(CUR) || 'null'); if (s && s.chassis) return s; } catch { /* ignore */ }
  return JSON.parse(JSON.stringify(fallback));
}
export function saveCurrentSpec(spec) { try { localStorage.setItem(CUR, JSON.stringify(spec)); } catch { /* ignore */ } }

/** Combine the engine curves of all power units (EV dual motor) at matching rpm. */
export function combinedCurve(sim, params) {
  const units = params.powerUnits || []; if (!units.length) return [];
  const curves = units.map((u) => { try { return sim.engineCurve(u.engine); } catch (e) { console.error(e); return []; } });
  if (curves.length === 1) return curves[0];
  const base = curves[0]; return base.map((p, i) => ({ rpm: p.rpm, torque: curves.reduce((a, c) => a + (c[i]?.torque || 0), 0), powerKW: curves.reduce((a, c) => a + (c[i]?.powerKW || 0), 0), boostBar: 0 }));
}

registerMode({
  id: 'garage', label: 'Garage', order: 10,
  mount(ctx) {
    const { sim } = ctx; const C = sim.catalog; const tabs = schema(C);
    const spec = ctx.state.spec; let tab = ctx.state.garageTab || 'chassis';
    const root = document.createElement('div'); root.className = 'garage'; ctx.panel.appendChild(root);
    root.innerHTML = `
      <aside class="g-panel panel">
        <div class="g-head">
          <input class="g-name" maxlength="40" aria-label="Build name" />
          <div class="g-head-row">
            <select class="g-presets" aria-label="Presets"></select>
            <button class="btn ghost g-random" title="Randomise">🎲</button>
          </div>
          <div class="g-head-row g-store">
            <select class="g-saved" aria-label="Saved builds"></select>
            <button class="btn ghost g-save">Save</button><button class="btn ghost g-del" title="Delete saved build">✕</button>
            <button class="btn ghost g-export" title="Export JSON">Export</button><label class="btn ghost g-import" title="Import JSON">Import<input type="file" accept="application/json,.json" hidden></label>
          </div>
        </div>
        <nav class="g-tabs"></nav>
        <div class="g-body"></div>
        <div class="g-foot"><button class="btn primary g-drive">Drive</button><button class="btn g-race">Race</button></div>
      </aside>
      <section class="g-summary panel glass">
        <div class="g-title"><b class="g-car-name"></b><span class="g-price"></span></div>
        <div class="g-stats"></div>
        <div class="g-warn"></div>
        <canvas class="g-chart"></canvas>
        <canvas class="g-diagram"></canvas>
      </section>`;
    const $ = (s) => root.querySelector(s);
    this._root = root;
    // presets
    const pSel = $('.g-presets');
    pSel.innerHTML = `<option value="">Load preset…</option>` + sim.PRESETS.map((p) => `<option value="${esc(p.key)}">${esc(p.label)}</option>`).join('');
    pSel.onchange = () => { const p = sim.PRESETS.find((x) => x.key === pSel.value); if (p) replaceSpec(p.spec); pSel.value = ''; };
    const refreshSaved = () => { const st = loadStore(); $('.g-saved').innerHTML = `<option value="">My builds (${Object.keys(st).length})</option>` + Object.keys(st).map((k) => `<option>${esc(k)}</option>`).join(''); };
    refreshSaved();
    $('.g-saved').onchange = (e) => { const st = loadStore(); const s = st[e.target.value]; if (s) replaceSpec(s); };
    $('.g-save').onclick = () => { const st = loadStore(); const name = (spec.name || 'Build').trim() || 'Build'; st[name] = JSON.parse(JSON.stringify(spec)); saveStore(st); refreshSaved(); ctx.toast(`Saved “${name}”`); };
    $('.g-del').onclick = () => { const k = $('.g-saved').value; if (!k) return; const st = loadStore(); delete st[k]; saveStore(st); refreshSaved(); ctx.toast(`Deleted “${k}”`); };
    $('.g-export').onclick = () => {
      const blob = new Blob([JSON.stringify(spec, null, 2)], { type: 'application/json' }); const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = (spec.name || 'car').replace(/[^\w-]+/g, '_') + '.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    };
    $('.g-import input').onchange = async (e) => {
      const f = e.target.files[0]; if (!f) return;
      try { const s = JSON.parse(await f.text()); replaceSpec(s.spec && s.spec.chassis ? s.spec : s); ctx.toast('Imported build'); } catch (err) { ctx.toast('Import failed: ' + err.message); }
      e.target.value = '';
    };
    $('.g-random').onclick = () => { const p = sim.PRESETS[(Math.random() * sim.PRESETS.length) | 0]; if (p) { const s = JSON.parse(JSON.stringify(p.spec)); s.color = `hsl(${(Math.random() * 360) | 0},70%,45%)`; s.color = hslToHex(s.color); replaceSpec(s); } };
    $('.g-name').value = spec.name || ''; $('.g-name').oninput = (e) => { spec.name = e.target.value; $('.g-car-name').textContent = spec.name; schedule(); };
    $('.g-drive').onclick = () => ctx.switchMode('drive');
    $('.g-race').onclick = () => ctx.switchMode('race');

    const replaceSpec = (s) => {
      const copy = JSON.parse(JSON.stringify(s)); for (const k of Object.keys(spec)) delete spec[k];
      Object.assign(spec, sim.normalizeSpec ? safeNorm(sim, copy) : copy);
      $('.g-name').value = spec.name || ''; renderTabs(); renderBody(); rebuild(true);
    };

    const renderTabs = () => {
      const nav = $('.g-tabs'); const vis = tabs.filter((t) => !t.when || t.when(spec));
      if (!vis.find((t) => t.id === tab)) tab = vis[0].id;
      nav.innerHTML = vis.map((t) => `<button class="tab ${t.id === tab ? 'on' : ''}" data-t="${t.id}">${t.label}</button>`).join('');
      nav.onclick = (e) => { const b = e.target.closest('.tab'); if (!b) return; tab = b.dataset.t; ctx.state.garageTab = tab; renderTabs(); renderBody(); };
    };
    const renderBody = () => {
      const t = tabs.find((x) => x.id === tab); const body = $('.g-body');
      const html = [];
      for (const it of t.items) {
        if (it.when && !it.when(spec)) continue;
        const val = get(spec, it.p); const id = 'f_' + it.p.replace(/\./g, '_');
        if (it.type === 'select') {
          html.push(`<label class="f"><span>${it.label}</span><select id="${id}" data-p="${it.p}" ${it.nullable ? 'data-null="1"' : ''}>${it.options(spec).map((o) => `<option value="${esc(o.value)}" ${String(val ?? '') === String(o.value) ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}</select></label>`);
        } else if (it.type === 'seg') {
          html.push(`<div class="f"><span>${it.label}</span><div class="seg" data-p="${it.p}">${it.options(spec).map((o) => `<button class="${val === o.value ? 'on' : ''}" data-v="${esc(o.value)}">${esc(o.label)}</button>`).join('')}</div></div>`);
        } else if (it.type === 'range') {
          const [mn, mx] = it.range ? it.range(spec) : [it.min, it.max]; const v = clamp(Number(val ?? mn), mn, mx);
          const fmt = it.fmt ? it.fmt(v) : `${v}${it.unit ? ' ' + it.unit : ''}`;
          html.push(`<label class="f range"><span>${it.label}<output>${fmt}</output></span><input type="range" id="${id}" data-p="${it.p}" min="${mn}" max="${mx}" step="${it.step}" value="${v}" ${mn === mx ? 'disabled' : ''}></label>`);
        } else if (it.type === 'toggle') {
          html.push(`<label class="f toggle"><span>${it.label}</span><input type="checkbox" data-p="${it.p}" ${val ? 'checked' : ''}><i></i></label>`);
        } else if (it.type === 'color') {
          const sw = ['#d0302a', '#f2f2ee', '#111316', '#1f4fbf', '#ffb020', '#2e8b57', '#ff5a36', '#7a2cbf', '#8a9099', '#00a6b4'];
          html.push(`<div class="f"><span>${it.label}</span><div class="swatches">${sw.map((c) => `<button class="sw ${String(val).toLowerCase() === c ? 'on' : ''}" style="background:${c}" data-c="${c}" aria-label="${c}"></button>`).join('')}<input type="color" data-p="${it.p}" value="${esc(toHex(val))}"></div></div>`);
        }
      }
      if (tab === 'engine' || tab === 'induction') html.push(`<p class="hint">Changes to boost, fuel and internals interact: watch the warnings and the knock/damage readouts on track.</p>`);
      if (tab === 'ev') html.push(`<p class="hint">At least one motor is required. Front + rear = AWD with independent motors.</p>`);
      body.innerHTML = html.join('');
      // events
      body.querySelectorAll('select[data-p]').forEach((el) => el.onchange = () => { set(spec, el.dataset.p, el.dataset.null && el.value === '' ? null : el.value); onStructural(el.dataset.p); });
      body.querySelectorAll('input[type=range]').forEach((el) => el.oninput = () => {
        const v = Number(el.value); set(spec, el.dataset.p, v); const it = t.items.find((x) => x.p === el.dataset.p);
        el.previousElementSibling.querySelector('output').textContent = it.fmt ? it.fmt(v) : `${v}${it.unit ? ' ' + it.unit : ''}`; schedule();
      });
      body.querySelectorAll('.seg').forEach((el) => el.onclick = (e) => { const b = e.target.closest('button'); if (!b) return; set(spec, el.dataset.p, b.dataset.v); onStructural(el.dataset.p); });
      body.querySelectorAll('input[type=checkbox]').forEach((el) => el.onchange = () => { set(spec, el.dataset.p, el.checked); schedule(); });
      body.querySelectorAll('.sw').forEach((el) => el.onclick = () => { spec.color = el.dataset.c; renderBody(); schedule(); });
      body.querySelectorAll('input[type=color]').forEach((el) => el.oninput = () => { spec.color = el.value; schedule(); });
    };
    const onStructural = (p) => {
      // keep dependent values valid
      if (p === 'engine.layout') { const L = C.LAYOUTS[spec.engine.layout]; spec.engine.displacement = clamp(spec.engine.displacement, L.disp[0], L.disp[1]); }
      if (p === 'engine.induction') { const I = C.INDUCTION[spec.engine.induction]; spec.engine.boost = I.kind === 'na' ? 0 : Math.min(spec.engine.boost || I.maxBoost * 0.7, I.maxBoost) || I.maxBoost * 0.7; }
      if (p === 'chassis') { const ch = C.CHASSIS[spec.chassis]; if (!ch.placements.includes(spec.engine.placement)) spec.engine.placement = ch.placements[0]; }
      if (p === 'powertrain') { spec.ev = spec.ev || { front: null, rear: 'large', battery: 'b80' }; if (spec.powertrain === 'ev') { spec.drivetrain.finalDrive = clamp(spec.drivetrain.finalDrive, 6, 12) === spec.drivetrain.finalDrive ? spec.drivetrain.finalDrive : 9; } else spec.drivetrain.finalDrive = clamp(spec.drivetrain.finalDrive, 2.5, 5.5) === spec.drivetrain.finalDrive ? spec.drivetrain.finalDrive : 3.9; }
      if (p === 'suspension.dampers') { const r = C.DAMPERS[spec.suspension.dampers].range; spec.suspension.damping = clamp(spec.suspension.damping, r[0], r[1]); }
      renderTabs(); renderBody(); schedule();
    };

    let timer = 0; let lastRenderKey = '';
    const schedule = () => { clearTimeout(timer); timer = setTimeout(() => rebuild(false), 50); };
    const rebuild = (force) => {
      let params;
      try { params = sim.build(spec); } catch (err) { console.error('[garage] build failed', err); $('.g-warn').innerHTML = `<div class="err">Build failed: ${esc(err.message)}</div>`; return; }
      ctx.state.params = params; saveCurrentSpec(spec);
      const sm = params.summary || {};
      $('.g-car-name').textContent = spec.name || 'Unnamed'; $('.g-price').textContent = gbp(params.price ?? sm.price ?? 0);
      const stat = (k, v, u = '') => `<div class="stat"><span>${k}</span><b>${v}<small>${u}</small></b></div>`;
      $('.g-stats').innerHTML = [
        stat('Power', Math.round(sm.powerKW || 0), ` kW · ${Math.round((sm.powerKW || 0) * 1.341)} hp`),
        stat('Torque', Math.round(sm.torqueNm || 0), ' Nm'),
        stat('Mass', Math.round(sm.mass || params.mass?.total || 0), ' kg'),
        stat('Front weight', Math.round((sm.weightDistFront || 0) * 100), ' %'),
        stat('Power / weight', Math.round(sm.powerToWeight || 0), ' kW/t'),
        stat('Top speed est.', Math.round(sm.topSpeedEstKph || 0), ' km/h'),
        stat('Drive', sm.drivetrain || params.drivetrain?.layout || '–', ''),
        stat('Peak power at', Math.round(sm.peakPowerRpm || 0), ' rpm'),
      ].join('');
      const w = (params.errors || []).map((e) => `<div class="err">${esc(e)}</div>`).concat((params.warnings || []).map((e) => `<div class="wrn">${esc(e)}</div>`));
      $('.g-warn').innerHTML = w.join('') || '<div class="ok">No warnings — build is consistent.</div>';
      // charts
      const curve = combinedCurve(sim, params);
      drawEngineChart($('.g-chart'), curve, params);
      drawWeightDiagram($('.g-diagram'), params);
      // 3D preview (rebuild only when visual inputs change)
      const key = JSON.stringify([params.render, params.geometry?.wheelbase, params.geometry?.a, params.geometry?.trackF, params.geometry?.trackR, params.geometry?.cgHeight, spec.aero?.wingAngle]);
      if (force || key !== lastRenderKey) { lastRenderKey = key; ctx.world.setStudioCar(params); }
      ctx.audio.setCar(params);
    };
    this._rebuild = rebuild;
    renderTabs(); renderBody(); rebuild(true);
    ctx.world.setActive('studio');
    const cam = ctx.world.camera; cam.position.set(6.2, 2.2, 6.4); ctx.world.rig.orbit.target.set(0, 0.55, 0); cam.fov = 38; cam.updateProjectionMatrix(); ctx.world.rig.fov = 38;
    this._onResize = () => { if (ctx.state.params) { drawEngineChart($('.g-chart'), combinedCurve(sim, ctx.state.params), ctx.state.params); drawWeightDiagram($('.g-diagram'), ctx.state.params); } };
    window.addEventListener('resize', this._onResize);
    ctx.hud.show(false); ctx.input.setDriving(false); ctx.input.enabled = false;
  },
  update(ctx, dt) { ctx.world.frame(dt, (cv) => cv.vehicle); },
  unmount(ctx) { window.removeEventListener('resize', this._onResize); ctx.world.setActive('track'); ctx.input.enabled = true; },
});

function safeNorm(sim, s) { try { return sim.normalizeSpec(s) || s; } catch { return s; } }
function toHex(c) { if (/^#[0-9a-f]{6}$/i.test(c)) return c; const d = document.createElement('canvas').getContext('2d'); d.fillStyle = c || '#cc3333'; return d.fillStyle; }
function hslToHex(c) { return toHex(c); }
