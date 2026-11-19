import type { ApiScenario } from "../src/storybook/machines/api/index.js";
import { MACHINES_QUERY_TEXT } from "../src/storybook/machines/api/index.js";
import { MOCK_API_ORIGIN } from "./constants.js";
import type { MockApiAnswer } from "./types.js";

/**
 * Ask the GraphQL endpoint of one scenario for one page of `MachinesQuery`.
 *
 * @note Impure: sends a request.
 */
export default async function requestGraphQL(
  scenario: ApiScenario,
  variables: Readonly<Record<string, unknown>>,
  signal?: AbortSignal,
): Promise<MockApiAnswer> {
  const response = await fetch(
    new URL(`/graphql/${scenario}`, MOCK_API_ORIGIN),
    {
      signal: signal ?? null,
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        query: MACHINES_QUERY_TEXT,
        operationName: "MachinesQuery",
        variables,
      }),
    },
  );
  return { status: response.status, body: await response.json() };
}
