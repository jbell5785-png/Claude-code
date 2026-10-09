// HDR post-processing pipeline (lazy-loaded; never imported on the potato tier).
//   [G-buffer: view normal + reflectivity/dynamic flag + depth]  (high/ultra, or soft particles)
//   scene → HDR target (HalfFloat, optional MSAA)
//   → deferred composite: GTAO (multiply) + screen-space reflections (wet road / paint)
//   → motion blur (camera reprojection with car mask, + radial speed blur)
//   → UnrealBloom (HDR, emissive/neon tuned) → tone map (ACES/AgX) + 3D LUT grade + CA + vignette
//   + grain + lens dirt → SMAA / FXAA → screen
import * as THREE from 'three';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { FXAAPass } from 'three/addons/postprocessing/FXAAPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { lensDirtTexture, puddleTexture } from './textures.js';

const FS_VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4( position.xy, 0.0, 1.0 ); }';

// ------------------------------------------------------------------ shaders
const SSR_FRAG = /* glsl */`
#include <packing>
uniform sampler2D tDepth, tNormal, tColor; uniform mat4 uProj, uInvProj; uniform float uNear, uFar, uMaxDist, uFrame; uniform vec2 uRes;
varying vec2 vUv;
float viewZ( vec2 uv ) { return perspectiveDepthToViewZ( texture2D( tDepth, uv ).x, uNear, uFar ); }
vec3 viewPos( vec2 uv, float d ) { vec4 c = vec4( uv * 2.0 - 1.0, d * 2.0 - 1.0, 1.0 ); vec4 v = uInvProj * c; return v.xyz / v.w; }
float ign( vec2 p ) { return fract( 52.9829189 * fract( dot( p, vec2( 0.06711056, 0.00583715 ) ) ) ); }
void main() {
  vec4 g = texture2D( tNormal, vUv );
  float refl = abs( g.a ); if ( g.a < 0.0 ) refl -= 0.01;
  float d = texture2D( tDepth, vUv ).x;
  if ( refl < 0.02 || d >= 0.99999 ) { gl_FragColor = vec4( 0.0 ); return; }
  vec3 P = viewPos( vUv, d ); vec3 N = normalize( g.rgb * 2.0 - 1.0 ); vec3 V = normalize( P );
  vec3 R = normalize( reflect( V, N ) );
  float NoV = max( dot( -V, N ), 0.0 );
  float fres = 0.04 + 0.96 * pow( 1.0 - NoV, 5.0 );
  float maxD = uMaxDist;
  if ( R.z > 0.0 ) maxD = min( maxD, ( - uNear * 1.5 - P.z ) / R.z );
  if ( maxD < 0.2 ) { gl_FragColor = vec4( 0.0 ); return; }
  vec3 E = P + R * maxD;
  vec4 h0 = uProj * vec4( P, 1.0 ), h1 = uProj * vec4( E, 1.0 );
  float k0 = 1.0 / h0.w, k1 = 1.0 / h1.w;
  vec2 s0 = h0.xy * k0 * 0.5 + 0.5, s1 = h1.xy * k1 * 0.5 + 0.5;
  float z0 = P.z * k0, z1 = E.z * k1;
  // clip the screen-space segment to the viewport
  vec2 dir = s1 - s0; float tmax = 1.0;
  if ( dir.x > 0.0 ) tmax = min( tmax, ( 1.0 - s0.x ) / dir.x ); else if ( dir.x < 0.0 ) tmax = min( tmax, - s0.x / dir.x );
  if ( dir.y > 0.0 ) tmax = min( tmax, ( 1.0 - s0.y ) / dir.y ); else if ( dir.y < 0.0 ) tmax = min( tmax, - s0.y / dir.y );
  float pix = length( dir * tmax * uRes );
  float steps = min( float( SSR_STEPS ), max( 4.0, pix / 3.0 ) );
  float jit = ign( gl_FragCoord.xy + uFrame * 5.588238 );
  float tPrev = 0.0; float tHit = -1.0;
  for ( int i = 1; i <= SSR_STEPS; i ++ ) {
    if ( float( i ) > steps ) break;
    float t = ( ( float( i ) - 1.0 + jit ) / steps ); t = t * t * tmax + t * 0.0; // denser near the start
    vec2 uv = mix( s0, s1, t );
    float rz = mix( z0, z1, t ) / mix( k0, k1, t );
    float sz = viewZ( uv );
    float dz = sz - rz;
    float thick = 0.15 + abs( rz ) * 0.02 + abs( mix( z0, z1, t ) / mix( k0, k1, t ) - mix( z0, z1, tPrev ) / mix( k0, k1, tPrev ) );
    if ( dz > 0.0 && dz < thick ) { tHit = t; break; }
    tPrev = t;
  }
  if ( tHit < 0.0 ) { gl_FragColor = vec4( 0.0 ); return; }
  // binary refinement
  float a = tPrev, b = tHit;
  for ( int i = 0; i < 5; i ++ ) {
    float m = ( a + b ) * 0.5; vec2 uv = mix( s0, s1, m ); float rz = mix( z0, z1, m ) / mix( k0, k1, m );
    if ( viewZ( uv ) - rz > 0.0 ) b = m; else a = m;
  }
  vec2 huv = mix( s0, s1, b );
  vec3 hn = normalize( texture2D( tNormal, huv ).rgb * 2.0 - 1.0 );
  if ( dot( hn, R ) > 0.2 ) { gl_FragColor = vec4( 0.0 ); return; } // hit a back face
  vec2 e = smoothstep( vec2( 0.0 ), vec2( 0.08 ), huv ) * smoothstep( vec2( 1.0 ), vec2( 0.92 ), huv );
  float fade = e.x * e.y * ( 1.0 - smoothstep( 0.6, 1.0, b / max( tmax, 1e-3 ) ) );
  vec3 c = texture2D( tColor, huv ).rgb;
  c = min( c, vec3( 40.0 ) );
  gl_FragColor = vec4( c, refl * fres * fade );
}`;

const DEFERRED_FRAG = /* glsl */`
uniform sampler2D tColor, tAO, tSSR, tDepth; uniform float uAO, uSSR; uniform vec2 uSSRTexel;
varying vec2 vUv;
void main() {
  vec4 c = texture2D( tColor, vUv );
  #ifdef USE_AO
    float d = texture2D( tDepth, vUv ).x;
    float ao = d >= 0.99999 ? 1.0 : texture2D( tAO, vUv ).r;
    c.rgb *= mix( 1.0, ao, uAO );
  #endif
  #ifdef USE_SSR
    // anisotropic (vertical-stretched) blur = wet-road streaks
    vec4 s = vec4( 0.0 ); float w = 0.0;
    for ( int j = -3; j <= 3; j ++ ) for ( int i = -1; i <= 1; i ++ ) {
      float k = exp( - float( j * j ) / 6.0 - float( i * i ) / 1.5 );
      vec4 t = texture2D( tSSR, vUv + uSSRTexel * vec2( float( i ) * 1.2, float( j ) * 2.4 ) );
      s += vec4( t.rgb * t.a, t.a ) * k; w += k;
    }
    s /= w;
    c.rgb += s.rgb * uSSR;
  #endif
  gl_FragColor = c;
}`;

const MB_FRAG = /* glsl */`
#include <packing>
uniform sampler2D tColor, tDepth, tGBuf; uniform mat4 uPrevVP, uInvVP; uniform float uCamBlur, uRadial, uMaxBlur, uNear, uFar;
uniform vec2 uCenter; uniform vec4 uMask; uniform float uMaskOn;
varying vec2 vUv;
float ign( vec2 p ) { return fract( 52.9829189 * fract( dot( p, vec2( 0.06711056, 0.00583715 ) ) ) ); }
bool isDyn( vec2 uv ) {
  #ifdef USE_DEPTH
    return texture2D( tGBuf, uv ).a < 0.0;
  #else
    return false;
  #endif
}
void main() {
  vec2 vel = vec2( 0.0 );
  bool dyn = isDyn( vUv );
  #ifdef USE_DEPTH
  if ( ! dyn ) {
    float d = texture2D( tDepth, vUv ).x;
    vec4 wp = uInvVP * vec4( vUv * 2.0 - 1.0, d * 2.0 - 1.0, 1.0 ); wp /= wp.w;
    vec4 pc = uPrevVP * wp; vec2 puv = pc.xy / pc.w * 0.5 + 0.5;
    vel = ( vUv - puv ) * uCamBlur;
  }
  #endif
  vec2 dc = vUv - uCenter;
  vel += dc * uRadial * smoothstep( 0.04, 0.5, length( dc ) );
  if ( uMaskOn > 0.5 ) { vec2 m = ( vUv - uMask.xy ) / uMask.zw; vel *= smoothstep( 0.7, 1.25, length( m ) ); }
  if ( dyn ) vel *= 0.0;
  float L = length( vel ); if ( L > uMaxBlur ) vel *= uMaxBlur / L;
  vec4 c = texture2D( tColor, vUv );
  if ( L < 0.0008 ) { gl_FragColor = c; return; }
  vec3 acc = c.rgb; float wsum = 1.0;
  float j = ign( gl_FragCoord.xy ) - 0.5;
  for ( int i = 1; i < MB_SAMPLES; i ++ ) {
    float t = ( float( i ) + j ) / float( MB_SAMPLES ) - 0.5;
    vec2 uv = vUv + vel * t;
    if ( isDyn( uv ) ) continue; // don't smear the cars into the background
    acc += texture2D( tColor, uv ).rgb; wsum += 1.0;
  }
  gl_FragColor = vec4( acc / wsum, c.a );
}`;

const COMPOSITE_FRAG = /* glsl */`
uniform sampler2D tColor, tBloom, tDirt; uniform highp sampler3D tLUT;
uniform float uExposure, uVignette, uGrain, uCA, uTime, uDirt, uLut, uLutSize, uAspect, uSat, uFlash;
uniform vec2 uCenter; uniform vec3 uFlashColor;
varying vec2 vUv;
vec3 RRTAndODTFit( vec3 v ) { vec3 a = v * ( v + 0.0245786 ) - 0.000090537; vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081; return a / b; }
vec3 aces( vec3 color ) {
  const mat3 ACESInputMat = mat3( vec3( 0.59719, 0.07600, 0.02840 ), vec3( 0.35458, 0.90834, 0.13383 ), vec3( 0.04823, 0.01566, 0.83777 ) );
  const mat3 ACESOutputMat = mat3( vec3( 1.60475, -0.10208, -0.00327 ), vec3( -0.53108, 1.10813, -0.07276 ), vec3( -0.07367, -0.00605, 1.07602 ) );
  color = ACESInputMat * ( color / 0.6 ); color = RRTAndODTFit( color ); color = ACESOutputMat * color; return clamp( color, 0.0, 1.0 );
}
vec3 agxDefault( vec3 c ) {
  const mat3 inM = mat3( vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ), vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ), vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 ) );
  const mat3 outM = mat3( vec3( 1.1271005818144368, -0.1413297634984383, -0.14132976349843826 ), vec3( -0.11060664309660323, 1.157823702216272, -0.11060664309660294 ), vec3( -0.016493938717834573, -0.016493938717834257, 1.2519364065950405 ) );
  c = inM * max( c, 1e-10 ); c = clamp( log2( c ), -12.47393, 4.026069 ); c = ( c + 12.47393 ) / 16.5;
  vec3 x2 = c * c, x4 = x2 * x2;
  c = 15.5 * x4 * x2 - 40.14 * x4 * c + 31.96 * x4 - 6.868 * x2 * c + 0.4298 * x2 + 0.1191 * c - 0.00232;
  c = outM * c; return clamp( pow( max( c, 0.0 ), vec3( 2.2 ) ), 0.0, 1.0 );
}
vec3 toSRGB( vec3 c ) { return mix( c * 12.92, 1.055 * pow( c, vec3( 1.0 / 2.4 ) ) - 0.055, step( 0.0031308, c ) ); }
float h12( vec2 p ) { vec3 p3 = fract( vec3( p.xyx ) * 0.1031 ); p3 += dot( p3, p3.yzx + 33.33 ); return fract( ( p3.x + p3.y ) * p3.z ); }
void main() {
  vec2 dc = vUv - uCenter;
  vec3 col;
  if ( uCA > 0.0 ) {
    vec2 o = dc * uCA * ( 0.5 + dot( dc, dc ) * 4.0 );
    col = vec3( texture2D( tColor, vUv - o ).r, texture2D( tColor, vUv ).g, texture2D( tColor, vUv + o ).b );
  } else col = texture2D( tColor, vUv ).rgb;
  #ifdef USE_DIRT
    col += texture2D( tBloom, vUv ).rgb * texture2D( tDirt, vUv ).r * uDirt;
  #endif
  col += uFlashColor * uFlash;
  col *= uExposure;
  #ifdef AGX
    col = agxDefault( col );
  #else
    col = aces( col );
  #endif
  col = toSRGB( col );
  #ifdef USE_LUT
    vec3 lc = texture( tLUT, col * ( ( uLutSize - 1.0 ) / uLutSize ) + 0.5 / uLutSize ).rgb;
    col = mix( col, lc, uLut );
  #endif
  vec2 vd = ( vUv - 0.5 ) * vec2( uAspect, 1.0 );
  col *= 1.0 - uVignette * smoothstep( 0.25, 1.05, length( vd ) * 1.2 );
  #ifdef USE_GRAIN
    float n = h12( gl_FragCoord.xy + fract( uTime * 7.31 ) * 917.0 ) + h12( gl_FragCoord.xy * 1.37 + fract( uTime * 3.7 ) * 311.0 ) - 1.0;
    col += n * uGrain * ( 1.0 - col * 0.6 );
  #endif
  // dither (8-bit banding in skies / fog)
  col += ( h12( gl_FragCoord.xy + 0.37 ) - 0.5 ) / 255.0;
  gl_FragColor = vec4( clamp( col, 0.0, 1.0 ), 1.0 );
}`;

function fsMat(frag, uniforms, defines = {}) {
  return new THREE.ShaderMaterial({ uniforms, defines, vertexShader: FS_VERT, fragmentShader: frag, depthTest: false, depthWrite: false });
}

/**
 * @param {THREE.WebGLRenderer} renderer
 * @param {THREE.Scene} scene
 * @param {THREE.Camera} camera
 * @param {object} opts { quality (settings object from quality.js), toneMapping: 'aces'|'agx', lut (Data3DTexture), bloom {strength,radius,threshold}, grade {vignette} }
 */
export function createPostFX(renderer, scene, camera, opts = {}) {
  const caps = renderer.capabilities; const isGL2 = caps.isWebGL2 !== false;
  const hdrType = THREE.HalfFloatType;
  const mkRT = (w, h, o = {}) => new THREE.WebGLRenderTarget(w, h, Object.assign({ type: hdrType, format: THREE.RGBAFormat, depthBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, generateMipmaps: false }, o));
  let W = 2, H = 2;
  const state = { speed: 0, boost: 0, time: 0, frame: 0, flash: 0, maskOn: false, mask: new THREE.Vector4(0.5, 0.35, 0.1, 0.1), center: new THREE.Vector2(0.5, 0.5), toneMapping: opts.toneMapping || 'aces' };
  let q = opts.quality;

  // render targets
  let sceneRT = null;
  const makeSceneRT = () => {
    if (sceneRT) sceneRT.dispose();
    sceneRT = mkRT(W, H, { depthBuffer: true, samples: isGL2 ? (q.msaa || 0) : 0 });
  };
  const ping = mkRT(2, 2), pong = mkRT(2, 2);
  const ldr = new THREE.WebGLRenderTarget(2, 2, { type: THREE.UnsignedByteType, depthBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
  const gbuf = mkRT(2, 2, { depthBuffer: true, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
  gbuf.depthTexture = new THREE.DepthTexture(2, 2); gbuf.depthTexture.type = THREE.UnsignedIntType;
  const ssrRT = mkRT(2, 2);

  // g-buffer override material: packed view normal + signed reflectivity (negative = dynamic/car)
  const gA = { value: 0 }; const gRoad = { value: 0 }; const gWet = { value: 0 };
  const gMat = new THREE.MeshNormalMaterial();
  gMat.onBeforeCompile = (s) => {
    s.uniforms.fxGA = gA; s.uniforms.fxGRoad = gRoad; s.uniforms.fxGWet = gWet; s.uniforms.fxPud = { value: puddleTexture() };
    s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vFxW;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvFxW = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;');
    s.fragmentShader = s.fragmentShader.replace('void main() {', 'uniform float fxGA, fxGRoad, fxGWet; uniform sampler2D fxPud; varying vec3 vFxW;\nvoid main() {');
    const i = s.fragmentShader.lastIndexOf('}');
    s.fragmentShader = s.fragmentShader.slice(0, i) + `
      float fxa = fxGA;
      if ( fxGRoad > 0.5 && fxGWet > 0.0 ) { float p = smoothstep( 0.35, 0.75, texture2D( fxPud, vFxW.xz / 18.0 ).r - ( 1.0 - fxGWet ) * 0.4 ); fxa *= mix( 0.5, 1.0, p ); }
      gl_FragColor.a = fxa;
    }`;
  };
  gMat.onBeforeRender = (r, s, c, g, object) => {
    const ud = object.userData; const m = object.material; const mu = (m && m.userData) || {};
    let refl = ud.fxReflect ?? mu.fxReflect;
    if (refl == null) refl = m && m.isMeshStandardMaterial ? Math.pow(1 - m.roughness, 3) * (0.25 + 0.75 * m.metalness) * 0.6 : 0;
    gA.value = ud.fxDynamic ? -(refl + 0.01) : refl; gRoad.value = ud.fxRoad ? 1 : 0;
    gMat.uniformsNeedUpdate = true;
  };
  const hidden = [];
  function renderGBuffer() {
    hidden.length = 0;
    scene.traverseVisible((o) => {
      if (o.isPoints || o.isLine || o.isSprite || o.userData.fxNoGBuffer || o.userData.fxSky || (o.isMesh && o.material && !Array.isArray(o.material) && (o.material.transparent || o.material.isShaderMaterial && o.material.blending === THREE.AdditiveBlending))) hidden.push(o);
    });
    for (const o of hidden) o.visible = false;
    const bg = scene.background, ov = scene.overrideMaterial; scene.background = null; scene.overrideMaterial = gMat;
    const cc = renderer.getClearColor(_c), ca = renderer.getClearAlpha();
    renderer.setClearColor(0x7f7fff, 0); renderer.setRenderTarget(gbuf); renderer.clear(); renderer.render(scene, camera);
    renderer.setClearColor(cc, ca); scene.overrideMaterial = ov; scene.background = bg;
    for (const o of hidden) o.visible = true;
  }
  const _c = new THREE.Color();

  // passes
  const fsq = new FullScreenQuad(null);
  const ssrMat = fsMat(SSR_FRAG, { tDepth: { value: gbuf.depthTexture }, tNormal: { value: gbuf.texture }, tColor: { value: null }, uProj: { value: new THREE.Matrix4() }, uInvProj: { value: new THREE.Matrix4() },
    uNear: { value: 0.1 }, uFar: { value: 1000 }, uMaxDist: { value: 60 }, uFrame: { value: 0 }, uRes: { value: new THREE.Vector2() } }, { SSR_STEPS: 32 });
  const defMat = fsMat(DEFERRED_FRAG, { tColor: { value: null }, tAO: { value: null }, tSSR: { value: ssrRT.texture }, tDepth: { value: gbuf.depthTexture }, uAO: { value: 1 }, uSSR: { value: 1 }, uSSRTexel: { value: new THREE.Vector2() } });
  const mbMat = fsMat(MB_FRAG, { tColor: { value: null }, tDepth: { value: gbuf.depthTexture }, tGBuf: { value: gbuf.texture }, uPrevVP: { value: new THREE.Matrix4() }, uInvVP: { value: new THREE.Matrix4() },
    uCamBlur: { value: 0.5 }, uRadial: { value: 0 }, uMaxBlur: { value: 0.04 }, uNear: { value: 0.1 }, uFar: { value: 1000 }, uCenter: { value: state.center }, uMask: { value: state.mask }, uMaskOn: { value: 0 } }, { MB_SAMPLES: 8 });
  const compMat = fsMat(COMPOSITE_FRAG, { tColor: { value: null }, tBloom: { value: null }, tDirt: { value: lensDirtTexture() }, tLUT: { value: opts.lut || null },
    uExposure: { value: 1 }, uVignette: { value: 0.3 }, uGrain: { value: 0.03 }, uCA: { value: 0 }, uTime: { value: 0 }, uDirt: { value: 0 }, uLut: { value: 1 }, uLutSize: { value: 32 }, uAspect: { value: 1 }, uSat: { value: 1 },
    uCenter: { value: state.center }, uFlash: { value: 0 }, uFlashColor: { value: new THREE.Color(0.3, 0.5, 1) } });
  let gtao = null, bloom = null, smaa = null, fxaa = null;
  const bloomCfg = Object.assign({ strength: 0.4, radius: 0.6, threshold: 1.0 }, opts.bloom);
  let grade = Object.assign({ vignette: 0.3 }, opts.grade);
  const prevVP = new THREE.Matrix4(); let hasPrev = false; const curVP = new THREE.Matrix4();

  function needGBuffer() { return !!(q.ao || q.ssr || q.motionBlur === 'depth' || q.softParticles); }

  function configure() {
    makeSceneRT();
    // AO
    if (q.ao && !gtao) {
      gtao = new GTAOPass(scene, camera, 2, 2, { depthTexture: gbuf.depthTexture, normalTexture: gbuf.texture });
      gtao.output = GTAOPass.OUTPUT.Off;
      gtao.updateGtaoMaterial({ radius: 1.4, distanceExponent: 1.5, thickness: 2.5, scale: 1.2, samples: q.ao >= 1 ? 16 : 12, distanceFallOff: 1, screenSpaceRadius: false });
      gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: q.ao >= 1 ? 16 : 8 });
    }
    if (q.bloom && !bloom) bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), bloomCfg.strength, bloomCfg.radius, bloomCfg.threshold);
    if (q.aa === 'smaa' && !smaa) smaa = new SMAAPass();
    if (q.aa === 'fxaa' && !fxaa) fxaa = new FXAAPass();
    if (smaa) smaa.renderToScreen = true; if (fxaa) fxaa.renderToScreen = true;
    ssrMat.defines.SSR_STEPS = q.ssrSteps || 32; ssrMat.needsUpdate = true;
    defMat.defines = {}; if (q.ao) defMat.defines.USE_AO = 1; if (q.ssr) defMat.defines.USE_SSR = 1; defMat.needsUpdate = true;
    mbMat.defines = { MB_SAMPLES: q.motionBlur === 'depth' ? (q.msaa ? 12 : 10) : 7 }; if (q.motionBlur === 'depth') mbMat.defines.USE_DEPTH = 1; mbMat.needsUpdate = true;
    compMat.defines = {}; if (q.lensDirt) compMat.defines.USE_DIRT = 1; if (q.grain) compMat.defines.USE_GRAIN = 1; if (compMat.uniforms.tLUT.value) compMat.defines.USE_LUT = 1;
    if (state.toneMapping === 'agx') compMat.defines.AGX = 1; compMat.needsUpdate = true;
    resize();
  }

  function resize() {
    const v = renderer.getDrawingBufferSize(_v2); W = Math.max(2, v.x | 0); H = Math.max(2, v.y | 0);
    sceneRT.setSize(W, H); ping.setSize(W, H); pong.setSize(W, H); ldr.setSize(W, H); gbuf.setSize(W, H);
    const ss = q.ssr >= 1 ? 0.5 : 0.5; ssrRT.setSize(Math.max(2, W * ss | 0), Math.max(2, H * ss | 0));
    defMat.uniforms.uSSRTexel.value.set(1 / ssrRT.width, 1 / ssrRT.height);
    ssrMat.uniforms.uRes.value.set(ssrRT.width, ssrRT.height);
    if (gtao) { const s = q.ao >= 1 ? 1 : 0.5; gtao.setSize(Math.max(2, W * s | 0), Math.max(2, H * s | 0)); }
    if (bloom) { const s = q.bloom; bloom.setSize(Math.max(4, W * s | 0), Math.max(4, H * s | 0)); }
    if (smaa) smaa.setSize(W, H); if (fxaa) fxaa.setSize(W, H);
    compMat.uniforms.uAspect.value = W / H;
    hasPrev = false;
  }
  const _v2 = new THREE.Vector2();

  configure();

  const api = {
    get size() { return { width: W, height: H }; },
    get gbuffer() { return gbuf; },
    get depthTexture() { return needGBuffer() ? gbuf.depthTexture : null; },
    setQuality(nq) { q = nq; configure(); },
    setSize() { resize(); },
    setSpeed(mps) { state.speed = mps; },
    setBoost(b) { state.boost = b; },
    setLUT(t) { compMat.uniforms.tLUT.value = t; if (t && !compMat.defines.USE_LUT) { compMat.defines.USE_LUT = 1; compMat.needsUpdate = true; } },
    setBloom(b) { Object.assign(bloomCfg, b); if (bloom) { bloom.strength = bloomCfg.strength; bloom.radius = bloomCfg.radius; bloom.threshold = bloomCfg.threshold; } },
    setGrade(g) { grade = Object.assign({ vignette: 0.3 }, g); },
    setToneMapping(t) { state.toneMapping = t; configure(); },
    setWet(w) { gWet.value = w; },
    /** focus-of-expansion for radial blur (uv) */
    setCenter(x, y) { state.center.set(x, y); },
    /** screen-space ellipse (uv centre, radii) protecting the player car from radial/camera blur */
    setCarMask(cx, cy, rx, ry, on = true) { state.mask.set(cx, cy, Math.max(rx, 1e-3), Math.max(ry, 1e-3)); state.maskOn = on; },
    flash(amount) { state.flash = Math.max(state.flash, amount); },
    /** @param {number} dt seconds */
    render(dt = 1 / 60) {
      state.time += dt; state.frame++;
      const v = renderer.getDrawingBufferSize(_v2); if ((v.x | 0) !== W || (v.y | 0) !== H) resize();
      camera.updateMatrixWorld(); curVP.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      const prevTarget = renderer.getRenderTarget(); const prevAuto = renderer.autoClear; renderer.autoClear = true;
      const useG = needGBuffer();
      if (useG) renderGBuffer();
      renderer.setRenderTarget(sceneRT); renderer.clear(); renderer.render(scene, camera);
      let cur = sceneRT;
      const other = () => (cur === ping ? pong : ping);
      // deferred: AO + SSR
      if (q.ao || q.ssr) {
        if (q.ao && gtao) { gtao.render(renderer, null, null); defMat.uniforms.tAO.value = gtao.pdRenderTarget.texture; defMat.uniforms.uAO.value = 0.85; }
        if (q.ssr) {
          const u = ssrMat.uniforms; u.tColor.value = cur.texture; u.uProj.value.copy(camera.projectionMatrix); u.uInvProj.value.copy(camera.projectionMatrixInverse);
          u.uNear.value = camera.near; u.uFar.value = camera.far; u.uFrame.value = state.frame % 64; u.uMaxDist.value = 70;
          fsq.material = ssrMat; renderer.setRenderTarget(ssrRT); renderer.clear(); fsq.render(renderer);
          defMat.uniforms.uSSR.value = 1.0;
        }
        defMat.uniforms.tColor.value = cur.texture; fsq.material = defMat; const out = other(); renderer.setRenderTarget(out); fsq.render(renderer); cur = out;
      }
      // motion blur
      const sp = Math.max(0, state.speed);
      const radial = q.motionBlur === 'none' ? 0 : Math.min(1, Math.max(0, (sp - 18) / 60)) * 0.045 + state.boost * 0.035;
      const camBlur = q.motionBlur === 'depth' ? 0.55 : 0;
      if ((radial > 0.0005 || (camBlur > 0 && hasPrev)) && q.motionBlur !== 'none') {
        const u = mbMat.uniforms; u.tColor.value = cur.texture; u.uRadial.value = radial; u.uCamBlur.value = hasPrev ? camBlur : 0;
        u.uPrevVP.value.copy(prevVP); u.uInvVP.value.copy(curVP).invert(); u.uMaxBlur.value = 0.035 + state.boost * 0.02; u.uMaskOn.value = state.maskOn ? 1 : 0;
        u.uNear.value = camera.near; u.uFar.value = camera.far;
        fsq.material = mbMat; const out = other(); renderer.setRenderTarget(out); fsq.render(renderer); cur = out;
      }
      // bloom (adds onto cur)
      if (q.bloom && bloom) { bloom.render(renderer, null, cur, dt, false); compMat.uniforms.tBloom.value = bloom.renderTargetsHorizontal[0].texture; }
      // composite
      const cu = compMat.uniforms; cu.tColor.value = cur.texture; cu.uExposure.value = renderer.toneMappingExposure; cu.uTime.value = state.time;
      const spd = Math.min(1, Math.max(0, (sp - 25) / 55));
      cu.uCA.value = q.ca ? 0.0025 + spd * 0.006 + state.boost * 0.012 : 0;
      cu.uGrain.value = q.grain ? 0.022 + spd * 0.012 : 0;
      cu.uVignette.value = (grade.vignette ?? 0.3) + spd * 0.1 + state.boost * 0.12;
      cu.uDirt.value = q.lensDirt ? 2.2 : 0;
      state.flash *= Math.exp(-dt * 6); cu.uFlash.value = state.flash;
      fsq.material = compMat;
      if (q.aa === 'smaa' && smaa) { renderer.setRenderTarget(ldr); fsq.render(renderer); smaa.render(renderer, null, ldr); }
      else if (q.aa === 'fxaa' && fxaa) { renderer.setRenderTarget(ldr); fsq.render(renderer); fxaa.render(renderer, null, ldr); }
      else { renderer.setRenderTarget(null); fsq.render(renderer); }
      prevVP.copy(curVP); hasPrev = true;
      renderer.setRenderTarget(prevTarget); renderer.autoClear = prevAuto;
    },
    dispose() {
      for (const t of [sceneRT, ping, pong, ldr, gbuf, ssrRT]) t && t.dispose();
      for (const m of [ssrMat, defMat, mbMat, compMat, gMat]) m.dispose();
      for (const p of [gtao, bloom, smaa, fxaa]) p && p.dispose && p.dispose();
      fsq.dispose();
    },
  };
  return api;
}
