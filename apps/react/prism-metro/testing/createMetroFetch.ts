import type { FetchFunction, GraphQLResponse } from "relay-runtime";
import { type Mock, vi } from "vitest";
import createMetroExecute from "./createMetroExecute.js";

/**
 * Create a Relay `fetchFn` that answers every operation from the metro
 * provider in process, through the same schema and resolvers the graph
 * server runs, and records each call so a test reads which operations went
 * out and with which variables.
 *
 * @returns The recording fetch function.
 */
export default function createMetroFetch(): Mock<FetchFunction> {
  const execute = createMetroExecute();
  return vi.fn<FetchFunction>(async (params, variables) => {
    if (params.text === null) {
      throw new Error(`${params.name} carries no text to execute`);
    }
    return (await execute(params.text, variables)) as GraphQLResponse;
  });
}
