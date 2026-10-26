/* MATSUBA — Concept C, "Aburi"
   One torch, passing along the words the menu itself calls aburi or seared.
   No dependencies. Everything here is enhancement: without it, every seared
   name is already shown in its finished, caramelised state. */
(function () {
  'use strict';

  var root = document.documentElement;
  var motionOK = root.classList.contains('js-motion');
  var searOK = root.classList.contains('sear-on');
  var hoverOK = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------------- sticky bar hairline ---------------- */
  var bar = document.querySelector('.bar');
  if (bar) {
    var onScroll = function () { bar.classList.toggle('is-stuck', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------------- the sear ---------------- */
  var FLAME = '<svg viewBox="0 0 24 60" focusable="false"><use href="#flame"/></svg>';
  var torchFreeAt = 0;          // one torch: each sear starts as the last one is nearly done
  var all = Array.prototype.slice.call(document.querySelectorAll('[data-sear]'));

  function prep(el) {
    if (el._prepped) return;
    el._prepped = true;
    var f = document.createElement('span');
    f.className = 'flame';
    f.setAttribute('aria-hidden', 'true');
    f.innerHTML = FLAME;
    el.appendChild(f);
    var w = el.getBoundingClientRect().width || 120;
    var dur = el.hasAttribute('data-hero') ? Math.min(1700, Math.max(1050, w * 3.2)) : Math.min(1500, Math.max(620, w * 5.5));
    el._dur = Math.round(dur);
    el.style.setProperty('--dur', el._dur + 'ms');
  }

  function run(el) {
    if (el._busy) return;
    el._busy = true;
    el.classList.remove('is-cooling');
    // make sure the raw state has been styled before the torch starts
    void el.offsetWidth;
    el.classList.add('is-searing', 'is-seared');
    window.setTimeout(function () {
      el.classList.remove('is-searing');
      el.classList.add('is-cooling');
      el._busy = false;
    }, el._dur + 60);
  }

  function schedule(el, gap) {
    prep(el);
    var now = performance.now();
    var start = Math.max(now, torchFreeAt);
    torchFreeAt = start + el._dur * (gap || 0.62);
    window.setTimeout(function () { run(el); }, start - now);
  }

  function reset(el) {
    el.classList.remove('is-seared', 'is-searing', 'is-cooling');
    el._busy = false;
  }

  function resear(list) {
    list.forEach(function (el) { if (!el._busy) reset(el); });
    torchFreeAt = 0;
    list.forEach(function (el) { schedule(el); });
  }

  if (searOK && all.length) {
    var heroWords = all.filter(function (el) { return el.hasAttribute('data-hero'); });
    var rest = all.filter(function (el) { return !el.hasAttribute('data-hero'); });
    rest.forEach(prep);

    // the hero: once the type has loaded, so the flame lands on real letterforms
    if (heroWords.length) {
      var started = false;
      var go = function () {
        if (started) return;
        started = true;
        heroWords.forEach(prep);
        window.setTimeout(function () { heroWords.forEach(function (el) { schedule(el, 1.08); }); }, 350);
      };
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(go);
        window.setTimeout(go, 1400);
      } else { go(); }
    }

    // everything else sears as it scrolls into view, in reading order
    var io = new IntersectionObserver(function (entries) {
      entries
        .filter(function (e) { return e.isIntersecting; })
        .map(function (e) { return e.target; })
        .sort(function (a, b) { return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1; })
        .forEach(function (el) { io.unobserve(el); if (!el.classList.contains('is-seared')) schedule(el); });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.9 });
    rest.forEach(function (el) { io.observe(el); });

    // hover: run the torch along it again
    if (hoverOK) {
      all.forEach(function (el) {
        var host = el.closest('.dish') || el.closest('h1') || el;
        host.addEventListener('pointerenter', function () {
          if (el._busy || !el.classList.contains('is-seared')) return;
          var group = host.tagName === 'H1' ? heroWords : [el];
          resear(group);
        });
      });
    }

    // "Sear it again": a button beside each seared group, so the replay never depends on hover
    Array.prototype.forEach.call(document.querySelectorAll('[data-resear]'), function (btn) {
      var scope = btn.closest('section') || document;
      var group = all.filter(function (el) { return scope.contains(el); });
      if (group.length) btn.addEventListener('click', function () { resear(group); });
    });
  }

  /* ---------------- reveals, rules, the candle, the case light ---------------- */
  if (motionOK && 'IntersectionObserver' in window) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in', 'is-lit');
        revealIO.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.25 });
    document.querySelectorAll('.rise, .will-draw, .candle, .window__art').forEach(function (el) { revealIO.observe(el); });
  }

  /* ---------------- menu page ---------------- */
  var filter = document.querySelector('[data-aburi-filter]');
  if (filter) {
    var status = document.getElementById('aburi-status');
    var dishes = Array.prototype.slice.call(document.querySelectorAll('.mbody .dish'));
    var seared = dishes.filter(function (d) { return d.hasAttribute('data-seared'); });
    var countEl = filter.querySelector('.filter__count');
    if (countEl) countEl.textContent = String(seared.length);

    var visibleCount = function () {
      return dishes.filter(function (d) { return d.offsetParent !== null || d.getClientRects().length; }).length;
    };
    var say = function (on) {
      var n = visibleCount();
      status.textContent = on
        ? 'Showing the ' + n + ' seared dishes.'
        : 'Showing the full menu, ' + n + ' dishes.';
    };

    var setFilter = function (on, fromLoad) {
      filter.setAttribute('aria-pressed', on ? 'true' : 'false');
      document.body.classList.toggle('only-aburi', on);
      var cn = document.querySelector('.courses__nav'); if (cn) cn.scrollLeft = 0;
      say(on);
      if (on && !fromLoad) {
        var top = document.querySelector('.mbody').getBoundingClientRect().top + window.scrollY - 140;
        if (window.scrollY > top) window.scrollTo({ top: top, behavior: motionOK ? 'smooth' : 'auto' });
      }
      if (on && searOK) {
        // the torch passes along each seared name now on screen
        window.setTimeout(function () {
          var inView = seared
            .map(function (d) { return d.querySelector('[data-sear]'); })
            .filter(function (s) {
              if (!s) return false;
              var r = s.getBoundingClientRect();
              return r.bottom > 0 && r.top < window.innerHeight;
            });
          resear(inView);
        }, fromLoad ? 500 : 250);
      }
    };

    filter.addEventListener('click', function () {
      setFilter(filter.getAttribute('aria-pressed') !== 'true');
    });
    if (/[?&]aburi\b/.test(window.location.search)) setFilter(true, true);
    else say(false);

    // course labels: mark the course you are reading
    var links = Array.prototype.slice.call(document.querySelectorAll('.courses__nav a'));
    var nav = document.querySelector('.courses__nav');
    if ('IntersectionObserver' in window && links.length) {
      var byId = {};
      links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
      var courseIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var a = byId[e.target.id];
          if (!a) return;
          links.forEach(function (l) { l.removeAttribute('aria-current'); });
          a.setAttribute('aria-current', 'true');
          var li = a.parentNode;
          if (nav.scrollWidth > nav.clientWidth) {
            nav.scrollTo({ left: li.offsetLeft - nav.clientWidth / 2 + li.offsetWidth / 2, behavior: motionOK ? 'smooth' : 'auto' });
          }
        });
      }, { rootMargin: '-35% 0px -60% 0px' });
      document.querySelectorAll('.course').forEach(function (s) { courseIO.observe(s); });
    }
  }
})();
