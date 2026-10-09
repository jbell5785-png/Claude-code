// Music engine: look-ahead scheduler, playlist / crossfades, race-state adaptation.
// Works with any BaseAudioContext (AudioContext or OfflineAudioContext).
import { createMaster } from './fx.js';
import { Deck } from './deck.js';
import { generateSong } from './composer.js';
import { STYLE_KEYS } from './styles.js';
import { hashSeed } from './rng.js';
import { UserTracks } from './usertracks.js';

const LOOKAHEAD = 0.12; // s of audio scheduled ahead of currentTime
const TICK_MS = 25;
const MAX_OSC = 44; // voice budget (oscillators in one-shot voices)

export const RACE_STATES = ['menu', 'countdown', 'racing', 'finalLap', 'finished'];

function isOffline(ctx) {
  return typeof OfflineAudioContext !== 'undefined' && ctx instanceof OfflineAudioContext;
}

export class MusicEngine {
  /**
   * @param {BaseAudioContext} ctx
   * @param {AudioNode} destination
   * @param {{seed?:number, style?:string, volume?:number, startSection?:string}} opts
   */
  constructor(ctx, destination, opts = {}) {
    this.ctx = ctx;
    this.offline = isOffline(ctx);
    this.master = createMaster(ctx, destination || ctx.destination, opts.bypassMaster);
    this.mix = opts.mix || null; // per-channel gain multipliers (debug / stems)
    this.master.volume.gain.value = Math.pow(opts.volume ?? 0.8, 2);
    this.decks = [];
    this.main = null;
    this.style = opts.style || 'auto';
    this.seed = opts.seed ?? Math.floor(Math.random() * 1e9);
    this.songIndex = 0;
    this.intensity = 0.7;
    this.raceState = null; // null = radio/free mode until the game sets one
    this.playing = false;
    this.listeners = new Set();
    this.simTime = 0;
    this.timer = null;
    this.lastTick = 0;
    this.lookahead = LOOKAHEAD;
    this.activeOsc = 0;
    this.pendingDropAt = null;
    this.startSection = opts.startSection || null;
    this.lastStyle = null;
    this.user = new UserTracks(ctx, this.master.userIn, (info) => this.emitChange(info));
    this.mode = 'gen'; // 'gen' | 'user'
    this.voiceEnd = (v) => { this.activeOsc -= v.oscCount || 0; };
  }

  now() {
    return this.offline ? this.simTime : this.ctx.currentTime;
  }

  // ------------------------------------------------------------------ voice budget
  voiceBudget(n, prio) {
    const limit = prio > 0 ? MAX_OSC : MAX_OSC * 0.75;
    return this.activeOsc + n <= limit;
  }

  countVoice(v) {
    this.activeOsc += v.oscCount || 0;
    return v;
  }

  // ------------------------------------------------------------------ songs
  pickStyle() {
    if (this.style !== 'auto' && STYLE_KEYS.includes(this.style)) return this.style;
    // rotate through styles without immediate repeats
    const choices = STYLE_KEYS.filter((s) => s !== this.lastStyle);
    return choices[hashSeed(this.seed + ':' + this.songIndex) % choices.length];
  }

  makeSong() {
    const style = this.pickStyle();
    this.lastStyle = style;
    const seed = hashSeed(`${this.seed}/${this.songIndex++}/${style}`);
    return generateSong(seed, style);
  }

  modeForState() {
    switch (this.raceState) {
      case 'menu': return 'chill';
      case 'countdown': return 'countdown';
      case 'racing': return 'raceIn';
      case 'finalLap': return 'final';
      case 'finished': return 'victory';
      default: return 'free';
    }
  }

  /** Start a new deck at time t, crossfading the current one out over xf seconds. */
  newDeck(mode, t, xf = 3) {
    const song = this.makeSong();
    const deck = new Deck(this, song, mode, t);
    if (this.startSection && mode === 'free') {
      const i = deck.sections.findIndex((s) => s.name === this.startSection);
      if (i > 0) deck.sections = deck.sections.slice(i);
      this.startSection = null;
    }
    const old = this.main;
    if (old) {
      old.fade(t, 1, 0, xf);
      old.dispose(t + xf);
    }
    deck.fade(t, old ? 0 : 1, 1, old ? xf : 0.02);
    this.decks.push(deck);
    this.main = deck;
    this.emitChange();
    return deck;
  }

  /** Called by a deck two bars before its arrangement ends: crossfade into the next song. */
  onDeckNearEnd(deck, t) {
    if (deck !== this.main || this.mode !== 'gen') return;
    const mode = deck.mode === 'race' || deck.mode === 'raceIn' ? 'raceIn' : deck.mode;
    this.newDeck(mode, t, deck.barDur * 2);
  }

  effectiveIntensity(deck) {
    let i = this.intensity;
    if (deck.mode === 'final') i = Math.max(0.85, i);
    if (this.raceState == null) i = Math.max(i, 0.6);
    return i;
  }

  // ------------------------------------------------------------------ transport
  start() {
    if (this.playing) return Promise.resolve();
    this.playing = true;
    const go = () => {
      const t = this.now() + 0.06;
      this.master.volume.gain.cancelScheduledValues(t);
      if (this.mode === 'user') this.user.play();
      else this.newDeck(this.modeForState(), t, 0.5);
      if (!this.offline) {
        this.lastTick = performance.now();
        this.timer = setInterval(() => this.tick(), TICK_MS);
        this.onVis = () => this.tick();
        if (typeof document !== 'undefined') document.addEventListener('visibilitychange', this.onVis);
      }
      this.tick();
    };
    if (!this.offline && this.ctx.state !== 'running' && this.ctx.resume) {
      // must be called from a user gesture handler
      const p = this.ctx.resume();
      go();
      return p;
    }
    go();
    return Promise.resolve();
  }

  stop() {
    if (!this.playing) return;
    this.playing = false;
    const t = this.now();
    for (const d of this.decks) {
      d.fade(t, d.out.gain.value, 0, 0.4);
      d.dispose(t + 0.45);
    }
    this.main = null;
    this.user.stop();
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    if (this.onVis && typeof document !== 'undefined') document.removeEventListener('visibilitychange', this.onVis);
    // let the tails finish, then free the decks
    const decks = this.decks.slice();
    this.decks = [];
    setTimeout(() => decks.forEach((d) => d.disconnect()), 1500);
  }

  tick() {
    if (!this.playing) return;
    const now = this.now();
    if (!this.offline) {
      // adapt look-ahead to timer jitter (background tabs throttle timers to ~1 s)
      const p = performance.now();
      const gap = (p - this.lastTick) / 1000;
      this.lastTick = p;
      const hidden = typeof document !== 'undefined' && document.hidden;
      this.lookahead = Math.min(hidden ? 1.6 : 0.6, Math.max(LOOKAHEAD, gap * 1.5 + 0.03));
    }
    if (this.pendingDropAt !== null && now + this.lookahead >= this.pendingDropAt) {
      const at = this.pendingDropAt;
      this.pendingDropAt = null;
      this.cueDrop(at);
    }
    const horizon = now + this.lookahead;
    for (const d of this.decks) d.pump(now, horizon);
    // retire decks that have faded out
    if (this.decks.length > 1 || (this.decks[0] && this.decks[0].ended)) {
      this.decks = this.decks.filter((d) => {
        const done = (d.endAt + 2 < now) || (d.ended && d !== this.main && d.nextBarTime + 3 < now);
        if (done) d.disconnect();
        return !done;
      });
      if (this.main && this.main.ended && this.mode === 'gen') {
        // arrangement ran out without a handoff (shouldn't happen) - start another song
        this.newDeck(this.modeForState(), Math.max(now + 0.05, this.main.nextBarTime), 1);
      }
    }
  }

  /** Offline rendering: advance simulated time, scheduling everything up to `t`. */
  scheduleUntil(t) {
    while (this.simTime < t) {
      this.simTime = Math.min(t, this.simTime + TICK_MS / 1000);
      this.tick();
    }
  }

  // ------------------------------------------------------------------ public controls
  setVolume(v) {
    this.master.setVolume(v, this.now());
  }

  setIntensity(x) {
    this.intensity = Math.max(0, Math.min(1, +x || 0));
  }

  setStyle(s) {
    const prev = this.style;
    this.style = s === 'auto' || STYLE_KEYS.includes(s) ? s : 'auto';
    if (this.playing && this.mode === 'gen' && this.style !== 'auto' && this.style !== prev &&
        this.main && this.main.song.style !== this.style && this.main.mode !== 'countdown') {
      this.next();
    }
  }

  next() {
    if (!this.playing) return;
    if (this.mode === 'user') { this.user.next(); return; }
    const cur = this.main;
    const t = cur ? Math.max(this.now() + 0.05, Math.min(cur.nextBarTime, this.now() + cur.barDur)) : this.now() + 0.05;
    let mode = cur ? cur.mode : this.modeForState();
    if (mode === 'race' || mode === 'raceIn') mode = 'raceIn';
    if (mode === 'free') mode = 'free';
    this.newDeck(mode, t, 2.5);
  }

  setRaceState(state, opts = {}) {
    if (!RACE_STATES.includes(state)) return;
    const prev = this.raceState;
    this.raceState = state;
    const now = this.now();
    this.master.setMenuFilter(state === 'menu' && this.mode === 'user', now);
    if (!this.playing || this.mode === 'user') return;
    const deck = this.main;
    switch (state) {
      case 'menu':
        if (deck && deck.mode !== 'chill' && deck.mode !== 'victory') deck.requestMode('chill');
        break;
      case 'countdown': {
        // a fresh song for every race: build-up with a riser timed to the green light
        const t = now + 0.05;
        const dropIn = opts.dropIn ?? opts.duration ?? null;
        const d = this.newDeck('countdown', t, 0.8);
        const dropAt = dropIn ? t + dropIn : t + d.barDur * 2;
        d.countdown = { start: t, dropAt };
        this.pendingDropAt = dropIn ? dropAt : null;
        break;
      }
      case 'racing':
        if (deck && deck.mode === 'countdown') this.cueDrop();
        else if (deck && deck.mode !== 'race' && deck.mode !== 'raceIn') deck.requestMode(prev === 'finalLap' ? 'race' : 'raceIn');
        break;
      case 'finalLap':
        if (deck && deck.mode === 'countdown') this.cueDrop();
        if (this.main && this.main.mode !== 'final') this.main.requestMode('final');
        break;
      case 'finished':
        if (deck) deck.requestMode('victory');
        break;
      default:
        break;
    }
    this.tick();
  }

  /**
   * The drop: re-anchors the current song so its drop lands exactly at `when`
   * (AudioContext time, default now). Call on the green light.
   */
  cueDrop(when) {
    if (!this.playing || this.mode === 'user') return;
    const now = this.now();
    const t = Math.max(now, when ?? now);
    this.pendingDropAt = null;
    let deck = this.main;
    if (!deck) deck = this.newDeck('race', t, 0.1);
    const mode = this.raceState === 'finalLap' ? 'final' : this.raceState == null || this.raceState === 'menu' ? 'dropNow' : 'race';
    if (this.raceState === 'countdown') this.raceState = 'racing';
    deck.reanchor(t, mode);
    deck.fade(t, deck.out.gain.value || 1, 1, 0.01);
    if (mode === 'final') deck.transpose = deck.song.finalTranspose;
    this.tick();
  }

  async loadUserTracks(files) {
    const n = await this.user.load(files);
    if (!n) return 0;
    this.mode = 'user';
    if (this.playing) {
      const t = this.now();
      for (const d of this.decks) {
        d.fade(t, d.out.gain.value, 0, 1.5);
        d.dispose(t + 1.6);
      }
      this.main = null;
      this.user.play();
    }
    return n;
  }

  useGenerated() {
    if (this.mode === 'gen') return;
    this.mode = 'gen';
    this.user.stop();
    if (this.playing) this.newDeck(this.modeForState(), this.now() + 0.05, 1);
  }

  get nowPlaying() {
    if (this.mode === 'user') {
      const u = this.user.current;
      return { title: u ? u.title : 'Loading…', style: 'user', bpm: 0, user: true };
    }
    if (!this.main) return null;
    const s = this.main.song;
    return { title: s.title, style: s.style, bpm: s.bpm, user: false, key: s.keyName, styleLabel: s.styleLabel, seed: s.seed };
  }

  onTrackChange(cb) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  emitChange() {
    const np = this.nowPlaying;
    for (const cb of this.listeners) {
      try { cb(np); } catch (e) { console.error(e); }
    }
  }
}
