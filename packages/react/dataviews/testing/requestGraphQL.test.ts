import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { MACHINES_QUERY_TEXT } from "../src/storybook/machines/api/index.js";
import requestGraphQL from "./requestGraphQL.js";
import serveMockApi from "./serveMockApi.js";

serveMockApi([
  http.post<{ scenario: string }>(
    "*/graphql/:scenario",
    async ({ params, request }) =>
      HttpResponse.json({
        scenario: params.scenario,
        ...((await request.json()) as object),
      }),
  ),
]);

describe("requestGraphQL", () => {
  it("posts the machines query with the variables", async () => {
    await expect(requestGraphQL("live", { first: 2 })).resolves.toEqual({
      status: 200,
      body: {
        scenario: "live",
        query: MACHINES_QUERY_TEXT,
        operationName: "MachinesQuery",
        variables: { first: 2 },
      },
    });
  });

  it("stops when its signal aborts", async () => {
    await expect(
      requestGraphQL("live", {}, AbortSignal.abort()),
    ).rejects.toThrow();
  });
});
