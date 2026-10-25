/* Concept B "Sera": the menu page. The course rail shows the course on stage (aria-current),
   and on desktop each course dissolves in as it takes the stage. Everything stays in normal flow. */
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

  /* motion: a slow cross-dissolve between courses on desktop */
  if (reduce || !root.classList.contains('motion') || !window.gsap || !window.ScrollTrigger) {
    root.classList.remove('motion');
    return;
  }
  var gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger);
  var mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', function () {
    courses.forEach(function (c) {
      var stage = c.querySelectorAll('.course__stage');
      gsap.fromTo(stage, { opacity: 0.18 }, {
        opacity: 1, ease: 'sine.inOut', stagger: 0.08,
        scrollTrigger: { trigger: c, start: 'top 98%', end: 'top 72%', scrub: 1.4 }
      });
      gsap.to(c.querySelector('.course__head'), {
        opacity: 0.18, ease: 'sine.inOut',
        scrollTrigger: { trigger: c, start: 'bottom 22%', end: 'bottom top', scrub: 1.4 }
      });
    });
  });
})();
