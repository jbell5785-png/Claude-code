/* Matsuba concept B: menu page.
   1. The course bar: the slat for the course you're reading lifts and lights.
   2. On wide screens the course bar slides in once the wall index has scrolled away.
   3. The tasting menu becomes a stepped wall of 14 slats (tabs) on wide screens; the list stays on phones. */
(function () {
  'use strict';
  var d = document;
  var motionOK = d.documentElement.classList.contains('motion');

  /* ---------- 1: course bar ---------- */
  var bar = d.querySelector('[data-coursebar]');
  if (bar && 'IntersectionObserver' in window) {
    var ol = bar.querySelector('ol');
    var links = Array.prototype.slice.call(bar.querySelectorAll('ol a'));
    var sections = links.map(function (a) { return d.getElementById(a.hash.slice(1)); });
    var current = -1;
    var setCurrent = function (i) {
      if (i === current || i < 0) return;
      current = i;
      links.forEach(function (a, j) { if (j === i) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
      var a = links[i], ar = a.getBoundingClientRect(), orr = ol.getBoundingClientRect();
      var left = ol.scrollLeft + (ar.left - orr.left) - (ol.clientWidth - ar.width) / 2;
      ol.scrollTo({ left: Math.max(0, left), behavior: motionOK ? 'smooth' : 'auto' });
    };
    var visible = new Map();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { visible.set(e.target, e.isIntersecting); });
      for (var i = sections.length - 1; i >= 0; i--) {
        if (visible.get(sections[i])) { setCurrent(i); return; }
      }
    }, { rootMargin: '-30% 0px -65% 0px' });
    sections.forEach(function (s) { if (s) io.observe(s); });

    /* ---------- 2: desktop show / hide ---------- */
    var head = d.querySelector('.menu-head');
    if (head) {
      new IntersectionObserver(function (entries) {
        bar.classList.toggle('is-on', !entries[0].isIntersecting);
      }, { rootMargin: '-120px 0px 0px 0px' }).observe(head);
    }
  }

  /* ---------- 3: the tasting wall ---------- */
  var tasting = d.querySelector('[data-tasting]');
  if (!tasting) return;
  var list = tasting.querySelector('.steps');
  var items = Array.prototype.slice.call(list.children);
  var hint = d.querySelector('[data-hint]');
  var hintText = hint ? hint.textContent : '';
  var wallEl = d.createElement('div');
  wallEl.className = 'twall';
  wallEl.setAttribute('role', 'tablist');
  wallEl.setAttribute('aria-label', 'Tasting menu, 14 dishes');
  var listLabel = list.getAttribute('aria-label');
  var panels = items.map(function (li, i) {   // each dish's words go in a div that can be a tabpanel
    var div = d.createElement('div');
    div.className = 'steps__panel';
    div.id = 'tp-' + (i + 1);
    while (li.firstChild) div.appendChild(li.firstChild);
    li.appendChild(div);
    return div;
  });
  var tabs = items.map(function (li, i) {
    var b = d.createElement('button');
    b.type = 'button';
    b.className = 'twall__slat';
    b.id = 'tslat-' + (i + 1);
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-controls', 'tp-' + (i + 1));
    b.setAttribute('aria-label', li.querySelector('.steps__name').textContent + ', dish ' + (i + 1) + ' of 14');
    b.style.setProperty('--i', i);
    b.style.setProperty('--gx', -((i * 23) % 64) + 'px');
    b.style.setProperty('--gy', -((i * 157) % 720) + 'px');
    b.style.setProperty('--t', (0.45 + ((i * 37) % 10) / 22).toFixed(2));
    wallEl.appendChild(b);
    var c = d.createElement('p');
    c.className = 'steps__count';
    c.setAttribute('aria-hidden', 'true');
    c.textContent = 'Dish ' + (i + 1) + ' of 14';
    panels[i].insertBefore(c, panels[i].firstChild);
    return b;
  });
  tasting.insertBefore(wallEl, list);

  var sel = 0, on = false;
  function select(i, focus) {
    sel = i;
    tabs.forEach(function (b, j) {
      b.setAttribute('aria-selected', j === i ? 'true' : 'false');
      b.tabIndex = j === i ? 0 : -1;
    });
    if (on) items.forEach(function (li, j) { li.hidden = j !== i; });
    if (focus) tabs[i].focus();
  }
  function enable(yes) {
    on = yes;
    tasting.classList.toggle('is-wall', yes);
    if (yes) { list.setAttribute('role', 'presentation'); list.removeAttribute('aria-label'); }
    else { list.removeAttribute('role'); list.setAttribute('aria-label', listLabel); }
    items.forEach(function (li, j) {
      var pn = panels[j];
      if (yes) { li.setAttribute('role', 'presentation'); pn.setAttribute('role', 'tabpanel'); pn.setAttribute('aria-labelledby', 'tslat-' + (j + 1)); pn.tabIndex = 0; }
      else { li.removeAttribute('role'); pn.removeAttribute('role'); pn.removeAttribute('aria-labelledby'); pn.removeAttribute('tabindex'); li.hidden = false; }
    });
    if (hint) hint.textContent = yes ? 'Fourteen dishes. Point at or tap a slat to see each one.' : hintText;
    select(sel, false);
  }
  tabs.forEach(function (b, i) {
    b.addEventListener('click', function () { select(i, false); });
    b.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') select(i, false); });
    b.addEventListener('keydown', function (e) {
      var n = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') n = 0;
      else if (e.key === 'End') n = tabs.length - 1;
      if (n !== null) { e.preventDefault(); select(n, true); }
    });
  });
  var mq = window.matchMedia('(min-width: 960px)');
  enable(mq.matches);
  var onChange = function (e) { enable(e.matches); };
  if (mq.addEventListener) mq.addEventListener('change', onChange); else mq.addListener(onChange);
})();
