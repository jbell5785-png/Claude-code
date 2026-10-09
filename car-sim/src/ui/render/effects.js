// Tyre smoke, dust and skid marks.
import * as THREE from 'three';
import { smokeSprite } from './textures.js';
import { SURFACE } from '../simapi.js';

const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);

/** CPU-updated soft particle system (one draw call). */
export class Particles {
  constructor(max = 1600) {
    this.max = max; this.count = 0; this.head = 0;
    const g = new THREE.BufferGeometry();
    this.pos = new Float32Array(max * 3); this.vel = new Float32Array(max * 3); this.col = new Float32Array(max * 3);
    this.size = new Float32Array(max); this.alpha = new Float32Array(max); this.age = new Float32Array(max); this.life = new Float32Array(max).fill(0);
    this.grow = new Float32Array(max); this.a0 = new Float32Array(max); this.rot = new Float32Array(max);
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('color', new THREE.BufferAttribute(this.col, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('size', new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('alpha', new THREE.BufferAttribute(this.alpha, 1).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('rot', new THREE.BufferAttribute(this.rot, 1).setUsage(THREE.DynamicDrawUsage));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e7);
    const mat = new THREE.ShaderMaterial({
      uniforms: { map: { value: smokeSprite() }, scale: { value: 600 }, fogColor: { value: new THREE.Color() }, fogDensity: { value: 0 } },
      vertexShader: `
        attribute float size; attribute float alpha; attribute float rot; attribute vec3 color;
        varying float vA; varying vec3 vC; varying float vR; varying float vFog;
        uniform float scale; uniform float fogDensity;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = size * scale / max(0.5, -mv.z);
          vA = alpha; vC = color; vR = rot;
          float d = -mv.z; vFog = 1.0 - exp(-fogDensity * fogDensity * d * d);
        }`,
      fragmentShader: `
        uniform sampler2D map; uniform vec3 fogColor; varying float vA; varying vec3 vC; varying float vR; varying float vFog;
        void main() {
          vec2 p = gl_PointCoord - 0.5; float c = cos(vR), s = sin(vR);
          vec2 uv = vec2(c * p.x - s * p.y, s * p.x + c * p.y) + 0.5;
          vec4 t = texture2D(map, uv);
          float a = t.a * vA; if (a < 0.003) discard;
          gl_FragColor = vec4(mix(vC, fogColor, vFog), a);
          #include <colorspace_fragment>
        }`,
      transparent: true, depthWrite: false,
    });
    this.points = new THREE.Points(g, mat); this.points.frustumCulled = false; this.points.renderOrder = 5;
    this.geo = g; this.mat = mat;
  }
  emit(x, y, z, vx, vy, vz, size, grow, life, alpha, r, g, b) {
    const i = this.head; this.head = (this.head + 1) % this.max;
    this.pos[i * 3] = x; this.pos[i * 3 + 1] = y; this.pos[i * 3 + 2] = z;
    this.vel[i * 3] = vx; this.vel[i * 3 + 1] = vy; this.vel[i * 3 + 2] = vz;
    this.size[i] = size; this.grow[i] = grow; this.life[i] = life; this.age[i] = 0; this.a0[i] = alpha; this.alpha[i] = 0;
    this.col[i * 3] = r; this.col[i * 3 + 1] = g; this.col[i * 3 + 2] = b; this.rot[i] = Math.random() * 6.28;
  }
  update(dt) {
    const P = this.pos, V = this.vel;
    for (let i = 0; i < this.max; i++) {
      if (this.life[i] <= 0) { this.alpha[i] = 0; continue; }
      const a = (this.age[i] += dt); const f = a / this.life[i];
      if (f >= 1) { this.life[i] = 0; this.alpha[i] = 0; continue; }
      const drag = Math.exp(-dt * 1.6);
      V[i * 3] *= drag; V[i * 3 + 1] = V[i * 3 + 1] * drag + 0.35 * dt; V[i * 3 + 2] *= drag;
      P[i * 3] += V[i * 3] * dt; P[i * 3 + 1] += V[i * 3 + 1] * dt; P[i * 3 + 2] += V[i * 3 + 2] * dt;
      this.size[i] += this.grow[i] * dt;
      this.alpha[i] = this.a0[i] * Math.min(1, f * 8) * (1 - f) * (1 - f);
      this.rot[i] += dt * 0.4;
    }
    for (const k of ['position', 'size', 'alpha', 'color', 'rot']) this.geo.attributes[k].needsUpdate = true;
  }
  setFog(fog) { if (fog && fog.isFogExp2) { this.mat.uniforms.fogColor.value.copy(fog.color); this.mat.uniforms.fogDensity.value = fog.density; } }
  setViewportHeight(h, fov) { this.mat.uniforms.scale.value = h / (2 * Math.tan((fov * Math.PI) / 360)); }
}

/** Ring buffer of skid-mark quads. */
export class SkidMarks {
  constructor(maxSegs = 5000) {
    this.max = maxSegs; this.head = 0;
    this.pos = new Float32Array(maxSegs * 6 * 3); this.alpha = new Float32Array(maxSegs * 6);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('alpha', new THREE.BufferAttribute(this.alpha, 1).setUsage(THREE.DynamicDrawUsage));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e7);
    this.mat = new THREE.ShaderMaterial({
      vertexShader: 'attribute float alpha; varying float vA; void main(){ vA = alpha; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);} ',
      fragmentShader: 'varying float vA; void main(){ if (vA < 0.004) discard; gl_FragColor = vec4(0.03,0.03,0.035, vA); }',
      transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -6, polygonOffsetUnits: -6,
    });
    this.mesh = new THREE.Mesh(g, this.mat); this.mesh.frustumCulled = false; this.mesh.renderOrder = 1; this.geo = g;
    this.dirtyFrom = -1; this.dirty = false;
  }
  /** Add a segment from a to b (THREE.Vector3 on the ground), width w, intensity 0..1 at both ends. */
  add(a, b, w, ia, ib) {
    const dx = b.x - a.x, dz = b.z - a.z; const l = Math.hypot(dx, dz) || 1; const px = (-dz / l) * w * 0.5, pz = (dx / l) * w * 0.5;
    const i = this.head; this.head = (this.head + 1) % this.max; const o = i * 18; const P = this.pos;
    const v = [a.x - px, a.y, a.z - pz, a.x + px, a.y, a.z + pz, b.x + px, b.y, b.z + pz, a.x - px, a.y, a.z - pz, b.x + px, b.y, b.z + pz, b.x - px, b.y, b.z - pz];
    for (let k = 0; k < 18; k++) P[o + k] = v[k];
    const A = this.alpha; const j = i * 6; A[j] = ia; A[j + 1] = ia; A[j + 2] = ib; A[j + 3] = ia; A[j + 4] = ib; A[j + 5] = ib;
    this.dirty = true;
  }
  clear() { this.pos.fill(0); this.alpha.fill(0); this.dirty = true; }
  flush() { if (!this.dirty) return; this.geo.attributes.position.needsUpdate = true; this.geo.attributes.alpha.needsUpdate = true; this.dirty = false; }
}

const _a = new THREE.Vector3(), _b = new THREE.Vector3();

/** Drives smoke/dust/skids from a vehicle's wheel state. One instance per car that should emit. */
export class WheelFx {
  constructor(particles, skids) { this.p = particles; this.sk = skids; this.last = [null, null, null, null].map(() => ({ has: false, p: new THREE.Vector3(), i: 0 })); this.acc = [0, 0, 0, 0]; }
  reset() { for (const l of this.last) l.has = false; }
  update(dt, v, params) {
    const speed = Math.hypot(v.vel[0], v.vel[1]);
    for (let i = 0; i < 4; i++) {
      const w = v.wheels[i]; const R = i < 2 ? (params.render?.wheelRadiusF || 0.32) : (params.render?.wheelRadiusR || 0.32);
      const tw = ((i < 2 ? params.render?.tyreWidthF : params.render?.tyreWidthR) || 240); const width = tw > 5 ? tw / 1000 : tw;
      // contact patch (approx straight down in world)
      _b.set(w.pos[0], w.pos[2] - R + 0.025, -w.pos[1]);
      const slipSpeed = Math.abs(w.omega * R - (v.speed || 0)) + Math.abs(Math.sin(w.slipAngle || 0)) * speed;
      const usage = w.usage || 0; const surf = w.surface ?? 0;
      const onGround = w.contact !== false;
      const sliding = onGround && (w.sliding || usage > 1.0);
      const intensity = sliding ? clamp((slipSpeed - 1.5) / 8, 0, 1) * clamp((usage - 0.85) * 4, 0.2, 1) : 0;
      const L = this.last[i];
      // skid marks on hard surfaces
      if (intensity > 0.05 && (surf === SURFACE.ASPHALT || surf === SURFACE.KERB)) {
        if (L.has) {
          const d = L.p.distanceTo(_b);
          if (d > 0.35 && d < 4) { this.sk.add(L.p, _b, width * 0.9, L.i * 0.55, intensity * 0.55); L.p.copy(_b); L.i = intensity; }
          else if (d >= 4) { L.p.copy(_b); L.i = intensity; }
        } else { L.has = true; L.p.copy(_b); L.i = intensity; }
      } else L.has = false;
      // smoke
      if (intensity > 0.08 && (surf === SURFACE.ASPHALT || surf === SURFACE.KERB)) {
        this.acc[i] += dt * (20 + 70 * intensity);
        while (this.acc[i] > 1) {
          this.acc[i] -= 1;
          const g = 0.82 + Math.random() * 0.12;
          this.p.emit(_b.x + (Math.random() - 0.5) * 0.3, _b.y + 0.15, _b.z + (Math.random() - 0.5) * 0.3,
            v.vel[0] * 0.25 + (Math.random() - 0.5) * 1.5, 0.4 + Math.random() * 0.6, -v.vel[1] * 0.25 + (Math.random() - 0.5) * 1.5,
            0.6 + intensity * 0.6, 1.6 + intensity * 2.2, 1.6 + intensity * 2.2, 0.35 + intensity * 0.45, g, g, g);
        }
      } else if ((surf === SURFACE.GRASS || surf === SURFACE.GRAVEL) && speed > 3 && onGround) {
        // dust / dirt
        const k = clamp(speed / 30, 0, 1) * (0.5 + Math.min(usage, 1.2)); this.acc[i] += dt * 30 * k;
        while (this.acc[i] > 1) {
          this.acc[i] -= 1; const gravel = surf === SURFACE.GRAVEL;
          const r = gravel ? 0.72 : 0.5, g = gravel ? 0.64 : 0.44, b = gravel ? 0.5 : 0.3;
          this.p.emit(_b.x + (Math.random() - 0.5) * 0.4, _b.y + 0.1, _b.z + (Math.random() - 0.5) * 0.4,
            -v.vel[0] * 0.08 + (Math.random() - 0.5) * 2, 0.5 + Math.random() * 1.2, v.vel[1] * 0.08 + (Math.random() - 0.5) * 2,
            0.5, 1.8, 1.2 + Math.random(), gravel ? 0.55 : 0.4, r, g, b);
        }
      } else this.acc[i] = 0;
    }
  }
}
