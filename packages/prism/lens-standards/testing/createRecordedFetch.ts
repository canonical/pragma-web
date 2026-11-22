import type { FetchFunction, GraphQLResponse, Variables } from "relay-runtime";
import { type Mock, vi } from "vitest";
import standardStatementsResponses from "./records/standardStatementsResponses.js";
import type { RecordedResponse } from "./types.js";

/**
 * Key a request by its operation and its variables, the variables' keys
 * sorted so that their order does not matter.
 *
 * @param operation - The operation's name.
 * @param variables - The variables it runs with.
 * @returns The request's key.
 */
const keyRequest = (operation: string, variables: Variables): string =>
  JSON.stringify([
    operation,
    Object.keys(variables)
      .sort()
      .map((name) => [name, variables[name]]),
  ]);

/**
 * Create a Relay fetch function that answers from recorded responses (the
 * pragma graph's, unless others are given): no provider, no server. It
 * records its calls, so a test can count the requests a render made.
 *
 * @param responses - The answers to replay; the pragma graph's recorded
 *   statements when omitted.
 * @returns A vitest mock that implements `FetchFunction`.
 * @throws From the returned function, when a request has no recorded
 *   answer; the error names the operation and the variables to record.
 */
export default function createRecordedFetch(
  responses: readonly RecordedResponse[] = standardStatementsResponses,
): Mock<FetchFunction> {
  const answers: ReadonlyMap<string, GraphQLResponse> = new Map(
    responses.map(({ operation, variables, response }) => [
      keyRequest(operation, variables),
      response,
    ]),
  );
  return vi.fn<FetchFunction>(async (params, variables) => {
    const response = answers.get(keyRequest(params.name, variables));
    if (response === undefined) {
      throw new Error(
        `no recorded response for ${params.name} at ${JSON.stringify(variables)}`,
      );
    }
    // A copy per call, as a provider's fresh JSON would be.
    return structuredClone(response);
  });
}
