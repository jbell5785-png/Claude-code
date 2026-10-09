// Garage charts: power/torque/boost vs rpm, and a side-view weight/CG diagram.
const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);

function prep(canvas, h) {
  const w = Math.max(220, Math.round(canvas.clientWidth || canvas.parentElement.clientWidth - 24));
  const dpr = Math.min(window.devicePixelRatio || 1, 2); canvas.width = w * dpr; canvas.height = h * dpr; canvas.style.height = h + 'px';
  const g = canvas.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h); return { g, w, h };
}
const niceMax = (v) => { const p = Math.pow(10, Math.floor(Math.log10(Math.max(v, 1)))); const m = v / p; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p; };

const COL = { power: '#ff5a36', torque: '#3fa9ff', boost: '#ffb020', grid: 'rgba(255,255,255,0.07)', text: 'rgba(201,210,222,0.85)', muted: 'rgba(201,210,222,0.5)' };

export function drawEngineChart(canvas, curve, params) {
  const { g, w, h } = prep(canvas, 190);
  if (!curve || !curve.length) { g.fillStyle = COL.muted; g.fillText('No engine curve', 10, 20); return; }
  const L = 40, R = 40, T = 22, B = 26; const pw = w - L - R, ph = h - T - B;
  const rMax = curve[curve.length - 1].rpm; const rMin = 0;
  let pMax = 0, tMax = 0, bMax = 0; for (const p of curve) { pMax = Math.max(pMax, p.powerKW); tMax = Math.max(tMax, p.torque); bMax = Math.max(bMax, p.boostBar || 0); }
  const yMax = niceMax(Math.max(pMax, tMax) * 1.08);
  const X = (r) => L + ((r - rMin) / (rMax - rMin || 1)) * pw, Y = (v) => T + ph - (v / yMax) * ph;
  g.font = '600 10px Inter, system-ui, sans-serif'; g.textBaseline = 'middle';
  // grid
  for (let k = 0; k <= 4; k++) { const v = (yMax * k) / 4; g.strokeStyle = COL.grid; g.beginPath(); g.moveTo(L, Y(v)); g.lineTo(L + pw, Y(v)); g.stroke(); g.fillStyle = COL.muted; g.textAlign = 'right'; g.fillText(String(Math.round(v)), L - 6, Y(v)); }
  const rStep = rMax > 12000 ? 4000 : rMax > 6000 ? 2000 : 1000; g.textAlign = 'center';
  for (let r = 0; r <= rMax; r += rStep) { g.fillStyle = COL.muted; g.fillText(String(r / 1000) + 'k', X(r), T + ph + 14); }
  // redline
  const ep = params.powerUnits?.[0]?.engine || {};
  if (!ep.isEV && ep.redlineRpm) { g.fillStyle = 'rgba(226,59,46,0.12)'; g.fillRect(X(ep.redlineRpm), T, L + pw - X(ep.redlineRpm), ph); }
  // boost (secondary axis)
  if (bMax > 0.01) {
    const bTop = niceMax(bMax * 1.15); const YB = (v) => T + ph - (v / bTop) * ph;
    g.setLineDash([4, 4]); g.strokeStyle = COL.boost; g.lineWidth = 1.5; g.beginPath(); curve.forEach((p, i) => (i ? g.lineTo(X(p.rpm), YB(p.boostBar || 0)) : g.moveTo(X(p.rpm), YB(p.boostBar || 0)))); g.stroke(); g.setLineDash([]);
    g.textAlign = 'left'; g.fillStyle = COL.boost; for (let k = 0; k <= 2; k++) g.fillText((bTop * k / 2).toFixed(1), L + pw + 6, YB(bTop * k / 2));
  }
  const series = (key, col) => {
    g.strokeStyle = col; g.lineWidth = 2.2; g.beginPath(); curve.forEach((p, i) => (i ? g.lineTo(X(p.rpm), Y(p[key])) : g.moveTo(X(p.rpm), Y(p[key])))); g.stroke();
    let best = curve[0]; for (const p of curve) if (p[key] > best[key]) best = p;
    g.fillStyle = col; g.beginPath(); g.arc(X(best.rpm), Y(best[key]), 3.5, 0, Math.PI * 2); g.fill();
    g.textAlign = 'center'; g.fillText(`${Math.round(best[key])}`, clamp(X(best.rpm), L + 14, L + pw - 14), Y(best[key]) - 10);
  };
  series('torque', COL.torque); series('powerKW', COL.power);
  // legend
  g.textAlign = 'left'; let lx = L;
  for (const [t, c] of [['Power kW', COL.power], ['Torque Nm', COL.torque], ...(bMax > 0.01 ? [['Boost bar', COL.boost]] : [])]) { g.fillStyle = c; g.fillRect(lx, 7, 10, 3); g.fillStyle = COL.text; g.fillText(t, lx + 14, 9); lx += g.measureText(t).width + 30; }
}

export function drawWeightDiagram(canvas, params) {
  const { g, w, h } = prep(canvas, 150);
  const geo = params.geometry || {}; const r = params.render || {}; const mass = params.summary?.mass || params.mass?.total || 1000;
  const wb = geo.wheelbase || 2.6, a = geo.a ?? wb / 2, b = geo.b ?? wb / 2; const len = r.length || 4.3, H = r.height || 1.35;
  const fr = params.summary?.weightDistFront ?? b / wb;
  const scale = Math.min((w - 40) / (len + 0.4), (h - 46) / (H + 0.1));
  const ground = h - 22; const cx = w / 2;
  const over = len - wb; const xRear = cx - (wb / 2) * scale, xFront = cx + (wb / 2) * scale;
  const xTail = xRear - over * 0.45 * scale, xNose = xFront + over * 0.55 * scale;
  const R = (r.wheelRadiusF || 0.32) * scale;
  // ground
  g.strokeStyle = 'rgba(255,255,255,0.15)'; g.beginPath(); g.moveTo(10, ground); g.lineTo(w - 10, ground); g.stroke();
  // body silhouette
  g.fillStyle = 'rgba(232,237,243,0.10)'; g.strokeStyle = 'rgba(232,237,243,0.45)'; g.lineWidth = 1.2;
  const bodyB = ground - R * 0.55, beltY = ground - H * 0.62 * scale, roofY = ground - H * scale;
  g.beginPath(); g.moveTo(xTail, bodyB); g.lineTo(xTail, beltY + 8); g.quadraticCurveTo(xTail, beltY, xTail + 12, beltY);
  g.lineTo(cx - len * 0.12 * scale, beltY); g.lineTo(cx - len * 0.04 * scale, roofY); g.lineTo(cx + len * 0.12 * scale, roofY); g.lineTo(cx + len * 0.25 * scale, beltY + 2);
  g.lineTo(xNose - 10, beltY + 10); g.quadraticCurveTo(xNose, beltY + 14, xNose, bodyB - 4); g.lineTo(xNose, bodyB); g.closePath(); g.fill(); g.stroke();
  for (const x of [xRear, xFront]) { g.fillStyle = '#0b0d11'; g.beginPath(); g.arc(x, ground - R, R, 0, Math.PI * 2); g.fill(); g.strokeStyle = 'rgba(232,237,243,0.6)'; g.stroke(); g.beginPath(); g.arc(x, ground - R, R * 0.55, 0, Math.PI * 2); g.stroke(); }
  // CG marker (x from rear axle = b)
  const cgX = xRear + b * scale, cgY = ground - (geo.cgHeight || 0.45) * scale; const cr = 8;
  g.fillStyle = '#ffffff'; g.beginPath(); g.arc(cgX, cgY, cr, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#0b0d11'; g.beginPath(); g.moveTo(cgX, cgY); g.arc(cgX, cgY, cr, 0, Math.PI / 2); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(cgX, cgY); g.arc(cgX, cgY, cr, Math.PI, Math.PI * 1.5); g.closePath(); g.fill();
  g.font = '600 10px Inter, system-ui, sans-serif'; g.fillStyle = 'rgba(201,210,222,0.85)'; g.textAlign = 'center';
  g.fillText(`CG ${(geo.cgHeight || 0).toFixed(2)} m`, cgX, cgY - 14);
  // axle loads
  const arrow = (x, kg, pct) => {
    g.strokeStyle = '#ff5a36'; g.fillStyle = '#ff5a36'; g.lineWidth = 2; const y0 = ground - 2 * R - 30, y1 = ground - 2 * R - 6;
    g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y1); g.stroke(); g.beginPath(); g.moveTo(x - 4, y1 - 6); g.lineTo(x + 4, y1 - 6); g.lineTo(x, y1); g.fill();
    g.fillStyle = '#fff'; g.font = '700 11px Inter, system-ui, sans-serif'; g.fillText(`${Math.round(kg)} kg`, x, y0 - 14); g.fillStyle = 'rgba(201,210,222,0.75)'; g.font = '600 10px Inter, system-ui, sans-serif'; g.fillText(`${Math.round(pct * 100)}%`, x, y0 - 3);
  };
  arrow(xFront, mass * fr, fr); arrow(xRear, mass * (1 - fr), 1 - fr);
  g.fillStyle = 'rgba(201,210,222,0.6)'; g.fillText(`wheelbase ${wb.toFixed(2)} m`, cx, ground + 13);
}
