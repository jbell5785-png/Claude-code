// Training harness: learner ↔ parallel episode evaluation under a car-seconds compute budget.
//
// Each generation draws `episodes` scenarios (track + start position) from a seeded curriculum and
// evaluates EVERY genome on the same scenarios (common random numbers → fair ranking). Fitness of a
// genome = mean episode fitness (episode.js). Training stops when the simulated car-seconds used
// (summed over all cars and episodes, including early-terminated ones) reach the budget — the same
// budget for every team.

import { createRng, mixSeed } from './rng.js';
import { createLearner } from './learners/index.js';
import { archParamCount, makeBrain, createPolicyNet } from './neural.js';
import { runEpisode } from './episode.js';

/** Default curriculum: preset training tracks + seeded random tracks, harder as the budget is used. */
export const TRAIN_TRACKS = ['club', 'gp', 'mountain', 'speedway'];
export function curriculumScenario(rng, frac, duration) {
  let track;
  const r = rng.next();
  if (r < 0.4) track = TRAIN_TRACKS[rng.int(TRAIN_TRACKS.length)];
  else {
    // training random seeds 1000..1099 (tournament seeds are drawn from a secret seed at race time)
    track = { type: 'random', seed: 1000 + rng.int(100), difficulty: Math.min(1, 0.2 + 0.7 * frac * rng.next() + 0.1),
      obstacles: frac > 0.3 && rng.next() < 0.5 ? 1 + rng.int(2) : 0 };
  }
  return { track, startS: rng.next() * 5000, duration };
}

/**
 * Default initial genome, identical for every team: Xavier-scaled random weights (seeded) and a
 * +0.5 bias on the throttle output so that initial cars actually drive (otherwise nothing moves and
 * every genome scores 0 — no signal for the learner).
 */
export function defaultInit(arch, seed = 1) {
  const net = createPolicyNet(arch);
  const w = net.init(createRng(mixSeed(seed, 77)), 0.5);
  const [, bo] = net.layerOffsets[net.layerOffsets.length - 1];
  w[bo + 1] = 0.5; // throttle (pedal head) / throttle (split heads)
  return w.slice();
}

/** Node worker pool (worker_threads). Falls back to inline evaluation when threads <= 1. */
async function createPool(threads) {
  if (threads <= 1) return null;
  const { Worker } = await import(/* @vite-ignore */ 'node:' + 'worker_threads');
  const url = new URL('./worker.js', import.meta.url);
  const workers = Array.from({ length: threads }, () => new Worker(url));
  let next = 0; const pending = new Map();
  for (const w of workers) w.on('message', (m) => { const r = pending.get(m.id); pending.delete(m.id); r(m); });
  return {
    run(job) { return new Promise((res) => { const id = next++; pending.set(id, res); workers[id % workers.length].postMessage({ ...job, id }); }); },
    close() { for (const w of workers) w.terminate(); },
  };
}

/**
 * @param {object} cfg { spec, arch, learner: 'ga'|'es', hyper: {...}, popSize, budget (car-s), seed,
 *   threads, episodes (per generation), duration (s), onGeneration(info), learnerInstance? }
 * @returns {Promise<{ brain, history, carSeconds, wallSeconds }>}
 */
export async function train(cfg) {
  const dim = archParamCount(cfg.arch);
  const seed = cfg.seed ?? 1;
  const init = cfg.init || defaultInit(cfg.arch, seed);
  const learner = cfg.learnerInstance || createLearner(cfg.learner || 'es', { dim, popSize: cfg.popSize ?? 32, seed, init, ...(cfg.hyper || {}) });
  const threads = cfg.threads ?? 1, budget = cfg.budget ?? 20000, episodes = cfg.episodes ?? 3, duration = cfg.duration ?? 20;
  const pool = await createPool(threads);
  const history = []; let used = 0; let gen = 0;
  const t0 = Date.now();
  try {
    while (used < budget) {
      const rng = createRng(mixSeed(seed, gen));
      const scenarios = Array.from({ length: episodes }, () => curriculumScenario(rng, used / budget, duration));
      const genomes = learner.ask();
      let fitness, ends = {};
      if (pool) {
        const chunk = Math.ceil(genomes.length / threads);
        const jobs = [];
        for (let k = 0; k < genomes.length; k += chunk) jobs.push(pool.run({ spec: cfg.spec, arch: cfg.arch, genomes: genomes.slice(k, k + chunk), scenarios }));
        const res = await Promise.all(jobs);
        fitness = res.flatMap((r) => r.fitness);
        for (const r of res) { used += r.carSeconds; for (const [k, n] of Object.entries(r.ends)) ends[k] = (ends[k] || 0) + n; }
      } else {
        fitness = genomes.map((g) => {
          let f = 0;
          for (const scenario of scenarios) { const r = runEpisode({ spec: cfg.spec, arch: cfg.arch, weights: g, scenario }); f += r.fitness; used += r.carSeconds; ends[r.end] = (ends[r.end] || 0) + 1; }
          return f / scenarios.length;
        });
      }
      learner.tell(fitness);
      const sorted = [...fitness].sort((a, b) => b - a);
      const info = { gen, carSeconds: Math.round(used), wall: (Date.now() - t0) / 1000, best: sorted[0], median: sorted[sorted.length >> 1],
        mean: fitness.reduce((a, b) => a + b, 0) / fitness.length, ends, state: learner.state() };
      history.push({ gen, carSeconds: info.carSeconds, best: info.best, median: info.median, mean: info.mean });
      cfg.onGeneration?.(info);
      gen++;
    }
  } finally { pool?.close(); }
  // Final pick: re-evaluate the best-ever genome and (ES) the mean on a fixed validation set; keep the better.
  const candidates = [learner.best().genome];
  if (learner.mean) candidates.push(learner.mean());
  const vr = createRng(mixSeed(seed, 999999));
  const val = Array.from({ length: 6 }, () => curriculumScenario(vr, 0.6, duration));
  let bestW = candidates[0], bestV = -Infinity;
  for (const g of candidates) {
    const f = val.reduce((a, scenario) => a + runEpisode({ spec: cfg.spec, arch: cfg.arch, weights: g, scenario }).fitness, 0) / val.length;
    if (f > bestV) { bestV = f; bestW = g; }
  }
  const wallSeconds = (Date.now() - t0) / 1000;
  const brain = makeBrain(cfg.arch, bestW, { name: cfg.name || 'brain', learner: learner.state(), budgetCarSeconds: budget,
    carSecondsUsed: Math.round(used), validationFitness: bestV, generations: gen, seed, car: cfg.spec?.name });
  return { brain, history, carSeconds: used, wallSeconds };
}
