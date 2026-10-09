// Environment-specific track dressing generated from the §6 track: sodium streetlights with
// light pools, neon signs, distant city / tower skyline, WipEout-style neon edge strips, corner
// chevrons, holographic billboards and speed gates. All coordinates via the sim→three mapping
// (three.x = sim.x, three.y = sim.z, three.z = -sim.y).
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { glowTexture, neonSignTexture, SIGN_COUNT, chevronTexture, holoTexture } from './textures.js';
import { injectFxLights } from './lights.js';

function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const SIGN_COLORS = [0xff2bd6, 0x29e7ff, 0xffb020, 0x7cff4f, 0xff2b4a, 0xa05bff];

/** Billboarded additive glow sprites (instanced). colour per instance via instanceColor. */
export function glowSprites(count, { size = 3, intensity = 6, fogScale = 0.5 } = {}) {
  const geo = new THREE.PlaneGeometry(1, 1);
  const mat = new THREE.ShaderMaterial({
    uniforms: { map: { value: glowTexture() }, uIntensity: { value: intensity }, fogColor: { value: new THREE.Color() }, fogDensity: { value: 0 }, uFogScale: { value: fogScale } },
    vertexShader: /* glsl */`
      varying vec2 vUv; varying vec3 vCol; varying float vFog;
      uniform float fogDensity, uFogScale;
      void main() {
        vUv = uv;
        #ifdef USE_INSTANCING_COLOR
          vCol = instanceColor;
        #else
          vCol = vec3( 1.0 );
        #endif
        vec4 c = modelViewMatrix * instanceMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
        float s = length( instanceMatrix[ 0 ].xyz );
        float d = -c.z;
        s *= 1.0 + max( d - 60.0, 0.0 ) * 0.006; // keep distant lamps readable
        c.xy += position.xy * s;
        gl_Position = projectionMatrix * c;
        vFog = exp( - fogDensity * uFogScale * d );
      }`,
    fragmentShader: /* glsl */`
      uniform sampler2D map; uniform float uIntensity; varying vec2 vUv; varying vec3 vCol; varying float vFog;
      void main() {
        float a = texture2D( map, vUv ).r;
        gl_FragColor = vec4( vCol * a * uIntensity * vFog, 1.0 );
      }`,
    blending: THREE.AdditiveBlending, transparent: true, depthWrite: false,
  });
  const m = new THREE.InstancedMesh(geo, mat, Math.max(1, count)); m.frustumCulled = false; m.renderOrder = 6; m.count = 0;
  m.userData.fxNoGBuffer = true; m.name = 'fx-glow'; m.size = size;
  return m;
}

export function buildDressing(track, def, q, lights, seed = 7) {
  const group = new THREE.Group(); group.name = 'fx-dressing';
  const updaters = []; const disposables = [];
  const S = track.samples; const n = S.n; const ds = S.ds;
  const r = rng(seed);
  const qq = { s: 0, offset: 0, height: 0, nx: 0, ny: 0, nz: 1, surface: 0, index: -1 };
  const dens = q.dressing ?? 1;
  const curv = new Float32Array(n);
  for (let i = 0; i < n; i++) { let c = 0; for (let k = -8; k <= 8; k++) c += S.curvature ? S.curvature[(i + k + n) % n] : 0; curv[i] = c / 17; }
  const P = (i, off, lift = 0, out = new THREE.Vector3()) => {
    const x = S.x[i] + S.nx[i] * off, y = S.y[i] + S.ny[i] * off; track.query(x, y, i, qq); return out.set(x, qq.height + lift, -y);
  };
  /** true if a point at lateral offset `off` from sample i is clear of every track section by `margin` metres */
  const clear = (i, off, margin) => {
    const x = S.x[i] + S.nx[i] * off, y = S.y[i] + S.ny[i] * off; track.query(x, y, -1, qq);
    const k = qq.index; const w = qq.offset >= 0 ? S.widthL[k] : S.widthR[k];
    return Math.abs(qq.offset) >= w + margin - 0.05;
  };
  const toRoad = (i, side) => new THREE.Vector3(-side * S.nx[i], 0, side * S.ny[i]); // three dir from that side toward centre
  const yawFacing = (d) => Math.atan2(d.x, d.z); // rotation.y that maps local +Z to d
  const edge = (i, side) => (side > 0 ? S.widthL[i] : S.widthR[i]);
  const m4 = new THREE.Matrix4(), qt = new THREE.Quaternion(), sc = new THREE.Vector3(), Y = new THREE.Vector3(0, 1, 0);
  let bounds = null;
  { let a = Infinity, b = -Infinity, c = Infinity, d = -Infinity; for (let i = 0; i < n; i++) { a = Math.min(a, S.x[i]); b = Math.max(b, S.x[i]); c = Math.min(c, S.y[i]); d = Math.max(d, S.y[i]); } bounds = { cx: (a + b) / 2, cy: (c + d) / 2, half: Math.max(b - a, d - c) / 2 }; }

  // ------------------------------------------------------------ sodium streetlights
  if (def.streetlights) {
    const spacing = 34 / Math.max(0.3, dens); const step = Math.max(1, Math.round(spacing / ds));
    const spots = [];
    let side = 1;
    for (let i = 0; i < n; i += step) {
      side = -side; let s2 = side;
      const off0 = edge(i, s2) + 2.4;
      if (!clear(i, s2 * off0, 1.6)) { s2 = -s2; if (!clear(i, s2 * (edge(i, s2) + 2.4), 1.6)) continue; }
      spots.push({ i, side: s2 });
    }
    const H = 9.5, ARM = 2.8;
    const pole = new THREE.CylinderGeometry(0.09, 0.14, H, 8); pole.translate(0, H / 2, 0);
    const arm = new THREE.CylinderGeometry(0.05, 0.06, ARM, 6); arm.rotateX(Math.PI / 2); arm.translate(0, H - 0.1, ARM / 2);
    const head = new THREE.BoxGeometry(0.42, 0.16, 0.9); head.translate(0, H - 0.12, ARM + 0.2);
    const poleGeo = mergeGeometries([pole, arm, head]);
    const lens = new THREE.BoxGeometry(0.34, 0.03, 0.78); lens.translate(0, H - 0.21, ARM + 0.2);
    const poleMat = injectFxLights(new THREE.MeshStandardMaterial({ color: 0x3a3d42, roughness: 0.45, metalness: 0.8 }));
    const lensMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffb060).multiplyScalar(14) });
    const poles = new THREE.InstancedMesh(poleGeo, poleMat, spots.length); poles.castShadow = true;
    const lenses = new THREE.InstancedMesh(lens, lensMat, spots.length);
    const glows = glowSprites(spots.length, { intensity: 3.2 });
    const glowCol = new THREE.Color(0xff9a40);
    const cones = q.cones ? coneMesh(spots.length, H - 0.25, 6.0, 0xff9a40) : null;
    const base = new THREE.Vector3(), lampW = new THREE.Vector3();
    spots.forEach((sp, k) => {
      const d = toRoad(sp.i, sp.side); const yaw = yawFacing(d);
      P(sp.i, sp.side * (edge(sp.i, sp.side) + 2.4), -0.05, base);
      qt.setFromAxisAngle(Y, yaw); sc.set(1, 1, 1); m4.compose(base, qt, sc);
      poles.setMatrixAt(k, m4); lenses.setMatrixAt(k, m4);
      lampW.set(0, H - 0.3, ARM + 0.2).applyQuaternion(qt).add(base);
      m4.compose(lampW, qt, sc.setScalar(3.4)); glows.setMatrixAt(k, m4); glows.setColorAt(k, glowCol);
      if (cones) { m4.compose(lampW, qt, sc.set(1, 1, 1)); cones.setMatrixAt(k, m4); }
      const dir = new THREE.Vector3(0, -1, 0).addScaledVector(d, 0.25).normalize();
      lights.add({ pos: lampW.clone(), dir, color: 0xffa04a, intensity: 120, range: 34, angle: 1.2, penumbra: 0.55, decay: 1.5, group });
    });
    glows.count = spots.length;
    group.add(poles, lenses, glows); if (cones) group.add(cones);
    disposables.push(poleGeo, lens, poleMat, lensMat);
  }

  // ------------------------------------------------------------ neon signs
  if (def.neon) {
    const spacing = 170 / Math.max(0.3, dens); const step = Math.max(1, Math.round(spacing / ds));
    const boardGeo = new THREE.PlaneGeometry(10, 3.75); const frameGeo = new THREE.BoxGeometry(10.4, 4.1, 0.3); frameGeo.translate(0, 0, -0.18);
    const postGeo = new THREE.CylinderGeometry(0.12, 0.12, 4, 6); postGeo.translate(0, -2, 0);
    const frameMat = injectFxLights(new THREE.MeshStandardMaterial({ color: 0x15161a, roughness: 0.5, metalness: 0.6 }));
    const mats = [];
    let k = 0;
    for (let i = Math.round(step / 2); i < n; i += step, k++) {
      const side = (k % 2) ? 1 : -1; const off = side * (edge(i, side) + 8.5);
      if (!clear(i, off, 6)) continue;
      const ti = k % SIGN_COUNT;
      if (!mats[ti]) {
        const t = neonSignTexture(ti); t.anisotropy = q.anisotropy || 4;
        mats[ti] = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 7, roughness: 0.6 });
      }
      const g = new THREE.Group(); P(i, off, 0, g.position); const d = toRoad(i, side);
      // face the road, angled toward oncoming traffic
      const t = new THREE.Vector3(S.tx[i], 0, -S.ty[i]).normalize();
      g.rotation.y = yawFacing(d.clone().addScaledVector(t, 0.6).normalize());
      const board = new THREE.Mesh(boardGeo, mats[ti]); board.position.y = 5.6; g.add(board);
      const frame = new THREE.Mesh(frameGeo, frameMat); frame.position.y = 5.6; frame.castShadow = true; g.add(frame);
      for (const sx of [-3.5, 3.5]) { const p = new THREE.Mesh(postGeo, frameMat); p.position.set(sx, 3.8, -0.2); g.add(p); }
      group.add(g);
      g.updateMatrixWorld(true);
      const lp = new THREE.Vector3(0, 5.6, 1.5).applyMatrix4(g.matrixWorld);
      const ld = new THREE.Vector3(0, -0.35, 1).applyQuaternion(g.quaternion).normalize();
      lights.add({ pos: lp, dir: ld, color: SIGN_COLORS[ti], intensity: 55, range: 22, angle: 1.35, penumbra: 0.8, decay: 1.4, priority: 0.8, group });
    }
    disposables.push(boardGeo, frameGeo, postGeo, frameMat, ...mats.filter(Boolean));
  }

  // ------------------------------------------------------------ skyline
  if (def.skyline && q.skyline !== false) {
    const towers = def.skyline === 'towers';
    const N = Math.round((towers ? 160 : 260) * Math.max(0.4, dens));
    const R0 = bounds.half + 420, R1 = bounds.half + (towers ? 1100 : 1000);
    const geo = new THREE.BoxGeometry(1, 1, 1); geo.translate(0, 0.5, 0);
    const mat = skylineMaterial(towers);
    const m = new THREE.InstancedMesh(geo, mat, N); m.frustumCulled = false; m.name = 'fx-skyline';
    for (let k = 0; k < N; k++) {
      const a = r() * Math.PI * 2; const rad = R0 + Math.pow(r(), 0.7) * (R1 - R0);
      const x = bounds.cx + Math.cos(a) * rad, y = bounds.cy + Math.sin(a) * rad;
      const w = towers ? 18 + r() * 30 : 25 + r() * 55, d = towers ? 18 + r() * 30 : 25 + r() * 50;
      const h = towers ? 80 + Math.pow(r(), 1.5) * 380 : 30 + Math.pow(r(), 2.2) * 230;
      qt.setFromAxisAngle(Y, r() * Math.PI); m4.compose(new THREE.Vector3(x, -5, -y), qt, sc.set(w, h, d)); m.setMatrixAt(k, m4);
    }
    group.add(m); disposables.push(geo, mat);
    updaters.push((dt, cam, scene) => { const f = scene.fog; if (f) { mat.uniforms.fogColor.value.copy(f.color); mat.uniforms.fogDensity.value = f.density; } mat.uniforms.uTime.value += dt; });
  }

  // ------------------------------------------------------------ neon edge strips (futuristic)
  if (def.edgeStrips) {
    const cols = [new THREE.Color(0xff2bd6), new THREE.Color(0x29e7ff)];
    const pos = [], col = [], sAttr = [], ind = [];
    let vb = 0;
    for (let side = 0; side < 2; side++) {
      const sg = side === 0 ? 1 : -1; const c = cols[side];
      const parts = [[0.35, 0.02, 0.42], [-0.55, 0.012, 0.012]]; // [offset beyond edge, y0, y1]: vertical rail + flat road line
      for (const [dOff, y0, y1] of parts) {
        const flat = y0 === y1; const start = vb;
        for (let rr = 0; rr <= n; rr++) {
          const i = rr % n; const off = sg * (edge(i, sg > 0 ? 1 : -1) + dOff);
          const p = P(i, off, 0);
          if (flat) {
            const p2 = P(i, off - sg * 0.16, 0);
            pos.push(p.x, p.y + y0, p.z, p2.x, p2.y + y0, p2.z);
          } else pos.push(p.x, p.y + y0, p.z, p.x, p.y + y1, p.z);
          col.push(c.r, c.g, c.b, c.r, c.g, c.b); sAttr.push(rr * ds, rr * ds); vb += 2;
        }
        for (let rr = 0; rr < n; rr++) { const a = start + rr * 2; ind.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
      }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setAttribute('sAlong', new THREE.Float32BufferAttribute(sAttr, 1)); g.setIndex(ind);
    const mat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uIntensity: { value: 9 } },
      vertexShader: 'attribute float sAlong; attribute vec3 color; varying vec3 vC; varying float vS; void main(){ vC = color; vS = sAlong; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: `uniform float uTime, uIntensity; varying vec3 vC; varying float vS;
        void main(){ float pulse = pow( fract( vS / 60.0 - uTime * 1.2 ), 10.0 ); float seg = 0.75 + 0.25 * step( 0.5, fract( vS / 4.0 ) );
        gl_FragColor = vec4( vC * uIntensity * ( seg * 0.6 + pulse * 2.2 ), 1.0 ); }`,
      side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4,
    });
    const strip = new THREE.Mesh(g, mat); strip.name = 'fx-edge-strips'; strip.frustumCulled = false; group.add(strip);
    disposables.push(g, mat);
    updaters.push((dt) => { mat.uniforms.uTime.value += dt; });
    // coloured spill lights along the edges
    const step = Math.max(1, Math.round((26 / Math.max(0.3, dens)) / ds));
    for (let i = 0; i < n; i += step) for (const sg of [1, -1]) {
      lights.add({ pos: P(i, sg * (edge(i, sg) + 0.2), 0.6), color: sg > 0 ? 0xff2bd6 : 0x29e7ff, intensity: 9, range: 11, decay: 1.6, priority: 0.55, group });
    }
  }

  // ------------------------------------------------------------ corner chevrons
  if (def.edgeStrips || def.streetlights) {
    const tex = chevronTexture().clone(); tex.needsUpdate = true; tex.wrapS = THREE.RepeatWrapping; tex.repeat.set(1, 1);
    const fut = !!def.edgeStrips;
    const mat = new THREE.MeshStandardMaterial({ color: fut ? 0x000000 : 0x181818, emissive: fut ? 0xff2bd6 : 0xffffff, emissiveMap: tex, emissiveIntensity: fut ? 8 : 0.0, map: fut ? null : tex, roughness: 0.4, side: THREE.DoubleSide });
    if (!fut) { mat.color.set(0xffffff); mat.map = chevronBoardTexture(); mat.emissiveMap = null; mat.emissive.set(0x000000); }
    injectFxLights(mat);
    const geo = new THREE.PlaneGeometry(2.6, 0.9);
    const postGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.0, 5); postGeo.translate(0, -0.95, 0);
    const spots = [];
    const step = Math.max(1, Math.round(11 / ds)); let last = -1e9;
    for (let i = 0; i < n; i += step) {
      const c = curv[i]; if (Math.abs(c) < 1 / 130) continue;
      const side = c > 0 ? -1 : 1; const off = side * (edge(i, side) + 3.2);
      if (!clear(i, off, 2.0)) continue;
      spots.push({ i, side, off }); last = i;
    }
    void last;
    const boards = new THREE.InstancedMesh(geo, mat, Math.max(1, spots.length)); boards.count = spots.length;
    const posts = new THREE.InstancedMesh(postGeo, new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.6 }), Math.max(1, spots.length)); posts.count = spots.length;
    const tmp = new THREE.Vector3();
    spots.forEach((sp, k) => {
      const d = toRoad(sp.i, sp.side); const t = new THREE.Vector3(S.tx[sp.i], 0, -S.ty[sp.i]).normalize();
      P(sp.i, sp.off, 1.45, tmp);
      // plane +Z faces the road (rotated a bit toward oncoming cars); its +X must point along travel
      const face = d.clone().addScaledVector(t, -0.5).normalize();
      const mx = new THREE.Matrix4().lookAt(new THREE.Vector3(), face.clone().negate(), Y); qt.setFromRotationMatrix(mx);
      const xAxis = new THREE.Vector3(1, 0, 0).applyQuaternion(qt);
      const flip = xAxis.dot(t) < 0 ? -1 : 1;
      m4.compose(tmp, qt, sc.set(flip, 1, 1)); boards.setMatrixAt(k, m4); posts.setMatrixAt(k, m4);
    });
    group.add(boards, posts); disposables.push(geo, postGeo, mat, tex);
    if (fut) updaters.push((dt) => { tex.offset.x -= dt * 1.6; });
  }

  // ------------------------------------------------------------ holo billboards + speed gates (futuristic)
  if (def.edgeStrips) {
    const step = Math.max(1, Math.round((330 / Math.max(0.3, dens)) / ds)); let k = 0;
    const holoMats = [];
    const geo = new THREE.PlaneGeometry(16, 8);
    for (let i = Math.round(step / 3); i < n; i += step, k++) {
      const side = k % 2 ? 1 : -1; const off = side * (edge(i, side) + 13);
      if (!clear(i, off, 9)) continue;
      const hm = holoMats[k % 4] || (holoMats[k % 4] = holoMaterial(k % 4));
      const m = new THREE.Mesh(geo, hm); P(i, off, 8.5, m.position);
      const d = toRoad(i, side); const t = new THREE.Vector3(S.tx[i], 0, -S.ty[i]).normalize();
      m.rotation.y = yawFacing(d.clone().addScaledVector(t, -0.7).normalize()); m.userData.fxNoGBuffer = true; m.renderOrder = 7;
      group.add(m);
    }
    updaters.push((dt) => { for (const hm of holoMats) if (hm) hm.uniforms.uTime.value += dt; });
    disposables.push(geo);
    // speed gates over straights
    const gateMat = injectFxLights(new THREE.MeshStandardMaterial({ color: 0x1a1c24, roughness: 0.25, metalness: 0.9 }));
    const glowMatA = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x29e7ff).multiplyScalar(10) });
    const glowMatB = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff2bd6).multiplyScalar(10) });
    const gstep = Math.max(1, Math.round((420 / Math.max(0.3, dens)) / ds)); let gk = 0;
    for (let i = Math.round(gstep * 0.7); i < n; i += gstep) {
      if (Math.abs(curv[i]) > 1 / 300) continue;
      const wl = S.widthL[i] + 2.2, wr = S.widthR[i] + 2.2;
      if (!clear(i, wl, 0.8) || !clear(i, -wr, 0.8)) continue;
      const g = new THREE.Group(); const a = P(i, wl, 0), b = P(i, -wr, 0);
      g.position.copy(a).add(b).multiplyScalar(0.5); const span = a.distanceTo(b);
      g.rotation.y = Math.atan2(S.tx[i], -S.ty[i]) - Math.PI / 2; // local X along track, Z across
      const t = new THREE.Vector3(S.tx[i], 0, -S.ty[i]).normalize(); g.rotation.y = Math.atan2(t.x, t.z) + Math.PI / 2;
      const H = 8.5;
      for (const sz of [-span / 2, span / 2]) {
        const p = new THREE.Mesh(new THREE.BoxGeometry(0.9, H, 0.9), gateMat); p.position.set(0, H / 2, sz); p.castShadow = true; g.add(p);
        const l = new THREE.Mesh(new THREE.BoxGeometry(0.12, H * 0.92, 0.12), (gk % 2) ? glowMatB : glowMatA); l.position.set(-0.47, H / 2, sz); g.add(l);
      }
      const beam = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.0, span + 0.9), gateMat); beam.position.set(0, H, 0); beam.castShadow = true; g.add(beam);
      for (const yy of [H - 0.55, H + 0.55]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, span + 0.9), (gk % 2) ? glowMatA : glowMatB); l.position.set(-0.62, yy, 0); g.add(l); }
      group.add(g); gk++;
      lights.add({ pos: g.position.clone().setY(g.position.y + H - 0.8), dir: new THREE.Vector3(0, -1, 0), color: (gk % 2) ? 0x29e7ff : 0xff2bd6, intensity: 70, range: 22, angle: 1.3, penumbra: 0.7, decay: 1.4, priority: 0.9, group });
    }
    disposables.push(gateMat, glowMatA, glowMatB);
  }

  return {
    group,
    update(dt, camera, scene) {
      for (const u of updaters) u(dt, camera, scene);
      const f = scene.fog;
      group.traverse((o) => { if (o.name === 'fx-glow' && f) { o.material.uniforms.fogDensity.value = f.density; } });
    },
    dispose() {
      lights.removeGroup(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material && o.material.dispose) o.material.dispose(); });
      for (const d of disposables) d.dispose && d.dispose();
    },
  };
}

function chevronBoardTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 96; const g = c.getContext('2d');
  g.fillStyle = '#d01818'; g.fillRect(0, 0, 256, 96); g.fillStyle = '#ffffff';
  for (let k = 0; k < 3; k++) { const x = k * 84 + 14; g.beginPath(); g.moveTo(x, 10); g.lineTo(x + 26, 10); g.lineTo(x + 56, 48); g.lineTo(x + 26, 86); g.lineTo(x, 86); g.lineTo(x + 30, 48); g.closePath(); g.fill(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}

/** Faint additive light cones under lamps (instanced). */
function coneMesh(count, h, r, color) {
  const geo = new THREE.CylinderGeometry(0.25, r, h, 20, 1, true); geo.translate(0, -h / 2, 0);
  const mat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) }, uIntensity: { value: 0.05 }, uH: { value: h } },
    vertexShader: /* glsl */`
      varying float vY; varying vec3 vN; varying vec3 vV;
      void main() {
        vY = -position.y;
        vec4 wp = modelMatrix * instanceMatrix * vec4( position, 1.0 );
        vN = normalize( mat3( modelMatrix * instanceMatrix ) * normal );
        vV = normalize( cameraPosition - wp.xyz );
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uColor; uniform float uIntensity, uH; varying float vY; varying vec3 vN; varying vec3 vV;
      void main() {
        float f = abs( dot( normalize( vN ), normalize( vV ) ) );
        float a = pow( f, 2.0 ) * pow( 1.0 - clamp( vY / uH, 0.0, 1.0 ), 1.5 ) * uIntensity;
        gl_FragColor = vec4( uColor * a, 1.0 );
      }`,
    blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, side: THREE.DoubleSide,
  });
  const m = new THREE.InstancedMesh(geo, mat, Math.max(1, count)); m.frustumCulled = false; m.renderOrder = 4; m.userData.fxNoGBuffer = true; m.name = 'fx-cones';
  return m;
}

function skylineMaterial(towers) {
  return new THREE.ShaderMaterial({
    uniforms: { fogColor: { value: new THREE.Color() }, fogDensity: { value: 0.001 }, uTime: { value: 0 }, uTowers: { value: towers ? 1 : 0 } },
    vertexShader: /* glsl */`
      varying vec3 vP; varying vec3 vN; varying vec3 vSize; varying float vId; varying float vDist;
      void main() {
        vSize = vec3( length( instanceMatrix[ 0 ].xyz ), length( instanceMatrix[ 1 ].xyz ), length( instanceMatrix[ 2 ].xyz ) );
        vP = position * vSize; vN = normal; vId = float( gl_InstanceID );
        vec4 mv = modelViewMatrix * instanceMatrix * vec4( position, 1.0 );
        vDist = -mv.z; gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 fogColor; uniform float fogDensity, uTime, uTowers;
      varying vec3 vP; varying vec3 vN; varying vec3 vSize; varying float vId; varying float vDist;
      float h21( vec2 p ) { return fract( sin( dot( p, vec2( 127.1, 311.7 ) ) ) * 43758.5453 ); }
      void main() {
        vec3 col = vec3( 0.006, 0.007, 0.012 );
        if ( abs( vN.y ) < 0.5 ) {
          float u = abs( vN.x ) > 0.5 ? vP.z : vP.x;
          vec2 cell = floor( vec2( u / 2.6, vP.y / 3.4 ) ); vec2 f = fract( vec2( u / 2.6, vP.y / 3.4 ) );
          float lit = step( 0.58, h21( cell + vId * 13.1 ) ) * step( 0.5, h21( floor( cell / vec2( 6.0, 4.0 ) ) + vId ) + 0.35 );
          float win = step( 0.2, f.x ) * step( f.x, 0.8 ) * step( 0.25, f.y ) * step( f.y, 0.75 );
          float hue = h21( cell.yx + vId );
          vec3 wc = hue < 0.65 ? vec3( 1.0, 0.62, 0.3 ) : hue < 0.9 ? vec3( 0.55, 0.75, 1.0 ) : vec3( 1.0, 0.35, 0.8 );
          col += wc * win * lit * 1.6 * ( 0.6 + 0.4 * h21( cell * 1.7 ) );
          if ( uTowers > 0.5 ) {
            float edgeU = min( abs( u ), 1e3 );
            float top = smoothstep( 1.2, 0.0, vSize.y - vP.y );
            vec3 nc = mod( vId, 2.0 ) < 1.0 ? vec3( 1.0, 0.17, 0.84 ) : vec3( 0.16, 0.9, 1.0 );
            col += nc * top * 6.0;
            col += nc * 2.5 * step( 0.97, fract( vP.y / 24.0 + vId * 0.37 ) );
          }
        }
        // aircraft warning beacon on tall buildings
        if ( vN.y > 0.5 && vSize.y > 140.0 ) col += vec3( 4.0, 0.2, 0.1 ) * step( 0.5, fract( uTime * 0.5 + vId * 0.13 ) ) * step( length( vP.xz ), 2.0 );
        float fog = 1.0 - exp( - fogDensity * 0.45 * vDist );
        gl_FragColor = vec4( mix( col, fogColor * 1.3, fog ), 1.0 );
      }`,
  });
}

function holoMaterial(i) {
  return new THREE.ShaderMaterial({
    uniforms: { map: { value: holoTexture(i) }, uTime: { value: i * 1.7 }, uColor: { value: new THREE.Color(i % 2 ? 0xff5ae0 : 0x5ae8ff) } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: /* glsl */`
      uniform sampler2D map; uniform float uTime; uniform vec3 uColor; varying vec2 vUv;
      void main() {
        vec2 uv = vUv; float glitch = step( 0.985, fract( sin( floor( uTime * 12.0 ) * 91.7 ) * 4375.5 ) );
        uv.x += glitch * 0.03 * sin( uv.y * 80.0 );
        vec3 t = texture2D( map, uv ).rgb;
        float scan = 0.65 + 0.35 * sin( uv.y * 300.0 - uTime * 8.0 );
        float flick = 0.85 + 0.15 * sin( uTime * 23.0 ) * sin( uTime * 7.3 );
        float edge = smoothstep( 0.0, 0.04, uv.x ) * smoothstep( 1.0, 0.96, uv.x ) * smoothstep( 0.0, 0.06, uv.y ) * smoothstep( 1.0, 0.94, uv.y );
        vec3 c = ( t * 2.2 + uColor * 0.06 ) * scan * flick * edge;
        gl_FragColor = vec4( c * 2.5, 1.0 );
      }`,
    blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, side: THREE.DoubleSide,
  });
}
