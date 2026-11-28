/**
 * Compose a page's own title into the document title.
 *
 * Every page names only itself, and the application name is appended here,
 * once, so the name stays out of every message catalog.
 */
export default function formatDocumentTitle(pageTitle: string): string {
  return `${pageTitle} — Boilerplate`;
}
