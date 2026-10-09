// Neural driver: observation v1 (sensors.js) → network (nn.js) → action spec v1.
//
// Action spec v1 (COMPETITION.md §5): steer -1..1 (+left), throttle 0..1, brake 0..1, nitrous bool;
// auto gearbox. Network output heads:
//   'pedal' (2 outputs, tanh): [steer, pedal]  pedal > 0 → throttle = pedal, pedal < 0 → brake = −pedal
//   'split' (3 outputs, tanh): [steer, throttle, brake]  throttle/brake = (y + 1) / 2
//   'split+nitrous' (4): as 'split' plus nitrous = y3 > 0
//
// Brain JSON: { format: 'nova-brain', version: 1, obsVersion: 1, name, arch, weights (base64 f32), meta }
//   arch = { type: 'mlp', hidden: [32, 16], act: 'tanh', outAct: 'tanh', head: 'pedal', inputs?: [indices] }

import { createSensors, OBS_SIZE, OBS_VERSION } from './sensors.js';
import { createMLP, f32ToBase64, base64ToF32 } from './nn.js';

export const HEAD_OUTPUTS = { pedal: 2, split: 3, 'split+nitrous': 4 };

/** Build the network for an arch (weights zero until set). */
export function createPolicyNet(arch) {
  const nIn = arch.inputs ? arch.inputs.length : OBS_SIZE;
  const nOut = HEAD_OUTPUTS[arch.head || 'pedal'];
  if (!nOut) throw new Error(`Unknown action head '${arch.head}'`);
  return createMLP({ sizes: [nIn, ...(arch.hidden || [32, 16]), nOut], act: arch.act || 'tanh', outAct: arch.outAct || 'tanh' });
}

/** Number of parameters (genome length) for an arch. */
export function archParamCount(arch) { return createPolicyNet(arch).nParams; }

/** Map raw network outputs to controls (action spec v1). */
export function applyHead(head, y, out) {
  out.steer = Math.max(-1, Math.min(1, y[0] || 0));
  if (head === 'pedal') {
    const p = y[1] || 0;
    out.throttle = p > 0 ? Math.min(1, p) : 0; out.brake = p < 0 ? Math.min(1, -p) : 0;
  } else {
    out.throttle = Math.max(0, Math.min(1, 0.5 * ((y[1] || 0) + 1)));
    out.brake = Math.max(0, Math.min(1, 0.5 * ((y[2] || 0) + 1)));
    if (out.brake < 0.05) out.brake = 0;
  }
  out.nitrous = head === 'split+nitrous' ? (y[3] || 0) > 0 : false;
  out.handbrake = 0; out.shiftUp = false; out.shiftDown = false; out.gearMode = 'auto';
  return out;
}

/**
 * Neural driver (driver interface §7).
 * @param {{ brain?: object, arch?: object, weights?: Float32Array }} opts
 */
export function createNeuralDriver(opts = {}) {
  const brain = opts.brain || null;
  const arch = opts.arch || brain?.arch;
  if (!arch) throw new Error('neural driver: needs { brain } or { arch, weights }');
  if (brain && brain.obsVersion !== OBS_VERSION) console.warn(`[neural] brain trained on obs v${brain.obsVersion}, running v${OBS_VERSION}`);
  const net = createPolicyNet(arch);
  net.setWeights(opts.weights || (typeof brain.weights === 'string' ? base64ToF32(brain.weights) : Float32Array.from(brain.weights)));
  const sensors = createSensors();
  const sel = arch.inputs ? Int32Array.from(arch.inputs) : null;
  const xin = sel ? new Float32Array(sel.length) : null;
  const head = arch.head || 'pedal';
  let lastObs = null;
  return {
    kind: 'neural', brain, net, sensors,
    get lastObs() { return lastObs; },
    reset() {},
    act(v, track, world, out) {
      const obs = sensors.observe(v, track, world);
      lastObs = obs;
      let x = obs;
      if (sel) { for (let k = 0; k < sel.length; k++) xin[k] = obs[sel[k]]; x = xin; }
      return applyHead(head, net.forward(x), out);
    },
  };
}

/** Package weights as a brain JSON object. */
export function makeBrain(arch, weights, meta = {}) {
  return { format: 'nova-brain', version: 1, obsVersion: OBS_VERSION, name: meta.name || 'brain', arch, weights: f32ToBase64(Float32Array.from(weights)), meta };
}
