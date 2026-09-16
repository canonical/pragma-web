/**
 * A field named by a dot path was read by splitting the path on every read:
 * once per row per dotted predicate on a filter pass, once per row per
 * dotted term on an ordering, once per row on a facet and once per changed
 * row per observed field on a reconcile — an array allocated per read where
 * the path never changes.
 *
 * Each field's read is compiled once for a pass, not once per row.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import buildRowModel from "../../../testing/buildRowModel.js";
import { declareSort } from "../../../testing/fixtures.js";
import { createChannel } from "../../lib/observable/index.js";
import { createRowScopes, type RowModel } from "../../lib/rows/index.js";
import { createSchema } from "../../lib/schema/index.js";
import { createSelection } from "../../lib/selection/index.js";
import { executeSlice, readFacets } from "../../lib/source/index.js";

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

type Row = (typeof rows)[number];

describe("a filter and an ordering by dotted fields over many rows", () => {
  beforeEach(() => {
    compiled.fields.length = 0;
  });

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

  it("compiles a facet's read once for the pass", () => {
    const slice = { filter: [], search: null, sort: [], group: [] };
    const config = { schema, searchFields: [] };
    // A number field faceted over every row: a text field takes no facet.
    readFacets(
      rows,
      slice,
      schema.fields.filter((definition) => definition.kind === "number"),
      config,
      rows,
    );
    expect(compiled.fields).toEqual(["config.cores"]);
  });

  it("compiles each observed field's read once for the row scopes, not per row reconciled", () => {
    const byId = (row: Row): string => row.id;
    const channel = createChannel<RowModel<Row>>(
      buildRowModel({ identify: byId, rows }),
    );
    const scopes = createRowScopes({
      rows: channel,
      selection: createSelection(),
      fields: ["config.region", "config.cores"],
    });
    const release = scopes.observe();
    channel.set(
      buildRowModel({
        identify: byId,
        rows: rows.map((row) => ({
          ...row,
          config: { ...row.config, cores: row.config.cores + 1 },
        })),
        previous: channel.get(),
      }),
    );
    release();
    expect(compiled.fields.sort()).toEqual(["config.cores", "config.region"]);
  });
});
