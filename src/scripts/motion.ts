/**
 * Pure helpers for the WebGL experience. Kept free of DOM/Three imports so
 * they can be unit-tested and reused by fallback code paths.
 */

export const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

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
