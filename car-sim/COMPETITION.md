# NOVA VADERSPEED — AI Driving Competition (brief v1)

Paste this whole file into ChatGPT / Gemini / Claude (or give it to a human coder). It is the
complete, identical brief for every team.

## 1. The task

This repository is a realistic 3D car simulator in plain JavaScript (Node 22 / browser, ES modules,
**no npm ML libraries**: everything from scratch). There is a 500 Hz physics model with tyre
slip, weight transfer, engine/turbo/gearbox, kerbs, grass, walls and obstacles.

Build an AI team that **chooses a car** under a budget and **learns to drive it as fast as possible**.
Training happens on the training tracks. The final is held on **unseen tracks**: the `gauntlet`
(zigzags, 12 m hairpins, obstacles on the racing line) plus several random tracks generated from a
secret seed at tournament time, with obstacles and higher difficulty. **Generalisation wins.**

## 2. Rules

1. **Car**: any valid spec for `build(spec)` (`src/sim/build.js`, parts in `src/sim/catalog.js`,
   examples in `src/sim/presets.js`) with `params.valid === true` and `params.price ≤ £60,000`.
2. **Compute budget**: every team trains with the same budget of **200,000 simulated car-seconds**
   (`STANDARD_BUDGET_CAR_SECONDS` in `scripts/train.js`). One car driving for one simulated second
   costs 1 car-second, including early-terminated episodes. This unit is the same on any machine.
   On a 4-core laptop it is about 15–20 minutes of wall time (≈ 50 car-s/s per core).
3. **Same inputs, same outputs** for everyone (§4, §5). You may transform the observation inside
   your own model (select inputs, add features computed from the vector), but you may not read the
   simulator state directly.
4. No pre-training outside the budget. A submitted `brain.json` must be reproducible with
   `node scripts/train.js --team teams/<name>` and the standard budget.
5. Hand-coded drivers (team `human`) are allowed and use the same observation vector.

## 3. What to submit: `teams/<name>/`

```
teams/<name>/team.json     required
teams/<name>/learner.js    optional custom learning rule (§6)
teams/<name>/brain.json    produced by training (§7)
```

`team.json` (see `teams/_template/team.json`):

```json
{
  "name": "My Team",
  "model": "chatgpt",
  "notes": "why this car, why this learner",
  "car": { "preset": "hotHatch", "overrides": { "name": "My car", "color": "#3a7bd5" } },
  "driver": {
    "arch": { "type": "mlp", "hidden": [24, 12], "act": "tanh", "outAct": "tanh", "head": "pedal", "inputs": null },
    "learner": "es",
    "hyper": { "popSize": 32, "sigma": 0.08, "lr": 0.03 }
  }
}
```

`car` is either `{ "preset": key, "overrides": {...} }` (shallow override of top-level spec fields)
or a full spec object (§1 of ARCHITECTURE.md).

`arch`: `hidden` = hidden layer sizes; `act` = `tanh | relu | leaky | sigmoid | softsign | linear`
(one string or one per hidden layer); `outAct` (default `tanh`); `head` (§5); `inputs` = optional
array of observation indices to use (default: all 79).

## 4. Observation spec v1 (`src/ai/sensors.js`, `OBS_VERSION = 1`, 79 floats)

Computed at 50 Hz. Rays start at the car's centre of gravity, at 15 fixed angles relative to the
heading (degrees, + = left): `-100 -75 -55 -40 -28 -18 -9 0 9 18 28 40 55 75 100`.
Ray value = `sqrt(min(d, max) / max)`: 0 = touching, 1 = nothing within range.

| index | name | meaning / normalisation |
|---|---|---|
| 0–14 | edge rays | distance to the edge of asphalt + kerb, max 120 m |
| 15–29 | solid rays | distance to walls and obstacles, max 120 m |
| 30–44 | car rays | distance to other cars' bodies (ray vs oriented box), max 60 m |
| 45 | speed | forward speed / 60 m/s |
| 46 | vLat | lateral velocity (body frame, + left) / 5 m/s |
| 47 | yawRate | / 1.5 rad/s (+ = turning left) |
| 48, 49 | accLong, accLat | body accelerations / 10 m/s² |
| 50, 51 | usageF, usageR | mean tyre friction usage per axle (1 = at the limit, ≤ 2) |
| 52, 53 | slipAngleF, slipAngleR | mean slip angle / 0.15 rad |
| 54 | slipRatioDriven | mean driven-wheel slip ratio / 0.2 (±3) |
| 55 | rpmFrac | rpm / redline |
| 56 | gearFrac | gear / number of gears (EV: 1, reverse < 0) |
| 57, 58 | headingSin, headingCos | sin/cos of (car heading − track tangent); cos < 0 = wrong way |
| 59 | offsetNorm | lateral offset from the centreline / half width (+ left; ±1 = edge) |
| 60 | halfWidth | track half width / 10 m |
| 61 | steer | current road-wheel angle / max lock |
| 62 | onTrack | fraction of wheels on asphalt or kerb |
| 63–70 | curv5m … curv150m | centreline curvature 5, 10, 20, 35, 50, 75, 100, 150 m ahead × 20 (±2, + = left) |
| 71 | grade | road grade × 5 |
| 72 | nitrous | nitrous bottle remaining (0 = no kit) |
| 73–75 | ahead | nearest car ahead within 60 m: gap / 60 (1 = none), offset diff / 5, speed diff / 20 |
| 76–78 | behind | same for the nearest car behind |

## 5. Action spec v1

Your network's outputs go through a fixed **head**:

- `pedal` (2 outputs): `[steer, pedal]`; steer clamped to -1..1 (+ = left, fraction of max lock);
  pedal > 0 → throttle, pedal < 0 → brake.
- `split` (3 outputs): `[steer, throttle, brake]`, throttle/brake = (y + 1) / 2.
- `split+nitrous` (4 outputs): as `split`, nitrous on when y3 > 0 (needs a nitrous kit).

The gearbox is automatic. The driver acts at **50 Hz** (`DRIVER_HZ`) and the controls are held
between decisions (the physics runs at 500 Hz).

## 6. Learner interface (custom learning rules)

Built-in learners (`src/ai/learners/`): `ga` (Luke-style genetic algorithm: breeding pool, uniform
crossover, Gaussian mutation, elitism; hyper `popSize, poolFrac, elite, mutRate, mutSigma, initSigma`)
and `es` (OpenAI-ES: antithetic sampling, centred-rank fitness shaping, Adam; hyper
`popSize, sigma, lr, weightDecay`).

A custom learner implements:

```js
// learner.js (plain script, no imports): define a global createLearner(opts)
function createLearner({ dim, popSize, seed, init /* Float32Array: default initial genome */, ...hyper }) {
  return {
    ask() { /* return an array of Float32Array(dim) genomes (flat MLP weights) */ },
    tell(fitnesses) { /* one number per genome from the last ask(), higher = better */ },
    best() { return { genome, fitness }; },
    state() { return { /* JSON for logs */ }; },
  };
}
```

Genome layout: for each layer, weights `W (nOut × nIn, row-major)` then biases `b (nOut)`
(`src/ai/nn.js`). Use only plain JavaScript (Math, typed arrays): the tournament runs custom learners
in a sandboxed `node:vm` context with no filesystem/network and a time limit per call.
(Note for organisers: `node:vm` is not a hard security boundary — review submitted code before running it.)
Custom learner loading in `scripts/train.js` is planned; until then, register it in
`src/ai/learners/index.js` to use it.

## 7. Training (`scripts/train.js`, `src/ai/trainer.js`)

```
node scripts/train.js --team teams/<name>            # standard budget → teams/<name>/brain.json
node scripts/train.js --team teams/<name> --budget 20000 --threads 4   # quick test
```

Each generation draws 3 scenarios from a seeded curriculum (training tracks `club, gp, mountain,
speedway` and random tracks with seeds 1000–1099, getting harder as the budget is used, obstacles
after 30 %). Every genome drives the same scenarios: a 20 s episode from a standing start at a
random point on the track. The default initial genome is the same for every team (Xavier-scaled random weights
and a +0.5 throttle bias so cars move).

**Fitness** = metres of forward progress + 100 per completed lap; −30 and the episode ends when all
four wheels are off the track for > 0.5 s or when driving the wrong way; −100 and the episode ends on
hitting an obstacle; the episode ends without penalty when stuck (< 3 m in 3 s).
Evaluation runs in parallel (`worker_threads`). Same seed → same result.

## 8. The final

Held-out tracks (`gauntlet` plus random tracks from a secret seed, with obstacles), time trials from
a standing start, and multi-car races against the other teams and the built-in `pursuit` driver
once the collision module is active. Reported: lap times, completion rate, crashes, with confidence
intervals over tracks and repetitions.
