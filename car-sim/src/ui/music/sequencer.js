// Sequencer: turns (song, section, bar, race intensity) into a list of timed events for one bar.
// Pure data out: { t, type, ... } — the deck turns events into audio nodes just-in-time.
import { degSemi, voiceChord, snapToChord } from './theory.js';
import { SECTIONS, DROP_SECTIONS, STYLES } from './styles.js';
import { makeRng } from './rng.js';

const lerp = (a, b, x) => a + (b - a) * x;
const clamp01 = (x) => Math.max(0, Math.min(1, x));

/** Which layers play in a section, given style and race intensity (0..1). */
export function layersFor(name, style, I, barInSection, bars) {
  const L = {
    kick: 0, snare: 0, hats: 0, hats16: 0, ohat: 0, ride: 0, perc: 0, brk: 0, brkLP: 0, bass: 0,
    sub: 0, stab: 0, pad: 0, arp: 0, lead: 0, vox: 0, acid2: 0, chop: 0, halftime: 0,
  };
  const garage = style === 'garage';
  const acid = style === 'acid';
  const breaky = style === 'dnb' || style === 'breaks';
  switch (name) {
    case 'intro':
      L.hats = 1; L.pad = 1; L.perc = garage ? 1 : 0;
      L.brk = breaky ? 1 : 0; L.brkLP = 1; L.arp = style === 'dnb' || style === 'breaks' ? 1 : 0;
      L.kick = acid || (garage && barInSection >= bars / 2) ? 1 : 0;
      L.bass = acid ? 1 : 0;
      L.stab = garage && barInSection >= bars / 2 ? 1 : 0;
      break;
    case 'build':
    case 'build2':
      L.kick = 1; L.snare = name === 'build2' ? 0 : 1; L.hats = 1; L.brk = breaky || acid ? 1 : 0; L.bass = 1;
      L.pad = 1; L.stab = 1; L.arp = 1; L.perc = 1; L.chop = 0.3; L.hats16 = 1;
      break;
    case 'drop':
    case 'race':
      L.kick = L.snare = L.hats = L.ohat = L.brk = L.bass = 1;
      L.hats16 = I > 0.45 ? 1 : 0;
      L.stab = I > 0.2 ? 1 : 0;
      L.perc = I > 0.4 ? 1 : 0;
      L.lead = I > 0.55 ? 1 : 0;
      L.vox = garage && I > 0.35 ? 1 : 0;
      L.ride = I > 0.75 ? 1 : 0;
      L.sub = acid ? 1 : 0;
      L.chop = I;
      break;
    case 'drop2':
    case 'final':
      L.kick = L.snare = L.hats = L.ohat = L.brk = L.bass = L.stab = 1;
      L.hats16 = 1; L.perc = 1; L.lead = I > 0.3 || name === 'final' ? 1 : 0;
      L.vox = garage ? 1 : 0; L.ride = I > 0.5 || name === 'final' ? 1 : 0;
      L.arp = I > 0.6 ? 1 : 0; L.sub = acid ? 1 : 0; L.acid2 = 1;
      L.chop = Math.max(0.6, I);
      if (name === 'final') L.chop = 1;
      break;
    case 'bridge':
      L.kick = L.snare = L.hats = L.brk = L.bass = 1;
      L.arp = 1; L.pad = 1; L.vox = garage ? 1 : 0; L.perc = 1; L.chop = 0.35; L.sub = acid ? 1 : 0;
      L.hats16 = I > 0.5 ? 1 : 0;
      break;
    case 'break':
      L.pad = 1; L.arp = 1; L.lead = garage ? 0 : 1; L.vox = garage ? 1 : 0;
      L.brk = breaky ? 1 : 0; L.brkLP = 1; L.hats = barInSection >= bars / 2 ? 1 : 0;
      L.bass = acid ? 1 : 0;
      break;
    case 'outro':
      L.kick = L.hats = 1; L.perc = 1;
      if (barInSection < bars / 2) { L.snare = L.brk = L.bass = L.pad = 1; L.sub = acid ? 1 : 0; }
      else { L.arp = 1; L.brkLP = 1; L.brk = breaky ? 1 : 0; }
      break;
    case 'lift':
      L.hats = L.hats16 = 1; L.pad = 1; L.bass = 1; L.brk = breaky ? 1 : 0; L.chop = 0.8;
      break;
    case 'victory':
      L.halftime = 1; L.kick = L.snare = L.hats = 1; L.pad = 1; L.lead = 1; L.bass = 1; L.ride = 1;
      break;
    case 'chill':
    case 'chillB':
      L.halftime = 1; L.kick = L.snare = L.hats = 1; L.pad = 1; L.bass = 1;
      L.arp = name === 'chillB' ? 1 : 0; L.vox = garage && name === 'chillB' ? 1 : 0;
      L.perc = garage ? 1 : 0;
      break;
    default:
      break;
  }
  return L;
}

// --------------------------------------------------------------------------- break chopper

/**
 * Build the slice map for one bar of the break: 16 output steps -> source slices of the 2-bar loop.
 * @returns {Array<{s:number, src:number, len:number, rate:number, rev:boolean, g:number}>}
 */
export function chopBar(rng, barIdx, level, fill, toDrop) {
  const srcBar = (barIdx % 2) * 16;
  const other = 16 - srcBar;
  const slots = [];
  for (let s = 0; s < 16; s++) slots.push({ s, src: srcBar + s, len: 1, rate: 1, rev: false, g: 1 });
  const snareSrc = srcBar + 12;
  const ops = [];
  if (rng.next() < 0.3 * level) ops.push('swap');
  if (fill === 1 && rng.next() < 0.4 + 0.6 * level) ops.push(rng.pick(['stutter', 'pitch', 'shuffle', 'reverse']));
  if (fill === 2) {
    ops.push(rng.pick(['shuffle', 'stutter', 'pitch']));
    ops.push(level > 0.5 ? rng.pick(['roll', 'roll', 'reverse']) : 'roll');
  }
  if (toDrop) ops.push('roll');
  for (const op of ops) {
    if (op === 'swap') {
      const b = rng.pick([1, 2, 3]);
      for (let k = 0; k < 4; k++) slots[b * 4 + k].src = other + b * 4 + k;
    } else if (op === 'shuffle') {
      const beats = rng.shuffle([4, 8, 12, other + 4, other + 8]);
      for (let b = 1; b < 4; b++) for (let k = 0; k < 4; k++) slots[b * 4 + k].src = beats[b - 1] + k;
    } else if (op === 'stutter') {
      const a = rng.pick([8, 10, 12]);
      const srcS = rng.pick([srcBar + 4, srcBar + 12, srcBar]);
      const n = 16 - a > 4 ? 4 : 16 - a;
      for (let k = 0; k < n; k++) Object.assign(slots[a + k], { src: srcS + (k % 2 && rng.chance(0.3) ? 1 : 0), g: 0.8 + 0.05 * k });
    } else if (op === 'pitch') {
      const a = rng.pick([8, 12]);
      const up = rng.chance(0.5);
      for (let k = 0; k < 4; k++) Object.assign(slots[a + k], { rate: up ? 1 + 0.06 * (k + 1) : 0.92 - 0.05 * k });
    } else if (op === 'reverse') {
      // reversed snare swell over the last beat
      slots.splice(12, 4, { s: 12, src: srcBar + 4, len: 4, rate: 1, rev: true, g: 0.9 });
    } else if (op === 'roll') {
      // 32nd-note snare roll with crescendo over the last beat (or two)
      const from = toDrop && level > 0.5 ? 8 : 12;
      const keep = slots.filter((x) => x.s < from);
      slots.length = 0;
      slots.push(...keep);
      for (let s = from; s < 16; s++) {
        const k = (s - from) / (16 - from);
        const sub = s >= 14 ? 2 : 1;
        for (let j = 0; j < sub; j++) {
          slots.push({ s: s + j / sub, src: snareSrc, len: 1 / sub, rate: 1 + (toDrop ? 0.15 * k : 0), rev: false, g: 0.45 + 0.55 * k });
        }
      }
    }
  }
  // merge contiguous identity slices into longer reads (fewer nodes)
  const out = [];
  for (const x of slots) {
    const p = out[out.length - 1];
    if (p && !p.rev && !x.rev && p.rate === 1 && x.rate === 1 && p.g === x.g && Number.isInteger(x.s) &&
        p.s + p.len === x.s && p.src + p.len === x.src && x.len === 1 && Number.isInteger(p.len)) {
      p.len += 1;
    } else out.push({ ...x });
  }
  return out;
}

// --------------------------------------------------------------------------- bar planning

/**
 * Plan one bar of music.
 * @param {object} deck   (song, emit(), state: prevVoicing, acidKnob...)
 * @param {object} info   { t0, name, bar, bars, nextName, intensity, transpose, globalBar, countdown? }
 */
export function planBar(deck, info) {
  const song = deck.song;
  const S = STYLES[song.style];
  const style = song.style;
  const sec = SECTIONS[info.name] || SECTIONS.drop;
  const sd = 60 / song.bpm / 4;
  const barDur = sd * 16;
  const t0 = info.t0;
  const swingOff = (song.swing - 0.5) * 2 * sd;
  const st = (s) => t0 + s * sd + (Number.isInteger(s) && s % 2 === 1 ? swingOff : 0);
  const I = info.intensity;
  const { bar, bars, name, nextName } = info;
  const L = layersFor(name, style, I, bar, bars);
  const rng = makeRng((song.chopSeed + info.globalBar * 7919 + bar * 31) >>> 0);
  const emit = (ev) => deck.emit(ev);
  const tr = info.transpose || 0;
  const tonic = song.tonic + tr;
  const scale = song.scale;
  const lastBar = bar === bars - 1;
  const toDrop = lastBar && nextName && DROP_SECTIONS.has(nextName);
  const fill = (bar % 8 === 7 || lastBar) ? 2 : bar % 4 === 3 ? 1 : 0;
  const isCountdown = name === 'countdown';

  // harmony
  let prog = song.progression;
  if (name === 'victory') prog = [5, 6, 2, 2];
  if (isCountdown) prog = [song.scaleName === 'harmonicMinor' ? 4 : 6]; // dominant tension
  const cb = name === 'victory' ? 2 : song.chordBars;
  const chordIdx = Math.floor(bar / cb) % prog.length;
  const chordDeg = prog[chordIdx];
  const chordStart = bar % cb === 0;
  const nextChordDeg = prog[Math.floor((bar + 1) / cb) % prog.length];

  const bassMidi = (cdeg, d) => {
    const base = degSemi(scale, cdeg);
    const shift = base > 7 ? -12 : 0;
    return tonic + shift + degSemi(scale, cdeg + d);
  };
  const melMidi = (deg, oct = 24) => tonic + oct + degSemi(scale, deg);

  // ---- deck filter / break filter / section automation
  let fTarget = sec.filterEnd ? lerp(sec.filter, sec.filterEnd, (bar + 1) / bars) : sec.filter;
  if (name === 'race' || name === 'drop' || name === 'bridge' || name === 'drop2') {
    fTarget *= lerp(0.35, 1, clamp01(I * 1.6));
  }
  if (isCountdown && info.countdown) {
    if (bar === 0) emit({ t: t0, type: 'filter', from: 900, to: 15000, end: info.countdown.dropAt, exp: true });
  } else {
    emit({ t: t0, type: 'filter', to: fTarget, end: t0 + barDur, start: bar === 0 && sec.filterEnd ? sec.filter : undefined });
  }
  emit({ t: t0, type: 'brkFilter', to: L.brkLP ? 1100 : 16000 });

  // ---- impacts / risers / swells
  if (sec.impact && bar === 0) {
    emit({ t: t0, type: 'impact', big: name !== 'victory' });
  }
  if (!isCountdown && nextName && DROP_SECTIONS.has(nextName)) {
    const R = Math.min(bars, name === 'lift' ? 1 : 4);
    if (bar === bars - R) emit({ t: t0, type: 'riser', dur: R * barDur, midi: tonic + 24 });
  }
  if (toDrop) emit({ t: t0 + barDur, type: 'swell' });
  if (isCountdown && info.countdown && bar === 0) {
    emit({ t: t0, type: 'riser', dur: Math.max(0.5, info.countdown.dropAt - t0), midi: tonic + 24 });
  }

  // ---- drums
  const preDropGap = toDrop; // last beat drops out before a drop
  if (isCountdown) {
    planCountdownDrums(info, st, sd, barDur, emit);
  } else if (L.halftime) {
    // half-time groove for menus / victory
    if (L.kick) {
      emit({ t: st(0), type: 'kick', g: 0.9 });
      if (bar % 2 === 1 || style === 'dnb') emit({ t: st(10), type: 'kick', g: 0.7 });
    }
    if (L.snare) {
      emit({ t: st(8), type: 'hit', s: style === 'garage' ? 'clap' : 'snare', g: 0.7, ch: 'snare' });
      if (style === 'garage') emit({ t: st(8), type: 'hit', s: 'rim', g: 0.3, ch: 'perc' });
    }
    if (L.hats) {
      for (let s = 0; s < 16; s += style === 'garage' ? 1 : 2) {
        const g = s % 4 === 2 ? 0.3 : s % 2 ? 0.12 : 0.18;
        emit({ t: st(s), type: 'hit', s: 'hat', g, ch: 'hats' });
      }
      if (bar % 2 === 1) emit({ t: st(14), type: 'hit', s: 'ohat', g: 0.2, ch: 'hats' });
    }
    if (L.ride) for (let s = 0; s < 16; s += 4) emit({ t: st(s), type: 'hit', s: 'ride', g: 0.25, ch: 'hats' });
    if (L.perc) for (const s of song.rimSteps) emit({ t: st(s), type: 'hit', s: 'rim', g: 0.22, ch: 'perc' });
    if (name === 'victory' && bar % 4 === 0) emit({ t: st(0), type: 'hit', s: 'crash', g: 0.5, ch: 'hats' });
  } else {
    if (L.kick) {
      let kicks = bar % 2 === 0 ? song.kickA : song.kickB;
      if (name === 'build' && bar < bars / 2 && style !== 'acid') kicks = [0, 8];
      for (const s of kicks) {
        if (preDropGap && s >= 12) continue;
        if (fill === 2 && s >= 12 && style !== 'acid') continue;
        emit({ t: st(s), type: 'kick', g: s === 0 ? 1 : 0.92 });
      }
    }
    if (L.snare) {
      for (const s of S.snares) {
        if ((preDropGap || fill === 2) && s === 12) continue;
        if (style === 'acid') emit({ t: st(s), type: 'hit', s: 'clap', g: 0.75, ch: 'snare' });
        else {
          emit({ t: st(s), type: 'hit', s: 'snare', g: style === 'dnb' ? 0.85 : 0.8, ch: 'snare' });
          if (style === 'garage') emit({ t: st(s), type: 'hit', s: 'clap', g: 0.5, ch: 'snare' });
        }
      }
    }
    // hats
    if (L.hats) {
      if (style === 'garage') {
        for (let s = 0; s < 16; s++) {
          if (s % 4 === 2) { if (L.ohat || name !== 'intro') emit({ t: st(s), type: 'hit', s: 'ohat', g: 0.26, ch: 'hats' }); }
          else if (s % 2 === 1) emit({ t: st(s), type: 'hit', s: 'hat', g: 0.28, ch: 'hats' });
          else if (L.hats16) emit({ t: st(s), type: 'hit', s: 'hat', g: 0.13, ch: 'hats' });
        }
      } else if (style === 'acid') {
        for (let s = 0; s < 16; s++) {
          if (s % 4 === 2) emit({ t: st(s), type: 'hit', s: 'ohat', g: 0.3, ch: 'hats' });
          else if (L.hats16 || s % 2 === 0) emit({ t: st(s), type: 'hit', s: 'hat', g: s % 4 === 0 ? 0.12 : 0.2, ch: 'hats' });
        }
      } else {
        // dnb / breaks: offbeat 8ths, 16th ghosts with intensity
        for (let s = 0; s < 16; s++) {
          if (s % 4 === 2) emit({ t: st(s), type: 'hit', s: 'hat', g: 0.3, ch: 'hats' });
          else if (L.hats16 && s % 2 === 1 && (style === 'breaks' || rng.chance(0.6))) emit({ t: st(s), type: 'hit', s: 'hat', g: 0.12, ch: 'hats' });
        }
        if (L.ohat && (bar % 2 === 1 || style === 'breaks')) emit({ t: st(style === 'breaks' ? 6 : 14), type: 'hit', s: 'ohat', g: 0.22, ch: 'hats' });
      }
    }
    if (L.ride) for (let s = 0; s < 16; s += 2) emit({ t: st(s), type: 'hit', s: 'ride', g: s % 4 === 0 ? 0.2 : 0.14, ch: 'hats' });
    if (L.perc) {
      if (style === 'garage') {
        for (const s of song.rimSteps) emit({ t: st(s), type: 'hit', s: 'rim', g: 0.3, ch: 'perc' });
        for (let s = 0; s < 16; s++) emit({ t: st(s), type: 'hit', s: 'shaker', g: s % 2 ? 0.14 : 0.08, ch: 'perc' });
      } else if (style === 'acid') {
        for (const s of [3, 11]) emit({ t: st(s), type: 'hit', s: 'rim', g: 0.2, ch: 'perc' });
      } else {
        for (let s = 1; s < 16; s += 2) emit({ t: st(s), type: 'hit', s: 'shaker', g: 0.09, ch: 'perc' });
      }
    }
    // crash at phrase starts of energetic sections
    if (bar % 8 === 0 && (DROP_SECTIONS.has(name) || name === 'bridge') && !sec.impact) {
      emit({ t: st(0), type: 'hit', s: 'crash', g: 0.38, ch: 'hats' });
    }
    if (bar === 8 && DROP_SECTIONS.has(name)) emit({ t: st(0), type: 'hit', s: 'crash', g: 0.38, ch: 'hats' });
    // programmed fills (only where the break isn't doing the fill)
    if ((fill === 2 || toDrop) && L.snare && (!L.brk || style === 'garage' || style === 'acid' || toDrop)) {
      const from = toDrop ? 8 : 12;
      for (let s = from; s < 16; s++) {
        const k = (s - from) / (16 - from);
        const sub = s >= 14 && toDrop ? 2 : 1;
        for (let j = 0; j < sub; j++) emit({ t: st(s) + (j * sd) / sub, type: 'hit', s: 'snare', g: 0.3 + 0.5 * k, ch: 'snare' });
      }
    } else if (fill === 1 && (style === 'breaks' || style === 'garage') && L.snare && rng.chance(0.6)) {
      emit({ t: st(13), type: 'hit', s: 'tomHi', g: 0.5, ch: 'perc' });
      emit({ t: st(14), type: 'hit', s: 'tomHi', g: 0.5, ch: 'perc', rate: 0.85 });
      emit({ t: st(15), type: 'hit', s: 'tomLo', g: 0.6, ch: 'perc' });
    }
  }

  // ---- breakbeat
  if (L.brk && !L.halftime && !isCountdown) {
    const level = S.breakLevel * (L.brkLP ? 0.9 : 1);
    const slices = chopBar(rng, info.globalBar, L.chop, fill, toDrop && L.chop > 0);
    for (const x of slices) {
      if (preDropGap && x.s >= 15 && !x.rev && x.src % 16 !== 12) continue;
      emit({ t: t0 + x.s * sd + (Number.isInteger(x.s) && x.s % 2 ? swingOff * 0.5 : 0), type: 'slice', src: x.src, len: x.len, rate: x.rate, rev: x.rev, g: x.g * level });
    }
  }

  // ---- bass
  if (L.bass && !isCountdown) {
    if (style === 'acid' && !L.halftime) {
      planAcid(deck, info, song.acid, chordDeg, bassMidi, st, sd, emit, I, name, bar, preDropGap, 'bass');
    } else if (L.halftime) {
      if (chordStart) emit({ t: st(0), type: 'bass', midi: bassMidi(chordDeg, 0), dur: barDur * cb - 0.05, cutoff: 160, env: 120 });
    } else {
      const riff = song.riff;
      const rl = song.riffLen;
      const off = (bar % (rl / 16)) * 16;
      const notes = riff.filter((n) => n.s >= off && n.s < off + 16);
      const beatHz = song.bpm / 60;
      for (let i = 0; i < notes.length; i++) {
        const n = notes[i];
        const s = n.s - off;
        if (preDropGap && s >= 12) continue;
        if (name === 'bridge' && s % 8 !== 0 && !n.sl) continue;
        const next = riff[(riff.indexOf(n) + 1) % riff.length];
        const hold = next && next.sl && next.s === n.s + n.l;
        let d = n.d;
        if (fill === 2 && s >= 12 && rng.chance(0.5)) d += 7;
        const cdeg = song.riffLen === 32 ? prog[Math.floor((bar - (bar % 2)) / cb) % prog.length] : chordDeg;
        emit({
          t: st(s), type: 'bass', midi: bassMidi(cdeg, d), dur: n.l * sd - (hold ? 0 : 0.012),
          slide: !!n.sl, hold, wob: n.w !== undefined ? (n.w ? n.w * beatHz : 0) : undefined,
          cutoff: name === 'build' || name === 'build2' ? 260 : undefined,
        });
      }
    }
  }
  if (L.sub && style === 'acid' && !L.halftime) {
    for (const s of [2, 6, 10, 14]) {
      if (preDropGap && s >= 12) continue;
      emit({ t: st(s), type: 'sub', midi: bassMidi(chordDeg, 0), dur: sd * 1.6 });
    }
  }
  if (L.acid2 && song.acid && style === 'breaks') {
    planAcid(deck, info, song.acid, chordDeg, (c, d) => bassMidi(c, d) + 12, st, sd, emit, I, name, bar, preDropGap, 'acid');
  }

  // ---- countdown bass pedal / pad
  if (isCountdown) {
    if (bar === 0) {
      const v = voiceChord(scale, tonic, chordDeg, 3, 62, null);
      const dur = Math.max(1, info.countdown.dropAt - t0);
      emit({ t: t0, type: 'pad', notes: v, dur, cutoff: 900, sweep: true, gain: 0.9 });
      emit({ t: t0, type: 'bass', midi: bassMidi(0, 0), dur, cutoff: 200, env: 100 });
    }
    return;
  }

  // ---- harmony layers
  const size = song.chordSize;
  if (L.pad && chordStart) {
    const v = voiceChord(scale, tonic, chordDeg, Math.min(size, 4), 61, deck.padVoicing);
    deck.padVoicing = v;
    emit({ t: t0, type: 'pad', notes: v, dur: barDur * cb + 0.05, cutoff: L.halftime ? 1300 : 1700, gain: 1 });
  }
  if (L.stab) {
    const v = voiceChord(scale, tonic, chordDeg, size, S.stab === 'organ' ? 64 : 67, deck.stabVoicing);
    deck.stabVoicing = v;
    const phrasePos = bar % 4;
    const dev = sec.dev || name === 'final';
    // call-and-response: stabs answer the lead (bars 0/2) unless the section is developing
    const play = S.stab === 'organ' || !L.lead || dev || phrasePos % 2 === 0;
    if (play) {
      let rh = song.stabRhythm;
      if (fill === 2) rh = rh.filter((s) => s < 12);
      for (const s of rh) {
        if (preDropGap && s >= 12) continue;
        const nv = s >= 12 && bar % cb === cb - 1 ? voiceChord(scale, tonic, nextChordDeg, size, 66, v) : v;
        emit({ t: st(s), type: 'stab', notes: nv, kind: S.stab });
      }
    }
  }
  if (L.arp) {
    const v = voiceChord(scale, tonic, chordDeg, 3, 72, null);
    const pat = song.arpPattern;
    const rate = name === 'break' || L.halftime ? 2 : song.arpRate;
    let k = 0;
    for (let s = 0; s < 16; s += rate) {
      if (preDropGap && s >= 12) break;
      const idx = pat[k % pat.length];
      const oct = Math.floor(k / pat.length) % 2 && I > 0.5 ? 12 : 0;
      emit({ t: st(s), type: 'arp', midi: v[idx % v.length] + oct + (idx >= v.length ? 12 : 0), wave: S.arp });
      k++;
    }
  }
  // melodic motif: call (bar 1 of 2-bar phrase) + response (bar 2)
  const motifOn = L.lead || L.vox;
  if (motifOn) {
    const phrasePos = bar % 4;
    const dev = sec.dev;
    let notes = null;
    const useVox = L.vox && S.lead === 'vox';
    const M = useVox ? song.vox : song.motif;
    if (name === 'break' || name === 'victory') {
      // augmentation: the motif at half speed over two bars
      const src = phrasePos < 2 ? song.motif.call : song.motif.resp;
      const half = phrasePos % 2;
      notes = src.map((n) => ({ ...n, s: n.s * 2 - half * 16, l: n.l * 2 })).filter((n) => n.s >= 0 && n.s < 16);
    } else if (dev) {
      notes = [M.call, M.resp, song.motif.inv, M.resp][phrasePos];
    } else if (phrasePos === 1) notes = M.call;
    else if (phrasePos === 3) notes = M.resp;
    if (notes) {
      for (const n of notes) {
        if (preDropGap && n.s >= 12) continue;
        let d = n.d;
        if (n.s % 4 === 0 || n.l >= 4) d = snapToChord(d, chordDeg, 3);
        const dur = Math.max(sd * 0.8, n.l * sd - 0.01);
        if (useVox) {
          emit({ t: st(n.s), type: 'vox', midi: melMidi(d, 24), dur: Math.min(dur, sd * 2), v1: n.v1 || 'a', v2: n.v2 || 'o' });
        } else {
          const kind = S.lead === 'vox' ? 'square' : S.lead;
          emit({ t: st(n.s), type: 'lead', midi: melMidi(d, kind === 'hoover' ? 12 : 24), dur, kind });
          if (sec.final && kind !== 'hoover') emit({ t: st(n.s), type: 'lead', midi: melMidi(d, 36), dur, kind, gain: 0.4 });
        }
      }
    }
  }
}

function planAcid(deck, info, acid, chordDeg, bassMidi, st, sd, emit, I, name, bar, gap, type) {
  const pat = bar % 4 === 3 ? acid.B : acid.A;
  // the "knob": cutoff slowly swept by hand across 16-bar cycles, opened up by energy
  const cyc = 0.5 - 0.5 * Math.cos((2 * Math.PI * info.globalBar) / 16);
  const sec = SECTIONS[name] || SECTIONS.drop;
  let base = 140 + (250 + 1700 * cyc) * (0.35 + 0.65 * sec.energy) * (0.5 + 0.5 * I);
  if (name === 'intro') base *= 0.5 + 0.5 * (info.bar / info.bars);
  if (name === 'final') base *= 1.4;
  const envAmt = 900 + 1800 * cyc * I;
  for (let s = 0; s < 16; s++) {
    const p = pat[s];
    if (!p.gate) continue;
    if (gap && s >= 12) continue;
    const nx = pat[(s + 1) % 16];
    const hold = nx.gate && nx.sl && s < 15;
    emit({
      t: st(s), type, midi: bassMidi(chordDeg, p.d) + 12, dur: hold ? sd : sd * 0.55,
      slide: p.sl, hold, accent: p.acc, cutoff: base, env: envAmt, decay: 0.09 + 0.12 * (1 - cyc),
    });
  }
}

function planCountdownDrums(info, st, sd, barDur, emit) {
  const cd = info.countdown;
  const total = Math.max(0.5, cd.dropAt - cd.start);
  for (let s = 0; s < 16; s++) {
    const t = st(s);
    const frac = clamp01((t - cd.start) / total);
    const every = frac < 0.35 ? 4 : frac < 0.65 ? 2 : 1;
    if (s % 4 === 0 && frac < 0.88) emit({ t, type: 'kick', g: 0.75 + 0.2 * frac });
    if (s % every === 0) {
      const sub = frac > 0.85 ? 2 : 1;
      for (let j = 0; j < sub; j++) {
        const tt = t + (j * sd) / sub;
        emit({ t: tt, type: 'hit', s: 'snare', g: 0.25 + 0.6 * frac, ch: 'snare', rate: 1 + 0.25 * frac });
      }
    }
    if (s % 2 === 0) emit({ t, type: 'hit', s: 'hat', g: 0.15 + 0.15 * frac, ch: 'hats' });
  }
}
