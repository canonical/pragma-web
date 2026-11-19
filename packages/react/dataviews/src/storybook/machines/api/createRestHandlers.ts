import type { Facet } from "@canonical/dataviews-core";
import { delay, HttpResponse, http, type RequestHandler } from "msw";
import { storyMachines } from "../fixtures.js";
import { API_SCENARIOS } from "./constants.js";
import createApiExecutor from "./createApiExecutor.js";
import readRestQuery from "./readRestQuery.js";
import type {
  ApiProblem,
  ApiRecord,
  ApiScenario,
  MockApiConfig,
} from "./types.js";

/** One page the REST endpoint answers with. */
type RestPage = {
  readonly items: readonly ApiRecord[];
  /** Records matching the query. */
  readonly matched: number;
  /** The facets the query asked for, keyed by field. */
  readonly facets: Readonly<Record<string, Facet>>;
};

/** A problem answer, with the status an HTTP backend sends it with. */
const respondWithProblem = (status: number, reason: string) =>
  HttpResponse.json<ApiProblem>({ reason }, { status });

/**
 * The REST machine endpoint, `GET /api/<scenario>/machines`, once for every
 * scenario: it reads the flat query grammar as its own parameters, answers
 * from core's array source, orders by one term, pages by number and counts
 * exactly.
 *
 * Each handler is stateless: what a request is answered with depends on its
 * path and its parameters alone, so handlers never carry anything from one
 * story or test to the next.
 *
 * @note Impure: its handlers wait on timers before they answer.
 */
export default function createRestHandlers({
  records = storyMachines,
  latency = 0,
}: MockApiConfig = {}): readonly RequestHandler[] {
  const execute = createApiExecutor(records);
  const answer = async (scenario: ApiScenario, url: URL): Promise<Response> => {
    if (scenario === "unanswered") {
      await delay("infinite");
    }
    await delay(latency);
    if (scenario === "down") {
      return respondWithProblem(503, "the machine inventory is unavailable");
    }
    const read = readRestQuery(url.searchParams);
    if ("reason" in read) {
      return respondWithProblem(400, read.reason);
    }
    if (scenario === "first-page-only" && read.page > 1) {
      return respondWithProblem(
        503,
        "the machines past the first page are unavailable",
      );
    }
    const { rows, matched, facets } = execute(
      read.query,
      (read.page - 1) * read.size,
      read.size,
    );
    return HttpResponse.json<RestPage>({ items: rows, matched, facets });
  };
  return API_SCENARIOS.map((scenario) =>
    http.get(`*/api/${scenario}/machines`, ({ request }) =>
      answer(scenario, new URL(request.url)),
    ),
  );
}
