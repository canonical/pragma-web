import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import answerOverHttp2 from "./answerOverHttp2.js";
import { MOCK_API_ORIGIN } from "./constants.js";
import serveMockApi from "./serveMockApi.js";

serveMockApi([
  http.get("*/answer", () =>
    HttpResponse.text("held", {
      status: 299,
      statusText: "Held",
      headers: { "x-answer": "kept" },
    }),
  ),
]);

/** The answer to the one request the server answers. */
const fetchAnswer = (): Promise<Response> =>
  fetch(new URL("/answer", MOCK_API_ORIGIN));

describe("answerOverHttp2", () => {
  it("reads the server's status text when not used", async () => {
    expect((await fetchAnswer()).statusText).toBe("Held");
  });

  it("drops the status text, keeping the status, headers and body", async () => {
    answerOverHttp2();
    const answer = await fetchAnswer();
    expect(answer.statusText).toBe("");
    expect(answer.status).toBe(299);
    expect(answer.headers.get("x-answer")).toBe("kept");
    await expect(answer.text()).resolves.toBe("held");
  });

  it("gives fetch back once the test finishes", () => {
    expect(vi.isMockFunction(globalThis.fetch)).toBe(false);
  });
});
