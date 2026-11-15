/**
 * The operators the applied query holds on each field, held at one
 * reference while that reads the same.
 */
import { readProviderHost } from "@canonical/dataviews-core/bindings";
import { act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import renderInRoot from "../../../../../testing/renderInRoot.js";
import useStandingOperators from "./useStandingOperators.js";

/** A root over the machine provider, and the hook reading through it. */
const mount = () => {
  const rooted = renderInRoot("Filters", (provider) =>
    useStandingOperators({ provider }),
  );
  return { ...rooted, host: readProviderHost(rooted.provider) };
};

describe("useStandingOperators", () => {
  it("reads each field's operators once, in the query's order", () => {
    const { host, hook } = mount();
    expect(hook.result.current.size).toBe(0);
    act(() => {
      host.setPredicate({ field: "cores", operator: "lte", operands: [16] });
      host.setPredicate({ field: "cores", operator: "gte", operands: [4] });
      host.editPredicates(
        [],
        [{ field: "cores", operator: "gte", operands: [8] }],
      );
    });
    expect([...hook.result.current]).toEqual([["cores", ["lte", "gte"]]]);
  });

  it("keeps the reading's reference while an operand moves", () => {
    const { host, hook, readRenders } = mount();
    act(() => {
      host.setPredicate({ field: "cores", operator: "gte", operands: [4] });
    });
    const reading = hook.result.current;
    const renders = readRenders();
    act(() => {
      host.setPredicate({ field: "cores", operator: "gte", operands: [8] });
    });
    expect(hook.result.current).toBe(reading);
    expect(readRenders()).toBe(renders);
  });

  it("reads anew when a field gains an operator or another field one", () => {
    const { host, hook } = mount();
    act(() => {
      host.setPredicate({ field: "cores", operator: "gte", operands: [4] });
    });
    const reading = hook.result.current;
    act(() => {
      host.setPredicate({ field: "cores", operator: "lte", operands: [8] });
    });
    expect(hook.result.current).not.toBe(reading);
    const second = hook.result.current;
    act(() => {
      host.setPredicate({
        field: "status",
        operator: "isAny",
        operands: ["failed"],
      });
    });
    expect([...hook.result.current.keys()]).toEqual(["cores", "status"]);
    expect(second.get("cores")).toEqual(["gte", "lte"]);
  });

  it("reads anew when one field's restriction moves to another", () => {
    const { host, hook } = mount();
    act(() => {
      host.setPredicate({ field: "cores", operator: "gte", operands: [4] });
    });
    act(() => {
      host.editPredicates(
        [{ field: "cores", operator: "gte", nth: 0 }],
        [{ field: "status", operator: "isAny", operands: ["failed"] }],
      );
    });
    expect([...hook.result.current]).toEqual([["status", ["isAny"]]]);
  });
});
