// XMAX V3/V4 Pro dosing capsule loader + unloader station
// One base holds 6 capsules (set N_CAPS to change), plus:
//   funnel  - sits over all capsules so you fill them in one pass
//   tamper  - packs all capsules to the same depth at once
//   ejector - push the base down onto it and every capsule pops up
// The base also has lid parking pockets and a spent-herb tap-out bin.
//
// XMAX does not publish capsule drawings. MEASURE YOUR CAPSULE WITH CALIPERS
// and update the "Capsule" section before printing. Print part="fit_test"
// first (a single well, ~5 min) to check the grip.
//
// Render one part at a time:  openscad -D 'part="base"' -o base.stl xmax_capsule_station.scad
// part = "base" | "funnel" | "tamper" | "ejector" | "fit_test" | "assembly"

part = "assembly";

/* ---------- Capsule (measure yours!) ---------- */
cap_d       = 12.5; // outside diameter of capsule body
cap_body_h  = 11.0; // body height with lid removed
cap_inner_d = 11.0; // inside diameter of the open mouth
lid_d       = 13.0; // outside diameter of the lid
lid_h       = 4.0;  // lid height

/* ---------- Station ---------- */
N_CAPS      = 6;    // number of capsule wells (5 or more)
pitch       = 20;   // spacing between wells
clearance   = 0.3;  // radial clearance on printed fits
rib_grip    = 0.15; // how far crush ribs bite into the capsule (radial)
n_ribs      = 8;
well_depth  = 7;    // how much of the body sits below the top surface
floor_t     = 2;    // floor under the wells
ledge       = 1.0;  // floor ledge that the capsule rim sits on
skirt_h     = 8;    // hollow space under the base for the ejector
wall        = 2.4;
bin_w       = 26;   // depth (front-to-back) of the tap-out bin
tap_wall    = 4;    // wall across the bin to knock capsules on
funnel_h    = 8;
rim_h       = 3;    // wall round the funnel plate that keeps herb in
spout_in    = 1.5;  // how far the funnel spout dips into the capsule mouth
tamp_depth  = 2;    // how far below the capsule rim the tamper packs
peg_d       = 4;

$fn = 64;

/* ---------- Derived ---------- */
span      = (N_CAPS - 1) * pitch;
base_x    = span + 40;
row_lids  = -(pitch + 2);              // lid pockets: front row
row_bin   = pitch / 2 + 4 + bin_w / 2; // bin: back
base_y0   = row_lids - pitch / 2 - 2;
base_y1   = row_bin + bin_w / 2 + wall;
base_y    = base_y1 - base_y0;
top_z     = skirt_h + floor_t + well_depth;
protrude  = cap_body_h - well_depth;   // body above the top surface
eject_d   = cap_d - 2 * ledge;         // hole the ejector pushes through
peg_x     = span / 2 + (base_x / 2 - span / 2) / 2 + 1;
fp_y      = pitch + 4;                 // funnel plate front-to-back size
fp_z0     = top_z + protrude + 0.5;    // funnel plate underside
spout_od  = cap_inner_d - 0.6;
spout_id  = spout_od - 1.6;
tamper_z0 = fp_z0 + funnel_h + rim_h;  // tamper rests on the funnel rim
pin_d     = spout_id - 1.2;

function cx(i) = -span / 2 + i * pitch;

module rbox(x, y, h, r = 3) {
    translate([-x / 2 + r, -y / 2 + r, 0])
        minkowski() { cube([x - 2 * r, y - 2 * r, h / 2]); cylinder(r = r, h = h / 2); }
}

// Capsule well with crush ribs that grip the body so you can twist the lid off one-handed
module well_cut() {
    difference() {
        translate([0, 0, -0.01]) cylinder(d = cap_d + 2 * clearance, h = well_depth + 0.02);
        for (a = [0 : 360 / n_ribs : 359])
            rotate(a) translate([cap_d / 2 - rib_grip, -0.6, -1])
                cube([clearance + rib_grip + 0.5, 1.2, well_depth - 0.8]);
    }
    translate([0, 0, well_depth - 0.8]) cylinder(d1 = cap_d + 2 * clearance, d2 = cap_d + 2 * clearance + 1.6, h = 0.81);
}

module base() {
    difference() {
        translate([0, (base_y0 + base_y1) / 2, 0]) rbox(base_x, base_y, top_z);
        // hollow skirt for the ejector
        translate([0, (base_y0 + base_y1) / 2, -0.01]) cube([base_x - 2 * wall, base_y - 2 * wall, 2 * skirt_h], center = true);
        for (i = [0 : N_CAPS - 1]) {
            translate([cx(i), 0, skirt_h + floor_t]) well_cut();
            translate([cx(i), 0, skirt_h - 1]) cylinder(d = eject_d, h = floor_t + 2);
            // lid parking pocket
            translate([cx(i), row_lids, top_z - 2.5]) cylinder(d = lid_d + 0.6, h = 3);
        }
        // funnel registration sockets
        for (s = [-1, 1]) translate([s * peg_x, 0, top_z - 5]) cylinder(d = peg_d + 0.4, h = 6);
        // spent-herb bin, split by a tap wall you knock the capsules on
        for (s = [-1, 1]) mirror([s < 0 ? 1 : 0, 0, 0])
            translate([tap_wall / 2, row_bin - bin_w / 2, skirt_h + floor_t])
                cube([base_x / 2 - wall - tap_wall / 2, bin_w, well_depth + 1]);
    }
}

module funnel() {
    difference() {
        union() {
            translate([0, 0, fp_z0]) rbox(base_x - 4, fp_y, funnel_h + rim_h, 2);
            for (i = [0 : N_CAPS - 1]) translate([cx(i), 0, fp_z0 - 0.5 - spout_in]) cylinder(d = spout_od, h = 0.5 + spout_in + 0.1);
            // legs + pegs
            for (s = [-1, 1]) {
                translate([s * peg_x, 0, top_z]) cylinder(d = 7, h = fp_z0 - top_z + 0.1);
                translate([s * peg_x, 0, top_z - 4.5]) cylinder(d = peg_d, h = 4.6);
            }
        }
        // herb tray recess above the funnels
        translate([0, 0, fp_z0 + funnel_h]) rbox(base_x - 4 - 2 * 2, fp_y - 2 * 2, rim_h + 1, 1);
        for (i = [0 : N_CAPS - 1]) translate([cx(i), 0, 0]) {
            translate([0, 0, fp_z0]) cylinder(d1 = spout_id, d2 = pitch - 2.5, h = funnel_h + 0.01);
            translate([0, 0, fp_z0 - 3]) cylinder(d = spout_id, h = 3.1);
        }
    }
}

module tamper() {
    pin_len = tamper_z0 - (top_z + protrude - tamp_depth);
    translate([0, 0, tamper_z0]) {
        rbox(base_x - 4, fp_y, 3, 2);
        // handle
        translate([0, 0, 3]) hull() {
            translate([-span / 2, 0, 0]) cylinder(d = 8, h = 8);
            translate([ span / 2, 0, 0]) cylinder(d = 8, h = 8);
        }
    }
    for (i = [0 : N_CAPS - 1]) translate([cx(i), 0, tamper_z0 - pin_len]) {
        translate([0, 0, 0.6]) cylinder(d = pin_d, h = pin_len - 0.6 + 0.01);
        cylinder(d1 = pin_d - 1.2, d2 = pin_d, h = 0.61);
    }
}

module ejector() {
    plate_t = 3;
    travel  = well_depth - 1.5;
    pin_h   = skirt_h + floor_t + travel - plate_t;
    translate([0, (base_y0 + base_y1) / 2, 0])
        rbox(base_x - 2 * wall - 0.8, base_y - 2 * wall - 0.8, plate_t, 1);
    for (i = [0 : N_CAPS - 1]) translate([cx(i), 0, plate_t - 0.01]) {
        cylinder(d = eject_d - 1, h = pin_h - 1);
        translate([0, 0, pin_h - 1]) cylinder(d1 = eject_d - 1, d2 = eject_d - 3, h = 1);
    }
}

module fit_test() {
    difference() {
        cylinder(d = cap_d + 8, h = floor_t + well_depth);
        translate([0, 0, floor_t]) well_cut();
        translate([0, 0, -1]) cylinder(d = eject_d, h = floor_t + 2);
    }
}

module capsule_ghost() {
    for (i = [0 : N_CAPS - 1]) translate([cx(i), 0, skirt_h + floor_t]) color("silver", 0.5) cylinder(d = cap_d, h = cap_body_h);
}

// base prints upside down so its floor is not a huge bridge over the skirt
if (part == "base") rotate([180, 0, 0]) translate([0, 0, -top_z]) base();
else if (part == "funnel") rotate([180, 0, 0]) translate([0, 0, -(fp_z0 + funnel_h + rim_h)]) funnel();
else if (part == "tamper") rotate([180, 0, 0]) translate([0, 0, -(tamper_z0 + 11)]) tamper();
else if (part == "ejector") ejector();
else if (part == "fit_test") fit_test();
else if (part == "base_view") base();
else {
    color("teal") base();
    capsule_ghost();
    color("orange") funnel();
    color("gold") translate([0, 0, 25]) tamper();
    color("gray") translate([0, 0, -30]) ejector();
}
