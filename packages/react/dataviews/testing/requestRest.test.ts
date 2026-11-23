import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import requestRest from "./requestRest.js";
import serveMockApi from "./serveMockApi.js";

serveMockApi([
  http.get<{ scenario: string }>(
    "*/api/:scenario/machines",
    ({ params, request }) =>
      HttpResponse.json(
        { scenario: params.scenario, search: new URL(request.url).search },
        { status: 202 },
      ),
  ),
]);

describe("requestRest", () => {
  it("asks one scenario's endpoint with the parameters", async () => {
    await expect(requestRest("live", "size=5")).resolves.toEqual({
      status: 202,
      body: { scenario: "live", search: "?size=5" },
    });
  });

  it("stops when its signal aborts", async () => {
    await expect(
      requestRest("live", "size=5", AbortSignal.abort()),
    ).rejects.toThrow();
  });
});
