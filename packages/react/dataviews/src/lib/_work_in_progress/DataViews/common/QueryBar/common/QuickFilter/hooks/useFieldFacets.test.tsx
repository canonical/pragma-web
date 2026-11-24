import {
  createDataViewsProvider,
  declareCapabilities,
} from "@canonical/dataviews-core";
import { readProviderHost } from "@canonical/dataviews-core/bindings";
import {
  buildPage,
  createManualSource,
} from "@canonical/dataviews-core/testing";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, onTestFinished } from "vitest";
import type { QuickHost } from "../../../../../../../../../testing/index.js";
import {
  createQuickFilterProvider,
  quickHostCollection,
  quickHosts,
} from "../../../../../../../../../testing/index.js";
import useFieldFacets from "./useFieldFacets.js";

describe("useFieldFacets", () => {
  it("reads the field's facet answering the applied query, and the latest", () => {
    const provider = createQuickFilterProvider({ facets: ["status"] });
    onTestFinished(provider.observe());
    const { result } = renderHook(() =>
      useFieldFacets({ provider: provider as never, field: "status" }),
    );
    expect(result.current.answered?.kind).toBe("values");
    expect(result.current.latest).toBe(result.current.answered);
  });

  it("keeps its reading while a result leaves the field's facet as it was", () => {
    const provider = createQuickFilterProvider({ facets: ["status"] });
    onTestFinished(provider.observe());
    const { result } = renderHook(() =>
      useFieldFacets({ provider: provider as never, field: "status" }),
    );
    const before = result.current;
    // Searching every host answers the same counts.
    act(() => {
      provider.setSearch("ex-host");
    });
    expect(result.current).toBe(before);
  });

  it("reads no answer while the applied query waits, and the latest still", () => {
    const capabilities = declareCapabilities(quickHostCollection, {
      filter: { status: ["isAny"], zone: ["isAny"] },
      facets: ["status", "zone"],
    });
    const source = createManualSource<QuickHost>({ capabilities });
    const provider = createDataViewsProvider({
      collection: quickHostCollection,
      source: source.source,
      facets: ["status", "zone"],
    });
    onTestFinished(provider.observe());
    const { result } = renderHook(() =>
      useFieldFacets({ provider: provider as never, field: "status" }),
    );
    expect(result.current).toEqual({
      answered: null,
      latest: null,
      pending: true,
    });
    act(() => {
      source.readLatest().deliver({
        status: "succeeded",
        page: {
          ...buildPage(quickHosts),
          facets: {
            status: { kind: "values", values: [] },
            zone: { kind: "values", values: [] },
          },
        },
      });
    });
    expect(result.current.answered).toEqual({ kind: "values", values: [] });
    expect(result.current.pending).toBe(false);
    act(() => {
      readProviderHost(provider).setPredicate({
        field: "status",
        operator: "isAny",
        operands: ["ready"],
      });
    });
    expect(result.current.answered).toBeNull();
    expect(result.current.latest).toEqual({ kind: "values", values: [] });
    expect(result.current.pending).toBe(false);
  });

  it("is not pending once a failure answers before any facet", () => {
    const capabilities = declareCapabilities(quickHostCollection, {
      filter: { zone: ["isAny"] },
      facets: ["zone"],
    });
    const source = createManualSource<QuickHost>({ capabilities });
    const provider = createDataViewsProvider({
      collection: quickHostCollection,
      source: source.source,
      facets: ["zone"],
    });
    onTestFinished(provider.observe());
    const { result } = renderHook(() =>
      useFieldFacets({ provider: provider as never, field: "zone" }),
    );
    act(() => {
      source.readLatest().deliver({
        status: "failed",
        failure: { reason: "down", cause: null, transient: false },
      });
    });
    expect(result.current).toEqual({
      answered: null,
      latest: null,
      pending: false,
    });
  });
});
