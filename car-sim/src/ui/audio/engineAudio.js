// Synthesised car audio (Web Audio). Engine = firing-pulse train (per-cylinder crank angles, so
// cross-plane V8 burble / flat-4 rumble come from real uneven pulse spacing) through exhaust
// resonators + soft clipping, running in an AudioWorklet (ScriptProcessor fallback).
// Extras: turbo whistle + blow-off, supercharger whine, EV motor whine, tyre squeal, wind, off-road rumble.

const SYNTH_SRC = String.raw`
class EngineSynth {
  constructor(sr) {
    this.sr = sr; this.phase = 0; this.cycle = 720; this.events = [{ a: 0, amp: 1, bank: 0 }]; this.next = 0;
    this.pulses = []; for (let i = 0; i < 8; i++) this.pulses.push({ t: 1e9, len: 1, amp: 0, bank: 0 });
    this.pi = 0; this.f1 = 110; this.f2 = 600; this.q1 = 4; this.q2 = 3; this.noise = 0.3; this.pulseMs = 2.5; this.rasp = 0.5;
    this.bq = [this.mkBq(), this.mkBq(), this.mkBq(), this.mkBq()]; this.lp = [0, 0]; this.dc = [0, 0, 0, 0];
    this.rpm = 900; this.load = 0; this.thr = 0; this.ev = false; this.evPhase = [0, 0]; this.pop = 0; this.seed = 12345; this.drive = 1.4;
  }
  rand() { this.seed = (this.seed * 1664525 + 1013904223) >>> 0; return this.seed / 4294967296; }
  mkBq() { return { b0: 0, b1: 0, b2: 0, a1: 0, a2: 0, x1: 0, x2: 0, y1: 0, y2: 0 }; }
  setBand(b, f, q) {
    const w = 2 * Math.PI * Math.min(f, this.sr * 0.45) / this.sr; const al = Math.sin(w) / (2 * q); const a0 = 1 + al;
    b.b0 = al / a0; b.b1 = 0; b.b2 = -al / a0; b.a1 = -2 * Math.cos(w) / a0; b.a2 = (1 - al) / a0;
  }
  bqRun(b, x) { const y = b.b0 * x + b.b1 * b.x1 + b.b2 * b.x2 - b.a1 * b.y1 - b.a2 * b.y2; b.x2 = b.x1; b.x1 = x; b.y2 = b.y1; b.y1 = y; return y; }
  configure(c) {
    Object.assign(this, c); this.events.sort((p, q) => p.a - q.a); this.next = 0;
    while (this.next < this.events.length && this.events[this.next].a < this.phase) this.next++;
  }
  process(L, R, n) {
    const sr = this.sr; const f1 = this.f1 * (0.85 + 0.3 * Math.min(1, this.rpm / 8000)); const f2 = this.f2 * (0.8 + 0.5 * Math.min(1, this.rpm / 9000));
    this.setBand(this.bq[0], f1, this.q1); this.setBand(this.bq[1], f2, this.q2); this.setBand(this.bq[2], f1 * 1.04, this.q1); this.setBand(this.bq[3], f2 * 1.07, this.q2);
    const dphase = this.rpm / 60 * (this.cycle === 720 ? 360 : 360) / sr * (this.cycle === 720 ? 1 : 1);
    const loadAmp = 0.22 + 0.78 * this.load; const pulseLen = Math.max(8, Math.min(this.pulseMs * sr / 1000, 0.7 * sr * 60 / Math.max(this.rpm, 300) / Math.max(1, this.events.length) * (this.cycle / 360)));
    const overrun = this.thr < 0.08 && this.rpm > 3200 && !this.ev;
    for (let i = 0; i < n; i++) {
      let l = 0, r = 0;
      if (this.ev) {
        // EV handled outside (oscillators); keep silent here
      } else {
        this.phase += dphase;
        if (this.phase >= this.cycle) { this.phase -= this.cycle; this.next = 0; }
        while (this.next < this.events.length && this.events[this.next].a <= this.phase) {
          const e = this.events[this.next++]; const p = this.pulses[this.pi]; this.pi = (this.pi + 1) & 7;
          let amp = e.amp * loadAmp * (0.92 + 0.16 * this.rand());
          if (overrun && this.rand() < 0.035) amp *= 2.8 + this.rand() * 2; // crackle / pop on the overrun
          p.t = 0; p.len = pulseLen * (0.9 + 0.2 * this.rand()); p.amp = amp; p.bank = e.bank;
        }
        let exA = 0, exB = 0;
        for (let k = 0; k < 8; k++) {
          const p = this.pulses[k]; if (p.t >= p.len * 4) continue;
          const x = p.t / p.len; let s = x < 1 ? Math.sin(Math.PI * x) : 0; s += Math.exp(-x * 1.6) * (this.rand() * 2 - 1) * this.noise;
          s *= p.amp; if (p.bank > 0) exB += s; else if (p.bank < 0) exA += s; else { exA += s; exB += s; }
          p.t++;
        }
        const a = this.bqRun(this.bq[0], exA) * 2.2 + this.bqRun(this.bq[1], exA) * this.rasp + exA * 0.25;
        const b = this.bqRun(this.bq[2], exB) * 2.2 + this.bqRun(this.bq[3], exB) * this.rasp + exB * 0.25;
        l = a * 0.75 + b * 0.25; r = b * 0.75 + a * 0.25;
        // DC block + soft clip
        const dl = l - this.dc[0] + 0.995 * this.dc[1]; this.dc[0] = l; this.dc[1] = dl;
        const dr = r - this.dc[2] + 0.995 * this.dc[3]; this.dc[2] = r; this.dc[3] = dr;
        l = Math.tanh(dl * this.drive) * 0.6; r = Math.tanh(dr * this.drive) * 0.6;
      }
      L[i] = l; R[i] = r;
    }
  }
}`;

const WORKLET_SRC = SYNTH_SRC + String.raw`
class EngineProcessor extends AudioWorkletProcessor {
  constructor() { super(); this.s = new EngineSynth(sampleRate); this.port.onmessage = (e) => { const d = e.data; if (d.cfg) this.s.configure(d.cfg); if (d.st) { this.s.rpm = d.st.rpm; this.s.load = d.st.load; this.s.thr = d.st.thr; } }; }
  process(inputs, outputs) { const o = outputs[0]; this.s.process(o[0], o[1] || o[0], o[0].length); return true; }
}
registerProcessor('engine-synth', EngineProcessor);`;

/** Firing-event pattern for a layout. Angles in crank degrees within a 720° cycle (rotary: 360°). */
export function firingPattern(layout, cylinders) {
  const ev = (angles, amps, banks) => angles.map((a, i) => ({ a, amp: amps ? amps[i % amps.length] : 1, bank: banks ? banks[i % banks.length] : 0 }));
  switch (layout) {
    case 'I3': return { cycle: 720, events: ev([0, 240, 480], [1, 0.9, 0.95]), f1: 105, f2: 520, q1: 5, q2: 3, noise: 0.35, pulseMs: 3, rasp: 0.6, drive: 1.6 };
    case 'I4': return { cycle: 720, events: ev([0, 180, 360, 540], [1, 0.96, 1, 0.94]), f1: 125, f2: 640, q1: 4, q2: 3, noise: 0.3, pulseMs: 2.4, rasp: 0.7, drive: 1.5 };
    case 'I5': return { cycle: 720, events: ev([0, 144, 288, 432, 576], [1, 0.85, 0.95, 0.8, 0.92]), f1: 115, f2: 700, q1: 5, q2: 4, noise: 0.28, pulseMs: 2.4, rasp: 0.75, drive: 1.5 };
    case 'I6': return { cycle: 720, events: ev([0, 120, 240, 360, 480, 600]), f1: 130, f2: 900, q1: 4, q2: 5, noise: 0.18, pulseMs: 2.8, rasp: 0.55, drive: 1.25 };
    case 'V6': return { cycle: 720, events: ev([0, 120, 240, 360, 480, 600], [1, 0.9], [-1, 1]), f1: 120, f2: 760, q1: 4, q2: 4, noise: 0.25, pulseMs: 2.6, rasp: 0.6, drive: 1.35 };
    case 'V8': // cross-plane: firing order 1-8-4-3-6-5-7-2, bank A = 1-4, bank B = 5-8 → uneven pulses per bank
      return { cycle: 720, events: ev([0, 90, 180, 270, 360, 450, 540, 630], [1.08, 1, 0.95, 1.12, 1, 0.92, 1.05, 0.97], [-1, 1, -1, -1, 1, 1, 1, -1]), f1: 88, f2: 520, q1: 5, q2: 3, noise: 0.32, pulseMs: 3.4, rasp: 0.55, drive: 1.9 };
    case 'V10': return { cycle: 720, events: ev(Array.from({ length: 10 }, (_, i) => i * 72), [1, 0.96], [-1, 1]), f1: 140, f2: 1250, q1: 4, q2: 6, noise: 0.16, pulseMs: 1.6, rasp: 1.0, drive: 1.4 };
    case 'V12': return { cycle: 720, events: ev(Array.from({ length: 12 }, (_, i) => i * 60), [1], [-1, 1]), f1: 150, f2: 1450, q1: 4, q2: 7, noise: 0.12, pulseMs: 1.5, rasp: 1.0, drive: 1.2 };
    case 'F4': // unequal-length headers: alternate pulses arrive late → off-beat rumble
      return { cycle: 720, events: ev([0, 205, 360, 565], [1.1, 0.85, 1.05, 0.8], [-1, 1, -1, 1]), f1: 98, f2: 540, q1: 6, q2: 3, noise: 0.35, pulseMs: 3.2, rasp: 0.55, drive: 1.8 };
    case 'F6': return { cycle: 720, events: ev([0, 120, 240, 360, 480, 600], [1, 0.94], [-1, 1]), f1: 125, f2: 1000, q1: 4, q2: 5, noise: 0.2, pulseMs: 2.2, rasp: 0.85, drive: 1.35 };
    case 'R2': return { cycle: 360, events: ev([0, 180]), f1: 160, f2: 1100, q1: 3, q2: 4, noise: 0.55, pulseMs: 1.4, rasp: 1.1, drive: 2.0 };
    case 'R3': return { cycle: 360, events: ev([0, 120, 240]), f1: 170, f2: 1250, q1: 3, q2: 4, noise: 0.5, pulseMs: 1.3, rasp: 1.1, drive: 1.9 };
    default: {
      const n = Math.max(1, cylinders || 4); return { cycle: 720, events: ev(Array.from({ length: n }, (_, i) => (i * 720) / n)), f1: 120, f2: 700, q1: 4, q2: 4, noise: 0.3, pulseMs: 2.5, rasp: 0.6, drive: 1.5 };
    }
  }
}

const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);

function noiseBuffer(ctx, sec = 2) {
  const b = ctx.createBuffer(1, ctx.sampleRate * sec, ctx.sampleRate); const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b;
}

export class CarAudio {
  constructor() { this.ctx = null; this.muted = false; this.ready = false; this.params = null; this.prevThr = 0; this.volume = 0.8; }
  /** Must be called from a user gesture. */
  async start() {
    if (this.ctx) { if (this.ctx.state === 'suspended') await this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    const ctx = new AC({ latencyHint: 'interactive' }); this.ctx = ctx;
    const master = ctx.createGain(); master.gain.value = this.muted ? 0 : this.volume; this.master = master;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; comp.attack.value = 0.003; comp.release.value = 0.2;
    master.connect(comp).connect(ctx.destination);
    // engine chain: synth -> exhaust lowpass -> engine gain -> master
    this.engLP = ctx.createBiquadFilter(); this.engLP.type = 'lowpass'; this.engLP.frequency.value = 3000; this.engLP.Q.value = 0.7;
    this.engGain = ctx.createGain(); this.engGain.gain.value = 0; this.engLP.connect(this.engGain).connect(master);
    try {
      const url = URL.createObjectURL(new Blob([WORKLET_SRC], { type: 'application/javascript' }));
      await ctx.audioWorklet.addModule(url);
      this.node = new AudioWorkletNode(ctx, 'engine-synth', { numberOfInputs: 0, numberOfOutputs: 1, outputChannelCount: [2] });
      this.post = (m) => this.node.port.postMessage(m);
    } catch (err) {
      console.warn('[audio] AudioWorklet unavailable, using ScriptProcessor', err);
      const Synth = new Function(SYNTH_SRC + '\nreturn EngineSynth;')(); const s = new Synth(ctx.sampleRate);
      this.node = ctx.createScriptProcessor(1024, 0, 2);
      this.node.onaudioprocess = (e) => s.process(e.outputBuffer.getChannelData(0), e.outputBuffer.getChannelData(1), e.outputBuffer.length);
      this.post = (m) => { if (m.cfg) s.configure(m.cfg); if (m.st) { s.rpm = m.st.rpm; s.load = m.st.load; s.thr = m.st.thr; } };
    }
    this.node.connect(this.engLP);
    const nb = noiseBuffer(ctx);
    const noiseSrc = () => { const s = ctx.createBufferSource(); s.buffer = nb; s.loop = true; s.start(); return s; };
    // turbo whistle
    this.turbo = ctx.createOscillator(); this.turbo.type = 'sine'; this.turboG = ctx.createGain(); this.turboG.gain.value = 0;
    this.turbo.connect(this.turboG).connect(master); this.turbo.start();
    this.turboHiss = ctx.createBiquadFilter(); this.turboHiss.type = 'bandpass'; this.turboHiss.frequency.value = 6000; this.turboHiss.Q.value = 2;
    this.turboHissG = ctx.createGain(); this.turboHissG.gain.value = 0; noiseSrc().connect(this.turboHiss).connect(this.turboHissG).connect(master);
    // blow-off valve
    this.bovF = ctx.createBiquadFilter(); this.bovF.type = 'bandpass'; this.bovF.frequency.value = 2600; this.bovF.Q.value = 1.2;
    this.bovG = ctx.createGain(); this.bovG.gain.value = 0; noiseSrc().connect(this.bovF).connect(this.bovG).connect(master);
    // supercharger whine
    this.sc = ctx.createOscillator(); this.sc.type = 'sawtooth'; this.scF = ctx.createBiquadFilter(); this.scF.type = 'bandpass'; this.scF.Q.value = 3;
    this.scG = ctx.createGain(); this.scG.gain.value = 0; this.sc.connect(this.scF).connect(this.scG).connect(master); this.sc.start();
    // EV motor whine (two harmonics) + inverter
    this.ev1 = ctx.createOscillator(); this.ev2 = ctx.createOscillator(); this.ev2.type = 'triangle'; this.evG = ctx.createGain(); this.evG.gain.value = 0;
    this.ev1.connect(this.evG); this.ev2.connect(this.evG); this.evG.connect(master); this.ev1.start(); this.ev2.start();
    // tyre squeal: resonant noise + wobbling tone
    this.sqF = ctx.createBiquadFilter(); this.sqF.type = 'bandpass'; this.sqF.frequency.value = 950; this.sqF.Q.value = 9;
    this.sqG = ctx.createGain(); this.sqG.gain.value = 0; noiseSrc().connect(this.sqF).connect(this.sqG).connect(master);
    this.sqO = ctx.createOscillator(); this.sqO.type = 'sawtooth'; this.sqOF = ctx.createBiquadFilter(); this.sqOF.type = 'bandpass'; this.sqOF.Q.value = 12;
    this.sqOG = ctx.createGain(); this.sqOG.gain.value = 0; this.sqO.connect(this.sqOF).connect(this.sqOG).connect(master); this.sqO.start();
    // wind + off-road rumble
    this.windF = ctx.createBiquadFilter(); this.windF.type = 'lowpass'; this.windF.frequency.value = 600; this.windG = ctx.createGain(); this.windG.gain.value = 0;
    noiseSrc().connect(this.windF).connect(this.windG).connect(master);
    this.rumF = ctx.createBiquadFilter(); this.rumF.type = 'lowpass'; this.rumF.frequency.value = 180; this.rumG = ctx.createGain(); this.rumG.gain.value = 0;
    noiseSrc().connect(this.rumF).connect(this.rumG).connect(master);
    this.ready = true;
    if (this.params) this.setCar(this.params);
  }
  setMuted(m) { this.muted = m; if (this.master) this.master.gain.setTargetAtTime(m ? 0 : this.volume, this.ctx.currentTime, 0.05); }
  suspend() { if (this.ctx && this.ctx.state === 'running') this.ctx.suspend(); }
  resume() { if (this.ctx && this.ctx.state === 'suspended' && !this.muted) this.ctx.resume(); }
  /** Configure for a car (params from build()). */
  setCar(params) {
    this.params = params; if (!this.ready) return;
    const ep = params.powerUnits?.[0]?.engine || {}; this.isEV = !!ep.isEV;
    const layout = params.render?.engineLayout || ep.layout || 'I4';
    const pat = firingPattern(layout, ep.cylinders);
    this.post({ cfg: { ...pat, ev: this.isEV } });
    const ex = params.render?.exhaust || 'stock';
    this.loud = ep.loudness ?? (ex === 'straight' ? 1 : ex === 'sport' ? 0.7 : 0.4);
    this.induction = ep.induction || 'na';
    this.engLP.frequency.setTargetAtTime(1400 + this.loud * 5200, this.ctx.currentTime, 0.05);
    this.maxBoost = Math.max(0.3, params.spec?.engine?.boost || 1);
  }
  /** Per-frame update from the focused vehicle. */
  update(v, dt, opts = {}) {
    if (!this.ready || !v) return;
    const ctx = this.ctx; const t = ctx.currentTime; const tc = 0.03;
    const es = v.engines?.[0] || {}; const thr = v.controls?.throttle ?? 0;
    const rpm = es.rpm || 0; const ep = this.params.powerUnits?.[0]?.engine || {};
    const maxT = Math.max(1, this.params.summary?.torqueNm || 300);
    const load = clamp(Math.max(thr * 0.75, (es.torque || 0) / maxT), 0, 1);
    const g = opts.gain ?? 1;
    if (!this.isEV) {
      this.post({ st: { rpm: Math.max(rpm, 300), load, thr } });
      const vol = (0.22 + 0.5 * this.loud) * (0.45 + 0.55 * load) * (es.failed ? 0 : 1) * g;
      this.engGain.gain.setTargetAtTime(vol, t, tc);
      this.engLP.frequency.setTargetAtTime((1200 + this.loud * 5000) * (0.55 + 0.45 * load) + rpm * 0.25, t, 0.05);
      this.evG.gain.setTargetAtTime(0, t, tc);
    } else {
      this.engGain.gain.setTargetAtTime(0, t, tc);
      const f = rpm / 60 * 6; this.ev1.frequency.setTargetAtTime(Math.max(30, f), t, tc); this.ev2.frequency.setTargetAtTime(Math.max(60, f * 2.02), t, tc);
      this.evG.gain.setTargetAtTime((0.015 + 0.05 * load) * clamp(rpm / 3000, 0, 1) * g, t, tc);
    }
    // forced induction
    const boost = Math.max(0, es.boostBar || 0); const bf = clamp(boost / this.maxBoost, 0, 1.3);
    if (this.induction === 'turbo') {
      this.turbo.frequency.setTargetAtTime(1500 + 7500 * bf, t, 0.08);
      this.turboG.gain.setTargetAtTime(0.022 * bf * bf * g, t, 0.06);
      this.turboHissG.gain.setTargetAtTime(0.03 * bf * g, t, 0.06);
      if (this.prevThr > 0.55 && thr < 0.2 && boost > 0.25) { // blow-off
        const G = this.bovG.gain; G.cancelScheduledValues(t); G.setValueAtTime(0.0, t);
        G.linearRampToValueAtTime(0.16 * clamp(boost, 0.3, 1.5) * g, t + 0.02);
        for (let k = 1; k < 8; k++) G.linearRampToValueAtTime((k % 2 ? 0.04 : 0.12) * Math.exp(-k * 0.3) * g, t + 0.02 + k * 0.045);
        G.linearRampToValueAtTime(0, t + 0.5);
      }
    } else { this.turboG.gain.setTargetAtTime(0, t, tc); this.turboHissG.gain.setTargetAtTime(0, t, tc); }
    if (this.induction === 'super') {
      const f = rpm / 60 * 9; this.sc.frequency.setTargetAtTime(f, t, tc); this.scF.frequency.setTargetAtTime(f, t, tc);
      this.scG.gain.setTargetAtTime((0.012 + 0.05 * load) * clamp(rpm / (ep.redlineRpm || 7000), 0, 1) * g, t, tc);
    } else this.scG.gain.setTargetAtTime(0, t, tc);
    this.prevThr = thr;
    // tyres
    let sq = 0, slip = 0, off = 0;
    for (const w of v.wheels) {
      if (w.contact === false) continue;
      if (w.surface >= 2) { off += 1; continue; }
      const u = (w.usage || 0) - 0.92; if (u > 0 || w.sliding) { sq = Math.max(sq, clamp(u * 3, 0, 1) * (w.sliding ? 1 : 0.6)); slip = Math.max(slip, Math.abs(w.slipRatio || 0) + Math.abs(w.slipAngle || 0)); }
    }
    const speed = Math.hypot(v.vel[0], v.vel[1]);
    const sqv = sq * clamp(speed / 6, 0, 1);
    this.sqG.gain.setTargetAtTime(0.09 * sqv * g, t, 0.04); this.sqOG.gain.setTargetAtTime(0.02 * sqv * g, t, 0.04);
    const sf = 820 + clamp(slip, 0, 1) * 500 + Math.sin(t * 23) * 25;
    this.sqF.frequency.setTargetAtTime(sf, t, 0.05); this.sqO.frequency.setTargetAtTime(sf * 0.5, t, 0.05); this.sqOF.frequency.setTargetAtTime(sf, t, 0.05);
    this.windG.gain.setTargetAtTime(clamp(speed / 70, 0, 1) ** 2 * 0.12 * g, t, 0.1); this.windF.frequency.setTargetAtTime(300 + speed * 12, t, 0.1);
    this.rumG.gain.setTargetAtTime(off / 4 * clamp(speed / 15, 0, 1) * 0.25 * g, t, 0.05);
  }
}
