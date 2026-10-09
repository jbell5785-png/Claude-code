# Collisions (engineer I) — contract notes

Files: `src/sim/collision.js`, `scripts/test-collision.js`. `vehicle.js` is NOT modified.

## §9 Collisions (proposed ARCHITECTURE.md section)

```js
import { createCollisionWorld, collide, eventsSince } from './src/sim/collision.js';
const world = createCollisionWorld(track, { ghosts: false, restitution: 0.3, friction: 0.45,
                                            wallRestitution, wallFriction });   // all optional
world.step(vehicles);        // once per physics step, AFTER every vehicle.step()
world.events                 // ring buffer (256) of { type: 'car'|'wall', kind: 'impact'|'scrape',
                             //   pos:[x,y,z], normal (push direction on car a), impulse (N s), speed (m/s),
                             //   a: vehicleIndex, b: other vehicle index | wall segment index, time }
world.eventHead, world.eventCount (this step), world.stepEventStart, world.contacts
eventsSince(world, seq, cb) -> newSeq   // renderer/audio: read everything since the last frame
collide(vehicles, opts?)     // race-mode convenience (race.js already imports it): one world per track
```

- Car shape: oriented box from `params.render` length/width/height and body pose (overhangs split
  evenly around the wheelbase, bottom at ride height). Walls: `track.walls` segments, one-sided (track
  side solid, inward normal from track.query, per-loop majority) with `walls.height` above the ground —
  no tunnelling at any speed; a car can only pass a wall by going over its top.
- Broad phase: sort-and-sweep on x (cars, persistent order, deterministic tie-break), uniform 8 m grid
  (wall segments). Narrow phase: footprint SAT + vertical overlap (car-car); box vertices behind the
  wall (vertical edges clipped at the wall top). Contact height = middle of the vertical overlap.
- Response: rigid-body impulse at the contact point using `v.mTot` and `v.Ixx/Iyy/Izz` (body frame),
  restitution (car 0.3, armco 0.1, concrete 0.15, tyres 0.3) applied above 1 m/s closing speed, Coulomb
  friction along the slip direction; split position correction (20–30 %/step, 5 mm slop). Writes
  `v.vel`, `v.angVel`, `v.pos`, wheel `pos`, recomputes `v.speed`.
- `ghosts: true` disables car-car contacts (walls stay solid) for AI training.
- Deterministic (no randomness, stable ordering).

## Not done (budget cut) — proposals
- Obstacles (`track.obstacles`) are not yet solid.
- Damage model (`opts.damage`, `v.damage.zones`) not implemented. Note `v.damage` is a number today
  (engine damage); a zones object should live in a new field (e.g. `v.bodyDamage`) or carry `valueOf()`.
- Car-car contact is upright-only (footprint SAT); rolled cars use their projected footprint.
