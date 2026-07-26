# Biotite Solutions — biotite.ai

Premium marketing site for Biotite Solutions, a custom AI systems studio.
Static Astro site with a signature Three.js visual (“the Biotite Core”):
a stack of cleaved mineral sheets — biotite is a mica that splits into thin
crystalline layers — with silver edge light, garnet internal energy, and fine
drifting particles, driven by scroll and pointer.

## Stack

| Layer     | Choice                                             |
| --------- | -------------------------------------------------- |
| Framework | Astro 5 (fully static output, zero JS by default)  |
| Visual    | Three.js, custom GLSL shaders (no post-processing) |
| Fonts     | Instrument Serif / Instrument Sans / IBM Plex Mono (self-hosted via Fontsource) |
| Tests     | Vitest (motion/quality utilities)                   |
| Hosting   | GitHub Pages via Actions, custom domain `biotite.ai` |

The Build Guide suggested Nuxt or Next; Astro was chosen deliberately: the
site is entirely static content targeted at GitHub Pages, has no client-side
app state, and Astro emits semantic zero-JS HTML with the WebGL experience
loaded as a progressive enhancement. The architectural principles from the
guide are all preserved (semantic DOM content, one persistent canvas,
scroll/pointer-driven scene, complete non-WebGL fallback).

## Commands

```sh
bun install        # install dependencies
bun run dev        # dev server at localhost:4321
bun run build      # static build to dist/
bun run preview    # serve the built site
bun run test       # vitest unit tests
```

(`npm`/`pnpm` work equally well; nothing is Bun-specific.)

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which tests,
builds, and deploys `dist/` to GitHub Pages.

One-time setup:

1. In the GitHub repo: **Settings → Pages → Source: GitHub Actions**.
2. `public/CNAME` already pins the custom domain `biotite.ai`.
3. In Cloudflare DNS, point `biotite.ai` at GitHub Pages
   (apex A records `185.199.108.153 … 185.199.111.153` and/or a `www`
   CNAME to `<user>.github.io`), then enable **Enforce HTTPS** in the Pages
   settings once the certificate is issued.

## Editing content

All copy that changes regularly lives in two typed data files:

- `src/data/site.ts` — site settings, navigation, contact/social routes,
  the six services, and the five-stage engagement process.
- `src/data/caseStudies.ts` — the portfolio. Each case study is one object
  (slug, title, anonymized client, industry, summary, challenge / approach /
  solution / outcomes paragraphs, services, technologies, `featured` flag,
  and `publicationRestrictions` documenting what is currently withheld).
  Adding a project = adding an object; the work index, homepage, sitemap,
  and case-study page generate from it.

Page-level copy (hero, positioning, principles, contact) lives in the
corresponding file under `src/pages/`. The flat data model is deliberately
Sanity-shaped so a later CMS migration is mechanical.

Case studies fall back to original geometric SVG motifs (`CasePlate.astro`,
variants `strata / flow / lens / lattice / index`). Approved projects can
instead provide real cover media, outcome metrics, and an evidence gallery
through the same data model.

## The WebGL experience

- `src/scripts/experience.ts` — loader; skips entirely (leaving a static
  poster rendered from the live Core) when the visitor prefers reduced motion, has data-saver on,
  or lacks WebGL. Three.js is only downloaded when it will be used.
- **Opening fly-through**: the homepage begins with the artifact alone at
  full screen; scrolling carries the camera toward the stack, the layers
  cleave open into a corridor, the camera passes between them, and a
  masked cut hands over to the standard hero where the artifact re-forms.
  The intro stage (`[data-intro]`, 180svh with its final viewport shared by
  the hero) is hidden unless the WebGL scene mounts while the visitor is at
  the top of the page — reduced motion, no-JS, no-WebGL, and mid-page loads
  all land directly on the hero. The full fly-through runs once per tab
  session. Choreography lives in `introChoreography()` (`motion.ts`), fully
  unit-tested.
- `src/webgl/core.ts` — scene: layered sheet geometry with flat-facet
  shading via screen-space derivatives, per-facet tonal variation, fresnel
  silver edges with a faint spectral sheen; a molten garnet "heart" and
  billboard halo inside the stack; a fullscreen atmosphere pass (gradient +
  ember haze that follows the core); three particle depth layers (far
  starfield, drifting dust, rising embers); damped pointer parallax and
  hand-held camera sway; scroll-driven layer separation (assembled → open
  through the middle sections → settled by the end); UnrealBloom
  post-processing on high-tier desktops only.
- `src/scripts/motion.ts` — pure, unit-tested helpers (separation curve,
  canvas presence, adaptive quality tiers, damping).

Performance guardrails: DPR capped (2 desktop / 1.5 constrained), reduced
layer/particle counts on small or low-memory devices, bloom disabled below
the high quality tier, rendering paused on hidden tabs, single rAF loop.

DOM-side finish: site-wide film grain + vignette veil, magnetic buttons on
fine pointers, and a homepage section-progress rail of six mineral sheets
echoing the logo mark (all disabled or inert under reduced motion).

## Accessibility

Semantic landmarks and heading order, skip link, keyboard-accessible mobile
nav (Escape closes), visible focus states, `prefers-reduced-motion` disables
reveals and the animated canvas, all information available without WebGL or
JavaScript, descriptive titles/meta/canonical/OG on every page.

## Assumptions and open content gaps

Recorded per the brief; nothing below is published as fact on the site.

- **Anonymized portfolio.** No client names, logos, quotes, screenshots, or
  metrics were approved, so case studies use industry descriptors and
  qualitative outcomes only. Each record's `publicationRestrictions` notes
  what is withheld. Swap in real names/media once approvals exist.
- **Case-study specifics** (challenge/approach framing) are restrained
  extrapolations from the supplied project list; review before launch.
- **No contact form**: no form destination was specified, so the contact
  page routes to Calendly (primary) and LinkedIn/YouTube (secondary).
  A form can be added later with any endpoint service.
- **Founder presentation**: the About page names Joe Samara as founder,
  based on the supplied links; adjust if a team page is preferred.
- **Hero copy** was drafted from the positioning document (“custom AI
  systems studio … working systems, not prototypes”). Marked for review.
- **Privacy page** assumes no analytics; update it when analytics are added.
- **Fonts** were unchosen in the brief; Instrument Serif/Sans + IBM Plex
  Mono were selected for a premium editorial-technical voice.
- **Motion intensity** was tuned to the requested 4/10: one signature
  visual, damped interactions, no scroll hijacking, short reveals.
