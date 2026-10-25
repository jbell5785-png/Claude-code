/* Menu page: course tabs along the top of the lit case.
   Without JS every course is shown in order and the tabs are plain jump links. */
(function () {
  'use strict';
  var list = document.querySelector('.tabs__list');
  var panels = [].slice.call(document.querySelectorAll('[data-course]'));
  if (!list || !panels.length) return;
  var tabs = [].slice.call(list.querySelectorAll('.tab'));
  var tabsBar = document.querySelector('.tabs');
  var paper = document.querySelector('.case__paper');

  list.setAttribute('role', 'tablist');
  list.setAttribute('aria-label', 'Courses');
  tabs.forEach(function (t) {
    var id = t.getAttribute('data-panel');
    t.setAttribute('role', 'tab');
    t.setAttribute('aria-controls', id);
    t.parentNode.setAttribute('role', 'presentation');
  });
  panels.forEach(function (p) {
    p.setAttribute('role', 'tabpanel');
    p.setAttribute('aria-labelledby', 'tab-' + p.id);
  });

  function select(id, opts) {
    opts = opts || {};
    var found = false;
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-panel') === id;
      if (on) found = true;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.setAttribute('tabindex', on ? '0' : '-1');
      if (on && opts.reveal !== false && t.scrollIntoView) {
        var l = t.offsetLeft - (list.clientWidth - t.offsetWidth) / 2;
        list.scrollTo({ left: l, behavior: opts.instant ? 'auto' : 'smooth' });
      }
    });
    if (!found) return false;
    panels.forEach(function (p) { p.hidden = p.id !== id; });
    if (opts.focusTab) {
      var cur = tabs.filter(function (t) { return t.getAttribute('data-panel') === id; })[0];
      if (cur) cur.focus();
    }
    // keep the reader at the top of the new course if they had scrolled down the paper
    if (opts.scroll) {
      var barH = tabsBar ? tabsBar.getBoundingClientRect().bottom : 0;
      var top = paper.getBoundingClientRect().top;
      if (top < barH) window.scrollTo({ top: window.scrollY + top - barH, behavior: 'auto' });
    }
    if (opts.hash && history.replaceState) history.replaceState(null, '', '#' + id);
    return true;
  }

  list.addEventListener('click', function (e) {
    var t = e.target.closest('.tab');
    if (!t) return;
    e.preventDefault();
    select(t.getAttribute('data-panel'), { scroll: true, hash: true });
  });
  list.addEventListener('keydown', function (e) {
    var i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    var n = null;
    if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = tabs.length - 1;
    if (n === null) return;
    e.preventDefault();
    select(tabs[n].getAttribute('data-panel'), { focusTab: true, scroll: true, hash: true });
  });

  var start = (location.hash || '').slice(1);
  if (!start || !select(start, { instant: true })) select(panels[0].id, { reveal: false });
  window.addEventListener('hashchange', function () {
    var id = location.hash.slice(1);
    if (id) select(id, { scroll: true });
  });
})();
