// Neural networks from scratch (no ML libraries): a fast multi-layer perceptron over one flat
// Float32Array of weights, and a feed-forward graph network for topology-evolving genomes (NEAT).
//
// MLP weight layout (the "genome" a learner evolves): for each layer l = 0..L-1 with
// nIn = sizes[l], nOut = sizes[l+1]:  W_l (nOut × nIn, row-major: W[o*nIn + i]) followed by b_l (nOut).
// forward(x): h_{l+1} = act_l(W_l h_l + b_l). No allocations per call.

export const ACTIVATIONS = {
  tanh: (x) => Math.tanh(x),
  relu: (x) => (x > 0 ? x : 0),
  leaky: (x) => (x > 0 ? x : 0.05 * x),
  sigmoid: (x) => 1 / (1 + Math.exp(-x)),
  softsign: (x) => x / (1 + Math.abs(x)),
  linear: (x) => x,
};
const ACT_ID = { tanh: 0, relu: 1, leaky: 2, sigmoid: 3, softsign: 4, linear: 5 };

/** Number of parameters of an MLP with these layer sizes. */
export function mlpParamCount(sizes) {
  let n = 0;
  for (let l = 0; l + 1 < sizes.length; l++) n += sizes[l + 1] * sizes[l] + sizes[l + 1];
  return n;
}

/**
 * @param {{ sizes: number[], act?: string|string[], outAct?: string }} cfg
 *   sizes = [inputs, hidden..., outputs]; act = hidden activation (or one per hidden layer);
 *   outAct = output activation (default 'tanh').
 */
export function createMLP(cfg) {
  const sizes = cfg.sizes.slice();
  if (sizes.length < 2) throw new Error('createMLP: need at least input and output sizes');
  const L = sizes.length - 1;
  const acts = [];
  for (let l = 0; l < L; l++) {
    const a = l === L - 1 ? (cfg.outAct || 'tanh') : (Array.isArray(cfg.act) ? cfg.act[l] : (cfg.act || 'tanh'));
    if (!(a in ACT_ID)) throw new Error(`createMLP: unknown activation '${a}'`);
    acts.push(ACT_ID[a]);
  }
  const nParams = mlpParamCount(sizes);
  let w = new Float32Array(nParams);
  const bufs = sizes.map((n) => new Float32Array(n));
  const offs = []; // [wOff, bOff] per layer
  { let o = 0; for (let l = 0; l < L; l++) { offs.push([o, o + sizes[l + 1] * sizes[l]]); o += sizes[l + 1] * sizes[l] + sizes[l + 1]; } }

  function forward(x) {
    const inp = bufs[0];
    const n0 = sizes[0];
    for (let i = 0; i < n0; i++) { const v = x[i]; inp[i] = v === v ? v : 0; } // NaN-safe input copy
    for (let l = 0; l < L; l++) {
      const nIn = sizes[l], nOut = sizes[l + 1], a = bufs[l], b = bufs[l + 1];
      const [wo, bo] = offs[l]; const act = acts[l];
      for (let o = 0; o < nOut; o++) {
        let s = w[bo + o]; const row = wo + o * nIn;
        for (let i = 0; i < nIn; i++) s += w[row + i] * a[i];
        switch (act) {
          case 0: s = Math.tanh(s); break;
          case 1: s = s > 0 ? s : 0; break;
          case 2: s = s > 0 ? s : 0.05 * s; break;
          case 3: s = 1 / (1 + Math.exp(-s)); break;
          case 4: s = s / (1 + Math.abs(s)); break;
          default: break;
        }
        b[o] = s;
      }
    }
    return bufs[L];
  }

  /** Fill with a scaled random init (Xavier/He-like per layer). */
  function init(rng, gain = 1) {
    for (let l = 0; l < L; l++) {
      const nIn = sizes[l], nOut = sizes[l + 1]; const [wo, bo] = offs[l];
      const sd = gain * (acts[l] === 1 || acts[l] === 2 ? Math.sqrt(2 / nIn) : Math.sqrt(1 / nIn));
      for (let k = 0; k < nOut * nIn; k++) w[wo + k] = rng.normal() * sd;
      for (let k = 0; k < nOut; k++) w[bo + k] = 0;
    }
    return w;
  }

  return {
    type: 'mlp', sizes, nParams, nIn: sizes[0], nOut: sizes[L],
    get weights() { return w; },
    /** Use `arr` as the weight vector (no copy unless the length differs). */
    setWeights(arr) {
      if (arr.length !== nParams) throw new Error(`MLP expects ${nParams} weights, got ${arr.length}`);
      w = arr instanceof Float32Array ? arr : Float32Array.from(arr);
    },
    forward, init,
    layerOffsets: offs,
  };
}

// ------------------------------------------------------------------------------------------
// Graph network (NEAT phenotype): nodes with ids, feed-forward connections (no recurrence).
// genome = { nIn, nOut, nodes: [{ id, kind: 'in'|'bias'|'hidden'|'out', act }], conns: [{ in, out, w, on }] }
// Inputs are node ids 0..nIn-1, bias = nIn, outputs = nIn+1 .. nIn+nOut.
// ------------------------------------------------------------------------------------------

/** Compile a feed-forward graph genome into an evaluator with the same interface as an MLP. */
export function createGraphNet(genome) {
  const { nIn, nOut } = genome;
  const ids = genome.nodes.map((n) => n.id);
  const index = new Map(ids.map((id, i) => [id, i]));
  const N = ids.length;
  const act = new Uint8Array(N);
  genome.nodes.forEach((n, i) => { act[i] = ACT_ID[n.act || (n.kind === 'out' ? 'tanh' : 'tanh')] ?? 0; });
  const conns = genome.conns.filter((c) => c.on !== false && index.has(c.in) && index.has(c.out));
  // topological order (Kahn) over enabled connections; nodes in cycles (should not exist) are dropped
  const indeg = new Int32Array(N); const outs = Array.from({ length: N }, () => []);
  for (const c of conns) { indeg[index.get(c.out)]++; outs[index.get(c.in)].push(c); }
  const order = []; const q = [];
  for (let i = 0; i < N; i++) if (indeg[i] === 0) q.push(i);
  while (q.length) { const i = q.shift(); order.push(i); for (const c of outs[i]) { const j = index.get(c.out); if (--indeg[j] === 0) q.push(j); } }
  // incoming lists in flat arrays, evaluated in topological order
  const incStart = new Int32Array(N + 1), incSrc = [], incW = [];
  const incoming = Array.from({ length: N }, () => []);
  for (const c of conns) incoming[index.get(c.out)].push(c);
  const evalOrder = order.filter((i) => genome.nodes[i].kind === 'hidden' || genome.nodes[i].kind === 'out');
  for (let i = 0; i < N; i++) { incStart[i + 1] = incStart[i] + incoming[i].length; for (const c of incoming[i]) { incSrc.push(index.get(c.in)); incW.push(c.w); } }
  const src = Int32Array.from(incSrc), wts = Float32Array.from(incW);
  const val = new Float32Array(N); const out = new Float32Array(nOut);
  const outIdx = []; for (let k = 0; k < nOut; k++) outIdx.push(index.get(nIn + 1 + k));
  const inIdx = []; for (let k = 0; k < nIn; k++) inIdx.push(index.get(k));
  const biasIdx = index.get(nIn);
  // output nodes not reachable in `order` (only possible with cycles) still get evaluated
  for (const oi of outIdx) if (!evalOrder.includes(oi)) evalOrder.push(oi);
  const ev = Int32Array.from(evalOrder);
  function forward(x) {
    val.fill(0);
    for (let k = 0; k < nIn; k++) { const v = x[k]; val[inIdx[k]] = v === v ? v : 0; }
    if (biasIdx !== undefined) val[biasIdx] = 1;
    for (let e = 0; e < ev.length; e++) {
      const i = ev[e]; let s = 0;
      for (let k = incStart[i]; k < incStart[i + 1]; k++) s += wts[k] * val[src[k]];
      switch (act[i]) {
        case 0: s = Math.tanh(s); break;
        case 1: s = s > 0 ? s : 0; break;
        case 2: s = s > 0 ? s : 0.05 * s; break;
        case 3: s = 1 / (1 + Math.exp(-s)); break;
        case 4: s = s / (1 + Math.abs(s)); break;
        default: break;
      }
      val[i] = s;
    }
    for (let k = 0; k < nOut; k++) out[k] = val[outIdx[k]];
    return out;
  }
  return { type: 'graph', nIn, nOut, nParams: conns.length, forward, nodes: N, conns: conns.length };
}

// ------------------------------------------------------------------------------------------
// Serialisation helpers (base64 of little-endian Float32 — compact and exact).
// ------------------------------------------------------------------------------------------

/** Float32Array → base64 string. */
export function f32ToBase64(arr) {
  const u8 = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
  if (typeof Buffer !== 'undefined') return Buffer.from(u8).toString('base64');
  let s = ''; const CH = 0x8000;
  for (let i = 0; i < u8.length; i += CH) s += String.fromCharCode.apply(null, u8.subarray(i, i + CH));
  return btoa(s);
}

/** base64 string → Float32Array. */
export function base64ToF32(b64) {
  let u8;
  if (typeof Buffer !== 'undefined') { const b = Buffer.from(b64, 'base64'); u8 = new Uint8Array(b.buffer, b.byteOffset, b.byteLength); }
  else { const s = atob(b64); u8 = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u8[i] = s.charCodeAt(i); }
  const copy = new Uint8Array(u8.length); copy.set(u8);
  return new Float32Array(copy.buffer, 0, copy.length >> 2);
}
