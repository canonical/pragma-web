import { delay, HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
import { serveMockApi } from "../../../../testing/index.js";
import answerBehind from "./answerBehind.js";
import { MACHINES_QUERY_TEXT } from "./constants.js";

/** What the endpoints saw, in order: each request's start and its answer. */
const received: unknown[] = [];

serveMockApi([
  http.get("*/api/live/machines", async ({ request }) => {
    received.push(`GET ${new URL(request.url).search}`);
    await delay(5);
    received.push("answered");
    return HttpResponse.json({ items: [] });
  }),
  http.post("*/graphql/live", async ({ request }) => {
    received.push(request.headers.get("content-type"), await request.json());
    return HttpResponse.json({ data: null });
  }),
]);

beforeEach(() => {
  received.splice(0);
});

describe("answerBehind", () => {
  it("asks the live REST endpoint for one record, then again once answered", async () => {
    await answerBehind("rest");
    expect(received).toEqual([
      "GET ?size=1",
      "answered",
      "GET ?size=1",
      "answered",
    ]);
  });

  it("asks the live GraphQL endpoint for one machine, twice", async () => {
    await answerBehind("graphql");
    const body = {
      query: MACHINES_QUERY_TEXT,
      operationName: "MachinesQuery",
      variables: { first: 1 },
    };
    expect(received).toEqual([
      "application/json",
      body,
      "application/json",
      body,
    ]);
  });
});
