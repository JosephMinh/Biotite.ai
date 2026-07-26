/**
 * Pure helpers for the WebGL experience. Kept free of DOM/Three imports so
 * they can be unit-tested and reused by fallback code paths.
 */

export const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

/** Hermite ease between edges a→b, clamped. */
export const smooth01 = (a: number, b: number, t: number): number => {
  const x = clamp01((t - a) / (b - a));
  return x * x * (3 - 2 * x);
};

/** Frame-rate independent exponential damping. */
export function damp(
  current: number,
  target: number,
  lambda: number,
  dt: number
): number {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

/**
 * How far the mineral sheets spread apart for a given overall scroll progress
 * (0 = top of page, 1 = bottom). Assembled at rest, opening through the
 * middle sections, settling again toward the final call to action.
 */
export function layerSeparation(progress: number): number {
  const t = clamp01(progress);
  const arc = Math.sin(Math.PI * Math.min(t * 1.12, 1));
  return 0.06 + 0.9 * Math.pow(arc, 1.4);
}

/**
 * Canvas presence for a given scroll position: full behind the hero, dimmed
 * behind readable content, faint near the end of the page.
 */
export function canvasOpacity(scrollY: number, viewportH: number): number {
  const p = clamp01(scrollY / Math.max(viewportH * 1.1, 1));
  return 1 - p * 0.72;
}

export interface IntroEligibility {
  freshVisit: boolean;
  introSeen: boolean;
  scrollY: number;
  viewportH: number;
}

/** Only a fresh, unseen, top-of-page visit should insert the intro stage. */
export function shouldPlayIntro(input: IntroEligibility): boolean {
  return (
    input.freshVisit &&
    !input.introSeen &&
    input.scrollY < input.viewportH * 0.5
  );
}

/**
 * Opening fly-through choreography. `p` is progress through the intro's
 * scroll distance (0 = page top, 1 = intro complete).
 *
 * Arc: hold on the full-screen artifact → approach → the layers cleave
 * open → the camera passes through the corridor between them → a masked
 * cut (presence dips to 0) → emerge in the standard hero composition.
 */
export interface IntroState {
  /** Camera dolly position; starts far, ends behind the stack. */
  cameraZ: number;
  /** Camera height easing toward the corridor gap. */
  cameraY: number;
  /** Layer separation; opens ahead of the pass-through. */
  separation: number;
  /** Molten heart brightness; ducks so the corridor isn't a red blob. */
  heartIntensity: number;
  /** Canvas opacity; dips to zero to mask the exit cut. */
  presence: number;
  /** True once the cut has happened and the main site takes over. */
  passed: boolean;
}

export function introChoreography(p: number): IntroState {
  const t = clamp01(p);
  const approach = smooth01(0.0, 0.35, t);
  const dive = smooth01(0.32, 0.88, t);
  // Dive depth tuned so the camera clears the stack's back edge (~z −4.4
  // at intro scale) right as the masking cut begins — no empty drift.
  const cameraZ = 11 - approach * 4 - dive * 11.5;
  const cameraY = 0.4 - smooth01(0.2, 0.5, t) * 0.3;
  const separation = 0.06 + smooth01(0.28, 0.62, t) * 2.7;
  const heartIntensity = 0.6 - smooth01(0.4, 0.65, t) * 0.38;

  // Cut while the corridor is still visually rich (camera ~z −3, flakes
  // still streaming past); after it, the standard hero fades back in.
  let presence = 1;
  if (t > 0.72 && t < 0.755) {
    presence = 1 - (t - 0.72) / 0.035;
  } else if (t >= 0.755) {
    presence = Math.min(1, (t - 0.755) / 0.095);
  }

  return {
    cameraZ,
    cameraY,
    separation,
    heartIntensity,
    presence,
    passed: t >= 0.755,
  };
}

export interface QualityInput {
  width: number;
  dpr: number;
  coarsePointer: boolean;
  deviceMemory?: number;
}

export interface QualityTier {
  layers: number;
  particles: number;
  maxDpr: number;
}

/** Adaptive quality: fewer sheets/particles and lower DPR on small devices. */
export function pickQuality(input: QualityInput): QualityTier {
  const constrained =
    input.width < 900 ||
    input.coarsePointer ||
    (input.deviceMemory !== undefined && input.deviceMemory <= 4);
  return constrained
    ? { layers: 6, particles: 220, maxDpr: 1.5 }
    : { layers: 8, particles: 520, maxDpr: 2 };
}
