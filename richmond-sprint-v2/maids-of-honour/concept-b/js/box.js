/* The iron box. Without JS (or with reduced motion) the box rests open and every layer is on the page.
   With motion, the box starts locked; turning the key plays: key turns, lid lifts, the layers rise one
   by one, the sealed recipe stirs, then the lid closes on it: "The recipe stays in the box." */
(function () {
  'use strict';
  var root = document.querySelector('[data-ironbox]');
  if (!root) return;
  var btn = root.querySelector('[data-key]');
  var label = root.querySelector('[data-key-label]');
  var hint = root.querySelector('[data-hint]');
  var live = root.querySelector('[data-box-live]');
  var words = root.querySelector('[data-words]');
  var motion = document.documentElement.classList.contains('motion');
  var timers = [];
  var expanded = true;

  // Split the final line into words so it can settle word by word.
  if (words) {
    words.innerHTML = words.textContent.trim().split(/\s+/).map(function (w, i) {
      return '<span class="final-word" style="--w-i:' + i + '">' + w + '</span>';
    }).join(' ');
  }

  btn.hidden = false;
  hint.hidden = false;
  var hintText = hint.firstChild;

  function clear() { timers.forEach(clearTimeout); timers = []; }
  function at(ms, fn) { timers.push(setTimeout(function () { fn(); }, ms)); }
  function setState(cls) { root.className = 'ironbox ' + cls; }
  function setExpanded(v) {
    expanded = v;
    btn.setAttribute('aria-expanded', String(v));
    label.textContent = v ? 'Turn the key and put everything back in the iron box' : 'Turn the key to open the iron box';
    hintText.nodeValue = v ? 'Turn the key to put it all back' : 'Turn the key';
  }
  function say(t) { live.textContent = ''; setTimeout(function () { live.textContent = t; }, 60); }

  function restOpen() { clear(); setState('is-open is-rest is-turned'); setExpanded(true); }
  function locked() { clear(); setState('is-locked is-collapsed'); setExpanded(false); }
  function sealed() { clear(); setState('is-revealed is-sealed'); setExpanded(true); }

  function play() {
    clear();
    setState('is-collapsed is-turned');                       // the key turns
    at(560, function () { root.classList.add('is-open'); });  // the lid lifts
    at(1500, function () {                                     // the layers rise, one by one
      root.classList.remove('is-collapsed');
      root.classList.add('is-revealed');
      setExpanded(true);
      say('The box is open. Inside: the legend, the tart, what the bakery says about it, its allergens and its price.');
    });
    at(4300, function () { root.classList.add('is-rising'); });     // the recipe stirs…
    at(5500, function () { root.classList.remove('is-rising'); });  // …and settles back
    at(6200, function () { root.classList.remove('is-open'); });    // the lid comes down on it
    at(7300, function () {
      root.classList.remove('is-turned');                            // the key turns back
      root.classList.add('is-sealed');
      say('The recipe stays in the box.');
      timers = [];
    });
  }

  btn.addEventListener('click', function () {
    if (!motion) { if (expanded) locked(); else restOpen(); return; }
    if (timers.length) { sealed(); say('The recipe stays in the box.'); return; } // a second turn skips to the end
    if (expanded) { locked(); say('Everything is back in the box.'); } else play();
  });

  if (motion) {
    // Lock instantly on load: the no-JS markup is drawn open, and it should not visibly swing shut.
    root.setAttribute('data-instant', '');
    locked();
    requestAnimationFrame(function () { requestAnimationFrame(function () { root.removeAttribute('data-instant'); }); });
    // A small nudge of the key the first time the box comes into view.
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return;
        io.disconnect();
        var k = root.querySelector('.key');
        if (k && k.animate && !expanded) {
          k.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-14deg)' }, { transform: 'rotate(8deg)' }, { transform: 'rotate(0)' }], { duration: 900, delay: 500, easing: 'ease-in-out' });
        }
      }, { threshold: 0.6 });
      io.observe(root.querySelector('.casket'));
    }
  } else {
    restOpen();
  }
})();
