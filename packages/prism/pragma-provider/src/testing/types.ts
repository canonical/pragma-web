/**
 * Test-only types shared by this package's tests.
 */

import type { CompilerContext } from "@canonical/ke-graphql";
import type { GraphQLResolveInfo } from "graphql";

/**
 * One reference-extraction case: a CommonMark document and the IRIs it must
 * yield, in order.
 */
export interface ExtractionCase {
  readonly name: string;
  readonly markdown: string;
  readonly expected: readonly string[];
}

/**
 * The resolvers a probe schema is built from. A resolver left out leaves its
 * field out of the schema.
 */
export interface ProbeSchemaResolvers {
  /** Resolves `Query.node(id:)` to a `Thing`, or null. */
  readonly resolveNode?: (id: string) => unknown;
  /** Resolves `Query.edges(iris:)` to a list of `Edge`. */
  readonly resolveEdges?: (
    iris: readonly string[],
    context: CompilerContext,
    info: GraphQLResolveInfo,
  ) => unknown;
}
