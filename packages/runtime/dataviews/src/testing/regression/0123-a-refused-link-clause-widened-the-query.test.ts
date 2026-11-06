/**
 * Regression: a followed link's refused filter withholds the query rather
 * than run a wider one.
 *
 * Before the fix, the decoder left a refused clause out of the slice and the
 * provider adopted what remained, so `?status=melted` asked the source for
 * every record, unfiltered. The refusal reached only `issues`, and the table
 * drew the wider rows as if they answered the link. Now a refused filter or
 * search withholds the whole query: no request is sent while it stands, and
 * the status says the link could not be followed.
 */

import { describe, expect, it } from "vitest";
import byId from "../../../testing/byId.js";
import createManualSource from "../../../testing/createManualSource.js";
import declare from "../../../testing/declare.js";
import declareSort from "../../../testing/declareSort.js";
import { createCollection } from "../../lib/collection/index.js";
import { resolveDisplayStatus } from "../../lib/display/index.js";
import { createMemoryLocation } from "../../lib/location/index.js";
import { createDataViewsProvider } from "../../lib/provider/index.js";

const machines = createCollection({
  identify: byId,
  fields: [
    { field: "status", kind: "choices", options: ["failed", "running"] },
    { field: "cpu", kind: "number" },
  ],
});

/** A provider over a link, with the calls its source receives. */
const follow = (href: string) => {
  const { source, calls } = createManualSource({
    capabilities: declare({
      filter: { status: ["isAny"], cpu: ["gte"] },
      sort: declareSort(["cpu"]),
    }),
  });
  const location = createMemoryLocation({ href });
  const provider = createDataViewsProvider({
    collection: machines,
    source,
    location,
  });
  return { provider, location, calls };
};

describe("regression 0123 — a refused link clause widened the query", () => {
  it("asks the source for nothing, and says why", () => {
    const { provider, calls } = follow("/machines?status=melted");
    const release = provider.observe();
    expect(calls).toHaveLength(0);
    expect(resolveDisplayStatus(provider.state.get())).toEqual({
      status: "refused",
      reason: '"melted" is not an option of "status"',
    });
    release();
  });

  it("withholds a filter on a field the collection no longer declares", () => {
    const { provider, calls } = follow("/machines?memory__gte=4");
    const release = provider.observe();
    expect(calls).toHaveLength(0);
    expect(provider.issues.get()).toEqual([
      {
        parameter: "memory__gte",
        field: "memory",
        code: "undeclared-field",
        reason: '"memory" is not a field of this collection',
      },
    ]);
    release();
  });

  it("carries the refused clause through a sort, and runs once it is cleared", () => {
    const { provider, location, calls } = follow("/machines?status=melted");
    const release = provider.observe();
    provider.setSort([{ field: "cpu", direction: "desc" }]);
    // Changing the sort does not quietly drop what was refused.
    expect(location.read().get("status")).toBe("melted");
    expect(calls).toHaveLength(0);
    provider.reset();
    expect(location.read().has("status")).toBe(false);
    expect(calls).toHaveLength(1);
    expect(calls.at(0)?.request.slice.filter).toEqual([]);
    release();
  });
});
