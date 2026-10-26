// Review harness: node review.js <concept-letter> <port> <outdir> [pass-label]
// Serves nothing itself: expects a static server on the port.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const [letter, port, outdir, pass = 'p1'] = process.argv.slice(2);
const base = `http://localhost:${port}`;
const AXE = fs.readFileSync(path.join(__dirname, 'node_modules/axe-core/axe.min.js'), 'utf8');
const widths = [390, 768, 1440];
const report = { console: [], failed: [], links: [], axe: {}, overflow: {}, cls: {} };
fs.mkdirSync(outdir, { recursive: true });

async function settle(p, ms = 900) { await p.waitForTimeout(ms); }

async function scrollTo(p, frac) {
  await p.evaluate(async (f) => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const target = Math.round(max * f);
    // step so ScrollTrigger scrubs see intermediate positions
    const steps = 12; const start = scrollY;
    for (let i = 1; i <= steps; i++) { scrollTo(0, start + (target - start) * i / steps); await new Promise(r => setTimeout(r, 40)); }
  }, frac);
  await settle(p, 1200);
}

(async () => {
  const b = await chromium.launch();
  for (const pageName of ['index.html', 'menu.html']) {
    for (const w of widths) {
      const ctx = await b.newContext({ viewport: { width: w, height: w === 390 ? 844 : w === 768 ? 1024 : 900 }, deviceScaleFactor: 1 });
      const p = await ctx.newPage();
      ctx.on('page', np => { if (np !== p) np.close().catch(() => {}); });
      p.on('console', m => { if (['error', 'warning'].includes(m.type())) report.console.push(`${pageName}@${w} ${m.type()}: ${m.text()}`); });
      p.on('pageerror', e => report.console.push(`${pageName}@${w} pageerror: ${e.message}`));
      p.on('requestfailed', r => report.failed.push(`${pageName}@${w} ${r.url()} ${r.failure()?.errorText}`));
      p.on('response', r => { if (r.status() >= 400) report.failed.push(`${pageName}@${w} ${r.status()} ${r.url()}`); });
      await p.addInitScript(() => {
        window.__cls = 0;
        new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
        window.open = (...a) => { window.__opened = a; return null; };
      });
      await p.goto(`${base}/${pageName}`, { waitUntil: 'networkidle' });
      await settle(p, 1500);
      const tag = `${pageName.replace('.html', '')}_${w}`;
      await p.screenshot({ path: `${outdir}/${tag}_top.png` });
      report.cls[tag] = await p.evaluate(() => window.__cls);
      report.overflow[tag] = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      if (w === 390 || w === 1440) {
        // full-page reference at reduced cost
        await scrollTo(p, 0.5); await p.screenshot({ path: `${outdir}/${tag}_mid.png` });
        await scrollTo(p, 1); await p.screenshot({ path: `${outdir}/${tag}_bot.png` });
      } else {
        await scrollTo(p, 0.5); await p.screenshot({ path: `${outdir}/${tag}_mid.png` });
      }
      if (w === 1440 || w === 390) {
        await p.evaluate(() => scrollTo(0, 0)); await settle(p, 600);
        await p.addScriptTag({ content: AXE });
        const res = await p.evaluate(async () => {
          const r = await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa'] });
          return r.violations.map(v => `${v.id} (${v.impact}) x${v.nodes.length}: ${v.nodes.slice(0, 3).map(n => n.target.join(' ')).join(' | ')}`);
        });
        report.axe[tag] = res;
      }
      if (w === 1440 && pageName === 'index.html') {
        const links = await p.evaluate(() => [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')));
        report.links.push(...links.map(h => ['index.html', h]));
      }
      if (w === 1440 && pageName === 'menu.html') {
        const links = await p.evaluate(() => [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')));
        report.links.push(...links.map(h => ['menu.html', h]));
      }
      await ctx.close();
    }
  }
  // link check
  const bad = [];
  const idCache = {};
  const ctx = await b.newContext(); const p = await ctx.newPage();
  for (const [from, h] of [...new Map(report.links.map(l => [l.join('|'), l])).values()]) {
    if (/^(tel:|mailto:|https?:)/.test(h)) continue;
    const u = new URL(h, `${base}/${from}`);
    if (!u.href.startsWith(base)) continue;
    const key = u.pathname;
    if (!(key in idCache)) {
      const r = await p.goto(u.href.split('#')[0]).catch(() => null);
      idCache[key] = r && r.status() < 400 ? await p.evaluate(() => [...document.querySelectorAll('[id]')].map(e => e.id)) : null;
    }
    if (idCache[key] === null) bad.push(`${from}: ${h} (missing page)`);
    else if (u.hash && !idCache[key].includes(decodeURIComponent(u.hash.slice(1)))) bad.push(`${from}: ${h} (missing anchor)`);
  }
  report.badLinks = bad;
  report.external = [...new Set(report.links.map(l => l[1]).filter(h => /^(tel:|mailto:|https?:)/.test(h)))];
  // JS-disabled + reduced-motion first frames
  for (const [label, opts] of [['nojs', { javaScriptEnabled: false }], ['rm', { reducedMotion: 'reduce' }]]) {
    for (const w of [390, 1440]) {
      const c = await b.newContext({ viewport: { width: w, height: w === 390 ? 844 : 900 }, ...opts });
      const q = await c.newPage();
      await q.goto(`${base}/index.html`, { waitUntil: 'networkidle' }); await settle(q, 1200);
      await q.screenshot({ path: `${outdir}/${label}_index_${w}.png` });
      if (w === 390) { await q.goto(`${base}/menu.html`, { waitUntil: 'networkidle' }); await settle(q, 800); await q.screenshot({ path: `${outdir}/${label}_menu_${w}.png` }); }
      await c.close();
    }
  }
  await b.close();
  fs.writeFileSync(`${outdir}/report.json`, JSON.stringify(report, null, 1));
  console.log(JSON.stringify({ console: report.console, failed: report.failed, badLinks: report.badLinks, overflow: report.overflow, cls: report.cls, axe: report.axe, external: report.external }, null, 1));
})();
