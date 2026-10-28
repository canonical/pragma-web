import {
  type ExecutionResult,
  experimentalExecuteIncrementally,
  GraphQLObjectType,
  GraphQLSchema,
  isObjectType,
  parse,
} from "graphql";
import { describe, expect, it } from "vitest";
import { CORPUS_REFS_ROOT } from "../../testing/corpus.js";
import { createPragmaProvider } from "../provider/index.js";
import { createProseExtensions } from "./createProseExtensions.js";
import type { ProseDocument } from "./types.js";

/** A document with no references, served under the key `x`. */
const DOCUMENT: ProseDocument = {
  texts: { en: "English", fr: "Français" },
  availableLanguages: ["en", "fr"],
  references: [],
};

/** The same document, linking to an IRI. */
const LINKING: ProseDocument = {
  ...DOCUMENT,
  references: ["https://design.example.org/ontology#button"],
};

describe("createProseExtensions", () => {
  const booted = createPragmaProvider({ refsRoot: CORPUS_REFS_ROOT });

  /**
   * Run `source` against `schema` with a hand-built context. The compiled
   * schema declares `@defer` and `@stream`, which graphql-js executes only
   * through its incremental entry point; nothing here defers, so the
   * result is always a single one.
   */
  const runOn = async (
    schema: GraphQLSchema,
    source: string,
    contextValue: unknown,
  ): Promise<ExecutionResult> => {
    const result = await experimentalExecuteIncrementally({
      schema,
      document: parse(source),
      contextValue,
    });
    if ("initialResult" in result) {
      throw new Error("expected a single result, got an incremental one");
    }
    return result;
  };

  /** Run `source` against the compiled schema with a hand-built context. */
  const run = async (source: string, contextValue: unknown) =>
    runOn((await booted).api.schema, source, contextValue);

  it("refuses a schema with no Node interface", () => {
    const factory = createProseExtensions();
    expect(() =>
      factory({ type: () => undefined, iface: () => undefined }),
    ).toThrow("the compiled schema has no Node interface");
  });

  it("reports a context without a prose index as an error", async () => {
    const result = await run('{ prose(uri: "x") { lang } }', {});
    expect(result.errors?.map((error) => error.message)).toEqual([
      "the request context carries no prose index: build it with createPragmaProvider's handler",
    ]);
  });

  it("serves the requested language, else the locale, else the default", async () => {
    const proseIndex = new Map([["x", DOCUMENT]]);
    const result = await run(
      `{ prose(uri: "x") {
          lang
          markdown
          asked: markdown(lang: "fr")
          english: markdown(lang: "en")
          unauthored: markdown(lang: "de")
          unset: markdown(lang: null)
          availableLanguages
        } }`,
      { proseIndex, locale: "fr" },
    );
    expect(result).toEqual({
      data: {
        prose: {
          lang: "fr",
          markdown: "Français",
          asked: "Français",
          english: "English",
          unauthored: "Français",
          unset: "Français",
          availableLanguages: ["en", "fr"],
        },
      },
    });
  });

  it("ignores a locale that is not a string", async () => {
    const result = await run('{ prose(uri: "x") { lang markdown } }', {
      proseIndex: new Map([["x", DOCUMENT]]),
      locale: 42,
    });
    expect(result.data).toEqual({
      prose: { lang: "en", markdown: "English" },
    });
  });

  it("is null for an entity with no prose", async () => {
    const result = await run('{ prose(uri: "y") { lang } }', {
      proseIndex: new Map([["x", DOCUMENT]]),
    });
    expect(result).toEqual({ data: { prose: null } });
  });

  it("serves no references as an empty page", async () => {
    const result = await run(
      `{ prose(uri: "x") { references {
          edges { cursor }
          pageInfo { hasNextPage hasPreviousPage startCursor endCursor }
        } } }`,
      { proseIndex: new Map([["x", DOCUMENT]]) },
    );
    expect(result.data).toEqual({
      prose: {
        references: {
          edges: [],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
            endCursor: null,
          },
        },
      },
    });
  });

  it("refuses to resolve references in a schema without Query.node", async () => {
    const { api } = await booted;
    const query = api.schema.getQueryType();
    if (!isObjectType(query)) throw new Error("the schema has no Query");
    const { fields, ...config } = query.toConfig();
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        ...config,
        fields: { prose: fields.prose },
      }),
    });
    const result = await runOn(
      schema,
      '{ prose(uri: "x") { references { edges { cursor } } } }',
      { proseIndex: new Map([["x", LINKING]]) },
    );
    expect(result.errors?.map((error) => error.message)).toEqual([
      "the schema has no Query.node resolver to resolve nodes through",
    ]);
  });
});
