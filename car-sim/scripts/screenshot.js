#!/usr/bin/env node
// Visual smoke test: builds (if needed), serves dist/ with `vite preview`, drives the app in headless
// Chromium (WebGL via SwiftShader) and saves screenshots to docs/screenshots/.
//   node scripts/screenshot.js            (all shots)
//   node scripts/screenshot.js garage race (subset)
// Env: CHROMIUM=/path/to/chrome (default: Playwright's bundled browser in /opt/pw-browsers), PORT=4173
import { spawn, execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'docs', 'screenshots');
mkdirSync(outDir, { recursive: true });
process.env.PLAYWRIGHT_BROWSERS_PATH ||= '/opt/pw-browsers';

const require = createRequire(import.meta.url);
let chromium;
for (const p of ['playwright', '/opt/node-tools/node_modules/playwright', 'playwright-core']) {
  try { ({ chromium } = require(p)); break; } catch { /* try next */ }
}
if (!chromium) { console.error('Playwright not found (npm i -D playwright, or set NODE_PATH)'); process.exit(1); }

const PORT = Number(process.env.PORT || 4173);
const BASE = `http://localhost:${PORT}/`;
const only = new Set(process.argv.slice(2));
const want = (k) => !only.size || only.has(k);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (!existsSync(path.join(root, 'dist', 'index.html')) || process.env.REBUILD) {
  console.log('building…'); execSync('npx vite build', { cwd: root, stdio: 'inherit' });
}
const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
const stopServer = () => { try { server.kill('SIGTERM'); } catch { /* ignore */ } };
process.on('exit', stopServer);
for (let i = 0; i < 60; i++) { try { const r = await fetch(BASE); if (r.ok) break; } catch { /* not up yet */ } await sleep(250); }

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM || undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'],
});
const report = { console: {}, perf: {} };

async function open(name, query, viewport = { width: 1600, height: 900 }) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1, hasTouch: viewport.width < 600, isMobile: viewport.width < 600 });
  const logs = []; report.console[name] = logs;
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(`${m.type()}: ${m.text()}`); });
  page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`));
  await page.goto(`${BASE}?capture&${query}`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__carsim && document.getElementById('boot')?.classList.contains('hidden'), null, { timeout: 120000 });
  return page;
}
async function hold(page, key, ms) { await page.keyboard.down(key); await sleep(ms); await page.keyboard.up(key); }
async function shot(page, file) { await page.screenshot({ path: path.join(outDir, file) }); console.log('saved', file); }
/** Average frame time over `ms` measured with rAF inside the page. */
async function frameTime(page, ms = 4000) {
  return page.evaluate((ms) => new Promise((res) => { const t = []; let last = performance.now(); const t0 = last; const f = (now) => { t.push(now - last); last = now; if (now - t0 < ms) requestAnimationFrame(f); else { t.sort((a, b) => a - b); res({ avg: t.reduce((a, b) => a + b, 0) / t.length, p95: t[Math.floor(t.length * 0.95)], frames: t.length }); } }; requestAnimationFrame(f); }), ms);
}

try {
  if (want('menu')) {
    const p = await open('menu', 'mode=menu&quality=high'); await sleep(2500); await shot(p, 'menu.png'); await p.close();
  }
  if (want('garage')) {
    const p = await open('garage', 'mode=garage&quality=high'); await sleep(2500); await shot(p, 'garage.png');
    await p.click('.g-tabs .tab[data-t="engine"]').catch(() => {}); await sleep(600); await shot(p, 'garage-engine.png'); await p.close();
  }
  if (want('drive')) {
    const p = await open('drive', 'mode=drive&quality=high');
    await sleep(1500); await p.mouse.click(800, 450);
    await hold(p, 'KeyW', 5000); await p.keyboard.down('KeyW'); await shot(p, 'drive.png');
    await p.keyboard.press('KeyT'); await sleep(1500); await shot(p, 'drive-telemetry.png'); await p.keyboard.press('KeyT');
    await p.keyboard.down('KeyA'); await sleep(1200); await p.keyboard.up('KeyA');
    for (let i = 0; i < 2; i++) await p.keyboard.press('KeyC'); await sleep(800); await shot(p, 'drive-cockpit.png');
    await p.keyboard.press('KeyC'); await sleep(1500); await shot(p, 'drive-tv.png');
    report.perf.driveHigh = await frameTime(p, 3000); await p.keyboard.up('KeyW'); await p.close();
  }
  if (want('race')) {
    const p = await open('race', 'mode=race&quality=high');
    await sleep(1500); await shot(p, 'race-setup.png');
    await p.click('.rs-go'); await p.waitForSelector('.race-ui', { timeout: 120000 }); await sleep(1500); await shot(p, 'race-grid.png');
    await p.waitForFunction(() => window.__carsim.currentMode().phase === 'racing', null, { timeout: 180000 });
    await p.keyboard.down('KeyW'); await sleep(9000); await shot(p, 'race.png');
    await p.keyboard.press('KeyV'); await sleep(1500); await shot(p, 'race-spectate.png');
    report.perf.race = await frameTime(p, 3000);
    report.perf.raceSim = await p.evaluate(() => { const m = window.__carsim.currentMode(); return { cars: m.cars.length, slow: m.stepper.slow, simTime: m.simTime }; });
    await p.keyboard.up('KeyW'); await p.close();
  }
  if (want('mobile')) {
    const vp = { width: 390, height: 844 };
    let p = await open('mobile-garage', 'mode=garage&quality=low', vp); await sleep(2000); await shot(p, 'mobile-garage.png'); await p.close();
    p = await open('mobile-drive', 'mode=drive&quality=low', vp); await sleep(1000);
    await p.evaluate(() => { const ctx = window.__carsim; ctx.input._wantTouch = true; ctx.input.setTouchVisible(true); ctx.input.setDriving(true); });
    await hold(p, 'KeyW', 3000); await shot(p, 'mobile-drive.png'); await p.close();
  }
  if (want('potato')) {
    const p = await open('potato', 'mode=drive&quality=potato');
    const cdp = await p.context().newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await p.keyboard.down('KeyW'); await sleep(3000);
    report.perf.potatoCpu4x = await frameTime(p, 5000);
    report.perf.potatoCpu4x.renderScale = await p.evaluate(() => window.__carsim.world.renderScale);
    await shot(p, 'potato-drive.png'); await p.keyboard.up('KeyW'); await p.close();
  }
} catch (err) {
  console.error('screenshot run failed:', err);
  process.exitCode = 1;
} finally {
  await browser.close(); stopServer();
  writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));
  for (const [k, v] of Object.entries(report.console)) if (v.length) console.log(`console[${k}]:\n  ` + v.slice(0, 15).join('\n  '));
  console.log('perf', JSON.stringify(report.perf, null, 1));
}
