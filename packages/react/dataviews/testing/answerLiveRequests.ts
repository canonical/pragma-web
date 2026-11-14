import { type HttpResponseResolver, http } from "msw";
import type { SetupServer } from "msw/node";

/**
 * Answer the live scenario's requests to one mock endpoint with one
 * resolver, for the rest of the test.
 *
 * @note Impure: adds a handler to the server.
 */
export default function answerLiveRequests(
  server: SetupServer,
  endpoint: "rest" | "graphql",
  resolver: HttpResponseResolver,
): void {
  server.use(
    endpoint === "rest"
      ? http.get("*/api/live/machines", resolver)
      : http.post("*/graphql/live", resolver),
  );
}
