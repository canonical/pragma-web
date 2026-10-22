import { MESSAGES } from "#i18n";

/**
 * Compose a page's own title into the document title.
 *
 * Every page names only itself (`<Head title="Stations" />`) and the site
 * name is appended here, once. The client and the server entries pass the
 * same function to `HeadProvider`, through `Shell`, so the server-rendered
 * title matches the one the client renders after hydration.
 *
 * @param pageTitle - The page's own title.
 * @returns The document title.
 */
export default function formatDocumentTitle(pageTitle: string): string {
  return `${pageTitle} — ${MESSAGES["site.name"]}`;
}
