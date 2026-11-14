import {
  type CompilerContext,
  createStoreQueryFn,
  isAbsoluteIri,
  isSafeIri,
} from "@canonical/ke-graphql";
import type { Quad } from "@canonical/ke";
import {
  type GraphQLFieldConfig,
  GraphQLID,
  GraphQLNonNull,
  GraphQLString,
} from "graphql";
import type { ExtensionFactory } from "../extensions/index.js";
import { MAX_BLANK_DEPTH, STANDARD_PREFIXES } from "./constants.js";
import type { SourceArgs } from "./types.js";
import { writeTurtle } from "./writeTurtle.js";

/**
 * The prefixes a document may use: the well-known vocabularies, then the
 * compiled ontologies', which win on a shared name.
 */
const collectPrefixes = (
  context: CompilerContext,
): ReadonlyMap<string, string> =>
  new Map([
    ...STANDARD_PREFIXES,
    ...[...context.namespaces.values()].map(
      ({ prefix, uri }) => [prefix, uri] as const,
    ),
  ]);

/**
 * The query for the statements `depth` blank nodes below `uri`: at depth 0
 * those whose subject is `uri`, below that those whose subject is a blank
 * node reached from `uri` through `depth` blank nodes in a row.
 */
const buildDescribeQuery = (uri: string, depth: number): string => {
  const nodes = [
    `<${uri}>`,
    ...Array.from({ length: depth }, (_, index) => `?b${index}`),
  ];
  const subject = nodes.at(-1);
  const steps = nodes
    .slice(1)
    .map(
      (node, index) =>
        `${nodes.at(index)} ?q${index} ${node} . FILTER(isBlank(${node}))`,
    );
  return `CONSTRUCT { ${subject} ?p ?o } WHERE { ${steps.join(" ")} ${subject} ?p ?o }`;
};

/**
 * Resolve one entity's statements as Turtle: the statements whose subject
 * is `uri`, then those of every blank node they reach through blank nodes
 * alone, a level at a time down to `MAX_BLANK_DEPTH`, so a blank object is
 * described rather than only named. Null when the graph holds none. An
 * argument that is not an absolute IRI safe to send is refused with null
 * and never reaches the store.
 *
 * @note Impure: queries the store.
 */
const resolveSource = async (
  _root: unknown,
  { uri }: SourceArgs,
  context: CompilerContext,
): Promise<string | null> => {
  if (!isAbsoluteIri(uri) || !isSafeIri(uri)) return null;
  const query = createStoreQueryFn(await context.store);
  const quads: Quad[] = [];
  for (let depth = 0; depth <= MAX_BLANK_DEPTH; depth += 1) {
    const result = await query(buildDescribeQuery(uri, depth));
    // The store reads an empty CONSTRUCT as an empty SELECT: either way no
    // statement lies this deep.
    if (result.type !== "construct" || result.quads.length === 0) break;
    quads.push(...result.quads);
  }
  return quads.length > 0
    ? writeTurtle(quads, collectPrefixes(context))
    : null;
};

/**
 * The `Query.source(uri:)` root field, as a ke-graphql extension factory:
 * one entity's statements as Turtle with the provider's prefixes.
 *
 * ```graphql
 * extend type Query { source(uri: ID!): String }
 * ```
 *
 * A root field for the reason `createProseExtensions` gives: it is the one
 * position every provider can serve and every reader can select the same
 * way.
 *
 * @returns The extension factory, to compose into `createSchemaPlugin`'s
 * `extensions`.
 */
export const createSourceExtensions = (): ExtensionFactory => () => {
  const source: GraphQLFieldConfig<unknown, CompilerContext, SourceArgs> = {
    type: GraphQLString,
    description:
      "The statements whose subject is `uri` (an absolute IRI), as Turtle with the provider's prefixes, or null when the graph holds none.",
    args: { uri: { type: new GraphQLNonNull(GraphQLID) } },
    resolve: resolveSource,
  };
  return { Query: { source } };
};
