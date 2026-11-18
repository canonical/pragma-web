import { requireAt, VIEW_PARAMS } from "@canonical/prism-core";

/**
 * Build the search of the explorer's index drilled into a namespace, or
 * back to its overview at rest: every other view key the page carries
 * kept, a repeated key with each of its values in order, `expand=` set to
 * the prefix, or left out without one.
 *
 * @param current - The page's search parameters.
 * @param prefix - The namespace to drill into, or `undefined` for the way
 *   back.
 * @returns The next address's search parameters.
 */
export default function buildDrillSearch(
  current: URLSearchParams,
  prefix: string | undefined,
): Readonly<Record<string, string | readonly string[]>> {
  const kept = Object.fromEntries(
    [...new Set(current.keys())]
      .filter((key) => key !== VIEW_PARAMS.expand)
      .map((key) => {
        const values = current.getAll(key);
        return [key, values.length === 1 ? requireAt(values, 0) : values];
      }),
  );
  return prefix === undefined
    ? kept
    : { ...kept, [VIEW_PARAMS.expand]: prefix };
}
