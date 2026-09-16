/**
 * A field named by a dot path was read by splitting the path on every read:
 * once per row per dotted predicate on a filter pass, once per row per
 * dotted term on an ordering, once per row on a facet and once per changed
 * row per observed field on a reconcile — an array allocated per read where
 * the path never changes.
 *
 * The path is split once, where the reader is compiled for the pass.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { declareSort } from "../../../testing/fixtures.js";
import { createSchema } from "../../lib/schema/index.js";
import { executeSlice } from "../../lib/source/index.js";

const schema = createSchema([
  { field: "config.region", kind: "text" },
  { field: "config.cores", kind: "number" },
]);

const rows = Array.from({ length: 200 }, (_, index) => ({
  id: `m-${index}`,
  config: { region: index % 2 === 0 ? "eu" : "us", cores: index },
}));

describe("a filter and an ordering by dotted fields over many rows", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("splits each path a handful of times, not once per row", () => {
    const split = vi.spyOn(String.prototype, "split");
    const result = executeSlice(
      rows,
      {
        filter: [
          { field: "config.region", operator: "contains", operands: ["eu"] },
        ],
        search: null,
        sort: [{ field: "config.cores", direction: "desc" }],
        group: [],
      },
      { schema, sort: declareSort(schema.fieldNames) },
    );
    expect(result).toHaveLength(100);
    const dotted = split.mock.calls.filter(
      (call: readonly unknown[]) => call[0] === ".",
    );
    expect(dotted.length).toBeLessThan(10);
  });
});
