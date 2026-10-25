/* Chez Lindsay · Concept A · shared page behaviour
   - the sticky "Now serving" bar (live, Europe/London)
   - today's row in the weekly hours table
   - the OpenTable hand-off, with an honest status line */
(function () {
  'use strict';
  var S = window.ChezService;
  if (!S) return;

  var onMenuPage = document.body.classList.contains('page-menu');

  /* ---------- Now bar ---------- */
  var bar = document.querySelector('[data-nowbar]');
  var barLink = document.querySelector('[data-nowbar-link]');
  var barKicker = document.querySelector('[data-nowbar-kicker]');
  var barMain = document.querySelector('[data-nowbar-main]');
  var lastKey = '';

  function renderBar() {
    var s = S.serviceAt(new Date());
    var key = s.barKicker + '|' + s.barMain + '|' + s.primaryTab;
    if (key !== lastKey) {
      lastKey = key;
      barKicker.textContent = s.barKicker;
      if (/^Fermé/.test(s.barKicker)) barKicker.setAttribute('lang', 'fr'); else barKicker.removeAttribute('lang');
      barMain.textContent = s.barMain;
      bar.classList.toggle('is-closed', !s.open);
      var target = (onMenuPage ? '' : 'menu.html') + '#' + s.primaryTab;
      barLink.setAttribute('href', target);
    }
    markToday(s.dayIndex);
    document.dispatchEvent(new CustomEvent('chez:tick', { detail: s }));
  }

  /* ---------- Today in the hours table ---------- */
  var todayIndex = -1;
  function markToday(dayIndex) {
    if (dayIndex === todayIndex) return;
    todayIndex = dayIndex;
    var rows = document.querySelectorAll('.week tr[data-day]');
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var isToday = +row.getAttribute('data-day') === dayIndex;
      row.classList.toggle('is-today', isToday);
      var th = row.querySelector('th');
      var flag = th.querySelector('.week__todayflag');
      if (isToday && !flag) {
        flag = document.createElement('span');
        flag.className = 'sr-only week__todayflag';
        flag.textContent = ' (today)';
        th.appendChild(flag);
      } else if (!isToday && flag) {
        flag.parentNode.removeChild(flag);
      }
    }
  }

  renderBar();
  // Re-check at the top of every minute, and whenever the tab becomes visible again.
  function schedule() {
    var ms = 60000 - (Date.now() % 60000) + 250;
    setTimeout(function () { renderBar(); schedule(); }, ms);
  }
  schedule();
  document.addEventListener('visibilitychange', function () { if (!document.hidden) renderBar(); });

  /* ---------- OpenTable hand-off ---------- */
  var links = document.querySelectorAll('[data-opentable]');
  for (var j = 0; j < links.length; j++) {
    links[j].addEventListener('click', function (e) {
      var url = this.href;
      var status = document.querySelector('[data-book-status]');
      if (!status) return; // let the plain link do its job
      e.preventDefault();
      var w = null;
      try { w = window.open(url, '_blank'); } catch (err) { w = null; }
      status.textContent = '';
      if (w) {
        try { w.opener = null; } catch (err2) { /* cross-origin: fine */ }
        status.textContent = 'OpenTable has opened in a new tab. Nothing is booked yet: your table is confirmed only by OpenTable or the restaurant.';
      } else {
        status.appendChild(document.createTextNode('Your browser didn’t open a new tab. '));
        var a = document.createElement('a');
        a.href = url; a.target = '_blank'; a.rel = 'noopener';
        a.textContent = 'Open OpenTable here';
        status.appendChild(a);
        status.appendChild(document.createTextNode(', or call 020 8948 7473.'));
      }
    });
  }
})();
