// Procedural canvas textures (no downloaded assets).
import * as THREE from 'three';

function canvas(w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; return c;
}
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

function tex(c, { repeat = true, srgb = true, aniso = 8 } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = aniso;
  t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter;
  return t;
}

const cache = new Map();
const memo = (k, f) => { if (!cache.has(k)) cache.set(k, f()); return cache.get(k); };

/** Asphalt with aggregate noise, faint tyre-line darkening and painted edge lines. u across (0..1), v along (tiles). */
export function asphaltTexture() {
  return memo('asphalt', () => {
    const W = 512, H = 512; const c = canvas(W, H); const g = c.getContext('2d'); const r = rng(7);
    g.fillStyle = '#4a4c50'; g.fillRect(0, 0, W, H);
    const img = g.getImageData(0, 0, W, H); const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (r() - 0.5) * 34 + (r() < 0.02 ? 30 : 0) - (r() < 0.03 ? 22 : 0);
      d[i] += n; d[i + 1] += n; d[i + 2] += n + 1;
    }
    g.putImageData(img, 0, 0);
    // racing line rubber: darker band in the middle-ish of the track
    const grd = g.createLinearGradient(0, 0, W, 0);
    grd.addColorStop(0.0, 'rgba(0,0,0,0)'); grd.addColorStop(0.32, 'rgba(10,10,12,0.20)'); grd.addColorStop(0.5, 'rgba(10,10,12,0.26)');
    grd.addColorStop(0.68, 'rgba(10,10,12,0.20)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.fillRect(0, 0, W, H);
    // patches / repairs
    for (let i = 0; i < 6; i++) {
      g.fillStyle = `rgba(${r() < 0.5 ? '20,20,22' : '90,90,95'},${0.08 + r() * 0.08})`;
      g.fillRect(r() * W, r() * H, 30 + r() * 90, 20 + r() * 60);
    }
    // edge lines (white, slightly worn)
    const line = (x0, x1) => {
      for (let y = 0; y < H; y++) {
        g.fillStyle = `rgba(236,236,230,${0.86 + r() * 0.12})`; g.fillRect(x0, y, x1 - x0, 1);
      }
    };
    line(5, 12); line(W - 12, W - 5);
    return tex(c);
  });
}

export function asphaltRoughness() {
  return memo('asphaltRough', () => {
    const W = 256, H = 256; const c = canvas(W, H); const g = c.getContext('2d'); const r = rng(9);
    const img = g.createImageData(W, H); const d = img.data;
    for (let i = 0; i < d.length; i += 4) { const v = 200 + (r() - 0.5) * 80; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
    g.putImageData(img, 0, 0);
    return tex(c, { srgb: false });
  });
}

/** Red/white kerb stripes, v along. */
export function kerbTexture() {
  return memo('kerb', () => {
    const c = canvas(64, 256); const g = c.getContext('2d');
    for (let i = 0; i < 2; i++) { g.fillStyle = i ? '#f2f2ee' : '#d4231d'; g.fillRect(0, i * 128, 64, 128); }
    const r = rng(3); const img = g.getImageData(0, 0, 64, 256); const d = img.data;
    for (let i = 0; i < d.length; i += 4) { const n = (r() - 0.5) * 18; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
    g.putImageData(img, 0, 0);
    return tex(c);
  });
}

/** Neutral ground detail (multiplied with per-vertex surface colour). */
export function groundDetailTexture() {
  return memo('ground', () => {
    const W = 512; const c = canvas(W, W); const g = c.getContext('2d'); const r = rng(11);
    g.fillStyle = '#c8c8c8'; g.fillRect(0, 0, W, W);
    for (let i = 0; i < 9000; i++) {
      const v = 150 + r() * 105 | 0; g.fillStyle = `rgba(${v},${v},${v},0.35)`;
      g.fillRect(r() * W, r() * W, 1 + r() * 3, 1 + r() * 6);
    }
    for (let i = 0; i < 40; i++) {
      const x = r() * W, y = r() * W, rad = 20 + r() * 70; const gr = g.createRadialGradient(x, y, 0, x, y, rad);
      const dark = r() < 0.5; gr.addColorStop(0, dark ? 'rgba(80,80,80,0.18)' : 'rgba(255,255,255,0.15)'); gr.addColorStop(1, 'rgba(128,128,128,0)');
      g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    return tex(c);
  });
}

/** Chequered start/finish band. */
export function chequerTexture() {
  return memo('chequer', () => {
    const c = canvas(256, 64); const g = c.getContext('2d'); const n = 16, m = 4;
    for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) { g.fillStyle = (i + j) % 2 ? '#111' : '#f4f4f0'; g.fillRect(i * 16, j * 16, 16, 16); }
    return tex(c, { repeat: false });
  });
}

/** Advertising board / barrier banner strip. */
export function bannerTexture() {
  return memo('banner', () => {
    const c = canvas(1024, 64); const g = c.getContext('2d');
    const cols = ['#0d1117', '#ff5a36', '#1e6bd6', '#f2f2ee', '#16a34a', '#0d1117'];
    const words = ['APEX LAB', 'GRIP+', 'TORQUE', 'SLIPSTREAM', 'REDLINE', 'OCTANE'];
    for (let i = 0; i < 6; i++) {
      g.fillStyle = cols[i]; g.fillRect(i * 171, 0, 171, 64);
      g.fillStyle = cols[i] === '#f2f2ee' ? '#0d1117' : '#ffffff';
      g.font = 'bold 30px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(words[i], i * 171 + 85, 34);
    }
    return tex(c);
  });
}

export function treeBarkColor() { return new THREE.Color('#5a4030'); }

/** Crowd texture for grandstands. */
export function crowdTexture() {
  return memo('crowd', () => {
    const c = canvas(512, 128); const g = c.getContext('2d'); const r = rng(21);
    g.fillStyle = '#2a2f38'; g.fillRect(0, 0, 512, 128);
    const cols = ['#e9e1d0', '#d43c2c', '#2b67c6', '#f2c230', '#2f8f4e', '#111', '#ffffff', '#ff7a2f'];
    for (let y = 4; y < 128; y += 8) for (let x = 2; x < 512; x += 6) {
      if (r() < 0.82) { g.fillStyle = cols[(r() * cols.length) | 0]; g.fillRect(x + r() * 2, y + r() * 2, 4, 5); g.fillStyle = '#e8c4a0'; g.fillRect(x + 1 + r(), y - 2, 2.5, 2.5); }
    }
    return tex(c);
  });
}

/** Soft round particle sprite (white, alpha falloff). */
export function smokeSprite() {
  return memo('smoke', () => {
    const c = canvas(128, 128); const g = c.getContext('2d'); const r = rng(5);
    for (let i = 0; i < 14; i++) {
      const x = 64 + (r() - 0.5) * 40, y = 64 + (r() - 0.5) * 40, rad = 26 + r() * 30;
      const gr = g.createRadialGradient(x, y, 0, x, y, rad);
      gr.addColorStop(0, 'rgba(255,255,255,0.32)'); gr.addColorStop(0.6, 'rgba(255,255,255,0.12)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    }
    return tex(c, { repeat: false, srgb: false });
  });
}

/** Tyre sidewall + tread (for the wheel cylinder). */
export function tyreTexture() {
  return memo('tyre', () => {
    const c = canvas(256, 64); const g = c.getContext('2d');
    g.fillStyle = '#18191b'; g.fillRect(0, 0, 256, 64);
    g.fillStyle = '#0f1011';
    for (let i = 0; i < 256; i += 8) { g.fillRect(i, 0, 3, 64); }
    g.fillStyle = '#222326'; g.fillRect(0, 26, 256, 4);
    return tex(c);
  });
}
