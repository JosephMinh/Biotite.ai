import { describe, expect, it } from "vitest";
import {
  canvasOpacity,
  clamp01,
  damp,
  layerSeparation,
  pickQuality,
} from "../src/scripts/motion";

describe("clamp01", () => {
  it("clamps below, inside, and above the unit range", () => {
    expect(clamp01(-2)).toBe(0);
    expect(clamp01(0.4)).toBe(0.4);
    expect(clamp01(7)).toBe(1);
  });
});

describe("damp", () => {
  it("moves toward the target without overshooting", () => {
    const next = damp(0, 1, 3, 1 / 60);
    expect(next).toBeGreaterThan(0);
    expect(next).toBeLessThan(1);
  });

  it("converges regardless of frame rate", () => {
    let at60 = 0;
    for (let i = 0; i < 60; i++) at60 = damp(at60, 1, 3, 1 / 60);
    let at30 = 0;
    for (let i = 0; i < 30; i++) at30 = damp(at30, 1, 3, 1 / 30);
    expect(at60).toBeCloseTo(at30, 5);
  });
});

describe("layerSeparation", () => {
  it("is nearly assembled at the top of the page", () => {
    expect(layerSeparation(0)).toBeLessThan(0.1);
  });

  it("opens through the middle sections", () => {
    expect(layerSeparation(0.45)).toBeGreaterThan(0.7);
  });

  it("settles again by the end of the page", () => {
    expect(layerSeparation(1)).toBeLessThan(layerSeparation(0.45));
  });

  it("tolerates out-of-range input", () => {
    expect(layerSeparation(-1)).toBe(layerSeparation(0));
    expect(layerSeparation(2)).toBe(layerSeparation(1));
  });
});

describe("canvasOpacity", () => {
  it("is fully present at the top", () => {
    expect(canvasOpacity(0, 900)).toBe(1);
  });

  it("dims behind readable content but never disappears", () => {
    const dimmed = canvasOpacity(5000, 900);
    expect(dimmed).toBeGreaterThan(0.2);
    expect(dimmed).toBeLessThan(0.4);
  });
});

describe("pickQuality", () => {
  it("gives desktops the full experience", () => {
    const q = pickQuality({ width: 1600, dpr: 2, coarsePointer: false });
    expect(q.layers).toBe(8);
    expect(q.particles).toBeGreaterThan(400);
  });

  it("reduces work on phones", () => {
    const q = pickQuality({ width: 400, dpr: 3, coarsePointer: true });
    expect(q.layers).toBeLessThan(8);
    expect(q.maxDpr).toBeLessThanOrEqual(1.5);
  });

  it("reduces work on low-memory devices even at desktop widths", () => {
    const q = pickQuality({
      width: 1600,
      dpr: 1,
      coarsePointer: false,
      deviceMemory: 4,
    });
    expect(q.particles).toBeLessThan(300);
  });
});
