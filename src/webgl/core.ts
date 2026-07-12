/**
 * The Biotite Core — the site's signature visual.
 *
 * A stack of cleaved mineral sheets (biotite is a mica that splits into thin
 * crystalline lamellae) rendered with flat-faceted shading, a silver fresnel
 * edge, and a garnet internal glow. Fine particles drift between the layers.
 *
 * Driven by three inputs: time, damped pointer position, and document scroll
 * progress (which controls how far the sheets separate and how present the
 * canvas is behind content).
 */

import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  CylinderGeometry,
  Group,
  Mesh,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from "three";
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

  void main() {
    vec3 pos = position;
    float breathe = 1.0 + 0.012 * sin(uTime * 0.4 + uPhase);
    pos.xz *= breathe;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vViewPos = mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const sheetFragment = /* glsl */ `
  uniform float uTime;
  uniform float uPhase;
  uniform float uGlow;
  varying vec3 vViewPos;

  void main() {
    // Faceted normals from screen-space derivatives (true flat shading).
    vec3 n = normalize(cross(dFdx(vViewPos), dFdy(vViewPos)));
    vec3 v = normalize(-vViewPos);
    float facing = abs(dot(n, v));
    float fresnel = pow(1.0 - facing, 2.7);

    // Near-black mineral base with a faint onyx-green cast.
    vec3 base = vec3(0.028, 0.036, 0.028);

    // Single cool key light for facet definition.
    vec3 L = normalize(vec3(0.45, 0.85, 0.55));
    float diff = max(dot(n, L), 0.0);
    vec3 col = base + vec3(0.30, 0.31, 0.30) * diff * 0.30;

    // Silver cleavage-edge light.
    col += vec3(0.64, 0.65, 0.64) * fresnel * 0.9;

    // Garnet internal energy, slowly pulsing, scroll-modulated.
    float pulse = 0.55 + 0.45 * sin(uTime * 0.55 + uPhase);
    col += vec3(0.392, 0.0, 0.0) * uGlow * pulse;

    gl_FragColor = vec4(col, 1.0);
  }
`;

const particleVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aSeed;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vFade;

  void main() {
    vColor = aColor;
    vec3 pos = position;
    float span = 7.0;
    float speed = 0.10 + aSeed * 0.16;
    pos.y = mod(pos.y + uTime * speed + aSeed * span, span) - span * 0.5;
    pos.x += sin(uTime * 0.25 + aSeed * 40.0) * 0.18;

    // Fade near the vertical extremes so wrap-around is invisible.
    vFade = 1.0 - smoothstep(2.4, 3.4, abs(pos.y));

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = (1.1 + aSeed * 2.2) * uPixelRatio * (6.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const particleFragment = /* glsl */ `
  varying vec3 vColor;
  varying float vFade;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.12, d) * 0.45 * vFade;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

/* --------------------------- geometry ---------------------------------- */

/** Deterministic irregular silhouette shared by a sheet's top/bottom rings. */
function silhouette(angle: number, seed: number): number {
  return (
    Math.sin(angle * 3.0 + seed) * 0.5 +
    Math.sin(angle * 7.0 + seed * 2.1) * 0.3 +
    Math.sin(angle * 2.0 + seed * 0.7) * 0.2
  );
}

function createSheetGeometry(radius: number, seed: number): CylinderGeometry {
  const geo = new CylinderGeometry(radius, radius * 0.96, 0.21, 10, 1, false);
  const pos = geo.attributes.position as BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x, z);
    if (r < 1e-5) continue;
    const angle = Math.atan2(z, x);
    const jitter = 1 + 0.2 * silhouette(angle, seed);
    pos.setX(i, x * jitter);
    pos.setZ(i, z * jitter);
    // Slight cleave tilt so sheets are not perfectly planar.
    pos.setY(i, pos.getY(i) + 0.05 * Math.sin(angle * 2.0 + seed));
  }
  geo.computeVertexNormals();
  return geo;
}

/* ----------------------------- scene ----------------------------------- */

export function createBiotiteCore(container: HTMLElement): void {
  const quality = pickQuality({
    width: window.innerWidth,
    dpr: window.devicePixelRatio || 1,
    coarsePointer: window.matchMedia("(pointer: coarse)").matches,
    deviceMemory: (navigator as { deviceMemory?: number }).deviceMemory,
  });

  const renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality.maxDpr));
  renderer.setSize(window.innerWidth, window.innerHeight);
  // Opacity is driven per-frame in the render loop (intro fade + scroll).
  renderer.domElement.style.opacity = "0";

  const scene = new Scene();
  const camera = new PerspectiveCamera(
    35,
    window.innerWidth / window.innerHeight,
    0.1,
    50
  );
  camera.position.set(0, 0.4, 11);

  let isNarrow = window.innerWidth < 960;
  const core = new Group();
  const placeCore = () => {
    core.position.set(isNarrow ? 0 : 2.55, isNarrow ? 2.1 : 0, 0);
    core.scale.setScalar(isNarrow ? 0.62 : 1);
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
    const geometry = createSheetGeometry(radius, seed);
    const centered = i > 0 && i < n - 1;
    const material = new ShaderMaterial({
      vertexShader: sheetVertex,
      fragmentShader: sheetFragment,
      uniforms: {
        uTime: { value: 0 },
        uPhase: { value: i * 1.7 },
        uGlow: { value: centered ? 0.05 : 0.0 },
      },
    });
    const mesh = new Mesh(geometry, material);
    const baseY = (i - (n - 1) / 2) * 0.3;
    const baseX = Math.sin(seed) * 0.14;
    const baseZ = Math.cos(seed * 1.3) * 0.14;
    mesh.position.set(baseX, baseY, baseZ);
    mesh.rotation.y = Math.sin(seed * 2.2) * 0.5;
    core.add(mesh);
    sheets.push({ mesh, baseY, baseX, baseZ, material, glows: centered });
  }

  /* Particles */
  const count = quality.particles;
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const colors = new Float32Array(count * 3);
  const porcelain = new Color("#fdfffc");
  const garnet = new Color("#a33131");
  for (let i = 0; i < count; i++) {
    const radius = 1.1 + Math.random() * 1.9;
    const angle = Math.random() * Math.PI * 2;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 7;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
    seeds[i] = Math.random();
    const c = Math.random() < 0.12 ? garnet : porcelain;
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  const particleGeo = new BufferGeometry();
  particleGeo.setAttribute("position", new BufferAttribute(positions, 3));
  particleGeo.setAttribute("aSeed", new BufferAttribute(seeds, 1));
  particleGeo.setAttribute("aColor", new BufferAttribute(colors, 3));
  const particleMat = new ShaderMaterial({
    vertexShader: particleVertex,
    fragmentShader: particleFragment,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, quality.maxDpr) },
    },
  });
  const particles = new Points(particleGeo, particleMat);
  core.add(particles);

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

    // Sheet separation: scroll narrative + intro assembly.
    const sep = layerSeparation(scrollProgress) + (1 - introEase) * 2.4;
    for (const s of sheets) {
      s.mesh.position.y = s.baseY * (1 + sep);
      s.mesh.position.x = s.baseX * (1 + sep * 0.5);
      s.mesh.position.z = s.baseZ * (1 + sep * 0.5);
      s.material.uniforms.uTime!.value = elapsed;
      if (s.glows) {
        s.material.uniforms.uGlow!.value =
          0.05 + 0.13 * Math.pow(Math.sin(Math.PI * clamp01(scrollProgress * 1.1)), 2);
      }
    }

    // Weighted rotation: slow autonomous drift + scroll + pointer parallax.
    core.rotation.y = elapsed * 0.05 + scrollProgress * 1.35 + pointerX * 0.12;
    core.rotation.x = -0.16 + pointerY * 0.08 + scrollProgress * 0.22;
    core.rotation.z = Math.sin(elapsed * 0.07) * 0.02;

    // Gentle camera response.
    camera.position.x = pointerX * 0.25;
    camera.position.y = 0.4 - pointerY * 0.18;
    camera.position.z = 11 + scrollProgress * 1.6;
    camera.lookAt(core.position.x * 0.6, core.position.y * 0.5, 0);

    particleMat.uniforms.uTime!.value = elapsed;

    // Narrow layouts put the core behind the hero copy, so keep it dimmer.
    const presence = isNarrow ? 0.55 : 1;
    renderer.domElement.style.opacity = String(heroOpacity * introEase * presence);
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}
