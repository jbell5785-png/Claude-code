/* Concept C, "Bucato": shared behaviour.
   - Strung lines: a true catenary per row of hanging items, items rotated to
     the slope at their pegs.
   - Drop-in: tags bounce on their strings as they enter (GSAP, once).
   - Marquee pause control.
   Everything is progressive: the page is complete without this file. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Catenary ----------
     Returns f(x): how far below the endpoints the line hangs at x,
     for a span W with a given mid-span sag. Solves a*(cosh(W/2a)-1) = sag. */
  function catenary(W, sag) {
    if (W <= 0 || sag <= 0) return function () { return 0; };
    var lo = sag * 0.05, hi = W * W, a = 0;
    for (var i = 0; i < 80; i++) {
      a = (lo + hi) / 2;
      var s = a * (Math.cosh(W / (2 * a)) - 1);
      if (s > sag) lo = a; else hi = a;
    }
    var c = a, half = W / 2;
    var f = function (x) { return sag - c * (Math.cosh((x - half) / c) - 1); };
    f.slope = function (x) { return -Math.sinh((x - half) / c); };
    return f;
  }
  function catPath(W, y, f, steps) {
    steps = steps || 32;
    var d = 'M0 ' + y.toFixed(1);
    for (var i = 1; i <= steps; i++) {
      var x = (W * i) / steps;
      d += 'L' + x.toFixed(1) + ' ' + (y + f(x)).toFixed(1);
    }
    return d;
  }
  window.Bucato = { catenary: catenary, catPath: catPath, reduce: reduce };

  /* Position of el relative to an ancestor, ignoring transforms */
  function offsetIn(el, anc) {
    var x = 0, y = 0, n = el;
    while (n && n !== anc) {
      x += n.offsetLeft; y += n.offsetTop;
      var p = n.offsetParent;
      if (!p) break;
      if (p !== anc && !anc.contains(p)) { // anc is not positioned: correct for it
        var ar = anc.getBoundingClientRect(), nr = n.getBoundingClientRect();
        return { x: nr.left - ar.left, y: nr.top - ar.top };
      }
      n = p;
    }
    return { x: x, y: y };
  }

  /* ---------- Strung lines ---------- */
  function layoutStrung(el) {
    var svg = el.querySelector(':scope > .strung__svg, :scope .strung__svg');
    if (!svg) return;
    var items = Array.prototype.filter.call(el.querySelectorAll('[data-hang]'), function (it) {
      return it.closest('[data-strung]') === el;
    });
    var W = el.scrollWidth || el.clientWidth;
    var sag = Math.min(46, 12 + W * 0.022);
    if (el.hasAttribute('data-sag')) sag = parseFloat(el.getAttribute('data-sag'));
    var f = catenary(W, sag);

    // measure without our offsets
    items.forEach(function (it) { it.style.setProperty('--dy', '0px'); it.style.setProperty('--rot', '0deg'); });

    var rows = [];
    items.forEach(function (it) {
      var o = offsetIn(it, el);
      var pegs = Array.prototype.filter.call(it.querySelectorAll('.peg, .knot'), function (p) {
        return p.closest('[data-hang]') === it;
      });
      var pts = [];
      pegs.forEach(function (p) {
        var po = offsetIn(p, it);
        pts.push({ x: po.x + p.offsetWidth / 2, y: po.y + p.offsetHeight / 2 });
      });
      if (!pts.length) pts.push({ x: 22, y: 0 });
      var row = null;
      for (var r = 0; r < rows.length; r++) if (Math.abs(rows[r].top - o.y) < 6) { row = rows[r]; break; }
      if (!row) { row = { top: o.y, items: [], base: Infinity }; rows.push(row); }
      var contact = o.y + pts[0].y;
      row.base = Math.min(row.base, contact);
      row.items.push({ el: it, o: o, pts: pts });
    });

    var d = '';
    rows.forEach(function (row) {
      d += catPath(W, row.base, f) + ' ';
      row.items.forEach(function (r) {
        var p1 = r.pts[0], p2 = r.pts[r.pts.length - 1];
        var x1 = r.o.x + p1.x, x2 = r.o.x + p2.x;
        var tilt = parseFloat(r.el.style.getPropertyValue('--tilt')) || 0;
        var rot, mid, pivotX;
        if (r.pts.length > 1) {
          rot = Math.atan2(f(x2) - f(x1), x2 - x1) * 180 / Math.PI * 0.7;
          pivotX = (p1.x + p2.x) / 2;
          mid = f((x1 + x2) / 2);
          rot += tilt * 0.25;
        } else {
          rot = tilt + Math.atan(f.slope(x1)) * 180 / Math.PI * 0.35;
          pivotX = p1.x;
          mid = f(x1);
        }
        var dy = row.base + mid - (r.o.y + p1.y);
        r.el.style.setProperty('--px', pivotX.toFixed(1) + 'px ' + p1.y.toFixed(1) + 'px');
        r.el.style.transformOrigin = pivotX.toFixed(1) + 'px ' + p1.y.toFixed(1) + 'px';
        r.el.style.setProperty('--dy', dy.toFixed(1) + 'px');
        r.el.style.setProperty('--rot', rot.toFixed(2) + 'deg');
      });
    });
    var H = el.scrollHeight || el.offsetHeight;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.style.width = W + 'px';
    var path = svg.querySelector('path');
    path.setAttribute('d', d.trim());
    el.classList.add('is-strung');
  }

  var strungEls = Array.prototype.slice.call(document.querySelectorAll('[data-strung]'));
  var pending = false;
  function layoutAll() {
    pending = false;
    strungEls.forEach(layoutStrung);
  }
  function schedule() { if (!pending) { pending = true; requestAnimationFrame(layoutAll); } }
  window.Bucato.relayout = schedule;
  window.Bucato.layoutStrung = layoutStrung;
  layoutAll();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
  window.addEventListener('load', schedule);
  if ('ResizeObserver' in window) {
    var lastW = new WeakMap();
    var ro = new ResizeObserver(function (entries) {
      entries.forEach(function (e) {
        var w = Math.round(e.contentRect.width);
        if (lastW.get(e.target) !== w) { lastW.set(e.target, w); schedule(); }
      });
    });
    strungEls.forEach(function (el) { ro.observe(el); });
  } else {
    window.addEventListener('resize', schedule);
  }

  /* ---------- Marquee ---------- */
  var mq = document.querySelector('[data-marquee]');
  if (mq) {
    var btn = mq.querySelector('[data-marquee-toggle]');
    var setup = function () {
      if (!btn) return;
      btn.hidden = reduce.matches;
    };
    setup();
    if (reduce.addEventListener) reduce.addEventListener('change', function () {
      root.classList.toggle('motion-ok', !reduce.matches); setup();
    });
    if (btn) btn.addEventListener('click', function () {
      var paused = mq.classList.toggle('is-paused');
      btn.querySelector('span').textContent = paused ? 'Play' : 'Pause';
      btn.querySelector('svg').innerHTML = paused
        ? '<path d="M3 1.5v11l9-5.5z" fill="currentColor"/>'
        : '<path d="M2 1h3.5v12H2zM8.5 1H12v12H8.5z" fill="currentColor"/>';
    });
  }

  /* ---------- Drop-in motion (GSAP, optional) ---------- */
  function motion() {
    if (reduce.matches || !window.gsap) return;
    var gsap = window.gsap;
    var ST = window.ScrollTrigger;
    if (ST) gsap.registerPlugin(ST);
    var vh = window.innerHeight;

    var hangs = document.querySelectorAll('.strung [data-hang]');
    Array.prototype.forEach.call(hangs, function (el, i) {
      var r = el.getBoundingClientRect();
      var vars = {
        y: -34, rotation: (i % 2 ? 1 : -1) * (7 + (i % 3) * 3),
        duration: 1.1, ease: 'elastic.out(1, 0.45)', clearProps: 'transform'
      };
      if (r.top < vh || !ST) { vars.delay = 0.05 * (i % 4); gsap.from(el, vars); }
      else { vars.scrollTrigger = { trigger: el, start: 'top 92%', once: true }; gsap.from(el, vars); }
    });

    var tags = document.querySelectorAll('.swing');
    if (ST && tags.length) {
      ST.batch(tags, {
        start: 'top 95%', once: true,
        onEnter: function (batch) {
          gsap.fromTo(batch, { rotation: -18 }, {
            rotation: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)', stagger: 0.04, clearProps: 'transform'
          });
        }
      });
    }
  }
  if (document.readyState === 'complete') motion();
  else window.addEventListener('load', motion);
})();
