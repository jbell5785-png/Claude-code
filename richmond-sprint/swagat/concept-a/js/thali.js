/*
 * Swagat Concept A: "Build a thali" (menu page).
 * The menu is complete static HTML; this script only adds the toggle buttons,
 * the plate and the running summary. All arithmetic lives in thali-core.js.
 */
(function () {
  'use strict';

  var Core = window.ThaliCore;
  var panel = document.getElementById('thali');
  if (!Core || !panel) return;

  var STORE = 'swagat-concept-a-thali-v1';
  var mqSheet = window.matchMedia('(max-width: 999px)');
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var esc = function (s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  /* ---------- Catalogue from the page's own data attributes ---------- */
  var dishEls = {};
  var records = [];
  $$('[data-dish]').forEach(function (li) {
    try {
      var rec = JSON.parse(li.getAttribute('data-dish'));
      records.push(rec);
      dishEls[rec.id] = li;
    } catch (e) { /* a malformed record simply gets no button */ }
  });
  var cat = Core.makeCatalogue(records);
  var selection = load();

  /* ---------- Elements ---------- */
  var el = {
    total: $('[data-total]', panel),
    count: $('[data-count]', panel),
    lines: $('[data-lines]', panel),
    codes: $('[data-codes]', panel),
    status: $('[data-status]', panel),
    plateDesc: $('[data-plate-desc]', panel),
    copy: $('[data-copy]', panel),
    clear: $('[data-clear]', panel),
    order: $('[data-order]', panel),
    close: $('[data-thali-close]', panel),
    live: $('[data-live]'),
    toast: $('[data-toast]'),
    toggle: $('[data-thali-toggle]'),
    barSum: $('[data-bar-summary]')
  };
  el.count.setAttribute('tabindex', '-1');

  /* ---------- Add buttons (space for them is reserved in CSS) ---------- */
  var ICON = '<svg viewBox="0 0 26 26" aria-hidden="true" focusable="false"><circle class="add__ring" cx="13" cy="13" r="10.5"/>' +
    '<path class="add__plus" d="M13 8.4v9.2M8.4 13h9.2"/><path class="add__tick" d="M8.6 13.4l3 3 5.8-6.4"/></svg>';
  var buttons = [];

  Object.keys(dishEls).forEach(function (id) {
    var item = cat.byId[id];
    if (!item) return;
    $$('.dish__portion', dishEls[id]).forEach(function (span) {
      var key = span.getAttribute('data-portion');
      var portion = Core.portionOf(cat, { id: id, portion: key });
      if (!portion) return;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'add';
      b.setAttribute('aria-pressed', 'false');
      b.setAttribute('data-id', id);
      b.setAttribute('data-portion', key);
      b.title = 'Put on your thali' + (portion.label ? ' as a ' + portion.label.toLowerCase() : '');
      b.innerHTML = '<span class="vh">Put ' + esc(item.name) + ' on your thali' +
        (portion.label ? ' as a ' + esc(portion.label.toLowerCase()) : '') + ', ' + Core.formatPence(portion.pence) + '</span>' + ICON;
      span.appendChild(b);
      buttons.push(b);
    });
  });

  /* ---------- Plate slots ---------- */
  var slots = $$('.thali-svg .k', panel).map(function (g) {
    return {
      g: g,
      group: g.getAttribute('data-slot'),
      i: parseInt(g.getAttribute('data-i'), 10),
      food: g.querySelector('.food'),
      label: g.querySelector('.k-label'),
      current: null
    };
  });
  var WRAP = { rice: [15, 2], bread: [10, 2], lassi: [6, 2] };
  var LH = { rice: 13, bread: 11, lassi: 10 };

  function setLabel(textEl, name, group) {
    var w = WRAP[group] || [10, 3];
    var lines = Core.wrapLabel(name, w[0], w[1]);
    var lh = LH[group] || 12.5;
    var y0 = -((lines.length - 1) * lh) / 2;
    while (textEl.firstChild) textEl.removeChild(textEl.firstChild);
    lines.forEach(function (line, n) {
      var t = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
      t.setAttribute('x', '0');
      t.setAttribute('y', String(Math.round((y0 + n * lh) * 100) / 100));
      t.textContent = line;
      textEl.appendChild(t);
    });
  }

  /* ---------- Render ---------- */
  var summary = Core.summarise(selection, cat);

  function render(opts) {
    opts = opts || {};
    summary = Core.summarise(selection, cat);

    // Buttons and rows
    buttons.forEach(function (b) {
      var on = selection.some(function (e) { return e.id === b.getAttribute('data-id') && e.portion === b.getAttribute('data-portion'); });
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    Object.keys(dishEls).forEach(function (id) {
      dishEls[id].classList.toggle('is-on', selection.some(function (e) { return e.id === id; }));
    });

    // Plate
    summary.groups.forEach(function (g) {
      slots.filter(function (s) { return s.group === g.key; }).forEach(function (s) {
        var line = g.lines[s.i];
        var key = line ? line.id + ':' + line.portion : null;
        if (key === s.current) return;
        s.current = key;
        if (!line) { s.g.classList.remove('is-filled'); return; }
        if (s.food && line.tint) s.food.setAttribute('fill', line.tint);
        if (s.label) setLabel(s.label, line.name, s.group);
        s.g.classList.remove('is-filled');
        void s.g.getBoundingClientRect(); // restart the 250ms fill
        s.g.classList.add('is-filled');
      });
    });
    el.plateDesc.textContent = summary.count
      ? 'Thali plate with ' + summary.count + ' of ' + summary.places + ' places filled: ' + summary.lines.map(function (l) { return l.name; }).join(', ') + '.'
      : 'Thali plate, empty.';

    // Totals
    el.total.textContent = summary.total;
    el.count.textContent = summary.count
      ? summary.count + (summary.count === 1 ? ' dish' : ' dishes') + ' on your plate.'
      : 'Your plate is empty. Add dishes from the menu.';
    if (el.barSum) el.barSum.textContent = summary.count ? summary.count + (summary.count === 1 ? ' dish · ' : ' dishes · ') + summary.total : 'Add dishes';

    // Lines grouped by katori
    var html = '';
    summary.groups.forEach(function (g) {
      if (!g.count) return;
      html += '<div class="tgroup"><p class="tgroup__h">' + esc(g.label) + ' · ' + g.count + ' of ' + g.cap + '</p><ul>';
      g.lines.forEach(function (l) {
        html += '<li class="tline"><span class="tline__name">' + esc(l.name) +
          (l.portionLabel ? ' <span class="tline__portion">' + esc(l.portionLabel.toLowerCase()) + '</span>' : '') + '</span>' +
          '<span class="tline__price">' + l.price + '</span>' +
          '<button type="button" class="tline__remove" data-remove="' + esc(l.id) + '">Remove<span class="vh"> ' + esc(l.name) + '</span></button></li>';
      });
      html += '</ul></div>';
    });
    el.lines.innerHTML = html;

    // Codes, alongside the published statement
    if (summary.count) {
      var c = '<h3>Codes on these dishes</h3>';
      c += summary.allergenCodes.length
        ? '<ul class="codechips">' + summary.allergenCodes.map(function (a) { return '<li><b aria-hidden="true">' + a.code + '</b>' + esc(a.label) + '</li>'; }).join('') + '</ul>'
        : '<p>No allergen codes are printed against these dishes.</p>';
      if (summary.veganSuitable.length) c += '<p>Marked V (vegan suitable): ' + esc(summary.veganSuitable.join(', ')) + '.</p>';
      if (summary.uncoded.length) c += '<p>No code printed for ' + esc(summary.uncoded.join(', ')) + '. That doesn’t mean free from allergens: please ask us.</p>';
      if (summary.sources.indexOf('B') !== -1) c += '<p>Dessert and lassi codes and prices are from our online ordering menu.</p>';
      c += '<blockquote class="statement"><p>“If you have any food allergies please inform a member of staff as some food items contain: Dairy (D), Eggs (E) Nuts (N) Gluten (G), Crustaceans (C), Mustard (M) Soya (S) and some are Vegan suitable (V)”</p></blockquote>';
      c += '<p>For collection: “If you have any food allergies, please let us know by adding it into the order notes.”</p>';
      el.codes.innerHTML = c;
      el.codes.hidden = false;
    } else {
      el.codes.innerHTML = '';
      el.codes.hidden = true;
    }

    if (opts.focusRemoveAt != null) {
      var rm = $$('[data-remove]', el.lines);
      var target = rm[Math.min(opts.focusRemoveAt, rm.length - 1)];
      (target || el.count).focus();
    }
  }

  /* ---------- Messages ---------- */
  var liveTimer, toastTimer;
  function announce(msg) {
    if (!el.live) return;
    clearTimeout(liveTimer);
    el.live.textContent = '';
    liveTimer = setTimeout(function () { el.live.textContent = msg; }, 40);
  }
  function toast(msg) {
    if (!el.toast || !mqSheet.matches || panel.classList.contains('is-open')) return;
    el.toast.textContent = msg;
    el.toast.classList.add('is-shown');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.toast.classList.remove('is-shown'); }, 2600);
  }
  function status(msg) { el.status.textContent = msg; }

  var NUM = ['', 'The', 'Both', 'All three', 'All four'];
  function fullMessage(g, name) {
    var places = g.cap === 1 ? g.one.toLowerCase() + ' place is' : g.one.toLowerCase() + ' places are';
    return NUM[g.cap] + ' ' + places + ' taken. Remove one to add ' + name + '.';
  }

  /* ---------- Actions ---------- */
  function choose(id, portionKey, btn) {
    var res = Core.toggle(selection, { id: id, portion: portionKey }, cat);
    var item = cat.byId[id];
    if (!item) return;
    var p = Core.portionOf(cat, { id: id, portion: portionKey });
    var as = p && p.label ? ' as a ' + p.label.toLowerCase() : '';
    var msg;
    switch (res.status) {
      case 'added': msg = 'Added ' + item.name + as + '.'; break;
      case 'removed': msg = 'Took ' + item.name + ' off your plate.'; break;
      case 'switched': msg = item.name + ' is now on your plate' + as + '.'; break;
      case 'replaced': msg = 'Swapped ' + cat.byId[res.previous.id].name + ' for ' + item.name + '.'; break;
      case 'full':
        msg = fullMessage(Core.groupDef(res.group), item.name);
        if (btn) { btn.classList.remove('is-blocked'); void btn.offsetWidth; btn.classList.add('is-blocked'); }
        status(msg); toast(msg); announce(msg);
        return;
      default: return;
    }
    selection = res.selection;
    save();
    render();
    status(msg);
    toast(msg + ' ' + summary.total);
    if (el.toggle) { el.toggle.classList.remove('bump'); void el.toggle.offsetWidth; el.toggle.classList.add('bump'); }
    announce(msg + ' ' + Core.describe(summary));
  }

  document.addEventListener('click', function (e) {
    var add = e.target.closest('.add');
    if (add) { choose(add.getAttribute('data-id'), add.getAttribute('data-portion'), add); return; }

    var rm = e.target.closest('[data-remove]');
    if (rm) {
      var id = rm.getAttribute('data-remove');
      var idx = $$('[data-remove]', el.lines).indexOf(rm);
      var name = cat.byId[id] ? cat.byId[id].name : 'Dish';
      selection = Core.remove(selection, id);
      save();
      render({ focusRemoveAt: idx });
      status('Took ' + name + ' off your plate.');
      announce('Took ' + name + ' off your plate. ' + Core.describe(summary));
      return;
    }

    if (e.target.closest('[data-thali-toggle]')) { setOpen(!panel.classList.contains('is-open')); return; }
    if (e.target.closest('[data-thali-close]')) { setOpen(false); return; }

    var go = e.target.closest('[data-thali-open]');
    if (go) {
      e.preventDefault();
      if (mqSheet.matches) setOpen(true);
      else { panel.scrollIntoView({ block: 'start' }); panel.focus({ preventScroll: true }); }
    }
  });

  el.clear.addEventListener('click', function () {
    if (!selection.length) { status('Your plate is already empty.'); return; }
    selection = [];
    save();
    render();
    status('Cleared the plate.');
    announce('Cleared the plate. ' + Core.describe(summary));
  });

  el.copy.addEventListener('click', function () {
    var text = Core.asText(summary);
    if (!text) { status('Your plate is empty, so there’s nothing to copy yet.'); return; }
    var done = function () { status('Copied your list. Nothing has been ordered.'); announce('Copied your list.'); };
    var fail = function () { status('Couldn’t copy automatically. Your list is shown above.'); announce('Couldn’t copy automatically.'); };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fail);
      else fail();
    } catch (err) { fail(); }
  });

  el.order.addEventListener('click', function () {
    status('The ordering page opens in a new tab. Nothing has been ordered, and your list isn’t sent there.');
  });

  /* ---------- Mobile sheet ---------- */
  function setOpen(open) {
    if (!el.toggle) return;
    panel.classList.toggle('is-open', open);
    el.toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) { el.toast && el.toast.classList.remove('is-shown'); panel.focus(); }
    else if (mqSheet.matches) el.toggle.focus();
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel.classList.contains('is-open')) setOpen(false);
  });
  var onMq = function () { if (!mqSheet.matches && panel.classList.contains('is-open')) { panel.classList.remove('is-open'); el.toggle && el.toggle.setAttribute('aria-expanded', 'false'); } };
  if (mqSheet.addEventListener) mqSheet.addEventListener('change', onMq); else if (mqSheet.addListener) mqSheet.addListener(onMq);

  /* ---------- Per-viewer convenience: remember the plate in this browser only ---------- */
  function load() {
    try { return Core.sanitise(JSON.parse(window.localStorage.getItem(STORE) || '[]'), cat); } catch (e) { return []; }
  }
  function save() {
    try { window.localStorage.setItem(STORE, JSON.stringify(selection)); } catch (e) { /* storage unavailable: fine */ }
  }

  render();
})();
