/* Chez Lindsay, Concept C: menu page.
   Each galette row becomes a disclosure button (aria-expanded) that opens a small "anatomy" diagram:
   the published fillings laid out in the fold square, labelled only with words from the menu text
   (read from data-fillings, which the markup takes verbatim from each description).
   Without JS the rows stay as plain headings with their full descriptions. */
(function () {
  'use strict';
  var d = document;
  var NS = 'http://www.w3.org/2000/svg';
  var rows = d.querySelectorAll('.grow[data-fillings]');
  if (!rows.length || !d.createElementNS) return;
  var reduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

  /* geometry: the hero's fold (batter radius 460, square half-side 290) scaled to a 100 half-side */
  var W = 540, H = 344, CX = 270, CY = 176, HS = 100;
  var R = HS * 460 / 290;
  var YC = CY - 2 * HS + Math.sqrt(R * R - HS * HS);
  var INK = '#1B1714', FLOUR = '#FBF8F2', BUCK = '#8B5A2B', YOLK = '#F5B731';

  function el(tag, attrs, parent) {
    var n = d.createElementNS(NS, tag);
    for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k)) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function f1(n) { return (Math.round(n * 10) / 10).toString(); }

  function topFlap() {
    var x0 = CX - HS, x1 = CX + HS, y0 = CY - HS;
    return 'M' + x0 + ' ' + y0 + 'H' + x1 + 'V' + f1(YC) + 'A' + f1(R) + ' ' + f1(R) + ' 0 0 1 ' + x0 + ' ' + f1(YC) + 'Z';
  }

  function token(g, kind, x, y) {
    switch (kind % 6) {
      case 0: el('circle', { cx: x, cy: y, r: 12, fill: INK }, g); break;
      case 1: el('circle', { cx: x, cy: y, r: 11, fill: FLOUR, stroke: INK, 'stroke-width': 4.5 }, g); break;
      case 2: el('rect', { x: x - 11, y: y - 11, width: 22, height: 22, fill: INK }, g); break;
      case 3: el('rect', { x: x - 11, y: y - 11, width: 22, height: 22, fill: FLOUR, stroke: INK, 'stroke-width': 4 }, g); break;
      case 4:
        el('circle', { cx: x - 7, cy: y + 5, r: 5.5, fill: INK }, g);
        el('circle', { cx: x + 7, cy: y + 5, r: 5.5, fill: INK }, g);
        el('circle', { cx: x, cy: y - 7, r: 5.5, fill: INK }, g);
        break;
      default: el('rect', { x: x - 10, y: y - 10, width: 20, height: 20, fill: YOLK, stroke: INK, 'stroke-width': 3.5, transform: 'rotate(45 ' + x + ' ' + y + ')' }, g);
    }
  }

  function splitLabel(t) {
    if (t.length <= 10 || t.indexOf(' ') < 0) return [t];
    var mid = t.length / 2, best = -1;
    for (var i = 0; i < t.length; i++) if (t[i] === ' ' && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
    return [t.slice(0, best), t.slice(best + 1)];
  }

  function diagram(name, fills, titleId) {
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-labelledby': titleId, class: 'anat__svg' });
    var t = el('title', { id: titleId }, svg);
    t.textContent = name + ', folded: ' + fills.join(', ') + ', in a buckwheat galette.';

    /* the batter (top side) */
    el('rect', { x: CX - HS, y: CY - HS, width: 2 * HS, height: 2 * HS, fill: '#E3C89D' }, svg);

    /* fillings, x-ray: laid out under the flaps */
    var hasEgg = fills.indexOf('egg') >= 0;
    var others = fills.filter(function (x) { return x !== 'egg'; });
    var n = others.length, ring = hasEgg ? 60 : (n === 1 ? 0 : 52);
    var offset = n === 2 ? 0 : (n === 4 ? -45 : -90);
    var items = [];
    var g = el('g', {}, svg);
    if (hasEgg) {
      el('path', { d: 'M' + (CX - 30) + ' ' + (CY + 2) + 'c0-20 12-31 31-30s29 13 28 30-13 29-30 28-29-8-29-28z', fill: FLOUR, stroke: INK, 'stroke-width': 2 }, g);
      el('circle', { cx: CX, cy: CY, r: 13, fill: YOLK, stroke: INK, 'stroke-width': 2.5 }, g);
      items.push({ label: 'egg', x: CX, y: CY, r: 30 });
    }
    others.forEach(function (label, i) {
      var a = (offset + 360 * i / n) * Math.PI / 180;
      var x = CX + ring * Math.cos(a), y = CY + ring * Math.sin(a);
      token(g, i, x, y);
      items.push({ label: label, x: x, y: y, r: 14 });
    });

    /* the four folded flaps, translucent so the fillings read through */
    var flaps = el('g', { fill: BUCK, 'fill-opacity': '.62', stroke: '#5a3716', 'stroke-width': 2 }, svg);
    var p = topFlap();
    [0, 180, 270, 90].forEach(function (rot) { el('path', { d: p, transform: 'rotate(' + rot + ' ' + CX + ' ' + CY + ')' }, flaps); });
    el('rect', { x: CX - HS, y: CY - HS, width: 2 * HS, height: 2 * HS, fill: 'none', stroke: INK, 'stroke-width': 3 }, svg);

    /* labels: left and right columns, spaced so they never collide */
    var left = [], right = [];
    items.forEach(function (it) {
      if (it.x < CX - 1) left.push(it);
      else if (it.x > CX + 1) right.push(it);
      else (left.length <= right.length ? left : right).push(it);
    });
    var labels = el('g', { class: 'anat__labels' }, svg);
    [[left, -1], [right, 1]].forEach(function (pair) {
      var col = pair[0], side = pair[1];
      col.sort(function (a, b) { return a.y - b.y; });
      var minY = 26, maxY = CY + HS + 6, prev = -Infinity;
      col.forEach(function (it) {
        it.lines = splitLabel(it.label);
        var hgt = it.lines.length * 24;
        it.ly = Math.max(it.y, prev + 18 + hgt / 2, minY);
        prev = it.ly + hgt / 2;
      });
      var over = prev - maxY;
      if (over > 0) col.forEach(function (it) { it.ly -= over; });
      col.forEach(function (it) {
        var edge = side < 0 ? CX - HS - 14 : CX + HS + 14;
        var tx = side < 0 ? edge - 8 : edge + 8;
        var sx = it.x + side * it.r;
        el('polyline', { points: f1(sx) + ',' + f1(it.y) + ' ' + f1(edge) + ',' + f1(it.ly) + ' ' + f1(tx - side * 2) + ',' + f1(it.ly), fill: 'none', stroke: INK, 'stroke-width': 1.75 }, labels);
        el('circle', { cx: f1(sx), cy: f1(it.y), r: 3.2, fill: INK }, labels);
        var text = el('text', { x: tx, y: f1(it.ly - (it.lines.length - 1) * 12 + 8), 'text-anchor': side < 0 ? 'end' : 'start', class: 'anat__label' }, labels);
        it.lines.forEach(function (line, k) {
          var ts = el('tspan', { x: tx, dy: k ? 24 : 0 }, text);
          ts.textContent = line;
        });
      });
    });

    /* the batter itself: "buckwheat" is in the menu's own heading */
    el('polyline', { points: CX + ',' + (CY + HS - 16) + ' ' + CX + ',' + (CY + HS + 24), fill: 'none', stroke: INK, 'stroke-width': 1.75 }, labels);
    el('circle', { cx: CX, cy: CY + HS - 16, r: 3.2, fill: INK }, labels);
    var bt = el('text', { x: CX, y: CY + HS + 48, 'text-anchor': 'middle', class: 'anat__label anat__label--batter' }, labels);
    bt.textContent = 'buckwheat';
    return svg;
  }

  Array.prototype.forEach.call(rows, function (row, idx) {
    var h = row.querySelector('.grow__h');
    var stat = h && h.querySelector('.grow__static');
    if (!stat) return;
    var fills = row.getAttribute('data-fillings').split('|');
    var nameEl = stat.querySelector('.grow__name');
    var name = nameEl ? nameEl.firstChild.textContent.trim() : 'Galette';
    var panelId = (row.id || 'galette-' + idx) + '-anatomy';

    var btn = d.createElement('button');
    btn.type = 'button';
    btn.className = 'grow__btn';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', panelId);
    while (stat.firstChild) btn.appendChild(stat.firstChild);
    var icon = d.createElement('span');
    icon.className = 'grow__icon';
    icon.setAttribute('aria-hidden', 'true');
    btn.appendChild(icon);
    h.replaceChild(btn, stat);

    var panel = d.createElement('div');
    panel.className = 'anat';
    panel.id = panelId;
    panel.hidden = true;
    row.appendChild(panel);

    var built = false;
    function setOpen(open) {
      if (open && !built) {
        var inner = d.createElement('div');
        inner.className = 'anat__inner';
        inner.appendChild(diagram(name, fills, panelId + '-title'));
        var p = d.createElement('p');
        p.className = 'anat__text';
        p.textContent = 'Folded inside, in the menu’s own words: ' + fills.join(' · ') + '.';
        inner.appendChild(p);
        panel.appendChild(inner);
        built = true;
      }
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      panel.hidden = !open;
      panel.classList.toggle('is-opening', open && !reduce.matches);
    }
    btn.addEventListener('click', function () { setOpen(btn.getAttribute('aria-expanded') !== 'true'); });
    row._open = setOpen;
  });

  /* deep links such as menu.html#g-complete open that galette */
  function fromHash() {
    var id = (location.hash || '').slice(1);
    if (!id) return;
    var row = d.getElementById(id);
    if (row && row._open) row._open(true);
  }
  fromHash();
  window.addEventListener('hashchange', fromHash);
})();
