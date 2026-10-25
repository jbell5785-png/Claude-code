/*
 * Matsuba opening-hours state, Concept C.
 * Pure functions: given an instant (a Date), return what the restaurant's
 * published hours say about that moment in Europe/London.
 * Works in the browser (window.MatsubaHours) and in Node (module.exports).
 *
 * Published hours (copy deck): Mon–Fri 12–3pm and 5–10pm; Sat 12–10pm; Sun closed.
 * [TO CONFIRM] Monday opening. [TO CONFIRM] lunch end time (3pm / 2:45pm / 2:30pm).
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MatsubaHours = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var TZ = 'Europe/London';
  var DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var DAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  // Minutes after midnight, London time. Close is exclusive.
  var WEEKDAY = [
    { kind: 'lunch', open: 720, close: 900 },   // 12pm – 3pm  (end time to confirm)
    { kind: 'dinner', open: 1020, close: 1320 } // 5pm – 10pm
  ];
  var SCHEDULE = {
    0: [],
    1: WEEKDAY, // Monday: as published, to confirm
    2: WEEKDAY,
    3: WEEKDAY,
    4: WEEKDAY,
    5: WEEKDAY,
    6: [{ kind: 'allday', open: 720, close: 1320 }] // 12pm – 10pm
  };

  /** London wall-clock day and minute for an instant. */
  function londonParts(date) {
    var fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: TZ, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    });
    var parts = fmt.formatToParts(date);
    var out = {};
    for (var i = 0; i < parts.length; i++) out[parts[i].type] = parts[i].value;
    var hour = parseInt(out.hour, 10) % 24;
    return {
      day: DAY_INDEX[out.weekday],
      minutes: hour * 60 + parseInt(out.minute, 10),
      clock: (hour < 10 ? '0' : '') + hour + ':' + out.minute
    };
  }

  /** 720 -> "12pm", 1290 -> "9:30pm" */
  function formatTime(mins) {
    var h = Math.floor(mins / 60), m = mins % 60;
    var suffix = h >= 12 ? 'pm' : 'am';
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + (m ? ':' + (m < 10 ? '0' : '') + m : '') + suffix;
  }

  /** The next session start strictly after (day, minutes), up to a week ahead. */
  function nextOpening(day, minutes, schedule) {
    for (var offset = 0; offset <= 7; offset++) {
      var d = (day + offset) % 7;
      var sessions = schedule[d] || [];
      for (var i = 0; i < sessions.length; i++) {
        if (offset > 0 || sessions[i].open > minutes) {
          return { day: d, offset: offset, minutes: sessions[i].open, kind: sessions[i].kind };
        }
      }
    }
    return null;
  }

  function whenLabel(next) {
    if (next.offset === 0) return 'today';
    if (next.offset === 1) return 'tomorrow';
    return DAY_NAMES[next.day];
  }

  /**
   * Pure core. Input: London weekday (0 = Sunday) and minutes after midnight.
   * Returns { state, headline, detail, until, next, tbc[] }.
   * state is one of 'lunch' | 'open' | 'between' | 'closed'.
   */
  function statusAt(day, minutes, schedule) {
    schedule = schedule || SCHEDULE;
    var sessions = schedule[day] || [];
    var tbc = [];
    if (day === 1) tbc.push('monday');

    for (var i = 0; i < sessions.length; i++) {
      var s = sessions[i];
      if (minutes >= s.open && minutes < s.close) {
        if (s.kind === 'lunch') {
          tbc.push('lunch-end');
          return {
            state: 'lunch', headline: 'Open for lunch',
            detail: 'Until ' + formatTime(s.close) + ', then dinner from ' + formatTime(sessions[i + 1].open),
            until: s.close, next: null, tbc: tbc
          };
        }
        return {
          state: 'open', headline: s.kind === 'allday' ? 'Open all day' : 'Open for dinner',
          detail: 'Until ' + formatTime(s.close),
          until: s.close, next: null, tbc: tbc
        };
      }
    }

    // Between two sessions on the same day.
    for (var j = 0; j < sessions.length - 1; j++) {
      if (minutes >= sessions[j].close && minutes < sessions[j + 1].open) {
        tbc.push('lunch-end');
        return {
          state: 'between', headline: 'Between services',
          detail: 'Dinner from ' + formatTime(sessions[j + 1].open) + ' today',
          until: sessions[j + 1].open, next: { day: day, offset: 0, minutes: sessions[j + 1].open, kind: sessions[j + 1].kind },
          tbc: tbc
        };
      }
    }

    var next = nextOpening(day, minutes, schedule);
    if (next && next.day === 1 && tbc.indexOf('monday') === -1) tbc.push('monday');
    var headline = sessions.length === 0 ? 'Closed today' : (minutes < sessions[0].open ? 'Not open yet' : 'Closed for the day');
    return {
      state: 'closed', headline: headline,
      detail: next ? 'Opens ' + whenLabel(next) + ' at ' + formatTime(next.minutes) : '',
      until: null, next: next, tbc: tbc
    };
  }

  /** Convenience: status for an instant, using Europe/London time. */
  function getStatus(date) {
    var p = londonParts(date || new Date());
    var s = statusAt(p.day, p.minutes);
    s.day = p.day;
    s.clock = p.clock;
    return s;
  }

  return {
    TZ: TZ, SCHEDULE: SCHEDULE, DAY_NAMES: DAY_NAMES,
    londonParts: londonParts, formatTime: formatTime, nextOpening: nextOpening,
    statusAt: statusAt, getStatus: getStatus
  };
});
