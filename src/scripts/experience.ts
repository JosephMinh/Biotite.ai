/**
 * Entry point for the homepage WebGL experience. Purely progressive: if the
 * visitor prefers reduced motion, has data saving on, or lacks WebGL, the
 * static poster in the DOM simply stays. The Three.js bundle is only
 * downloaded when it will actually be used.
 */

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

export function mountExperience(): void {
  const container = document.querySelector<HTMLElement>("[data-experience]");
  if (!container) return;

  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const saveData =
    "connection" in navigator &&
    Boolean((navigator as { connection?: { saveData?: boolean } }).connection?.saveData);

  if (prefersReduced || saveData || !supportsWebGL()) return;

  import("../webgl/core")
    .then(({ createBiotiteCore }) => {
      createBiotiteCore(container);
    })
    .catch(() => {
      /* Poster remains; the site is fully usable without the canvas. */
    });
}
