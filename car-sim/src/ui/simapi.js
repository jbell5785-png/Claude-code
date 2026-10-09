// Sim adapter: uses the real modules in src/sim/ when they exist, otherwise the dev mock.
// `import.meta.glob` resolves at build time to only the files that exist, so a missing module
// doesn't break the build. Force the mock with ?sim=mock (or per-module, e.g. ?mock=vehicle,track).
import * as catalog from '../sim/catalog.js';
import * as constants from '../sim/constants.js';
import {
  mockBuild, mockEngineCurve, MOCK_PRESETS, MOCK_DEFAULT_SPEC, createMockVehicle, createMockTrack, MOCK_TRACKS, createMockLapTimer,
} from './dev/mockSim.js';

const found = import.meta.glob(
  ['../sim/build.js', '../sim/engine.js', '../sim/presets.js', '../sim/vehicle.js', '../sim/track.js', '../sim/laptimer.js'],
  { eager: true },
);

const qs = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams();
const forceAll = qs.get('sim') === 'mock';
const forced = new Set((qs.get('mock') || '').split(',').filter(Boolean));
const mod = (name) => (forceAll || forced.has(name) ? null : found[`../sim/${name}.js`] || null);

const mBuild = mod('build'), mEngine = mod('engine'), mPresets = mod('presets'), mVehicle = mod('vehicle'), mTrack = mod('track'), mLap = mod('laptimer');

/** Which implementation each piece uses: 'real' | 'mock'. Shown in the about box & reported in console. */
export const sources = {
  build: mBuild?.build ? 'real' : 'mock',
  engineCurve: mEngine?.engineCurve ? 'real' : 'mock',
  presets: mPresets?.PRESETS ? 'real' : 'mock',
  vehicle: mVehicle?.createVehicle ? 'real' : 'mock',
  track: mTrack?.createTrack && mTrack?.TRACKS ? 'real' : 'mock',
  laptimer: (mLap?.createLapTimer || mTrack?.createLapTimer) ? 'real' : 'mock',
};
const useMockTrack = sources.track === 'mock';

export const { DT, G, SURFACE, FL, FR, RL, RR } = constants;
export { catalog };

function safe(fnReal, fnMock, label) {
  if (!fnReal) return fnMock;
  return (...args) => {
    try { return fnReal(...args); } catch (err) {
      console.error(`[simapi] real ${label} threw — falling back to mock`, err);
      sources[label] = 'mock (fallback)';
      return fnMock(...args);
    }
  };
}

export const build = safe(mBuild?.build, mockBuild, 'build');
export const engineCurve = (ep) => {
  if (mEngine?.engineCurve && !ep.__mock) {
    try { return mEngine.engineCurve(ep); } catch (err) { console.error('[simapi] engineCurve threw', err); }
  }
  return mockEngineCurve(ep);
};

function normPresets(p) {
  // Accept { key: spec } | { key: { label, spec } } | [ { name|label, spec } | spec ]
  const out = [];
  if (!p) return out;
  const push = (key, v) => {
    if (!v) return;
    const spec = v.spec && typeof v.spec === 'object' ? v.spec : v;
    out.push({ key, label: v.label || spec.name || key, description: v.description || '', spec });
  };
  if (Array.isArray(p)) p.forEach((v, i) => push(v.key || v.id || String(i), v));
  else for (const [k, v] of Object.entries(p)) push(k, v);
  return out;
}
export const PRESETS = normPresets(mPresets?.PRESETS || MOCK_PRESETS);
export const DEFAULT_SPEC = (mBuild?.defaultSpec && (() => { try { return mBuild.defaultSpec(); } catch { return null; } })()) || (PRESETS[0] && PRESETS[0].spec) || MOCK_DEFAULT_SPEC;
export const normalizeSpec = mBuild?.normalizeSpec || ((s) => s);

export const TRACKS = useMockTrack ? MOCK_TRACKS : mTrack.TRACKS;

/** Create a track by key. Returns a §6 track object. */
export function createTrack(key) {
  if (useMockTrack) return createMockTrack(key);
  return mTrack.createTrack(key);
}

export function createLapTimer(track) {
  const fn = useMockTrack ? createMockLapTimer : (mLap?.createLapTimer || mTrack?.createLapTimer || createMockLapTimer);
  try { return fn(track); } catch (err) { console.error('[simapi] createLapTimer threw', err); return createMockLapTimer(track); }
}

/** Create a vehicle (§5). Falls back to the mock when the real one is missing or throws. */
export function createVehicle(params, track, pose) {
  if (mVehicle?.createVehicle) {
    try { return mVehicle.createVehicle(params, track, pose); } catch (err) {
      console.error('[simapi] createVehicle threw — falling back to mock', err);
      sources.vehicle = 'mock (fallback)';
    }
  }
  return createMockVehicle(params, track, pose);
}

if (typeof console !== 'undefined') console.info('[simapi] module sources', JSON.stringify(sources));
