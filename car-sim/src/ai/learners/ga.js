// Genetic algorithm baseline in the style of commonLuke's video: evaluate a population, keep the
// best as a breeding pool, make children by uniform crossover of two pool parents plus small
// Gaussian mutation; the top few survive unchanged (elitism).
//
// Learner interface: { ask() -> Float32Array[], tell(fitnesses), best() -> { genome, fitness }, state() }

import { createRng } from '../rng.js';

/**
 * @param {{ dim: number, popSize?: number, seed?: number, init?: Float32Array, initSigma?: number,
 *           poolFrac?: number, elite?: number, mutRate?: number, mutSigma?: number }} o
 */
export function createGA(o) {
  const dim = o.dim, N = o.popSize ?? 100, rng = createRng(o.seed ?? 1);
  const poolN = Math.max(2, Math.round(N * (o.poolFrac ?? 0.1)));
  const elite = o.elite ?? 2, mutRate = o.mutRate ?? 0.1, mutSigma = o.mutSigma ?? 0.2;
  const initSigma = o.initSigma ?? 0.5;
  let pop = [];
  for (let k = 0; k < N; k++) {
    const g = new Float32Array(dim);
    for (let i = 0; i < dim; i++) g[i] = (o.init ? o.init[i] : 0) + (k === 0 && o.init ? 0 : rng.normal() * initSigma);
    pop.push(g);
  }
  let bestG = pop[0].slice(), bestF = -Infinity, gen = 0;
  return {
    name: 'ga',
    ask() { return pop; },
    tell(fit) {
      const idx = pop.map((_, i) => i).sort((a, b) => fit[b] - fit[a]);
      if (fit[idx[0]] > bestF) { bestF = fit[idx[0]]; bestG = pop[idx[0]].slice(); }
      const pool = idx.slice(0, poolN).map((i) => pop[i]);
      const next = [];
      for (let e = 0; e < Math.min(elite, N); e++) next.push(pool[e].slice());
      while (next.length < N) {
        const a = pool[rng.int(poolN)], b = pool[rng.int(poolN)], c = new Float32Array(dim);
        for (let i = 0; i < dim; i++) {
          c[i] = rng.next() < 0.5 ? a[i] : b[i];
          if (rng.next() < mutRate) c[i] += rng.normal() * mutSigma;
        }
        next.push(c);
      }
      pop = next; gen++;
    },
    best() { return { genome: bestG, fitness: bestF }; },
    state() { return { name: 'ga', gen, bestFitness: bestF, popSize: N, poolN, mutRate, mutSigma }; },
  };
}
