// Sim (Z up, x fwd / y left) <-> three.js (Y up) conversions.
// three.x = sim.x, three.y = sim.z, three.z = -sim.y. The same mapping applied to body axes gives
// the car-model local frame: +X forward, +Y up, +Z right.

/** Write sim position [x,y,z] into a THREE.Vector3. */
export function simToThree(p, out) { return out.set(p[0], p[2], -p[1]); }
export function simXYZToThree(x, y, z, out) { return out.set(x, z, -y); }
/** Sim quaternion [x,y,z,w] (body->world) into THREE.Quaternion. Conjugating by the basis rotation just maps the vector part. */
export function simQuatToThree(q, out) { return out.set(q[0], q[2], -q[1], q[3]); }
