# python3 sheet.py out.png width cols file1 file2 ...
import sys, os
from PIL import Image, ImageDraw
out, w, cols, files = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4:]
ims = []
for f in files:
    if not os.path.exists(f):
        continue
    im = Image.open(f).convert('RGB'); r = w / im.width
    ims.append((os.path.basename(f), im.resize((w, int(im.height * r)))))
rows = [ims[i:i + cols] for i in range(0, len(ims), cols)]
H = sum(max(i.height for _, i in row) + 18 for row in rows)
S = Image.new('RGB', (cols * (w + 10), H), (120, 120, 120)); D = ImageDraw.Draw(S)
y = 0
for row in rows:
    for k, (n, im) in enumerate(row):
        x = k * (w + 10); D.text((x + 2, y + 2), n, fill='white'); S.paste(im, (x, y + 16))
    y += max(i.height for _, i in row) + 18
S.save(out); print(out, S.size)
