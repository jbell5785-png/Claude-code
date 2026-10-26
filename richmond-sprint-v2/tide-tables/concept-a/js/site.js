/* Tide Tables, concept A: page behaviour. Everything here is progressive: the pages are complete without it. */
(function () {
  'use strict';
  var root = document.documentElement;
  var motion = root.classList.contains('motion');
  var raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function smooth(a, b, v) { var t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }

  /* ---------- the festoon along the top: its bulbs light as you read down the page ---------- */
  var fest = document.querySelector('.festoon');
  var festBulbs = [];
  function buildFestoon() {
    if (!fest) return;
    var w = fest.clientWidth || window.innerWidth, NS = 'http://www.w3.org/2000/svg';
    while (fest.firstChild) fest.removeChild(fest.firstChild);
    fest.setAttribute('viewBox', '0 0 ' + w + ' 40');
    var spans = Math.max(2, Math.round(w / 260)), spanW = w / spans, d = '', sag = 16;
    festBulbs = [];
    var wire = document.createElementNS(NS, 'path');
    for (var s = 0; s < spans; s++) {
      var x0 = s * spanW, x1 = x0 + spanW;
      d += (s ? '' : 'M' + x0 + ' 2') + 'Q' + (x0 + spanW / 2) + ' ' + (2 + sag * 2) + ' ' + x1 + ' 2';
      var n = Math.max(4, Math.round(spanW / 34));
      for (var b = 0; b < n; b++) {
        var u = (b + 0.5) / n, x = x0 + u * spanW, y = 2 + sag * 4 * u * (1 - u) * 1 + 3;
        var g = document.createElementNS(NS, 'circle');
        g.setAttribute('cx', x.toFixed(1)); g.setAttribute('cy', y.toFixed(1)); g.setAttribute('r', 9);
        g.setAttribute('class', 'fg'); g.setAttribute('fill', 'url(#fest-glow)'); g.setAttribute('opacity', 0);
        var c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', x.toFixed(1)); c.setAttribute('cy', y.toFixed(1)); c.setAttribute('r', 2.6);
        c.setAttribute('class', 'fb'); c.setAttribute('fill', '#6b645b');
        festBulbs.push({ x: x, g: g, c: c });
      }
    }
    wire.setAttribute('d', d); wire.setAttribute('fill', 'none'); wire.setAttribute('stroke', '#1d1a17'); wire.setAttribute('stroke-width', '1.2');
    var defs = document.createElementNS(NS, 'defs');
    defs.innerHTML = '<radialGradient id="fest-glow"><stop offset="0" stop-color="#F3C46B" stop-opacity=".9"/><stop offset="1" stop-color="#F3C46B" stop-opacity="0"/></radialGradient>';
    fest.appendChild(defs); fest.appendChild(wire);
    festBulbs.forEach(function (b) { fest.appendChild(b.g); fest.appendChild(b.c); });
    festBulbs.sort(function (a, b) { return a.x - b.x; });
  }
  var lastLit = -1;
  function lightFestoon() {
    if (!festBulbs.length) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var prog = max > 0 ? clamp(window.scrollY / max, 0, 1) : 1;
    var lit = Math.round(prog * festBulbs.length);
    if (lit === lastLit) return;
    lastLit = lit;
    festBulbs.forEach(function (b, i) {
      var on = i < lit;
      b.c.setAttribute('fill', on ? '#FBE3A6' : '#6b645b');
      b.g.setAttribute('opacity', on ? 0.85 : 0);
    });
  }

  /* ---------- header goes solid once you're past the very top ---------- */
  var head = document.querySelector('.masthead');
  function headState() {
    if (!head) return;
    var solid = window.scrollY > 30 || document.body.classList.contains('page-menu');
    head.classList.toggle('is-solid', solid);
  }

  /* ---------- the walk ---------- */
  var walk = document.querySelector('.walk');
  var svg = document.getElementById('scene');
  var vault = null, wrap = null, stage = null, notes = [], heroCopy = null, target = 0, current = 0, ticking = false, inView = true;

  function setupVault() {
    if (!walk || !svg || !window.TideVault) return;
    wrap = walk.querySelector('.scene-wrap');
    stage = walk.querySelector('.stage');
    heroCopy = walk.querySelector('.hero-copy');
    notes = Array.prototype.slice.call(walk.querySelectorAll('.walk-notes li'));
    vault = new window.TideVault(svg);
    vault.build();
    layoutVault();
    window.addEventListener('resize', onResize, { passive: true });
    if (motion) {
      window.addEventListener('scroll', onScroll, { passive: true });
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) { inView = es[0].isIntersecting; if (inView) onScroll(); }).observe(walk);
      }
      onScroll(); current = target; draw();
    }
  }
  var lastW = 0, lastH = 0;
  function layoutVault() {
    var w = wrap.clientWidth, h = wrap.clientHeight;
    if (!w || !h) return;
    lastW = w; lastH = h;
    vault.layout(w, h);
    var m = vault.metrics;
    wrap.style.setProperty('--floor', Math.round(m.floorY) + 'px');
    wrap.style.setProperty('--crown', Math.round(m.crownY) + 'px');
    wrap.style.setProperty('--arch-l', Math.round(m.archL) + 'px');
    vault.render(motion ? current : 0);
  }
  function onResize() {
    // ignore the small height jitter from mobile toolbars; svh keeps the stage steady anyway
    var w = wrap.clientWidth, h = wrap.clientHeight;
    if (w === lastW && Math.abs(h - lastH) < 2) return;
    layoutVault(); if (motion) draw();
  }
  function progress() {
    var r = walk.getBoundingClientRect();
    var total = walk.offsetHeight - stage.offsetHeight;
    return total > 0 ? clamp(-r.top / total, 0, 1) : 0;
  }
  function onScroll() {
    if (!vault) return;
    target = progress();
    if (!ticking) { ticking = true; raf(step); }
  }
  var stillT = 0;
  function step() {
    // a little easing toward the scroll position; the page itself scrolls natively
    var diff = target - current;
    current = Math.abs(diff) < 0.0005 ? target : current + diff * 0.22;
    if (inView) draw();
    // the ferns stir only while you are walking; they come to rest shortly after you stop
    svg.classList.add('is-walking'); clearTimeout(stillT);
    stillT = setTimeout(function () { svg.classList.remove('is-walking'); }, 900);
    if (current !== target) raf(step); else ticking = false;
  }
  function draw() {
    var p = current;
    vault.render(p);
    if (heroCopy) {
      // only the wordmark (and its soot plume) fades as you walk in; the Today strip stays put, static
      heroCopy.style.setProperty('--wm', (1 - smooth(0.02, 0.12, p)).toFixed(3));
    }
    notes.forEach(function (li) {
      var a = parseFloat(li.getAttribute('data-from')), b = parseFloat(li.getAttribute('data-to'));
      var o = smooth(a, a + 0.035, p) * (1 - smooth(b - 0.035, b, p));
      li.style.opacity = o.toFixed(3);
      li.style.transform = 'translateY(' + ((1 - o) * 10).toFixed(1) + 'px)';
    });
  }

  /* ---------- the face over the door glances towards your pointer (motion only) ---------- */
  function setupGlance() {
    var od = document.querySelector('.od-svg');
    if (!od || !motion) return;
    var use = od.querySelector('.od-use');
    od.addEventListener('pointermove', function (e) {
      var r = od.getBoundingClientRect();
      var dx = clamp((e.clientX - r.left) / r.width - 0.5, -0.5, 0.5), dy = clamp((e.clientY - r.top) / r.height - 0.45, -0.5, 0.5);
      use.style.setProperty('--look', (dy * 6).toFixed(2) + 'px');
      use.style.setProperty('--lid', (-Math.abs(dx) * 2 - 1).toFixed(2) + 'px');
      use.style.transform = 'translate(' + (dx * 6).toFixed(1) + 'px,' + (dy * 4).toFixed(1) + 'px)';
    });
    od.addEventListener('pointerleave', function () {
      use.style.removeProperty('--look'); use.style.removeProperty('--lid'); use.style.transform = '';
    });
  }

  /* ---------- gentle reveals (motion only; content is visible without JS) ---------- */
  function setupReveals() {
    if (!motion || !('IntersectionObserver' in window)) return;
    var els = document.querySelectorAll('.garden-title, .garden-body, .pull, .chairs, .board-teaser, .ethos, .find-grid > div, .onward-grid > article, .od-text');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px' });
    Array.prototype.forEach.call(els, function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight) return; // never hide what is already on screen
      el.classList.add('reveal'); io.observe(el);
    });
  }

  /* ---------- menu: the lamp over the board you're reading lights up ---------- */
  function setupBoards() {
    var boards = Array.prototype.slice.call(document.querySelectorAll('.mboard'));
    if (!boards.length) return;
    var links = Array.prototype.slice.call(document.querySelectorAll('.board-nav a'));
    function setCurrent(id) {
      boards.forEach(function (b) { b.classList.toggle('is-lit', b.id === id); });
      links.forEach(function (a) {
        if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
    }
    if (motion) boards.forEach(function (b) {
      var r = b.getBoundingClientRect();
      if (r.top > window.innerHeight * 0.9) b.classList.add('will-write'); else b.classList.add('is-written');
    });
    if (!('IntersectionObserver' in window)) { boards.forEach(function (b) { b.classList.add('is-lit', 'is-written'); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-written'); setCurrent(e.target.id); }
      });
    }, { rootMargin: '-35% 0px -45% 0px' });
    boards.forEach(function (b) { io.observe(b); });
    var w = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) e.target.classList.add('is-written'); });
    }, { rootMargin: '0px 0px -12% 0px' });
    boards.forEach(function (b) { w.observe(b); });
    links.forEach(function (a) {
      a.addEventListener('click', function () { setCurrent(a.getAttribute('href').slice(1)); });
    });
    setCurrent(boards[0].id);
  }

  /* ---------- go ---------- */
  buildFestoon();
  setupVault();
  setupGlance();
  setupReveals();
  setupBoards();
  headState(); lightFestoon();
  var sTick = false;
  window.addEventListener('scroll', function () {
    if (sTick) return; sTick = true;
    raf(function () { sTick = false; headState(); lightFestoon(); });
  }, { passive: true });
  var rT;
  window.addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(function () { buildFestoon(); lastLit = -1; lightFestoon(); }, 150); }, { passive: true });

  // snapshot hook for the build step (renders the no-JS fallbacks); harmless otherwise
  window.__tide = { vault: function () { return vault; } };
})();
