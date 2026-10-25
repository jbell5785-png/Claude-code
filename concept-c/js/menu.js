/* Concept C, "Bucato": the pegged index on the menu page.
   Marks the course in view with aria-current, gives its tag a swing on its
   string, and keeps the current tag in view when the line scrolls sideways
   on phones. The links are plain anchors, so it all works without JS. */
(function () {
  'use strict';
  var ix = document.querySelector('.ix');
  if (!ix) return;
  var scroller = ix.querySelector('.ix__scroller');
  var links = Array.prototype.slice.call(ix.querySelectorAll('.ix__tag'));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var byId = {};
  links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
  var sections = Object.keys(byId).map(function (id) { return document.getElementById(id); }).filter(Boolean);
  var current = null;

  function reveal(a) {
    var left = a.offsetLeft - (scroller.clientWidth - a.offsetWidth) / 2;
    left = Math.max(0, Math.min(left, scroller.scrollWidth - scroller.clientWidth));
    if (Math.abs(scroller.scrollLeft - left) > 2) {
      try { scroller.scrollTo({ left: left, behavior: reduce.matches ? 'auto' : 'smooth' }); }
      catch (e) { scroller.scrollLeft = left; }
    }
  }
  function setCurrent(id) {
    if (id === current) return;
    current = id;
    links.forEach(function (a) {
      var on = a === byId[id];
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    var a = byId[id];
    if (!a) return;
    if (!reduce.matches) {
      a.classList.remove('is-swinging');
      void a.offsetWidth; // restart the animation
      a.classList.add('is-swinging');
    }
    reveal(a);
  }
  links.forEach(function (a) {
    a.addEventListener('animationend', function () { a.classList.remove('is-swinging'); });
    a.addEventListener('click', function () { setCurrent(a.getAttribute('href').slice(1)); });
  });

  /* Which course is under the index line? Checked on scroll, throttled to a frame. */
  var ticking = false;
  function check() {
    ticking = false;
    var line = ix.getBoundingClientRect().bottom + 24;
    var id = null;
    for (var i = 0; i < sections.length; i++) {
      var r = sections[i].getBoundingClientRect();
      if (r.top <= line) id = sections[i].id; else break;
    }
    if (id) setCurrent(id);
    else if (current) {
      current = null;
      links.forEach(function (a) { a.removeAttribute('aria-current'); });
    }
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(check); }
  }, { passive: true });
  window.addEventListener('resize', check);
  check();
})();
