/* Concept B "Sera": homepage behaviour.
   1. Booking step (works with or without GSAP).
   2. Motion (only when html.motion is set and GSAP loaded): the frontage scene, where the light goes
      from afternoon to night and the lamps come on, scrubbed by a short pin; plus the booking lamp.
      The text under the picture never moves. The scene plays once, then rests lit. */
(function () {
  'use strict';
  var root = document.documentElement;

  /* ---------------- booking ---------------- */
  var OPENTABLE = 'https://www.opentable.co.uk/r/caffe-mamma-ristorante-london';
  var form = document.getElementById('book-form');
  if (form) {
    form.hidden = false;
    var party = form.querySelector('#bk-party');
    var date = form.querySelector('#bk-date');
    var time = form.querySelector('#bk-time');
    var summary = document.getElementById('book-summary');
    var submit = form.querySelector('.book__submit');
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var now = new Date();
    var today = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
    date.min = today;
    if (!date.value) date.value = today;

    var fmtTime = function (v) {
      var p = v.split(':'), h = +p[0], m = p[1];
      if (h === 12 && m === '00') return '12 noon';
      var suffix = h >= 12 ? 'pm' : 'am';
      var h12 = h > 12 ? h - 12 : h;
      return h12 + (m === '00' ? '' : '.' + m) + suffix;
    };
    var fmtDate = function (v) {
      var p = v.split('-');
      var d = new Date(+p[0], +p[1] - 1, +p[2]);
      return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    };
    var syncButton = function () {
      submit.textContent = party.value === '9+' ? 'Call to book for 9 or more' : 'Check availability';
    };
    party.addEventListener('change', syncButton);
    syncButton();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (party.value === '9+') {
        summary.innerHTML = 'For nine or more, please call us on <a href="tel:+442089488330">020 8948 8330</a> and we’ll set the table properly.';
        return;
      }
      if (!date.value || date.value < today) { date.value = today; }
      var n = +party.value;
      var line = 'Table for ' + n + ', ' + fmtDate(date.value) + ', ' + fmtTime(time.value) +
        ': we’ll take you to OpenTable to confirm.';
      var extra = date.value === today ? ' Booking for today? You can also call us on <a href="tel:+442089488330">020 8948 8330</a>.' : '';
      summary.innerHTML = line + extra +
        ' <br><a href="' + OPENTABLE + '" target="_blank" rel="noopener">Open OpenTable<span class="vh"> (opens in a new tab)</span></a> if it didn’t open.';
      window.open(OPENTABLE, '_blank', 'noopener');
    });
  }

  /* ---------------- motion ---------------- */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function staticMode() { root.classList.remove('motion'); }
  if (reduce || !root.classList.contains('motion')) { staticMode(); return; }
  if (!window.gsap || !window.ScrollTrigger) { staticMode(); return; }

  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  /* ---- colour helpers ---- */
  var hex = function (h) { var n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  var toHex = function (c) { return '#' + c.map(function (v) { var s = Math.round(v).toString(16); return s.length < 2 ? '0' + s : s; }).join(''); };
  var mix = function (a, b, t) { var A = hex(a), B = hex(b); return toHex([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };

  /* ---- the frontage: afternoon, golden, dusk, night; then the lamps ---- */
  var hero = document.querySelector('.hero');
  var svg = document.querySelector('.frontage');
  if (!svg || !hero) { staticMode(); return; }
  var bulbs = [].slice.call(svg.querySelectorAll('.bulb'));
  var far = svg.querySelector('.L-far');
  var front = svg.querySelector('.L-front');
  // [afternoon, golden, dusk, night] for each variable; stops at a = 0, .33, .62, 1
  var K = {
    sky1: ['#B9CCD2', '#C4A07E', '#2E2F4F', '#0B0C13'], sky2: ['#DCE1D6', '#E9B377', '#5D4B69', '#141625'], sky3: ['#F2E5C8', '#F7CF8D', '#C47B68', '#262A40'],
    sun: ['#FFF6DC', '#FFD88E', '#F29A6A', '#F29A6A'],
    tree: ['#9FAE98', '#A8805A', '#33304A', '#12131C'], far2: ['#C4C6B8', '#C99A6C', '#3C3854', '#171824'], treefl: ['#B79AC8', '#C08AA0', '#4A3E5E', '#1C1A26'],
    'shade-c': ['#1C1E44', '#1C1E44', '#1C1E44', '#090A14'],
    mullion: ['#2C313C', '#2E2B30', '#1C1D2B', '#111219'], gtop: ['#CFDCDD', '#EBC594', '#4E4868', '#1A1C2B'], 'glow-low': ['#8EA49E', '#A48058', '#2E2C42', '#14151E'],
    fascia: ['#EFE7D2', '#F4DAB0', '#A79E9E', '#CDBFA4'], cap: ['#F8F4EA', '#FBE6C2', '#B5AFAF', '#D9CCB2'], awning: ['#8F9C8C', '#A3916F', '#4B4E5E', '#2A2C37'],
    timber: ['#7B4A28', '#83492A', '#4C3024', '#3B2518'], timberd: ['#573219', '#5E3219', '#33201A', '#23150F'], shopglass: ['#2B3236', '#3D302A', '#1F1D2A', '#141319'],
    deck: ['#5D4A3B', '#6B4A32', '#2E2A33', '#1C1B21'], pave: ['#D3C6AF', '#CB9967', '#3A3953', '#1B1C25'],
    cloth: ['#FAF6EE', '#FBE5C4', '#B9B5C4', '#E2D2B0'], napkin: ['#EAB83B', '#F0A63C', '#8D7752', '#B98C3B'], chair: ['#B7BBBE', '#CDAF8D', '#5C5F70', '#4B4B55'],
    leaf1: ['#2D5634', '#3A5027', '#1C282B', '#0F1619'], leaf2: ['#4B8043', '#5E782E', '#253739', '#151F21'], leaf3: ['#AEC65E', '#C6B24D', '#485446', '#283023'], bloom: ['#F5DCCB', '#F7C9A0', '#8C7C8B', '#5B5162']
  };
  var N = {
    'sun-o': [1, 1, .7, 0], 'sun-y': [30, 118, 300, 560], stars: [0, 0, .3, 1], moon: [0, 0, .45, 1],
    'shade-o': [0, 0, .44, .66], 'warm-o': [0, .2, .04, 0], refl: [.55, .45, .12, 0], glow: [0, .1, .72, 1], shirts: [0, 0, .5, 1],
    glow2: [.22, .38, .8, 1], win: [0, .08, .72, 1], wash: [0, .08, 0, .12], candle: [0, 0, .55, 1]
  };
  var A = [0, .33, .62, 1];
  function seg(a) { var i = a < A[1] ? 0 : a < A[2] ? 1 : 2; return [i, clamp((a - A[i]) / (A[i + 1] - A[i]), 0, 1)]; }

  var B0 = .58, B1 = .84, BW = .03;
  var done = 0;   // furthest point reached: the scene never runs backwards, so it plays once and rests
  function scene(p) {
    p = Math.max(p, done); done = p;
    var a = clamp((p - .04) / .72, 0, 1);
    var sg = seg(a), i = sg[0], t = sg[1], k;
    for (k in K) svg.style.setProperty('--' + k, mix(K[k][i], K[k][i + 1], t));
    for (k in N) {
      var v = N[k][i] + (N[k][i + 1] - N[k][i]) * t;
      svg.style.setProperty('--' + k, k === 'sun-y' ? v.toFixed(1) + 'px' : v.toFixed(3));
    }
    var sum = 0, step = (B1 - B0) / (bulbs.length - 1);
    for (var b = 0; b < bulbs.length; b++) {
      var on = clamp((p - (B0 + b * step)) / BW, 0, 1);
      sum += on;
      bulbs[b].style.setProperty('--on', on.toFixed(3));
    }
    svg.style.setProperty('--tglow', (sum / bulbs.length).toFixed(3));
    if (far) far.setAttribute('transform', 'translate(0 ' + (a * 16).toFixed(1) + ')');
    if (front) front.setAttribute('transform', 'translate(0 ' + (-a * 12).toFixed(1) + ')');
  }

  var mm = gsap.matchMedia();
  mm.add({ phone: '(max-width: 899px)', tall: '(min-height: 520px)' }, function (ctx) {
    var c = ctx.conditions;
    var proxy = { p: done };
    if (c.tall) {
      gsap.to(proxy, {
        p: 1, ease: 'none',
        onUpdate: function () { scene(proxy.p); },
        scrollTrigger: {
          // the pin's scroll distance is the hero's bottom margin (CSS: half a screen on phones,
          // 1.1 on desktop), reserved from first paint; pinSpacing is off so nothing is added later
          trigger: hero, start: 'top top',
          end: function () { return '+=' + (parseFloat(getComputedStyle(hero).marginBottom) || window.innerHeight * 0.5); },
          pin: true, pinSpacing: false, scrub: c.phone ? 0.5 : 0.9, anticipatePin: 1, invalidateOnRefresh: true
        }
      });
      scene(done);
    } else {
      scene(1);   // short landscape screens: no pin, the lit frame
    }
  });

  // a short settle as each scene's text arrives (story, lunch, parties only; never the essentials)
  gsap.utils.toArray('[data-dissolve]').forEach(function (el) {
    gsap.from(el, { opacity: 0, y: 14, duration: 0.5, ease: 'sine.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
  });

  // the lamp over the booking table comes on
  var lamp = document.querySelector('.book__lamp');
  if (lamp) {
    ST.create({
      trigger: '#book', start: 'top 60%', once: true,
      onEnter: function () { gsap.to(lamp, { '--lamp-on': 1, duration: 0.8, ease: 'sine.inOut' }); }
    });
  }

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ST.refresh(); });
})();
