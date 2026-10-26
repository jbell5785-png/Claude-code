/* Concept B "Sera": the menu page. The sticky course rail marks the course in view (aria-current)
   and keeps it scrolled into view on phones. No other motion: the menu is for reading. */
(function () {
  'use strict';
  var root = document.documentElement;
  var links = [].slice.call(document.querySelectorAll('.rail a'));
  var list = document.querySelector('.rail ol');
  var byId = {};
  links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
  var courses = [].slice.call(document.querySelectorAll('.course'));
  var current = null;

  function setCurrent(id) {
    if (id === current || !byId[id]) return;
    current = id;
    links.forEach(function (a) { a.removeAttribute('aria-current'); });
    var a = byId[id];
    a.setAttribute('aria-current', 'location');
    // keep the current course visible in the rail on phones, without moving the page
    var left = a.offsetLeft - (list.clientWidth - a.offsetWidth) / 2;
    if (list.scrollWidth > list.clientWidth) list.scrollTo({ left: Math.max(0, left), behavior: reduce ? 'auto' : 'smooth' });
  }

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) setCurrent(e.target.id); });
    }, { rootMargin: '-40% 0px -55% 0px' });
    courses.forEach(function (c) { io.observe(c); });
  }
  // clear the marker when back above the first course
  window.addEventListener('scroll', function () {
    if (courses[0] && courses[0].getBoundingClientRect().top > window.innerHeight * 0.45 && current) {
      links.forEach(function (a) { a.removeAttribute('aria-current'); });
      current = null;
    }
  }, { passive: true });

})();
