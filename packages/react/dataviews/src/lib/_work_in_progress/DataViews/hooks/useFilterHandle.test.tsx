import type { PredicateOperand } from "@canonical/dataviews-core";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createMachineProvider from "../../../../../testing/createMachineProvider.js";
import { findFilterHandle } from "../common/utils/index.js";
import DataViews from "../Provider.js";
import useDataViewsRoot from "./useDataViewsRoot.js";
import useFilterHandle from "./useFilterHandle.js";

/** The hook over the root's handle for one field and operator, counting renders. */
const mountHandle = <TApplied,>(field: string, operator: "gte" | "isAny") => {
  const fixture = createMachineProvider();
  let renders = 0;
  const hook = renderHook(
    () => {
      renders += 1;
      const { filters } = useDataViewsRoot("useFilterHandle test");
      return useFilterHandle(
        findFilterHandle<TApplied>(filters, field, operator),
      );
    },
    {
      wrapper: ({ children }) => (
        <DataViews provider={fixture.provider}>{children}</DataViews>
      ),
    },
  );
  return { ...fixture, hook, readRenders: () => renders };
};

describe("useFilterHandle", () => {
  it("reads the handle's input, applied value and feedback", () => {
    const { hook } = mountHandle<number>("cores", "gte");
    expect(hook.result.current.input).toBe("");
    expect(hook.result.current.applied).toEqual({ kind: "empty" });
    expect(hook.result.current.feedback).toEqual({ status: "none" });
  });

  it("follows an edit routed through the record", () => {
    const { provider, hook } = mountHandle<number>("cores", "gte");
    act(() => {
      hook.result.current.edit("4");
    });
    expect(hook.result.current.input).toBe("4");
    expect(hook.result.current.applied).toEqual({ kind: "value", value: 4 });
    expect(hook.result.current.feedback).toEqual({ status: "applied" });
    expect(provider.state.get().slice.filter).toEqual([
      { field: "cores", operator: "gte", operands: [4] },
    ]);
    act(() => {
      hook.result.current.clear();
    });
    expect(hook.result.current.applied).toEqual({ kind: "empty" });
  });

  it("sets an applied value", () => {
    const { hook } = mountHandle<ReadonlySet<PredicateOperand>>(
      "status",
      "isAny",
    );
    act(() => {
      hook.result.current.set(["failed"]);
    });
    expect(hook.result.current.applied).toEqual({
      kind: "value",
      value: new Set(["failed"]),
    });
  });

  it("holds one result while nothing of its own moves", () => {
    const { hook, readRenders } = mountHandle<number>("cores", "gte");
    const first = hook.result.current;
    const before = readRenders();
    hook.rerender();
    expect(hook.result.current).toBe(first);
    expect(readRenders()).toBe(before + 1);
  });
});
