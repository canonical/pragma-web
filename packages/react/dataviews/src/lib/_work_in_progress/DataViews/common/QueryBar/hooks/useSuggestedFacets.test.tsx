/**
 * The facets values are suggested from, read only while a field's are.
 */
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import buildMachine from "../../../../../../../testing/buildMachine.js";
import buildPage from "../../../../../../../testing/buildPage.js";
import createFacetedManual from "../../../../../../../testing/createFacetedManual.js";
import renderInRoot from "../../../../../../../testing/renderInRoot.js";
import DataViews from "../../../Provider.js";
import useSuggestedFacets from "./useSuggestedFacets.js";

/** A page with a facet over the status. */
const facetedPage = () => ({
  ...buildPage([buildMachine("m1", "alpha")]),
  facets: {
    status: {
      kind: "values" as const,
      values: [
        { value: "running", count: { kind: "exact" as const, value: 1 } },
      ],
    },
  },
});

describe("useSuggestedFacets", () => {
  it("reads none while no field's values are suggested", () => {
    const { hook, source, readRenders } = renderInRoot("QueryBar", (provider) =>
      useSuggestedFacets({ provider, field: null }),
    );
    const renders = readRenders();
    act(() => {
      source.latest().deliver({ status: "succeeded", page: facetedPage() });
    });
    expect(hook.result.current).toEqual({ answered: null, latest: null });
    expect(readRenders()).toBe(renders);
  });

  it("reads the answered and the latest facets while a field's values are", () => {
    const { provider, source } = createFacetedManual();
    const hook = renderHook(
      () =>
        useSuggestedFacets({ provider: provider as never, field: "status" }),
      {
        wrapper: ({ children }: { readonly children: ReactNode }) => (
          <DataViews provider={provider}>{children}</DataViews>
        ),
      },
    );
    act(() => {
      source.latest().deliver({ status: "succeeded", page: facetedPage() });
    });
    const answered = hook.result.current;
    expect(answered.answered).toEqual(facetedPage().facets);
    expect(answered.latest).toBe(answered.answered);
    // While another query is pending, the latest stay and none answer.
    act(() => {
      provider.setSearch("beta");
    });
    expect(hook.result.current.answered).toBeNull();
    expect(hook.result.current.latest).toEqual(facetedPage().facets);
  });
});
