// A Deck plays one generated song: owns its kit, mono synths, mixer channels and event queue.
// Two decks can run at once while the playlist crossfades.
import { createKit, sharedBuffers } from './kit.js';
import { createDelay } from './fx.js';
import { MonoSynth, BASS_PRESETS, playStab, playPad, playPluck, playLead, playVox, playRiser, playBoom } from './voices.js';
import { planBar } from './sequencer.js';

const CHANNELS = {
  //     gain  reverb delay  music(ducked)  highpass Hz
  kick: [0.82, 0, 0, false, 0],
  snare: [0.42, 0.12, 0, false, 140],
  hats: [0.3, 0.04, 0, false, 400],
  perc: [0.3, 0.1, 0.06, false, 200],
  brk: [0.5, 0.04, 0, false, 120],
  bass: [0.42, 0, 0, true, 0],
  sub: [0.5, 0, 0, true, 0],
  acid: [0.36, 0.06, 0.12, true, 90],
  stab: [0.2, 0.28, 0.16, true, 160],
  pad: [0.12, 0.4, 0, true, 220],
  arp: [0.075, 0.25, 0.3, true, 250],
  lead: [0.16, 0.25, 0.18, true, 150],
  vox: [0.2, 0.25, 0.26, true, 200],
  fx: [0.32, 0.45, 0, false, 0],
};

/** Per-style channel trims (dB-calibrated from stem renders, see scripts/render-music.js --stems). */
export const STYLE_MIX = {};

const DUCK = { dnb: 0.5, breaks: 0.55, garage: 0.5, acid: 0.4 };

/** Section lists for each playback mode. */
export function modeSections(mode, song) {
  switch (mode) {
    case 'free': return song.arrangement.map((s) => ({ ...s }));
    case 'chill': return [{ name: 'chill', bars: 16 }, { name: 'chillB', bars: 16 }, { name: 'chill', bars: 8 }, { name: 'chillB', bars: 16 }];
    case 'race': return [{ name: 'race', bars: 16 }, { name: 'bridge', bars: 8 }, { name: 'drop2', bars: 16 }, { name: 'race', bars: 16 }, { name: 'bridge', bars: 8 }, { name: 'drop2', bars: 16 }];
    case 'raceIn': return [{ name: 'build2', bars: 4 }, ...modeSections('race', song)];
    case 'final': return [{ name: 'lift', bars: 1 }, { name: 'final', bars: 16 }, { name: 'final', bars: 16 }, { name: 'final', bars: 16 }, { name: 'final', bars: 16 }];
    case 'countdown': return [{ name: 'countdown', bars: 256 }];
    case 'victory': return [{ name: 'victory', bars: 8 }, ...modeSections('chill', song)];
    case 'dropNow': return [{ name: 'drop', bars: 16 }, ...modeSections('free', song).slice(3)];
    default: return modeSections('free', song);
  }
}

export class Deck {
  /**
   * @param {import('./engine.js').MusicEngine} engine
   * @param {object} song
   * @param {string} mode
   * @param {number} startTime
   */
  constructor(engine, song, mode, startTime) {
    const ctx = engine.ctx;
    this.engine = engine;
    this.ctx = ctx;
    this.song = song;
    this.mode = mode;
    this.kit = createKit(ctx, song);
    this.noise = sharedBuffers(ctx).noise;
    this.stepDur = 60 / song.bpm / 4;
    this.barDur = this.stepDur * 16;
    this.queue = [];
    this.qi = 0;
    this.voices = [];
    this.sections = modeSections(mode, song);
    this.secIdx = 0;
    this.bar = -1;
    this.globalBar = -1;
    this.nextBarTime = startTime;
    this.startTime = startTime;
    this.pendingMode = null;
    this.endAt = Infinity;
    this.handoff = false;
    this.transpose = 0;
    this.curFilter = 1200;
    this.padVoicing = null;
    this.stabVoicing = null;
    this.countdown = null;
    this.ended = false;

    // ---- mixer
    this.out = ctx.createGain();
    this.out.gain.value = 0;
    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.Q.value = 0.9;
    this.filter.frequency.value = 1200;
    this.filter.connect(this.out).connect(engine.master.input);
    this.duck = ctx.createGain();
    this.duck.connect(this.filter);
    this.delay = createDelay(ctx, song.bpm);
    this.delay.output.connect(this.duck);
    this.brkFilter = ctx.createBiquadFilter();
    this.brkFilter.type = 'lowpass';
    this.brkFilter.frequency.value = 16000;
    this.brkFilter.connect(this.filter);
    this.ch = {};
    this.nodes = [this.out, this.filter, this.duck, this.brkFilter, ...this.delay.nodes];
    const styleMix = STYLE_MIX[song.style] || {};
    for (const [name, [g, rev, dly, music, hpf]] of Object.entries(CHANNELS)) {
      const n = ctx.createGain();
      n.gain.value = g * (styleMix[name] ?? 1) * (engine.mix && engine.mix[name] !== undefined ? engine.mix[name] : 1);
      let tail = n;
      if (hpf) {
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = hpf;
        hp.Q.value = 0.6;
        tail = n.connect(hp);
        this.nodes.push(hp);
      }
      tail.connect(name === 'brk' ? this.brkFilter : music ? this.duck : this.filter);
      if (rev) {
        const s = ctx.createGain();
        s.gain.value = rev;
        tail.connect(s).connect(engine.master.reverbIn);
        this.nodes.push(s);
      }
      if (dly) {
        const s = ctx.createGain();
        s.gain.value = dly;
        tail.connect(s).connect(this.delay.input);
        this.nodes.push(s);
      }
      this.ch[name] = n;
      this.nodes.push(n);
    }

    // ---- persistent mono synths
    const bassType = { dnb: 'reese', breaks: 'bigbeat', garage: 'wobble', acid: 'acid' }[song.style];
    const preset = { ...BASS_PRESETS[bassType] };
    if (preset.lfo) preset.lfo = { ...preset.lfo, rate: bassType === 'reese' ? song.bpm / 60 / 8 : preset.lfo.rate };
    if (bassType === 'acid' && (song.seed & 1)) preset.oscs = [{ type: 'square', detune: 0, g: 0.8 }];
    this.bass = new MonoSynth(ctx, bassType === 'acid' ? this.ch.acid : this.ch.bass, preset);
    this.bass.start(startTime);
    this.synths = [this.bass];
    if (song.style === 'acid') {
      this.sub = new MonoSynth(ctx, this.ch.sub, BASS_PRESETS.sub);
      this.sub.start(startTime);
      this.synths.push(this.sub);
    }
    if (song.style === 'breaks' && song.acid) {
      this.acid = new MonoSynth(ctx, this.ch.acid, { ...BASS_PRESETS.acid, level: 0.4 });
      this.acid.start(startTime);
      this.synths.push(this.acid);
    }
  }

  emit(ev) {
    this.queue.push(ev);
  }

  get section() {
    return this.sections[this.secIdx];
  }

  /** Request a new mode; it takes effect on the next bar boundary. */
  requestMode(mode) {
    this.pendingMode = mode;
  }

  fade(t, from, to, dur) {
    const g = this.out.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(from, t);
    g.linearRampToValueAtTime(to, t + dur);
  }

  /** Advance the bar counter; returns false when the arrangement has ended. */
  advance() {
    this.globalBar++;
    if (this.pendingMode) {
      const m = this.pendingMode;
      this.pendingMode = null;
      this.mode = m;
      this.sections = modeSections(m, this.song);
      this.secIdx = 0;
      this.bar = 0;
      this.handoff = false;
      if (m === 'final') this.transpose = this.song.finalTranspose;
      if (m === 'victory' || m === 'chill') this.transpose = 0;
      return true;
    }
    this.bar++;
    while (this.secIdx < this.sections.length && this.bar >= this.sections[this.secIdx].bars) {
      this.bar = 0;
      this.secIdx++;
    }
    if (this.secIdx >= this.sections.length) {
      if (this.mode === 'final') { // keep the final-lap energy going until told otherwise
        this.sections = [{ name: 'final', bars: 16 }];
        this.secIdx = 0;
        return true;
      }
      if (this.mode === 'victory') {
        this.mode = 'chill';
        this.sections = modeSections('chill', this.song);
        this.secIdx = 0;
        return true;
      }
      return false;
    }
    return true;
  }

  barsRemaining() {
    let n = this.sections[this.secIdx].bars - this.bar - 1;
    for (let i = this.secIdx + 1; i < this.sections.length; i++) n += this.sections[i].bars;
    return n;
  }

  /** Plan bars that start before `horizon`, then turn due events into audio nodes. */
  pump(now, horizon) {
    while (!this.ended && this.nextBarTime < horizon && this.nextBarTime < this.endAt) {
      if (!this.advance()) {
        this.ended = true;
        break;
      }
      const sec = this.section;
      const next = this.bar + 1 < sec.bars ? sec : this.sections[this.secIdx + 1];
      const t0 = this.nextBarTime;
      const before = this.queue.length;
      planBar(this, {
        t0,
        name: sec.name,
        bar: this.bar,
        bars: sec.bars,
        nextName: next ? next.name : null,
        intensity: this.engine.effectiveIntensity(this),
        transpose: this.transpose,
        globalBar: this.globalBar,
        countdown: this.countdown,
      });
      if (this.queue.length > before) {
        const rest = this.queue.slice(this.qi);
        rest.sort((a, b) => a.t - b.t);
        this.queue = rest;
        this.qi = 0;
      }
      this.nextBarTime += this.barDur;
      if (!this.handoff && ['free', 'chill', 'race', 'raceIn'].includes(this.mode) && this.barsRemaining() <= 2) {
        this.handoff = true;
        this.engine.onDeckNearEnd(this, this.nextBarTime);
      }
    }
    const q = this.queue;
    while (this.qi < q.length && q[this.qi].t < horizon) {
      const ev = q[this.qi++];
      if (ev.t >= this.endAt + 0.5) continue;
      if (ev.t < now - 0.08 && ev.type !== 'filter' && ev.type !== 'bass' && ev.type !== 'riser') continue; // too late
      this.exec(ev, Math.max(ev.t, now));
    }
    if (this.qi > 256) {
      this.queue = q.slice(this.qi);
      this.qi = 0;
    }
    // prune finished voices
    if (this.voices.length > 64) this.voices = this.voices.filter((v) => v.end > now);
  }

  track(v) {
    this.voices.push(v);
    return v;
  }

  hit(buf, t, g, dest, rate = 1) {
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    if (rate !== 1) src.playbackRate.value = rate;
    const gn = ctx.createGain();
    gn.gain.value = g;
    src.connect(gn).connect(dest);
    src.start(t);
    src.onended = () => gn.disconnect();
    return this.track({ start: t, end: t + buf.duration / rate, sources: [src], vca: gn, oscCount: 0 });
  }

  exec(ev, t) {
    const ctx = this.ctx;
    const E = this.engine;
    const k = this.kit;
    switch (ev.type) {
      case 'kick': {
        this.hit(k.kick, t, ev.g, this.ch.kick);
        const d = this.duck.gain;
        d.setTargetAtTime(DUCK[this.song.style] || 0.5, t, 0.003);
        d.setTargetAtTime(1, t + 0.04, 0.07);
        break;
      }
      case 'hit':
        this.hit(k[ev.s], t, ev.g, this.ch[ev.ch] || this.ch.perc, ev.rate || 1);
        break;
      case 'slice': {
        const sd = k.breakStepDur;
        const buf = ev.rev ? k.breakLoopRev : k.breakLoop;
        const outDur = ev.len * this.stepDur;
        const read = outDur * ev.rate;
        let off = ev.src * sd;
        if (ev.rev) off = buf.duration - (ev.src * sd + read);
        off = Math.max(0, Math.min(buf.duration - 0.01, off));
        const src = ctx.createBufferSource();
        src.buffer = buf;
        if (ev.rate !== 1) src.playbackRate.value = ev.rate;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(ev.g, t + 0.0015);
        const endT = t + outDur;
        g.gain.setValueAtTime(ev.g, Math.max(t + 0.002, endT - 0.004));
        g.gain.linearRampToValueAtTime(0, endT);
        src.connect(g).connect(this.ch.brk);
        src.start(t, off);
        src.stop(endT + 0.002);
        src.onended = () => g.disconnect();
        this.track({ start: t, end: endT, sources: [src], vca: g, oscCount: 0 });
        break;
      }
      case 'bass':
        this.bass.note(t, ev.midi, ev.dur, ev);
        break;
      case 'sub':
        if (this.sub) this.sub.note(t, ev.midi, ev.dur, { cutoff: 260 });
        break;
      case 'acid':
        if (this.acid) this.acid.note(t, ev.midi, ev.dur, ev);
        break;
      case 'stab':
        if (E.voiceBudget(ev.notes.length * (ev.kind === 'hoover' ? 3 : 2), 1, t)) {
          this.track(E.countVoice(playStab(ctx, this.ch.stab, t, ev.notes, { kind: ev.kind }, E.voiceEnd)));
        }
        break;
      case 'pad':
        if (E.voiceBudget(ev.notes.length * 2, 0, t)) {
          this.track(E.countVoice(playPad(ctx, this.ch.pad, t, ev.notes, ev.dur, { cutoff: ev.cutoff, sweep: ev.sweep, gain: ev.gain }, E.voiceEnd)));
        }
        break;
      case 'arp':
        if (E.voiceBudget(1, 0, t)) {
          this.track(E.countVoice(playPluck(ctx, this.ch.arp, t, ev.midi, { wave: ev.wave, gain: 0.5 }, E.voiceEnd)));
        }
        break;
      case 'lead':
        if (E.voiceBudget(5, 1, t)) {
          this.track(E.countVoice(playLead(ctx, this.ch.lead, t, ev.midi, ev.dur, { kind: ev.kind, gain: ev.gain ?? 0.6 }, E.voiceEnd)));
        }
        break;
      case 'vox':
        if (E.voiceBudget(1, 1, t)) {
          this.track(E.countVoice(playVox(ctx, this.ch.vox, t, ev.midi, ev.dur, { v1: ev.v1, v2: ev.v2, gain: 0.6 }, E.voiceEnd)));
        }
        break;
      case 'riser':
        this.track(E.countVoice(playRiser(ctx, this.ch.fx, this.noise, t, ev.dur, { midi: ev.midi, gain: 0.32 }, E.voiceEnd)));
        break;
      case 'impact':
        this.track(E.countVoice(playBoom(ctx, this.ch.fx, t, { gain: ev.big ? 0.75 : 0.5 }, E.voiceEnd)));
        this.hit(k.crash, t, 0.6, this.ch.hats);
        break;
      case 'swell': {
        const L = Math.min(k.crashRev.duration, this.barDur * 0.6);
        const start = Math.max(this.ctx.currentTime, ev.t - L);
        const src = ctx.createBufferSource();
        src.buffer = k.crashRev;
        const g = ctx.createGain();
        g.gain.value = 0.4;
        src.connect(g).connect(this.ch.fx);
        src.start(start, k.crashRev.duration - (ev.t - start));
        src.stop(ev.t);
        src.onended = () => g.disconnect();
        this.track({ start, end: ev.t, sources: [src], vca: g, oscCount: 0 });
        break;
      }
      case 'filter': {
        const f = this.filter.frequency;
        const from = ev.from ?? ev.start ?? this.curFilter;
        f.setValueAtTime(from, t);
        f.exponentialRampToValueAtTime(Math.max(60, ev.to), Math.max(t + 0.01, ev.end));
        this.curFilter = ev.to;
        break;
      }
      case 'brkFilter':
        this.brkFilter.frequency.setTargetAtTime(ev.to, t, 0.08);
        break;
      default:
        break;
    }
  }

  /**
   * Re-anchor the arrangement at time `when` (a drop): drops planned events after `when`,
   * silences voices that would sound after it and restarts the bar clock there.
   */
  reanchor(when, mode) {
    this.queue = this.queue.slice(this.qi).filter((e) => e.t < when - 0.001);
    this.qi = 0;
    for (const v of this.voices) {
      if (v.end <= when) continue;
      if (v.start >= when - 0.001) {
        for (const s of v.sources) { try { s.stop(when); } catch (_) { /* noop */ } }
      } else {
        try {
          v.vca.gain.setTargetAtTime(0, when, 0.015);
          for (const s of v.sources) s.stop(when + 0.2);
        } catch (_) { /* noop */ }
      }
    }
    for (const s of this.synths) s.cancel(when);
    this.filter.frequency.cancelScheduledValues(when);
    this.duck.gain.cancelScheduledValues(when);
    this.duck.gain.setTargetAtTime(1, when, 0.01);
    this.pendingMode = null;
    this.mode = mode;
    this.sections = modeSections(mode, this.song);
    this.secIdx = 0;
    this.bar = -1;
    this.nextBarTime = when;
    this.handoff = false;
    this.countdown = null;
    this.ended = false;
    this.curFilter = 18000;
  }

  dispose(t) {
    this.endAt = Math.min(this.endAt, t);
    for (const s of this.synths) s.stop(t + 0.1);
  }

  disconnect() {
    for (const s of this.synths) s.disconnect();
    for (const n of this.nodes) { try { n.disconnect(); } catch (_) { /* noop */ } }
  }
}
