# python3 publish_build.py <concept-dir> <out-dir> <links.json>
# Builds the claude.ai Artifact variant of a concept: the homepage loses its
# document wrapper (the publisher adds one), other pages stay full documents,
# and links to sibling concepts point at their published URLs (or are unlinked).
import json, os, re, shutil, sys

src, out, links_path = sys.argv[1:4]
title = sys.argv[4] if len(sys.argv) > 4 else None
links = json.load(open(links_path)) if os.path.exists(links_path) else {}
letter = os.path.basename(src.rstrip('/'))[-1]
if os.path.exists(out):
    shutil.rmtree(out)
shutil.copytree(src, out, ignore=shutil.ignore_patterns('NOTES.md'))


def fix_links(html):
    def sub(m):
        target = m.group(1)
        url = links.get(target)
        return f'href="{url}" target="_blank" rel="noopener"' if url else 'href="#" aria-disabled="true" data-pending="true"'
    html = re.sub(r'href="\.\./concept-([abc])/[^"]*"', sub, html)
    # from secondary pages, "index.html" must reach the artifact's own page
    return html


for name in os.listdir(out):
    if not name.endswith('.html'):
        continue
    p = os.path.join(out, name)
    html = fix_links(open(p, encoding='utf-8').read())
    if name == 'index.html':
        m = re.search(r'<html([^>]*)>', html, re.I)
        lang = re.search(r'lang="([^"]+)"', m.group(1)).group(1) if m and 'lang=' in m.group(1) else 'en-GB'
        body_attrs = re.search(r'<body([^>]*)>', html, re.I).group(1).strip()
        html = re.sub(r'<!doctype html>\s*', '', html, flags=re.I)
        html = re.sub(r'<html[^>]*>\s*', '', html, flags=re.I)
        html = re.sub(r'</?head>\s*', '', html, flags=re.I)
        html = re.sub(r'<body[^>]*>', '', html, flags=re.I)
        html = re.sub(r'</body>\s*|</html>\s*', '', html, flags=re.I)
        html = re.sub(r'<meta charset="[^"]*">\s*', '', html, flags=re.I)
        html = re.sub(r'<meta name="viewport"[^>]*>\s*', '', html, flags=re.I)
        if title:
            html = re.sub(r'<title>.*?</title>', f'<title>{title}</title>', html, count=1, flags=re.S)
        setup = f"document.documentElement.lang='{lang}';"
        for k, v in re.findall(r'([\w-]+)="([^"]*)"', m.group(1) if m else ''):
            if k == 'class':
                setup += f"document.documentElement.classList.add({', '.join(repr(c) for c in v.split())});"
            elif k != 'lang':
                setup += f"document.documentElement.setAttribute({k!r},{v!r});"
        cls = re.search(r'class="([^"]+)"', body_attrs)
        if cls:
            setup += f"document.addEventListener('DOMContentLoaded',function(){{document.body.classList.add({', '.join(repr(c) for c in cls.group(1).split())});}});"
        title_end = html.find('</title>')
        html = html[:title_end + 8] + f'\n<script>{setup}</script>' + html[title_end + 8:]
    open(p, 'w', encoding='utf-8').write(html)
print('built', out)
