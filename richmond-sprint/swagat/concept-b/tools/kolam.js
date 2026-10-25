/*
 * Swagat, Concept B: dot-grid "doorstep" pattern generator.
 *
 * An original geometric method, not a copy of any traditional design.
 * A grid of dots is laid out; a single line travels diagonally between
 * the dots and either crosses straight through each gap between two
 * neighbouring dots, or turns at a "mirror" placed in that gap. The
 * outer edge (and the clearing left for the wordmark) always turns the
 * line back, so every line closes into a loop that wraps around dots
 * without touching them. Mirror placement comes from a seeded random
 * generator and is reflected left/right and top/bottom, so the result
 * is symmetric and repeatable for a given seed.
 *
 * Geometry: dot (i, j) sits at (2i+1, 2j+1) in a 2m by 2n box. The
 * line passes through "gap points" (x + y odd) and is drawn as straight
 * tangents plus quarter arcs of radius sqrt(2)/2 around dots or cell
 * corners, which gives the even, hand-drawn-looking curves.
 *
 * Usage (Node): const k = require('./kolam'); k.generate({...}); k.toSVG(...)
 */
(function (root) {
  'use strict';

  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var NONE = 0, WALL = 1, PASS = 2; // cross straight, perpendicular mirror, parallel mirror
  var R = Math.SQRT1_2;

  function generate(opts) {
    var m = opts.cols, n = opts.rows, hole = opts.hole || null;
    var rand = mulberry32(opts.seed);
    var w = opts.weights || { none: 0.5, wall: 0.3, pass: 0.2 };
    var W = 2 * m, H = 2 * n;

    function present(i, j) {
      if (i < 0 || j < 0 || i >= m || j >= n) return false;
      if (hole && i >= hole.c0 && i <= hole.c1 && j >= hole.r0 && j <= hole.r1) return false;
      return true;
    }
    function dotAt(x, y) { return present((x - 1) / 2, (y - 1) / 2); }
    // the two dots a gap point sits between
    function neighbours(x, y) {
      return (x % 2 === 0) ? [[x - 1, y], [x + 1, y]] : [[x, y - 1], [x, y + 1]];
    }
    var key = function (x, y) { return x + ',' + y; };
    var mirror = {};

    function orbit(x, y) {
      var pts = opts.symmetry === 'lr' ? [[x, y], [W - x, y]] : [[x, y], [W - x, y], [x, H - y], [W - x, H - y]];
      if (opts.symmetry === 'd4' && m === n) {
        pts = pts.concat(pts.map(function (p) { return [p[1], p[0]]; }));
      }
      return pts;
    }
    function pick() {
      var r = rand() * (w.none + w.wall + w.pass);
      if (r < w.none) return NONE;
      if (r < w.none + w.wall) return WALL;
      return PASS;
    }

    for (var y = 0; y <= H; y++) {
      for (var x = 0; x <= W; x++) {
        if ((x + y) % 2 === 0) continue;
        var k = key(x, y);
        if (k in mirror) continue;
        var nb = neighbours(x, y);
        var forced = !(dotAt(nb[0][0], nb[0][1]) && dotAt(nb[1][0], nb[1][1]));
        var t = forced ? WALL : pick();
        orbit(x, y).forEach(function (p) { mirror[key(p[0], p[1])] = t; });
      }
    }

    // a directed segment from gap point p to p + d is valid when the dot it wraps exists
    function hugged(x, y, dx, dy) {
      return (x % 2 === 0) ? [x + dx, y] : [x, y + dy];
    }
    function valid(x, y, dx, dy) {
      var h = hugged(x, y, dx, dy);
      return dotAt(h[0], h[1]);
    }
    function reflect(x, y, dx, dy) {
      var t = mirror[key(x, y)];
      if (t === NONE) return [dx, dy];
      var horizGap = (x % 2 === 0);
      // WALL at a horizontal gap is a vertical mirror (flip dx); PASS flips dy. Opposite for vertical gaps.
      var flipX = (t === WALL) === horizGap;
      return flipX ? [-dx, dy] : [dx, -dy];
    }

    var seen = {};
    var skey = function (x, y, dx, dy) { return x + ',' + y + ',' + dx + ',' + dy; };
    var loops = [];
    var dirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

    function trace(x0, y0, dx0, dy0) {
      // returns the loop as an array of steps {x,y,din,dout} at each gap point visited
      var steps = [];
      var x = x0, y = y0, dx = dx0, dy = dy0;
      var guard = 0;
      do {
        seen[skey(x, y, dx, dy)] = true;
        var nx = x + dx, ny = y + dy;
        seen[skey(nx, ny, -dx, -dy)] = true;
        var out = reflect(nx, ny, dx, dy);
        steps.push({ x: nx, y: ny, din: [dx, dy], dout: out });
        x = nx; y = ny; dx = out[0]; dy = out[1];
        if (++guard > 100000) throw new Error('trace overflow');
      } while (!(x === x0 && y === y0 && dx === dx0 && dy === dy0));
      return steps;
    }

    // Preferred start: arrive at the top-centre boundary point, so the arc over the
    // top-centre dot is where drawing begins (needs odd column count).
    var starts = [];
    if (m % 2 === 1) starts.push([m - 1, 1, 1, -1]);
    for (var yy = 0; yy <= H; yy++) for (var xx = 0; xx <= W; xx++) {
      if ((xx + yy) % 2 === 0) continue;
      dirs.forEach(function (d) { starts.push([xx, yy, d[0], d[1]]); });
    }
    starts.forEach(function (s) {
      var x = s[0], y = s[1], dx = s[2], dy = s[3];
      var nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx > W || ny > H) return;
      if (!valid(x, y, dx, dy)) return;
      if (seen[skey(x, y, dx, dy)]) return;
      loops.push(trace(x, y, dx, dy));
    });

    // Rotate each loop so it starts on the vertical axis at the topmost turn, and
    // record whether it is its own mirror image (then two pens can draw it symmetrically).
    loops = loops.map(function (steps) {
      var best = -1;
      steps.forEach(function (st, i) {
        var turns = st.din[0] !== st.dout[0] || st.din[1] !== st.dout[1];
        // prefer the axis turn nearest the outer edge (top for the upper loop, bottom for the lower)
        var edge = function (yy) { return Math.min(yy, H - yy) * 2 + (yy > H / 2 ? 1 : 0); };
        if (st.x === m && turns && (best < 0 || edge(st.y) < edge(steps[best].y))) best = i;
      });
      var set = {};
      steps.forEach(function (st) { set[st.x + ',' + st.y] = 1; });
      var sym = steps.every(function (st) { return set[(W - st.x) + ',' + st.y]; });
      var out = best < 0 ? steps : steps.slice(best).concat(steps.slice(0, best));
      out.sym = sym && best >= 0;
      return out;
    });

    var dots = [];
    for (var j = 0; j < n; j++) for (var i = 0; i < m; i++) if (present(i, j)) dots.push([2 * i + 1, 2 * j + 1]);

    return { m: m, n: n, W: W, H: H, hole: hole, loops: loops, dots: dots, seed: opts.seed, mirror: mirror };
  }

  function fmt(v) { return (Math.round(v * 1000) / 1000).toString(); }

  // Path for one loop. The first step's arc is split at its midpoint so a closed loop
  // starting at the top-centre begins exactly on the axis of symmetry.
  function loopPath(steps, s) {
    var d = [];
    var first = steps[steps.length - 1]; // the step that arrives back at the start segment's origin
    // start at the midpoint of the arc at the first turning step, if step 0 turns
    var st = steps[0];
    var turns0 = st.din[0] !== st.dout[0] || st.din[1] !== st.dout[1];
    var px, py;
    function P(x, y) { return fmt(x * s) + ' ' + fmt(y * s); }
    function arcMid(step) {
      var cx = step.x - (step.din[0] - step.dout[0]) / 2;
      var cy = step.y - (step.din[1] - step.dout[1]) / 2;
      var vx = step.x - cx, vy = step.y - cy, len = Math.hypot(vx, vy);
      return [cx + vx / len * R, cy + vy / len * R];
    }
    function sweep(step) {
      var c = step.din[0] * step.dout[1] - step.din[1] * step.dout[0];
      return c > 0 ? 1 : 0;
    }
    var order = steps.slice(1).concat([steps[0]]);
    if (turns0) {
      var mid = arcMid(st);
      d.push('M' + P(mid[0], mid[1]));
      d.push('A' + fmt(R * s) + ' ' + fmt(R * s) + ' 0 0 ' + sweep(st) + ' ' + P(st.x + st.dout[0] / 2, st.y + st.dout[1] / 2));
    } else {
      d.push('M' + P(st.x + st.dout[0] / 2, st.y + st.dout[1] / 2));
    }
    px = st.x + st.dout[0] / 2; py = st.y + st.dout[1] / 2;
    for (var k = 0; k < order.length; k++) {
      var step = order[k];
      var isLast = k === order.length - 1;
      var turns = step.din[0] !== step.dout[0] || step.din[1] !== step.dout[1];
      if (!turns && !isLast) continue;
      var tx = step.x - step.din[0] / 2, ty = step.y - step.din[1] / 2;
      if (tx !== px || ty !== py) d.push('L' + P(tx, ty));
      if (isLast) {
        if (turns0) {
          var mid2 = arcMid(st);
          d.push('A' + fmt(R * s) + ' ' + fmt(R * s) + ' 0 0 ' + sweep(st) + ' ' + P(mid2[0], mid2[1]));
        } else {
          d.push('L' + P(st.x + st.dout[0] / 2, st.y + st.dout[1] / 2));
        }
        d.push('Z');
        break;
      }
      var ex = step.x + step.dout[0] / 2, ey = step.y + step.dout[1] / 2;
      d.push('A' + fmt(R * s) + ' ' + fmt(R * s) + ' 0 0 ' + sweep(step) + ' ' + P(ex, ey));
      px = ex; py = ey;
    }
    void first;
    return d.join('');
  }

  /*
   * Render as SVG markup. opts: { scale, cls, id, title, dotR, asSymbol, extraAttrs }
   */
  function toSVG(k, opts) {
    var s = opts.scale || 10;
    var vb = '0 0 ' + fmt(k.W * s) + ' ' + fmt(k.H * s);
    var paths = k.loops.map(function (l, i) {
      return '<path class="k-line" data-loop="' + i + '"' + (l.sym ? ' data-sym="1"' : '') + ' d="' + loopPath(l, s) + '"/>';
    }).join('');
    var dotR = (opts.dotR || 0.11) * s;
    var dots = k.dots.map(function (p) {
      return '<circle class="k-dot" cx="' + fmt(p[0] * s) + '" cy="' + fmt(p[1] * s) + '" r="' + fmt(dotR) + '"/>';
    }).join('');
    // Styling comes through inherited custom properties so it also works inside <use> clones.
    var inner = '<g class="k-dots" style="fill:var(--k-dot,currentColor)">' + dots + '</g>' +
      '<g class="k-lines" style="fill:none;stroke:var(--k-line,currentColor);stroke-width:var(--k-w,1px);' +
      'stroke-linecap:round;stroke-linejoin:round;filter:var(--k-filter,none)">' + paths + '</g>';
    if (opts.asSymbol) {
      return '<symbol id="' + opts.id + '" viewBox="' + vb + '">' + inner + '</symbol>';
    }
    var attrs = opts.extraAttrs || '';
    return '<svg class="' + (opts.cls || 'kolam') + '" viewBox="' + vb + '" ' + attrs + ' focusable="false" aria-hidden="true">' + inner + '</svg>';
  }

  var api = { generate: generate, toSVG: toSVG, loopPath: loopPath, mulberry32: mulberry32 };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Kolam = api;
})(this);
