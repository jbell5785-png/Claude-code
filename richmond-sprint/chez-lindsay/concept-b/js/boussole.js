/* La boussole: the compass-rose menu filter for Concept B "Marée".
   - Four bearings (Mer, Terre, Potager, Sucré) plus "Tout", as aria-pressed buttons.
   - Matching dishes stay open; the rest fold to one readable line (name and price).
   - A polite live region gives the count.
   - On wide screens with motion allowed, fine rhumb lines draw from the compass to
     each matching section heading that is on screen. Reduced motion: state change only.
   Without JS the full menu shows, grouped normally, and the control is not shown. */
(function () {
  'use strict';

  var root = document.getElementById('menus-food');
  var panel = document.querySelector('.boussole');
  if (!root || !panel) return;

  var buttons = Array.prototype.slice.call(panel.querySelectorAll('.bq'));
  var countEl = document.getElementById('boussole-count');
  var ctl = panel.querySelector('.boussole__ctl');
  var svg = document.querySelector('svg.rhumbs');
  var NS = 'http://www.w3.org/2000/svg';
  var mm = function (q) { return window.matchMedia ? window.matchMedia(q) : { matches: false, addEventListener: function () {} }; };
  var reduce = mm('(prefers-reduced-motion: reduce)');
  var wide = mm('(min-width: 1080px)');

  var NAMES = { mer: 'Mer', terre: 'Terre', potager: 'Potager', sucre: 'Sucré', all: 'Tout' };
  var MEANS = {
    mer: 'Fish and seafood stay open',
    terre: 'Meat dishes stay open',
    potager: 'Dishes the restaurant itself calls vegetarian stay open',
    sucre: 'Crêpes and desserts stay open'
  };
  var ANGLE = { mer: 0, terre: 90, potager: 180, sucre: 270 };

  var dishes = Array.prototype.slice.call(root.querySelectorAll('.dish'));
  var groups = Array.prototype.slice.call(root.querySelectorAll('[data-target]')).map(function (h) {
    var scope = h.classList.contains('menu-sec__title') ? h.closest('.menu-sec') : h.closest('.course');
    return {
      h: h,
      dishes: Array.prototype.slice.call(scope.querySelectorAll('.dish')),
      mark: h.querySelector('.bearing-mark'),
      count: h.querySelector('.bearing-count'),
      k: 0,
      line: null,
      wasVisible: false
    };
  });

  var current = 'all';
  var needle = 0;

  function linesAllowed() {
    return !!svg && wide.matches && !reduce.matches;
  }

  function apply(cap) {
    current = cap;
    var filtering = cap !== 'all';
    panel.setAttribute('data-bearing', cap);

    if (filtering) {
      // turn the needle the short way round
      var target = ANGLE[cap];
      var delta = ((target - needle) % 360 + 540) % 360 - 180;
      needle += delta;
      panel.style.setProperty('--bearing', needle + 'deg');
    }

    buttons.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-cap') === cap));
    });

    root.classList.toggle('is-filtering', filtering);
    var n = 0;
    dishes.forEach(function (d) {
      var match = filtering && d.getAttribute('data-cap') === cap;
      d.classList.toggle('is-match', match);
      var more = d.querySelector('.dish__more');
      if (more) {
        if (filtering && !match) more.setAttribute('aria-hidden', 'true');
        else more.removeAttribute('aria-hidden');
      }
      if (match) n++;
    });

    var secs = 0;
    groups.forEach(function (g) {
      var k = 0;
      if (filtering) {
        g.dishes.forEach(function (d) { if (d.classList.contains('is-match')) k++; });
      }
      g.k = k;
      g.h.classList.toggle('is-bearing', k > 0);
      if (g.count) g.count.textContent = k ? (k + ' · ' + NAMES[cap]) : '';
      if (k) secs++;
    });

    countEl.textContent = '';
    if (!filtering) {
      countEl.textContent = 'Tout: the full menu.';
    } else {
      countEl.appendChild(document.createTextNode(
        NAMES[cap] + ': ' + n + (n === 1 ? ' dish' : ' dishes') + ' in ' + secs + (secs === 1 ? ' section.' : ' sections.')));
      var more = document.createElement('span');
      more.className = 'boussole__count-more';
      more.textContent = ' ' + MEANS[cap] + '; the rest fold to one line.';
      countEl.appendChild(more);
    }

    drawLines(true);
    follow();
  }

  /* While dishes fold or unfold the page reflows (and the browser may re-anchor the
     scroll position), so keep the lines attached for the length of the transition. */
  var followUntil = 0;
  function follow() {
    if (!linesAllowed()) return;
    var start = !followUntil || performance.now() > followUntil;
    followUntil = performance.now() + 1400;
    if (!start) return;
    (function tick() {
      drawLines(false);
      if (performance.now() < followUntil) window.requestAnimationFrame(tick);
      else followUntil = 0;
    })();
  }

  buttons.forEach(function (b) {
    b.addEventListener('click', function () {
      var cap = b.getAttribute('data-cap');
      // pressing the active bearing again returns to Tout
      apply(cap === current && cap !== 'all' ? 'all' : cap);
    });
  });

  /* ---------------------------------------------------------- rhumb lines */
  function removeLine(g) {
    if (g.line && g.line.parentNode) g.line.parentNode.removeChild(g.line);
    g.line = null;
    g.wasVisible = false;
  }

  function clearLines() {
    groups.forEach(removeLine);
  }

  function drawIn(line, len) {
    line.classList.remove('is-drawing');
    line.style.strokeDasharray = len + ' ' + len;
    line.style.strokeDashoffset = String(len);
    line.getBoundingClientRect();
    line.classList.add('is-drawing');
    line.style.strokeDashoffset = '0';
    clearTimeout(line._t);
    line._t = setTimeout(function () {
      line.classList.remove('is-drawing');
      line.style.strokeDasharray = '';
      line.style.strokeDashoffset = '';
    }, 1250);
  }

  function drawLines(fresh) {
    if (!svg) return;
    if (!linesAllowed() || current === 'all') { clearLines(); return; }
    var cr = ctl.getBoundingClientRect();
    var top = (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 76) + 6;
    var vh = window.innerHeight;
    var roseOn = cr.bottom > top && cr.top < vh;
    var cx = cr.left + cr.width / 2;
    var cy = cr.top + cr.height / 2;
    var R = cr.width / 2 + 2;

    groups.forEach(function (g) {
      if (!g.k || !g.mark) { removeLine(g); return; }
      var mr = g.mark.getBoundingClientRect();
      var tx = mr.left + mr.width / 2;
      var ty = mr.top + mr.height / 2;
      var visible = roseOn && ty > top + 4 && ty < vh - 4 && tx > cx;
      if (!visible) {
        if (g.line) g.line.style.opacity = '0';
        g.wasVisible = false;
        return;
      }
      var dx = tx - cx, dy = ty - cy;
      var d = Math.sqrt(dx * dx + dy * dy) || 1;
      var x1 = cx + dx / d * R, y1 = cy + dy / d * R;
      var x2 = tx - dx / d * 10, y2 = ty - dy / d * 10;
      if (!g.line) {
        g.line = document.createElementNS(NS, 'line');
        svg.appendChild(g.line);
      }
      g.line.setAttribute('x1', x1.toFixed(1));
      g.line.setAttribute('y1', y1.toFixed(1));
      g.line.setAttribute('x2', x2.toFixed(1));
      g.line.setAttribute('y2', y2.toFixed(1));
      g.line.style.opacity = '';
      if (fresh || !g.wasVisible) {
        var len = Math.max(1, d - R - 10);
        drawIn(g.line, Math.ceil(len));
      }
      g.wasVisible = true;
    });
  }

  var raf = 0;
  function schedule() {
    if (raf) return;
    raf = window.requestAnimationFrame(function () {
      raf = 0;
      drawLines(false);
    });
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(root);
  function onMedia() { drawLines(true); }
  if (wide.addEventListener) { wide.addEventListener('change', onMedia); reduce.addEventListener('change', onMedia); }

  apply('all');
})();
