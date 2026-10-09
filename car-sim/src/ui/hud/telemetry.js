// Telemetry panel (toggle with T): tyre cards with friction circles, g-g diagram, rolling traces,
// suspension travel and engine readouts.
const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
const NAMES = ['FL', 'FR', 'RL', 'RR'];
const DEG = 180 / Math.PI;

function hidpi(canvas, w, h) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2); canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
  canvas.style.width = w + 'px'; canvas.style.height = h + 'px'; const g = canvas.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); return g;
}

/** Temperature → colour (blue cold, green optimal, red hot) relative to the tyre's optimum. */
export function tempColor(T, tOpt = 80, win = 30) {
  const x = clamp((T - tOpt) / (win * 1.5), -1, 1);
  if (x < 0) { const t = -x; return `rgb(${Math.round(60 + 0 * t)},${Math.round(200 - 80 * t)},${Math.round(110 + 145 * t)})`; }
  return `rgb(${Math.round(60 + 195 * x)},${Math.round(200 - 140 * x)},${Math.round(110 - 70 * x)})`;
}

class Ring {
  constructor(n, k) { this.n = n; this.k = k; this.d = new Float32Array(n * k); this.i = 0; this.len = 0; }
  push(...v) { for (let j = 0; j < this.k; j++) this.d[this.i * this.k + j] = v[j]; this.i = (this.i + 1) % this.n; this.len = Math.min(this.len + 1, this.n); }
  get(age, j) { const idx = (this.i - 1 - age + this.n * 2) % this.n; return this.d[idx * this.k + j]; }
}

export class Telemetry {
  constructor(root) {
    const el = document.createElement('div'); el.className = 'telemetry panel glass'; el.innerHTML = `
      <div class="tm-head"><b>Telemetry</b><span class="tm-hint">T to hide</span></div>
      <div class="tm-tyres">${NAMES.map((n, i) => `
        <div class="tyre-card" data-i="${i}">
          <div class="tc-top"><b>${n}</b><span class="tc-surf"></span></div>
          <div class="tc-body">
            <div class="tc-tyre"><i class="t-in"></i><i class="t-mid"></i><i class="t-out"></i></div>
            <canvas class="fc"></canvas>
          </div>
          <div class="tc-rows mono">
            <span>Fz</span><b class="fz"></b><span>α</span><b class="sa"></b>
            <span>κ</span><b class="sr"></b><span>T</span><b class="tt"></b>
            <span>wear</span><b class="wr"></b><span>brk</span><b class="bt"></b>
          </div>
          <div class="usage"><i></i></div>
          <div class="susp"><i></i></div>
        </div>`).join('')}
      </div>
      <div class="tm-row"><canvas class="gg"></canvas><div class="eng mono"></div></div>
      <canvas class="traces"></canvas>`;
    root.appendChild(el); this.el = el; this.visible = false;
    this.cards = [...el.querySelectorAll('.tyre-card')].map((c) => ({
      el: c, fc: hidpi(c.querySelector('.fc'), 62, 62), fz: c.querySelector('.fz'), sa: c.querySelector('.sa'), sr: c.querySelector('.sr'), tt: c.querySelector('.tt'),
      wr: c.querySelector('.wr'), bt: c.querySelector('.bt'), usage: c.querySelector('.usage i'), susp: c.querySelector('.susp i'), surf: c.querySelector('.tc-surf'),
      bands: [...c.querySelectorAll('.tc-tyre i')], trail: new Ring(24, 2),
    }));
    this.gg = hidpi(el.querySelector('.gg'), 130, 130); this.eng = el.querySelector('.eng');
    this.trC = el.querySelector('.traces'); this.trW = 0; this.tr = null;
    this.hist = new Ring(600, 4); this.ggHist = new Ring(240, 2); this.acc = 0; this.uiAcc = 0;
  }
  toggle(b = !this.visible) { this.visible = b; this.el.classList.toggle('show', b); if (b) this.resize(); }
  resize() { const w = Math.max(200, this.el.clientWidth - 24); if (w !== this.trW) { this.trW = w; this.tr = hidpi(this.trC, w, 120); } }

  update(dt, v) {
    if (!v) return;
    // sample history at 30 Hz regardless of visibility
    this.acc += dt;
    while (this.acc > 1 / 30) {
      this.acc -= 1 / 30;
      const c = v.controls || {}; this.hist.push(Math.abs(v.speed) * 3.6, c.throttle || 0, c.brake || 0, c.steer || 0);
      this.ggHist.push(v.accBody?.[0] || 0, v.accBody?.[1] || 0);
    }
    if (!this.visible) return;
    this.uiAcc += dt; const slow = this.uiAcc > 0.1; if (slow) this.uiAcc = 0;
    const p = v.params;
    for (let i = 0; i < 4; i++) {
      const w = v.wheels[i]; const C = this.cards[i]; const ax = p.axles?.[i < 2 ? 0 : 1] || {}; const tp = ax.tyre || {};
      const mu = (tp.mu || 1.1); const Fz = Math.max(w.Fz || 0, 1);
      const nx = clamp((w.Fx || 0) / (mu * Fz), -1.5, 1.5), ny = clamp((w.Fy || 0) / (mu * Fz), -1.5, 1.5);
      C.trail.push(nx, ny);
      const g = C.fc; g.clearRect(0, 0, 62, 62); const cx = 31, cy = 31, R = 24;
      g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
      g.beginPath(); g.moveTo(cx - R, cy); g.lineTo(cx + R, cy); g.moveTo(cx, cy - R); g.lineTo(cx, cy + R); g.strokeStyle = 'rgba(255,255,255,0.07)'; g.stroke();
      for (let k = C.trail.len - 1; k >= 0; k--) { const a = 1 - k / C.trail.len; g.fillStyle = `rgba(127,224,255,${a * 0.5})`; g.fillRect(cx - C.trail.get(k, 1) * R - 1, cy - C.trail.get(k, 0) * R - 1, 2, 2); }
      const u = w.usage || 0; g.fillStyle = u > 1 ? '#ff4433' : u > 0.85 ? '#ffb020' : '#7fe0ff';
      g.beginPath(); g.arc(cx - ny * R, cy - nx * R, 3.5, 0, Math.PI * 2); g.fill();
      C.usage.style.transform = `scaleX(${clamp(u, 0, 1.2) / 1.2})`; C.usage.style.background = u > 1 ? '#ff4433' : u > 0.85 ? '#ffb020' : '#3fa9ff';
      const travel = (ax.maxCompression || 0.08) + (ax.maxDroop || 0.1); const comp = (w.compression ?? 0.04);
      C.susp.style.transform = `scaleX(${clamp(comp / Math.max(travel, 0.01), 0, 1)})`;
      const ts = w.tyre || {}; const tOpt = tp.tOpt || 80, tWin = tp.tWindow || 30;
      const Ts = ts.tempSurface ?? ts.surfaceTemp ?? ts.Ts ?? 25, Tc = ts.tempCarcass ?? ts.carcassTemp ?? ts.Tc ?? 25;
      C.bands[0].style.background = tempColor(Ts, tOpt, tWin); C.bands[1].style.background = tempColor(Tc, tOpt, tWin); C.bands[2].style.background = tempColor(Ts, tOpt, tWin);
      if (slow) {
        C.fz.textContent = `${(Fz / 1000).toFixed(2)} kN`; C.sa.textContent = `${((w.slipAngle || 0) * DEG).toFixed(1)}°`;
        C.sr.textContent = `${((w.slipRatio || 0) * 100).toFixed(1)}%`; C.tt.textContent = `${Ts.toFixed(0)}/${Tc.toFixed(0)}°`;
        C.wr.textContent = `${((ts.wear || 0) * 100).toFixed(1)}%`; C.bt.textContent = `${(w.brakeTempC || 0).toFixed(0)}°`;
        C.surf.textContent = ['asphalt', 'kerb', 'grass', 'gravel'][w.surface] || ''; C.el.classList.toggle('air', w.contact === false);
      }
    }
    // g-g diagram
    { const g = this.gg; const S = 130, cx = S / 2, cy = S / 2, R = 56, gmax = 2.0 * 9.81;
      g.clearRect(0, 0, S, S); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, 0, S, S);
      g.strokeStyle = 'rgba(255,255,255,0.12)'; g.lineWidth = 1;
      for (const r of [0.5, 1, 1.5, 2]) { g.beginPath(); g.arc(cx, cy, R * r / 2, 0, Math.PI * 2); g.stroke(); }
      g.beginPath(); g.moveTo(cx - R, cy); g.lineTo(cx + R, cy); g.moveTo(cx, cy - R); g.lineTo(cx, cy + R); g.stroke();
      for (let k = this.ggHist.len - 1; k >= 0; k--) { const a = 1 - k / this.ggHist.len; g.fillStyle = `rgba(255,90,54,${a * 0.6})`; g.fillRect(cx - this.ggHist.get(k, 1) / gmax * R - 1, cy - this.ggHist.get(k, 0) / gmax * R - 1, 2, 2); }
      const ax = v.accBody?.[0] || 0, ay = v.accBody?.[1] || 0; g.fillStyle = '#fff'; g.beginPath(); g.arc(cx - ay / gmax * R, cy - ax / gmax * R, 4, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(201,210,222,0.8)'; g.font = '600 10px Inter, system-ui, sans-serif'; g.fillText(`${(Math.hypot(ax, ay) / 9.81).toFixed(2)} g`, 6, 14); g.fillText('g-g', S - 24, 14);
    }
    // engine readouts
    if (slow) {
      const es = v.engines?.[0] || {}; const ep = p.powerUnits?.[0]?.engine || {};
      const rows = ep.isEV ? [
        ['Motor', `${Math.round(es.rpm || 0)} rpm`], ['Torque', `${Math.round(es.torque || 0)} Nm`], ['Power', `${Math.round(es.powerKW || 0)} kW`],
        ['Battery', `${(es.batteryKwh ?? 0).toFixed(1)} kWh`], ['SoC', `${Math.round((es.soc ?? 0) * 100)}%`], ['Gear', String(v.gear)],
      ] : [
        ['Engine', `${Math.round(es.rpm || 0)} rpm`], ['Torque', `${Math.round(es.torque || 0)} Nm`], ['Power', `${Math.round(es.powerKW || 0)} kW`],
        ['Boost', `${(es.boostBar || 0).toFixed(2)} bar`], ['Charge T', `${(es.chargeTempC ?? 0).toFixed(0)} °C`], ['Knock ret.', `${Math.round((es.knockRetard || 0) * 100)}%`],
        ['Fuel flow', `${(es.fuelFlowGs || 0).toFixed(1)} g/s`], ['Fuel', `${(es.fuelKg ?? 0).toFixed(1)} kg`], ['Damage', `${((es.damage || 0) * 100).toFixed(1)}%`],
        ['Clutch', `${Math.round((v.clutch ?? 1) * 100)}%`],
      ];
      rows.push(['Speed', `${(Math.abs(v.speed) * 3.6).toFixed(0)} km/h`]);
      this.eng.innerHTML = rows.map(([k, val]) => `<span>${k}</span><b>${val}</b>`).join('') + (es.failed ? '<span class="crit">FAILED</span><b></b>' : '');
    }
    // traces
    if (this.tr) {
      const g = this.tr; const W = this.trW, H = 120; g.clearRect(0, 0, W, H); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, 0, W, H);
      const n = Math.min(this.hist.len, 300); const vmax = Math.max(100, Math.ceil((v.params.summary?.topSpeedEstKph || 250) / 50) * 50);
      const line = (j, col, f, w = 1.5) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); for (let k = 0; k < n; k++) { const x = W - (k / 300) * W; const y = f(this.hist.get(k, j)); k ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); };
      g.strokeStyle = 'rgba(255,255,255,0.07)'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, H / 2); g.lineTo(W, H / 2); g.stroke();
      line(1, '#3ddc84', (x) => H - 4 - x * (H - 8) * 0.45);
      line(2, '#ff4433', (x) => H - 4 - x * (H - 8) * 0.45);
      line(3, '#ffd23f', (x) => H / 2 - x * (H / 2 - 6));
      line(0, '#ffffff', (x) => H - 4 - (x / vmax) * (H - 8), 2);
      g.font = '600 10px Inter, system-ui, sans-serif';
      [['speed', '#fff'], ['throttle', '#3ddc84'], ['brake', '#ff4433'], ['steer', '#ffd23f']].forEach(([t, c], k) => { g.fillStyle = c; g.fillText(t, 6 + k * 58, 12); });
    }
  }
}
