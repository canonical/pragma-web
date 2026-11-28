import type { RequestHandler } from "./$types";

interface SitemapItem {
  readonly loc: string;
  readonly changefreq: "weekly" | "monthly" | "yearly";
  readonly priority: number;
}

/** Every known route; update the list as you add domains and routes. */
const items: readonly SitemapItem[] = [
  { loc: "/", changefreq: "weekly", priority: 1.0 },
  { loc: "/guides/router-core", changefreq: "monthly", priority: 0.8 },
  { loc: "/catalog", changefreq: "weekly", priority: 0.7 },
  { loc: "/contact", changefreq: "monthly", priority: 0.7 },
  { loc: "/dashboard", changefreq: "weekly", priority: 0.6 },
  { loc: "/dashboard/instances", changefreq: "weekly", priority: 0.5 },
  { loc: "/dashboard/settings", changefreq: "monthly", priority: 0.4 },
  { loc: "/account", changefreq: "monthly", priority: 0.5 },
  { loc: "/login", changefreq: "yearly", priority: 0.3 },
];

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export const GET: RequestHandler = ({ url }) => {
  const entries = items
    .map(
      (item) =>
        `  <url>\n    <loc>${escapeXml(new URL(item.loc, url.origin).href)}</loc>\n    <changefreq>${item.changefreq}</changefreq>\n    <priority>${item.priority}</priority>\n  </url>`,
    )
    .join("\n");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`,
    { headers: { "content-type": "application/xml; charset=utf-8" } },
  );
};
