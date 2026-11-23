import { readProviderHost } from "@canonical/dataviews-core/bindings";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createFacetedManual, deliverFacets } from "../../../testing/index.js";
import DataViews from "../_work_in_progress/DataViews/Provider.js";
import useFacets from "./useFacets.js";

const STATUS = {
  kind: "values",
  values: [{ value: "failed", count: { kind: "exact", value: 4 } }],
} as const;

/** The hook mounted in a root that observes a faceted manual provider. */
const mountFacets = () => {
  const fixture = createFacetedManual();
  const hook = renderHook(() => useFacets({ provider: fixture.provider }), {
    wrapper: ({ children }) => (
      <DataViews provider={fixture.provider}>{children}</DataViews>
    ),
  });
  return { ...fixture, hook };
};

describe("useFacets", () => {
  it("reads neither before the first page", () => {
    const { hook } = mountFacets();
    expect(hook.result.current).toEqual({ answered: null, latest: null });
  });

  it("reads both once a result answers the applied query", () => {
    const { source, hook } = mountFacets();
    deliverFacets(source, { status: STATUS });
    expect(hook.result.current).toEqual({
      answered: { status: STATUS },
      latest: { status: STATUS },
    });
  });

  it("keeps the latest while another query is pending", () => {
    const { provider, source, hook } = mountFacets();
    deliverFacets(source, { status: STATUS });
    act(() => {
      readProviderHost(provider).setPredicate({
        field: "status",
        operator: "isAny",
        operands: ["failed"],
      });
    });
    expect(hook.result.current).toEqual({
      answered: null,
      latest: { status: STATUS },
    });
  });

  it("holds one result while neither moves", () => {
    const { hook } = mountFacets();
    const first = hook.result.current;
    hook.rerender();
    expect(hook.result.current).toBe(first);
  });
});
