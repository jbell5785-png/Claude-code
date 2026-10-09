// Driver input: keyboard (analogue-ish, speed-sensitive steering), gamepad (standard mapping) and
// on-screen touch controls for phones. Produces §5 controls objects.
const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
const approach = (x, target, rate) => (x < target ? Math.min(target, x + rate) : Math.max(target, x - rate));

export const KEY_HELP = [
  ['W / ↑', 'Throttle'], ['S / ↓', 'Brake / reverse'], ['A D / ← →', 'Steer'], ['Space', 'Handbrake'],
  ['Left Shift', 'Nitrous'], ['E', 'Shift up'], ['Q', 'Shift down'], ['M', 'Auto / manual gears'], ['C', 'Cycle camera'],
  ['R', 'Reset car'], ['T', 'Telemetry'], ['V', 'Spectate next car (race)'], ['N', 'Mute audio'], ['P', 'Pause'], ['H', 'Help'],
];

export class Input {
  constructor(root) {
    this.keys = new Set(); this.actions = new Map(); this.enabled = true;
    this.c = { steer: 0, throttle: 0, brake: 0, handbrake: 0, shiftUp: false, shiftDown: false, gearMode: 'auto', nitrous: false };
    this.touch = { steer: 0, throttle: 0, brake: 0, handbrake: 0, up: false, down: false, nos: false, active: false };
    this.pad = null; this.padPrev = []; this.source = 'keyboard';
    this.autoReverse = true;
    window.addEventListener('keydown', (e) => this._key(e, true));
    window.addEventListener('keyup', (e) => this._key(e, false));
    window.addEventListener('blur', () => this.keys.clear());
    this.root = root; this._buildTouch(root);
  }
  /** Register an action callback: 'camera' | 'reset' | 'gearMode' | 'telemetry' | 'spectate' | 'mute' | 'pause' | 'help'. */
  on(name, fn) { this.actions.set(name, fn); }
  _fire(name) { const f = this.actions.get(name); if (f) f(); }
  _key(e, down) {
    const t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA')) return;
    const k = e.code;
    if (down && !e.repeat) {
      const map = { KeyC: 'camera', KeyR: 'reset', KeyM: 'gearMode', KeyT: 'telemetry', KeyV: 'spectate', KeyN: 'mute', KeyP: 'pause', KeyH: 'help' };
      if (map[k]) { this._fire(map[k]); if (map[k] === 'gearMode') this.c.gearMode = this.c.gearMode === 'auto' ? 'manual' : 'auto'; }
    }
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(k) && this.enabled) e.preventDefault();
    if (down) { this.keys.add(k); this.source = 'keyboard'; } else this.keys.delete(k);
  }
  has(...ks) { for (const k of ks) if (this.keys.has(k)) return true; return false; }

  /**
   * Update and return controls.
   * @param {number} dt real frame time
   * @param {object} v vehicle (for speed-sensitive steering / auto reverse)
   */
  update(dt, v) {
    const c = this.c; const speed = v ? Math.abs(v.speed) : 0; const fwd = v ? v.speed : 0;
    // ---- gamepad
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    let pad = null; for (const p of pads) if (p && p.connected) { pad = p; break; }
    let padSteer = 0, padThr = 0, padBrk = 0, padHb = 0, padUp = false, padDown = false, padNos = false;
    if (pad) {
      const b = (i) => (pad.buttons[i] ? pad.buttons[i].value || (pad.buttons[i].pressed ? 1 : 0) : 0);
      const ax = pad.axes[0] || 0; padSteer = Math.abs(ax) < 0.08 ? 0 : -Math.sign(ax) * Math.pow((Math.abs(ax) - 0.08) / 0.92, 1.4);
      padThr = b(7); padBrk = b(6); padHb = b(1) || b(0) ? 1 : 0; padNos = b(2) > 0.5; padUp = b(5) > 0.5; padDown = b(4) > 0.5;
      const edge = (i) => b(i) > 0.5 && !this.padPrev[i];
      if (edge(3)) this._fire('camera'); if (edge(8)) this._fire('reset'); if (edge(10)) { this.c.gearMode = this.c.gearMode === 'auto' ? 'manual' : 'auto'; this._fire('gearMode'); }
      if (edge(9)) this._fire('pause'); if (edge(12)) this._fire('telemetry');
      this.padPrev = pad.buttons.map((x) => x.pressed);
      if (padThr > 0.05 || padBrk > 0.05 || Math.abs(padSteer) > 0.05) this.source = 'gamepad';
    }
    if (this.touch.active && (this.touch.throttle || this.touch.brake || this.touch.steer)) this.source = 'touch';

    // ---- keyboard target values
    const kl = this.has('KeyA', 'ArrowLeft'), kr = this.has('KeyD', 'ArrowRight');
    const kThr = this.has('KeyW', 'ArrowUp') ? 1 : 0, kBrk = this.has('KeyS', 'ArrowDown') ? 1 : 0;
    const kHb = this.has('Space') ? 1 : 0;
    const steerLimit = clamp(1 / (1 + Math.pow(speed / 20, 1.35)), 0.16, 1);
    const kTarget = (kl ? 1 : 0) - (kr ? 1 : 0);
    const steerRate = (2.6 / (1 + speed / 30)) * dt; const centreRate = 4.5 * dt;

    let steer, thr, brk, hb;
    if (this.source === 'gamepad') { steer = padSteer * clamp(steerLimit * 1.6, 0.3, 1); thr = padThr; brk = padBrk; hb = padHb; c.steer = steer; }
    else if (this.source === 'touch') {
      c.steer = approach(c.steer, this.touch.steer * clamp(steerLimit * 1.3, 0.25, 1), 4 * dt); steer = c.steer;
      thr = this.touch.throttle; brk = this.touch.brake; hb = this.touch.handbrake;
    } else {
      const target = kTarget * steerLimit;
      const rate = kTarget === 0 || Math.sign(target) !== Math.sign(c.steer) ? centreRate + steerRate : steerRate;
      c.steer = approach(c.steer, target, rate); steer = c.steer;
      thr = kThr; brk = kBrk; hb = kHb;
    }
    // smooth pedals a little (keyboard)
    if (this.source === 'keyboard') { this._thr = approach(this._thr || 0, thr, (thr > (this._thr || 0) ? 7 : 12) * dt); this._brk = approach(this._brk || 0, brk, (brk > (this._brk || 0) ? 8 : 14) * dt); }
    else { this._thr = thr; this._brk = brk; }
    c.throttle = this._thr; c.brake = this._brk;
    c.handbrake = hb; c.steer = clamp(steer, -1, 1);
    c.shiftUp = this.has('KeyE', 'ShiftRight') || padUp || this.touch.up;
    c.shiftDown = this.has('KeyQ', 'ControlRight') || padDown || this.touch.down;
    c.nitrous = this.has('ShiftLeft') || padNos || this.touch.nos;

    // auto mode: the vehicle ECU engages reverse when the brake is held at standstill; while in
    // reverse, swap the pedals so 'S' drives backwards and 'W' brakes (arcade convention).
    this.reverse = false;
    if (c.gearMode === 'auto' && v && v.gear === -1 && this.autoReverse) { const t = c.throttle; c.throttle = c.brake; c.brake = t; this.reverse = true; }
    if (!this.enabled) { c.throttle = 0; c.brake = 0; c.steer = 0; c.handbrake = 0; c.shiftUp = c.shiftDown = false; c.nitrous = false; }
    return c;
  }

  // ------------------------------------------------------------- touch controls
  _buildTouch(root) {
    const el = document.createElement('div'); el.className = 'touch'; el.innerHTML = `
      <div class="touch-steer" data-k="steer"><div class="touch-steer-track"><div class="touch-steer-knob"></div></div><span>STEER</span></div>
      <div class="touch-right">
        <div class="touch-row"><button class="tbtn small" data-k="down">−</button><button class="tbtn small" data-k="up">+</button><button class="tbtn small" data-k="hb">HB</button><button class="tbtn small nos" data-k="nos">NOS</button></div>
        <div class="touch-row"><button class="tbtn pedal brake" data-k="brake">BRAKE</button><button class="tbtn pedal gas" data-k="gas">GAS</button></div>
      </div>`;
    root.appendChild(el); this.touchEl = el;
    const T = this.touch; const knob = el.querySelector('.touch-steer-knob'); const pad = el.querySelector('.touch-steer');
    let sid = null, sx = 0;
    const setSteer = (x) => { const w = pad.clientWidth * 0.42; const d = clamp((x - sx) / w, -1, 1); T.steer = -d; knob.style.transform = `translateX(${d * w}px)`; };
    pad.addEventListener('pointerdown', (e) => { sid = e.pointerId; sx = pad.getBoundingClientRect().left + pad.clientWidth / 2; pad.setPointerCapture(e.pointerId); setSteer(e.clientX); T.active = true; e.preventDefault(); });
    pad.addEventListener('pointermove', (e) => { if (e.pointerId === sid) setSteer(e.clientX); });
    const end = (e) => { if (e.pointerId === sid) { sid = null; T.steer = 0; knob.style.transform = ''; } };
    pad.addEventListener('pointerup', end); pad.addEventListener('pointercancel', end);
    for (const b of el.querySelectorAll('.tbtn')) {
      const k = b.dataset.k;
      const set = (on, e) => {
        if (e) e.preventDefault(); b.classList.toggle('on', on); T.active = true;
        if (k === 'gas') T.throttle = on ? 1 : 0; else if (k === 'brake') T.brake = on ? 1 : 0; else if (k === 'hb') T.handbrake = on ? 1 : 0;
        else if (k === 'up') T.up = on; else if (k === 'nos') T.nos = on; else if (k === 'down') T.down = on;
      };
      b.addEventListener('pointerdown', (e) => { b.setPointerCapture(e.pointerId); set(true, e); });
      b.addEventListener('pointerup', (e) => set(false, e)); b.addEventListener('pointercancel', (e) => set(false, e));
      b.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    const coarse = matchMedia('(pointer: coarse)').matches;
    this.setTouchVisible(coarse);
    window.addEventListener('touchstart', () => { if (!this._touchSeen) { this._touchSeen = true; this.setTouchVisible(this._wantTouch !== false); } }, { passive: true });
  }
  setTouchVisible(b) { this.touchShown = b; this.touchEl.classList.toggle('show', b && this._driving !== false); }
  setDriving(b) { this._driving = b; this.touchEl.classList.toggle('show', !!(b && this.touchShown)); }
}
