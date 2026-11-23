import { HttpResponse, http } from "msw";
import { describe, expect, it, onTestFinished, vi } from "vitest";
import { MOCK_API_ORIGIN } from "./constants.js";
import serveMockApi from "./serveMockApi.js";
import watchMockRequest from "./watchMockRequest.js";

/** Each held request's release, in arrival order. */
const holds: (() => void)[] = [];

const server = serveMockApi([
  http.get(
    "*/held",
    () =>
      new Promise<Response>((resolve) => {
        holds.push(() => resolve(HttpResponse.text("released")));
      }),
  ),
  http.get("*/other", () => HttpResponse.text("other")),
]);

/** The text one path answers with. */
const fetchText = async (path: string): Promise<string> =>
  (await fetch(new URL(path, MOCK_API_ORIGIN))).text();

/** Follow the first request for one path until the test finishes. */
const startWatch = (path: string) => {
  const watch = watchMockRequest(server, path);
  onTestFinished(watch.stop);
  return watch;
};

/** Release the held request at one position, once the server holds it. */
const releaseHeld = async (position: number): Promise<void> => {
  await vi.waitFor(() => expect(holds.length).toBeGreaterThan(position));
  holds.at(position)?.();
};

describe("watchMockRequest", () => {
  it("settles once the request arrives, and tells when it has ended", async () => {
    holds.splice(0);
    const watch = startWatch("/held");
    const answer = fetchText("/held");
    await watch.received;
    expect(watch.hasEnded()).toBe(false);
    await releaseHeld(0);
    await expect(answer).resolves.toBe("released");
    expect(watch.hasEnded()).toBe(true);
  });

  it("follows only the first request for its own path", async () => {
    holds.splice(0);
    const watch = startWatch("/held");
    await fetchText("/other");
    const first = fetchText("/held");
    await watch.received;
    await vi.waitFor(() => expect(holds.length).toBe(1));
    const second = fetchText("/held");
    await releaseHeld(1);
    await expect(second).resolves.toBe("released");
    expect(watch.hasEnded()).toBe(false);
    await releaseHeld(0);
    await expect(first).resolves.toBe("released");
    expect(watch.hasEnded()).toBe(true);
  });

  it("stops following once stopped", async () => {
    const watch = watchMockRequest(server, "/other");
    watch.stop();
    await fetchText("/other");
    expect(watch.hasEnded()).toBe(false);
  });
});
