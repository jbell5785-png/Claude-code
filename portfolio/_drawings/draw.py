#!/usr/bin/env python3
"""Generate the inline SVG drawings for the Joseph Bell portfolio and splice them
into the HTML between <!--@svg NAME--> ... <!--@end--> markers.
Usage: python3 _drawings/draw.py .   (run from the portfolio folder)
Everything is drawn from scratch: no business names, signs or lettering."""
import math, re, sys, pathlib

def f(v):
    return ('%.1f' % v).rstrip('0').rstrip('.')

def polar(cx, cy, r, deg):
    a = math.radians(deg)
    return cx + r * math.cos(a), cy - r * math.sin(a)

def hand(x, y, text, size=22, anchor='start', cls='hn', extra=''):
    return f'<text class="{cls}" x="{f(x)}" y="{f(y)}" font-size="{size}" text-anchor="{anchor}"{extra}>{text}</text>'

def arrow(d, head, cls='pc draw', delay=0):
    st = f' style="--d:{delay}s"' if delay else ''
    return (f'<path class="{cls}" pathLength="1"{st} d="{d}"/>'
            f'<path class="{cls}" pathLength="1"{st} d="{head}"/>')

# ---------------------------------------------------------------- hero sketch
def hero():
    o = []
    o.append('<g class="ink rough" transform="translate(0 30)">')
    # chimneys + cornice + walls
    for cx in (112, 468):
        o.append(f'<path d="M{cx} 62V30H{cx+34}V62M{cx-4} 30H{cx+38}M{cx+4} 30V18H{cx+14}V30M{cx+20} 30V21H{cx+30}V30"/>')
    o.append('<path class="fp" d="M32 62H588V71H32Z"/>')
    o.append('<path class="dent" d="M44 76H576"/>')
    o.append('<path d="M40 71V430M580 71V430"/>')
    # brick ticks
    o.append('<path class="thin" d="M200 92h14M206 98h12M560 120h12M552 126h12M48 92h12M384 200h14M378 206h10M196 150h12"/>')
    # upper windows
    for x in (72, 143, 252, 323, 432, 503):
        o.append(f'<rect class="fp" x="{x}" y="112" width="45" height="80"/>'
                 f'<path class="thin" d="M{x+22.5} 112V192M{x} 152H{x+45}"/>'
                 f'<path class="fp" d="M{x-4} 192H{x+49}V197H{x-4}Z"/>'
                 f'<path d="M{x-4} 106H{x+49}M{x+18} 106V100H{x+27}V106"/>')
    # fascia cornice + fascias
    o.append('<path class="fp" d="M32 222H588V230H32Z"/>')
    for bx in (40, 220, 400):
        o.append(f'<rect class="fp" x="{bx+10}" y="232" width="160" height="30"/>'
                 f'<rect class="thin" x="{bx+15}" y="237" width="150" height="20"/>')
    # pilasters
    for px in (40, 220, 400, 580):
        o.append(f'<rect class="fp" x="{px-7}" y="232" width="14" height="198"/>'
                 f'<rect class="fp" x="{px-9}" y="226" width="18" height="8"/>'
                 f'<path class="thin" d="M{px-3} 244V420"/>')
    # bay 1: cafe with awning, table and chairs
    o.append('<rect class="fp" x="56" y="318" width="100" height="84"/><path class="thin" d="M106 318V402"/>'
             '<rect class="fp" x="56" y="402" width="100" height="28"/>'
             '<rect class="fp" x="166" y="316" width="44" height="114"/><path class="thin" d="M172 324h32v40h-32zM172 372h32v50h-32z"/>'
             '<circle cx="200" cy="370" r="2"/>')
    o.append('<path class="fp hatch" d="M50 262H210L222 312H38Z"/>')
    o.append('<path class="fp" d="M38 312' + 'q11.5 12 23 0' * 8 + '"/>')
    o.append('<path class="thin" d="M76 262L68 312M114 262L112 312M152 262L156 312M190 262L200 312"/>')
    o.append('<path class="fp" d="M82 406a22 5 0 1 0 44 0a22 5 0 1 0-44 0Z"/><path d="M104 411V428M92 429H116"/>')
    o.append('<path d="M66 428L68 410M80 428L78 410M64 410H82M68 410C66 396 68 388 74 386C80 388 82 396 80 410"/>')
    o.append('<path d="M128 428L130 410M142 428L140 410M126 410H144M130 410C128 396 130 388 136 386C142 388 144 396 142 410"/>')
    # bay 2: bakery windows, cake stand and loaves
    o.append('<rect class="fp" x="232" y="272" width="56" height="118"/><rect class="fp" x="332" y="272" width="56" height="118"/>'
             '<rect class="fp" x="232" y="390" width="56" height="40"/><rect class="fp" x="332" y="390" width="56" height="40"/>'
             '<rect class="fp" x="292" y="272" width="36" height="158"/><path class="thin" d="M292 292H328M298 300h24v52h-24z"/>'
             '<circle cx="322" cy="364" r="2"/>')
    o.append('<path class="thin" d="M260 290V372"/>')
    for cy, rx, n in ((372, 20, 3), (348, 15, 2), (324, 10, 1)):
        o.append(f'<path class="fp" d="M{260-rx} {cy}a{rx} {rx*0.2:.1f} 0 1 0 {2*rx} 0a{rx} {rx*0.2:.1f} 0 1 0 {-2*rx} 0Z"/>')
        start = 260 - n * 5
        for i in range(n):
            o.append(f'<path class="thin" d="M{start + i*10} {cy-1}q4 -7 8 0"/>')
    o.append('<path class="thin" d="M336 362H384"/><path d="M340 362q6 -12 12 0M354 362q7 -14 14 0M370 362q6 -11 12 0"/>'
             '<path class="thin" d="M357 354l4 -3M362 356l4 -3M343 356l3 -3"/>')
    # bay 3: restaurant with cafe curtain, lamp, A-board
    o.append('<rect class="fp" x="410" y="272" width="40" height="158"/><path class="thin" d="M416 280h28v60h-28zM416 348h28v74h-28z"/>'
             '<rect class="fp" x="458" y="272" width="114" height="118"/><rect class="fp" x="458" y="390" width="114" height="40"/>')
    o.append('<path class="thin" d="M515 272V292"/><path class="fp" d="M503 304L515 292L527 304Z"/>')
    o.append('<path d="M458 330H572"/>')
    folds = ''.join(f'M{x} 332v52' for x in range(466, 572, 9))
    o.append(f'<path class="thin" d="{folds}"/>')
    o.append('<path class="thin" d="M458 386' + 'q4.75 4 9.5 0' * 12 + '"/>')
    o.append('<path class="fp" d="M488 430L500 394H530L542 430Z"/><path class="thin" d="M503 402H527L534 424H496Z"/>'
             '<path class="thin" d="M506 409c4 -2 8 2 12 0s6 2 9 0M504 415c4 -2 8 2 12 0s6 2 9 0M503 420c4 -2 6 2 9 0"/>')
    # bicycle
    o.append('<circle class="fp-none" cx="368" cy="412" r="18"/><circle class="fp-none" cx="428" cy="412" r="18"/>'
             '<path d="M368 412L388 412L408 388L380 388Z M408 388L428 412M380 388L376 378M369 377H384M408 388L411 377H420"/>')
    # pavement
    o.append('<path d="M-10 430H610"/><path class="thin" d="M-10 452H610"/>')
    o.append('<path class="thin" d="' + ''.join(f'M{x} 430V452' for x in (70, 170, 270, 370, 470, 570)) + '"/>')
    # plane tree in front
    o.append('<path class="fp" d="M18 452C22 380 18 300 26 214"/><path d="M26 240C34 226 44 220 56 214M24 262C16 246 8 240 2 236"/>')
    o.append('<path class="fp" d="M-4 206C-12 174 4 150 22 154C24 128 56 120 70 140C92 130 112 154 100 176C116 190 102 216 80 210C70 228 40 226 34 212C18 226 -6 222 -4 206Z"/>')
    o.append('<path class="thin" d="M10 170l6 -4M24 162l6 -3M44 140l5 -4M60 150l6 -3M78 160l6 -4M88 176l5 -3M20 190l6 -4M40 182l6 -3M62 190l5 -4M84 196l6 -3M30 204l6 -3M50 204l5 -4M70 172l5 -3M8 196l5 -3M94 186l5 -3"/>')
    o.append('</g>')
    # pencil annotations
    o.append('<g class="notes">')
    o.append('<path class="mark-hl" d="M196 14L410 10L412 40L194 42Z"/>')
    o.append(hand(302, 34, 'what’s only here?', 26, 'middle'))
    o.append(arrow('M318 46C344 100 340 190 312 256', 'M302 246L312 259L322 248', delay=0.5))
    o.append(hand(34, 508, 'the awning comes first', 22))
    o.append(arrow('M120 486C138 460 132 380 128 348', 'M120 358L128 346L136 357', delay=0.8))
    o.append(hand(590, 508, 'today’s board, as text', 22, 'end'))
    o.append(arrow('M528 484C530 474 524 470 520 462', 'M512 468L520 460L526 470', delay=1.0))
    o.append('</g>')
    return '\n'.join(o)

# ---------------------------------------------------------------- arch helper
def arch(cx, cy, r_in, r_out, ground, vstep=10, face=True, key=6):
    o = []
    o.append(f'<path class="fp" d="M{f(cx-r_out)} {ground}V{cy}A{r_out} {r_out} 0 0 1 {f(cx+r_out)} {cy}V{ground}H{f(cx+r_in)}V{cy}A{r_in} {r_in} 0 0 0 {f(cx-r_in)} {cy}V{ground}Z"/>')
    d = ''
    a = 180 - vstep
    while a > 0:
        if abs(a - 90) > key + 1:
            x1, y1 = polar(cx, cy, r_in, a); x2, y2 = polar(cx, cy, r_out, a)
            d += f'M{f(x1)} {f(y1)}L{f(x2)} {f(y2)}'
        a -= vstep
    o.append(f'<path class="thin" d="{d}"/>')
    # keystone
    p1 = polar(cx, cy, r_in - 4, 90 + key); p2 = polar(cx, cy, r_out + 6, 90 + key + 1)
    p3 = polar(cx, cy, r_out + 6, 90 - key - 1); p4 = polar(cx, cy, r_in - 4, 90 - key)
    o.append(f'<path class="fp" d="M{f(p1[0])} {f(p1[1])}L{f(p2[0])} {f(p2[1])}L{f(p3[0])} {f(p3[1])}L{f(p4[0])} {f(p4[1])}Z"/>')
    if face:
        ty = cy - r_out - 6; by = cy - r_in + 4; h = by - ty
        ey = ty + h * 0.34
        o.append(f'<g class="face"><path class="thin" d="M{f(cx-6)} {f(ey-3)}q3 -2 5 0M{f(cx+1)} {f(ey-3)}q3 -2 5 0"/>'
                 f'<circle class="eye" cx="{f(cx-3.5)}" cy="{f(ey)}" r="1.2"/><circle class="eye" cx="{f(cx+3.5)}" cy="{f(ey)}" r="1.2"/>'
                 f'<path class="thin" d="M{f(cx)} {f(ey+1)}v{f(h*0.18)}"/>'
                 f'<path class="thin" d="M{f(cx-7)} {f(ey+h*0.25)}q2 {f(h*0.4)} 7 {f(h*0.5)}q5 -{f(h*0.1)} 7 -{f(h*0.5)}M{f(cx-3)} {f(ey+h*0.36)}v{f(h*0.22)}M{f(cx+3)} {f(ey+h*0.36)}v{f(h*0.22)}"/></g>')
    return o

def festoon(cx, cy, r, a0=18, a1=162, step=12, cls='bulb'):
    pts = []
    a = a0
    while a <= a1 + 0.01:
        pts.append(polar(cx, cy, r, a)); a += step
    pts = pts[::-1]
    d = f'M{f(pts[0][0])} {f(pts[0][1])}'
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        mx, my = (x0 + x1) / 2, (y0 + y1) / 2 + 4
        d += f'Q{f(mx)} {f(my+2)} {f(x1)} {f(y1)}'
    o = [f'<path class="thin" d="{d}"/>']
    for x, y in pts:
        o.append(f'<circle class="{cls}" cx="{f(x)}" cy="{f(y+3)}" r="2.6"/>')
    return o

# ---------------------------------------------------------------- case drawings
def case_line():
    o = ['<g class="ink rough">']
    o.append('<path d="M0 14H320M0 22H320"/><path class="thin" d="' + ''.join(f'M{x} 14V22' for x in range(8, 320, 26)) + '"/>')
    o.append('<path d="M14 22V212M306 22V212"/>')
    o.append('<path class="fp-none" d="M14 40Q160 92 306 40"/><circle cx="14" cy="40" r="2.5"/><circle cx="306" cy="40" r="2.5"/>')
    shirt = 'M-8 0L-15 2L-25 11L-19 21L-14 17L-14 50L14 50L14 17L19 21L25 11L15 2L8 0Q0 8 -8 0Z'
    fills = ['fp', 'fp hatch', 'mk-fill', 'fp', 'fp hatch']
    for i, t in enumerate((0.18, 0.34, 0.5, 0.66, 0.82)):
        x = 14 * (1 - t) ** 2 + 2 * (1 - t) * t * 160 + t * t * 306
        y = 40 * (1 - t) ** 2 + 2 * (1 - t) * t * 92 + t * t * 40
        dx = 2 * (1 - t) * (160 - 14) + 2 * t * (306 - 160); dy = 2 * (1 - t) * (92 - 40) + 2 * t * (40 - 92)
        ang = math.degrees(math.atan2(dy, dx)) * 0.5
        o.append(f'<g class="shirt" transform="translate({f(x)} {f(y)}) rotate({f(ang)})">'
                 f'<path class="{fills[i]}" d="{shirt}"/><path class="thin" d="M0 6V50M-6 1L0 8L6 1"/>'
                 f'<rect class="fp" x="-11" y="-5" width="3.5" height="9"/><rect class="fp" x="7.5" y="-5" width="3.5" height="9"/></g>')
    for x0 in (34, 186):
        o.append(f'<path class="fp" d="M{x0} 160H{x0+100}L{x0+104} 188H{x0-4}Z"/><path d="M{x0+8} 188V210M{x0+92} 188V210"/>'
                 f'<path class="thin" d="M{x0+30} 160v-10h6v10M{x0+62} 156a5 3 0 1 0 10 0"/>')
    o.append('<path d="M150 210L152 186M166 210L164 186M148 186H168M152 186C150 172 152 166 158 164C164 166 166 172 164 186"/>')
    o.append('</g><g class="notes">')
    o.append(hand(160, 134, 'the shirts are the menu', 19, 'middle'))
    o.append(arrow('M160 118C160 112 160 108 160 102', 'M154 108L160 100L166 108'))
    o.append('</g>')
    return '\n'.join(o)

def case_awning():
    o = ['<g class="ink rough">']
    o.append('<path class="fp" d="M20 34H300V204H20Z"/><path d="M14 34H306M14 28H306V34"/>')
    for x in (40, 96, 192, 248):
        o.append(f'<rect class="fp" x="{x}" y="44" width="32" height="30"/><path class="thin" d="M{x+16} 44V74"/>')
    o.append('<path class="thin" d="M150 80V204M170 80V204"/>')
    # left awning, down
    o.append('<path class="fp hatch-dense" d="M30 84H148L156 124H22Z"/><path class="fp" d="M22 124H156V132H22Z"/>')
    o.append('<rect class="fp" x="34" y="136" width="112" height="62"/><path class="thin" d="M90 136V198"/>')
    o.append('<path class="thin" d="M44 160v-8M48 160v-6M56 160v-9M44 160h16M70 160v-7M74 160v-9M68 160h12"/>')
    # right awning, rolled up
    o.append('<rect class="fp hatch-dense" x="168" y="82" width="126" height="11" rx="5.5"/>')
    o.append('<path class="fp hatch-dense" d="M172 93H290L292 100H170Z"/>')
    o.append('<rect class="fp" x="174" y="104" width="112" height="94"/>')
    o.append('<path class="thin" d="' + ''.join(f'M{x} 106V198' for x in range(178, 286, 4)) + '"/>')
    slats = ''.join(f'M{180 + i*7} {108 + i*4.2:.1f}V198' for i in range(15))
    o.append(f'<path class="slat" d="{slats}"/>')
    o.append('<path d="M10 204H310"/>')
    o.append('</g><g class="notes">')
    o.append(hand(310, 18, 'rolls up like a blind', 19, 'end'))
    o.append(arrow('M236 24C238 40 236 62 232 78', 'M226 70L232 80L239 71'))
    o.append(hand(14, 226, 'slats step down, one by one', 19))
    o.append(arrow('M190 214C200 208 204 202 206 196', 'M198 198L207 194L208 204'))
    o.append('</g>')
    return '\n'.join(o)

def case_sign():
    o = ['<g class="ink rough">']
    o.append('<path class="fp" d="M20 214V44L160 16L300 44V214"/><path d="M12 46L160 10L308 46"/>')
    o.append('<path class="thin" d="M28 60h18M34 66h14M272 70h18M268 76h14M30 196h16M38 202h12M276 190h16M282 196h10M140 34h14M168 34h12"/>')
    o.append('<rect class="fp" x="54" y="56" width="212" height="134"/><rect class="thin" x="60" y="62" width="200" height="122"/>')
    o.append('<path class="mark-hl" d="M70 149L252 147L253 167L69 169Z"/>')
    import random
    rnd = random.Random(11)
    lines = [(88, [7, 4, 9], 2.6, 13), (108, [4, 4, 6, 5], 1.7, 8), (126, [6, 3, 7], 1.7, 8),
             (144, [7, 6, 4], 1.7, 8), (161, [5, 6], 1.7, 8), (178, [4, 3, 6], 1.7, 8)]
    for y, words, sw, hgt in lines:
        lw = 5.2 if hgt > 10 else 4.4
        total = sum(words) * lw + (len(words) - 1) * 9
        x = 160 - total / 2
        d = ''
        for n in words:
            d += f'M{f(x)} {y}'
            for k in range(n):
                h = hgt * (0.55 + 0.45 * rnd.random()) * (1.25 if k == 0 else 1)
                d += f'c{f(lw*0.2)} -{f(h)} {f(lw*0.75)} -{f(h)} {f(lw)} 0'
            x += n * lw + 9
        o.append(f'<path class="letters" style="stroke-width:{sw}" d="{d}"/>')
    o.append('<path d="M10 214H310"/>')
    o.append('</g><g class="notes">')
    o.append(hand(160, 234, 'what’s served now lights up', 19, 'middle'))
    o.append(arrow('M250 220C262 200 268 180 258 160', 'M253 170L258 158L266 168'))
    o.append('</g>')
    return '\n'.join(o)

def case_arch():
    o = ['<g class="ink rough">']
    o.append('<path class="thin" d="M12 52h22M18 60h18M14 92h20M22 100h14M290 60h20M286 68h16M292 104h18M284 112h16M12 150h18M292 160h18"/>')
    cx, cy, ri, ro = 160, 140, 82, 98
    o += arch(cx, cy, ri, ro, 212)
    for x in (104, 132, 188, 216):
        y = cy - math.sqrt(ri ** 2 - (x - cx) ** 2)
        o.append(f'<path class="thin" d="M{x} {f(y)}V212"/>')
    o.append(f'<path class="thin" d="M{f(cx-ri+1)} 132H{f(cx+ri-1)}"/>')
    o.append('<rect class="fp" x="136" y="144" width="48" height="68"/><path class="thin" d="M160 144V212M153 172a4 6 0 0 0 0 12M167 172a4 6 0 0 1 0 12"/>')
    o += festoon(cx, cy, 72, cls='bulb')
    o.append('<path d="M6 212H314"/>')
    o.append('<path class="thin" d="M24 222q6 -3 12 0t12 0t12 0M120 226q6 -3 12 0t12 0t12 0t12 0M236 222q6 -3 12 0t12 0t12 0"/>')
    o.append('</g><g class="notes">')
    o.append(hand(8, 22, 'the face looks down', 18))
    o.append(arrow('M146 15C160 12 168 18 166 30', 'M160 23L166 32L172 24'))
    o.append('</g>')
    return '\n'.join(o)

# ---------------------------------------------------------------- the mock pages
def mock_before():
    o = []
    o.append('<rect class="tp-frame" x="1" y="1" width="358" height="538" rx="6"/>')
    o.append('<path class="tp-bar" d="M1 29V7a6 6 0 0 1 6 -6H353a6 6 0 0 1 6 6V29Z"/>')
    o.append('<circle class="tp-dot" cx="14" cy="15" r="3.5"/><circle class="tp-dot" cx="26" cy="15" r="3.5"/><circle class="tp-dot" cx="38" cy="15" r="3.5"/>')
    o.append('<rect class="tp-url" x="54" y="8" width="250" height="14" rx="2"/><text class="tp-t" x="62" y="18.5" font-size="8.5">www.your-restaurant.example</text>')
    o.append('<rect class="tp-grey" x="16" y="40" width="46" height="15"/><text class="tp-t tp-b" x="39" y="51" font-size="8" text-anchor="middle">LOGO</text>')
    o.append('<text class="tp-t" x="344" y="51" font-size="9.5" text-anchor="end">Home   About   Menu   Contact</text>')
    o.append('<rect class="tp-grey" x="16" y="66" width="328" height="176"/><path class="tp-line" d="M16 66L344 242M344 66L16 242"/>')
    o.append('<rect class="tp-url" x="116" y="146" width="128" height="16"/><text class="tp-t" x="180" y="157.5" font-size="8.5" text-anchor="middle">stock-photo-0417.jpg</text>')
    o.append('<text class="tp-h" x="16" y="282" font-size="23">Welcome to Our Restaurant</text>')
    o.append('<text class="tp-t" x="16" y="302" font-size="10">Fresh food · Great atmosphere · Friendly staff</text>')
    o.append('<rect class="tp-btn" x="16" y="316" width="146" height="30"/><text class="tp-t tp-w" x="89" y="334.5" font-size="10" text-anchor="middle">Download menu (PDF)</text>')
    o.append('<rect class="tp-btn2" x="172" y="316" width="90" height="30"/><text class="tp-t" x="217" y="334.5" font-size="10" text-anchor="middle">Book now</text>')
    for x in (16, 130, 244):
        o.append(f'<rect class="tp-card" x="{x}" y="366" width="100" height="124"/><rect class="tp-grey" x="{x+8}" y="374" width="84" height="50"/>'
                 f'<rect class="tp-dk" x="{x+8}" y="434" width="60" height="6"/><rect class="tp-grey" x="{x+8}" y="447" width="80" height="5"/>'
                 f'<rect class="tp-grey" x="{x+8}" y="457" width="70" height="5"/><text class="tp-t" x="{x+8}" y="479" font-size="8">Read more →</text>')
    o.append('<path class="tp-bar" d="M1 504H359V533a6 6 0 0 1 -6 6H7a6 6 0 0 1 -6 -6Z"/><text class="tp-t" x="16" y="525" font-size="8.5">© Your Restaurant</text>')
    # pencil mark-up
    o.append('<g class="mk">')
    o.append('<path class="pc mk1" pathLength="1" d="M30 74C120 52 300 58 340 92C366 140 350 236 260 248C170 258 40 252 22 214C6 170 10 96 52 70"/>')
    o.append(hand(30, 98, 'stock photo: could be anywhere', 17, extra=' paint-order="stroke"'))
    o.append('<path class="pc mk2" pathLength="1" d="M10 274C90 268 200 278 336 268"/>')
    o.append(hand(344, 259, 'swap the name: still works', 16, 'end', extra=' paint-order="stroke"'))
    o.append('<path class="pc mk3" pathLength="1" d="M10 322C40 304 150 306 168 320C182 336 160 356 90 356C30 356 4 344 12 324"/>')
    o.append(hand(176, 364, 'old PDF = old prices', 16, extra=' paint-order="stroke"'))
    o.append('<path class="pc mk4" pathLength="1" d="M16 496' + 'q9 6 18 0' * 18 + '"/>')
    o.append(hand(346, 524, 'the same three boxes as everyone', 15, 'end', extra=' paint-order="stroke"'))
    o.append('</g>')
    return '\n'.join(o)

def mock_after():
    o = []
    o.append('<rect class="af-frame" x="1" y="1" width="358" height="538" rx="6"/>')
    o.append('<path class="tp-bar" d="M1 29V7a6 6 0 0 1 6 -6H353a6 6 0 0 1 6 6V29Z"/>')
    o.append('<circle class="tp-dot" cx="14" cy="15" r="3.5"/><circle class="tp-dot" cx="26" cy="15" r="3.5"/><circle class="tp-dot" cx="38" cy="15" r="3.5"/>')
    o.append('<rect class="tp-url" x="54" y="8" width="250" height="14" rx="2"/><path class="af-scrib" d="M64 15c6 -4 10 4 16 0s10 4 16 0s10 4 16 0s10 4 16 0"/>')
    o.append('<text class="af-word" x="16" y="53" font-size="18">under the arch</text>')
    o.append('<text class="af-t" x="344" y="51" font-size="9.5" text-anchor="end">Menu   Find us   Call</text>')
    o.append('<path class="af-rule" d="M16 62H344"/>')
    o.append('<g class="ink dr-g">')
    o.append('<path class="thin dr" pathLength="1" d="M22 80h24M28 88h18M20 120h26M30 128h16M314 84h24M318 92h20M316 132h24M312 140h18M20 170h20M318 176h22"/>')
    cx, cy = 180, 214
    for p in arch(cx, cy, 98, 118, 286):
        o.append(p.replace('<path ', '<path pathLength="1" ', 1).replace('class="', 'class="dr ', 1) if p.startswith('<path') else p)
    for x in (114, 148, 212, 246):
        y = cy - math.sqrt(98 ** 2 - (x - cx) ** 2)
        o.append(f'<path class="thin dr" pathLength="1" d="M{x} {f(y)}V286"/>')
    o.append(f'<path class="thin dr" pathLength="1" d="M{f(cx-97)} 204H{f(cx+97)}"/>')
    o.append('<rect class="fp" x="150" y="214" width="60" height="72"/><path class="thin dr" pathLength="1" d="M180 214V286M171 244a4 6 0 0 0 0 12M189 244a4 6 0 0 1 0 12"/>')
    o += festoon(cx, cy, 88, cls='bulb')
    o.append('<path class="dr" pathLength="1" d="M16 286H344"/>')
    o.append('<path class="thin dr" pathLength="1" d="M30 296q6 -3 12 0t12 0t12 0M150 298q6 -3 12 0t12 0t12 0t12 0M280 296q6 -3 12 0t12 0t12 0"/>')
    o.append('</g>')
    o.append('<g class="af-copy">')
    o.append('<text class="af-h" x="16" y="330" font-size="22">Coffee under the arch,</text>')
    o.append('<text class="af-h" x="16" y="355" font-size="22">by the river.</text>')
    o.append('<text class="af-word" x="16" y="380" font-size="15">On the board today</text>')
    for i, t in enumerate(('Porridge, stewed fruit', 'Soup of the day, bread', 'Cakes under glass')):
        y = 399 + i * 17
        o.append(f'<path class="af-fern" d="M18 {y-4}l6 0M21 {y-7}l0 6"/><text class="af-t" x="32" y="{y}" font-size="11.5">{t}</text>')
    o.append('<rect class="af-btn" x="16" y="446" width="146" height="30"/><text class="af-t af-w" x="89" y="465" font-size="10.5" text-anchor="middle">Call the café</text>')
    o.append('<rect class="af-btn2" x="172" y="446" width="132" height="30"/><text class="af-t" x="238" y="465" font-size="10.5" text-anchor="middle">Find the arch</text>')
    o.append('<path class="tp-bar" d="M1 504H359V533a6 6 0 0 1 -6 6H7a6 6 0 0 1 -6 -6Z"/><text class="af-t" x="16" y="525" font-size="8.5">Down the steps, under the arch</text>')
    o.append('</g>')
    o.append('<g class="fin">')
    o.append('<path class="mark-hl" d="M184 510L352 507L353 533L183 535Z"/>')
    o.append('<path class="pc" pathLength="1" d="M190 521l6 7l11 -15"/>')
    o.append(hand(212, 527, 'passes the swap test', 15.5, cls='hn nohalo'))
    o.append(hand(344, 400, 'menu as real text', 15, 'end', extra=' paint-order="stroke"'))
    o.append('<path class="pc" pathLength="1" d="M300 405C290 411 270 411 252 409"/>')
    o.append(hand(344, 494, 'their phone, no fake form', 14, 'end', extra=' paint-order="stroke"'))
    o.append('</g>')
    return '\n'.join(o)

def scrib(x, y, w, rnd, hgt=5, sw=1.4, cls='letters'):
    d = f'M{f(x)} {y}'; cx = x; lw = 3.4
    while cx < x + w - lw:
        h = hgt * (0.5 + 0.5 * rnd.random())
        if rnd.random() < 0.16 and cx > x + 8:
            cx += 4; d += f'M{f(cx)} {y}'; continue
        d += f'c{f(lw*0.2)} -{f(h)} {f(lw*0.75)} -{f(h)} {f(lw)} 0'; cx += lw
    return f'<path class="{cls}" style="stroke-width:{sw}" d="{d}"/>'

def phone():
    import random
    rnd = random.Random(5)
    o = ['<g class="ink rough">']
    o.append('<rect class="fp" x="92" y="12" width="148" height="300" rx="20"/><rect class="thin" x="102" y="36" width="128" height="250" rx="4"/>')
    o.append('<path d="M150 24H182"/><circle class="fp-none" cx="166" cy="298" r="6"/>')
    o.append('<rect class="fp" x="110" y="46" width="112" height="18" rx="3"/><circle class="fp-none" cx="120" cy="55" r="4"/><path class="thin" d="M123 58l3 3"/>')
    o.append(scrib(132, 58, 70, rnd, 4, 1.1))
    o.append('<rect class="fp" x="110" y="74" width="112" height="128" rx="3"/>')
    for i, y in enumerate(range(92, 196, 13)):
        w = 96 if i % 3 else 80
        o.append(scrib(118, y, w - (i * 3 % 17), rnd, 5, 1.2))
    o.append('<path class="thin" d="M110 212H222M110 226H200M110 246H222M110 260H190M110 274H210"/>')
    o.append('</g><g class="notes">')
    # the wrong line, struck through and circled
    o.append('<path class="pc draw" pathLength="1" style="--d:.2s" d="M114 140C140 136 180 141 216 137"/>')
    o.append('<path class="pc draw" pathLength="1" style="--d:.4s" d="M106 133C140 122 214 124 226 134C232 146 190 150 150 148C120 147 104 144 106 134"/>')
    o.append(hand(4, 112, 'old PDF,', 18)); o.append(hand(4, 132, 'old prices', 18))
    o.append(arrow('M70 138C84 142 94 140 104 138', 'M96 133L105 138L97 144', delay=.6))
    # the right line, ticked
    o.append('<path class="pc draw" pathLength="1" style="--d:.8s" d="M226 96l5 6l9 -12"/>')
    o.append(hand(246, 84, 'right:', 18)); o.append(hand(246, 104, 'the hours', 18))
    o.append('<path class="mark-hl" d="M62 326L272 323L273 350L61 352Z"/>')
    o.append(hand(166, 344, 'checked against what you publish', 18, 'middle'))
    o.append('</g>')
    return '\n'.join(o)

PARTS = {'hero': hero, 'case-line': case_line, 'case-awning': case_awning, 'case-sign': case_sign,
         'case-arch': case_arch, 'mock-before': mock_before, 'mock-after': mock_after, 'phone': phone}

def splice(path):
    s = path.read_text()
    def rep(m):
        name = m.group(1)
        return f'<!--@svg {name}-->\n{PARTS[name]()}\n<!--@end-->'
    s2 = re.sub(r'<!--@svg ([\w-]+)-->.*?<!--@end-->', rep, s, flags=re.S)
    path.write_text(s2)

if __name__ == '__main__':
    root = pathlib.Path(sys.argv[1])
    for p in root.glob('*.html'):
        splice(p)
    print('ok')
