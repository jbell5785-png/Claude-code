/* Chez Lindsay, Concept C: shared behaviour. Plain JS, no dependencies.
   The fold itself is triggered by the small inline script in <head> (so it is set before first paint);
   everything here is progressive enhancement. */
(function () {
  'use strict';
  var d = document;
  var mq = function (q) { return window.matchMedia ? window.matchMedia(q) : { matches: false }; };
  var reduce = mq('(prefers-reduced-motion: reduce)');

  /* 1. Hover tilt on the fold (fine pointers only, never with reduced motion) */
  var fig = d.querySelector('.hero__fold');
  var pliure = fig && fig.querySelector('.pliure');
  var stage = fig && fig.querySelector('.pliure__stage');
  if (stage && mq('(hover: hover) and (pointer: fine)').matches) {
    var raf = 0;
    fig.addEventListener('pointermove', function (ev) {
      if (reduce.matches) return;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        var r = pliure.getBoundingClientRect();
        var x = Math.max(-0.5, Math.min(0.5, (ev.clientX - r.left) / r.width - 0.5));
        var y = Math.max(-0.5, Math.min(0.5, (ev.clientY - r.top) / r.height - 0.5));
        stage.style.setProperty('--tilt-y', (x * 12).toFixed(2) + 'deg');
        stage.style.setProperty('--tilt-x', (-y * 12).toFixed(2) + 'deg');
      });
    });
    fig.addEventListener('pointerleave', function () {
      stage.style.removeProperty('--tilt-x');
      stage.style.removeProperty('--tilt-y');
    });
  }

  /* 2. Booking hand-off: open OpenTable in a new tab and say honestly what happened.
        No confirmation is ever shown; if the tab is blocked, show a plain link. */
  var handoffs = d.querySelectorAll('[data-handoff]');
  Array.prototype.forEach.call(handoffs, function (link) {
    link.addEventListener('click', function (ev) {
      var card = link.closest('.book__card');
      var status = card && card.querySelector('.book__status');
      if (!status) return; /* let the plain link work */
      ev.preventDefault();
      var win = null;
      try { win = window.open(link.href, '_blank'); } catch (err) { win = null; }
      status.textContent = '';
      if (win) {
        try { win.opener = null; } catch (err) { /* cross-origin: ignore */ }
        status.textContent = 'OpenTable has opened in a new tab. Your table is booked only when OpenTable confirms it. ' +
          'If you would rather speak to someone, call 020 8948 7473.';
      } else {
        status.appendChild(d.createTextNode('Your browser didn’t open a new tab. '));
        var a = d.createElement('a');
        a.href = link.href; a.target = '_blank'; a.rel = 'noopener';
        a.textContent = 'Open the OpenTable booking page';
        status.appendChild(a);
        status.appendChild(d.createTextNode(', or call 020 8948 7473.'));
      }
    });
  });

  /* 3. Mark today's row in the opening-hours table (Europe/London). The "Today" tag's space is
        already reserved in the markup, so nothing moves. */
  var rows = d.querySelectorAll('.hours__table tr[data-day]');
  if (rows.length && window.Intl) {
    try {
      var today = new Intl.DateTimeFormat('en-GB', { weekday: 'long', timeZone: 'Europe/London' }).format(new Date());
      Array.prototype.forEach.call(rows, function (tr) {
        if (tr.getAttribute('data-day') === today) { tr.classList.add('is-today'); tr.setAttribute('aria-current', 'date'); }
      });
    } catch (err) { /* leave the table as it is */ }
  }
})();
