// Particle systems: soft lit sprites (spray, nitrous trail, smoke), velocity-stretched sparks,
// GPU rain, GPU speed lines, nitrous flame cones. All single draw call, preallocated, no
// per-frame allocation.
import * as THREE from 'three';
import { puffTexture, glowTexture } from './textures.js';

/** Uniforms shared by soft particles: lighting + soft depth fade. */
export const particleUniforms = {
  uAmbient: { value: new THREE.Color(0.5, 0.5, 0.55) }, uSunColor: { value: new THREE.Color(1, 1, 1) }, uSunDirV: { value: new THREE.Vector3(0, 1, 0) },
  tDepth: { value: null }, uSoft: { value: 0 }, uInvRes: { value: new THREE.Vector2(1, 1) }, uNear: { value: 0.1 }, uFar: { value: 1000 },
  fogColor: { value: new THREE.Color() }, fogDensity: { value: 0 },
};

const SOFT_VERT = /* glsl */`
attribute float size; attribute float alpha; attribute float rot; attribute vec3 color;
varying float vA; varying vec3 vC; varying float vR; varying float vFog; varying float vViewZ;
uniform float scale; uniform float fogDensity;
void main() {
  vec4 mv = modelViewMatrix * vec4( position, 1.0 );
  gl_Position = projectionMatrix * mv;
  gl_PointSize = min( size * scale / max( 0.5, -mv.z ), 220.0 );
  vA = alpha; vC = color; vR = rot; vViewZ = mv.z;
  float d = -mv.z; vFog = 1.0 - exp( -fogDensity * fogDensity * d * d );
}`;
const SOFT_FRAG = /* glsl */`
#include <packing>
uniform sampler2D map; uniform vec3 fogColor; uniform vec3 uAmbient, uSunColor, uSunDirV; uniform float uLit, uAdditive;
uniform sampler2D tDepth; uniform float uSoft; uniform vec2 uInvRes; uniform float uNear, uFar;
varying float vA; varying vec3 vC; varying float vR; varying float vFog; varying float vViewZ;
void main() {
  vec2 p = gl_PointCoord - 0.5; float c = cos( vR ), s = sin( vR );
  vec2 uv = vec2( c * p.x - s * p.y, s * p.x + c * p.y ) + 0.5;
  vec4 t = texture2D( map, uv );
  float a = t.r * vA;
  if ( uSoft > 0.0 ) {
    float d = texture2D( tDepth, gl_FragCoord.xy * uInvRes ).x;
    float sz = perspectiveDepthToViewZ( d, uNear, uFar );
    a *= smoothstep( 0.0, uSoft, vViewZ - sz );
  }
  if ( a < 0.003 ) discard;
  vec3 col = vC;
  if ( uLit > 0.5 ) {
    // fake volumetric lighting: sphere normal from the sprite coordinate, wrapped diffuse
    vec3 n = normalize( vec3( p * 2.0, 0.6 ) );
    float sun = clamp( dot( n, uSunDirV ) * 0.5 + 0.5, 0.0, 1.0 );
    col *= uAmbient + uSunColor * sun * 0.7;
  }
  col = mix( col, fogColor, vFog );
  if ( uAdditive > 0.5 ) gl_FragColor = vec4( col * a * ( 1.0 - vFog ), 1.0 );
  else gl_FragColor = vec4( col, a );
}`;

/** CPU-simulated soft sprite particles. */
export class SoftParticles {
  constructor(max, { additive = false, lit = true, map = null, drag = 1.6, buoyancy = 0.35, gravity = 0 } = {}) {
    this.max = max; this.head = 0; this.drag = drag; this.buoy = buoyancy; this.gravity = gravity;
    const g = new THREE.BufferGeometry();
    this.pos = new Float32Array(max * 3); this.vel = new Float32Array(max * 3); this.col = new Float32Array(max * 3);
    this.size = new Float32Array(max); this.alpha = new Float32Array(max); this.age = new Float32Array(max); this.life = new Float32Array(max);
    this.grow = new Float32Array(max); this.a0 = new Float32Array(max); this.rot = new Float32Array(max); this.live = 0;
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('color', new THREE.BufferAttribute(this.col, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('size', new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('alpha', new THREE.BufferAttribute(this.alpha, 1).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('rot', new THREE.BufferAttribute(this.rot, 1).setUsage(THREE.DynamicDrawUsage));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e7);
    this.mat = new THREE.ShaderMaterial({
      uniforms: Object.assign({ map: { value: map || (additive ? glowTexture() : puffTexture()) }, scale: { value: 600 }, uLit: { value: lit ? 1 : 0 }, uAdditive: { value: additive ? 1 : 0 } }, particleUniforms),
      vertexShader: SOFT_VERT, fragmentShader: SOFT_FRAG, transparent: true, depthWrite: false,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    this.points = new THREE.Points(g, this.mat); this.points.frustumCulled = false; this.points.renderOrder = additive ? 8 : 5;
    this.points.userData.fxNoGBuffer = true; this.geo = g;
  }
  emit(x, y, z, vx, vy, vz, size, grow, life, alpha, r, g, b) {
    const i = this.head; this.head = (this.head + 1) % this.max;
    const P = this.pos, V = this.vel; P[i * 3] = x; P[i * 3 + 1] = y; P[i * 3 + 2] = z; V[i * 3] = vx; V[i * 3 + 1] = vy; V[i * 3 + 2] = vz;
    this.size[i] = size; this.grow[i] = grow; this.life[i] = life; this.age[i] = 0; this.a0[i] = alpha; this.alpha[i] = 0;
    this.col[i * 3] = r; this.col[i * 3 + 1] = g; this.col[i * 3 + 2] = b; this.rot[i] = Math.random() * 6.28;
  }
  update(dt) {
    const P = this.pos, V = this.vel; const drag = Math.exp(-dt * this.drag); let live = 0;
    for (let i = 0; i < this.max; i++) {
      if (this.life[i] <= 0) { if (this.alpha[i] !== 0) this.alpha[i] = 0; continue; }
      const f = (this.age[i] += dt) / this.life[i];
      if (f >= 1) { this.life[i] = 0; this.alpha[i] = 0; continue; }
      live++;
      V[i * 3] *= drag; V[i * 3 + 1] = V[i * 3 + 1] * drag + (this.buoy - this.gravity) * dt; V[i * 3 + 2] *= drag;
      P[i * 3] += V[i * 3] * dt; P[i * 3 + 1] += V[i * 3 + 1] * dt; P[i * 3 + 2] += V[i * 3 + 2] * dt;
      this.size[i] += this.grow[i] * dt;
      this.alpha[i] = this.a0[i] * Math.min(1, f * 10) * (1 - f) * (1 - f);
      this.rot[i] += dt * 0.5;
    }
    this.live = live;
    const a = this.geo.attributes; a.position.needsUpdate = a.size.needsUpdate = a.alpha.needsUpdate = a.color.needsUpdate = a.rot.needsUpdate = true;
  }
  setViewport(h, fov) { this.mat.uniforms.scale.value = h / (2 * Math.tan((fov * Math.PI) / 360)); }
  dispose() { this.geo.dispose(); this.mat.dispose(); }
}

/** Upgrade E's tyre-smoke Points material in place: lit + soft depth fade, same attributes. */
export function upgradeSmokePoints(points) {
  const m = points && points.material; if (!m || !m.uniforms || !m.uniforms.scale || m.userData.fxSmoke) return false;
  m.userData.fxSmoke = true;
  Object.assign(m.uniforms, particleUniforms, { uLit: { value: 1 }, uAdditive: { value: 0 } });
  m.vertexShader = SOFT_VERT; m.fragmentShader = SOFT_FRAG + ''; m.needsUpdate = true;
  points.userData.fxNoGBuffer = true;
  return true;
}

/** Velocity-stretched additive sparks with ground bounce. */
export class Sparks {
  constructor(max = 500) {
    this.max = max; this.head = 0;
    this.p = new Float32Array(max * 3); this.v = new Float32Array(max * 3); this.age = new Float32Array(max); this.life = new Float32Array(max); this.floor = new Float32Array(max); this.heat = new Float32Array(max);
    const quad = new THREE.PlaneGeometry(1, 1); quad.translate(0, 0.5, 0);
    const g = new THREE.InstancedBufferGeometry(); g.index = quad.index; g.setAttribute('position', quad.attributes.position); g.setAttribute('uv', quad.attributes.uv);
    this.aP = new THREE.InstancedBufferAttribute(new Float32Array(max * 3), 3).setUsage(THREE.DynamicDrawUsage);
    this.aV = new THREE.InstancedBufferAttribute(new Float32Array(max * 4), 4).setUsage(THREE.DynamicDrawUsage); // vel + heat
    g.setAttribute('iPos', this.aP); g.setAttribute('iVel', this.aV); g.instanceCount = max; g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e7);
    this.mat = new THREE.ShaderMaterial({
      uniforms: { uStretch: { value: 0.035 }, uWidth: { value: 0.02 }, uIntensity: { value: 6 } },
      vertexShader: /* glsl */`
        attribute vec3 iPos; attribute vec4 iVel; uniform float uStretch, uWidth; varying float vHeat; varying vec2 vUv;
        void main() {
          vHeat = iVel.w; vUv = uv;
          vec3 tail = iPos - iVel.xyz * uStretch;
          vec3 a = ( viewMatrix * vec4( iPos, 1.0 ) ).xyz, b = ( viewMatrix * vec4( tail, 1.0 ) ).xyz;
          vec3 dir = a - b; float len = length( dir ); dir = len > 1e-4 ? dir / len : vec3( 0, 1, 0 );
          vec3 sx = cross( dir, vec3( 0.0, 0.0, 1.0 ) ); vec3 side = ( dot( sx, sx ) > 1e-6 ? normalize( sx ) : vec3( 1.0, 0.0, 0.0 ) ) * uWidth * ( 0.5 + vHeat );
          vec3 p = mix( b, a, position.y ) + side * position.x * 2.0;
          if ( vHeat <= 0.0 ) p = vec3( 0.0, 0.0, 1e5 );
          gl_Position = projectionMatrix * vec4( p, 1.0 );
        }`,
      fragmentShader: /* glsl */`
        uniform float uIntensity; varying float vHeat; varying vec2 vUv;
        void main() {
          float w = 1.0 - abs( vUv.x - 0.5 ) * 2.0; float t = vUv.y;
          vec3 hot = vec3( 1.0, 0.85, 0.55 ), cool = vec3( 1.0, 0.32, 0.05 );
          vec3 c = mix( cool, hot, vHeat ) * uIntensity * vHeat * w * ( 0.35 + 0.65 * t );
          gl_FragColor = vec4( c, 1.0 );
        }`,
      blending: THREE.AdditiveBlending, transparent: true, depthWrite: false,
    });
    this.mesh = new THREE.Mesh(g, this.mat); this.mesh.frustumCulled = false; this.mesh.renderOrder = 9; this.mesh.userData.fxNoGBuffer = true;
    this.geo = g; this.dirty = true;
  }
  /** pos, normal: THREE.Vector3 (world). intensity 0..1+ */
  spawn(pos, normal, intensity = 1, carVel = null, floorY = null) {
    const n = Math.min(80, Math.round(6 + 40 * intensity));
    for (let k = 0; k < n; k++) {
      const i = this.head; this.head = (this.head + 1) % this.max;
      const s = (3 + Math.random() * 9) * (0.5 + intensity * 0.6);
      let dx = normal.x + (Math.random() - 0.5) * 1.6, dy = normal.y + Math.random() * 0.8, dz = normal.z + (Math.random() - 0.5) * 1.6;
      const l = Math.hypot(dx, dy, dz) || 1; dx /= l; dy /= l; dz /= l;
      this.p[i * 3] = pos.x; this.p[i * 3 + 1] = pos.y; this.p[i * 3 + 2] = pos.z;
      this.v[i * 3] = dx * s + (carVel ? carVel.x * 0.85 : 0); this.v[i * 3 + 1] = dy * s; this.v[i * 3 + 2] = dz * s + (carVel ? carVel.z * 0.85 : 0);
      this.age[i] = 0; this.life[i] = 0.25 + Math.random() * 0.6; this.floor[i] = floorY ?? pos.y - 0.3; this.heat[i] = 1;
    }
  }
  update(dt) {
    const P = this.aP.array, V = this.aV.array; let any = false;
    for (let i = 0; i < this.max; i++) {
      if (this.life[i] <= 0) { if (V[i * 4 + 3] !== 0) { V[i * 4 + 3] = 0; any = true; } continue; }
      const f = (this.age[i] += dt) / this.life[i]; if (f >= 1) { this.life[i] = 0; V[i * 4 + 3] = 0; any = true; continue; }
      const v = this.v; const d = Math.exp(-dt * 1.2);
      v[i * 3] *= d; v[i * 3 + 2] *= d; v[i * 3 + 1] = v[i * 3 + 1] * d - 9.81 * dt;
      this.p[i * 3] += v[i * 3] * dt; this.p[i * 3 + 1] += v[i * 3 + 1] * dt; this.p[i * 3 + 2] += v[i * 3 + 2] * dt;
      if (this.p[i * 3 + 1] < this.floor[i] && v[i * 3 + 1] < 0) { this.p[i * 3 + 1] = this.floor[i]; v[i * 3 + 1] *= -0.35; v[i * 3] *= 0.7; v[i * 3 + 2] *= 0.7; }
      P[i * 3] = this.p[i * 3]; P[i * 3 + 1] = this.p[i * 3 + 1]; P[i * 3 + 2] = this.p[i * 3 + 2];
      V[i * 4] = v[i * 3]; V[i * 4 + 1] = v[i * 3 + 1]; V[i * 4 + 2] = v[i * 3 + 2]; V[i * 4 + 3] = Math.max(0.001, 1 - f * f);
      any = true;
    }
    if (any) { this.aP.needsUpdate = true; this.aV.needsUpdate = true; }
  }
  dispose() { this.geo.dispose(); this.mat.dispose(); }
}

/** GPU rain: streaks wrapped in a box around the camera, stretched by fall + camera velocity. */
export class Rain {
  constructor(count = 6000) {
    const quad = new THREE.PlaneGeometry(1, 1); quad.translate(0, 0.5, 0);
    const g = new THREE.InstancedBufferGeometry(); g.index = quad.index; g.setAttribute('position', quad.attributes.position); g.setAttribute('uv', quad.attributes.uv);
    const seeds = new Float32Array(count * 4); for (let i = 0; i < seeds.length; i++) seeds[i] = Math.random();
    g.setAttribute('iSeed', new THREE.InstancedBufferAttribute(seeds, 4)); g.instanceCount = count; g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e7);
    this.mat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uCam: { value: new THREE.Vector3() }, uCamVel: { value: new THREE.Vector3() }, uBox: { value: new THREE.Vector3(36, 22, 36) },
        uIntensity: { value: 0.6 }, uColor: { value: new THREE.Color(0.7, 0.75, 0.85) }, uFall: { value: 11 } },
      vertexShader: /* glsl */`
        attribute vec4 iSeed; uniform float uTime, uFall; uniform vec3 uCam, uCamVel, uBox; varying vec2 vUv; varying float vFade;
        void main() {
          vUv = uv;
          vec3 vel = vec3( 0.6, - uFall * ( 0.8 + 0.4 * iSeed.w ), 0.3 );
          vec3 p = iSeed.xyz * uBox + vel * uTime;
          p = mod( p - uCam + uBox * 0.5, uBox ) - uBox * 0.5 + uCam;
          vec3 rel = vel - uCamVel; // apparent velocity
          vec3 a = ( viewMatrix * vec4( p, 1.0 ) ).xyz;
          vec3 b = ( viewMatrix * vec4( p - rel * 0.028, 1.0 ) ).xyz;
          vec3 dir = normalize( a - b + 1e-5 );
          vec3 side = normalize( cross( dir, vec3( 0.0, 0.0, 1.0 ) ) ) * 0.0045 * ( 1.0 + length( a ) * 0.015 );
          vec3 q = mix( b, a, position.y ) + side * position.x * 2.0;
          vFade = smoothstep( 0.5, 3.0, -a.z ) * ( 1.0 - smoothstep( uBox.x * 0.3, uBox.x * 0.5, length( a ) ) );
          gl_Position = projectionMatrix * vec4( q, 1.0 );
        }`,
      fragmentShader: /* glsl */`
        uniform float uIntensity; uniform vec3 uColor; varying vec2 vUv; varying float vFade;
        void main() { float w = 1.0 - abs( vUv.x - 0.5 ) * 2.0; gl_FragColor = vec4( uColor * w * vUv.y * uIntensity * vFade, 1.0 ); }`,
      blending: THREE.AdditiveBlending, transparent: true, depthWrite: false,
    });
    this.mesh = new THREE.Mesh(g, this.mat); this.mesh.frustumCulled = false; this.mesh.renderOrder = 10; this.mesh.userData.fxNoGBuffer = true; this.geo = g;
    this.max = count;
  }
  setCount(n) { this.geo.instanceCount = Math.min(this.max, n); }
  update(dt, camera, camVel) { const u = this.mat.uniforms; u.uTime.value += dt; u.uCam.value.copy(camera.position); u.uCamVel.value.copy(camVel); }
  dispose() { this.geo.dispose(); this.mat.dispose(); }
}

/** GPU speed lines: thin streaks in a tube around the camera path; fade in with speed. */
export class SpeedLines {
  constructor(count = 300) {
    const quad = new THREE.PlaneGeometry(1, 1); quad.translate(0, 0.5, 0);
    const g = new THREE.InstancedBufferGeometry(); g.index = quad.index; g.setAttribute('position', quad.attributes.position); g.setAttribute('uv', quad.attributes.uv);
    const seeds = new Float32Array(count * 4); for (let i = 0; i < seeds.length; i++) seeds[i] = Math.random();
    g.setAttribute('iSeed', new THREE.InstancedBufferAttribute(seeds, 4)); g.instanceCount = count; g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e7);
    this.mat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uAmount: { value: 0 }, uColor: { value: new THREE.Color(1, 1, 1) }, uSpeed: { value: 0 } },
      vertexShader: /* glsl */`
        attribute vec4 iSeed; uniform float uTime, uSpeed; varying vec2 vUv; varying float vA;
        void main() {
          vUv = uv;
          // camera space: tube around the view axis, lines stream toward the camera (+z)
          float ang = iSeed.x * 6.2831; float rad = 2.2 + iSeed.y * 7.0;
          float L = 70.0; float z = - mod( iSeed.z * L - uTime * uSpeed * ( 0.8 + 0.4 * iSeed.w ), L ) - 1.0;
          vec3 c = vec3( cos( ang ) * rad * 1.5, sin( ang ) * rad * 0.8 + 0.3, z );
          float len = 0.6 + uSpeed * 0.06;
          vec3 b = c + vec3( 0.0, 0.0, - len );
          vec3 side = normalize( cross( vec3( 0.0, 0.0, 1.0 ), c ) ) * 0.012;
          vec3 q = mix( b, c, position.y ) + side * position.x * 2.0;
          vA = smoothstep( 1.0, 8.0, - z ) * ( 1.0 - smoothstep( 40.0, 70.0, - z ) );
          gl_Position = projectionMatrix * vec4( q, 1.0 );
        }`,
      fragmentShader: /* glsl */`
        uniform float uAmount; uniform vec3 uColor; varying vec2 vUv; varying float vA;
        void main() { float w = 1.0 - abs( vUv.x - 0.5 ) * 2.0; gl_FragColor = vec4( uColor * w * vUv.y * vA * uAmount, 1.0 ); }`,
      blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, depthTest: true,
    });
    this.mesh = new THREE.Mesh(g, this.mat); this.mesh.frustumCulled = false; this.mesh.renderOrder = 11; this.mesh.userData.fxNoGBuffer = true; this.geo = g; this.max = count;
  }
  setCount(n) { this.geo.instanceCount = Math.min(this.max, n); this.mesh.visible = n > 0; }
  /** call with the camera so the lines live in camera space */
  update(dt, camera, speed, boost) {
    const u = this.mat.uniforms; u.uTime.value += dt; u.uSpeed.value = Math.max(speed, 1);
    const a = Math.min(1, Math.max(0, (speed - 32) / 40)) * 0.55 + (boost ? 0.5 : 0);
    u.uAmount.value += (a - u.uAmount.value) * Math.min(1, dt * 4);
    u.uColor.value.setRGB(boost ? 0.55 : 1, boost ? 0.75 : 1, 1);
    this.mesh.position.copy(camera.position); this.mesh.quaternion.copy(camera.quaternion); this.mesh.updateMatrixWorld();
    this.mesh.visible = u.uAmount.value > 0.01 && this.geo.instanceCount > 0;
  }
  dispose() { this.geo.dispose(); this.mat.dispose(); }
}

/** Nitrous/boost flame cone (points along local -X from its origin). */
export function flameMesh(radius = 0.05) {
  const geo = new THREE.ConeGeometry(radius * 1.9, 1, 16, 8, true); geo.rotateZ(Math.PI / 2); geo.translate(-0.5, 0, 0);
  const mat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uPower: { value: 0 }, uBlue: { value: 1 } },
    vertexShader: /* glsl */`
      varying vec3 vP; varying vec3 vN; varying vec3 vV; uniform float uTime;
      void main() {
        vP = position; vec4 wp = modelMatrix * vec4( position, 1.0 );
        vN = normalize( mat3( modelMatrix ) * normal ); vV = normalize( cameraPosition - wp.xyz );
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: /* glsl */`
      uniform float uTime, uPower, uBlue; varying vec3 vP; varying vec3 vN; varying vec3 vV;
      float h( float x ) { return fract( sin( x ) * 43758.5453 ); }
      float n1( float x ) { float i = floor( x ), f = fract( x ); return mix( h( i ), h( i + 1.0 ), f * f * ( 3.0 - 2.0 * f ) ); }
      void main() {
        float t = clamp( -vP.x, 0.0, 1.0 ); // 0 at nozzle, 1 at tip
        float rim = abs( dot( normalize( vN ), normalize( vV ) ) );
        float flick = 0.7 + 0.3 * n1( uTime * 40.0 + vP.x * 12.0 );
        float shock = 0.6 + 0.4 * sin( t * 38.0 - uTime * 60.0 );
        vec3 core = vec3( 0.75, 0.9, 1.0 ), mid = mix( vec3( 1.0, 0.45, 0.1 ), vec3( 0.15, 0.35, 1.0 ), uBlue ), tip = mix( vec3( 1.0, 0.2, 0.02 ), vec3( 0.55, 0.1, 1.0 ), uBlue );
        vec3 c = mix( core, mid, smoothstep( 0.0, 0.35, t ) ); c = mix( c, tip, smoothstep( 0.4, 1.0, t ) );
        float a = pow( rim, 1.5 ) * pow( 1.0 - t, 1.3 ) * flick * mix( 1.0, shock, 0.35 );
        gl_FragColor = vec4( c * a * 9.0 * uPower, 1.0 );
      }`,
    blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, side: THREE.DoubleSide,
  });
  const m = new THREE.Mesh(geo, mat); m.frustumCulled = false; m.renderOrder = 9; m.userData.fxNoGBuffer = true; m.visible = false;
  return m;
}
