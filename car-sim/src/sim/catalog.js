// Parts catalogue. Every option here is turned into physical parameters by build.js.
// Units: SI unless the field name says otherwise (mm, kW, L, N/mm, deg).

export const CHASSIS = {
  kei: {
    label: 'Kei car', price: 6000,
    mass: 520, wheelbase: 2.36, trackF: 1.30, trackR: 1.29,
    length: 3.40, width: 1.48, height: 1.55, cgHeight: 0.48, cgFromRear: 0.52,
    Cd: 0.34, frontalArea: 1.95, Cl: 0.12, wheelRadius: 0.285,
    maxTyreWidth: 205, placements: ['front', 'mid', 'rear'], style: 'kei',
  },
  hatch: {
    label: 'Hot hatch', price: 14000,
    mass: 800, wheelbase: 2.63, trackF: 1.54, trackR: 1.51,
    length: 4.26, width: 1.80, height: 1.45, cgHeight: 0.50, cgFromRear: 0.50,
    Cd: 0.32, frontalArea: 2.20, Cl: 0.10, wheelRadius: 0.317,
    maxTyreWidth: 255, placements: ['front', 'mid'], style: 'hatch',
  },
  sedan: {
    label: 'Sports saloon', price: 18000,
    mass: 980, wheelbase: 2.85, trackF: 1.58, trackR: 1.60,
    length: 4.70, width: 1.85, height: 1.43, cgHeight: 0.50, cgFromRear: 0.50,
    Cd: 0.29, frontalArea: 2.25, Cl: 0.09, wheelRadius: 0.330,
    maxTyreWidth: 285, placements: ['front'], style: 'sedan',
  },
  coupe: {
    label: 'Sports coupe', price: 20000,
    mass: 860, wheelbase: 2.57, trackF: 1.55, trackR: 1.57,
    length: 4.27, width: 1.78, height: 1.31, cgHeight: 0.44, cgFromRear: 0.48,
    Cd: 0.30, frontalArea: 2.00, Cl: 0.08, wheelRadius: 0.317,
    maxTyreWidth: 285, placements: ['front', 'mid', 'rear'], style: 'coupe',
  },
  roadster: {
    label: 'Roadster', price: 16000,
    mass: 690, wheelbase: 2.31, trackF: 1.50, trackR: 1.50,
    length: 3.92, width: 1.73, height: 1.23, cgHeight: 0.42, cgFromRear: 0.50,
    Cd: 0.36, frontalArea: 1.85, Cl: 0.12, wheelRadius: 0.305,
    maxTyreWidth: 255, placements: ['front', 'mid'], style: 'roadster',
  },
  suv: {
    label: 'Performance SUV', price: 22000,
    mass: 1350, wheelbase: 2.90, trackF: 1.65, trackR: 1.66,
    length: 4.85, width: 1.95, height: 1.70, cgHeight: 0.66, cgFromRear: 0.50,
    Cd: 0.36, frontalArea: 2.80, Cl: 0.12, wheelRadius: 0.370,
    maxTyreWidth: 315, placements: ['front'], style: 'suv',
  },
  pickup: {
    label: 'Pickup truck', price: 17000,
    mass: 1500, wheelbase: 3.55, trackF: 1.70, trackR: 1.70,
    length: 5.50, width: 2.00, height: 1.85, cgHeight: 0.72, cgFromRear: 0.45,
    Cd: 0.42, frontalArea: 3.20, Cl: 0.10, wheelRadius: 0.390,
    maxTyreWidth: 315, placements: ['front'], style: 'pickup',
  },
  supercar: {
    label: 'Supercar tub', price: 60000,
    mass: 760, wheelbase: 2.65, trackF: 1.67, trackR: 1.63,
    length: 4.55, width: 1.95, height: 1.17, cgHeight: 0.38, cgFromRear: 0.46,
    Cd: 0.33, frontalArea: 1.95, Cl: -0.10, wheelRadius: 0.340,
    maxTyreWidth: 335, placements: ['mid'], style: 'supercar',
  },
};

// Engine layouts. mass = base + perL * displacement. length is the block length (m).
// boreStroke = typical bore/stroke ratio (oversquare > 1 = shorter stroke = higher piston-speed-limited redline).
// Rotaries: vePeakAdd/veWidthMult describe the peripheral/side-port breathing (VE peak later and broader).
export const LAYOUTS = {
  I3: { label: 'Inline-3', cyl: 3, disp: [0.6, 1.6], massBase: 55, perL: 45, length: 0.45, price: 2500, boreStroke: 0.92 },
  I4: { label: 'Inline-4', cyl: 4, disp: [1.0, 2.7], massBase: 70, perL: 40, length: 0.55, price: 3500, boreStroke: 1.0 },
  I5: { label: 'Inline-5', cyl: 5, disp: [2.0, 2.6], massBase: 95, perL: 40, length: 0.68, price: 6000, boreStroke: 0.95 },
  I6: { label: 'Inline-6', cyl: 6, disp: [2.0, 4.0], massBase: 110, perL: 38, length: 0.80, price: 7500, boreStroke: 0.95 },
  V6: { label: 'V6', cyl: 6, disp: [2.5, 4.0], massBase: 105, perL: 35, length: 0.52, price: 7000, boreStroke: 1.05 },
  V8: { label: 'V8', cyl: 8, disp: [3.5, 7.0], massBase: 130, perL: 30, length: 0.62, price: 10000, boreStroke: 1.05 },
  V10: { label: 'V10', cyl: 10, disp: [4.0, 8.4], massBase: 160, perL: 28, length: 0.72, price: 18000, boreStroke: 1.1 },
  V12: { label: 'V12', cyl: 12, disp: [5.0, 7.3], massBase: 190, perL: 28, length: 0.80, price: 26000, boreStroke: 1.12 },
  F4: { label: 'Flat-4', cyl: 4, disp: [1.6, 2.5], massBase: 75, perL: 38, length: 0.45, price: 4500, boreStroke: 1.12 },
  F6: { label: 'Flat-6', cyl: 6, disp: [3.0, 4.0], massBase: 115, perL: 32, length: 0.55, price: 12000, boreStroke: 1.2 },
  R2: { label: 'Twin-rotor Wankel', cyl: 2, disp: [1.3, 1.3], massBase: 95, perL: 0, length: 0.40, price: 8000, rotary: true, vePeakAdd: 0.18, veWidthMult: 1.35 },
  R3: { label: 'Triple-rotor Wankel', cyl: 3, disp: [2.0, 2.0], massBase: 125, perL: 0, length: 0.52, price: 14000, rotary: true, vePeakAdd: 0.18, veWidthMult: 1.35 },
};

// Fuels. lhv in J/kg, afr = stoichiometric air/fuel ratio, density kg/L,
// knockLimit = max knock index before the ECU has to retard timing (petrol 95 ~ 1.0 reference),
// coolingK = intake charge cooling from evaporation (K), lambdaFull = mixture used at full load.
export const FUELS = {
  petrol95: { label: 'Petrol RON 95', lhv: 43.4e6, afr: 14.7, density: 0.745, knockLimit: 1.00, coolingK: 0, lambdaFull: 0.88, price: 0, diesel: false },
  petrol98: { label: 'Petrol RON 98', lhv: 43.4e6, afr: 14.7, density: 0.750, knockLimit: 1.12, coolingK: 0, lambdaFull: 0.88, price: 500, diesel: false },
  race102: { label: 'Race fuel RON 102', lhv: 43.0e6, afr: 14.5, density: 0.740, knockLimit: 1.30, coolingK: 0, lambdaFull: 0.86, price: 2500, diesel: false },
  e85: { label: 'E85 ethanol', lhv: 29.2e6, afr: 9.8, density: 0.781, knockLimit: 1.55, coolingK: 20, lambdaFull: 0.82, price: 1500, diesel: false },
  methanol: { label: 'Methanol', lhv: 19.9e6, afr: 6.4, density: 0.792, knockLimit: 1.85, coolingK: 35, lambdaFull: 0.75, price: 4000, diesel: false },
  diesel: { label: 'Diesel', lhv: 42.6e6, afr: 14.5, density: 0.832, knockLimit: 99, coolingK: 0, lambdaFull: 1.25, price: 0, diesel: true },
};

// Forced induction. maxBoost is the wastegate limit (bar gauge).
// flowStart/flowFull = engine airflow (kg/s) where the turbo starts making / reaches full boost.
// tau = spool time constant (s), compEff = compressor isentropic efficiency.
export const INDUCTION = {
  na: { label: 'Naturally aspirated', kind: 'na', maxBoost: 0, price: 0, mass: 0 },
  turboSmall: { label: 'Small turbo', kind: 'turbo', maxBoost: 1.2, flowStart: 0.020, flowFull: 0.055, flowMax: 0.17, tau: 0.35, compEff: 0.72, price: 2500, mass: 14 },
  turboMedium: { label: 'Medium turbo', kind: 'turbo', maxBoost: 1.6, flowStart: 0.035, flowFull: 0.095, flowMax: 0.30, tau: 0.55, compEff: 0.75, price: 3500, mass: 17 },
  turboLarge: { label: 'Large turbo', kind: 'turbo', maxBoost: 2.2, flowStart: 0.060, flowFull: 0.160, flowMax: 0.48, tau: 0.85, compEff: 0.76, price: 5000, mass: 21 },
  turboHuge: { label: 'Huge turbo', kind: 'turbo', maxBoost: 3.0, flowStart: 0.100, flowFull: 0.260, flowMax: 0.75, tau: 1.25, compEff: 0.77, price: 7000, mass: 26 },
  twinTurbo: { label: 'Twin turbos', kind: 'turbo', maxBoost: 1.8, flowStart: 0.030, flowFull: 0.085, flowMax: 0.55, tau: 0.40, compEff: 0.75, price: 8000, mass: 30 },
  roots: { label: 'Roots supercharger', kind: 'super', maxBoost: 0.8, curve: 'positive', compEff: 0.55, price: 5000, mass: 22 },
  twinScrew: { label: 'Twin-screw supercharger', kind: 'super', maxBoost: 1.0, curve: 'positive', compEff: 0.68, price: 6500, mass: 24 },
  centrifugal: { label: 'Centrifugal supercharger', kind: 'super', maxBoost: 1.1, curve: 'centrifugal', compEff: 0.74, price: 4500, mass: 16 },
};

export const INTERCOOLERS = {
  none: { label: 'None', effectiveness: 0.0, price: 0, mass: 0 },
  stock: { label: 'Stock air-to-air', effectiveness: 0.60, price: 0, mass: 6 },
  fmic: { label: 'Front-mount (FMIC)', effectiveness: 0.78, price: 900, mass: 11 },
  waterAir: { label: 'Water-to-air', effectiveness: 0.88, price: 2200, mass: 15 },
};

// Peak fuel delivery in g/s.
export const FUEL_SYSTEMS = {
  stock: { label: 'Stock pump + injectors', flow: 14, price: 0 },
  street: { label: 'Uprated pump + injectors', flow: 22, price: 600 },
  sport: { label: 'High-flow pump + 1000cc injectors', flow: 34, price: 1400 },
  race: { label: 'Twin pumps + 1600cc injectors', flow: 52, price: 3000 },
  drag: { label: 'Triple pumps + 2200cc injectors', flow: 80, price: 5500 },
};

// Camshaft profiles shift the volumetric-efficiency peak (fraction of redline) and the redline itself.
// veGain = peak VE multiplier at the tuned speed.
export const CAMS = {
  stock: { label: 'Stock', vePeak: 0.62, veWidth: 1.0, redlineAdd: 0, idleRough: 0, veGain: 1.00, price: 0 },
  fastRoad: { label: 'Fast road', vePeak: 0.70, veWidth: 0.95, redlineAdd: 400, idleRough: 0.2, veGain: 1.03, price: 900 },
  race: { label: 'Race', vePeak: 0.80, veWidth: 0.85, redlineAdd: 900, idleRough: 0.6, veGain: 1.06, price: 2200 },
};

export const INTAKES = {
  stock: { label: 'Stock airbox', ve: 1.0, heatK: 12, price: 0 },
  coldAir: { label: 'Cold-air intake', ve: 1.02, heatK: 6, price: 300 },
  itb: { label: 'Individual throttle bodies', ve: 1.06, naOnly: true, heatK: 8, price: 3500 },
};

export const EXHAUSTS = {
  stock: { label: 'Stock', ve: 1.0, loudness: 0.4, mass: 22, price: 0 },
  sport: { label: 'Sport cat-back', ve: 1.025, loudness: 0.7, mass: 16, price: 900 },
  straight: { label: 'Straight-through race', ve: 1.05, loudness: 1.0, mass: 10, price: 1800 },
};

// Internals define what the engine can survive. maxPressure = peak manifold pressure ratio, overRev = rpm above redline.
export const INTERNALS = {
  stock: { label: 'Stock cast internals', maxPressure: 2.4, overRev: 300, massAdd: 0, price: 0 },
  forged: { label: 'Forged pistons + rods', maxPressure: 3.4, overRev: 800, massAdd: -3, price: 3500 },
  billet: { label: 'Billet crank + race block', maxPressure: 4.6, overRev: 1300, massAdd: -6, price: 9000 },
};

export const FLYWHEELS = {
  stock: { label: 'Stock dual-mass', inertia: 0.13, price: 0 },
  light: { label: 'Lightweight', inertia: 0.08, price: 500 },
  race: { label: 'Race single-mass', inertia: 0.05, price: 1100 },
};

// boostTaper = fraction of boost the map removes between 70 % of redline and redline (OEM turbine-inlet
// temperature / turbo-speed protection); boostTrim = fraction of the requested boost the map allows.
export const ECU_TUNES = {
  stock: { label: 'Stock map', redlineAdd: 0, boostTrim: 0.85, timing: 1.0, boostTaper: 0.25, price: 0 },
  stage1: { label: 'Stage 1 remap', redlineAdd: 200, boostTrim: 1.0, timing: 1.02, boostTaper: 0.10, price: 500 },
  stage2: { label: 'Stage 2 standalone ECU', redlineAdd: 500, boostTrim: 1.0, timing: 1.04, boostTaper: 0.0, price: 1800 },
};

// Electric powertrain parts.
export const EV_MOTORS = {
  small: { label: '150 kW motor', power: 150e3, torque: 310, maxRpm: 14000, mass: 45, price: 6000 },
  medium: { label: '250 kW motor', power: 250e3, torque: 420, maxRpm: 16000, mass: 60, price: 9000 },
  large: { label: '400 kW motor', power: 400e3, torque: 600, maxRpm: 18000, mass: 85, price: 15000 },
  hyper: { label: '600 kW motor', power: 600e3, torque: 900, maxRpm: 20000, mass: 110, price: 24000 },
};
export const EV_BATTERIES = {
  b40: { label: '40 kWh', kwh: 40, maxPower: 250e3, mass: 260, price: 6000 },
  b60: { label: '60 kWh', kwh: 60, maxPower: 400e3, mass: 380, price: 9000 },
  b80: { label: '80 kWh', kwh: 80, maxPower: 600e3, mass: 490, price: 12500 },
  b100: { label: '100 kWh', kwh: 100, maxPower: 900e3, mass: 600, price: 17000 },
};

// Gearboxes. Ratios are generated geometrically between first and top.
export const GEARBOXES = {
  mt5: { label: '5-speed manual', gears: 5, first: 3.45, top: 0.82, shiftTime: 0.35, efficiency: 0.95, mass: 40, maxTorque: 450, price: 0 },
  mt6: { label: '6-speed manual', gears: 6, first: 3.60, top: 0.75, shiftTime: 0.30, efficiency: 0.95, mass: 45, maxTorque: 650, price: 1500 },
  at8: { label: '8-speed torque-converter auto', gears: 8, first: 4.70, top: 0.67, shiftTime: 0.18, efficiency: 0.92, mass: 80, maxTorque: 900, price: 3500 },
  dct7: { label: '7-speed dual-clutch', gears: 7, first: 3.80, top: 0.70, shiftTime: 0.06, efficiency: 0.94, mass: 70, maxTorque: 800, price: 5000 },
  seq6: { label: '6-speed sequential (dog box)', gears: 6, first: 2.90, top: 0.95, shiftTime: 0.04, efficiency: 0.96, mass: 38, maxTorque: 1000, price: 9000 },
  ev1: { label: 'Single-speed reduction', gears: 1, first: 1.0, top: 1.0, shiftTime: 0, efficiency: 0.97, mass: 20, maxTorque: 2000, price: 0, evOnly: true },
};

// Differentials. lockAccel/lockDecel = locking torque as a fraction of input torque (ramp LSD),
// preload in Nm, tbr = Torsen torque bias ratio, viscous = Nm per rad/s of speed difference.
export const DIFFS = {
  open: { label: 'Open', kind: 'open', price: 0 },
  viscous: { label: 'Viscous LSD', kind: 'viscous', viscous: 60, price: 600 },
  torsen: { label: 'Torsen', kind: 'torsen', tbr: 2.5, price: 1200 },
  lsd1way: { label: 'Clutch LSD 1-way', kind: 'clutch', preload: 40, lockAccel: 0.45, lockDecel: 0.0, price: 1400 },
  lsd15way: { label: 'Clutch LSD 1.5-way', kind: 'clutch', preload: 60, lockAccel: 0.50, lockDecel: 0.25, price: 1500 },
  lsd2way: { label: 'Clutch LSD 2-way', kind: 'clutch', preload: 80, lockAccel: 0.55, lockDecel: 0.55, price: 1600 },
  locked: { label: 'Welded / spool', kind: 'locked', price: 200 },
};

export const CENTRE_DIFFS = {
  open: { label: 'Open centre', kind: 'open', price: 0 },
  viscous: { label: 'Viscous coupling', kind: 'viscous', viscous: 120, price: 800 },
  locked: { label: 'Locked centre', kind: 'locked', price: 300 },
};

// Suspension architectures. rcF/rcR = roll-centre heights (m), camberGain = fraction of body roll
// recovered as camber (1 = wheel stays upright relative to road), antiDive/antiSquat as fractions.
export const SUSPENSION_TYPES = {
  macpherson: { label: 'MacPherson strut', rcF: 0.07, rcR: 0.10, camberGain: 0.35, antiDive: 0.15, antiSquat: 0.10, unsprung: 42, price: 0 },
  doubleWishbone: { label: 'Double wishbone', rcF: 0.05, rcR: 0.09, camberGain: 0.65, antiDive: 0.25, antiSquat: 0.20, unsprung: 38, price: 2500 },
  multilink: { label: 'Multi-link', rcF: 0.06, rcR: 0.11, camberGain: 0.55, antiDive: 0.20, antiSquat: 0.25, unsprung: 40, price: 2000 },
  solidAxle: { label: 'Solid rear axle', rcF: 0.07, rcR: 0.30, camberGain: 0.35, camberGainR: 1.0, antiDive: 0.10, antiSquat: 0.35, unsprung: 55, price: 0 },
  pushrod: { label: 'Pushrod race', rcF: 0.03, rcR: 0.06, camberGain: 0.75, antiDive: 0.30, antiSquat: 0.30, unsprung: 32, price: 9000 },
};

// Damper families scale the user's damping setting and give a usable range.
export const DAMPERS = {
  stock: { label: 'Stock dampers', range: [0.25, 0.40], price: 0 },
  sport: { label: 'Sport dampers', range: [0.25, 0.60], price: 900 },
  coilover: { label: 'Adjustable coilovers', range: [0.15, 0.90], price: 2200 },
  race: { label: '3-way race dampers', range: [0.10, 1.20], price: 6000 },
};

// Brakes: torque per axle at full pedal (Nm), heat capacity (J/K per axle), fade start (C).
export const BRAKES = {
  stock: { label: 'Stock single-piston', torqueF: 2800, torqueR: 1600, heatCap: 12000, fadeStart: 450, price: 0, mass: 0 },
  sport: { label: 'Sport 4-pot', torqueF: 3600, torqueR: 2000, heatCap: 16000, fadeStart: 550, price: 1500, mass: 4 },
  bigBrake: { label: 'Big brake kit 6-pot', torqueF: 4600, torqueR: 2600, heatCap: 22000, fadeStart: 650, price: 3500, mass: 8 },
  carbonCeramic: { label: 'Carbon-ceramic', torqueF: 5200, torqueR: 3000, heatCap: 18000, fadeStart: 950, price: 11000, mass: -12 },
};

// Tyre compounds. mu = peak friction at nominal load, loadSens = loss of mu per unit load ratio,
// stiff = cornering stiffness factor (BCD per Fz per rad), shapeC/shapeE = Pacejka C and E,
// tOpt = optimum carcass temperature (C), tWindow = half-width of grip window, wear = wear rate factor,
// grass = grip multiplier on grass/gravel.
export const COMPOUNDS = {
  eco: { label: 'Eco touring', mu: 0.88, loadSens: 0.10, stiff: 14, shapeC: 1.30, shapeE: 0.30, tOpt: 55, tWindow: 45, wear: 0.4, crr: 0.009, grass: 0.62, price: 400 },
  street: { label: 'Street performance', mu: 0.98, loadSens: 0.11, stiff: 17, shapeC: 1.35, shapeE: 0.20, tOpt: 65, tWindow: 40, wear: 0.6, crr: 0.011, grass: 0.60, price: 800 },
  sport: { label: 'Ultra-high performance', mu: 1.08, loadSens: 0.12, stiff: 20, shapeC: 1.40, shapeE: 0.10, tOpt: 75, tWindow: 35, wear: 0.9, crr: 0.012, grass: 0.58, price: 1300 },
  semiSlick: { label: 'Semi-slick (track day)', mu: 1.22, loadSens: 0.13, stiff: 23, shapeC: 1.45, shapeE: 0.00, tOpt: 85, tWindow: 28, wear: 1.5, crr: 0.013, grass: 0.52, price: 1900 },
  slick: { label: 'Racing slick', mu: 1.42, loadSens: 0.15, stiff: 27, shapeC: 1.50, shapeE: -0.20, tOpt: 95, tWindow: 20, wear: 2.5, crr: 0.014, grass: 0.45, price: 3200 },
  drift: { label: 'Drift (hard, progressive)', mu: 0.95, loadSens: 0.10, stiff: 15, shapeC: 1.25, shapeE: 0.45, tOpt: 70, tWindow: 50, wear: 0.5, crr: 0.011, grass: 0.58, price: 600 },
  rally: { label: 'Rally gravel', mu: 0.86, loadSens: 0.09, stiff: 12, shapeC: 1.25, shapeE: 0.40, tOpt: 60, tWindow: 50, wear: 0.7, crr: 0.013, grass: 0.86, price: 900 },
};

export const SPLITTERS = {
  none: { label: 'None', clA: 0, cdA: 0, mass: 0, price: 0 },
  lip: { label: 'Front lip', clA: 0.10, cdA: 0.01, mass: 2, price: 300 },
  race: { label: 'Race splitter + canards', clA: 0.35, cdA: 0.04, mass: 6, price: 1500 },
};
export const WINGS = {
  none: { label: 'None', clA: 0, cdA: 0, mass: 0, price: 0 },
  ducktail: { label: 'Ducktail spoiler', clA: 0.12, cdA: 0.01, mass: 2, price: 400 },
  gt: { label: 'GT wing (adjustable)', clA: 0.55, cdA: 0.07, mass: 8, price: 2200, adjustable: true },
  timeAttack: { label: 'Time-attack wing (adjustable)', clA: 0.95, cdA: 0.13, mass: 12, price: 4500, adjustable: true },
};
export const DIFFUSERS = {
  none: { label: 'None', clA: 0, cdA: 0, mass: 0, price: 0, groundEffect: 0 },
  street: { label: 'Street diffuser', clA: 0.10, cdA: -0.01, mass: 4, price: 600, groundEffect: 0.5 },
  race: { label: 'Flat floor + race diffuser', clA: 0.40, cdA: 0.00, mass: 10, price: 3500, groundEffect: 1.0 },
};
export const BODY_KITS = {
  stock: { label: 'Stock body', trackAdd: 0, tyreAdd: 0, cdA: 0, mass: 0, price: 0 },
  widebody: { label: 'Widebody arches', trackAdd: 0.08, tyreAdd: 40, cdA: 0.04, mass: 12, price: 4000 },
  carbon: { label: 'Carbon panels', trackAdd: 0, tyreAdd: 0, cdA: 0, mass: -35, price: 6000 },
  carbonWide: { label: 'Carbon widebody', trackAdd: 0.08, tyreAdd: 40, cdA: 0.04, mass: -25, price: 9500 },
};
export const WEIGHT_REDUCTION = {
  none: { label: 'Full interior', mass: 0, price: 0 },
  light: { label: 'Rear seats out', mass: -30, price: 200 },
  stripped: { label: 'Stripped interior', mass: -80, price: 800 },
  race: { label: 'Race shell + cage', mass: -95, price: 4000 },
};

export const ELECTRONICS = {
  none: { label: 'None', abs: false, tc: false, launch: false, price: 0 },
  abs: { label: 'ABS', abs: true, tc: false, launch: false, price: 0 },
  absTc: { label: 'ABS + traction control', abs: true, tc: true, launch: false, price: 600 },
  motorsport: { label: 'Motorsport ABS/TC + launch', abs: true, tc: true, launch: true, price: 4500 },
};
