/* Shared behaviour: reveals for the plates and the tricycle, and the menu page's section marker.
   Everything is visible without this file; it only adds motion when motion is welcome. */
(function () {
  'use strict';
  var root = document.documentElement;
  var motion = root.classList.contains('motion');

  /* Plates print onto the china, the tricycle rolls in: once, as each comes into view */
  var targets = document.querySelectorAll('.plate, .trike');
  if (motion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.3, rootMargin: '0px 0px -8% 0px' });
    targets.forEach(function (t) { io.observe(t); });
  } else {
    targets.forEach(function (t) { t.classList.add('is-in'); });
  }

  /* Menu page: mark the section in view in the sticky menu bar */
  var mnav = document.querySelector('.mnav');
  if (mnav && 'IntersectionObserver' in window) {
    var links = {};
    mnav.querySelectorAll('a[href^="#"]').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var a = links[en.target.id];
        if (!a) return;
        mnav.querySelectorAll('a').forEach(function (x) { x.classList.remove('is-current'); x.removeAttribute('aria-current'); });
        a.classList.add('is-current');
        a.setAttribute('aria-current', 'true');
        var ul = a.parentNode.parentNode;
        if (ul.scrollWidth > ul.clientWidth) {
          ul.scrollTo({ left: a.offsetLeft - 16, behavior: motion ? 'smooth' : 'auto' });
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    Object.keys(links).forEach(function (id) { var el = document.getElementById(id); if (el) spy.observe(el); });
  }
})();
