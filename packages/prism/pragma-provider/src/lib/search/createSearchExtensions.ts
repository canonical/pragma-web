import { type CompilerContext, paginateUriWindow } from "@canonical/ke-graphql";
import {
  type GraphQLFieldConfig,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLString,
} from "graphql";
import {
  type ExtensionFactory,
  findNodeConnection,
  resolveNodeEdges,
  toNodeConnection,
} from "../extensions/index.js";
import { rankSearchEntries } from "./rankSearchEntries.js";
import type { SearchIndex } from "./types.js";

/** The arguments of `Query.search`. */
interface SearchArgs {
  readonly text: string;
  readonly first?: number | null;
  readonly after?: string | null;
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
 * The `Query.search(text:, first:, after:)` root field, as a ke-graphql
 * extension factory.
 *
 * ```graphql
 * extend type Query {
 *   search(text: String!, first: Int, after: String): NodeConnection!
 * }
 * ```
 *
 * It ranks the search index the request context carries (`searchIndex`)
 * with `rankSearchEntries`, pages the ranked IRIs as every ke-graphql
 * connection is paged (cursors are the base64 of the IRI; 50 a page unless
 * `first` says otherwise, 100 at most; an unknown `after` starts from the
 * head; a negative `first` is an error), and resolves each IRI on the page
 * through the schema's own `Query.node`.
 *
 * WHY A ROOT FIELD, AND WHY THIS PACKAGE PINS graphql: for the reasons
 * `createProseExtensions` gives. The compiler merges extension fields only
 * into the object types it generates and into `Query`, so a root field is
 * the one position every provider can serve and every reader can select the
 * same way; and the field's type is the compiled `NodeConnection`, so it
 * must come from the one graphql copy ke-graphql builds the schema with.
 *
 * @returns The extension factory, to compose into `createSchemaPlugin`'s
 * `extensions`.
 * @throws From the factory, when the compiled schema has no `Node` interface.
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
    const search: GraphQLFieldConfig<unknown, CompilerContext, SearchArgs> = {
      type: new GraphQLNonNull(findNodeConnection(node)),
      description:
        "Nodes whose title, CURIE or definition contains `text`, ignoring case. A title match ranks before a CURIE match, and a CURIE match before a definition match; within one, an earlier match ranks first, then a shorter title, then the title and then the IRI in code-point order. Text that is empty or only whitespace matches nothing. Titles and definitions are read in the default language, en.",
      args: {
        text: { type: new GraphQLNonNull(GraphQLString) },
        first: { type: GraphQLInt },
        after: { type: GraphQLString },
      },
      resolve: async (_root, args, context, info) => {
        const ranked = rankSearchEntries(readSearchIndex(context), args.text);
        const page = paginateUriWindow(ranked, {
          first: args.first,
          after: args.after,
        });
        return toNodeConnection(
          await resolveNodeEdges(page.window, context, info),
          page,
        );
      },
    };
    return { Query: { search } };
  };
