/**
 * Case-study content model.
 *
 * Client names are anonymized pending written approval; no metrics, quotes,
 * or results appear here that were not supplied by Biotite. Outcomes are
 * described qualitatively. `publicationRestrictions` records what is currently
 * withheld so future updates are deliberate.
 *
 * `plate` selects the abstract art-directed fallback cover (see
 * CasePlate.astro). Approved projects can replace it with `coverImage` and
 * add a metrics/evidence gallery without changing the page template.
 */

export interface CaseStudy {
  slug: string;
  title: string;
  anonymizedClientName: string;
  industry: string;
  shortSummary: string;
  services: string[];
  technologies: string[];
  challenge: string[];
  approach: string[];
  solution: string[];
  outcomes: string[];
  plate: "strata" | "flow" | "lens" | "lattice" | "index";
  coverImage?: string;
  coverAlt?: string;
  metrics?: Array<{ value: string; label: string }>;
  mediaTitle?: string;
  media?: Array<{ src: string; alt: string; caption: string }>;
  featured: boolean;
  publicationRestrictions: string;
}

export const caseStudies: CaseStudy[] = [
  {
    slug: "workforce-intelligence-dashboard",
    title: "A live workforce planning view for the executive committee",
    anonymizedClientName: "Biotech company",
    industry: "Biotech",
    shortSummary:
      "A custom workforce planning and talent dashboard that pulls live from HiBob and Greenhouse, giving the executive committee one current view of the organization.",
    services: ["Internal applications", "Data pipelines & integrations"],
    technologies: ["React", "Node.js", "TypeScript", "HiBob API", "Greenhouse API"],
    challenge: [
      "The executive committee needed to reason about workforce planning — headcount, hiring pipeline, and how the organization was actually shaped — but the underlying data lived in separate systems: HR records in HiBob, recruiting activity in Greenhouse.",
      "Assembling a coherent picture meant manual exports and reconciliation. By the time a snapshot reached a leadership discussion, it described the past, and questions raised in the room couldn't be answered in the room.",
    ],
    approach: [
      "We started from the decisions the executive committee actually makes, not from the data that happened to be available — working backwards from their planning discussions to the views those discussions require.",
      "Rather than another export-and-reconcile process, we designed a system that connects directly to both platforms and treats them as live sources of record, so no one maintains a copy of the truth by hand.",
    ],
    solution: [
      "Biotite designed and built a custom workforce planning and talent dashboard: a React and TypeScript application on a Node.js backend that integrates with HiBob and Greenhouse in real time.",
      "The dashboard brings workforce and recruiting data into one place, structured around the questions leadership asks — how the organization is composed, how hiring is progressing, and how the two relate — with views shaped for an executive audience rather than an HR operations one.",
    ],
    outcomes: [
      "The executive committee now works from a single live view of workforce data instead of assembled snapshots.",
      "Planning conversations start from current numbers, and the manual export-reconcile-format cycle is no longer part of preparing them.",
    ],
    plate: "strata",
    featured: true,
    publicationRestrictions:
      "Client name, screenshots, and quantitative results withheld pending approval.",
  },
  {
    slug: "operations-agent-system",
    title: "Custom agents that execute recurring workflows",
    anonymizedClientName: "Technology company",
    industry: "Technology",
    shortSummary:
      "Custom AI agents, built in TypeScript and Python, that automate recurring jobs end-to-end with explicit guardrails and human review where it matters.",
    services: ["Custom AI agents", "Data pipelines & integrations"],
    technologies: ["TypeScript", "Python", "LLM APIs", "Third-party integrations"],
    challenge: [
      "Recurring, well-defined jobs were consuming skilled people's time: work that followed a knowable procedure but required reading context, making judgment calls within bounds, and acting across several tools.",
      "Off-the-shelf automation couldn't hold the whole procedure, and generic AI assistants could draft text but couldn't be trusted to carry a task through to completion.",
    ],
    approach: [
      "We treat agents as software systems, not prompts: each workflow is decomposed into steps with explicit inputs, permitted actions, and failure behavior, so the agent's autonomy is a design decision rather than an accident.",
      "Human oversight is part of the architecture. The agents escalate what they shouldn't decide, and their work is logged so it can be reviewed and audited.",
    ],
    solution: [
      "Biotite built custom agent systems in TypeScript and Python that execute the client's recurring workflows against their real tools — reading incoming work, taking the bounded actions the procedure calls for, and handing off cleanly when a case falls outside their scope.",
      "The agents run as production services with defined permissions, structured logging, and evaluation against real historical cases before they were given live work.",
    ],
    outcomes: [
      "Recurring workflows that previously required hands-on attention now run through the agent system, with people reviewing exceptions rather than executing every case.",
      "The client retained control over the judgment calls that matter, with a clear record of what the agents did and why.",
    ],
    plate: "flow",
    featured: true,
    publicationRestrictions:
      "Client name, workflow specifics, and quantitative results withheld pending approval.",
  },
  {
    slug: "vision-analysis-pipeline",
    title: "Image analysis pipelines for production imagery",
    anonymizedClientName: "Fortune 100 company",
    industry: "Manufacturing",
    shortSummary:
      "An OpenCV analysis system that measures inkjet droplets across six colors, rejects dust and scratches, and turns hundreds of test strips into decision-ready data.",
    services: ["Computer vision & multimodal pipelines"],
    technologies: ["Python", "OpenCV", "Image processing"],
    challenge: [
      "The company needed to compare how six ink formulations spread after landing on a test surface. Each printed droplet was roughly 150 microns across, and a reliable decision required measuring a meaningful sample rather than inspecting a handful by eye.",
      "Manual measurement would have taken weeks. Generic image tools measured one droplet at a time, while dust and scratches were visually similar enough to droplets to skew a conventional contour analysis.",
    ],
    approach: [
      "The pipeline first located the bounded test strip, divided it into six color regions with engineered margins, and used OpenCV contour analysis to identify plausible droplets and draw bounding circles around them.",
      "To remove false positives, we developed a “Smaller Neighbor” algorithm. It compared nearby detections and discarded the smaller candidate, using the droplets' regular spacing to separate real printed dots from dust and scratches.",
    ],
    solution: [
      "The resulting Python application processes each high-resolution test image, isolates all six ink colors, filters the detections, calculates mean diameters, and exports both annotated evidence and structured measurements.",
      "It ran on a laptop and processed hundreds of test strips, giving the engineering team a repeatable analysis they could inspect rather than an opaque model output.",
    ],
    outcomes: [
      "A task estimated to take weeks was reduced to minutes, saving more than $33,000 per year in labor.",
      "The measurements showed that the cyan ink spread substantially more than the other formulations, giving the company evidence to replace it before production use.",
    ],
    plate: "lens",
    coverImage: "/work/vision-analysis/dots-refined.webp",
    coverAlt:
      "Annotated ink-drop analysis after the smaller-neighbor filtering algorithm",
    metrics: [
      { value: "$33K+", label: "annual labor savings" },
      { value: "Weeks → minutes", label: "analysis cycle" },
      { value: "Hundreds", label: "test strips processed on a laptop" },
    ],
    mediaTitle: "From noisy detections to decision-ready measurements",
    media: [
      {
        src: "/work/vision-analysis/dots-filtered.webp",
        alt: "Initial contour filtering with dust and scratch false positives still selected",
        caption: "Initial contour filtering",
      },
      {
        src: "/work/vision-analysis/dots-refined.webp",
        alt: "Refined droplet detections after applying the smaller-neighbor algorithm",
        caption: "After the Smaller Neighbor algorithm",
      },
      {
        src: "/work/vision-analysis/dot-diameters.webp",
        alt: "Bar chart comparing mean dot diameters across six ink colors",
        caption: "Mean dot diameters revealed the cyan outlier",
      },
    ],
    featured: true,
    publicationRestrictions:
      "Client name and raw production imagery withheld; derived analysis visuals and results supplied for publication.",
  },
  {
    slug: "rag-knowledge-system",
    title: "A retrieval system over proprietary knowledge",
    anonymizedClientName: "Technology company",
    industry: "Technology",
    shortSummary:
      "A retrieval-augmented generation pipeline that answers questions from the client's own documents — grounded, cited, and evaluated before rollout.",
    services: ["RAG & knowledge systems"],
    technologies: ["Python", "LLM APIs", "Vector search", "Evaluation harness"],
    challenge: [
      "Institutional knowledge lived across documents that were technically accessible but practically unsearchable: finding an answer meant knowing which document held it and who to ask.",
      "A generic chatbot wasn't an option — answers had to come from the client's actual material, and wrong-but-confident answers would be worse than none.",
    ],
    approach: [
      "We build RAG systems as measured pipelines, not demos: ingestion and indexing tuned to the client's document types, retrieval evaluated against a test set drawn from real questions, and answers that cite their sources.",
      "Grounding is enforced structurally — the system answers from retrieved material and says so when the material isn't there, rather than improvising.",
    ],
    solution: [
      "Biotite built a retrieval-augmented pipeline over the client's proprietary documents: ingestion, chunking, and indexing shaped to how the material is actually written, with retrieval and answer synthesis that returns cited passages alongside every response.",
      "An evaluation harness measures retrieval and answer quality against known cases, so changes to the system are tested rather than vibes-checked.",
    ],
    outcomes: [
      "Questions that previously routed through specific people or manual document searches can now be answered directly from the knowledge base, with citations to verify.",
      "The client can see how well the system performs — and how changes affect it — instead of trusting it blindly.",
    ],
    plate: "lattice",
    featured: false,
    publicationRestrictions:
      "Client name, document domains, and quantitative results withheld pending approval.",
  },
  {
    slug: "video-intelligence-tagging",
    title: "AI-assisted tagging for a company video library",
    anonymizedClientName: "Technology company",
    industry: "Technology",
    shortSummary:
      "An AI-assisted data tagging pipeline that turns an untagged company video library into a structured, searchable asset.",
    services: ["Computer vision & multimodal pipelines", "Data pipelines & integrations"],
    technologies: ["Python", "Multimodal models", "Media processing"],
    challenge: [
      "The company had accumulated a substantial video library, but the material was effectively opaque: finding a specific moment, topic, or asset meant scrubbing through footage or relying on whoever remembered it.",
      "Tagging the library by hand was the obvious fix and the one nobody would ever finish.",
    ],
    approach: [
      "We use AI to do the volume work and structure to make it trustworthy: model-generated tags conform to a defined vocabulary rather than free-form text, so the output is queryable data, not more unstructured content.",
      "The pipeline is designed for review — tags are attributable to their source and correctable, so the library gets better with use instead of drifting.",
    ],
    solution: [
      "Biotite built an AI-assisted tagging pipeline that processes the video library and produces structured metadata: what the material contains, organized against a controlled vocabulary designed with the client.",
      "The result is a searchable index over the library, maintained by the pipeline as new material arrives.",
    ],
    outcomes: [
      "A video library that was searchable only through people's memory is now a structured, queryable asset.",
      "New material enters the library tagged, so the index stays current without a standing manual effort.",
    ],
    plate: "index",
    featured: false,
    publicationRestrictions:
      "Client name, footage, vocabulary specifics, and quantitative results withheld pending approval.",
  },
];

export const featuredCaseStudies = caseStudies.filter((c) => c.featured);
