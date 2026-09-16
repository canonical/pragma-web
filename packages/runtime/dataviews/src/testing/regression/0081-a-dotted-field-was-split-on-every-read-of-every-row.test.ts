/**
 * A field named by a dot path was read by splitting the path on every read:
 * once per row per dotted predicate on a filter pass, once per row per
 * dotted term on an ordering, once per row on a facet and once per changed
 * row per observed field on a reconcile — an array allocated per read where
 * the path never changes.
 *
 * Each field's read is compiled once for a pass, not once per row.
 */

import { describe, expect, it, vi } from "vitest";
import { declareSort } from "../../../testing/fixtures.js";
import { createSchema } from "../../lib/schema/index.js";
import { executeSlice } from "../../lib/source/index.js";

const compiled = vi.hoisted(() => ({ fields: [] as string[] }));

vi.mock("../../lib/rows/compileFieldReader.js", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../lib/rows/compileFieldReader.js")
    >();
  return {
    default: (field: string) => {
      compiled.fields.push(field);
      return actual.default(field);
    },
  };
});

const schema = createSchema([
  { field: "config.region", kind: "text" },
  { field: "config.cores", kind: "number" },
]);

const rows = Array.from({ length: 200 }, (_, index) => ({
  id: `m-${index}`,
  config: { region: index % 2 === 0 ? "eu" : "us", cores: index },
}));

describe("a filter and an ordering by dotted fields over many rows", () => {
  it("compiles each field's read once for the pass, not once per row", () => {
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
    expect(compiled.fields.sort()).toEqual(["config.cores", "config.region"]);
  });
});
