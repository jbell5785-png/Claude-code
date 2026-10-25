/* Chez Lindsay · Concept A · L'horloge du service
   The dial (desktop/tablet), the timeline strip (all widths), the day/time
   preview and the "next" markers on the weekly rituals. All times come from
   js/service.js, which works in Europe/London whatever the visitor's zone. */
(function () {
  'use strict';
  var S = window.ChezService;
  var root = document.getElementById('now');
  if (!S || !root) return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var whenEl = root.querySelector('[data-clock-when]');
  var titleEl = root.querySelector('[data-clock-title]');
  var detailEl = root.querySelector('[data-clock-detail]');
  var linksEl = root.querySelector('[data-clock-links]');
  var form = root.querySelector('[data-preview]');
  var range = root.querySelector('[data-preview-time]');
  var radios = root.querySelectorAll('input[name="day"]');
  var resetBtn = root.querySelector('[data-preview-reset]');
  var stripBands = root.querySelector('[data-strip-bands]');
  var stripHH = root.querySelector('[data-strip-hh]');
  var dialHost = root.querySelector('[data-dial]');

  var MENU_LABEL = {
    'galettes': 'The galettes',
    'set-lunch': 'Set lunch',
    'carte': 'La carte',
    'desserts': 'Desserts',
    'steak-night': 'Steak night',
    'vins': 'Happy hour'
  };
  var FR_ABBR = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];
  var STRIP_MIN = 660, STRIP_MAX = 1380; // 11am to 11pm

  /* ------------------------------------------------------------------ dial */
  var NS = 'http://www.w3.org/2000/svg';
  var C = 160;
  var dial = null, bandsG = null, hourHand = null, minHand = null, dayText = null, fermeG = null;
  var builtDay = -1;

  function svg(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k)) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function pt(r, deg) {
    var a = (deg - 90) * Math.PI / 180;
    return [C + r * Math.cos(a), C + r * Math.sin(a)];
  }
  function arcPath(r, a0, a1, reverse) {
    var s = pt(r, reverse ? a1 : a0), e = pt(r, reverse ? a0 : a1);
    var large = (a1 - a0) > 180 ? 1 : 0;
    return 'M' + s[0].toFixed(2) + ' ' + s[1].toFixed(2) + ' A' + r + ' ' + r + ' 0 ' + large + ' ' + (reverse ? 0 : 1) + ' ' + e[0].toFixed(2) + ' ' + e[1].toFixed(2);
  }
  function angleOf(m) { return (m - 720) / 720 * 360; } // the face runs noon to midnight

  function buildDial() {
    dial = svg('svg', { viewBox: '0 0 320 320', class: 'dial', focusable: 'false', 'aria-hidden': 'true' });
    svg('circle', { cx: C, cy: C, r: 157, class: 'dial__face' }, dial);
    svg('circle', { cx: C, cy: C, r: 157, class: 'dial__ring' }, dial);
    svg('circle', { cx: C, cy: C, r: 152.5, class: 'dial__ring dial__ring--soft' }, dial);
    var ticks = svg('g', {}, dial);
    for (var i = 0; i < 60; i++) {
      var hour = i % 5 === 0;
      var a = pt(hour ? 139 : 143, i * 6), b = pt(148, i * 6);
      svg('line', { x1: a[0].toFixed(2), y1: a[1].toFixed(2), x2: b[0].toFixed(2), y2: b[1].toFixed(2), class: 'dial__tick' + (hour ? ' dial__tick--h' : '') }, ticks);
    }
    for (var h = 0; h < 12; h++) {
      var p = pt(126, h * 30);
      var t = svg('text', { x: p[0].toFixed(2), y: p[1].toFixed(2), class: 'dial__num' + (h === 0 ? ' dial__num--noon' : '') }, dial);
      t.textContent = h === 0 ? '12' : String(h);
    }
    bandsG = svg('g', { class: 'dial__bands' }, dial);
    fermeG = svg('g', { class: 'dial__fermeg' }, dial);
    svg('rect', { x: 141, y: 199, width: 38, height: 18, class: 'dial__window' }, dial);
    dayText = svg('text', { x: C, y: 208.5, class: 'dial__day' }, dial);
    minHand = svg('path', { d: 'M158.5 184 L159.4 42 L160 34 L160.6 42 L161.5 184 Z', class: 'dial__hand dial__hand--m' }, dial);
    hourHand = svg('path', { d: 'M156.2 180 L158.7 96 L160 84 L161.3 96 L163.8 180 Z', class: 'dial__hand dial__hand--h' }, dial);
    svg('circle', { cx: C, cy: C, r: 6.5, class: 'dial__pivot' }, dial);
    svg('circle', { cx: C, cy: C, r: 2.2, class: 'dial__pivot-in' }, dial);
    dialHost.appendChild(dial);
  }

  function buildBands(dayIndex) {
    while (bandsG.firstChild) bandsG.removeChild(bandsG.firstChild);
    while (fermeG.firstChild) fermeG.removeChild(fermeG.firstChild);
    var segs = S.segmentsFor(dayIndex);
    var d = S.DAYS[dayIndex];
    if (!segs.length) {
      svg('circle', { cx: C, cy: C, r: 100, class: 'dial__closed' }, bandsG);
      var f1 = svg('text', { x: C, y: 124, class: 'dial__ferme' }, fermeG);
      f1.textContent = 'Fermé';
      var f2 = svg('text', { x: C, y: 252, class: 'dial__ferme', style: 'font-size:15px' }, fermeG);
      f2.textContent = 'le mardi';
      return;
    }
    segs.forEach(function (seg, i) {
      var a0 = angleOf(seg.start), a1 = angleOf(seg.end);
      if (seg.kind === 'happy') {
        svg('path', { d: arcPath(80, a0 + 1.5, a1 - 1.5), class: 'dial__hh', 'data-start': seg.start, 'data-end': seg.end }, bandsG);
        var hid = 'dial-hh-' + dayIndex;
        svg('path', { id: hid, d: arcPath(72, a0 - 20, a1 + 20, true), fill: 'none' }, bandsG);
        var ht = svg('text', { class: 'dial__hhlabel', 'data-start': seg.start, 'data-end': seg.end }, bandsG);
        var htp = svg('textPath', { href: '#' + hid, startOffset: '50%', 'text-anchor': 'middle' }, ht);
        htp.textContent = 'Happy hour';
        return;
      }
      svg('path', { d: arcPath(100, a0 + .7, a1 - .7), class: 'dial__band dial__band--' + seg.kind, 'data-start': seg.start, 'data-end': seg.end }, bandsG);
      var mid = (a0 + a1) / 2;
      var bottom = mid > 90 && mid < 270;
      var pid = 'dial-p-' + dayIndex + '-' + i;
      svg('path', { id: pid, d: arcPath(bottom ? 103.4 : 96.6, a0, a1, bottom), fill: 'none' }, bandsG);
      var tx = svg('text', { class: 'dial__label', 'data-start': seg.start, 'data-end': seg.end }, bandsG);
      var tp = svg('textPath', { href: '#' + pid, startOffset: '50%', 'text-anchor': 'middle' }, tx);
      tp.textContent = seg.label;
    });
    // Closed from closing time to midnight
    var c0 = angleOf(d.close), c1 = 360;
    svg('path', { d: arcPath(100, c0 + 1.2, c1 - 1.2), class: 'dial__closed' }, bandsG);
    var cid = 'dial-c-' + dayIndex;
    svg('path', { id: cid, d: arcPath(96.6, c0, c1), fill: 'none' }, bandsG);
    var ct = svg('text', { class: 'dial__label dial__label--closed' }, bandsG);
    var ctp = svg('textPath', { href: '#' + cid, startOffset: '50%', 'text-anchor': 'middle' }, ct);
    ctp.textContent = 'Fermé';
  }

  var handsSet = false;
  function setHands(minutes) {
    var hAngle = (minutes % 720) / 720 * 360;
    var mAngle = (minutes % 60) * 6;
    if (!handsSet && !reduceMotion) {
      // Ease once to the current time (600ms), then move without animation.
      handsSet = true;
      hourHand.style.transform = 'rotate(0deg)';
      minHand.style.transform = 'rotate(0deg)';
      dial.getBoundingClientRect();
      requestAnimationFrame(function () {
        dial.classList.add('is-easing');
        hourHand.style.transform = 'rotate(' + hAngle + 'deg)';
        minHand.style.transform = 'rotate(' + mAngle + 'deg)';
        setTimeout(function () { dial.classList.remove('is-easing'); }, 700);
      });
      return;
    }
    handsSet = true;
    hourHand.style.transform = 'rotate(' + hAngle + 'deg)';
    minHand.style.transform = 'rotate(' + mAngle + 'deg)';
  }

  function renderDial(s) {
    if (!dial) return;
    if (builtDay !== s.dayIndex) { buildBands(s.dayIndex); builtDay = s.dayIndex; }
    dayText.textContent = FR_ABBR[s.dayIndex];
    dial.classList.toggle('is-am', s.minutes < 720);
    var parts = bandsG.querySelectorAll('[data-start]');
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      var inSeg = s.open && s.minutes >= +p.getAttribute('data-start') && s.minutes < +p.getAttribute('data-end');
      p.classList.toggle('is-dim', !inSeg);
    }
    setHands(s.minutes);
  }

  /* ----------------------------------------------------------------- strip */
  var stripDay = -1;
  function pct(m) { return ((Math.min(Math.max(m, STRIP_MIN), STRIP_MAX) - STRIP_MIN) / (STRIP_MAX - STRIP_MIN) * 100).toFixed(3) + '%'; }
  function buildStrip(dayIndex) {
    stripBands.innerHTML = '';
    stripHH.innerHTML = '';
    var segs = S.segmentsFor(dayIndex);
    if (!segs.length) {
      var x = document.createElement('div');
      x.className = 'strip__seg strip__seg--closed';
      x.style.left = '0'; x.style.right = '0'; x.style.justifyContent = 'center';
      x.innerHTML = '<span style="color:#D9D4C2">Fermé le mardi</span>';
      stripBands.appendChild(x);
      return;
    }
    var names = { lunch: 'Lunch', brunch: 'Brunch', evening: 'La carte', steak: 'Steak night' };
    segs.forEach(function (seg) {
      if (seg.kind === 'happy') {
        var i = document.createElement('i');
        i.style.left = pct(seg.start);
        i.style.width = 'calc(' + pct(seg.end) + ' - ' + pct(seg.start) + ')';
        stripHH.appendChild(i);
        return;
      }
      var d = document.createElement('div');
      d.className = 'strip__seg strip__seg--' + seg.kind;
      d.setAttribute('data-start', seg.start);
      d.setAttribute('data-end', seg.end);
      d.style.left = pct(seg.start);
      d.style.width = 'calc(' + pct(seg.end) + ' - ' + pct(seg.start) + ')';
      d.innerHTML = '<span>' + names[seg.kind] + '</span>';
      stripBands.appendChild(d);
    });
  }
  function renderStrip(s) {
    if (stripDay !== s.dayIndex) { buildStrip(s.dayIndex); stripDay = s.dayIndex; }
    var segs = stripBands.querySelectorAll('[data-start]');
    for (var i = 0; i < segs.length; i++) {
      var inSeg = s.open && s.minutes >= +segs[i].getAttribute('data-start') && s.minutes < +segs[i].getAttribute('data-end');
      segs[i].classList.toggle('is-dim', !inSeg);
    }
  }

  /* --------------------------------------------------------------- summary */
  var last = {};
  function setText(node, key, text) {
    if (last[key] === text) return;
    last[key] = text;
    node.textContent = text;
  }
  function renderSummary(s, preview) {
    setText(whenEl, 'when', (preview ? 'Preview · ' : 'Now · ') + s.dayName + ', ' + s.time + (preview ? '' : ', London time'));
    setText(titleEl, 'title', s.title);
    if (/^Fermé/.test(s.title)) titleEl.setAttribute('lang', 'fr'); else titleEl.removeAttribute('lang');
    setText(detailEl, 'detail', s.detail);
    var menus = s.menus.length ? s.menus.slice(0, 3) : ['galettes', 'set-lunch'];
    var key = menus.join(',');
    if (last.links !== key) {
      last.links = key;
      linksEl.innerHTML = '';
      menus.forEach(function (id) {
        var a = document.createElement('a');
        a.href = 'menu.html#' + id;
        a.textContent = MENU_LABEL[id];
        linksEl.appendChild(a);
      });
    }
  }

  /* -------------------------------------------------------------- controls */
  var previewing = false;
  function setControls(s) {
    for (var i = 0; i < radios.length; i++) radios[i].checked = (+radios[i].value === s.dayIndex);
    range.step = previewing ? '15' : 'any';
    range.value = String(Math.min(Math.max(s.minutes, STRIP_MIN), STRIP_MAX));
    range.setAttribute('aria-valuetext', s.dayName + ', ' + s.time);
  }
  function selectedDay() {
    for (var i = 0; i < radios.length; i++) if (radios[i].checked) return +radios[i].value;
    return 0;
  }

  function render(s, preview) {
    root.classList.toggle('is-preview', !!preview);
    renderSummary(s, preview);
    renderDial(s);
    renderStrip(s);
    setControls(s);
  }

  function renderLive() {
    previewing = false;
    render(S.serviceAt(new Date()), false);
  }

  function onPreviewInput() {
    previewing = true;
    var m = Math.round(+range.value / 15) * 15;
    render(S.serviceFor(selectedDay(), m), true);
  }

  /* -------------------------------------------------------------- rituals */
  function renderRituals(now) {
    var els = document.querySelectorAll('[data-ritual]');
    for (var i = 0; i < els.length; i++) {
      var r = S.ritualStatus(els[i].getAttribute('data-ritual'), now.dayIndex, now.minutes);
      if (!r) continue;
      els[i].classList.toggle('is-now', r.now);
      els[i].querySelector('.ritual__status-k').textContent = r.now ? 'On now' : 'Next';
      els[i].querySelector('[data-ritual-text]').textContent = r.now ? 'Until ' + S.fmtTime(r.until) : r.label;
    }
  }

  /* ----------------------------------------------------------------- init */
  if (dialHost) buildDial();
  renderLive();
  renderRituals(S.serviceAt(new Date()));

  for (var i = 0; i < radios.length; i++) radios[i].addEventListener('change', onPreviewInput);
  range.addEventListener('input', onPreviewInput);
  range.addEventListener('keydown', function () { range.step = '15'; });
  range.addEventListener('pointerdown', function () { range.step = '15'; });
  resetBtn.addEventListener('click', function () {
    renderLive();
    var checked = root.querySelector('input[name="day"]:checked');
    if (checked) checked.focus();
  });
  if (form) form.addEventListener('submit', function (e) { e.preventDefault(); });

  // Live updates come from site.js once a minute.
  document.addEventListener('chez:tick', function (e) {
    if (!previewing) render(e.detail, false);
    renderRituals(e.detail);
  });
})();
