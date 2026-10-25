/*
 * Swagat Concept A: "Build a thali" core.
 * Pure functions only: no DOM, no globals touched, no I/O. Money is handled
 * in integer pence so totals never pick up floating-point drift.
 * Runs in the browser (as window.ThaliCore) and in Node (require) for tests.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ThaliCore = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* The plate: where each kind of dish sits, and how many it holds. */
  var GROUPS = [
    { key: 'starter', label: 'Starters', one: 'Starter', cap: 2 },
    { key: 'main', label: 'Mains', one: 'Main', cap: 2 },
    { key: 'side', label: 'Sides', one: 'Side', cap: 3 },
    { key: 'rice', label: 'Rice', one: 'Rice', cap: 1 },
    { key: 'bread', label: 'Bread', one: 'Bread', cap: 2 },
    { key: 'raita', label: 'Raita & salad', one: 'Raita', cap: 1 },
    { key: 'sweet', label: 'Dessert', one: 'Sweet', cap: 1 },
    { key: 'lassi', label: 'Lassi', one: 'Lassi', cap: 1 }
  ];

  /* The restaurant's published key. V is "Vegan suitable", not an allergen. */
  var CODE_KEY = {
    D: 'Dairy', E: 'Eggs', N: 'Nuts', G: 'Gluten', C: 'Crustaceans',
    M: 'Mustard', S: 'Soya', V: 'Vegan suitable'
  };
  var ALLERGEN_ORDER = ['D', 'E', 'N', 'G', 'C', 'M', 'S'];

  function groupDef(key, groups) {
    groups = groups || GROUPS;
    for (var i = 0; i < groups.length; i++) if (groups[i].key === key) return groups[i];
    return null;
  }

  /* "£14.50", "£ 14.25", "4.5 GBP", "19.99" -> integer pence. NaN if unreadable. */
  function parsePrice(text) {
    if (typeof text === 'number') return Math.round(text * 100);
    var s = String(text == null ? '' : text).replace(/£|GBP|\s/gi, '');
    var m = /^(\d+)(?:\.(\d{1,2}))?$/.exec(s);
    if (!m) return NaN;
    var pence = m[2] ? (m[2].length === 1 ? m[2] + '0' : m[2]) : '00';
    return parseInt(m[1], 10) * 100 + parseInt(pence, 10);
  }

  /* 3250 -> "£32.50" */
  function formatPence(p) {
    if (typeof p !== 'number' || !isFinite(p)) return '';
    var neg = p < 0; p = Math.abs(Math.round(p));
    var pounds = String(Math.floor(p / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    var rem = p % 100;
    return (neg ? '-' : '') + '£' + pounds + '.' + (rem < 10 ? '0' : '') + rem;
  }

  /* "G, D" / "C,D" / "" -> ["G","D"] in printed order, keeping only known codes. */
  function parseCodes(text) {
    if (Array.isArray(text)) return text.filter(function (c) { return CODE_KEY[c]; });
    return String(text || '').split(/[\s,]+/).filter(function (c) { return CODE_KEY[c]; });
  }

  /*
   * Build a catalogue from plain dish records, e.g.
   * { id, name, codes: "G, D", source: "A", portions: [{ key: "one", label: "", price: "£3.75", group: "bread" }] }
   * Returns { byId, order, errors }.
   */
  function makeCatalogue(records, groups) {
    var byId = {}, order = [], errors = [];
    (records || []).forEach(function (r) {
      if (!r || !r.id || !r.name) { errors.push('Record without id or name'); return; }
      if (byId[r.id]) { errors.push('Duplicate id: ' + r.id); return; }
      var portions = (r.portions || []).map(function (p) {
        var pence = parsePrice(p.price);
        if (isNaN(pence)) errors.push('Unreadable price for ' + r.id + ': ' + p.price);
        if (!groupDef(p.group, groups)) errors.push('Unknown group for ' + r.id + ': ' + p.group);
        return { key: p.key, label: p.label || '', pence: pence, group: p.group };
      });
      if (!portions.length) errors.push('No portions for ' + r.id);
      byId[r.id] = {
        id: r.id, name: r.name, codes: parseCodes(r.codes), source: r.source || 'A',
        tint: r.tint || null, portions: portions
      };
      order.push(r.id);
    });
    return { byId: byId, order: order, errors: errors };
  }

  function portionOf(cat, entry) {
    var item = cat.byId[entry.id];
    if (!item) return null;
    for (var i = 0; i < item.portions.length; i++) {
      if (item.portions[i].key === entry.portion) return item.portions[i];
    }
    return null;
  }

  function inGroup(selection, cat, key) {
    return selection.filter(function (e) {
      var p = portionOf(cat, e);
      return p && p.group === key;
    });
  }

  /*
   * Toggle one dish/portion on the plate. Never mutates the input.
   * Returns { selection, status, group, previous }.
   *   added     - placed in a free katori
   *   removed   - it was there with this portion; now taken off
   *   switched  - the dish was there as another portion (main <-> side); moved
   *   replaced  - a one-place katori (rice, raita, dessert, lassi) swapped its dish
   *   full      - every katori of that kind is taken; nothing changed
   *   invalid   - unknown dish or portion; nothing changed
   */
  function toggle(selection, choice, cat, groups) {
    selection = selection || [];
    var item = choice && cat.byId[choice.id];
    var portion = item && portionOf(cat, choice);
    if (!item || !portion) return { selection: selection.slice(), status: 'invalid', group: null, previous: null };

    var existing = null;
    for (var i = 0; i < selection.length; i++) if (selection[i].id === choice.id) existing = selection[i];

    if (existing && existing.portion === choice.portion) {
      return {
        selection: selection.filter(function (e) { return e.id !== choice.id; }),
        status: 'removed', group: portion.group, previous: null
      };
    }

    var base = selection.filter(function (e) { return e.id !== choice.id; });
    var g = groupDef(portion.group, groups);
    var taken = inGroup(base, cat, g.key);
    var previous = null;

    if (taken.length >= g.cap) {
      if (g.cap === 1) {
        previous = taken[0];
        base = base.filter(function (e) { return e.id !== previous.id; });
      } else {
        return { selection: selection.slice(), status: 'full', group: g.key, previous: null };
      }
    }

    return {
      selection: base.concat([{ id: choice.id, portion: choice.portion }]),
      status: existing ? 'switched' : (previous ? 'replaced' : 'added'),
      group: g.key,
      previous: previous
    };
  }

  function remove(selection, id) {
    return (selection || []).filter(function (e) { return e.id !== id; });
  }

  /* Rebuild a saved selection safely: drops unknown dishes, duplicates and overflow. */
  function sanitise(saved, cat, groups) {
    var out = [];
    (Array.isArray(saved) ? saved : []).forEach(function (e) {
      if (!e || typeof e.id !== 'string' || typeof e.portion !== 'string') return;
      if (out.some(function (o) { return o.id === e.id; })) return;
      var p = portionOf(cat, e);
      if (!p) return;
      var g = groupDef(p.group, groups);
      if (inGroup(out, cat, g.key).length >= g.cap) return;
      out.push({ id: e.id, portion: e.portion });
    });
    return out;
  }

  /*
   * The running summary: lines, an estimated total from published prices,
   * per-katori counts, and the codes printed against the chosen dishes.
   */
  function summarise(selection, cat, groups) {
    groups = groups || GROUPS;
    selection = selection || [];
    var lines = [], total = 0, codeSet = {}, vegan = [], uncoded = [], sources = {};

    selection.forEach(function (e) {
      var item = cat.byId[e.id], p = portionOf(cat, e);
      if (!item || !p) return;
      lines.push({
        id: item.id, name: item.name, portion: p.key, portionLabel: p.label,
        group: p.group, pence: p.pence, price: formatPence(p.pence),
        codes: item.codes.slice(), source: item.source, tint: item.tint
      });
      total += p.pence;
      sources[item.source] = true;
      item.codes.forEach(function (c) {
        if (c === 'V') return;
        codeSet[c] = true;
      });
      if (item.codes.indexOf('V') !== -1) vegan.push(item.name);
      if (!item.codes.length) uncoded.push(item.name);
    });

    var byGroup = groups.map(function (g) {
      var gl = lines.filter(function (l) { return l.group === g.key; });
      return { key: g.key, label: g.label, one: g.one, cap: g.cap, count: gl.length, full: gl.length >= g.cap, lines: gl };
    });

    return {
      lines: lines,
      count: lines.length,
      totalPence: total,
      total: formatPence(total),
      groups: byGroup,
      places: groups.reduce(function (n, g) { return n + g.cap; }, 0),
      allergenCodes: ALLERGEN_ORDER.filter(function (c) { return codeSet[c]; })
        .map(function (c) { return { code: c, label: CODE_KEY[c] }; }),
      veganSuitable: vegan,
      uncoded: uncoded,
      sources: Object.keys(sources).sort()
    };
  }

  /* One short sentence for the polite live region. */
  function describe(summary) {
    if (!summary.count) return 'Your thali is empty.';
    return summary.count + (summary.count === 1 ? ' dish' : ' dishes') +
      '. Estimated total from published prices ' + summary.total + ', to confirm.';
  }

  /* Plain-text list for copying into the ordering page or a message. */
  function asText(summary) {
    if (!summary.count) return '';
    var out = ['My thali, from the Swagat menu:'];
    summary.lines.forEach(function (l) {
      out.push('- ' + l.name + (l.portionLabel ? ' (' + l.portionLabel.toLowerCase() + ')' : '') + ' ' + l.price);
    });
    out.push('Estimated total from published prices: ' + summary.total + ' (to confirm)');
    return out.join('\n');
  }

  /* Word-wrap a dish name for a katori: at most maxLines lines of maxChars. */
  function wrapLabel(text, maxChars, maxLines) {
    var words = String(text || '').split(/\s+/).filter(Boolean), lines = [], cur = '';
    words.forEach(function (w) {
      if (!cur) cur = w;
      else if ((cur + ' ' + w).length <= maxChars) cur += ' ' + w;
      else { lines.push(cur); cur = w; }
    });
    if (cur) lines.push(cur);
    if (lines.length > maxLines) {
      lines = lines.slice(0, maxLines);
      var last = lines[maxLines - 1];
      lines[maxLines - 1] = (last.length >= maxChars ? last.slice(0, maxChars - 1) : last) + '…';
    }
    return lines;
  }

  return {
    GROUPS: GROUPS, CODE_KEY: CODE_KEY, ALLERGEN_ORDER: ALLERGEN_ORDER,
    groupDef: groupDef, parsePrice: parsePrice, formatPence: formatPence, parseCodes: parseCodes,
    makeCatalogue: makeCatalogue, portionOf: portionOf, toggle: toggle, remove: remove,
    sanitise: sanitise, summarise: summarise, describe: describe, asText: asText, wrapLabel: wrapLabel
  };
});
