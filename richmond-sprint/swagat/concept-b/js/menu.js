/*
 * Menu page: a "Vegetarian" view (aria-pressed) that keeps only the sections the menu itself
 * heads Vegetarian, a separate "vegan suitable (V)" highlight, and a course index that follows
 * the reader. Everything is in the HTML already; without JS the full menu shows.
 */
(function () {
  'use strict';
  var root = document.documentElement;
  var body = document.getElementById('menu-body');
  var vegBtn = document.getElementById('veg-toggle');
  var veganBtn = document.getElementById('vegan-toggle');
  var status = document.getElementById('view-status');
  if (!body || !vegBtn || !veganBtn) return;

  var motion = root.classList.contains('motion');
  var FADE = 400;

  var courses = Array.prototype.slice.call(body.querySelectorAll('.course'));
  var dividers = Array.prototype.slice.call(body.querySelectorAll('.menu-divider'));
  var nonVegGroups = Array.prototype.slice.call(body.querySelectorAll('.course__group[data-nonveg]'));
  var indexLinks = Array.prototype.slice.call(document.querySelectorAll('.menu-index a'));

  // What the vegetarian view hides: whole courses with no Vegetarian heading,
  // the Non-Vegetarian groups inside Starters and Main Course, and the dividers before hidden courses.
  var vegHides = courses.filter(function (c) { return !c.hasAttribute('data-has-veg'); })
    .concat(nonVegGroups)
    .concat(dividers.filter(function (d) { return d.hasAttribute('data-nonveg'); }));

  function countVisible(sel) {
    return Array.prototype.filter.call(body.querySelectorAll(sel), function (el) {
      return !el.closest('[hidden]');
    }).length;
  }

  function hideAll(els) {
    els.forEach(function (el) {
      if (el.hidden) return;
      if (!motion) { el.hidden = true; return; }
      el.classList.remove('is-showing');
      el.classList.add('is-fading');
      setTimeout(function () {
        if (el.classList.contains('is-fading')) { el.hidden = true; el.classList.remove('is-fading'); }
      }, FADE);
    });
  }
  function showAll(els) {
    els.forEach(function (el) {
      el.classList.remove('is-fading');
      if (!el.hidden) return;
      el.hidden = false;
      if (motion) {
        el.classList.add('is-showing');
        setTimeout(function () { el.classList.remove('is-showing'); }, FADE);
      }
    });
  }

  function announce() {
    var veg = vegBtn.getAttribute('aria-pressed') === 'true';
    var vegan = veganBtn.getAttribute('aria-pressed') === 'true';
    // Count after the DOM settles (hidden flags are applied after the fade).
    setTimeout(function () {
      var parts = [];
      parts.push(veg
        ? 'Showing the menu’s two Vegetarian sections: ' + countVisible('.dish') + ' dishes.'
        : 'Showing the full menu: ' + countVisible('.dish') + ' dishes.');
      if (vegan) {
        var n = countVisible('.dish[data-vegan]');
        parts.push(n === 1 ? '1 dish marked V (vegan suitable) is highlighted.'
          : n + ' dishes marked V (vegan suitable) are highlighted.');
      }
      status.textContent = parts.join(' ');
    }, motion ? FADE + 20 : 0);
  }

  function setVeg(on, quiet) {
    vegBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (on) hideAll(vegHides); else showAll(vegHides);
    indexLinks.forEach(function (a) {
      a.parentNode.hidden = on && !a.hasAttribute('data-veg');
    });
    try {
      var url = new URL(window.location.href);
      if (on) url.searchParams.set('view', 'vegetarian'); else url.searchParams.delete('view');
      window.history.replaceState(null, '', url.toString());
    } catch (e) { /* history is a nicety */ }
    if (!quiet) announce();
  }

  function setVegan(on) {
    veganBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    body.classList.toggle('show-vegan', on);
    announce();
  }

  vegBtn.addEventListener('click', function () {
    setVeg(vegBtn.getAttribute('aria-pressed') !== 'true');
  });
  veganBtn.addEventListener('click', function () {
    setVegan(veganBtn.getAttribute('aria-pressed') !== 'true');
  });

  // Open straight into the vegetarian view from the homepage link (menu.html?view=vegetarian)
  var params;
  try { params = new URLSearchParams(window.location.search); } catch (e) { params = null; }
  if (params && params.get('view') === 'vegetarian') {
    var wasMotion = motion; motion = false;
    setVeg(true, true);
    motion = wasMotion;
    announce();
  }

  // Course index follows the reader
  if ('IntersectionObserver' in window) {
    var current = null;
    var byId = {};
    indexLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var visible = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting; });
      var first = null;
      for (var i = 0; i < courses.length; i++) {
        if (visible[courses[i].id] && !courses[i].hidden) { first = courses[i].id; break; }
      }
      if (first && first !== current) {
        if (current && byId[current]) byId[current].removeAttribute('aria-current');
        if (byId[first]) {
          byId[first].setAttribute('aria-current', 'true');
          // keep the active item in view in the small-screen scrolling bar
          var bar = byId[first].closest('ol');
          if (bar && bar.scrollWidth > bar.clientWidth) {
            var a = byId[first];
            bar.scrollTo({ left: a.offsetLeft - 16, behavior: motion ? 'smooth' : 'auto' });
          }
        }
        current = first;
      }
    }, { rootMargin: '-20% 0px -55% 0px' });
    courses.forEach(function (c) { io.observe(c); });
  }
})();
