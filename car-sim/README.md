# NOVA VADERSPEED

A physics-based 3D car builder and racing game in the browser, with neural-network drivers that
learn to drive. Inspired by commonLuke's "Can I Make a Better AI Than AI?" and remastered
2000s racers (NFS Underground, WipEout Fusion, Rollcage, Buck Bumble).

## Play

- **Single file (offline):** `npm run build:single` → open `dist-single/index.html` in Chrome or Edge.
- **Dev server:** `npm install && npm run dev` → http://localhost:5173
- **Web link:** merge into `main`; in GitHub → Settings → Pages → Source: *GitHub Actions*
  (workflow: `.github/workflows/pages.yml`).
- URL flags: `?nofx` (disable night/post-FX), `?fx` (force FX), `?sim=mock` (dev mock).
- Controls: WASD/arrows, Shift = nitrous, Space = handbrake, C = camera, T = telemetry, R = reset,
  M = manual/auto gearbox. Gamepad and touch supported.

## Tests (all pass)

| Command | What it checks |
|---|---|
| `node scripts/test-engine.js` | Engine curves vs 8 real engines (all within 10%), turbo lag, knock, nitrous, failure |
| `node scripts/test-build.js` | Every preset builds; mass properties, warnings |
| `node scripts/test-tyre.js` | Magic Formula curves, slope standstill, thermal, wear, perf |
| `node scripts/test-vehicle.js --quick` | Presets vs real 0-100 / ¼ mile / top speed / braking / skidpad (±10%), stability, perf |
| `node scripts/test-track.js` | Track geometry, queries, raycasts, lap timer (12.5k checks) |
| `node scripts/test-collision.js` | Car-car, walls, obstacles, 8-car pack |
| `node scripts/test-driver.js` | Racing-line AI closed-loop laps (informational; see known issues) |
| `node scripts/screenshot.js [menu garage drive race]` | Headless screenshots → `docs/screenshots/` (`SHOT_QUERY=fx` to add URL flags) |
| `node scripts/render-music.js` | Renders music styles to WAV + mix stats |

## Layout

See **`ARCHITECTURE.md`** — the binding module contracts (§1 spec, §2 params, §3 engine, §4 tyre,
§5 vehicle, §6 track, §7 AI drivers/race mode, §8 portability) and `docs/contract-notes/*.md`
for each module's documented deviations.

- `src/sim/` — physics: `catalog.js` (all parts), `build.js` (spec → params), `engine.js`,
  `tyre.js`, `vehicle.js` + `drivetrain.js` (6-DOF body, PGS drivetrain solver), `track.js` +
  `tracks/`, `laptimer.js`, `collision.js`, `presets.js` (10 cars with real-world targets).
- `src/ai/` — `racingline.js` (min-curvature line + speed profile), `pursuit.js` (racing-line
  driver used by Race mode), `driver.js` (registry), `sensors.js` (obs spec v1, 79 floats),
  `nn.js`, learners (GA, OpenAI-ES), `trainer.js`/`worker.js`, `neural.js`.
- `src/ui/` — front end (menus, garage, drive, race, HUD, telemetry, audio, input, quality tiers),
  `render/` (world, car models incl. `gltfCars.js` with CC0 Kenney models in `src/assets/cars/`),
  `fx/` (post-processing, environments, materials; wired via `fx/install.js`), `music/`
  (procedural music engine; styles `hardcore` (race default), `acidBreaks` (menus), dnb, breaks, garage, acid).
- `teams/`, `COMPETITION.md` — AI competition brief and team templates (`teams/human` starter).
- `docs/LYRICS.md` — original MC lyrics + a style prompt for vocal AI tools (Suno/Udio);
  load results in-game via **My music**.

## AI training

`node scripts/train.js --team teams/claude --budget 2000000 --threads 16`
(~25 min on a Ryzen 7 5800X; physics is CPU-bound — a GPU does not help this setup).

## Status & known issues (where to pick up)

1. **Trained neural AI plateaus** (~fitness 350–400) and leaves unseen tracks within a few hundred
   metres; 10× more compute did not help → fix the setup, not the budget: reward shaping (progress
   + speed, smoother penalties), curriculum (easy → hard tracks), observation normalisation,
   larger network / CMA-ES, or imitation-learning warm start from the `pursuit` driver.
2. **Racing-line AI** (`src/ai/pursuit.js`): fast cars (supercar) overshoot some hairpins;
   the hot hatch laps cleanly-ish. Ideas: per-car grip calibration on a skidpad run, lower the
   speed profile where curvature changes fast, braking-zone anticipation. Use `scripts/test-driver.js`.
3. **Auto gearbox** (`vehicle.js`) only downshifts near lugging when braking → cars exit slow
   corners in too high a gear. A rev-matched braking-downshift rule was tried and reverted
   (made the driver worse at the time); revisit together with item 2.
4. **No damage model** (collision events exist in `world.events`; zones/effects not done).
5. **Kenney car models** don't show widebody/splitter/wing add-ons; cartoon proportions.
6. **Not built:** AI Lab training UI, tournament runner/report, NEAT, custom `learner.js`
   loading, golden-master optimisation pass.
7. Night FX enabled for medium+; check medium-tier performance on weak GPUs.

### Prompt to continue in a new session

> Continue NOVA VADERSPEED in `car-sim/`. Read `car-sim/README.md` (status & known issues) and
> `car-sim/ARCHITECTURE.md` (module contracts) first. Run the tests listed in the README to confirm
> everything passes, then work on known issue #N. Commit to the branch and push.
