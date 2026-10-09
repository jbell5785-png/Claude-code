#!/usr/bin/env node
// Renders the procedural soundtrack offline (OfflineAudioContext in headless Chromium) to WAV
// files in docs/music/ and prints mix statistics (peak, RMS, LUFS, clipping, spectral balance).
//
//   node scripts/render-music.js [--seconds 30] [--seed 7] [--styles dnb,garage] [--no-race]
//
// Uses Playwright from the environment (global install is fine); no npm deps are added.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'docs', 'music');
const args = process.argv.slice(2);
const arg = (name, def) => {
  const i = args.indexOf('--' + name);
  return i >= 0 ? args[i + 1] : def;
};
const SECONDS = +arg('seconds', 30);
const SEED = +arg('seed', 7);
const STYLES = arg('styles', 'acidBreaks,dnb,breaks,garage,acid').split(',');
const RACE = !args.includes('--no-race');
const SR = 48000;

function loadPlaywright() {
  const require = createRequire(import.meta.url);
  const candidates = ['playwright', '/opt/node22/lib/node_modules/playwright', 'playwright-core'];
  for (const c of candidates) {
    try { return require(c); } catch (_) { /* try next */ }
  }
  try {
    const g = require('child_process').execSync('npm root -g').toString().trim();
    return require(path.join(g, 'playwright'));
  } catch (_) { /* noop */ }
  throw new Error('playwright not found');
}

const MIME = { '.js': 'text/javascript', '.html': 'text/html', '.json': 'application/json', '.css': 'text/css' };
function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = decodeURIComponent(req.url.split('?')[0]);
      if (url === '/__render.html') {
        res.writeHead(200, { 'content-type': 'text/html' });
        res.end('<!doctype html><meta charset="utf-8"><title>render</title><body>render</body>');
        return;
      }
      const p = path.join(ROOT, path.normalize(url));
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) {
        res.writeHead(404);
        res.end('not found');
        return;
      }
      res.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

function writeWav(file, b64, channels, sr) {
  const pcm = Buffer.from(b64, 'base64');
  const h = Buffer.alloc(44);
  h.write('RIFF', 0);
  h.writeUInt32LE(36 + pcm.length, 4);
  h.write('WAVE', 8);
  h.write('fmt ', 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(channels, 22);
  h.writeUInt32LE(sr, 24);
  h.writeUInt32LE(sr * channels * 2, 28);
  h.writeUInt16LE(channels * 2, 32);
  h.writeUInt16LE(16, 34);
  h.write('data', 36);
  h.writeUInt32LE(pcm.length, 40);
  fs.writeFileSync(file, Buffer.concat([h, pcm]));
}

// ------------------------------------------------------------------ in-page code
async function renderInPage({ job, sr }) {
  const m = await import('/src/ui/music/index.js');
  const ctx = new OfflineAudioContext(2, Math.floor(sr * job.seconds), sr);
  const player = m.createMusicPlayer({
    audioContext: ctx, seed: job.seed, style: job.style, volume: 1, startSection: job.startSection,
    mix: job.mix, bypassMaster: job.bypassMaster,
  });
  const titles = [];
  player.onTrackChange((np) => np && titles.push(`${np.title} [${np.style} ${np.bpm}bpm ${np.key || ''}]`));
  const t0 = performance.now();
  if (job.script) {
    for (const [t, action, a, b] of job.script) {
      player.scheduleUntil(t);
      if (action === 'start') player.start();
      else player[action](a, b);
    }
  } else {
    player.start();
  }
  player.scheduleUntil(job.seconds);
  const schedMs = performance.now() - t0;
  const t1 = performance.now();
  const buf = await ctx.startRendering();
  const renderMs = performance.now() - t1;
  const L = buf.getChannelData(0);
  const R = buf.getChannelData(1);
  const n = L.length;

  function stats(from, to) {
    let peak = 0, sum = 0, clips = 0;
    for (let i = from; i < to; i++) {
      const a = Math.abs(L[i]), b = Math.abs(R[i]);
      peak = Math.max(peak, a, b);
      if (a >= 0.999) clips++;
      if (b >= 0.999) clips++;
      sum += L[i] * L[i] + R[i] * R[i];
    }
    const rms = Math.sqrt(sum / (2 * (to - from)));
    // K-weighted loudness (BS.1770, 48 kHz coefficients) with gating
    const kw = (x) => {
      const y = new Float32Array(to - from);
      let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
      const b = [1.53512485958697, -2.69169618940638, 1.19839281085285], a = [-1.69065929318241, 0.73248077421585];
      for (let i = from; i < to; i++) {
        const v = b[0] * x[i] + b[1] * x1 + b[2] * x2 - a[0] * y1 - a[1] * y2;
        x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i - from] = v;
      }
      x1 = x2 = y1 = y2 = 0;
      const b2 = [1, -2, 1], a2 = [-1.99004745483398, 0.99007225036621];
      for (let i = 0; i < y.length; i++) {
        const xi = y[i];
        const v = b2[0] * xi + b2[1] * x1 + b2[2] * x2 - a2[0] * y1 - a2[1] * y2;
        x2 = x1; x1 = xi; y2 = y1; y1 = v; y[i] = v;
      }
      return y;
    };
    const kl = kw(L), kr = kw(R);
    const blk = Math.floor(0.4 * sr), hop = Math.floor(0.1 * sr);
    const blocks = [];
    for (let s = 0; s + blk <= kl.length; s += hop) {
      let e = 0;
      for (let i = s; i < s + blk; i++) e += kl[i] * kl[i] + kr[i] * kr[i];
      blocks.push(e / blk);
    }
    const lufsOf = (arr) => -0.691 + 10 * Math.log10(arr.reduce((p, c) => p + c, 0) / arr.length);
    let g = blocks.filter((e) => -0.691 + 10 * Math.log10(e) > -70);
    const rel = lufsOf(g) - 10;
    g = g.filter((e) => -0.691 + 10 * Math.log10(e) > rel);
    const lufs = lufsOf(g);
    // spectral balance (mono sum, Hann-windowed 4096 FFT)
    const N = 4096;
    const re = new Float64Array(N), im = new Float64Array(N);
    const power = new Float64Array(N / 2);
    let frames = 0;
    for (let s = from; s + N <= to; s += N) {
      for (let i = 0; i < N; i++) {
        const w = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (N - 1));
        re[i] = (L[s + i] + R[s + i]) * 0.5 * w;
        im[i] = 0;
      }
      // iterative radix-2 FFT
      for (let i = 1, j = 0; i < N; i++) {
        let bit = N >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
      }
      for (let len = 2; len <= N; len <<= 1) {
        const ang = (-2 * Math.PI) / len;
        const wr = Math.cos(ang), wi = Math.sin(ang);
        for (let i = 0; i < N; i += len) {
          let cr = 1, ci = 0;
          for (let k = 0; k < len / 2; k++) {
            const ar = re[i + k], ai = im[i + k];
            const br = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci;
            const bi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
            re[i + k] = ar + br; im[i + k] = ai + bi;
            re[i + k + len / 2] = ar - br; im[i + k + len / 2] = ai - bi;
            const ncr = cr * wr - ci * wi;
            ci = cr * wi + ci * wr;
            cr = ncr;
          }
        }
      }
      for (let k = 0; k < N / 2; k++) power[k] += re[k] * re[k] + im[k] * im[k];
      frames++;
    }
    const bands = { sub: [20, 60], low: [60, 250], lowmid: [250, 2000], highmid: [2000, 6000], high: [6000, 20000] };
    const bandE = {};
    let tot = 0;
    for (const [k, [lo, hi]] of Object.entries(bands)) {
      let e = 0;
      for (let b = Math.ceil((lo * N) / sr); b < Math.min(N / 2, (hi * N) / sr); b++) e += power[b];
      bandE[k] = e;
      tot += e;
    }
    const balance = {};
    for (const k of Object.keys(bandE)) balance[k] = +(100 * bandE[k] / tot).toFixed(1);
    return {
      peakDb: +(20 * Math.log10(peak)).toFixed(2),
      rmsDb: +(20 * Math.log10(rms)).toFixed(2),
      lufs: +lufs.toFixed(1),
      crestDb: +(20 * Math.log10(peak / rms)).toFixed(1),
      clips,
      balancePct: balance,
      frames,
    };
  }
  const result = { full: stats(0, n) };
  if (job.dropAt) result.drop = stats(Math.floor(job.dropAt * sr), n);
  // 16-bit PCM, interleaved, base64
  const pcm = new Int16Array(n * 2);
  for (let i = 0; i < n; i++) {
    pcm[2 * i] = Math.max(-1, Math.min(1, L[i])) * 32767;
    pcm[2 * i + 1] = Math.max(-1, Math.min(1, R[i])) * 32767;
  }
  const bytes = new Uint8Array(pcm.buffer);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return { stats: result, b64: btoa(bin), titles, schedMs: Math.round(schedMs), renderMs: Math.round(renderMs) };
}

// ------------------------------------------------------------------ main
const { chromium } = loadPlaywright();
const server = await serve();
const port = server.address().port;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('  [page]', m.text()); });
page.on('pageerror', (e) => console.log('  [pageerror]', e.message));
await page.goto(`http://127.0.0.1:${port}/__render.html`);
fs.mkdirSync(OUT, { recursive: true });

let jobs = STYLES.map((style) => ({ name: style.toLowerCase(), style, seed: SEED, seconds: SECONDS, startSection: 'build' }));
if (args.includes('--stems')) {
  // debug: render each mixer channel alone, master processing bypassed
  const CH = ['kick', 'snare', 'hats', 'perc', 'brk', 'bass', 'sub', 'acid', 'stab', 'pad', 'arp', 'lead', 'vox', 'fx'];
  jobs = [];
  for (const style of STYLES) {
    const only = arg('channels', '').split(',').filter(Boolean);
    for (const c of CH) {
      if (only.length && !only.includes(c)) continue;
      const mix = Object.fromEntries(CH.map((k) => [k, k === c ? 1 : 0]));
      jobs.push({ name: `stem-${style}-${c}`, style, seed: SEED, seconds: SECONDS, startSection: 'build', mix, bypassMaster: true, stem: true });
    }
    if (!arg('channels', '')) jobs.push({ name: `stem-${style}-ALL`, style, seed: SEED, seconds: SECONDS, startSection: 'build', bypassMaster: true, stem: true });
  }
}
if (RACE) {
  // menu -> countdown (3 s) -> race at mixed intensity -> final lap -> finished
  jobs.push({
    name: 'race-demo', style: 'auto', seed: SEED + 1, seconds: 44, dropAt: 9,
    script: [
      [0, 'setRaceState', 'menu'], [0, 'start'],
      [6, 'setRaceState', 'countdown', { dropIn: 3 }],
      [9.0, 'setIntensity', 0.35], [16, 'setIntensity', 0.9],
      [24, 'setRaceState', 'finalLap'], [34, 'setRaceState', 'finished'],
    ],
  });
}

const summary = [];
for (const job of jobs) {
  // the build section is 8 bars; report stats from the drop onward too
  if (!job.dropAt && job.startSection === 'build') {
    const bpm = await page.evaluate(async ({ seed, style }) => {
      const m = await import('/src/ui/music/index.js');
      // mirror engine song selection: first song of the playlist
      const { hashSeed } = await import('/src/ui/music/rng.js');
      return m.generateSong(hashSeed(`${seed}/0/${style}`), style).bpm;
    }, { seed: job.seed, style: job.style });
    job.dropAt = (8 * 4 * 60) / bpm;
  }
  const r = await page.evaluate(renderInPage, { job, sr: SR });
  const file = path.join(job.stem ? (process.env.STEM_DIR || '/tmp') : OUT, `${job.name}.wav`);
  if (job.stem) {
    const v = r.stats.drop || r.stats.full;
    console.log(`${job.name.padEnd(22)} peak ${String(v.peakDb).padStart(7)}  rms ${String(v.rmsDb).padStart(7)}  sub ${v.balancePct.sub} low ${v.balancePct.low} lmid ${v.balancePct.lowmid} hmid ${v.balancePct.highmid} high ${v.balancePct.high}`);
    continue;
  }
  writeWav(file, r.b64, 2, SR);
  const s = r.stats;
  console.log(`\n== ${job.name}: ${r.titles.join(' -> ')}`);
  console.log(`   file ${path.relative(ROOT, file)}  (schedule ${r.schedMs} ms, render ${r.renderMs} ms for ${job.seconds}s)`);
  for (const [k, v] of Object.entries(s)) {
    console.log(`   ${k.padEnd(5)} peak ${v.peakDb} dBFS  rms ${v.rmsDb} dBFS  ~${v.lufs} LUFS  crest ${v.crestDb} dB  clips ${v.clips}  ` +
      `balance% sub ${v.balancePct.sub} low ${v.balancePct.low} lowmid ${v.balancePct.lowmid} highmid ${v.balancePct.highmid} high ${v.balancePct.high}`);
  }
  summary.push({ name: job.name, titles: r.titles, ...s });
}
fs.writeFileSync(path.join(OUT, 'stats.json'), JSON.stringify(summary, null, 2));
await browser.close();
server.close();
