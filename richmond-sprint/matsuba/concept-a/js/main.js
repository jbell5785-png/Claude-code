/* MATSUBA · Concept A "Noren"
   Progressive enhancement only: every page is complete without this file. */
(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  function motionOK() { return !(reduce && reduce.matches); }

  /* ---------- Noren: a tap lifts a panel on touch screens ---------- */
  var noren = document.querySelector('[data-noren]');
  if (noren) {
    var timers = new WeakMap();
    noren.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' || !motionOK()) return;
      var panel = e.target.closest('.noren__panel');
      if (!panel) return;
      panel.classList.add('is-lifted');
      clearTimeout(timers.get(panel));
      timers.set(panel, setTimeout(function () { panel.classList.remove('is-lifted'); }, 1500));
    });
  }

  /* ---------- Mobile dock: tucked away while the hero actions are on screen ---------- */
  var dock = document.querySelector('[data-dock]');
  var heroActions = document.querySelector('.hero__actions');
  if (dock && heroActions && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        // Tuck only while the actions are visible; once they scroll away the dock returns.
        dock.classList.toggle('is-tucked', en.isIntersecting);
      });
    }, { rootMargin: '0px 0px -40px 0px' });
    io.observe(heroActions);
  }

  /* ---------- Hours: mark today's row (London time). No text inserted into layout. ---------- */
  var hours = document.querySelector('[data-hours]');
  if (hours) {
    try {
      var wd = new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'Europe/London' }).format(new Date());
      var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      var day = map[wd];
      hours.querySelectorAll('tr[data-days]').forEach(function (tr) {
        var days = tr.getAttribute('data-days').split(' ').map(Number);
        if (days.indexOf(day) !== -1) {
          tr.classList.add('is-today');
          var th = tr.querySelector('th');
          var sr = document.createElement('span');
          sr.className = 'sr-only';
          sr.textContent = ' (today)';
          th.insertBefore(sr, th.querySelector('.tbc'));
        }
      });
    } catch (err) { /* hours stay as published */ }
  }

  /* ---------- Folded card: settles open once when it comes into view ---------- */
  var folds = document.querySelectorAll('[data-fold]');
  if (folds.length && 'IntersectionObserver' in window && motionOK()) {
    var fio = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.remove('is-closed');
          obs.unobserve(en.target);
        }
      });
    }, { threshold: 0.35 });
    folds.forEach(function (f) {
      var r = f.getBoundingClientRect();
      if (r.top > window.innerHeight) { // only below the fold; never close a visible card
        f.classList.add('is-closed');
        fio.observe(f);
      }
    });
  }

  /* ---------- Menu: course index follows the reader ---------- */
  var index = document.querySelector('[data-index]');
  if (index) {
    var links = Array.prototype.slice.call(index.querySelectorAll('[data-index-link]'));
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var sections = Array.prototype.slice.call(document.querySelectorAll('[data-msec]'));
    var list = index.querySelector('ol');
    var current = null;

    function setCurrent(id) {
      if (id === current || !byId[id]) return;
      current = id;
      links.forEach(function (a) { a.removeAttribute('aria-current'); });
      var a = byId[id];
      a.setAttribute('aria-current', 'true');
      // keep the active item in view inside the index itself (never scrolls the page)
      var horizontal = list.scrollWidth > list.clientWidth + 2;
      if (horizontal) {
        var target = a.offsetLeft - (list.clientWidth - a.offsetWidth) / 2;
        list.scrollTo({ left: Math.max(0, target), behavior: motionOK() ? 'smooth' : 'auto' });
      } else if (index.scrollHeight > index.clientHeight + 2) {
        var t = a.offsetTop - (index.clientHeight - a.offsetHeight) / 2;
        index.scrollTo({ top: Math.max(0, t), behavior: motionOK() ? 'smooth' : 'auto' });
      }
    }

    var ticking = false;
    function update() {
      ticking = false;
      var line = window.innerHeight * 0.32;
      var best = sections[0].id;
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].getBoundingClientRect().top <= line) best = sections[i].id;
      }
      setCurrent(best);
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();

    // Honour a deep link on load
    if (location.hash && byId[location.hash.slice(1)]) setCurrent(location.hash.slice(1));
    links.forEach(function (a) {
      a.addEventListener('click', function () { setCurrent(a.getAttribute('href').slice(1)); });
    });
  }
})();
