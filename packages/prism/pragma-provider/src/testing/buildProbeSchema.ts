/**
 * A hand-built schema with a `Query.node` of the shape the compiled one has,
 * for tests that need a node resolver they control: one that knows a few
 * IRIs, one that fails, or none at all.
 *
 * Test infrastructure: excluded from the build (tsconfig.build.json) and from
 * coverage (vitest.config.ts).
 */

import type { CompilerContext } from "@canonical/ke-graphql";
import {
  type GraphQLFieldConfigMap,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";
import type { ProbeSchemaResolvers } from "./types.js";

/** `_meta`, cut down to the three fields search reads. */
const META = new GraphQLObjectType({
  name: "Meta",
  fields: {
    curie: { type: new GraphQLNonNull(GraphQLString) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    definition: { type: GraphQLString },
  },
});

/** The one node type: an IRI and its `_meta`. */
const THING = new GraphQLObjectType({
  name: "Thing",
  fields: {
    uri: { type: new GraphQLNonNull(GraphQLID) },
    _meta: { type: META },
  },
});

/** An edge as a connection carries it. */
const EDGE = new GraphQLObjectType({
  name: "Edge",
  fields: {
    cursor: { type: new GraphQLNonNull(GraphQLString) },
    node: { type: new GraphQLNonNull(THING) },
  },
});

/**
 * Build a schema whose `Query` holds `node(id: ID!): Thing` and
 * `edges(iris: [ID!]!): [Edge!]!`, each only when its resolver is given.
 *
 * @param resolvers - The resolvers of the fields to declare.
 * @returns The schema.
 */
export const buildProbeSchema = ({
  resolveNode,
  resolveEdges,
}: ProbeSchemaResolvers): GraphQLSchema => {
  const fields: GraphQLFieldConfigMap<unknown, CompilerContext> = {};
  if (resolveNode !== undefined) {
    fields.node = {
      type: THING,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: (_root, args: { id: string }) => resolveNode(args.id),
    };
  }
  if (resolveEdges !== undefined) {
    fields.edges = {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(EDGE))),
      args: {
        iris: {
          type: new GraphQLNonNull(
            new GraphQLList(new GraphQLNonNull(GraphQLID)),
          ),
        },
      },
      resolve: (_root, args: { iris: readonly string[] }, context, info) =>
        resolveEdges(args.iris, context, info),
    };
  }
  return new GraphQLSchema({
    query: new GraphQLObjectType({ name: "Query", fields }),
  });
};
