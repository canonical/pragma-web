import {
  DEFAULT_WINDOW,
  EMPTY_SLICE,
  type SourceDelivery,
  type SourceRequest,
} from "@canonical/dataviews-core";
import { describe, expect, it, onTestFinished } from "vitest";
import awaitDelivery from "./awaitDelivery.js";
import createCuedSource from "./createCuedSource.js";
import type { Machine } from "./types.js";

const request: SourceRequest = {
  requestId: "read",
  slice: EMPTY_SLICE,
  window: DEFAULT_WINDOW,
  facets: [],
};

const buildFailure = (reason: string): SourceDelivery<Machine> => ({
  status: "failed",
  failure: { reason, cause: null, transient: true },
});

describe("awaitDelivery", () => {
  it("resolves with the first delivery, then stops the request", async () => {
    const { source, send, stop } = createCuedSource();
    const read = awaitDelivery(source, request);
    send(buildFailure("first"));
    send(buildFailure("second"));
    await expect(read).resolves.toEqual(buildFailure("first"));
    expect(stop).toHaveBeenCalledTimes(1);
  });

  it("passes over the deliveries it does not accept", async () => {
    const { source, send } = createCuedSource();
    const read = awaitDelivery(
      source,
      request,
      (delivery): delivery is Extract<typeof delivery, { status: "failed" }> =>
        delivery.status === "failed" && delivery.failure.reason === "kept",
    );
    send(buildFailure("skipped"));
    send(buildFailure("kept"));
    await expect(read).resolves.toEqual(buildFailure("kept"));
  });

  it("stops a request still unread when the test ends", () => {
    const { source, stop } = createCuedSource();
    onTestFinished(() => {
      expect(stop).toHaveBeenCalledTimes(1);
    });
    void awaitDelivery(source, request);
    expect(stop).not.toHaveBeenCalled();
  });
});
