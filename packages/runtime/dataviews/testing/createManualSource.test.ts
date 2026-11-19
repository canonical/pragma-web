import { describe, expect, it } from "vitest";
import { DEFAULT_WINDOW, EMPTY_SLICE } from "../src/lib/query/index.js";
import type { SourceRequest } from "../src/lib/source/index.js";
import buildPage from "./buildPage.js";
import createManualSource from "./createManualSource.js";
import { NOTHING_DECLARED } from "./fixtures.js";

const REQUEST: SourceRequest = {
  requestId: "r-1",
  slice: EMPTY_SLICE,
  window: DEFAULT_WINDOW,
  facets: [],
};

describe("createManualSource", () => {
  it("records each execution and counts its releases", () => {
    const manual = createManualSource();
    const delivered: unknown[] = [];
    const release = manual.source.execute(REQUEST, (delivery) => {
      delivered.push(delivery);
    });
    expect(manual.calls).toHaveLength(1);
    expect(manual.readLatest().request).toBe(REQUEST);
    manual.callAt(0).deliver({ status: "succeeded", page: buildPage([]) });
    expect(delivered).toHaveLength(1);
    release();
    release();
    expect(manual.callAt(0).releases).toBe(2);
  });

  it("declares nothing and reads nothing without an answer", () => {
    const { source } = createManualSource();
    expect(source.capabilities).toBe(NOTHING_DECLARED);
    expect(source.readDelivery).toBeUndefined();
    expect(source.listRefusals).toBeUndefined();
    expect(source.runAction).toBeUndefined();
  });

  it("answers at once, and reads within the call, with an answer", () => {
    const page = buildPage([{ id: "a" }]);
    const manual = createManualSource({ answer: () => page });
    const delivered: unknown[] = [];
    manual.source.execute(REQUEST, (delivery) => delivered.push(delivery));
    expect(delivered).toEqual([{ status: "succeeded", page }]);
    expect(manual.source.readDelivery?.(REQUEST)).toEqual({
      status: "succeeded",
      page,
    });
  });

  it("passes the refusal lister and the action runner through", () => {
    const listRefusals = () => [];
    const runAction = async () => [];
    const { source } = createManualSource({ listRefusals, runAction });
    expect(source.listRefusals).toBe(listRefusals);
    expect(source.runAction).toBe(runAction);
  });

  it("fails rather than skipping when no execution is there", () => {
    const manual = createManualSource();
    expect(() => manual.callAt(0)).toThrow("expected an execution at index 0");
    expect(() => manual.readLatest()).toThrow(
      "expected an execution at index -1",
    );
  });
});
