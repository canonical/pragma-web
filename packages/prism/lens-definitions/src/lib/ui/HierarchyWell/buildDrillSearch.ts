import { VIEW_PARAMS } from "@canonical/prism-core";

/**
 * Build the search of the explorer's index drilled into a namespace, or
 * back to its overview at rest: every other view key the page carries
 * kept, `expand=` set to the prefix, or left out without one.
 *
 * @param current - The page's search parameters.
 * @param prefix - The namespace to drill into, or `undefined` for the way
 *   back.
 * @returns The next address's search parameters.
 */
export default function buildDrillSearch(
  current: URLSearchParams,
  prefix: string | undefined,
): Readonly<Record<string, string>> {
  const kept = Object.fromEntries(
    [...current.entries()].filter(([key]) => key !== VIEW_PARAMS.expand),
  );
  return prefix === undefined
    ? kept
    : { ...kept, [VIEW_PARAMS.expand]: prefix };
}
