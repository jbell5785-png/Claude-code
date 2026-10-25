/* Swagat Concept A: shared behaviour. Progressive enhancement only. */
(function () {
  'use strict';

  /* Mark today's row in the hours list (Richmond time). Purely a highlight:
     it never claims the restaurant is open, because the hours are to confirm. */
  var rows = document.querySelectorAll('[data-hours] .hours__row');
  if (rows.length) {
    var day = new Date().getDay();
    try {
      var wd = new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'Europe/London' }).format(new Date());
      var idx = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(wd);
      if (idx !== -1) day = idx;
    } catch (e) { /* fall back to the device clock */ }
    Array.prototype.forEach.call(rows, function (row) {
      var days = (row.getAttribute('data-days') || '').split(' ');
      if (days.indexOf(String(day)) !== -1) row.classList.add('is-today');
    });
  }
})();
