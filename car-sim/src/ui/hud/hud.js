// Driving HUD: analogue tach with redline, digital speed + gear, boost gauge, fuel/battery,
// aids lights, warnings, lap timer with sectors, minimap.
const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);

export function fmtTime(t) {
  if (t == null || !isFinite(t)) return '–:––.–––';
  const m = Math.floor(t / 60); const s = t - m * 60;
  return `${m}:${s < 10 ? '0' : ''}${s.toFixed(3)}`;
}
function fmtDelta(d) { return (d >= 0 ? '+' : '−') + Math.abs(d).toFixed(3); }

function hidpi(canvas, w, h) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2); canvas.width = w * dpr; canvas.height = h * dpr; canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
  const g = canvas.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); return g;
}

export class Hud {
  constructor(root) {
    const el = document.createElement('div'); el.className = 'hud'; el.innerHTML = `
      <div class="hud-tl"><canvas class="minimap"></canvas></div>
      <div class="hud-tr panel glass lap">
        <div class="lap-row"><span class="lbl">LAP</span><span class="lap-n">–</span><span class="pos"></span></div>
        <div class="lap-cur mono">–:––.–––</div>
        <div class="lap-delta mono"></div>
        <div class="sectors"><span class="sec s0">S1</span><span class="sec s1">S2</span><span class="sec s2">S3</span></div>
        <div class="lap-grid mono"><span class="lbl">LAST</span><span class="lap-last">–</span><span class="lbl">BEST</span><span class="lap-best">–</span></div>
      </div>
      <div class="hud-center"><div class="banner"></div><div class="sub-banner"></div></div>
      <div class="hud-br">
        <div class="warn-row"></div>
        <div class="dash">
          <canvas class="tach"></canvas>
          <div class="dash-side">
            <div class="aids"><span class="aid abs">ABS</span><span class="aid tc">TC</span><span class="aid lc">LC</span><span class="aid gm">AUTO</span></div>
            <canvas class="boost"></canvas>
            <div class="fuel"><span class="fuel-lbl">FUEL</span><div class="bar"><i></i></div><span class="fuel-val mono"></span></div>
            <div class="nos-bar"><span>N₂O</span><div class="bar"><i></i></div></div>
          </div>
        </div>
      </div>`;
    root.appendChild(el); this.el = el;
    this.$ = (s) => el.querySelector(s);
    this.tach = this.$('.tach'); this.tg = hidpi(this.tach, 230, 230);
    this.boostC = this.$('.boost'); this.bg = hidpi(this.boostC, 128, 74);
    this.mm = this.$('.minimap'); this.mg = null; this.mmSize = 0;
    this.sectorBest = [Infinity, Infinity, Infinity]; this.lastSector = -1; this.sectorStart = 0; this.lastLapN = -1;
    this.bestLapSplits = null; this.curSplits = []; this.lapStartT = 0;
    this.banner = { text: '', until: 0, cls: '' }; this.lastText = {};
  }
  show(b) { this.el.classList.toggle('show', b); }
  setText(sel, txt) { if (this.lastText[sel] !== txt) { this.lastText[sel] = txt; this.$(sel).textContent = txt; } }

  /** Show a big centred message for `sec` seconds (or until cleared with ''). */
  flash(text, sec = 2, cls = '', sub = '') { this.banner = { text, until: performance.now() + sec * 1000, cls, sub }; }

  setTrack(track) {
    this.track = track; const s = track.samples; let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < s.n; i++) { minX = Math.min(minX, s.x[i]); maxX = Math.max(maxX, s.x[i]); minY = Math.min(minY, s.y[i]); maxY = Math.max(maxY, s.y[i]); }
    const size = matchMedia('(max-width: 640px)').matches ? 110 : 170; this.mmSize = size;
    this.mg = hidpi(this.mm, size, size);
    const sc = (size - 16) / Math.max(maxX - minX, maxY - minY); const ox = (size - (maxX - minX) * sc) / 2, oy = (size - (maxY - minY) * sc) / 2;
    this.mmMap = (x, y) => [ox + (x - minX) * sc, size - (oy + (y - minY) * sc)];
    // pre-render path
    const off = document.createElement('canvas'); const og = hidpi(off, size, size);
    og.lineJoin = 'round'; og.lineCap = 'round';
    const path = () => { og.beginPath(); for (let i = 0; i <= s.n; i++) { const k = i % s.n; const [px, py] = this.mmMap(s.x[k], s.y[k]); i ? og.lineTo(px, py) : og.moveTo(px, py); } };
    og.strokeStyle = 'rgba(0,0,0,0.55)'; og.lineWidth = 7; path(); og.stroke();
    og.strokeStyle = 'rgba(230,236,245,0.85)'; og.lineWidth = 3; path(); og.stroke();
    const [sx, sy] = this.mmMap(s.x[0], s.y[0]); og.fillStyle = '#ff5a36'; og.fillRect(sx - 3, sy - 3, 6, 6);
    this.mmBg = off; this.resetLap();
  }
  resetLap() { for (let k = 0; k < 3; k++) { this.lastText['sec' + k] = null; } }

  /**
   * @param {object} v focused vehicle
   * @param {object} lt its lap timer
   * @param {object} o { others: [{v, color, focus}], position, total, lapsTotal, gearMode, raceTime }
   */
  update(v, lt, o = {}) {
    if (!v) return;
    const p = v.params; const ep = p.powerUnits?.[0]?.engine || {}; const es = v.engines?.[0] || {};
    this.drawTach(v, ep, es); this.drawBoost(es, p);
    // fuel / battery
    const isEV = !!ep.isEV; let frac, txt;
    if (isEV) { frac = es.soc ?? (p.battery ? es.batteryKwh / p.battery.kwh : 0); txt = `${Math.round(frac * 100)}%`; this.setText('.fuel-lbl', 'BATT'); }
    else { const cap = Math.max(1, (p.fuel?.tankKg || 40)); frac = clamp((es.fuelKg ?? cap) / cap, 0, 1); txt = `${((es.fuelKg ?? 0) / (p.fuel?.density || 0.745)).toFixed(1)} L`; this.setText('.fuel-lbl', 'FUEL'); }
    this.$('.fuel i').style.transform = `scaleX(${clamp(frac, 0, 1)})`; this.$('.fuel i').classList.toggle('low', frac < 0.12); this.setText('.fuel-val', txt);
    // nitrous
    { const cap = es.nitrousCapacityKg || 0; const nb = this.$('.nos-bar'); nb.classList.toggle('none', !(cap > 0));
      if (cap > 0) { const f = clamp((es.nitrousKg || 0) / cap, 0, 1); nb.querySelector('i').style.transform = `scaleX(${f})`; nb.classList.toggle('active', !!(es.nitrousActive || (v.controls?.nitrous && f > 0))); } }
    // aids
    const a = v.aids || {}; const el = p.electronics || {};
    this.$('.aid.abs').className = 'aid abs' + (a.absActive ? ' on' : el.abs ? ' avail' : '');
    this.$('.aid.tc').className = 'aid tc' + (a.tcActive ? ' on' : el.tc ? ' avail' : '');
    this.$('.aid.lc').className = 'aid lc' + (a.launchActive ? ' on' : el.launch ? ' avail' : '');
    this.setText('.aid.gm', (o.gearMode || v.controls?.gearMode || 'auto') === 'manual' ? 'MAN' : 'AUTO');
    // warnings
    const w = [];
    if (es.failed || v.failed) w.push(['ENGINE FAILED', 'crit']);
    else if ((es.damage || v.damage || 0) > 0.02) w.push([`DAMAGE ${Math.round((es.damage || v.damage) * 100)}%`, (es.damage || 0) > 0.4 ? 'crit' : 'warn']);
    if ((es.knockRetard || 0) > 0.04) w.push(['KNOCK', 'warn']);
    if (es.overRev) w.push(['OVER-REV', 'crit']);
    if (!isEV && frac < 0.08) w.push(['LOW FUEL', 'warn']);
    if (isEV && frac < 0.08) w.push(['LOW BATT', 'warn']);
    let maxBrake = 0; for (const wh of v.wheels) maxBrake = Math.max(maxBrake, wh.brakeTempC || 0);
    if (maxBrake > (p.axles?.[0]?.brakeFadeStart || 600)) w.push(['BRAKE FADE', 'warn']);
    if (lt && lt.wrongWay) w.push(['WRONG WAY', 'crit']);
    const wk = w.map((x) => x.join(':')).join('|');
    if (wk !== this._wk) { this._wk = wk; this.$('.warn-row').innerHTML = w.map(([t, c]) => `<span class="warn ${c}">${t}</span>`).join(''); }
    // lap timer + sectors
    if (lt) {
      const lapsTotal = o.lapsTotal; const lapN = (lt.lap ?? 0) + 1;
      this.setText('.lap-n', lapsTotal ? `${Math.min(lapN, lapsTotal)}/${lapsTotal}` : String(lapN));
      this.setText('.lap-cur', lt.started === false ? 'OUT LAP' : fmtTime(lt.lapTime));
      this.$('.lap-cur').classList.toggle('invalid', lt.lapValid === false);
      this.setText('.lap-last', fmtTime(lt.lastLap)); this.setText('.lap-best', fmtTime(lt.bestLap));
      this.trackSectors(lt);
      this.setText('.pos', o.position ? `P${o.position}/${o.total}` : '');
    }
    // banner
    const now = performance.now(); const b = this.banner; const showB = b.text && now < b.until;
    this.setText('.banner', showB ? b.text : ''); this.setText('.sub-banner', showB ? (b.sub || '') : '');
    this.$('.banner').className = 'banner ' + (showB ? b.cls : '');
    this.drawMinimap(v, o.others);
  }

  trackSectors(lt) {
    if (!lt.sectorTimes) return;
    const cur = lt.sector ?? 0; const started = lt.started !== false;
    for (let k = 0; k < 3; k++) {
      let t = null, cls = '';
      if (started && k < cur && lt.sectorTimes[k] != null) { t = lt.sectorTimes[k]; const b = lt.bestSectors?.[k]; cls = b != null && t <= b + 1e-6 ? ' best' : ' slower'; }
      else if (k === cur && started) cls = ' cur';
      else if (lt.lastSectors?.[k] != null) { t = lt.lastSectors[k]; cls = ' prev'; }
      const txt = t != null ? t.toFixed(2) : 'S' + (k + 1); const key = 's' + k + cls + txt;
      if (this.lastText['sec' + k] !== key) { this.lastText['sec' + k] = key; const e = this.$('.s' + k); e.className = 'sec s' + k + cls; e.textContent = txt; }
    }
  }

  drawTach(v, ep, es) {
    const g = this.tg; const W = 230, cx = W / 2, cy = W / 2, R = 100;
    g.clearRect(0, 0, W, W);
    const isEV = !!ep.isEV;
    const maxR = Math.ceil(((isEV ? ep.maxRpm : ep.limiterRpm || ep.redlineRpm || 8000) + 400) / 1000) * 1000; const red = isEV ? maxR * 2 : (ep.redlineRpm || maxR - 500);
    const a0 = Math.PI * 0.75, a1 = Math.PI * 2.25; const ang = (r) => a0 + (a1 - a0) * clamp(r / maxR, 0, 1.03);
    // face
    const grd = g.createRadialGradient(cx, cy, 10, cx, cy, R + 12); grd.addColorStop(0, 'rgba(22,26,33,0.92)'); grd.addColorStop(1, 'rgba(8,10,13,0.92)');
    g.fillStyle = grd; g.beginPath(); g.arc(cx, cy, R + 12, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.08)'; g.lineWidth = 1.5; g.stroke();
    // rpm fill arc
    const rpm = es.rpm || 0; g.lineCap = 'butt';
    g.strokeStyle = 'rgba(255,255,255,0.06)'; g.lineWidth = 10; g.beginPath(); g.arc(cx, cy, R - 6, a0, a1); g.stroke();
    const fillG = g.createLinearGradient(0, W, W, 0); fillG.addColorStop(0, '#3fa9ff'); fillG.addColorStop(0.7, '#7fe0ff'); fillG.addColorStop(1, '#ffffff');
    g.strokeStyle = rpm > red ? '#ff4433' : fillG; g.beginPath(); g.arc(cx, cy, R - 6, a0, ang(rpm)); g.stroke();
    // redline band
    if (!isEV) { g.strokeStyle = '#e23b2e'; g.lineWidth = 6; g.beginPath(); g.arc(cx, cy, R + 4, ang(red), a1); g.stroke(); }
    // ticks + labels
    g.fillStyle = '#c9d2de'; g.font = '600 12px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    const step = maxR > 12000 ? 2000 : 1000;
    for (let r = 0; r <= maxR; r += step / 2) {
      const a = ang(r); const major = r % step === 0; const r0 = R - (major ? 16 : 12), r1 = R - 1;
      g.strokeStyle = r >= red ? '#ff6a5a' : major ? '#e8edf3' : 'rgba(232,237,243,0.5)'; g.lineWidth = major ? 2.5 : 1.2;
      g.beginPath(); g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); g.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); g.stroke();
      if (major) { g.fillStyle = r >= red ? '#ff6a5a' : '#c9d2de'; g.fillText(String(r / 1000), cx + Math.cos(a) * (R - 29), cy + Math.sin(a) * (R - 29)); }
    }
    // needle
    const an = ang(rpm); g.strokeStyle = '#ff5a36'; g.lineWidth = 3; g.lineCap = 'round';
    g.beginPath(); g.moveTo(cx - Math.cos(an) * 12, cy - Math.sin(an) * 12); g.lineTo(cx + Math.cos(an) * (R - 8), cy + Math.sin(an) * (R - 8)); g.stroke();
    g.fillStyle = '#1b1f26'; g.beginPath(); g.arc(cx, cy, 9, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#ff5a36'; g.lineWidth = 2; g.stroke();
    // shift light
    if (!isEV && rpm > red * 0.94) { g.fillStyle = (performance.now() / 70 | 0) % 2 ? '#ff3b2f' : '#ffd23f'; g.beginPath(); g.arc(cx, cy - 58, 5, 0, Math.PI * 2); g.fill(); }
    // speed + gear
    const kph = Math.abs(v.speed) * 3.6;
    g.fillStyle = '#ffffff'; g.font = '700 40px Inter, system-ui, sans-serif'; g.fillText(String(Math.round(kph)), cx, cy + 38);
    g.fillStyle = 'rgba(201,210,222,0.7)'; g.font = '600 10px Inter, system-ui, sans-serif'; g.fillText('KM/H', cx, cy + 62);
    const gear = v.gear === -1 ? 'R' : v.gear === 0 ? 'N' : String(v.gear);
    g.fillStyle = v.shifting ? '#7fe0ff' : '#ffd23f'; g.font = '800 30px Inter, system-ui, sans-serif'; g.fillText(isEV && v.gear > 0 ? 'D' : gear, cx + 52, cy - 8);
    g.fillStyle = 'rgba(201,210,222,0.75)'; g.font = '600 10px Inter, system-ui, sans-serif'; g.fillText('×1000 rpm', cx - 48, cy - 8);
  }

  drawBoost(es, p) {
    const g = this.bg; const W = 128, H = 74; g.clearRect(0, 0, W, H);
    const ind = p.powerUnits?.[0]?.engine?.induction; const isEV = !!p.powerUnits?.[0]?.engine?.isEV;
    const cx = W / 2, cy = 58, R = 46;
    g.lineCap = 'round';
    if (isEV || ind === 'na' || !ind) {
      // power meter instead
      const kw = es.powerKW || 0; const max = Math.max(50, p.summary?.powerKW || 200); const f = clamp(kw / max, -0.3, 1);
      g.strokeStyle = 'rgba(255,255,255,0.08)'; g.lineWidth = 8; g.beginPath(); g.arc(cx, cy, R, Math.PI, Math.PI * 2); g.stroke();
      g.strokeStyle = f < 0 ? '#3ddc84' : '#7fe0ff'; g.beginPath(); if (f >= 0) g.arc(cx, cy, R, Math.PI, Math.PI + Math.PI * f); else g.arc(cx, cy, R, Math.PI + Math.PI * f * 0, Math.PI, false); g.stroke();
      g.fillStyle = '#fff'; g.font = '700 16px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.fillText(`${Math.round(kw)}`, cx, cy - 8);
      g.fillStyle = 'rgba(201,210,222,0.7)'; g.font = '600 9px Inter, system-ui, sans-serif'; g.fillText('kW', cx, cy + 6); return;
    }
    const maxB = Math.max(0.5, Math.ceil((p.spec?.engine?.boost || 1.5) * 2) / 2 + 0.5); const b = es.boostBar || 0;
    const a0 = Math.PI, a1 = Math.PI * 2; const ang = (x) => a0 + (a1 - a0) * clamp((x + 0.8) / (maxB + 0.8), 0, 1);
    g.strokeStyle = 'rgba(255,255,255,0.08)'; g.lineWidth = 8; g.beginPath(); g.arc(cx, cy, R, a0, a1); g.stroke();
    g.strokeStyle = b > 0 ? '#ffb020' : '#5c6b7d'; g.beginPath(); g.arc(cx, cy, R, ang(0), ang(b), b < 0); g.stroke();
    g.strokeStyle = '#e8edf3'; g.lineWidth = 2; const z = ang(0); g.beginPath(); g.moveTo(cx + Math.cos(z) * (R - 7), cy + Math.sin(z) * (R - 7)); g.lineTo(cx + Math.cos(z) * (R + 6), cy + Math.sin(z) * (R + 6)); g.stroke();
    g.fillStyle = '#fff'; g.font = '700 16px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.fillText(b.toFixed(2), cx, cy - 8);
    g.fillStyle = 'rgba(201,210,222,0.7)'; g.font = '600 9px Inter, system-ui, sans-serif'; g.fillText('BOOST bar', cx, cy + 6);
  }

  drawMinimap(v, others) {
    if (!this.mg || !this.mmBg) return; const g = this.mg; const S = this.mmSize;
    g.clearRect(0, 0, S, S); g.drawImage(this.mmBg, 0, 0, S, S);
    const dot = (x, y, col, r, ring) => { const [px, py] = this.mmMap(x, y); g.fillStyle = col; g.beginPath(); g.arc(px, py, r, 0, Math.PI * 2); g.fill(); if (ring) { g.strokeStyle = '#fff'; g.lineWidth = 1.5; g.stroke(); } };
    if (others) for (const o of others) if (o.v !== v) dot(o.v.pos[0], o.v.pos[1], o.color || '#aaa', 3.5, false);
    dot(v.pos[0], v.pos[1], '#ff5a36', 5, true);
  }
}
