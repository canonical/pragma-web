import type { FetchFunction, GraphQLResponse, Variables } from "relay-runtime";
import { type Mock, vi } from "vitest";
import metroResponses from "./records/metroResponses.js";

/** Options for `createRecordedFetch`. */
export interface RecordedFetchOptions {
  /**
   * The size of the index's first page, in place of the lens's own, so the
   * "Load more" path runs against the metro graph's sixteen stations. Only
   * `EntityIndexQuery`'s `count` is lowered; the pagination query asks for
   * the lens's own page size.
   */
  readonly cap?: number;
}

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

/** The recorded answers, by request. */
const RESPONSES: ReadonlyMap<string, GraphQLResponse> = new Map(
  metroResponses.map(({ operation, variables, response }) => [
    keyRequest(operation, variables),
    response,
  ]),
);

/**
 * Create a Relay fetch function that answers every operation from the
 * metro graph's recorded responses: no provider, no server, no port. It
 * records its calls, so a test can count the requests a render made.
 *
 * @param options - The index's first-page size, if lowered.
 * @returns A vitest mock that implements `FetchFunction`.
 * @throws From the returned function, when a request has no recorded
 *   answer; the error names the operation and the variables to record.
 */
export default function createRecordedFetch({
  cap,
}: RecordedFetchOptions = {}): Mock<FetchFunction> {
  return vi.fn<FetchFunction>(async (params, variables) => {
    const lowered =
      cap !== undefined && params.name === "EntityIndexQuery"
        ? { ...variables, count: cap }
        : variables;
    const response = RESPONSES.get(keyRequest(params.name, lowered));
    if (response === undefined) {
      throw new Error(
        `no recorded response for ${params.name} at ${JSON.stringify(lowered)}`,
      );
    }
    // A copy per call, as a provider's fresh JSON would be.
    return structuredClone(response);
  });
}
