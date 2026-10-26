/* "Finest when warmed": a 5-8 minute timer built on the bakery's own instruction
   (150°, Gas Mark 3, 5 to 8 mins). Sound is created only after the visitor's own tap. */
(function () {
  'use strict';
  var root = document.querySelector('[data-oven]');
  if (!root) return;
  var $ = function (s) { return root.querySelector(s); };
  var startBtn = $('[data-start]'), pauseBtn = $('[data-pause]'), resetBtn = $('[data-reset]');
  var chimeBox = $('[data-chime]'), live = $('[data-live]'), stateEl = $('[data-state]');
  var digits = $('[data-time]').querySelectorAll('span');
  var ring = root.querySelector('.dial__ring');
  var radios = root.querySelectorAll('input[name="mins"]');
  var CIRC = 879.6;

  $('[data-nojs]').hidden = true;
  startBtn.disabled = false;
  chimeBox.disabled = false;

  var total, remaining, endAt = 0, tick = 0, status = 'idle', lastMin = null, ctx = null;

  function chosen() { var r = root.querySelector('input[name="mins"]:checked'); return r ? +r.value : 6; }
  function setTotal() { total = chosen() * 60000; remaining = total; }
  function say(t) { live.textContent = t; }

  function render() {
    var s = Math.ceil(remaining / 1000);
    var m = Math.floor(s / 60), r = s % 60;
    digits[0].textContent = m; digits[2].textContent = Math.floor(r / 10); digits[3].textContent = r % 10;
    var p = status === 'idle' ? 0 : 1 - remaining / total;
    ring.style.strokeDashoffset = (CIRC * (1 - p)).toFixed(1);
    root.style.setProperty('--warm', p.toFixed(3));
  }

  var hush = 0;
  function chime(times, vol) {
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    var now = ctx.currentTime;
    clearTimeout(hush);
    hush = setTimeout(function () { if (ctx && ctx.state === 'running') ctx.suspend(); }, times * 850 + 2000); // let the audio device sleep once the bell has rung
    for (var i = 0; i < times; i++) {
      [784, 1176, 1568].forEach(function (hz, j) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.value = hz;
        var t0 = now + i * 0.85;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(vol / (j + 1), t0 + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.7);
        o.connect(g); g.connect(ctx.destination);
        o.start(t0); o.stop(t0 + 1.8);
      });
    }
  }
  function ensureAudio() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    if (!ctx) ctx = new AC();
    if (ctx.state === 'suspended') ctx.resume();
    return true;
  }

  function lockChoices(v) { radios.forEach(function (r) { r.disabled = v; }); }

  function step() {
    remaining = Math.max(0, endAt - Date.now());
    render();
    var mLeft = Math.ceil(remaining / 60000);
    if (remaining > 0 && mLeft !== lastMin) {
      if (lastMin !== null) say(mLeft === 1 ? 'One minute left.' : mLeft + ' minutes left.');
      lastMin = mLeft;
    }
    if (remaining <= 0) done();
  }

  function run() {
    status = 'running';
    endAt = Date.now() + remaining;
    clearInterval(tick); tick = setInterval(step, 250);
    lockChoices(true);
    startBtn.hidden = true; pauseBtn.hidden = false; resetBtn.hidden = false;
    pauseBtn.textContent = 'Pause';
    root.classList.remove('is-done');
    stateEl.textContent = 'Warming at 150°, Gas Mark 3. On a warmed baking tray or wire rack.';
    step();
  }
  function done() {
    clearInterval(tick);
    status = 'done';
    remaining = 0; render();
    root.classList.add('is-done');
    stateEl.innerHTML = 'Warm. &ldquo;Devour when cooling from the oven, deliciously warm&rdquo;';
    say('Your tart is warm. Devour when cooling from the oven, deliciously warm.');
    if (chimeBox.checked) chime(3, 0.16);
    pauseBtn.hidden = true; startBtn.hidden = false; startBtn.textContent = 'Warm another';
    lockChoices(false);
  }
  function reset() {
    clearInterval(tick); status = 'idle'; lastMin = null;
    setTotal(); render();
    root.classList.remove('is-done');
    startBtn.hidden = false; startBtn.textContent = 'Start the timer';
    pauseBtn.hidden = true; resetBtn.hidden = true;
    stateEl.textContent = 'Set for 150°, Gas Mark 3. Choose your minutes, then start when the tart goes in.';
    lockChoices(false);
  }

  startBtn.addEventListener('click', function () {
    if (chimeBox.checked) ensureAudio();
    if (status === 'done' || status === 'idle') { setTotal(); lastMin = null; }
    run();
    say('Timer started: ' + Math.round(remaining / 60000) + ' minutes.');
  });
  pauseBtn.addEventListener('click', function () {
    if (status === 'running') {
      clearInterval(tick); remaining = Math.max(0, endAt - Date.now()); status = 'paused';
      pauseBtn.textContent = 'Resume'; stateEl.textContent = 'Paused. The oven is still on.';
      say('Paused.');
    } else if (status === 'paused') { run(); say('Resumed.'); }
  });
  resetBtn.addEventListener('click', function () { reset(); say('Timer reset.'); });
  chimeBox.addEventListener('change', function () {
    if (chimeBox.checked && ensureAudio()) chime(1, 0.08); // a quiet preview, only because the visitor tapped
  });
  radios.forEach(function (r) { r.addEventListener('change', function () { if (status === 'idle' || status === 'done') { status = 'idle'; reset(); } }); });
  document.addEventListener('visibilitychange', function () { if (status === 'running') step(); });
  window.addEventListener('pagehide', function () { clearInterval(tick); clearTimeout(hush); if (ctx && ctx.close) ctx.close(); ctx = null; });

  setTotal(); render();
})();
