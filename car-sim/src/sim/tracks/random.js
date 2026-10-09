import { skidpadDef } from './testtracks.js';
export function randomTrackDef(seed) { const d = skidpadDef(); d.key = 'random'; d.seed = seed; return d; }
