// World: one WebGL renderer, an outdoor track scene and an indoor studio scene (garage),
// car views, effects and the camera rig. Modes talk to this object (ctx.world).
import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildTrackScene } from './trackMesh.js';
import { CarView } from './carModel.js';
import { Particles, SkidMarks, WheelFx } from './effects.js';
import { CameraRig } from './cameras.js';

const isCoarse = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;

export class World {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    const lowPower = opts.lowPower ?? isCoarse;
    this.quality = lowPower ? 'low' : 'high';
    const r = new THREE.WebGLRenderer({ canvas, antialias: !lowPower, powerPreference: 'high-performance', preserveDrawingBuffer: !!opts.preserveDrawingBuffer });
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.5 : 2));
    r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 0.62;
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer = r;
    this.camera = new THREE.PerspectiveCamera(60, 1, 0.08, 9000);
    this.rig = new CameraRig(this.camera, canvas);
    this.pmrem = new THREE.PMREMGenerator(r);

    // ---- outdoor scene
    const scene = new THREE.Scene(); this.scene = scene;
    this.sunDir = new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - 38), THREE.MathUtils.degToRad(215));
    const sky = new Sky(); sky.scale.setScalar(8000); this.sky = sky;
    const u = sky.material.uniforms; u.turbidity.value = 5.5; u.rayleigh.value = 1.35; u.mieCoefficient.value = 0.004; u.mieDirectionalG.value = 0.82;
    u.sunPosition.value.copy(this.sunDir);
    scene.add(sky);
    scene.fog = new THREE.FogExp2(0xb9cbe0, 0.00055);
    const hemi = new THREE.HemisphereLight(0xcfe3ff, 0x4a5a35, 1.15); scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff1dc, 3.1); sun.castShadow = true;
    const sm = lowPower ? 1024 : 2048; sun.shadow.mapSize.set(sm, sm);
    const sc = sun.shadow.camera; sc.left = -38; sc.right = 38; sc.top = 38; sc.bottom = -38; sc.near = 1; sc.far = 260;
    sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; sun.shadow.radius = 3;
    scene.add(sun); scene.add(sun.target); this.sun = sun;
    // environment map from the sky for paint reflections
    {
      const envScene = new THREE.Scene(); const s2 = new Sky(); s2.scale.setScalar(1000); s2.material.uniforms.sunPosition.value.copy(this.sunDir);
      Object.assign(s2.material.uniforms.turbidity, { value: 5.5 }); envScene.add(s2);
      const ground = new THREE.Mesh(new THREE.SphereGeometry(900, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x3c4a2a, side: THREE.BackSide }));
      envScene.add(ground);
      this.skyEnv = this.pmrem.fromScene(envScene, 0.02).texture; scene.environment = this.skyEnv; scene.environmentIntensity = 0.7;
    }
    this.particles = new Particles(isCoarse ? 900 : 1800); scene.add(this.particles.points); this.particles.setFog(scene.fog);
    this.skids = new SkidMarks(isCoarse ? 2500 : 6000); scene.add(this.skids.mesh);
    this.trackGroup = null; this.track = null; this.trackInfo = null;

    // ---- studio scene (garage)
    this.studio = this._buildStudio();

    this.cars = new Set(); this.fx = new Map(); this.focus = null; this.active = 'track';
    this.resize(); window.addEventListener('resize', () => this.resize());
  }

  _buildStudio() {
    const s = new THREE.Scene(); s.background = new THREE.Color(0x0b0d11);
    s.fog = new THREE.Fog(0x0b0d11, 14, 40);
    s.environment = this.pmrem.fromScene(new RoomEnvironment(), 0.04).texture; s.environmentIntensity = 0.9;
    // floor with radial falloff
    const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d');
    const gr = g.createRadialGradient(256, 256, 10, 256, 256, 256); gr.addColorStop(0, '#2a2f38'); gr.addColorStop(0.45, '#181b21'); gr.addColorStop(1, '#0b0d11');
    g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
    g.strokeStyle = 'rgba(255,255,255,0.035)'; g.lineWidth = 1; for (let i = 0; i <= 512; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 512); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(512, i); g.stroke(); }
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    const floor = new THREE.Mesh(new THREE.CircleGeometry(30, 64), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.32, metalness: 0.3 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; s.add(floor);
    const table = new THREE.Group(); s.add(table);
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.4, 0.06, 72), new THREE.MeshStandardMaterial({ color: 0x1b1f26, roughness: 0.25, metalness: 0.6 }));
    disc.position.y = 0.03; disc.receiveShadow = true; table.add(disc);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3.36, 0.018, 8, 128), new THREE.MeshBasicMaterial({ color: 0xff5a36 })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.055; s.add(ring);
    const hemi = new THREE.HemisphereLight(0xdfe8ff, 0x101215, 0.6); s.add(hemi);
    const key = new THREE.SpotLight(0xffffff, 260, 30, 0.6, 0.6, 1.4); key.position.set(4, 8, 5); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0003;
    s.add(key); s.add(key.target);
    const rim = new THREE.SpotLight(0x8fb6ff, 160, 30, 0.7, 0.8, 1.5); rim.position.set(-6, 4, -5); s.add(rim); s.add(rim.target);
    const warm = new THREE.SpotLight(0xffb27a, 90, 30, 0.7, 0.8, 1.5); warm.position.set(-5, 3, 6); s.add(warm); s.add(warm.target);
    // light bars overhead (seen in reflections)
    for (let i = -1; i <= 1; i++) { const bar = new THREE.Mesh(new THREE.BoxGeometry(6, 0.05, 0.25), new THREE.MeshBasicMaterial({ color: 0xffffff })); bar.position.set(0, 6, i * 1.6); s.add(bar); }
    return { scene: s, table, car: null };
  }

  /** Build the environment for a track (§6 object). */
  setTrack(track) {
    if (this.trackGroup) { this.scene.remove(this.trackGroup); this.trackGroup.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); }
    this.track = track; const info = buildTrackScene(track, { lowDetail: this.quality === 'low' });
    this.trackGroup = info.group; this.trackInfo = info; this.scene.add(info.group);
    this.rig.setTvCams(info.tvCams);
    const q = { s: 0, offset: 0, height: 0, nx: 0, ny: 0, nz: 1, surface: 0, index: -1 };
    let hint = -1;
    this.rig.groundAt = (x, y) => { track.query(x, y, hint, q); hint = q.index; return q.height; };
    this.skids.clear();
    return info;
  }

  /**
   * Add a renderable car. opts: { ghost, opacity, lod, color, effects (bool, default !ghost) }.
   * @returns {CarView}
   */
  addCar(params, opts = {}) {
    const cv = new CarView(params, opts); this.scene.add(cv.group); this.cars.add(cv);
    if (opts.effects ?? !opts.ghost) this.fx.set(cv, new WheelFx(this.particles, this.skids));
    return cv;
  }
  removeCar(cv) { if (!cv) return; this.scene.remove(cv.group); this.cars.delete(cv); this.fx.delete(cv); cv.dispose(); if (this.focus === cv) this.focus = null; }
  clearCars() { for (const cv of [...this.cars]) this.removeCar(cv); }
  setFocus(cv) { this.focus = cv; this.rig.init = false; }

  /** Garage turntable car. */
  setStudioCar(params) {
    const st = this.studio; if (st.car) { st.table.remove(st.car.group); st.car.dispose(); }
    const cv = new CarView(params, {}); st.car = cv; st.table.add(cv.group);
    const lay = cv.model.lay; const r = params.render || {};
    const fake = { pos: [0, 0, lay.cgH], quat: [0, 0, 0, 1], wheels: [0, 1, 2, 3].map((i) => {
      const front = i < 2, left = i % 2 === 0; const R = front ? lay.rF : lay.rR; const t = (front ? lay.trackF : lay.trackR) / 2;
      return { pos: [front ? lay.xF : lay.xR, left ? t : -t, R], steer: front ? 0.18 : 0, spin: 0 };
    }) };
    cv.sync(fake, 1); cv.update(0, { wheels: fake.wheels.map(() => ({ brakeTempC: 20, steer: 0.18 })), controls: { brake: 0 }, engines: null });
    void r; return cv;
  }

  setActive(which) { this.active = which; if (which === 'studio') this.rig.setMode('studio'); }

  resize() {
    const w = this.canvas.clientWidth || window.innerWidth, h = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false); this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    this.particles.setViewportHeight(h * this.renderer.getPixelRatio(), this.camera.fov);
  }

  /** Per-frame: effects, shadows following the focus car, camera, render. vehicleOf(cv) -> vehicle state. */
  frame(dt, vehicleOf) {
    if (this.active === 'studio') {
      const st = this.studio; if (st.car && this.autoRotate !== false) st.table.rotation.y += dt * 0.25;
      this.rig.update(dt, null, null);
      this.renderer.render(st.scene, this.camera); return;
    }
    for (const [cv, fx] of this.fx) { const v = vehicleOf(cv); if (v && cv.group.visible) fx.update(dt, v, cv.params); }
    this.particles.update(dt); this.skids.flush();
    this.particles.setViewportHeight(this.renderer.domElement.height, this.camera.fov);
    const f = this.focus;
    if (f) {
      const p = f.model.root.position; const sun = this.sun;
      // snap shadow camera to texel grid to avoid shimmering
      const texel = (this.sun.shadow.camera.right * 2) / this.sun.shadow.mapSize.x;
      const tx = Math.round(p.x / texel) * texel, tz = Math.round(p.z / texel) * texel;
      sun.target.position.set(tx, p.y, tz); sun.position.set(tx, p.y, tz).addScaledVector(this.sunDir, 120);
      this.rig.update(dt, f, vehicleOf(f));
      // hide the helmet in cockpit view
      const ck = this.rig.mode === 'cockpit';
      if (f.model.helmet !== ck) { f.model.root.traverse((o) => { if (o.userData.helmet) o.visible = !ck; }); }
    }
    this.renderer.render(this.scene, this.camera);
  }
}
