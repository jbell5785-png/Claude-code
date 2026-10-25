/* Chez Lindsay, Concept B "Marée": shared behaviour. Plain JS, no dependencies.
   Everything here is an enhancement: the pages are complete without it. */
(function () {
  'use strict';

  var doc = document.documentElement;
  var reduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

  /* 1. Slow, tidal reveals and section rules that draw in like soundings.
        Content is only hidden once JS has confirmed motion is allowed. */
  function setupReveal() {
    if (reduce.matches || !('IntersectionObserver' in window)) return;
    var els = document.querySelectorAll('[data-reveal], [data-rule]');
    if (!els.length) return;
    doc.classList.add('motion-ok');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    Array.prototype.forEach.call(els, function (el) { io.observe(el); });
  }

  /* 2. Mark today's row in the opening-hours table, in London time. */
  function markToday() {
    var rows = document.querySelectorAll('.tide tr[data-day]');
    if (!rows.length || !window.Intl) return;
    var day;
    try {
      day = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', weekday: 'long' }).format(new Date());
    } catch (err) { return; }
    Array.prototype.forEach.call(rows, function (r) {
      if (r.getAttribute('data-day') === day) r.classList.add('is-today');
    });
  }

  /* 3. Booking hand-off. No backend exists: open OpenTable in a new tab and say
        so honestly. If the browser blocks the tab, show a visible link instead. */
  function setupBooking() {
    var links = document.querySelectorAll('a[data-book]');
    Array.prototype.forEach.call(links, function (a) {
      a.addEventListener('click', function (ev) {
        if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
        var out = document.getElementById(a.getAttribute('data-book'));
        if (!out) return;
        ev.preventDefault();
        var w = null;
        try { w = window.open(a.href, '_blank'); } catch (err) { w = null; }
        out.textContent = '';
        if (w) {
          try { w.opener = null; } catch (err) { /* cross-origin: ignore */ }
          out.textContent = 'OpenTable should now be open in a new tab. Your table is only booked once OpenTable or the restaurant confirms it.';
        } else {
          out.appendChild(document.createTextNode('Your browser stopped the new tab from opening. '));
          var link = document.createElement('a');
          link.href = a.href;
          link.target = '_blank';
          link.rel = 'noopener';
          link.textContent = 'Continue to OpenTable';
          out.appendChild(link);
          out.appendChild(document.createTextNode(', or call us on 020 8948 7473.'));
        }
      });
    });
  }

  setupReveal();
  markToday();
  setupBooking();
})();
