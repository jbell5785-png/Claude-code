// XMAX V3/V4 Pro pocket capsule pack
// Cigarette-pack sized carrier: holds 6 filled capsules and drops them
// one at a time, plus a separate compartment for hot spent capsules.
//
//   FULL side  - capsules stack in a column under a sliding shuttle
//                (an escapement). Turn the pack top-down over the open
//                oven, slide the thumb button: exactly one capsule drops out.
//   SPENT side - swing the lid open, tip the vaporiser over the hole,
//                the used capsule drops in. Swing the lid shut.
//   Refill     - pack upright, button slid across: drop a capsule into the
//                exit hole, slide the button back, it falls into the column.
//                Repeat 6 times.
//
// MEASURE YOUR CAPSULE: cap_len (lid on) and lid_d matter most. If cap_len is
// short, the shuttle will jam; if it is long, two capsules can drop at once.
//
// openscad -D 'part="body"' -o pack_body.stl portable_capsule_pack.scad
// part = "body" | "shuttle" | "nub" | "lid" | "pin" | "assembly"

part = "assembly";

/* ---------- Capsule (measure yours!) ---------- */
cap_len = 14.0; // overall length with the lid screwed on
lid_d   = 13.0; // widest diameter (usually the lid)

/* ---------- Pack ---------- */
n_col   = 5;    // capsules in the column (+1 waiting in the shuttle = 6)
n_spent = 6;    // spent capsules the spent side holds
wall    = 2.2;
floor_t = 2;
top_t   = 2.5;
fit     = 0.3;  // clearance on sliding fits
detent  = 0.35; // click bump on the thumb button (0 = no click)

$fn = 64;

/* ---------- Derived ---------- */
d_f   = lid_d + 0.8;          // full column bore
d_s   = lid_d + 1.6;          // spent bore (looser: hot capsules expand)
a     = d_f / 2 + 1.6;        // shuttle material left of its hole
T     = d_f + 1.6;            // shuttle travel = column-to-exit spacing
b     = T + d_f / 2 + 0.8;    // shuttle material right of its hole
L_sh  = a + b;
sh_y  = d_f + 3.2;            // shuttle thickness front-to-back
ch_y  = sh_y + 2 * fit;
ch_h  = cap_len + 1;          // channel height; the shuttle is a bit less
sh_h  = ch_h - 0.6;
D     = ch_y + 2 * wall;      // pack thickness

col_len = n_col * cap_len + 1;
ch_z0   = floor_t + col_len;
H_body  = max(ch_z0 + ch_h + top_t, floor_t + n_spent * cap_len + 2);

// x positions, measured from the left edge then centred
p_s = wall + d_s / 2;
p_L = p_s + d_s / 2 + 2;      // channel left end
p_e = p_L + a;                // exit hole
p_f = p_e + T;                // full column
p_R = p_f + b;                // channel right end (shuttle at rest)
W   = p_R + wall;
x_s = p_s - W / 2;
x_L = p_L - W / 2;
x_e = p_e - W / 2;
x_f = p_f - W / 2;

nub_d   = 4;
nub_off = L_sh - 5;                    // nub position along the shuttle
nub_rest = x_f - a + nub_off;          // nub x with shuttle at rest
nub_z   = ch_z0 + ch_h / 2;

pivot = [x_s + 6.7, -(D / 2 - 2.6)];   // swing-lid pivot, behind the spent hole
lid_t = 2.5;

module rbox(x, y, h, r = 3) {
    linear_extrude(h) offset(r) square([x - 2 * r, y - 2 * r], center = true);
}

module body() {
    difference() {
        rbox(W, D, H_body);
        // full column, opens up into the shuttle channel
        translate([x_f, 0, floor_t]) cylinder(d = d_f, h = col_len + 0.1);
        // shuttle channel, open at the right-hand side for assembly
        translate([x_L, -ch_y / 2, ch_z0]) cube([W, ch_y, ch_h]);
        // exit hole with a lead-in chamfer
        translate([x_e, 0, ch_z0 + ch_h - 0.1]) cylinder(d = d_f, h = top_t + 1);
        translate([x_e, 0, H_body - 1]) cylinder(d1 = d_f, d2 = d_f + 2.4, h = 1.01);
        // spent bore with stand-off ribs so hot capsules touch less plastic
        translate([x_s, 0, floor_t]) difference() {
            cylinder(d = d_s, h = H_body);
            for (r = [0 : 60 : 359]) rotate(r) translate([d_s / 2 - 0.5, -0.4, 0]) cube([1, 0.8, H_body - floor_t - top_t - 1]);
        }
        // thumb button slot (front face)
        translate([nub_rest - T - nub_d / 2 - fit, D / 2 - wall - 1, nub_z - nub_d / 2 - fit])
            cube([T + nub_d + 2 * fit, wall + 2, nub_d + 2 * fit]);
        // detent dimples at both ends of travel
        if (detent > 0) for (x = [nub_rest, nub_rest - T])
            translate([x, D / 2, nub_z + 4]) sphere(d = 2.2, $fn = 24);
        // windows: count what's left / how full the spent side is
        for (x = [x_f, x_s]) translate([x - 1.5, D / 2 - wall - 1, floor_t + 6]) cube([3, wall + 2, col_len - 12]);
        // vents at the back of the spent side
        for (z = [floor_t + 8 : 14 : H_body - 12]) translate([x_s - 3, -D / 2 - 1, z]) cube([6, wall + 2, 6]);
        // lid pivot pin hole (press fit)
        translate([pivot[0], pivot[1], H_body - 6]) cylinder(d = 2.9, h = 7, $fn = 24);
    }
}

module shuttle() {
    difference() {
        translate([-a, -sh_y / 2, 0]) cube([L_sh, sh_y, sh_h]);
        translate([0, 0, -1]) cylinder(d = d_f, h = sh_h + 2);
        translate([nub_off - a, sh_y / 2 - 4, sh_h / 2]) rotate([-90, 0, 0]) cylinder(d = nub_d - 0.1, h = 5, $fn = 32);
    }
}

// thumb button: peg through the front slot, pressed into the shuttle
module nub() {
    peg = wall + fit + 4;
    // head (printed face down)
    difference() {
        rbox(11, 9, 2.4, 2);
        for (x = [-3, 0, 3]) translate([x - 0.4, -5, -0.01]) cube([0.8, 10, 0.5]);
    }
    translate([0, 0, 2.39]) cylinder(d = nub_d, h = peg, $fn = 32);
    if (detent > 0) translate([0, 4, 2.39]) intersection() {
        sphere(d = 2, $fn = 24);
        cylinder(d = 3, h = detent);
    }
}

module lid() {
    difference() {
        union() {
            hull() {
                translate([x_s, 0, 0]) cylinder(r = d_s / 2 + 2, h = lid_t);
                translate([pivot[0], pivot[1], 0]) cylinder(r = 3.6, h = lid_t);
            }
            // lip that drops into the hole so the lid stays shut
            translate([x_s, 0, -0.6]) difference() {
                cylinder(d = d_s - 0.8, h = 0.61);
                translate([0, 0, -0.1]) cylinder(d = d_s - 3.6, h = 1);
            }
            // thumb tab
            translate([x_s - d_s / 2 - 3.5, 0, 0]) cylinder(d = 6, h = lid_t);
        }
        translate([pivot[0], pivot[1], -1]) cylinder(d = 3.5, h = lid_t + 2, $fn = 24);
    }
}

module pin() {
    cylinder(d = 6.5, h = 1.5);
    cylinder(d = 3.0, h = 1.5 + lid_t + 0.7 + 5.5, $fn = 24);
}

module ghost_caps() {
    color("silver", 0.6) {
        for (i = [0 : n_col - 1]) translate([x_f, 0, floor_t + i * cap_len + 0.1]) cylinder(d = lid_d, h = cap_len - 0.3);
        translate([x_f, 0, ch_z0 + 0.4]) cylinder(d = lid_d, h = cap_len - 0.3);
    }
}

if (part == "body") body();
else if (part == "shuttle") shuttle();
else if (part == "nub") nub();
else if (part == "lid") rotate([180, 0, 0]) translate([-x_s, 0, -lid_t]) lid();
else if (part == "pin") pin();
else if (part == "assembly") {
    color("teal", 0.45) body();
    ghost_caps();
    color("orange") translate([x_f, 0, ch_z0 + 0.3]) shuttle();
    color("red") translate([nub_rest, D / 2 + 2.4, nub_z]) rotate([90, 0, 0]) nub();
    color("gold") translate([0, 0, H_body + 0.6]) lid();
    color("gray") translate([pivot[0], pivot[1], H_body + 0.6 + lid_t + 1.5 + 0.1]) rotate([180, 0, 0]) pin();
}
echo(str("Pack size: ", W, " x ", D, " x ", H_body, " mm"));
