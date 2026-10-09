// Driver registry (contract §7). Every AI driver — classical or learned — exposes:
//   driver.reset(vehicle, track)
//   driver.act(vehicle, track, world /* { cars, time } */, out /* controls */) -> out
// Called at DRIVER_HZ; the caller holds the controls between calls.

import { createPursuitDriver } from './pursuit.js';

export const DRIVER_HZ = 50;

const KINDS = {
  pursuit: (opts) => createPursuitDriver(opts),
};

/** Register a driver kind (used by the learning AI module: 'neural', team drivers, ...). */
export function registerDriverKind(kind, factory) { KINDS[kind] = factory; }

/** @param {string} kind @param {object} opts */
export function createDriver(kind = 'pursuit', opts = {}) {
  const f = KINDS[kind];
  if (!f) throw new Error(`Unknown driver kind '${kind}' (known: ${Object.keys(KINDS).join(', ')})`);
  return f(opts);
}

export function driverKinds() { return Object.keys(KINDS); }
