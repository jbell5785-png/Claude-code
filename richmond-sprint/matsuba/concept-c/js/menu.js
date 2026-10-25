/*
 * Matsuba Concept C: "Open the box".
 * Progressive enhancement over a plain long menu. Without this script every
 * section is a normal #anchor with its dishes visible.
 *
 * With it:
 *  - each course heading becomes a real <button aria-expanded aria-controls>;
 *  - selecting one expands that compartment to fill the box (others step aside);
 *  - "Back to the box" (top bar, bottom nav, or Escape) returns and restores focus;
 *  - #hash deep links open the right compartment, including sub-headings;
 *  - the lid (CSS animation, motion-allowed only) lifts once per session.
 */
(function () {
  'use strict';
  var root = document.documentElement;

  try {
    init();
  } catch (err) {
    // Fall back to the plain long menu rather than leaving anything hidden.
    root.classList.remove('js', 'lid-on');
    if (window.console) console.warn('Box mode disabled:', err);
  }

  function init() {
    var grid = document.getElementById('box-grid');
    if (!grid) return;
    var courses = Array.prototype.slice.call(grid.querySelectorAll('.course'));
    var reduceMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
    var openCourse = null;
    var baseTitle = document.title;

    function icon(id) {
      return '<svg class="ico" aria-hidden="true" focusable="false"><use href="#' + id + '"/></svg>';
    }

    courses.forEach(function (course, i) {
      var head = course.querySelector('.course__head');
      var title = course.querySelector('.course__title');
      var panel = course.querySelector('.course__body');
      var name = title.textContent.trim();
      course._name = name;

      // Heading text moves into a real button (accordion pattern: h2 > button).
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'course__toggle';
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', panel.id);
      while (title.firstChild) btn.appendChild(title.firstChild);
      title.appendChild(btn);
      course._btn = btn;

      var cue = document.createElement('span');
      cue.className = 'course__open-cue';
      cue.setAttribute('aria-hidden', 'true');
      cue.innerHTML = 'Open ' + icon('i-arrow');
      head.appendChild(cue);

      panel.setAttribute('tabindex', '-1');
      panel.setAttribute('role', 'region');
      panel.setAttribute('aria-labelledby', title.id);

      // Sticky top bar (only displayed while open).
      var bar = document.createElement('div');
      bar.className = 'course__bar';
      bar.innerHTML = '<button type="button" class="btn btn--sm btn-back">' + icon('i-back') + ' Back to the box</button>' +
        '<span class="course__bar-title" aria-hidden="true"></span>';
      bar.querySelector('.course__bar-title').textContent = name;
      course.insertBefore(bar, head);

      // Bottom nav: back, plus the next compartment.
      var nav = document.createElement('div');
      nav.className = 'course__nav';
      var next = courses[(i + 1) % courses.length];
      nav.innerHTML = '<button type="button" class="btn btn--ghost btn--sm btn-back">' + icon('i-back') + ' Back to the box</button>' +
        '<button type="button" class="btn btn--nori btn--sm" data-next>Next: <span></span> ' + icon('i-arrow') + '</button>';
      panel.appendChild(nav);
      course._next = next;

      btn.addEventListener('click', function () {
        if (openCourse === course) close({ focus: true });
        else open(course, { focus: true });
      });
      Array.prototype.forEach.call(course.querySelectorAll('.btn-back'), function (b) {
        b.addEventListener('click', function () { close({ focus: true }); });
      });
      nav.querySelector('[data-next]').addEventListener('click', function () {
        open(course._next, { focus: true });
      });
    });

    // Fill "Next:" labels once every course has its name.
    courses.forEach(function (c) {
      c.querySelector('[data-next] span').textContent = c._next._name;
    });

    function replay(el, cls) {
      if (reduceMotion.matches) return;
      el.classList.remove(cls);
      void el.offsetWidth;
      el.classList.add(cls);
      el.addEventListener('animationend', function done(e) {
        if (e.target !== el) return;
        el.classList.remove(cls);
        el.removeEventListener('animationend', done);
      });
    }

    function setHash(id) {
      if (!window.history || !history.replaceState) return;
      var url = location.pathname + location.search + (id ? '#' + id : '');
      history.replaceState(null, '', url);
    }

    function open(course, opts) {
      opts = opts || {};
      if (openCourse && openCourse !== course) setClosed(openCourse);
      openCourse = course;
      course.classList.add('is-open');
      grid.classList.add('has-open');
      course._btn.setAttribute('aria-expanded', 'true');
      replay(course, 'is-opening');
      if (opts.updateHash !== false) setHash(course.id);
      document.title = course._name + ' · ' + baseTitle;

      var target = opts.target && opts.target !== course ? opts.target : course;
      target.scrollIntoView({ block: 'start', behavior: (reduceMotion.matches || opts.instant) ? 'auto' : 'smooth' });
      if (opts.focus) {
        var panel = course.querySelector('.course__body');
        try { panel.focus({ preventScroll: true }); } catch (e) { panel.focus(); }
      }
    }

    function setClosed(course) {
      course.classList.remove('is-open', 'is-opening');
      course._btn.setAttribute('aria-expanded', 'false');
    }

    function close(opts) {
      opts = opts || {};
      var course = openCourse;
      if (!course) return;
      setClosed(course);
      openCourse = null;
      grid.classList.remove('has-open');
      if (opts.updateHash !== false) setHash('');
      document.title = baseTitle;
      replay(course, 'is-returning');
      // Bring the box back into view around the compartment we came from.
      var rect = course.getBoundingClientRect();
      if (rect.top < 80 || rect.bottom > window.innerHeight) {
        course.scrollIntoView({ block: 'center', behavior: 'auto' });
      }
      if (opts.focus) {
        try { course._btn.focus({ preventScroll: true }); } catch (e) { course._btn.focus(); }
      }
    }

    function fromHash(opts) {
      var id = decodeURIComponent(location.hash.replace(/^#/, ''));
      if (!id) { if (openCourse) close({ updateHash: false }); return; }
      var el = document.getElementById(id);
      if (!el || !grid.contains(el)) return;
      var course = el.classList.contains('course') ? el : el.closest('.course');
      // On arrival, don't steal focus; on in-page hash changes, move it into the panel.
      if (course) open(course, { target: el, focus: !(opts && opts.arrival), updateHash: false, instant: opts && opts.instant });
    }

    document.addEventListener('keydown', function (e) {
      var ae = document.activeElement;
      if (e.key === 'Escape' && openCourse && (openCourse.contains(ae) || !ae || ae === document.body)) {
        close({ focus: true });
      }
    });
    window.addEventListener('hashchange', function () { fromHash(); });

    // Deep link on arrival.
    if (location.hash) fromHash({ instant: true, arrival: true });

    // The lid: CSS lifts it once (motion allowed only); JS tidies up and lets a click or focus hurry it.
    var lid = grid.querySelector('.lid');
    if (lid && root.classList.contains('lid-on')) {
      var finished = false;
      var finish = function () {
        if (finished) return;
        finished = true;
        root.classList.remove('lid-on');
        try { window.sessionStorage.setItem('matsuba-lid', '1'); } catch (e) {}
      };
      var hurry = function () { lid.classList.add('is-lifting'); };
      lid.addEventListener('animationend', finish);
      lid.addEventListener('click', hurry);
      grid.addEventListener('focusin', hurry);
      window.setTimeout(finish, 2400);
    }
  }
})();
