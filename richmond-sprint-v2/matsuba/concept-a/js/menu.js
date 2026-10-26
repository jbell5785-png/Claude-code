/* Menu page: one scrolling page. The course row along the top of the lit case is a sticky set of jump links;
   this only marks the course you are reading and keeps its link in view. Without JS the links simply jump. */
(function () {
  'use strict';
  var list = document.querySelector('.tabs__list');
  var panels = [].slice.call(document.querySelectorAll('[data-course]'));
  if (!list || !panels.length || !('IntersectionObserver' in window)) return;
  var tabs = [].slice.call(list.querySelectorAll('.tab'));
  var current = null;
  function mark(id) {
    if (id === current) return;
    current = id;
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-panel') === id;
      if (on) {
        t.setAttribute('aria-current', 'true');
        var l = t.offsetLeft - (list.clientWidth - t.offsetWidth) / 2;
        if (list.scrollWidth > list.clientWidth) list.scrollTo({ left: l, behavior: 'auto' });
      } else t.removeAttribute('aria-current');
    });
  }
  var seen = {};
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { seen[e.target.id] = e.isIntersecting; });
    for (var i = 0; i < panels.length; i++) if (seen[panels[i].id]) { mark(panels[i].id); return; }
    if (panels[0].getBoundingClientRect().top > 0) mark(panels[0].id);
  }, { rootMargin: '-140px 0px -55% 0px' });
  panels.forEach(function (p) { io.observe(p); });
})();
