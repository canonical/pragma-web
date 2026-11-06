import type { Listing } from "./types.js";

/**
 * List the ids of a listing anew: a selector that builds its value, so
 * every call answers a new array.
 */
export default function listIds(listing: Listing): readonly number[] {
  return [...listing.ids];
}
