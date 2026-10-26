# python3 banner_build.py <concept-dir> <tmp-dir> <Business name>
# Copies a concept and inserts a visible "speculative concept" banner as the first thing in <body> on every page.
import os, re, shutil, sys
src, tmp, biz = sys.argv[1:4]
if os.path.exists(tmp): shutil.rmtree(tmp)
shutil.copytree(src, tmp, ignore=shutil.ignore_patterns('NOTES.md', 'tests', 'tools'))
banner = ('<div role="note" style="all:initial;display:block;box-sizing:border-box;width:100%;padding:8px max(16px,env(safe-area-inset-left,0px));'
          'background:#fff3c4;color:#1a1a1a;border-bottom:2px solid #1a1a1a;font:600 13px/1.35 system-ui,-apple-system,Segoe UI,sans-serif;text-align:center;position:relative;z-index:2147483000">'
          f'Speculative design concept by an independent studio. Not the official {biz} website, and not commissioned or endorsed by {biz}.</div>')
for name in os.listdir(tmp):
    if name.endswith('.html'):
        p = os.path.join(tmp, name); h = open(p, encoding='utf-8').read()
        h, n = re.subn(r'(<body[^>]*>)', r'\1' + banner, h, count=1, flags=re.I)
        assert n == 1, p
        if 'name="robots"' not in h:
            h = h.replace('</title>', '</title>\n<meta name="robots" content="noindex">', 1)
        open(p, 'w', encoding='utf-8').write(h)
print('bannered', tmp)
