/*
  Tide Tables, concept A: "Through the arch".
  A tiny perspective renderer for one SVG. World units are metres: x right, y up,
  z into the vault. The arch front sits at z = 0 and the far door at z = L.
  Planar things (the arch front, the far wall, the garden view) are vector groups
  scaled about the vanishing point; everything else is projected point by point,
  so the drawing stays crisp at every depth. No scroll-jacking: the page scrolls
  natively, and this only reads the scroll position.
*/
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  // Vault cross-section: walls to springing height HS, then a half-ellipse (A wide, B tall).
  var A = 2.6, B = 1.9, HS = 1.1, EYE = 1.55, L = 22, RING = 0.48, RSTEP = 1.1;

  var COL = {
    wash: '#E9E7E0', brick: '#47413B', chalk: '#141312', fern: '#5E7342',
    bulb: '#F3C46B', oil: '#9A8D83', mortar: '#B3AB9F', stone: '#ABADB1',
    tile: '#D8D0C2', grout: '#BDB3A3', steel: '#2A2D2F', shade: '#8E2C1C'
  };

  // ---------- small helpers ----------
  function mk(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function rng(seed) {
    return function () {
      seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(a, b, v) { var t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function n1(v) { return Math.round(v * 10) / 10; }
  function hexLerp(a, b, t) {
    var pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    var r = Math.round(lerp(pa >> 16, pb >> 16, t)), g = Math.round(lerp((pa >> 8) & 255, (pb >> 8) & 255, t)), bl = Math.round(lerp(pa & 255, pb & 255, t));
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1);
  }
  // point on the vault section at parameter t (0 = right springing, PI = left), offset outward by off
  function ell(t, off, a, b) {
    a = a || A; b = b || B;
    var px = a * Math.cos(t), py = HS + b * Math.sin(t);
    var nx = b * Math.cos(t), ny = a * Math.sin(t), nl = Math.sqrt(nx * nx + ny * ny) || 1;
    return [px + off * nx / nl, py + off * ny / nl];
  }
  // monotone cubic interpolation through keyframes (no overshoot, continuous velocity)
  function monotone(xs, ys) {
    var n = xs.length, d = [], m = [], i;
    for (i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
    m[0] = d[0]; m[n - 1] = d[n - 2];
    for (i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
    for (i = 0; i < n - 1; i++) {
      if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; }
      var a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
      if (s > 9) { var t = 3 / Math.sqrt(s); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; }
    }
    return function (x) {
      if (x <= xs[0]) return ys[0];
      if (x >= xs[n - 1]) return ys[n - 1];
      var k = 0; while (x > xs[k + 1]) k++;
      var h = xs[k + 1] - xs[k], t = (x - xs[k]) / h, t2 = t * t, t3 = t2 * t;
      return (2 * t3 - 3 * t2 + 1) * ys[k] + (t3 - 2 * t2 + t) * h * m[k] + (-2 * t3 + 3 * t2) * ys[k + 1] + (t3 - t2) * h * m[k + 1];
    };
  }

  // ---------- the scene ----------
  function Vault(svg) {
    this.svg = svg;
    this.objs = [];
    this.bulbs = [];
    this.lit = null; // null = scroll-driven lighting; number = fixed light front
  }

  Vault.prototype.build = function () {
    var svg = this.svg;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.setAttribute('xmlns', NS);
    var defs = mk('defs', null, svg);
    this.buildDefs(defs);

    this.base = mk('rect', { x: 0, y: 0, width: 10, height: 10, fill: '#DCD8CF' }, svg);

    // barrel rings, near to far (each farther section paints inside the nearer one)
    this.rings = [];
    var gR = mk('g', { 'class': 'v-rings' }, svg);
    for (var i = 0; i <= Math.floor(L / RSTEP); i++) {
      var z = i * RSTEP, u = z / L;
      // whitewash: slightly greyer mid-vault, brightening towards the daylight at the far door
      var fill = u < 0.6 ? hexLerp('#E6E3DB', '#D6D2C8', u / 0.6) : hexLerp('#D6D2C8', '#E9E4D6', (u - 0.6) / 0.4);
      this.rings.push({ z: z, el: mk('path', { fill: fill, stroke: 'rgba(71,65,59,.10)', 'stroke-width': 1 }, gR) });
    }
    this.floor = mk('path', { fill: COL.tile }, svg);
    this.floorShade = mk('path', { fill: 'url(#v-floorshade)' }, svg);
    this.grout = mk('path', { fill: 'none', stroke: COL.grout, 'stroke-width': 1 }, svg);
    this.patchA = mk('path', { fill: '#8C8177', opacity: 0.32 }, svg);
    this.patchB = mk('path', { fill: '#5C5249', opacity: 0.22 }, svg);
    this.buildPatches();

    // the far wall, with the garden seen through its door
    this.far = mk('g', { 'class': 'v-far' }, svg);
    this.buildFarWall(this.far);

    // furniture, plants and lights, sorted far to near
    this.gObj = mk('g', { 'class': 'v-objects' }, svg);
    this.buildObjects();

    this.vignette = mk('rect', { x: 0, y: 0, width: 10, height: 10, fill: 'url(#v-vignette)', 'pointer-events': 'none' }, svg);

    // towpath paving in front of the arch, and the arch front itself
    this.paving = mk('path', { fill: '#CDC7BC' }, svg);
    this.pavingLines = mk('path', { fill: 'none', stroke: '#B2AA9D', 'stroke-width': 1 }, svg);
    this.drain = mk('path', { fill: '#5E5A55' }, svg);
    this.facade = mk('g', { 'class': 'v-facade' }, svg);
    this.buildFacade(this.facade);
  };

  Vault.prototype.buildDefs = function (defs) {
    var r = rng(11);
    // façade brick, stretcher bond, 8 bricks x 12 courses per tile (cm)
    var pat = mk('pattern', { id: 'v-brick', width: 180, height: 90, patternUnits: 'userSpaceOnUse' }, defs);
    mk('rect', { width: 180, height: 90, fill: '#9E968A' }, pat);
    var tones = ['#47413B', '#3B342E', '#4E4640', '#635D58', '#54403A', '#3F3833', '#5B4A42', '#6A5148', '#433C37', '#4A4039'];
    var buckets = {};
    for (var c = 0; c < 12; c++) {
      var off = (c % 2) * 11.25;
      for (var b = -1; b < 9; b++) {
        var x = b * 22.5 + off, y = c * 7.5;
        var x0 = Math.max(x + 0.5, 0), x1 = Math.min(x + 22, 180);
        if (x1 - x0 < 1) continue;
        var tone = tones[Math.floor(r() * r() * tones.length)];
        (buckets[tone] = buckets[tone] || []).push('M' + n1(x0) + ' ' + n1(y + 0.5) + 'h' + n1(x1 - x0) + 'v6.5h' + n1(x0 - x1) + 'z');
      }
    }
    for (var t in buckets) mk('path', { d: buckets[t].join(''), fill: t }, pat);
    mk('path', { d: 'M0 .8H180M0 8.3H180M0 15.8H180M0 23.3H180M0 30.8H180M0 38.3H180M0 45.8H180M0 53.3H180M0 60.8H180M0 68.3H180M0 75.8H180M0 83.3H180', stroke: '#fff', 'stroke-opacity': 0.06, 'stroke-width': 0.8 }, pat);

    var g;
    g = mk('linearGradient', { id: 'v-soot', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    mk('stop', { offset: 0, 'stop-color': '#14110F', 'stop-opacity': 0.72 }, g);
    mk('stop', { offset: 0.55, 'stop-color': '#14110F', 'stop-opacity': 0.18 }, g);
    mk('stop', { offset: 0.92, 'stop-color': '#14110F', 'stop-opacity': 0.05 }, g);
    mk('stop', { offset: 1, 'stop-color': '#14110F', 'stop-opacity': 0.3 }, g);

    g = mk('linearGradient', { id: 'v-glass', x1: 0, y1: 0, x2: 0.3, y2: 1 }, defs);
    mk('stop', { offset: 0, 'stop-color': '#DDE6EA', 'stop-opacity': 0.26 }, g);
    mk('stop', { offset: 0.5, 'stop-color': '#FFFFFF', 'stop-opacity': 0.04 }, g);
    mk('stop', { offset: 1, 'stop-color': '#C9D3D6', 'stop-opacity': 0.14 }, g);

    g = mk('radialGradient', { id: 'v-glow' }, defs);
    mk('stop', { offset: 0, 'stop-color': '#FFE3A1', 'stop-opacity': 0.9 }, g);
    mk('stop', { offset: 0.35, 'stop-color': COL.bulb, 'stop-opacity': 0.35 }, g);
    mk('stop', { offset: 1, 'stop-color': COL.bulb, 'stop-opacity': 0 }, g);

    g = mk('radialGradient', { id: 'v-day', cx: 0.5, cy: 0.62, r: 0.5 }, defs);
    mk('stop', { offset: 0, 'stop-color': '#FFF8E6', 'stop-opacity': 0.95 }, g);
    mk('stop', { offset: 0.45, 'stop-color': '#FFF3D6', 'stop-opacity': 0.35 }, g);
    mk('stop', { offset: 1, 'stop-color': '#FFF3D6', 'stop-opacity': 0 }, g);

    g = mk('radialGradient', { id: 'v-vignette', cx: 0.5, cy: 0.5, r: 0.75 }, defs);
    mk('stop', { offset: 0.45, 'stop-color': '#2A241F', 'stop-opacity': 0 }, g);
    mk('stop', { offset: 1, 'stop-color': '#2A241F', 'stop-opacity': 0.42 }, g);
    this.vigGrad = g;

    g = mk('linearGradient', { id: 'v-floorshade', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    mk('stop', { offset: 0, 'stop-color': '#FFF6DE', 'stop-opacity': 0.5 }, g);
    mk('stop', { offset: 0.4, 'stop-color': '#FFF6DE', 'stop-opacity': 0 }, g);
    mk('stop', { offset: 1, 'stop-color': '#3A332D', 'stop-opacity': 0.28 }, g);

    g = mk('linearGradient', { id: 'v-sky', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    mk('stop', { offset: 0, 'stop-color': '#EEF0EA' }, g);
    mk('stop', { offset: 1, 'stop-color': '#FBF5E4' }, g);

    g = mk('linearGradient', { id: 'v-river', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    mk('stop', { offset: 0, 'stop-color': '#8391A1' }, g);
    mk('stop', { offset: 1, 'stop-color': '#A9B6C0' }, g);

    g = mk('linearGradient', { id: 'v-shade', x1: 0, y1: 0, x2: 1, y2: 0 }, defs);
    mk('stop', { offset: 0, 'stop-color': '#6E2014' }, g);
    mk('stop', { offset: 0.38, 'stop-color': '#A8402A' }, g);
    mk('stop', { offset: 1, 'stop-color': '#5E1A10' }, g);

    // gravel speckle
    var gp = mk('pattern', { id: 'v-gravel', width: 60, height: 40, patternUnits: 'userSpaceOnUse' }, defs);
    mk('rect', { width: 60, height: 40, fill: '#E2DBCF' }, gp);
    var gr = rng(5), d1 = '', d2 = '';
    for (var k = 0; k < 70; k++) {
      var gx = n1(gr() * 60), gy = n1(gr() * 40), rr = n1(0.6 + gr() * 1.6);
      var s = 'M' + gx + ' ' + gy + 'm-' + rr + ' 0a' + rr + ' ' + rr + ' 0 1 0 ' + (2 * rr) + ' 0a' + rr + ' ' + rr + ' 0 1 0 -' + (2 * rr) + ' 0';
      if (k % 3) d1 += s; else d2 += s;
    }
    mk('path', { d: d1, fill: '#B9B0A2' }, gp);
    mk('path', { d: d2, fill: '#F6F1E8' }, gp);
  };

  // worn whitewash: little clusters of old brick showing through
  Vault.prototype.buildPatches = function () {
    var r = rng(23), list = [];
    for (var i = 0; i < 150; i++) {
      var onWall = r() < 0.22;
      var z = 0.4 + r() * (L - 1.2);
      var cluster = 1 + Math.floor(r() * 4);
      var dark = r() < 0.3;
      if (onWall) {
        var side = r() < 0.5 ? -1 : 1, y = 0.25 + r() * 0.8;
        for (var c = 0; c < cluster; c++) list.push({ wall: side, y: y + Math.floor(c / 2) * 0.075, z: z + (c % 2) * 0.235 + (Math.floor(c / 2) % 2) * 0.11, dark: dark });
      } else {
        var t = 0.1 * Math.PI + r() * 0.8 * Math.PI;
        for (var c2 = 0; c2 < cluster; c2++) list.push({ t: t + Math.floor(c2 / 2) * 0.034, z: z + (c2 % 2) * 0.235 + (Math.floor(c2 / 2) % 2) * 0.11, dark: dark });
      }
    }
    this.patchList = list;
  };

  // ---------- the arch front (cm, y up = negative) ----------
  Vault.prototype.buildFacade = function (g) {
    var self = this, r = rng(3), i;
    // outline of the extrados (outer edge of the brick ring) and of the opening
    var outer = [], inner = [];
    for (i = 0; i <= 64; i++) {
      var t = Math.PI - (i / 64) * Math.PI;
      var po = ell(t, RING), pi = ell(t, 0);
      outer.push(n1(po[0] * 100) + ' ' + n1(-po[1] * 100));
      inner.push(n1(pi[0] * 100) + ' ' + n1(-pi[1] * 100));
    }
    var R = (A + RING) * 100, Ai = A * 100, H = HS * 100;
    var outerPath = 'M' + (-R) + ' 0L' + outer.join('L') + 'L' + R + ' 0Z';
    var innerPath = 'M' + (-Ai) + ' 0L' + inner.join('L') + 'L' + Ai + ' 0Z';
    this.openingPath = innerPath;

    // wall with the arch cut out
    mk('path', { d: 'M-1500 -1400H1500V0H-1500Z' + outerPath, fill: 'url(#v-brick)', 'fill-rule': 'evenodd' }, g);
    mk('path', { d: 'M-1500 -1400H1500V0H-1500Z' + outerPath, fill: 'url(#v-soot)', 'fill-rule': 'evenodd' }, g);
    // a few odd bricks so the bond never looks like wallpaper
    var odd = '', odd2 = '';
    for (i = 0; i < 90; i++) {
      var ox = -1200 + r() * 2400, oy = -1300 + Math.floor(r() * 170) * 7.5;
      var course = Math.round(-oy / 7.5);
      ox = Math.round((ox - (course % 2) * 11.25) / 22.5) * 22.5 + (course % 2) * 11.25;
      if (Math.abs(ox) < R + 30 && -oy < (HS + B + RING) * 100 + 20) continue;
      var s = 'M' + n1(ox + 0.5) + ' ' + n1(oy + 0.5) + 'h21.5v6.5h-21.5z';
      if (r() < 0.5) odd += s; else odd2 += s;
    }
    mk('path', { d: odd, fill: '#7A5A4C', opacity: 0.55 }, g);
    mk('path', { d: odd2, fill: '#2C2622', opacity: 0.6 }, g);

    // the brick ring: mortar bed, then two rings of radiating voussoirs
    mk('path', { d: outerPath + innerPath, fill: '#A79F93', 'fill-rule': 'evenodd' }, g);
    var vb = {}, vt = ['#47413B', '#3B342E', '#635D58', '#55473F', '#3F3732', '#6B5249'];
    [[0.008, 0.232], [0.248, 0.472]].forEach(function (rg, ri) {
      // equal arc length along the middle of this ring
      var mid = (rg[0] + rg[1]) / 2, N = 400, acc = [0], prev = ell(Math.PI, mid);
      for (var k = 1; k <= N; k++) {
        var p = ell(Math.PI - (k / N) * Math.PI, mid);
        acc.push(acc[k - 1] + Math.hypot(p[0] - prev[0], p[1] - prev[1])); prev = p;
      }
      var total = acc[N], count = Math.round(total / (ri ? 0.082 : 0.076));
      function tAt(len) { var k = 0; while (k < N && acc[k + 1] < len) k++; var f = (len - acc[k]) / ((acc[k + 1] - acc[k]) || 1); return Math.PI - ((k + f) / N) * Math.PI; }
      for (var b = 0; b < count; b++) {
        var ta = tAt((b / count) * total + 0.005), tb = tAt(((b + 1) / count) * total - 0.005);
        var a0 = ell(ta, rg[0]), a1 = ell(ta, rg[1]), b1 = ell(tb, rg[1]), b0 = ell(tb, rg[0]);
        var midx = (a0[0] + b1[0]) / 2;
        if (Math.abs(midx) < 0.25) continue; // the keystone face sits here
        var tone = vt[Math.floor(r() * r() * vt.length)];
        (vb[tone] = vb[tone] || []).push('M' + [a0, a1, b1, b0].map(function (q) { return n1(q[0] * 100) + ' ' + n1(-q[1] * 100); }).join('L') + 'Z');
      }
    });
    // jambs below the springing, coursed
    for (var side = -1; side <= 1; side += 2) {
      for (var c = 0; c < Math.floor(H / 7.5); c++) {
        var y0 = -(c * 7.5 + 7), widths = c % 2 ? [11, 23, 11] : [23, 23], x = Ai + 1;
        widths.forEach(function (w) {
          var xa = side > 0 ? x : -x - w + 1, tone = vt[Math.floor(r() * r() * vt.length)];
          (vb[tone] = vb[tone] || []).push('M' + n1(xa) + ' ' + n1(y0) + 'h' + (w - 1) + 'v6.5h' + (1 - w) + 'z');
          x += w + 1;
        });
      }
    }
    for (var tn in vb) mk('path', { d: vb[tn].join(''), fill: tn }, g);
    // a little light catching the lower lip of the ring
    mk('path', { d: innerPath, fill: 'none', stroke: '#C9C1B4', 'stroke-opacity': 0.35, 'stroke-width': 2 }, g);

    // glazed screen
    var glass = mk('g', { 'class': 'v-glass' }, g);
    mk('path', { d: innerPath, fill: 'url(#v-glass)' }, glass);
    var clipId = 'v-openclip';
    var cp = mk('clipPath', { id: clipId }, g);
    mk('path', { d: innerPath }, cp);
    var refl = mk('g', { 'clip-path': 'url(#' + clipId + ')', opacity: 0.55 }, glass);
    mk('path', { d: 'M-250 -320L-170 -320L-330 0L-410 0Z M-120 -320L-95 -320L-255 0L-280 0Z M180 -320L250 -320L90 0L20 0Z', fill: '#FFFFFF', opacity: 0.12 }, refl);

    // steel frame: arch, side mullions, door frame and transom
    function archY(x) { return -(HS + B * Math.sqrt(Math.max(0, 1 - (x / A) * (x / A)))) * 100; }
    var fr = mk('g', { fill: 'none', stroke: COL.steel, 'stroke-linecap': 'square' }, g);
    mk('path', { d: innerPath, 'stroke-width': 6 }, fr);
    mk('path', { d: 'M-190 0V' + n1(archY(-1.9)) + 'M190 0V' + n1(archY(1.9)), 'stroke-width': 3.5 }, fr);
    mk('path', { d: 'M-102 0V' + n1(archY(-1.02)) + 'M102 0V' + n1(archY(1.02)) + 'M-102 -218H102', 'stroke-width': 4.5 }, fr);
    mk('path', { d: 'M-102 -218H102', stroke: '#C7CBCD', 'stroke-width': 1, 'stroke-opacity': 0.5 }, fr);

    // the glass doors (swing open as you arrive)
    this.leaves = [];
    [-1, 1].forEach(function (s) {
      var hinge = s * 100;
      var leaf = mk('g', { 'class': 'v-leaf' }, g);
      var x0 = s < 0 ? -100 : 2, w = 98;
      mk('rect', { x: x0, y: -214, width: w, height: 214, fill: '#E8EEF0', 'fill-opacity': 0.08, stroke: '#5C6163', 'stroke-width': 3 }, leaf);
      mk('path', { d: 'M' + (x0 + 8) + ' -200L' + (x0 + 40) + ' -200L' + (x0 + 14) + ' -20L' + (x0 + 6) + ' -20Z', fill: '#fff', opacity: 0.1 }, leaf);
      // big D handle on the meeting stiles
      var hx = s < 0 ? -12 : 12;
      mk('path', { d: 'M' + hx + ' -128 C' + (hx - s * 16) + ' -128 ' + (hx - s * 16) + ' -82 ' + hx + ' -82', fill: 'none', stroke: '#D2D5D6', 'stroke-width': 3.2, 'stroke-linecap': 'round' }, leaf);
      self.leaves.push({ el: leaf, hinge: hinge });
    });
    // weathered threshold strip
    mk('rect', { x: -Ai, y: -2, width: Ai * 2, height: 2, fill: '#3B3733' }, g);

    // the carved face at the keystone (drawn from scratch; identity unknown)
    var fh = 72, fw = fh * 224 / 288, fcy = -(HS + B + RING * 0.52) * 100;
    this.face = mk('use', { href: '#keystone-face', x: n1(-fw / 2), y: n1(fcy - fh / 2), width: n1(fw), height: fh, 'class': 'v-face' }, g);
  };

  // ---------- the far wall and the garden through the far door (cm, at z = L) ----------
  Vault.prototype.buildFarWall = function (g) {
    var r = rng(41), i;
    var sec = 'M' + (-A * 100) + ' 0V' + (-HS * 100) + 'A' + (A * 100) + ' ' + (B * 100) + ' 0 0 1 ' + (A * 100) + ' ' + (-HS * 100) + 'V0Z';
    mk('path', { d: sec, fill: '#EDE9DF' }, g);
    // soft daylight on the wall around the door
    this.dayWash = mk('ellipse', { cx: 0, cy: -120, rx: 230, ry: 190, fill: 'url(#v-day)', opacity: 0.6 }, g);

    // garden view, clipped to the door arch, parallaxed in render()
    var R0 = 78, spring = -150;
    var opening = 'M' + (-R0) + ' 0V' + spring + 'A' + R0 + ' ' + R0 + ' 0 0 1 ' + R0 + ' ' + spring + 'V0Z';
    var cp = mk('clipPath', { id: 'v-doorclip' }, g);
    mk('path', { d: opening }, cp);
    var clipG = mk('g', { 'clip-path': 'url(#v-doorclip)' }, g);
    this.garden = mk('g', { 'class': 'v-garden' }, clipG);
    this.buildGarden(this.garden);

    // exposed brick arch around the far door (the old brick shows here)
    var bb = {}, tones = ['#7A5444', '#6A4636', '#8A6352', '#5E4134', '#74503F'];
    mk('path', { d: 'M' + (-R0 - 24) + ' 0V' + spring + 'A' + (R0 + 24) + ' ' + (R0 + 24) + ' 0 0 1 ' + (R0 + 24) + ' ' + spring + 'V0H' + R0 + 'V' + spring + 'A' + R0 + ' ' + R0 + ' 0 0 0 ' + (-R0) + ' ' + spring + 'V0Z', fill: '#C9BBA8' }, g);
    var n = 34;
    for (i = 0; i < n; i++) {
      var a0 = Math.PI - (i / n) * Math.PI - 0.012, a1 = Math.PI - ((i + 1) / n) * Math.PI + 0.012;
      var pts = [[R0 + 1, a0], [R0 + 23, a0], [R0 + 23, a1], [R0 + 1, a1]].map(function (q) { return n1(Math.cos(q[1]) * q[0]) + ' ' + n1(spring - Math.sin(q[1]) * q[0]); });
      var tn = tones[Math.floor(r() * tones.length)];
      (bb[tn] = bb[tn] || []).push('M' + pts.join('L') + 'Z');
    }
    for (var side = -1; side <= 1; side += 2) {
      for (var c = 0; c < 20; c++) {
        var y0 = -(c * 7.5 + 7), w = c % 2 ? 11 : 23, xa = side > 0 ? R0 + 1 : -R0 - w;
        var tn2 = tones[Math.floor(r() * tones.length)];
        (bb[tn2] = bb[tn2] || []).push('M' + xa + ' ' + y0 + 'h' + (w - 1) + 'v6.5h' + (1 - w) + 'z');
        if (c % 2) { var xb = side > 0 ? R0 + 13 : -R0 - 23; (bb[tn] = bb[tn] || []).push('M' + xb + ' ' + y0 + 'h10v6.5h-10z'); }
      }
    }
    for (var t in bb) mk('path', { d: bb[t].join(''), fill: t }, g);

    // door frame, fanlight and the two glazed leaves (they open at the end)
    mk('path', { d: 'M-58 0V-206H58V0', fill: 'none', stroke: '#33403B', 'stroke-width': 5 }, g);
    mk('path', { d: 'M-58 -206H58 M0 -206V' + (spring - R0 + 4) + 'M-40 -206L-55 -170 M40 -206L55 -170', fill: 'none', stroke: '#33403B', 'stroke-width': 2.4 }, g);
    this.farLeaves = [];
    var self = this;
    [-1, 1].forEach(function (s) {
      var leaf = mk('g', null, g);
      var x0 = s < 0 ? -56 : 1;
      mk('rect', { x: x0, y: -204, width: 55, height: 204, fill: '#FFFDF4', 'fill-opacity': 0.16, stroke: '#33403B', 'stroke-width': 3.5 }, leaf);
      mk('path', { d: 'M' + x0 + ' -70H' + (x0 + 55), stroke: '#33403B', 'stroke-width': 3 }, leaf);
      mk('rect', { x: x0 + 2, y: -68, width: 51, height: 66, fill: '#33403B', opacity: 0.85 }, leaf);
      mk('path', { d: 'M' + (x0 + 8) + ' -196L' + (x0 + 26) + ' -196L' + (x0 + 12) + ' -80L' + (x0 + 5) + ' -80Z', fill: '#fff', opacity: 0.22 }, leaf);
      self.farLeaves.push({ el: leaf, hinge: s * 57 });
    });
  };

  // the garden and the river, seen through the far door (garden plane, cm)
  Vault.prototype.buildGarden = function (g) {
    var r = rng(77), i, d;
    mk('rect', { x: -700, y: -1000, width: 1400, height: 1400, fill: 'url(#v-sky)' }, g);
    // the far bank: soft trees
    d = '';
    for (i = 0; i < 26; i++) {
      var x = -700 + i * 56 + r() * 20, rr = 40 + r() * 50, y = -300 - r() * 40;
      d += 'M' + n1(x - rr) + ' -250A' + n1(rr) + ' ' + n1(rr * 0.9) + ' 0 0 1 ' + n1(x + rr) + ' -250Z';
    }
    mk('path', { d: d, fill: '#9BA476', opacity: 0.85 }, g);
    mk('rect', { x: -700, y: -262, width: 1400, height: 14, fill: '#7E8659' }, g);
    // the Thames
    mk('rect', { x: -700, y: -250, width: 1400, height: 110, fill: 'url(#v-river)' }, g);
    d = '';
    for (i = 0; i < 40; i++) {
      var gx = -650 + r() * 1300, gy = -240 + r() * 92, gl = 14 + r() * 50;
      d += 'M' + n1(gx) + ' ' + n1(gy) + 'h' + n1(gl);
    }
    mk('path', { d: d, stroke: '#EEF2F3', 'stroke-width': 2, 'stroke-linecap': 'round', opacity: 0.7 }, g);
    // the river wall and the gravel garden
    mk('rect', { x: -700, y: -142, width: 1400, height: 10, fill: '#CFC7B5' }, g);
    mk('rect', { x: -700, y: -132, width: 1400, height: 540, fill: 'url(#v-gravel)' }, g);
    // a pale stone arch of the bridge beyond, to the left (Portland stone)
    mk('path', { d: 'M-700 -560H-330V-132H-380C-380 -330 -520 -420 -700 -430Z', fill: '#D9D3C3' }, g);
    mk('path', { d: 'M-380 -132C-380 -330 -520 -420 -700 -430', fill: 'none', stroke: '#B7AF9C', 'stroke-width': 10 }, g);
    mk('path', { d: 'M-700 -560H-330 M-700 -600H-330', stroke: '#BDB5A2', 'stroke-width': 6 }, g);
    d = '';
    for (i = 0; i < 9; i++) { var bx = -690 + i * 40; d += 'M' + bx + ' -600h14c-6 12 -6 28 0 40h-14c6-12 6-28 0-40z'; }
    mk('path', { d: d, fill: '#C8C1AE' }, g);
    // dappled shade on the gravel
    d = '';
    for (i = 0; i < 26; i++) {
      var sx = -650 + r() * 1300, sy = -110 + r() * 380, srx = 30 + r() * 90;
      d += 'M' + n1(sx - srx) + ' ' + n1(sy) + 'a' + n1(srx) + ' ' + n1(srx * 0.28) + ' 0 1 0 ' + n1(srx * 2) + ' 0a' + n1(srx) + ' ' + n1(srx * 0.28) + ' 0 1 0 ' + n1(-srx * 2) + ' 0';
    }
    mk('path', { d: d, fill: '#A39D93', opacity: 0.35 }, g);
    // a plane tree: mottled, flaking trunk
    mk('path', { d: 'M180 300C200 120 205 -120 190 -420C186 -560 170 -700 150 -1000H330C320 -700 300 -560 304 -420C320 -140 340 120 380 300Z', fill: '#9C8B6F' }, g);
    d = ''; var d2 = '';
    for (i = 0; i < 46; i++) {
      var tx = 200 + r() * 110, ty = -900 + r() * 1150, tw = 10 + r() * 26, th = 14 + r() * 40;
      var s = 'M' + n1(tx) + ' ' + n1(ty) + 'q' + n1(tw * 0.6) + ' ' + n1(-th * 0.2) + ' ' + n1(tw) + ' ' + n1(th * 0.3) + 'q' + n1(-tw * 0.1) + ' ' + n1(th * 0.6) + ' ' + n1(-tw * 0.7) + ' ' + n1(th * 0.7) + 'q' + n1(-tw * 0.4) + ' ' + n1(-th * 0.5) + ' ' + n1(-tw * 0.3) + ' ' + n1(-th) + 'z';
      if (i % 3) d += s; else d2 += s;
    }
    mk('path', { d: d, fill: '#C9BFA2', opacity: 0.85 }, g);
    mk('path', { d: d2, fill: '#5E5238', opacity: 0.6 }, g);
    mk('path', { d: 'M190 -420C230 -360 260 -360 304 -420', fill: 'none', stroke: '#47402B', 'stroke-width': 4, opacity: 0.4 }, g);
    // canopy: plane leaves in three greens
    var greens = ['#3D411C', '#6D704A', '#9BA476'];
    greens.forEach(function (col, ci) {
      var dd = '';
      for (var k = 0; k < 60; k++) {
        var lx = -700 + r() * 1400, ly = -1000 + r() * (ci === 2 ? 300 : 380) + Math.abs(lx) * 0.05, ls = 22 + r() * 30;
        dd += 'M' + n1(lx) + ' ' + n1(ly) + 'l' + n1(ls * 0.5) + ' ' + n1(ls * 0.15) + 'l' + n1(-ls * 0.1) + ' ' + n1(ls * 0.35) + 'l' + n1(ls * 0.35) + ' ' + n1(ls * 0.25) + 'l' + n1(-ls * 0.45) + ' ' + n1(ls * 0.1) + 'l' + n1(-ls * 0.3) + ' ' + n1(ls * 0.45) + 'l' + n1(-ls * 0.3) + ' ' + n1(-ls * 0.45) + 'l' + n1(-ls * 0.45) + ' ' + n1(-ls * 0.1) + 'l' + n1(ls * 0.35) + ' ' + n1(-ls * 0.25) + 'l' + n1(-ls * 0.1) + ' ' + n1(-ls * 0.35) + 'z';
      }
      mk('path', { d: dd, fill: col, opacity: ci === 2 ? 0.8 : 1 }, g);
    });
    // a pair of garden chairs and a table, simply
    mk('path', { d: 'M-160 40h90v6h-90z M-150 46v60M-80 46v60 M-210 60v50M-230 60h40v4h-40zM-230 64v46M-190 64v46M-230 20v40', stroke: '#2E2B26', 'stroke-width': 4, fill: '#2E2B26' }, g);
  };

  // ---------- sprites (cm, origin at their anchor) ----------
  function fernSprite(seed, trailing) {
    var g = mk('g', { 'class': 'v-sprite' });
    var sway = mk('g', { 'class': 'v-sway', style: 'animation-delay:-' + (seed % 5) * 1.3 + 's;animation-duration:' + (5.5 + (seed % 3)) + 's' }, g);
    var r = rng(seed);
    mk('path', { d: 'M0 0L-19 39M0 0L19 39M0 0L1 41', stroke: '#6B5A43', 'stroke-width': 1, fill: 'none' }, sway);
    var fronds = '', leafA = '', leafB = '', i;
    var nF = trailing ? 6 : 15;
    for (i = 0; i < nF; i++) {
      var side = i % 2 ? 1 : -1, e = (25 + r() * 60) * Math.PI / 180, droop = (110 + r() * 60) * Math.PI / 180;
      var len = 36 + r() * 28, x = side * (r() * 10), y = 40, pts = [[x, y]];
      var steps = 14;
      for (var s = 1; s <= steps; s++) {
        var u = s / steps, ang = e - droop * u * u;
        x += side * Math.cos(ang) * len / steps; y -= Math.sin(ang) * len / steps;
        pts.push([x, y]);
      }
      fronds += 'M' + pts.map(function (p) { return n1(p[0]) + ' ' + n1(p[1]); }).join('L');
      for (var k = 1; k < pts.length - 1; k++) {
        var u2 = k / steps, lp = 11 * Math.pow(1 - u2, 0.85) * Math.min(1, u2 * 4) + 1.2;
        var tx = pts[k + 1][0] - pts[k - 1][0], ty = pts[k + 1][1] - pts[k - 1][1], tl = Math.hypot(tx, ty) || 1;
        tx /= tl; ty /= tl;
        [-1, 1].forEach(function (sd) {
          var nx = -ty * sd, ny = tx * sd;
          var dx = nx * 0.8 + tx * 0.6, dy = ny * 0.8 + ty * 0.6;
          var px = pts[k][0], py = pts[k][1], ex = px + dx * lp, ey = py + dy * lp, w = lp * 0.3;
          var leaf = 'M' + n1(px) + ' ' + n1(py) + 'Q' + n1(px + dx * lp * 0.5 - dy * w) + ' ' + n1(py + dy * lp * 0.5 + dx * w) + ' ' + n1(ex) + ' ' + n1(ey) + 'Q' + n1(px + dx * lp * 0.5 + dy * w) + ' ' + n1(py + dy * lp * 0.5 - dx * w) + ' ' + n1(px) + ' ' + n1(py) + 'Z';
          if ((i + sd) % 2) leafA += leaf; else leafB += leaf;
        });
      }
    }
    if (trailing) {
      for (i = 0; i < 7; i++) {
        var sx = -16 + i * 5.5, sy = 46, sl = 50 + r() * 70, path = 'M' + n1(sx) + ' ' + sy, cx = sx;
        for (var j = 1; j <= 10; j++) {
          var yy = sy + (j / 10) * sl, xx = sx + Math.sin(j * 0.9 + i) * 4;
          path += 'L' + n1(xx) + ' ' + n1(yy);
          var lsz = 5 + r() * 3, sd2 = j % 2 ? 1 : -1;
          var leaf2 = 'M' + n1(xx) + ' ' + n1(yy) + 'q' + n1(sd2 * lsz) + ' ' + n1(-lsz * 0.2) + ' ' + n1(sd2 * lsz * 0.9) + ' ' + n1(lsz * 0.8) + 'q' + n1(-sd2 * lsz * 0.5) + ' ' + n1(lsz * 0.1) + ' ' + n1(-sd2 * lsz * 0.9) + ' ' + n1(-lsz * 0.8) + 'z';
          if (j % 3) leafA += leaf2; else leafB += leaf2;
          cx = xx;
        }
        fronds += path;
      }
    }
    // basket, then foliage over and around it
    mk('path', { d: 'M-21 39C-20 58 -10 64 0 64C10 64 20 58 21 39Z', fill: '#A8834F' }, sway);
    mk('path', { d: 'M-20 45C-10 49 10 49 20 45M-19 51C-10 55 10 55 19 51M-15 57C-8 60 8 60 15 57M-12 40L-9 62M-4 40L-3 64M4 40L3 64M12 40L9 62', stroke: '#7B5C34', 'stroke-width': 1.1, fill: 'none' }, sway);
    mk('ellipse', { cx: 0, cy: 39, rx: 21, ry: 4, fill: '#8C6A3D' }, sway);
    mk('path', { d: fronds, stroke: '#4B5C33', 'stroke-width': 1, fill: 'none' }, sway);
    mk('path', { d: leafB, fill: '#4F6237' }, sway);
    mk('path', { d: leafA, fill: COL.fern }, sway);
    mk('path', { d: leafA, fill: '#7E9459', opacity: 0.35, transform: 'translate(-.6 -.6)' }, sway);
    return g;
  }

  var CHAIRS = [
    // spindle-back, oak
    function (g) {
      mk('path', { d: 'M-19 -44L-23 0M19 -44L23 0M-14 -44L-16 -6M14 -44L16 -6M-21 -20H21', stroke: '#8A6440', 'stroke-width': 3.4, 'stroke-linecap': 'round', fill: 'none' }, g);
      mk('path', { d: 'M-17 -46C-19 -80 -10 -96 0 -96C10 -96 19 -80 17 -46', stroke: '#9A7349', 'stroke-width': 4, fill: 'none' }, g);
      mk('path', { d: 'M-9 -46V-90M-3 -46V-95M3 -46V-95M9 -46V-90', stroke: '#8A6440', 'stroke-width': 2, fill: 'none' }, g);
      mk('path', { d: 'M-23 -48H23L21 -42H-21Z', fill: '#A47B4E' }, g);
    },
    // ladder-back, dark walnut, rush seat
    function (g) {
      mk('path', { d: 'M-19 0V-94M19 0V-94M-19 -14H19', stroke: '#4E3424', 'stroke-width': 3.6, 'stroke-linecap': 'round', fill: 'none' }, g);
      mk('path', { d: 'M-19 -60Q0 -64 19 -60M-19 -72Q0 -76 19 -72M-19 -84Q0 -88 19 -84', stroke: '#5C3E2B', 'stroke-width': 4.2, fill: 'none' }, g);
      mk('path', { d: 'M-22 -47H22L20 -41H-20Z', fill: '#B89A62' }, g);
      mk('path', { d: 'M-18 -45h36', stroke: '#8D7442', 'stroke-width': 1, 'stroke-dasharray': '2 1.5' }, g);
    },
    // bentwood, near-black
    function (g) {
      mk('path', { d: 'M-17 -45C-19 -30 -21 -14 -22 0M17 -45C19 -30 21 -14 22 0M-10 -44L-12 -4M10 -44L12 -4', stroke: '#2F221A', 'stroke-width': 2.8, 'stroke-linecap': 'round', fill: 'none' }, g);
      mk('ellipse', { cx: 0, cy: -20, rx: 18, ry: 3, fill: 'none', stroke: '#2F221A', 'stroke-width': 2.2 }, g);
      mk('ellipse', { cx: 0, cy: -70, rx: 16, ry: 22, fill: 'none', stroke: '#3B2B20', 'stroke-width': 3.6 }, g);
      mk('path', { d: 'M-14 -50C-6 -56 6 -56 14 -50', stroke: '#3B2B20', 'stroke-width': 2.4, fill: 'none' }, g);
      mk('ellipse', { cx: 0, cy: -46, rx: 21, ry: 4.5, fill: '#4A372A' }, g);
    },
    // painted farmhouse chair, faded green
    function (g) {
      mk('path', { d: 'M-18 0V-90M18 0V-90M-18 -16H18', stroke: '#6E7D5C', 'stroke-width': 3.6, 'stroke-linecap': 'round', fill: 'none' }, g);
      mk('path', { d: 'M-18 -88Q0 -96 18 -88', stroke: '#6E7D5C', 'stroke-width': 5, fill: 'none' }, g);
      mk('path', { d: 'M-6 -48C-12 -60 -2 -66 -6 -86H6C2 -66 12 -60 6 -48Z', fill: '#7D8C69' }, g);
      mk('path', { d: 'M-22 -48H22L20 -42H-20Z', fill: '#7D8C69' }, g);
    }
  ];

  function chairSprite(kind) {
    var g = mk('g', { 'class': 'v-sprite' });
    CHAIRS[kind % CHAIRS.length](g);
    return g;
  }

  function pendantSprite() {
    var g = mk('g', { 'class': 'v-sprite' });
    mk('path', { d: 'M0 0V52', stroke: '#2B2622', 'stroke-width': 0.8 }, g);
    mk('ellipse', { cx: 0, cy: 74, rx: 22, ry: 10, fill: 'url(#v-glow)' }, g);
    mk('path', { d: 'M-3 52H3L5 58C12 60 16 66 17 72H-17C-16 66 -12 60 -5 58Z', fill: 'url(#v-shade)' }, g);
    mk('ellipse', { cx: 0, cy: 72, rx: 17, ry: 2.6, fill: '#F1E7CF' }, g);
    mk('ellipse', { cx: 0, cy: 72.5, rx: 5, ry: 1.8, fill: '#FFF0C2' }, g);
    return g;
  }

  function signSprite() {
    var g = mk('g', { 'class': 'v-sprite' });
    mk('path', { d: 'M-24 0L-26 30M24 0L26 30', stroke: '#3A3530', 'stroke-width': 0.9, 'stroke-dasharray': '1.6 1' }, g);
    mk('rect', { x: -33, y: 29, width: 66, height: 21, rx: 1, fill: '#EEE4C9', stroke: '#2A2622', 'stroke-width': 1.4 }, g);
    mk('rect', { x: -30.5, y: 31.5, width: 61, height: 16, fill: 'none', stroke: '#2A2622', 'stroke-width': 0.5 }, g);
    var t = mk('text', { x: 0, y: 44.6, 'text-anchor': 'middle', 'font-family': 'Gloock, Georgia, serif', 'font-size': 13, 'letter-spacing': 1.5, fill: '#25211D' }, g);
    t.textContent = 'CAFÉ';
    return g;
  }

  function globeSprite() {
    var g = mk('g', { 'class': 'v-sprite' });
    mk('circle', { cx: 0, cy: 0, r: 34, fill: 'url(#v-glow)', opacity: 0.7 }, g);
    mk('path', { d: 'M-4 6h8v6h-8z', fill: '#3E3934' }, g);
    mk('circle', { cx: 0, cy: 0, r: 8, fill: '#FBEBC4', stroke: '#E8D4A0', 'stroke-width': 0.8 }, g);
    return g;
  }

  function espressoSprite() {
    var g = mk('g', { 'class': 'v-sprite' });
    mk('rect', { x: -38, y: -44, width: 76, height: 44, rx: 3, fill: '#2C2C2C' }, g);
    mk('rect', { x: -38, y: -44, width: 76, height: 9, rx: 2, fill: '#B9BDBF' }, g);
    mk('path', { d: 'M-26 -24v8M-6 -24v8M14 -24v8', stroke: '#C8CCCE', 'stroke-width': 3 }, g);
    mk('path', { d: 'M-30 -52h60', stroke: '#E9E6DF', 'stroke-width': 6, 'stroke-dasharray': '7 3' }, g);
    return g;
  }

  function domeSprite() {
    var g = mk('g', { 'class': 'v-sprite' });
    mk('rect', { x: -15, y: -12, width: 30, height: 10, fill: '#C79A62' }, g);
    mk('rect', { x: -15, y: -12, width: 30, height: 3, fill: '#F2E6CE' }, g);
    mk('path', { d: 'M-19 -2C-19 -26 19 -26 19 -2Z', fill: '#EEF3F4', 'fill-opacity': 0.22, stroke: '#DDE4E6', 'stroke-width': 1 }, g);
    mk('ellipse', { cx: 0, cy: -1, rx: 21, ry: 2.4, fill: '#E3E3DF' }, g);
    mk('circle', { cx: 0, cy: -24, r: 2.2, fill: '#DDE4E6' }, g);
    return g;
  }

  // ---------- objects in the vault ----------
  Vault.prototype.buildObjects = function () {
    var self = this, g = this.gObj, list = [];
    function sprite(el, x, y, z, minD) { list.push({ type: 'sprite', el: el, x: x, y: y, z: z, minD: minD || 0.45 }); }
    var i;
    function ceilY(x) { return HS + B * Math.sqrt(Math.max(0, 1 - (x / A) * (x / A))); }

    // tables (polka-dot oilcloth) and their mismatched chairs, along the left wall
    for (i = 0; i < 8; i++) {
      var tz = 2.1 + i * 2.45;
      list.push({ type: 'table', z: tz + 0.4, z0: tz, z1: tz + 0.78, x0: -2.52, x1: -1.6, g: null });
      sprite(chairSprite(i), -1.33, 0, tz + 0.38 + (i % 2) * 0.06);
    }
    // the counter along the right
    list.push({ type: 'counter', z: 9, z0: 3.3, z1: 15.6 });
    list.push({ type: 'board', z: 9.2, z0: 4.4, z1: 14.2 });
    sprite(domeSprite(), 1.6, 0.98, 4.0);
    sprite(domeSprite(), 1.62, 0.98, 4.6);
    sprite(espressoSprite(), 1.72, 0.98, 8.6);
    // red enamel pendants over the counter
    [5.2, 7.4, 9.6, 11.8].forEach(function (z) { sprite(pendantSprite(), 1.72, ceilY(1.72), z, 0.5); });
    // globe lights on the left wall
    [4.6, 9.4, 14.2, 19.0].forEach(function (z) { sprite(globeSprite(), -2.56, 1.92, z, 0.5); });
    // ferns and trailing plants in hanging baskets
    [[-1.15, 3.1, 3, false], [1.05, 6.4, 8, true], [-1.0, 9.8, 12, false], [1.15, 13.2, 17, false], [-1.1, 16.8, 21, true], [1.0, 19.8, 25, false]].forEach(function (f) {
      sprite(fernSprite(f[2], f[3]), f[0], ceilY(f[0]) - 0.04, f[1], 0.55);
    });
    // festoon strings down the length of the vault, span by span
    var hookStep = 2.2;
    [0.66 * Math.PI, 0.34 * Math.PI].forEach(function (t, si) {
      var p = ell(t, -0.08);
      for (var z = 0.5; z < L - 0.6; z += hookStep) {
        list.push({ type: 'festoon', z: z + hookStep / 2, x: p[0], y: p[1], z0: z, z1: Math.min(z + hookStep, L - 0.4), seed: si });
      }
    });
    // the hanging CAFÉ sign, just inside the glass
    sprite(signSprite(), 0, HS + B - 0.03, 0.42, 0.3);

    list.sort(function (a, b) { return b.z - a.z; });
    list.forEach(function (o) {
      if (o.type === 'sprite') { g.appendChild(o.el); return; }
      o.g = mk('g', null, g);
      if (o.type === 'table') {
        o.legs = mk('path', { stroke: '#3C2D22', 'stroke-width': 1, fill: '#3C2D22' }, o.g);
        o.side = mk('path', { fill: '#8E8178' }, o.g);
        o.front = mk('path', { fill: '#857870' }, o.g);
        o.top = mk('path', { fill: '#A99D94' }, o.g);
        o.dots = mk('path', { fill: '#ECEAE3', opacity: 0.92 }, o.g);
      } else if (o.type === 'counter') {
        o.front = mk('path', { fill: '#5F5D59' }, o.g);
        o.lines = mk('path', { stroke: '#4B4945', 'stroke-width': 1, fill: 'none' }, o.g);
        o.top = mk('path', { fill: '#E4E1DA' }, o.g);
        o.edge = mk('path', { stroke: '#F4F2EC', 'stroke-width': 1.2, fill: 'none' }, o.g);
      } else if (o.type === 'board') {
        o.frame = mk('path', { fill: '#5A3F2C' }, o.g);
        o.face = mk('path', { fill: COL.chalk }, o.g);
        o.chalk = mk('path', { stroke: '#E4E1D8', 'stroke-width': 1, 'stroke-linecap': 'round', fill: 'none', opacity: 0.75 }, o.g);
      } else if (o.type === 'festoon') {
        o.wire = mk('path', { stroke: '#2B2622', 'stroke-width': 1, fill: 'none', opacity: 0.8 }, o.g);
        o.bulbs = [];
        var n = Math.round((o.z1 - o.z0) / 0.55);
        for (var b = 0; b < n; b++) {
          var bz = o.z0 + (b + 0.5) * (o.z1 - o.z0) / n;
          var glow = mk('circle', { fill: 'url(#v-glow)', r: 0 }, o.g);
          var bulb = mk('circle', { r: 0, fill: '#D9D2C1' }, o.g);
          o.bulbs.push({ z: bz, u: (b + 0.5) / n, glow: glow, bulb: bulb });
        }
      }
    });
    this.objs = list;

    // festoon across the arch, just behind the glass
    this.entry = { g: mk('g', { 'class': 'v-entry' }, g), z: 0.3 };
    this.entry.wire = mk('path', { stroke: '#2B2622', 'stroke-width': 1, fill: 'none', opacity: 0.75 }, this.entry.g);
    this.entry.bulbs = [];
    for (i = 0; i < 17; i++) {
      this.entry.bulbs.push({ glow: mk('circle', { fill: 'url(#v-glow)' }, this.entry.g), bulb: mk('circle', { fill: '#F7D88E' }, this.entry.g) });
    }
  };

  // ---------- layout & camera ----------
  Vault.prototype.layout = function (w, h) {
    this.w = w; this.h = h;
    var portrait = w / h < 0.95;
    this.portrait = portrait;
    var s0, floorY, cx0;
    if (portrait) {
      s0 = (w * 1.0) / (2 * (A + RING) + 0.5);
      s0 = Math.min(s0, (h * 0.36) / (HS + B + RING));
      floorY = h * 0.64;
      cx0 = w / 2;
    } else {
      s0 = Math.min((h * 0.5) / (HS + B + RING + 0.2), (w * 0.54) / (2 * (A + RING) + 0.4));
      floorY = h * 0.8;
      cx0 = w * 0.6;
    }
    this.s0 = s0;
    this.zStart = -9;
    this.f = s0 * 9;
    this.cy = floorY - EYE * s0;
    this.cx0 = cx0;
    this.floorY = floorY;
    // end of the walk: through the far door, the garden fills the frame
    var dEnd = Math.max(0.9, Math.min(3.2, (2.05 * this.f) / (h * 1.45)));
    var zEnd = L - dEnd;
    this.zAt = monotone([0, 0.05, 0.22, 0.5, 0.84, 1], [this.zStart, this.zStart + 0.35, 0.7, 9.0, zEnd - 2.2, zEnd]);
    this.svg.setAttribute('viewBox', '0 0 ' + n1(w) + ' ' + n1(h));
    this.base.setAttribute('width', w); this.base.setAttribute('height', h);
    this.vignette.setAttribute('width', w); this.vignette.setAttribute('height', h);
    // where the hero copy can sit
    this.metrics = {
      floorY: floorY,
      crownY: floorY - (HS + B + RING + 0.4) * s0,
      archL: cx0 - (A + RING) * s0, archR: cx0 + (A + RING) * s0
    };
  };

  Vault.prototype.P = function (x, y, z) {
    var k = this.f / (z - this.zc);
    return [this.cx + x * k, this.cy - (y - EYE) * k];
  };
  function pt(p) { return n1(p[0]) + ' ' + n1(p[1]); }

  Vault.prototype.render = function (p) {
    var self = this, zc = this.zAt(p), i;
    this.zc = zc;
    this.cx = this.portrait ? this.cx0 : lerp(this.cx0, this.w / 2, smooth(0.04, 0.24, p));
    var near = zc + 0.2;
    var front = this.lit != null ? this.lit : Math.max(zc + 8.5, 3.2) + smooth(0.84, 0.95, p) * 20;

    // rings
    this.rings.forEach(function (rg) {
      var d = rg.z - zc;
      if (d < 0.2) { rg.el.setAttribute('d', ''); return; }
      var k = self.f / d, xl = self.cx - A * k, xr = self.cx + A * k, yf = self.cy + EYE * k, ys = self.cy - (HS - EYE) * k;
      rg.el.setAttribute('d', 'M' + n1(xl) + ' ' + n1(yf) + 'V' + n1(ys) + 'A' + n1(A * k) + ' ' + n1(B * k) + ' 0 0 1 ' + n1(xr) + ' ' + n1(ys) + 'V' + n1(yf) + 'Z');
    });
    // floor & grout
    var z0 = Math.max(near, 0.001);
    this.floor.setAttribute('d', 'M' + pt(this.P(-A, 0, z0)) + 'L' + pt(this.P(A, 0, z0)) + 'L' + pt(this.P(A, 0, L)) + 'L' + pt(this.P(-A, 0, L)) + 'Z');
    this.floorShade.setAttribute('d', this.floor.getAttribute('d'));
    var gd = '';
    for (i = 0; i <= 8; i++) { var gx = -A + i * (2 * A / 8); gd += 'M' + pt(this.P(gx, 0, z0)) + 'L' + pt(this.P(gx, 0, L)); }
    for (var gz = Math.ceil(z0 / 0.65) * 0.65; gz < L; gz += 0.65) gd += 'M' + pt(this.P(-A, 0, gz)) + 'L' + pt(this.P(A, 0, gz));
    this.grout.setAttribute('d', gd);
    // brick patches
    var pa = '', pb = '';
    this.patchList.forEach(function (q) {
      if (q.z < near + 0.1) return;
      var c;
      if (q.wall) {
        var x = q.wall * A;
        c = [self.P(x, q.y, q.z), self.P(x, q.y, q.z + 0.22), self.P(x, q.y + 0.065, q.z + 0.22), self.P(x, q.y + 0.065, q.z)];
      } else {
        var e0 = ell(q.t, 0), e1 = ell(q.t + 0.03, 0);
        c = [self.P(e0[0], e0[1], q.z), self.P(e0[0], e0[1], q.z + 0.22), self.P(e1[0], e1[1], q.z + 0.22), self.P(e1[0], e1[1], q.z)];
      }
      var s = 'M' + pt(c[0]) + 'L' + pt(c[1]) + 'L' + pt(c[2]) + 'L' + pt(c[3]) + 'Z';
      if (q.dark) pb += s; else pa += s;
    });
    this.patchA.setAttribute('d', pa); this.patchB.setAttribute('d', pb);

    // far wall + garden (planar)
    var sW = this.f / (L - zc), sG = this.f / (L + 7 - zc), rG = sG / sW;
    this.far.setAttribute('transform', 'translate(' + n1(this.cx) + ' ' + n1(this.cy + EYE * sW) + ') scale(' + (sW / 100).toFixed(5) + ')');
    this.garden.setAttribute('transform', 'translate(0 ' + (-EYE * 100) + ') scale(' + rG.toFixed(4) + ') translate(0 ' + (EYE * 100) + ')');
    var open = smooth(0.86, 0.97, p);
    this.farLeaves.forEach(function (lf) {
      var sc = 1 - open * 0.86;
      lf.el.setAttribute('transform', 'translate(' + lf.hinge + ' 0) scale(' + sc.toFixed(3) + ' 1) translate(' + (-lf.hinge) + ' 0)');
    });
    this.dayWash.setAttribute('opacity', (0.45 + 0.55 * smooth(0.6, 0.95, p)).toFixed(2));

    // objects
    this.objs.forEach(function (o) {
      if (o.type === 'sprite') {
        var d = o.z - zc;
        if (d < o.minD) { o.el.setAttribute('display', 'none'); return; }
        o.el.removeAttribute('display');
        var q = self.P(o.x, o.y, o.z), k = self.f / d;
        o.el.setAttribute('transform', 'translate(' + pt(q) + ') scale(' + (k / 100).toFixed(4) + ')');
        o.el.setAttribute('opacity', smooth(o.minD, o.minD + 0.6, d).toFixed(2));
        return;
      }
      if (o.z1 < near + 0.05) { o.g.setAttribute('display', 'none'); return; }
      o.g.removeAttribute('display');
      var za = Math.max(o.z0, near);
      if (o.type === 'table') self.drawTable(o, za);
      else if (o.type === 'counter') self.drawCounter(o, za);
      else if (o.type === 'board') self.drawBoard(o, za);
      else if (o.type === 'festoon') self.drawFestoon(o, za, front);
    });

    // festoon across the arch
    var ent = this.entry, dE = ent.z - zc;
    if (dE < 0.25) ent.g.setAttribute('display', 'none');
    else {
      ent.g.removeAttribute('display');
      var hooks = [], nH = ent.bulbs.length;
      for (i = 0; i < nH; i++) hooks.push(ell(Math.PI - (i / (nH - 1)) * Math.PI, -0.1));
      var wd = '', kE = this.f / dE;
      for (i = 0; i < nH; i++) {
        var hp = this.P(hooks[i][0], hooks[i][1], ent.z);
        if (i === 0) wd += 'M' + pt(hp);
        else {
          var a = hooks[i - 1], b = hooks[i], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 - 0.09;
          wd += 'Q' + pt(this.P(mx, my - 0.06, ent.z)) + ' ' + pt(hp);
        }
        var bp = this.P(hooks[i][0], hooks[i][1] - 0.05, ent.z);
        ent.bulbs[i].bulb.setAttribute('cx', n1(bp[0])); ent.bulbs[i].bulb.setAttribute('cy', n1(bp[1]));
        ent.bulbs[i].bulb.setAttribute('r', n1(Math.max(1.2, 0.032 * kE)));
        ent.bulbs[i].glow.setAttribute('cx', n1(bp[0])); ent.bulbs[i].glow.setAttribute('cy', n1(bp[1]));
        ent.bulbs[i].glow.setAttribute('r', n1(0.2 * kE));
      }
      ent.wire.setAttribute('d', wd);
    }

    // vignette follows the vanishing point
    this.vigGrad.setAttribute('cx', (this.cx / this.w).toFixed(3));
    this.vigGrad.setAttribute('cy', (this.cy / this.h).toFixed(3));

    // paving and the arch front
    var sF = zc < -0.22 ? this.f / -zc : 0;
    if (sF) {
      this.facade.removeAttribute('display');
      this.facade.setAttribute('transform', 'translate(' + n1(this.cx) + ' ' + n1(this.cy + EYE * sF) + ') scale(' + (sF / 100).toFixed(5) + ')');
      var dz = near, pv = 'M' + pt(this.P(-30, 0, dz)) + 'L' + pt(this.P(30, 0, dz)) + 'L' + pt(this.P(30, 0, 0)) + 'L' + pt(this.P(-30, 0, 0)) + 'Z';
      this.paving.setAttribute('d', pv);
      var pl = '';
      for (i = -20; i <= 20; i++) pl += 'M' + pt(this.P(i * 0.6, 0, dz)) + 'L' + pt(this.P(i * 0.6, 0, 0));
      for (var pz = -0.6; pz > dz; pz -= 0.6) pl += 'M' + pt(this.P(-30, 0, pz)) + 'L' + pt(this.P(30, 0, pz));
      this.pavingLines.setAttribute('d', pl);
      if (-0.15 > dz) this.drain.setAttribute('d', 'M' + pt(this.P(-A - 0.4, 0, -0.16)) + 'L' + pt(this.P(A + 0.4, 0, -0.16)) + 'L' + pt(this.P(A + 0.4, 0, -0.07)) + 'L' + pt(this.P(-A - 0.4, 0, -0.07)) + 'Z');
      else this.drain.setAttribute('d', '');
      var doorOpen = smooth(0.08, 0.19, p);
      this.leaves.forEach(function (lf) {
        lf.el.setAttribute('transform', 'translate(' + lf.hinge + ' 0) scale(' + (1 - doorOpen * 0.9).toFixed(3) + ' 1) translate(' + (-lf.hinge) + ' 0)');
      });
      // the face looks down at you as you come in
      var look = smooth(0.0, 0.14, p);
      this.face.setAttribute('style', '--look:' + (look * 3.2).toFixed(2) + 'px;--lid:' + (-look * 2.6).toFixed(2) + 'px');
    } else {
      this.facade.setAttribute('display', 'none');
      this.paving.setAttribute('d', ''); this.pavingLines.setAttribute('d', ''); this.drain.setAttribute('d', '');
    }
    this.p = p;
  };

  function dotsOn(self, corners, rows, cols, rad, out) {
    // corners: [a,b,c,d] world points of a quad; place dots on a grid in it
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
      var u = (c + 0.5 + (r % 2) * 0.5) / (cols + 0.5), v = (r + 0.5) / rows;
      var x = lerp(lerp(corners[0][0], corners[1][0], u), lerp(corners[3][0], corners[2][0], u), v);
      var y = lerp(lerp(corners[0][1], corners[1][1], u), lerp(corners[3][1], corners[2][1], u), v);
      var z = lerp(lerp(corners[0][2], corners[1][2], u), lerp(corners[3][2], corners[2][2], u), v);
      if (z - self.zc < 0.25) continue;
      var q = self.P(x, y, z), k = self.f / (z - self.zc), rr = Math.max(0.5, rad * k);
      out.push('M' + n1(q[0] - rr) + ' ' + n1(q[1]) + 'a' + n1(rr) + ' ' + n1(rr * 0.8) + ' 0 1 0 ' + n1(2 * rr) + ' 0a' + n1(rr) + ' ' + n1(rr * 0.8) + ' 0 1 0 ' + n1(-2 * rr) + ' 0');
    }
  }

  Vault.prototype.drawTable = function (o, za) {
    var P = this.P.bind(this), ty = 0.74, dy = 0.54, x0 = o.x0, x1 = o.x1, z0 = Math.max(o.z0, za), z1 = o.z1;
    function Q(a) { return 'M' + a.map(function (v) { return pt(P(v[0], v[1], v[2])); }).join('L') + 'Z'; }
    o.top.setAttribute('d', Q([[x0, ty, z0], [x1, ty, z0], [x1, ty, z1], [x0, ty, z1]]));
    o.side.setAttribute('d', Q([[x1, ty, z0], [x1, ty, z1], [x1, dy, z1], [x1, dy, z0]]));
    o.front.setAttribute('d', z0 > o.z0 + 0.01 ? '' : Q([[x0, ty, z0], [x1, ty, z0], [x1, dy, z0], [x0, dy, z0]]));
    var lw = 0.035;
    o.legs.setAttribute('d', Q([[x1 - 0.06, dy, z1 - 0.06], [x1 - 0.06 - lw, dy, z1 - 0.06], [x1 - 0.06 - lw, 0, z1 - 0.06], [x1 - 0.06, 0, z1 - 0.06]]) + (z0 > o.z0 + 0.05 ? '' : Q([[x1 - 0.06, dy, o.z0 + 0.06], [x1 - 0.06 - lw, dy, o.z0 + 0.06], [x1 - 0.06 - lw, 0, o.z0 + 0.06], [x1 - 0.06, 0, o.z0 + 0.06]])));
    var dots = [];
    dotsOn(this, [[x0, ty, z0], [x1, ty, z0], [x1, ty, z1], [x0, ty, z1]], 4, 5, 0.017, dots);
    dotsOn(this, [[x1, ty - 0.03, z0], [x1, ty - 0.03, z1], [x1, dy + 0.03, z1], [x1, dy + 0.03, z0]], 2, 5, 0.017, dots);
    o.dots.setAttribute('d', dots.join(''));
  };

  Vault.prototype.drawCounter = function (o, za) {
    var P = this.P.bind(this), x = 1.3, x2 = 1.98, y = 0.98, z0 = za, z1 = o.z1;
    o.front.setAttribute('d', 'M' + pt(P(x, 0, z0)) + 'L' + pt(P(x, y, z0)) + 'L' + pt(P(x, y, z1)) + 'L' + pt(P(x, 0, z1)) + 'Z');
    o.top.setAttribute('d', 'M' + pt(P(x - 0.03, y, z0)) + 'L' + pt(P(x2, y, z0)) + 'L' + pt(P(x2, y, z1)) + 'L' + pt(P(x - 0.03, y, z1)) + 'Z');
    o.edge.setAttribute('d', 'M' + pt(P(x - 0.03, y, z0)) + 'L' + pt(P(x - 0.03, y, z1)));
    var d = '';
    for (var z = Math.ceil(z0 / 0.42) * 0.42; z < z1; z += 0.42) d += 'M' + pt(P(x, 0.04, z)) + 'L' + pt(P(x, y - 0.06, z));
    o.lines.setAttribute('d', d);
  };

  Vault.prototype.drawBoard = function (o, za) {
    var P = this.P.bind(this), z0 = Math.max(o.z0, za), z1 = o.z1;
    var lo = ell(0.12, -0.05), hi = ell(0.42, -0.05);
    var fl = ell(0.1, -0.03), fh = ell(0.44, -0.03);
    o.frame.setAttribute('d', 'M' + pt(P(fl[0], fl[1], z0 - 0.04)) + 'L' + pt(P(fh[0], fh[1], z0 - 0.04)) + 'L' + pt(P(fh[0], fh[1], z1 + 0.04)) + 'L' + pt(P(fl[0], fl[1], z1 + 0.04)) + 'Z');
    o.face.setAttribute('d', 'M' + pt(P(lo[0], lo[1], z0)) + 'L' + pt(P(hi[0], hi[1], z0)) + 'L' + pt(P(hi[0], hi[1], z1)) + 'L' + pt(P(lo[0], lo[1], z1)) + 'Z');
    // chalk: a heading and rows of "writing" (illegible at this distance, by design)
    var d = '', r = rng(9);
    for (var row = 0; row < 6; row++) {
      var v = 0.18 + row * 0.13, x = lerp(lo[0], hi[0], v), y = lerp(lo[1], hi[1], v);
      for (var z = o.z0 + 0.15; z < z1 - 0.2; z += 0.35 + r() * 0.3) {
        var len = row === 0 ? 0.6 : 0.12 + r() * 0.22;
        if (z < z0 + 0.05) continue;
        d += 'M' + pt(P(x, y, z)) + 'L' + pt(P(x, y, Math.min(z + len, z1 - 0.1)));
      }
    }
    o.chalk.setAttribute('d', d);
  };

  Vault.prototype.drawFestoon = function (o, za, front) {
    var self = this, d = '', steps = 10, sag = 0.2;
    var started = false;
    for (var s = 0; s <= steps; s++) {
      var u = s / steps, z = lerp(o.z0, o.z1, u);
      if (z < za) continue;
      var y = o.y - sag * 4 * u * (1 - u);
      d += (started ? 'L' : 'M') + pt(this.P(o.x, y, z)); started = true;
    }
    o.wire.setAttribute('d', d);
    o.bulbs.forEach(function (b) {
      var dz = b.z - self.zc;
      if (dz < 0.3) { b.bulb.setAttribute('r', 0); b.glow.setAttribute('r', 0); return; }
      var y = o.y - sag * 4 * b.u * (1 - b.u) - 0.05, q = self.P(o.x, y, b.z), k = self.f / dz;
      var on = clamp((front - b.z) / 1.4, 0, 1);
      b.bulb.setAttribute('cx', n1(q[0])); b.bulb.setAttribute('cy', n1(q[1]));
      b.bulb.setAttribute('r', n1(Math.max(0.8, 0.03 * k)));
      b.bulb.setAttribute('fill', hexLerp('#CFC8B8', '#F9DC94', on));
      b.glow.setAttribute('cx', n1(q[0])); b.glow.setAttribute('cy', n1(q[1]));
      b.glow.setAttribute('r', n1(0.22 * k * on));
    });
  };

  window.TideVault = Vault;
})();
