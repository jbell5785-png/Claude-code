// Shared physical constants and the fixed simulation timestep.
export const DT = 1 / 500;          // s, fixed physics step (500 Hz)
export const G = 9.81;              // m/s^2
export const RHO_AIR = 1.204;       // kg/m^3 at 20 C, sea level
export const P_AMB = 101325;        // Pa
export const T_AMB = 293.15;        // K
export const R_AIR = 287.05;        // J/(kg K)
export const GAMMA_AIR = 1.4;
export const CP_AIR = 1005;         // J/(kg K)

// Wheel order used everywhere.
export const FL = 0, FR = 1, RL = 2, RR = 3;

// Surface ids returned by track.query().
export const SURFACE = { ASPHALT: 0, KERB: 1, GRASS: 2, GRAVEL: 3 };
