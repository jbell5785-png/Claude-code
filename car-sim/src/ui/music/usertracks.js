// Plays the user's own audio files (MP3/OGG/WAV/M4A...) with shuffle and crossfades.
// Files are decoded lazily (current + next) to keep memory low on phones.

const XFADE = 2.0;

export class UserTracks {
  /**
   * @param {BaseAudioContext} ctx
   * @param {AudioNode} dest
   * @param {(info:object)=>void} onChange
   */
  constructor(ctx, dest, onChange) {
    this.ctx = ctx;
    this.dest = dest;
    this.onChange = onChange;
    this.files = [];
    this.order = [];
    this.pos = -1;
    this.current = null; // { title, src, gain, buffer }
    this.timer = null;
    this.cache = new Map(); // file index -> Promise<AudioBuffer|null>
    this.token = 0;
  }

  /** @param {FileList|File[]} fileList @returns {Promise<number>} number of usable files */
  async load(fileList) {
    const files = Array.from(fileList || []).filter((f) => !f.type || f.type.startsWith('audio/') || /\.(mp3|ogg|oga|opus|wav|m4a|aac|flac|webm)$/i.test(f.name));
    if (!files.length) return 0;
    this.stop();
    this.files = files;
    this.cache.clear();
    this.order = this.shuffle(files.map((_, i) => i));
    this.pos = -1;
    return files.length;
  }

  shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  decode(idx) {
    if (this.cache.has(idx)) return this.cache.get(idx);
    const f = this.files[idx];
    const p = f.arrayBuffer()
      .then((ab) => new Promise((res, rej) => {
        // callback form for older Safari, promise form elsewhere
        const r = this.ctx.decodeAudioData(ab, res, rej);
        if (r && r.then) r.then(res, rej);
      }))
      .catch((e) => { console.warn('[music] could not decode', f.name, e); return null; });
    this.cache.set(idx, p);
    return p;
  }

  title(idx) {
    return this.files[idx].name.replace(/\.[^.]+$/, '').replace(/[_]+/g, ' ');
  }

  /** Advance to the next track (crossfading the current one out). */
  async play() {
    if (!this.files.length) return;
    const token = ++this.token;
    clearTimeout(this.timer);
    let tries = 0;
    let buffer = null;
    let idx;
    while (!buffer && tries < this.files.length) {
      this.pos++;
      if (this.pos >= this.order.length) {
        this.order = this.shuffle(this.order);
        this.pos = 0;
      }
      idx = this.order[this.pos];
      buffer = await this.decode(idx);
      tries++;
      if (token !== this.token) return; // superseded
    }
    if (!buffer) return;
    // drop old cache entries, prefetch the next track
    for (const k of this.cache.keys()) if (k !== idx) this.cache.delete(k);
    const nextIdx = this.order[(this.pos + 1) % this.order.length];
    if (nextIdx !== undefined && this.files.length > 1) this.decode(nextIdx);

    const ctx = this.ctx;
    const t = ctx.currentTime + 0.05;
    const old = this.current;
    if (old) this.fadeOut(old, t, XFADE);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(1, t + (old ? XFADE : 0.3));
    src.connect(gain).connect(this.dest);
    src.start(t);
    this.current = { title: this.title(idx), src, gain, buffer };
    this.onChange && this.onChange();
    const wait = Math.max(1, buffer.duration - XFADE - 0.2);
    this.timer = setTimeout(() => { if (token === this.token) this.play(); }, wait * 1000);
  }

  fadeOut(cur, t, dur) {
    try {
      cur.gain.gain.cancelScheduledValues(t);
      cur.gain.gain.setValueAtTime(cur.gain.gain.value, t);
      cur.gain.gain.linearRampToValueAtTime(0, t + dur);
      cur.src.stop(t + dur + 0.05);
      cur.src.onended = () => cur.gain.disconnect();
    } catch (_) { /* noop */ }
  }

  next() {
    this.play();
  }

  stop() {
    this.token++;
    clearTimeout(this.timer);
    if (this.current) this.fadeOut(this.current, this.ctx.currentTime, 0.4);
    this.current = null;
  }
}
