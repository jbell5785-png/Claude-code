// Master bus: glue compressor -> limiter -> soft clipper -> volume, plus a shared convolution
// reverb (generated impulse) and a separate (uncompressed) path for the user's own tracks.
import { sharedBuffers } from './kit.js';
import { softClipCurve } from './dsp.js';

/**
 * @param {BaseAudioContext} ctx
 * @param {AudioNode} destination
 */
export function createMaster(ctx, destination, bypass = false) {
  const input = ctx.createGain();
  input.gain.value = 1;

  const glue = ctx.createDynamicsCompressor();
  glue.threshold.value = -18;
  glue.knee.value = 8;
  glue.ratio.value = 2.5;
  glue.attack.value = 0.02;
  glue.release.value = 0.2;

  const makeup = ctx.createGain();
  makeup.gain.value = 1.5;

  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -3;
  limiter.knee.value = 0;
  limiter.ratio.value = 20;
  limiter.attack.value = 0.001;
  limiter.release.value = 0.1;

  const clip = ctx.createWaveShaper();
  clip.curve = softClipCurve(0.86);
  clip.oversample = '2x';

  // menu / pause filter applied to everything (generated + user tracks)
  const menuLP = ctx.createBiquadFilter();
  menuLP.type = 'lowpass';
  menuLP.frequency.value = 20000;
  menuLP.Q.value = 0.5;

  const volume = ctx.createGain();
  volume.gain.value = 0.8;

  if (bypass) input.connect(menuLP);
  else input.connect(glue).connect(makeup).connect(limiter).connect(clip).connect(menuLP);
  menuLP.connect(volume).connect(destination);

  // shared reverb
  const { ir } = sharedBuffers(ctx);
  const reverbIn = ctx.createGain();
  const revHP = ctx.createBiquadFilter();
  revHP.type = 'highpass';
  revHP.frequency.value = 280;
  const conv = ctx.createConvolver();
  conv.normalize = false;
  conv.buffer = ir;
  const reverbOut = ctx.createGain();
  reverbOut.gain.value = 0.9;
  reverbIn.connect(revHP).connect(conv).connect(reverbOut).connect(input);

  // user tracks bypass the compressor but share the menu filter & volume
  const userIn = ctx.createGain();
  userIn.gain.value = 0.9;
  userIn.connect(menuLP);

  return {
    input, reverbIn, userIn, volume, menuLP, glue, limiter,
    setVolume(v, t = ctx.currentTime) {
      const g = Math.max(0, Math.min(1, v));
      volume.gain.setTargetAtTime(g * g * 1.0 + 0.0, t, 0.05);
    },
    setMenuFilter(on, t = ctx.currentTime) {
      menuLP.frequency.cancelScheduledValues(t);
      menuLP.frequency.setTargetAtTime(on ? 2200 : 20000, t, on ? 0.4 : 0.25);
    },
  };
}

/** Tempo-synced ping-pong delay (per deck). Returns { input, output, setTempo }. */
export function createDelay(ctx, bpm) {
  const input = ctx.createGain();
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 400;
  const dL = ctx.createDelay(2);
  const dR = ctx.createDelay(2);
  const fb = ctx.createGain();
  fb.gain.value = 0.38;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 3200;
  const merger = ctx.createChannelMerger(2);
  const output = ctx.createGain();
  output.gain.value = 0.6;
  input.connect(hp).connect(dL);
  dL.connect(dR);
  dR.connect(lp).connect(fb).connect(dL);
  dL.connect(merger, 0, 0);
  dR.connect(merger, 0, 1);
  merger.connect(output);
  const t = (60 / bpm) * 0.75; // dotted eighth
  dL.delayTime.value = t;
  dR.delayTime.value = t;
  return { input, output, nodes: [input, hp, dL, dR, fb, lp, merger, output] };
}
