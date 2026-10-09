#!/usr/bin/env node
// FX screenshots: serves the repo with Vite, opens src/ui/fx/showcase.html in headless Chromium
// (SwiftShader WebGL2) and captures every environment × quality preset plus a few detail shots
// into docs/screenshots/fx/. Prints relative frame times per preset (SwiftShader is a CPU
// rasteriser: absolute numbers are meaningless, ratios between presets are indicative).
//
// usage: node scripts/fx-screenshots.js [--env night,day] [--q high,ultra] [--size 1280x720] [--frames 4] [--extras] [--only-extras]
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'docs/screenshots/fx');
mkdirSync(outDir, { recursive: true });

const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const ENVS = arg('env', 'day,goldenHour,night,night-wet,futuristic,day-wet').split(',');
const QS = arg('q', 'potato,low,medium,high,ultra').split(',');
const [W, H] = arg('size', '1280x720').split('x').map(Number);
const FRAMES = +arg('frames', 4);
const PORT = +arg('port', 5199);

async function loadPlaywright() {
  try { return await import('playwright'); } catch { /* not local */ }
  const req = createRequire(import.meta.url);
  for (const p of ['/opt/node22/lib/node_modules/playwright', process.env.PLAYWRIGHT_PATH].filter(Boolean)) { try { return req(p); } catch { /* next */ } }
  throw new Error('playwright not found (global or local)');
}

function startVite() {
  return new Promise((resolve, reject) => {
    const p = spawn('npx', ['vite', '--port', String(PORT), '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
    let done = false;
    const on = (b) => { const s = b.toString(); if (!done && /Local:|ready in/i.test(s)) { done = true; setTimeout(() => resolve(p), 300); } };
    p.stdout.on('data', on); p.stderr.on('data', (b) => { on(b); if (/error/i.test(b)) process.stderr.write(b); });
    p.on('exit', (c) => { if (!done) reject(new Error('vite exited ' + c)); });
    setTimeout(() => { if (!done) { done = true; resolve(p); } }, 15000);
  });
}

const { chromium } = await loadPlaywright();
const vite = await startVite();
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium', headless: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'],
});
const results = [];
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('console', (m) => { const t = m.text(); if (m.type() === 'error' || /\[fx\]|warn/i.test(t)) console.log('  [page]', m.type(), t.slice(0, 300)); });
  page.on('pageerror', (e) => console.log('  [pageerror]', e.message));
  const url = `http://127.0.0.1:${PORT}/src/ui/fx/showcase.html?capture=1&env=${ENVS[0]}&q=${QS[0]}`;
  console.log('opening', url);
  // Vite may discover + optimise deps on first load and force a reload: load twice.
  for (let pass = 0; pass < 2; pass++) {
    await page.goto(url, { waitUntil: 'load', timeout: 120000 });
    await page.waitForFunction(() => document.body.dataset.ready === '1' || document.body.dataset.error, null, { timeout: 300000 });
    await page.waitForTimeout(pass ? 200 : 1500);
  }
  await page.waitForFunction(() => document.body.dataset.ready === '1' || document.body.dataset.error, null, { timeout: 300000 });
  const err = await page.evaluate(() => document.body.dataset.error); if (err) throw new Error(err);
  const gpu = await page.evaluate(() => window.fxShowcase.gpu());
  console.log('GPU:', gpu);
  const shoot = async (name, setup) => {
    await page.evaluate(setup);
    await page.evaluate(() => window.fxShowcase.reset());
    await page.evaluate((n) => window.fxShowcase.frames(n), FRAMES); // warm-up (shader compile, motion blur history)
    const ms = await page.evaluate((n) => window.fxShowcase.frames(n), 3);
    const file = join(outDir, name + '.png');
    await page.screenshot({ path: file });
    const st = await page.evaluate(() => window.fxShowcase.stats());
    console.log(`${name.padEnd(30)} ${ms.toFixed(0).padStart(6)} ms/frame  px ${st.pixelRatio.toFixed(2)}`);
    return { name, ms, file };
  };
  if (!args.includes('--only-extras')) {
    for (const q of QS) for (const env of ENVS) {
      const r = await shoot(`${env}_${q}`, `window.fxShowcase.setQuality(${JSON.stringify(q)}); window.fxShowcase.setEnv(${JSON.stringify(env)}); window.fxShowcase.setShot('chase'); window.fxShowcase.setBoost(false); window.fxShowcase.setBrake(0)`);
      results.push({ env, q, ms: r.ms });
    }
  }
  if (args.includes('--extras') || args.includes('--only-extras')) {
    const xq = arg('xq', 'ultra');
    const set = (e, s, extra = '') => `window.fxShowcase.setQuality('${xq}'); window.fxShowcase.setEnv('${e}'); window.fxShowcase.setShot('${s}'); window.fxShowcase.setBoost(false); window.fxShowcase.setBrake(0); ${extra}`;
    await shoot('detail_night_rear_boost', set('night', 'rear', 'window.fxShowcase.setBoost(true); window.fxShowcase.setBrake(1);'));
    await shoot('detail_night-wet_side', set('night-wet', 'side'));
    await shoot('detail_futuristic_front_underglow', set('futuristic', 'front', "window.fxShowcase.setUnderglow(0x29e7ff);"));
    await shoot('detail_goldenHour_side_pearl', set('goldenHour', 'side', "window.fxShowcase.setUnderglow(null); window.fxShowcase.setPaint('pearl');"));
    await shoot('detail_day_front_candy', set('day', 'front', "window.fxShowcase.setPaint('candy');"));
    await shoot('detail_night_wide_sparks', set('night', 'wide', "window.fxShowcase.setPaint('metallic'); window.fxShowcase.sparks(3);"));
    await shoot('detail_futuristic_wide_boost', set('futuristic', 'wide', 'window.fxShowcase.setBoost(true);'));
  }
} finally {
  await browser.close(); try { process.kill(-vite.pid, 'SIGTERM'); } catch { vite.kill('SIGTERM'); }
}
if (results.length) {
  const byQ = {}; for (const r of results) (byQ[r.q] ||= []).push(r.ms);
  console.log('\nmean ms/frame per quality (SwiftShader, relative only):');
  const rows = Object.entries(byQ).map(([q, a]) => ({ q, ms: a.reduce((s, x) => s + x, 0) / a.length }));
  const ref = rows.find((r) => r.q === 'potato') || rows[0];
  for (const r of rows) console.log(`  ${r.q.padEnd(7)} ${r.ms.toFixed(0).padStart(6)} ms   x${(r.ms / ref.ms).toFixed(2)} vs ${ref.q}`);
  writeFileSync(join(outDir, 'frametimes.json'), JSON.stringify({ size: `${W}x${H}`, renderer: 'swiftshader', results, perQuality: rows }, null, 2));
}
