import type { APIRoute } from "astro";
import { caseStudies } from "../data/caseStudies";
import { site } from "../data/site";

const staticPaths = [
  "/",
  "/work/",
  "/services/",
  "/about/",
  "/contact/",
  "/privacy/",
  "/blabb/privacy/",
  "/blabb/terms/",
];

export const GET: APIRoute = () => {
  const urls = [
    ...staticPaths,
    ...caseStudies.map((c) => `/work/${c.slug}/`),
  ]
    .map(
      (path) =>
        `  <url><loc>${site.domain}${path}</loc></url>`
    )
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml" },
  });
};
