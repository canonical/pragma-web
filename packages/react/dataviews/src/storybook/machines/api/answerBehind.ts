import { MACHINES_QUERY_TEXT } from "./constants.js";

/** The request for one record from an endpoint's scenario that answers. */
const createLiveRequest = (endpoint: "rest" | "graphql"): Request =>
  endpoint === "rest"
    ? new Request(
        new URL("/api/live/machines?size=1", globalThis.location.href),
      )
    : new Request(new URL("/graphql/live", globalThis.location.href), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          query: MACHINES_QUERY_TEXT,
          operationName: "MachinesQuery",
          variables: { first: 1 },
        }),
      });

/**
 * Wait until the mock endpoint has answered two requests sent behind a
 * story's own, one after the other, each read to its end. A story request
 * the endpoint was going to answer has been answered by then, and its page
 * has had the turns to show it; one still held is held by the endpoint. A
 * play waits on these answers, never on the clock.
 *
 * @note Impure: sends two requests.
 */
export default async function answerBehind(
  endpoint: "rest" | "graphql",
): Promise<void> {
  for (const _ of [1, 2]) {
    await (await fetch(createLiveRequest(endpoint))).text();
  }
}
