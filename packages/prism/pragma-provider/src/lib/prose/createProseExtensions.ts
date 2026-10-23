import type { CompilerContext } from "@canonical/ke-graphql";
import {
  type GraphQLFieldConfig,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import {
  type ExtensionFactory,
  findNodeConnection,
  resolveNodeEdges,
  toNodeConnection,
} from "../extensions/index.js";
import { selectProseLanguage } from "./selectProseLanguage.js";
import type { ProseDocument, ProseIndex } from "./types.js";

/** What the prose resolvers read from the request context. */
interface ProseContext {
  readonly proseIndex: ProseIndex;
  readonly locale: string | undefined;
}

/**
 * The prose index and the request's locale, from a resolver's context.
 *
 * The context is built per request by the provider's handler; a context
 * built any other way is an error the query reports, not an empty answer.
 * A `locale` that is not a string counts as no locale.
 *
 * @throws When the context carries no prose index.
 */
const readProseContext = (context: CompilerContext): ProseContext => {
  const { proseIndex, locale } = context;
  if (!(proseIndex instanceof Map)) {
    throw new Error(
      "the request context carries no prose index: build it with createPragmaProvider's handler",
    );
  }
  return {
    proseIndex,
    locale: typeof locale === "string" ? locale : undefined,
  };
};

/**
 * The `Prose` type and the `Query.prose(uri:)` root field, as a ke-graphql
 * extension factory.
 *
 * ```graphql
 * type Prose {
 *   markdown(lang: String): String!
 *   lang: String!
 *   availableLanguages: [String!]!
 *   references: NodeConnection!
 * }
 * extend type Query { prose(uri: ID!): Prose }
 * ```
 *
 * WHY A ROOT FIELD. The compiler merges extension fields only into the
 * object types it generates and into `Query`; `Node`, `EntityMeta` and
 * `NodeConnection` cannot take one. A field on each concrete type would need
 * the generated type names before compiling, and a reader would have to
 * select it through a type-specific fragment. One root field reads the same
 * way against any provider that serves it.
 *
 * WHY THIS PACKAGE PINS graphql. `Prose` is built here, with this package's
 * `graphql`, and composed into a schema built with ke-graphql's. graphql-js
 * refuses a type from another copy of itself, so the package depends on the
 * exact version ke-graphql pins, and the two resolve to one installed copy.
 * A ke-graphql upgrade moves both pins together.
 *
 * Resolvers read the prose index and the locale from the request context
 * (`proseIndex`, `locale`), never from module state. An ontology that ever
 * defines a class named `Prose`, or a root field named `prose`, collides
 * with these and fails the compile loudly.
 *
 * @returns The extension factory to pass as `createSchemaPlugin`'s `extensions`.
 * @throws From the factory, when the compiled schema has no `Node` interface.
 */
export const createProseExtensions =
  (): ExtensionFactory =>
  ({ iface }) => {
    const node = iface("Node");
    if (node === undefined) {
      throw new Error(
        "the compiled schema has no Node interface for Prose.references",
      );
    }
    const prose = new GraphQLObjectType<ProseDocument, CompilerContext>({
      name: "Prose",
      description: "Long-form Markdown authored for one entity, per language.",
      fields: () => ({
        markdown: {
          type: new GraphQLNonNull(GraphQLString),
          description:
            "The text in `lang`, else in the request's locale, else in the default language.",
          args: { lang: { type: GraphQLString } },
          resolve: (document, args: { lang?: string | null }, context) =>
            document.texts[
              selectProseLanguage(document, [
                args.lang ?? undefined,
                readProseContext(context).locale,
              ])
            ],
        },
        lang: {
          type: new GraphQLNonNull(GraphQLString),
          description:
            "The language `markdown` serves without `lang`: the request's locale when authored, else the default.",
          resolve: (document, _args, context) =>
            selectProseLanguage(document, [readProseContext(context).locale]),
        },
        availableLanguages: {
          type: new GraphQLNonNull(
            new GraphQLList(new GraphQLNonNull(GraphQLString)),
          ),
          description:
            "Every authored language, the default first, then the rest in code-point order.",
        },
        references: {
          type: new GraphQLNonNull(findNodeConnection(node)),
          description:
            "Entities the prose links to across its languages, in order of first mention; destinations node(id:) does not resolve are dropped.",
          resolve: async (document, _args, context, info) =>
            toNodeConnection(
              await resolveNodeEdges(document.references, context, info),
              { hasNextPage: false, hasPreviousPage: false },
            ),
        },
      }),
    });
    const field: GraphQLFieldConfig<unknown, CompilerContext, { uri: string }> =
      {
        type: prose,
        description:
          "The prose authored for the entity `uri` names (an absolute IRI), or null when it has none.",
        args: { uri: { type: new GraphQLNonNull(GraphQLID) } },
        resolve: (_root, args, context) =>
          readProseContext(context).proseIndex.get(args.uri) ?? null,
      };
    return { Query: { prose: field } };
  };
