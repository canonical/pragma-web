import type { ApiScenario } from "../src/storybook/machines/api/index.js";
import { MOCK_API_ORIGIN } from "./constants.js";
import type { MockApiAnswer } from "./types.js";

/**
 * Ask the REST endpoint of one scenario.
 *
 * @note Impure: sends a request.
 */
export default async function requestRest(
  scenario: ApiScenario,
  params: string,
  signal?: AbortSignal,
): Promise<MockApiAnswer> {
  const response = await fetch(
    new URL(`/api/${scenario}/machines?${params}`, MOCK_API_ORIGIN),
    { signal: signal ?? null },
  );
  return { status: response.status, body: await response.json() };
}
