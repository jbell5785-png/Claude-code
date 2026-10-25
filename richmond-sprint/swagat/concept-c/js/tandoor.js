/* Swagat · Concept C · "Tandoor"
   1. Veg / Non-veg switch: a native radio group styled as a three-state segmented control.
      Non-matching sections fold with a quick vertical collapse, then get the `hidden`
      attribute (and `inert` while folding), so they stay in the DOM but leave the
      accessibility tree and tab order. Sections the menu does not sort (no
      data-diet-section value) always stay in view.
   2. Today's row in the hours list.
   Everything works without this file: the menu renders in full and the switch is replaced
   by a one-line key. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var FOLD_MS = 240;
  var switches = [];

  function reduced() { return !!(reduceQuery && reduceQuery.matches); }

  function foldOut(sec, animate) {
    if (sec.hidden) return;
    var token = (sec._foldToken = (sec._foldToken || 0) + 1);
    sec.inert = true;
    if (!animate) {
      sec.classList.remove('is-folding');
      sec.classList.add('is-folded');
      sec.hidden = true;
      return;
    }
    sec.classList.add('is-folding');
    void sec.offsetHeight;
    sec.classList.add('is-folded');
    window.setTimeout(function () {
      if (sec._foldToken !== token) return;
      sec.hidden = true;
      sec.classList.remove('is-folding');
    }, FOLD_MS);
  }

  function foldIn(sec, animate) {
    var token = (sec._foldToken = (sec._foldToken || 0) + 1);
    if (!sec.hidden && !sec.classList.contains('is-folded')) { sec.inert = false; return; }
    sec.hidden = false;
    sec.inert = false;
    if (!animate) {
      sec.classList.remove('is-folded', 'is-folding');
      return;
    }
    sec.classList.add('is-folding', 'is-folded');
    void sec.offsetHeight;
    sec.classList.remove('is-folded');
    window.setTimeout(function () {
      if (sec._foldToken === token) sec.classList.remove('is-folding');
    }, FOLD_MS);
  }

  function count(list) {
    return list.reduce(function (n, s) { return n + (parseInt(s.getAttribute('data-count'), 10) || 0); }, 0);
  }

  function statusText(value, sections) {
    var marked = sections.filter(function (s) { return s.getAttribute('data-diet-section'); });
    var unmarked = sections.filter(function (s) { return !s.getAttribute('data-diet-section'); });
    if (value === 'all') {
      return 'Showing every section: ' + count(sections) + ' dishes.';
    }
    var shown = marked.filter(function (s) { return s.getAttribute('data-diet-section') === value; });
    var label = value === 'veg' ? 'Vegetarian' : 'Non-Vegetarian';
    var other = value === 'veg' ? 'Non-Vegetarian' : 'Vegetarian';
    var text = 'Showing the menu’s ' + label + ' sections: ' + count(shown) + ' dishes. ' + other + ' sections are folded away.';
    if (unmarked.length) {
      text += ' Biryanis and rice, breads, raita and salad, dessert and lassi are not marked on the menu, so they stay in view.';
    }
    return text;
  }

  function initSwitch(sw) {
    var scope = document.querySelector(sw.getAttribute('data-scope'));
    if (!scope) return null;
    var inputs = Array.prototype.slice.call(sw.querySelectorAll('input[type="radio"]'));
    var status = sw.querySelector('[data-diet-status]');
    var sections = Array.prototype.slice.call(scope.querySelectorAll('[data-diet-section]'));
    var sync = sw.hasAttribute('data-sync-url');
    var bar = sw.closest('.switchbar');
    var links = Array.prototype.slice.call(document.querySelectorAll('[data-diet-link]'));
    var state = 'all';

    function apply(value, opts) {
      opts = opts || {};
      var animate = !!opts.animate && !reduced();
      state = value;
      sw.setAttribute('data-state', value);
      root.setAttribute('data-diet', value);
      inputs.forEach(function (i) { i.checked = i.value === value; });

      if (opts.user && bar) {
        var barBottom = bar.getBoundingClientRect().bottom;
        var top = scope.getBoundingClientRect().top;
        if (top < barBottom - 1) {
          window.scrollTo(0, window.pageYOffset + top - barBottom);
        }
      }

      sections.forEach(function (sec) {
        var diet = sec.getAttribute('data-diet-section');
        var match = value === 'all' || !diet || diet === value;
        if (match) foldIn(sec, animate); else foldOut(sec, animate);
      });

      if (status) status.textContent = statusText(value, sections);

      links.forEach(function (a) {
        a.setAttribute('href', value === 'all' ? 'menu.html' : 'menu.html?diet=' + value);
      });

      if (sync && window.history && history.replaceState) {
        try {
          var url = new URL(window.location.href);
          if (value === 'all') url.searchParams.delete('diet'); else url.searchParams.set('diet', value);
          history.replaceState(history.state, '', url.pathname + url.search + url.hash);
        } catch (e) { /* file:// or old browser: the switch still works */ }
      }

      if (opts.user && !reduced()) {
        sw.classList.remove('is-thunk');
        void sw.offsetWidth;
        sw.classList.add('is-thunk');
      }
    }

    inputs.forEach(function (input) {
      input.addEventListener('change', function () {
        if (input.checked) apply(input.value, { animate: true, user: true });
      });
    });

    var initial = 'all';
    if (sync) {
      var q = null;
      try { q = new URLSearchParams(window.location.search).get('diet'); } catch (e) { q = null; }
      if (q === 'veg' || q === 'nonveg') initial = q;
    }
    var api = {
      scope: scope,
      sections: sections,
      apply: apply,
      state: function () { return state; },
      reveal: function (el) {
        var sec = el.closest('[data-diet-section]');
        if (!sec || !scope.contains(sec)) return;
        if (sec.hidden || sec.classList.contains('is-folded')) apply('all', { animate: false });
      }
    };
    apply(initial, { animate: false });
    return api;
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-diet-switch]'), function (sw) {
    var api = initSwitch(sw);
    if (api) switches.push(api);
  });

  // A deep link into a folded section switches back to "All" first, so the target exists.
  function revealHash(hash) {
    if (!hash || hash.length < 2) return;
    var el;
    try { el = document.getElementById(decodeURIComponent(hash.slice(1))); } catch (e) { el = null; }
    if (!el) return;
    switches.forEach(function (s) { s.reveal(el); });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href*="#"]') : null;
    if (!a) return;
    var url;
    try { url = new URL(a.href); } catch (err) { return; }
    if (url.pathname === window.location.pathname) revealHash(url.hash);
  });
  window.addEventListener('hashchange', function () { revealHash(window.location.hash); });
  if (window.location.hash) {
    revealHash(window.location.hash);
    var target = null;
    try { target = document.getElementById(decodeURIComponent(window.location.hash.slice(1))); } catch (e) { target = null; }
    if (target) target.scrollIntoView();
  }

  // Today's row in the hours list (London time). The label space is reserved in CSS.
  var rows = document.querySelectorAll('[data-days]');
  if (rows.length && window.Intl && Intl.DateTimeFormat) {
    var day;
    try {
      day = new Intl.DateTimeFormat('en-GB', { weekday: 'long', timeZone: 'Europe/London' }).format(new Date());
    } catch (e) {
      day = new Intl.DateTimeFormat('en-GB', { weekday: 'long' }).format(new Date());
    }
    var idx = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(day);
    Array.prototype.forEach.call(rows, function (li) {
      var days = li.getAttribute('data-days').split(',').map(Number);
      if (days.indexOf(idx) !== -1) {
        li.classList.add('is-today');
        var t = li.querySelector('[data-today]');
        if (t) t.textContent = 'Today, ' + day;
      }
    });
  }
})();
