#!/usr/bin/env node
// Train a team's neural driver with the standard compute budget (simulated car-seconds).
//   node scripts/train.js --team teams/claude              (uses team.json; writes teams/claude/brain.json)
//   node scripts/train.js --preset hotHatch --budget 20000  (preset car, default arch/learner)
// Options: --budget N (car-seconds), --threads N (default: CPU count), --seed N, --learner es|ga,
//          --pop N, --episodes N, --duration S, --out path.json
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { availableParallelism } from 'node:os';
import path from 'node:path';
import { train } from '../src/ai/trainer.js';
import { PRESETS } from '../src/sim/presets.js';
import { build } from '../src/sim/build.js';
import { archParamCount } from '../src/ai/neural.js';

export const BUDGET_CAP_GBP = 60000;
export const STANDARD_BUDGET_CAR_SECONDS = 200000;

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };

/** Load and validate a team directory. Throws with a readable message when invalid. */
export function loadTeam(dir) {
  const team = JSON.parse(readFileSync(path.join(dir, 'team.json'), 'utf8'));
  let spec = team.car;
  if (spec && spec.preset) spec = { ...PRESETS[spec.preset].spec, ...(spec.overrides || {}) };
  const params = build(spec);
  if (!params.valid) throw new Error(`${team.name}: invalid car: ${params.errors.join('; ')}`);
  if (params.price > BUDGET_CAP_GBP) throw new Error(`${team.name}: car costs £${params.price}, cap is £${BUDGET_CAP_GBP}`);
  return { team, spec, params };
}

async function main() {
  const teamDir = opt('team');
  let name, spec, arch, learner, hyper = {}, out;
  if (teamDir) {
    const t = loadTeam(teamDir);
    name = t.team.name; spec = t.spec; arch = t.team.driver.arch; learner = t.team.driver.learner; hyper = t.team.driver.hyper || {};
    out = path.join(teamDir, 'brain.json');
    console.log(`team ${name}: car £${t.params.price}, ${Math.round(t.params.summary.powerKW)} kW, ${Math.round(t.params.summary.mass)} kg`);
  } else {
    const key = opt('preset', 'hotHatch'); if (!PRESETS[key]) throw new Error(`unknown preset ${key}`);
    name = key; spec = PRESETS[key].spec; arch = { type: 'mlp', hidden: [24, 12], act: 'tanh', outAct: 'tanh', head: 'pedal' };
    learner = 'es'; out = path.join('public', 'brains', `${key}.json`);
  }
  learner = opt('learner', learner);
  out = opt('out', out);
  const budget = Number(opt('budget', STANDARD_BUDGET_CAR_SECONDS));
  const threads = Number(opt('threads', availableParallelism()));
  console.log(`arch ${JSON.stringify(arch)} → ${archParamCount(arch)} params · learner ${learner} · budget ${budget} car-s · ${threads} threads`);
  const res = await train({
    name, spec, arch, learner, hyper, budget, threads,
    seed: Number(opt('seed', 1)), popSize: Number(opt('pop', hyper.popSize ?? 32)),
    episodes: Number(opt('episodes', 3)), duration: Number(opt('duration', 20)),
    onGeneration: (g) => console.log(`gen ${String(g.gen).padStart(3)}  car-s ${String(g.carSeconds).padStart(7)}  wall ${g.wall.toFixed(0).padStart(4)}s  best ${g.best.toFixed(0).padStart(5)}  median ${g.median.toFixed(0).padStart(5)}  ${JSON.stringify(g.ends)}`),
  });
  const thr = res.carSeconds / res.wallSeconds;
  console.log(`done: ${Math.round(res.carSeconds)} car-s in ${res.wallSeconds.toFixed(0)} s → ${thr.toFixed(0)} car-s/s (${(thr / threads).toFixed(0)} per thread); validation fitness ${res.brain.meta.validationFitness.toFixed(0)}`);
  res.brain.meta.history = res.history;
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(res.brain));
  console.log('wrote', out);
  if (teamDir && existsSync('public')) { const pb = path.join('public', 'brains', `${path.basename(teamDir)}.json`); mkdirSync(path.dirname(pb), { recursive: true }); writeFileSync(pb, JSON.stringify(res.brain)); console.log('wrote', pb); }
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => { console.error(e); process.exit(1); });
