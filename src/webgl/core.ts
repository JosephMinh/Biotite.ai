/**
 * The Biotite Core — the site's signature visual.
 *
 * A stack of cleaved mineral sheets (biotite is a mica that splits into thin
 * crystalline lamellae) suspended in a dark atmosphere. A molten garnet
 * interior glows between the layers; facets carry silver fresnel edges with
 * a faint spectral sheen. Three depth layers of particles — far starfield,
 * drifting dust, rising embers — give the scene depth, and capable desktops
 * get a low-strength bloom pass for the emissive interior.
 *
 * Driven by three inputs: time, damped pointer position, and document scroll
 * progress (layer separation + interior energy + canvas presence).
 */

import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  IcosahedronGeometry,
  Mesh,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import {
  canvasOpacity,
  clamp01,
  damp,
  layerSeparation,
  pickQuality,
} from "../scripts/motion";

/* ----------------------------- shaders --------------------------------- */

const sheetVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPhase;
  varying vec3 vViewPos;
  varying vec3 vLocal;

  void main() {
    vec3 pos = position;
    float breathe = 1.0 + 0.012 * sin(uTime * 0.4 + uPhase);
    pos.xz *= breathe;
    vLocal = pos;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vViewPos = mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const sheetFragment = /* glsl */ `
  uniform float uTime;
  uniform float uPhase;
  uniform float uGlow;
  uniform float uEnergy;
  uniform float uSheetY;
  varying vec3 vViewPos;
  varying vec3 vLocal;

  // Cheap per-facet hash for tonal variation between crystal faces.
  float hash(vec3 p) {
    return fract(sin(dot(floor(p * 40.0), vec3(12.9898, 78.233, 37.719))) * 43758.5453);
  }

  // Per-cell random vector for the glitter micro-crystals.
  vec3 hash3(vec3 cell) {
    return fract(sin(vec3(
      dot(cell, vec3(127.1, 311.7, 74.7)),
      dot(cell, vec3(269.5, 183.3, 246.1)),
      dot(cell, vec3(113.5, 271.9, 124.6)))) * 43758.5453);
  }

  void main() {
    // Faceted normals from screen-space derivatives (true flat shading).
    vec3 n = normalize(cross(dFdx(vViewPos), dFdy(vViewPos)));
    vec3 v = normalize(-vViewPos);
    float facing = abs(dot(n, v));
    float fresnel = pow(1.0 - facing, 6.5);

    // True-black mineral base with the faintest onyx cast.
    vec3 base = vec3(0.007, 0.009, 0.0075);

    // Cool key light + warm silver fill for facet definition.
    vec3 keyL = normalize(vec3(0.45, 0.85, 0.55));
    vec3 fillL = normalize(vec3(-0.6, -0.15, 0.4));
    float diff = max(dot(n, keyL), 0.0);
    float fill = max(dot(n, fillL), 0.0);
    vec3 col = base
      + vec3(0.24, 0.25, 0.245) * pow(diff, 2.2) * 0.028
      + vec3(0.20, 0.185, 0.17) * fill * 0.008;

    // Per-facet tonal variation so faces read as individual crystal planes.
    float facet = hash(n) * 0.5 + 0.5;
    col *= 0.5 + facet * 0.62;

    // Silver cleavage-edge light with a faint spectral sheen.
    vec3 sheen = 0.5 + 0.5 * cos(6.2832 * (facing * 1.6 + vec3(0.0, 0.33, 0.67)));
    vec3 edge = vec3(0.64, 0.65, 0.64) + sheen * 0.08;
    // Vary the edge catch per crystal plane so rims read cut, not coated.
    col += edge * fresnel * 0.62 * (0.45 + 0.85 * facet);

    // Molten interior: garnet under-light that leaks from the stack's heart.
    float interior = 1.0 - smoothstep(0.0, 2.3, length(vLocal.xz));
    float below = 0.5 - 0.5 * n.y * sign(uSheetY);
    float pulse = 0.72 + 0.28 * sin(uTime * 0.55 + uPhase);
    vec3 garnet = vec3(0.72, 0.09, 0.05);
    col += garnet * interior * below * (uGlow + uEnergy * 0.55) * pulse;

    // Garnet edge catch on rims nearest the heart.
    col += garnet * fresnel * interior * uEnergy * 0.5 * pulse;

    // Schist glitter: micro-crystal cells whose random orientations flash
    // when they align with the half-vector — the rock twinkles as it turns.
    vec3 cell = floor(vLocal * 34.0);
    vec3 hv = hash3(cell);
    vec3 micro = normalize(hv * 2.0 - 1.0);
    vec3 half1 = normalize(v + keyL);
    float align = max(dot(micro, half1), 0.0);
    float shimmer = 0.7 + 0.3 * sin(uTime * 2.2 + hv.y * 43.0);
    float glint = pow(align, 46.0) * step(0.62, hv.x) * shimmer;
    glint *= 0.3 + 0.7 * facing;
    col += vec3(0.92, 0.94, 0.92) * glint * 2.7;
    // Rare warm glints near the heart.
    col += vec3(0.86, 0.20, 0.07)
      * pow(align, 80.0) * step(0.9, hv.z) * interior * 1.2;

    // Contrast grade: crush the body toward true black to counteract the
    // sRGB output lift; highlights (glints, edges) pass through untouched.
    col = pow(col, vec3(1.45));

    gl_FragColor = vec4(col, 1.0);
  }
`;

/** Soft additive radial glow (used for the heart halo). */
const glowVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const glowFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float a = pow(max(1.0 - d, 0.0), 2.6) * uIntensity;
    gl_FragColor = vec4(uColor, a);
  }
`;

/** Molten heart: emissive sphere with soft edge falloff. */
const heartVertex = /* glsl */ `
  uniform float uTime;
  varying vec3 vViewPos;
  varying vec3 vNorm;
  void main() {
    vec3 pos = position * (1.0 + 0.04 * sin(uTime * 0.7 + position.y * 3.0));
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vViewPos = mv.xyz;
    vNorm = normalMatrix * normal;
    gl_Position = projectionMatrix * mv;
  }
`;

const heartFragment = /* glsl */ `
  uniform float uTime;
  uniform float uIntensity;
  varying vec3 vViewPos;
  varying vec3 vNorm;
  void main() {
    vec3 n = normalize(vNorm);
    vec3 v = normalize(-vViewPos);
    float rim = pow(abs(dot(n, v)), 1.6);
    float flicker = 0.85 + 0.15 * sin(uTime * 1.7) * sin(uTime * 0.9 + 2.0);
    vec3 hot = vec3(0.86, 0.16, 0.05);
    vec3 deep = vec3(0.30, 0.0, 0.0);
    vec3 col = mix(deep, hot, rim * 0.85) * uIntensity * flicker;
    gl_FragColor = vec4(col, rim * uIntensity);
  }
`;

/** Fullscreen atmosphere: deep gradient + garnet ember haze behind the core. */
const atmoVertex = /* glsl */ `
  varying vec2 vNdc;
  void main() {
    vNdc = position.xy;
    gl_Position = vec4(position.xy, 0.99999, 1.0);
  }
`;

const atmoFragment = /* glsl */ `
  uniform vec2 uEmber;
  uniform float uEmberI;
  uniform float uAspect;
  uniform float uTime;
  varying vec2 vNdc;

  float hash2(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    float yy = vNdc.y * 0.5 + 0.5;
    vec3 col = mix(vec3(0.010, 0.014, 0.010), vec3(0.003, 0.004, 0.003), yy);

    vec2 p = vec2(vNdc.x * uAspect, vNdc.y);
    vec2 e = vec2(uEmber.x * uAspect, uEmber.y);
    float d = distance(p, e);

    // Garnet ember haze around the core, breathing slowly.
    float breathe = 0.85 + 0.15 * sin(uTime * 0.3);
    col += vec3(0.105, 0.013, 0.006) * exp(-d * d * 2.6) * uEmberI * breathe;
    // Cool silver lift just above it, like light on haze.
    col += vec3(0.030, 0.036, 0.032) * exp(-pow(distance(p, e + vec2(-0.3, 0.55)), 2.0) * 1.1);

    // Dither to prevent gradient banding.
    col += (hash2(gl_FragCoord.xy + fract(uTime)) - 0.5) * 0.012;

    gl_FragColor = vec4(col, 1.0);
  }
`;

const particleVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSpan;
  uniform float uRise;
  attribute float aSeed;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vFade;
  varying float vSeed;

  void main() {
    vColor = aColor;
    vSeed = aSeed;
    vec3 pos = position;
    float speed = (0.06 + aSeed * 0.14) * uRise;
    pos.y = mod(pos.y + uTime * speed + aSeed * uSpan, uSpan) - uSpan * 0.5;
    pos.x += sin(uTime * 0.25 + aSeed * 40.0) * 0.16;

    vFade = 1.0 - smoothstep(uSpan * 0.32, uSpan * 0.48, abs(pos.y));

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = (1.0 + aSeed * 2.4) * uPixelRatio * (6.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const particleFragment = /* glsl */ `
  uniform float uAlpha;
  uniform float uTime;
  varying vec3 vColor;
  varying float vFade;
  varying float vSeed;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    // Per-particle twinkle: each mote flickers on its own rhythm.
    float tw = 0.55 + 0.45 * sin(uTime * (1.2 + vSeed * 2.6) + vSeed * 61.0);
    float alpha = smoothstep(0.5, 0.12, d) * uAlpha * vFade * tw;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

/* --------------------------- geometry ---------------------------------- */

/**
 * A cleaved mica flake: a finely subdivided icosahedron flattened into a
 * lens-thin slab, with multi-octave radial crag for an irregular crystalline
 * silhouette and stepped relief across the faces. Flat shading in the
 * fragment shader turns every triangle into a visible micro-facet, so higher
 * `detail` directly buys more sparkle.
 */
function createSheetGeometry(
  radius: number,
  seed: number,
  detail: number
): BufferGeometry {
  const geo = new IcosahedronGeometry(1, detail);
  const pos = geo.attributes.position as BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const len = Math.hypot(x, y, z) || 1;
    const nx = x / len;
    const ny = y / len;
    const nz = z / len;

    // Sleek silhouette: long, elegant undulations — cut glass, not rubble.
    const crag =
      0.09 * Math.sin(3.1 * nx + seed) * Math.cos(2.7 * nz + seed * 1.3) +
      0.05 * Math.sin(7.3 * nz + seed * 2.1) * Math.sin(5.9 * nx + seed * 0.7) +
      0.02 * Math.sin(13.7 * nx * nz + seed * 3.3);
    const r = 1 + crag;

    const px = nx * r * radius;
    const pz = nz * r * radius;
    // Flatten into a flake; edges taper knife-thin like real cleavage.
    let py = ny * r * radius * 0.07;
    // Faint polished relief across the faces — enough to catch light.
    py +=
      radius *
      0.012 *
      Math.sin(px * 5.3 + seed * 1.9) *
      Math.cos(pz * 4.6 + seed * 1.1);
    py += radius * 0.006 * Math.sin(px * 11.7 + pz * 9.3 + seed * 2.7);

    pos.setXYZ(i, px, py, pz);
  }
  geo.computeVertexNormals();
  return geo;
}

interface ParticleField {
  points: Points;
  material: ShaderMaterial;
}

function createParticles(opts: {
  count: number;
  radiusMin: number;
  radiusMax: number;
  span: number;
  rise: number;
  alpha: number;
  size: number;
  garnetRatio: number;
  pixelRatio: number;
}): ParticleField {
  const positions = new Float32Array(opts.count * 3);
  const seeds = new Float32Array(opts.count);
  const colors = new Float32Array(opts.count * 3);
  const porcelain = new Color("#fdfffc");
  const garnet = new Color("#c9502e");
  for (let i = 0; i < opts.count; i++) {
    const radius =
      opts.radiusMin + Math.random() * (opts.radiusMax - opts.radiusMin);
    const angle = Math.random() * Math.PI * 2;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = (Math.random() - 0.5) * opts.span;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
    seeds[i] = Math.random() * opts.size;
    const c = Math.random() < opts.garnetRatio ? garnet : porcelain;
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  const geo = new BufferGeometry();
  geo.setAttribute("position", new BufferAttribute(positions, 3));
  geo.setAttribute("aSeed", new BufferAttribute(seeds, 1));
  geo.setAttribute("aColor", new BufferAttribute(colors, 3));
  const material = new ShaderMaterial({
    vertexShader: particleVertex,
    fragmentShader: particleFragment,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: opts.pixelRatio },
      uSpan: { value: opts.span },
      uRise: { value: opts.rise },
      uAlpha: { value: opts.alpha },
    },
  });
  return { points: new Points(geo, material), material };
}

/* ----------------------------- scene ----------------------------------- */

export function createBiotiteCore(container: HTMLElement): void {
  const quality = pickQuality({
    width: window.innerWidth,
    dpr: window.devicePixelRatio || 1,
    coarsePointer: window.matchMedia("(pointer: coarse)").matches,
    deviceMemory: (navigator as { deviceMemory?: number }).deviceMemory,
  });
  const highTier = quality.layers >= 8;

  const pixelRatio = Math.min(window.devicePixelRatio || 1, quality.maxDpr);
  const renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.style.opacity = "0";

  const scene = new Scene();
  const camera = new PerspectiveCamera(
    35,
    window.innerWidth / window.innerHeight,
    0.1,
    60
  );
  camera.position.set(0, 0.4, 11);

  /* Atmosphere backdrop (fullscreen triangle, drawn first, no depth). */
  const atmoMat = new ShaderMaterial({
    vertexShader: atmoVertex,
    fragmentShader: atmoFragment,
    depthWrite: false,
    depthTest: false,
    uniforms: {
      uEmber: { value: new Vector2(0.35, -0.05) },
      uEmberI: { value: 1 },
      uAspect: { value: window.innerWidth / window.innerHeight },
      uTime: { value: 0 },
    },
  });
  const atmoGeo = new BufferGeometry();
  atmoGeo.setAttribute(
    "position",
    new BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3)
  );
  const atmo = new Mesh(atmoGeo, atmoMat);
  atmo.frustumCulled = false;
  atmo.renderOrder = -1;
  scene.add(atmo);

  let isNarrow = window.innerWidth < 960;
  const core = new Group();
  const placeCore = () => {
    core.position.set(isNarrow ? 0 : 3.0, isNarrow ? 2.1 : 0.1, 0);
    core.scale.setScalar(isNarrow ? 0.62 : 0.94);
  };
  placeCore();
  scene.add(core);

  /* Sheets */
  interface Sheet {
    mesh: Mesh;
    baseY: number;
    baseX: number;
    baseZ: number;
    material: ShaderMaterial;
    glows: boolean;
  }

  const sheets: Sheet[] = [];
  const n = quality.layers;
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const radius = 2.0 * (0.58 + 0.42 * Math.sin(Math.PI * t));
    const seed = i * 13.7 + 3.1;
    const geometry = createSheetGeometry(radius, seed, highTier ? 3 : 2);
    const centered = i > 0 && i < n - 1;
    const baseY = (i - (n - 1) / 2) * 0.3;
    const material = new ShaderMaterial({
      vertexShader: sheetVertex,
      fragmentShader: sheetFragment,
      uniforms: {
        uTime: { value: 0 },
        uPhase: { value: i * 1.7 },
        uGlow: { value: centered ? 0.14 : 0.0 },
        uEnergy: { value: 0 },
        uSheetY: { value: baseY },
      },
    });
    const mesh = new Mesh(geometry, material);
    const baseX = Math.sin(seed) * 0.14;
    const baseZ = Math.cos(seed * 1.3) * 0.14;
    mesh.position.set(baseX, baseY, baseZ);
    mesh.rotation.y = Math.sin(seed * 2.2) * 0.5;
    core.add(mesh);
    sheets.push({ mesh, baseY, baseX, baseZ, material, glows: centered });
  }

  /* Molten heart + halo */
  const heartMat = new ShaderMaterial({
    vertexShader: heartVertex,
    fragmentShader: heartFragment,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: 0.55 },
    },
  });
  const heart = new Mesh(new SphereGeometry(0.85, 24, 16), heartMat);
  heart.scale.set(1.35, 0.62, 1.35);
  core.add(heart);

  const haloMat = new ShaderMaterial({
    vertexShader: glowVertex,
    fragmentShader: glowFragment,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uColor: { value: new Color(0.42, 0.035, 0.012) },
      uIntensity: { value: 0.3 },
    },
  });
  const halo = new Mesh(new SphereGeometry(1, 2, 2), haloMat);
  // Replace geometry with a camera-facing quad via onBeforeRender trick:
  halo.geometry.dispose();
  const quad = new BufferGeometry();
  quad.setAttribute(
    "position",
    new BufferAttribute(
      new Float32Array([-4, -4, 0, 4, -4, 0, 4, 4, 0, -4, 4, 0]),
      3
    )
  );
  quad.setAttribute(
    "uv",
    new BufferAttribute(new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]), 2)
  );
  quad.setIndex([0, 1, 2, 0, 2, 3]);
  halo.geometry = quad;
  halo.frustumCulled = false;
  scene.add(halo);

  /* Particle depth layers */
  const dust = createParticles({
    count: quality.particles,
    radiusMin: 1.1,
    radiusMax: 3.0,
    span: 7,
    rise: 1.6,
    alpha: 0.4,
    size: 1,
    garnetRatio: 0.1,
    pixelRatio,
  });
  core.add(dust.points);

  const embers = createParticles({
    count: highTier ? 90 : 36,
    radiusMin: 0.2,
    radiusMax: 1.6,
    span: 4.4,
    rise: 4.2,
    alpha: 0.8,
    size: 1.4,
    garnetRatio: 1,
    pixelRatio,
  });
  core.add(embers.points);

  const starfield = createParticles({
    count: highTier ? 420 : 180,
    radiusMin: 6,
    radiusMax: 20,
    span: 26,
    rise: 0.12,
    alpha: 0.32,
    size: 0.7,
    garnetRatio: 0.04,
    pixelRatio,
  });
  starfield.points.position.z = -10;
  scene.add(starfield.points);

  /* Post-processing: low-strength bloom on capable desktops only. */
  let composer: EffectComposer | null = null;
  if (highTier) {
    composer = new EffectComposer(renderer);
    composer.setPixelRatio(pixelRatio);
    composer.setSize(window.innerWidth, window.innerHeight);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new Vector2(window.innerWidth, window.innerHeight),
      0.3,
      0.4,
      0.85
    );
    composer.addPass(bloom);
  }

  /* Poster swap */
  container.appendChild(renderer.domElement);
  container.querySelector("[data-poster]")?.remove();

  /* Input state */
  let pointerX = 0;
  let pointerY = 0;
  let pointerTX = 0;
  let pointerTY = 0;
  let scrollProgress = 0;
  let heroOpacity = 1;
  let running = true;

  const onPointer = (e: PointerEvent) => {
    pointerTX = (e.clientX / window.innerWidth) * 2 - 1;
    pointerTY = (e.clientY / window.innerHeight) * 2 - 1;
  };

  const onScroll = () => {
    const doc = document.documentElement;
    const max = Math.max(doc.scrollHeight - window.innerHeight, 1);
    scrollProgress = clamp01(window.scrollY / max);
    heroOpacity = canvasOpacity(window.scrollY, window.innerHeight);
  };

  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer?.setSize(window.innerWidth, window.innerHeight);
    atmoMat.uniforms.uAspect!.value = window.innerWidth / window.innerHeight;
    isNarrow = window.innerWidth < 960;
    placeCore();
    onScroll();
  };

  window.addEventListener("pointermove", onPointer, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) {
      last = performance.now();
      requestAnimationFrame(tick);
    }
  });
  onScroll();

  /* Loop */
  const start = performance.now();
  let last = start;
  const emberProj = new Vector3();

  function tick(now: number) {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    const elapsed = (now - start) / 1000;

    // Intro: sheets assemble from an opened state over the first ~1.8s.
    const intro = clamp01(elapsed / 1.8);
    const introEase = 1 - Math.pow(1 - intro, 3);

    // Damped pointer.
    pointerX = damp(pointerX, pointerTX, 3.2, dt);
    pointerY = damp(pointerY, pointerTY, 3.2, dt);

    // Interior energy: swells through the middle of the page.
    const energy = Math.pow(
      Math.sin(Math.PI * clamp01(scrollProgress * 1.1)),
      2
    );

    // Sheet separation: scroll narrative + intro assembly.
    const sep = layerSeparation(scrollProgress) + (1 - introEase) * 2.4;
    for (const s of sheets) {
      s.mesh.position.y = s.baseY * (1 + sep);
      s.mesh.position.x = s.baseX * (1 + sep * 0.5);
      s.mesh.position.z = s.baseZ * (1 + sep * 0.5);
      s.material.uniforms.uTime!.value = elapsed;
      s.material.uniforms.uEnergy!.value = energy;
      if (s.glows) {
        s.material.uniforms.uGlow!.value = 0.14 + 0.12 * energy;
      }
    }

    heartMat.uniforms.uTime!.value = elapsed;
    heartMat.uniforms.uIntensity!.value = 0.6 + energy * 0.75 + sep * 0.12;
    heart.scale.set(1.35 + sep * 0.1, 0.62 + sep * 0.5, 1.35 + sep * 0.1);
    haloMat.uniforms.uIntensity!.value = 0.17 + energy * 0.3;
    halo.position.set(core.position.x, core.position.y, core.position.z - 1.6);
    halo.quaternion.copy(camera.quaternion);
    halo.scale.setScalar(core.scale.x);

    // Weighted rotation: slow autonomous drift + scroll + pointer parallax.
    core.rotation.y = elapsed * 0.05 + scrollProgress * 1.35 + pointerX * 0.12;
    core.rotation.x = -0.34 + pointerY * 0.08 + scrollProgress * 0.22;
    core.rotation.z = Math.sin(elapsed * 0.07) * 0.02;

    // Gentle camera response with a breath of hand-held sway.
    const swayX = Math.sin(elapsed * 0.23) * 0.04 + Math.sin(elapsed * 0.71) * 0.015;
    const swayY = Math.cos(elapsed * 0.19) * 0.03;
    camera.position.x = pointerX * 0.25 + swayX;
    camera.position.y = 0.4 - pointerY * 0.18 + swayY;
    camera.position.z = 11 + scrollProgress * 1.6;
    camera.lookAt(core.position.x * 0.6, core.position.y * 0.5, 0);

    // Starfield counter-parallax (it lives outside the core group).
    starfield.points.rotation.y = -pointerX * 0.02 - scrollProgress * 0.12;

    // Atmosphere follows the core and swells with its energy.
    emberProj.copy(core.position).project(camera);
    atmoMat.uniforms.uEmber!.value.set(emberProj.x, emberProj.y);
    atmoMat.uniforms.uEmberI!.value = 0.68 + energy * 0.7;
    atmoMat.uniforms.uTime!.value = elapsed;

    dust.material.uniforms.uTime!.value = elapsed;
    embers.material.uniforms.uTime!.value = elapsed;
    embers.material.uniforms.uAlpha!.value = 0.35 + energy * 0.55;
    starfield.material.uniforms.uTime!.value = elapsed;

    // Narrow layouts put the core behind the hero copy, so keep it dimmer.
    const presence = isNarrow ? 0.55 : 1;
    renderer.domElement.style.opacity = String(
      heroOpacity * introEase * presence
    );

    if (composer) {
      composer.render();
    } else {
      renderer.render(scene, camera);
    }
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}
