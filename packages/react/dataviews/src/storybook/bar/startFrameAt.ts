import { FRAME_KEYS } from "./constants.js";

/**
 * Start the frame's address on a story's query, so a story that keeps its
 * query there starts from its own, whatever a story before it left.
 * Story-only.
 *
 * @note Impure: replaces the frame's history entry.
 */
export default function startFrameAt(query: string): void {
  const url = new URL(window.location.href);
  for (const key of [...url.searchParams.keys()]) {
    if (!FRAME_KEYS.includes(key)) url.searchParams.delete(key);
  }
  for (const [key, value] of new URLSearchParams(query)) {
    url.searchParams.append(key, value);
  }
  window.history.replaceState(null, "", url);
}
