/* Matsuba Concept C: shared page behaviour (Today compartment, current day). */
(function () {
  'use strict';
  var H = window.MatsubaHours;
  if (!H) return;

  var TBC = '<span class="tbc" title="To be confirmed with the restaurant">to confirm</span>';
  var NOTE = {
    monday: 'Monday opening ' + TBC + '<!-- [TO CONFIRM] Monday -->',
    'lunch-end': 'Lunch end time ' + TBC + '<!-- [TO CONFIRM] lunch end -->'
  };

  function render() {
    var s = H.getStatus(new Date());
    var box = document.querySelector('[data-today]');
    if (box) {
      var stateEl = box.querySelector('[data-today-state]');
      var detailEl = box.querySelector('[data-today-detail]');
      var lamp = box.querySelector('[data-lamp]');
      stateEl.textContent = s.headline;
      var notes = s.tbc.map(function (k) { return NOTE[k]; }).join(' · ');
      detailEl.innerHTML = escapeHtml(s.detail) +
        '<span class="today__clock">London time ' + s.clock + '</span>' +
        (notes ? '<span class="today__tbc">' + notes + '</span>' : '');
      box.setAttribute('data-state', s.state);
      if (lamp) lamp.setAttribute('data-state', s.state);
    }
    // Highlight today's row in any hours list.
    var rows = document.querySelectorAll('[data-days]');
    for (var i = 0; i < rows.length; i++) {
      var days = rows[i].getAttribute('data-days').split(' ');
      rows[i].classList.toggle('is-today', days.indexOf(String(s.day)) !== -1);
    }
  }

  function escapeHtml(t) {
    return String(t).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  render();
  // Re-check once a minute so the state changes at 12pm, 3pm, 5pm and 10pm.
  setInterval(render, 60000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) render(); });
})();
