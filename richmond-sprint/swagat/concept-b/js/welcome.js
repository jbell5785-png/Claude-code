/*
 * The doorstep welcome. Draws the pre-rendered dot-grid pattern once, in about two seconds:
 * the dots settle first, then each loop is drawn by two pens that start on the axis of
 * symmetry and travel in mirror image until they meet. Plain JS, no library.
 * Without JS, or with reduced motion, the pattern is simply there, fully drawn.
 */
(function () {
  'use strict';
  var root = document.documentElement;

  function reveal() { root.classList.remove('welcome-pending'); }

  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (still || !root.classList.contains('welcome-pending')) { reveal(); return; }

  var arts = document.querySelectorAll('.threshold__art');
  var art = null;
  for (var i = 0; i < arts.length; i++) {
    if (arts[i].offsetParent !== null || getComputedStyle(arts[i]).display !== 'none') { art = arts[i]; break; }
  }
  if (!art || !window.requestAnimationFrame) { reveal(); return; }

  var svg = art.querySelector('svg');
  var dots = Array.prototype.slice.call(svg.querySelectorAll('.k-dot'));
  var lines = Array.prototype.slice.call(svg.querySelectorAll('.k-line'));
  var vb = svg.viewBox.baseVal;
  var cx = vb.width / 2, cy = vb.height / 2;
  var maxD = Math.hypot(cx, cy);

  // Prepare every stroke as fully hidden before revealing the groups (same frame, so no flash).
  var pens = [];
  try {
    lines.forEach(function (path) {
      var L = path.getTotalLength();
      if (!L) return;
      path.style.strokeDasharray = L + ' ' + L;
      path.style.strokeDashoffset = L;
      pens.push({ el: path, L: L, dir: 1, half: path.hasAttribute('data-sym') });
      if (path.hasAttribute('data-sym')) {
        var twin = path.cloneNode(false);
        twin.removeAttribute('data-loop');
        twin.setAttribute('data-twin', '');
        twin.style.strokeDasharray = L + ' ' + L;
        twin.style.strokeDashoffset = -L;
        path.parentNode.appendChild(twin);
        pens.push({ el: twin, L: L, dir: -1, half: true });
      }
    });
  } catch (e) { reveal(); return; }

  dots.forEach(function (d) {
    var x = +d.getAttribute('cx') - cx, y = +d.getAttribute('cy') - cy;
    d.__delay = (Math.hypot(x, y) / maxD) * 380; // settle from the centre outwards
    d.style.opacity = '0';
  });
  reveal();

  var DOT_TIME = 220, LINE_START = 320, LINE_TIME = 1700;
  var ease = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var t0 = null;

  function frame(now) {
    if (t0 === null) t0 = now;
    var t = now - t0;
    dots.forEach(function (d) {
      var p = Math.min(1, Math.max(0, (t - d.__delay) / DOT_TIME));
      d.style.opacity = p;
    });
    var lp = ease(Math.min(1, Math.max(0, (t - LINE_START) / LINE_TIME)));
    pens.forEach(function (pen) {
      var drawn = pen.half ? pen.L / 2 * lp : pen.L * lp;
      // forward pen: offset L -> L - drawn; backward twin: offset -L -> -L + drawn
      pen.el.style.strokeDashoffset = pen.dir === 1 ? (pen.L - drawn) : (-pen.L + drawn);
    });
    if (t < LINE_START + LINE_TIME) {
      requestAnimationFrame(frame);
    } else {
      finish();
    }
  }

  function finish() {
    dots.forEach(function (d) { d.style.opacity = ''; });
    pens.forEach(function (pen) {
      if (pen.el.hasAttribute('data-twin')) { pen.el.parentNode.removeChild(pen.el); return; }
      pen.el.style.strokeDasharray = '';
      pen.el.style.strokeDashoffset = '';
    });
  }

  requestAnimationFrame(frame);
})();
