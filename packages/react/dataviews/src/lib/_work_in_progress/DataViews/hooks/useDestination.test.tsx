import {
  createMemoryLocation,
  type DataViewsState,
} from "@canonical/dataviews-core";
import { readProviderHost } from "@canonical/dataviews-core/bindings";
import { act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import renderInRoot from "../../../../../testing/renderInRoot.js";
import useDestination from "./useDestination.js";

/** The applied query, from the first page. */
const leadToFirstPage = ({ slice, window }: DataViewsState<object>) => ({
  slice,
  window: { ...window, page: 1, cursor: null },
});

/** The hook over a provider at the given location, counting its renders. */
const mountDestination = (href: string) => {
  const location = createMemoryLocation({ href });
  return {
    location,
    ...renderInRoot(
      "useDestination test",
      (provider) =>
        useDestination({ provider, readDestination: leadToFirstPage }),
      { rows: [], location },
    ),
  };
};

describe("useDestination", () => {
  it("is null without a location", () => {
    const { hook } = renderInRoot(
      "useDestination test",
      (provider) =>
        useDestination({ provider, readDestination: leadToFirstPage }),
      { rows: [] },
    );
    expect(hook.result.current).toBeNull();
  });

  it("spells the destination with the location's other parameters", () => {
    const { hook } = mountDestination("/machines?tab=overview");
    expect(new URLSearchParams(hook.result.current ?? "").get("tab")).toBe(
      "overview",
    );
  });

  it("follows the applied state", () => {
    const { provider, hook } = mountDestination("/machines");
    act(() => {
      readProviderHost(provider).setPredicate({
        field: "status",
        operator: "isAny",
        operands: ["failed"],
      });
    });
    expect(new URLSearchParams(hook.result.current ?? "").get("status")).toBe(
      "failed",
    );
  });

  it("follows the location's other parameters", () => {
    const { location, hook } = mountDestination("/machines?tab=overview");
    act(() => {
      location.write(new URLSearchParams("tab=details"));
    });
    expect(new URLSearchParams(hook.result.current ?? "").get("tab")).toBe(
      "details",
    );
  });

  it("re-renders nothing for a publication that leaves it as it was", () => {
    const { provider, hook, readRenders } = mountDestination("/machines");
    const before = readRenders();
    const spelled = hook.result.current;
    act(() => {
      provider.selection.toggle("m-1");
    });
    expect(hook.result.current).toBe(spelled);
    expect(readRenders()).toBe(before);
  });

  it("stops listening once unmounted", () => {
    const { location, hook } = mountDestination("/machines?tab=overview");
    const spelled = hook.result.current;
    hook.unmount();
    location.write(new URLSearchParams("tab=details"));
    expect(hook.result.current).toBe(spelled);
  });
});
