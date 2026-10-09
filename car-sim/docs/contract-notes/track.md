# Track module — contract notes (owner D)

Files: `src/sim/track.js`, `src/sim/laptimer.js`, `src/sim/tracks/{util,geometry,raycast,gp,club,speedway,mountain,testtracks,gauntlet,random}.js`,
`scripts/test-track.js` (`node scripts/test-track.js [--quick]`).

Everything in ARCHITECTURE.md §6 and §6b is implemented with the names given there. This file
lists conventions the contract leaves open, and extra fields. Nothing in the contract was changed.

## Conventions (please read)

- **Bank sign**: `samples.bank` / `pointAt().bank` are in radians. `bank > 0` lowers the **left** edge,
  i.e. the road is banked for a **left-hand** turn, so a correctly banked corner has
  `bank * curvature > 0`. Road surface: `z(s, offset) = zc(s) - offset * tan(bank)` (offset +left).
  Track defs give bank in **degrees** with the same sign.
- **Curvature**: signed horizontal curvature, `> 0` = turning left (1/m).
- **Widths** (`widthL`, `widthR`, `track.width`) are horizontal half-widths / mean full width. On a 22° bank
  the sloped surface is ~8% wider than the horizontal width.
- **`s = 0` is the start/finish line**; the track runs towards increasing `s`. `out.s` is in `[0, length)`.
- **`query().index`** is the centreline *segment* index (sample `i` → `i+1`); pass it back as the hint.
  A NaN input returns flat grass with `index = -1`.
- **Far from the track** (outside every segment's asphalt/run-off/blend footprint, rasterised into the
  spatial hash): the result is terrain-only (exact height/normal, `GRASS`); `s`/`index` come from the hint
  walk or a per-cell nearest sample and `offset` is the signed distance to that centreline point —
  approximate but continuous enough for AI/lap timing. Cost ~0.1–0.3 µs regardless of distance.
- **`startPose(slot)`** returns `{ x, y, heading, z, s, offset }` (z/s/offset are extras). Slot 0 is 6 m
  behind the line; each slot is 8 m further back, alternating left/right of the centreline.
- Lap timer: `lap` = number of completed laps; `lastLap`, `bestLap`, sector times are **`null`** until set.

## Ground model

Asphalt (banked plane) → kerb (1.1 m outside the asphalt edge where kerb intensity > 0.5: 2.5 cm base +
1.5 cm ridges, 1 m wavelength along `s`, C1 ramps) → run-off plane (grass/gravel) → C1 smoothstep blend
to a bicubic terrain grid. Kerbs: inside of corners with |κ| > 1/150, outside on exits. Gravel: outside of
corners with peak radius 22–300 m (surface id only, no geometry change).
`nx, ny, nz` is the exact gradient normal of that height function. Height is C0 everywhere and C1 except
small normal kinks at sample boundaries off the centreline (∝ offset·Δκ; ≲0.005 rad on asphalt, up to a few
degrees deep inside hairpin run-off). The terrain beyond the run-off never folds or overlaps: the blend
finishes before the medial axis between neighbouring parts of the track.

## Extra fields (not in the contract)

`track`:
- `key, label, def, marks` (named `[s0, s1]` ranges, e.g. `marks.chicane`, `marks.zigzag1`), `corners`,
  `stats { length, minRadius, elevationRange, zMin, zMax, maxBankDeg, maxGrade, minCrestRadius }`, `bounds`.
- `heightAt(x, y, hint=-1)`, `edgeDistance(x, y, hint=-1)` (signed distance outside the asphalt edge),
  `terrainHeight(x, y)`, `nearestIndex(x, y)`, `kerbWidth`, `surfaces` (= `SURFACE`).
- `terrain { x0, y0, cell, cols, rows, heights: Float32Array }` (far-field grid, for a ground mesh; use
  `heightAt` for vertices near the track).
- `edgeLines: [{ side: ±1, pts: Float32Array [x,y,...] }]` — asphalt+kerb boundary used by `RAY.EDGE`.
- `walls.segs` are closed loops (left then right); `scenery.barriers` carries the same polylines with z.
- `obstacles[i]` also has `z, s, offset, gapL, gapR, adjusted` (adjusted = moved to keep ≥ 5 m gap).
  Track defs: `obstacles: [{ s | f, offset, kind: 'cylinder', r, h } | { s | f, offset, kind: 'box', hx, hy, heading /*deg rel. to track*/, h }]`.

`samples` extras (Float32Array, per sample): `grade` (dz/ds), `vcurvature`, `kerbL/R` (0..1), `gravelL/R`,
`gravelEndL/R`, `runoffL/R`, `edgeL/R` (end of terrain blend, m outside the asphalt), `freeL/R`.

`scenery`: `{ trees: [{x,y,z,scale,rot,kind}], barriers: [{side, kind, height, closed, points: Float32Array [x,y,z...], fence}],
gantry: {x,y,z,heading,width,height}, grandstands: [{x,y,z,heading,length,side}], marshalPosts: [{x,y,z,heading}], obstacles, bounds }`.
Headings of stands/posts face the track.

Lap timer extras: `lapValid`, `lastLapValid`, `cuts`, `offTrack`, `started`, `checkpoint`, `checkpoints`,
`sectorTimes`, `lastSectors`, `bestSectors`, `maxProgress`, `s`, `offset`, `index`, `reset()`.
`createLapTimer(track, { checkpointSpacing = 150, offTrackLimit = 8 })`. It uses `v.trackState` when present
(else queries `v.pos`), `v.wheels[i].surface` (else queries `v.wheels[i].pos`), and `v.time` (else +DT per call).
Call `lt.reset()` after teleporting a car (otherwise the jump counts as a cut).

## Registry / generator

`TRACKS`: `gp, club, speedway, mountain, skidpad, drag, gauntlet, random`. `createTrack('random:42')`,
`createTrack({ type: 'random', seed, difficulty: 0..1, obstacles: n, elevation?: bool })`.
`TRACKS.random.build(seed)`. Random tracks: star-shaped radial harmonics + jitter, zigzag sequences scaled by
difficulty; guaranteed min radius ≥ 15 m and ≥ 14 m clearance between non-adjacent track edges (re-rolled
deterministically otherwise). `gauntlet` intentionally goes down to ~11.6 m radius.

## Proposals / open points

- Collisions with `walls` / `obstacles` are data only here (collision module, wave 2).
- Build time is 0.15–0.55 s per track (free-distance ray marching, terrain splat, scenery) — fine at load,
  but the AI trainer should cache tracks rather than rebuild per episode.
