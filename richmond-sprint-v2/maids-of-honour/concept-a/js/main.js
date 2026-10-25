/* The Original Maids of Honour, concept A: behaviour.
   Everything here is enhancement. With no JS the pages are complete: the sign
   is static and shows the published times. */
(function () {
  'use strict';
  var doc = document.documentElement;
  var S = window.MaidsSign;
  var reduceMQ = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var motion = !reduceMQ.matches;
  if (motion) doc.classList.add('motion');

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ------------------------------------------------------------------
     Gold leaf catching the light: move a highlight band along an SVG
     gradient (userSpaceOnUse) so it passes across every gilded letter. */
  function sweep(grad, from, to, ms, done) {
    if (!grad) return;
    if (!motion) { grad.setAttribute('gradientTransform', 'translate(-3000 0)'); return; }
    var t0 = null;
    function step(t) {
      if (t0 === null) t0 = t;
      var k = Math.min(1, (t - t0) / ms);
      var e = 1 - Math.pow(1 - k, 3);
      grad.setAttribute('gradientTransform', 'translate(' + (from + (to - from) * e).toFixed(1) + ' 0)');
      if (k < 1) requestAnimationFrame(step); else if (done) done();
    }
    requestAnimationFrame(step);
  }

  /* ------------------------------------------------------------------
     Hero: the fascia, the TEAS gable and "Newens" catch the light.
     A slow morning sweep on load, then the light follows the pointer. */
  var hero = $('[data-hero] .frontage');
  var leaf = document.getElementById('leaf');
  if (hero && leaf) {
    if (motion) {
      setTimeout(function () { sweep(leaf, -400, 1900, 2600); }, 450);
      var target = null, cur = -400, raf = 0, following = false;
      var tick = function () {
        if (target === null) { raf = 0; return; }
        cur += (target - cur) * 0.12;
        leaf.setAttribute('gradientTransform', 'translate(' + cur.toFixed(1) + ' 0)');
        if (Math.abs(target - cur) > 0.5) raf = requestAnimationFrame(tick);
        else raf = 0;
      };
      hero.addEventListener('pointermove', function (e) {
        if (e.pointerType === 'touch') return;
        var m = hero.getScreenCTM();
        if (!m) return;
        var pt = hero.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
        var p = pt.matrixTransform(m.inverse());
        if (!following) { following = true; cur = p.x - 200; }
        target = p.x;
        if (!raf) raf = requestAnimationFrame(tick);
      });
      hero.addEventListener('pointerleave', function () {
        target = 2200; following = false;
        if (!raf) raf = requestAnimationFrame(tick);
      });
    }
  }

  /* ------------------------------------------------------------------
     The side-wall sign */
  var signEl = $('#side-sign');
  var sleaf = document.getElementById('sleaf');
  var statusClock = $('[data-sign-clock]');
  var statusSummary = $('[data-sign-summary]');
  var todayNow = $('[data-today-now]');
  var form = $('[data-clock]');
  var daySel = $('[data-clock-day]');
  var timeIn = $('[data-clock-time]');
  var out = $('[data-clock-out]');
  var nowBtn = $('[data-clock-now]');
  var menuIndex = $$('[data-service]');

  var override = null; // { day, minutes } when the visitor turns the clock
  var lastLit = undefined;
  var lastSummary = '';
  var glintTimer = 0;

  // ?at=thu-14:30 or ?at=14:30 (today) for demonstration
  (function readParam() {
    var m = /[?&]at=([a-z]{3}-)?(\d{1,2}):(\d{2})/i.exec(location.search);
    if (!m) return;
    var days = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
    var day = m[1] ? days[m[1].slice(0, 3).toLowerCase()] : S && S.londonClock(new Date()).day;
    if (day === undefined) return;
    override = { day: day, minutes: (+m[2]) * 60 + (+m[3]) };
  })();

  function reading() {
    if (!S) return null;
    return override ? S.readClock(override.day, override.minutes) : S.read(new Date());
  }

  function glint() {
    sweep(sleaf, -300, 960, 1900);
  }

  function render() {
    var r = reading();
    if (!r) return;

    doc.classList.toggle('is-open', r.open);
    doc.classList.toggle('is-closed', !r.open);

    if (signEl) {
      r.lines.forEach(function (l) {
        var g = signEl.querySelector('.sl[data-line="' + l.id + '"]');
        if (!g) return;
        g.setAttribute('data-state', l.state);
        var note = g.querySelector('.sl-note');
        if (note && note.textContent !== l.note) note.textContent = l.note;
        var a = g.querySelector('.sl-menu');
        if (a) {
          var base = a.getAttribute('data-label') || a.getAttribute('aria-label');
          if (!a.getAttribute('data-label')) a.setAttribute('data-label', base);
          a.setAttribute('aria-label', base + (l.state === 'lit' ? ' (serving now)' : l.state === 'on' ? ' (also serving now)' : ''));
        }
      });
    }

    // the miniature sign in the frontage drawing follows suit
    $$('.mini-lit').forEach(function (el) { el.setAttribute('opacity', el.getAttribute('data-line') === r.lit ? '1' : '0'); });
    $$('.mini-line').forEach(function (el) { el.setAttribute('fill', el.getAttribute('data-line') === r.lit ? '#D9A845' : '#1C1A17'); });

    // panels beside the sign
    $$('[data-panel]').forEach(function (p) {
      var id = p.getAttribute('data-panel');
      var l = r.lines.filter(function (x) { return x.id === id; })[0];
      p.classList.toggle('is-lit', !!l && l.state === 'lit');
      var badge = p.querySelector('.line__state');
      if (badge) {
        var txt = l && l.state === 'lit' ? 'Serving now' : l && l.state === 'on' ? 'Also now' : '';
        badge.textContent = txt || 'Serving now';
        badge.style.visibility = txt ? 'visible' : 'hidden';
      }
    });

    // menu page index: the service of the moment
    menuIndex.forEach(function (a) { a.classList.toggle('is-lit', a.getAttribute('data-service') === r.lit); });

    var where = override ? 'At ' + r.time + ' on ' + r.dayName : r.time + ' in Kew, ' + r.dayName;
    if (statusClock) statusClock.textContent = where;
    if (statusSummary && r.summary !== lastSummary) {
      statusSummary.textContent = r.summary;
      lastSummary = r.summary;
    }

    if (todayNow) {
      var lit = r.lines.filter(function (l) { return l.state === 'lit'; })[0];
      todayNow.innerHTML = '';
      if (lit) {
        var s = document.createElement('strong'); s.textContent = lit.name;
        todayNow.appendChild(s);
        todayNow.appendChild(document.createTextNode(' · ' + lit.note));
      } else {
        todayNow.textContent = r.summary;
      }
    }

    if (r.lit !== lastLit) {
      lastLit = r.lit;
      if (r.lit) setTimeout(glint, 650);
    }
  }

  function syncForm() {
    if (!form) return;
    var r = reading();
    if (!r) return;
    if (!override) {
      daySel.value = 'now';
      var m = Math.max(480, Math.min(1140, Math.round(r.minutes / 15) * 15));
      timeIn.value = String(m);
      out.textContent = 'live';
    } else {
      daySel.value = String(override.day);
      timeIn.value = String(override.minutes);
      out.textContent = S.hhmm(override.minutes);
    }
    timeIn.setAttribute('aria-valuetext', S.hhmm(+timeIn.value) + (override ? '' : ', live'));
  }

  if (signEl && S) {
    if (form) {
      form.hidden = false;
      form.addEventListener('submit', function (e) { e.preventDefault(); });
      var fromForm = function () {
        var d = daySel.value === 'now' ? S.londonClock(new Date()).day : +daySel.value;
        override = { day: d, minutes: +timeIn.value };
        if (daySel.value === 'now') daySel.value = String(d);
        render(); syncForm();
      };
      daySel.addEventListener('change', function () {
        if (daySel.value === 'now') { override = null; render(); syncForm(); return; }
        fromForm();
      });
      timeIn.addEventListener('input', fromForm);
      nowBtn.addEventListener('click', function () { override = null; render(); syncForm(); });
    }
    render(); syncForm();
    setInterval(function () { if (!override) { render(); syncForm(); } }, 30000);
    if (motion) {
      glintTimer = setInterval(function () { if (lastLit && !document.hidden) glint(); }, 9000);
    }
  } else if (S) {
    render(); // menu page: index lighting and lantern
    setInterval(render, 30000);
  }

  /* ------------------------------------------------------------------
     Gilded headings glint once as they come into view */
  if (motion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-glint'); io.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    $$('.gilt').forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------
     Menu page: mark the section being read in the index */
  var idxLinks = $$('.mindex a[href^="#"]');
  if (idxLinks.length && 'IntersectionObserver' in window) {
    var map = {};
    idxLinks.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var current = null;
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          if (current) current.removeAttribute('aria-current');
          current = map[en.target.id];
          if (current) {
            current.setAttribute('aria-current', 'true');
            var bar = current.closest('ul');
            if (bar && bar.scrollWidth > bar.clientWidth) {
              bar.scrollTo({ left: current.offsetLeft - 16, behavior: motion ? 'smooth' : 'auto' });
            }
          }
        }
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
  }
})();
