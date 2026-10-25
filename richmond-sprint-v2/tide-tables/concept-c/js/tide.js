/* Tide Tables · Concept C · the waterline
   The page is one drawn tide. Sections carry data-phase anchors (0.5 = high water, 1.0 = the
   trough of a natural tide). Scroll position is interpolated between anchors to a phase, and the
   phase becomes a water level the Richmond way: the weir holds the river at or above half-tide,
   so the level never falls below a "held" floor. Nothing here is real tide data. */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');

  var HELD = 0.66; // drawn floor: "at or above half-tide"
  var GATE = Math.acos(1 - 2 * HELD) / (2 * Math.PI); // phase where the drawn gates come up
  var DG = { X0: 30, X1: 570, YB: 250, YT: 60 }; // must match the diagram in gen.py
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

  function nat(p) { return 0.5 - 0.5 * Math.cos(2 * Math.PI * p); }
  function held(p) { return Math.max(nat(p), HELD); }
  function level(p) { return (held(p) - 0.5) / 0.5; } // 0 = half-tide, 1 = high water

  var ropes = Array.prototype.map.call(document.querySelectorAll('.rope'), function (el) {
    var r = el.getAttribute('data-ring').split(',').map(Number);
    var b = el.getAttribute('data-bow').split(',').map(Number);
    return { el: el, rx: r[0], ry: r[1], bx: b[0], by: b[1] };
  });
  var states = document.querySelectorAll('[data-tide-state]');
  var marker = document.querySelector('.dg-marker');
  var stem = marker && marker.querySelector('.dg-stem');

  var anchors = [];
  var cur = null, target = 0, raf = 0, lastT = 0, lastState = '';

  function measure() {
    var vh = window.innerHeight, sy = window.pageYOffset;
    anchors = Array.prototype.map.call(document.querySelectorAll('[data-phase]'), function (el) {
      var r = el.getBoundingClientRect();
      var at = parseFloat(el.getAttribute('data-at') || '0.5');
      var vp = parseFloat(el.getAttribute('data-vp') || '0.5');
      return { y: r.top + sy + r.height * at - vh * vp, p: parseFloat(el.getAttribute('data-phase')) };
    }).sort(function (a, b) { return a.y - b.y; });
    var maxS = document.documentElement.scrollHeight - vh;
    anchors.forEach(function (a) { a.y = Math.max(0, Math.min(maxS, a.y)); });
  }

  function phaseAt(s) {
    if (!anchors.length) return 1 / 3;
    if (s <= anchors[0].y) return anchors[0].p;
    for (var i = 1; i < anchors.length; i++) {
      var a = anchors[i - 1], b = anchors[i];
      if (s <= b.y) {
        var t = b.y === a.y ? 1 : (s - a.y) / (b.y - a.y);
        t = t * t * (3 - 2 * t); // ease between anchors: the tide slackens at each one
        return a.p + (b.p - a.p) * t;
      }
    }
    return anchors[anchors.length - 1].p;
  }

  function stateText(p) {
    var ph = ((p % 1) + 1) % 1;
    if (ph < GATE || ph > 1 - GATE) return 'Gates down: held at half-tide or above';
    if (Math.abs(ph - 0.5) < 0.045) return 'Gates up: high water';
    return ph < 0.5 ? 'Gates up: rising' : 'Gates up: falling';
  }

  function render(p, label) {
    var L = level(p);
    root.style.setProperty('--tide', L.toFixed(4));
    var off = (1 - L) * 160;
    for (var i = 0; i < ropes.length; i++) {
      var r = ropes[i], by = r.by + off, mx = (r.rx + r.bx) / 2, sag = Math.max(r.ry, by) + 16;
      r.el.setAttribute('d', 'M' + r.rx + ',' + r.ry + 'Q' + mx.toFixed(1) + ',' + sag.toFixed(1) + ' ' + r.bx + ',' + by.toFixed(1));
    }
    var s = label || stateText(p);
    if (s !== lastState) {
      for (var j = 0; j < states.length; j++) states[j].textContent = s;
      lastState = s;
    }
    if (marker) {
      var ph = ((p % 1) + 1) % 1;
      var x = DG.X0 + ph * (DG.X1 - DG.X0), y = DG.YB - held(ph) * (DG.YB - DG.YT);
      marker.setAttribute('transform', 'translate(' + x.toFixed(1) + ',' + y.toFixed(1) + ')');
      if (stem) stem.setAttribute('d', 'M0,0V' + (DG.YB + 6 - y).toFixed(1));
    }
  }

  function tick(t) {
    raf = 0;
    var dt = lastT ? Math.min(64, t - lastT) : 16;
    lastT = t;
    if (cur === null) cur = target;
    cur += (target - cur) * (1 - Math.exp(-dt / 140));
    if (Math.abs(target - cur) < 0.0004) cur = target;
    render(cur);
    if (cur !== target) raf = requestAnimationFrame(tick);
    else lastT = 0;
  }

  function onScroll() {
    target = phaseAt(window.pageYOffset);
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function staticTide() {
    // designed still: a mid-tide line everywhere, the diagram dot at mid-tide
    root.classList.remove('motion');
    window.removeEventListener('scroll', onScroll);
    if (raf) cancelAnimationFrame(raf), raf = 0;
    render(1 / 3, 'Mid-tide (still)');
    root.style.setProperty('--tide', '0.5');
  }

  function liveTide() {
    root.classList.add('motion');
    measure();
    cur = null;
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function setup() { if (mq.matches) staticTide(); else liveTide(); }

  setup();
  if (mq.addEventListener) mq.addEventListener('change', setup);
  else if (mq.addListener) mq.addListener(setup);

  var rmTimer = 0;
  function remeasure() {
    clearTimeout(rmTimer);
    rmTimer = setTimeout(function () { if (!mq.matches) { measure(); onScroll(); } }, 120);
  }
  window.addEventListener('resize', remeasure);
  window.addEventListener('load', remeasure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);
  if (window.ResizeObserver) new ResizeObserver(remeasure).observe(document.body);

  // quiet reveals, in the same "surfacing" language
  if (!mq.matches && 'IntersectionObserver' in window) {
    var els = document.querySelectorAll('.datum__head, .datum__body, .dishes, .parties > div, .find__grid > div, .descend li, .mooring, .slot, .hollyhock');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    Array.prototype.forEach.call(els, function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight) return; // already on screen: never hide it
      el.classList.add('rv');
      io.observe(el);
    });
  }
})();
