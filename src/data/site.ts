/**
 * Site-wide settings and shared content.
 *
 * This file is the single source of truth for contact routes, navigation,
 * services, and the engagement process. The shape is deliberately flat and
 * serializable so a later migration to Sanity (or another CMS) is a matter of
 * moving records, not rewriting components.
 */

export const site = {
  name: "Biotite Solutions",
  shortName: "Biotite",
  domain: "https://biotite.ai",
  tagline: "Custom AI systems, engineered for production",
  description:
    "Biotite Solutions is a custom AI systems studio. We design and build AI agents, knowledge systems, vision pipelines, and decision-support applications that run inside real business operations.",
  calendly: "https://calendly.com/joesamara/introductory-call",
  social: {
    youtube: "https://www.youtube.com/@Joe-Samara",
    linkedin: "https://www.linkedin.com/in/joesamara/",
  },
} as const;

export const nav = [
  { label: "Work", href: "/work/" },
  { label: "Services", href: "/services/" },
  { label: "About", href: "/about/" },
  { label: "Contact", href: "/contact/" },
] as const;

export interface Service {
  id: string;
  title: string;
  summary: string;
  detail: string;
  proofSlug?: string;
  proofLabel?: string;
}

export const services: Service[] = [
  {
    id: "agents",
    title: "Custom AI agents",
    summary:
      "Agents that carry out defined workflows — with guardrails, audit trails, and clear points of human review.",
    detail:
      "We build agent systems in TypeScript and Python that do real work: triaging, drafting, reconciling, routing, and executing multi-step processes against your actual tools. Every agent is scoped to explicit permissions, evaluated against real cases before rollout, and designed so people stay in control of the decisions that matter.",
    proofSlug: "operations-agent-system",
    proofLabel: "Operations agents for a technology company",
  },
  {
    id: "knowledge",
    title: "RAG & knowledge systems",
    summary:
      "Retrieval systems that give your teams grounded answers from proprietary documents and data.",
    detail:
      "We design retrieval-augmented pipelines end to end — ingestion, chunking, indexing, retrieval, and answer synthesis with citations — tuned against evaluation sets built from your own material, so the system is measured before anyone depends on it.",
    proofSlug: "rag-knowledge-system",
    proofLabel: "Internal knowledge system over engineering docs",
  },
  {
    id: "vision",
    title: "Computer vision & multimodal pipelines",
    summary:
      "Image and video analysis pipelines that turn visual material into structured, searchable data.",
    detail:
      "From OpenCV-based image analysis to AI-assisted tagging of video libraries, we build pipelines that process visual data at volume and hand results to the systems and people who act on them.",
    proofSlug: "vision-analysis-pipeline",
    proofLabel: "Image analysis for a manufacturing operation",
  },
  {
    id: "applications",
    title: "Internal applications & dashboards",
    summary:
      "Decision-support interfaces that put live operational data in front of the people who steer the business.",
    detail:
      "We build production web applications — React, Node.js, TypeScript — that sit on top of your systems of record and make them legible: workforce planning views, operational dashboards, and internal tools shaped around how your leadership actually makes decisions.",
    proofSlug: "workforce-intelligence-dashboard",
    proofLabel: "Workforce planning dashboard for an executive committee",
  },
  {
    id: "integrations",
    title: "Data pipelines & integrations",
    summary:
      "The connective tissue: real-time integrations with the systems your business already runs on.",
    detail:
      "AI systems are only as good as the data reaching them. We build the backend infrastructure — APIs, sync pipelines, third-party integrations such as HiBob and Greenhouse — that keeps custom systems accurate and current without manual exports.",
    proofSlug: "workforce-intelligence-dashboard",
    proofLabel: "Live HR-systems integration",
  },
  {
    id: "enablement",
    title: "AI enablement & training",
    summary:
      "Hands-on education that helps your employees use AI well — judgment included, hype excluded.",
    detail:
      "Alongside the systems we build, we train the teams who use them: practical working sessions on where AI genuinely helps in your workflows, where it fails, and how to work with it productively and safely.",
  },
];

export interface ProcessStage {
  index: string;
  title: string;
  duration?: string;
  description: string;
}

export const process: ProcessStage[] = [
  {
    index: "01",
    title: "Introductory call",
    description:
      "A direct conversation about the problem you're trying to solve. We'll tell you plainly whether we're the right fit — and if we're not, we'll say so.",
  },
  {
    index: "02",
    title: "Working plan",
    description:
      "If there's a fit, a follow-up session where we map your goals to a concrete plan: what we'll build, how it integrates with your systems, and how we'll know it's working.",
  },
  {
    index: "03",
    title: "Design & build",
    description:
      "We design the system and build it against your real data, tools, and constraints — in working software from the first weeks, not slideware.",
  },
  {
    index: "04",
    title: "Evaluate & harden",
    description:
      "Before anyone depends on the system, we test it against real cases, define where humans review its output, and make its reliability measurable.",
  },
  {
    index: "05",
    title: "Deploy & improve",
    description:
      "We ship to production, hand over documentation, and stay engaged. Typical engagements run three to six months; we're open to longer partnerships.",
  },
];
