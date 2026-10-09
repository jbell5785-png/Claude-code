// Per-car effects: upgraded materials, light halos, night headlight beams (fx lights), brake
// light spill, nitrous flames + blue trail, wet-road spray, underglow, blob shadow, scrape sparks.
import * as THREE from 'three';
import { upgradeCarMaterials } from './materials.js';
import { flameMesh } from './particles.js';
import { glowTexture, blobShadowTexture, poolTexture } from './textures.js';

const _v = new THREE.Vector3(), _v2 = new THREE.Vector3(), _q = new THREE.Quaternion(), _fwd = new THREE.Vector3(), _up = new THREE.Vector3(), _vel = new THREE.Vector3();
const _n = new THREE.Vector3(0, 1, 0);

function haloSprite(color, size) {
  const m = new THREE.SpriteMaterial({ map: glowTexture(), color: new THREE.Color(color), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false });
  const s = new THREE.Sprite(m); s.scale.setScalar(size); s.renderOrder = 7; s.userData.fxNoGBuffer = true; s.userData.base = new THREE.Color(color);
  return s;
}

export class CarFX {
  /**
   * @param {object} ctx { lights: FxLightSet, sparks, spray, trail, root (world group), quality }
   * @param {THREE.Object3D} group car group (E's CarView.group)
   * @param {object} vehicle §5 vehicle state (may be null)
   * @param {object} opts { paint, underglow (colour|null), player }
   */
  constructor(ctx, group, vehicle, opts = {}) {
    this.ctx = ctx; this.group = group; this.vehicle = vehicle; this.opts = opts; this.time = Math.random() * 10;
    this.root = group.getObjectByName('car') || group;
    this.parts = upgradeCarMaterials(group, { paint: opts.paint, quality: ctx.quality });
    this.flames = []; this.halos = []; this.fxLights = []; this.sprayAcc = 0; this.trailAcc = 0; this.sparkCd = 0; this.boost = 0;
    // exhaust flames (attached next to E's tips so they follow the body)
    for (const ex of this.parts.exhausts) {
      const f = flameMesh(ex.radius); f.position.copy(ex.mesh.position); f.position.x -= 0.1; ex.mesh.parent.add(f); this.flames.push(f);
    }
    // halos on head/tail lights
    for (const m of this.parts.tail) { const s = haloSprite(0xff2a1a, 0.9); s.position.copy(m.position); s.position.x -= 0.06; m.parent.add(s); this.halos.push({ s, kind: 'tail', mesh: m }); }
    for (const m of this.parts.headlight) { const s = haloSprite(0xdde8ff, 1.5); s.position.copy(m.position); s.position.x += 0.06; m.parent.add(s); this.halos.push({ s, kind: 'head', mesh: m }); }
    // fx lights: two headlight beams + brake spill
    const L = ctx.lights;
    this.head = L.add({ color: 0xe6eeff, intensity: 0, range: 55, angle: 0.42, penumbra: 0.6, decay: 1.2, priority: opts.player ? 6 : 1.4, group: this });
    this.head2 = L.add({ color: 0xe6eeff, intensity: 0, range: 55, angle: 0.42, penumbra: 0.6, decay: 1.2, priority: opts.player ? 6 : 1.2, group: this });
    this.tailL = L.add({ color: 0xff2010, intensity: 0, range: 9, angle: 1.3, penumbra: 0.9, decay: 1.6, priority: opts.player ? 4 : 1, group: this });
    this.nosL = L.add({ color: 0x4a7aff, intensity: 0, range: 7, decay: 1.8, priority: 3, group: this });
    this.glowL = null;
    // local positions (relative to the body root) of the light clusters
    this.headLocal = this._centroid(this.parts.headlight, new THREE.Vector3(2, 0.6, 0));
    this.tailLocal = this._centroid(this.parts.tail, new THREE.Vector3(-2, 0.6, 0));
    this.exhaustLocal = this._centroid(this.parts.exhausts.map((e) => e.mesh), this.tailLocal.clone().setY(0.3));
    // blob shadow + underglow pool live in world space
    this.blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobShadowTexture(), transparent: true, depthWrite: false, opacity: 0.85, polygonOffset: true, polygonOffsetFactor: -8, polygonOffsetUnits: -8 }));
    this.blob.rotation.x = -Math.PI / 2; this.blob.renderOrder = 2; this.blob.userData.fxNoGBuffer = true; ctx.root.add(this.blob);
    this.pool = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: poolTexture(), color: 0x000000, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -8, polygonOffsetUnits: -8 }));
    this.pool.renderOrder = 3; this.pool.userData.fxNoGBuffer = true; this.pool.visible = false; ctx.root.add(this.pool);
    this.setUnderglow(opts.underglow ?? null);
    const box = new THREE.Box3().setFromObject(this.root); const sz = box.getSize(new THREE.Vector3());
    this.len = Math.max(3, sz.x); this.wid = Math.max(1.5, Math.min(sz.z, 2.4));
    this.setQuality(ctx.quality);
  }
  _centroid(meshes, fallback) {
    if (!meshes.length) return fallback;
    const c = new THREE.Vector3(); this.root.updateMatrixWorld(true); const inv = new THREE.Matrix4().copy(this.root.matrixWorld).invert();
    for (const m of meshes) c.add(m.getWorldPosition(_v).applyMatrix4(inv)); return c.multiplyScalar(1 / meshes.length);
  }
  setUnderglow(color) {
    this.underglow = color == null ? null : new THREE.Color(color);
    this.pool.visible = !!this.underglow; if (this.underglow) this.pool.material.color.copy(this.underglow).multiplyScalar(2.2);
    if (this.underglow && !this.glowL) this.glowL = this.ctx.lights.add({ color: this.underglow, intensity: 0, range: 6, angle: 1.45, penumbra: 1, decay: 1.4, priority: 3, group: this });
    if (this.glowL) this.glowL.color.copy(this.underglow || new THREE.Color(0));
  }
  setQuality(q) { this.q = q; this.blob.visible = !!q.blobShadows || !q.shadows; }

  /**
   * @param {number} dt
   * @param {object} env { dark: 0..1 (night-ness), wet: 0..1 }
   * @param {object} over optional overrides { boost, brake, speed }
   */
  update(dt, env, over = {}) {
    this.time += dt;
    const v = this.vehicle; const root = this.root; root.updateMatrixWorld();
    const visible = this.group.visible !== false;
    root.getWorldQuaternion(_q); _fwd.set(1, 0, 0).applyQuaternion(_q); _up.set(0, 1, 0).applyQuaternion(_q);
    if (v && v.vel) _vel.set(v.vel[0], v.vel[2], -v.vel[1]); else _vel.set(0, 0, 0);
    const speed = over.speed ?? (v ? Math.abs(v.speed || 0) : 0);
    const brake = over.brake ?? ((v && v.controls && v.controls.brake) || 0);
    const es = v && v.engines && v.engines[0];
    const nitrous = over.boost ?? !!(es && es.nitrousActive);
    this.boost += ((nitrous ? 1 : 0) - this.boost) * Math.min(1, dt * (nitrous ? 12 : 5));
    const dark = env.dark ?? 0;

    // ground height under the car (wheel contact) for decals
    let groundY;
    if (v && v.wheels && v.params && v.params.render) {
      const R = v.params.render; let s = 0; for (let i = 0; i < 4; i++) s += v.wheels[i].pos[2] - (i < 2 ? R.wheelRadiusF || 0.32 : R.wheelRadiusR || 0.32); groundY = s / 4;
    } else { const b = _box.setFromObject(root); groundY = b.min.y; }
    const cx = root.position.x, cz = root.position.z; const yaw = Math.atan2(-_fwd.z, _fwd.x);
    this.blob.position.set(cx, groundY + 0.03, cz); this.blob.rotation.set(-Math.PI / 2, 0, yaw); this.blob.scale.set(this.len * 1.15, this.wid * 1.25, 1);
    this.blob.visible = visible && (!!this.q.blobShadows || !this.q.shadows);
    if (this.underglow) {
      this.pool.position.set(cx, groundY + 0.035, cz); this.pool.rotation.set(-Math.PI / 2, 0, yaw); this.pool.scale.set(this.len * 1.5, this.wid * 2.1, 1);
      this.pool.visible = visible; this.pool.material.opacity = 1;
      this.pool.material.color.copy(this.underglow).multiplyScalar(0.7 + 0.9 * dark);
      _v.set(cx, groundY + 0.25, cz); this.glowL.pos.copy(_v); this.glowL.dir.set(0, -1, 0); this.glowL.intensity = visible ? 6 + 10 * dark : 0;
    }

    // halos: tail brighter on brake, heads only at dusk/night
    for (const h of this.halos) {
      const m = h.s.material;
      if (h.kind === 'tail') { const k = (0.35 + brake * 2.6) * (0.25 + 0.75 * dark); m.color.copy(h.s.userData.base).multiplyScalar(k * 2); h.s.scale.setScalar(0.7 + brake * 0.5 + dark * 0.4); }
      else { const k = 0.15 + 0.85 * dark; m.color.copy(h.s.userData.base).multiplyScalar(k * 2.5); h.s.scale.setScalar(1.2 + dark * 1.0); }
      h.s.visible = visible;
    }
    // headlight beams (fx lights): only meaningful in the dark
    const hl = visible && dark > 0.05;
    for (const [L, side] of [[this.head, 1], [this.head2, -1]]) {
      _v.copy(this.headLocal); _v.z = side * Math.max(0.45, Math.abs(this.headLocal.z || 0.6)); _v.x += 0.3; _v.applyMatrix4(root.matrixWorld);
      L.pos.copy(_v); L.dir.copy(_fwd).addScaledVector(_up, -0.09).normalize(); L.intensity = hl ? 420 * dark : 0;
    }
    _v.copy(this.tailLocal); _v.x -= 0.25; _v.applyMatrix4(root.matrixWorld);
    this.tailL.pos.copy(_v); this.tailL.dir.copy(_fwd).negate().addScaledVector(_up, -0.5).normalize(); this.tailL.intensity = visible ? (0.4 + brake * 3) * (2 + 10 * dark) : 0;

    // nitrous flames + light + trail
    const ctx = this.ctx;
    for (const f of this.flames) {
      f.visible = visible && this.boost > 0.02;
      if (f.visible) {
        const u = f.material.uniforms; u.uTime.value = this.time; u.uPower.value = this.boost * (0.8 + 0.2 * Math.random());
        const len = (0.55 + 0.5 * this.boost + Math.random() * 0.25) * (1 + Math.min(speed, 60) * 0.004);
        f.scale.set(len, 0.9 + Math.random() * 0.25, 0.9 + Math.random() * 0.25);
      }
    }
    _v.copy(this.exhaustLocal); _v.x -= 0.4; _v.applyMatrix4(root.matrixWorld);
    this.nosL.pos.copy(_v); this.nosL.intensity = visible ? this.boost * (14 + 6 * Math.random()) : 0;
    if (visible && this.boost > 0.1 && ctx.trail && this.parts.exhausts.length) {
      this.trailAcc += dt * 70 * this.boost * (ctx.quality.particles ?? 1);
      while (this.trailAcc > 1) {
        this.trailAcc -= 1;
        const ex = this.parts.exhausts[(Math.random() * this.parts.exhausts.length) | 0].mesh;
        ex.getWorldPosition(_v2).addScaledVector(_fwd, -0.25 - Math.random() * 0.3);
        ctx.trail.emit(_v2.x, _v2.y, _v2.z, _vel.x * 0.6 - _fwd.x * 4, 0.2, _vel.z * 0.6 - _fwd.z * 4, 0.28, 0.9, 0.22 + Math.random() * 0.12, 0.55, 0.25, 0.45, 1.6);
      }
    }

    // spray on wet roads (rear wheels), tinted by brake lights at night
    if (visible && env.wet > 0 && ctx.spray && speed > 6) {
      this.sprayAcc += dt * env.wet * Math.min(1, (speed - 6) / 30) * 90 * (ctx.quality.particles ?? 1);
      const tint = brake * dark * 0.5;
      while (this.sprayAcc > 1) {
        this.sprayAcc -= 1;
        const side = Math.random() < 0.5 ? -1 : 1;
        _v2.set(this.tailLocal.x + 0.35, groundY - root.position.y + 0.12, side * this.wid * 0.38).applyMatrix4(root.matrixWorld);
        const c = 0.72 + Math.random() * 0.12;
        ctx.spray.emit(_v2.x, _v2.y, _v2.z,
          _vel.x * 0.55 - _fwd.x * 2 + (Math.random() - 0.5) * 2.5, 0.6 + Math.random() * 1.5, _vel.z * 0.55 - _fwd.z * 2 + (Math.random() - 0.5) * 2.5,
          0.5 + Math.random() * 0.3, 2.6 + speed * 0.03, 0.55 + Math.random() * 0.4, 0.22 + 0.18 * env.wet, c + tint, c, c);
      }
    } else this.sprayAcc = 0;

    // scrape sparks when the chassis bottoms out
    this.sparkCd -= dt;
    if (visible && v && v.wheels && v.params && v.params.axles && speed > 12 && this.sparkCd <= 0 && ctx.sparks) {
      for (let i = 0; i < 4; i++) {
        const ax = v.params.axles[i < 2 ? 0 : 1]; const w = v.wheels[i];
        if (ax && w.contact && w.compression >= ax.maxCompression * 0.97) {
          _v2.set(i < 2 ? this.len * 0.25 : -this.len * 0.25, groundY - root.position.y + 0.04, (i % 2 ? 1 : -1) * this.wid * 0.3).applyMatrix4(root.matrixWorld);
          ctx.sparks.spawn(_v2, _n.set(-_fwd.x * 0.6, 0.5, -_fwd.z * 0.6).normalize(), 0.5, _vel, groundY + 0.02); this.sparkCd = 0.06; break;
        }
      }
    }
  }

  dispose() {
    this.ctx.lights.removeGroup(this);
    for (const f of this.flames) { f.parent && f.parent.remove(f); f.geometry.dispose(); f.material.dispose(); }
    for (const h of this.halos) { h.s.parent && h.s.parent.remove(h.s); h.s.material.dispose(); }
    for (const m of [this.blob, this.pool]) { m.parent && m.parent.remove(m); m.geometry.dispose(); m.material.dispose(); }
  }
}
const _box = new THREE.Box3();
