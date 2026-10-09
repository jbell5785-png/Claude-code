// Vehicle dynamics: 6-DOF sprung body + 4 unsprung corners + drivetrain + driver ECU/aids.
//
// Frames (see ARCHITECTURE.md): world Z up; body x fwd, y left, z up, origin at sprung CG.
// Integration: semi-implicit Euler at DT = 1/500 s.
//
// Mass model
//   * Body-x/y translation uses the TOTAL mass (unsprung masses follow the body horizontally).
//   * Body-z translation uses the SPRUNG mass; each unsprung mass has its own DOF along the body z
//     axis (suspension travel s, + = bump) driven by tyre vertical force, coil-over, ARB, bump
//     stop, droop limiter and the link "jacking" forces.
//   * Rotational inertia = sprung inertia (params) + unsprung masses' horizontal contributions.
// Force paths
//   * Tyre forces are computed in the local ground plane (track normal) and expressed in body axes.
//     The body-z part loads the unsprung mass; the body-x/y parts act on the body at the contact
//     patch, plus a link jacking force J on the body (and −J on the wheel) chosen so the resultant
//     line of action passes through the roll centre (lateral) and the anti-dive/anti-squat
//     instant centre (longitudinal). Geometric vs elastic load transfer therefore emerges.
// Drivetrain: see drivetrain.js (PGS over crank / motors / wheels).

import { DT, G, RHO_AIR, SURFACE } from './constants.js';
import { createTyreState, tyreForces, tyreSteadyForces } from './tyre.js';
import { createEngineState, engineUpdate, engineCurve } from './engine.js';
import { Drivetrain } from './drivetrain.js';

const TWO_PI = 2 * Math.PI;
const RPM = 60 / TWO_PI;          // rad/s -> rpm
const T_AMB_C = 20;

const CURVE_CACHE = new WeakMap();   // engineParams -> full-throttle curve (expensive sweep)

function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }

/**
 * Optimal upshift rpm per gear from the full-throttle torque curve: shift from g to g+1 where the
 * wheel force in g+1 overtakes the force in g (or just below the limiter if it never does).
 * @returns {Float64Array} upRpm[g-1] = engine rpm in gear g at which to upshift
 */
export function computeShiftPoints(curve, ratios, limiterRpm) {
  const n = ratios.length;
  const up = new Float64Array(Math.max(1, n));
  const maxShift = limiterRpm - 150;
  const torqueAt = (rpm) => {
    if (!curve.length) return 0;
    if (rpm <= curve[0].rpm) return curve[0].torque;
    const last = curve[curve.length - 1];
    if (rpm >= last.rpm) return rpm > limiterRpm ? 0 : last.torque;
    let lo = 0, hi = curve.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (curve[m].rpm <= rpm) lo = m; else hi = m; }
    const a = curve[lo], b = curve[hi];
    return a.torque + (b.torque - a.torque) * (rpm - a.rpm) / (b.rpm - a.rpm);
  };
  // peak torque rpm (do not shift before it)
  let pkRpm = curve.length ? curve[0].rpm : 1000, pk = -1;
  for (const p of curve) if (p.torque > pk) { pk = p.torque; pkRpm = p.rpm; }
  for (let g = 0; g < n; g++) {
    up[g] = maxShift;
    if (g === n - 1) continue;
    const r1 = ratios[g], r2 = ratios[g + 1];
    for (let rpm = pkRpm; rpm <= maxShift; rpm += 20) {
      const f1 = torqueAt(rpm) * r1, f2 = torqueAt(rpm * r2 / r1) * r2;
      if (f2 >= f1) { up[g] = rpm; break; }
    }
  }
  return up;
}

class Vehicle {
  /**
   * @param {object} params build() output
   * @param {object} track  createTrack() output (needs query(x, y, hint, out))
   * @param {{x:number,y:number,heading:number}} pose
   */
  constructor(params, track, pose, opts) {
    this.params = params;
    this.opts = opts || {};
    this.track = track;
    const geo = params.geometry, mass = params.mass, ax = params.axles;

    // ---------- mass properties ----------
    const muF = mass.unsprungF, muR = mass.unsprungR;
    this.mTot = mass.total;
    let ms = mass.sprung;
    if (!(ms > 0) || Math.abs(this.mTot - (ms + 2 * muF + 2 * muR)) > 1) ms = this.mTot - 2 * muF - 2 * muR;
    this.mSprung = ms;
    const cgH = geo.cgHeight, a = geo.a, b = geo.b, L = geo.wheelbase || (a + b);
    this.cgH = cgH; this.a = a; this.b = b; this.L = L;

    // ---------- per-corner constants ----------
    const W = (n) => new Float64Array(n);
    this.hpX = W(4); this.hpY = W(4); this.hpZ = W(4); this.side = W(4);
    this.kS = W(4); this.cBump = W(4); this.cReb = W(4); this.kArb = W(4); this.F0 = W(4);
    this.maxC = W(4); this.maxD = W(4); this.mU = W(4); this.invMU = W(4);
    this.kT = W(4); this.cT = W(4); this.rad = W(4); this.rc = W(4); this.antiK = W(4);
    this.camS = W(4); this.camG = W(4); this.toe = W(4); this.brakeT = W(4);
    this.heatCap = W(4); this.fadeStart = W(4); this.delta0 = W(4); this.kBS = W(4);
    this.tp = [];
    const wheelI = [0, 0, 0, 0];
    for (let i = 0; i < 4; i++) {
      const front = i < 2, A = ax[front ? 0 : 1], tp = A.tyre;
      this.tp.push(tp);
      const side = (i & 1) === 0 ? 1 : -1;
      const track = front ? geo.trackF : geo.trackR;
      const mu = front ? muF : muR;
      this.side[i] = side; this.mU[i] = mu; this.invMU[i] = 1 / mu;
      this.hpX[i] = front ? a : -b; this.hpY[i] = side * track * 0.5;
      this.kS[i] = A.spring; this.cBump[i] = A.bumpDamp; this.cReb[i] = A.reboundDamp;
      this.kArb[i] = A.arb || 0;
      this.maxC[i] = A.maxCompression; this.maxD[i] = A.maxDroop;
      this.kBS[i] = Math.max(8 * A.spring, 1.2e5);
      this.kT[i] = tp.vertStiff; this.cT[i] = tp.vertDamp; this.rad[i] = tp.radius;
      this.rc[i] = A.rollCentre;
      this.antiK[i] = (front ? -1 : 1) * (A.anti || 0) * cgH / L;
      this.camS[i] = A.camberStatic; this.camG[i] = A.camberGain; this.toe[i] = A.toe || 0;
      this.brakeT[i] = A.brakeTorque; this.heatCap[i] = A.brakeHeatCap || 8000;
      this.fadeStart[i] = A.brakeFadeStart || 500;
      // static loads: sprung weight on springs by sprung-CG position, plus unsprung weight
      const Fs = ms * G * (front ? b : a) / L * 0.5;
      this.F0[i] = Fs;
      const Fz0 = Fs + mu * G;
      this.delta0[i] = Fz0 / tp.vertStiff;
      // static wheel centre height in body frame (hardpoint = static wheel centre position)
      this.hpZ[i] = -(cgH - (tp.radius - this.delta0[i]));
      wheelI[i] = tp.inertia;
    }
    const inr = mass.inertia;
    let Ixx = inr.Ixx, Iyy = inr.Iyy, Izz = inr.Izz;
    for (let i = 0; i < 4; i++) {
      const x = this.hpX[i], y = this.hpY[i], z = this.hpZ[i], m = this.mU[i];
      Ixx += m * z * z; Iyy += m * z * z; Izz += m * (x * x + y * y);
    }
    this.Ixx = Ixx; this.Iyy = Iyy; this.Izz = Izz;

    // ---------- aero ----------
    const ae = params.aero;
    this.cdA = ae.cdA; this.clAF = ae.clAFront; this.clAR = ae.clARear;
    this.gEff = ae.groundEffect || 0; this.refRH = ae.refRideHeight || geo.rideHeight || 0.12;
    this.copZ = (ae.copHeight != null ? ae.copHeight : cgH) - cgH;
    this.rideH = geo.rideHeight || 0.12;

    // ---------- power units / drivetrain ----------
    const dtp = params.drivetrain;
    this.isEV = !!dtp.isEV;
    this.eff = dtp.efficiency || 0.92;
    this.units = params.powerUnits;
    this.engines = [];
    this.unitSlot = new Int32Array(this.units.length);
    this.drive = new Drivetrain(params, wheelI);
    for (let u = 0; u < this.units.length; u++) this.unitSlot[u] = this.drive.unitSlot[u];
    this.nGears = this.isEV ? 1 : dtp.gearRatios.length;
    this.gearRatios = dtp.gearRatios;
    this.shiftTime = this.isEV ? 0 : (dtp.shiftTime || 0.2);
    this.clutchMax = dtp.clutchMaxTorque || 500;
    const ep0 = this.units[0].engine;
    this.idleRpm = ep0.idleRpm || 900;
    this.redlineRpm = ep0.redlineRpm || 7000;
    this.limiterRpm = ep0.limiterRpm || this.redlineRpm + 200;
    this.maxRpm = ep0.maxRpm || this.limiterRpm + 500;
    if (!this.isEV) {
      let curve = CURVE_CACHE.get(ep0);
      if (!curve) { curve = engineCurve(ep0); CURVE_CACHE.set(ep0, curve); }
      this.upRpm = computeShiftPoints(curve, dtp.gearRatios, this.limiterRpm);
      let pk = -1, pkRpm = 0.6 * this.redlineRpm;
      for (const p of curve) if (p.torque > pk) { pk = p.torque; pkRpm = p.rpm; }
      this.peakTorqueRpm = pkRpm;
      this.launchRpm = clamp(pkRpm, this.idleRpm * 2.5, 0.65 * this.redlineRpm);
    } else {
      this.upRpm = new Float64Array(1); this.peakTorqueRpm = 0; this.launchRpm = 0;
    }
    // driven-wheel radius for speed/rpm conversions
    this.driveRad = this.drive.frontDriven ? this.rad[0] : this.rad[2];

    // ---------- aids ----------
    const el = params.electronics || {};
    this.hasABS = !!el.abs; this.hasTC = !!el.tc; this.hasLaunch = !!el.launch;
    this.peakSlip = this._estimatePeakSlip();

    // ---------- steering ----------
    const st = params.steering;
    this.maxLock = st.maxLock; this.ackermann = st.ackermann || 0; this.steerRate = st.rate || 6;

    // ---------- scratch (no per-step allocation) ----------
    this.R = new Float64Array(9);
    this.tyreIn = { Fz: 0, vx: 0, vy: 0, omega: 0, camber: 0, surface: 0 };
    this.tyreOut = [];
    this.q = [];
    for (let i = 0; i < 5; i++) this.q.push({ s: 0, offset: 0, height: 0, nx: 0, ny: 0, nz: 1, surface: 0, index: -1 });
    this.hint = new Int32Array(5).fill(-1);
    this.s = W(4); this.sd = W(4); this.fbz = W(4); this.Jk = W(4); this.Fsusp = W(4);
    this.delta = W(4); this.vxW = W(4); this.absF = W(4); this.brakeCmd = W(4);
    this.wheelSteer = W(4);
    this.env = { regen: 0, ambientT: 293.15, ambientP: 101325, nitrous: false };

    // ---------- public state ----------
    this.pos = [0, 0, 0]; this.quat = [0, 0, 0, 1]; this.vel = [0, 0, 0]; this.angVel = [0, 0, 0];
    this.accBody = [0, 0, 0];
    this.controls = { steer: 0, throttle: 0, brake: 0, handbrake: 0, shiftUp: false, shiftDown: false, gearMode: 'auto', nitrous: false };
    this.aids = { absActive: false, tcActive: false, launchActive: false };
    this.trackState = { s: 0, offset: 0, index: -1, surface: 0 };
    this.wheels = [];
    for (let i = 0; i < 4; i++) {
      this.tyreOut.push({ Fx: 0, Fy: 0, Mz: 0, slipRatio: 0, slipAngle: 0, usage: 0, sliding: false, rollResTorque: 0 });
      this.wheels.push({
        pos: [0, 0, 0], steer: 0, spin: 0, omega: 0, compression: 0, Fz: 0, Fx: 0, Fy: 0,
        slipRatio: 0, slipAngle: 0, usage: 0, sliding: false, contact: true, surface: 0,
        camber: 0, tyre: null, brakeTempC: T_AMB_C, onTrack: true,
      });
    }
    this.reset(pose);
  }

  /** Longitudinal slip ratio at peak Fx from the tyre's steady-state curve (one-off, at build). */
  _estimatePeakSlip() {
    const tp = this.tp[2];
    const out = { Fx: 0, Fy: 0, Mz: 0, usage: 0, mu: 0 };
    const Fz = this.F0[2] + this.mU[2] * G;
    let best = -1, bestK = 0.1;
    for (let k = 0.01; k <= 0.5; k += 0.005) {
      tyreSteadyForces(tp, Fz, k, 0, 0, SURFACE.ASPHALT, out);
      if (out.Fx > best) { best = out.Fx; bestK = k; }
    }
    this.muPeak = clamp(best / Fz, 0.3, 2.5);
    return clamp(bestK, 0.03, 0.3);
  }

  /** Reset to a pose on the ground in static equilibrium. */
  reset(pose) {
    const p = pose || { x: 0, y: 0, heading: 0 };
    const q = this.q[4];
    this.hint.fill(-1);
    this.track.query(p.x, p.y, -1, q);
    this.hint[4] = q.index;
    let nx = q.nx, ny = q.ny, nz = q.nz;
    // body axes: z = ground normal, x = heading projected on the ground plane
    const hx = Math.cos(p.heading), hy = Math.sin(p.heading);
    const d = hx * nx + hy * ny;
    let fx = hx - d * nx, fy = hy - d * ny, fz = -d * nz;
    const fl = Math.hypot(fx, fy, fz); fx /= fl; fy /= fl; fz /= fl;
    const yx = ny * fz - nz * fy, yy = nz * fx - nx * fz, yz = nx * fy - ny * fx;
    // rotation matrix columns = body axes in world -> quaternion
    const m00 = fx, m10 = fy, m20 = fz, m01 = yx, m11 = yy, m21 = yz, m02 = nx, m12 = ny, m22 = nz;
    const tr = m00 + m11 + m22, Q = this.quat;
    if (tr > 0) {
      const S = Math.sqrt(tr + 1) * 2;
      Q[3] = 0.25 * S; Q[0] = (m21 - m12) / S; Q[1] = (m02 - m20) / S; Q[2] = (m10 - m01) / S;
    } else if (m00 > m11 && m00 > m22) {
      const S = Math.sqrt(1 + m00 - m11 - m22) * 2;
      Q[3] = (m21 - m12) / S; Q[0] = 0.25 * S; Q[1] = (m01 + m10) / S; Q[2] = (m02 + m20) / S;
    } else if (m11 > m22) {
      const S = Math.sqrt(1 + m11 - m00 - m22) * 2;
      Q[3] = (m02 - m20) / S; Q[0] = (m01 + m10) / S; Q[1] = 0.25 * S; Q[2] = (m12 + m21) / S;
    } else {
      const S = Math.sqrt(1 + m22 - m00 - m11) * 2;
      Q[3] = (m10 - m01) / S; Q[0] = (m02 + m20) / S; Q[1] = (m12 + m21) / S; Q[2] = 0.25 * S;
    }
    this.pos[0] = p.x + nx * this.cgH; this.pos[1] = p.y + ny * this.cgH; this.pos[2] = q.height + nz * this.cgH;
    this.vel[0] = this.vel[1] = this.vel[2] = 0;
    this.angVel[0] = this.angVel[1] = this.angVel[2] = 0;
    this.accBody[0] = this.accBody[1] = this.accBody[2] = 0;
    this.time = 0;
    this.s.fill(0); this.sd.fill(0); this.absF.fill(1); this.brakeCmd.fill(0);
    for (let i = 0; i < 4; i++) {
      const wh = this.wheels[i];
      // tyres start at their optimum temperature ("after a warm-up lap") unless opts.tyreTempC given
      const tt = this.opts.tyreTempC;
      wh.tyre = createTyreState(this.tp[i], Number.isFinite(tt) ? tt : this.tp[i].tOpt);
      wh.spin = 0; wh.omega = 0; wh.brakeTempC = T_AMB_C; wh.Fz = this.F0[i] + this.mU[i] * G;
      wh.compression = 0; wh.contact = true; wh.steer = 0;
      this.delta[i] = this.delta0[i];
    }
    this.engines.length = 0;
    for (let u = 0; u < this.units.length; u++) this.engines.push(createEngineState(this.units[u].engine));
    this.drive.reset();
    if (!this.isEV) this.drive.omega[0] = this.idleRpm / RPM;
    for (let u = 0; u < this.engines.length; u++) {
      const es = this.engines[u];
      if (!this.isEV) { es.omega = this.idleRpm / RPM; es.rpm = this.idleRpm; }
    }
    // ECU state
    this.gear = 0; this.clutch = 0; this.shifting = false; this.shiftTimer = 0; this.shiftDir = 0;
    this.sinceShift = 10; this.clutchLocked = false; this.holdTimer = 0; this.revArmed = true;
    this.prevUp = false; this.prevDown = false; this.steerAngle = 0;
    this.tcI = 0; this.launchState = 0; this.idleI = 0; this.lcScale = 1; this._rpmT = this.idleRpm;
    this.aids.absActive = this.aids.tcActive = this.aids.launchActive = false;
    this.drive.setGear(this.isEV ? 1 : 0);
    this.damage = 0; this.failed = false;
    this.speed = 0; this.heading = Math.atan2(fy, fx);
    this._updateRot();
    this._wheelPos();
    this._updatePublic();
  }

  _updateRot() {
    const Q = this.quat, R = this.R;
    const x = Q[0], y = Q[1], z = Q[2], w = Q[3];
    R[0] = 1 - 2 * (y * y + z * z); R[1] = 2 * (x * y - z * w); R[2] = 2 * (x * z + y * w);
    R[3] = 2 * (x * y + z * w); R[4] = 1 - 2 * (x * x + z * z); R[5] = 2 * (y * z - x * w);
    R[6] = 2 * (x * z - y * w); R[7] = 2 * (y * z + x * w); R[8] = 1 - 2 * (x * x + y * y);
  }

  // ------------------------------------------------------------------------------------------
  // ECU: gear selection, clutch, aids. Uses last-step wheel/engine state.
  // ------------------------------------------------------------------------------------------
  _ecu(c, vFwd) {
    const dt = DT, drv = this.drive;
    let thr = clamp(c.throttle || 0, 0, 1), brk = clamp(c.brake || 0, 0, 1);
    const auto = c.gearMode !== 'manual';
    const n = this.nGears;
    const es0 = this.engines[0];
    const rpm = this.isEV ? 0 : drv.omega[0] * RPM;
    const stopped = Math.abs(vFwd) < 0.6;
    this.sinceShift += dt;
    // shift scheduling uses a peak-hold pedal so brief lifts (driver/TC modulation) don't upshift early
    this.thrHold = Math.max(thr, (this.thrHold || 0) - dt * 0.6);
    const thrS = this.thrHold;

    // ---- gear selection ----
    const upEdge = !!c.shiftUp && !this.prevUp, downEdge = !!c.shiftDown && !this.prevDown;
    this.prevUp = !!c.shiftUp; this.prevDown = !!c.shiftDown;
    let want = this.gear;
    if (!auto) {
      if (upEdge) {
        if (this.gear < 0) want = 0;
        else if (this.gear < n) want = this.gear + 1;
      } else if (downEdge) {
        if (this.gear > 1) {
          // block downshifts that would mechanically over-rev the engine
          const rIn = Math.abs(drv.inputOmega()) * RPM / Math.abs(drv.gearRatio || 1);
          const rpmNew = this.isEV ? 0 : rIn * this.gearRatios[this.gear - 2];
          if (rpmNew < this.maxRpm) want = this.gear - 1;
        } else if (this.gear === 1) want = 0;
        else if (this.gear === 0 && Math.abs(vFwd) < 2) want = -1;
      }
      if (this.isEV && want > 1) want = 1;
    } else {
      // manual paddles still work in auto for N/R selection at standstill
      if (stopped) {
        if (brk > 0.2 && thr < 0.05) this.holdTimer += dt; else this.holdTimer = 0;
        if (brk < 0.1) this.revArmed = true;
        if (this.holdTimer > 0.6 && this.revArmed) {
          want = this.gear >= 0 ? -1 : 0;
          this.revArmed = false; this.holdTimer = 0;
        } else if (this.gear === 0 && thr > 0.05) want = 1;
        else if (this.gear >= 1 && thr < 0.02 && !this.shifting) want = 0;   // neutral at standstill
        else if (this.gear > 1 && thr >= 0.02) want = 1;
        if (upEdge && this.gear <= 0) want = this.gear + 1;
        if (downEdge && this.gear >= 0 && this.gear <= 1) want = this.gear - 1;
      } else if (this.gear === 0) {
        want = vFwd > 0 ? 1 : (thr > 0.05 ? -1 : 0);
        if (vFwd > 0) want = this._bestGearForSpeed(vFwd);
      }
      if (!this.isEV && this.gear >= 1 && !this.shifting && !stopped) {
        const g = this.gear;
        const ratioNow = this.gearRatios[g - 1];
        const rpmOut = Math.abs(drv.drivenOmega()) * ratioNow * this.drive.finalDrive * RPM;
        const idle = this.idleRpm;
        if (g < n && this.sinceShift > this.shiftTime + 0.3) {
          const upFull = this.upRpm[g - 1];
          const upEff = Math.max(idle * 2.2, upFull * (0.5 + 0.5 * thrS));
          // wheelspin should not trigger upshifts (unless the engine is bouncing off the limiter)
          const rpmGround = Math.abs(vFwd) / this.driveRad * ratioNow * this.drive.finalDrive * RPM;
          let rpmUp = Math.min(rpmOut, rpmGround * (1 + 1.5 * this.peakSlip));
          if (rpm > this.limiterRpm - 100) rpmUp = rpmOut;
          const rpmAfter = rpmUp * this.gearRatios[g] / ratioNow;
          if (rpmUp > upEff && rpmAfter > idle * 1.6) want = g + 1;
        }
        if (g > 1 && want === g && this.sinceShift > this.shiftTime + 0.15) {
          const rLow = this.gearRatios[g - 2];
          const rpmLower = rpmOut * rLow / ratioNow;
          const lug = rpmOut < idle * (1.5 + 1.0 * thrS);
          // kickdown: only at (near) full pedal and only if the lower gear lands well below its shift point
          const kick = thr > 0.9 && this.sinceShift > 1.0 && rpmLower < 0.8 * this.upRpm[g - 2];
          if ((lug || kick) && rpmLower < this.limiterRpm * 0.9) want = g - 1;
        }
      }
      if (this.isEV && want > 1) want = 1;
    }
    if (want !== this.gear) this._shiftTo(want);

    // ---- shifting phase ----
    if (this.shiftTimer > 0) {
      this.shiftTimer -= dt;
      if (this.shiftTimer <= 0) { this.shiftTimer = 0; }
    }
    this.shifting = this.shiftTimer > 0;

    // ---- reverse: in reverse the throttle drives backwards; nothing else to do (ratio is signed)

    // ---- launch control ----
    // Any ICE car: brake + throttle at standstill = pre-rev (clutch held open, crank held at the
    // launch speed); releasing the brake pulls away through the slip/traction-controlled clutch.
    // Cars with launch control additionally keep the optimum launch speed regardless of pedal
    // position until the clutch has locked.
    const preRev = !this.isEV && this.gear !== 0 && stopped && brk > 0.1 && thr > 0.3;
    if (this.hasLaunch && !this.isEV && this.gear === 1 && stopped && thr > 0.8) this.launchState = 1;
    else if (this.launchState === 1 && (thr < 0.5 || this.clutchLocked || this.gear !== 1)) this.launchState = 0;
    const launch = this.launchState === 1;
    if (stopped && this.clutch < 0.02) this.lcScale = 1;
    this.aids.launchActive = launch;

    // ---- traction control (driven wheel slip) ----
    let tcCut = 0;
    if (this.hasTC && this.gear !== 0) {
      let kmax = -1;
      for (let i = 0; i < 4; i++) {
        const driven = i < 2 ? drv.frontDriven : drv.rearDriven;
        if (!driven || !this.wheels[i].contact) continue;
        const vx = this.vxW[i], slipV = drv.omega[2 + i] * this.rad[i] - vx;
        const k = (this.gear < 0 ? -slipV : slipV) / Math.max(Math.abs(vx), 3);
        if (k > kmax) kmax = k;
      }
      const err = kmax - this.peakSlip * 1.15;
      this.tcI = clamp(this.tcI + dt * (err > 0 ? 12 * err : -2), 0, 0.8);
      tcCut = clamp(this.tcI + (err > 0 ? 2.5 * err : 0), 0, 0.85);
    } else this.tcI = 0;
    this.aids.tcActive = tcCut > 0.02;

    // ---- throttle shaping ----
    let thrEff = thr;
    if (this.gear === 0 && this.isEV) thrEff = 0;
    if (this.isEV && stopped && brk > 0.1) thrEff = 0;      // brake-throttle override at standstill
    if (this.shifting && this.shiftTimer > 0.3 * this.shiftTime) {
      if (this.shiftDir > 0) thrEff = 0;
      else {
        // rev-match blip toward the new gear's input speed
        const target = Math.abs(drv.inputOmega()) * RPM;
        thrEff = clamp((target - rpm) / 800, 0, 1);
      }
    }
    if (preRev) {
      const lim = clamp(1 - (rpm - this.launchRpm) / 400, 0, 1);
      thrEff = Math.min(thrEff, lim);
    }
    thrEff *= 1 - tcCut;
    // while the auto clutch is slipping (pull-away), the ECU holds the crank near the launch speed
    // instead of letting it flare to the limiter (the clutch, not the engine, meters the torque)
    if (!this.isEV && this.gear !== 0 && !this.clutchLocked && !this.shifting && this.clutch > 0.05) {
      const rpmIn = Math.abs(drv.inputOmega()) * RPM;
      const rpmHold = Math.max(this._rpmT + 400, rpmIn + 300);
      thrEff = Math.min(thrEff, clamp(1 - (rpm - rpmHold) / 500, 0, 1));
    }
    // engine failure → no drive
    let failed = false;
    for (let u = 0; u < this.engines.length; u++) if (this.engines[u].failed) failed = true;
    if (failed) thrEff = 0;
    // (idle speed control lives in engine.js)
    this._thrEff = thrEff;

    // ---- clutch (ICE) ----
    if (!this.isEV) {
      let target = 0, rateUp = 8, rateDn = 30;
      if (this.gear === 0) { target = 0; this.clutchLocked = false; }
      else if (this.shifting) {
        // torque interruption: open for the first 70 % of shiftTime, re-engage over the last 30 %
        const fr = this.shiftTimer / this.shiftTime;
        target = fr > 0.3 ? 0 : 1 - fr / 0.3; rateDn = 1e3; rateUp = 1e3;
      } else {
        const rpmIn = Math.abs(drv.inputOmega()) * RPM;
        const slip = Math.abs(drv.omega[0] * RPM - rpmIn);
        if (this.clutchLocked) {
          if (rpmIn < this.idleRpm * 0.9 && !launch) this.clutchLocked = false;
        } else if (this.clutch > 0.05 && rpmIn > this.idleRpm) {
          // synchronised (and not merely because the driven wheels are spinning up), or the car is
          // already fast enough to run the launch speed without slip -> close the clutch fully
          const rpmGround = Math.abs(vFwd / this.driveRad * drv.totalRatio()) * RPM;
          if ((slip < 80 && Math.abs(drv.omega[0] * RPM - rpmGround) < Math.max(300, 0.15 * rpm))
            || rpmGround > this._rpmT) this.clutchLocked = true;
        }
        if ((c.handbrake || 0) > 0.5) { this.clutchLocked = false; }
        if (this.clutchLocked) { target = 1; rateUp = this.sinceShift < this.shiftTime + 0.05 ? 1e3 : 6; }
        else if ((c.handbrake || 0) > 0.5) target = 0;
        else if (preRev) target = 0;
        else {
          // slip-controlled engagement: hold the crank at a throttle-dependent launch speed;
          // capacity = engine torque (feed-forward) + P on the rpm error. Locks once synchronised.
          const idle = this.idleRpm;
          const rpmT = launch ? this.launchRpm : idle * 1.1 + Math.min(1, thr * 1.5) * (this.launchRpm - idle * 1.1);
          this._rpmT = rpmT;
          const Te = this.engines[0].torque * this.eff;
          const cap = (Te > 0 ? Te : 0) + 0.4 * (rpm - rpmT);
          // traction-aware pull-away: never feed more clutch torque than the driven tyres can use,
          // trimmed by driven-wheel slip feedback (what a good driver does with the clutch pedal)
          let Fzd = 0, kmax = -1;
          for (let i = 0; i < 4; i++) {
            if (!(i < 2 ? drv.frontDriven : drv.rearDriven)) continue;
            Fzd += this.wheels[i].Fz;
            const vx = this.vxW[i];
            const k = (Math.abs(drv.omega[2 + i]) * this.rad[i] - Math.abs(vx)) / Math.max(Math.abs(vx), 2);
            if (k > kmax) kmax = k;
          }
          const ks = this.peakSlip;
          if (kmax > ks * 1.2) this.lcScale -= dt * (2 + 20 * (kmax - ks * 1.2));
          else this.lcScale += dt * 1.5;
          this.lcScale = clamp(this.lcScale, 0.4, 1.3);
          const capTr = Fzd * this.muPeak * this.driveRad / (Math.abs(drv.totalRatio()) * this.eff + 1e-6);
          target = clamp(Math.min(cap, capTr * this.lcScale) / this.clutchMax, 0, 1);
          rateUp = 20; rateDn = 20;
        }
      }
      const e = this.clutch;
      this.clutch = target > e ? Math.min(target, e + rateUp * dt) : Math.max(target, e - rateDn * dt);
      drv.clutchCap = this.clutchMax * this.clutch;
    } else {
      this.clutch = 1; drv.clutchCap = 0;
    }

    // ---- brakes + ABS ----
    const hb = clamp(c.handbrake || 0, 0, 1);
    let absOn = false;
    for (let i = 0; i < 4; i++) {
      let f = this.absF[i];
      if (this.hasABS && brk > 0.02 && Math.abs(vFwd) > 2.5 && this.wheels[i].contact) {
        const vx = this.vxW[i];
        const k = (drv.omega[2 + i] * this.rad[i] - vx) / Math.max(Math.abs(vx), 1);
        const kk = vx >= 0 ? -k : k;           // positive = braking slip
        const tgt = this.peakSlip;
        if (kk > tgt * 1.1) f -= dt * (15 + 150 * (kk - tgt));
        else if (kk < tgt * 0.8) f += dt * 5;
        f = clamp(f, 0.05, 1);
      } else f = Math.min(1, f + dt * 10);
      this.absF[i] = f;
      if (f < 0.98 && brk > 0.02 && this.hasABS) absOn = true;
      const T = this.wheels[i].brakeTempC, fs = this.fadeStart[i];
      const fade = T > fs ? Math.max(0.35, 1 - (T - fs) / 400) : 1;
      let cmd = brk * this.brakeT[i] * fade * f;
      if (i >= 2 && hb > 0) cmd += hb * Math.max(1.5 * this.brakeT[i], 1500);
      this.brakeCmd[i] = cmd;
    }
    this.aids.absActive = absOn;

    const ctl = this.controls;
    ctl.steer = c.steer || 0; ctl.throttle = thrEff; ctl.brake = brk; ctl.handbrake = hb;
    ctl.shiftUp = !!c.shiftUp; ctl.shiftDown = !!c.shiftDown; ctl.gearMode = auto ? 'auto' : 'manual';
    ctl.nitrous = !!c.nitrous;
    return brk;
  }

  _bestGearForSpeed(v) {
    const w = v / this.driveRad;
    for (let g = 1; g <= this.nGears; g++) {
      const rpm = w * this.gearRatios[g - 1] * this.drive.finalDrive * RPM;
      if (rpm < this.upRpm[g - 1]) return g;
    }
    return this.nGears;
  }

  _shiftTo(g) {
    const prev = this.gear;
    this.gear = g;
    this.sinceShift = 0;
    const drv = this.drive;
    if (this.isEV) { drv.setGear(g < 0 ? -1 : 1); return; }
    drv.setGear(g === 0 ? 0 : g > 0 ? this.gearRatios[g - 1] : -this.params.drivetrain.reverseRatio);
    if (prev !== 0 && g !== 0 && this.shiftTime > 0) {
      this.shiftTimer = this.shiftTime; this.shiftDir = g > prev ? 1 : -1;
      this.clutch = 0; this.clutchLocked = true;
    } else { this.clutchLocked = false; this.shiftTimer = 0; }
  }

  /**
   * Advance exactly DT.
   * @param {{steer:number,throttle:number,brake:number,handbrake:number,shiftUp:boolean,shiftDown:boolean,gearMode:string}} c
   */
  step(c) {
    const dt = DT;
    const R = this.R, pos = this.pos, vel = this.vel, om = this.angVel, drv = this.drive, wo = drv.omega;
    const R00 = R[0], R01 = R[1], R02 = R[2], R10 = R[3], R11 = R[4], R12 = R[5], R20 = R[6], R21 = R[7], R22 = R[8];
    // body-frame CG velocity
    const vbx = R00 * vel[0] + R10 * vel[1] + R20 * vel[2];
    const vby = R01 * vel[0] + R11 * vel[1] + R21 * vel[2];
    const vbz = R02 * vel[0] + R12 * vel[1] + R22 * vel[2];
    const wx = om[0], wy = om[1], wz = om[2];

    // ---------------- driver / ECU ----------------
    const brk = this._ecu(c, vbx);

    // ---------------- steering ----------------
    const target = clamp(c.steer || 0, -1, 1) * this.maxLock;
    const maxd = this.steerRate * dt;
    this.steerAngle += clamp(target - this.steerAngle, -maxd, maxd);
    const d0 = this.steerAngle, L = this.L;
    const ws = this.wheelSteer;
    if (Math.abs(d0) > 1e-5) {
      const t = Math.tan(d0);
      const hT = this.hpY[0];
      const dL = Math.atan(L * t / (L - hT * t)), dR = Math.atan(L * t / (L + hT * t));
      const A = this.ackermann;
      ws[0] = d0 + A * (dL - d0); ws[1] = d0 + A * (dR - d0);
    } else { ws[0] = d0; ws[1] = d0; }
    ws[0] -= this.toe[0]; ws[1] += this.toe[1]; ws[2] = -this.toe[2]; ws[3] = this.toe[3];

    // ---------------- corners: kinematics, ground, tyres ----------------
    const g_bx = -G * R20, g_by = -G * R21, g_bz = -G * R22;
    let Fx = 0, Fy = 0, Fz = 0, Tx = 0, Ty = 0, Tz = 0;
    const s = this.s, sd = this.sd, track = this.track, hint = this.hint, tin = this.tyreIn;
    const hpX = this.hpX, hpY = this.hpY, hpZ = this.hpZ;
    let clearF = 0, clearR = 0;
    for (let i = 0; i < 4; i++) {
      const rx = hpX[i], ry = hpY[i], rz = hpZ[i] + s[i];
      const pwx = pos[0] + R00 * rx + R01 * ry + R02 * rz;
      const pwy = pos[1] + R10 * rx + R11 * ry + R12 * rz;
      const pwz = pos[2] + R20 * rx + R21 * ry + R22 * rz;
      // wheel-centre velocity in body frame: v + ω×r + (0,0,ṡ)
      const ubx = vbx + wy * rz - wz * ry;
      const uby = vby + wz * rx - wx * rz;
      const ubz = vbz + wx * ry - wy * rx + sd[i];
      const vwx = R00 * ubx + R01 * uby + R02 * ubz;
      const vwy = R10 * ubx + R11 * uby + R12 * ubz;
      const vwz = R20 * ubx + R21 * uby + R22 * ubz;
      const q = this.q[i];
      track.query(pwx, pwy, hint[i], q);
      hint[i] = q.index;
      const nx = q.nx, ny = q.ny, nz = q.nz;
      const rad = this.rad[i];
      const dist = (pwz - q.height) * nz;
      const delta = rad - dist;
      const wh = this.wheels[i];
      let Fn = 0;
      if (delta > 0) {
        const ddot = -(vwx * nx + vwy * ny + vwz * nz);
        Fn = this.kT[i] * delta + this.cT[i] * ddot;
        if (Fn < 0) Fn = 0;
      }
      this.delta[i] = delta;
      wh.contact = Fn > 0;
      // wheel heading projected onto the ground plane
      const st = ws[i], cs = Math.cos(st), sn = Math.sin(st);
      let hx = R00 * cs + R01 * sn, hy = R10 * cs + R11 * sn, hz = R20 * cs + R21 * sn;
      const hd = hx * nx + hy * ny + hz * nz;
      hx -= hd * nx; hy -= hd * ny; hz -= hd * nz;
      const hl = 1 / Math.sqrt(hx * hx + hy * hy + hz * hz);
      hx *= hl; hy *= hl; hz *= hl;
      const lx = ny * hz - nz * hy, ly = nz * hx - nx * hz, lz = nx * hy - ny * hx;
      const vx = vwx * hx + vwy * hy + vwz * hz;
      const vy = vwx * lx + vwy * ly + vwz * lz;
      this.vxW[i] = vx;
      // camber relative to road (tyre convention: + = top leaning left)
      const sinRoll = R01 * nx + R11 * ny + R21 * nz;
      const camber = this.side[i] * this.camS[i] - (1 - this.camG[i]) * sinRoll;
      tin.Fz = Fn; tin.vx = vx; tin.vy = vy; tin.omega = wo[2 + i]; tin.camber = camber; tin.surface = q.surface;
      const out = this.tyreOut[i];
      tyreForces(wh.tyre, this.tp[i], tin, dt, out);
      let tfx = out.Fx, tfy = out.Fy;
      if (Fn <= 0) { tfx = 0; tfy = 0; }
      // world force
      const fwx = tfx * hx + tfy * lx + Fn * nx;
      const fwy = tfx * hy + tfy * ly + Fn * ny;
      const fwz = tfx * hz + tfy * lz + Fn * nz;
      // body frame
      const fbx = R00 * fwx + R10 * fwy + R20 * fwz;
      const fby = R01 * fwx + R11 * fwy + R21 * fwz;
      const fbz = R02 * fwx + R12 * fwy + R22 * fwz;
      // horizontal parts on the body at the contact patch
      const rl = delta > 0 ? rad - delta : rad;
      const cz = rz - rl;
      Fx += fbx; Fy += fby;
      Tx += -cz * fby; Ty += cz * fbx; Tz += rx * fby - ry * fbx;
      // link jacking (roll centre / anti geometry)
      const J = -fby * this.rc[i] / ry + this.antiK[i] * fbx;
      this.Jk[i] = J; this.fbz[i] = fbz;
      // road reaction torque on the wheel
      drv.torque[2 + i] = -tfx * rad;
      this.brakeCmd[i] += 0; // (already set by ECU)
      drv.brakeCap[i] = this.brakeCmd[i] + (Fn > 0 ? Math.abs(out.rollResTorque || 0) : 0);
      wh.Fz = Fn; wh.Fx = tfx; wh.Fy = tfy; wh.slipRatio = out.slipRatio; wh.slipAngle = out.slipAngle;
      wh.usage = out.usage; wh.sliding = out.sliding; wh.surface = q.surface; wh.camber = camber;
      wh.onTrack = q.surface === SURFACE.ASPHALT || q.surface === SURFACE.KERB;
      wh.steer = st;
      const clr = -s[i] - ((delta > 0 ? delta : 0) - this.delta0[i]);
      if (i < 2) clearF += 0.5 * clr; else clearR += 0.5 * clr;
    }

    // ---------------- power units + drivetrain ----------------
    const env = this.env;
    env.nitrous = !this.isEV && !!c.nitrous;
    env.regen = (this.isEV && brk > 0 && Math.abs(vbx) > 1.5 && !this.aids.absActive) ? brk : 0;
    const thrEff = this._thrEff;
    for (let u = 0; u < this.engines.length; u++) {
      const slot = this.unitSlot[u], es = this.engines[u], ep = this.units[u].engine;
      // EV: engine.js picks the drive direction from sign(ω); we select direction with the
      // (signed) reduction instead, so the motor is only ever asked to drive forwards.
      const w = this.isEV && wo[slot] < 0 ? 0 : wo[slot];
      let T = engineUpdate(es, ep, thrEff, w, dt, env);
      if (es.failed && T > 0) T = 0;
      drv.torque[slot] = T > 0 ? T * this.eff : T;
    }
    drv.step(dt);
    for (let u = 0; u < this.engines.length; u++) {
      const es = this.engines[u];
      if (es.damage > this.damage) this.damage = es.damage;
      if (es.failed) this.failed = true;
    }

    // ---------------- suspension forces ----------------
    let Fsum = 0;
    for (let i = 0; i < 4; i++) {
      const si = s[i], sdi = sd[i];
      const other = i ^ 1;
      let F = this.F0[i] + this.kS[i] * si;
      if (F < 0) F = 0;
      F += sdi > 0 ? this.cBump[i] * sdi : this.cReb[i] * sdi;
      F += this.kArb[i] * (si - s[other]);
      const over = si - this.maxC[i];
      if (over > 0) F += this.kBS[i] * over * (1 + over / 0.015) + 2000 * sdi;
      const under = -this.maxD[i] - si;
      if (under > 0) F -= 2.5e5 * under - 3000 * (sdi < 0 ? sdi : 0);
      this.Fsusp[i] = F;
      const Fb = F + this.Jk[i];
      Fsum += Fb;
      Tx += hpY[i] * Fb; Ty -= hpX[i] * Fb;
    }
    Fz += Fsum;

    // ---------------- aero ----------------
    const v2 = vbx * vbx + vby * vby + vbz * vbz;
    if (v2 > 1e-4) {
      const vm = Math.sqrt(v2), qd = 0.5 * RHO_AIR;
      const kd = -qd * this.cdA * vm;
      const dx = kd * vbx, dy = kd * vby, dz = kd * vbz;
      const zc = this.copZ;
      Fx += dx; Fy += dy; Fz += dz;
      Tx += -zc * dy; Ty += zc * dx;
      const vx2 = vbx * vbx;
      const ge = this.gEff, ref = this.refRH;
      const mF = clamp(1 + ge * (-clearF) / ref, 0.4, 1.8);
      const mR = clamp(1 + ge * (-clearR) / ref, 0.4, 1.8);
      const dF = qd * this.clAF * vx2 * mF, dR = qd * this.clAR * vx2 * mR;
      Fz -= dF + dR;
      Ty += this.a * dF - this.b * dR;
    }

    // ---------------- body dynamics ----------------
    const mT = this.mTot, mS = this.mSprung;
    const abx = Fx / mT + g_bx, aby = Fy / mT + g_by, abz = Fz / mS + g_bz;
    const Ixx = this.Ixx, Iyy = this.Iyy, Izz = this.Izz;
    const ax_ = (Tx - (Izz - Iyy) * wy * wz) / Ixx;
    const ay_ = (Ty - (Ixx - Izz) * wz * wx) / Iyy;
    const az_ = (Tz - (Iyy - Ixx) * wx * wy) / Izz;

    // unsprung vertical DOFs (relative to the body hardpoint along body z)
    const w2 = wx * wx + wy * wy + wz * wz;
    for (let i = 0; i < 4; i++) {
      const rx = hpX[i], ry = hpY[i], rz = hpZ[i] + s[i];
      const ahp = abz + (ax_ * ry - ay_ * rx) + (wz * (wx * rx + wy * ry + wz * rz) - rz * w2);
      const acc = (this.fbz[i] - this.Fsusp[i] - this.Jk[i]) * this.invMU[i] + g_bz - ahp;
      sd[i] += acc * dt;
      s[i] += sd[i] * dt;
    }

    om[0] = wx + ax_ * dt; om[1] = wy + ay_ * dt; om[2] = wz + az_ * dt;
    const awx = R00 * abx + R01 * aby + R02 * abz;
    const awy = R10 * abx + R11 * aby + R12 * abz;
    const awz = R20 * abx + R21 * aby + R22 * abz;
    vel[0] += awx * dt; vel[1] += awy * dt; vel[2] += awz * dt;
    pos[0] += vel[0] * dt; pos[1] += vel[1] * dt; pos[2] += vel[2] * dt;
    // quaternion: q̇ = ½ q ⊗ (ω_body, 0)
    const Q = this.quat, qx = Q[0], qy = Q[1], qz = Q[2], qw = Q[3];
    const ox = om[0] * 0.5 * dt, oy = om[1] * 0.5 * dt, oz = om[2] * 0.5 * dt;
    let nqx = qx + qw * ox + qy * oz - qz * oy;
    let nqy = qy + qw * oy + qz * ox - qx * oz;
    let nqz = qz + qw * oz + qx * oy - qy * ox;
    let nqw = qw - qx * ox - qy * oy - qz * oz;
    const qn = 1 / Math.sqrt(nqx * nqx + nqy * nqy + nqz * nqz + nqw * nqw);
    Q[0] = nqx * qn; Q[1] = nqy * qn; Q[2] = nqz * qn; Q[3] = nqw * qn;
    this._updateRot();

    // accelerations (kinematic, body axes, gravity excluded)
    this.accBody[0] = abx - g_bx; this.accBody[1] = aby - g_by; this.accBody[2] = abz - g_bz;

    // ---------------- wheels: spin, brake temperature ----------------
    const speedAbs = Math.sqrt(v2);
    for (let i = 0; i < 4; i++) {
      const wh = this.wheels[i];
      const w = wo[2 + i];
      wh.omega = w;
      let sp = wh.spin + w * dt;
      if (sp > TWO_PI) sp -= TWO_PI; else if (sp < 0) sp += TWO_PI;
      wh.spin = sp;
      const Tb = Math.min(drv.brakeTorque[i], this.brakeCmd[i]);
      const hc = this.heatCap[i];
      wh.brakeTempC += (Tb * Math.abs(w) - hc * (0.0015 + 0.0002 * speedAbs) * (wh.brakeTempC - T_AMB_C)) * dt / hc;
      wh.compression = s[i];
    }
    this._wheelPos();

    this.time += dt;
    this._updatePublic();
  }

  /** World wheel-centre positions from the current body pose and suspension travel. */
  _wheelPos() {
    const R = this.R, pos = this.pos;
    for (let i = 0; i < 4; i++) {
      const p = this.wheels[i].pos;
      const rx = this.hpX[i], ry = this.hpY[i], rz = this.hpZ[i] + this.s[i];
      p[0] = pos[0] + R[0] * rx + R[1] * ry + R[2] * rz;
      p[1] = pos[1] + R[3] * rx + R[4] * ry + R[5] * rz;
      p[2] = pos[2] + R[6] * rx + R[7] * ry + R[8] * rz;
    }
  }

  _updatePublic() {
    const R = this.R;
    const vel = this.vel;
    this.speed = R[0] * vel[0] + R[3] * vel[1] + R[6] * vel[2];
    this.heading = Math.atan2(R[3], R[0]);
    const q = this.q[4];
    this.track.query(this.pos[0], this.pos[1], this.hint[4], q);
    this.hint[4] = q.index;
    const ts = this.trackState;
    ts.s = q.s; ts.offset = q.offset; ts.index = q.index; ts.surface = q.surface;
    // engine damage mirror
    let dmg = 0, failed = false;
    for (let u = 0; u < this.engines.length; u++) {
      const es = this.engines[u];
      if ((es.damage || 0) > dmg) dmg = es.damage || 0;
      if (es.failed) failed = true;
    }
    this.damage = dmg; this.failed = failed;
  }
}

/**
 * Create a vehicle at `pose` on `track` (z resolved from the track; static equilibrium).
 * @param {object} [opts] optional: { tyreTempC } initial tyre temperature (default: each tyre's tOpt)
 * @returns {Vehicle}
 */
export function createVehicle(params, track, pose, opts) {
  return new Vehicle(params, track, pose, opts);
}

export { Vehicle };
