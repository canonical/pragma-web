/**
 * The live count of the records the applied query matches.
 */

import { buildPage } from "@canonical/dataviews-core/testing";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  buildMachine,
  createFakeChannel,
  createMachineProvider,
} from "../../../../../../../../testing/index.js";
import useAnswerCountStandIn from "./useAnswerCountStandIn.js";

/** The hook over an observed provider. */
const mount = () => {
  const fixture = createMachineProvider();
  const stop = fixture.provider.observe();
  const hook = renderHook(() =>
    useAnswerCountStandIn(fixture.provider as never),
  );
  return { ...fixture, hook, stop };
};

describe("useAnswerCountStandIn", () => {
  it("reads unknown until a result answers the applied query", () => {
    const { hook, source } = mount();
    expect(hook.result.current).toEqual({ kind: "unknown" });
    act(() => {
      source.readLatest().deliver({
        status: "succeeded",
        page: buildPage([
          buildMachine("m1", "alpha"),
          buildMachine("m2", "beta"),
        ]),
      });
    });
    expect(hook.result.current).toEqual({ kind: "exact", value: 2 });
  });

  it("reads unknown again while the next request is pending", () => {
    const { hook, source, provider } = mount();
    act(() => {
      source.readLatest().deliver({
        status: "succeeded",
        page: buildPage([buildMachine("m1", "alpha")]),
      });
    });
    act(() => {
      provider.setSearch("beta");
    });
    expect(hook.result.current).toEqual({ kind: "unknown" });
  });

  it("keeps how exactly the source counted", () => {
    const { hook, source } = mount();
    act(() => {
      source.readLatest().deliver({
        status: "succeeded",
        page: {
          ...buildPage([]),
          counts: {
            pageable: { kind: "at-least", value: 1000 },
            matched: { kind: "at-least", value: 1000 },
          },
        },
      });
    });
    expect(hook.result.current).toEqual({ kind: "at-least", value: 1000 });
  });

  it("holds one count while results count the same", () => {
    const { hook, source } = mount();
    act(() => {
      source.readLatest().deliver({
        status: "succeeded",
        page: buildPage([buildMachine("m1", "alpha")]),
      });
    });
    const counted = hook.result.current;
    act(() => {
      source.readLatest().deliver({
        status: "succeeded",
        page: buildPage([buildMachine("m2", "beta")]),
      });
    });
    expect(hook.result.current).toBe(counted);
  });

  it("reads unknown where the result failed, or a ready one counts nothing", () => {
    const { hook, source } = mount();
    act(() => {
      source.readLatest().deliver({
        status: "failed",
        failure: { reason: "offline", cause: null, transient: true },
      });
    });
    expect(hook.result.current).toEqual({ kind: "unknown" });
    const { provider } = createMachineProvider();
    const settled = provider.state.get();
    const state = createFakeChannel({
      ...settled,
      pendingRequestId: null,
      resultMatchesQuery: true,
      result: { ...settled.result, status: "ready", counts: null },
    });
    const uncounted = renderHook(() =>
      useAnswerCountStandIn({ state } as never),
    );
    expect(uncounted.result.current).toEqual({ kind: "unknown" });
  });

  it("tells counts of one kind apart by their value", () => {
    const { hook, source } = mount();
    act(() => {
      source.readLatest().deliver({
        status: "succeeded",
        page: buildPage([buildMachine("m1", "alpha")]),
      });
    });
    act(() => {
      source.readLatest().deliver({
        status: "succeeded",
        page: buildPage([
          buildMachine("m1", "alpha"),
          buildMachine("m2", "beta"),
        ]),
      });
    });
    expect(hook.result.current).toEqual({ kind: "exact", value: 2 });
  });
});
