/*
 * Tests for the side-wall sign's time logic.
 * Run:  node --test tests/sign-logic.test.js
 * Also run under other machine time zones to prove the sign reads London time:
 *   TZ=Pacific/Auckland node --test tests/sign-logic.test.js
 *   TZ=America/Los_Angeles node --test tests/sign-logic.test.js
 */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const S = require('../js/sign-logic.js');

const at = (iso) => S.read(new Date(iso));
const state = (r, id) => r.lines.find((l) => l.id === id).state;
const note = (r, id) => r.lines.find((l) => l.id === id).note;

test('London clock: GMT and BST, including the day the clocks go back (25 Oct 2026)', () => {
  // 25 Oct 2026 is a Sunday. BST ends at 01:00 UTC, so 09:00 UTC is 09:00 GMT.
  assert.deepEqual(S.londonClock(new Date('2026-10-25T00:30:00Z')), { day: 0, minutes: 90 });  // 01:30 BST
  assert.deepEqual(S.londonClock(new Date('2026-10-25T01:30:00Z')), { day: 0, minutes: 90 });  // 01:30 GMT, the repeated hour
  assert.deepEqual(S.londonClock(new Date('2026-10-25T09:00:00Z')), { day: 0, minutes: 540 });
  // Saturday 24 Oct 2026, still BST: 08:30 UTC is 09:30 in Kew.
  assert.deepEqual(S.londonClock(new Date('2026-10-24T08:30:00Z')), { day: 6, minutes: 570 });
  // 29 Mar 2026: clocks go forward at 01:00 UTC. 08:00 UTC is 09:00 BST.
  assert.deepEqual(S.londonClock(new Date('2026-03-29T08:00:00Z')), { day: 0, minutes: 540 });
  // Midsummer, BST: 16:59 UTC is 17:59 in Kew.
  assert.deepEqual(S.londonClock(new Date('2026-07-01T16:59:00Z')), { day: 3, minutes: 1079 });
});

test('Opening edges: 08:59 closed, 09:00 open, 17:59 open, 18:00 closed', () => {
  assert.equal(at('2026-10-25T08:59:00Z').open, false);          // Sun, GMT
  assert.equal(at('2026-10-25T09:00:00Z').open, true);
  assert.equal(at('2026-10-24T07:59:00Z').open, false);          // Sat, BST 08:59
  assert.equal(at('2026-10-24T08:00:00Z').open, true);           // Sat, BST 09:00
  assert.equal(at('2026-07-01T16:59:00Z').open, true);           // BST 17:59
  assert.equal(at('2026-07-01T17:00:00Z').open, false);          // BST 18:00
  assert.equal(at('2026-10-28T18:00:00Z').open, false);          // GMT 18:00
  assert.equal(at('2026-10-28T08:59:00Z').lit, null);
});

test('Headline line through a Wednesday (28 Oct 2026, GMT)', () => {
  const d = '2026-10-28T';
  assert.equal(at(d + '09:00:00Z').lit, 'coffee');
  assert.equal(at(d + '11:59:00Z').lit, 'coffee');
  assert.equal(at(d + '12:00:00Z').lit, 'luncheons');
  assert.equal(at(d + '14:59:00Z').lit, 'luncheons');
  assert.equal(at(d + '15:00:00Z').lit, 'teas');
  assert.equal(at(d + '17:29:00Z').lit, 'teas');
  assert.equal(at(d + '17:30:00Z').lit, 'cakes');
  assert.equal(at(d + '17:59:00Z').lit, 'cakes');
  assert.equal(at(d + '18:00:00Z').lit, null);
});

test('Breakfast: cooked and toasted last orders at 11am', () => {
  assert.match(note(at('2026-10-28T10:59:00Z'), 'coffee'), /last orders 11am/);
  assert.match(note(at('2026-10-28T11:00:00Z'), 'coffee'), /finished at 11am/);
  assert.equal(state(at('2026-10-28T12:00:00Z'), 'coffee'), 'done');
});

test('Thursday: no cooked breakfasts, pastries as usual', () => {
  const r = at('2026-10-29T09:30:00Z'); // Thu 29 Oct 2026, GMT 09:30
  assert.equal(r.dayName, 'Thursday');
  assert.equal(r.lit, 'coffee');
  assert.match(note(r, 'coffee'), /no cooked breakfast/i);
  assert.doesNotMatch(note(r, 'coffee'), /last orders/);
  // The evening before warns about it.
  assert.match(at('2026-10-28T18:30:00Z').summary, /tomorrow \(Thursday\).*No cooked breakfasts on Thursdays/);
  // Thursday before opening warns too.
  assert.match(note(at('2026-10-29T08:00:00Z'), 'coffee'), /no cooked breakfast on Thursdays/);
  // Friday morning is normal again.
  assert.match(note(at('2026-10-30T09:30:00Z'), 'coffee'), /last orders 11am/);
});

test('Teas: set teas from 10:00, Prosecco and Champagne from 11:00, walk-ins by 17:30', () => {
  assert.equal(state(at('2026-10-28T09:59:00Z'), 'teas'), 'later');
  assert.equal(state(at('2026-10-28T10:00:00Z'), 'teas'), 'on');
  assert.match(note(at('2026-10-28T10:30:00Z'), 'teas'), /Prosecco & Champagne teas from 11am/);
  assert.match(note(at('2026-10-28T11:00:00Z'), 'teas'), /last walk-ins seated by 5\.30pm/);
  assert.equal(state(at('2026-10-28T17:29:00Z'), 'teas'), 'lit');
  assert.equal(state(at('2026-10-28T17:30:00Z'), 'teas'), 'done');
  assert.match(at('2026-10-28T17:45:00Z').summary, /Last walk-ins were seated at 5\.30pm/);
});

test('Luncheons: 12:00 to 15:00 only', () => {
  assert.equal(state(at('2026-10-28T11:59:00Z'), 'luncheons'), 'later');
  assert.equal(state(at('2026-10-28T12:00:00Z'), 'luncheons'), 'lit');
  assert.equal(state(at('2026-10-28T15:00:00Z'), 'luncheons'), 'done');
});

test('Counter lines are on whenever the shop is open', () => {
  for (const iso of ['2026-10-28T09:00:00Z', '2026-10-28T13:00:00Z', '2026-10-28T17:59:00Z']) {
    const r = at(iso);
    assert.ok(['on', 'lit'].includes(state(r, 'bread')), iso);
    assert.ok(['on', 'lit'].includes(state(r, 'cakes')), iso);
  }
  assert.equal(state(at('2026-10-28T18:00:00Z'), 'bread'), 'closed');
});

test('Closed summaries name the right day', () => {
  assert.match(at('2026-10-25T07:00:00Z').summary, /open today at 9am/);
  assert.match(at('2026-10-31T19:00:00Z').summary, /tomorrow \(Sunday\)/); // Sat evening, GMT
});

test('Sweep: every minute of a GMT week and a BST week keeps the invariants', () => {
  const weeks = ['2026-10-26T00:00:00Z', '2026-06-29T00:00:00Z'];
  let checked = 0;
  for (const start of weeks) {
    const t0 = new Date(start).getTime();
    for (let i = 0; i < 7 * 24 * 60; i++) {
      const date = new Date(t0 + i * 60000);
      const r = S.read(date);
      const lit = r.lines.filter((l) => l.state === 'lit');
      if (r.open) {
        assert.equal(lit.length, 1, date.toISOString());
        assert.ok(r.minutes >= 540 && r.minutes < 1080);
      } else {
        assert.equal(lit.length, 0, date.toISOString());
        assert.ok(r.lines.every((l) => l.state === 'closed'));
      }
      // No line is ever served outside its published window.
      for (const l of r.lines) {
        const def = S.LINES.find((d) => d.id === l.id);
        if (l.state === 'lit' || l.state === 'on') assert.ok(r.minutes >= def.from && r.minutes < def.to, l.id + ' ' + date.toISOString());
        assert.ok(l.note.length > 0);
      }
      checked++;
    }
  }
  assert.equal(checked, 2 * 7 * 24 * 60);
});

test('The machine time zone does not matter', () => {
  // Same instant, read by the module, must give the same London wall clock whatever process.env.TZ is.
  const r = at('2026-10-28T12:30:00Z');
  assert.equal(r.time, '12:30');
  assert.equal(r.lit, 'luncheons');
});
