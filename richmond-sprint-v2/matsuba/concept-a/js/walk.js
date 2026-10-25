/* Matsuba, Concept A: "Step inside".
   The near awning rolls up like a blind, the view goes through the door, then a short walk down the
   long room: bar canopy, brick wall (lamps switch on one by one, swags glow), booths, far slat wall.
   Scroll-linked, never scroll-jacked: the page scrolls normally and the drawing follows it.
   Without JS, or with reduced motion, the frontage and the lit room are shown as composed stills. */
(function () {
  'use strict';
  var walk = document.querySelector('.walk');
  if (!walk) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('requestAnimationFrame' in window) || !CSS || !CSS.supports || !CSS.supports('position', 'sticky')) return;

  var fr = document.getElementById('frontage');
  var room = document.getElementById('room');
  if (!fr || !room) return;
  var stage = walk.querySelector('.stage');
  var art = walk.querySelector('.hero__art');
  var text = walk.querySelector('.hero__text');
  var roomFig = walk.querySelector('.room');
  var beatsEl = walk.querySelector('.beats');
  var beats = [].slice.call(walk.querySelectorAll('.beat[data-cam]'));
  var cards = beats.map(function (b) { return b.querySelector('.card'); });
  var awn = document.getElementById('fr-awn-near');
  var roll = document.getElementById('fr-roll');
  var shade = document.getElementById('fr-shadow');
  var glow = document.getElementById('fr-glow');
  var door = document.getElementById('fr-door');
  var lamps = [].slice.call(room.querySelectorAll('.rm-lamp'));
  var pools = [].slice.call(room.querySelectorAll('.rm-pool'));
  var swags = [].slice.call(room.querySelectorAll('.rm-swag'));
  var dim = document.getElementById('rm-dim');

  var prog = document.createElement('div');
  prog.className = 'walk-progress';
  prog.setAttribute('aria-hidden', 'true');
  prog.innerHTML = '<i></i>';
  stage.appendChild(prog);

  walk.classList.add('is-live');

  var AT = 540;                                   // awning top edge (rail line) in drawing units
  var DOOR = { cx: 226, cy: 843, h: 520 };        // the glazed door
  var CAM = {
    over:   { cx: 790, cy: 480, z: 1.06 },
    bar:    { cx: 330, cy: 360, z: 1.55 },
    brick:  { cx: 1190, cy: 400, z: 1.4 },
    booths: { cx: 590, cy: 530, z: 2.1 },
    far:    { cx: 780, cy: 468, z: 3.25 }
  };

  var vh = 0, sw = 0, frRest = null, frEnd = null, keys = [], A = 0, B = 0, ticking = false, last = -1;

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function smooth(t) { return t * t * (3 - 2 * t); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function camRect(c, aspect) {
    var h = 1000 / c.z, w = h * aspect;
    if (w > 1600) { w = 1600; h = w / aspect; }
    var cx = clamp(c.cx, w / 2, 1600 - w / 2), cy = clamp(c.cy, h / 2, 1000 - h / 2);
    return [cx - w / 2, cy - h / 2, w, h];
  }

  function measure() {
    vh = stage.clientHeight || window.innerHeight;
    sw = stage.clientWidth || window.innerWidth;
    // frontage: the visible rect that "xMidYMax slice" gives for the art box, so zooming never jumps
    var bw = art.clientWidth || sw, bh = art.clientHeight || vh, a = bw / bh, va = 1600 / 1640;
    if (a > va) { var h = 1600 / a; frRest = [0, 1220 - h, 1600, h]; }
    else { var w = 1640 * a; frRest = [800 - w / 2, -420, w, 1640]; }
    var eh = DOOR.h * 0.62, ew = eh * a;
    frEnd = [DOOR.cx - ew / 2, DOOR.cy - eh / 2, ew, eh];
    A = vh * 0.42;                // awning fully rolled
    B = vh * 1.05;                // through the door
    var bt = beatsEl.offsetTop;
    keys = beats.map(function (b) { return bt + b.offsetTop + b.offsetHeight - vh * (window.innerWidth >= 900 ? 0.96 : 1); });
    last = -1;
  }

  function setFrontage(r, t) {
    // awning rolls up like a blind towards its rail
    var s = 1 - 0.94 * r;
    awn.setAttribute('transform', 'translate(0 ' + AT + ') scale(1 ' + s.toFixed(4) + ') translate(0 ' + (-AT) + ')');
    var th = r > 0.01 ? 8 + 20 * r : 0;
    roll.setAttribute('height', th.toFixed(1));
    roll.setAttribute('y', (AT - 6 - th / 2).toFixed(1));
    roll.setAttribute('opacity', r > 0.01 ? 1 : 0);
    shade.setAttribute('opacity', (1 - r).toFixed(3));
    glow.style.opacity = (0.85 + 0.15 * r).toFixed(3);
    text.style.opacity = clamp(1 - r * 1.7, 0, 1).toFixed(3);
    text.style.transform = 'translateY(' + (-18 * r).toFixed(1) + 'px)';
    text.style.visibility = r > 0.66 ? 'hidden' : '';
    // then the view moves through the door
    var e = t * t;
    var w = frRest[2] * Math.pow(frEnd[2] / frRest[2], e);
    var h = frRest[3] * Math.pow(frEnd[3] / frRest[3], e);
    var cx = lerp(frRest[0] + frRest[2] / 2, frEnd[0] + frEnd[2] / 2, smooth(t));
    var cy = lerp(frRest[1] + frRest[3] / 2, frEnd[1] + frEnd[3] / 2, smooth(t));
    fr.setAttribute('viewBox', (cx - w / 2).toFixed(2) + ' ' + (cy - h / 2).toFixed(2) + ' ' + w.toFixed(2) + ' ' + h.toFixed(2));
  }

  function setDoorClip(t) {
    if (t <= 0) { roomFig.classList.remove('is-open'); return; }
    roomFig.classList.add('is-open');
    var sr = stage.getBoundingClientRect(), d = door.getBoundingClientRect();
    var k = 1 - smooth(clamp(t * 1.15 - 0.1, 0, 1));
    var ct = Math.max(0, d.top - sr.top) * k, cl = Math.max(0, d.left - sr.left) * k;
    var cr = Math.max(0, sr.right - d.right) * k, cb = Math.max(0, sr.bottom - d.bottom) * k;
    roomFig.style.setProperty('--ct', ct.toFixed(1) + 'px');
    roomFig.style.setProperty('--cl', cl.toFixed(1) + 'px');
    roomFig.style.setProperty('--cr', cr.toFixed(1) + 'px');
    roomFig.style.setProperty('--cb', cb.toFixed(1) + 'px');
    art.style.visibility = t >= 1 ? 'hidden' : '';
  }

  function setRoom(s, t) {
    var aspect = sw / vh, names = beats.map(function (b) { return b.getAttribute('data-cam'); });
    var c;
    if (s <= B) {
      var o = CAM.over;
      c = { cx: o.cx, cy: o.cy, z: lerp(1.3, o.z, smooth(t)) };
    } else {
      var pts = [B].concat(keys), cams = [CAM.over].concat(names.map(function (n) { return CAM[n]; }));
      var i = 0;
      while (i < pts.length - 2 && s > pts[i + 1]) i++;
      var u = smooth(clamp((s - pts[i]) / Math.max(1, pts[i + 1] - pts[i]), 0, 1));
      var a = cams[i], b = cams[i + 1];
      c = { cx: lerp(a.cx, b.cx, u), cy: lerp(a.cy, b.cy, u), z: Math.exp(lerp(Math.log(a.z), Math.log(b.z), u)) };
    }
    var r = camRect(c, aspect);
    room.setAttribute('viewBox', r.map(function (v) { return v.toFixed(2); }).join(' '));

    // the lamps on the brick wall switch on one by one between the bar and the brick wall
    var kb = keys[0], kk = keys[1], on = 0;
    lamps.forEach(function (l, i) {
      var th = lerp(kb, kk, 0.3 + i * 0.2), lit = s >= th;
      l.classList.toggle('is-on', lit);
      if (pools[i]) pools[i].classList.toggle('is-on', lit);
      if (lit) on++;
    });
    swags.forEach(function (g, j) {
      var need = Math.min(j, lamps.length - 1);
      g.classList.toggle('is-on', lamps[need] && lamps[need].classList.contains('is-on'));
    });
    if (dim) dim.setAttribute('opacity', (0.34 - 0.07 * on).toFixed(3));

    // the nearest card is "here"
    var best = 0, bd = Infinity;
    keys.forEach(function (k, i) { var d = Math.abs(s - k); if (d < bd) { bd = d; best = i; } });
    cards.forEach(function (cd, i) { cd.classList.toggle('is-here', s > B * 0.9 && i === best); });
    prog.style.setProperty('--p', clamp((s - B) / Math.max(1, keys[keys.length - 1] - B), 0, 1).toFixed(3));
    prog.style.opacity = s > B * 0.95 && s < keys[keys.length - 1] + vh * 0.5 ? 1 : 0;
  }

  function update() {
    ticking = false;
    var rect = walk.getBoundingClientRect();
    if (rect.bottom < -50 || rect.top > vh + 50) return;
    var s = -rect.top;
    if (Math.abs(s - last) < 0.5) return;
    last = s;
    var r = clamp(s / A, 0, 1);
    var t = clamp((s - A * 0.85) / (B - A * 0.85), 0, 1);
    setFrontage(smooth(r), t);
    setDoorClip(t);
    setRoom(s, t);
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }

  measure();
  update();
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', function () { measure(); req(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); req(); });

  // "Come in": a smooth walk to the bar. The page still simply scrolls; nothing is locked.
  var come = document.getElementById('come-in');
  if (come) {
    come.addEventListener('click', function (e) {
      e.preventDefault();
      var y = window.scrollY + walk.getBoundingClientRect().top + keys[0];
      window.scrollTo({ top: y, behavior: 'smooth' });
      var h = document.getElementById('b-bar');
      if (h) h.focus({ preventScroll: true });
      if (history.replaceState) history.replaceState(null, '', '#inside');
    });
  }
})();
