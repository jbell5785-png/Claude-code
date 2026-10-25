/*
 * Tests for js/service.js. Run: node tests/service.test.js
 * Every case starts from a real UTC instant, so the Europe/London conversion
 * (GMT in winter, BST in summer, both clock changes) is exercised too.
 */
'use strict';
var path = require('path');
var S = require(path.join(__dirname, '..', 'js', 'service.js'));

var cases = [
  // [label, UTC instant, expectations]
  ['Tuesday 2pm (closed all day)', '2026-10-27T14:00:00Z',
    { state: 'closed-day', service: null, happyHour: false, primaryTab: 'galettes', next: [1, 2, 720], short: 'Fermé le mardi · opens Wednesday at noon', barKicker: 'Fermé le mardi', barMain: 'Opens Wednesday at noon' }],
  ['Tuesday 00:30 (just after midnight)', '2026-10-27T00:30:00Z',
    { state: 'closed-day', next: [1, 2, 720] }],
  ['Tuesday 23:59', '2026-10-27T23:59:00Z',
    { state: 'closed-day', next: [1, 2, 720] }],
  ['Sunday 9.30pm (after the 9pm close)', '2026-11-01T21:30:00Z',
    { state: 'after', service: null, next: [1, 0, 720], short: 'Closed · opens tomorrow at noon' }],
  ['Sunday 9pm exactly (closing time)', '2026-11-01T21:00:00Z',
    { state: 'after' }],
  ['Sunday 8.59pm (last minute open)', '2026-11-01T20:59:00Z',
    { state: 'open', service: 'evening', until: 1260, primaryTab: 'carte' }],
  ['Sunday 1pm (brunch)', '2026-11-01T13:00:00Z',
    { state: 'open', service: 'brunch', happyHour: false, until: 1020, primaryTab: 'galettes' }],
  ['Wednesday 6pm (steak night, happy hour just over)', '2026-10-28T18:00:00Z',
    { state: 'open', service: 'steak', happyHour: false, primaryTab: 'steak-night', until: 1320, menus: ['steak-night', 'carte', 'desserts'], barKicker: 'Now · until 10pm', barMain: 'Steak night & la carte' }],
  ['Wednesday 4.59pm (lunch + happy hour, not yet steak)', '2026-10-28T16:59:00Z',
    { state: 'open', service: 'lunch', happyHour: true, primaryTab: 'galettes' }],
  ['Wednesday 5pm (steak night + happy hour)', '2026-10-28T17:00:00Z',
    { state: 'open', service: 'steak', happyHour: true, menus: ['steak-night', 'carte', 'desserts', 'vins'] }],
  ['Monday 4.30pm (lunch + happy hour)', '2026-10-26T16:30:00Z',
    { state: 'open', service: 'lunch', happyHour: true, until: 1020, menus: ['galettes', 'set-lunch', 'vins'], short: 'Galettes & set lunch · until 5pm' }],
  ['Monday 11am (before opening)', '2026-10-26T11:00:00Z',
    { state: 'before', service: null, next: [0, 0, 720], short: 'Opens today at noon', barKicker: 'Closed now', barMain: 'Opens today at noon' }],
  ['Monday 10pm (closed; Tuesday skipped)', '2026-10-26T22:00:00Z',
    { state: 'after', next: [2, 2, 720], short: 'Closed · opens Wednesday at noon', barKicker: 'Closed for tonight', barMain: 'Opens Wednesday at noon' }],
  ['Monday 9.59pm', '2026-10-26T21:59:00Z',
    { state: 'open', service: 'evening', until: 1320 }],
  ['Thursday noon exactly (opening)', '2026-10-29T12:00:00Z',
    { state: 'open', service: 'lunch', happyHour: false }],
  ['Friday 5.59pm (evening + happy hour)', '2026-10-30T17:59:00Z',
    { state: 'open', service: 'evening', happyHour: true, primaryTab: 'carte' }],
  ['Friday 6pm (happy hour over)', '2026-10-30T18:00:00Z',
    { state: 'open', service: 'evening', happyHour: false }],
  ['Saturday 4.30pm (no weekend happy hour)', '2026-10-31T16:30:00Z',
    { state: 'open', service: 'lunch', happyHour: false }],
  ['Saturday 11.59pm', '2026-10-31T23:59:00Z',
    { state: 'after', next: [1, 6, 720] }],
  ['BST: 11:30 UTC on Wed 15 Jul = 12.30pm London (lunch)', '2026-07-15T11:30:00Z',
    { state: 'open', service: 'lunch', minutes: 750 }],
  ['BST: 16:00 UTC on Wed 15 Jul = 5pm London (steak night)', '2026-07-15T16:00:00Z',
    { state: 'open', service: 'steak', minutes: 1020 }],
  ['GMT: 11:30 UTC on Wed 16 Dec = 11.30am London (before)', '2026-12-16T11:30:00Z',
    { state: 'before', minutes: 690 }],
  ['Clocks go back: Sun 25 Oct 12:30 UTC = 12.30pm GMT (brunch)', '2026-10-25T12:30:00Z',
    { state: 'open', service: 'brunch' }],
  ['Clocks go back: Sat 24 Oct 21:30 UTC = 10.30pm BST (closed)', '2026-10-24T21:30:00Z',
    { state: 'after', minutes: 1350 }],
  ['Clocks go forward: Sun 29 Mar 11:15 UTC = 12.15pm BST (brunch)', '2026-03-29T11:15:00Z',
    { state: 'open', service: 'brunch', minutes: 735 }],
  ['GMT: Sat 31 Oct 23:00 UTC = 11pm London (closed)', '2026-10-31T23:00:00Z',
    { state: 'after', dayIndex: 5 }]
];

var ritualCases = [
  ['Steak night, from Monday 10am', 'steak', 0, 600, { now: false, offset: 2, start: 1020, label: 'Wednesday from 5pm' }],
  ['Steak night, Wednesday 6pm', 'steak', 2, 1080, { now: true, label: 'On now, until 10pm' }],
  ['Steak night, Wednesday 10.30pm', 'steak', 2, 1350, { now: false, offset: 7, label: 'Next Wednesday from 5pm' }],
  ['Steak night, Wednesday 1pm', 'steak', 2, 780, { now: false, offset: 0, label: 'Tonight from 5pm' }],
  ['Happy hour, Saturday 4.30pm', 'happy', 5, 990, { now: false, offset: 2, dayIndex: 0, start: 960 }],
  ['Happy hour, Monday 6pm', 'happy', 0, 1080, { now: false, offset: 2, dayIndex: 2, label: 'Wednesday from 4pm' }],
  ['Happy hour, Friday 5.30pm', 'happy', 4, 1050, { now: true }],
  ['Happy hour, Thursday noon', 'happy', 3, 720, { now: false, offset: 0, label: 'Today from 4pm' }],
  ['Sunday brunch, Sunday 1pm', 'brunch', 6, 780, { now: true, label: 'On now, until 5pm' }],
  ['Sunday brunch, Sunday 5pm', 'brunch', 6, 1020, { now: false, offset: 7 }],
  ['Sunday brunch, Saturday evening', 'brunch', 5, 1200, { now: false, offset: 1, label: 'Tomorrow from noon' }]
];

var fmtCases = [[720, 'noon'], [0, 'midnight'], [1020, '5pm'], [1170, '7.30pm'], [665, '11.05am'], [1320, '10pm']];

var pass = 0, fail = 0, lines = [];

function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

function check(label, actual, exp) {
  var errs = [];
  Object.keys(exp).forEach(function (k) {
    var got = actual[k];
    if (k === 'next') got = actual.next ? [actual.next.offset, actual.next.dayIndex, actual.next.minutes] : null;
    if (!eq(got, exp[k])) errs.push(k + ': expected ' + JSON.stringify(exp[k]) + ', got ' + JSON.stringify(got));
  });
  if (errs.length) { fail++; lines.push('FAIL  ' + label + '\n      ' + errs.join('\n      ')); }
  else { pass++; lines.push('pass  ' + label + '  ->  ' + (actual.title ? actual.title + ' | ' + actual.short : actual.label)); }
}

cases.forEach(function (c) { check(c[0], S.serviceAt(new Date(c[1])), c[2]); });
ritualCases.forEach(function (c) { check(c[0], S.ritualStatus(c[1], c[2], c[3]), c[4]); });
fmtCases.forEach(function (c) {
  var got = S.fmtTime(c[0]);
  if (got === c[1]) { pass++; lines.push('pass  fmtTime(' + c[0] + ') = ' + got); }
  else { fail++; lines.push('FAIL  fmtTime(' + c[0] + '): expected ' + c[1] + ', got ' + got); }
});

// Exhaustive sweep: every minute of the week must agree with the published rules.
var sweepErrors = 0;
for (var d = 0; d < 7; d++) {
  for (var m = 0; m < 1440; m++) {
    var r = S.serviceFor(d, m);
    var openH = d === 1 ? null : [720, d === 6 ? 1260 : 1320];
    var shouldOpen = !!openH && m >= openH[0] && m < openH[1];
    var hh = shouldOpen && [0, 2, 3, 4].indexOf(d) > -1 && m >= 960 && m < 1080;
    var svc = !shouldOpen ? null : m < 1020 ? (d === 6 ? 'brunch' : 'lunch') : (d === 2 ? 'steak' : 'evening');
    if (r.open !== shouldOpen || r.happyHour !== hh || r.service !== svc) sweepErrors++;
  }
}
if (sweepErrors === 0) { pass++; lines.push('pass  sweep: all 10,080 minutes of the week match the published rules'); }
else { fail++; lines.push('FAIL  sweep: ' + sweepErrors + ' minutes disagree'); }

console.log(lines.join('\n'));
console.log('\n' + pass + ' passed, ' + fail + ' failed (Node ' + process.version + ', ICU ' + process.versions.icu + ')');
process.exit(fail ? 1 : 0);
