import { describe, expect, it } from "vitest";
import {
  canvasOpacity,
  clamp01,
  damp,
  introChoreography,
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

describe("introChoreography", () => {
  it("starts held on the full artifact: camera far, layers closed", () => {
    const s = introChoreography(0);
    expect(s.cameraZ).toBe(11);
    expect(s.separation).toBeLessThan(0.1);
    expect(s.presence).toBe(1);
    expect(s.passed).toBe(false);
  });

  it("moves the camera monotonically forward through the stack", () => {
    let prev = Infinity;
    for (let p = 0; p <= 1.001; p += 0.05) {
      const z = introChoreography(p).cameraZ;
      expect(z).toBeLessThanOrEqual(prev + 1e-9);
      prev = z;
    }
  });

  it("opens the corridor before the camera reaches the layers", () => {
    // The flakes extend to roughly z ≈ +4.5 at intro scale; by the time the
    // camera crosses that front edge the stack must already be opening.
    const atFront = introChoreography(0.45);
    expect(atFront.cameraZ).toBeLessThan(5.5);
    expect(atFront.separation).toBeGreaterThan(0.8);
    // Fully open while the camera is inside the stack.
    const inside = introChoreography(0.62);
    expect(inside.separation).toBeGreaterThan(2.5);
    expect(Math.abs(inside.cameraZ)).toBeLessThan(4.5);
  });

  it("ducks the molten heart during the pass-through", () => {
    expect(introChoreography(0.7).heartIntensity).toBeLessThan(
      introChoreography(0).heartIntensity
    );
  });

  it("masks the exit cut with a presence dip, then recovers", () => {
    expect(introChoreography(0.75).presence).toBeLessThan(0.2);
    expect(introChoreography(1).presence).toBe(1);
  });

  it("cuts while the camera is still inside the stack", () => {
    const atCut = introChoreography(0.755);
    expect(atCut.cameraZ).toBeGreaterThan(-4.4);
    expect(atCut.cameraZ).toBeLessThan(0);
  });

  it("hands over to the main site after the cut", () => {
    expect(introChoreography(0.74).passed).toBe(false);
    expect(introChoreography(0.78).passed).toBe(true);
  });

  it("ends behind the stack, ready for the emergence", () => {
    expect(introChoreography(1).cameraZ).toBeLessThan(-4);
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
