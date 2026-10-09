// Procedural textures for the FX layer (canvas / DataTexture only — no downloads, no web fonts).
import * as THREE from 'three';

const cache = new Map();
const memo = (k, f) => { if (!cache.has(k)) cache.set(k, f()); return cache.get(k); };
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function tex(c, { repeat = true, srgb = true, aniso = 8, mips = true } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; t.anisotropy = aniso;
  t.generateMipmaps = mips; t.minFilter = mips ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
  return t;
}
const FONT = '"Arial Black", "Helvetica Neue", Impact, Arial, sans-serif';

/** Soft radial glow (white, premultiplied-friendly) for halos / light sprites. */
export function glowTexture() {
  return memo('glow', () => {
    const S = 128; const c = canvas(S, S); const g = c.getContext('2d');
    const gr = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.08, 'rgba(255,255,255,0.85)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.28)');
    gr.addColorStop(0.55, 'rgba(255,255,255,0.07)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, S, S); return tex(c, { repeat: false, srgb: false });
  });
}

/** Soft puff for smoke / spray (alpha). */
export function puffTexture() {
  return memo('puff', () => {
    const S = 128; const c = canvas(S, S); const g = c.getContext('2d'); const r = rng(5);
    for (let i = 0; i < 26; i++) {
      const x = S / 2 + (r() - 0.5) * S * 0.38, y = S / 2 + (r() - 0.5) * S * 0.38, rad = S * (0.12 + r() * 0.22);
      const gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, 'rgba(255,255,255,0.22)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, S, S);
    }
    return tex(c, { repeat: false, srgb: false });
  });
}

/**
 * Asphalt detail set (tiles every ~4 m): { map (sRGB albedo, mid-grey ~1 so it modulates),
 * normalMap, roughnessMap }. Generated from one height field so they agree.
 */
export function asphaltSet(size = 1024) {
  return memo('asphalt' + size, () => {
    const N = size; const r = rng(11); const h = new Float32Array(N * N);
    // aggregate: many small stones (height bumps) + fine grain + a few cracks
    for (let i = 0; i < N * N; i++) h[i] = r() * 0.25;
    const stones = Math.round(N * N / 55);
    for (let k = 0; k < stones; k++) {
      const cx = r() * N, cy = r() * N, rad = 0.8 + r() * r() * 3.2, hh = 0.4 + r() * 0.6;
      const x0 = Math.floor(cx - rad), x1 = Math.ceil(cx + rad), y0 = Math.floor(cy - rad), y1 = Math.ceil(cy + rad);
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        const d = Math.hypot(x - cx, y - cy) / rad; if (d >= 1) continue;
        const i = ((y + N) % N) * N + ((x + N) % N); h[i] = Math.max(h[i], hh * Math.sqrt(1 - d * d));
      }
    }
    const cracks = 7;
    for (let k = 0; k < cracks; k++) {
      let x = r() * N, y = r() * N, a = r() * 6.28; const len = 60 + r() * 200;
      for (let s = 0; s < len; s++) { a += (r() - 0.5) * 0.5; x += Math.cos(a); y += Math.sin(a); const i = ((Math.round(y) % N + N) % N) * N + ((Math.round(x) % N + N) % N); h[i] = -0.4; }
    }
    const at = (x, y) => h[((y + N) % N) * N + ((x + N) % N)];
    const cA = canvas(N, N), cN = canvas(N, N), cR = canvas(N, N);
    const gA = cA.getContext('2d'), gN = cN.getContext('2d'), gR = cR.getContext('2d');
    const iA = gA.createImageData(N, N), iN = gN.createImageData(N, N), iR = gR.createImageData(N, N);
    // low-frequency blotches (patching / oil) for albedo + roughness
    const blot = new Float32Array(N * N); const B = 8;
    const grid = []; for (let i = 0; i < (B + 1) * (B + 1); i++) grid.push(r());
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const fx = x / N * B, fy = y / N * B; const ix = Math.floor(fx), iy = Math.floor(fy); const tx = fx - ix, ty = fy - iy;
      const g = (a, b) => grid[((b % B) * (B + 1)) + (a % B)];
      const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
      blot[y * N + x] = (g(ix, iy) * (1 - sx) + g(ix + 1, iy) * sx) * (1 - sy) + (g(ix, iy + 1) * (1 - sx) + g(ix + 1, iy + 1) * sx) * sy;
    }
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const i = y * N + x; const o = i * 4; const v = h[i]; const b = blot[i];
      // albedo ~ 1.0 (multiplies material colour); stones lighter, cracks darker
      const tone = 0.86 + v * 0.32 + (b - 0.5) * 0.16 + (r() - 0.5) * 0.06;
      const sp = r() < 0.004 ? 0.35 : 0; // occasional bright quartz chip
      const a = Math.max(0, Math.min(255, (tone + sp) * 200));
      iA.data[o] = a; iA.data[o + 1] = a; iA.data[o + 2] = Math.min(255, a * 1.02); iA.data[o + 3] = 255;
      const dx = (at(x + 1, y) - at(x - 1, y)) * 2.2, dy = (at(x, y + 1) - at(x, y - 1)) * 2.2;
      const l = Math.hypot(dx, dy, 1);
      iN.data[o] = (-dx / l * 0.5 + 0.5) * 255; iN.data[o + 1] = (dy / l * 0.5 + 0.5) * 255; iN.data[o + 2] = (1 / l * 0.5 + 0.5) * 255; iN.data[o + 3] = 255;
      // roughness in G (three reads .g): stones polished slightly, blotches vary
      const rough = 0.78 + (b - 0.5) * 0.25 - v * 0.18 + (r() - 0.5) * 0.08;
      iR.data[o] = 255; iR.data[o + 1] = Math.max(0, Math.min(255, rough * 255)); iR.data[o + 2] = 0; iR.data[o + 3] = 255;
    }
    gA.putImageData(iA, 0, 0); gN.putImageData(iN, 0, 0); gR.putImageData(iR, 0, 0);
    return { map: tex(cA), normalMap: tex(cN, { srgb: false }), roughnessMap: tex(cR, { srgb: false }) };
  });
}

/** Puddle / wetness mask (R), tileable, ~16 m tile. */
export function puddleTexture() {
  return memo('puddle', () => {
    const N = 256; const c = canvas(N, N); const g = c.getContext('2d'); const r = rng(21);
    g.fillStyle = '#000'; g.fillRect(0, 0, N, N);
    for (let k = 0; k < 40; k++) {
      const x = r() * N, y = r() * N, rx = 8 + r() * 34, ry = 6 + r() * 20;
      for (const ox of [-N, 0, N]) for (const oy of [-N, 0, N]) {
        const gr = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, rx);
        gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.6, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
        g.save(); g.translate(x + ox, y + oy); g.scale(1, ry / rx); g.translate(-(x + ox), -(y + oy)); g.fillStyle = gr; g.fillRect(x + ox - rx, y + oy - rx, rx * 2, rx * 2); g.restore();
      }
    }
    return tex(c, { srgb: false });
  });
}

function neonText(g, text, x, y, size, color, glow = 1) {
  g.font = `900 ${size}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineJoin = 'round';
  for (const [w, a] of [[size * 0.32, 0.12 * glow], [size * 0.16, 0.25 * glow], [size * 0.07, 0.6]]) {
    g.strokeStyle = color; g.globalAlpha = a; g.lineWidth = w; g.strokeText(text, x, y);
  }
  g.globalAlpha = 1; g.lineWidth = size * 0.035; g.strokeStyle = '#ffffff'; g.strokeText(text, x, y);
}

const SIGNS = [
  { text: 'NITRO', sub: 'FUEL · 24H', c: '#ff2bd6', c2: '#29e7ff' },
  { text: 'APEX', sub: 'MOTORWORKS', c: '#29e7ff', c2: '#ff8a1f' },
  { text: 'TURBO', sub: 'NOODLE BAR', c: '#ffb020', c2: '#ff2b6a' },
  { text: 'VELOCITY', sub: 'CLUB', c: '#7cff4f', c2: '#29e7ff' },
  { text: 'HYPER', sub: 'DRIVE-IN', c: '#ff2b4a', c2: '#ffd23a' },
  { text: 'ZONE 7', sub: 'AUTO SPA', c: '#a05bff', c2: '#ff2bd6' },
];
export const SIGN_COUNT = SIGNS.length;

/** Neon billboard (emissive map, black background). */
export function neonSignTexture(i) {
  return memo('neon' + i, () => {
    const s = SIGNS[i % SIGNS.length]; const W = 512, H = 192; const c = canvas(W, H); const g = c.getContext('2d');
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    // frame tube
    g.strokeStyle = s.c2; for (const [w, a] of [[16, 0.15], [7, 0.4], [3, 1]]) { g.globalAlpha = a; g.lineWidth = w; g.strokeRect(14, 14, W - 28, H - 28); }
    g.globalAlpha = 1; g.lineWidth = 1.2; g.strokeStyle = '#fff'; g.strokeRect(14, 14, W - 28, H - 28);
    neonText(g, s.text, W / 2, H * 0.43, s.text.length > 6 ? 76 : 96, s.c);
    neonText(g, s.sub, W / 2, H * 0.78, 28, s.c2, 0.7);
    return tex(c, { repeat: false });
  });
}

/** Daytime sponsor board. */
export function adBoardTexture(i) {
  return memo('ad' + i, () => {
    const W = 512, H = 128; const c = canvas(W, H); const g = c.getContext('2d');
    const pal = [['#e10600', '#fff'], ['#0b1e3f', '#ffd400'], ['#111', '#29e7ff'], ['#ffd400', '#111'], ['#ffffff', '#e10600'], ['#00843d', '#fff']][i % 6];
    g.fillStyle = pal[0]; g.fillRect(0, 0, W, H);
    g.fillStyle = pal[1]; g.font = `900 italic 70px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(['APEX', 'NITRO', 'GRIP+', 'TURBO', 'VELO', 'TORQ'][i % 6], W / 2, H / 2 + 4);
    g.fillRect(20, H - 18, W - 40, 6);
    return tex(c, { repeat: false });
  });
}

/** Building facade windows (emissive) — RGB lit windows on black; A unused. */
export function windowsTexture() {
  return memo('windows', () => {
    const W = 256, H = 512; const c = canvas(W, H); const g = c.getContext('2d'); const r = rng(33);
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    const cols = 16, rows = 48; const cw = W / cols, rh = H / rows;
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      if (r() < 0.42) continue;
      const warm = r(); const k = 0.4 + r() * 0.6;
      g.fillStyle = warm < 0.6 ? `rgba(255,${180 + r() * 40 | 0},${110 + r() * 40 | 0},${k})` : warm < 0.85 ? `rgba(190,220,255,${k})` : `rgba(255,120,210,${k})`;
      g.fillRect(x * cw + cw * 0.18, y * rh + rh * 0.2, cw * 0.64, rh * 0.55);
    }
    return tex(c, { aniso: 4 });
  });
}

/** Chevron arrow strip (emissive), arrows point +u. */
export function chevronTexture() {
  return memo('chev', () => {
    const W = 256, H = 64; const c = canvas(W, H); const g = c.getContext('2d');
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    for (let k = 0; k < 4; k++) {
      const x = k * 64 + 12; g.fillStyle = '#fff'; g.beginPath();
      g.moveTo(x, 6); g.lineTo(x + 22, 6); g.lineTo(x + 44, H / 2); g.lineTo(x + 22, H - 6); g.lineTo(x, H - 6); g.lineTo(x + 22, H / 2); g.closePath(); g.fill();
    }
    return tex(c, { aniso: 4 });
  });
}

/** Holographic panel (grid + logo), used with additive blending. */
export function holoTexture(i = 0) {
  return memo('holo' + i, () => {
    const W = 512, H = 256; const c = canvas(W, H); const g = c.getContext('2d');
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(80,220,255,0.35)'; g.lineWidth = 1;
    for (let x = 0; x <= W; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
    for (let y = 0; y <= H; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    const words = ['AG-SYS', 'FEISAR', 'QIREX', 'PIR-HANA', 'GOTEKI', 'AURICOM'];
    neonText(g, words[i % words.length], W / 2, H * 0.45, 84, i % 2 ? '#ff2bd6' : '#29e7ff');
    g.fillStyle = 'rgba(255,255,255,0.8)'; g.font = `700 22px ${FONT}`; g.textAlign = 'center'; g.fillText('ANTI-GRAVITY RACING LEAGUE', W / 2, H * 0.8);
    return tex(c, { repeat: false });
  });
}

/** Lens dirt (smudges + dust specks), luminance only. */
export function lensDirtTexture() {
  return memo('dirt', () => {
    const W = 512, H = 288; const c = canvas(W, H); const g = c.getContext('2d'); const r = rng(77);
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    for (let k = 0; k < 40; k++) {
      const x = r() * W, y = r() * H, rad = 10 + r() * 60; const gr = g.createRadialGradient(x, y, 0, x, y, rad);
      gr.addColorStop(0, `rgba(255,255,255,${0.05 + r() * 0.12})`); gr.addColorStop(0.7, `rgba(255,255,255,${0.03 + r() * 0.05})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, rad, 0, 6.28); g.fill();
    }
    for (let k = 0; k < 260; k++) { g.fillStyle = `rgba(255,255,255,${0.1 + r() * 0.4})`; g.beginPath(); g.arc(r() * W, r() * H, 0.5 + r() * 2.2, 0, 6.28); g.fill(); }
    return tex(c, { repeat: false, srgb: false });
  });
}

/** Blob shadow (dark ellipse alpha) for potato / far cars. */
export function blobShadowTexture() {
  return memo('blob', () => {
    const S = 128; const c = canvas(S, S); const g = c.getContext('2d');
    const gr = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    gr.addColorStop(0, 'rgba(0,0,0,0.85)'); gr.addColorStop(0.55, 'rgba(0,0,0,0.6)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, S, S); return tex(c, { repeat: false, srgb: false });
  });
}

/** Underglow pool (radial, elongated by the mesh scale). */
export function poolTexture() {
  return memo('pool', () => {
    const S = 128; const c = canvas(S, S); const g = c.getContext('2d');
    const gr = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.4, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, S, S); return tex(c, { repeat: false, srgb: false });
  });
}
