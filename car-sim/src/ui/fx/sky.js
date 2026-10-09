// Stylised HDR sky dome: gradient + sun/moon + fbm clouds + stars + horizon city glow +
// optional futuristic grid / ringed planet. One shader for every environment so the PMREM
// environment map and the visible sky always agree.
import * as THREE from 'three';

const vert = /* glsl */`
varying vec3 vDir;
void main() {
  vDir = position;
  vec4 p = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  gl_Position = p.xyww; // at far plane
}`;

const frag = /* glsl */`
uniform vec3 uZenith, uHorizon, uGround, uSunDir, uSunColor, uGlowColor, uCloudColor, uCloudShade, uMoonDir, uGridColor, uPlanetDir, uPlanetColor;
uniform float uSunSize, uSunGlow, uCloudCover, uCloudScale, uStars, uTime, uHorizonGlow, uGlowHeight, uMoon, uGrid, uPlanet, uSunDisk, uHaze;
varying vec3 vDir;

float hash12( vec2 p ) { vec3 p3 = fract( vec3( p.xyx ) * 0.1031 ); p3 += dot( p3, p3.yzx + 33.33 ); return fract( ( p3.x + p3.y ) * p3.z ); }
float hash13( vec3 p3 ) { p3 = fract( p3 * 0.1031 ); p3 += dot( p3, p3.zyx + 31.32 ); return fract( ( p3.x + p3.y ) * p3.z ); }
float vnoise( vec2 p ) {
  vec2 i = floor( p ), f = fract( p ); f = f * f * ( 3.0 - 2.0 * f );
  return mix( mix( hash12( i ), hash12( i + vec2( 1, 0 ) ), f.x ), mix( hash12( i + vec2( 0, 1 ) ), hash12( i + vec2( 1, 1 ) ), f.x ), f.y );
}
float fbm( vec2 p ) { float a = 0.5, s = 0.0; for ( int i = 0; i < 5; i ++ ) { s += a * vnoise( p ); p = p * 2.03 + vec2( 1.7, 9.2 ); a *= 0.5; } return s; }

void main() {
  vec3 d = normalize( vDir );
  float h = d.y;
  float hp = max( h, 0.0 );
  vec3 col = mix( uHorizon, uZenith, pow( hp, 0.5 ) );
  col = mix( col, uGround, smoothstep( 0.0, -0.12, h ) );
  // horizon haze + city glow
  col += uGlowColor * uHorizonGlow * exp( - abs( h ) / max( uGlowHeight, 1e-3 ) );
  col = mix( col, uHorizon, uHaze * exp( - abs( h ) * 14.0 ) );

  // sun
  float sd = dot( d, normalize( uSunDir ) );
  float disk = smoothstep( cos( uSunSize ), cos( uSunSize * 0.85 ), sd );
  col += uSunColor * ( disk * uSunDisk + pow( max( sd, 0.0 ), 6.0 ) * uSunGlow * 0.25 + pow( max( sd, 0.0 ), 90.0 ) * uSunGlow );

  // futuristic ground grid below the horizon
  if ( uGrid > 0.0 && h < -0.005 ) {
    vec2 g = d.xz / ( - h ) * 6.0;
    vec2 gl = abs( fract( g ) - 0.5 ) / fwidth( g );
    float line = 1.0 - min( min( gl.x, gl.y ), 1.0 );
    col += uGridColor * line * uGrid * smoothstep( -0.005, -0.06, h ) * exp( h * 3.0 );
  }

  // ringed planet
  if ( uPlanet > 0.0 ) {
    vec3 pd = normalize( uPlanetDir ); float pr = 0.16;
    float c = dot( d, pd ); float ang = acos( clamp( c, -1.0, 1.0 ) );
    vec3 tang = normalize( cross( pd, vec3( 0.0, 1.0, 0.0 ) ) ); vec3 bit = cross( tang, pd );
    vec2 q = vec2( dot( d, tang ), dot( d, bit ) ) / pr;
    float body = smoothstep( pr, pr * 0.985, ang );
    float bands = 0.75 + 0.25 * sin( q.y * 14.0 + sin( q.x * 3.0 ) * 1.5 );
    float lit = clamp( dot( normalize( vec3( q, sqrt( max( 0.0, 1.0 - dot( q, q ) ) ) ) ), normalize( vec3( -0.6, 0.5, 0.6 ) ) ), 0.0, 1.0 );
    vec3 pc = uPlanetColor * bands * ( 0.08 + 0.9 * lit );
    // ring: tilted ellipse
    vec2 rq = vec2( q.x * 0.95 + q.y * 0.3, ( q.y - q.x * 0.3 ) * 3.6 );
    float rr = length( rq );
    float ring = smoothstep( 1.25, 1.3, rr ) * smoothstep( 2.25, 2.1, rr ) * ( 0.6 + 0.4 * sin( rr * 40.0 ) );
    bool front = rq.y < 0.0;
    col = mix( col, pc, body * ( front ? 1.0 - ring * 0.8 : 1.0 ) );
    if ( front || body < 0.5 ) col += uPlanetColor * 0.7 * ring * uPlanet;
    col += uPlanetColor * 0.25 * exp( - max( ang - pr, 0.0 ) * 30.0 ) * ( 1.0 - body );
  }

  // stars
  if ( uStars > 0.0 && h > 0.0 ) {
    vec3 sp = d * 380.0; vec3 cell = floor( sp );
    float r = hash13( cell );
    float star = step( 0.9965, r ) * smoothstep( 0.6, 0.0, length( fract( sp ) - 0.5 ) );
    float tw = 0.65 + 0.35 * sin( uTime * 3.0 + r * 900.0 );
    col += vec3( 0.8 + 0.2 * r, 0.85, 1.0 ) * star * uStars * tw * smoothstep( 0.0, 0.25, h ) * ( 4.0 * r - 2.8 );
  }

  // moon
  if ( uMoon > 0.0 ) {
    float md = dot( d, normalize( uMoonDir ) );
    float mdisk = smoothstep( cos( 0.022 ), cos( 0.02 ), md );
    float crater = 0.8 + 0.2 * vnoise( d.xy * 600.0 );
    col += vec3( 0.95, 0.97, 1.0 ) * mdisk * 6.0 * crater * uMoon + vec3( 0.35, 0.45, 0.7 ) * pow( max( md, 0.0 ), 400.0 ) * 0.6 * uMoon + vec3( 0.2, 0.25, 0.4 ) * pow( max( md, 0.0 ), 20.0 ) * 0.08 * uMoon;
  }

  // clouds on a virtual plane
  if ( uCloudCover > 0.0 && h > 0.0 ) {
    vec2 p = d.xz / ( h + 0.06 ) * uCloudScale + vec2( uTime * 0.004, uTime * 0.0015 );
    float n = fbm( p );
    float cov = smoothstep( 1.0 - uCloudCover, 1.0 - uCloudCover + 0.32, n ) * smoothstep( 0.0, 0.12, h );
    vec3 sdir = normalize( vec3( uSunDir.x, 0.0, uSunDir.z ) + 1e-4 );
    float n2 = fbm( p + sdir.xz * 0.18 );
    float lit = clamp( 0.5 + ( n - n2 ) * 3.0, 0.0, 1.0 );
    vec3 cc = mix( uCloudShade, uCloudColor, lit );
    cc += uSunColor * pow( max( sd, 0.0 ), 12.0 ) * 0.25 * ( 1.0 - cov ) * uSunGlow; // silver lining
    col = mix( col, cc, cov * 0.92 );
  }

  gl_FragColor = vec4( col, 1.0 );
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

/** @returns {THREE.Mesh} sky dome with `material.uniforms` (see setSkyParams) */
export function createSky(radius = 5000) {
  const uniforms = {
    uZenith: { value: new THREE.Color() }, uHorizon: { value: new THREE.Color() }, uGround: { value: new THREE.Color() },
    uSunDir: { value: new THREE.Vector3(0, 1, 0) }, uSunColor: { value: new THREE.Color() }, uSunSize: { value: 0.02 }, uSunGlow: { value: 1 }, uSunDisk: { value: 20 },
    uGlowColor: { value: new THREE.Color() }, uHorizonGlow: { value: 0 }, uGlowHeight: { value: 0.1 }, uHaze: { value: 0.3 },
    uCloudColor: { value: new THREE.Color() }, uCloudShade: { value: new THREE.Color() }, uCloudCover: { value: 0 }, uCloudScale: { value: 1 },
    uStars: { value: 0 }, uTime: { value: 0 }, uMoon: { value: 0 }, uMoonDir: { value: new THREE.Vector3(0, 1, 0) },
    uGrid: { value: 0 }, uGridColor: { value: new THREE.Color() }, uPlanet: { value: 0 }, uPlanetDir: { value: new THREE.Vector3(0, 0.3, -1) }, uPlanetColor: { value: new THREE.Color() },
  };
  const mat = new THREE.ShaderMaterial({ uniforms, vertexShader: vert, fragmentShader: frag, side: THREE.BackSide, depthWrite: false, fog: false });
  const geo = new THREE.SphereGeometry(1, 48, 24);
  const m = new THREE.Mesh(geo, mat); m.scale.setScalar(radius); m.frustumCulled = false; m.renderOrder = -10; m.name = 'fx-sky';
  m.userData.fxSky = true; m.matrixAutoUpdate = true;
  return m;
}

const C = (v) => new THREE.Color(v);
/** Copy a sky description from an environment preset into the uniforms. */
export function setSkyParams(sky, S, sunDir) {
  const u = sky.material.uniforms;
  u.uZenith.value.copy(C(S.zenith)).multiplyScalar(S.intensity ?? 1); u.uHorizon.value.copy(C(S.horizon)).multiplyScalar(S.intensity ?? 1); u.uGround.value.copy(C(S.ground));
  u.uSunDir.value.copy(sunDir); u.uSunColor.value.copy(C(S.sunColor ?? 0xffffff)); u.uSunSize.value = S.sunSize ?? 0.02; u.uSunGlow.value = S.sunGlow ?? 1; u.uSunDisk.value = S.sunDisk ?? 20;
  u.uGlowColor.value.copy(C(S.glowColor ?? 0)); u.uHorizonGlow.value = S.horizonGlow ?? 0; u.uGlowHeight.value = S.glowHeight ?? 0.1; u.uHaze.value = S.haze ?? 0.3;
  u.uCloudColor.value.copy(C(S.cloudColor ?? 0xffffff)); u.uCloudShade.value.copy(C(S.cloudShade ?? 0x8090a0)); u.uCloudCover.value = S.clouds ?? 0; u.uCloudScale.value = S.cloudScale ?? 1;
  u.uStars.value = S.stars ?? 0; u.uMoon.value = S.moon ?? 0; if (S.moonDir) u.uMoonDir.value.set(...S.moonDir).normalize();
  u.uGrid.value = S.grid ?? 0; u.uGridColor.value.copy(C(S.gridColor ?? 0));
  u.uPlanet.value = S.planet ?? 0; u.uPlanetColor.value.copy(C(S.planetColor ?? 0)); if (S.planetDir) u.uPlanetDir.value.set(...S.planetDir).normalize();
}
