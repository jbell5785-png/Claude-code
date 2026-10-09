// Learner registry. Every learner implements:
//   ask()            -> Float32Array[]  genomes (flat MLP weight vectors) to evaluate this generation
//   tell(fitnesses)  -> void            one fitness per genome, same order (higher = better)
//   best()           -> { genome, fitness }  best genome seen so far
//   state()          -> plain JSON object (for logs/checkpoints)
import { createGA } from './ga.js';
import { createES } from './es.js';

export const LEARNERS = { ga: createGA, es: createES };

/** @param {string} kind 'ga' | 'es'  @param {object} opts { dim, popSize, seed, init, ...hyperparameters } */
export function createLearner(kind, opts) {
  const f = LEARNERS[kind];
  if (!f) throw new Error(`Unknown learner '${kind}' (known: ${Object.keys(LEARNERS).join(', ')})`);
  return f(opts);
}
