import { createMusicPlayer, mountMusicWidget, RACE_STATES } from './index.js';

const player = createMusicPlayer({});
mountMusicWidget(document.getElementById('widget'), player);

const $ = (id) => document.getElementById(id);
const statesEl = $('states');
const btns = {};
for (const s of RACE_STATES) {
  const b = document.createElement('button');
  b.textContent = s;
  b.onclick = async () => {
    if (!player.playing) await player.start();
    player.setRaceState(s, s === 'countdown' ? { dropIn: 3 } : undefined);
    mark(s);
  };
  statesEl.appendChild(b);
  btns[s] = b;
}
function mark(s) {
  for (const [k, b] of Object.entries(btns)) b.classList.toggle('on', k === s);
}

$('intensity').oninput = (e) => {
  player.setIntensity(+e.target.value);
  $('ival').textContent = (+e.target.value).toFixed(2);
};
$('drop').onclick = () => player.cueDrop();
$('next').onclick = async () => { if (!player.playing) await player.start(); else player.next(); };

// simulated race start: countdown with the drop landing exactly on "GO"
$('race').onclick = async () => {
  if (!player.playing) await player.start();
  player.setRaceState('countdown', { dropIn: 3 });
  mark('countdown');
  const lights = $('lights');
  const steps = ['3', '2', '1'];
  steps.forEach((s, i) => setTimeout(() => { lights.textContent = s; lights.style.color = '#ff3d6e'; }, i * 1000));
  setTimeout(() => {
    lights.textContent = 'GO!';
    lights.style.color = '#3dff8a';
    player.setRaceState('racing');
    mark('racing');
    setTimeout(() => { lights.textContent = ''; }, 1200);
  }, 3000);
};

function showInfo(np) {
  const el = $('info');
  if (!np) { el.innerHTML = '<span>title</span><b>–</b>'; return; }
  const rows = [['title', np.title], ['style', np.styleLabel || np.style], ['tempo', np.bpm ? np.bpm + ' bpm' : '–'], ['key', np.key || '–']];
  el.innerHTML = rows.map(([k, v]) => `<span>${k}</span><b></b>`).join('');
  el.querySelectorAll('b').forEach((b, i) => { b.textContent = rows[i][1]; });
}
player.onTrackChange(showInfo);

// oscilloscope + spectrum
const canvas = $('scope');
const g = canvas.getContext('2d');
let analyser = null;
function draw() {
  requestAnimationFrame(draw);
  if (!analyser && player.output && player.audioContext) {
    analyser = player.audioContext.createAnalyser();
    analyser.fftSize = 2048;
    player.output.connect(analyser);
  }
  g.fillStyle = '#07080c';
  g.fillRect(0, 0, canvas.width, canvas.height);
  if (!analyser) return;
  const f = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(f);
  const W = canvas.width, H = canvas.height;
  const bars = 96;
  for (let i = 0; i < bars; i++) {
    const lo = Math.floor(Math.pow(f.length, i / bars));
    const hi = Math.max(lo + 1, Math.floor(Math.pow(f.length, (i + 1) / bars)));
    let m = 0;
    for (let k = lo; k < hi; k++) m = Math.max(m, f[k]);
    const h = (m / 255) * H;
    g.fillStyle = `hsl(${340 - i * 1.6},90%,58%)`;
    g.fillRect((i * W) / bars, H - h, W / bars - 2, h);
  }
  const td = new Uint8Array(analyser.fftSize);
  analyser.getByteTimeDomainData(td);
  g.strokeStyle = 'rgba(40,224,255,.8)';
  g.beginPath();
  for (let i = 0; i < td.length; i += 4) {
    const x = (i / td.length) * W;
    const y = (td[i] / 255) * H;
    if (i) g.lineTo(x, y); else g.moveTo(x, y);
  }
  g.stroke();
}
draw();
