/* Concept C, "Bucato": the washing line in the hero.
   Each garment is a damped spring pendulum about the midpoint of its pegs.
   Breeze from pointer speed (mouse/pen), from scroll speed on touch screens,
   a tug on hover/focus, and a sideways drag (mouse only) that springs back.
   The rope is redrawn through every peg, so the line moves with the washing.
   Touch input never calls preventDefault: scrolling always wins.
   On load the washing settles in under 3 seconds and then rests; after that it
   only moves when someone moves the pointer, scrolls, hovers or focuses (WCAG 2.2.2).
   The loop sleeps when everything is at rest, and when the hero is off-screen.
   Garments hidden at this width (phones show three) are skipped. */
(function () {
  'use strict';
  var hero = document.querySelector('[data-washing]');
  if (!hero || !window.Bucato) return;
  var washing = hero.querySelector('.washing');
  var B = window.Bucato;
  var reduce = B.reduce;
  var NS = 'http://www.w3.org/2000/svg';

  var rope = document.createElementNS(NS, 'svg');
  rope.setAttribute('class', 'washing__rope');
  rope.setAttribute('aria-hidden', 'true');
  rope.setAttribute('focusable', 'false');
  var ropePath = document.createElementNS(NS, 'path');
  rope.appendChild(ropePath);
  washing.insertBefore(rope, washing.firstChild);

  var lines = Array.prototype.slice.call(washing.querySelectorAll('.washing__line'));
  var G = Array.prototype.map.call(washing.querySelectorAll('.garment'), function (el, i) {
    return {
      el: el, swing: el.querySelector('.garment__swing'),
      th: 0, w: 0, lift: 0, lv: 0, liftT: 0, rest: 0,
      d: parseFloat(el.getAttribute('data-peg-d')) || 0.24,
      sign: (i % 2 ? 1 : -1) * (0.65 + ((i * 37) % 10) / 28),
      jit: 0, cx: 0, top: 0, wpx: 0, h: 0, pegY: 0, row: 0, k: 40, drag: null
    };
  });

  var W = 0, rowsInfo = [], f = null;
  function cssNum(el, name, fb) {
    var v = parseFloat(getComputedStyle(el).getPropertyValue(name));
    return isNaN(v) ? fb : v;
  }

  function measure() {
    W = washing.clientWidth;
    washing.classList.remove('is-live');
    var wr = washing.getBoundingClientRect();
    rowsInfo = lines.map(function (ln) {
      var r = ln.getBoundingClientRect();
      return { y0: r.top - wr.top, sag: r.height / 2, visible: r.height > 0 };
    });
    if (rowsInfo[1] && !rowsInfo[1].visible) rowsInfo[1] = rowsInfo[0];
    // a hidden line (desktop row 2) measures 0: reuse row 1's sag
    var sag = rowsInfo[0] ? rowsInfo[0].sag : 30;
    f = B.catenary(W, sag);
    G.forEach(function (g) {
      g.el.style.top = '';
      g.swing.style.rotate = '';
      g.off = !g.el.offsetParent;
      if (g.off) return;
      g.row = Math.round(cssNum(g.el, '--row', 0));
      g.wpx = g.el.offsetWidth;
      g.h = g.el.offsetHeight;
      g.cx = g.el.offsetLeft + g.wpx / 2;
      g.pegY = cssNum(g.el, '--pegy', 0.065) * g.wpx;
      g.jit = cssNum(g.el, '--jit', 0) * 0.6;
      var y0 = rowsInfo[g.row] ? rowsInfo[g.row].y0 : rowsInfo[0].y0;
      g.contact = y0 + f(g.cx);
      g.top = g.contact - g.pegY;
      g.el.style.top = g.top.toFixed(1) + 'px';
      g.rest = Math.atan(f.slope(g.cx)) * 180 / Math.PI + g.jit;
      g.k = Math.max(26, Math.min(70, 9000 / Math.max(g.h, 60)));
    });
    washing.classList.add('is-live');
  }

  function render() {
    var byRow = {};
    G.forEach(function (g) {
      if (g.off) return;
      var ang = g.rest + g.th;
      g.swing.style.rotate = ang.toFixed(2) + 'deg';
      g.swing.style.translate = g.lift ? '0 ' + g.lift.toFixed(2) + 'px' : '';
      (byRow[g.row] = byRow[g.row] || []).push(g);
    });
    var d = '';
    Object.keys(byRow).forEach(function (r) {
      var info = rowsInfo[r] || rowsInfo[0];
      var y0 = info.y0;
      var list = byRow[r].slice().sort(function (a, b) { return a.cx - b.cx; });
      var prev = { x: 0, y: y0 };
      d += 'M0 ' + y0.toFixed(1);
      var seg = function (A, Bp) {
        var mx = (A.x + Bp.x) / 2;
        var base = y0 + f(mx);
        var cy = 2 * base - (A.y + Bp.y) / 2;
        d += 'Q' + mx.toFixed(1) + ' ' + cy.toFixed(1) + ' ' + Bp.x.toFixed(1) + ' ' + Bp.y.toFixed(1);
      };
      list.forEach(function (g) {
        var a = (g.rest + g.th) * Math.PI / 180;
        var px = g.cx, py = g.contact + g.lift;
        var dd = g.d * g.wpx;
        var L = { x: px - dd * Math.cos(a), y: py - dd * Math.sin(a) };
        var R = { x: px + dd * Math.cos(a), y: py + dd * Math.sin(a) };
        seg(prev, L);
        d += 'L' + R.x.toFixed(1) + ' ' + R.y.toFixed(1);
        prev = R;
      });
      seg(prev, { x: W, y: y0 });
      d += ' ';
    });
    rope.setAttribute('viewBox', '0 0 ' + W + ' ' + washing.offsetHeight);
    ropePath.setAttribute('d', d.trim());
  }

  measure();
  render();

  var ro = null;
  var relayout = function () { measure(); render(); };
  if ('ResizeObserver' in window) {
    var lastW = 0;
    ro = new ResizeObserver(function () {
      var w = washing.clientWidth;
      if (w !== lastW) { lastW = w; relayout(); }
    });
    ro.observe(washing);
  } else window.addEventListener('resize', relayout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);

  /* Under reduced motion we stop here: a still, composed line. */
  if (reduce.matches) return;

  /* ---------- Simulation ---------- */
  var raf = 0, last = 0, onScreen = true, settleAt = 0;
  var C = 2.3, KL = 220, CL = 18;
  function step(t) {
    raf = 0;
    var dt = Math.min(0.033, Math.max(0.001, (t - (last || t)) / 1000));
    last = t;
    var awake = false;
    if (settleAt && t >= settleAt) {
      settleAt = 0;
      G.forEach(function (g) { if (!g.drag) { g.th = 0; g.w = 0; } });
    }
    G.forEach(function (g) {
      if (g.off) return;
      if (g.drag) {
        var prevTh = g.th;
        g.th += (g.drag.target - g.th) * Math.min(1, dt * 22);
        g.w = (g.th - prevTh) / dt;
        awake = true;
      } else {
        var acc = -g.k * g.th - C * g.w;
        g.w += acc * dt;
        g.w = Math.max(-160, Math.min(160, g.w));
        g.th += g.w * dt;
        g.th = Math.max(-26, Math.min(26, g.th));
      }
      var la = -KL * (g.lift - g.liftT) - CL * g.lv;
      g.lv += la * dt;
      g.lift += g.lv * dt;
      if (Math.abs(g.th) > 0.03 || Math.abs(g.w) > 0.06 || Math.abs(g.lift - g.liftT) > 0.04 || Math.abs(g.lv) > 0.05) awake = true;
      else { g.th = 0; g.w = 0; g.lift = g.liftT; g.lv = 0; }
    });
    render();
    if (awake && onScreen && !document.hidden) raf = requestAnimationFrame(step);
    else last = 0;
  }
  function wake() {
    if (!raf && onScreen && !document.hidden) { last = 0; raf = requestAnimationFrame(step); }
  }
  function kick(g, dv) { g.w += dv; wake(); }
  function byVisitor() { settleAt = 0; } // the visitor is moving it now: don't cut their swing short

  /* Breeze from the pointer (mouse and pen) */
  var lp = null;
  hero.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    var now = performance.now();
    if (lp) {
      var dt = Math.max(8, now - lp.t);
      var vx = (e.clientX - lp.x) / dt; // px per ms
      if (Math.abs(vx) > 0.05) {
        byVisitor();
        var rect = washing.getBoundingClientRect();
        var px = e.clientX - rect.left;
        var near = e.clientY < rect.bottom + 160 ? 1 : 0.35;
        G.forEach(function (g) {
          if (g.drag || g.off) return;
          var dx = (px - g.cx) / (W * 0.2);
          var fall = Math.exp(-dx * dx) * near;
          if (fall > 0.02) g.w += -Math.max(-2.5, Math.min(2.5, vx)) * 13 * fall;
        });
        wake();
      }
    }
    lp = { x: e.clientX, t: now };
  }, { passive: true });
  hero.addEventListener('pointerleave', function () { lp = null; });

  /* Breeze from scrolling on touch screens (passive: never blocks scroll) */
  var coarse = window.matchMedia('(hover: none), (pointer: coarse)');
  var ls = null;
  window.addEventListener('scroll', function () {
    if (!coarse.matches || !onScreen) return;
    var now = performance.now(), y = window.scrollY;
    if (ls) {
      var dt = Math.max(8, now - ls.t);
      var v = Math.max(-4, Math.min(4, (y - ls.y) / dt));
      if (Math.abs(v) > 0.05) { byVisitor(); G.forEach(function (g) { g.w += v * 16 * g.sign; }); wake(); }
    }
    ls = { y: y, t: now };
  }, { passive: true });

  /* Hover and focus: a little tug and lift */
  G.forEach(function (g, i) {
    var tug = function () { byVisitor(); g.liftT = -7; kick(g, (i % 2 ? 1 : -1) * 70); };
    var untug = function () { g.liftT = 0; wake(); };
    g.swing.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch') tug(); });
    g.swing.addEventListener('pointerleave', function (e) { if (e.pointerType !== 'touch') untug(); });
    g.el.addEventListener('focus', tug);
    g.el.addEventListener('blur', untug);
    g.el.addEventListener('dragstart', function (e) { e.preventDefault(); });

    /* Drag sideways with a mouse; springs back on release */
    var suppressUntil = 0;
    g.swing.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      byVisitor();
      g.drag = { x0: e.clientX, th0: g.th, target: g.th, moved: false, id: e.pointerId };
      try { g.swing.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      wake();
    });
    g.swing.addEventListener('pointermove', function (e) {
      if (!g.drag || e.pointerId !== g.drag.id) return;
      var dx = e.clientX - g.drag.x0;
      if (Math.abs(dx) > 5) { g.drag.moved = true; g.el.classList.add('is-drag'); }
      var L = g.h * 0.75;
      g.drag.target = Math.max(-38, Math.min(38, g.drag.th0 - Math.atan2(dx, L) * 180 / Math.PI));
      wake();
    });
    var end = function (e) {
      if (!g.drag || (e && e.pointerId !== g.drag.id)) return;
      if (g.drag.moved) suppressUntil = performance.now() + 350;
      g.drag = null;
      g.el.classList.remove('is-drag');
      wake();
    };
    g.swing.addEventListener('pointerup', end);
    g.swing.addEventListener('pointercancel', end);
    g.swing.addEventListener('lostpointercapture', end);
    g.el.addEventListener('click', function (e) {
      if (performance.now() < suppressUntil) { e.preventDefault(); e.stopPropagation(); }
    });
  });

  /* Sleep when the hero is off-screen or the tab is hidden */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      onScreen = es[0].isIntersecting;
      if (onScreen) wake();
    }).observe(washing);
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) wake(); });

  /* Arrival: the washing swings in, already readable, and comes to rest within 3 s.
     No recurring gusts: after this it moves only in response to the visitor. */
  G.forEach(function (g, i) { g.th = (i % 2 ? 1 : -1) * (5 + (i % 3) * 1.5); });
  settleAt = performance.now() + 2800;
  wake();
  setTimeout(wake, 2900); // make sure the settle runs even if the swing slept early
  if (reduce.addEventListener) reduce.addEventListener('change', function () {
    if (reduce.matches) { settleAt = 0; G.forEach(function (g) { g.th = 0; g.w = 0; }); render(); }
  });
})();
