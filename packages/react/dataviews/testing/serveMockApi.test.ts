import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { MOCK_API_ORIGIN } from "./constants.js";
import serveMockApi from "./serveMockApi.js";

const server = serveMockApi([
  http.get("*/greeting", () => HttpResponse.text("hello")),
]);

/** The text one path answers with. */
const fetchText = async (path: string): Promise<string> =>
  (await fetch(new URL(path, MOCK_API_ORIGIN))).text();

describe("serveMockApi", () => {
  it("answers with the handlers it was given", async () => {
    await expect(fetchText("/greeting")).resolves.toBe("hello");
  });

  it("answers a request the test's own way while the test runs", async () => {
    server.use(http.get("*/greeting", () => HttpResponse.text("hi")));
    await expect(fetchText("/greeting")).resolves.toBe("hi");
  });

  it("drops what the last test added", async () => {
    await expect(fetchText("/greeting")).resolves.toBe("hello");
  });

  // Marked failing: the request no handler answers fails the test after it runs.
  it.fails("fails the test that sends a request no handler answers", async () => {
    await fetchText("/unanswered").catch(() => "");
  });

  it("counts an unanswered request against the test that sent it alone", async () => {
    await expect(fetchText("/greeting")).resolves.toBe("hello");
  });
});
