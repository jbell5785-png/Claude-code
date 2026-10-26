const { chromium } = require('playwright');
(async () => { const b = await chromium.launch();
 for (const [w,h] of [[390,844],[1280,900]]) { const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs=[]; p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.goto('file://'+process.argv[2],{waitUntil:'networkidle'});
  const ov=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  await p.screenshot({path:process.argv[3]+'-'+w+'.png',fullPage:true}); console.log(w,'overflow',ov,'errors',errs.length); }
 await b.close(); })();
