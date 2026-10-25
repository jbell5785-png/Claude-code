/* Tide Tables · Concept C · the free local map, step by step.
   Without JS every step is listed and the whole route is drawn. With JS the list becomes a
   step-through: Previous / Next buttons, each step title is a button, the walked route draws in. */
(function () {
  'use strict';
  var section = document.querySelector('[data-walk]');
  if (!section) return;
  var items = Array.prototype.slice.call(section.querySelectorAll('.steps__list > li'));
  var ctrl = section.querySelector('[data-ctrl]');
  var live = section.querySelector('[data-live]');
  var marks = Array.prototype.slice.call(section.querySelectorAll('.mk'));
  var segs = Array.prototype.slice.call(section.querySelectorAll('.route-walk .seg'));
  var walker = section.querySelector('.walker');
  if (!items.length || !ctrl) return;

  var pos = marks.map(function (m) {
    var t = /translate\(([-\d.]+),([-\d.]+)\)/.exec(m.getAttribute('transform')) || [0, 0, 0];
    return [parseFloat(t[1]), parseFloat(t[2])];
  });
  if (walker) { walker.removeAttribute('transform'); }

  function mkBtn(label, cls, txt) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'btn btn--chalk steps__btn ' + cls;
    b.setAttribute('aria-label', label); b.textContent = txt;
    return b;
  }
  var prev = mkBtn('Previous step', 'prev', '←');
  var next = mkBtn('Next step', 'next', 'Next step →');
  var count = document.createElement('span');
  count.className = 'count'; count.setAttribute('aria-hidden', 'true');
  ctrl.appendChild(prev); ctrl.appendChild(next); ctrl.appendChild(count);

  var buttons = items.map(function (li, i) {
    var h = li.querySelector('.step__t');
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = h.textContent;
    var d = li.querySelector('.step__d');
    d.id = 'walk-step-' + (i + 1);
    b.setAttribute('aria-controls', d.id);
    h.textContent = '';
    h.appendChild(b);
    b.addEventListener('click', function () { go(i, true); });
    b.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); go(Math.min(items.length - 1, i + 1), true, true); }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); go(Math.max(0, i - 1), true, true); }
    });
    return b;
  });

  var at = 0;
  function go(i, announce, focus) {
    at = i;
    items.forEach(function (li, k) {
      var on = k === i;
      li.classList.toggle('on', on);
      buttons[k].setAttribute('aria-expanded', on ? 'true' : 'false');
      if (on) buttons[k].setAttribute('aria-current', 'step'); else buttons[k].removeAttribute('aria-current');
    });
    marks.forEach(function (m, k) { m.classList.toggle('on', k === i); });
    segs.forEach(function (s) { s.classList.toggle('on', parseInt(s.getAttribute('data-seg'), 10) <= i + 1); });
    if (walker && pos[i]) walker.style.transform = 'translate(' + pos[i][0] + 'px,' + pos[i][1] + 'px)';
    prev.disabled = i === 0; next.disabled = i === items.length - 1;
    next.textContent = i === items.length - 1 ? 'Arrived' : 'Next step →';
    count.textContent = (i + 1) + ' / ' + items.length;
    if (announce && live) live.textContent = 'Step ' + (i + 1) + ' of ' + items.length + ': ' + buttons[i].textContent + '. ' + items[i].querySelector('.step__d').textContent;
    if (focus) buttons[i].focus();
  }
  prev.addEventListener('click', function () { if (at > 0) go(at - 1, true); });
  next.addEventListener('click', function () { if (at < items.length - 1) go(at + 1, true); });
  marks.forEach(function (m, k) { m.style.cursor = 'pointer'; m.addEventListener('click', function () { go(k, true); }); });
  go(0, false);
})();
