import { type CompilerContext, toBase64 } from "@canonical/ke-graphql";
import type { GraphQLResolveInfo } from "graphql";
import type { NodeEdge } from "./types.js";

/**
 * Resolve each IRI through the schema's own `Query.node`, so a node resolves
 * exactly as `node(id:)` would, class IRIs included, and keep the ones it
 * finds as edges in the order of `iris`.
 *
 * @param iris - Absolute IRIs, in the order the edges are wanted.
 * @param context - The request's context, whose loaders the resolver reads.
 * @param info - The calling resolver's info, which carries the schema.
 * @returns One edge per IRI that resolved, its cursor the base64 of the IRI.
 * @throws When the schema has no `Query.node` resolver.
 * @note Impure: reads the store through the context's loaders.
 */
export const resolveNodeEdges = async (
  iris: readonly string[],
  context: CompilerContext,
  info: GraphQLResolveInfo,
): Promise<readonly NodeEdge[]> => {
  const resolveNode = info.schema.getQueryType()?.getFields().node?.resolve;
  if (resolveNode === undefined) {
    throw new Error(
      "the schema has no Query.node resolver to resolve nodes through",
    );
  }
  const edges = await Promise.all(
    iris.map(async (iri) => ({
      node: await resolveNode(undefined, { id: iri }, context, info),
      cursor: toBase64(iri),
    })),
  );
  return edges.filter((edge) => edge.node != null);
};
