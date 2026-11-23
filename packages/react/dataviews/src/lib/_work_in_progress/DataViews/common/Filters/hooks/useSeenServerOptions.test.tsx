import type { Facet } from "@canonical/dataviews-core";
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import useSeenServerOptions from "./useSeenServerOptions.js";

/** A values facet listing each option once. */
const buildFacet = (...options: readonly string[]): Facet => ({
  kind: "values",
  values: options.map((value) => ({
    value,
    count: { kind: "exact", value: 1 },
  })),
});

/** The hook mounted over the latest facets a render hands it. */
const mountSeen = (latest: Readonly<Record<string, Facet>> | null) =>
  renderHook(
    ({ given }: { readonly given: Readonly<Record<string, Facet>> | null }) =>
      useSeenServerOptions({ latest: given }),
    { initialProps: { given: latest } },
  );

describe("useSeenServerOptions", () => {
  it("lists nothing for a field no facet has listed", () => {
    const { result } = mountSeen(null);
    expect(result.current("region")).toEqual([]);
  });

  it("keeps every option seen while mounted, in first-seen order", () => {
    const { result, rerender } = mountSeen({ region: buildFacet("eu", "us") });
    expect(result.current("region")).toEqual(["eu", "us"]);
    rerender({ given: { region: buildFacet("ap", "eu") } });
    expect(result.current("region")).toEqual(["eu", "us", "ap"]);
    rerender({ given: null });
    expect(result.current("region")).toEqual(["eu", "us", "ap"]);
  });

  it("keeps a field's list at one identity while nothing new is listed", () => {
    const { result, rerender } = mountSeen({ region: buildFacet("eu") });
    const first = result.current("region");
    rerender({ given: { region: buildFacet("eu"), zone: buildFacet("a") } });
    expect(result.current("region")).toBe(first);
    expect(result.current("zone")).toEqual(["a"]);
  });

  it("keeps the reader at one identity while nothing new is listed", () => {
    const { result, rerender } = mountSeen({ region: buildFacet("eu") });
    const first = result.current;
    rerender({ given: { region: buildFacet("eu") } });
    expect(result.current).toBe(first);
    rerender({ given: null });
    expect(result.current).toBe(first);
  });
});
