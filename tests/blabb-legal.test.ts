import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = (relativePath: string) =>
  readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");

describe("Blabb legal publication", () => {
  it("keeps the public privacy policy complete and contactable", () => {
    const privacy = source("src/pages/blabb/privacy.astro");

    expect(privacy).toContain("Blabb Privacy Policy");
    expect(privacy).toContain("processed on the Android device");
    expect(privacy).toContain("Retention and deletion");
    expect(privacy).toContain("josephsamara00@gmail.com");
  });

  it("keeps the terms linked to the privacy policy", () => {
    const terms = source("src/pages/blabb/terms.astro");

    expect(terms).toContain("Blabb Terms of Use");
    expect(terms).toContain("Review before sending");
    expect(terms).toContain('href="/blabb/privacy/"');
    expect(terms).toContain("josephsamara00@gmail.com");
  });

  it("publishes both stable routes in the sitemap", () => {
    const sitemap = source("src/pages/sitemap.xml.ts");

    expect(sitemap).toContain('"/blabb/privacy/"');
    expect(sitemap).toContain('"/blabb/terms/"');
  });
});
