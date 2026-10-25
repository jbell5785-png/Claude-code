/* MATSUBA, Concept B, "Counter". Plain JS, progressive enhancement only.
   Without this file every page is complete: the tasting menu is a plain list,
   the menu index is a list of anchors, the hours are a table. */
(function () {
  'use strict';

  var reduceMQ = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function reduced() { return !!(reduceMQ && reduceMQ.matches); }

  /* ------------------------------------------------------------------
     Omakase rail: the same <ol> of courses becomes a horizontal,
     scroll-snapping rail. Swipe, trackpad, buttons and arrow keys.
     Vertical page scrolling is never intercepted.                     */
  function initRail() {
    var sec = document.querySelector('.omakase');
    if (!sec) return;
    var rail = sec.querySelector('.rail');
    var list = sec.querySelector('.courses');
    var end = sec.querySelector('.rail__end');
    var ui = sec.querySelector('.rail-ui');
    if (!rail || !list || !end || !ui) return;

    var items = Array.prototype.slice.call(list.children);
    var targets = items.concat([end]);
    var N = items.length;
    var nowEl = ui.querySelector('[data-rail-now]');
    var statusEl = ui.querySelector('.rail-status__text');
    var fill = ui.querySelector('.rail-progress__fill');
    var live = ui.querySelector('[data-rail-live]');
    var prev = ui.querySelector('[data-rail="prev"]');
    var next = ui.querySelector('[data-rail="next"]');

    sec.classList.add('is-rail');
    ui.hidden = false;
    rail.setAttribute('tabindex', '0');
    rail.setAttribute('role', 'region');
    rail.setAttribute('aria-label', 'Tasting menu courses');
    rail.setAttribute('aria-describedby', 'rail-help');

    var idx = -1;
    var animating = false;
    var raf = 0;

    function padLeft() {
      return parseFloat(window.getComputedStyle(rail).paddingLeft) || 0;
    }
    function maxScroll() { return rail.scrollWidth - rail.clientWidth; }
    function posOf(el) {
      var r = rail.getBoundingClientRect();
      return el.getBoundingClientRect().left - r.left + rail.scrollLeft - padLeft();
    }
    function nearest() {
      var x = rail.scrollLeft;
      if (x >= maxScroll() - 2) return targets.length - 1;
      var best = 0, bd = Infinity;
      for (var i = 0; i < targets.length; i++) {
        var d = Math.abs(posOf(targets[i]) - x);
        if (d < bd) { bd = d; best = i; }
      }
      return best;
    }

    function render(i) {
      if (i === idx) return;
      idx = i;
      var c = Math.min(i, N - 1);
      for (var k = 0; k < N; k++) items[k].classList.toggle('is-active', k === c);
      if (i < N) {
        statusEl.innerHTML = 'Course <b data-rail-now>' + (i + 1) + '</b> of ' + N;
      } else {
        statusEl.innerHTML = 'All <b>' + N + '</b> courses &middot; pre-order required';
      }
      fill.style.width = ((c + 1) / N * 100) + '%';
      prev.disabled = i === 0;
      next.disabled = i === targets.length - 1;
    }

    function announce(i) {
      if (!live) return;
      if (i < N) {
        var name = items[i].querySelector('.course__name');
        live.textContent = 'Course ' + (i + 1) + ' of ' + N + ': ' + (name ? name.textContent : '');
      } else {
        live.textContent = 'End of the tasting menu. Pre-order required, minimum 2 persons, £100 per person, complimentary glass of Prosecco.';
      }
    }

    function scrollToX(to) {
      to = Math.max(0, Math.min(to, maxScroll()));
      var from = rail.scrollLeft;
      if (reduced() || Math.abs(to - from) < 2) {
        rail.scrollLeft = to;
        return;
      }
      // 300ms ease-out; snapping is paused so it doesn't fight the tween.
      animating = true;
      rail.style.scrollSnapType = 'none';
      var t0 = null, dur = 300;
      function step(t) {
        if (t0 === null) t0 = t;
        var p = Math.min(1, (t - t0) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        rail.scrollLeft = from + (to - from) * eased;
        if (p < 1) {
          window.requestAnimationFrame(step);
        } else {
          rail.style.scrollSnapType = '';
          animating = false;
          render(nearest());
        }
      }
      window.requestAnimationFrame(step);
    }

    function go(i) {
      i = Math.max(0, Math.min(targets.length - 1, i));
      render(i);
      scrollToX(posOf(targets[i]));
      announce(i);
    }

    prev.addEventListener('click', function () { go(idx - 1); });
    next.addEventListener('click', function () { go(idx + 1); });

    rail.addEventListener('keydown', function (ev) {
      if (ev.target !== rail) return; // let links inside the end panel behave normally
      var k = ev.key;
      if (k === 'ArrowRight') { ev.preventDefault(); go(idx + 1); }
      else if (k === 'ArrowLeft') { ev.preventDefault(); go(idx - 1); }
      else if (k === 'Home') { ev.preventDefault(); go(0); }
      else if (k === 'End') { ev.preventDefault(); go(targets.length - 1); }
    });

    rail.addEventListener('scroll', function () {
      if (animating || raf) return;
      raf = window.requestAnimationFrame(function () {
        raf = 0;
        render(nearest());
      });
    }, { passive: true });

    window.addEventListener('resize', function () {
      idx = -1;
      render(nearest());
    });

    render(0);
  }

  /* ------------------------------------------------------------------
     Hours: mark today's row (London time). No open/closed claim,
     because Monday and the lunch end time are still to be confirmed. */
  function initToday() {
    var rows = document.querySelectorAll('.hours tr[data-days]');
    if (!rows.length) return;
    var day;
    try {
      var name = new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'Europe/London' }).format(new Date());
      day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(name);
    } catch (err) {
      day = new Date().getDay();
    }
    if (day < 0) return;
    for (var i = 0; i < rows.length; i++) {
      var days = rows[i].getAttribute('data-days').split(' ');
      if (days.indexOf(String(day)) !== -1) {
        rows[i].classList.add('is-today');
        var th = rows[i].querySelector('th');
        if (th) {
          var s = document.createElement('span');
          s.className = 'sr-only';
          s.textContent = ' (today)';
          th.appendChild(s);
        }
      }
    }
  }

  /* ------------------------------------------------------------------
     Menu: highlight the current section in the sticky top index.      */
  function initMenuIndex() {
    var nav = document.querySelector('.menu-index');
    if (!nav || !('IntersectionObserver' in window)) return;
    var scroller = nav.querySelector('.menu-index__scroller');
    var links = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
    var map = {};
    var sections = [];
    links.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      var el = document.getElementById(id);
      if (el) { map[id] = a; sections.push(el); }
    });
    var current = null;

    function setActive(id) {
      if (id === current) return;
      current = id;
      links.forEach(function (a) { a.removeAttribute('aria-current'); });
      var a = map[id];
      if (!a) return;
      a.setAttribute('aria-current', 'true');
      var l = a.offsetLeft, r = l + a.offsetWidth;
      var vl = scroller.scrollLeft, vr = vl + scroller.clientWidth;
      if (l < vl + 16 || r > vr - 32) {
        var to = Math.max(0, l - 16);
        if (typeof scroller.scrollTo === 'function') {
          scroller.scrollTo({ left: to, behavior: reduced() ? 'auto' : 'smooth' });
        } else {
          scroller.scrollLeft = to;
        }
      }
    }

    var visible = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { visible[en.target.id] = en.isIntersecting; });
      for (var i = 0; i < sections.length; i++) {
        if (visible[sections[i].id]) { setActive(sections[i].id); return; }
      }
    }, { rootMargin: '-' + Math.round(nav.getBoundingClientRect().height + (parseFloat(getComputedStyle(nav).top) || 0) + 24) + 'px 0px -55% 0px', threshold: 0 });
    sections.forEach(function (s) { io.observe(s); });
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  ready(function () {
    initRail();
    initToday();
    initMenuIndex();
  });
})();
