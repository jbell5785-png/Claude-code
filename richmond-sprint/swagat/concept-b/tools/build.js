#!/usr/bin/env node
/*
 * Authoring tool for Concept B. Not needed to view the site.
 * Regenerates the pre-rendered dot-grid patterns and the menu markup, and writes them
 * into index.html and menu.html between <!-- build:NAME --> and <!-- /build:NAME --> markers.
 * Run: node tools/build.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kolam');
const MENU = require('./menu-data');

const ROOT = path.join(__dirname, '..');
const WEIGHTS = { none: 0.45, wall: 0.4, pass: 0.15 };

// Seeds chosen by eye from single- and double-loop candidates (see NOTES.md).
const PATTERNS = {
  wide: { cols: 19, rows: 9, hole: { c0: 4, c1: 14, r0: 2, r1: 6 }, symmetry: 'd2', seed: 2845 },
  square: { cols: 9, rows: 9, hole: { c0: 1, c1: 7, r0: 3, r1: 5 }, symmetry: 'd2', seed: 81 },
  divider: { cols: 11, rows: 3, hole: null, symmetry: 'd2', seed: 619 }
};

function gen(name) {
  const k = K.generate(Object.assign({ weights: WEIGHTS }, PATTERNS[name]));
  return k;
}

const SCALE = 10;
const wide = gen('wide');
const square = gen('square');
const divider = gen('divider');

function heroArt() {
  const w = K.toSVG(wide, { scale: SCALE, cls: 'kolam kolam--wide', dotR: 0.12 });
  const s = K.toSVG(square, { scale: SCALE, cls: 'kolam kolam--square', dotR: 0.13 });
  return '\n' +
    '        <div class="threshold__art threshold__art--wide">' + w + '</div>\n' +
    '        <div class="threshold__art threshold__art--square">' + s + '</div>\n        ';
}

// Shared sprite: chalk filter, divider symbol and small icons. Kept off-screen (not display:none,
// which would stop the filter from applying in some browsers).
function sprite() {
  const div = K.toSVG(divider, { scale: SCALE, asSymbol: true, id: 'k-divider', dotR: 0.16 });
  return '\n  <svg class="sprite" width="0" height="0" aria-hidden="true" focusable="false">\n' +
    '    <defs>\n' +
    '      <filter id="chalk" x="-2%" y="-2%" width="104%" height="104%" color-interpolation-filters="sRGB">\n' +
    '        <feTurbulence type="fractalNoise" baseFrequency="0.3" numOctaves="2" seed="7" result="wobbleNoise"/>\n' +
    '        <feDisplacementMap in="SourceGraphic" in2="wobbleNoise" scale="0.6" xChannelSelector="R" yChannelSelector="G" result="wobble"/>\n' +
    '        <feTurbulence type="fractalNoise" baseFrequency="1.8" numOctaves="1" seed="3" result="grain"/>\n' +
    '        <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.5 1.75" result="grainAlpha"/>\n' +
    '        <feComposite in="wobble" in2="grainAlpha" operator="in"/>\n' +
    '      </filter>\n' +
    '    </defs>\n' +
    '    ' + div + '\n' +
    '    <symbol id="i-chilli" viewBox="0 0 16 16"><path d="M4.6 5.3c1.9-1.2 4-.6 5 1.4.9 1.8 1.6 3.9 3.8 5.6.3.2.2.7-.2.7-3.7.3-7.2-1.5-8.8-4.6-.5-1-.5-2.4.2-3.1z" fill="currentColor"/><path d="M4.3 5.6c.4-1 1.3-1.5 2.3-1.3M5.6 4.5c-.1-1.3.4-2.3 1.5-2.9" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></symbol>\n' +
    '    <symbol id="i-out" viewBox="0 0 16 16"><path d="M5 3.5h7.5V11M12.2 3.8 3.5 12.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square"/></symbol>\n' +
    '    <symbol id="i-phone" viewBox="0 0 16 16"><path d="M4.2 1.8 6.4 4.4 5.1 6.3c.8 1.8 2.3 3.3 4.1 4.1l1.9-1.3 2.6 2.2-.9 2.4C7.6 13.8 2.2 8.4 1.8 3.2z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></symbol>\n' +
    '    <symbol id="i-bag" viewBox="0 0 16 16"><path d="M3 5.5h10l-.8 8.5H3.8zM5.8 5.5V4a2.2 2.2 0 0 1 4.4 0v1.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></symbol>\n' +
    '    <symbol id="i-table" viewBox="0 0 16 16"><path d="M2 6h12M4 6v7.5M12 6v7.5M2.5 6l1.5-3h8l1.5 3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></symbol>\n' +
    '    <symbol id="i-menu" viewBox="0 0 16 16"><path d="M3 2.5h10v11H3zM5.5 6h5M5.5 8.5h5M5.5 11h3" fill="none" stroke="currentColor" stroke-width="1.4"/></symbol>\n' +
    '    <symbol id="i-mail" viewBox="0 0 16 16"><path d="M2 3.5h12v9H2zM2.4 4l5.6 4.6L13.6 4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></symbol>\n' +
    '    <symbol id="i-at" viewBox="0 0 16 16"><rect x="2" y="2" width="12" height="12" rx="3.5" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="8" r="2.8" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="11.6" cy="4.4" r=".9" fill="currentColor"/></symbol>\n' +
    '    <symbol id="i-pin" viewBox="0 0 16 16"><path d="M8 14.5s4.5-4.6 4.5-8a4.5 4.5 0 0 0-9 0c0 3.4 4.5 8 4.5 8z" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="6.5" r="1.6" fill="currentColor"/></symbol>\n' +
    '  </svg>\n  ';
}

const CODE_NAMES = { D: 'Dairy', E: 'Eggs', N: 'Nuts', G: 'Gluten', C: 'Crustaceans', M: 'Mustard', S: 'Soya', V: 'Vegan suitable' };
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function codesHTML(codes) {
  if (!codes) return '';
  const list = codes.split(' ').filter(Boolean);
  return '<span class="codes"><span class="vh">Allergen codes: </span>' +
    list.map((c) => '<span class="code' + (c === 'V' ? ' code--v' : '') + '" title="' + CODE_NAMES[c] + '"><span aria-hidden="true">' + c + '</span><span class="vh">' + CODE_NAMES[c] + (c === list[list.length - 1] ? '' : ', ') + '</span></span>').join('') +
    '</span>';
}
function chilliHTML(n) {
  if (!n) return '';
  let icons = '';
  for (let i = 0; i < n; i++) icons += '<svg class="chilli" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><use href="#i-chilli"/></svg>';
  return '<span class="chillies" title="' + n + ' chilli icon' + (n > 1 ? 's' : '') + ', as printed">' + icons + '<span class="vh">' + n + ' chilli icon' + (n > 1 ? 's' : '') + ' as printed</span></span>';
}
function priceHTML(p) {
  if (p.length === 1 && !p[0][0]) return '<span class="dish__price">' + p[0][1] + '</span>';
  return '<span class="dish__price dish__price--pair">' + p.map((x) => '<span><span class="dish__plabel">' + x[0] + '</span> ' + x[1] + '</span>').join('') + '</span>';
}
function dishHTML(d, ind) {
  const isV = /\bV\b/.test(d.codes);
  let h = ind + '<li class="dish"' + (isV ? ' data-vegan' : '') + '>\n';
  h += ind + '  <div class="dish__line">\n';
  h += ind + '    <p class="dish__name"><span class="dish__title">' + esc(d.n) + '</span>' +
    (d.meta ? ' <span class="dish__meta">(' + d.meta + ')</span>' : '') +
    (d.tag ? ' <span class="dish__tag">(' + d.tag + ')</span>' : '') +
    codesHTML(d.codes) + chilliHTML(d.c) + '</p>\n';
  h += ind + '    ' + priceHTML(d.p) + '\n';
  h += ind + '  </div>\n';
  if (d.d) {
    h += ind + '  <p class="dish__desc">' + esc(d.d) + '</p>\n';
  }
  if (d.descFromB) {
    h += ind + '  <p class="dish__flag">Description from the online ordering menu; the page-text menu repeats Masala Bhindi’s here. <!-- [TO CONFIRM] Yellow Dal Tadka description: version A duplicates Masala Bhindi; version B text used --><span class="tbc" title="To be confirmed with the restaurant">to confirm</span></p>\n';
  }
  h += ind + '</li>\n';
  return h;
}

function menuHTML() {
  let h = '\n';
  const ind = '          ';
  MENU.forEach((sec, si) => {
    const vegSection = sec.groups.some((g) => g.veg === true);
    if (si > 0) {
      h += ind + '<div class="menu-divider" aria-hidden="true"' + (vegSection ? '' : ' data-nonveg') + '><svg class="divider-art" viewBox="0 0 220 60" focusable="false"><use href="#k-divider"/></svg></div>\n';
    }
    h += ind + '<section class="course" id="' + sec.id + '" aria-labelledby="' + sec.id + '-h"' + (vegSection ? ' data-has-veg' : '') + '>\n';
    h += ind + '  <div class="course__head">\n';
    h += ind + '    <h2 class="course__title" id="' + sec.id + '-h">' + esc(sec.title) + '</h2>\n';
    if (sec.fromB) {
      h += ind + '    <p class="course__source">From the online ordering menu. These don’t appear on the page-text menu. <!-- [TO CONFIRM] ' + sec.title + ' appears only in version B (ordering widget) --><span class="tbc" title="To be confirmed with the restaurant">to confirm</span></p>\n';
    }
    h += ind + '  </div>\n';
    sec.groups.forEach((g) => {
      const attrs = g.veg === true ? ' data-veg' : (g.veg === false ? ' data-nonveg' : '');
      h += ind + '  <div class="course__group" id="' + g.id + '"' + attrs + '>\n';
      if (g.title) {
        h += ind + '    <h3 class="course__sub">' + esc(g.title) + (g.note ? ' <span class="course__subnote">(' + g.note + ')</span>' : '') + '</h3>\n';
      }
      if (g.sideNote) {
        h += ind + '    <p class="course__note">“' + esc(g.sideNote) + '”</p>\n';
      }
      h += ind + '    <ul class="dishes" role="list">\n';
      g.dishes.forEach((d) => { h += dishHTML(d, ind + '      '); });
      h += ind + '    </ul>\n';
      h += ind + '  </div>\n';
    });
    h += ind + '</section>\n';
  });
  return h + '        ';
}

function inject(file, name, content) {
  const p = path.join(ROOT, file);
  let src = fs.readFileSync(p, 'utf8');
  const re = new RegExp('(<!-- build:' + name + ' -->)[\\s\\S]*?(<!-- /build:' + name + ' -->)');
  if (!re.test(src)) throw new Error('marker ' + name + ' missing in ' + file);
  src = src.replace(re, (m, a, b) => a + content + b);
  fs.writeFileSync(p, src);
}

inject('index.html', 'sprite', sprite());
inject('index.html', 'hero-art', heroArt());
inject('menu.html', 'sprite', sprite());
inject('menu.html', 'menu', menuHTML());

// Standalone exports for the asset handover (print, social, signage). Not used by the pages.
function standalone(k, w, file, bg) {
  const svg = K.toSVG(k, { scale: SCALE, cls: 'kolam', dotR: 0.12 })
    .replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')
    .replace(' aria-hidden="true"', ' role="img" aria-label="Swagat doorstep pattern, seed ' + k.seed + '"')
    .replace(/var\(--k-dot,currentColor\)/g, '#F2A33A')
    .replace(/var\(--k-line,currentColor\)/g, '#F6F2EA')
    .replace(/var\(--k-w,1px\)/g, String(w))
    .replace(/filter:var\(--k-filter,none\)/g, '')
    .replace('focusable="false">', 'focusable="false"><rect width="100%" height="100%" fill="' + bg + '"/>');
  fs.mkdirSync(path.join(ROOT, 'img'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'img', file), svg + '\n');
}
standalone(wide, 0.8, 'doorstep-pattern-wide.svg', '#1B1E3A');
standalone(square, 1, 'doorstep-pattern-square.svg', '#1B1E3A');
standalone(divider, 1.4, 'doorstep-divider.svg', '#1B1E3A');

const count = MENU.reduce((a, s) => a + s.groups.reduce((b, g) => b + g.dishes.length, 0), 0);
console.log('patterns: wide loops %d, square loops %d, divider loops %d; dishes %d',
  wide.loops.length, square.loops.length, divider.loops.length, count);
