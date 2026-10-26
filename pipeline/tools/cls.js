const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const pg of process.argv.slice(3)) {
    const p = await b.newPage({ viewport: { width: 390, height: 844 } });
    await p.addInitScript(() => { window.__s = []; new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__s.push({ v: +e.value.toFixed(4), t: Math.round(e.startTime), src: e.sources.map(s => { const n = s.node; return n ? (n.nodeName + (n.id ? '#' + n.id : '') + (n.className && typeof n.className === 'string' ? '.' + n.className.split(' ').join('.') : '')) + ` ${s.previousRect.y}->${s.currentRect.y} h${s.previousRect.height}->${s.currentRect.height}` : '?'; }) }); }).observe({ type: 'layout-shift', buffered: true }); });
    await p.goto(`http://localhost:${process.argv[2]}/${pg}`, { waitUntil: 'networkidle' }); await p.waitForTimeout(2000);
    console.log(pg, JSON.stringify(await p.evaluate(() => window.__s), null, 1));
  }
  await b.close();
})();
