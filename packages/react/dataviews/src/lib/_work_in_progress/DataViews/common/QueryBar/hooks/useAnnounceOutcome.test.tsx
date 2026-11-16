/**
 * An outcome said once its result lands, with the count the result has.
 */
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import buildMachine from "../../../../../../../testing/buildMachine.js";
import buildPage from "../../../../../../../testing/buildPage.js";
import createFakeChannel from "../../../../../../../testing/createFakeChannel.js";
import createMachineProvider from "../../../../../../../testing/createMachineProvider.js";
import useAnnounceOutcome from "./useAnnounceOutcome.js";

/** The hook over an observed provider, with its announcer spied on. */
const mount = () => {
  const fixture = createMachineProvider();
  const stop = fixture.provider.observe();
  const announce = vi.fn();
  const hook = renderHook(() =>
    useAnnounceOutcome({ provider: fixture.provider as never, announce }),
  );
  return { ...fixture, announce, say: hook.result.current, stop };
};

describe("useAnnounceOutcome", () => {
  it("waits for the result, then words the outcome with its count", () => {
    const { say, announce, source } = mount();
    act(() => {
      say((count) => `count ${JSON.stringify(count)}`);
    });
    expect(announce).not.toHaveBeenCalled();
    act(() => {
      source.latest().deliver({
        status: "succeeded",
        page: buildPage([buildMachine("m1", "alpha")]),
      });
    });
    expect(announce).toHaveBeenCalledOnce();
    expect(announce).toHaveBeenCalledWith('count {"kind":"exact","value":1}');
    // Said once: a later publication says nothing more.
    act(() => {
      source.latest().deliver({
        status: "succeeded",
        page: buildPage([buildMachine("m2", "beta")]),
      });
    });
    expect(announce).toHaveBeenCalledOnce();
  });

  it("says at once when nothing is pending, with the count it has", () => {
    const { say, announce, source } = mount();
    act(() => {
      source.latest().deliver({
        status: "succeeded",
        page: {
          ...buildPage([]),
          counts: {
            pageable: { kind: "unknown" },
            matched: { kind: "unknown" },
          },
        },
      });
    });
    act(() => {
      say((count) => count.kind);
    });
    expect(announce).toHaveBeenCalledWith("unknown");
  });

  it("says only the last of the outcomes waiting", () => {
    const { say, announce, source } = mount();
    act(() => {
      say(() => "first");
      say(() => "second");
    });
    act(() => {
      source.latest().deliver({ status: "succeeded", page: buildPage([]) });
    });
    expect(announce.mock.calls).toEqual([["second"]]);
  });

  it("words an outcome with no count where the result failed", () => {
    const { say, announce, source } = mount();
    act(() => {
      say((count) => count.kind);
    });
    act(() => {
      source.latest().deliver({
        status: "failed",
        failure: { reason: "offline", cause: null, transient: true },
      });
    });
    expect(announce).toHaveBeenCalledWith("unknown");
  });

  it("words an outcome with no count where a ready result carries none", () => {
    const { provider } = createMachineProvider();
    const settled = provider.state.get();
    const state = createFakeChannel({
      ...settled,
      pendingRequestId: null,
      resultMatchesQuery: true,
      result: { ...settled.result, status: "ready", counts: null },
    });
    const announce = vi.fn();
    const hook = renderHook(() =>
      useAnnounceOutcome({ provider: { state } as never, announce }),
    );
    act(() => {
      hook.result.current((count) => count.kind);
    });
    expect(announce).toHaveBeenCalledWith("unknown");
  });
});
