/* Joseph Bell: the template-to-place redraw. Reads the scroll position only;
   the page scrolls natively and nothing is ever blocked. */
(function () {
  window.__jb = true;
  var root = document.documentElement;
  var track = document.querySelector('.redraw__track');
  var stage = document.querySelector('.redraw__stage');
  if (!track || !stage || !root.classList.contains('motion')) return;
  var steps = Array.prototype.slice.call(stage.querySelectorAll('.steps li'));
  var current = -1;
  var ticking = false;
  var cuts = [0.14, 0.42, 0.72];

  function set(n) {
    if (n === current) return;
    current = n;
    stage.setAttribute('data-step', String(n));
    steps.forEach(function (li, i) {
      li.classList.toggle('is-on', i === n);
      if (i === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
  }

  function update() {
    ticking = false;
    if (!root.classList.contains('motion')) return;
    var span = track.offsetHeight - stage.offsetHeight;
    var top = track.getBoundingClientRect().top;
    var hdr = parseFloat(getComputedStyle(stage).top) || 0;
    var p = span > 0 ? Math.min(1, Math.max(0, (hdr - top) / span)) : 0;
    var n = 0;
    while (n < cuts.length && p >= cuts[n]) n++;
    set(n);
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }

  stage.setAttribute('data-js', '');
  set(0);
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  // If the visitor switches on reduced motion mid-visit, fall back to the static before-and-after.
  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var onChange = function (e) {
    if (e.matches) {
      root.classList.remove('motion');
      steps.forEach(function (li) { li.removeAttribute('aria-current'); });
    }
  };
  if (mq.addEventListener) mq.addEventListener('change', onChange);
})();
