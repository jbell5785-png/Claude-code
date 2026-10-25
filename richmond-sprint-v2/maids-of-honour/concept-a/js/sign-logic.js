/*
 * The side-wall sign: time logic.
 *
 * Pure functions, no DOM. Runs in the browser (window.MaidsSign) and in Node
 * (module.exports) so the same code is tested in tests/sign-logic.test.js.
 *
 * Every window below comes from the copy deck (research/copy-deck.md, §1 Service):
 *   Open Monday to Sunday 9am–6pm .......................... S1, S2
 *   Breakfast: "Last Orders at 11am for Cooked or Toasted Items" S6
 *   "On Thursdays, we do not serve cooked breakfasts, but bakery
 *    pastries remain fully available." ........................ S6
 *   Luncheon: Monday to Sunday 12:00–15:00 ..................... S7
 *   Set teas from 10:00; Prosecco and Champagne teas from 11:00 S8
 *   "Last walk-ins must be seated by 17:30" .................... S8
 *
 * One interpretation (noted in NOTES.md): MORNING COFFEE runs from opening
 * until Luncheon begins (9:00–12:00). The business publishes the 11am
 * cooked-breakfast cut-off but no separate end for morning coffee.
 *
 * All clock reading is done in Europe/London, whatever the visitor's own
 * time zone, so BST and GMT are both handled by the platform's tz database.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MaidsSign = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var TZ = 'Europe/London';
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var SHORT = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  var THURSDAY = 4;

  var OPEN = 9 * 60;          // 09:00
  var CLOSE = 18 * 60;        // 18:00
  var COOKED_LAST = 11 * 60;  // 11:00 last orders, cooked or toasted
  var LUNCH_FROM = 12 * 60;   // 12:00
  var LUNCH_TO = 15 * 60;     // 15:00
  var TEA_FROM = 10 * 60;     // 10:00 High Tea, Savoury High Tea, Special Set Tea
  var FIZZ_FROM = 11 * 60;    // 11:00 Prosecco and Champagne teas
  var WALKIN_LAST = 17 * 60 + 30; // 17:30 last walk-ins seated

  /* The five painted lines, in the order they are painted on the wall. */
  var LINES = [
    { id: 'bread', label: 'HOME MADE BREAD', name: 'Home made bread', from: OPEN, to: CLOSE },
    { id: 'cakes', label: 'CAKES & PASTRIES', name: 'Cakes & pastries', from: OPEN, to: CLOSE },
    { id: 'coffee', label: 'MORNING COFFEE', name: 'Morning coffee', from: OPEN, to: LUNCH_FROM },
    { id: 'luncheons', label: 'LUNCHEONS', name: 'Luncheons', from: LUNCH_FROM, to: LUNCH_TO },
    { id: 'teas', label: 'TEAS', name: 'Teas', from: TEA_FROM, to: WALKIN_LAST }
  ];

  /* Which single line is "lit" (fresh gold leaf) at each time of day.
     The meal of the moment wins; the counter lines are the fallback. */
  var HEADLINE = [
    { from: OPEN, to: LUNCH_FROM, id: 'coffee' },
    { from: LUNCH_FROM, to: LUNCH_TO, id: 'luncheons' },
    { from: LUNCH_TO, to: WALKIN_LAST, id: 'teas' },
    { from: WALKIN_LAST, to: CLOSE, id: 'cakes' }
  ];

  var fmtCache = null;
  function formatter() {
    if (!fmtCache) {
      fmtCache = new Intl.DateTimeFormat('en-GB', {
        timeZone: TZ, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
      });
    }
    return fmtCache;
  }

  /** Read a Date as a London wall clock: { day: 0–6 (Sun=0), minutes: 0–1439 }. */
  function londonClock(date) {
    var parts = formatter().formatToParts(date);
    var o = {};
    for (var i = 0; i < parts.length; i++) o[parts[i].type] = parts[i].value;
    var h = parseInt(o.hour, 10) % 24;
    var m = parseInt(o.minute, 10);
    return { day: SHORT[o.weekday], minutes: h * 60 + m };
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function hhmm(min) { return pad(Math.floor(min / 60)) + ':' + pad(min % 60); }

  /** "9am", "12 noon", "3pm", "5.30pm": the way a signwriter would paint it. */
  function spoken(min) {
    var h = Math.floor(min / 60), m = min % 60;
    if (h === 12 && m === 0) return '12 noon';
    var suffix = h >= 12 ? 'pm' : 'am';
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + (m ? '.' + pad(m) : '') + suffix;
  }

  /** The published times for a line, for the static (no-JS) sign. */
  function published(id) {
    switch (id) {
      case 'bread':
      case 'cakes': return 'Daily, 9am to 6pm';
      case 'coffee': return 'From 9am · cooked breakfast last orders 11am';
      case 'luncheons': return 'Daily, 12 noon to 3pm';
      case 'teas': return 'From 10am · last walk-ins seated by 5.30pm';
    }
    return '';
  }

  function lineNote(id, t, day, state) {
    var thursday = day === THURSDAY;
    if (state === 'closed') {
      if (id === 'coffee' && t < OPEN && thursday) return 'From 9am · no cooked breakfast on Thursdays';
      return t < OPEN ? 'From ' + spoken(id === 'teas' ? TEA_FROM : id === 'luncheons' ? LUNCH_FROM : OPEN) : 'Back tomorrow';
    }
    if (state === 'later') {
      if (id === 'luncheons') return 'From 12 noon';
      if (id === 'teas') return 'From 10am';
      return 'From ' + spoken(OPEN);
    }
    if (state === 'done') {
      if (id === 'coffee') return 'Finished at 12 noon · back tomorrow';
      if (id === 'luncheons') return 'Finished at 3pm · back tomorrow';
      if (id === 'teas') return 'Last walk-ins were seated at 5.30pm';
      return 'Back tomorrow from 9am';
    }
    /* serving: lit or also-serving */
    switch (id) {
      case 'bread':
      case 'cakes':
        return 'On the counter until 6pm';
      case 'coffee':
        if (thursday) return 'Thursday: no cooked breakfast · pastries as usual';
        if (t < COOKED_LAST) return 'Cooked & toasted last orders 11am';
        return 'Cooked breakfast finished at 11am · pastries & coffee';
      case 'luncheons':
        return 'Serving until 3pm';
      case 'teas':
        if (t < FIZZ_FROM) return 'Set teas now · Prosecco & Champagne teas from 11am';
        return 'Set tea sittings · last walk-ins seated by 5.30pm';
    }
    return '';
  }

  /**
   * Read the sign for a given moment.
   * @param {Date} date
   * @returns {{ day:number, dayName:string, minutes:number, time:string, open:boolean,
   *            lit:string|null, lines:Array<{id,label,name,state,note}>, summary:string }}
   *   state is one of: 'lit' (served now, the headline), 'on' (also served now),
   *   'later' (later today), 'done' (finished today), 'closed' (shop closed).
   */
  function read(date) {
    var c = londonClock(date);
    return readClock(c.day, c.minutes);
  }

  /** Same as read(), from a London weekday (0–6, Sun=0) and minutes after midnight. */
  function readClock(day, t) {
    var open = t >= OPEN && t < CLOSE;
    var lit = null;
    if (open) {
      for (var i = 0; i < HEADLINE.length; i++) {
        if (t >= HEADLINE[i].from && t < HEADLINE[i].to) { lit = HEADLINE[i].id; break; }
      }
    }
    var lines = LINES.map(function (L) {
      var state;
      if (!open) state = 'closed';
      else if (t < L.from) state = 'later';
      else if (t >= L.to) state = 'done';
      else state = L.id === lit ? 'lit' : 'on';
      return { id: L.id, label: L.label, name: L.name, state: state, note: lineNote(L.id, t, day, state) };
    });

    var summary;
    if (!open) {
      var nextDay = t < OPEN ? day : (day + 1) % 7;
      var when = t < OPEN ? 'today' : 'tomorrow (' + DAYS[nextDay] + ')';
      summary = 'Closed just now. The doors open ' + when + ' at 9am.';
      if (nextDay === THURSDAY) summary += ' No cooked breakfasts on Thursdays; bakery pastries as usual.';
    } else {
      var litLine = lines.filter(function (l) { return l.state === 'lit'; })[0];
      var also = lines.filter(function (l) { return l.state === 'on'; }).map(function (l) { return l.name.toLowerCase(); });
      summary = 'Now serving: ' + litLine.name + '. ' + litLine.note + '.';
      if (also.length) summary += ' Also: ' + joinList(also) + '.';
      if (t >= WALKIN_LAST) summary += ' Last walk-ins were seated at 5.30pm; the shop is open until 6pm.';
    }

    return {
      day: day, dayName: DAYS[day], minutes: t, time: hhmm(t), open: open,
      lit: lit, lines: lines, summary: summary
    };
  }

  function joinList(a) {
    if (a.length < 2) return a.join('');
    return a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
  }

  return {
    TZ: TZ, LINES: LINES, DAYS: DAYS,
    londonClock: londonClock, read: read, readClock: readClock,
    published: published, spoken: spoken, hhmm: hhmm
  };
});
