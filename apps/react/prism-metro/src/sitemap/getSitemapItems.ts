import type { SitemapItem } from "@canonical/react-ssr/renderer";

/**
 * The sitemap's entries: the index of each lens. The entity and term pages
 * are reached from those indexes, so the sitemap lists none of them.
 *
 * @returns The entries, relative to the sitemap's base URL.
 */
export default async function getSitemapItems(): Promise<SitemapItem[]> {
  return [
    { loc: "/stations", changefreq: "weekly", priority: 1.0 },
    { loc: "/lines", changefreq: "weekly", priority: 0.8 },
    { loc: "/definitions", changefreq: "monthly", priority: 0.6 },
  ];
}
