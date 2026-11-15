import { SERVED_GRAPH_QUERY } from "./constants.js";
import type { ServedGraph } from "./types.js";

/**
 * Ask a site's graph what it serves of its ontologies' classes and object
 * properties and of its class edges, as the explorer's own operation
 * reads them.
 *
 * @param endpoint - The graph's GraphQL address.
 * @throws When the graph answers with an error or without data.
 * @note Impure: performs a network request.
 */
export default async function fetchServedGraph(
  endpoint: string,
): Promise<ServedGraph> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query: SERVED_GRAPH_QUERY }),
  });
  const answer = (await response.json()) as {
    readonly data?: ServedGraph;
    readonly errors?: readonly unknown[];
  };
  if (answer.data === undefined || answer.errors !== undefined) {
    throw new Error(
      `the graph at ${endpoint} answered ${JSON.stringify(answer.errors)}`,
    );
  }
  return answer.data;
}
