import type { Listing } from "./types.js";

/**
 * Create a listing for the value hook's suites, its lists new arrays on
 * every call, so two listings with equal lists never share one.
 */
export default function createListing({
  ids = [1, 2],
  other = [9],
  page = 1,
}: Partial<Listing> = {}): Listing {
  return { ids: [...ids], other: [...other], page };
}
