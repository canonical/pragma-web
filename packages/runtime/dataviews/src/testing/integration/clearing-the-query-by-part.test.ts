/**
 * A clear empties whole parts of the query, here through the one real router
 * adapter there is: the filter, every conjunct and every refused filter
 * clause the link carried with it, in one entry Back undoes; the search in
 * an entry that replaces; and nothing at all, no entry included, when the
 * parts are already empty. The ordering, the page size and the host's own
 * parameters stay, and the window returns to its first page.
 */

import { createMemoryAdapter } from "@canonical/router-core";
import { describe, expect, it } from "vitest";
import createManualSource from "../../../testing/createManualSource.js";
import declare from "../../../testing/declare.js";
import declareSort from "../../../testing/declareSort.js";
import readId from "../../../testing/readId.js";
import { createCollection } from "../../lib/collection/index.js";
import { createPlatformLocation } from "../../lib/location/index.js";
import { createDataViewsProvider } from "../../lib/provider/index.js";

const machines = createCollection({
  identify: readId,
  fields: [
    { field: "tags", kind: "choices", options: ["ex-gpu", "ex-nvme"] },
    { field: "cpu", kind: "number" },
    { field: "name", kind: "text" },
  ],
});

/** Two conjuncts on tags, a refused bound on cpu, a search and a sort. */
const LINK =
  "/machines?tab=overview&tags=ex-gpu&tags__isAny__1=ex-nvme&cpu__lte=4&q=alder&sort=cpu__asc&page=3&size=25";

const harness = () => {
  const adapter = createMemoryAdapter();
  adapter.navigate(LINK);
  /** Every navigation the adapter was asked for, with whether it replaced. */
  const navigations: (readonly [string, boolean])[] = [];
  const recorded: typeof adapter = {
    ...adapter,
    navigate(url, options) {
      navigations.push([String(url), options?.replace === true]);
      adapter.navigate(url, options);
    },
  };
  const provider = createDataViewsProvider({
    collection: machines,
    source: createManualSource({
      capabilities: declare({
        filter: { tags: ["isAny"], cpu: ["gte"] },
        search: { fields: ["name"] },
        sort: declareSort(["cpu"]),
      }),
    }).source,
    location: createPlatformLocation(recorded),
  });
  const release = provider.observe();
  navigations.length = 0;
  return { adapter, navigations, provider, release };
};

describe("clearing the query by part", () => {
  it("empties the filter and its refused clauses in one entry Back undoes", () => {
    const { adapter, navigations, provider, release } = harness();
    expect(provider.issues.get()).toEqual([
      expect.objectContaining({ parameter: "cpu__lte" }),
    ]);
    expect(provider.clear(["filter"])).toEqual([]);
    expect(navigations).toEqual([
      ["/machines?tab=overview&q=alder&sort=cpu__asc&page=1&size=25", false],
    ]);
    expect(provider.issues.get()).toEqual([]);
    expect(provider.state.get().result.status).toBe("pending");
    adapter.back();
    expect(provider.state.get().slice.filter).toEqual([
      { field: "tags", operator: "isAny", operands: ["ex-gpu"] },
      { field: "tags", operator: "isAny", operands: ["ex-nvme"] },
    ]);
    // The refused clause came back with the link, and is refused again.
    expect(provider.issues.get()).toEqual([
      expect.objectContaining({ parameter: "cpu__lte" }),
    ]);
    release();
  });

  it("empties the search in an entry that replaces", () => {
    const { navigations, provider, release } = harness();
    expect(provider.clear(["search"])).toEqual([]);
    // The refused filter clause stays, carried as it was spelled.
    expect(navigations).toEqual([
      [
        "/machines?tab=overview&cpu__lte=4&tags=ex-gpu&tags__isAny__1=ex-nvme&sort=cpu__asc&page=1&size=25",
        true,
      ],
    ]);
    expect(provider.issues.get()).toEqual([
      expect.objectContaining({ parameter: "cpu__lte" }),
    ]);
    release();
  });

  it("empties both at once as one filter entry, whatever order they are named in", () => {
    const { navigations, provider, release } = harness();
    expect(provider.clear(["search", "filter", "search"])).toEqual([]);
    expect(navigations).toEqual([
      ["/machines?tab=overview&sort=cpu__asc&page=1&size=25", false],
    ]);
    release();
  });

  it("commits nothing and enters no history when the parts are empty", () => {
    const { navigations, provider, release } = harness();
    provider.clear(["filter", "search"]);
    navigations.length = 0;
    const before = provider.state.get();
    expect(provider.clear(["filter"])).toEqual([]);
    expect(provider.clear(["search", "filter"])).toEqual([]);
    expect(provider.state.get()).toBe(before);
    expect(navigations).toEqual([]);
    release();
  });

  it("throws on a clear naming no part of the query", () => {
    const { provider, release } = harness();
    expect(() => provider.clear([] as unknown as ["filter"])).toThrow(
      "a clear must name at least one part of the query",
    );
    release();
  });
});
