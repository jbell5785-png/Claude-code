// Drivetrain: velocity-level projected Gauss-Seidel (PGS) constraint solver over rotating bodies.
//
// Bodies (fixed slots, unused slots have invI = 0 and never appear in an active row):
//   0  ICE crank (engine + flywheel + clutch) | EV front motor rotor
//   1  (ICE unused)                          | EV rear motor rotor
//   2..5  wheels FL, FR, RL, RR (wheel + tyre + hub + brake disc + half-shaft)
//
// The gearbox output shaft / propshaft and the diff carriers are not separate bodies: their
// kinematics are folded into the Jacobian of the drive row (see notes below) and their inertia is
// reflected onto the driven wheels. This removes near-massless bodies from the chain, which would
// otherwise wreck Gauss-Seidel convergence (mass ratios of 1:1000) — the constraint set is still
// exactly: clutch (friction-limited) ∘ gear ratio ∘ final drive ∘ centre diff (torque split s)
// ∘ axle diffs (carrier = mean of the two wheel speeds).
//
// Rows (fixed slots so impulses can be warm-started between steps):
//   0  DRIVE0  ICE: ω_e − g·fd·Σ share_w·ω_w = 0           |λ| ≤ clutch capacity·dt
//              EV : ω_m0 − red·(ω_FL+ω_FR)/2 = 0            (stiff coupling, unbounded)
//   1  DRIVE1  EV rear motor: ω_m1 − red·(ω_RL+ω_RR)/2 = 0
//   2  LSD_F   ω_FL − ω_FR = 0     bounded by diff locking torque (clutch / torsen / locked)
//   3  LSD_R   ω_RL − ω_RR = 0
//   4  CENTRE  (ω_FL+ω_FR)/2 − (ω_RL+ω_RR)/2 = 0   (AWD locked centre / none)
//   5..8 BRAKE ω_w = 0  |λ| ≤ (brake + handbrake + rolling-resistance torque)·dt
// For an open centre diff with front share s, share_w = s/2 (front wheels), (1−s)/2 (rear wheels):
// this is exactly ω_in = s·ω_f + (1−s)·ω_r with ω_carrier = (ω_L+ω_R)/2, and by virtual work it
// delivers torque s·T to the front axle.
// Viscous diffs/couplings are explicit torques (−c·Δω) applied before the solve.

const NB = 6;           // bodies
const NR = 9;           // rows
const ROW_DRIVE0 = 0, ROW_DRIVE1 = 1, ROW_LSD_F = 2, ROW_LSD_R = 3, ROW_CENTRE = 4, ROW_BRAKE = 5;
const BIG = 1e30;

/** Diff behaviour codes. */
const K_OPEN = 0, K_VISCOUS = 1, K_TORSEN = 2, K_CLUTCH = 3, K_LOCKED = 4;
function diffKind(d) {
  if (!d) return K_OPEN;
  switch (d.kind) {
    case 'viscous': return K_VISCOUS;
    case 'torsen': return K_TORSEN;
    case 'clutch': return K_CLUTCH;
    case 'locked': return K_LOCKED;
    default: return K_OPEN;
  }
}

export class Drivetrain {
  /**
   * @param {object} params  build() output
   * @param {number[]} wheelInertia  per-wheel spin inertia (kg m^2) incl. tyre
   */
  constructor(params, wheelInertia) {
    const dt = params.drivetrain;
    this.isEV = !!dt.isEV;
    this.layout = dt.layout || 'RWD';
    this.finalDrive = dt.finalDrive || 1;
    this.gearRatios = dt.gearRatios || [1];
    this.reverseRatio = dt.reverseRatio || 3.2;
    this.centreSplit = dt.centreSplit != null ? dt.centreSplit : 0.4;
    this.iterations = 10;

    // Which axles are driven, and by which power unit.
    this.frontDriven = !!(params.axles[0] && params.axles[0].driven);
    this.rearDriven = !!(params.axles[1] && params.axles[1].driven);
    if (!this.isEV) {
      if (this.layout === 'FWD') { this.frontDriven = true; this.rearDriven = false; }
      else if (this.layout === 'RWD') { this.frontDriven = false; this.rearDriven = true; }
      else { this.frontDriven = true; this.rearDriven = true; }
    }
    // EV: map power units to slots 0 (front) / 1 (rear).
    this.unitSlot = [];
    this.evFront = false; this.evRear = false;
    const units = params.powerUnits || [];
    for (let i = 0; i < units.length; i++) {
      const d = units[i].drives;
      if (this.isEV) {
        if (d === 'front') { this.unitSlot.push(0); this.evFront = true; }
        else { this.unitSlot.push(1); this.evRear = true; }
      } else this.unitSlot.push(0);
    }
    if (this.isEV) { this.frontDriven = this.evFront; this.rearDriven = this.evRear; }

    this.fDiff = diffKind(dt.frontDiff); this.rDiff = diffKind(dt.rearDiff);
    this.cDiff = diffKind(dt.centreDiff);
    this.fDiffP = dt.frontDiff || {}; this.rDiffP = dt.rearDiff || {}; this.cDiffP = dt.centreDiff || {};

    // Bodies
    this.omega = new Float64Array(NB);
    this.inertia = new Float64Array(NB);
    this.invI = new Float64Array(NB);
    this.torque = new Float64Array(NB);   // external torques for the current step (set by vehicle)
    for (let i = 0; i < units.length; i++) {
      const slot = this.unitSlot[i];
      this.inertia[slot] += Math.max(1e-3, units[i].engine.inertia || 0.15);
    }
    // Reflect propshaft/gearbox-output inertia onto the driven wheels (fd^2 scaling).
    const shaftI = (dt.driveshaftInertia || 0.02) * this.finalDrive * this.finalDrive;
    const nDriven = (this.frontDriven ? 2 : 0) + (this.rearDriven ? 2 : 0);
    for (let w = 0; w < 4; w++) {
      let I = wheelInertia[w];
      const driven = w < 2 ? this.frontDriven : this.rearDriven;
      if (driven && !this.isEV && nDriven > 0) I += shaftI / nDriven;
      this.inertia[2 + w] = I;
    }
    for (let b = 0; b < NB; b++) this.invI[b] = this.inertia[b] > 0 ? 1 / this.inertia[b] : 0;

    // Rows
    this.J = new Float64Array(NR * NB);
    this.lo = new Float64Array(NR);
    this.hi = new Float64Array(NR);
    this.mEff = new Float64Array(NR);
    this.lambda = new Float64Array(NR);
    this.active = new Uint8Array(NR);

    // Inputs (set by the vehicle every step)
    this.gearRatio = 0;          // signed gearbox ratio, 0 = neutral (ICE) / signed reduction sign (EV)
    this.clutchCap = 0;          // Nm
    this.brakeCap = new Float64Array(4);   // Nm friction limit per wheel

    // Outputs
    this.axleTorque = new Float64Array(2); // drive torque delivered to front / rear axle (Nm)
    this.clutchTorque = 0;       // Nm through the clutch (+ = driving)
    this.clutchSlip = 0;         // rad/s, crank − gearbox input
    this.brakeTorque = new Float64Array(4);// Nm actually applied by brake rows (|.|)

    // Static Jacobian rows (diffs, brakes)
    this._setRow(ROW_LSD_F, 2, 1, 3, -1);
    this._setRow(ROW_LSD_R, 4, 1, 5, -1);
    const J = this.J, o = ROW_CENTRE * NB;
    J[o + 2] = 0.5; J[o + 3] = 0.5; J[o + 4] = -0.5; J[o + 5] = -0.5;
    for (let w = 0; w < 4; w++) J[(ROW_BRAKE + w) * NB + 2 + w] = 1;
    for (let r = ROW_LSD_F; r < NR; r++) this._calcMeff(r);
    this.setGear(0);
  }

  _setRow(r, b0, j0, b1, j1) {
    const o = r * NB;
    for (let b = 0; b < NB; b++) this.J[o + b] = 0;
    this.J[o + b0] = j0; this.J[o + b1] = j1;
  }

  _calcMeff(r) {
    const o = r * NB; let k = 0;
    for (let b = 0; b < NB; b++) { const j = this.J[o + b]; k += j * j * this.invI[b]; }
    this.mEff[r] = k > 0 ? 1 / k : 0;
  }

  /** Total ratio crank(or motor) → wheel for the current selection (signed). */
  totalRatio() { return this.gearRatio * this.finalDrive; }

  /**
   * Select a gearbox ratio. ICE: g = 0 neutral, >0 forward ratio, <0 reverse ratio.
   * EV: g = +1 forward, −1 reverse (sign of the fixed reduction).
   */
  setGear(g) {
    if (g === this.gearRatio && this._gearInit) return;
    this._gearInit = true;
    this.gearRatio = g;
    const J = this.J;
    if (!this.isEV) {
      const o = ROW_DRIVE0 * NB;
      for (let b = 0; b < NB; b++) J[o + b] = 0;
      const r = g * this.finalDrive;
      J[o] = 1;
      if (this.frontDriven && this.rearDriven) {
        const s = this.centreSplit;
        J[o + 2] = J[o + 3] = -r * s * 0.5;
        J[o + 4] = J[o + 5] = -r * (1 - s) * 0.5;
      } else if (this.frontDriven) { J[o + 2] = J[o + 3] = -r * 0.5; }
      else { J[o + 4] = J[o + 5] = -r * 0.5; }
      this._calcMeff(ROW_DRIVE0);
      this.lambda[ROW_DRIVE0] = 0;
    } else {
      const r = g * this.finalDrive;
      let o = ROW_DRIVE0 * NB;
      for (let b = 0; b < NB; b++) J[o + b] = 0;
      J[o] = 1; J[o + 2] = J[o + 3] = -r * 0.5;
      this._calcMeff(ROW_DRIVE0);
      o = ROW_DRIVE1 * NB;
      for (let b = 0; b < NB; b++) J[o + b] = 0;
      J[o + 1] = 1; J[o + 4] = J[o + 5] = -r * 0.5;
      this._calcMeff(ROW_DRIVE1);
    }
  }

  /** Drive torque entering an axle diff from the drive rows' current impulses (Nm). */
  _axleIn(axle, dt) {
    const J = this.J, l = this.lambda;
    const w0 = axle === 0 ? 2 : 4;
    let t = (J[w0] + J[w0 + 1]) * l[ROW_DRIVE0];
    if (this.isEV) t += (J[NB + w0] + J[NB + w0 + 1]) * l[ROW_DRIVE1];
    return t / dt;
  }

  _lsdBound(kind, p, Tin) {
    // Returns max |T_L − T_R| (Nm).
    switch (kind) {
      case K_LOCKED: return BIG;
      case K_CLUTCH: {
        const ramp = Tin >= 0 ? (p.lockAccel || 0) : (p.lockDecel || 0);
        return (p.preload || 0) + ramp * Math.abs(Tin);
      }
      case K_TORSEN: {
        const tbr = p.tbr || 2.5;
        return (tbr - 1) / (tbr + 1) * Math.abs(Tin) + (p.preload || 0);
      }
      default: return 0;
    }
  }

  /**
   * Advance the rotating bodies by dt: explicit external torques, explicit viscous couplings,
   * then PGS over the active rows. Does not allocate.
   */
  step(dt) {
    const w = this.omega, invI = this.invI, tq = this.torque;
    for (let b = 0; b < NB; b++) w[b] += tq[b] * invI[b] * dt;

    // Viscous axle diffs / centre coupling (explicit, stable for c·dt/I << 1)
    if (this.fDiff === K_VISCOUS && this.frontDriven) {
      const t = (this.fDiffP.viscous || 60) * (w[2] - w[3]) * dt;
      w[2] -= t * invI[2]; w[3] += t * invI[3];
    }
    if (this.rDiff === K_VISCOUS && this.rearDriven) {
      const t = (this.rDiffP.viscous || 60) * (w[4] - w[5]) * dt;
      w[4] -= t * invI[4]; w[5] += t * invI[5];
    }
    const awd = this.frontDriven && this.rearDriven && !this.isEV;
    if (awd && this.cDiff === K_VISCOUS) {
      const t = (this.cDiffP.viscous || 120) * 0.5 * (w[2] + w[3] - w[4] - w[5]) * dt;
      w[2] -= 0.5 * t * invI[2]; w[3] -= 0.5 * t * invI[3];
      w[4] += 0.5 * t * invI[4]; w[5] += 0.5 * t * invI[5];
    }

    // Activate rows and set static bounds
    const act = this.active, lo = this.lo, hi = this.hi, lam = this.lambda;
    if (!this.isEV) {
      const on = this.gearRatio !== 0 && this.clutchCap > 0;
      act[ROW_DRIVE0] = on ? 1 : 0;
      hi[ROW_DRIVE0] = this.clutchCap * dt; lo[ROW_DRIVE0] = -hi[ROW_DRIVE0];
      act[ROW_DRIVE1] = 0;
    } else {
      act[ROW_DRIVE0] = this.evFront ? 1 : 0; act[ROW_DRIVE1] = this.evRear ? 1 : 0;
      lo[ROW_DRIVE0] = lo[ROW_DRIVE1] = -BIG; hi[ROW_DRIVE0] = hi[ROW_DRIVE1] = BIG;
    }
    act[ROW_LSD_F] = (this.frontDriven && this.fDiff >= K_TORSEN) ? 1 : 0;
    act[ROW_LSD_R] = (this.rearDriven && this.rDiff >= K_TORSEN) ? 1 : 0;
    act[ROW_CENTRE] = (awd && this.cDiff === K_LOCKED) ? 1 : 0;
    lo[ROW_CENTRE] = -BIG; hi[ROW_CENTRE] = BIG;
    for (let i = 0; i < 4; i++) {
      const r = ROW_BRAKE + i, c = this.brakeCap[i] * dt;
      act[r] = c > 0 ? 1 : 0; hi[r] = c; lo[r] = -c;
    }

    // Warm start (clamped to current bounds)
    const J = this.J;
    for (let r = 0; r < NR; r++) {
      if (!act[r]) { lam[r] = 0; continue; }
      let l = lam[r];
      if (r === ROW_LSD_F || r === ROW_LSD_R) {
        const a = r === ROW_LSD_F ? 0 : 1;
        const bnd = 0.5 * dt * this._lsdBound(a === 0 ? this.fDiff : this.rDiff,
          a === 0 ? this.fDiffP : this.rDiffP, this._axleIn(a, dt));
        hi[r] = bnd; lo[r] = -bnd;
      }
      if (l > hi[r]) l = hi[r]; else if (l < lo[r]) l = lo[r];
      l *= 0.9;
      lam[r] = l;
      if (l !== 0) {
        const o = r * NB;
        for (let b = 0; b < NB; b++) { const j = J[o + b]; if (j !== 0) w[b] += invI[b] * j * l; }
      }
    }

    // PGS iterations
    const iters = this.iterations;
    for (let it = 0; it < iters; it++) {
      for (let r = 0; r < NR; r++) {
        if (!act[r]) continue;
        const o = r * NB;
        let jv = 0;
        for (let b = 0; b < NB; b++) jv += J[o + b] * w[b];
        if (r === ROW_LSD_F || r === ROW_LSD_R) {
          const a = r === ROW_LSD_F ? 0 : 1;
          const bnd = 0.5 * dt * this._lsdBound(a === 0 ? this.fDiff : this.rDiff,
            a === 0 ? this.fDiffP : this.rDiffP, this._axleIn(a, dt));
          hi[r] = bnd; lo[r] = -bnd;
        }
        const old = lam[r];
        let nl = old - jv * this.mEff[r];
        if (nl > hi[r]) nl = hi[r]; else if (nl < lo[r]) nl = lo[r];
        const d = nl - old;
        if (d !== 0) {
          lam[r] = nl;
          for (let b = 0; b < NB; b++) { const j = J[o + b]; if (j !== 0) w[b] += invI[b] * j * d; }
        }
      }
    }

    // ICE crank cannot run backwards
    if (!this.isEV && w[0] < 0) w[0] = 0;

    // Outputs
    this.axleTorque[0] = this._axleIn(0, dt);
    this.axleTorque[1] = this._axleIn(1, dt);
    if (!this.isEV) {
      this.clutchTorque = act[ROW_DRIVE0] ? -lam[ROW_DRIVE0] / dt : 0;
      const o = ROW_DRIVE0 * NB;
      let win = 0;
      for (let b = 2; b < NB; b++) win -= J[o + b] * w[b];
      this.clutchSlip = w[0] - win;
    } else { this.clutchTorque = 0; this.clutchSlip = 0; }
    for (let i = 0; i < 4; i++) this.brakeTorque[i] = Math.abs(lam[ROW_BRAKE + i]) / dt;
  }

  /** Gearbox input speed (rad/s at the clutch) implied by the current wheel speeds. */
  inputOmega() {
    const r = this.totalRatio(), w = this.omega;
    if (this.frontDriven && this.rearDriven && !this.isEV) {
      const s = this.centreSplit;
      return r * (s * 0.5 * (w[2] + w[3]) + (1 - s) * 0.5 * (w[4] + w[5]));
    }
    if (this.frontDriven) return r * 0.5 * (w[2] + w[3]);
    return r * 0.5 * (w[4] + w[5]);
  }

  /** Mean driven-wheel speed (rad/s). */
  drivenOmega() {
    const w = this.omega;
    if (this.frontDriven && this.rearDriven) return 0.25 * (w[2] + w[3] + w[4] + w[5]);
    if (this.frontDriven) return 0.5 * (w[2] + w[3]);
    return 0.5 * (w[4] + w[5]);
  }

  reset() {
    this.omega.fill(0); this.lambda.fill(0); this.torque.fill(0);
    this.clutchTorque = 0; this.clutchSlip = 0;
  }
}
