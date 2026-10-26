/* The three-tier stand: set-tea data (verbatim from the 2024 set-tea menus in the copy deck)
   and the renderer that lays each tea out on the drawn stand.
   Works as a browser script and as a CommonJS module (the build bakes the no-JS state from it). */
(function (root) {
  'use strict';

  var BOOK_SET_TEA = 'https://booking.resdiary.com/widget/Standard/NewensTheOriginalMaidsofHonour/33177';

  /* Plates in the stand drawing (scene viewBox 0 0 600 680). ry = rx * 0.27 */
  var PLATES = {
    top:    { cx: 300, cy: 175, rx: 118 },
    middle: { cx: 300, cy: 330, rx: 136 },
    bottom: { cx: 300, cy: 485, rx: 156 }
  };
  var RY = 0.27;

  /* Drawn items: symbol id, natural size, filling colour where the symbol uses currentColor */
  var ITEMS = {
    'sw-cheddar':  { s: 'f-sand-w', w: 56, h: 46, c: '#E5B23E' },
    'sw-salmon':   { s: 'f-sand-b', w: 56, h: 46, c: '#EC8C6C' },
    'sw-ham':      { s: 'f-sand-w', w: 56, h: 46, c: '#E39AA0' },
    'sw-egg':      { s: 'f-sand-b', w: 56, h: 46, c: '#F1D774' },
    'sw-cucumber': { s: 'f-sand-w', w: 56, h: 46, c: '#8FB85E' },
    'scone':       { s: 'f-scone', w: 48, h: 40 },
    'scone-fruit': { s: 'f-scone-fruit', w: 48, h: 40 },
    'cream':       { s: 'f-cream', w: 26, h: 22 },
    'jam':         { s: 'f-jam', w: 26, h: 22 },
    'roll':        { s: 'f-roll', w: 50, h: 24 },
    'pie':         { s: 'f-pie', w: 54, h: 36 },
    'quiche':      { s: 'f-quiche', w: 54, h: 32 },
    'pasty':       { s: 'f-pasty', w: 58, h: 32 },
    'cheesecake':  { s: 'f-cheesecake', w: 52, h: 40 },
    'carrot':      { s: 'f-carrot', w: 52, h: 40 },
    'chocolate':   { s: 'f-chocolate', w: 52, h: 40 },
    'vanilla':     { s: 'f-vanilla', w: 52, h: 40 },
    'truffles':    { s: 'f-truffles', w: 50, h: 24 },
    'fruit':       { s: 'f-fruit', w: 50, h: 28 },
    'tart':        { s: 'f-tart', w: 50, h: 30 },
    'patisserie':  { s: 'f-cloche', w: 46, h: 48 },
    'or':          { text: 'or', w: 20, h: 16 }
  };

  var SANDWICHES = ['sw-cheddar', 'sw-salmon', 'sw-ham', 'sw-egg', 'sw-cucumber'];
  var SANDWICH_LINE = 'English Cheddar | Oak-Smoked Salmon | Roasted Ham | Free Range Egg Mayonnaise | Cucumber';
  var COFFEE = { t: 'Tea or Filter Coffee (unlimited refreshes)', d: 'Upgrade your coffee to a Latte | Capuchino | Mocha | Hot chocolate for extra £2', sic: 'Capuchino' };
  var SCONES_TWO = { t: 'Two Scones served with Clotted Cream (or English Butter) & Preserve', d: 'Plain | Fruit' };

  var TEAS = [
    {
      id: 'high', name: 'High Tea', price: '£24.50', per: 'per person', from: '10:00',
      tiers: {
        top: [{ t: "Your choice from Today's Patisserie or Maids of Honour Tart" }],
        middle: [SCONES_TWO],
        bottom: [{ t: 'Traditional Tea-Sandwiches (5 quarters)', d: SANDWICH_LINE }],
        alongside: [COFFEE]
      },
      art: {
        top: [['patisserie', 'or', 'tart']],
        middle: [['scone', 'scone-fruit'], ['jam', 'cream']],
        bottom: [['sw-cheddar', 'sw-salmon', 'sw-ham'], ['sw-egg', 'sw-cucumber']]
      },
      table: { glass: 0 }
    },
    {
      id: 'savoury', name: 'Savoury High Tea', price: '£26.50', per: 'per person', from: '10:00',
      tiers: {
        top: [{ t: 'Portion of our Quiche or a Savoury Pasty' }],
        middle: [{ t: 'One Scone served with Clotted Cream (or English Butter) & Preserve', d: 'Plain | Fruit' }],
        bottom: [{ t: 'Traditional Tea-Sandwiches (5 quarters)', d: SANDWICH_LINE }, { t: 'Two Cocktail Sausage Rolls' }],
        alongside: [COFFEE]
      },
      art: {
        top: [['quiche', 'or', 'pasty']],
        middle: [['scone'], ['jam', 'cream']],
        bottom: [['sw-cheddar', 'sw-salmon', 'sw-ham', 'sw-egg'], ['roll', 'sw-cucumber', 'roll']]
      },
      table: { glass: 0 },
      note: 'The top plate holds the quiche or pasty: our reading of the menu, to confirm with the tearoom.'
    },
    {
      id: 'special', name: 'The Special Set Tea', price: '£50', per: 'per person', from: '10:00',
      tiers: {
        top: [
          { t: "Small 'Taster' Cake Portions (four)", d: 'Passionfruit Cheesecake | Iced Carrot Cake | Rich Chocolate Cake | Vanilla Slice', or: 'Choice from the Patisserie Counter (one large cake)' },
          { t: 'Gift Pack Chocolate Truffles (four)' }
        ],
        middle: [{ t: 'Two Scones', d: 'Plain | Fruit (with Clotted Cream (or Butter) and Jam)' }],
        bottom: [
          { t: 'Five Quarters of Tea Sandwiches', d: SANDWICH_LINE },
          { t: 'Cocktail Sausage Roll' },
          { t: 'Half Portion of Pie', d: 'Chicken | Steak | Salmon' },
          { t: 'Half Portion of Quiche', d: 'Cheese & Leek | Bacon & Tomato | Mushroom | Salmon & Spinach' }
        ],
        alongside: [
          { t: 'Glass of Prosecco | Kir Royale | Glass of Red or White wine | Soft Drink', d: 'Upgrade your drink to a 125ml glass of Champagne for extra £4' },
          COFFEE
        ]
      },
      art: {
        top: [['cheesecake', 'carrot', 'chocolate', 'vanilla'], ['truffles']],
        middle: [['scone', 'scone-fruit'], ['jam', 'cream']],
        bottom: [['sw-cheddar', 'sw-salmon', 'sw-ham', 'sw-egg', 'sw-cucumber'], ['pie', 'roll', 'quiche']]
      },
      table: { glass: 1, wine: 'prosecco' }
    },
    {
      id: 'prosecco', name: 'Prosecco Set Tea', price: '£35', per: 'for one', from: '11:00', fizz: 'Prosecco',
      wine: 'Prosecco Extra Dry Borgo Del Col Alto',
      party: [
        { n: 1, price: '£35', line: 'for 1, served with a glass of Prosecco (200ml)' },
        { n: 2, price: '£70', line: 'for 2, served with 2 glasses of Prosecco (200ml)' },
        { n: 3, price: '£105', line: 'for 3, served with a full bottle of Prosecco' },
        { n: 4, price: '£115', line: 'for 4, served with a full bottle of Prosecco' }
      ],
      tiers: {
        top: [{ t: "Choice from Today's Patisserie (1 per person)" }, { t: 'Four Chocolate Truffles' }],
        middle: [SCONES_TWO],
        bottom: [{ t: 'Traditional Tea-Sandwiches (5 quarters per person)', d: SANDWICH_LINE }],
        alongside: [{ t: 'Prosecco Extra Dry Borgo Del Col Alto' }, COFFEE]
      },
      art: {
        top: [['patisserie', 'truffles']],
        middle: [['scone', 'scone-fruit'], ['jam', 'cream']],
        bottom: [['sw-cheddar', 'sw-salmon', 'sw-ham'], ['sw-egg', 'sw-cucumber']]
      },
      table: { wine: 'prosecco' }
    },
    {
      id: 'champagne', name: 'Champagne Set Tea', price: '£45', per: 'for one', from: '11:00', fizz: 'Champagne',
      wine: "Vauban Frère's Brut Champagne",
      party: [
        { n: 1, price: '£45', line: 'for 1, served with a glass of Champagne (200ml)' },
        { n: 2, price: '£90', line: 'for 2, served with 2 glasses of Champagne (200ml)' },
        { n: 3, price: '£135', line: 'for 3, served with a full bottle of Champagne' },
        { n: 4, price: '£160', line: 'for 4, served with a full bottle of Champagne' }
      ],
      tiers: {
        top: [{ t: "Choice from Today's Patisserie (1 per person)" }, { t: 'Soft Fruits (Seasonal) and Four Chocolate Truffles' }],
        middle: [SCONES_TWO],
        bottom: [{ t: 'Traditional Tea-Sandwiches (5 quarters per person)', d: SANDWICH_LINE }],
        alongside: [{ t: "Vauban Frère's Brut Champagne" }, COFFEE]
      },
      art: {
        top: [['patisserie'], ['fruit', 'truffles']],
        middle: [['scone', 'scone-fruit'], ['jam', 'cream']],
        bottom: [['sw-cheddar', 'sw-salmon', 'sw-ham'], ['sw-egg', 'sw-cucumber']]
      },
      table: { wine: 'champagne' }
    }
  ];

  var TIER_ORDER = ['bottom', 'middle', 'top'];
  var SCALE = { top: 1.22, middle: 1.36, bottom: 1.3 };

  function r2(n) { return Math.round(n * 10) / 10; }

  /* Lay out one tier: rows[0] is the back row, rows[last] the front row */
  function layoutTier(tier, rows) {
    var p = PLATES[tier], ry = p.rx * RY, out = [];
    var n = rows.length;
    rows.forEach(function (row, ri) {
      var back = n > 1 && ri < n - 1;
      var s = SCALE[tier] * (back ? 0.9 : 1);
      var base = n > 1 ? (back ? p.cy - ry * 0.22 : p.cy + ry * 0.38) : p.cy + ry * 0.16;
      var overlap = 0.1;
      var raw = row.reduce(function (a, k) { return a + ITEMS[k].w; }, 0) * (1 - overlap) + ITEMS[row[row.length - 1]].w * overlap;
      var maxW = p.rx * (back ? 1.34 : 1.5);
      if (raw * s > maxW) s = maxW / raw;
      var widths = row.map(function (k) { return ITEMS[k].w * s; });
      var total = raw * s;
      var x = p.cx - total / 2;
      row.forEach(function (k, i) {
        var it = ITEMS[k], w = widths[i], h = it.h * s;
        out.push({ k: k, it: it, x: r2(x), y: r2(base - h), w: r2(w), h: r2(h), tier: tier });
        x += w * (1 - overlap);
      });
    });
    return out;
  }

  function itemSVG(o, idx) {
    var inner;
    if (o.it.text) {
      inner = '<text x="' + r2(o.x + o.w / 2) + '" y="' + r2(o.y + o.h * 0.8) + '" class="st-or" text-anchor="middle">' + o.it.text + '</text>';
    } else {
      inner = '<use href="#' + o.it.s + '" x="' + o.x + '" y="' + o.y + '" width="' + o.w + '" height="' + o.h + '"' + (o.it.c ? ' color="' + o.it.c + '"' : '') + '/>';
    }
    return '<g class="it" data-tier="' + o.tier + '" style="--i:' + idx + '">' + inner + '</g>';
  }

  /* Returns {bottom, middle, top} SVG strings */
  function renderItems(teaId) {
    var tea = byId(teaId), res = {};
    TIER_ORDER.forEach(function (tier) {
      res[tier] = layoutTier(tier, tea.art[tier]).map(itemSVG).join('');
    });
    return res;
  }

  /* Things on the tablecloth beside the stand: glasses and bottle */
  function renderTable(teaId, guests) {
    var tea = byId(teaId), s = '';
    var wine = tea.table.wine;
    if (!wine) return '';
    var liquid = wine === 'champagne' ? '#E6C77E' : '#EEE0A6';
    var flutes = tea.party ? guests : (tea.table.glass || 0);
    var bottle = tea.party && guests >= 3;
    var x0 = 478;
    if (bottle) s += '<g class="it" data-tier="table" style="--i:0"><use href="#t-bottle" x="' + (x0 + 52) + '" y="520" width="34" height="104" color="' + (wine === 'champagne' ? '#C9A85A' : '#D9C98E') + '"/></g>';
    for (var i = 0; i < flutes; i++) {
      var fx = x0 + (i % 2) * 24 - (i > 1 ? 12 : 0), fy = 556 + (i > 1 ? 14 : 0);
      s += '<g class="it" data-tier="table" style="--i:' + (i + 1) + '"><use href="#t-flute" x="' + fx + '" y="' + fy + '" width="22" height="76" color="' + liquid + '"/></g>';
    }
    return s;
  }

  function byId(id) {
    for (var i = 0; i < TEAS.length; i++) if (TEAS[i].id === id) return TEAS[i];
    return TEAS[0];
  }

  var api = { TEAS: TEAS, PLATES: PLATES, renderItems: renderItems, renderTable: renderTable, byId: byId, BOOK: BOOK_SET_TEA };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.MaidsStand = api;

  /* ---------- Browser behaviour ---------- */
  if (typeof document === 'undefined') return;

  function init() {
    var section = document.getElementById('teas');
    if (!section) return;
    var form = section.querySelector('.st-choose');
    var layers = {
      bottom: section.querySelector('[data-layer="bottom"]'),
      middle: section.querySelector('[data-layer="middle"]'),
      top: section.querySelector('[data-layer="top"]'),
      table: section.querySelector('[data-layer="table"]')
    };
    if (!form || !layers.bottom) return;

    var panels = section.querySelectorAll('.st-tea');
    var partyBox = section.querySelector('.st-party');
    var priceEl = section.querySelector('.st-price__num');
    var perEl = section.querySelector('.st-price__per');
    var fromEl = section.querySelector('.st-from');
    var live = section.querySelector('.st-live');
    var shownEl = section.querySelector('.st-shown__name');
    var scene = section.querySelector('.st-scene');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    var canAnimate = function () { return !reduce.matches && typeof Element.prototype.animate === 'function'; };

    var state = { tea: 'high', guests: 1, busy: null };

    section.classList.add('is-enhanced');

    function current() { return byId(state.tea); }

    function updateText() {
      var tea = current();
      panels.forEach(function (p) { p.hidden = p.getAttribute('data-tea') !== tea.id; });
      scene.setAttribute('data-tea', tea.id);
      section.setAttribute('data-fizz', tea.fizz ? 'true' : 'false');
      if (tea.party) {
        partyBox.hidden = false;
        var row = tea.party[state.guests - 1];
        priceEl.textContent = row.price;
        perEl.textContent = row.line;
      } else {
        partyBox.hidden = true;
        priceEl.textContent = tea.price;
        perEl.textContent = tea.per;
      }
      fromEl.textContent = (tea.fizz ? 'The ' + tea.fizz + ' teas can be booked' : (/^The /.test(tea.name) ? 'Book ' : 'Book a ') + tea.name) + ' from ' + tea.from + ', any day.';
      if (shownEl) shownEl.textContent = tea.name;
      live.textContent = tea.name + ' on the stand. ' + priceEl.textContent + ' ' + perEl.textContent + '.';
    }

    function paint() {
      var items = renderItems(state.tea);
      layers.bottom.innerHTML = items.bottom;
      layers.middle.innerHTML = items.middle;
      layers.top.innerHTML = items.top;
      layers.table.innerHTML = renderTable(state.tea, state.guests);
    }

    function all(sel) { return scene.querySelectorAll(sel); }

    var ORDER = { bottom: 0, middle: 1, top: 2, table: 3 };

    function setDown(list) {
      var anims = [];
      list.forEach(function (el) {
        var t = el.getAttribute('data-tier');
        var i = +getComputedStyle(el).getPropertyValue('--i') || 0;
        var delay = ORDER[t] * 150 + i * 45;
        anims.push(el.animate([
          { transform: 'translateY(-26px)', opacity: 0 },
          { transform: 'translateY(2px)', opacity: 1, offset: 0.72 },
          { transform: 'translateY(0)', opacity: 1 }
        ], { duration: 520, delay: delay, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' }));
      });
      return anims;
    }

    function liftOff(list) {
      var anims = [];
      list.forEach(function (el) {
        var t = el.getAttribute('data-tier');
        var delay = (3 - ORDER[t]) * 50;
        anims.push(el.animate([
          { transform: 'translateY(0)', opacity: 1 },
          { transform: 'translateY(-16px)', opacity: 0 }
        ], { duration: 240, delay: delay, easing: 'cubic-bezier(.4,0,.6,1)', fill: 'forwards' }));
      });
      return Promise.all(anims.map(function (a) { return a.finished.catch(function () {}); }));
    }

    function change(animateTable, tableOnly) {
      updateText();
      if (!canAnimate()) { paint(); return; }
      var token = {};
      state.busy = token;
      var old = tableOnly ? all('[data-layer="table"] .it') : all('.it');
      liftOff(Array.prototype.slice.call(old)).then(function () {
        if (state.busy !== token) return;
        if (tableOnly) layers.table.innerHTML = renderTable(state.tea, state.guests);
        else paint();
        setDown(Array.prototype.slice.call(tableOnly ? all('[data-layer="table"] .it') : all('.it')));
      });
    }

    form.addEventListener('change', function (e) {
      var t = e.target;
      if (t.name === 'tea') {
        state.tea = t.value;
        state.guests = 1;
        var g = form.querySelector('input[name="guests"][value="1"]');
        if (g) g.checked = true;
        change();
      } else if (t.name === 'guests') {
        state.guests = +t.value;
        change(true, true);
      }
    });

    /* Tier rows light their plate in the drawing */
    section.querySelectorAll('[data-tier-row]').forEach(function (row) {
      var tier = row.getAttribute('data-tier-row');
      var plate = scene.querySelector('.st-plate[data-tier="' + tier + '"]');
      if (!plate) return;
      var on = function () { plate.classList.add('is-lit'); };
      var off = function () { plate.classList.remove('is-lit'); };
      row.addEventListener('mouseenter', on);
      row.addEventListener('mouseleave', off);
      row.addEventListener('focusin', on);
      row.addEventListener('focusout', off);
    });

    /* Respect any choice the browser restored on back/forward */
    var checked = form.querySelector('input[name="tea"]:checked');
    if (checked) state.tea = checked.value;
    var gChecked = form.querySelector('input[name="guests"]:checked');
    if (gChecked) state.guests = +gChecked.value;
    updateText();
    paint();

    /* First sight of the stand: the kitchen sets it, bottom plate first, and the chrome catches the light */
    if (canAnimate() && 'IntersectionObserver' in window) {
      var pre = Array.prototype.slice.call(all('.it'));
      pre.forEach(function (el) { el.style.opacity = '0'; });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          io.disconnect();
          pre.forEach(function (el) { el.style.opacity = ''; });
          setDown(Array.prototype.slice.call(all('.it')));
          scene.classList.add('is-glinting');
        });
      }, { threshold: 0.35 });
      io.observe(scene);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(typeof window !== 'undefined' ? window : globalThis);
