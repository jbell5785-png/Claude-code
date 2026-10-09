// Builds the 3D environment for a §6 track: road ribbon, kerbs, runoff (grass/gravel from track.query),
// distant terrain, start/finish line, gantry, grandstands, barriers, trees.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { SURFACE } from '../simapi.js';
import { asphaltTexture, asphaltRoughness, kerbTexture, groundDetailTexture, chequerTexture, bannerTexture, crowdTexture } from './textures.js';

const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

const GRASS_A = new THREE.Color('#4f7a32'), GRASS_B = new THREE.Color('#6b8f3a'), GRAVEL = new THREE.Color('#b9a582'), ASPH = new THREE.Color('#55575b'), KERB = new THREE.Color('#c44');
const FAR = new THREE.Color('#5b7d3c');

/** Sample accessor with wrap-around. */
function S(track) { return track.samples; }

export function buildTrackScene(track, opts = {}) {
  const t0 = performance.now();
  const group = new THREE.Group(); group.name = 'track';
  const s = S(track); const n = s.n; const closed = track.closed !== false;
  const q = { s: 0, offset: 0, height: 0, nx: 0, ny: 0, nz: 1, surface: 0, index: 0 };
  const qh = (x, y, hint) => { track.query(x, y, hint, q); return q; };
  const lowDetail = !!opts.lowDetail;

  const N = closed ? n + 1 : n; // vertex rings (duplicate the first to close the loop)
  const idx = (i) => (i % n + n) % n;
  const curvSm = new Float32Array(n);
  for (let i = 0; i < n; i++) { let c = 0; for (let k = -5; k <= 5; k++) c += s.curvature ? s.curvature[idx(i + k)] : 0; curvSm[i] = c / 11; }

  // ---------------- road ribbon
  {
    const M = 10; const pos = [], uv = [], ind = [];
    for (let r = 0; r < N; r++) {
      const i = idx(r); const wl = s.widthL[i], wr = s.widthR[i];
      for (let k = 0; k <= M; k++) {
        const off = -wr + (wl + wr) * (k / M);
        const x = s.x[i] + s.nx[i] * off, y = s.y[i] + s.ny[i] * off; qh(x, y, i);
        pos.push(x, q.height + 0.004, -y); uv.push(k / M, (r * s.ds) / 12);
      }
    }
    for (let r = 0; r < N - 1; r++) for (let k = 0; k < M; k++) {
      const a = r * (M + 1) + k, b = a + M + 1; ind.push(a, b, a + 1, a + 1, b, b + 1);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(ind); g.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({ map: asphaltTexture(), roughnessMap: asphaltRoughness(), roughness: 0.92, metalness: 0.0,
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    const road = new THREE.Mesh(g, mat); road.receiveShadow = true; road.name = 'road'; group.add(road);
  }

  // ---------------- kerbs (where query reports SURFACE.KERB just outside the edge)
  const kerbW = [new Float32Array(n), new Float32Array(n)]; // [left, right] width in m
  for (let i = 0; i < n; i++) {
    for (let side = 0; side < 2; side++) {
      const sg = side === 0 ? 1 : -1; const edge = side === 0 ? s.widthL[i] : s.widthR[i];
      let w = 0;
      for (let d = 0.15; d < 3.2; d += 0.2) {
        const off = sg * (edge + d); qh(s.x[i] + s.nx[i] * off, s.y[i] + s.ny[i] * off, i);
        if (q.surface === SURFACE.KERB) w = d + 0.1; else if (d > 0.5) break;
      }
      kerbW[side][i] = w;
    }
  }
  {
    const pos = [], uv = [], ind = []; let vbase = 0;
    for (let side = 0; side < 2; side++) {
      const sg = side === 0 ? 1 : -1; let run = [];
      const flush = () => {
        if (run.length >= 2) {
          const P = 4; // profile points across
          for (const r of run) {
            const i = idx(r); const edge = side === 0 ? s.widthL[i] : s.widthR[i]; const w = Math.max(kerbW[side][i], 0.6);
            for (let k = 0; k <= P; k++) {
              const f = k / P; const off = sg * (edge - 0.05 + w * f);
              const x = s.x[i] + s.nx[i] * off, y = s.y[i] + s.ny[i] * off; qh(x, y, i);
              const lift = 0.012 + Math.sin(f * Math.PI) * 0.035 * (f < 0.85 ? 1 : 0.5);
              pos.push(x, q.height + lift, -y); uv.push(f, (r * s.ds) / 2.0);
            }
          }
          for (let j = 0; j < run.length - 1; j++) for (let k = 0; k < P; k++) {
            const a = vbase + j * (P + 1) + k, b = a + P + 1;
            if (sg > 0) ind.push(a, b, a + 1, a + 1, b, b + 1); else ind.push(a, a + 1, b, a + 1, b + 1, b);
          }
          vbase += run.length * (P + 1);
        }
        run = [];
      };
      for (let r = 0; r <= N; r++) {
        const i = idx(r);
        if (r < N && kerbW[side][i] > 0) { run.push(r); } else { if (run.length) { run.unshift(run[0] - 1); run.push(run[run.length - 1] + 1); } flush(); }
      }
    }
    if (pos.length) {
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(ind); g.computeVertexNormals();
      const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: kerbTexture(), roughness: 0.7, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3, side: THREE.DoubleSide }));
      m.receiveShadow = true; m.name = 'kerbs'; group.add(m);
    }
  }

  // ---------------- runoff ribbon (vertex coloured by surface)
  const RUN = lowDetail ? 30 : 46; const offs = [];
  for (let d = 0; d <= RUN; d += d < 16 ? 0.8 : 3) offs.push(d);
  const groundMat = new THREE.MeshStandardMaterial({ map: groundDetailTexture(), vertexColors: true, roughness: 1, metalness: 0 });
  const tmpC = new THREE.Color(); const rand = rng(42);
  const surfColor = (surf, x, y, far) => {
    if (surf === SURFACE.GRAVEL) { tmpC.copy(GRAVEL); tmpC.offsetHSL(0, 0, (rand() - 0.5) * 0.04); }
    else if (surf === SURFACE.ASPHALT) tmpC.copy(ASPH);
    else if (surf === SURFACE.KERB) tmpC.copy(KERB);
    else {
      const m = 0.5 + 0.5 * Math.sin(x * 0.045 + Math.cos(y * 0.03) * 2) * Math.cos(y * 0.05);
      tmpC.copy(GRASS_A).lerp(GRASS_B, m); if (far) tmpC.lerp(FAR, 0.4);
      // mown stripes near the track
      if (!far) tmpC.offsetHSL(0, 0, ((Math.floor((x + y) / 9) & 1) ? 0.018 : -0.012));
    }
    return tmpC;
  };
  {
    const pos = [], col = [], uv = [], ind = []; let vb = 0;
    for (let side = 0; side < 2; side++) {
      const sg = side === 0 ? 1 : -1; const K = offs.length;
      for (let r = 0; r < N; r++) {
        const i = idx(r); const edge = side === 0 ? s.widthL[i] : s.widthR[i];
        const inside = Math.sign(curvSm[i]) === sg && Math.abs(curvSm[i]) > 1e-4;
        const ext = s.edgeL ? Math.min(RUN, (sg > 0 ? s.edgeL[i] : s.edgeR[i]) + 8) : RUN;
        const maxOff = inside ? Math.min(ext, 0.85 / Math.abs(curvSm[i]) - edge) : ext;
        for (let k = 0; k < K; k++) {
          const d = Math.min(offs[k], Math.max(0.5, maxOff)); const off = sg * (edge - 0.1 + d);
          const x = s.x[i] + s.nx[i] * off, y = s.y[i] + s.ny[i] * off; qh(x, y, i);
          pos.push(x, q.height - 0.01, -y); uv.push(x / 9, y / 9);
          const c = surfColor(q.surface, x, y, false); col.push(c.r, c.g, c.b);
        }
      }
      for (let r = 0; r < N - 1; r++) for (let k = 0; k < K - 1; k++) {
        const a = vb + r * K + k, b = a + K;
        if (sg > 0) ind.push(a, b, a + 1, a + 1, b, b + 1); else ind.push(a, a + 1, b, a + 1, b + 1, b);
      }
      vb += N * K;
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(ind); g.computeVertexNormals();
    const m = new THREE.Mesh(g, groundMat); m.receiveShadow = true; m.name = 'runoff'; group.add(m);
  }

  // ---------------- distant terrain grid
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity;
  for (let i = 0; i < n; i++) { minX = Math.min(minX, s.x[i]); maxX = Math.max(maxX, s.x[i]); minY = Math.min(minY, s.y[i]); maxY = Math.max(maxY, s.y[i]); minZ = Math.min(minZ, s.z[i]); }
  const ownHills = !track.terrainHeight && !track.terrain;
  const hillsAt = (x, y, a, edge) => { if (!ownHills) return 0; const far = clamp((a - edge - RUN) / 250, 0, 1); return far * (8 * Math.sin(x * 0.006) * Math.cos(y * 0.005) + 14 * Math.max(0, Math.sin(x * 0.0021 + 1.3) * Math.cos(y * 0.0017))); };
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2; const half = Math.max(maxX - minX, maxY - minY) / 2 + 700;
  const bounds = { minX, maxX, minY, maxY, cx, cy, half, minZ };
  {
    const G = opts.terrainGrid || (lowDetail ? 70 : 120); const pos = [], col = [], uv = [], ind = [];
    let hint = -1;
    for (let j = 0; j <= G; j++) for (let i = 0; i <= G; i++) {
      const x = cx - half + (2 * half * i) / G, y = cy - half + (2 * half * j) / G;
      qh(x, y, -1); hint = q.index;
      const edge = Math.max(s.widthL[q.index] || 6, s.widthR[q.index] || 6);
      const a = Math.abs(q.offset); let h = q.height;
      const sideExt = s.edgeL ? Math.min(RUN, (q.offset >= 0 ? s.edgeL[q.index] : s.edgeR[q.index]) + 8) : RUN;
      const near = a < edge + sideExt - 2;
      const far = clamp((a - edge - RUN) / 250, 0, 1);
      h += hillsAt(x, y, a, edge);
      if (near) h -= 0.35;
      pos.push(x, h - 0.03, -y); uv.push(x / 30, y / 30);
      const c = surfColor(SURFACE.GRASS, x, y, true); c.offsetHSL(0, -0.05 * far, -0.04 * far); col.push(c.r, c.g, c.b);
    }
    for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
      const a = j * (G + 1) + i, b = a + G + 1; ind.push(a, a + 1, b, a + 1, b + 1, b);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(ind); g.computeVertexNormals();
    const m = new THREE.Mesh(g, groundMat); m.receiveShadow = true; m.name = 'terrain'; group.add(m);
    void hint;
  }

  // ---------------- start / finish line + grid boxes
  const at = (si, off, lift = 0.012) => { const i = idx(si); const x = s.x[i] + s.nx[i] * off, y = s.y[i] + s.ny[i] * off; qh(x, y, i); return new THREE.Vector3(x, q.height + lift, -y); };
  {
    const i0 = 0; const wl = s.widthL[i0], wr = s.widthR[i0];
    const g = new THREE.PlaneGeometry(wl + wr, 1.6); g.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: chequerTexture(), roughness: 0.8, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }));
    const p = at(0, (wl - wr) / 2, 0.02); m.position.copy(p);
    m.rotation.y = Math.atan2(s.ty[i0], s.tx[i0]) + Math.PI / 2; m.receiveShadow = true; group.add(m);
    // grid slot marks
    if (track.startPose) {
      const lineMat = new THREE.MeshBasicMaterial({ color: 0xf2f2ee, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
      for (let k = 0; k < 6; k++) {
        let sp; try { sp = track.startPose(k); } catch { break; }
        if (!sp) break; qh(sp.x, sp.y, -1);
        const bar = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 2.2), lineMat); bar.rotateX(-Math.PI / 2);
        const fx = Math.cos(sp.heading), fy = Math.sin(sp.heading);
        bar.position.set(sp.x + fx * 2.6, q.height + 0.02, -(sp.y + fy * 2.6)); bar.rotation.z = 0; bar.rotation.y = sp.heading; group.add(bar);
      }
    }
  }

  // ---------------- scenery (prefers track.scenery from track.js; procedural fallback otherwise)
  const sc = track.scenery || {};
  const objs = new THREE.Group(); objs.name = 'scenery'; group.add(objs);
  const outerSign = (i) => (curvSm[i] > 0 ? -1 : 1); // outside of the local bend
  const edgeAt = (i, sg) => (sg > 0 ? s.widthL[i] : s.widthR[i]);
  const barrierOff = (i, sg) => {
    let d = 6; for (let k = 2; k < 30; k += 2) { const off = sg * (edgeAt(i, sg) + k); qh(s.x[i] + s.nx[i] * off, s.y[i] + s.ny[i] * off, i); if (q.surface === SURFACE.GRAVEL) d = k + 4; }
    return edgeAt(i, sg) + Math.max(d, Math.abs(curvSm[i]) > 0.008 ? 14 : 8);
  };
  const steel = new THREE.MeshStandardMaterial({ color: 0x2b3038, roughness: 0.5, metalness: 0.7 });
  const m4 = new THREE.Matrix4();

  // gantry at start/finish
  {
    const gd = sc.gantry; let gx, gy, gz, hd, width, height;
    if (gd) { gx = gd.x; gy = gd.y; gz = gd.z ?? (qh(gd.x, gd.y, -1), q.height); hd = gd.heading; width = gd.width; height = gd.height || 6.5; }
    else { gx = s.x[0]; gy = s.y[0]; gz = s.z[0]; hd = Math.atan2(s.ty[0], s.tx[0]); width = s.widthL[0] + s.widthR[0] + 5; height = 6.5; }
    width += 2;
    const gl = new THREE.Group(); gl.position.set(gx, gz, -gy); gl.rotation.y = hd; // local x = forward, local z = right
    for (const sg of [-1, 1]) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.7, height + 1.5, 0.7), steel); c.position.set(0, (height + 1.5) / 2 - 0.5, sg * width / 2); c.castShadow = true; gl.add(c); }
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.7, width + 0.7), steel); beam.position.set(0, height + 0.2, 0); beam.castShadow = true; gl.add(beam);
    const banM = new THREE.MeshStandardMaterial({ map: bannerTexture(), roughness: 0.6 });
    for (const sg of [-1, 1]) {
      const ban = new THREE.Mesh(new THREE.PlaneGeometry(width * 0.92, 1.25), banM); ban.position.set(sg * 0.47, height + 0.2, 0); ban.rotation.y = sg < 0 ? -Math.PI / 2 : Math.PI / 2; gl.add(ban);
    }
    const lamps = new THREE.MeshStandardMaterial({ color: 0x220000, emissive: 0xff2010, emissiveIntensity: 2.2 });
    for (let k = 0; k < 5; k++) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), lamps); l.position.set(-0.5, height - 0.9, (k - 2) * 0.6); gl.add(l); }
    objs.add(gl);
  }

  // grandstands: {x,y,z,heading (direction the stand faces), length}
  const standList = [];
  const stands = Array.isArray(sc.grandstands) ? sc.grandstands : Array.isArray(sc.stands) ? sc.stands : null;
  if (stands) {
    for (const st of stands) { const z = st.z ?? (qh(st.x, st.y, -1), q.height); standList.push({ x: st.x, y: st.y, z, face: st.heading, length: st.length || 40 }); }
  } else {
    for (const [si, len, sg] of [[Math.round(-30 / s.ds), 60, 1], [Math.round(40 / s.ds), 50, 1], [Math.round(-90 / s.ds), 40, -1]]) {
      const i = idx(si); const off = sg * (barrierOff(i, sg) + 7); const p = at(i, off, 0);
      standList.push({ x: p.x, y: -p.z, z: p.y, face: Math.atan2(-sg * s.ny[i], -sg * s.nx[i]), length: len });
    }
  }
  {
    const concrete = new THREE.MeshStandardMaterial({ color: 0x9a9c9f, roughness: 0.9 });
    const crowdTex = crowdTexture();
    const roofM = new THREE.MeshStandardMaterial({ color: 0xe8e8ea, roughness: 0.5, metalness: 0.3 });
    for (const st of standList) {
      const g = new THREE.Group(); const rows = 8; const depth = 1.0, rise = 0.6;
      const crowd = new THREE.MeshStandardMaterial({ map: crowdTex.clone(), roughness: 0.9 }); crowd.map.repeat.set(st.length / 12, 1); crowd.map.needsUpdate = true;
      for (let r = 0; r < rows; r++) {
        const step = new THREE.Mesh(new THREE.BoxGeometry(st.length, rise * (r + 1), depth), concrete);
        step.position.set(0, rise * (r + 1) / 2, -(r * depth)); step.castShadow = true; step.receiveShadow = true; g.add(step);
        const people = new THREE.Mesh(new THREE.PlaneGeometry(st.length, 0.55), crowd); people.position.set(0, rise * (r + 1) + 0.27, -(r * depth) + 0.2); g.add(people);
      }
      const roof = new THREE.Mesh(new THREE.BoxGeometry(st.length + 2, 0.25, rows * depth + 2), roofM); roof.position.set(0, rise * rows + 4.5, -(rows * depth) / 2 + 0.5); roof.rotation.x = -0.08; roof.castShadow = true; g.add(roof);
      for (const xx of [-st.length / 2, 0, st.length / 2]) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.4, rise * rows + 4.5, 0.4), concrete); c.position.set(xx, (rise * rows + 4.5) / 2, -(rows * depth)); g.add(c); }
      g.position.set(st.x, st.z - 0.2, -st.y); g.rotation.y = st.face + Math.PI / 2;
      objs.add(g);
    }
  }

  // marshal posts
  if (Array.isArray(sc.marshalPosts)) {
    const boothM = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.7 }); const flagM = new THREE.MeshStandardMaterial({ color: 0xff8a00, roughness: 0.6, side: THREE.DoubleSide });
    for (const mp of sc.marshalPosts) {
      const z = mp.z ?? (qh(mp.x, mp.y, -1), q.height); const g = new THREE.Group(); g.position.set(mp.x, z, -mp.y); g.rotation.y = mp.heading + Math.PI / 2;
      const booth = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.4, 1.6), boothM); booth.position.y = 1.2; booth.castShadow = true; g.add(booth);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 3.6), steel); pole.position.set(1.3, 1.8, 0.6); g.add(pole);
      const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.55), flagM); flag.position.set(1.7, 3.3, 0.6); g.add(flag);
      objs.add(g);
    }
  }

  // barriers: polylines (sim xyz triplets) from scenery, or generated offsets
  {
    let lines = [];
    if (Array.isArray(sc.barriers) && sc.barriers.length) {
      for (const b of sc.barriers) {
        const P = b.points; const pts = [];
        for (let k = 0; k + 2 < P.length; k += 3) pts.push(new THREE.Vector3(P[k], P[k + 2], -P[k + 1]));
        if (b.closed !== false && pts.length > 2) pts.push(pts[0].clone());
        lines.push({ pts, kind: b.kind || 'armco', height: b.height || 0.8, fence: b.fence });
      }
    } else {
      const step = Math.max(1, Math.round(4 / s.ds));
      for (const sg of [1, -1]) {
        const pts = [];
        for (let r = 0; r <= n; r += step) { const i = idx(r); pts.push(at(i, sg * barrierOff(i, sg), 0)); }
        for (let it = 0; it < 2; it++) for (let k = 1; k < pts.length - 1; k++) pts[k].lerpVectors(pts[k - 1], pts[k + 1], 0.5).lerp(pts[k], 0.5);
        lines.push({ pts, kind: 'armco', height: 0.8 });
      }
    }
    const railGeos = [], wallGeos = [], fenceGeos = []; const posts = [];
    const strip = (pts, y0, y1, out) => {
      const pos = [], ind = [];
      for (let k = 0; k < pts.length; k++) { const p = pts[k]; pos.push(p.x, p.y + y0, p.z, p.x, p.y + y1, p.z); if (k < pts.length - 1) { const a = k * 2; ind.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(ind); g.computeVertexNormals(); out.push(g);
    };
    for (const L of lines) {
      if (L.kind === 'wall' || L.kind === 'concrete') { strip(L.pts, 0, L.height + 0.2, wallGeos); }
      else {
        strip(L.pts, 0.42, 0.62, railGeos); strip(L.pts, 0.66, 0.84, railGeos);
        L.pts.forEach((p, k) => { if (k % 1 === 0) posts.push(p); });
      }
      if (L.fence) strip(L.pts, 1.0, 1.0 + (typeof L.fence === 'number' ? L.fence : 3), fenceGeos);
    }
    if (railGeos.length) { const rail = new THREE.Mesh(mergeGeometries(railGeos), new THREE.MeshStandardMaterial({ color: 0xc9ced6, roughness: 0.3, metalness: 0.85, side: THREE.DoubleSide })); rail.castShadow = true; objs.add(rail); }
    if (wallGeos.length) { const wall = new THREE.Mesh(mergeGeometries(wallGeos), new THREE.MeshStandardMaterial({ color: 0xb8b9bb, roughness: 0.85, side: THREE.DoubleSide })); wall.castShadow = true; wall.receiveShadow = true; objs.add(wall); }
    if (fenceGeos.length) { const f = new THREE.Mesh(mergeGeometries(fenceGeos), new THREE.MeshStandardMaterial({ color: 0x777c84, roughness: 0.6, metalness: 0.6, transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false })); objs.add(f); }
    if (posts.length) {
      const pg = new THREE.BoxGeometry(0.12, 0.9, 0.12); pg.translate(0, 0.45, 0);
      const pm = new THREE.InstancedMesh(pg, new THREE.MeshStandardMaterial({ color: 0x8d9299, roughness: 0.4, metalness: 0.8 }), posts.length);
      posts.forEach((p, k) => { m4.makeTranslation(p.x, p.y, p.z); pm.setMatrixAt(k, m4); }); pm.castShadow = true; objs.add(pm);
    }
    // advertising boards along the start straight, just in front of the barriers
    const banM = new THREE.MeshStandardMaterial({ map: bannerTexture(), roughness: 0.7 });
    for (const sg of [1, -1]) for (let k = -12; k <= 6; k++) {
      const i = idx(Math.round(k * 12 / s.ds));
      let off;
      if (lines.length) { // nearest barrier point on this side
        let best = Infinity; const cxp = s.x[i], cyp = s.y[i];
        for (const L of lines) for (const p of L.pts) { const dx = p.x - cxp, dy = -p.z - cyp; const o = dx * s.nx[i] + dy * s.ny[i]; if (Math.sign(o) !== sg) continue; const d = dx * dx + dy * dy; if (d < best) { best = d; off = o; } }
      }
      if (off == null || Math.abs(off) > 60) off = sg * barrierOff(i, sg);
      const p = at(i, off - sg * 0.6, 0);
      const b = new THREE.Mesh(new THREE.BoxGeometry(11.5, 1.0, 0.08), banM); b.position.set(p.x, p.y + 0.6, p.z);
      b.rotation.y = Math.atan2(s.ty[i], s.tx[i]); b.castShadow = true; objs.add(b);
    }
  }

  // trees (instanced): from scenery.trees if present, else procedural clusters
  {
    let trees = [];
    if (Array.isArray(sc.trees) && sc.trees.length) {
      for (const t of sc.trees) trees.push({ x: t.x, y: t.y, z: t.z ?? (qh(t.x, t.y, -1), q.height), s: t.scale ?? 1, rot: t.rot ?? 0, kind: t.kind ?? 0 });
    } else {
      const r = rng(1234); const count = lowDetail ? 350 : 900; let tries = 0;
      const clusters = []; for (let c = 0; c < 40; c++) clusters.push([cx + (r() - 0.5) * 2 * (half - 100), cy + (r() - 0.5) * 2 * (half - 100)]);
      while (trees.length < count && tries++ < count * 8) {
        const c = clusters[(r() * clusters.length) | 0]; const x = c[0] + (r() - 0.5) * 220, y = c[1] + (r() - 0.5) * 220;
        qh(x, y, -1); const edge = Math.max(s.widthL[q.index], s.widthR[q.index]);
        if (Math.abs(q.offset) < edge + 30 || q.surface === SURFACE.GRAVEL) continue;
        trees.push({ x, y, z: q.height + hillsAt(x, y, Math.abs(q.offset), edge) - 0.2, s: 0.7 + r() * 0.8, rot: r() * 6.28, kind: r() < 0.55 ? 0 : 1 });
      }
    }
    const tf = opts.trees ?? (lowDetail ? 0.35 : 1); if (tf < 1) { const keep = Math.max(1, Math.round(1 / Math.max(tf, 0.05))); trees = trees.filter((_, k) => k % keep === 0); }
    const trunkG = new THREE.CylinderGeometry(0.18, 0.28, 3, 6); trunkG.translate(0, 1.5, 0);
    const pineG = new THREE.ConeGeometry(2.2, 7.5, 8); pineG.translate(0, 6.2, 0);
    const pine2 = new THREE.ConeGeometry(1.6, 5, 8); pine2.translate(0, 8.4, 0);
    const pineGeo = mergeGeometries([pineG, pine2]);
    const roundG = new THREE.IcosahedronGeometry(3.0, 1); roundG.translate(0, 5.6, 0);
    { const p = roundG.attributes.position; const rr = rng(77); for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) * (0.9 + rr() * 0.25), p.getY(i) * (0.92 + rr() * 0.16), p.getZ(i) * (0.9 + rr() * 0.25)); roundG.computeVertexNormals(); }
    const trunkM = new THREE.MeshStandardMaterial({ color: 0x5a4030, roughness: 1 });
    const pineM = new THREE.MeshStandardMaterial({ color: 0x2f5a2c, roughness: 0.95, flatShading: true });
    const roundM = new THREE.MeshStandardMaterial({ color: 0x4d7a2e, roughness: 0.95, flatShading: true });
    const tm = new THREE.InstancedMesh(trunkG, trunkM, Math.max(1, trees.length));
    const kinds = [trees.filter((t) => t.kind === 0), trees.filter((t) => t.kind !== 0)];
    const pm = new THREE.InstancedMesh(pineGeo, pineM, Math.max(1, kinds[0].length)); const rm = new THREE.InstancedMesh(roundG, roundM, Math.max(1, kinds[1].length));
    pm.count = kinds[0].length; rm.count = kinds[1].length; tm.count = trees.length;
    const qq = new THREE.Quaternion(), sv = new THREE.Vector3(), pv = new THREE.Vector3(); const col = new THREE.Color(); const rr = rng(99); const Y = new THREE.Vector3(0, 1, 0);
    trees.forEach((t, k) => { qq.setFromAxisAngle(Y, t.rot); sv.setScalar(t.s); pv.set(t.x, t.z - 0.1, -t.y); m4.compose(pv, qq, sv); tm.setMatrixAt(k, m4); });
    kinds[0].forEach((t, k) => { qq.setFromAxisAngle(Y, t.rot); sv.set(t.s, t.s * (0.85 + rr() * 0.3), t.s); pv.set(t.x, t.z - 0.1, -t.y); m4.compose(pv, qq, sv); pm.setMatrixAt(k, m4); pm.setColorAt(k, col.setHSL(0.3 + rr() * 0.05, 0.35, 0.75 + rr() * 0.25)); });
    kinds[1].forEach((t, k) => { qq.setFromAxisAngle(Y, t.rot); sv.setScalar(t.s); pv.set(t.x, t.z - 0.1, -t.y); m4.compose(pv, qq, sv); rm.setMatrixAt(k, m4); rm.setColorAt(k, col.setHSL(0.22 + rr() * 0.08, 0.45, 0.7 + rr() * 0.3)); });
    for (const m of [tm, pm, rm]) { m.castShadow = true; m.receiveShadow = false; m.frustumCulled = false; objs.add(m); }
  }

  // TV camera spots (sim coords), every ~140 m on the outside of the bend
  const tvCams = [];
  const stepTv = Math.max(1, Math.round(140 / s.ds));
  for (let r = 0; r < n; r += stepTv) {
    const i = idx(r); const sg = outerSign(i); const off = sg * (barrierOff(i, sg) + 3);
    const x = s.x[i] + s.nx[i] * off, y = s.y[i] + s.ny[i] * off; qh(x, y, i);
    tvCams.push({ x, y, z: q.height + 4.5, s: i * s.ds });
  }

  if (typeof console !== 'undefined') console.info(`[track] scene built in ${(performance.now() - t0).toFixed(0)} ms (${n} samples)`);
  return { group, bounds, tvCams };
}
