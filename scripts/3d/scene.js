// "Crow's Realm" — a deterministic Three.js scene rendered frame-by-frame.
// Everything is a pure function of time, so renders are exact and the
// 8-second `loop` shot repeats seamlessly (used for the animated WebP).
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const q = new URLSearchParams(location.search);
const W = Number(q.get('w')) || 960;
const H = Number(q.get('h')) || 960;

const LOOP = 8;          // seconds — seamless loop length
const SPEED = 10;        // world scroll speed (m/s); SPEED*LOOP = 80
const P = 40;            // terrain period along z (divides 80)
const SPAN = 80;         // period for floating objects (= SPEED*LOOP)
const TAU = Math.PI * 2;
// Iridescent palette: one colour per specialty.
const VIOLET = 0xa78bfa, CYAN = 0x22d3ee, PINK = 0xf472b6, AMBER = 0xfbbf24;
const DOMAIN = [VIOLET, CYAN, PINK, AMBER];
const GREEN = VIOLET, MINT = 0xe9e5ff;

const rng = (seed) => () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const lerp = (a, b, t) => a + (b - a) * t;
const wrapZ = (z0, t) => ((((z0 + t * SPEED) % SPAN) + SPAN) % SPAN) - 30; // [-30, 50)
// Front-facing shots see objects behind the crow (+z); rear shots see them ahead (-z).
let facing = 'front';
const edgeFade = (z) => (facing === 'front' ? smooth(2, 12, z) * (1 - smooth(36, 50, z)) : smooth(-30, -18, z) * (1 - smooth(-14, -6, z)));

// ───────────────────────── renderer / composer ─────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true });
renderer.setClearColor(0x000000, 0);
renderer.setPixelRatio(1);
renderer.setSize(W, H);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.95;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0b0720, 0.0105);
const FOG = scene.fog;
// Neon studio environment: darkness ringed by coloured light panels, so black
// iridescent surfaces pick up cyan / pink / violet / amber reflections.
{
  const env = new THREE.Scene();
  env.background = new THREE.Color(0x020106);
  const light = (hex, k, pos, w, h) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), side: THREE.DoubleSide }));
    m.position.set(...pos);
    m.lookAt(0, 0, 0);
    env.add(m);
  };
  light(0x22d3ee, 4, [-10, 2, -7], 7, 12);
  light(0xf472b6, 4, [10, 1, -5], 7, 12);
  light(0xa78bfa, 3, [0, 11, 0], 14, 8);
  light(0xfbbf24, 3, [0, -4, -11], 10, 3);
  light(0x818cf8, 1.2, [0, 5, 11], 6, 4);
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(env, 0.02).texture;
  void RoomEnvironment;
}
const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 900);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.75, 0.45, 0.72);
composer.addPass(bloom);
composer.addPass(new OutputPass());
const finish = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, uFade: { value: 0 }, uTime: { value: 0 }, uAspect: { value: W / H } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uFade, uTime, uAspect; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
    void main(){
      vec2 d = vUv - .5; d.x *= uAspect;
      float r = length(d);
      vec2 off = d * .0035;
      vec3 c = vec3(texture2D(tDiffuse, vUv + off).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - off).b);
      c *= smoothstep(1.05, .35, r);
      c += (h(vUv * 900. + uTime) - .5) * .01;
      gl_FragColor = vec4(c * (1. - uFade), 1.);
    }`,
});
composer.addPass(finish);

// ───────────────────────── sky: aurora + stars ─────────────────────────
const sky = new THREE.Mesh(
  new THREE.SphereGeometry(600, 48, 24),
  new THREE.ShaderMaterial({
    side: THREE.BackSide, fog: false, depthWrite: false,
    uniforms: { uPhase: { value: 0 } },
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `uniform float uPhase; varying vec3 vDir;
      float h(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,37.719))) * 43758.5453); }
      void main(){
        float y = vDir.y;
        vec3 col = mix(vec3(.03,.012,.06), vec3(.008,.006,.025), smoothstep(-.1,.6,y));
        col += vec3(.25,.06,.2) * exp(-pow((y - .02) * 7., 2.)) * .5;
        float a = 0.;
        for (int k = 0; k < 3; k++) {
          float fk = float(k);
          float c = .16 + .07*fk + .05*sin(vDir.x*2.6 + vDir.z*1.4 + uPhase + fk*2.1);
          float band = exp(-pow((y - c) * (16. - fk*3.), 2.));
          float curtain = .55 + .45*sin(vDir.x*22. + vDir.z*9. + uPhase*2. + fk*1.7);
          a += band * curtain * (.9 - fk*.22);
        }
        col += a * mix(mix(vec3(.13,.83,.93), vec3(.65,.55,.98), smoothstep(.12,.28,y)), vec3(.96,.45,.71), smoothstep(.28,.45,y)) * .3;
        vec3 g = floor(vDir * 380.);
        float s = step(.9975, h(g)) * smoothstep(0.,.25,y);
        col += s * (.5 + .5*sin(uPhase*3. + h(g+1.)*6.283)) * vec3(.9,1.,.95) * 1.4;
        gl_FragColor = vec4(col, 1.);
      }`,
  })
);
scene.add(sky);

// ───────────────────────── celestial: moon (+z) & portal (-z) ─────────────────────────
const basic = (color, opacity = 1) => new THREE.MeshBasicMaterial({ color, fog: false, transparent: opacity < 1, opacity });
const moon = new THREE.Group();
moon.position.set(0, 30, 190);
// synthwave sun: gold→pink gradient with stripe cut-outs
moon.add(new THREE.Mesh(new THREE.CircleGeometry(22, 64), new THREE.ShaderMaterial({
  side: THREE.DoubleSide, fog: false,
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `varying vec2 vUv; void main(){
    float y = vUv.y; vec3 col = mix(vec3(.95,.25,.6), vec3(1.,.82,.35), smoothstep(.1,.9,y));
    if (y < .48) { float st = fract(y * 16.); if (st < (.48 - y) * 1.6) discard; }
    gl_FragColor = vec4(col * 1.25, 1.); }`,
})));
const moonRing1 = new THREE.Mesh(new THREE.TorusGeometry(28, 0.3, 8, 128), basic(PINK));
const moonRing2 = new THREE.Mesh(new THREE.TorusGeometry(34, 0.15, 8, 128), basic(CYAN, 0.6));
moonRing1.rotation.x = 0.3; moonRing2.rotation.x = -0.4;
moon.add(moonRing1, moonRing2);
scene.add(moon);

const portal = new THREE.Group();
portal.position.set(0, 24, -220);
const pr1 = new THREE.Mesh(new THREE.TorusGeometry(36, 0.9, 8, 6), basic(CYAN));
const pr2 = new THREE.Mesh(new THREE.TorusGeometry(30, 0.3, 8, 128), basic(PINK));
const pr3 = new THREE.Mesh(new THREE.TorusGeometry(42, 0.2, 8, 128), basic(VIOLET, 0.6));
const pcore = new THREE.Mesh(new THREE.CircleGeometry(29, 64), new THREE.MeshBasicMaterial({ color: 0x3b1d73, fog: false, transparent: true, opacity: 0.45 }));
portal.add(pr1, pr2, pr3, pcore);
scene.add(portal);

// ───────────────────────── lights ─────────────────────────
scene.add(new THREE.HemisphereLight(0x9d8cff, 0x05030a, 0.3));
const keyLight = new THREE.DirectionalLight(0xffd2b0, 0.5);
keyLight.position.set(-20, 30, 60);
scene.add(keyLight);
const rim = new THREE.DirectionalLight(CYAN, 1.8);
rim.position.set(10, 8, -60);
scene.add(rim);
const eyeLight = new THREE.PointLight(AMBER, 0, 6, 2); // eyes glow via bloom; a real light here hot-spots the wings
scene.add(eyeLight);

// ───────────────────────── terrain (periodic in z) ─────────────────────────
function height(x, z) {
  const w = TAU / P;
  const canyon = Math.pow(Math.abs(x) / 13, 1.9) * 4.2;
  const r = Math.sin(x * 0.33 + Math.sin(z * w) * 1.6) * 1.3 + Math.sin(z * w * 2 + x * 0.21) * 0.9 + Math.sin(z * w * 3 - x * 0.47) * 0.55;
  return -6 + canyon + r * (0.35 + Math.min(1, Math.abs(x) / 9));
}
const terrainGeo = new THREE.PlaneGeometry(220, 400, 140, 280);
terrainGeo.rotateX(-Math.PI / 2);
{
  const pos = terrainGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setY(i, height(pos.getX(i), pos.getZ(i)));
  terrainGeo.computeVertexNormals();
}
const terrain = new THREE.Group();
terrain.add(new THREE.Mesh(terrainGeo, new THREE.MeshStandardMaterial({ color: 0x0c0920, roughness: 0.85, metalness: 0.2, flatShading: true })));
const wireGeo = new THREE.WireframeGeometry(terrainGeo);
{
  // spectrum by distance from the canyon centre: cyan → violet → pink
  const p = wireGeo.attributes.position, col = new Float32Array(p.count * 3);
  const ca = new THREE.Color(CYAN), cb = new THREE.Color(VIOLET), cc = new THREE.Color(PINK), tc = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const k = Math.min(1, Math.abs(p.getX(i)) / 36);
    (k < 0.5 ? tc.lerpColors(ca, cb, k * 2) : tc.lerpColors(cb, cc, k * 2 - 1)).toArray(col, i * 3);
  }
  wireGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
}
const wire = new THREE.LineSegments(wireGeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.2 }));
wire.position.y = 0.02;
terrain.add(wire);
// glowing river of light along the canyon floor
const river = new THREE.Mesh(
  new THREE.PlaneGeometry(3.2, 400, 1, 1).rotateX(-Math.PI / 2),
  new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uOff: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `uniform float uOff; varying vec2 vUv;
      void main(){
        float edge = smoothstep(.5, .0, abs(vUv.x - .5));
        float dash = .45 + .55 * smoothstep(.35, .5, fract(vUv.y * 40. - uOff));
        gl_FragColor = vec4(mix(vec3(.98,.45,.71), vec3(1.,.75,.3), dash) * edge * dash * .6, edge * .6);
      }`,
  })
);
river.position.y = -5.2;
terrain.add(river);
scene.add(terrain);

// ───────────────────────── the crow ─────────────────────────
// Black feathers with a thin-film sheen — that's what makes a crow "shine".
const crowMat = new THREE.MeshPhysicalMaterial({ color: 0x050409, metalness: 0.75, roughness: 0.26, envMapIntensity: 1, flatShading: true, iridescence: 1, iridescenceIOR: 1.65, iridescenceThicknessRange: [300, 820], clearcoat: 0.6, clearcoatRoughness: 0.2, side: THREE.DoubleSide });
const beakMat = new THREE.MeshPhysicalMaterial({ color: 0x2a2233, metalness: 0.9, roughness: 0.2, flatShading: true, iridescence: 0.6, clearcoat: 1, emissive: 0x6b3a10, emissiveIntensity: 0.35 });
// Satin finish for broad feather planes so they never mirror out to white.
const featherMat = crowMat.clone();
featherMat.roughness = 0.6;
featherMat.metalness = 0.55;
featherMat.clearcoat = 0.25;
const edgeMat = new THREE.LineBasicMaterial({ color: 0xc4b5fd, transparent: true, opacity: 0.35 });
function part(geo, parent, mat = crowMat, edgeAngle = 1) {
  parent.add(new THREE.Mesh(geo, mat));
  parent.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, edgeAngle), edgeMat));
}
function featherShape(points) {
  const s = new THREE.Shape();
  points.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  const g = new THREE.ShapeGeometry(s);
  g.rotateX(Math.PI / 2); // shape XY → world XZ (y → +z = backward)
  return g;
}
// A single feather blade pointing along +x (or −x when side = −1), lying in XZ.
function blade(len, width, side = 1) {
  const w = width / 2;
  return featherShape([[0, -w * 0.8], [len * 0.62, -w], [len, 0], [len * 0.62, w], [0, w * 0.8]].map(([x, y]) => [x * side, y]));
}

const crow = new THREE.Group();
// streamlined faceted body (lathe profile turned along z: −z = chest, +z = tail)
const bodyGeo = new THREE.LatheGeometry(
  [[0, -2.05], [0.42, -1.75], [0.7, -1.1], [0.82, -0.3], [0.74, 0.5], [0.5, 1.2], [0.22, 1.8], [0, 1.95]].map(([r, y]) => new THREE.Vector2(r, y)), 8
).rotateX(Math.PI / 2).scale(1, 0.82, 1);
part(bodyGeo, crow, crowMat, 20);
part(new THREE.IcosahedronGeometry(0.6, 1).scale(0.92, 0.95, 1.12).translate(0, 0.38, -2.15), crow, crowMat, 20);
part(new THREE.ConeGeometry(0.21, 1.15, 6).rotateX(-Math.PI / 2 + 0.1).translate(0, 0.24, -3.2), crow, beakMat, 20);
const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffc94d });
for (const s of [-1, 1]) {
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 8), eyeMat);
  eye.position.set(s * 0.42, 0.55, -2.42);
  crow.add(eye);
}
// fanned tail: six separate feathers
for (let k = 0; k < 6; k++) {
  const g = blade(2.1, 0.42).rotateY(-Math.PI / 2 + (k - 2.5) * 0.11);
  g.translate(0, 0.05, 1.55);
  part(g, crow, featherMat);
}

const wings = [];
const PRIMARY_LEN = [2.9, 3.15, 3.05, 2.85, 2.55, 2.25, 1.95];
for (const side of [-1, 1]) {
  const inner = new THREE.Group();
  inner.position.set(side * 0.6, 0.2, -0.35);
  const outer = new THREE.Group();
  outer.position.set(side * 2.4, 0, 0);
  const pts = (arr) => arr.map(([x, y]) => [x * side, y]);
  // arm + coverts with a scalloped trailing edge of secondaries
  part(featherShape(pts([[0, -0.5], [2.45, -0.32], [2.5, 0.95], [2.05, 1.2], [1.65, 1.0], [1.25, 1.28], [0.85, 1.05], [0.42, 1.25], [0, 1.0]])), inner, featherMat);
  // hand coverts
  part(featherShape(pts([[0, -0.32], [1.25, -0.18], [1.35, 0.75], [0.6, 0.95], [0, 0.95]])), outer, featherMat);
  // primaries splay like fingers — the crow's signature silhouette
  let tip;
  PRIMARY_LEN.forEach((len, i) => {
    const a = -0.05 + i * 0.13;
    const ox = (0.95 + i * 0.03) * side, oz = -0.12 + i * 0.13;
    const g = blade(len, 0.36, side).rotateY(-side * a).translate(ox, 0, oz);
    part(g, outer, featherMat);
    if (i === 1) {
      tip = new THREE.Object3D();
      tip.position.set(ox + Math.cos(a) * len * side, 0, oz + Math.sin(a) * len);
      outer.add(tip);
    }
  });
  inner.add(outer);
  crow.add(inner);
  wings.push({ side, inner, outer, tip });
}
scene.add(crow);

// wing-tip light trails
const TRAIL_N = 46;
const trails = wings.map(() => {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(TRAIL_N * 3), 3));
  const col = new Float32Array(TRAIL_N * 3);
  const ta = new THREE.Color(CYAN), tb = new THREE.Color(PINK), tc2 = new THREE.Color();
  for (let i = 0; i < TRAIL_N; i++) { const f = 1 - i / TRAIL_N; tc2.lerpColors(ta, tb, i / TRAIL_N).multiplyScalar(f).toArray(col, i * 3); }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const l = new THREE.Line(g, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending }));
  l.frustumCulled = false;
  scene.add(l);
  return l;
});

function poseCrow(t) {
  const ph = (TAU * 6 * t) / LOOP; // 6 flaps per loop
  for (const w of wings) {
    w.inner.rotation.z = w.side * (Math.sin(ph) * 0.55 + 0.08);
    w.outer.rotation.z = w.side * (Math.sin(ph - 0.7) * 0.5);
    w.inner.rotation.x = Math.sin(ph + 1.2) * 0.08;
  }
  crow.position.set(Math.sin((TAU * t) / LOOP) * 0.6, 1.2 - Math.sin(ph) * 0.22, 0);
  crow.rotation.set(Math.sin(ph + 0.6) * 0.04 - 0.05, Math.sin((TAU * t) / LOOP) * 0.08, Math.cos((TAU * t) / LOOP) * 0.14);
}
const tmp = new THREE.Vector3();
function updateTrails(t) {
  const arrs = trails.map((l) => l.geometry.attributes.position.array);
  for (let i = 0; i < TRAIL_N; i++) {
    const tau = t - i * 0.022;
    poseCrow(tau);
    crow.updateMatrixWorld(true);
    wings.forEach((w, k) => {
      w.tip.getWorldPosition(tmp);
      arrs[k].set([tmp.x, tmp.y, tmp.z + (t - tau) * SPEED], i * 3);
    });
  }
  trails.forEach((l) => (l.geometry.attributes.position.needsUpdate = true));
  poseCrow(t);
  crow.updateMatrixWorld(true);
}

// ───────────────────────── voxel invaders ─────────────────────────
const SPRITES = [
  ['00100000100', '00010001000', '00111111100', '01101110110', '11111111111', '10111111101', '10100000101', '00011011000'],
  ['0011111100', '0111111110', '1101101011', '1111111111', '0010110100', '0101001010', '1010000101'],
  ['000111000', '011111110', '110111011', '111111111', '011000110', '110000011'],
];
const invaderMats = DOMAIN.map((col) => new THREE.MeshStandardMaterial({ color: 0x15102a, emissive: col, emissiveIntensity: 0.9, roughness: 0.4, metalness: 0.2 }));
const invaderGeos = SPRITES.map((rows) => {
  const boxes = [];
  rows.forEach((row, j) => [...row].forEach((c, k) => {
    if (c === '1') boxes.push(new THREE.BoxGeometry(0.42, 0.42, 0.42).translate((k - row.length / 2) * 0.46, (rows.length / 2 - j) * 0.46, 0));
  }));
  return mergeGeometries(boxes);
});
const r1 = rng(42);
const drifters = Array.from({ length: 14 }, (_, i) => {
  const m = new THREE.Mesh(invaderGeos[i % 3], invaderMats[i % 4]);
  const side = i % 2 ? 1 : -1;
  const d = { mesh: m, x: side * (11 + r1() * 14), y: 3 + r1() * 9, z0: r1() * SPAN, spin: (r1() - 0.5) * 1.2, bob: r1() * TAU };
  scene.add(m);
  return d;
});
// crystals
const crystalMat = new THREE.MeshPhysicalMaterial({ color: 0x1a1030, emissive: 0x5b3fb8, emissiveIntensity: 0.35, metalness: 0.6, roughness: 0.15, iridescence: 1, flatShading: true });
const crystals = Array.from({ length: 10 }, (_, i) => {
  const g = new THREE.OctahedronGeometry(0.8 + r1() * 1.2, 0).scale(0.6, 1.6, 0.6);
  const m = new THREE.Group();
  m.add(new THREE.Mesh(g, crystalMat));
  m.add(new THREE.LineSegments(new THREE.EdgesGeometry(g), edgeMat));
  scene.add(m);
  const side = i % 2 ? 1 : -1;
  return { mesh: m, x: side * (15 + r1() * 16), y: 0.5 + r1() * 6, z0: r1() * SPAN, spin: 0.3 + r1() * 0.6 };
});

// glowing feather / spark particles
function dotTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(160,255,200,.8)');
  g.addColorStop(1, 'rgba(61,255,134,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}
const DOT = dotTexture();
const PN = 700;
const pBase = Array.from({ length: PN }, () => [(r1() - 0.5) * 60, -3 + r1() * 20, r1() * SPAN, r1() * TAU]);
const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(PN * 3), 3));
{
  const col = new Float32Array(PN * 3), tc = new THREE.Color();
  for (let i = 0; i < PN; i++) tc.set(DOMAIN[i % 4]).toArray(col, i * 3);
  pGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
}
const sparks = new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 0.26, map: DOT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true }));
sparks.frustumCulled = false;
scene.add(sparks);

// ───────────────────────── game sequence: bolts + explosions ─────────────────────────
const game = new THREE.Group();
scene.add(game);
const formation = [];
for (let row = 0; row < 3; row++)
  for (let col = 0; col < 5; col++) {
    const m = new THREE.Mesh(invaderGeos[row], invaderMats[[2, 1, 0][row]]);
    game.add(m);
    formation.push({ mesh: m, x: (col - 2) * 3.4, y: 3 + row * 2.6, hit: 0 });
  }
// deterministic kill order
const order = formation.map((_, i) => i).sort((a, b) => ((a * 7) % 15) - ((b * 7) % 15));
order.forEach((idx, k) => (formation[idx].hit = 1.0 + k * 0.33));
const boltGeo = new THREE.CylinderGeometry(0.07, 0.07, 2.2, 6).rotateX(Math.PI / 2);
const boltMat = new THREE.MeshBasicMaterial({ color: 0xffe7a3 });
const bolts = formation.map(() => { const b = new THREE.Mesh(boltGeo, boltMat); game.add(b); return b; });
const BURST_N = 26;
const burstGeo = new THREE.BoxGeometry(0.28, 0.28, 0.28);
const burstMat = new THREE.MeshBasicMaterial({ color: PINK });
const bursts = formation.map((_, i) => {
  const r = rng(100 + i);
  const g = new THREE.Group();
  const parts = Array.from({ length: BURST_N }, () => {
    const m = new THREE.Mesh(burstGeo, i % 2 ? burstMat : boltMat);
    const v = new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize().multiplyScalar(4 + r() * 6);
    g.add(m);
    return { m, v };
  });
  game.add(g);
  return { g, parts };
});
const flash = new THREE.PointLight(AMBER, 0, 30, 2);
game.add(flash);
const FORM_Z = -34;
function updateGame(on, local) {
  game.visible = on;
  if (!on) return;
  let flashI = 0;
  formation.forEach((f, i) => {
    const march = Math.sin(local * 1.6) * 2.2;
    const fx = f.x + march, fy = f.y + Math.sin(local * 3 + i) * 0.25, fz = FORM_Z;
    const alive = local < f.hit;
    f.mesh.visible = alive;
    f.mesh.position.set(fx, fy, fz);
    f.mesh.rotation.y = Math.sin(local * 2 + i) * 0.4;
    // bolt: fired 0.45s before impact from the beak
    const b = bolts[i], fire = f.hit - 0.45;
    if (local > fire && local < f.hit) {
      const k = (local - fire) / 0.45;
      b.visible = true;
      b.position.set(lerp(crow.position.x, fx, k), lerp(crow.position.y + 0.4, fy, k), lerp(-3, fz, k));
      b.lookAt(fx, fy, fz);
    } else b.visible = false;
    const bt = local - f.hit;
    const burst = bursts[i];
    burst.g.visible = bt > 0 && bt < 1.4;
    if (burst.g.visible) {
      burst.g.position.set(fx, fy, fz);
      const s = 1 - smooth(0.3, 1.4, bt);
      burst.parts.forEach(({ m, v }) => { m.position.copy(v).multiplyScalar(bt); m.scale.setScalar(s); m.rotation.set(bt * 5, bt * 3, 0); });
      if (bt < 0.25) { flashI = Math.max(flashI, 40 * (1 - bt / 0.25)); flash.position.set(fx, fy, fz + 2); }
    }
  });
  flash.intensity = flashI;
}

// ───────────────────────── 3D title ─────────────────────────
const title = new THREE.Group();
title.visible = false;
scene.add(title);
const titleReady = new FontLoader().loadAsync('/node_modules/three/examples/fonts/helvetiker_bold.typeface.json').then((font) => {
  const mk = (text, size, depth, mat, y) => {
    const g = new TextGeometry(text, { font, size, depth, curveSegments: 6, bevelEnabled: true, bevelThickness: depth * 0.15, bevelSize: size * 0.025, bevelSegments: 2 });
    g.computeBoundingBox();
    g.translate(-(g.boundingBox.max.x + g.boundingBox.min.x) / 2, y, 0);
    const grp = new THREE.Group();
    grp.add(new THREE.Mesh(g, mat));
    grp.add(new THREE.LineSegments(new THREE.EdgesGeometry(g, 30), new THREE.LineBasicMaterial({ color: GREEN, transparent: true, opacity: 0.55 })));
    title.add(grp);
    return grp;
  };
  const chrome = new THREE.MeshPhysicalMaterial({ color: 0xe9e5ff, metalness: 0.6, roughness: 0.22, iridescence: 1, iridescenceIOR: 1.8, iridescenceThicknessRange: [250, 900], clearcoat: 1, emissive: 0x4c3a8a, emissiveIntensity: 0.55 });
  const neon = new THREE.MeshStandardMaterial({ color: 0x2a1650, metalness: 0.3, roughness: 0.3, emissive: 0xc084fc, emissiveIntensity: 0.85 });
  mk('SHINING', 7, 1.6, chrome, 8);
  mk('CROW', 9, 2, neon, -3.5);
  // colour-coded domain line
  const words = [['AI', VIOLET], ['WEB', CYAN], ['MOBILE', PINK], ['GAMES', AMBER]];
  const geos = words.map(([w]) => { const g = new TextGeometry(w, { font, size: 1.5, depth: 0.25, curveSegments: 4 }); g.computeBoundingBox(); return g; });
  const gap = 2.2, widths = geos.map((g) => g.boundingBox.max.x - g.boundingBox.min.x);
  let x = -(widths.reduce((a, b) => a + b, 0) + gap * (words.length - 1)) / 2;
  geos.forEach((g, i) => {
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: words[i][1] }));
    m.position.set(x, -8.2, 0);
    title.add(m);
    x += widths[i] + gap;
  });
  const tl = new THREE.PointLight(0xe6fff0, 1400, 80, 2); tl.position.set(0, 4, 16); title.add(tl);
});

// ───────────────────────── world update ─────────────────────────
function updateWorld(t) {
  const phase = (TAU * t) / LOOP;
  sky.material.uniforms.uPhase.value = phase;
  terrain.position.z = (t * SPEED) % P;
  river.material.uniforms.uOff.value = (t * SPEED * 40) / 400;
  moonRing1.rotation.z = phase * 0.25; moonRing2.rotation.z = -phase * 0.125;
  pr1.rotation.z = phase * 0.25; pr2.rotation.z = -phase * 0.5; pr3.rotation.z = phase * 0.125;
  pcore.material.opacity = 0.35 + 0.15 * Math.sin(phase * 2);

  for (const d of drifters) {
    const z = wrapZ(d.z0, t);
    d.mesh.position.set(d.x, d.y + Math.sin(phase * 2 + d.bob) * 0.5, z);
    d.mesh.rotation.y = d.spin * phase;
    d.mesh.scale.setScalar(edgeFade(z) * 1.1);
  }
  for (const c of crystals) {
    const z = wrapZ(c.z0, t);
    c.mesh.position.set(c.x, c.y + Math.sin(phase + c.z0) * 0.4, z);
    c.mesh.rotation.y = phase * c.spin;
    c.mesh.scale.setScalar(edgeFade(z));
  }
  const arr = pGeo.attributes.position.array;
  pBase.forEach(([x, y, z0, s], i) => {
    const z = wrapZ(z0, t);
    arr.set([x + Math.sin(phase + s) * 1.2, y + Math.sin(phase * 2 + s) * 0.6, z], i * 3);
  });
  pGeo.attributes.position.needsUpdate = true;

  updateTrails(t);
  eyeLight.position.set(crow.position.x, crow.position.y + 0.6, crow.position.z - 2.4);
}

// ───────────────────────── shots ─────────────────────────
const look = new THREE.Vector3();
const SHOTS = {
  // seamless 8s loop: the crow flies toward us, moon & aurora behind
  loop(t) {
    const p = (TAU * t) / LOOP;
    camera.position.set(-1.2 + Math.sin(p) * 1.4, 3.1 + Math.sin(p * 2) * 0.3, -11.2 + Math.cos(p) * 0.6);
    look.set(crow.position.x * 0.4, 2.6, 6);
    camera.lookAt(look);
  },
  intro(t, d) {
    const k = ease(t / d);
    camera.position.set(lerp(6, -3.8, k), lerp(16, 2.1, k), lerp(-46, -9, k));
    camera.lookAt(0, lerp(4, 1.5, k), 0);
  },
  chase(t, d) {
    const k = t / d;
    camera.position.set(lerp(3.2, -2.6, k), lerp(3.6, 2.6, k), lerp(9.5, 7.2, k));
    camera.lookAt(0, 1.6, -24);
  },
  eye(t, d) {
    const a = lerp(-2.25, -0.95, ease(t / d));
    camera.position.set(Math.cos(a) * 8.8, 3.6 + t * 0.1, -0.8 + Math.sin(a) * 8.8);
    camera.lookAt(crow.position.x * 0.8, 1.5, -1.2);
  },
  game(t, d) {
    const k = t / d;
    camera.position.set(lerp(7.5, 4.5, k), lerp(4.2, 3.2, k), lerp(9, 6.5, k));
    camera.lookAt(0, 4, -26);
  },
  title(t, d) {
    const k = ease(Math.min(1, t / (d * 0.8)));
    camera.position.set(lerp(-1.5, 0, k), lerp(1.8, 5.5, k), lerp(11, 6, k));
    camera.lookAt(0, lerp(3, 7.5, k), -70);
  },
};

const REEL = [
  { shot: 'intro', d: 6 },
  { shot: 'chase', d: 5 },
  { shot: 'eye', d: 4.5 },
  { shot: 'game', d: 7.5 },
  { shot: 'title', d: 7 },
];
const REEL_LEN = REEL.reduce((s, x) => s + x.d, 0);

function renderAt(t, shotName, local = t, dur = LOOP, fade = 0) {
  facing = ['loop', 'intro', 'eye'].includes(shotName) ? 'front' : 'back';
  updateWorld(t);
  const inGame = shotName === 'game';
  updateGame(inGame, local);
  title.visible = shotName === 'title';
  for (const d of drifters) d.mesh.visible = !inGame && !title.visible;
  for (const c of crystals) c.mesh.visible = !title.visible;
  crow.visible = !title.visible;
  trails.forEach((l) => (l.visible = !title.visible));
  if (title.visible) {
    const k = ease(Math.min(1, local / 2.6));
    title.position.set(0, lerp(-14, 9, k), lerp(-95, -72, local / dur));
    title.rotation.y = Math.sin(local * 0.6) * 0.05;
  }
  SHOTS[shotName](local, dur);
  finish.uniforms.uFade.value = fade;
  finish.uniforms.uTime.value = (t * 7.31) % 100;
  composer.render();
}

// Warm front key light, only used for the hero portrait.
const heroKey = new THREE.DirectionalLight(0xfff1e0, 0);
heroKey.position.set(-12, 10, -22);
scene.add(heroKey);

window.STAGE = {
  ready: titleReady.then(() => true),
  // Transparent, bloom-free portrait of the crow (wings spread) for the hero slide.
  heroStill(t = 0.1667) {
    const hidden = [sky, terrain, moon, portal, sparks, game, title, ...trails, ...drifters.map((d) => d.mesh), ...crystals.map((k) => k.mesh)];
    hidden.forEach((o) => (o.visible = false));
    scene.fog = null;
    heroKey.intensity = 1.6;
    poseCrow(t);
    crow.position.set(0, 0, 0);
    crow.rotation.set(-0.22, 0.42, 0.04);
    crow.updateMatrixWorld(true);
    eyeLight.position.set(0, 0.7, -2.6);
    camera.position.set(-2.6, 3.6, -18);
    camera.lookAt(0.3, 0.55, 0);
    renderer.render(scene, camera);
    hidden.forEach((o) => (o.visible = true));
    scene.fog = FOG;
    heroKey.intensity = 0;
  },
  LOOP,
  REEL_LEN,
  // Seamless loop frame at time t ∈ [0, LOOP)
  loop(t) { renderAt(t, 'loop'); },
  // Showreel frame at global time t ∈ [0, REEL_LEN)
  reel(t) {
    let acc = 0;
    for (const s of REEL) {
      if (t < acc + s.d || s === REEL[REEL.length - 1]) {
        const local = t - acc;
        const fadeIn = acc === 0 ? 1 - smooth(0, 0.8, local) : 1 - smooth(0, 0.35, local);
        const fadeOut = s === REEL[REEL.length - 1] ? smooth(s.d - 1.2, s.d, local) : smooth(s.d - 0.35, s.d, local);
        renderAt(t, s.shot, local, s.d, Math.max(fadeIn, fadeOut));
        return;
      }
      acc += s.d;
    }
  },
};
