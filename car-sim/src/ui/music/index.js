// Procedural racing-game soundtrack: public API.
//
//   const music = createMusicPlayer({ audioContext, destination });
//   button.onclick = () => music.start();            // must be inside a user gesture
//   music.setRaceState('countdown', { dropIn: 3 });  // riser, drop lands exactly 3 s later
//   music.cueDrop();                                 // ...or call this on the green light
//   music.setIntensity(speed / topSpeed);
//
// Everything is synthesised with the Web Audio API (no samples). Works with any
// BaseAudioContext, including OfflineAudioContext (see scripts/render-music.js).
import { MusicEngine, RACE_STATES } from './engine.js';
import { STYLE_KEYS, STYLES } from './styles.js';
import { generateSong } from './composer.js';

export { mountMusicWidget } from './widget.js';
export { generateSong, STYLE_KEYS, STYLES, RACE_STATES };

/**
 * @typedef {{ title:string, style:string, bpm:number, user:boolean, key?:string, styleLabel?:string }} NowPlaying
 */

/**
 * Create the music player. Nothing is created or played until `start()` (call it from a
 * user-gesture handler). Pass the game's existing AudioContext to share it.
 * @param {{ audioContext?: BaseAudioContext, destination?: AudioNode, seed?: number,
 *   style?: 'auto'|'dnb'|'breaks'|'garage'|'acid', volume?: number, startSection?: string }} [opts]
 */
export function createMusicPlayer(opts = {}) {
  let ctx = opts.audioContext || null;
  let engine = null;
  const settings = { volume: opts.volume ?? 0.8, style: opts.style || 'auto', intensity: 0.7, raceState: null };
  const pendingListeners = new Set();

  function ensure() {
    if (engine) return engine;
    if (!ctx) {
      const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
      if (!AC) throw new Error('Web Audio is not available');
      ctx = new AC({ latencyHint: 'playback' });
    }
    engine = new MusicEngine(ctx, opts.destination || ctx.destination, {
      seed: opts.seed, style: settings.style, volume: settings.volume, startSection: opts.startSection,
      mix: opts.mix, bypassMaster: opts.bypassMaster,
    });
    engine.intensity = settings.intensity;
    engine.raceState = settings.raceState;
    for (const cb of pendingListeners) engine.onTrackChange(cb);
    return engine;
  }

  const player = {
    /** Start playback. Call from a user gesture (click/tap/key). Returns a Promise. */
    start() { return ensure().start(); },
    /** Fade out and stop. */
    stop() { if (engine) engine.stop(); },
    /** Skip to the next song (generated) or next user track. */
    next() { if (engine) engine.next(); },
    /** Master music volume 0..1. */
    setVolume(v) { settings.volume = v; if (engine) engine.setVolume(v); },
    /** 'auto' rotates styles; otherwise 'dnb' | 'breaks' | 'garage' | 'acid'. */
    setStyle(s) { settings.style = s; if (engine) engine.setStyle(s); },
    /** Race intensity 0..1 (e.g. speed, closeness of rivals). Layers change on bar boundaries. */
    setIntensity(x) { settings.intensity = x; if (engine) engine.setIntensity(x); },
    /**
     * 'menu' | 'countdown' | 'racing' | 'finalLap' | 'finished'.
     * For 'countdown' pass { dropIn: seconds } to land the drop exactly on the green light.
     */
    setRaceState(s, o) { settings.raceState = s; if (engine) engine.setRaceState(s, o); },
    /** Drop now (or at AudioContext time `when`). */
    cueDrop(when) { if (engine) engine.cueDrop(when); },
    /** Play the user's own files (FileList or File[]) instead of the generator. Resolves to count. */
    loadUserTracks(files) { return ensure().loadUserTracks(files); },
    /** Switch back from user files to generated music. */
    useGenerated() { if (engine) engine.useGenerated(); },
    /** @returns {NowPlaying|null} */
    get nowPlaying() { return engine ? engine.nowPlaying : null; },
    /** Subscribe to track changes; returns an unsubscribe function. */
    onTrackChange(cb) {
      if (engine) return engine.onTrackChange(cb);
      pendingListeners.add(cb);
      return () => { pendingListeners.delete(cb); if (engine) engine.listeners.delete(cb); };
    },
    get playing() { return !!(engine && engine.playing); },
    get style() { return settings.style; },
    get volume() { return settings.volume; },
    get audioContext() { return ctx; },
    /** The music output node's volume stage (e.g. to attach an analyser). */
    get output() { return engine ? engine.master.volume : null; },
    /** OfflineAudioContext only: schedule everything up to time t (seconds). */
    scheduleUntil(t) { ensure().scheduleUntil(t); },
  };
  return player;
}
