import { buildPage } from "@canonical/dataviews-core/testing";
import { describe, expect, it } from "vitest";
import {
  buildMachine,
  createMachineProvider,
} from "../../../../../../../../testing/index.js";
import readAnswerCount from "./readAnswerCount.js";

/** A provider's state, settled on a page of two machines. */
const settle = () => {
  const { provider, source } = createMachineProvider();
  const stop = provider.observe();
  source.readLatest().deliver({
    status: "succeeded",
    page: buildPage([buildMachine("m1", "alpha"), buildMachine("m2", "beta")]),
  });
  return { provider, stop };
};

describe("readAnswerCount", () => {
  it("reads null while a request is pending", () => {
    const { provider } = createMachineProvider();
    provider.observe();
    expect(readAnswerCount(provider.state.get())).toBeNull();
  });

  it("reads the matched count once the result answers the query", () => {
    const { provider } = settle();
    expect(readAnswerCount(provider.state.get())).toEqual({
      kind: "exact",
      value: 2,
    });
  });

  it("reads unknown where the result answers another query, failed or counts nothing", () => {
    const { provider } = settle();
    const settled = provider.state.get();
    expect(readAnswerCount({ ...settled, resultMatchesQuery: false })).toEqual({
      kind: "unknown",
    });
    expect(
      readAnswerCount({
        ...settled,
        result: { ...settled.result, status: "failed" } as never,
      }),
    ).toEqual({ kind: "unknown" });
    expect(
      readAnswerCount({
        ...settled,
        result: { ...settled.result, counts: null },
      }),
    ).toEqual({ kind: "unknown" });
  });
});
