import { GLOBAL_TIER } from "../../../../constants.js";

/**
 * Order two tiers as the catalog lists them: the global tier first, then
 * the rest alphabetically, and the tier of untiered components last.
 *
 * @param a - A tier's name.
 * @param b - Another tier's name.
 * @param untiered - The name the catalog gives the untiered components.
 * @returns A negative number when `a` comes first, a positive one when `b`
 *   does, and 0 for the same tier.
 */
export default function compareTiers(
  a: string,
  b: string,
  untiered: string,
): number {
  if (a === b) return 0;
  if (a === GLOBAL_TIER) return -1;
  if (b === GLOBAL_TIER) return 1;
  if (a === untiered) return 1;
  if (b === untiered) return -1;
  return a.localeCompare(b, "en");
}
