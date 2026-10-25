/* Concept B "Sera": homepage behaviour.
   1. Booking step (works with or without GSAP).
   2. Motion (only when html.motion is set and GSAP loaded): the page light engine,
      the pinned frontage ("Si accendono le luci"), the gallery strip and the booking lamp. */
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

  /* ---- page light engine ----
     t runs 0 (afternoon) .. 1 (golden) .. 2 (dusk) .. 3 (night).
     Between afternoon and golden the ink stays dark; between dusk and night it stays plaster.
     Between golden and dusk no ink passes AA at the midpoint, so the page never rests there:
     it dissolves across in 1.4s and the ink steps at the middle of the dissolve. */
  var STAGES = ['#E9DDC8', '#D99A55', '#2E2F4F', '#121319'];
  var bgAt = function (t) { t = clamp(t, 0, 3); var i = Math.min(2, Math.floor(t)); return mix(STAGES[i], STAGES[i + 1], t - i); };
  var quant = function (s) { return s <= 1 || s >= 2 ? s : (s < 1.5 ? 1 : 2); };
  var theme = document.querySelector('meta[name="theme-color"]');
  var light = { d: 0 };
  var wasDark = null, crossing = false;
  function applyLight() {
    var d = light.d;
    root.style.setProperty('--bg', bgAt(d));
    var dark = d >= 1.5;
    if (dark !== wasDark) {
      wasDark = dark;
      root.style.setProperty('--ink', dark ? '#F1EAE0' : '#1E1A17');
      root.style.setProperty('--ink-soft', dark ? '#BDB3A6' : '#3E3631');
      root.style.setProperty('--accent', dark ? '#F4B54A' : '#1E1A17');
      root.style.setProperty('--rule', dark ? 'rgba(241,234,224,.22)' : 'rgba(30,26,23,.26)');
      root.style.colorScheme = dark ? 'dark' : 'light';
    }
    if (theme) theme.setAttribute('content', bgAt(d));
  }

  var hero = document.querySelector('.hero');
  var scenes = [].slice.call(document.querySelectorAll('.scene[data-stage]'));
  var heroS = 0;
  function targetLight() {
    var line = window.innerHeight * 0.45;
    var hr = hero.getBoundingClientRect();
    if (line < hr.bottom) return heroS;
    var prev = 3;
    for (var i = 0; i < scenes.length; i++) {
      var el = scenes[i], r = el.getBoundingClientRect(), st = parseFloat(el.dataset.stage);
      if (line < r.bottom) {
        var lead = parseFloat(getComputedStyle(el).paddingTop) || 1;
        var k = clamp((line - r.top) / lead, 0, 1);
        return prev + (st - prev) * k;
      }
      prev = st;
    }
    return prev;
  }
  function syncLight() {
    if (crossing) return;
    var target = quant(targetLight());
    var side = function (v) { return v < 1.5; };
    if (side(target) !== side(light.d)) {
      crossing = true;
      gsap.to(light, { d: target, duration: 1.4, ease: 'sine.inOut', overwrite: true, onUpdate: applyLight,
        onComplete: function () { crossing = false; syncLight(); } });
    } else {
      gsap.to(light, { d: target, duration: 0.5, ease: 'sine.out', overwrite: true, onUpdate: applyLight });
    }
  }

  /* ---- the frontage: Si accendono le luci ---- */
  var svg = document.querySelector('.frontage');
  var bulbs = svg ? [].slice.call(svg.querySelectorAll('.bulb')) : [];
  var far = svg && svg.querySelector('.L-far');
  var front = svg && svg.querySelector('.L-front');
  // [afternoon, golden, dusk, night] for each variable; stops at a = 0, .33, .62, 1
  var K = {
    sky1: ['#B9CCD2', '#C4A07E', '#2E2F4F', '#0B0C13'], sky2: ['#DCE1D6', '#E9B377', '#5D4B69', '#141625'], sky3: ['#F2E5C8', '#F7CF8D', '#C47B68', '#262A40'],
    sun: ['#FFF6DC', '#FFD88E', '#F29A6A', '#F29A6A'],
    tree: ['#9FAE98', '#A8805A', '#33304A', '#12131C'], far2: ['#C4C6B8', '#C99A6C', '#3C3854', '#171824'], treefl: ['#B79AC8', '#C08AA0', '#4A3E5E', '#1C1A26'],
    'shade-c': ['#1A1D3A', '#B0582A', '#1C1E44', '#090A14'],
    mullion: ['#2C313C', '#2E2B30', '#1C1D2B', '#111219'], gtop: ['#CFDCDD', '#EBC594', '#4E4868', '#1A1C2B'], 'glow-low': ['#8EA49E', '#A48058', '#2E2C42', '#14151E'],
    fascia: ['#EFE7D2', '#F4DAB0', '#A79E9E', '#CDBFA4'], cap: ['#F8F4EA', '#FBE6C2', '#B5AFAF', '#D9CCB2'], awning: ['#8F9C8C', '#A3916F', '#4B4E5E', '#2A2C37'],
    timber: ['#7B4A28', '#83492A', '#4C3024', '#3B2518'], timberd: ['#573219', '#5E3219', '#33201A', '#23150F'], shopglass: ['#2B3236', '#3D302A', '#1F1D2A', '#141319'],
    deck: ['#5D4A3B', '#6B4A32', '#2E2A33', '#1C1B21'], pave: ['#D3C6AF', '#CB9967', '#3A3953', '#1B1C25'],
    cloth: ['#FAF6EE', '#FBE5C4', '#B9B5C4', '#E2D2B0'], napkin: ['#EAB83B', '#F0A63C', '#8D7752', '#B98C3B'], chair: ['#B7BBBE', '#CDAF8D', '#5C5F70', '#4B4B55'],
    leaf1: ['#2D5634', '#3A5027', '#1C282B', '#0F1619'], leaf2: ['#4B8043', '#5E782E', '#253739', '#151F21'], leaf3: ['#AEC65E', '#C6B24D', '#485446', '#283023'], bloom: ['#F5DCCB', '#F7C9A0', '#8C7C8B', '#5B5162']
  };
  var N = {
    'sun-o': [1, 1, .7, 0], 'sun-y': [30, 118, 300, 560], stars: [0, 0, .3, 1], moon: [0, 0, .45, 1],
    'shade-o': [0, .14, .44, .66], refl: [.55, .45, .12, 0], glow: [0, .1, .72, 1], shirts: [0, 0, .5, 1],
    glow2: [.22, .38, .8, 1], win: [0, .08, .72, 1], wash: [0, .08, 0, .12], candle: [0, 0, .55, 1]
  };
  var A = [0, .33, .62, 1];
  function seg(a) { var i = a < A[1] ? 0 : a < A[2] ? 1 : 2; return [i, clamp((a - A[i]) / (A[i + 1] - A[i]), 0, 1)]; }

  var subs = [].slice.call(document.querySelectorAll('.hero .sub'));
  var rowDay = document.querySelector('.hero__row--day');
  var rowNight = document.querySelector('.hero__row--night');
  var line = 0;
  function setLine(n) {
    if (n === line) return;
    line = n;
    subs.forEach(function (el) {
      gsap.to(el, { opacity: +el.dataset.line === n ? 1 : 0, duration: 1.3, ease: 'sine.inOut', overwrite: true });
    });
    var night = n === 3;
    gsap.to(rowNight, { autoAlpha: night ? 1 : 0, duration: 1.3, ease: 'sine.inOut', overwrite: true });
    gsap.to(rowDay, { autoAlpha: night ? 0 : 1, duration: 1.3, ease: 'sine.inOut', overwrite: true });
  }

  var B0 = .58, B1 = .84, BW = .03;
  function scene(p) {
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
    heroS = 3 * a;
    syncLight();
    setLine(p < .40 ? 1 : p < B1 + BW - .005 ? 2 : 3);
  }

  // initial hidden states for the hero lines (JS-applied)
  subs.forEach(function (el) { gsap.set(el, { opacity: +el.dataset.line === 1 ? 1 : 0 }); });
  gsap.set(rowNight, { autoAlpha: 0 });
  gsap.set(rowDay, { autoAlpha: 1 });
  line = 1;

  var mm = gsap.matchMedia();
  mm.add({ phone: '(max-width: 899px)', desk: '(min-width: 900px)', tall: '(min-height: 520px)' }, function (ctx) {
    var c = ctx.conditions;
    var proxy = { p: 0 };
    if (svg && c.tall) {
      gsap.to(proxy, {
        p: 1, ease: 'none',
        onUpdate: function () { scene(proxy.p); },
        scrollTrigger: {
          trigger: hero, start: 'top top',
          end: c.phone ? '+=110%' : '+=170%',   // short on phones so the scene never traps a thumb
          pin: true, scrub: c.phone ? 0.6 : 1.1, anticipatePin: 1
        }
      });
      scene(0);
    } else if (svg) {
      scene(1);
    }

    // gallery: a scrubbed horizontal move on desktop; native swipe with snap on phones
    var strip = document.querySelector('.strip');
    var track = strip && strip.querySelector('.strip__track');
    if (c.desk && strip) {
      var dist = function () { return Math.max(0, track.scrollWidth - strip.clientWidth); };
      if (dist() > 40) {
        strip.classList.add('is-scrubbed');
        strip.removeAttribute('tabindex');
        gsap.to(track, {
          x: function () { return -dist(); }, ease: 'none',
          scrollTrigger: { trigger: strip.closest('.scene'), start: 'bottom bottom', end: function () { return '+=' + dist(); }, pin: true, scrub: 1, invalidateOnRefresh: true }
        });
      }
      return function () { strip.classList.remove('is-scrubbed'); strip.setAttribute('tabindex', '0'); gsap.set(track, { clearProps: 'transform' }); };
    }
  });

  // film-style dissolves as each scene's text arrives
  gsap.utils.toArray('[data-dissolve]').forEach(function (el) {
    gsap.from(el, { opacity: 0, y: 18, duration: 1.4, ease: 'sine.inOut', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });

  // the lamp over the booking table comes on
  var lamp = document.querySelector('.book__lamp');
  if (lamp) {
    ST.create({
      trigger: '#book', start: 'top 60%',
      onEnter: function () { gsap.to(lamp, { '--lamp-on': 1, duration: 1.6, ease: 'sine.inOut' }); },
      onLeaveBack: function () { gsap.to(lamp, { '--lamp-on': 0, duration: 1.2, ease: 'sine.inOut' }); }
    });
  }

  ST.create({ start: 0, end: 'max', onUpdate: syncLight, onRefresh: syncLight });
  light.d = quant(targetLight()); applyLight();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ST.refresh(); });
})();
