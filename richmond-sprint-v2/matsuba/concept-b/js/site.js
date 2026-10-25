/* Matsuba concept B: shared behaviour. Progressive enhancement only: every page is complete without this file.
   1. The progress frieze under the header (built here, because it only means something when it moves).
   2. The stepped wall: as you read down the page, the front layer steps down one slat at a time.
   3. The "open now" sconce, from the published hours, in London time, with the "to confirm" caveats. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var motionOK = html.classList.contains('motion');

  /* ---------- 1 + 2: frieze and wall ---------- */
  var frieze = d.querySelector('.frieze');
  var wall = d.querySelector('.wall');
  var probe = wall && wall.querySelector('.wall__probe');
  var friezeN = 0, lastK = -1, lastF = -1, ticking = false;

  function buildFrieze() {
    if (!frieze || !frieze.offsetParent) return;
    var fu = parseFloat(getComputedStyle(frieze).getPropertyValue('--fu')) || 5;
    var n = Math.ceil(frieze.clientWidth / (fu * 2)) + 1;
    if (n === friezeN) return;
    friezeN = n;
    var s = '';
    for (var i = 0; i < n; i++) s += '<i style="--i:' + i + ';--j:' + (i % 6) + '"></i>';
    frieze.innerHTML = s;
    lastF = -1;
  }

  function progress() {
    var max = html.scrollHeight - window.innerHeight;
    if (max <= 0) return 0;
    return Math.min(1, Math.max(0, window.scrollY / max));
  }

  function update() {
    ticking = false;
    var p = progress();
    if (frieze && friezeN) {
      var f = Math.round(p * (friezeN - 1));
      if (f !== lastF) { lastF = f; frieze.style.setProperty('--k', f); }
    }
    if (wall && probe && motionOK) {
      var drop = probe.offsetHeight || 10;
      var steps = Math.max(1, Math.floor(window.innerHeight * 0.62 / drop));
      var k = Math.round(p * steps);           // whole slats only: the wall steps, it never slides
      if (k !== lastK) { lastK = k; wall.style.setProperty('--d', (k * drop) + 'px'); }
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }

  if (frieze || wall) {
    buildFrieze();
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { buildFrieze(); lastK = -1; update(); }, 120);
    });
  }

  /* ---------- 3: the open-now sconce ---------- */
  // As published: Mon–Fri 12–3pm and 5–10pm, Sat 12–10pm, Sun closed.
  // Monday and the lunch end time are flagged "to confirm" wherever they matter.
  var HOURS = { 0: [], 1: [[720, 900], [1020, 1320]], 2: [[720, 900], [1020, 1320]], 3: [[720, 900], [1020, 1320]],
                4: [[720, 900], [1020, 1320]], 5: [[720, 900], [1020, 1320]], 6: [[720, 1320]] };
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var TBC = '<span class="tbc" title="To be confirmed with the restaurant">to confirm</span>';

  function londonNow() {
    try {
      var parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
        .formatToParts(new Date());
      var o = {};
      parts.forEach(function (x) { o[x.type] = x.value; });
      var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      return { day: map[o.weekday], mins: (parseInt(o.hour, 10) % 24) * 60 + parseInt(o.minute, 10) };
    } catch (e) {
      var n = new Date();
      return { day: n.getDay(), mins: n.getHours() * 60 + n.getMinutes() };
    }
  }
  function t(m) { var h = Math.floor(m / 60), mm = m % 60, s = (h % 12 || 12) + (mm ? ':' + (mm < 10 ? '0' : '') + mm : ''); return s + (h < 12 ? 'am' : 'pm'); }

  function status() {
    var now = londonNow(), today = HOURS[now.day], i, r;
    for (i = 0; i < today.length; i++) {
      r = today[i];
      if (now.mins >= r[0] && now.mins < r[1]) {
        var lunchEnd = r[1] === 900;
        var long = 'Open now, until ' + t(r[1]);
        if (lunchEnd) long += ' (lunch end ' + TBC + ')';
        else if (now.day === 1) long += ' (Monday ' + TBC + ')';
        return { open: true, short: 'Open now' + (now.day === 1 ? ' ' + TBC : ''), long: long };
      }
    }
    for (i = 0; i < today.length; i++) {
      if (now.mins < today[i][0]) {
        return { open: false, short: 'Opens ' + t(today[i][0]),
                 long: 'Closed now. Opens today at ' + t(today[i][0]) + (now.day === 1 ? ' (Monday ' + TBC + ')' : '') + '.' };
      }
    }
    for (var k = 1; k <= 7; k++) {
      var dd = (now.day + k) % 7;
      if (HOURS[dd].length) {
        var when = k === 1 ? 'tomorrow' : DAYS[dd];
        var note = dd === 1 ? ' (Monday ' + TBC + ')' : '';
        return { open: false, short: 'Closed now', long: 'Closed now. Opens ' + when + ' at ' + t(HOURS[dd][0][0]) + note + '.' };
      }
    }
    return { open: false, short: 'Closed now', long: 'Closed now.' };
  }

  function paintStatus() {
    var s = status();
    var els = d.querySelectorAll('[data-status]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i], txt = el.querySelector('.status__text');
      el.classList.toggle('is-open', s.open);
      txt.innerHTML = el.classList.contains('status--head') ? s.short : s.long;
    }
    var now = londonNow();
    var rows = d.querySelectorAll('.hours tr[data-day]');
    for (var j = 0; j < rows.length; j++) {
      rows[j].classList.toggle('is-today', rows[j].getAttribute('data-day').split(' ').indexOf(String(now.day)) > -1);
    }
  }
  if (d.querySelector('[data-status]')) {
    paintStatus();
    setInterval(paintStatus, 60000);
  }
})();
