// Evaluation worker (Node worker_threads; also usable as a browser module Web Worker).
// Message in:  { id, spec, arch, genomes: Float32Array[], scenarios: [...] }
// Message out: { id, fitness: number[], carSeconds: number, ends: object }
import { runEpisode } from './episode.js';

function handle(msg) {
  const { id, spec, arch, genomes, scenarios } = msg;
  const fitness = []; let carSeconds = 0; const ends = {};
  for (const g of genomes) {
    let f = 0;
    for (const scenario of scenarios) {
      const r = runEpisode({ spec, arch, weights: g, scenario });
      f += r.fitness; carSeconds += r.carSeconds; ends[r.end] = (ends[r.end] || 0) + 1;
    }
    fitness.push(f / scenarios.length);
  }
  return { id, fitness, carSeconds, ends };
}

if (typeof self !== 'undefined' && typeof self.postMessage === 'function' && typeof process === 'undefined') {
  self.onmessage = (e) => self.postMessage(handle(e.data));
} else {
  const wt = await import(/* @vite-ignore */ 'node:' + 'worker_threads');
  if (wt.parentPort) wt.parentPort.on('message', (m) => wt.parentPort.postMessage(handle(m)));
}
