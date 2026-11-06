/**
 * How many predicates the applied query holds on each field it restricts,
 * held at one reference while that reads the same, so a result landing or
 * an edit to a bound that stands re-renders nothing placed by it.
 */
import { readProviderHost } from "@canonical/dataviews-core/bindings";
import { act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import machine from "../../../../../testing/machine.js";
import pageOf from "../../../../../testing/pageOf.js";
import renderInRoot from "../../../../../testing/renderInRoot.js";
import useRestrictedFields from "./useRestrictedFields.js";

/** A root over the machine provider, and a hook reading its restrictions through it. */
const mount = () => {
  const rooted = renderInRoot("Filters", (provider) =>
    useRestrictedFields({ provider }),
  );
  return { ...rooted, host: readProviderHost(rooted.provider) };
};

describe("useRestrictedFields", () => {
  it("counts the predicates the applied query holds on each field", () => {
    const { host, hook } = mount();
    expect(hook.result.current.size).toBe(0);
    act(() => {
      host.setPredicate({ field: "cores", operator: "gte", operands: [4] });
      host.setPredicate({ field: "cores", operator: "lte", operands: [16] });
      host.setPredicate({
        field: "status",
        operator: "isAny",
        operands: ["failed"],
      });
    });
    expect([...hook.result.current]).toEqual([
      ["cores", 2],
      ["status", 1],
    ]);
  });

  it("keeps the tally's reference when a result lands", () => {
    const { host, source, hook, readRenders } = mount();
    act(() => {
      host.setPredicate({ field: "cores", operator: "gte", operands: [4] });
    });
    const tally = hook.result.current;
    const renders = readRenders();
    act(() => {
      source
        .latest()
        .deliver({ status: "succeeded", page: pageOf([machine("m1", "a")]) });
    });
    expect(hook.result.current).toBe(tally);
    expect(readRenders()).toBe(renders);
  });

  it("keeps the reference when a bound is edited without changing the count", () => {
    const { host, hook, readRenders } = mount();
    act(() => {
      host.setPredicate({ field: "cores", operator: "gte", operands: [4] });
    });
    const tally = hook.result.current;
    const renders = readRenders();
    act(() => {
      host.setPredicate({ field: "cores", operator: "gte", operands: [8] });
    });
    expect(hook.result.current).toBe(tally);
    expect(readRenders()).toBe(renders);
  });

  it("returns a new tally when a field gains or loses a predicate", () => {
    const { host, hook } = mount();
    act(() => {
      host.setPredicate({ field: "cores", operator: "gte", operands: [4] });
    });
    const one = hook.result.current;
    act(() => {
      host.setPredicate({ field: "cores", operator: "lte", operands: [16] });
    });
    const two = hook.result.current;
    expect(two).not.toBe(one);
    expect(two.get("cores")).toBe(2);
    act(() => {
      host.removePredicate("cores", "lte");
    });
    expect(hook.result.current).not.toBe(two);
    expect(hook.result.current.get("cores")).toBe(1);
  });
});
