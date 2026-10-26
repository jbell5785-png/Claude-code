// node extract.js <port> <page>  -> prints visible text + JSON-LD blocks
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto(`http://localhost:${process.argv[2]}/${process.argv[3]}`, { waitUntil: 'networkidle' }); await p.waitForTimeout(800);
  const r = await p.evaluate(() => ({ t: document.body.innerText, ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => s.textContent.trim()), d: (document.querySelector('meta[name="description"]')||{}).content || '', title: document.title }));
  console.log(`TITLE: ${r.title}\nMETA DESCRIPTION: ${r.d}\n\n--- VISIBLE PAGE TEXT ---\n${r.t.replace(/\n{3,}/g,'\n\n')}\n\n--- STRUCTURED DATA (JSON-LD) ---\n${r.ld.join('\n\n')}`);
  await b.close(); })();
