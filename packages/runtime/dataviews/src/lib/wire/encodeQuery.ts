import encodeCarryingQuery from "./encodeCarryingQuery.js";
import type { EncodeQueryConfig } from "./types.js";

/** An encode that carries nothing through. */
const NOTHING_CARRIED: readonly string[] = Object.freeze([]);

/**
 * Write one query and its window as URL parameters.
 *
 * The slice is canonicalized first, so the same query always produces the
 * same parameters: set operands are a set, `isAny` is the bare field name,
 * ordered sort terms keep their precedence, and an empty search is no
 * search. Only the grammar's own keys are replaced in `preserve` — every
 * host parameter survives, in its original order and with its duplicates.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function encodeQuery(
  config: EncodeQueryConfig,
): URLSearchParams {
  return encodeCarryingQuery({
    ...config,
    carry: NOTHING_CARRIED,
    applied: config.slice,
  });
}
