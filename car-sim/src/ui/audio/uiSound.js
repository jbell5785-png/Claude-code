// Punchy synthesized UI blips (menu hover/confirm, start lights). Silent until audio is started.
let ac = null, out = null;

function blip(freqs, dur = 0.08, type = 'square', vol = 0.06, slide = 0) {
  if (!ac || ac.state !== 'running') return;
  const t = ac.currentTime; const g = ac.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 4500; g.connect(f).connect(out);
  freqs.forEach((fr, i) => {
    const o = ac.createOscillator(); o.type = type; o.frequency.setValueAtTime(fr, t + i * dur * 0.5);
    if (slide) o.frequency.exponentialRampToValueAtTime(fr * slide, t + i * dur * 0.5 + dur);
    o.connect(g); o.start(t + i * dur * 0.5); o.stop(t + i * dur * 0.5 + dur + 0.02);
  });
}

/** uiSound('hover' | 'click' | 'confirm' | 'back' | 'light' | 'go') */
export function uiSound(kind) {
  switch (kind) {
    case 'hover': return blip([1760], 0.04, 'triangle', 0.025);
    case 'click': return blip([1320], 0.05, 'square', 0.03);
    case 'confirm': return blip([880, 1320], 0.09, 'sawtooth', 0.04, 1.06);
    case 'back': return blip([660, 440], 0.08, 'square', 0.035);
    case 'light': return blip([660], 0.25, 'sine', 0.06);
    case 'go': return blip([1320, 1760], 0.3, 'sine', 0.07);
    default: return undefined;
  }
}
uiSound.attach = (ctx, dest) => { ac = ctx; out = dest; };
