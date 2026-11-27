import { FRAME_KEYS } from "./constants.js";

/**
 * The frame's address leading to an address the server's markup spells:
 * that address as the story's `query`, the frame's own parameters kept.
 * Story-only.
 */
export default function spellFrameAddress(href: string, search: string): URL {
  const url = new URL(href);
  for (const key of [...url.searchParams.keys()]) {
    if (!FRAME_KEYS.includes(key)) url.searchParams.delete(key);
  }
  url.searchParams.set("query", search.replace(/^\?/, ""));
  return url;
}
