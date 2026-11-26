/**
 * The address a no-scripts story renders, from the frame's own `query`.
 * Story-only.
 */
export default function readFrameQuery(fallback: string): string {
  return new URLSearchParams(window.location.search).get("query") ?? fallback;
}
