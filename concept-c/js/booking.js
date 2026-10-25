/* Concept C, "Bucato": booking step. No backend exists, so this collects party,
   date and time, shows a plain summary, then opens OpenTable in a new tab.
   It never shows a "booked" confirmation. Without JS the form stays hidden and
   the plain OpenTable and phone links below it do the job. */
(function () {
  'use strict';
  var form = document.querySelector('[data-booker]');
  if (!form) return;
  var OT = 'https://www.opentable.co.uk/r/caffe-mamma-ristorante-london';
  var party = form.querySelector('#bk-party');
  var date = form.querySelector('#bk-date');
  var time = form.querySelector('#bk-time');
  var summary = form.querySelector('[data-summary]');
  var submit = form.querySelector('[data-submit]');
  var call = form.querySelector('[data-call]');

  function iso(d) {
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day;
  }
  var today = new Date();
  var max = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
  date.min = iso(today);
  date.max = iso(max);
  if (!date.value) date.value = iso(today);

  function niceDate(v) {
    var p = v.split('-');
    if (p.length !== 3) return '';
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    if (isNaN(d)) return '';
    return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).replace(',', '');
  }
  function niceTime(v) {
    var p = v.split(':'), h = +p[0], m = +p[1];
    if (h === 12 && m === 0) return '12 noon';
    var hh = h > 12 ? h - 12 : h;
    return hh + (m ? '.' + (m < 10 ? '0' : '') + m : '') + (h >= 12 ? 'pm' : 'am');
  }
  function isBig() { return party.value === '9'; }

  function update() {
    if (isBig()) {
      summary.textContent = 'For nine or more, please call us on 020 8948 8330 and we’ll sort out the table with you.';
      submit.hidden = true; call.hidden = false;
      return;
    }
    submit.hidden = false; call.hidden = true;
    var n = +party.value, dn = niceDate(date.value);
    if (!dn) { summary.textContent = 'Choose a date to see your table.'; return; }
    summary.textContent = 'Table for ' + n + ', ' + dn + ', ' + niceTime(time.value) + ': we’ll take you to OpenTable to confirm.';
  }

  form.addEventListener('change', update);
  form.addEventListener('input', update);
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (isBig()) { call.focus(); return; }
    if (!date.value || (date.min && date.value < date.min)) {
      summary.textContent = 'Please choose a date from today onwards.';
      date.focus();
      return;
    }
    update();
    var w = window.open(OT, '_blank');
    if (w) {
      try { w.opener = null; } catch (err) { /* ignore */ }
      summary.textContent = summary.textContent.replace(/: we.ll take you to OpenTable to confirm\.$/, '') +
        ': OpenTable is open in a new tab. Nothing is booked until you confirm there.';
    } else {
      // pop-up blocked: offer the link rather than navigating away from the page
      var line = summary.textContent.replace(/: we.ll take you to OpenTable to confirm\.$/, ': continue on OpenTable to confirm.');
      summary.textContent = line;
      var a = document.createElement('a');
      a.href = OT; a.target = '_blank'; a.rel = 'noopener';
      a.textContent = 'Continue to OpenTable';
      summary.appendChild(document.createTextNode(' '));
      summary.appendChild(a);
    }
  });

  form.hidden = false;
  update();
})();
