// Preset builds covering the range of the sandbox. Each carries `targets` from a comparable real car
// (named in the comments only) for the vehicle-dynamics validation runs:
//   { zeroTo100s, topSpeedKph, brake100to0m, lateralG, quarterMileS }   (null = unknown / not meaningful)
// Top speeds of cars that are electronically limited in reality are given as null unless the
// unlimited figure is known, because the sim has no speed limiter.

const S = (o) => o; // identity, keeps the literals readable

export const PRESETS = {
  hotHatch: S({
    label: 'Hot hatch (FWD turbo)',
    description: '2.0 turbo four, front-wheel drive with a clutch LSD. Light, quick, understeers at the limit.',
    // Comparable: VW Golf GTI Mk7.5 Performance / Hyundai i30 N (180-202 kW, 350-370 Nm, ~1400 kg)
    targets: { zeroTo100s: 6.2, topSpeedKph: null, brake100to0m: 35.5, lateralG: 0.98, quarterMileS: 14.5 },
    spec: {
      name: 'Hot hatch', chassis: 'hatch', powertrain: 'ice',
      engine: { layout: 'I4', displacement: 2.0, placement: 'front', induction: 'turboMedium', boost: 1.2, intercooler: 'stock',
        fuel: 'petrol98', fuelSystem: 'street', cams: 'stock', intake: 'stock', exhaust: 'stock', internals: 'stock', flywheel: 'stock', ecu: 'stock', antiLag: false },
      drivetrain: { layout: 'FWD', gearbox: 'mt6', finalDrive: 3.65, frontDiff: 'lsd1way', rearDiff: 'open', centreDiff: 'open', centreSplit: 1 },
      suspension: { type: 'macpherson', dampers: 'sport', springF: 32, springR: 28, arbF: 22, arbR: 18, damping: 0.35, rideHeight: -10, camberF: -1.0, camberR: -1.3, toeF: 0, toeR: 0.2 },
      tyres: { compound: 'sport', widthF: 235, widthR: 235 },
      brakes: { kit: 'sport', bias: 0.70 },
      aero: { splitter: 'none', wing: 'ducktail', wingAngle: 8, diffuser: 'none', bodyKit: 'stock' },
      weight: { reduction: 'none', ballastKg: 0, ballastPos: 0.5 },
      electronics: 'absTc', fuelLitres: 50, steering: { ratio: 13.5, maxLock: 36, ackermann: 0.7 }, color: '#d8d8d8',
    },
  }),

  naCoupe: S({
    label: 'NA rear-drive coupe',
    description: '2.4 flat-four, rear-wheel drive, low centre of gravity, Torsen rear.',
    // Comparable: Toyota GR86 / Subaru BRZ (2nd gen, 172 kW, 250 Nm, ~1275 kg)
    targets: { zeroTo100s: 6.3, topSpeedKph: 226, brake100to0m: 35.0, lateralG: 1.0, quarterMileS: 14.8 },
    spec: {
      name: 'NA coupe', chassis: 'coupe', powertrain: 'ice',
      engine: { layout: 'F4', displacement: 2.4, placement: 'front', induction: 'na', boost: 0, intercooler: 'none',
        fuel: 'petrol98', fuelSystem: 'street', cams: 'stock', intake: 'stock', exhaust: 'stock', internals: 'stock', flywheel: 'stock', ecu: 'stock', antiLag: false },
      drivetrain: { layout: 'RWD', gearbox: 'mt6', finalDrive: 4.1, frontDiff: 'open', rearDiff: 'torsen', centreDiff: 'open', centreSplit: 0 },
      suspension: { type: 'macpherson', dampers: 'sport', springF: 30, springR: 34, arbF: 20, arbR: 12, damping: 0.35, rideHeight: 0, camberF: -1.2, camberR: -1.5, toeF: 0, toeR: 0.2 },
      tyres: { compound: 'sport', widthF: 215, widthR: 215 },
      brakes: { kit: 'stock', bias: 0.64 },
      aero: { splitter: 'none', wing: 'none', wingAngle: 8, diffuser: 'none', bodyKit: 'stock' },
      weight: { reduction: 'none', ballastKg: 0, ballastPos: 0.5 },
      electronics: 'absTc', fuelLitres: 50, steering: { ratio: 13.5, maxLock: 36, ackermann: 0.6 }, color: '#1f4fbf',
    },
  }),

  muscleV8: S({
    label: 'Muscle V8',
    description: '5.0 NA V8, solid rear axle, heavy and torquey.',
    // Comparable: Ford Mustang GT 5.0 (2011-14, 307-324 kW, 529-542 Nm, ~1650 kg); limited top speed in reality
    targets: { zeroTo100s: 4.8, topSpeedKph: null, brake100to0m: 37.0, lateralG: 0.93, quarterMileS: 13.0 },
    spec: {
      name: 'Muscle V8', chassis: 'sedan', powertrain: 'ice',
      engine: { layout: 'V8', displacement: 5.0, placement: 'front', induction: 'na', boost: 0, intercooler: 'none',
        fuel: 'petrol98', fuelSystem: 'sport', cams: 'stock', intake: 'stock', exhaust: 'sport', internals: 'stock', flywheel: 'stock', ecu: 'stock', antiLag: false },
      drivetrain: { layout: 'RWD', gearbox: 'mt6', finalDrive: 3.73, frontDiff: 'open', rearDiff: 'lsd1way', centreDiff: 'open', centreSplit: 0 },
      suspension: { type: 'solidAxle', dampers: 'sport', springF: 38, springR: 32, arbF: 28, arbR: 10, damping: 0.32, rideHeight: 0, camberF: -0.8, camberR: 0, toeF: 0, toeR: 0 },
      tyres: { compound: 'sport', widthF: 255, widthR: 285 },
      brakes: { kit: 'sport', bias: 0.66 },
      aero: { splitter: 'none', wing: 'ducktail', wingAngle: 8, diffuser: 'none', bodyKit: 'stock' },
      weight: { reduction: 'none', ballastKg: 0, ballastPos: 0.5 },
      electronics: 'absTc', fuelLitres: 60, steering: { ratio: 15.5, maxLock: 35, ackermann: 0.5 }, color: '#e0a020',
    },
  }),

  rallySaloon: S({
    label: 'AWD turbo rally saloon',
    description: '2.5 turbo flat-four, symmetrical AWD with LSDs front and rear, viscous centre.',
    // Comparable: Subaru WRX STI (EJ257, 221 kW, 407 Nm, ~1530 kg)
    targets: { zeroTo100s: 5.2, topSpeedKph: 255, brake100to0m: 35.5, lateralG: 0.98, quarterMileS: 13.4 },
    spec: {
      name: 'Rally saloon', chassis: 'sedan', powertrain: 'ice',
      engine: { layout: 'F4', displacement: 2.5, placement: 'front', induction: 'turboMedium', boost: 1.25, intercooler: 'stock',
        fuel: 'petrol98', fuelSystem: 'street', cams: 'stock', intake: 'stock', exhaust: 'stock', internals: 'stock', flywheel: 'stock', ecu: 'stock', antiLag: false },
      drivetrain: { layout: 'AWD', gearbox: 'mt6', finalDrive: 3.9, frontDiff: 'torsen', rearDiff: 'torsen', centreDiff: 'viscous', centreSplit: 0.41 },
      suspension: { type: 'macpherson', dampers: 'sport', springF: 38, springR: 36, arbF: 22, arbR: 20, damping: 0.35, rideHeight: 0, camberF: -1.0, camberR: -1.0, toeF: 0, toeR: 0.1 },
      tyres: { compound: 'sport', widthF: 245, widthR: 245 },
      brakes: { kit: 'sport', bias: 0.62 },
      aero: { splitter: 'lip', wing: 'gt', wingAngle: 4, diffuser: 'none', bodyKit: 'stock' },
      weight: { reduction: 'none', ballastKg: 0, ballastPos: 0.5 },
      electronics: 'absTc', fuelLitres: 60, steering: { ratio: 13.0, maxLock: 36, ackermann: 0.6 }, color: '#1b3fa0',
    },
  }),

  supercar: S({
    label: 'Mid-engine twin-turbo supercar',
    description: '4.0 twin-turbo V8 behind the driver, dual-clutch, carbon-ceramics, active-style wing.',
    // Comparable: McLaren 720S (530 kW, 770 Nm, ~1420 kg curb); top speed 341 km/h
    targets: { zeroTo100s: 2.9, topSpeedKph: 341, brake100to0m: 30.0, lateralG: 1.2, quarterMileS: 10.4 },
    spec: {
      name: 'Supercar', chassis: 'supercar', powertrain: 'ice',
      engine: { layout: 'V8', displacement: 4.0, placement: 'mid', induction: 'twinTurbo', boost: 1.5, intercooler: 'waterAir',
        fuel: 'petrol98', fuelSystem: 'race', cams: 'fastRoad', intake: 'stock', exhaust: 'sport', internals: 'forged', flywheel: 'light', ecu: 'stage1', antiLag: false },
      drivetrain: { layout: 'RWD', gearbox: 'dct7', finalDrive: 3.4, frontDiff: 'open', rearDiff: 'lsd15way', centreDiff: 'open', centreSplit: 0 },
      suspension: { type: 'doubleWishbone', dampers: 'coilover', springF: 55, springR: 65, arbF: 30, arbR: 20, damping: 0.40, rideHeight: 0, camberF: -1.5, camberR: -1.5, toeF: 0, toeR: 0.15 },
      tyres: { compound: 'semiSlick', widthF: 245, widthR: 305 },
      brakes: { kit: 'carbonCeramic', bias: 0.62 },
      aero: { splitter: 'lip', wing: 'gt', wingAngle: 4, diffuser: 'race', bodyKit: 'stock' },
      weight: { reduction: 'none', ballastKg: 0, ballastPos: 0.5 },
      electronics: 'motorsport', fuelLitres: 60, steering: { ratio: 13.0, maxLock: 32, ackermann: 0.5 }, color: '#ff7a00',
    },
  }),

  evSaloon: S({
    label: 'EV dual-motor saloon',
    description: 'Dual-motor AWD electric saloon: instant torque, heavy floor battery, very low CG.',
    // Comparable: Tesla Model 3 Performance (2018-21, ~340 kW, ~1850 kg)
    targets: { zeroTo100s: 3.4, topSpeedKph: 261, brake100to0m: 34.0, lateralG: 0.98, quarterMileS: 11.7 },
    spec: {
      name: 'EV saloon', chassis: 'sedan', powertrain: 'ev',
      ev: { front: 'small', rear: 'medium', battery: 'b80' },
      drivetrain: { layout: 'AWD', gearbox: 'ev1', finalDrive: 8.0, frontDiff: 'open', rearDiff: 'open', centreDiff: 'open', centreSplit: 0.4 },
      suspension: { type: 'doubleWishbone', dampers: 'sport', springF: 40, springR: 42, arbF: 25, arbR: 18, damping: 0.35, rideHeight: -10, camberF: -1.0, camberR: -1.2, toeF: 0, toeR: 0.15 },
      tyres: { compound: 'sport', widthF: 235, widthR: 235 },
      brakes: { kit: 'sport', bias: 0.62 },
      aero: { splitter: 'none', wing: 'ducktail', wingAngle: 8, diffuser: 'none', bodyKit: 'stock' },
      weight: { reduction: 'none', ballastKg: 0, ballastPos: 0.5 },
      electronics: 'absTc', fuelLitres: 0, steering: { ratio: 12.0, maxLock: 35, ackermann: 0.6 }, color: '#c81e1e',
    },
  }),

  keiCar: S({
    label: 'Kei car',
    description: '660 cc turbo three, front-drive city car. Slow, light and narrow.',
    // Comparable: Suzuki Alto Works (HA36S, 47 kW, 100 Nm, ~670 kg). Only 0-100 is reliably reported.
    targets: { zeroTo100s: 9.0, topSpeedKph: null, brake100to0m: null, lateralG: null, quarterMileS: null },
    spec: {
      name: 'Kei car', chassis: 'kei', powertrain: 'ice',
      engine: { layout: 'I3', displacement: 0.66, placement: 'front', induction: 'turboSmall', boost: 0.9, intercooler: 'stock',
        fuel: 'petrol95', fuelSystem: 'stock', cams: 'stock', intake: 'stock', exhaust: 'stock', internals: 'stock', flywheel: 'stock', ecu: 'stock', antiLag: false },
      drivetrain: { layout: 'FWD', gearbox: 'mt5', finalDrive: 4.8, frontDiff: 'open', rearDiff: 'open', centreDiff: 'open', centreSplit: 1 },
      suspension: { type: 'macpherson', dampers: 'stock', springF: 22, springR: 20, arbF: 10, arbR: 0, damping: 0.3, rideHeight: 0, camberF: -0.5, camberR: -1.0, toeF: 0, toeR: 0.1 },
      tyres: { compound: 'street', widthF: 165, widthR: 165 },
      brakes: { kit: 'stock', bias: 0.72 },
      aero: { splitter: 'none', wing: 'none', wingAngle: 8, diffuser: 'none', bodyKit: 'stock' },
      weight: { reduction: 'none', ballastKg: 0, ballastPos: 0.5 },
      electronics: 'abs', fuelLitres: 27, steering: { ratio: 15.0, maxLock: 38, ackermann: 0.8 }, color: '#f2e6b0',
    },
  }),

  timeAttack: S({
    label: 'Time-attack aero build',
    description: 'Big-turbo AWD saloon on E85 with slicks, huge wing and flat floor. Built for one fast lap.',
    // Loosely after Evo/GT-R-based time-attack cars (~450 kW, ~1250 kg, >1.8 g with aero). No reliable stock figures.
    targets: { zeroTo100s: null, topSpeedKph: null, brake100to0m: null, lateralG: 1.7, quarterMileS: null },
    spec: {
      name: 'Time attack', chassis: 'coupe', powertrain: 'ice',
      engine: { layout: 'I4', displacement: 2.0, placement: 'front', induction: 'turboLarge', boost: 2.0, intercooler: 'fmic',
        fuel: 'e85', fuelSystem: 'drag', cams: 'race', intake: 'stock', exhaust: 'straight', internals: 'forged', flywheel: 'race', ecu: 'stage2', antiLag: true },
      drivetrain: { layout: 'AWD', gearbox: 'seq6', finalDrive: 4.3, frontDiff: 'lsd15way', rearDiff: 'lsd15way', centreDiff: 'viscous', centreSplit: 0.35 },
      suspension: { type: 'pushrod', dampers: 'race', springF: 120, springR: 110, arbF: 40, arbR: 25, damping: 0.55, rideHeight: -50, camberF: -3.5, camberR: -2.5, toeF: -0.1, toeR: 0.2 },
      tyres: { compound: 'slick', widthF: 305, widthR: 315 },
      brakes: { kit: 'bigBrake', bias: 0.62 },
      aero: { splitter: 'race', wing: 'timeAttack', wingAngle: 10, diffuser: 'race', bodyKit: 'carbonWide' },
      weight: { reduction: 'race', ballastKg: 0, ballastPos: 0.5 },
      electronics: 'motorsport', fuelLitres: 40, steering: { ratio: 11.0, maxLock: 30, ackermann: 0.4 }, color: '#20c0a0',
    },
  }),

  drift: S({
    label: 'Drift build',
    description: '3.0 turbo straight-six in a light coupe, welded-feel 2-way LSD, big steering lock, hard tyres.',
    // Loosely after S-chassis / JZ-swapped pro-am drift cars (~370 kW, ~1250 kg). No meaningful stock targets.
    targets: { zeroTo100s: null, topSpeedKph: null, brake100to0m: null, lateralG: null, quarterMileS: null },
    spec: {
      name: 'Drift', chassis: 'coupe', powertrain: 'ice',
      engine: { layout: 'I6', displacement: 3.0, placement: 'front', induction: 'turboLarge', boost: 1.4, intercooler: 'fmic',
        fuel: 'e85', fuelSystem: 'race', cams: 'fastRoad', intake: 'stock', exhaust: 'straight', internals: 'forged', flywheel: 'light', ecu: 'stage2', antiLag: false },
      drivetrain: { layout: 'RWD', gearbox: 'seq6', finalDrive: 4.1, frontDiff: 'open', rearDiff: 'lsd2way', centreDiff: 'open', centreSplit: 0 },
      suspension: { type: 'doubleWishbone', dampers: 'coilover', springF: 80, springR: 60, arbF: 35, arbR: 8, damping: 0.45, rideHeight: -35, camberF: -4.0, camberR: -0.5, toeF: 0.2, toeR: 0.1 },
      tyres: { compound: 'drift', widthF: 245, widthR: 265 },
      brakes: { kit: 'sport', bias: 0.66 },
      aero: { splitter: 'lip', wing: 'none', wingAngle: 8, diffuser: 'none', bodyKit: 'widebody' },
      weight: { reduction: 'stripped', ballastKg: 0, ballastPos: 0.5 },
      electronics: 'none', fuelLitres: 30, steering: { ratio: 11.5, maxLock: 60, ackermann: 0.1 }, color: '#8a2be2',
    },
  }),

  dieselPickup: S({
    label: 'Diesel pickup',
    description: '2.7 turbo-diesel, part-time 4x4, leaf-sprung live rear axle, 8-speed auto.',
    // Comparable: Toyota Hilux 2.8 D-4D (150-165 kW, 500-550 Nm, ~2200 kg)
    targets: { zeroTo100s: 10.5, topSpeedKph: 175, brake100to0m: 42.0, lateralG: 0.72, quarterMileS: 17.5 },
    spec: {
      name: 'Diesel pickup', chassis: 'pickup', powertrain: 'ice',
      engine: { layout: 'I4', displacement: 2.7, placement: 'front', induction: 'turboMedium', boost: 1.6, intercooler: 'stock',
        fuel: 'diesel', fuelSystem: 'street', cams: 'stock', intake: 'stock', exhaust: 'stock', internals: 'stock', flywheel: 'stock', ecu: 'stage1', antiLag: false },
      drivetrain: { layout: 'AWD', gearbox: 'at8', finalDrive: 3.9, frontDiff: 'open', rearDiff: 'lsd1way', centreDiff: 'locked', centreSplit: 0.5 },
      suspension: { type: 'solidAxle', dampers: 'stock', springF: 40, springR: 45, arbF: 20, arbR: 0, damping: 0.3, rideHeight: 0, camberF: -0.3, camberR: 0, toeF: 0, toeR: 0 },
      tyres: { compound: 'eco', widthF: 265, widthR: 265 },
      brakes: { kit: 'stock', bias: 0.72 },
      aero: { splitter: 'none', wing: 'none', wingAngle: 8, diffuser: 'none', bodyKit: 'stock' },
      weight: { reduction: 'none', ballastKg: 0, ballastPos: 0.5 },
      electronics: 'absTc', fuelLitres: 80, steering: { ratio: 18.0, maxLock: 36, ackermann: 0.8 }, color: '#5a6b4a',
    },
  }),
};

/** Ordered list of preset keys. */
export const PRESET_KEYS = Object.keys(PRESETS);
