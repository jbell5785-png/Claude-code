import os
import sys
from PIL import Image
base=''+os.environ.get('WORK',os.path.expanduser('~/.pipeline-work'))+'/qa'
out='/home/user/Claude-code/richmond-sprint/_index/thumbs'
for label in sys.argv[1:]:
    d=Image.open(f'{base}/{label}/index_1440_top.png').convert('RGB'); d=d.resize((720, int(d.height*720/d.width)), Image.LANCZOS)
    d.save(f'{out}/{label}-desktop.jpg', quality=78, optimize=True, progressive=True)
    m=Image.open(f'{base}/{label}/index_390_top.png').convert('RGB'); m=m.resize((234, int(m.height*234/m.width)), Image.LANCZOS)
    m.save(f'{out}/{label}-phone.jpg', quality=80, optimize=True, progressive=True)
    print(label, d.size, m.size)
