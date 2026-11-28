import {
  DEFAULT_WINDOW,
  EMPTY_SLICE,
  type SourceDelivery,
} from "@canonical/dataviews-core";
import { HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import {
  answerLiveRequests,
  answerOverHttp2,
  awaitDelivery,
  readFailureReason,
  serveMockApi,
} from "../../../../testing/index.js";
import { storyMachines } from "../fixtures.js";
import type { Machine } from "../types.js";
import createGraphQLMachineSource from "./createGraphQLMachineSource.js";

// Each test answers the one request its source sends its own way.
const server = serveMockApi([]);

describe("createGraphQLMachineSource", () => {
  it("publishes a partial answer's data rather than failing it", async () => {
    const [machine] = storyMachines;
    if (machine === undefined) {
      throw new Error("the story fixtures hold a machine");
    }
    const { id, name, status, cores, region, owner } = machine;
    answerLiveRequests(server, "graphql", () =>
      HttpResponse.json({
        data: {
          machines: {
            totalCount: null,
            facets: {},
            pageInfo: { endCursor: null, hasNextPage: false },
            edges: [
              {
                cursor: btoa("0"),
                node: { id, name, status, cores, region, owner },
              },
            ],
          },
        },
        errors: [{ message: "the owners are unavailable", path: ["machines"] }],
      }),
    );
    const delivery = await awaitDelivery(
      createGraphQLMachineSource("live"),
      {
        requestId: "partial",
        slice: EMPTY_SLICE,
        window: DEFAULT_WINDOW,
        facets: [],
      },
      (
        taken,
      ): taken is Extract<SourceDelivery<Machine>, { status: "succeeded" }> =>
        taken.status === "succeeded",
    );
    const rows = delivery.page.rows;
    expect(rows.map((row) => row.id)).toEqual([id]);
  });

  it("asks the endpoint for every clause of the query, by name", async () => {
    const bodies: unknown[] = [];
    answerLiveRequests(server, "graphql", async ({ request }) => {
      bodies.push(await request.json());
      return HttpResponse.json({
        data: {
          machines: {
            totalCount: null,
            facets: {},
            pageInfo: { endCursor: null, hasNextPage: false },
            edges: [],
          },
        },
      });
    });
    await awaitDelivery(createGraphQLMachineSource("live"), {
      requestId: "every-clause",
      slice: {
        ...EMPTY_SLICE,
        filter: [
          { field: "status", operator: "isAny", operands: ["failed"] },
          { field: "status", operator: "isNone", operands: ["pending"] },
          { field: "cores", operator: "gte", operands: [4] },
          { field: "cores", operator: "lte", operands: [16] },
          { field: "name", operator: "contains", operands: ["web"] },
          { field: "region", operator: "contains", operands: ["eu-"] },
          { field: "owner", operator: "contains", operands: ["ex:"] },
        ],
        search: "ivy",
        sort: [
          { field: "cores", direction: "desc" },
          { field: "name", direction: "asc" },
        ],
      },
      window: DEFAULT_WINDOW,
      facets: [],
    });
    expect(bodies.at(0)).toMatchObject({
      operationName: "MachinesQuery",
      variables: {
        after: null,
        where: {
          status: ["failed"],
          statusIsNone: ["pending"],
          coresGte: 4,
          coresLte: 16,
          nameContains: "web",
          regionContains: "eu-",
          ownerContains: "ex:",
          search: "ivy",
        },
        orderBy: [
          { field: "cores", direction: "DESC" },
          { field: "name", direction: "ASC" },
        ],
      },
    });
  });

  it("names the status when a failed answer gives no error", async () => {
    // Status 599 has no standard text, and over HTTP/2 none is given.
    answerOverHttp2();
    answerLiveRequests(server, "graphql", () =>
      HttpResponse.json({}, { status: 599 }),
    );
    expect(await readFailureReason(createGraphQLMachineSource("live"))).toBe(
      "the endpoint answered 599",
    );
  });

  it("names the status when a failed answer is not JSON", async () => {
    answerOverHttp2();
    answerLiveRequests(
      server,
      "graphql",
      () => new HttpResponse("<html>", { status: 599 }),
    );
    expect(await readFailureReason(createGraphQLMachineSource("live"))).toBe(
      "the endpoint answered 599",
    );
  });

  it("gives a failed answer's status text when it gives no error", async () => {
    answerLiveRequests(server, "graphql", () =>
      HttpResponse.json({}, { status: 503 }),
    );
    expect(await readFailureReason(createGraphQLMachineSource("live"))).toBe(
      "Service Unavailable",
    );
  });

  it("fails an error with no message in a sentence of its own", async () => {
    answerLiveRequests(server, "graphql", () =>
      HttpResponse.json({ errors: [null] }),
    );
    expect(await readFailureReason(createGraphQLMachineSource("live"))).toBe(
      "the endpoint answered with an error it did not describe",
    );
  });

  it("fails a connection answered as null in the endpoint's own words", async () => {
    answerLiveRequests(server, "graphql", () =>
      HttpResponse.json({
        data: { machines: null },
        errors: [{ message: "the inventory resolver failed" }],
      }),
    );
    expect(await readFailureReason(createGraphQLMachineSource("live"))).toBe(
      "the inventory resolver failed",
    );
  });

  it("fails data that holds nothing in a sentence of its own", async () => {
    answerLiveRequests(server, "graphql", () =>
      HttpResponse.json({ data: {} }),
    );
    expect(await readFailureReason(createGraphQLMachineSource("live"))).toBe(
      "the endpoint answered without data",
    );
  });

  it("fails an answer with no data in a sentence of its own", async () => {
    answerLiveRequests(server, "graphql", () =>
      HttpResponse.json({ data: null }),
    );
    expect(await readFailureReason(createGraphQLMachineSource("live"))).toBe(
      "the endpoint answered without data",
    );
  });

  it("fails an answer that is not JSON at all", async () => {
    answerLiveRequests(
      server,
      "graphql",
      () => new HttpResponse("<html>", { status: 200 }),
    );
    expect(await readFailureReason(createGraphQLMachineSource("live"))).toBe(
      "the endpoint answered without a JSON object",
    );
  });

  it("fails JSON that is not an object, a list included", async () => {
    for (const body of ["oops", []]) {
      answerLiveRequests(server, "graphql", () => HttpResponse.json(body));
      expect(await readFailureReason(createGraphQLMachineSource("live"))).toBe(
        "the endpoint answered without a JSON object",
      );
    }
  });
});
