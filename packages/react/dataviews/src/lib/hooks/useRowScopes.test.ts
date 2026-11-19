import { readProviderHost } from "@canonical/dataviews-core/bindings";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import buildMachine from "../../../testing/buildMachine.js";
import createMachineProvider from "../../../testing/createMachineProvider.js";
import deliverRows from "../../../testing/deliverRows.js";
import useRowScopes from "./useRowScopes.js";

const FIELDS = ["name"] as const;

describe("useRowScopes", () => {
  it("observes the rows delivered after it mounts", () => {
    const { provider } = createMachineProvider();
    const { result } = renderHook(() => useRowScopes(provider, FIELDS));
    expect(result.current.ids.get()).toEqual([]);
    const host = readProviderHost(provider);
    act(() => {
      host.complete(
        host.refresh(),
        deliverRows([buildMachine("m-1", "alpha")]),
      );
    });
    expect(result.current.ids.get()).toEqual(["m-1"]);
    const { name } = result.current.readRow("m-1").fields;
    expect(name?.get()).toBe("alpha");
  });

  it("keeps one registry for one field list, and mints another for a new one", () => {
    const { provider } = createMachineProvider();
    const { result, rerender } = renderHook(
      ({ fields }) => useRowScopes(provider, fields),
      { initialProps: { fields: FIELDS as readonly string[] } },
    );
    const first = result.current;
    rerender({ fields: FIELDS });
    expect(result.current).toBe(first);
    rerender({ fields: ["name", "status"] });
    expect(result.current).not.toBe(first);
  });

  it("stops observing once unmounted", () => {
    const { provider } = createMachineProvider();
    const { result, unmount } = renderHook(() =>
      useRowScopes(provider, FIELDS),
    );
    const scopes = result.current;
    unmount();
    const host = readProviderHost(provider);
    host.complete(host.refresh(), deliverRows([buildMachine("m-1", "alpha")]));
    expect(scopes.ids.get()).toEqual([]);
  });
});
