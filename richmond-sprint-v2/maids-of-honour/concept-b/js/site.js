/* Concept B: shared behaviour. Everything here is progressive: the page is complete without it. */
(function () {
  'use strict';
  var d = document.documentElement;
  var motion = d.classList.contains('motion');

  // Header gains a solid ground once the page scrolls.
  var head = document.querySelector('[data-head]');
  if (head) {
    var onScroll = function () { head.classList.toggle('is-scrolled', window.scrollY > 24); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Ribbons tie themselves, and quiet elements rise, as they come into view.
  var targets = document.querySelectorAll('.tie, .rise');
  if (!motion || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add(el.classList.contains('tie') ? 'is-tied' : 'is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add(e.target.classList.contains('tie') ? 'is-tied' : 'is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
    targets.forEach(function (el) { io.observe(el); });
  }

  // Menu page: the index underline follows the section being read.
  var spy = document.querySelector('[data-spy]');
  if (spy && 'IntersectionObserver' in window) {
    var links = Array.prototype.slice.call(spy.querySelectorAll('a[href^="#"]'));
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var current = null;
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var a = map[e.target.id];
        if (!a || a === current) return;
        if (current) { current.classList.remove('is-current'); current.removeAttribute('aria-current'); }
        current = a; a.classList.add('is-current'); a.setAttribute('aria-current', 'true');
        var list = spy.querySelector('ul');
        if (list && list.scrollWidth > list.clientWidth) {
          var left = a.offsetLeft - 24;
          list.scrollTo({ left: left, behavior: motion ? 'smooth' : 'auto' });
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) so.observe(s); });
  }
})();
