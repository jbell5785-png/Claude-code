/*
 * Chez Lindsay: the service model ("L'horloge du service").
 *
 * Pure functions, no DOM. Loaded in the browser as window.ChezService and in
 * Node via require() for the tests in tests/service.test.js.
 *
 * Published hours (copy deck, section 2):
 *   Mon, Wed-Sat 12:00-22:00 · Sun 12:00-21:00 · closed Tuesday
 *   Lunch 12-5pm: set lunch (prix fixe) and galettes
 *   From 5pm: la carte and desserts
 *   Wednesday from 5pm till close: steak night
 *   Sunday 12-5pm: brunch
 *   Monday to Friday 4-6pm: happy hour (in effect Mon, Wed, Thu, Fri)
 *
 * Times are minutes since midnight, Europe/London. Day index 0 = Monday.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ChezService = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var NOON = 720;
  var LUNCH_END = 1020; // 5pm
  var HAPPY_START = 960; // 4pm
  var HAPPY_END = 1080; // 6pm

  var DAYS = [
    { key: 'mon', en: 'Monday', short: 'Mon', fr: 'lundi', open: NOON, close: 1320, happyHour: true },
    { key: 'tue', en: 'Tuesday', short: 'Tue', fr: 'mardi', open: null, close: null, happyHour: false },
    { key: 'wed', en: 'Wednesday', short: 'Wed', fr: 'mercredi', open: NOON, close: 1320, happyHour: true, steakNight: true },
    { key: 'thu', en: 'Thursday', short: 'Thu', fr: 'jeudi', open: NOON, close: 1320, happyHour: true },
    { key: 'fri', en: 'Friday', short: 'Fri', fr: 'vendredi', open: NOON, close: 1320, happyHour: true },
    { key: 'sat', en: 'Saturday', short: 'Sat', fr: 'samedi', open: NOON, close: 1320, happyHour: false },
    { key: 'sun', en: 'Sunday', short: 'Sun', fr: 'dimanche', open: NOON, close: 1260, happyHour: false, brunch: true }
  ];

  var WEEKDAY_INDEX = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

  /* Menu tab ids, matching the hashes on menu.html */
  var MENUS = {
    lunch: ['galettes', 'set-lunch'],
    brunch: ['galettes', 'set-lunch'],
    evening: ['carte', 'desserts'],
    steak: ['steak-night', 'carte', 'desserts']
  };

  var TITLES = {
    lunch: 'Galettes & set lunch',
    brunch: 'Sunday brunch, galettes & set lunch',
    evening: 'La carte & desserts',
    steak: 'Steak night & la carte'
  };

  var SHORT = {
    lunch: 'Galettes & set lunch',
    brunch: 'Sunday brunch & galettes',
    evening: 'La carte',
    steak: 'Steak night & la carte'
  };

  /* "noon", "5pm", "7.30pm", "midnight" (British style) */
  function fmtTime(m) {
    m = ((m % 1440) + 1440) % 1440;
    if (m === NOON) return 'noon';
    if (m === 0) return 'midnight';
    var h = Math.floor(m / 60);
    var mm = m % 60;
    var h12 = h % 12 || 12;
    return h12 + (mm ? '.' + (mm < 10 ? '0' : '') + mm : '') + (h < 12 ? 'am' : 'pm');
  }

  /* "today", "tomorrow", "on Wednesday", "next Wednesday" */
  function relDay(offset, dayIndex) {
    if (offset === 0) return 'today';
    if (offset === 1) return 'tomorrow';
    if (offset === 7) return 'next ' + DAYS[dayIndex].en;
    return 'on ' + DAYS[dayIndex].en;
  }

  /* Next opening strictly after the given moment (or later today if before opening). */
  function nextOpening(dayIndex, minutes) {
    var d = DAYS[dayIndex];
    if (d.open !== null && minutes < d.open) return { offset: 0, dayIndex: dayIndex, minutes: d.open };
    for (var off = 1; off <= 7; off++) {
      var i = (dayIndex + off) % 7;
      if (DAYS[i].open !== null) return { offset: off, dayIndex: i, minutes: DAYS[i].open };
    }
    return null;
  }

  /* What the lunch service is called on a given day, for "back tomorrow" lines. */
  function openingLine(dayIndex) {
    return DAYS[dayIndex].brunch ? 'Sunday brunch, galettes and set lunch' : 'galettes and set lunch';
  }

  /*
   * serviceFor(dayIndex, minutes): the whole answer for one moment.
   * state: 'open' | 'before' | 'after' | 'closed-day'
   * service: 'lunch' | 'brunch' | 'evening' | 'steak' | null
   */
  function serviceFor(dayIndex, minutes) {
    var d = DAYS[dayIndex];
    var state;
    var service = null;

    if (d.open === null) state = 'closed-day';
    else if (minutes < d.open) state = 'before';
    else if (minutes >= d.close) state = 'after';
    else {
      state = 'open';
      if (minutes < LUNCH_END) service = d.brunch ? 'brunch' : 'lunch';
      else service = d.steakNight ? 'steak' : 'evening';
    }

    var happyHour = state === 'open' && d.happyHour && minutes >= HAPPY_START && minutes < HAPPY_END;
    var menus = service ? MENUS[service].slice() : [];
    if (happyHour) menus.push('vins');
    var until = service ? (minutes < LUNCH_END ? LUNCH_END : d.close) : null;
    var next = state === 'open' ? null : nextOpening(dayIndex, minutes);

    var title, short, detail = [];

    if (state === 'open') {
      title = TITLES[service];
      short = SHORT[service] + ' · until ' + fmtTime(until);
      detail.push('Until ' + fmtTime(until) + '.');
      if (happyHour) detail.push('Happy hour until 6pm: oysters and crémant.');
      else if (d.happyHour && minutes < HAPPY_START) detail.push('Happy hour from 4pm.');
      if (service === 'lunch' || service === 'brunch') {
        detail.push(d.steakNight ? 'Steak night from 5pm.' : 'La carte from 5pm.');
      } else if (service === 'steak') {
        detail.push('Steak and fries for two with a bottle to share, from £54.');
      } else {
        detail.push('Crêpes and desserts all evening.');
      }
    } else if (state === 'before') {
      title = 'Opening at noon';
      short = 'Opens today at noon';
      detail.push('From 12 noon: ' + openingLine(dayIndex) + ' until 5pm.');
      detail.push(d.steakNight ? 'Steak night from 5pm.' : 'La carte from 5pm.');
    } else if (state === 'after') {
      title = 'Closed for tonight';
      short = 'Closed · opens ' + (next.offset === 1 ? 'tomorrow' : DAYS[next.dayIndex].en) + ' at noon';
      detail.push('We closed at ' + fmtTime(d.close) + '.');
      detail.push('Back ' + relDay(next.offset, next.dayIndex) + ' at noon for ' + openingLine(next.dayIndex) + '.');
      if (next.offset > 1) detail.push('We close on Tuesdays.');
    } else {
      title = 'Fermé le mardi';
      short = 'Fermé le mardi · opens ' + (next.offset === 1 ? 'Wednesday' : DAYS[next.dayIndex].en) + ' at noon';
      detail.push('Closed all day on Tuesdays.');
      detail.push('Back ' + (next.offset === 1 ? 'on Wednesday' : relDay(next.offset, next.dayIndex)) + ' at noon, with steak night from 5pm.');
    }

    /* Two short lines for the sticky "Now serving" bar */
    var barKicker, barMain;
    if (state === 'open') { barKicker = 'Now · until ' + fmtTime(until); barMain = SHORT[service]; }
    else if (state === 'before') { barKicker = 'Closed now'; barMain = 'Opens today at noon'; }
    else if (state === 'after') { barKicker = 'Closed for tonight'; barMain = 'Opens ' + (next.offset === 1 ? 'tomorrow' : DAYS[next.dayIndex].en) + ' at noon'; }
    else { barKicker = 'Fermé le mardi'; barMain = 'Opens Wednesday at noon'; }

    return {
      barKicker: barKicker,
      barMain: barMain,
      dayIndex: dayIndex,
      day: d.key,
      dayName: d.en,
      dayFr: d.fr,
      minutes: minutes,
      time: fmtTime(minutes),
      state: state,
      open: state === 'open',
      service: service,
      happyHour: happyHour,
      menus: menus,
      primaryTab: menus[0] || 'galettes',
      until: until,
      next: next,
      title: title,
      short: short,
      detail: detail.join(' ')
    };
  }

  /* Day and minutes in Europe/London for any Date, whatever the device's zone. */
  var londonFmt = null;
  function londonParts(date) {
    if (!londonFmt) {
      londonFmt = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/London',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23'
      });
    }
    var parts = londonFmt.formatToParts(date);
    var out = {};
    for (var i = 0; i < parts.length; i++) out[parts[i].type] = parts[i].value;
    var h = parseInt(out.hour, 10) % 24; // some engines print "24" at midnight
    var m = parseInt(out.minute, 10);
    return { dayIndex: WEEKDAY_INDEX[out.weekday], minutes: h * 60 + m };
  }

  function serviceAt(date) {
    var p = londonParts(date || new Date());
    return serviceFor(p.dayIndex, p.minutes);
  }

  /* Coloured segments for the dial and the strip. */
  function segmentsFor(dayIndex) {
    var d = DAYS[dayIndex];
    if (d.open === null) return [];
    var segs = [
      { kind: d.brunch ? 'brunch' : 'lunch', start: d.open, end: LUNCH_END, label: d.brunch ? 'Brunch · galettes' : 'Déjeuner' },
      { kind: d.steakNight ? 'steak' : 'evening', start: LUNCH_END, end: d.close, label: d.steakNight ? 'Steak night' : 'La carte' }
    ];
    if (d.happyHour) segs.push({ kind: 'happy', start: HAPPY_START, end: HAPPY_END, label: 'Happy hour' });
    return segs;
  }

  /* The weekly rituals, as windows in the week. */
  var RITUALS = {
    steak: [{ day: 2, start: LUNCH_END, end: 1320 }],
    brunch: [{ day: 6, start: NOON, end: LUNCH_END }],
    happy: [0, 2, 3, 4].map(function (d) { return { day: d, start: HAPPY_START, end: HAPPY_END }; })
  };

  /* Is a ritual on now, and if not, when is it next? */
  function ritualStatus(name, dayIndex, minutes) {
    var wins = RITUALS[name];
    var i, w;
    for (i = 0; i < wins.length; i++) {
      w = wins[i];
      if (w.day === dayIndex && minutes >= w.start && minutes < w.end) {
        return { now: true, until: w.end, label: 'On now, until ' + fmtTime(w.end) };
      }
    }
    for (var off = 0; off <= 7; off++) {
      var di = (dayIndex + off) % 7;
      for (i = 0; i < wins.length; i++) {
        w = wins[i];
        if (w.day !== di) continue;
        if (off === 0 && w.start <= minutes) continue;
        var when;
        if (off === 0) when = (w.start >= LUNCH_END ? 'Tonight' : 'Today') + ' from ' + fmtTime(w.start);
        else if (off === 1) when = 'Tomorrow from ' + fmtTime(w.start);
        else if (off === 7) when = 'Next ' + DAYS[di].en + ' from ' + fmtTime(w.start);
        else when = DAYS[di].en + ' from ' + fmtTime(w.start);
        return { now: false, offset: off, dayIndex: di, start: w.start, label: when };
      }
    }
    return null;
  }

  return {
    DAYS: DAYS,
    NOON: NOON,
    LUNCH_END: LUNCH_END,
    HAPPY_START: HAPPY_START,
    HAPPY_END: HAPPY_END,
    fmtTime: fmtTime,
    serviceFor: serviceFor,
    serviceAt: serviceAt,
    londonParts: londonParts,
    segmentsFor: segmentsFor,
    ritualStatus: ritualStatus,
    RITUALS: RITUALS
  };
});
