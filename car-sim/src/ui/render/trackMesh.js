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
        const maxOff = inside ? Math.min(RUN, 0.85 / Math.abs(curvSm[i]) - edge) : RUN;
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
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2; const half = Math.max(maxX - minX, maxY - minY) / 2 + 700;
  const bounds = { minX, maxX, minY, maxY, cx, cy, half, minZ };
  {
    const G = lowDetail ? 70 : 120; const pos = [], col = [], uv = [], ind = [];
    let hint = -1;
    for (let j = 0; j <= G; j++) for (let i = 0; i <= G; i++) {
      const x = cx - half + (2 * half * i) / G, y = cy - half + (2 * half * j) / G;
      qh(x, y, -1); hint = q.index;
      const edge = Math.max(s.widthL[q.index] || 6, s.widthR[q.index] || 6);
      const a = Math.abs(q.offset); let h = q.height;
      const near = a < edge + RUN - 3;
      // gentle rolling hills away from the circuit, blended in
      const far = clamp((a - edge - RUN) / 250, 0, 1);
      h += far * (8 * Math.sin(x * 0.006) * Math.cos(y * 0.005) + 14 * Math.max(0, Math.sin(x * 0.0021 + 1.3) * Math.cos(y * 0.0017)) );
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

  // ---------------- scenery
  const sc = track.scenery || {};
  const objs = new THREE.Group(); objs.name = 'scenery'; group.add(objs);
  const outerSign = (i) => (curvSm[i] > 0 ? -1 : 1); // outside of the local bend
  const edgeAt = (i, sg) => (sg > 0 ? s.widthL[i] : s.widthR[i]);
  // runoff extent per side: how far grass/gravel goes before barriers
  const barrierOff = (i, sg) => {
    let d = 6; for (let k = 2; k < 30; k += 2) { const off = sg * (edgeAt(i, sg) + k); qh(s.x[i] + s.nx[i] * off, s.y[i] + s.ny[i] * off, i); if (q.surface === SURFACE.GRAVEL) d = k + 4; }
    return edgeAt(i, sg) + Math.max(d, Math.abs(curvSm[i]) > 0.008 ? 14 : 8);
  };

  // gantry at start/finish
  {
    const i0 = 0; const hd = Math.atan2(s.ty[i0], s.tx[i0]);
    const gl = new THREE.Group(); const wl = s.widthL[i0] + 2.5, wr = s.widthR[i0] + 2.5;
    const steel = new THREE.MeshStandardMaterial({ color: 0x2b3038, roughness: 0.5, metalness: 0.7 });
    const pL = at(0, wl, 0), pR = at(0, -wr, 0); const top = Math.max(pL.y, pR.y) + 7.2;
    for (const p of [pL, pR]) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.6, top - p.y, 0.6), steel); c.position.set(p.x, (top + p.y) / 2, p.z); c.castShadow = true; gl.add(c); }
    const span = pL.distanceTo(pR);
    const beam = new THREE.Mesh(new THREE.BoxGeometry(span + 0.6, 1.6, 0.8), steel); beam.position.set((pL.x + pR.x) / 2, top - 0.5, (pL.z + pR.z) / 2);
    beam.rotation.y = hd + Math.PI / 2; beam.castShadow = true; gl.add(beam);
    const ban = new THREE.Mesh(new THREE.PlaneGeometry(span * 0.9, 1.2), new THREE.MeshStandardMaterial({ map: bannerTexture(), roughness: 0.6, side: THREE.DoubleSide }));
    ban.position.copy(beam.position); ban.rotation.y = hd + Math.PI / 2; const fwd = new THREE.Vector3(Math.cos(hd), 0, -Math.sin(hd));
    ban.position.addScaledVector(fwd, -0.42); gl.add(ban);
    const lamps = new THREE.MeshStandardMaterial({ color: 0x220000, emissive: 0xff2010, emissiveIntensity: 2.2 });
    for (let k = 0; k < 5; k++) {
      const l = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), lamps);
      l.position.copy(beam.position).addScaledVector(fwd, -0.45); l.position.y -= 1.0;
      const side = new THREE.Vector3(Math.sin(hd), 0, Math.cos(hd)); l.position.addScaledVector(side, (k - 2) * 0.55); gl.add(l);
    }
    objs.add(gl);
  }

  // grandstands along the start straight (outside), pit building opposite
  const stands = Array.isArray(sc.stands) ? sc.stands : Array.isArray(sc.grandstands) ? sc.grandstands : null;
  const standList = [];
  if (stands && stands.length) {
    for (const st of stands) {
      if (st.x != null) { qh(st.x, st.y, -1); standList.push({ x: st.x, y: st.y, z: q.height, heading: st.heading ?? Math.atan2(s.ty[q.index], s.tx[q.index]), length: st.length || 40, sg: Math.sign(q.offset) || 1, i: q.index }); }
      else if (st.s != null) { const i = idx(Math.round(st.s / s.ds)); const sg = Math.sign(st.offset || st.side || 1); const p = at(i, sg * (Math.abs(st.offset || 0) || barrierOff(i, sg) + 6), 0); standList.push({ x: p.x, y: -p.z, z: p.y, heading: Math.atan2(s.ty[i], s.tx[i]), length: st.length || 40, sg, i }); }
    }
  } else {
    for (const [si, len, sg] of [[Math.round(-30 / s.ds), 60, 1], [Math.round(40 / s.ds), 50, 1], [Math.round(-90 / s.ds), 40, -1]]) {
      const i = idx(si); const off = sg * (barrierOff(i, sg) + 7); const p = at(i, off, 0);
      standList.push({ x: p.x, y: -p.z, z: p.y, heading: Math.atan2(s.ty[i], s.tx[i]), length: len, sg, i });
    }
  }
  {
    const concrete = new THREE.MeshStandardMaterial({ color: 0x9a9c9f, roughness: 0.9 });
    const crowd = new THREE.MeshStandardMaterial({ map: crowdTexture(), roughness: 0.9 });
    const roofM = new THREE.MeshStandardMaterial({ color: 0xe8e8ea, roughness: 0.5, metalness: 0.3 });
    for (const st of standList) {
      const g = new THREE.Group(); const rows = 8; const depth = 1.0, rise = 0.6;
      for (let r = 0; r < rows; r++) {
        const step = new THREE.Mesh(new THREE.BoxGeometry(st.length, rise * (r + 1), depth), r % 2 ? concrete : concrete);
        step.position.set(0, rise * (r + 1) / 2, -(r * depth)); step.castShadow = true; step.receiveShadow = true; g.add(step);
        const people = new THREE.Mesh(new THREE.PlaneGeometry(st.length, 0.55), crowd); people.position.set(0, rise * (r + 1) + 0.27, -(r * depth) + 0.2);
        people.material.map.repeat.set(st.length / 12, 1); g.add(people);
      }
      const roof = new THREE.Mesh(new THREE.BoxGeometry(st.length + 2, 0.25, rows * depth + 2), roofM); roof.position.set(0, rise * rows + 4.5, -(rows * depth) / 2 + 0.5); roof.rotation.x = -0.08; roof.castShadow = true; g.add(roof);
      for (const xx of [-st.length / 2, 0, st.length / 2]) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.4, rise * rows + 4.5, 0.4), concrete); c.position.set(xx, (rise * rows + 4.5) / 2, -(rows * depth)); g.add(c); }
      g.position.set(st.x, st.z, -st.y); g.rotation.y = st.heading + (st.sg > 0 ? 0 : Math.PI);
      objs.add(g);
    }
  }

  // barriers: armco rail + posts along both sides (instanced posts, merged rails), banners near the start
  {
    const railGeos = []; const postMat = new THREE.MeshStandardMaterial({ color: 0x8d9299, roughness: 0.4, metalness: 0.8 });
    const posts = []; const tyreWall = [];
    const step = Math.max(1, Math.round(4 / s.ds));
    const userBarriers = Array.isArray(sc.barriers) ? sc.barriers : null;
    const sides = [1, -1];
    for (const sg of sides) {
      const pts = [];
      for (let r = 0; r <= n; r += step) {
        const i = idx(r); const off = sg * barrierOff(i, sg); pts.push(at(i, off, 0));
      }
      // smooth offsets a little to avoid kinks
      for (let it = 0; it < 2; it++) for (let k = 1; k < pts.length - 1; k++) pts[k].lerpVectors(pts[k - 1], pts[k + 1], 0.5).lerp(pts[k], 0.5);
      const pos = [], ind = [];
      for (let k = 0; k < pts.length; k++) {
        const p = pts[k]; pos.push(p.x, p.y + 0.45, p.z, p.x, p.y + 0.85, p.z);
        if (k < pts.length - 1) { const a = k * 2; ind.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
        if (k % 2 === 0) posts.push(p);
        if (Math.abs(curvSm[idx(k * step)]) > 0.01 && Math.sign(curvSm[idx(k * step)]) !== sg) tyreWall.push(p);
      }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(ind); g.computeVertexNormals();
      railGeos.push(g);
    }
    void userBarriers;
    const rail = new THREE.Mesh(mergeGeometries(railGeos), new THREE.MeshStandardMaterial({ color: 0xc9ced6, roughness: 0.35, metalness: 0.85, side: THREE.DoubleSide }));
    rail.castShadow = true; objs.add(rail);
    const pg = new THREE.BoxGeometry(0.12, 0.9, 0.12); pg.translate(0, 0.45, 0);
    const pm = new THREE.InstancedMesh(pg, postMat, posts.length); const m4 = new THREE.Matrix4();
    posts.forEach((p, k) => { m4.makeTranslation(p.x, p.y, p.z); pm.setMatrixAt(k, m4); }); pm.castShadow = true; objs.add(pm);
    if (tyreWall.length && !lowDetail) {
      const tg = new THREE.CylinderGeometry(0.33, 0.33, 0.9, 10); tg.translate(0, 0.45, 0);
      const tm = new THREE.InstancedMesh(tg, new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 }), tyreWall.length * 2);
      let c = 0; const col = new THREE.Color();
      for (const p of tyreWall) for (let k = 0; k < 2; k++) {
        m4.makeTranslation(p.x + (k - 0.5) * 0.7, p.y, p.z + (k - 0.5) * 0.7); tm.setMatrixAt(c, m4);
        tm.setColorAt(c, col.set(c % 4 === 0 ? 0xd8d8d8 : c % 4 === 2 ? 0xc0302a : 0x1a1a1a)); c++;
      }
      tm.castShadow = true; objs.add(tm);
    }
    // banner boards near the start straight (both sides)
    const banM = new THREE.MeshStandardMaterial({ map: bannerTexture(), roughness: 0.7 });
    for (const sg of sides) for (let k = -10; k <= 10; k++) {
      const i = idx(Math.round(k * 12 / s.ds)); const off = sg * (barrierOff(i, sg) - 0.3); const p = at(i, off, 0);
      const b = new THREE.Mesh(new THREE.BoxGeometry(11.5, 1.0, 0.08), banM); b.position.set(p.x, p.y + 1.25, p.z);
      b.rotation.y = Math.atan2(s.ty[i], s.tx[i]); b.castShadow = true; objs.add(b);
    }
  }

  // trees (instanced): from scenery.trees if present, else procedural clusters
  {
    let trees = [];
    if (Array.isArray(sc.trees) && sc.trees.length) {
      for (const t of sc.trees) { const x = t.x ?? t[0], y = t.y ?? t[1]; qh(x, y, -1); trees.push({ x, y, z: t.z ?? q.height, s: t.scale ?? t.s ?? 1, kind: t.kind ?? (Math.random() < 0.5 ? 0 : 1) }); }
    } else {
      const r = rng(1234); const count = lowDetail ? 350 : 900; let tries = 0;
      const clusters = []; for (let c = 0; c < 40; c++) clusters.push([cx + (r() - 0.5) * 2 * (half - 100), cy + (r() - 0.5) * 2 * (half - 100)]);
      while (trees.length < count && tries++ < count * 8) {
        const c = clusters[(r() * clusters.length) | 0]; const x = c[0] + (r() - 0.5) * 220, y = c[1] + (r() - 0.5) * 220;
        qh(x, y, -1); const edge = Math.max(s.widthL[q.index], s.widthR[q.index]);
        if (Math.abs(q.offset) < edge + 30 || q.surface === SURFACE.GRAVEL) continue;
        const far = clamp((Math.abs(q.offset) - edge - RUN) / 250, 0, 1);
        const hh = far * (8 * Math.sin(x * 0.006) * Math.cos(y * 0.005) + 14 * Math.max(0, Math.sin(x * 0.0021 + 1.3) * Math.cos(y * 0.0017)));
        trees.push({ x, y, z: q.height + hh - 0.2, s: 0.7 + r() * 0.8, kind: r() < 0.55 ? 0 : 1 });
      }
    }
    const trunkG = new THREE.CylinderGeometry(0.18, 0.28, 3, 6); trunkG.translate(0, 1.5, 0);
    const pineG = new THREE.ConeGeometry(2.2, 7.5, 8); pineG.translate(0, 6.2, 0);
    const pine2 = new THREE.ConeGeometry(1.6, 5, 8); pine2.translate(0, 8.4, 0);
    const pineGeo = mergeGeometries([pineG, pine2]);
    const roundG = new THREE.IcosahedronGeometry(3.0, 1); roundG.translate(0, 5.6, 0);
    // jitter the round crowns
    { const p = roundG.attributes.position; const rr = rng(77); for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) * (0.9 + rr() * 0.25), p.getY(i) * (0.92 + rr() * 0.16), p.getZ(i) * (0.9 + rr() * 0.25)); roundG.computeVertexNormals(); }
    const trunkM = new THREE.MeshStandardMaterial({ color: 0x5a4030, roughness: 1 });
    const pineM = new THREE.MeshStandardMaterial({ color: 0x2f5a2c, roughness: 0.95, flatShading: true });
    const roundM = new THREE.MeshStandardMaterial({ color: 0x4d7a2e, roughness: 0.95, flatShading: true });
    const tm = new THREE.InstancedMesh(trunkG, trunkM, trees.length);
    const kinds = [trees.filter((t) => t.kind === 0), trees.filter((t) => t.kind !== 0)];
    const pm = new THREE.InstancedMesh(pineGeo, pineM, Math.max(1, kinds[0].length)); const rm = new THREE.InstancedMesh(roundG, roundM, Math.max(1, kinds[1].length));
    const m4 = new THREE.Matrix4(), qq = new THREE.Quaternion(), sv = new THREE.Vector3(), pv = new THREE.Vector3(); const col = new THREE.Color(); const rr = rng(99);
    trees.forEach((t, k) => { qq.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rr() * 6.28); sv.setScalar(t.s); pv.set(t.x, t.z, -t.y); m4.compose(pv, qq, sv); tm.setMatrixAt(k, m4); });
    kinds[0].forEach((t, k) => { qq.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rr() * 6.28); sv.set(t.s, t.s * (0.85 + rr() * 0.3), t.s); pv.set(t.x, t.z, -t.y); m4.compose(pv, qq, sv); pm.setMatrixAt(k, m4); pm.setColorAt(k, col.setHSL(0.3 + rr() * 0.05, 0.35, 0.75 + rr() * 0.25)); });
    kinds[1].forEach((t, k) => { qq.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rr() * 6.28); sv.setScalar(t.s); pv.set(t.x, t.z, -t.y); m4.compose(pv, qq, sv); rm.setMatrixAt(k, m4); rm.setColorAt(k, col.setHSL(0.22 + rr() * 0.08, 0.45, 0.7 + rr() * 0.3)); });
    for (const m of [tm, pm, rm]) { m.castShadow = true; m.receiveShadow = false; objs.add(m); }
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
