import {
  createEnvironment,
  setPrefetchEnvironment,
} from "@canonical/prism-core";
import { type FetchFunction, Observable } from "relay-runtime";
import { afterEach, describe, expect, it, vi } from "vitest";
import createFetchSpy from "../../testing/createFetchSpy.js";
import { STATIONS_BINDING } from "../../testing/fixtures.js";
import buildEntityIndexVariables from "./buildEntityIndexVariables.js";
import warmEntityIndex from "./warmEntityIndex.js";

afterEach(() => {
  // The prefetch environment is module state shared across this file's tests.
  setPrefetchEnvironment(undefined);
});

describe("warmEntityIndex", () => {
  it("prefetches the index's operation with the builder's variables", () => {
    const fetchFn = createFetchSpy();
    setPrefetchEnvironment(createEnvironment({ fetchFn }));

    void warmEntityIndex(STATIONS_BINDING);

    expect(fetchFn).toHaveBeenCalledTimes(1);
    const [request, variables] = fetchFn.mock.lastCall ?? [];
    expect(request?.name).toBe("EntityIndexQuery");
    expect(variables).toEqual(buildEntityIndexVariables(STATIONS_BINDING));
  });

  it("reads the facet scope, then the index with the address's filters", async () => {
    const fetchFn = vi.fn<FetchFunction>((request) =>
      request.name === "EntityFacetScopeQuery"
        ? Promise.resolve({
            data: {
              ontologies: [
                { prefix: "metro", namespace: "https://metro.example/onto#" },
              ],
              facetedInstances: { facets: [{ field: "servesLine" }] },
            },
          })
        : new Promise(() => {}),
    );
    setPrefetchEnvironment(createEnvironment({ fetchFn }));

    void warmEntityIndex(STATIONS_BINDING, {
      servesLine: "metro:circle-line,none",
      unknown: "x",
      q: "bank",
    });

    await vi.waitFor(() => expect(fetchFn).toHaveBeenCalledTimes(2));
    const [request, variables] = fetchFn.mock.lastCall ?? [];
    expect(request?.name).toBe("EntityIndexQuery");
    expect(variables).toEqual(
      buildEntityIndexVariables(STATIONS_BINDING, [
        {
          field: "servesLine",
          values: ["https://metro.example/onto#circle-line", null],
        },
      ]),
    );
  });

  it("resolves once the scope and the filtered index are in the store", async () => {
    const fetchFn = vi.fn<FetchFunction>(async (request) => ({
      data:
        request.name === "EntityFacetScopeQuery"
          ? {
              ontologies: [],
              facetedInstances: { facets: [{ field: "servesLine" }] },
            }
          : {
              ontologies: [],
              ontologyClass: null,
              facetedInstances: {
                totalCount: 0,
                facets: [],
                edges: [],
                pageInfo: { endCursor: null, hasNextPage: false },
              },
            },
    }));
    setPrefetchEnvironment(createEnvironment({ fetchFn }));

    await expect(
      warmEntityIndex(STATIONS_BINDING, { servesLine: "none" }),
    ).resolves.toBeUndefined();
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it("fetches no index when the facet scope answers nothing", async () => {
    const fetchFn = vi.fn<FetchFunction>(() =>
      Observable.create((sink) => sink.complete()),
    );
    setPrefetchEnvironment(createEnvironment({ fetchFn }));

    await expect(
      warmEntityIndex(STATIONS_BINDING, { servesLine: "none" }),
    ).resolves.toBeUndefined();
    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(fetchFn.mock.lastCall?.[0].name).toBe("EntityFacetScopeQuery");
  });

  it("fetches nothing filtered when no environment is published", async () => {
    await expect(
      warmEntityIndex(STATIONS_BINDING, { servesLine: "none" }),
    ).resolves.toBeUndefined();
  });

  it("fetches nothing when no environment is published", async () => {
    await expect(warmEntityIndex(STATIONS_BINDING)).resolves.toBeUndefined();
  });
});
