# FX layer integration (for E's `src/ui/render/world.js`)

## API
```js
const { initFX } = await import('./src/ui/fx/index.js');   // dynamic import is fine
const fx = initFX({
  renderer, scene, camera,
  track, trackGroup,                 // sim track (§6) + info.group from buildTrackScene
  cars: [{ group: cv.group, vehicle, player: true, paint: 'metallic', underglow: null }],
  preset: 'night',                   // day | goldenHour | night | futuristic, add '-wet' (e.g. 'night-wet')
  quality: 'auto',                   // auto | potato | low | medium | high | ultra (saved in localStorage)
  autoScale: true, targetFps: 60,    // dynamic resolution + effect shedding
  racingLine: racingLine(track).offset, // optional: rubbered racing line on the road
});
fx.update(dt, { playerVehicle, speed, boost });  // every frame, after cv.sync/cv.update and the camera rig
fx.render(dt);                                   // replaces renderer.render(scene, camera)
fx.setEnvironment('day-wet'); fx.setQuality('low');
fx.addCar(cv.group, vehicle, { player, paint, underglow }); fx.removeCar(cv.group);
fx.setTrack(track, trackGroup);                  // after World.setTrack
fx.spawnSparks(posVec3, normalVec3, intensity, velVec3);
fx.setPaint(group, 'solid|metallic|pearl|candy|matte|chrome'); fx.setUnderglow(group, 0x29e7ff | null);
fx.setRenderScale(0.8); fx.setShedLevel(n); fx.reportFrameTime(ms); fx.setAutoScale(on, fps);
fx.stats(); fx.rescan(); fx.dispose();
```
`quality.js` is tiny and can be imported eagerly (`detectQuality`, `QUALITY`, `SHED_ORDER`, `DynamicResolution`).
`post.js` (GTAO/SSR/SMAA/bloom) is lazy-loaded by index.js only for tiers that use it, so potato never loads it.
`fx.ready` resolves when the post pipeline has loaded; until then `render()` draws directly.

## Wiring steps in World
1. After `setTrack()`: `fx ? fx.setTrack(track, info.group) : (fx = initFX({...}))`.
2. In `addCar()` / `removeCar()`: call `fx.addCar(cv.group, vehicle, opts)` / `fx.removeCar(cv.group)`.
3. In `frame()` (track scene only): keep E's WheelFx/particles/camera code, then call
   `fx.update(dt, { playerVehicle: vehicleOf(this.focus) })` and `fx.render(dt)` instead of `renderer.render`.
   The studio (garage) scene keeps E's own render path. To show paint options there, call `upgradeCarMaterials(group, { paint })`.
4. FX hides E's Sky, sun, hemisphere light and env map (restored on `dispose()`), and drives the shadow-casting sun itself.
   E can drop its own sun shadow follow code while FX is active (it is harmless if left in).
5. FX owns `renderer.setPixelRatio` (tier cap × render scale). E's `resize()` must keep calling `renderer.setSize(w, h, false)`;
   FX picks up size changes automatically.
6. E's tyre smoke `Particles` is upgraded in place (lit + soft). If E creates it after initFX, call `fx.rescan()`.

## Tiers
| tier | scale | post | shadows | extras |
|---|---|---|---|---|
| potato | 0.5, dpr≤1 | none (direct) | off → blob shadows | Lambert/Phong, no PMREM (32px cube), 4 fx lights |
| low | 0.75, dpr≤1.5 | bloom ¼, grade, radial blur | 1024 PCF | 6 lights |
| medium | 1, dpr≤1.5 | + FXAA, CA, grain | 2048 soft | clearcoat flakes, light cones, 10 lights |
| high | 1, dpr≤2 | + GTAO ½, SSR, depth motion blur, SMAA, lens dirt, soft particles | 2048 | 16 lights |
| ultra | 1, dpr≤2 | + MSAA 4×, full-res GTAO, 56-step SSR | 4096 | transmissive glass, 24 lights |

When the frame time is over budget, render scale drops first (down to the tier's `minScale`). After that, effects are shed in `SHED_ORDER` order.
