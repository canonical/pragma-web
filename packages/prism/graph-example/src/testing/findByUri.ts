import { assertPresent } from "./assertPresent.js";
import type { NetworkReference } from "./types.js";

/**
 * The record with the IRI `uri` in `records`.
 *
 * Throws when no record has that IRI, so a test fails at the missing record
 * rather than reading through it.
 */
export const findByUri = <T extends NetworkReference>(
  records: readonly T[],
  uri: string,
): T =>
  assertPresent(
    records.find((record) => record.uri === uri),
    `no record has the IRI ${uri}`,
  );
