// Camera rig: chase, bonnet, cockpit, TV trackside, free orbit (plus 'studio' for the garage).
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export const CAMERA_MODES = ['chase', 'bonnet', 'cockpit', 'tv', 'orbit'];
export const CAMERA_LABELS = { chase: 'Chase', bonnet: 'Bonnet', cockpit: 'Cockpit', tv: 'TV', orbit: 'Orbit', studio: 'Studio' };

const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
const _f = new THREE.Vector3(), _v = new THREE.Vector3(), _d = new THREE.Vector3(), _t = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0);
const _q = new THREE.Quaternion(); const CAM_FIX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);

export class CameraRig {
  constructor(camera, dom) {
    this.camera = camera; this.mode = 'chase';
    this.orbit = new OrbitControls(camera, dom); this.orbit.enabled = false; this.orbit.enableDamping = true; this.orbit.dampingFactor = 0.08;
    this.orbit.maxPolarAngle = Math.PI * 0.495; this.orbit.minDistance = 2.5; this.orbit.maxDistance = 60;
    this.pos = new THREE.Vector3(); this.look = new THREE.Vector3(); this.dir = new THREE.Vector3(1, 0, 0); this.init = false;
    this.tvCams = []; this.tvIndex = -1; this.groundAt = null; this.lastTarget = new THREE.Vector3(); this.fov = 60;
    this.shake = 0; this.time = 0;
  }
  setMode(m) {
    this.mode = m; this.orbit.enabled = m === 'orbit' || m === 'studio'; this.init = false; this.tvIndex = -1;
    if (m === 'studio') { this.orbit.minDistance = 3.5; this.orbit.maxDistance = 14; this.orbit.maxPolarAngle = Math.PI * 0.48; this.orbit.target.set(0, 0.6, 0); }
    else { this.orbit.minDistance = 2.5; this.orbit.maxDistance = 60; this.orbit.maxPolarAngle = Math.PI * 0.495; }
  }
  cycle() { const i = CAMERA_MODES.indexOf(this.mode); this.setMode(CAMERA_MODES[(i + 1) % CAMERA_MODES.length]); return this.mode; }

  /**
   * @param {number} dt real frame time
   * @param {import('./carModel.js').CarView} cv car to follow
   * @param {object} v vehicle state (speed etc.)
   */
  update(dt, cv, v) {
    const cam = this.camera; this.time += dt;
    if (this.mode === 'studio') { this.orbit.update(); return; }
    if (!cv) return;
    const root = cv.model.root; const carPos = root.position; const q = root.quaternion;
    const speed = v ? Math.hypot(v.vel[0], v.vel[1], v.vel[2]) : 0;
    const L = cv.model.lay.L;
    _f.set(1, 0, 0).applyQuaternion(q); _f.y = 0; if (_f.lengthSq() < 1e-6) _f.set(1, 0, 0); _f.normalize();
    let fovTarget = 60;
    switch (this.mode) {
      case 'chase': {
        // blend heading with velocity direction (so slides are framed from behind the motion)
        _v.set(v.vel[0], 0, -v.vel[1]); const vs = _v.length();
        if (vs > 4 && v.speed > 0) { _v.multiplyScalar(1 / vs); _d.copy(_f).lerp(_v, 0.35).normalize(); } else _d.copy(_f);
        if (v.speed < -1) _d.copy(_f);
        const k = 1 - Math.exp(-dt * 4.0); if (!this.init) this.dir.copy(_d); else this.dir.lerp(_d, k).normalize();
        const dist = L * 0.62 + 3.2 + Math.min(speed, 80) * 0.018; const h = 1.35 + L * 0.08;
        _t.copy(carPos).addScaledVector(this.dir, -dist); _t.y += h;
        if (this.groundAt) { const g = this.groundAt(_t.x, -_t.z); if (g != null && _t.y < g + 0.8) _t.y = g + 0.8; }
        if (!this.init) { this.pos.copy(_t); this.look.copy(carPos); this.init = true; }
        this.pos.lerp(_t, 1 - Math.exp(-dt * 10));
        _t.copy(carPos).addScaledVector(this.dir, 2.5); _t.y += 0.75;
        this.look.lerp(_t, 1 - Math.exp(-dt * 14));
        cam.position.copy(this.pos);
        // subtle high-speed shake
        const sh = clamp((speed - 40) / 60, 0, 1) * 0.015;
        cam.position.x += Math.sin(this.time * 37) * sh; cam.position.y += Math.sin(this.time * 51 + 1) * sh;
        cam.up.set(0, 1, 0); cam.lookAt(this.look);
        fovTarget = 58 + clamp(speed / 80, 0, 1) * 22;
        break;
      }
      case 'bonnet': case 'cockpit': {
        const e = cv.eye; const lay = cv.model.lay;
        if (this.mode === 'cockpit') _t.set(e.x - 0.02, e.y + 0.08 - lay.cgH, e.z);
        else _t.set(e.x + 0.95, Math.max(e.y - 0.12, lay.H * 0.72) - lay.cgH, 0);
        _t.applyQuaternion(q).add(carPos);
        cam.position.copy(_t);
        // keep the horizon a bit steadier than the body
        _q.copy(q).multiply(CAM_FIX); cam.quaternion.slerp(_q, this.init ? 1 - Math.exp(-dt * 30) : 1); this.init = true;
        if (this.mode === 'cockpit') cam.rotateX(-0.06);
        fovTarget = this.mode === 'cockpit' ? 72 : 66 + clamp(speed / 80, 0, 1) * 10;
        break;
      }
      case 'tv': {
        if (!this.tvCams.length) { this.setMode('chase'); return; }
        let best = this.tvIndex, bd = Infinity;
        for (let i = 0; i < this.tvCams.length; i++) { const c = this.tvCams[i]; const d = (c.pos.x - carPos.x) ** 2 + (c.pos.z - carPos.z) ** 2; if (d < bd) { bd = d; best = i; } }
        if (this.tvIndex >= 0 && best !== this.tvIndex) { const c = this.tvCams[this.tvIndex].pos; const dc = (c.x - carPos.x) ** 2 + (c.z - carPos.z) ** 2; if (dc < bd * 1.3) best = this.tvIndex; }
        this.tvIndex = best; const c = this.tvCams[best].pos; cam.position.copy(c);
        _t.copy(carPos); _t.y += 0.4; if (!this.init) { this.look.copy(_t); this.init = true; } this.look.lerp(_t, 1 - Math.exp(-dt * 12)); cam.up.set(0, 1, 0); cam.lookAt(this.look);
        const d = Math.sqrt(bd); fovTarget = clamp(2 * Math.atan(5.5 / Math.max(d, 1)) * 180 / Math.PI, 6, 60);
        break;
      }
      case 'orbit': {
        if (!this.init) { cam.position.copy(carPos).addScaledVector(_f, -7).add(_up.clone().multiplyScalar(2.5)); this.orbit.target.copy(carPos); this.lastTarget.copy(carPos); this.init = true; }
        _d.subVectors(carPos, this.lastTarget); cam.position.add(_d); this.orbit.target.add(_d); this.lastTarget.copy(carPos);
        this.orbit.update(); fovTarget = 55;
        break;
      }
    }
    this.fov += (fovTarget - this.fov) * (this.mode === 'tv' ? 1 - Math.exp(-dt * 6) : 1 - Math.exp(-dt * 3));
    if (Math.abs(cam.fov - this.fov) > 0.01) { cam.fov = this.fov; cam.updateProjectionMatrix(); }
  }
  setTvCams(list) { this.tvCams = list.map((c) => ({ pos: new THREE.Vector3(c.x, c.z, -c.y), s: c.s })); this.tvIndex = -1; }
}
