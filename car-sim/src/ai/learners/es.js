// OpenAI-style evolution strategy (Salimans et al. 2017): a search distribution N(θ, σ²I),
// antithetic (mirrored) sampling θ ± σε, centred-rank fitness shaping, gradient estimate
// g = Σ u_k ε_k / (nσ), Adam update with weight decay. The mean θ itself is evaluated as one
// extra member each generation (it usually generalises best), so best() can return it.

import { createRng } from '../rng.js';

/**
 * @param {{ dim, popSize?: number (even), seed?, init?: Float32Array, sigma?: number, lr?: number,
 *           weightDecay?: number, initSigma?: number }} o
 */
export function createES(o) {
  const dim = o.dim, half = Math.max(1, Math.floor((o.popSize ?? 64) / 2)), rng = createRng(o.seed ?? 1);
  const sigma = o.sigma ?? 0.08, lr = o.lr ?? 0.03, wd = o.weightDecay ?? 0.002;
  const theta = new Float32Array(dim);
  for (let i = 0; i < dim; i++) theta[i] = o.init ? o.init[i] : rng.normal() * (o.initSigma ?? 0.1);
  const m = new Float32Array(dim), v = new Float32Array(dim);
  let eps = [], pop = [], gen = 0, bestG = theta.slice(), bestF = -Infinity, lastMeanF = -Infinity;
  return {
    name: 'es',
    ask() {
      eps = []; pop = [];
      for (let k = 0; k < half; k++) {
        const e = new Float32Array(dim);
        for (let i = 0; i < dim; i++) e[i] = rng.normal();
        eps.push(e);
        const a = new Float32Array(dim), b = new Float32Array(dim);
        for (let i = 0; i < dim; i++) { a[i] = theta[i] + sigma * e[i]; b[i] = theta[i] - sigma * e[i]; }
        pop.push(a, b);
      }
      pop.push(theta.slice()); // last member = the current mean
      return pop;
    },
    tell(fit) {
      const n = 2 * half;
      lastMeanF = fit[n];
      for (let k = 0; k <= n; k++) if (fit[k] > bestF) { bestF = fit[k]; bestG = pop[k].slice(); }
      // centred ranks in [-0.5, 0.5]
      const idx = Array.from({ length: n }, (_, i) => i).sort((a, b) => fit[a] - fit[b]);
      const u = new Float32Array(n);
      idx.forEach((i, r) => { u[i] = r / (n - 1) - 0.5; });
      const g = new Float32Array(dim);
      for (let k = 0; k < half; k++) {
        const w = u[2 * k] - u[2 * k + 1], e = eps[k];
        for (let i = 0; i < dim; i++) g[i] += w * e[i];
      }
      gen++;
      const b1 = 0.9, b2 = 0.999, c1 = 1 - b1 ** gen, c2 = 1 - b2 ** gen;
      for (let i = 0; i < dim; i++) {
        const gi = g[i] / (n * sigma) - wd * theta[i]; // ascent direction
        m[i] = b1 * m[i] + (1 - b1) * gi; v[i] = b2 * v[i] + (1 - b2) * gi * gi;
        theta[i] += lr * (m[i] / c1) / (Math.sqrt(v[i] / c2) + 1e-8);
      }
    },
    best() { return { genome: bestG, fitness: bestF }; },
    mean() { return theta.slice(); },
    state() { return { name: 'es', gen, bestFitness: bestF, meanFitness: lastMeanF, popSize: 2 * half + 1, sigma, lr }; },
  };
}
