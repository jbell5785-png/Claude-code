/* Matsuba, Concept A: "Step inside".
   1. The frontage: as the hero scrolls away, the near awning rolls up like a blind (scroll-linked, nothing pinned).
   2. The long room: on phones it is one screen, the room once with the four stops as a swipe rail under it.
      The camera follows the rail and the swing-arm lamps switch on one by one, once, as the room comes into view.
      On desktop the room pins while the cards walk past: it opens through the door, then the camera moves
      bar canopy -> brick wall -> booths -> far slat wall. Native scroll throughout; nothing is locked.
   Without JS, or with reduced motion, the frontage rests lit and the room is a composed, fully lit still. */
(function () {
  'use strict';
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('requestAnimationFrame' in window)) return;

  var fr = document.getElementById('frontage');
  var room = document.getElementById('room');
  var hero = document.querySelector('.hero');
  var walk = document.querySelector('.walk');
  if (!fr || !room || !hero || !walk) return;

  var art = hero.querySelector('.hero__art');
  var stage = walk.querySelector('.stage');
  var roomFig = walk.querySelector('.room');
  var rail = walk.querySelector('.beats');
  var beats = [].slice.call(walk.querySelectorAll('.beat[data-cam]'));
  var cards = beats.map(function (b) { return b.querySelector('.card'); });
  var names = beats.map(function (b) { return b.getAttribute('data-cam'); });
  var awn = document.getElementById('fr-awn-near');
  var roll = document.getElementById('fr-roll');
  var shade = document.getElementById('fr-shadow');
  var glow = document.getElementById('fr-glow');
  var lamps = [].slice.call(room.querySelectorAll('.rm-lamp'));
  var pools = [].slice.call(room.querySelectorAll('.rm-pool'));
  var swags = [].slice.call(room.querySelectorAll('.rm-swag'));
  var dim = document.getElementById('rm-dim');
  var desk = window.matchMedia('(min-width: 900px)');

  var AT = 540;                                   // awning top edge (rail line) in drawing units
  var CAM = {
    over:   { cx: 790, cy: 480, z: 1.06 },
    bar:    { cx: 330, cy: 360, z: 1.55 },
    brick:  { cx: 1190, cy: 400, z: 1.4 },
    booths: { cx: 575, cy: 540, z: 2.6 },
    far:    { cx: 780, cy: 468, z: 3.25 }
  };

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function smooth(t) { return t * t * (3 - 2 * t); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function camRect(c, aspect) {
    var h = 1000 / c.z, w = h * aspect;
    if (w > 1600) { w = 1600; h = w / aspect; }
    var cx = clamp(c.cx, w / 2, 1600 - w / 2), cy = clamp(c.cy, h / 2, 1000 - h / 2);
    return [cx - w / 2, cy - h / 2, w, h];
  }
  function camAt(f) {                             // f: 0 = overview, 1..n = the stops, fractional between
    var cams = [CAM.over].concat(names.map(function (n) { return CAM[n]; }));
    var i = clamp(Math.floor(f), 0, cams.length - 2), u = smooth(clamp(f - i, 0, 1));
    var a = cams[i], b = cams[i + 1];
    return { cx: lerp(a.cx, b.cx, u), cy: lerp(a.cy, b.cy, u), z: Math.exp(lerp(Math.log(a.z), Math.log(b.z), u)) };
  }
  function setCam(c, w, h) {
    room.setAttribute('viewBox', camRect(c, w / h).map(function (v) { return v.toFixed(2); }).join(' '));
  }
  function setLamps(on) {
    lamps.forEach(function (l, i) { var lit = i < on; l.classList.toggle('is-on', lit); if (pools[i]) pools[i].classList.toggle('is-on', lit); });
    swags.forEach(function (g, j) { var need = Math.min(j, lamps.length - 1); g.classList.toggle('is-on', need < on); });
    if (dim) dim.setAttribute('opacity', (0.34 - 0.07 * on).toFixed(3));
  }
  function here(i) {
    cards.forEach(function (cd, k) { cd.classList.toggle('is-here', k === i); });
    if (stops) stops.forEach(function (b, k) { b.setAttribute('aria-current', k === i ? 'true' : 'false'); });
  }

  /* ---------- 1. the frontage: phone crop, and the awning rolling up as the hero leaves ---------- */
  var heroH = 0, lastHero = -1, ticking = false;
  function measureHero() {
    heroH = hero.offsetHeight || window.innerHeight;
    var bw = art.clientWidth, bh = art.clientHeight;
    if (!bw || !bh) return;
    var a = bw / bh, va = 1600 / 1640;
    if (a > va) {
      var fw = bw < 700 ? 1380 : 1600, h = fw / a;
      fr.setAttribute('viewBox', [bw < 700 ? Math.min(1600 - fw, Math.max(0, 815 - fw / 2)) : 0, 1220 - h, fw, h].map(function (v) { return v.toFixed(2); }).join(' '));
    } else {
      var w = 1640 * a;
      fr.setAttribute('viewBox', [800 - w / 2, -420, w, 1640].map(function (v) { return v.toFixed(2); }).join(' '));
    }
    lastHero = -1;
  }
  function updateHero() {
    var y = window.scrollY;
    if (y > heroH + 50 && lastHero > heroH) return;
    if (Math.abs(y - lastHero) < 0.5) return;
    lastHero = y;
    var r = smooth(clamp(y / Math.max(1, heroH * 0.55), 0, 1));
    var s = 1 - 0.94 * r;
    awn.setAttribute('transform', 'translate(0 ' + AT + ') scale(1 ' + s.toFixed(4) + ') translate(0 ' + (-AT) + ')');
    var th = r > 0.01 ? 8 + 20 * r : 0;
    roll.setAttribute('height', th.toFixed(1));
    roll.setAttribute('y', (AT - 6 - th / 2).toFixed(1));
    roll.setAttribute('opacity', r > 0.01 ? 1 : 0);
    shade.setAttribute('opacity', (1 - r).toFixed(3));
    glow.style.opacity = (0.85 + 0.15 * r).toFixed(3);
  }

  /* ---------- 2a. phones: one screen, the camera follows the rail ---------- */
  var stops = null, lampsDone = false, io = null;
  function buildStops() {
    if (stops) return;
    var ol = document.createElement('ol');
    ol.className = 'walk__stops col';
    ol.setAttribute('aria-label', 'Stops down the room');
    stops = beats.map(function (b, i) {
      var li = document.createElement('li'), btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = b.querySelector('h3').textContent.replace(/^The /, '');
      btn.setAttribute('aria-current', 'false');
      btn.addEventListener('click', function () {
        rail.scrollTo({ left: b.offsetLeft - rail.offsetLeft - parseFloat(getComputedStyle(rail).paddingLeft || 0), behavior: 'smooth' });
      });
      li.appendChild(btn); ol.appendChild(li);
      return btn;
    });
    stage.parentNode.insertBefore(ol, rail);
  }
  function updateRail() {
    var max = rail.scrollWidth - rail.clientWidth;
    var p = max > 0 ? clamp(rail.scrollLeft / max, 0, 1) : 0;
    var f = 1 + p * (beats.length - 1);           // the rail starts at the bar
    setCam(camAt(f), roomFig.clientWidth || 1, roomFig.clientHeight || 1);
    here(Math.round(p * (beats.length - 1)));
  }
  function lampsOn() {
    if (lampsDone) return;
    lampsDone = true;
    var n = 0;
    (function next() { setLamps(++n); if (n < lamps.length) setTimeout(next, 380); })();
  }

  /* ---------- 2b. desktop: the room pins, opens through the door, the camera walks ---------- */
  var vh = 0, sw = 0, keys = [], B = 0, last = -1, prog = null, stage0 = 0;
  var intro = walk.querySelector('.walk__intro');
  function measureDesk() {
    vh = stage.clientHeight || window.innerHeight;
    sw = stage.clientWidth || window.innerWidth;
    B = vh * 0.55;
    stage0 = intro ? intro.offsetTop + intro.offsetHeight : 0;   // where the stage sits before it sticks (a stuck element's offsetTop moves)
    keys = beats.map(function (b) { return rail.offsetTop - stage0 + b.offsetTop + b.offsetHeight - vh * 0.96; });
    last = -1;
  }
  function updateDesk() {
    var rect = walk.getBoundingClientRect(), top = stage0;
    if (rect.bottom < -50 || rect.top > vh + 50) return;
    var s = -(rect.top + top);
    if (Math.abs(s - last) < 0.5) return;
    last = s;
    // through the door
    var t = clamp(s / B, 0, 1), k = 1 - smooth(t);
    var dw = sw * 0.15, dh = vh * 0.62, db = vh * 0.13;
    roomFig.style.setProperty('--ct', ((vh - dh - db) * k).toFixed(1) + 'px');
    roomFig.style.setProperty('--cb', (db * k).toFixed(1) + 'px');
    roomFig.style.setProperty('--cl', (((sw - dw) / 2) * k).toFixed(1) + 'px');
    roomFig.style.setProperty('--cr', (((sw - dw) / 2) * k).toFixed(1) + 'px');
    stage.style.setProperty('--door', k.toFixed(3));
    // the camera
    var pts = [B].concat(keys), f;
    if (s <= B) f = 0;
    else { var i = 0; while (i < pts.length - 2 && s > pts[i + 1]) i++; f = i + clamp((s - pts[i]) / Math.max(1, pts[i + 1] - pts[i]), 0, 1); }
    setCam(s <= B ? { cx: CAM.over.cx, cy: CAM.over.cy, z: lerp(1.3, CAM.over.z, smooth(t)) } : camAt(f), sw, vh);
    // lamps switch on one by one between the bar and the brick wall
    var on = 0;
    lamps.forEach(function (l, i) { if (s >= lerp(keys[0], keys[1], 0.3 + i * 0.2)) on++; });
    setLamps(on);
    var best = 0, bd = Infinity;
    keys.forEach(function (kk, i) { var d = Math.abs(s - kk); if (d < bd) { bd = d; best = i; } });
    cards.forEach(function (cd, i) { cd.classList.toggle('is-here', s > B * 0.9 && i === best); });
    prog.style.setProperty('--p', clamp((s - B) / Math.max(1, keys[keys.length - 1] - B), 0, 1).toFixed(3));
    prog.style.opacity = s > B * 0.95 && s < keys[keys.length - 1] + vh * 0.5 ? 1 : 0;
  }

  /* ---------- wiring ---------- */
  var mode = '';
  function setMode() {
    var m = desk.matches && CSS.supports && CSS.supports('position', 'sticky') ? 'desk' : 'phone';
    if (m === mode) { measure(); return; }
    mode = m;
    walk.classList.add('is-dim');
    if (m === 'desk') {
      walk.classList.add('is-live');
      rail.removeAttribute('tabindex');
      if (!prog) { prog = document.createElement('div'); prog.className = 'walk-progress'; prog.setAttribute('aria-hidden', 'true'); prog.innerHTML = '<i></i>'; stage.appendChild(prog); }
    } else {
      walk.classList.remove('is-live');
      rail.setAttribute('tabindex', '0');
      ['--ct', '--cb', '--cl', '--cr'].forEach(function (v) { roomFig.style.removeProperty(v); });
      buildStops();
      setLamps(lampsDone ? lamps.length : 0);
      if (!io && 'IntersectionObserver' in window) {
        io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { setTimeout(lampsOn, 350); io.disconnect(); } }); }, { threshold: 0.45 });
        io.observe(roomFig);
      } else if (!io) lampsOn();
    }
    if (stops) stops[0].parentNode.parentNode.hidden = m === 'desk';
    measure();
  }
  function measure() {
    measureHero();
    if (mode === 'desk') measureDesk(); else updateRail();
    req();
  }
  function frame() {
    ticking = false;
    updateHero();
    if (mode === 'desk') updateDesk();
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }

  setMode();
  window.addEventListener('scroll', req, { passive: true });
  rail.addEventListener('scroll', function () { if (mode === 'phone') requestAnimationFrame(updateRail); }, { passive: true });
  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(setMode, 100); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); });
})();
