import { delay, HttpResponse, type RequestHandler } from "msw";
import { type GraphQLResponseBody, graphql } from "msw/graphql";
import { storyMachines } from "../fixtures.js";
import { API_SCENARIOS } from "./constants.js";
import createApiExecutor from "./createApiExecutor.js";
import readGraphQLQuery from "./readGraphQLQuery.js";
import type { ApiScenario, MachinesData, MockApiConfig } from "./types.js";

/** A cursor the endpoint hands back for the page starting after `offset`. */
const spellCursor = (offset: number): string => btoa(String(offset));

/**
 * One `MachinesQuery` answer, a page or an error, as the endpoint sends it.
 * The body type is named: msw does not infer it from the body.
 */
const respond = (body: GraphQLResponseBody<MachinesData>) =>
  HttpResponse.json<GraphQLResponseBody<MachinesData>>(body);

/** An answer carrying one error message and no data. */
const fail = (message: string) => respond({ errors: [{ message }] });

/**
 * The GraphQL machine endpoint, `POST /graphql/<scenario>`, once for every
 * scenario: `MachinesQuery` answers a forward connection with no total.
 * Each answer depends on its path and variables alone.
 *
 * @note Impure: its handlers wait on timers before they answer, and share an
 * executor that caches the last query it ran.
 */
export default function createGraphQLHandlers({
  records = storyMachines,
  latency = 0,
}: MockApiConfig = {}): readonly RequestHandler[] {
  const execute = createApiExecutor(records);
  const answer = async (
    scenario: ApiScenario,
    variables: Readonly<Record<string, unknown>>,
  ) => {
    if (scenario === "unanswered") {
      await delay("infinite");
    }
    await delay(latency);
    if (scenario === "down") {
      return fail("the machine inventory is unavailable");
    }
    const read = readGraphQLQuery(variables);
    if ("reason" in read) {
      return fail(read.reason);
    }
    if (scenario === "first-page-only" && read.offset > 0) {
      return fail("the machines past the first page are unavailable");
    }
    const {
      rows: page,
      matched,
      facets,
    } = execute(read.query, read.offset, read.first);
    const end = read.offset + page.length;
    return respond({
      data: {
        machines: {
          totalCount: null,
          facets,
          pageInfo: {
            endCursor: page.length === 0 ? null : spellCursor(end),
            hasNextPage: end < matched,
          },
          edges: page.map((node, position) => ({
            cursor: spellCursor(read.offset + position + 1),
            node,
          })),
        },
      },
    });
  };
  return API_SCENARIOS.map((scenario) =>
    graphql
      .link(`*/graphql/${scenario}`)
      .query<MachinesData, Readonly<Record<string, unknown>>>(
        "MachinesQuery",
        ({ variables }) => answer(scenario, variables),
      ),
  );
}
