// Hero: one fruit fly's brain and nerve cord, drawn from Perch's BANC v888 data.
// Points are real cell positions (a sample); filaments are real traced neuron skeletons.
// The pulses that travel along the filaments are motion design, not recorded spikes.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js';

const D = window.HERO_DATA;
const stage = document.getElementById('specimen');
const bar = document.getElementById('scale-bar');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

function b64(s, T) {
  const bin = atob(s), u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return new T(u8.buffer);
}

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch (e) {
  document.documentElement.classList.add('no-webgl');
  throw e;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
camera.position.z = 5;
const specimen = new THREE.Group();
scene.add(specimen);

// --- cells -----------------------------------------------------------------
const P16 = b64(D.p, Int16Array), CLS = b64(D.c, Uint8Array);
const n = D.n;
const pos = new Float32Array(n * 3), start = new Float32Array(n * 3), seed = new Float32Array(n), cls = new Float32Array(n);
for (let i = 0; i < n; i++) {
  pos[i * 3] = P16[i * 3] / 32000; pos[i * 3 + 1] = P16[i * 3 + 1] / 32000; pos[i * 3 + 2] = P16[i * 3 + 2] / 32000;
  const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, r = 2.2 + Math.random() * 0.8, s = Math.sqrt(1 - u * u);
  start[i * 3] = r * s * Math.cos(th); start[i * 3 + 1] = r * u; start[i * 3 + 2] = r * s * Math.sin(th);
  seed[i] = Math.random(); cls[i] = CLS[i];
}
const cg = new THREE.BufferGeometry();
cg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
cg.setAttribute('aStart', new THREE.BufferAttribute(start, 3));
cg.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
cg.setAttribute('aCls', new THREE.BufferAttribute(cls, 1));
const cellMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  uniforms: { uTime: { value: 0 }, uIntro: { value: reduce ? 1 : 0 }, uSize: { value: 2.2 }, uPR: { value: renderer.getPixelRatio() } },
  vertexShader: `
    attribute vec3 aStart; attribute float aSeed; attribute float aCls;
    uniform float uTime, uIntro, uSize, uPR;
    varying float vA; varying float vCls;
    void main() {
      float k = clamp((uIntro * 1.35 - aSeed * 0.35), 0.0, 1.0);
      k = 1.0 - pow(1.0 - k, 3.0);
      vec3 p = mix(aStart, position, k);
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      float depth = clamp(0.72 + (mv.z + 5.0) * 1.6, 0.35, 1.0);
      vA = depth * (0.55 + 0.45 * sin(uTime * 0.9 + aSeed * 40.0) * 0.5 + 0.25) * k;
      vCls = aCls;
      gl_PointSize = uSize * uPR * (0.7 + depth * 0.6);
    }`,
  fragmentShader: `
    varying float vA; varying float vCls;
    void main() {
      vec2 d = gl_PointCoord - 0.5; float r = dot(d, d);
      if (r > 0.25) discard;
      float a = smoothstep(0.25, 0.0, r) * vA * 0.58;
      vec3 c = vec3(0.80, 0.86, 1.0);
      if (vCls > 0.5 && vCls < 1.5) c = vec3(0.98, 0.86, 0.80);       // sensory
      else if (vCls > 2.5 && vCls < 3.5) c = vec3(0.62, 0.74, 1.0);   // optic
      else if (vCls > 3.5 && vCls < 4.5) c = vec3(0.70, 0.88, 0.98);  // nerve cord
      else if (vCls > 6.5 && vCls < 7.5) c = vec3(1.0, 0.55, 0.70);   // motor
      gl_FragColor = vec4(c * a, a);
    }`,
});
specimen.add(new THREE.Points(cg, cellMat));

// --- traced neurons ----------------------------------------------------------
const S16 = b64(D.sn, Int16Array), ST = b64(D.st, Uint8Array), SP = b64(D.sp, Uint16Array), SC = b64(D.sc, Uint32Array);
const m = D.kept_nodes;
const spos = new Float32Array(m * 3), st = new Float32Array(m), sph = new Float32Array(m);
for (let i = 0; i < m * 3; i++) spos[i] = S16[i] / 32000;
const idx = [];
let off = 0;
for (let c = 0; c < SC.length; c++) {
  const cnt = SC[c], ph = Math.random();
  for (let i = 0; i < cnt; i++) {
    st[off + i] = ST[off + i] / 255; sph[off + i] = ph;
    const p = SP[off + i];
    if (p !== 65535) idx.push(off + i, off + p);
  }
  off += cnt;
}
const sg = new THREE.BufferGeometry();
sg.setAttribute('position', new THREE.BufferAttribute(spos, 3));
sg.setAttribute('aT', new THREE.BufferAttribute(st, 1));
sg.setAttribute('aPh', new THREE.BufferAttribute(sph, 1));
sg.setIndex(idx);
const lineMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  uniforms: { uTime: { value: 0 }, uShow: { value: reduce ? 1 : 0 } },
  vertexShader: `
    attribute float aT; attribute float aPh; varying float vT; varying float vPh; varying float vDepth;
    void main() { vT = aT; vPh = aPh; vec4 mv = modelViewMatrix * vec4(position, 1.0); vDepth = clamp(0.72 + (mv.z + 5.0) * 1.6, 0.35, 1.0); gl_Position = projectionMatrix * mv; }`,
  fragmentShader: `
    uniform float uTime, uShow; varying float vT; varying float vPh; varying float vDepth;
    void main() {
      float head = fract(uTime * 0.11 + vPh);
      float d = vT - head * 1.25 + 0.12;
      float pulse = exp(-d * d * 420.0) * step(-0.02, head - vT * 0.8);
      float a = (0.065 + pulse * 0.95) * uShow * vDepth;
      vec3 c = mix(vec3(1.0, 0.36, 0.54), vec3(1.0, 0.86, 0.92), pulse);
      gl_FragColor = vec4(c * a, a);
    }`,
});
specimen.add(new THREE.LineSegments(sg, lineMat));

// --- layout, scale bar, interaction ---------------------------------------------
let W = 1, H = 1, half = 1.15;
function layout() {
  const r = stage.getBoundingClientRect();
  W = Math.max(1, r.width); H = Math.max(1, r.height);
  renderer.setSize(W, H, false);
  const aspect = W / H, wide = W > 900;
  half = wide ? 0.62 : 0.66;                       // world half-height shown
  camera.top = half; camera.bottom = -half; camera.left = -half * aspect; camera.right = half * aspect;
  camera.updateProjectionMatrix();
  specimen.position.x = wide ? half * aspect * 0.40 : 0;
  specimen.position.y = wide ? 0.035 : 0.02;
  specimen.scale.setScalar(wide ? 0.5 : 0.56);
  // 100 µm in screen pixels under this orthographic camera
  const px = 100 * D.norm_per_um * specimen.scale.x * (H / (2 * half));
  if (bar) bar.style.width = px.toFixed(1) + 'px';
}
layout();
new ResizeObserver(layout).observe(stage);

let yaw = 0.5, pitch = 0.12, vYaw = reduce ? 0 : 0.0016, drag = null;
const el = renderer.domElement;
el.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, yaw, pitch }; el.setPointerCapture(e.pointerId); stage.classList.add('dragging'); });
el.addEventListener('pointermove', e => {
  if (!drag) return;
  yaw = drag.yaw + (e.clientX - drag.x) * 0.006;
  pitch = Math.max(-0.9, Math.min(0.9, drag.pitch + (e.clientY - drag.y) * 0.004));
});
const end = () => { drag = null; stage.classList.remove('dragging'); };
el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);

let visible = true, t0 = performance.now(), last = t0;
new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(stage);
document.documentElement.classList.add('webgl-ready');

function frame(now) {
  requestAnimationFrame(frame);
  if (!visible || document.hidden) { last = now; return; }
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  const t = (now - t0) / 1000;
  if (!reduce) {
    cellMat.uniforms.uIntro.value = Math.min(1, t / 2.6);
    lineMat.uniforms.uShow.value = Math.min(1, Math.max(0, (t - 1.6) / 1.4));
    if (!drag) yaw += vYaw * dt * 60;
  }
  cellMat.uniforms.uTime.value = t; lineMat.uniforms.uTime.value = t;
  specimen.rotation.set(pitch, yaw, 0);
  renderer.render(scene, camera);
}
requestAnimationFrame(frame);
