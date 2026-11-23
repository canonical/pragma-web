import { readProviderHost } from "@canonical/dataviews-core/bindings";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createFacetedManual from "../../../testing/createFacetedManual.js";
import deliverFacets from "../../../testing/deliverFacets.js";
import DataViews from "../_work_in_progress/DataViews/Provider.js";
import useAnsweredFacets from "./useAnsweredFacets.js";

const STATUS = {
  kind: "values",
  values: [{ value: "failed", count: { kind: "exact", value: 4 } }],
} as const;

/** The hook mounted in a root that observes a faceted manual provider. */
const mountAnswered = () => {
  const fixture = createFacetedManual();
  const hook = renderHook(
    () => useAnsweredFacets({ provider: fixture.provider }),
    {
      wrapper: ({ children }) => (
        <DataViews provider={fixture.provider}>{children}</DataViews>
      ),
    },
  );
  return { ...fixture, hook };
};

describe("useAnsweredFacets", () => {
  it("is null before the first page", () => {
    const { hook } = mountAnswered();
    expect(hook.result.current).toBeNull();
  });

  it("reads the facets answering the applied query", () => {
    const { source, hook } = mountAnswered();
    deliverFacets(source, { status: STATUS });
    expect(hook.result.current).toEqual({ status: STATUS });
  });

  it("is null while another query is pending", () => {
    const { provider, source, hook } = mountAnswered();
    deliverFacets(source, { status: STATUS });
    act(() => {
      readProviderHost(provider).setPredicate({
        field: "status",
        operator: "isAny",
        operands: ["failed"],
      });
    });
    expect(hook.result.current).toBeNull();
  });
});
