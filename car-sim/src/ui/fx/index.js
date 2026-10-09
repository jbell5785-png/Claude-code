// FX layer entry point. See INTEGRATION.md for the wiring in E's renderer.
// Importable via dynamic import. The heavy post-processing module (post.js: GTAO, SSR, SMAA,
// bloom...) is itself lazy-loaded only for tiers that use it, so the potato path never loads it.
import * as THREE from 'three';
import { QUALITY, QUALITY_LEVELS, SHED_ORDER, qualitySettings, detectQuality, savedQuality, saveQuality, DynamicResolution } from './quality.js';
import { EnvironmentFX, resolveEnvironment, ENVIRONMENTS, applyEnvironment } from './environment.js';
import { FxLightSet, setMaxFxLights } from './lights.js';
import { buildDressing } from './dressing.js';
import { upgradeTrackMaterials, applyTrackEnv, setCheapMaterials, syncCheapMaterials, restoreTrackMaterials, setCarPaint, upgradeCarMaterials, PAINTS } from './materials.js';
import { CarFX } from './carfx.js';
import { SoftParticles, Sparks, Rain, SpeedLines, particleUniforms, upgradeSmokePoints } from './particles.js';

export { QUALITY, QUALITY_LEVELS, SHED_ORDER, detectQuality, ENVIRONMENTS, PAINTS, applyEnvironment, upgradeCarMaterials, upgradeTrackMaterials };
export const ENVIRONMENT_KEYS = Object.keys(ENVIRONMENTS);

const MB_RANK = { none: 0, radial: 1, depth: 2 }; const AA_RANK = { none: 0, fxaa: 1, smaa: 2 };
function shedSettings(base, level) {
  const s = Object.assign({}, base);
  for (let i = 0; i < Math.min(level, SHED_ORDER.length); i++) {
    const [k, val] = SHED_ORDER[i]; const cur = s[k];
    if (k === 'motionBlur') { if (MB_RANK[val] < MB_RANK[cur]) s[k] = val; }
    else if (k === 'aa') { if (AA_RANK[val] < AA_RANK[cur]) s[k] = val; }
    else if (typeof cur === 'number') { if (val < cur) s[k] = val; }
    else if (cur === true && val === false) s[k] = false;
  }
  return s;
}

const _v = new THREE.Vector3(), _v2 = new THREE.Vector3(), _fw = new THREE.Vector3(), _m3 = new THREE.Matrix3();

/**
 * @param {object} o
 * @param {THREE.WebGLRenderer} o.renderer
 * @param {THREE.Scene} o.scene
 * @param {THREE.PerspectiveCamera} o.camera
 * @param {object} [o.track] §6 sim track (enables dressing: streetlights, neon, edge strips...)
 * @param {THREE.Object3D} [o.trackGroup] E's track group from buildTrackScene
 * @param {{group:THREE.Object3D, vehicle?:object, player?:boolean, paint?:string, underglow?:number|string}[]} [o.cars]
 * @param {string|object} [o.preset] 'day' | 'goldenHour' | 'night' | 'futuristic', optionally '-wet' / { base, wet }
 * @param {string} [o.quality] 'auto' | 'potato' | 'low' | 'medium' | 'high' | 'ultra'
 * @param {boolean} [o.autoScale] dynamic resolution + effect shedding (default true)
 * @param {number} [o.targetFps] default 60 (30 on potato)
 * @param {'aces'|'agx'} [o.toneMapping]
 */
export function initFX(o) {
  const { renderer, scene, camera } = o;
  let track = o.track || null, trackGroup = o.trackGroup || null;
  // ---------------------------------------------------------------- quality
  let tier = o.quality && o.quality !== 'auto' ? o.quality : (savedQuality() || detectQuality(renderer).quality);
  if (!QUALITY[tier]) tier = 'medium';
  let base = qualitySettings(tier); let q = base; let shed = 0; let renderScale = base.renderScale;
  const dpr = () => (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
  const applyPixelRatio = () => { const pr = Math.min(dpr(), q.maxDpr) * renderScale; if (Math.abs(renderer.getPixelRatio() - pr) > 1e-3) renderer.setPixelRatio(pr); };

  const lights = new FxLightSet();
  const root = new THREE.Group(); root.name = 'fx-root'; scene.add(root);
  const env = new EnvironmentFX({ renderer, scene, camera, quality: q });
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;

  // particles
  const spray = new SoftParticles(1400, { lit: true, drag: 2.2, buoyancy: 0.1, gravity: 1.5 });
  const trail = new SoftParticles(700, { additive: true, lit: false, drag: 3, buoyancy: 0.2 });
  const sparks = new Sparks(800); const rain = new Rain(10000); const speedLines = new SpeedLines(300);
  root.add(spray.points, trail.points, sparks.mesh, rain.mesh, speedLines.mesh);

  const ctx = { lights, sparks, spray, trail, root, quality: q };
  const cars = new Map(); // group -> { fx: CarFX, vehicle, player }
  let dressing = null; let dressingKey = '';
  let post = null; let postLoading = null; let def = null; let envName = null; let dark = 0;
  let speed = 0, boost = 0; const camVel = new THREE.Vector3(); const lastCam = new THREE.Vector3(); let hasLastCam = false;
  let lastFrameT = 0; let frameMs = 16.7; let cheapOn = false;

  const dyn = new DynamicResolution({ targetFps: o.targetFps || (tier === 'potato' ? 30 : 60), minScale: base.minScale, maxScale: base.renderScale,
    apply: { scale: (s) => { renderScale = s; applyPixelRatio(); }, shed: (lvl) => { shed = lvl; applyQuality(); } } });
  dyn.enabled = o.autoScale !== false;

  function loadPost() {
    if (post || postLoading || !q.post) return postLoading;
    postLoading = import('./post.js').then((m) => {
      post = m.createPostFX(renderer, scene, camera, { quality: q, toneMapping: o.toneMapping, lut: env.lut, bloom: def && def.bloom, grade: def && def.grade });
      if (def) syncPostEnv(); postLoading = null; return post;
    }).catch((e) => { console.warn('[fx] post-processing unavailable, rendering direct', e); postLoading = null; return null; });
    return postLoading;
  }
  function syncPostEnv() { if (!post || !def) return; post.setLUT(env.lut); post.setBloom(def.bloom); post.setGrade(def.grade); post.setWet(def.wet || 0); }

  function applyQuality() {
    const prevShadows = q.shadows; const prevMat = q.materials;
    q = shedSettings(base, shed); ctx.quality = q;
    applyPixelRatio();
    env.setQuality(q); setMaxFxLights(q.lights);
    for (const c of cars.values()) c.fx.setQuality(q);
    rain.setCount(Math.round(q.rain)); speedLines.setCount(Math.round(q.speedLines));
    sparks.mesh.visible = q.sparks > 0;
    if (q.post) { if (post) post.setQuality(q); else loadPost(); }
    const wantCheap = q.materials === 'lambert';
    if (wantCheap !== cheapOn) { cheapOn = wantCheap; setCheapMaterials(scene, wantCheap, env.envCube); }
    if (prevShadows !== q.shadows || prevMat !== q.materials) scene.traverse((m) => { if (m.material) (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => { x.needsUpdate = true; }); });
  }

  function rebuildDressing() {
    const key = (track ? track.length : 0) + ':' + (def ? [def.streetlights, def.neon, def.skyline, def.edgeStrips].join(',') : '') + ':' + q.dressing + ':' + q.cones;
    if (key === dressingKey) return; dressingKey = key;
    if (dressing) { root.remove(dressing.group); dressing.dispose(); dressing = null; }
    if (track && def) { dressing = buildDressing(track, def, q, lights); root.add(dressing.group); if (cheapOn) setCheapMaterials(dressing.group, true, env.envCube); }
  }

  function setEnvironment(p) {
    def = env.apply(p); envName = resolveEnvironment(p).name;
    dark = def.streetlights || def.edgeStrips ? 1 : def.key === 'goldenHour' ? 0.3 : (def.wet ? 0.15 : 0);
    if (trackGroup) applyTrackEnv(trackGroup, def);
    rain.mesh.visible = (def.wet || 0) > 0;
    rain.mat.uniforms.uIntensity.value = dark > 0.5 ? 0.9 : 0.5; rain.mat.uniforms.uColor.value.set(dark > 0.5 ? 0xb8c4ff : 0xc8d0dc);
    particleUniforms.uAmbient.value.copy(env.hemi.color).multiplyScalar(env.hemi.intensity * 0.55).add(_c.set(0.04, 0.04, 0.05));
    particleUniforms.uSunColor.value.copy(env.sun.color).multiplyScalar(Math.min(1.5, env.sun.intensity * 0.35));
    rebuildDressing(); syncPostEnv();
    if (cheapOn) setCheapMaterials(scene, true, env.envCube);
    return def;
  }
  const _c = new THREE.Color();

  function setTrack(t, group) {
    if (trackGroup && trackGroup !== group) restoreTrackMaterials(trackGroup);
    track = t || null; trackGroup = group || null; dressingKey = '';
    if (trackGroup) {
      let line = null;
      if (track && o.racingLine) line = o.racingLine;
      upgradeTrackMaterials(trackGroup, def || {}, { track, quality: q, racingLine: line });
      if (cheapOn) setCheapMaterials(trackGroup, true, env.envCube);
    }
    rebuildDressing();
  }

  function addCar(group, vehicle, opts = {}) {
    if (cars.has(group)) return cars.get(group).fx;
    const fx = new CarFX(ctx, group, vehicle, opts); cars.set(group, { fx, vehicle, player: !!opts.player });
    if (cheapOn) setCheapMaterials(group, true, env.envCube);
    return fx;
  }
  function removeCar(group) { const c = cars.get(group); if (!c) return; c.fx.dispose(); cars.delete(group); setCheapMaterials(group, false); }

  // smoke from E's effects.js → lit/soft
  // E's smoke is kept as-is: the lit upgrade blooms into a white halo in the night grade.
  void upgradeSmokePoints;

  // ---------------------------------------------------------------- init
  applyQuality(); setEnvironment(o.preset || 'day'); setTrack(track, trackGroup);
  for (const c of o.cars || []) addCar(c.group, c.vehicle, c);

  function focusObject(playerVehicle) {
    for (const [g, c] of cars) if ((playerVehicle && c.vehicle === playerVehicle) || (!playerVehicle && c.player)) return g.getObjectByName('car') || g;
    const first = cars.keys().next(); return first.done ? null : (first.value.getObjectByName('car') || first.value);
  }

  const api = {
    get quality() { return tier; },
    get settings() { return q; },
    get environment() { return envName; },
    get ready() { return postLoading || Promise.resolve(post); },
    get renderScale() { return renderScale; },
    get shedLevel() { return shed; },
    SHED_ORDER,
    lights, env,
    /**
     * Per-frame update (before render). state: { playerVehicle, speed (m/s), boost (bool|0..1), focus (Object3D) }
     */
    update(dt, state = {}) {
      dt = Math.min(Math.max(dt || 0, 0), 0.1);
      const now = performance.now(); if (lastFrameT) { frameMs = now - lastFrameT; dyn.update(frameMs); } lastFrameT = now;
      const pv = state.playerVehicle || null;
      speed = state.speed ?? (pv ? Math.abs(pv.speed || 0) : 0);
      const es = pv && pv.engines && pv.engines[0];
      const b = state.boost != null ? +state.boost : es && es.nitrousActive ? 1 : 0;
      boost += (b - boost) * Math.min(1, dt * (b > boost ? 10 : 4));
      // camera velocity
      if (hasLastCam && dt > 0) camVel.subVectors(camera.position, lastCam).multiplyScalar(1 / dt); lastCam.copy(camera.position); hasLastCam = true;
      if (camVel.length() > 200) camVel.set(0, 0, 0);
      const foc = state.focus || focusObject(pv);
      const focusPos = foc ? foc.getWorldPosition(_v) : camera.position;
      env.update(dt, focusPos, camera);
      // cars
      for (const [g, c] of cars) {
        const isP = (pv && c.vehicle === pv) || c.player;
        c.fx.update(dt, { dark, wet: def.wet || 0 }, isP ? { boost: state.boost != null ? !!state.boost : undefined, speed: state.speed } : {});
      }
      // fx light selection around a point ahead of the camera
      camera.getWorldDirection(_fw); _v2.copy(camera.position).addScaledVector(_fw, 22);
      lights.select(camera, _v2, dt);
      // particles
      spray.update(dt); trail.update(dt); sparks.update(dt);
      const hpx = renderer.domElement.height; spray.setViewport(hpx, camera.fov); trail.setViewport(hpx, camera.fov);
      if (rain.mesh.visible) rain.update(dt, camera, camVel);
      speedLines.update(dt, camera, speed, boost > 0.3);
      if (dressing) dressing.update(dt, camera, scene);
      // particle lighting / soft depth
      const pu = particleUniforms; const f = scene.fog;
      if (f) { pu.fogColor.value.copy(f.color); pu.fogDensity.value = f.density; }
      _m3.setFromMatrix4(camera.matrixWorldInverse); pu.uSunDirV.value.copy(env.sunDir).applyMatrix3(_m3).normalize();
      const dtex = post && post.depthTexture;
      pu.tDepth.value = dtex; pu.uSoft.value = dtex && q.softParticles ? 0.6 : 0; pu.uNear.value = camera.near; pu.uFar.value = camera.far;
      if (dtex) pu.uInvRes.value.set(1 / post.size.width, 1 / post.size.height);
      if (cheapOn) syncCheapMaterials(scene);
      // post inputs
      if (post) {
        post.setSpeed(speed); post.setBoost(boost);
        // focus of expansion from camera velocity, car mask from the focus object
        if (camVel.lengthSq() > 4) { _v2.copy(camera.position).addScaledVector(camVel.clone().normalize(), 200).project(camera); if (_v2.z < 1) post.setCenter(THREE.MathUtils.clamp(_v2.x * 0.5 + 0.5, 0.2, 0.8), THREE.MathUtils.clamp(_v2.y * 0.5 + 0.5, 0.2, 0.8)); }
        else post.setCenter(0.5, 0.5);
        if (foc) {
          const c = _v2.copy(focusPos).project(camera); const cx = c.x * 0.5 + 0.5, cy = c.y * 0.5 + 0.5;
          const dist = camera.position.distanceTo(focusPos); const ry = Math.min(0.5, 1.6 / (dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) * 0.5);
          post.setCarMask(cx, cy, ry * 1.6 / camera.aspect * 1.1, ry, c.z < 1 && dist < 40);
        }
      }
    },
    /** Render the frame (replaces renderer.render(scene, camera)). */
    render(dt = 1 / 60) {
      if (post && q.post) post.render(dt);
      else { renderer.setRenderTarget(null); renderer.render(scene, camera); }
    },
    setEnvironment,
    setQuality(t) {
      if (t === 'auto') t = detectQuality(renderer).quality;
      if (!QUALITY[t]) return; tier = t; base = qualitySettings(t); shed = 0; renderScale = base.renderScale;
      dyn.minScale = base.minScale; dyn.maxScale = base.renderScale; dyn.reset(base.renderScale); dyn.setTarget(o.targetFps || (t === 'potato' ? 30 : 60)); dyn.maxShed = SHED_ORDER.length;
      dressingKey = ''; applyQuality(); rebuildDressing(); saveQuality(t);
    },
    /** Dynamic resolution hook: 0.25..1 multiplier on the tier's capped device pixel ratio. */
    setRenderScale(s) { renderScale = Math.min(1.5, Math.max(0.25, s)); applyPixelRatio(); },
    getRenderScale() { return renderScale; },
    /** Shed (n>0) or restore effects in SHED_ORDER order. */
    setShedLevel(n) { shed = Math.max(0, Math.min(SHED_ORDER.length, n | 0)); applyQuality(); },
    /** Feed an external frame-time monitor instead of the built-in one (also disables built-in timing). */
    reportFrameTime(ms) { lastFrameT = 0; dyn.update(ms); },
    setAutoScale(on, fps) { dyn.enabled = !!on; if (fps) dyn.setTarget(fps); },
    setTrack, addCar, removeCar,
    setPaint(group, paint) { setCarPaint(group, paint, q); },
    setUnderglow(group, color) { const c = cars.get(group); if (c) c.fx.setUnderglow(color); },
    /** Sparks at a world point (THREE.Vector3 or [x,y,z] in three coords), normal = push-out direction. */
    spawnSparks(pos, normal, intensity = 1, vel) {
      const p = pos.isVector3 ? pos : _v.fromArray(pos); const n = normal ? (normal.isVector3 ? normal : new THREE.Vector3().fromArray(normal)) : new THREE.Vector3(0, 1, 0);
      sparks.spawn(p, n, intensity, vel || null, p.y - 0.25);
    },
    /** Rescan the scene for foreign lights/sky (e.g. after E rebuilds) and smoke particles. */
    rescan() { env.rehide(); if (cheapOn) setCheapMaterials(scene, true, env.envCube); },
    stats() { return { tier, renderScale, shed, frameMs, pixelRatio: renderer.getPixelRatio(), fxLights: lights.lights.length, post: !!post, env: envName }; },
    dispose() {
      for (const g of [...cars.keys()]) removeCar(g);
      if (dressing) dressing.dispose(); if (trackGroup) restoreTrackMaterials(trackGroup);
      if (cheapOn) setCheapMaterials(scene, false);
      scene.remove(root); spray.dispose(); trail.dispose(); sparks.dispose(); rain.dispose(); speedLines.dispose();
      env.dispose(); if (post) post.dispose();
    },
  };
  if (q.post) loadPost();
  return api;
}
export { installFx } from './install.js';
