PROJECT: BIOTITE SOLUTIONS IMMERSIVE AGENCY WEBSITE

Please design and build a premium website for Biotite Solutions, an AI agency.

The site should take inspiration from the craft and interaction principles of
BlueYard’s website, but it should not reproduce BlueYard’s identity, copy,
layout, orb, graphics, or visual assets. The goal is a similarly polished,
immersive experience with an original Biotite-specific visual system.

Treat this brief as a direction rather than a rigid specification. Use the
provided company information and portfolio projects as the source of truth.
Where a minor detail is missing, choose a restrained, credible default and
document the assumption. Do not invent client quotations, performance metrics,
project results, certifications, partnerships, or technical claims.

DESIGN INTENT

The website should feel:

- Technically sophisticated
- Precise and intentional
- Forward-looking
- Premium without feeling ornamental
- Experimental without compromising usability
- Appropriate for serious business buyers
- Distinct from generic AI websites

Avoid generic AI imagery such as humanoid robots, glowing brains, circuit-board
heads, random binary code, stock images of people touching screens, and a
generic purple particle background.

The design should rely on:

- Strong typography
- A disciplined grid
- Substantial negative space
- Controlled transitions
- One recognizable interactive visual system
- Detailed case studies
- Clear conversion paths

BLUEYARD-INSPIRED PRINCIPLES

BlueYard’s public technology references suggest a structure based on Nuxt/Vue,
WebGL, Three.js, fluid or particle effects, cursor interaction, and a
content-management layer. Its visual experience appears to combine normal DOM
content with a persistent GPU-rendered canvas.

Use the same general architectural principle:

1. Keep text, navigation, links, buttons, forms, and case-study content in
   semantic HTML.
2. Use one persistent full-screen WebGL canvas for the signature visual.
3. Allow scroll position and pointer movement to control the WebGL scene.
4. Use the graphics as a branded narrative device, not as decoration behind
   every element.
5. Preserve a complete, readable version of the website when WebGL is disabled.

SUGGESTED STACK

A stack close to the reported BlueYard architecture would be:

- Current stable Nuxt
- Vue
- TypeScript
- Three.js
- TresJS where it simplifies Vue integration, if useful
- Custom GLSL shaders for the signature material and deformation
- GSAP and ScrollTrigger for coordinated animation
- Lenis only if smooth scrolling materially improves the experience
- Sanity for editable portfolio and site content
- Vercel, Netlify, or an equivalent modern deployment platform

Direct Three.js may be preferable for the most custom shader and render-loop
work. TresJS may be used for lifecycle management and ordinary scene
components. Avoid adding abstractions that make performance or debugging harder.

If the project environment is substantially stronger in React, an equivalent
implementation could use Next.js, React Three Fiber, Drei, Three.js, and GSAP.
Choose one ecosystem; do not combine Nuxt and Next.js.

A CMS is optional for the initial prototype. If Biotite has only a small number
of projects and changes them infrequently, structured local content may be
simpler. The content model should make a later Sanity migration straightforward.

PROPOSED INFORMATION ARCHITECTURE

Consider the following structure:

1. Homepage
2. Work index
3. Individual case-study pages
4. Services
5. About
6. Contact
7. Privacy
8. Custom 404 page

The homepage can be a continuous, cinematic overview. Case-study pages should
be more editorial and readable, with enough conventional structure for search,
sharing, and business evaluation.

POSSIBLE HOMEPAGE SEQUENCE

1. Opening / hero
   - Biotite Solutions name
   - Strong positioning headline
   - Short explanation
   - Primary call to action
   - Interactive Biotite visual

2. Selected work
   - A small number of featured projects
   - Clear project outcomes
   - Industry and service labels
   - Links to complete case studies

3. Services
   - Three to five clearly differentiated capabilities
   - One short business-oriented explanation per capability
   - Relevant project proof

4. How Biotite works
   - Discovery
   - System design
   - Implementation
   - Evaluation
   - Deployment or ongoing improvement
   Adjust these stages to the supplied operating model.

5. Proof
   - Metrics
   - Testimonials
   - Client logos
   - Technical credentials
   Use only approved material.

6. About
   - Agency point of view
   - Team or founder information
   - Principles

7. Final call to action
   - A direct invitation to discuss a specific business problem
   - Contact or scheduling route

SIGNATURE VISUAL DIRECTION

Explore an original “Biotite Core” rather than recreating BlueYard’s sphere.

The core might be a layered crystalline or mineral-like structure representing:

- Layers of intelligence
- Data becoming structured
- Separate systems becoming connected
- Raw business processes becoming engineered AI products
- Technical depth beneath a simple interface

Possible visual ingredients:

- Layered, offset planes
- Crystalline facets
- Translucent or reflective materials
- Fine particles flowing between layers
- Subtle internal light
- Procedural surface variation
- Controlled refraction or iridescence
- A neural or data field visible inside the structure

The object could remain present throughout much of the homepage and transition
between states. It does not need to be physically realistic.

Possible section states:

- Hero: the object slowly assembles from layers
- Strategy: layers align and simplify
- Automation: particles travel along defined paths
- Custom software: facets open into modular structures
- Data: an internal network becomes visible
- Work: the object separates into project-linked fragments
- Contact: the system resolves into a stable final form

Use brand colors as illumination, highlights, internal energy, and section
transitions rather than applying every color equally across the page.

INTERACTION

Consider:

- Slow pointer parallax
- Pointer-velocity-based material distortion
- Local attraction or repulsion of particles
- Scroll-driven object rotation and morphing
- Section-specific camera positions
- Subtle magnetic behavior on links
- Carefully timed text reveals
- Smooth transitions between homepage sections
- A visible but understated section-progress indicator

Motion should use damping and interpolation so it feels weighted. Avoid mapping
the pointer directly to object movement without smoothing.

Do not hijack scrolling or make users drag through the entire site. Normal
scrolling, keyboard navigation, browser history, and direct links should remain
predictable.

WEBGL IMPLEMENTATION

A possible architecture:

- One fixed or sticky canvas
- One requestAnimationFrame loop
- A scene-state controller
- Section progress values derived from document scroll
- Shader uniforms for:
  - time
  - pointer position
  - pointer velocity
  - scroll progress
  - active section
  - section transition amount
  - theme or palette state
  - reduced-motion state
- A small number of reusable scene states rather than a separate heavy scene
  for every section

Possible file organization:

components/
  dom/
    SiteHeader.vue
    HeroSection.vue
    WorkSection.vue
    ServicesSection.vue
    ProcessSection.vue
    AboutSection.vue
    ContactSection.vue
  webgl/
    ExperienceCanvas.vue
    BiotiteCore.vue
    ParticleField.vue
    SceneLighting.vue

composables/
  usePointerVelocity.ts
  useSectionProgress.ts
  useReducedMotion.ts
  useAdaptiveQuality.ts

webgl/
  shaders/
    biotite.vert.glsl
    biotite.frag.glsl
    particles.vert.glsl
    particles.frag.glsl
  materials/
  geometry/
  controllers/

content/
  case-studies/
  services/
  site-settings/

The precise structure may be adjusted to fit the chosen framework.

SHADER AND GRAPHICS APPROACH

Start with an achievable visual rather than implementing a full fluid solver
immediately.

A strong first version could use:

- A custom geometry or layered planes
- Vertex displacement using procedural noise
- A custom fragment shader
- Fresnel-style edge treatment
- Matcap, environment-map, or physically based highlights
- Instanced particles or Three.js Points
- Pointer-driven distortion
- Scroll-driven shader uniform transitions

Once the basic visual direction is successful, consider a low-resolution
framebuffer or FBO simulation for fluid-like trails or particle movement.

A Houdini or Blender pipeline is optional. Use it only if a pre-baked,
art-directed simulation is materially better than a procedural browser
implementation. Complex pre-baked motion could be encoded as textures,
morph targets, point-cache data, or optimized glTF assets.

Do not begin by creating tens of thousands of individually managed JavaScript
objects. Use Points, instancing, buffer geometry, shader calculations, or
pre-baked textures.

PORTFOLIO PRESENTATION

Create a structured case-study model similar to:

- slug
- title
- client
- anonymizedClientName
- industry
- shortSummary
- challenge
- approach
- solution
- services
- technologies
- outcomes
- testimonial
- heroMedia
- gallery
- liveUrl
- featured
- publicationRestrictions

The work index might offer understated filters by service or industry. It
should not resemble a generic card template.

On the homepage, feature only the strongest projects. Each project preview
could include:

- Project name
- One-line problem or outcome
- Service category
- Industry
- A still image or short muted video
- A clear case-study link

Individual case studies could follow:

1. Project introduction
2. Problem
3. Constraints
4. Biotite’s role
5. System or solution
6. Selected visuals
7. Technical approach
8. Outcomes
9. Related project
10. Contact call to action

Use standard images and optimized video for project demonstrations. Avoid GIFs
except for unusually small, simple assets. Video should have a poster image and
should not block page rendering.

CONTENT AND COPY

Prefer plain, confident language over vague statements about “unlocking the
power of AI.”

Lead with business problems, engineered systems, and measurable outcomes.

For example, copy should explain:

- What was automated
- What was integrated
- What decisions the system supports
- How reliability is evaluated
- How humans remain involved
- What changed for the client

Avoid claims that cannot be supported.

RESPONSIVE BEHAVIOR

Design mobile intentionally rather than shrinking the desktop site.

Possible mobile treatment:

- Simplified geometry
- Fewer particles
- Lower render resolution
- Reduced post-processing
- Touch-based parallax or slow autonomous movement
- Static poster fallback on low-power devices
- Conventional stacked portfolio content
- Always-visible primary navigation and contact route

The mobile experience does not need every desktop effect. It should preserve
the same concept, typography, and narrative.

ACCESSIBILITY

Please include:

- Semantic headings and landmarks
- Keyboard-accessible navigation
- Visible focus states
- Appropriate contrast
- Descriptive alternative text
- Form labels and error messages
- Reduced-motion handling
- A non-WebGL fallback
- No information communicated only through animation
- No required audio
- Screen-reader-friendly case studies
- Skip navigation support where appropriate

When reduced motion is requested, disable continuous particle movement,
pointer distortion, elaborate transitions, and smooth-scroll behavior. A
static or lightly animated visual can remain.

PERFORMANCE

Treat performance as part of the design.

Consider:

- Dynamically loading the WebGL experience on the client
- Showing useful HTML before the scene finishes loading
- Capping device pixel ratio
- Adaptive quality based on viewport and device capability
- Pausing rendering when the tab is hidden
- Reducing or pausing rendering when the canvas is not relevant
- Instancing and buffer geometry
- Compressed textures
- Optimized glTF assets
- Lazy-loaded case-study media
- Responsive images
- Avoiding unnecessary post-processing passes
- Disposing of textures, geometry, and listeners correctly
- Testing on a mid-range phone and an integrated-GPU laptop

Do not display a long decorative loading screen merely to conceal excessive
asset weight. The visitor should be able to read and navigate while optional
visual assets load.

SEO AND SOCIAL SHARING

Keep all important copy in server-rendered or statically generated HTML.

Include:

- Unique page titles
- Meta descriptions
- Canonical URLs
- Open Graph metadata
- Social preview images
- Structured data where appropriate
- Sitemap
- Robots configuration
- Descriptive project URLs
- Proper heading hierarchy

The canvas should enhance the site but should not contain essential indexable
content.

CONTENT MANAGEMENT

If Sanity is used, consider schemas for:

- Site settings
- Services
- Case studies
- Testimonials
- Clients
- Team members
- Insights
- Navigation
- SEO metadata

Provide sensible validation and image metadata. Keep highly technical animation
configuration in code unless the client genuinely needs to edit it.

BUILD SEQUENCE

A practical sequence could be:

Phase 1: Content and structure
- Inspect the supplied portfolio projects and assets
- Create a content inventory
- Establish the case-study model
- Draft a sitemap
- Identify missing claims, media, and permissions

Phase 2: Art direction
- Create typography and spacing tokens
- Define the grid
- Develop two or three visual studies for the Biotite Core
- Select one motion language
- Establish desktop and mobile compositions

Phase 3: DOM prototype
- Build the complete semantic website without WebGL
- Add navigation, case studies, forms, and responsive layouts
- Confirm that the content hierarchy works independently

Phase 4: WebGL prototype
- Build the Biotite Core in an isolated route or component
- Test pointer response, scroll states, and mobile degradation
- Establish a rendering and asset budget

Phase 5: Integration
- Connect section progress to scene state
- Coordinate DOM transitions and WebGL transitions
- Integrate portfolio data and CMS
- Add route and page transitions only where useful

Phase 6: Quality work
- Accessibility review
- Performance profiling
- Device and browser testing
- Metadata and analytics
- Contact-form testing
- Error and fallback states
- Visual polish

DELIVERABLES

Please produce:

- Working responsive website
- Reusable component system
- Original WebGL visual implementation
- Structured portfolio content
- Case-study templates
- CMS configuration, if selected
- Environment-variable example file without secrets
- Setup and deployment documentation
- Content editing instructions
- Fallback and reduced-motion states
- Basic test coverage for important interactions
- A concise record of assumptions and remaining content gaps

QUALITY BAR

The finished website should still feel premium with the canvas disabled. The
interactive visual should deepen the identity rather than compensate for weak
copy or layout.

Prefer:

- One excellent visual idea over many disconnected effects
- Measured motion over constant motion
- Clear project outcomes over technical buzzwords
- Native scrolling over scroll hijacking
- Short, purposeful transitions over long loading sequences
- Original Biotite art direction over imitation of BlueYard

Before considering the project complete, verify that a visitor can quickly
answer:

1. What does Biotite Solutions do?
2. Who is it for?
3. What has Biotite built?
4. What business results did that work produce?
5. Why is Biotite credible?
6. How can the visitor start a conversation?
