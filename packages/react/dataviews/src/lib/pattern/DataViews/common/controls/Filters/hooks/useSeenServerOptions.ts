import type { Facet } from "@canonical/dataviews-core";
import { useCallback, useMemo, useState } from "react";
import { listFacetOptions } from "../../../utils/index.js";
import type {
  UseSeenServerOptionsProps,
  UseSeenServerOptionsResult,
} from "./types.js";

/** Every field's options seen so far, in first-seen order. */
type SeenOptions = ReadonlyMap<string, readonly string[]>;

/** One identity for a field no facet has listed. */
const NO_OPTIONS: readonly string[] = Object.freeze([]);

/** One identity for no options seen yet. */
const NONE_SEEN: SeenOptions = new Map();

/**
 * The options seen before with those a facet lists now appended, each
 * field's list kept at its identity while nothing new is listed, and the
 * whole map while no field gains one.
 */
const mergeOptions = (
  seen: SeenOptions,
  latest: Readonly<Record<string, Facet>> | null,
): SeenOptions => {
  const additions = Object.entries(latest ?? {}).flatMap(([field, facet]) => {
    const before = seen.get(field) ?? NO_OPTIONS;
    const added = listFacetOptions(facet).filter(
      (option) => !before.includes(option),
    );
    return added.length > 0 ? [[field, [...before, ...added]] as const] : [];
  });
  return additions.length > 0 ? new Map([...seen, ...additions]) : seen;
};

/**
 * The server's options for each field, as every facet seen while mounted
 * listed them: an option a later result drops stays listed, so a reader
 * can still choose it.
 */
export default function useSeenServerOptions(
  ...[latest]: UseSeenServerOptionsProps
): UseSeenServerOptionsResult {
  const [seen, setSeen] = useState(NONE_SEEN);
  const options = useMemo(() => mergeOptions(seen, latest), [seen, latest]);
  if (options !== seen) {
    setSeen(options);
  }
  return useCallback(
    (field: string): readonly string[] => options.get(field) ?? NO_OPTIONS,
    [options],
  );
}
