/**
 * Whether a guide slug is lowercase kebab-case. A slug that is not makes the
 * URL a non-match, so the request falls through to the 404 page instead of
 * rendering.
 */
export default function isGuideSlug(slug: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
}
