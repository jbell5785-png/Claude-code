import json, sys, glob, os, re
base=''+os.environ.get('WORK',os.path.expanduser('~/.pipeline-work'))+'/qa'
rows=[]
for label in sys.argv[1:]:
    t=open(f'{base}/{label}/summary.json').read(); j=json.loads(t[t.index('{'):])
    biz,c=label.rsplit('-',1)
    d=f'/home/user/Claude-code/richmond-sprint/{biz}/concept-{c}'
    tbc=sum(open(f).read().count('class="tbc"') for f in glob.glob(d+'/*.html'))
    cls=max(j['cls'].values())
    axe=sum(len(v) for v in j['axe'].values())
    rows.append(f"| {c.upper()} | {len(j['console'])} | {len(j['failed'])} | {len(j['badLinks'])} | {sum(1 for v in j['overflow'].values() if v)} | {axe} | {cls:.3f} | {tbc} |")
print("| Concept | Console errors | Failed requests | Broken links/anchors | Widths with overflow | axe A/AA violations | Worst layout shift | 'To confirm' markers |")
print("|---|---|---|---|---|---|---|---|")
print("\n".join(rows))
