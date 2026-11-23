import { HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import answerLiveRequests from "./answerLiveRequests.js";
import serveMockApi from "./serveMockApi.js";

const server = serveMockApi([]);

describe("answerLiveRequests", () => {
  it("answers the REST endpoint's live GETs", async () => {
    answerLiveRequests(server, "rest", () => HttpResponse.json({ items: [] }));
    const response = await fetch("http://localhost/api/live/machines");
    expect(await response.json()).toEqual({ items: [] });
  });

  it("answers the GraphQL endpoint's live POSTs", async () => {
    answerLiveRequests(server, "graphql", () => HttpResponse.json({ data: 1 }));
    const response = await fetch("http://localhost/graphql/live", {
      method: "POST",
    });
    expect(await response.json()).toEqual({ data: 1 });
  });
});
