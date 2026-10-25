/* Chez Lindsay · Concept A · menu tabs
   Without JS: the tabs are plain jump links and every menu is shown in turn.
   With JS: a real tablist (arrow keys, Home/End, aria-selected, tabpanels).
   menu.html#galettes etc. opens that tab; with no hash, the tab chosen in the
   <head> from the service clock is kept (see menu.html). */
(function () {
  'use strict';
  var S = window.ChezService;
  var html = document.documentElement;
  var list = document.querySelector('[data-tablist]');
  if (!list) return;

  var tabs = Array.prototype.slice.call(list.querySelectorAll('[data-tab]'));
  var ids = tabs.map(function (t) { return t.getAttribute('data-tab'); });
  var nowNote = document.querySelector('[data-menu-now]');

  list.setAttribute('role', 'tablist');
  tabs.forEach(function (tab) {
    var id = tab.getAttribute('data-tab');
    var panel = document.getElementById(id);
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', id);
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.setAttribute('tabindex', '0');
  });

  function tabFromHash(hash) {
    var h = (hash || '').replace(/^#/, '');
    for (var i = 0; i < ids.length; i++) if (h === ids[i] || h.indexOf(ids[i] + '-') === 0) return ids[i];
    return null;
  }

  var current = null;
  function select(id, opts) {
    opts = opts || {};
    if (ids.indexOf(id) < 0) return;
    tabs.forEach(function (tab) {
      var on = tab.getAttribute('data-tab') === id;
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.setAttribute('tabindex', on ? '0' : '-1');
    });
    if (current !== id) {
      html.setAttribute('data-tab', id);
      var panel = document.getElementById(id);
      if (current !== null) {
        panel.classList.remove('is-entering');
        void panel.offsetWidth;
        panel.classList.add('is-entering');
      }
      current = id;
    }
    if (opts.focus) tabs[ids.indexOf(id)].focus();
    if (opts.updateHash && history.replaceState) history.replaceState(null, '', '#' + id);
  }

  /* Mark the menus being served right now, from the clock */
  function markNow() {
    if (!S) return;
    var s = S.serviceAt(new Date());
    tabs.forEach(function (tab) {
      var on = s.menus.indexOf(tab.getAttribute('data-tab')) > -1;
      tab.classList.toggle('is-now', on);
      var flag = tab.querySelector('.tab__nowflag');
      if (on && !flag) {
        flag = document.createElement('span');
        flag.className = 'sr-only tab__nowflag';
        flag.textContent = ' (serving now)';
        tab.appendChild(flag);
      } else if (!on && flag) {
        tab.removeChild(flag);
      }
    });
    if (nowNote) {
      var txt;
      if (s.open) {
        txt = '<span class="now-mark" aria-hidden="true"></span><b>Serving now:</b> ' + esc(s.title).toLowerCase().replace(/^./, function (c) { return c.toUpperCase(); }) +
              ', until ' + S.fmtTime(s.until) + (s.happyHour ? ', with happy hour until 6pm' : '') + '.';
      } else {
        txt = '<b>' + esc(s.barKicker) + '.</b> ' + esc(s.barMain) + ', with galettes and set lunch until 5pm.';
      }
      nowNote.innerHTML = txt;
    }
  }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* Initial tab: hash first, then what the <head> script chose from the clock */
  var initial = tabFromHash(location.hash) || html.getAttribute('data-tab') || ids[0];
  select(initial);
  markNow();
  document.addEventListener('chez:tick', markNow);

  list.addEventListener('click', function (e) {
    var tab = e.target.closest('[role="tab"]');
    if (!tab) return;
    e.preventDefault();
    select(tab.getAttribute('data-tab'), { updateHash: true });
  });

  list.addEventListener('keydown', function (e) {
    var tab = e.target.closest('[role="tab"]');
    if (!tab) return;
    var i = ids.indexOf(tab.getAttribute('data-tab'));
    var next = null;
    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown': next = (i + 1) % ids.length; break;
      case 'ArrowLeft': case 'ArrowUp': next = (i - 1 + ids.length) % ids.length; break;
      case 'Home': next = 0; break;
      case 'End': next = ids.length - 1; break;
      case ' ': case 'Spacebar':
        e.preventDefault();
        select(ids[i], { updateHash: true });
        return;
      default: return;
    }
    e.preventDefault();
    select(ids[next], { focus: true, updateHash: true });
  });

  /* Links elsewhere on the page (now bar, wine jump links) that change the hash */
  window.addEventListener('hashchange', function () {
    var id = tabFromHash(location.hash);
    if (id) select(id);
  });
})();
