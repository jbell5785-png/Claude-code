// Run with: node tests/hours.test.js   (from the concept-c folder)
// Tests the pure hours function against Europe/London time, including both sides
// of the 25 October 2026 clock change (BST -> GMT at 01:00 UTC).
'use strict';
const assert = require('assert');
const H = require('../js/hours.js');

const cases = [
  // [label, ISO instant (UTC), expected state, expected headline, expected detail, expected tbc]
  ['Wed in BST, 11:30 London (10:30Z)', '2026-07-15T10:30:00Z', 'closed', 'Not open yet', 'Opens today at 12pm', []],
  ['Wed in BST, 12:30 London (11:30Z)', '2026-07-15T11:30:00Z', 'lunch', 'Open for lunch', 'Until 3pm, then dinner from 5pm', ['lunch-end']],
  ['Wed in BST, 15:15 London', '2026-07-15T14:15:00Z', 'between', 'Between services', 'Dinner from 5pm today', ['lunch-end']],
  ['Wed in BST, 17:00 London (opening edge)', '2026-07-15T16:00:00Z', 'open', 'Open for dinner', 'Until 10pm', []],
  ['Wed in BST, 22:00 London (closing edge)', '2026-07-15T21:00:00Z', 'closed', 'Closed for the day', 'Opens tomorrow at 12pm', []],
  ['Sat in BST, 14:00 London', '2026-07-18T13:00:00Z', 'open', 'Open all day', 'Until 10pm', []],
  ['Sat, 22:30 London: next is Monday', '2026-07-18T21:30:00Z', 'closed', 'Closed for the day', 'Opens Monday at 12pm', ['monday']],
  ['Fri 23:30Z = Sat 00:30 BST', '2026-10-23T23:30:00Z', 'closed', 'Not open yet', 'Opens today at 12pm', []],
  ['Sun 25 Oct, clocks changed, 12:00 GMT', '2026-10-25T12:00:00Z', 'closed', 'Closed today', 'Opens tomorrow at 12pm', ['monday']],
  ['Mon 26 Oct in GMT, 11:59 London', '2026-10-26T11:59:00Z', 'closed', 'Not open yet', 'Opens today at 12pm', ['monday']],
  ['Mon 26 Oct in GMT, 12:30 London', '2026-10-26T12:30:00Z', 'lunch', 'Open for lunch', 'Until 3pm, then dinner from 5pm', ['monday', 'lunch-end']],
  ['Fri in GMT, 14:59 London (last lunch minute)', '2026-12-18T14:59:00Z', 'lunch', 'Open for lunch', 'Until 3pm, then dinner from 5pm', ['lunch-end']]
];

let pass = 0;
const rows = [];
for (const [label, iso, state, headline, detail, tbc] of cases) {
  const s = H.getStatus(new Date(iso));
  try {
    assert.strictEqual(s.state, state);
    assert.strictEqual(s.headline, headline);
    assert.strictEqual(s.detail, detail);
    assert.deepStrictEqual(s.tbc, tbc);
    pass++;
    rows.push(`PASS | ${label} | ${iso} | London ${s.clock} | ${s.state} | ${s.headline}: ${s.detail} | tbc: ${s.tbc.join(', ') || 'none'}`);
  } catch (e) {
    rows.push(`FAIL | ${label} | ${iso} | London ${s.clock} | got ${JSON.stringify(s)} | ${e.message.split('\n')[0]}`);
  }
}

// formatTime sanity
assert.strictEqual(H.formatTime(720), '12pm');
assert.strictEqual(H.formatTime(885), '2:45pm');
assert.strictEqual(H.formatTime(0), '12am');

console.log(rows.join('\n'));
console.log(`\n${pass}/${cases.length} cases passed`);
if (pass !== cases.length) process.exit(1);
