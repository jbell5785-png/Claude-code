/* Matsuba, Concept A: shared behaviour (header, lights switching on, booking hand-off). No dependencies. */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* header turns solid once you leave the top */
  var top = document.querySelector('.top');
  function onScroll() { if (top) top.classList.toggle('is-solid', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* fairy-light swags and the street line light up as they come into view */
  var els = document.querySelectorAll('.swag, .street, [data-light]');
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-on'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.2 });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('is-on'); });
  }

  /* booking: hand off to Favourite Table honestly, never claim a booking */
  var form = document.getElementById('book-form');
  if (form) {
    var party = document.getElementById('party');
    var status = document.getElementById('book-status');
    var URL_BOOK = 'https://booking.favouritetable.com/?SiteCode=2122';
    var phoneNote = 'Web bookings take up to 12. For 13 or more, please call the restaurant on <a href="tel:+442086053513">020 8605 3513</a>.';
    party.addEventListener('change', function () {
      if (+party.value > 12) status.innerHTML = phoneNote; else status.textContent = '';
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var n = +party.value;
      if (n > 12) { status.innerHTML = phoneNote; return; }
      var who = n + (n === 1 ? ' guest' : ' guests');
      var w = window.open(URL_BOOK, '_blank');
      if (w) {
        try { w.opener = null; } catch (err) { /* ignore */ }
        status.textContent = 'Favourite Table has opened in a new tab. Choose a date and time there for ' + who + '. Nothing is booked until you confirm it there.';
      } else {
        status.innerHTML = 'Your browser kept the new tab from opening. <a href="' + URL_BOOK + '" target="_blank" rel="noopener">Open Favourite Table</a> to choose a date and time for ' + who + '.';
      }
    });
  }
})();
