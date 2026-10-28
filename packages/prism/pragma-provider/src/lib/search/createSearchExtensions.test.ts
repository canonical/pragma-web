import {
  type ExecutionResult,
  experimentalExecuteIncrementally,
  parse,
} from "graphql";
import { describe, expect, it } from "vitest";
import { CORPUS_REFS_ROOT } from "../../testing/corpus.js";
import { createPragmaProvider } from "../provider/index.js";
import { createSearchExtensions } from "./createSearchExtensions.js";

/** The page every case reads. */
const SEARCH_QUERY = `query Search($text: String!, $first: Int) {
  search(text: $text, first: $first) {
    edges { cursor }
    pageInfo { hasNextPage hasPreviousPage startCursor endCursor }
  }
}`;

describe("createSearchExtensions", () => {
  const booted = createPragmaProvider({ refsRoot: CORPUS_REFS_ROOT });

  /**
   * Run `SEARCH_QUERY` against the compiled schema with a hand-built
   * context. The compiled schema declares `@defer` and `@stream`, which
   * graphql-js executes only through its incremental entry point; nothing
   * here defers, so the result is always a single one.
   */
  const run = async (
    variables: Record<string, unknown>,
    contextValue: unknown,
  ): Promise<ExecutionResult> => {
    const result = await experimentalExecuteIncrementally({
      schema: (await booted).api.schema,
      document: parse(SEARCH_QUERY),
      variableValues: variables,
      contextValue,
    });
    if ("initialResult" in result) {
      throw new Error("expected a single result, got an incremental one");
    }
    return result;
  };

  it("refuses a schema with no Node interface", () => {
    const factory = createSearchExtensions();
    expect(() =>
      factory({ type: () => undefined, iface: () => undefined }),
    ).toThrow("the compiled schema has no Node interface for Query.search");
  });

  it("reports a context without a search index as an error", async () => {
    const result = await run({ text: "card" }, {});
    expect(result.errors?.map((error) => error.message)).toEqual([
      "the request context carries no search index: build it with createPragmaProvider's handler",
    ]);
  });

  it("serves empty text as the empty page", async () => {
    const result = await run({ text: "" }, { searchIndex: [] });
    expect(result).toEqual({
      data: {
        search: {
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

  it("reports a negative first as an error", async () => {
    const result = await run({ text: "card", first: -1 }, { searchIndex: [] });
    expect(result.errors?.map((error) => error.message)).toEqual([
      'Argument "first" must be a non-negative integer',
    ]);
  });
});
