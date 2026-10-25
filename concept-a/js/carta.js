/* Caffè Mamma · Concept A · "La Carta"
   Plain JS. Everything here enhances a page that is already complete without it. */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var OPENTABLE = 'https://www.opentable.co.uk/r/caffe-mamma-ristorante-london';
  var TZ = 'Europe/London';

  window.__cartaInked = true; // tells the head failsafe that we're running
  var gsap = window.gsap;
  var motionOK = root.classList.contains('motion') && !!gsap;
  if (!gsap) root.classList.remove('motion');

  /* ------------------------------------------------------------------
     Today's date, in Italian, for the running notes
     ------------------------------------------------------------------ */
  function londonParts(d) {
    var out = {};
    try {
      new Intl.DateTimeFormat('en-GB', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
        .formatToParts(d).forEach(function (p) { out[p.type] = p.value; });
    } catch (e) {
      out = { year: String(d.getFullYear()), month: ('0' + (d.getMonth() + 1)).slice(-2), day: ('0' + d.getDate()).slice(-2), hour: String(d.getHours()), minute: String(d.getMinutes()) };
    }
    return out;
  }
  var now = new Date();
  var lp = londonParts(now);
  var todayISO = lp.year + '-' + lp.month + '-' + lp.day;
  var nowMinutes = parseInt(lp.hour, 10) * 60 + parseInt(lp.minute, 10);

  (function setDates() {
    var it;
    try { it = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long', timeZone: TZ }).format(now); }
    catch (e) { return; }
    $$('[data-today]').forEach(function (el) { el.textContent = it; });
    $$('[data-today-dateline]').forEach(function (el) { el.textContent = ' · ' + it; });
  })();

  /* ------------------------------------------------------------------
     Mark the menu: a red pen ellipse round each matching dish
     ------------------------------------------------------------------ */
  var FILTERS = [
    { id: 'v', label: 'Vegetarian' },
    { id: 'fish', label: 'Fish' },
    { id: 'kids', label: 'For the kids' },
    { id: 'lunch', label: 'Lunch deal' }
  ];
  var SVGNS = 'http://www.w3.org/2000/svg';

  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {
    return function () {
      seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // A loop of pen: starts upper left, goes round once and overshoots,
  // with a slight wobble and spiral so the ends never meet neatly.
  function penPath(w, h, r) {
    var cx = w / 2, cy = h / 2, rx = w / 2 - 2, ry = h / 2 - 2;
    var start = -Math.PI * 0.82 + (r() - 0.5) * 0.7;
    var sweep = Math.PI * 2 + 0.3 + r() * 0.4;
    var tilt = (r() - 0.5) * 0.07;
    var p1 = r() * 6.28, p2 = r() * 6.28;
    var a1 = 0.025 + r() * 0.03, a2 = 0.015 + r() * 0.02;
    var N = 30, pts = [];
    for (var i = 0; i <= N; i++) {
      var t = i / N, th = start + sweep * t;
      var k = (0.955 + 0.085 * t) * (1 + a1 * Math.sin(2 * th + p1) + a2 * Math.sin(3 * th + p2));
      var x = rx * k * Math.cos(th), y = ry * k * Math.sin(th);
      pts.push([cx + x * Math.cos(tilt) - y * Math.sin(tilt), cy + x * Math.sin(tilt) + y * Math.cos(tilt)]);
    }
    var d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
    for (var j = 0; j < pts.length - 1; j++) {
      var p0 = pts[j - 1] || pts[j], a = pts[j], b = pts[j + 1], c = pts[j + 2] || b;
      d += 'C' + (a[0] + (b[0] - p0[0]) / 6).toFixed(1) + ' ' + (a[1] + (b[1] - p0[1]) / 6).toFixed(1) + ' ' +
        (b[0] - (c[0] - a[0]) / 6).toFixed(1) + ' ' + (b[1] - (c[1] - a[1]) / 6).toFixed(1) + ' ' +
        b[0].toFixed(1) + ' ' + b[1].toFixed(1);
    }
    return d;
  }

  function drawPen(item, animateIndex) {
    var target = $('.dish__name', item) || $('.mark-target', item) || item;
    var ir = item.getBoundingClientRect();
    var tr = target.getBoundingClientRect();
    if (!tr.width) return null;
    var px = 10 + Math.min(tr.width * 0.04, 8), py = 7;
    var w = tr.width + px * 2, h = tr.height + py * 2;
    var svg = doc.createElementNS(SVGNS, 'svg');
    svg.setAttribute('class', 'pen');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('width', w.toFixed(1));
    svg.setAttribute('height', h.toFixed(1));
    svg.setAttribute('viewBox', '0 0 ' + w.toFixed(1) + ' ' + h.toFixed(1));
    svg.style.left = (tr.left - ir.left - px).toFixed(1) + 'px';
    svg.style.top = (tr.top - ir.top - py).toFixed(1) + 'px';
    var path = doc.createElementNS(SVGNS, 'path');
    path.setAttribute('d', penPath(w, h, rng(hash(target.textContent))));
    path.setAttribute('pathLength', '1');
    svg.appendChild(path);
    item.appendChild(svg);
    if (typeof animateIndex === 'number' && motionOK) {
      path.style.strokeDasharray = '1';
      gsap.fromTo(path, { strokeDashoffset: 1 }, {
        strokeDashoffset: 0, duration: 0.5, ease: 'power2.out',
        delay: Math.min(animateIndex, 14) * 0.035
      });
    }
    return svg;
  }

  function setupMarker(box) {
    var scope = $(box.getAttribute('data-scope'));
    var btnHost = $('[data-marker-btns]', box);
    var status = $('.marker__status', box);
    if (!scope || !btnHost) return;
    var items = $$('[data-tags]', scope);
    var active = null;

    FILTERS.forEach(function (f) {
      var b = doc.createElement('button');
      b.type = 'button';
      b.className = 'marker__btn';
      b.setAttribute('aria-pressed', 'false');
      b.setAttribute('aria-controls', scope.id);
      b.dataset.filter = f.id;
      b.innerHTML = '<svg class="marker__tick" viewBox="0 0 16 16" aria-hidden="true">' +
        '<path d="M2.6 8.4C2.4 4.9 5 2.6 8.2 2.7s5.3 2.5 5.1 5.5-2.7 5.1-5.6 5c-3-.1-5-2.1-5.1-4.8"/>' +
        '<path class="on" d="M5.2 8.3l2 2.1 3.8-4.6"/></svg>' + f.label;
      b.addEventListener('click', function () { apply(active === f.id ? null : f.id, true); });
      btnHost.appendChild(b);
    });

    function clearPens() { $$('.pen', scope).forEach(function (s) { s.parentNode.removeChild(s); }); }

    function apply(id, animate) {
      active = id;
      clearPens();
      $$('.marker__btn', btnHost).forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.filter === id)); });
      scope.classList.toggle('is-marking', !!id);
      var dishes = 0, slips = [], n = 0;
      items.forEach(function (it) {
        var on = !!id && (' ' + it.getAttribute('data-tags') + ' ').indexOf(' ' + id + ' ') > -1;
        it.classList.toggle('is-marked', on);
        if (!on) return;
        drawPen(it, animate ? n : undefined);
        n++;
        if (it.getAttribute('data-kind') === 'slip') slips.push(it.getAttribute('data-name') || 'a set menu');
        else dishes++;
      });
      if (status && animate === true) status.textContent = id ? message(dishes, slips) : 'Marks cleared.';
    }

    function message(d, slips) {
      var parts = [];
      if (d) parts.push(d + (d === 1 ? ' dish' : ' dishes'));
      parts = parts.concat(slips);
      if (!parts.length) return 'Nothing marked here. Try the full menu.';
      var s = parts.join(' and ') + ' marked.';
      return s.charAt(0).toUpperCase() + s.slice(1);
    }

    // redraw (no animation) when the layout moves
    var t;
    function redraw() { clearTimeout(t); t = setTimeout(function () { if (active) apply(active, false); }, 120); }
    window.addEventListener('resize', redraw);
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(redraw);

    // on small screens the controls ride in a sticky bar at the top of the menu
    var mobileHost = box.getAttribute('data-mobile-host') && $(box.getAttribute('data-mobile-host'));
    if (mobileHost && window.matchMedia) {
      var home = box.parentNode, anchor = box.nextSibling;
      var mq = window.matchMedia('(max-width: 1023.98px)');
      var place = function () {
        if (mq.matches) { if (box.parentNode !== mobileHost) mobileHost.appendChild(box); }
        else if (box.parentNode !== home) home.insertBefore(box, anchor);
        redraw();
      };
      place();
      if (mq.addEventListener) mq.addEventListener('change', place); else if (mq.addListener) mq.addListener(place);
    }
  }
  $$('[data-marker]').forEach(setupMarker);

  /* ------------------------------------------------------------------
     Booking: party, date and time, then hand off to OpenTable
     ------------------------------------------------------------------ */
  (function booking() {
    var form = $('#book-form');
    if (!form) return;
    var party = $('#b-party', form), date = $('#b-date', form), time = $('#b-time', form);
    var summary = $('#b-summary', form), go = $('#b-go', form), call = $('#b-call', form), alt = $('#b-alt', form);

    function timeLabel(mins) {
      var h = Math.floor(mins / 60), m = mins % 60;
      if (h === 12 && m === 0) return '12 noon';
      var hh = h > 12 ? h - 12 : h;
      return hh + (m ? '.' + ('0' + m).slice(-2) : '') + 'pm';
    }
    for (var mins = 12 * 60; mins <= 22 * 60; mins += 30) {
      var o = doc.createElement('option');
      o.value = ('0' + Math.floor(mins / 60)).slice(-2) + ':' + ('0' + (mins % 60)).slice(-2);
      o.textContent = timeLabel(mins);
      if (mins === 19 * 60 + 30) o.selected = true;
      time.appendChild(o);
    }
    date.value = todayISO;
    date.min = todayISO;

    function dateLabel(iso) {
      var p = iso.split('-');
      var d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2], 12));
      try { return new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(d); }
      catch (e) { return iso; }
    }
    function slotMinutes() { var p = time.value.split(':'); return +p[0] * 60 + +p[1]; }

    function state() {
      var big = party.value === '9';
      var iso = date.value;
      var valid = /^\d{4}-\d{2}-\d{2}$/.test(iso) && iso >= todayISO;
      var gone = valid && iso === todayISO && slotMinutes() <= nowMinutes;
      return { big: big, valid: valid, gone: gone, iso: iso };
    }
    function describe() {
      return 'Table for ' + party.value + ', ' + dateLabel(date.value) + ', ' + timeLabel(slotMinutes());
    }
    function update() {
      var s = state();
      go.hidden = s.big; call.hidden = !s.big; alt.hidden = s.big;
      go.disabled = !s.valid || s.gone;
      if (s.big) summary.innerHTML = 'For nine or more, please call us on <a class="link" href="tel:+442089488330">020 8948 8330</a> and we’ll sort the table with you.';
      else if (!s.valid) summary.textContent = 'Pick a date from today onwards.';
      else if (s.gone) summary.textContent = 'That time has already gone today. Pick a later time, or another day.';
      else summary.innerHTML = '<strong>' + describe() + '</strong>: we’ll take you to OpenTable to confirm.';
    }
    [party, date, time].forEach(function (el) { el.addEventListener('change', update); el.addEventListener('input', update); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var s = state();
      if (s.big || !s.valid || s.gone) { update(); return; }
      // window.open returns null when a pop-up is blocked; then offer the link instead of claiming it opened
      var win = null;
      try { win = window.open(OPENTABLE, '_blank'); } catch (err) { win = null; }
      if (win) { try { win.opener = null; } catch (err) {} }
      summary.innerHTML = (win ? 'We’ve opened OpenTable in a new tab. Choose <strong>' + describe() + '</strong> there; ' :
        '<strong>' + describe() + '</strong>: continue on OpenTable to pick it. ') +
        'Nothing is booked until OpenTable confirms it. ' +
        '<a class="link" href="' + OPENTABLE + '" target="_blank" rel="noopener">' + (win ? 'Open OpenTable again' : 'Continue to OpenTable') + '</a>';
    });

    form.hidden = false;
    update();
  })();

  /* ------------------------------------------------------------------
     Copy the address
     ------------------------------------------------------------------ */
  (function copyAddress() {
    var host = $('[data-copy-host]');
    var status = $('[data-copy-status]');
    if (!host || !navigator.clipboard || !window.isSecureContext) return;
    var b = doc.createElement('button');
    b.type = 'button';
    b.className = 'btn';
    b.textContent = 'Copy address';
    b.addEventListener('click', function () {
      navigator.clipboard.writeText('Caffè Mamma Ristorante, 110 Kew Road, Richmond TW9 2PQ').then(function () {
        if (status) status.textContent = 'Address copied.';
      }, function () {
        if (status) status.textContent = 'Couldn’t copy. The address is above.';
      });
    });
    host.appendChild(b);
  })();

  /* ------------------------------------------------------------------
     Course index: show where you are on the card
     ------------------------------------------------------------------ */
  (function indexSpy() {
    var links = $$('.index__list a');
    if (!links.length || !('IntersectionObserver' in window)) return;
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.removeAttribute('aria-current'); });
        var a = byId[en.target.id];
        if (a) a.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-25% 0px -65% 0px' });
    $$('.course').forEach(function (s) { io.observe(s); });
  })();

  /* ------------------------------------------------------------------
     Motion: ink and paper only. Strokes draw, rules extend, lines set in.
     ------------------------------------------------------------------ */
  (function motion() {
    if (!motionOK) return;
    var ease = 'power2.out';

    // hero: lines of type set in, then the washing line draws itself once
    var sets = $$('.js-set');
    if (sets.length) gsap.fromTo(sets, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5, ease: ease, stagger: 0.08, clearProps: 'transform' });

    $$('[data-draw]').forEach(function (svg) {
      var tl = gsap.timeline({ delay: 0.3 });
      var line = $('.ink-line', svg);
      if (line) tl.to(line, { strokeDashoffset: 0, duration: 0.6, ease: ease });
      var loose = $$(':scope > path:not(.ink-line)', svg);
      if (loose.length) tl.to(loose, { strokeDashoffset: 0, duration: 0.3, ease: ease }, '<0.2');
      $$('g', svg).forEach(function (g, i) {
        tl.to($$('path', g), { strokeDashoffset: 0, duration: 0.5, ease: ease }, i === 0 ? '-=0.25' : '-=0.36');
      });
    });

    var ST = window.ScrollTrigger;
    if (!ST) return;
    gsap.registerPlugin(ST);

    // double rules extend from the left as each section arrives
    $$('[data-rule]').forEach(function (el) {
      gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: ease, scrollTrigger: { trigger: el, start: 'top 96%', once: true } });
    });
    // the story thread
    $$('[data-thread]').forEach(function (el) {
      gsap.fromTo(el, { scaleY: 0 }, { scaleY: 1, duration: 0.6, ease: ease, scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
    });
    // the route sketch draws once
    $$('[data-draw-scroll]').forEach(function (svg) {
      var paths = $$('path', svg);
      gsap.set(paths, { strokeDasharray: '1' });
      gsap.fromTo(paths, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.6, ease: ease, stagger: 0.1, scrollTrigger: { trigger: svg, start: 'top 85%', once: true } });
    });
    // text sets in on larger screens only, so nothing lags behind a thumb-scroll on a phone
    if (window.matchMedia('(min-width: 768px)').matches) {
      $$('[data-reveal]').forEach(function (el) {
        gsap.fromTo(el, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.45, ease: ease, clearProps: 'transform', scrollTrigger: { trigger: el, start: 'top 94%', once: true } });
      });
    }
  })();
})();
