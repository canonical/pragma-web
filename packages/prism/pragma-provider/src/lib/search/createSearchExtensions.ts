import {
  type CompilerContext,
  paginateUriWindow,
  toBase64,
} from "@canonical/ke-graphql";
import {
  type GraphQLFieldConfig,
  type GraphQLFieldResolver,
  GraphQLID,
  GraphQLInt,
  type GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  type GraphQLResolveInfo,
  GraphQLString,
} from "graphql";
import {
  type ExtensionFactory,
  findNodeConnection,
  followField,
  resolveNodeEdges,
  toNodeConnection,
} from "../extensions/index.js";
import { buildSearchPassage } from "./buildSearchPassage.js";
import { SEARCH_MATCH_FIELDS } from "./constants.js";
import { countTypeFacets } from "./countTypeFacets.js";
import { rankSearchEntries } from "./rankSearchEntries.js";
import type { SearchIndex, SearchMatch, TypeCount } from "./types.js";

/** The arguments of `Query.search`. */
interface SearchArgs {
  readonly text: string;
  readonly first?: number | null;
  readonly after?: string | null;
  readonly types?: readonly string[] | null;
}

/**
 * The search index, from a resolver's context.
 *
 * The context is built per request by the provider's handler; a context
 * built any other way is an error the query reports, not an empty answer.
 *
 * @throws When the context carries no search index.
 */
const readSearchIndex = (context: CompilerContext): SearchIndex => {
  const { searchIndex } = context;
  if (!Array.isArray(searchIndex)) {
    throw new Error(
      "the request context carries no search index: build it with createPragmaProvider's handler",
    );
  }
  return searchIndex;
};

/**
 * A root field's resolver, from the schema a resolver runs against.
 *
 * @throws Naming the field, when the schema's Query has no resolver for it.
 */
const readRootResolver = (
  info: GraphQLResolveInfo,
  name: string,
): GraphQLFieldResolver<unknown, CompilerContext> => {
  const resolve = info.schema.getQueryType()?.getFields()[name]?.resolve;
  if (resolve === undefined) {
    throw new Error(`the schema has no Query.${name} resolver for search`);
  }
  return resolve;
};

/** Keep the matches whose type is one of `types`; none or empty keeps all. */
const filterMatchesByType = (
  matches: readonly SearchMatch[],
  types: readonly string[] | null | undefined,
): readonly SearchMatch[] => {
  const kept = new Set(types ?? []);
  return kept.size === 0
    ? matches
    : matches.filter((match) => kept.has(match.type));
};

/** The search types built over the compiled `PageInfo` and `OntologyClass`. */
const buildSearchConnection = (
  pageInfo: GraphQLObjectType,
  ontologyClass: GraphQLObjectType,
  node: GraphQLInterfaceType,
): GraphQLObjectType => {
  const matchRange = new GraphQLObjectType({
    name: "MatchRange",
    description: "One occurrence of the search text in a passage.",
    fields: {
      start: {
        type: new GraphQLNonNull(GraphQLInt),
        description:
          "Offset of the occurrence from the passage's start, in UTF-16 code units.",
      },
      length: {
        type: new GraphQLNonNull(GraphQLInt),
        description: "Length of the occurrence, in UTF-16 code units.",
      },
    },
  });
  const searchMatch = new GraphQLObjectType({
    name: "SearchMatch",
    description: "Where the search text matched a result.",
    fields: {
      field: {
        type: new GraphQLNonNull(GraphQLString),
        description:
          "The predicate the match is in, as a CURIE (else its IRI), or `uri` when the text matched the result's CURIE.",
      },
      passage: {
        type: new GraphQLNonNull(GraphQLString),
        description:
          "The matched value, or at most 160 characters of it around the first occurrence.",
      },
      ranges: {
        type: new GraphQLNonNull(
          new GraphQLList(new GraphQLNonNull(matchRange)),
        ),
        description:
          "Every occurrence of the search text lying wholly inside the passage.",
      },
    },
  });
  const searchEdge = new GraphQLObjectType({
    name: "SearchEdge",
    description: "One search result with its cursor and its match.",
    fields: {
      node: {
        type: new GraphQLNonNull(node),
        description:
          "The result: an instance of a generated type, or an OntologyClass.",
      },
      cursor: {
        type: new GraphQLNonNull(GraphQLString),
        description: "Opaque cursor for `after`.",
      },
      match: {
        type: new GraphQLNonNull(searchMatch),
        description: "Where the search text matched the result.",
      },
    },
  });
  const typeFacet = new GraphQLObjectType<TypeCount, CompilerContext>({
    name: "TypeFacet",
    description: "The number of matches of one type.",
    fields: {
      type: {
        type: new GraphQLNonNull(ontologyClass),
        description:
          "The type the matches are counted under: an instance's most specific class, or owl:Class for a class.",
        resolve: (facet, _args, context, info) =>
          readRootResolver(info, "ontologyClass")(
            undefined,
            { uri: facet.type },
            context,
            info,
          ),
      },
      count: {
        type: new GraphQLNonNull(GraphQLInt),
        description: "Every match of this type, before paging.",
      },
    },
  });
  return new GraphQLObjectType({
    name: "SearchConnection",
    description: "A page of search results, ranked best first.",
    fields: {
      edges: {
        type: new GraphQLNonNull(
          new GraphQLList(new GraphQLNonNull(searchEdge)),
        ),
        description: "The page's results, in rank order.",
      },
      pageInfo: {
        type: new GraphQLNonNull(pageInfo),
        description: "Cursor pagination over the ranked results.",
      },
      total: {
        type: new GraphQLNonNull(GraphQLInt),
        description: "Every match after the `types` filter, before paging.",
      },
      facets: {
        type: new GraphQLNonNull(
          new GraphQLList(new GraphQLNonNull(typeFacet)),
        ),
        description:
          "One entry per type with matches, counted without the `types` filter, most matches first.",
      },
    },
  });
};

/**
 * The `Query.search(text:, first:, after:, types:)` root field, as a
 * ke-graphql extension factory.
 *
 * ```graphql
 * extend type Query {
 *   search(text: String!, first: Int, after: String, types: [ID!]): SearchConnection!
 * }
 * ```
 *
 * It ranks the search index the request context carries (`searchIndex`)
 * with `rankSearchEntries`, keeps the matches whose type `types` lists,
 * pages them as every ke-graphql connection is paged (cursors are the
 * base64 of the IRI; 50 a page unless `first` says otherwise, 100 at most;
 * an unknown `after` starts from the head; a negative `first` is an error),
 * and resolves each IRI on the page through the schema's own `Query.node`,
 * beside its match: the field, and a passage of at most 160 code units with
 * the ranges of the text in it. `total` counts the matches after the
 * `types` filter and `facets` before it, so a facet's count is the total
 * its filter would show; each facet's type resolves through
 * `Query.ontologyClass`. The types and descriptions are those of
 * ke-graphql's own search option, so a client reads either the same way.
 *
 * WHY A ROOT FIELD, AND WHY THIS PACKAGE PINS graphql: for the reasons
 * `createProseExtensions` gives. The compiler merges extension fields only
 * into the object types it generates and into `Query`, so a root field is
 * the one position every provider can serve and every reader can select the
 * same way; and the search types are built over the compiled `Node`,
 * `PageInfo` and `OntologyClass`, so they must come from the one graphql
 * copy ke-graphql builds the schema with.
 *
 * @returns The extension factory, to compose into `createSchemaPlugin`'s
 * `extensions`.
 * @throws From the factory, when the compiled schema has no `Node`
 * interface, or no `NodeConnection` reachable from it.
 */
export const createSearchExtensions =
  (): ExtensionFactory =>
  ({ iface }) => {
    const node = iface("Node");
    if (node === undefined) {
      throw new Error(
        "the compiled schema has no Node interface for Query.search",
      );
    }
    const nodeConnection = findNodeConnection(node);
    const searchConnection = buildSearchConnection(
      followField(nodeConnection, "pageInfo"),
      followField(followField(node, "_meta"), "type"),
      node,
    );
    const search: GraphQLFieldConfig<unknown, CompilerContext, SearchArgs> = {
      type: new GraphQLNonNull(searchConnection),
      description:
        "Search every node by text: its title, its CURIE and its definition, read in the default language, en. Case-insensitive; ranked title, then CURIE, then definition; within one, an earlier match first, then a shorter title, then the title and then the IRI in code-point order.",
      args: {
        text: {
          type: new GraphQLNonNull(GraphQLString),
          description: "The text to find, trimmed; blank text finds nothing.",
        },
        first: {
          type: GraphQLInt,
          description: "Page size: 50 when omitted, 100 at most.",
        },
        after: {
          type: GraphQLString,
          description: "Cursor of the result to continue after.",
        },
        types: {
          type: new GraphQLList(new GraphQLNonNull(GraphQLID)),
          description:
            "Class IRIs to keep (a result's most specific class, or owl:Class for a class); null or empty keeps every type.",
        },
      },
      resolve: async (_root, args, context, info) => {
        const needle = args.text.trim().toLowerCase();
        const matches = rankSearchEntries(readSearchIndex(context), args.text);
        const kept = filterMatchesByType(matches, args.types);
        const page = paginateUriWindow(
          kept.map((match) => match.uri),
          { first: args.first, after: args.after },
        );
        const byCursor = new Map(
          kept.map((match) => [toBase64(match.uri), match] as const),
        );
        // Every indexed IRI resolved through `node(id:)` at boot, so each
        // edge finds its match; an edge whose node no longer resolves is
        // dropped by `resolveNodeEdges`, as in every connection.
        const edges = (await resolveNodeEdges(page.window, context, info)).map(
          (edge) => {
            const match = byCursor.get(edge.cursor) as SearchMatch;
            return {
              ...edge,
              match: {
                field: SEARCH_MATCH_FIELDS[match.tier],
                ...buildSearchPassage(match.value, needle, match.position),
              },
            };
          },
        );
        return {
          ...toNodeConnection(edges, page),
          edges,
          total: kept.length,
          facets: countTypeFacets(matches.map((match) => match.type)),
        };
      },
    };
    return { Query: { search } };
  };
