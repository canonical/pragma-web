import {
  DEFAULT_WINDOW,
  EMPTY_SLICE,
  type SourceDelivery,
  type SourceRequest,
} from "@canonical/dataviews-core";
import { describe, expect, it, vi } from "vitest";
import createCuedSource from "./createCuedSource.js";
import type { Machine } from "./types.js";

const request: SourceRequest = {
  requestId: "cued",
  slice: EMPTY_SLICE,
  window: DEFAULT_WINDOW,
  facets: [],
};

const failed: SourceDelivery<Machine> = {
  status: "failed",
  failure: { reason: "cued", cause: null, transient: true },
};

describe("createCuedSource", () => {
  it("delivers nothing until sent, then to every request", () => {
    const { source, send } = createCuedSource();
    const first = vi.fn();
    const second = vi.fn();
    source.execute(request, first);
    source.execute(request, second);
    expect(first).not.toHaveBeenCalled();
    send(failed);
    expect(first).toHaveBeenCalledWith(failed);
    expect(second).toHaveBeenCalledWith(failed);
  });

  it("counts the stops of its requests", () => {
    const { source, stop } = createCuedSource();
    source.execute(request, vi.fn())();
    expect(stop).toHaveBeenCalledTimes(1);
  });
});
