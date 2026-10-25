/* Tide Tables · Concept B · "Five arches"
   Progressive enhancement only: every page is complete without this file.
   - the plate is engraved, then inked, once per visit (skipped for reduced motion)
   - arches ink in on hover/focus (CSS :has does this; the class toggle is a fallback)
   - keyed bridge facts can be pinned (aria-pressed)
   - the river's shimmer pauses when the plate is off screen */
(function () {
  'use strict';
  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  doc.classList.add('js');
  if (!reduce) doc.classList.add('motion');

  function store(get, key, val) {
    try { return get ? window.sessionStorage.getItem(key) : window.sessionStorage.setItem(key, val); } catch (e) { return null; }
  }

  /* ---------------------------------------------------------------- intro: engrave, then ink */
  var plate = document.querySelector('.plate[data-intro]');
  if (plate && !reduce && store(true, 'tt-b-intro') !== '1') {
    plate.classList.add('intro');
    // two frames so the hidden state is painted before the transition starts
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { plate.classList.add('go'); });
    });
    window.setTimeout(function () { plate.classList.remove('intro', 'go'); }, 3600);
    store(false, 'tt-b-intro', '1');
  }

  /* ---------------------------------------------------------------- arch hover fallback (no :has) */
  var hasHas = false;
  try { hasHas = CSS.supports('selector(:has(*))'); } catch (e) { hasHas = false; }
  if (!hasHas) {
    document.querySelectorAll('.arch-link, .bar-link').forEach(function (a) {
      var m = a.className.match(/\b[nb]([1-5])\b/);
      if (!m) return;
      var n = m[1];
      var isBar = a.classList.contains('bar-link');
      var root = a.closest(isBar ? '.bridge-bar' : '.plate');
      var target = root && root.querySelector(isBar ? '.ba' + n : '.a' + n);
      if (!target) return;
      var on = function () { target.classList.add('is-on'); };
      var off = function () { target.classList.remove('is-on'); };
      a.addEventListener('mouseenter', on); a.addEventListener('mouseleave', off);
      a.addEventListener('focus', on); a.addEventListener('blur', off);
    });
  }

  /* ---------------------------------------------------------------- keyed facts */
  var fig = document.querySelector('.facts-fig');
  var keys = document.querySelectorAll('.key[data-hl]');
  keys.forEach(function (k) {
    k.addEventListener('click', function () {
      var pressed = k.getAttribute('aria-pressed') === 'true';
      keys.forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
      k.setAttribute('aria-pressed', pressed ? 'false' : 'true');
      if (!hasHas && fig) {
        ['arches', 'cut', 'land', 'stone', 'bal'].forEach(function (h) { fig.style.setProperty('--hl-' + h, (!pressed && k.dataset.hl === h) ? '1' : '0'); });
      }
      // on narrow screens the figure sits above the text: bring it into view once
      if (!pressed && fig && window.innerWidth < 900) {
        var r = fig.getBoundingClientRect();
        if (r.bottom < 60 || r.top > window.innerHeight) fig.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      }
    });
  });

  /* ---------------------------------------------------------------- masthead rule once scrolled */
  var mast = document.getElementById('masthead');
  if (mast && 'IntersectionObserver' in window) {
    var sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;';
    document.body.prepend(sentinel);
    new IntersectionObserver(function (e) { mast.classList.toggle('is-stuck', !e[0].isIntersecting); }).observe(sentinel);
  }

  /* ---------------------------------------------------------------- pause the river when unseen */
  var svg = document.querySelector('.plate-svg');
  if (svg && 'IntersectionObserver' in window && !reduce) {
    new IntersectionObserver(function (e) { svg.classList.toggle('is-paused', !e[0].isIntersecting); }).observe(svg);
  }
})();
