/* Tests for js/thali-core.js. Run: node --test tests/  (Node 18+, no dependencies) */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Core = require('../js/thali-core.js');

/* A small hand-built catalogue with prices copied from the copy deck (version A). */
const records = [
  { id: 'malabar-fish-curry', name: 'Malabar Fish Curry', codes: '', portions: [{ key: 'one', price: '£15.00', group: 'main' }] },
  { id: 'butter-chicken', name: 'Butter Chicken', codes: '', portions: [{ key: 'one', price: '£ 14.25', group: 'main' }] },
  { id: 'chicken-korma', name: 'Chicken Korma', codes: '', portions: [{ key: 'one', price: '£14.00', group: 'main' }] },
  { id: 'saag', name: 'Saag', codes: '', portions: [{ key: 'main', label: 'Main', price: '£9.50', group: 'main' }, { key: 'side', label: 'Side', price: '£6.50', group: 'side' }] },
  { id: 'dal-makhani', name: 'Dal Makhani', codes: '', portions: [{ key: 'main', label: 'Main', price: '£8.99', group: 'main' }, { key: 'side', label: 'Side', price: '£6.25', group: 'side' }] },
  { id: 'gobi-masala', name: 'Gobi Masala', codes: '', portions: [{ key: 'main', label: 'Main', price: '£9.99', group: 'main' }, { key: 'side', label: 'Side', price: '£6.75', group: 'side' }] },
  { id: 'mix-veg-jalfreezie', name: 'Mix Veg Jalfreezie', codes: 'V', portions: [{ key: 'main', label: 'Main', price: '£9.50 ', group: 'main' }, { key: 'side', label: 'Side', price: '£6.50', group: 'side' }] },
  { id: 'baigan-bharta', name: 'Baigan Bharta', codes: '', portions: [{ key: 'main', label: 'Main', price: '£9.99 ', group: 'main' }, { key: 'side', label: 'Side', price: '£6.99', group: 'side' }] },
  { id: 'jeera-rice', name: 'Jeera Rice', codes: 'V', portions: [{ key: 'one', price: '£4.75', group: 'rice' }] },
  { id: 'pulao-rice', name: 'Pulao rice', codes: 'V', portions: [{ key: 'one', price: '£4.75', group: 'rice' }] },
  { id: 'tandoori-naan', name: 'Tandoori Naan', codes: 'G, D', portions: [{ key: 'one', price: '£3.75', group: 'bread' }] },
  { id: 'peshwari-naan', name: 'Peshwari Naan', codes: 'G, D, N', portions: [{ key: 'one', price: '£4.50', group: 'bread' }] },
  { id: 'cucumber-raita', name: 'Cucumber Raita', codes: 'D', portions: [{ key: 'one', price: '£2.50', group: 'raita' }] },
  { id: 'prawn-puri', name: 'Prawn Puri', codes: 'G,C', portions: [{ key: 'one', price: '£8.99', group: 'starter' }] },
  { id: 'tandoori-chicken', name: 'Tandoori Chicken', codes: '', portions: [{ key: 'half', label: 'Half', price: '£9.99', group: 'main' }, { key: 'full', label: 'Full', price: '£19.99', group: 'main' }] },
  { id: 'gulab-jamun', name: 'Gulab Jamun', codes: 'D, G', source: 'B', portions: [{ key: 'one', price: '4.5 GBP', group: 'sweet' }] },
  { id: 'mango-lassi', name: 'Mango Lassi', codes: 'D', source: 'B', portions: [{ key: 'one', price: '4.25 GBP', group: 'lassi' }] },
];
const cat = Core.makeCatalogue(records);
const add = (sel, id, portion = 'one') => Core.toggle(sel, { id, portion }, cat);

test('catalogue builds without errors', () => {
  assert.deepEqual(cat.errors, []);
  assert.equal(cat.order.length, records.length);
});

test('parsePrice reads every printed format into integer pence', () => {
  assert.equal(Core.parsePrice('£14.50'), 1450);
  assert.equal(Core.parsePrice('£ 14.25'), 1425);
  assert.equal(Core.parsePrice('£ 3.00'), 300);
  assert.equal(Core.parsePrice('£0.70'), 70);
  assert.equal(Core.parsePrice('4.5 GBP'), 450);
  assert.equal(Core.parsePrice('4 GBP'), 400);
  assert.equal(Core.parsePrice('£9.50 '), 950);
  assert.ok(Number.isNaN(Core.parsePrice('From6.5 GBP')));
  assert.ok(Number.isNaN(Core.parsePrice('')));
});

test('formatPence', () => {
  assert.equal(Core.formatPence(0), '£0.00');
  assert.equal(Core.formatPence(70), '£0.70');
  assert.equal(Core.formatPence(1999), '£19.99');
  assert.equal(Core.formatPence(123456), '£1,234.56');
});

test('a simple thali totals exactly (no float drift)', () => {
  let s = [];
  s = add(s, 'malabar-fish-curry').selection;
  s = add(s, 'saag', 'side').selection;
  s = add(s, 'jeera-rice').selection;
  s = add(s, 'tandoori-naan').selection;
  s = add(s, 'cucumber-raita').selection;
  const sum = Core.summarise(s, cat);
  assert.equal(sum.count, 5);
  assert.equal(sum.totalPence, 1500 + 650 + 475 + 375 + 250);
  assert.equal(sum.total, '£32.50');
});

test('awkward decimals still add exactly: 14.25 + 6.99 + 6.75 = 27.99', () => {
  let s = [];
  s = add(s, 'butter-chicken').selection;
  s = add(s, 'baigan-bharta', 'side').selection;
  s = add(s, 'gobi-masala', 'side').selection;
  assert.equal(Core.summarise(s, cat).total, '£27.99');
});

test('vegetarian mains use the main price as a main and the side price as a side', () => {
  const asMain = Core.summarise(add([], 'saag', 'main').selection, cat);
  const asSide = Core.summarise(add([], 'saag', 'side').selection, cat);
  assert.equal(asMain.total, '£9.50');
  assert.equal(asMain.lines[0].group, 'main');
  assert.equal(asSide.total, '£6.50');
  assert.equal(asSide.lines[0].group, 'side');
});

test('pressing the same portion again removes it', () => {
  const s1 = add([], 'saag', 'side').selection;
  const r = add(s1, 'saag', 'side');
  assert.equal(r.status, 'removed');
  assert.deepEqual(r.selection, []);
});

test('switching a vegetarian dish from main to side changes price and katori, never duplicates', () => {
  const s1 = add([], 'dal-makhani', 'main').selection;
  const r = add(s1, 'dal-makhani', 'side');
  assert.equal(r.status, 'switched');
  assert.deepEqual(r.selection, [{ id: 'dal-makhani', portion: 'side' }]);
  assert.equal(Core.summarise(r.selection, cat).total, '£6.25');
});

test('cap: a third main is refused and the plate is unchanged', () => {
  let s = add([], 'malabar-fish-curry').selection;
  s = add(s, 'butter-chicken').selection;
  const r = add(s, 'chicken-korma');
  assert.equal(r.status, 'full');
  assert.equal(r.group, 'main');
  assert.deepEqual(r.selection, s);
  assert.notEqual(r.selection, s, 'returns a copy, not the same array');
});

test('cap: veg main counts against mains; switching to side when sides are full is refused', () => {
  let s = add([], 'saag', 'main').selection;
  s = add(s, 'dal-makhani', 'side').selection;
  s = add(s, 'gobi-masala', 'side').selection;
  s = add(s, 'baigan-bharta', 'side').selection; // three sides: full
  const r = add(s, 'saag', 'side');
  assert.equal(r.status, 'full');
  assert.deepEqual(r.selection, s);
});

test('one-place katoris swap their dish instead of refusing', () => {
  const s1 = add([], 'jeera-rice').selection;
  const r = add(s1, 'pulao-rice');
  assert.equal(r.status, 'replaced');
  assert.equal(r.previous.id, 'jeera-rice');
  assert.deepEqual(r.selection, [{ id: 'pulao-rice', portion: 'one' }]);
});

test('half and full tandoori chicken are separate published prices', () => {
  assert.equal(Core.summarise(add([], 'tandoori-chicken', 'half').selection, cat).total, '£9.99');
  const r = add(add([], 'tandoori-chicken', 'half').selection, 'tandoori-chicken', 'full');
  assert.equal(r.status, 'switched');
  assert.equal(Core.summarise(r.selection, cat).total, '£19.99');
});

test('unknown dish or portion is rejected without changing anything', () => {
  const s = add([], 'jeera-rice').selection;
  assert.equal(Core.toggle(s, { id: 'nope', portion: 'one' }, cat).status, 'invalid');
  assert.equal(Core.toggle(s, { id: 'saag', portion: 'large' }, cat).status, 'invalid');
});

test('remove() takes a dish off by id and does not mutate', () => {
  const s = add(add([], 'jeera-rice').selection, 'tandoori-naan').selection;
  const out = Core.remove(s, 'jeera-rice');
  assert.deepEqual(out, [{ id: 'tandoori-naan', portion: 'one' }]);
  assert.equal(s.length, 2);
});

test('codes: allergen union in key order, V reported separately, uncoded dishes listed', () => {
  let s = add([], 'prawn-puri').selection;        // G,C
  s = add(s, 'peshwari-naan').selection;           // G, D, N
  s = add(s, 'mix-veg-jalfreezie', 'side').selection; // V
  s = add(s, 'malabar-fish-curry').selection;      // no code printed
  const sum = Core.summarise(s, cat);
  assert.deepEqual(sum.allergenCodes.map((c) => c.code), ['D', 'N', 'G', 'C']);
  assert.deepEqual(sum.veganSuitable, ['Mix Veg Jalfreezie']);
  assert.deepEqual(sum.uncoded, ['Malabar Fish Curry']);
  assert.ok(!sum.allergenCodes.some((c) => c.code === 'V'), 'V is never treated as an allergen');
});

test('sources: dessert and lassi are flagged as version B', () => {
  let s = add([], 'gulab-jamun').selection;
  s = add(s, 'mango-lassi').selection;
  s = add(s, 'jeera-rice').selection;
  const sum = Core.summarise(s, cat);
  assert.deepEqual(sum.sources, ['A', 'B']);
  assert.equal(sum.total, '£13.50');
});

test('sanitise drops unknown ids, duplicates and overflow from saved data', () => {
  const saved = [
    { id: 'malabar-fish-curry', portion: 'one' }, { id: 'malabar-fish-curry', portion: 'one' },
    { id: 'ghost', portion: 'one' }, { id: 'butter-chicken', portion: 'one' }, { id: 'chicken-korma', portion: 'one' },
    { id: 'saag', portion: 'huge' }, 'junk', null,
  ];
  assert.deepEqual(Core.sanitise(saved, cat), [{ id: 'malabar-fish-curry', portion: 'one' }, { id: 'butter-chicken', portion: 'one' }]);
  assert.deepEqual(Core.sanitise('not an array', cat), []);
});

test('describe() and asText()', () => {
  assert.equal(Core.describe(Core.summarise([], cat)), 'Your thali is empty.');
  const s = add(add([], 'saag', 'side').selection, 'jeera-rice').selection;
  const sum = Core.summarise(s, cat);
  assert.equal(Core.describe(sum), '2 dishes. Estimated total from published prices £11.25, to confirm.');
  assert.equal(Core.asText(sum), 'My thali, from the Swagat menu:\n- Saag (side) £6.50\n- Jeera Rice £4.75\nEstimated total from published prices: £11.25 (to confirm)');
});

test('wrapLabel keeps names inside a katori', () => {
  assert.deepEqual(Core.wrapLabel('Malabar Fish Curry', 10, 3), ['Malabar', 'Fish Curry']);
  assert.deepEqual(Core.wrapLabel('Extra Chutneys / Chopped Onions / Pickle', 10, 3), ['Extra', 'Chutneys /', 'Chopped…']);
  assert.deepEqual(Core.wrapLabel('Saag', 10, 3), ['Saag']);
});

/* ---------- Against the real page ---------- */
function pageCatalogue() {
  const html = fs.readFileSync(path.join(__dirname, '..', 'menu.html'), 'utf8');
  const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  const recs = [...html.matchAll(/data-dish='([^']*)'/g)].map((m) => JSON.parse(decode(m[1])));
  return { recs, cat: Core.makeCatalogue(recs) };
}

test('menu.html: every dish record parses, with a readable price and a known katori', () => {
  const { recs, cat: real } = pageCatalogue();
  assert.equal(recs.length, 71, '67 page-text dishes + 2 desserts + 2 lassi');
  assert.deepEqual(real.errors, []);
  for (const id of real.order) {
    for (const p of real.byId[id].portions) assert.ok(Number.isInteger(p.pence) && p.pence > 0, id);
  }
});

test('menu.html: all 15 vegetarian mains offer main and side, main dearer than side', () => {
  const { cat: real } = pageCatalogue();
  const veg = real.order.map((id) => real.byId[id]).filter((d) => d.portions.length === 2 && d.portions[1].key === 'side');
  assert.equal(veg.length, 15);
  for (const d of veg) {
    assert.equal(d.portions[0].group, 'main');
    assert.equal(d.portions[1].group, 'side');
    assert.ok(d.portions[0].pence > d.portions[1].pence, d.name);
  }
});

test('menu.html: published prices spot-checked against the copy deck', () => {
  const { cat: real } = pageCatalogue();
  const price = (id, k = 'one') => Core.formatPence(Core.portionOf(real, { id, portion: k }).pence);
  assert.equal(price('butter-chicken'), '£14.25');
  assert.equal(price('tandoori-lamb-chops'), '£11.99');
  assert.equal(price('papadoms-and-chutney-mint-and-mango'), '£3.00');
  assert.equal(price('egg-fried-rice'), '£7.25');
  assert.equal(price('yellow-dal-tadka', 'side'), '£6.00');
  assert.equal(price('tandoori-chicken', 'full'), '£19.99');
  assert.equal(price('gajar-ka-halwa'), '£4.50');
  assert.equal(price('sweet-lassi'), '£4.00');
});

test('menu.html: a full plate of real dishes totals correctly', () => {
  const { cat: real } = pageCatalogue();
  let s = [];
  const t = (id, portion = 'one') => { const r = Core.toggle(s, { id, portion }, real); assert.notEqual(r.status, 'full', id); s = r.selection; };
  t('samosa'); t('onion-baji');
  t('malabar-fish-curry'); t('chicken-dhansak');
  t('saag-paneer', 'side'); t('dal-makhani', 'side'); t('masala-bhindi', 'side');
  t('jeera-rice'); t('tandoori-naan'); t('tandoori-roti'); t('cucumber-raita'); t('gajar-ka-halwa'); t('mango-lassi');
  const sum = Core.summarise(s, real);
  assert.equal(sum.count, 13);
  assert.equal(sum.count, sum.places, 'every katori filled');
  // 8.75+7.85+15.00+14.50+6.99+6.25+6.75+4.75+3.75+3.25+2.50+4.50+4.25 = 89.09
  assert.equal(sum.total, '£89.09');
  assert.deepEqual(sum.allergenCodes.map((c) => c.code), ['D', 'G']);
  assert.deepEqual(sum.veganSuitable, ['Jeera Rice', 'Tandoori Roti']);
  assert.equal(Core.toggle(s, { id: 'seekh-kebab', portion: 'one' }, real).status, 'full');
});
