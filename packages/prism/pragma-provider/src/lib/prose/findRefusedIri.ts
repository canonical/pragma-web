import type { QueryFn } from "@canonical/ke-graphql";
import { selectSubjects } from "./selectSubjects.js";
import type { RefusedIri } from "./types.js";

/**
 * The first of `iris` the store refuses to parse as an IRI.
 *
 * Each IRI is sent in a query of its own, because a query fails as a whole:
 * one IRI the store cannot parse (`…#button#usage`, a `%` not followed by two
 * hex digits, a `[` in a path) would fail every IRI sent with it. An IRI the
 * graph does not describe is not refused; it simply resolves to nothing.
 *
 * @param query - Runs SPARQL against the store.
 * @param iris - The IRIs to probe.
 * @returns The first refused IRI in `iris` order, or `undefined` when the
 * store parses them all.
 * @note Impure: queries the store once per IRI.
 */
export const findRefusedIri = async (
  query: QueryFn,
  iris: readonly string[],
): Promise<RefusedIri | undefined> => {
  const outcomes = await Promise.all(
    iris.map(async (iri): Promise<RefusedIri | undefined> => {
      try {
        await selectSubjects(query, [iri]);
        return undefined;
      } catch (reason) {
        return { iri, reason };
      }
    }),
  );
  return outcomes.find((outcome) => outcome !== undefined);
};
