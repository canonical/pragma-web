import {
  createExampleHandler,
  createExampleProvider,
} from "@canonical/prism-graph-example";
import type { FetchFunction, GraphQLResponse } from "relay-runtime";
import { type Mock, vi } from "vitest";

/** Options for `createMetroFetch`. */
export interface MetroFetchOptions {
  /**
   * The size of the index's first page, in place of the lens's own, so the
   * "Load more" path runs against the metro graph's sixteen stations. Only
   * `EntityIndexQuery`'s `count` is lowered; the pagination query asks for
   * the lens's own page size.
   */
  readonly cap?: number;
}

/**
 * Create a Relay fetch function that executes every operation against the
 * metro graph, in process, through the graph's own fetch handler: no server,
 * no port. It records its calls, so a test can count the requests a render
 * made.
 *
 * @param options - The index's first-page size, if lowered.
 * @returns A vitest mock that implements `FetchFunction`.
 * @note Impure: each call executes a GraphQL operation against a provider
 *   built once per fetch function.
 */
export default function createMetroFetch({
  cap,
}: MetroFetchOptions = {}): Mock<FetchFunction> {
  const handle = createExampleHandler(createExampleProvider(), {
    graphiql: false,
  });
  return vi.fn<FetchFunction>(async (params, variables) => {
    const lowered =
      cap !== undefined && params.name === "EntityIndexQuery"
        ? { ...variables, count: cap }
        : variables;
    const response = await handle(
      new Request("http://metro.test/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: params.text,
          variables: lowered,
          operationName: params.name,
        }),
      }),
    );
    return (await response.json()) as GraphQLResponse;
  });
}
