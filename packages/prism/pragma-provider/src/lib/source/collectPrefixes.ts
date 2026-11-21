import type { CompilerContext } from "@canonical/ke-graphql";
import { STANDARD_PREFIXES } from "./constants.js";

/**
 * The prefixes a document may use: the well-known vocabularies, then the
 * compiled ontologies', which win on a shared name.
 *
 * @param context - The request's context, whose namespaces the compiler read.
 * @returns Each prefix's namespace IRI, by prefix.
 */
export const collectPrefixes = (
  context: Pick<CompilerContext, "namespaces">,
): ReadonlyMap<string, string> =>
  new Map([
    ...STANDARD_PREFIXES,
    ...[...context.namespaces.values()].map(
      ({ prefix, uri }) => [prefix, uri] as const,
    ),
  ]);
