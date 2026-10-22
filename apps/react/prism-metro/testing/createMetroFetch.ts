import type { FetchFunction, GraphQLResponse } from "relay-runtime";
import { type Mock, vi } from "vitest";
import createMetroExecute from "./createMetroExecute.js";

/**
 * Create a Relay fetch function that executes every operation against the
 * metro provider in process: the real graph, with no server and no socket.
 * It records its calls, so a test can see which operations a step sent.
 *
 * @returns A vitest mock that implements `FetchFunction`.
 */
export default function createMetroFetch(): Mock<FetchFunction> {
  const execute = createMetroExecute();
  return vi.fn<FetchFunction>(
    async (params, variables) =>
      (await execute(params.text ?? "", variables)) as GraphQLResponse,
  );
}
